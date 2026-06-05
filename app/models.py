"""Доменные модели и стадии воронки."""

from __future__ import annotations

from enum import Enum


class LeadStage(str, Enum):
    """Логические стадии готовности клиента к покупке.

    Эти стадии — внутренние. В Bitrix они мапятся на реальные STAGE_ID
    воронки через STAGE_MAP в app/bitrix.py.
    """

    INTERESTED = "interested"      # просто интересуется / в раздумьях
    ALMOST_READY = "almost_ready"  # почти готов купить, греется
    READY_TO_BUY = "ready_to_buy"  # согласен купить

    @property
    def human_ru(self) -> str:
        return {
            LeadStage.INTERESTED: "Интересуется",
            LeadStage.ALMOST_READY: "Почти готов",
            LeadStage.READY_TO_BUY: "Готов купить",
        }[self]
