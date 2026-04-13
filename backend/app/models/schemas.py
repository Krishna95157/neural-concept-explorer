from pydantic import BaseModel, Field
from typing import List, Optional, Literal


class EmbedRequest(BaseModel):
    texts: List[str] = Field(..., min_length=1, max_length=200)
    model: Literal["minilm", "mpnet", "glove"] = "minilm"
    reduction: Literal["pca", "tsne", "umap"] = "pca"
    dimensions: Literal[2, 3] = 2
    labels: Optional[List[str]] = None
    categories: Optional[List[str]] = None


class PointData(BaseModel):
    id: int
    text: str
    x: float
    y: float
    z: Optional[float] = None
    label: Optional[str] = None
    category: Optional[str] = None
    cluster: Optional[int] = None


class NearestNeighbor(BaseModel):
    id: int
    text: str
    similarity: float


class EmbedResponse(BaseModel):
    points: List[PointData]
    similarity_matrix: List[List[float]]
    nearest_neighbors: dict  # id -> List[NearestNeighbor]
    cluster_labels: Optional[List[int]] = None
    model_used: str
    reduction_used: str
    dimensions: int
    timing: dict


class CompareRequest(BaseModel):
    texts: List[str] = Field(..., min_length=1, max_length=100)
    models: List[Literal["minilm", "mpnet", "glove"]] = ["minilm", "glove"]
    reduction: Literal["pca", "tsne", "umap"] = "pca"
    dimensions: Literal[2, 3] = 2
    labels: Optional[List[str]] = None
    categories: Optional[List[str]] = None


class CompareResponse(BaseModel):
    results: dict  # model_name -> EmbedResponse


class HealthResponse(BaseModel):
    status: str
    models_loaded: List[str]
