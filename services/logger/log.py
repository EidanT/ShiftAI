import logging

from config.settings import Settings, get_settings


_FORMAT = "%(asctime)s %(levelname)s %(name)s %(message)s"


def _resolve_level(value: str) -> int:
    return logging.getLevelNamesMapping().get(value.upper(), logging.INFO)


def configure_logging(settings: Settings | None = None) -> None:
    active_settings = settings or get_settings()
    root_logger = logging.getLogger()
    root_logger.setLevel(_resolve_level(active_settings.service_log_level))

    if not root_logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter(_FORMAT))
        root_logger.addHandler(handler)

    logging.getLogger("uvicorn").setLevel(_resolve_level(active_settings.uvicorn_log_level))
    logging.getLogger("uvicorn.error").setLevel(
        _resolve_level(active_settings.uvicorn_error_log_level)
    )
    logging.getLogger("uvicorn.access").setLevel(
        _resolve_level(active_settings.uvicorn_access_log_level)
    )


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
