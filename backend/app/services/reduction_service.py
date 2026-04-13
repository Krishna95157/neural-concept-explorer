"""
Dimensionality reduction service.
Supports PCA, t-SNE, and UMAP (graceful fallback when umap-learn absent).
"""
import time
import logging
import numpy as np
from typing import Tuple, Literal

logger = logging.getLogger(__name__)


def reduce_embeddings(
    embeddings: np.ndarray,
    method: Literal["pca", "tsne", "umap"],
    n_components: int = 2,
) -> Tuple[np.ndarray, float]:
    """
    Returns (reduced_coords, elapsed_seconds).
    reduced_coords shape: (N, n_components)
    """
    n_samples = embeddings.shape[0]
    t0 = time.perf_counter()

    if method == "pca":
        coords = _pca(embeddings, n_components)
    elif method == "tsne":
        coords = _tsne(embeddings, n_components, n_samples)
    elif method == "umap":
        coords = _umap(embeddings, n_components)
    else:
        raise ValueError(f"Unknown reduction method: {method}")

    elapsed = time.perf_counter() - t0
    return coords.astype(np.float64), round(elapsed, 3)


def _pca(embeddings: np.ndarray, n_components: int) -> np.ndarray:
    from sklearn.decomposition import PCA
    n_comp = min(n_components, embeddings.shape[0], embeddings.shape[1])
    pca = PCA(n_components=n_comp, random_state=42)
    coords = pca.fit_transform(embeddings)
    if coords.shape[1] < n_components:
        # Pad with zeros if fewer dimensions than requested
        pad = np.zeros((coords.shape[0], n_components - coords.shape[1]))
        coords = np.hstack([coords, pad])
    return coords


def _tsne(embeddings: np.ndarray, n_components: int, n_samples: int) -> np.ndarray:
    from sklearn.manifold import TSNE
    perplexity = min(30, max(5, n_samples - 1))
    tsne = TSNE(
        n_components=n_components,
        perplexity=perplexity,
        random_state=42,
        n_iter=1000,
        learning_rate="auto",
        init="pca",
    )
    return tsne.fit_transform(embeddings)


def _umap(embeddings: np.ndarray, n_components: int) -> np.ndarray:
    try:
        import umap
        reducer = umap.UMAP(n_components=n_components, random_state=42)
        return reducer.fit_transform(embeddings)
    except ImportError:
        logger.warning("umap-learn not installed; falling back to t-SNE for UMAP request.")
        return _tsne(embeddings, n_components, embeddings.shape[0])
