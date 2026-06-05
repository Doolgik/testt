"""Загрузка базы знаний компании.

Все файлы .md / .txt из каталога knowledge_base склеиваются в один текст,
который подставляется в системный промпт бота (и кэшируется на стороне
Anthropic, чтобы не платить за него на каждом запросе).

Для компании с десятком-другим документов этого более чем достаточно.
Если база вырастет до сотен страниц — здесь стоит подключить полноценный
поиск (RAG с эмбеддингами); см. README, раздел «Масштабирование».
"""

from __future__ import annotations

import logging
from functools import lru_cache
from pathlib import Path

from .config import settings

logger = logging.getLogger(__name__)

_SUPPORTED = {".md", ".txt", ".markdown"}


@lru_cache(maxsize=1)
def load_knowledge_base() -> str:
    """Считывает и склеивает все документы базы знаний в один текст."""
    kb_dir = Path(settings.knowledge_base_dir)
    if not kb_dir.exists():
        logger.warning("Каталог базы знаний не найден: %s", kb_dir)
        return ""

    parts: list[str] = []
    for path in sorted(kb_dir.rglob("*")):
        if path.suffix.lower() not in _SUPPORTED:
            continue
        if path.name.lower() == "readme.md":
            # README — инструкция для людей, не контент для бота.
            continue
        try:
            text = path.read_text(encoding="utf-8").strip()
        except OSError as exc:
            logger.error("Не смог прочитать %s: %s", path, exc)
            continue
        if text:
            parts.append(f"### Документ: {path.stem}\n\n{text}")

    if not parts:
        logger.warning(
            "База знаний пуста. Положи .md/.txt файлы в %s — бот будет "
            "консультировать на их основе.",
            kb_dir,
        )
    return "\n\n---\n\n".join(parts)


def reload_knowledge_base() -> str:
    """Сбросить кэш и перечитать базу знаний (например, после правок)."""
    load_knowledge_base.cache_clear()
    return load_knowledge_base()
