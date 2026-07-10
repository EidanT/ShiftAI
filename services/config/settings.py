from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

# A sentinel for `llm_provider` that triggers auto-detection from
# `llm_base_url`. Useful when switching between vendors (OpenRouter, LM
# Studio, Ollama, etc.) by editing only the base URL.
_AUTO = "auto"


def _resolve_provider(base_url: str, requested: str) -> str:
    """Apply the `auto` sentinel or fall back to host-based detection."""
    # Imported lazily to avoid a circular import at module load time.
    from providers.autodetect import detect_provider

    if requested and requested != _AUTO:
        return requested
    return detect_provider(base_url)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Servicio
    service_host: str = "0.0.0.0"
    service_port: int = 8000
    service_log_level: str = "INFO"

    # CV Processing
    cv_max_size_bytes: int = 15 * 1024 * 1024
    cv_max_pages: int = 200
    cv_ocr_min_chars: int = 30
    cv_ocr_dpi: int = 200
    cv_request_timeout_seconds: float = 60.0
    cv_tesseract_cmd: str = ""

    # Rate limiting
    cv_rate_limit_per_minute: int = 100

    # LLM: el provider es agnóstico. Solo necesita URL, API key y modelo.
    # Si `llm_provider == "auto"` (default), se infiere de `llm_base_url`.
    # Esquemas disponibles:
    #   openai_compatible — OpenAI / OpenRouter / LM Studio / vLLM / Groq ...
    #   ollama           — Ollama nativo (/api)
    #   anthropic        — Anthropic nativo (/v1/messages)
    llm_provider: str = _AUTO
    llm_base_url: str = ""
    llm_api_key: str = ""
    llm_model: str = ""
    llm_temperature: float = 0.2
    llm_max_tokens: int = 80000
    llm_timeout_seconds: float = 60.0

    @property
    def resolved_llm_provider(self) -> Literal["openai_compatible", "ollama", "anthropic"]:
        return _resolve_provider(self.llm_base_url, self.llm_provider)  # type: ignore[return-value]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
