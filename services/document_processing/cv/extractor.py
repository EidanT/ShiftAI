import logging
from io import BytesIO

from pypdf import PdfReader

from config.settings import Settings
from document_processing.cv.exceptions import CorruptedPDFError
from document_processing.cv.schemas import CVExtractionResult, CVPage

logger = logging.getLogger(__name__)


class TextExtractor:
    def __init__(self, settings: Settings) -> None:
        self._min_chars = settings.cv_ocr_min_chars

    def extract(self, buffer: BytesIO) -> CVExtractionResult:
        buffer.seek(0)
        try:
            reader = PdfReader(buffer, strict=False)
            pages_raw = list(reader.pages)
        except Exception as exc:
            raise CorruptedPDFError(
                "No se pudo leer el PDF. El archivo parece estar corrupto."
            ) from exc

        pages: list[CVPage] = []
        used_ocr: list[int] = []
        for index, page in enumerate(pages_raw, start=1):
            try:
                text = page.extract_text() or ""
            except Exception as exc:
                logger.warning("pypdf failed on page %d: %s", index, exc)
                text = ""

            text = text.strip()
            needs_ocr = len(text) < self._min_chars
            if needs_ocr:
                used_ocr.append(index)

            pages.append(
                CVPage(
                    page_number=index,
                    text=text,
                    needs_ocr=needs_ocr,
                    char_count=len(text),
                )
            )

        return CVExtractionResult(
            pages=pages,
            total_pages=len(pages),
            used_ocr_pages=used_ocr,
        )
