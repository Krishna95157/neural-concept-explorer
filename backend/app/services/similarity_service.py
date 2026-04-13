"""
Similarity service: cosine similarity matrix, nearest-neighbor extraction,
and KMeans clustering.
"""
import numpy as np
from typing import List, Dict, Tuple


def cosine_similarity_matrix(embeddings: np.ndarray) -> np.ndarray:
    """
    Compute pairwise cosine similarity. Returns (N, N) matrix with values in [-1, 1].
    """
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1e-10, norms)
    normalized = embeddings / norms
    sim = normalized @ normalized.T
    # Clip for numerical safety
    return np.clip(sim, -1.0, 1.0)


def nearest_neighbors(
    similarity_matrix: np.ndarray,
    texts: List[str],
    top_k: int = 5,
) -> Dict[int, List[dict]]:
    """
    For each point, return its top_k most similar neighbors (excluding itself).
    Returns: { index: [{"id": int, "text": str, "similarity": float}, ...] }
    """
    n = similarity_matrix.shape[0]
    result = {}
    for i in range(n):
        row = similarity_matrix[i].copy()
        row[i] = -2.0  # exclude self
        top_indices = np.argsort(row)[::-1][:top_k]
        result[i] = [
            {"id": int(j), "text": texts[j], "similarity": float(row[j])}
            for j in top_indices
        ]
    return result


def cluster_embeddings(embeddings: np.ndarray, n_clusters: int = 5) -> List[int]:
    """
    Run KMeans and return per-point cluster labels.
    Automatically caps n_clusters to N-1 if the dataset is small.
    """
    from sklearn.cluster import KMeans
    n = embeddings.shape[0]
    k = min(n_clusters, max(2, n - 1))
    km = KMeans(n_clusters=k, random_state=42, n_init="auto")
    labels = km.fit_predict(embeddings)
    return [int(x) for x in labels]
