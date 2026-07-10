"""Convert a `CVExtractionResult` (already cleaned) to Markdown."""

from __future__ import annotations

import re

from document_processing.cv.schemas import CVExtractionResult, CVProcessResult


_HEADING_TRIGGERS = (
    "EXPERIENCE",
    "EDUCATION",
    "SKILLS",
    "SUMMARY",
    "PROFILE",
    "WORK EXPERIENCE",
    "PROFESSIONAL EXPERIENCE",
    "PROJECTS",
    "CERTIFICATIONS",
    "LANGUAGES",
    "CONTACT",
)


class MarkdownConverter:
    """Turn a per-page extraction into a single Markdown string.

    The structure is intentionally simple: each page becomes a section.
    Individual lines that match a CV section header are promoted to H3
    within the page. Bullets are detected by leading dashes / asterisks.
    """

    _BULLET_RE = re.compile(r"^(\s*)[-•*]\s+(.*)$")

    def to_markdown(
        self,
        extraction: CVExtractionResult,
        *,
        filename: str,
        content_type: str | None,
    ) -> CVProcessResult:
        sections: list[str] = []
        for page in extraction.pages:
            page_block = self._page_to_markdown(page)
            if page_block.strip():
                sections.append(page_block)

        body = "\n\n---\n\n".join(sections) if sections else ""

        return CVProcessResult(
            filename=filename,
            content_type=content_type,
            markdown=body,
            used_ocr_pages=list(extraction.used_ocr_pages),
            total_pages=extraction.total_pages,
        )

    def _page_to_markdown(self, page) -> str:
        heading = f"## Página {page.page_number}"
        lines_out: list[str] = [heading]
        if not page.text:
            lines_out.append("_(página sin texto extraído)_")
            return "\n".join(lines_out)

        for raw in page.text.splitlines():
            stripped = raw.strip()
            if not stripped:
                lines_out.append("")
                continue

            if self._is_heading(stripped):
                rendered = stripped.title() if stripped.isupper() else stripped
                lines_out.append(f"### {rendered}")
                continue

            bullet = self._BULLET_RE.match(raw)
            if bullet:
                lines_out.append(f"- {bullet.group(2).strip()}")
                continue

            lines_out.append(stripped)

        return "\n".join(lines_out).strip("\n")

    @staticmethod
    def _is_heading(line: str) -> bool:
        if len(line) > 60:
            return False
        upper = line.upper().strip(":").strip()
        return upper in _HEADING_TRIGGERS
