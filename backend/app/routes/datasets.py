from fastapi import APIRouter, HTTPException
from app.data.sample_datasets import list_datasets, get_dataset

router = APIRouter(prefix="/api", tags=["datasets"])


@router.get("/datasets")
async def get_all_datasets():
    return list_datasets()


@router.get("/datasets/{name}")
async def get_one_dataset(name: str):
    ds = get_dataset(name)
    if ds is None:
        raise HTTPException(status_code=404, detail=f"Dataset '{name}' not found.")
    return ds
