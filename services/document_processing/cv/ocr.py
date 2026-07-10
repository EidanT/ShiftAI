"""OCR service powered by pytesseract + pypdfium2 rasterization.

The OCR layer is invoked only on pages that the extractor flagged as
`needs_ocr=True`. The rasterization runs in a `tempfile.TemporaryDirectory`
to honor the "no leftover files" contract.
"""

from __future__ import annotations

import logging
import tempfile
from pathlib import Path
from typing import TYPE_CHECKING

import pypdfium2 as pdfium
import pytesseract
from PIL import Image

from config.settings import Settings
from document_processing.cv.exceptions import OCRFailureError

if TYPE_CHECKING:
    from io import BytesIO

logger = logging.getLogger(__name__)


class OCRService:
    def __init__(self, settings: Settings) -> None:
        self._dpi = settings.cv_ocr_dpi
        self._min_chars = settings.cv_ocr_min_chars
        if settings.cv_tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = settings.cv_tesseract_cmd

    def ocr_pages(self, buffer: "BytesIO", page_numbers: list[int]) -> dict[int, str]:
        """Return `{page_number: text}` for the given 1-based page numbers."""
        if not page_numbers:
            return {}

        results: dict[int, str] = {}
        buffer.seek(0)
        try:
            pdf = pdfium.PdfDocument(buffer)
        except Exception as exc:
            raise OCRFailureError(
                "No se pudo rasterizar el PDF para OCR."
            ) from exc

        try:
            for page_number in page_numbers:
                try:
                    results[page_number] = self._ocr_single_page(pdf, page_number)
                except OCRFailureError as exc:
                    logger.warning(
                        "OCR falló en página %d: %s", page_number, exc
                    )
                    results[page_number] = ""
        finally:
            # PdfDocument holds an internal buffer reference; releasing it lets
            # the BytesIO backing it be garbage-collected promptly.
            try:
                pdf.close()
            except Exception:  # noqa: BLE001
                pass

        return results

    def _ocr_single_page(self, pdf: pdfium.PdfDocument, page_number: int) -> str:
        if page_number < 1 or page_number > len(pdf):
            raise OCRFailureError(f"Número de página fuera de rango: {page_number}")

        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            try:
                page = pdf[page_number - 1]
                bitmap = page.render(scale=self._dpi / 72.0)
                pil_image: Image.Image = bitmap.to_pil()
            except Exception as exc:
                raise OCRFailureError(
                    f"No se pudo renderizar la página {page_number}."
                ) from exc

            try:
                text = pytesseract.image_to_string(pil_image, lang="spa+eng")
            except Exception as exc:
                raise OCRFailureError(
                    f"Tesseract falló en la página {page_number}."
                ) from exc
            finally:
                try:
                    pil_image.close()
                except Exception:  # noqa: BLE001
                    pass
                del tmp_path  # silence linters; auto-cleaned on context exit

        text = (text or "").strip()
        if len(text) < self._min_chars:
            return ""
        return text
