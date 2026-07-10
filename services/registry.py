"""Provider factory: build a single LLM provider from `Settings`.
"""

from __future__ import annotations

from urllib.parse import urlparse

from pydantic import SecretStr

from config.settings import Settings, get_settings
from providers.anthopic import AnthropicNativeProvider
from providers.base import LLMProvider, ProviderConfig, ProviderProtocol
from providers.ollama_native import OllamaNativeProvider
from providers.openia import OpenAICompatibleProvider


def _split_url(url: str) -> tuple[str, int, str]:
    parsed = urlparse(url)
    scheme = parsed.scheme or "http"
    host = parsed.hostname or "localhost"
    port = parsed.port
    return host, port, scheme


def _protocol_for(name: str) -> ProviderProtocol:
    return {
        "openai_compatible": ProviderProtocol.OPENAI_COMPATIBLE,
        "ollama": ProviderProtocol.OLLAMA_NATIVE,
        "anthropic": ProviderProtocol.ANTHROPIC_NATIVE,

        "lmstudio": ProviderProtocol.OPENAI_COMPATIBLE,
    }[name]


def _class_for(protocol: ProviderProtocol) -> type[LLMProvider]:
    return {
        ProviderProtocol.OPENAI_COMPATIBLE: OpenAICompatibleProvider,
        ProviderProtocol.OLLAMA_NATIVE: OllamaNativeProvider,
        ProviderProtocol.ANTHROPIC_NATIVE: AnthropicNativeProvider,
    }[protocol]


def build_provider(
    settings: Settings | None = None,
) -> LLMProvider:
    if settings is None:
        settings = get_settings()

    provider_name = settings.resolved_llm_provider
    host, port, scheme = _split_url(settings.llm_base_url)
    protocol = _protocol_for(provider_name)
    api_key = SecretStr(settings.llm_api_key) if settings.llm_api_key else None

    config = ProviderConfig(
        name=provider_name,
        protocol=protocol,
        host=host,
        port=port,
        scheme=scheme,
        api_key=api_key,
        default_model=settings.llm_model or None,
        timeout_seconds=settings.llm_timeout_seconds,
    )

    return _class_for(protocol)(config=config)
