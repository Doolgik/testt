"""AI-консультант на Claude.

Логика: получает историю диалога + новое сообщение, прогоняет через модель
с двумя инструментами (смена стадии воронки и перевод на оператора), возвращает
готовый ответ клиенту и список «побочных действий» (что сделать в CRM).

Инструменты исполняются здесь же, в цикле tool-use, но фактические эффекты
(обновление Bitrix, уведомление оператора) применяет вызывающий код в main.py —
агент лишь решает, ЧТО нужно сделать.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field

from anthropic import AsyncAnthropic

from .config import settings
from .knowledge_base import load_knowledge_base
from .models import LeadStage
from .prompts import build_system_prompt

logger = logging.getLogger(__name__)

_client = AsyncAnthropic(api_key=settings.anthropic_api_key)

TOOLS = [
    {
        "name": "update_lead_stage",
        "description": (
            "Зафиксировать текущую стадию готовности клиента к покупке в CRM. "
            "Вызывай при изменении стадии на основе анализа переписки."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "stage": {
                    "type": "string",
                    "enum": ["interested", "almost_ready", "ready_to_buy"],
                    "description": (
                        "interested — просто интересуется; "
                        "almost_ready — почти готов купить; "
                        "ready_to_buy — согласен купить."
                    ),
                },
                "reason": {
                    "type": "string",
                    "description": "Краткое обоснование (1 предложение), что в переписке указывает на эту стадию.",
                },
            },
            "required": ["stage", "reason"],
        },
    },
    {
        "name": "handoff_to_operator",
        "description": (
            "Перевести диалог на живого оператора. Вызывай, когда не можешь "
            "помочь по базе знаний, нужен индивидуальный подход, клиент просит "
            "человека, или клиент готов оформлять покупку."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "reason": {
                    "type": "string",
                    "description": "Почему нужен оператор (1 предложение).",
                },
                "summary": {
                    "type": "string",
                    "description": "Краткое резюме диалога и запроса клиента для оператора.",
                },
            },
            "required": ["reason", "summary"],
        },
    },
]


@dataclass
class AgentResult:
    reply_text: str
    new_stage: LeadStage | None = None
    stage_reason: str | None = None
    handoff: bool = False
    handoff_reason: str | None = None
    handoff_summary: str | None = None
    actions_log: list[str] = field(default_factory=list)


def _system_blocks() -> list[dict]:
    """Системный промпт с кэшированием (KB меняется редко — экономим токены)."""
    return [
        {
            "type": "text",
            "text": build_system_prompt(load_knowledge_base()),
            "cache_control": {"type": "ephemeral"},
        }
    ]


async def run_agent(history: list[dict[str, str]]) -> AgentResult:
    """Прогоняет диалог через модель и возвращает ответ + действия.

    `history` — список сообщений в формате Anthropic ([{role, content}, ...]),
    последним должно идти новое сообщение клиента (role='user').
    """
    result = AgentResult(reply_text="")
    messages: list[dict] = list(history)

    # Цикл tool-use: модель может вызвать инструменты, мы их «исполняем»
    # (фиксируем намерение) и продолжаем, пока модель не закончит ответ.
    for _ in range(6):  # защита от бесконечного цикла
        response = await _client.messages.create(
            model=settings.anthropic_model,
            max_tokens=1024,
            system=_system_blocks(),
            messages=messages,
            tools=TOOLS,
            thinking={"type": "adaptive"},
            output_config={"effort": "medium"},
        )

        # Собираем текст ответа из блоков text.
        text_parts = [b.text for b in response.content if b.type == "text"]
        if text_parts:
            result.reply_text = "\n".join(t.strip() for t in text_parts if t.strip())

        if response.stop_reason != "tool_use":
            break

        # Обрабатываем вызовы инструментов.
        messages.append({"role": "assistant", "content": response.content})
        tool_results = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            ack = _handle_tool(block.name, block.input, result)
            tool_results.append(
                {
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": ack,
                }
            )
        messages.append({"role": "user", "content": tool_results})

    if not result.reply_text:
        result.reply_text = (
            "Спасибо за обращение! Секунду, уточняю информацию и вернусь к вам."
        )
    return result


def _handle_tool(name: str, tool_input: dict, result: AgentResult) -> str:
    """Регистрирует намерение инструмента, возвращает подтверждение для модели."""
    if name == "update_lead_stage":
        try:
            stage = LeadStage(tool_input["stage"])
        except ValueError:
            return "Ошибка: неизвестная стадия."
        result.new_stage = stage
        result.stage_reason = tool_input.get("reason")
        result.actions_log.append(
            f"стадия → {stage.human_ru} ({result.stage_reason})"
        )
        return f"Стадия обновлена на «{stage.human_ru}»."

    if name == "handoff_to_operator":
        result.handoff = True
        result.handoff_reason = tool_input.get("reason")
        result.handoff_summary = tool_input.get("summary")
        result.actions_log.append(f"перевод на оператора ({result.handoff_reason})")
        return "Диалог переведён на оператора, продолжать отвечать не нужно."

    return "Неизвестный инструмент."
