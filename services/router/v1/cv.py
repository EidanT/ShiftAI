"""HTTP endpoints for CV processing."""

from __future__ import annotations

import asyncio
import logging

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from fastapi.responses import JSONResponse

from config.settings import Settings, get_settings
from document_processing.cv.exceptions import (
    CVInputError,
    CVInternalError,
    LLMUnavailableError,
    OCRFailureError,
)
from document_processing.cv.schemas import CVProcessResult, CVSummarizeResult
from document_processing.cv.service import CVProcessingService
from llm.services import LLMService

logger = logging.getLogger(__name__)

router = APIRouter()


def get_processing_service(
    settings: Settings = Depends(get_settings),
) -> CVProcessingService:
    return CVProcessingService(settings)


def get_llm_service(
    request: Request,
    settings: Settings = Depends(get_settings),
) -> LLMService:
    provider = request.app.state.provider
    default_model = settings.llm_model or provider.config.default_model

    if not default_model:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No hay modelo configurado (LLM_MODEL).",
        )

    return LLMService(
        provider,
        default_model=default_model,
        temperature=settings.llm_temperature,
        max_tokens=settings.llm_max_tokens,
    )


@router.post(
    "/process",
    response_model=CVProcessResult,
    summary="Extrae el texto de un CV en PDF y lo devuelve en Markdown.",
)
async def process_cv(
    file: UploadFile = File(..., description="PDF del CV (≤ 15 MB, ≤ 200 páginas)."),
    settings: Settings = Depends(get_settings),
    service: CVProcessingService = Depends(get_processing_service),
) -> CVProcessResult:
    try:
        return await asyncio.wait_for(
            service.process_pdf(file, route="process"),
            timeout=settings.cv_request_timeout_seconds,
        )
    except CVInputError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except OCRFailureError as exc:
        logger.warning("cv.process OCR failure: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Falló el OCR sobre el documento."},
        )
    except CVInternalError as exc:
        logger.exception("cv.process internal error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno procesando el CV.",
        ) from exc
    except asyncio.TimeoutError as exc:
        logger.warning("cv.process timeout")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="La solicitud excedió el tiempo máximo de procesamiento.",
        ) from exc


@router.post(
    "/summarize",
    response_model=CVSummarizeResult,
    summary="Procesa un CV y devuelve un resumen en lenguaje natural.",
)
async def summarize_cv(
    request: Request,
    file: UploadFile = File(..., description="PDF del CV (≤ 15 MB, ≤ 200 páginas)."),
    settings: Settings = Depends(get_settings),
    service: CVProcessingService = Depends(get_processing_service),
) -> CVSummarizeResult:
    try:
        processed = await asyncio.wait_for(
            service.process_pdf(file, route="summarize"),
            timeout=settings.cv_request_timeout_seconds,
        )
    except CVInputError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except CVInternalError as exc:
        logger.exception("cv.summarize internal error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno procesando el CV.",
        ) from exc
    except asyncio.TimeoutError as exc:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="La solicitud excedió el tiempo máximo de procesamiento.",
        ) from exc

    try:
        llm_service = get_llm_service(request=request, settings=settings)
        response = await llm_service.summarize(processed.markdown)
    except LLMUnavailableError as exc:
        logger.warning("cv.summarize LLM unavailable: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="El servicio de LLM no está disponible.",
        ) from exc

    return CVSummarizeResult(
        filename=processed.filename,
        summary=response.content,
        model=response.model,
        provider=response.provider,
    )
