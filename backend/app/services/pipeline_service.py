"""
Pipeline service: orchestrates embedding → reduction → similarity → clustering.
"""
import time
from typing import List, Optional
import numpy as np

from app.services.embedding_service import generate_embeddings
from app.services.reduction_service import reduce_embeddings
from app.services.similarity_service import (
    cosine_similarity_matrix,
    nearest_neighbors,
    cluster_embeddings,
)
from app.models.schemas import EmbedResponse, PointData, NearestNeighbor


def run_pipeline(
    texts: List[str],
    model_key: str,
    reduction: str,
    dimensions: int,
    labels: Optional[List[str]] = None,
    categories: Optional[List[str]] = None,
    top_k: int = 5,
    do_cluster: bool = True,
    n_clusters: int = 5,
) -> EmbedResponse:
    t_total = time.perf_counter()

    # 1. Generate embeddings
    embeddings, t_embed = generate_embeddings(texts, model_key)

    # 2. Similarity matrix
    sim_matrix = cosine_similarity_matrix(embeddings)

    # 3. Nearest neighbors
    nn_raw = nearest_neighbors(sim_matrix, texts, top_k=top_k)

    # 4. Dimensionality reduction
    coords, t_reduce = reduce_embeddings(embeddings, reduction, n_components=dimensions)

    # 5. Clustering
    cluster_ids = None
    if do_cluster and len(texts) >= 4:
        cluster_ids = cluster_embeddings(embeddings, n_clusters=n_clusters)

    # Build response points
    points = []
    for i, text in enumerate(texts):
        p = PointData(
            id=i,
            text=text,
            x=float(coords[i, 0]),
            y=float(coords[i, 1]),
            z=float(coords[i, 2]) if dimensions == 3 else None,
            label=labels[i] if labels else None,
            category=categories[i] if categories else None,
            cluster=cluster_ids[i] if cluster_ids else None,
        )
        points.append(p)

    # Convert nn_raw to serialisable dicts
    nn_serialisable = {
        str(k): [NearestNeighbor(**item) for item in v]
        for k, v in nn_raw.items()
    }

    t_total_elapsed = round(time.perf_counter() - t_total, 3)

    return EmbedResponse(
        points=points,
        similarity_matrix=sim_matrix.tolist(),
        nearest_neighbors={k: [n.dict() for n in v] for k, v in nn_serialisable.items()},
        cluster_labels=cluster_ids,
        model_used=model_key,
        reduction_used=reduction,
        dimensions=dimensions,
        timing={
            "embedding_seconds": t_embed,
            "reduction_seconds": t_reduce,
            "total_seconds": t_total_elapsed,
        },
    )
