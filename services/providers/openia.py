from .base import ChatMessage, ChatResponse, LLMProvider
from .specs import EndpointName


class OpenAICompatibleProvider(LLMProvider):
    def _headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}

        api_key = self.config.get_api_key()
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        return headers

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
        payload = {
            "model": model,
            "messages": [message.model_dump() for message in messages],
            "temperature": temperature,
        }

        if max_tokens is not None:
            payload["max_tokens"] = max_tokens

        response = await self._request_with_url_fallback(
            method="POST",
            url=self.config.endpoint_url(EndpointName.CHAT),
            headers=self._headers(),
            json=payload,
        )
        response.raise_for_status()

        data = response.json()
        content = self._extract_text(data)

        return ChatResponse(
            provider=self.config.name,
            model=model,
            content=content,
            raw=data,
        )

    @staticmethod
    def _extract_text(payload: dict) -> str:
        """Pull text out of an OpenAI-style chat completion response.

        The response shape is `{"choices": [{"message": {"content": "..."}}]}`
        but providers occasionally return:
        - `content: null` (model not finished, tool calls instead, or no
          available chat model yet — common on OpenRouter with `:free`
          models that are still loading).
        - `content: ""` (model loaded but produced no text).
        - `{"error": {...}}` (model not found / quota / etc.) which has no
          `choices` key at all.
        - `delta` (partial streaming frame, should not reach us, but defensively).
        - `reasoning_content` (some providers put the model output there).
        """
        if not isinstance(payload, dict):
            return ""

        
        if "error" in payload and "choices" not in payload:
            err = payload["error"]
            code = err.get("code", "unknown")
            message = err.get("message", "unknown error")
            return f"[upstream error: {code}] {message}"

        choices = payload.get("choices") or []
        if not choices:
            return ""

        first = choices[0]
        if not isinstance(first, dict):
            return ""

       
        message = first.get("message") or first.get("delta") or {}
        if not isinstance(message, dict):
            return ""

        
        content = message.get("content")
        if content is None:
            content = message.get("reasoning_content") or message.get("text") or ""
        if content is None:
            content = ""

        return content if isinstance(content, str) else str(content)