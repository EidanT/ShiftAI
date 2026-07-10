from abc import ABC, abstractmethod
from typing import Any, Literal

import httpx
from pydantic import BaseModel, ConfigDict, Field, SecretStr, computed_field

from .specs import EndpointName, PROTOCOL_SPECS, ProviderProtocol, ProtocolSpec


class ProviderConfig(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    name: str = Field(min_length=1)
    protocol: ProviderProtocol

    host: str = Field(min_length=1)
    port: int | None = Field(default=None, ge=1, le=65535)
    scheme: Literal["http", "https"] = "https"

    # URL version:
    # openai-compatible => v1
    # anthropic-native => v1
    # ollama-native => None
    url_version: str | None = None

    # Header version:
    # Anthropic => 2023-06-01
    # Otros => None
    header_version: str | None = None

    api_key: SecretStr | None = None

    default_model: str | None = None
    models: list[str] = Field(default_factory=list)

    timeout_seconds: float = Field(default=60.0, gt=0, le=300)

    @computed_field
    @property
    def spec(self) -> ProtocolSpec:
        return PROTOCOL_SPECS[self.protocol]

    @computed_field
    @property
    def resolved_url_version(self) -> str | None:
        return self.url_version or self.spec.default_url_version

    @computed_field
    @property
    def resolved_header_version(self) -> str | None:
        return self.header_version or self.spec.default_header_version

    @computed_field
    @property
    def base_path(self) -> str:
        return self.spec.build_base_path(self.resolved_url_version)

    @computed_field
    @property
    def base_url(self) -> str:
        port = f":{self.port}" if self.port and self.port not in (80, 443) else ""
        return f"{self.scheme}://{self.host}{port}{self.base_path}"

    def endpoint_url(self, endpoint: EndpointName) -> str:
        endpoint_spec = self.spec.endpoints.get(endpoint)

        if endpoint_spec is None:
            raise ValueError(
                f"Endpoint '{endpoint}' is not supported by protocol '{self.protocol}'."
            )

        return f"{self.base_url}{endpoint_spec.path}"

    def get_api_key(self) -> str | None:
        if self.api_key is None:
            return None

        return self.api_key.get_secret_value()


class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: Literal["system", "user", "assistant"]
    content: str = Field(min_length=1)


class ChatResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    provider: str
    model: str
    content: str
    raw: dict[str, Any] | None = None


class LLMProvider(BaseModel, ABC):
    model_config = ConfigDict(extra="forbid")

    config: ProviderConfig

    @abstractmethod
    async def list_models(self) -> list[str]:
        pass

    @abstractmethod
    async def chat(
        self,
        *,
        model: str,
        messages: list[ChatMessage],
        temperature: float = 0.2,
        max_tokens: int | None = None,
    ) -> ChatResponse:
        pass

    # ------------------------------------------------------------------
    # URL fallback for vendors that re-prefix the API path
    # ------------------------------------------------------------------
    # Some LLM servers expose their REST API under both `/v1/*` (the OpenAI
    # convention) and `/api/v1/*` (a slightly newer convention, used by LM
    # Studio 0.4.0+ in their native API). When a configured base URL points
    # at `/v1/...` and the server responds with 404, retry the same request
    # against the equivalent `/api/v1/...` URL. This makes the service work
    # with both LM Studio's OpenAI-compatible server and its native v1 API
    # without changing the configuration.
    @staticmethod
    def _swap_to_api_v1(url: str) -> str | None:
        scheme_sep = "://"
        scheme_end = url.find(scheme_sep)
        if scheme_end == -1:
            return None
        path_start = scheme_end + len(scheme_sep)
        # Find the first "/" after the scheme (start of the path).
        first_slash = url.find("/", path_start)
        if first_slash == -1:
            return None
        path = url[first_slash:]
        # Only swap when the path starts with "/v1/" but NOT "/api/v1/".
        if not path.startswith("/v1/"):
            return None
        return url[:first_slash] + "/api" + path

    async def _request_with_url_fallback(
        self,
        *,
        method: str,
        url: str,
        **kwargs: Any,
    ) -> httpx.Response:
        """Issue an HTTP request; on 404, retry once against the `/api/v1/`
        equivalent of the URL (if applicable)."""
        async with httpx.AsyncClient(
            timeout=self.config.timeout_seconds,
        ) as client:
            response = await client.request(method, url, **kwargs)

        if response.status_code != 404:
            return response

        fallback = self._swap_to_api_v1(url)
        if fallback is None or fallback == url:
            return response

        async with httpx.AsyncClient(
            timeout=self.config.timeout_seconds,
        ) as client:
            retry = await client.request(method, fallback, **kwargs)
        return retry