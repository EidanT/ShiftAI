"""LLM service wrapper.

Builds a `ChatMessage` list from `prompts.SYSTEM_RESUMEN` + a user message
containing the Markdown CV, and delegates to whichever `LLMProvider` is
currently registered.
"""

from __future__ import annotations

import logging
import time
from typing import TYPE_CHECKING

from document_processing.cv.exceptions import LLMUnavailableError
from llm.prompts import SYSTEM_RESUMEN, build_user_prompt
from providers.base import ChatMessage, ChatResponse

if TYPE_CHECKING:
    from providers.base import LLMProvider

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(
        self,
        provider: "LLMProvider",
        *,
        default_model: str | None,
        temperature: float,
        max_tokens: int,
    ) -> None:
       
        self._provider = provider
        self._default_model = default_model
        self._temperature = temperature
        self._max_tokens = max_tokens

    async def summarize(self, markdown: str, *, model: str | None = None) -> ChatResponse:
        chosen_model = model or self._default_model
        if not chosen_model:
            raise LLMUnavailableError(
                "No hay modelo configurado para el resumen (LLM_DEFAULT_MODEL)."
            )

        messages = [
            ChatMessage(role="system", content=SYSTEM_RESUMEN),
            ChatMessage(role="user", content=build_user_prompt(markdown)),
        ]

        started = time.perf_counter()
        try:
            response = await self._provider.chat(
                model=chosen_model,
                messages=messages,
                temperature=self._temperature,
                max_tokens=self._max_tokens,
            )
        except Exception as exc:  
            logger.warning(
                "llm.summarize failed: %s",
                exc,
                extra={
                    "llm_model": chosen_model,
                    "llm_provider": self._provider.config.name,
                },
            )
            raise LLMUnavailableError(
                "El proveedor de LLM no respondió correctamente."
            ) from exc

        elapsed_ms = int((time.perf_counter() - started) * 1000)
        logger.info(
            "llm.summarize ok",
            extra={
                "llm_model": chosen_model,
                "llm_provider": self._provider.config.name,
                "llm_elapsed_ms": elapsed_ms,
                "llm_prompt_chars": len(markdown),
            },
        )
        return response
