"""FastAPI-приложение: приём вебхуков WhatsApp и health-check.

Запуск: uvicorn app.main:app --host 0.0.0.0 --port 8000
"""

from __future__ import annotations

import logging

from fastapi import BackgroundTasks, FastAPI, Query, Request, Response

from .config import settings
from .handler import handle_message
from .knowledge_base import reload_knowledge_base
from .whatsapp import parse_webhook

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="WhatsApp CRM Bot", version="0.1.0")


@app.get("/")
async def root() -> dict:
    return {
        "service": "whatsapp-crm-bot",
        "whatsapp_configured": settings.whatsapp_enabled,
        "bitrix_configured": settings.bitrix_enabled,
        "anthropic_configured": bool(settings.anthropic_api_key),
    }


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.get("/webhook/whatsapp")
async def verify_webhook(
    mode: str = Query("", alias="hub.mode"),
    token: str = Query("", alias="hub.verify_token"),
    challenge: str = Query("", alias="hub.challenge"),
) -> Response:
    """Верификация вебхука при подключении в Meta (GET-запрос с challenge)."""
    if mode == "subscribe" and token == settings.wa_verify_token:
        logger.info("Webhook verified")
        return Response(content=challenge, media_type="text/plain")
    logger.warning("Webhook verification failed (mode=%s)", mode)
    return Response(content="Forbidden", status_code=403)


@app.post("/webhook/whatsapp")
async def receive_webhook(request: Request, background: BackgroundTasks) -> dict:
    """Приём входящих сообщений.

    Отвечаем Meta мгновенно (200), а обработку (вызов модели, CRM, ответ)
    выносим в фон — иначе WhatsApp будет ретраить из-за таймаута.
    """
    payload = await request.json()
    messages = parse_webhook(payload)
    for msg in messages:
        background.add_task(handle_message, msg)
    return {"status": "received", "count": len(messages)}


@app.post("/admin/reload-kb")
async def reload_kb() -> dict:
    """Перечитать базу знаний без рестарта сервиса (после правки файлов)."""
    kb = reload_knowledge_base()
    return {"status": "reloaded", "chars": len(kb)}
