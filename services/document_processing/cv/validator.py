from io import BytesIO

from pypdf import PdfReader

from config.settings import Settings
from document_processing.cv.exceptions import (
    InvalidPDFError,
    PDFTooLargeError,
    PDFTooManyPagesError,
    UnsupportedContentTypeError,
)

PDF_SIGNATURE = b"%PDF-"


class PDFSignatureValidator:
    def validate(self, buffer: BytesIO) -> None:
        buffer.seek(0)
        head = buffer.read(5)
        if head != PDF_SIGNATURE:
            raise InvalidPDFError("El archivo no parece ser un PDF válido.")


class SizeValidator:
    def __init__(self, settings: Settings) -> None:
        self._max = settings.cv_max_size_bytes

    def validate(self, size_bytes: int) -> None:
        if size_bytes > self._max:
            raise PDFTooLargeError(
                f"El PDF excede el tamaño máximo permitido ({self._max} bytes)."
            )


class ContentTypeValidator:
    _ALLOWED = {"application/pdf"}

    def validate(self, content_type: str | None) -> None:
        if content_type is None:
            return
        if content_type.lower() not in self._ALLOWED:
            raise UnsupportedContentTypeError(
                f"Content-Type no soportado: {content_type}."
            )


class PageCountValidator:
    def __init__(self, settings: Settings) -> None:
        self._max = settings.cv_max_pages

    def validate(self, buffer: BytesIO) -> None:
        buffer.seek(0)
        try:
            reader = PdfReader(buffer, strict=False)
            total = len(reader.pages)
        except Exception as exc:
            raise InvalidPDFError(
                "No se pudo leer el PDF para contar páginas."
            ) from exc

        if total > self._max:
            raise PDFTooManyPagesError(
                f"El PDF tiene {total} páginas; el máximo es {self._max}."
            )
