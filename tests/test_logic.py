"""Тесты бизнес-логики, не требующие сети (WhatsApp/Bitrix/Anthropic).

Запуск: pytest -q
"""

from __future__ import annotations

import os
import tempfile

from app.bitrix import STAGE_MAP
from app.models import LeadStage
from app.whatsapp import parse_webhook


def test_stage_map_covers_all_stages():
    # Каждая логическая стадия должна иметь маппинг в Bitrix.
    for stage in LeadStage:
        assert stage in STAGE_MAP
        assert STAGE_MAP[stage]


def test_human_ru_labels():
    assert LeadStage.INTERESTED.human_ru == "Интересуется"
    assert LeadStage.ALMOST_READY.human_ru == "Почти готов"
    assert LeadStage.READY_TO_BUY.human_ru == "Готов купить"


def test_parse_webhook_text_message():
    payload = {
        "entry": [
            {
                "changes": [
                    {
                        "value": {
                            "contacts": [
                                {"wa_id": "79991234567", "profile": {"name": "Иван"}}
                            ],
                            "messages": [
                                {
                                    "id": "wamid.ABC",
                                    "from": "79991234567",
                                    "type": "text",
                                    "text": {"body": "Привет, сколько стоит?"},
                                }
                            ],
                        }
                    }
                ]
            }
        ]
    }
    msgs = parse_webhook(payload)
    assert len(msgs) == 1
    assert msgs[0].from_wa_id == "79991234567"
    assert msgs[0].text == "Привет, сколько стоит?"
    assert msgs[0].profile_name == "Иван"
    assert msgs[0].message_id == "wamid.ABC"


def test_parse_webhook_non_text_message():
    payload = {
        "entry": [
            {
                "changes": [
                    {
                        "value": {
                            "messages": [
                                {
                                    "id": "wamid.IMG",
                                    "from": "79990000000",
                                    "type": "image",
                                    "image": {"id": "media123"},
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    }
    msgs = parse_webhook(payload)
    assert len(msgs) == 1
    assert "нетекстовое" in msgs[0].text


def test_parse_webhook_status_only_no_messages():
    # Вебхуки о статусах доставки не должны порождать сообщений.
    payload = {"entry": [{"changes": [{"value": {"statuses": [{"status": "read"}]}}]}]}
    assert parse_webhook(payload) == []


def test_conversation_store_roundtrip():
    from app.conversation import ConversationStore

    with tempfile.TemporaryDirectory() as tmp:
        db = os.path.join(tmp, "t.db")
        s = ConversationStore(db)

        contact = s.get_contact("79991234567")
        assert contact["handoff"] == 0

        s.add_message("79991234567", "user", "Привет")
        s.add_message("79991234567", "assistant", "Здравствуйте!")
        history = s.get_history("79991234567", 10)
        assert [m["role"] for m in history] == ["user", "assistant"]
        assert history[0]["content"] == "Привет"

        s.update_contact("79991234567", stage=LeadStage.ALMOST_READY.value, handoff=1)
        contact = s.get_contact("79991234567")
        assert contact["stage"] == "almost_ready"
        assert contact["handoff"] == 1


def test_dedup_processed_messages():
    from app.conversation import ConversationStore

    with tempfile.TemporaryDirectory() as tmp:
        s = ConversationStore(os.path.join(tmp, "t.db"))
        assert s.is_processed("wamid.X") is False
        assert s.is_processed("wamid.X") is True  # второй раз — дубль
