from pydantic import BaseModel, ConfigDict, Field


class CVPage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    page_number: int = Field(ge=1)
    text: str
    needs_ocr: bool
    char_count: int = Field(ge=0)


class CVExtractionResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    pages: list[CVPage]
    total_pages: int = Field(ge=1)
    used_ocr_pages: list[int] = Field(default_factory=list)


class CVProcessResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    filename: str
    content_type: str | None
    markdown: str
    used_ocr_pages: list[int]
    total_pages: int = Field(ge=1)


class CVSummarizeResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    filename: str
    summary: str
    model: str
    provider: str
