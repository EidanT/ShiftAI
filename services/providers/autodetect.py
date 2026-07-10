"""Provider auto-detection from a base URL.

Some clients (e.g. Qwen Code, LM Studio's CLI) accept a single base URL
and infer the provider schema from it. We do the same: given
`llm_base_url` and the current `llm_model`, return the
`(provider_name, default_model)` pair that best matches the URL.
"""

from __future__ import annotations

from urllib.parse import urlparse

# Order matters: more specific hosts come first so that
# "https://openrouter.ai/api/v1" matches openrouter and not "openai_compatible".
# We do NOT list bare "localhost" here — the port-based hints below are
# strictly stronger signals for local servers, and a generic `localhost`
# fallback would mask unknown local ports.
_HOST_HINTS: list[tuple[str, str, str | None]] = [
    # (substr in host, provider_name, default_model or None to keep current)
    ("openrouter.ai", "openai_compatible", None),
    ("api.anthropic.com", "anthropic", None),
    ("api.openai.com", "openai_compatible", None),
]

# Local-server port heuristics: if the host is local but unknown, the port
# is a strong signal.
_PORT_HINTS: dict[int, str] = {
    1234: "lmstudio",   # LM Studio default
    11434: "ollama",    # Ollama default
}


def detect_provider(base_url: str) -> str:
    """Return the most likely `llm_provider` for a given base URL.

    The detection is intentionally cheap (string matching on the host and
    port) and biased towards OpenAI-compatible servers, since most modern
    LLM gateways expose an OpenAI-style `/v1/chat/completions` endpoint.
    """
    if not base_url:
        return "openai_compatible"

    parsed = urlparse(base_url)
    host = (parsed.hostname or "").lower()

    # Port-based hints come first: when the user points at `localhost:1234`
    # the port is a stronger signal than the bare host `localhost`.
    port = parsed.port
    if port is not None and port in _PORT_HINTS:
        return _PORT_HINTS[port]

    for needle, provider, _ in _HOST_HINTS:
        if needle in host:
            return provider

    return "openai_compatible"
