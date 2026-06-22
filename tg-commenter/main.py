"""
tg-commenter — помощник для комментирования постов в Telegram-каналах.

Один твой аккаунт. Программа следит за выбранными каналами; при новом посте
GPT предлагает доброжелательный комментарий, ты подтверждаешь / правишь /
пропускаешь, и он публикуется с твоего аккаунта (в обсуждениях канала).

Поддерживает подключение через прокси (SOCKS5/4, HTTP, MTProto).

Запуск:
    python main.py
"""

import asyncio
import json
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI
from telethon import TelegramClient, events
from telethon.errors import (
    ChatWriteForbiddenError,
    FloodWaitError,
    MsgIdInvalidError,
)

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


# ─────────────────────────── Конфиг ────────────────────────────
def load_config() -> dict:
    cfg_path = BASE_DIR / "config.json"
    if not cfg_path.exists():
        sys.exit(
            "Нет config.json. Скопируй config.example.json в config.json "
            "и впиши свои каналы и промпт."
        )
    with open(cfg_path, "r", encoding="utf-8") as f:
        cfg = json.load(f)
    if not cfg.get("channels"):
        sys.exit("В config.json пустой список channels.")
    return cfg


def env(name: str, default: str = "") -> str:
    return (os.getenv(name) or default).strip()


def build_proxy():
    """Возвращает параметры прокси для Telethon или None."""
    ptype = env("PROXY_TYPE", "none").lower()
    if ptype in ("", "none"):
        return None, None

    host = env("PROXY_HOST")
    port = int(env("PROXY_PORT") or 0)
    if not host or not port:
        sys.exit("PROXY_TYPE задан, но PROXY_HOST/PROXY_PORT пустые.")

    if ptype == "mtproto":
        # MTProto-прокси: (host, port, secret_hex)
        secret = env("PROXY_SECRET")
        if not secret:
            sys.exit("Для mtproto-прокси нужен PROXY_SECRET.")
        from telethon import connection

        conn = connection.ConnectionTcpMTProxyRandomizedIntermediate
        return (host, port, secret), conn

    # SOCKS/HTTP через PySocks
    import socks

    socks_types = {
        "socks5": socks.SOCKS5,
        "socks4": socks.SOCKS4,
        "http": socks.HTTP,
    }
    if ptype not in socks_types:
        sys.exit(f"Неизвестный PROXY_TYPE: {ptype}")

    user = env("PROXY_USER") or None
    pwd = env("PROXY_PASS") or None
    proxy = (socks_types[ptype], host, port, True, user, pwd)
    return proxy, None


# ───────────────────────── Генерация текста ─────────────────────
class Commenter:
    def __init__(self, cfg: dict):
        self.cfg = cfg
        self.client = OpenAI(api_key=env("OPENAI_API_KEY"))
        self.model = env("OPENAI_MODEL", "gpt-4o-mini")

    def suggest(self, post_text: str, channel_title: str) -> str:
        lang = self.cfg.get("comment_language", "ru")
        system = (
            f"{self.cfg['persona_prompt']}\n\n"
            f"Язык комментария: {lang}. "
            "Верни ТОЛЬКО текст комментария, без кавычек и пояснений."
        )
        user = (
            f"Канал: {channel_title}\n"
            f"Новый пост:\n«{post_text}»\n\n"
            "Напиши один уместный комментарий."
        )
        resp = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0.8,
            max_tokens=200,
        )
        return resp.choices[0].message.content.strip()


# ──────────────────── Очередь и обработка постов ────────────────
async def ask_human(loop, prompt: str) -> str:
    """Неблокирующий input() через executor."""
    return await loop.run_in_executor(None, lambda: input(prompt))


async def worker(queue: asyncio.Queue, tg: TelegramClient,
                 commenter: Commenter, cfg: dict):
    loop = asyncio.get_event_loop()
    auto = bool(cfg.get("auto_post", False))
    min_gap = float(cfg.get("min_seconds_between_comments", 60))
    last_sent = 0.0

    while True:
        event = await queue.get()
        try:
            msg = event.message
            chat = await event.get_chat()
            title = getattr(chat, "title", "канал")
            text = (msg.message or "").strip()
            if not text:
                print(f"  · [{title}] пост без текста — пропуск.")
                continue
            text = text[: int(cfg.get("max_post_chars", 4000))]

            print("\n" + "═" * 60)
            print(f"Новый пост в «{title}»:")
            print("─" * 60)
            print(text)
            print("─" * 60)

            try:
                suggestion = commenter.suggest(text, title)
            except Exception as e:  # noqa: BLE001
                print(f"  ! Ошибка GPT: {e} — пропуск.")
                continue

            comment = suggestion
            if not auto:
                print(f"Предложенный комментарий:\n  {suggestion}\n")
                ans = (await ask_human(
                    loop,
                    "[Enter] отправить · [e] изменить · [s] пропустить: ",
                )).strip().lower()
                if ans == "s":
                    print("  · Пропущено.")
                    continue
                if ans == "e":
                    comment = (await ask_human(loop, "Твой текст: ")).strip()
                    if not comment:
                        print("  · Пусто — пропуск.")
                        continue

            # пауза между комментариями, чтобы не выглядеть как спам-бот
            wait = min_gap - (time.time() - last_sent)
            if wait > 0:
                await asyncio.sleep(wait)

            try:
                await tg.send_message(chat, comment, comment_to=msg.id)
                last_sent = time.time()
                print("  ✓ Комментарий отправлен.")
            except ChatWriteForbiddenError:
                print("  ! В этом канале комментарии отключены.")
            except MsgIdInvalidError:
                print("  ! У поста нет ветки обсуждения.")
            except FloodWaitError as e:
                print(f"  ! Telegram просит подождать {e.seconds}s.")
                await asyncio.sleep(e.seconds)
        except Exception as e:  # noqa: BLE001
            print(f"  ! Непредвиденная ошибка: {e}")
        finally:
            queue.task_done()


async def main():
    cfg = load_config()
    proxy, conn = build_proxy()

    api_id = int(env("API_ID") or 0)
    api_hash = env("API_HASH")
    if not api_id or not api_hash:
        sys.exit("Заполни API_ID и API_HASH в .env (my.telegram.org).")

    session = env("SESSION_NAME", "account")

    client_kwargs = {"proxy": proxy}
    if conn is not None:
        client_kwargs["connection"] = conn

    tg = TelegramClient(str(BASE_DIR / session), api_id, api_hash,
                        **client_kwargs)

    commenter = Commenter(cfg)
    queue: asyncio.Queue = asyncio.Queue()

    channels = cfg["channels"]

    @tg.on(events.NewMessage(chats=channels))
    async def handler(event):
        # только посты самого канала (broadcast), не сообщения в обсуждении
        if getattr(event.message, "post", False) or event.is_channel:
            await queue.put(event)

    await tg.start()
    me = await tg.get_me()
    uname = f"@{me.username}" if me.username else me.first_name
    print(f"Подключён как {uname}.")
    if proxy:
        print(f"Через прокси: {env('PROXY_TYPE')}://{env('PROXY_HOST')}:{env('PROXY_PORT')}")
    print(f"Слежу за каналами: {', '.join(map(str, channels))}")
    print("Режим:", "АВТО-постинг" if cfg.get("auto_post") else "с подтверждением")
    print("Жду новые посты… (Ctrl+C — выход)\n")

    asyncio.create_task(worker(queue, tg, commenter, cfg))
    await tg.run_until_disconnected()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nВыход.")
