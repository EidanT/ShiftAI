"""FastAPI application entry point.

The service exposes:
- `GET  /health`              – liveness probe
- `POST /v1/cv/process`       – PDF -> Markdown
- `POST /v1/cv/summarize`     – PDF -> LLM summary
"""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.requests import Request

from config.settings import get_settings
from registry import build_provider
from router.v1.cv import router as cv_router

logger = logging.getLogger(__name__)

settings = get_settings()

logging.basicConfig(
    level=settings.service_log_level,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)

app = FastAPI(
    title="ShiftAI Services",
    version="0.1.0",
    description="CV PDF processing and LLM orchestration.",
)


app.state.provider = build_provider(settings)

app.include_router(cv_router, prefix="/v1/cv", tags=["cv"])


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
