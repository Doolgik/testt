"""Клиент Bitrix24 через входящий вебхук (REST).

Что умеет:
- найти/создать контакт по номеру телефона;
- найти/создать активную сделку для контакта;
- двигать сделку по стадиям воронки;
- оставить комментарий в таймлайне сделки (для оператора).

Если BITRIX_WEBHOOK_URL не задан — все методы работают в «сухом» режиме
(только логируют), чтобы можно было поднять и протестировать бота ещё до
подключения CRM.
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

from .config import settings
from .models import LeadStage

logger = logging.getLogger(__name__)

# Маппинг наших логических стадий на STAGE_ID воронки Bitrix.
#
# Значения по умолчанию — для НОВОЙ воронки Bitrix (категория C<ID>).
# Узнать свои STAGE_ID можно методом crm.dealcategory.stage.list или в
# настройках воронки. Переопредели здесь под свою воронку.
#
# Формат STAGE_ID для основной воронки: "NEW", "PREPARATION", ...
# Для дополнительной воронки с ID=N: "C{N}:NEW", "C{N}:PREPARATION", ...
STAGE_MAP: dict[LeadStage, str] = {
    LeadStage.INTERESTED: "NEW",          # Интересуется
    LeadStage.ALMOST_READY: "PREPARATION",  # Почти готов
    LeadStage.READY_TO_BUY: "EXECUTING",    # Готов купить
}


class BitrixClient:
    def __init__(self) -> None:
        self._base = settings.bitrix_webhook_url.rstrip("/")

    @property
    def enabled(self) -> bool:
        return settings.bitrix_enabled

    async def _call(self, method: str, params: dict[str, Any]) -> Any:
        if not self.enabled:
            logger.info("[Bitrix отключён] %s(%s)", method, params)
            return None
        url = f"{self._base}/{method}.json"
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(url, json=params)
            data = resp.json()
            if "error" in data:
                logger.error(
                    "Bitrix %s error: %s — %s",
                    method,
                    data.get("error"),
                    data.get("error_description"),
                )
                return None
            return data.get("result")

    def _stage_id(self, stage: LeadStage) -> str:
        base = STAGE_MAP[stage]
        cat = settings.bitrix_category_id
        # У дополнительной воронки стадии префиксуются "C{cat}:".
        if cat and not base.startswith("C"):
            return f"C{cat}:{base}"
        return base

    async def find_contact_by_phone(self, phone: str) -> int | None:
        result = await self._call(
            "crm.contact.list",
            {
                "filter": {"PHONE": phone},
                "select": ["ID"],
            },
        )
        if result:
            return int(result[0]["ID"])
        return None

    async def create_contact(self, phone: str, name: str | None) -> int | None:
        fields: dict[str, Any] = {
            "NAME": name or f"WhatsApp {phone}",
            "PHONE": [{"VALUE": phone, "VALUE_TYPE": "MOBILE"}],
            "SOURCE_ID": settings.bitrix_source_id,
            "ASSIGNED_BY_ID": settings.bitrix_assigned_user_id,
        }
        result = await self._call("crm.contact.add", {"fields": fields})
        return int(result) if result else None

    async def ensure_contact(self, phone: str, name: str | None) -> int | None:
        contact_id = await self.find_contact_by_phone(phone)
        if contact_id is None:
            contact_id = await self.create_contact(phone, name)
        return contact_id

    async def create_deal(
        self, contact_id: int | None, title: str, stage: LeadStage
    ) -> int | None:
        fields: dict[str, Any] = {
            "TITLE": title,
            "STAGE_ID": self._stage_id(stage),
            "SOURCE_ID": settings.bitrix_source_id,
            "ASSIGNED_BY_ID": settings.bitrix_assigned_user_id,
        }
        if settings.bitrix_category_id:
            fields["CATEGORY_ID"] = settings.bitrix_category_id
        if contact_id:
            fields["CONTACT_ID"] = contact_id
        result = await self._call("crm.deal.add", {"fields": fields})
        return int(result) if result else None

    async def set_deal_stage(self, deal_id: int, stage: LeadStage) -> None:
        await self._call(
            "crm.deal.update",
            {"id": deal_id, "fields": {"STAGE_ID": self._stage_id(stage)}},
        )

    async def add_timeline_comment(self, deal_id: int, comment: str) -> None:
        await self._call(
            "crm.timeline.comment.add",
            {
                "fields": {
                    "ENTITY_ID": deal_id,
                    "ENTITY_TYPE": "deal",
                    "COMMENT": comment,
                }
            },
        )


bitrix = BitrixClient()
