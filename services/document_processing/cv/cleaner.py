"""Heuristic text cleaning for CV extracted content.

The cleaner operates on the *per-page* text already produced by `TextExtractor`.
It is intentionally conservative: prefer to keep tokens rather than erase
information. All operations are local (no LLM, no I/O) and deterministic.
"""

from __future__ import annotations

import re

# Pattern that matches a "header" line: short, often page numbers, dates, or
# repeated candidate names. We treat lines with fewer than 4 alpha chars OR that
# are just digits / page-number-like tokens as headers.
_HEADER_LINE_RE = re.compile(r"^[\W\d_]*\d{1,4}[\W\d_]*$|^[\s.\-_:|]+$")

# Footer pattern: lines that look like contact info or page counters repeated
# at the bottom of a CV page.
_FOOTER_HINT_RE = re.compile(
    r"(?i)page\s*\d+\s*(of\s*\d+)?|"
    r"^\s*[\w.+-]+@[\w-]+\.[\w.-]+\s*$|"
    r"^\s*(tel\.?|phone|mobile)\s*[:.]",
)

# Collapse 3+ blank lines into a single blank line.
_MULTI_BLANK_RE = re.compile(r"\n{3,}")
# Collapse runs of horizontal whitespace within a line (preserves newlines).
_INLINE_WS_RE = re.compile(r"[ \t]{2,}")
# Strip trailing whitespace from each line.
_TRAILING_WS_RE = re.compile(r"[ \t]+$", flags=re.MULTILINE)
# Hyphenation across line breaks: "soft-\nware" -> "software".
_SOFT_HYPHEN_RE = re.compile(r"(\w)-\n(\w)")
# BOM and zero-width artifacts.
_INVISIBLES_RE = re.compile(r"[​‌‍﻿]")


class CVCleaner:
    """Apply a fixed set of cleaning rules to a single page of text."""

    def clean(self, text: str) -> str:
        if not text:
            return ""

        cleaned = _INVISIBLES_RE.sub("", text)
        cleaned = _SOFT_HYPHEN_RE.sub(r"\1\2", cleaned)
        cleaned = _INLINE_WS_RE.sub(" ", cleaned)
        cleaned = _TRAILING_WS_RE.sub("", cleaned)

        lines = cleaned.splitlines()
        kept: list[str] = []
        for raw in lines:
            line = raw.strip()
            if not line:
                kept.append("")
                continue
            if _HEADER_LINE_RE.match(line):
                continue
            if _FOOTER_HINT_RE.search(line) and len(line) < 80:
                continue
            kept.append(raw.rstrip())

        # Strip leading/trailing blank lines and collapse runs.
        joined = "\n".join(kept)
        joined = _MULTI_BLANK_RE.sub("\n\n", joined).strip()
        return joined
