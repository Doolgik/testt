"""Клиент WhatsApp Cloud API (Meta) + разбор входящих вебхуков.

Документация: https://developers.facebook.com/docs/whatsapp/cloud-api
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

import httpx

from .config import settings

logger = logging.getLogger(__name__)


@dataclass
class IncomingMessage:
    """Одно входящее текстовое сообщение от клиента."""

    message_id: str
    from_wa_id: str        # номер клиента, напр. "79991234567"
    text: str
    profile_name: str | None = None


def parse_webhook(payload: dict[str, Any]) -> list[IncomingMessage]:
    """Достаёт текстовые сообщения из тела вебхука WhatsApp.

    Структура вебхука: entry[].changes[].value.messages[].
    Нетекстовые сообщения (фото, аудио и т.п.) пока пропускаем, но
    отдаём заглушку-текст, чтобы бот мог корректно ответить.
    """
    out: list[IncomingMessage] = []
    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})
            contacts = {
                c.get("wa_id"): c.get("profile", {}).get("name")
                for c in value.get("contacts", [])
            }
            for msg in value.get("messages", []):
                if msg.get("type") != "text":
                    # Не текст — просим клиента написать текстом.
                    out.append(
                        IncomingMessage(
                            message_id=msg.get("id", ""),
                            from_wa_id=msg.get("from", ""),
                            text="[клиент прислал нетекстовое сообщение]",
                            profile_name=contacts.get(msg.get("from")),
                        )
                    )
                    continue
                out.append(
                    IncomingMessage(
                        message_id=msg.get("id", ""),
                        from_wa_id=msg.get("from", ""),
                        text=msg.get("text", {}).get("body", ""),
                        profile_name=contacts.get(msg.get("from")),
                    )
                )
    return out


class WhatsAppClient:
    def __init__(self) -> None:
        self._base = (
            f"https://graph.facebook.com/{settings.wa_graph_version}/"
            f"{settings.wa_phone_number_id}/messages"
        )
        self._headers = {
            "Authorization": f"Bearer {settings.wa_access_token}",
            "Content-Type": "application/json",
        }

    async def send_text(self, to_wa_id: str, text: str) -> None:
        """Отправляет текстовое сообщение клиенту."""
        if not settings.whatsapp_enabled:
            logger.info("[WA отключён] -> %s: %s", to_wa_id, text)
            return

        payload = {
            "messaging_product": "whatsapp",
            "to": to_wa_id,
            "type": "text",
            "text": {"preview_url": False, "body": text},
        }
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(self._base, headers=self._headers, json=payload)
            if resp.status_code >= 400:
                logger.error(
                    "WhatsApp send error %s: %s", resp.status_code, resp.text
                )
            resp.raise_for_status()


whatsapp = WhatsAppClient()
