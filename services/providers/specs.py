from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class ProviderProtocol(StrEnum):
    OPENAI_COMPATIBLE = "openai_compatible"
    ANTHROPIC_NATIVE = "anthropic_native"
    OLLAMA_NATIVE = "ollama_native"


class EndpointName(StrEnum):
    MODELS = "models"
    CHAT = "chat"
    RESPONSES = "responses"
    EMBEDDINGS = "embeddings"
    COUNT_TOKENS = "count_tokens"
    GENERATE = "generate"
    VERSION = "version"


class EndpointSpec(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    path: str
    method: str


class ProtocolSpec(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    protocol: ProviderProtocol

    
    default_url_version: str | None = None

    
    base_path_template: str

    
    default_header_version: str | None = None

    endpoints: dict[EndpointName, EndpointSpec]

    def build_base_path(self, url_version: str | None = None) -> str:
        resolved_version = url_version or self.default_url_version

        if "{url_version}" in self.base_path_template:
            if not resolved_version:
                raise ValueError(
                    f"Protocol '{self.protocol}' requires a url_version."
                )

            return self.base_path_template.format(
                url_version=resolved_version.strip("/")
            )

        return self.base_path_template


PROTOCOL_SPECS: dict[ProviderProtocol, ProtocolSpec] = {
    ProviderProtocol.OPENAI_COMPATIBLE: ProtocolSpec(
        protocol=ProviderProtocol.OPENAI_COMPATIBLE,
        default_url_version="v1",
        base_path_template="/{url_version}",
        endpoints={
            EndpointName.MODELS: EndpointSpec(
                path="/models",
                method="GET",
            ),
            EndpointName.CHAT: EndpointSpec(
                path="/chat/completions",
                method="POST",
            ),
            EndpointName.RESPONSES: EndpointSpec(
                path="/responses",
                method="POST",
            ),
            EndpointName.EMBEDDINGS: EndpointSpec(
                path="/embeddings",
                method="POST",
            ),
        },
    ),

    ProviderProtocol.ANTHROPIC_NATIVE: ProtocolSpec(
        protocol=ProviderProtocol.ANTHROPIC_NATIVE,
        default_url_version="v1",
        base_path_template="/{url_version}",
        default_header_version="2023-06-01",
        endpoints={
            EndpointName.MODELS: EndpointSpec(
                path="/models",
                method="GET",
            ),
            EndpointName.CHAT: EndpointSpec(
                path="/messages",
                method="POST",
            ),
            EndpointName.COUNT_TOKENS: EndpointSpec(
                path="/messages/count_tokens",
                method="POST",
            ),
        },
    ),

    ProviderProtocol.OLLAMA_NATIVE: ProtocolSpec(
        protocol=ProviderProtocol.OLLAMA_NATIVE,
        default_url_version=None,
        base_path_template="/api",
        endpoints={
            EndpointName.MODELS: EndpointSpec(
                path="/tags",
                method="GET",
            ),
            EndpointName.CHAT: EndpointSpec(
                path="/chat",
                method="POST",
            ),
            EndpointName.GENERATE: EndpointSpec(
                path="/generate",
                method="POST",
            ),
            EndpointName.EMBEDDINGS: EndpointSpec(
                path="/embed",
                method="POST",
            ),
            EndpointName.VERSION: EndpointSpec(
                path="/version",
                method="GET",
            ),
        },
    ),
}