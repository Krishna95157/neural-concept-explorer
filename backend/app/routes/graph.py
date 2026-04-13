import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

from app.services.graph_service import build_knowledge_graph, get_node_details
from app.services.embedding_service import generate_embeddings
from app.services.similarity_service import cosine_similarity_matrix, nearest_neighbors

router = APIRouter(prefix="/api/graph", tags=["graph"])

# In-memory cache for last-built graph (per-session)
_graph_cache: dict = {}


class GraphBuildRequest(BaseModel):
    texts: List[str] = Field(..., min_length=2)
    labels: Optional[List[str]] = None
    embed_model: str = "minilm"
    top_k: int = 5


class NodeDetailRequest(BaseModel):
    node_id: str
    top_k: int = 5


@router.post("/build")
async def build_graph(req: GraphBuildRequest):
    if len(req.texts) > 200:
        raise HTTPException(status_code=422, detail="Maximum 200 texts.")
    try:
        t0 = time.perf_counter()

        # Build graph
        graph_data = build_knowledge_graph(req.texts, labels=req.labels)

        # Generate entity embeddings for hybrid view
        if graph_data["nodes"]:
            node_texts = [n["label"] for n in graph_data["nodes"]]
            try:
                embs, _ = generate_embeddings(node_texts, req.embed_model)
                sim_matrix = cosine_similarity_matrix(embs)
                nn = nearest_neighbors(sim_matrix, node_texts, top_k=req.top_k)
                # Attach embedding neighbors to each node (by position)
                for i, node in enumerate(graph_data["nodes"]):
                    node["embedding_neighbors"] = nn.get(i, [])
            except Exception as e:
                for node in graph_data["nodes"]:
                    node["embedding_neighbors"] = []

        graph_data["timing"] = {"total_seconds": round(time.perf_counter() - t0, 3)}
        _graph_cache["latest"] = graph_data
        return graph_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/node-detail")
async def node_detail(req: NodeDetailRequest):
    graph = _graph_cache.get("latest")
    if not graph:
        raise HTTPException(status_code=404, detail="No graph built yet. Call /api/graph/build first.")
    try:
        return get_node_details(graph, req.node_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/latest")
async def get_latest_graph():
    graph = _graph_cache.get("latest")
    if not graph:
        raise HTTPException(status_code=404, detail="No graph built yet.")
    return graph
