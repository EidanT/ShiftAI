"""Pipeline orchestrator for CV processing.

The service holds a small, fixed graph:

    validators -> extractor -> cleaner -> ocr (conditional) -> converter

It is constructed once and reused across requests; the only per-request state
is the uploaded file and the resulting `CVProcessResult`.
"""

from __future__ import annotations

import logging
import time
from io import BytesIO

from fastapi import UploadFile

from config.settings import Settings
from document_processing.cv.cleaner import CVCleaner
from document_processing.cv.converter import MarkdownConverter
from document_processing.cv.exceptions import (
    CorruptedPDFError,
    InvalidPDFError,
)
from document_processing.cv.extractor import TextExtractor
from document_processing.cv.ocr import OCRService
from document_processing.cv.schemas import CVExtractionResult, CVPage, CVProcessResult
from document_processing.cv.validator import (
    ContentTypeValidator,
    PageCountValidator,
    PDFSignatureValidator,
    SizeValidator,
)

logger = logging.getLogger(__name__)


class CVProcessingService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._size = SizeValidator(settings)
        self._content_type = ContentTypeValidator()
        self._signature = PDFSignatureValidator()
        self._pages = PageCountValidator(settings)
        self._extractor = TextExtractor(settings)
        self._ocr = OCRService(settings)
        self._cleaner = CVCleaner()
        self._converter = MarkdownConverter()

    async def process_pdf(
        self,
        file: UploadFile,
        *,
        route: str = "process",
    ) -> CVProcessResult:
        started = time.perf_counter()
        filename = file.filename or "uploaded.pdf"

        try:
            buffer = await self._read_into_memory(file)
        finally:
            await file.close()

    
        self._size.validate(len(buffer.getvalue()))
        self._content_type.validate(file.content_type)
        self._signature.validate(buffer)
        self._pages.validate(buffer)

        extraction = self._extractor.extract(buffer)

       
        if extraction.used_ocr_pages:
            ocr_text = self._ocr.ocr_pages(buffer, extraction.used_ocr_pages)
            extraction = self._apply_ocr(extraction, ocr_text)


        if not any(page.char_count > 0 for page in extraction.pages):
            raise CorruptedPDFError(
                "El PDF no contiene texto extraíble ni siquiera tras OCR."
            )

    
        cleaned_pages = []
        for page in extraction.pages:
            cleaned_pages.append(
                CVPage(
                    page_number=page.page_number,
                    text=self._cleaner.clean(page.text),
                    needs_ocr=page.needs_ocr,
                    char_count=len(self._cleaner.clean(page.text)),
                )
            )
        cleaned_extraction = CVExtractionResult(
            pages=cleaned_pages,
            total_pages=extraction.total_pages,
            used_ocr_pages=extraction.used_ocr_pages,
        )

        result = self._converter.to_markdown(
            cleaned_extraction,
            filename=filename,
            content_type=file.content_type,
        )

        elapsed_ms = int((time.perf_counter() - started) * 1000)
        logger.info(
            "cv.%s ok",
            route,
            extra={
                "cv_filename": filename,
                "cv_size_bytes": len(buffer.getvalue()),
                "cv_total_pages": result.total_pages,
                "cv_used_ocr_pages": result.used_ocr_pages,
                "cv_elapsed_ms": elapsed_ms,
                "cv_route": route,
            },
        )
        return result

    @staticmethod
    async def _read_into_memory(file: UploadFile) -> BytesIO:
        data = await file.read()
        if not data:
            raise InvalidPDFError("El archivo está vacío.")
        return BytesIO(data)

    @staticmethod
    def _apply_ocr(
        extraction: CVExtractionResult,
        ocr_text: dict[int, str],
    ) -> CVExtractionResult:
        merged: list[CVPage] = []
        for page in extraction.pages:
            if page.page_number in ocr_text:
                ocr_value = ocr_text[page.page_number]
                if ocr_value:
                    merged.append(
                        CVPage(
                            page_number=page.page_number,
                            text=ocr_value,
                            needs_ocr=True,
                            char_count=len(ocr_value),
                        )
                    )
                    continue
            merged.append(page)
        return CVExtractionResult(
            pages=merged,
            total_pages=extraction.total_pages,
            used_ocr_pages=extraction.used_ocr_pages,
        )
