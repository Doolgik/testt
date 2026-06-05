"""Конфигурация сервиса. Все значения берутся из переменных окружения (.env)."""

from __future__ import annotations

from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Anthropic (мозг бота) ---
    anthropic_api_key: str = Field(default="", alias="ANTHROPIC_API_KEY")
    anthropic_model: str = Field(default="claude-opus-4-8", alias="ANTHROPIC_MODEL")
    # Сколько последних сообщений диалога держим в контексте.
    history_limit: int = Field(default=20, alias="HISTORY_LIMIT")

    # --- WhatsApp Cloud API (Meta) ---
    wa_verify_token: str = Field(default="", alias="WA_VERIFY_TOKEN")
    wa_access_token: str = Field(default="", alias="WA_ACCESS_TOKEN")
    wa_phone_number_id: str = Field(default="", alias="WA_PHONE_NUMBER_ID")
    wa_graph_version: str = Field(default="v21.0", alias="WA_GRAPH_VERSION")

    # --- Bitrix24 ---
    # URL входящего вебхука вида https://xxx.bitrix24.ru/rest/1/<token>/
    bitrix_webhook_url: str = Field(default="", alias="BITRIX_WEBHOOK_URL")
    # ID воронки (категории сделок). 0 — основная воронка.
    bitrix_category_id: int = Field(default=0, alias="BITRIX_CATEGORY_ID")
    # ID источника, чтобы в CRM было видно «пришёл из WhatsApp».
    bitrix_source_id: str = Field(default="WHATSAPP", alias="BITRIX_SOURCE_ID")

    # --- Оператор (на кого переводим сложные диалоги) ---
    # Номер оператора в формате WhatsApp (например, 79991234567), на него
    # бот пришлёт уведомление, что диалог требует человека. Необязательно.
    operator_wa_number: str = Field(default="", alias="OPERATOR_WA_NUMBER")
    # Ответственный за сделки в Bitrix (ID пользователя). Необязательно.
    bitrix_assigned_user_id: int = Field(default=1, alias="BITRIX_ASSIGNED_USER_ID")

    # --- Хранилище ---
    db_path: str = Field(default=str(BASE_DIR / "data" / "sessions.db"), alias="DB_PATH")
    knowledge_base_dir: str = Field(
        default=str(BASE_DIR / "knowledge_base"), alias="KNOWLEDGE_BASE_DIR"
    )

    @property
    def bitrix_enabled(self) -> bool:
        return bool(self.bitrix_webhook_url)

    @property
    def whatsapp_enabled(self) -> bool:
        return bool(self.wa_access_token and self.wa_phone_number_id)


settings = Settings()
