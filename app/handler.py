"""Оркестрация обработки одного входящего сообщения.

Связывает воедино: хранилище диалогов, AI-агента, Bitrix и WhatsApp.
Эта функция — «сердце» автоматизации.
"""

from __future__ import annotations

import logging

from .agent import run_agent
from .bitrix import bitrix
from .config import settings
from .conversation import store
from .models import LeadStage
from .whatsapp import IncomingMessage, whatsapp

logger = logging.getLogger(__name__)


async def handle_message(msg: IncomingMessage) -> None:
    wa_id = msg.from_wa_id
    if not wa_id or not msg.text:
        return

    # Защита от повторной доставки одного и того же сообщения.
    if msg.message_id and store.is_processed(msg.message_id):
        logger.info("Дубль сообщения %s — пропускаю", msg.message_id)
        return

    contact = store.get_contact(wa_id)
    if msg.profile_name and not contact.get("name"):
        store.update_contact(wa_id, name=msg.profile_name)
        contact["name"] = msg.profile_name

    # Сохраняем входящее сообщение в историю.
    store.add_message(wa_id, "user", msg.text)

    # Если диалог уже передан живому оператору — бот молчит.
    if contact.get("handoff"):
        logger.info("Диалог %s на операторе — бот не отвечает", wa_id)
        # Но новое сообщение клиента дополним в таймлайн сделки для оператора.
        await _note_for_operator(contact, f"Клиент написал: {msg.text}")
        return

    history = store.get_history(wa_id, settings.history_limit)
    result = await run_agent(history)

    # 1) Отправляем ответ клиенту и сохраняем его в историю.
    if result.reply_text:
        store.add_message(wa_id, "assistant", result.reply_text)
        await whatsapp.send_text(wa_id, result.reply_text)

    # 2) Гарантируем наличие сделки в Bitrix (создаём при первом контакте).
    deal_id = await _ensure_deal(wa_id, contact, result.new_stage)

    # 3) Двигаем стадию воронки, если агент её изменил.
    if result.new_stage is not None:
        store.update_contact(wa_id, stage=result.new_stage.value)
        if deal_id:
            await bitrix.set_deal_stage(deal_id, result.new_stage)
            await bitrix.add_timeline_comment(
                deal_id,
                f"🤖 Бот изменил стадию на «{result.new_stage.human_ru}». "
                f"Причина: {result.stage_reason or '—'}",
            )

    # 4) Перевод на оператора.
    if result.handoff:
        store.update_contact(wa_id, handoff=1)
        await _do_handoff(wa_id, contact, deal_id, result.handoff_reason,
                          result.handoff_summary)

    if result.actions_log:
        logger.info("Диалог %s: %s", wa_id, "; ".join(result.actions_log))


async def _ensure_deal(
    wa_id: str, contact: dict, stage: LeadStage | None
) -> int | None:
    """Возвращает id сделки, создавая контакт и сделку при первом обращении."""
    deal_id = contact.get("bitrix_deal_id")
    if deal_id:
        return int(deal_id)

    if not bitrix.enabled:
        return None

    contact_id = await bitrix.ensure_contact(wa_id, contact.get("name"))
    title = f"WhatsApp: {contact.get('name') or wa_id}"
    deal_id = await bitrix.create_deal(
        contact_id, title, stage or LeadStage.INTERESTED
    )
    if deal_id:
        store.update_contact(wa_id, bitrix_deal_id=deal_id)
        logger.info("Создана сделка Bitrix #%s для %s", deal_id, wa_id)
    return deal_id


async def _do_handoff(
    wa_id: str,
    contact: dict,
    deal_id: int | None,
    reason: str | None,
    summary: str | None,
) -> None:
    note = (
        f"🙋 Требуется оператор.\nПричина: {reason or '—'}\n"
        f"Резюме: {summary or '—'}"
    )
    if deal_id:
        await bitrix.add_timeline_comment(deal_id, note)

    # Уведомляем оператора в WhatsApp, если указан его номер.
    if settings.operator_wa_number:
        name = contact.get("name") or wa_id
        await whatsapp.send_text(
            settings.operator_wa_number,
            f"⚠️ Новый диалог требует вас.\n"
            f"Клиент: {name} (+{wa_id})\n"
            f"Причина: {reason or '—'}\n"
            f"Резюме: {summary or '—'}",
        )
    logger.info("Диалог %s переведён на оператора: %s", wa_id, reason)


async def _note_for_operator(contact: dict, text: str) -> None:
    deal_id = contact.get("bitrix_deal_id")
    if deal_id:
        await bitrix.add_timeline_comment(int(deal_id), text)
