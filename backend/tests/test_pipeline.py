"""
Unit + integration tests for the pipeline services.
Run: pytest tests/ -v  (from the backend/ directory)
"""
import numpy as np
import pytest

from app.services.similarity_service import (
    cosine_similarity_matrix,
    nearest_neighbors,
    cluster_embeddings,
)
from app.services.reduction_service import reduce_embeddings


# ---------- similarity ---------------------------------------------------------

def test_cosine_similarity_identical():
    v = np.array([[1.0, 0.0, 0.0], [1.0, 0.0, 0.0]], dtype=np.float32)
    sim = cosine_similarity_matrix(v)
    assert abs(sim[0, 1] - 1.0) < 1e-5


def test_cosine_similarity_orthogonal():
    v = np.array([[1.0, 0.0], [0.0, 1.0]], dtype=np.float32)
    sim = cosine_similarity_matrix(v)
    assert abs(sim[0, 1]) < 1e-5


def test_nearest_neighbors_top1():
    texts = ["a", "b", "c"]
    sim = np.array([[1.0, 0.9, 0.2],
                    [0.9, 1.0, 0.3],
                    [0.2, 0.3, 1.0]])
    nn = nearest_neighbors(sim, texts, top_k=1)
    assert nn[0][0]["id"] == 1
    assert nn[1][0]["id"] == 0


def test_cluster_output_length():
    rng = np.random.default_rng(0)
    emb = rng.standard_normal((20, 50)).astype(np.float32)
    labels = cluster_embeddings(emb, n_clusters=4)
    assert len(labels) == 20
    assert all(isinstance(l, int) for l in labels)


# ---------- reduction ---------------------------------------------------------

def test_pca_output_shape():
    rng = np.random.default_rng(1)
    emb = rng.standard_normal((15, 128)).astype(np.float32)
    coords, _ = reduce_embeddings(emb, "pca", n_components=2)
    assert coords.shape == (15, 2)


def test_tsne_output_shape():
    rng = np.random.default_rng(2)
    emb = rng.standard_normal((12, 64)).astype(np.float32)
    coords, _ = reduce_embeddings(emb, "tsne", n_components=2)
    assert coords.shape == (12, 2)
