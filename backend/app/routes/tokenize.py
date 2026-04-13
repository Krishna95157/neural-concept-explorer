from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Literal

from app.services.tokenizer_service import tokenize_text, corpus_token_stats

router = APIRouter(prefix="/api/tokens", tags=["tokens"])


class TokenizeRequest(BaseModel):
    text: str = Field(..., min_length=1)
    model: Literal["bert", "gpt2", "roberta"] = "bert"


class CorpusStatsRequest(BaseModel):
    texts: List[str] = Field(..., min_length=1)
    model: Literal["bert", "gpt2", "roberta"] = "bert"


@router.post("/tokenize")
async def tokenize(req: TokenizeRequest):
    try:
        return tokenize_text(req.text, req.model)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/corpus-stats")
async def corpus_statistics(req: CorpusStatsRequest):
    if len(req.texts) > 200:
        raise HTTPException(status_code=422, detail="Maximum 200 texts.")
    try:
        return corpus_token_stats(req.texts, req.model)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
