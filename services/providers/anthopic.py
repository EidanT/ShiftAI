from .base import ChatMessage, ChatResponse, LLMProvider
from .specs import EndpointName


class AnthropicNativeProvider(LLMProvider):
    def _headers(self) -> dict[str, str]:
        api_key = self.config.get_api_key()

        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY is required.")

        return {
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": self.config.resolved_header_version or "2023-06-01",
        }

    async def list_models(self) -> list[str]:
        response = await self._request_with_url_fallback(
            method="GET",
            url=self.config.endpoint_url(EndpointName.MODELS),
            headers=self._headers(),
        )
        response.raise_for_status()

        payload = response.json()
        return [item["id"] for item in payload.get("data", [])]

    async def chat(
        self,
        *,
        model: str,
        messages: list[ChatMessage],
        temperature: float = 0.2,
        max_tokens: int | None = None,
    ) -> ChatResponse:
        system_prompt = self._extract_system_prompt(messages)
        anthropic_messages = self._to_anthropic_messages(messages)

        payload = {
            "model": model,
            "max_tokens": max_tokens or 1024,
            "temperature": temperature,
            "messages": anthropic_messages,
        }

        if system_prompt:
            payload["system"] = system_prompt

        response = await self._request_with_url_fallback(
            method="POST",
            url=self.config.endpoint_url(EndpointName.CHAT),
            headers=self._headers(),
            json=payload,
        )
        response.raise_for_status()

        data = response.json()
        content = self._extract_text_content(data)

        return ChatResponse(
            provider=self.config.name,
            model=model,
            content=content,
            raw=data,
        )

    def _extract_system_prompt(self, messages: list[ChatMessage]) -> str | None:
        system_parts = [
            message.content
            for message in messages
            if message.role == "system"
        ]

        if not system_parts:
            return None

        return "\n\n".join(system_parts)

    def _to_anthropic_messages(
        self,
        messages: list[ChatMessage],
    ) -> list[dict[str, str]]:
        return [
            {
                "role": message.role,
                "content": message.content,
            }
            for message in messages
            if message.role in {"user", "assistant"}
        ]

    def _extract_text_content(self, payload: dict) -> str:
        content_blocks = payload.get("content", [])

        text_parts = [
            block.get("text", "")
            for block in content_blocks
            if block.get("type") == "text"
        ]

        return "\n".join(part for part in text_parts if part).strip()