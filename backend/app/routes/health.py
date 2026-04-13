from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.services.embedding_service import loaded_models

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="ok", models_loaded=loaded_models())
