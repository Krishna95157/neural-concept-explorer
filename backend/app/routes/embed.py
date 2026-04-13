from fastapi import APIRouter, HTTPException
from app.models.schemas import EmbedRequest, EmbedResponse, CompareRequest, CompareResponse
from app.services.pipeline_service import run_pipeline

router = APIRouter(prefix="/api", tags=["embeddings"])


@router.post("/embed", response_model=EmbedResponse)
async def embed_texts(req: EmbedRequest):
    if len(req.texts) < 2:
        raise HTTPException(status_code=422, detail="At least 2 texts required.")
    if len(req.texts) > 200:
        raise HTTPException(status_code=422, detail="Maximum 200 texts per request.")

    try:
        result = run_pipeline(
            texts=req.texts,
            model_key=req.model,
            reduction=req.reduction,
            dimensions=req.dimensions,
            labels=req.labels,
            categories=req.categories,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compare", response_model=CompareResponse)
async def compare_models(req: CompareRequest):
    if len(req.texts) < 2:
        raise HTTPException(status_code=422, detail="At least 2 texts required.")
    if not req.models:
        raise HTTPException(status_code=422, detail="At least one model must be specified.")

    results = {}
    for model_key in req.models:
        try:
            result = run_pipeline(
                texts=req.texts,
                model_key=model_key,
                reduction=req.reduction,
                dimensions=req.dimensions,
                labels=req.labels,
                categories=req.categories,
            )
            results[model_key] = result.dict()
        except Exception as e:
            results[model_key] = {"error": str(e)}

    return CompareResponse(results=results)
