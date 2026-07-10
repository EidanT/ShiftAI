from .base import ChatMessage, ChatResponse, LLMProvider
from .specs import EndpointName


class OllamaNativeProvider(LLMProvider):
    async def list_models(self) -> list[str]:
        response = await self._request_with_url_fallback(
            method="GET",
            url=self.config.endpoint_url(EndpointName.MODELS),
        )
        response.raise_for_status()

        payload = response.json()
        return [model["name"] for model in payload.get("models", [])]

    async def chat(
        self,
        *,
        model: str,
        messages: list[ChatMessage],
        temperature: float = 0.2,
        max_tokens: int | None = None,
    ) -> ChatResponse:
        options = {"temperature": temperature}

        if max_tokens is not None:
            options["num_predict"] = max_tokens

        payload = {
            "model": model,
            "messages": [message.model_dump() for message in messages],
            "stream": False,
            "options": options,
        }

        response = await self._request_with_url_fallback(
            method="POST",
            url=self.config.endpoint_url(EndpointName.CHAT),
            json=payload,
        )
        response.raise_for_status()

        data = response.json()
        content = data.get("message", {}).get("content") or ""

        return ChatResponse(
            provider=self.config.name,
            model=model,
            content=content if isinstance(content, str) else str(content),
            raw=data,
        )