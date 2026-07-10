class CVProcessingError(Exception):
    """Base error for all CV processing failures."""


class CVInputError(CVProcessingError):
    """Caller-supplied input is invalid. Maps to HTTP 400."""


class CVInternalError(CVProcessingError):
    """Internal failure. Maps to HTTP 500/502."""


# Input errors
class InvalidPDFError(CVInputError):
    pass


class PDFTooLargeError(CVInputError):
    pass


class PDFTooManyPagesError(CVInputError):
    pass


class UnsupportedContentTypeError(CVInputError):
    pass


class CorruptedPDFError(CVInputError):
    pass


# Internal errors
class OCRFailureError(CVInternalError):
    pass


class LLMUnavailableError(CVInternalError):
    pass
