from fastapi import APIRouter

from router.v1 import chat, greet, health

api_router = APIRouter()

api_router.include_router(
    health.router,
    prefix="/health",
    tags=["health"],
)

api_router.include_router(
    greet.router,
    prefix="/greet",
    tags=["greet"],
)

api_router.include_router(
    chat.router,
    prefix="/chat",
    tags=["chat"],
)