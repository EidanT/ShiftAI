"""FastAPI application entry point.

The service exposes:
- `GET  /health`              – liveness probe
- `POST /v1/cv/process`       – PDF -> Markdown
- `POST /v1/cv/summarize`     – PDF -> LLM summary
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.requests import Request

from config.settings import get_settings
from logger import configure_logging, get_logger
from registry import build_provider
from router.v1.cv import router as cv_router

settings = get_settings()
configure_logging(settings)
logger = get_logger(__name__)

app = FastAPI(
    title="ShiftAI Services",
    version="0.1.0",
    description="CV PDF processing and LLM orchestration.",
)


app.state.provider = build_provider(settings)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cv_router, prefix="/v1/cv", tags=["cv"])


@app.on_event("startup")
async def log_service_ready() -> None:
    logger.info(
        "service.ready host=%s port=%s service_level=%s uvicorn_level=%s uvicorn_error_level=%s uvicorn_access_log_level=%s",
        settings.service_host,
        settings.service_port,
        settings.service_log_level,
        settings.uvicorn_log_level,
        settings.uvicorn_error_log_level,
        settings.uvicorn_access_log_level,
    )


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
   
    return JSONResponse(
        status_code=422,
        content={"detail": "Parámetros inválidos en la solicitud.", "errors": exc.errors()},
    )
