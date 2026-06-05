"""Хранилище диалогов и состояния клиентов (SQLite).

На каждого клиента (по номеру WhatsApp) храним:
- историю переписки (для контекста бота);
- текущую стадию воронки;
- флаг «переведён на оператора» (handoff) — пока он стоит, бот молчит,
  чтобы не мешать живому менеджеру;
- id сделки в Bitrix.

SQLite выбран намеренно: ноль внешних зависимостей, переживает рестарт
контейнера (если примонтировать каталог data/). Для нагрузки в сотни
диалогов в секунду стоит заменить на Postgres/Redis — интерфейс это
позволяет сделать безболезненно.
"""

from __future__ import annotations

import sqlite3
import threading
import time
from pathlib import Path
from typing import Any

from .config import settings


class ConversationStore:
    def __init__(self, db_path: str) -> None:
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self._db_path = db_path
        self._lock = threading.Lock()
        self._conn = sqlite3.connect(db_path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._init_schema()

    def _init_schema(self) -> None:
        with self._lock, self._conn:
            self._conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS contacts (
                    wa_id           TEXT PRIMARY KEY,
                    name            TEXT,
                    stage           TEXT,
                    handoff         INTEGER NOT NULL DEFAULT 0,
                    bitrix_deal_id  INTEGER,
                    updated_at      REAL NOT NULL
                );
                CREATE TABLE IF NOT EXISTS messages (
                    id        INTEGER PRIMARY KEY AUTOINCREMENT,
                    wa_id     TEXT NOT NULL,
                    role      TEXT NOT NULL,        -- 'user' | 'assistant'
                    content   TEXT NOT NULL,
                    ts        REAL NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_messages_wa ON messages(wa_id, id);
                CREATE TABLE IF NOT EXISTS processed_messages (
                    wa_message_id TEXT PRIMARY KEY,
                    ts            REAL NOT NULL
                );
                """
            )

    # --- Дедупликация входящих (WhatsApp шлёт ретраи) ---

    def is_processed(self, wa_message_id: str) -> bool:
        with self._lock, self._conn:
            row = self._conn.execute(
                "SELECT 1 FROM processed_messages WHERE wa_message_id = ?",
                (wa_message_id,),
            ).fetchone()
            if row:
                return True
            self._conn.execute(
                "INSERT INTO processed_messages (wa_message_id, ts) VALUES (?, ?)",
                (wa_message_id, time.time()),
            )
            return False

    # --- Контакт ---

    def get_contact(self, wa_id: str) -> dict[str, Any]:
        with self._lock, self._conn:
            row = self._conn.execute(
                "SELECT * FROM contacts WHERE wa_id = ?", (wa_id,)
            ).fetchone()
            if row is None:
                self._conn.execute(
                    "INSERT INTO contacts (wa_id, handoff, updated_at) VALUES (?, 0, ?)",
                    (wa_id, time.time()),
                )
                return {
                    "wa_id": wa_id,
                    "name": None,
                    "stage": None,
                    "handoff": 0,
                    "bitrix_deal_id": None,
                }
            return dict(row)

    def update_contact(self, wa_id: str, **fields: Any) -> None:
        if not fields:
            return
        allowed = {"name", "stage", "handoff", "bitrix_deal_id"}
        sets = {k: v for k, v in fields.items() if k in allowed}
        if not sets:
            return
        sets["updated_at"] = time.time()
        cols = ", ".join(f"{k} = ?" for k in sets)
        with self._lock, self._conn:
            self._conn.execute(
                f"UPDATE contacts SET {cols} WHERE wa_id = ?",
                (*sets.values(), wa_id),
            )

    # --- Сообщения ---

    def add_message(self, wa_id: str, role: str, content: str) -> None:
        with self._lock, self._conn:
            self._conn.execute(
                "INSERT INTO messages (wa_id, role, content, ts) VALUES (?, ?, ?, ?)",
                (wa_id, role, content, time.time()),
            )

    def get_history(self, wa_id: str, limit: int) -> list[dict[str, str]]:
        """Возвращает последние `limit` сообщений в формате Anthropic messages."""
        with self._lock, self._conn:
            rows = self._conn.execute(
                "SELECT role, content FROM messages WHERE wa_id = ? "
                "ORDER BY id DESC LIMIT ?",
                (wa_id, limit),
            ).fetchall()
        return [{"role": r["role"], "content": r["content"]} for r in reversed(rows)]


store = ConversationStore(settings.db_path)
