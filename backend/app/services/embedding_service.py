"""
Embedding service: loads models once and generates embeddings.
Supports sentence-transformers (MiniLM, MPNet) and a GloVe-style
fallback using the lightweight gensim downloader or a numpy simulation.
"""
import time
import logging
import numpy as np
from typing import List, Tuple, Dict

logger = logging.getLogger(__name__)

# Global model cache so we load once per process
_model_cache: Dict[str, object] = {}

MODEL_SPECS = {
    "minilm": "sentence-transformers/all-MiniLM-L6-v2",
    "mpnet": "sentence-transformers/all-mpnet-base-v2",
}


def _load_sentence_transformer(model_key: str):
    if model_key in _model_cache:
        return _model_cache[model_key]
    from sentence_transformers import SentenceTransformer
    model_name = MODEL_SPECS[model_key]
    logger.info(f"Loading model {model_name} …")
    model = SentenceTransformer(model_name)
    _model_cache[model_key] = model
    logger.info(f"Model {model_name} loaded and cached.")
    return model


def _load_glove() -> Dict[str, np.ndarray]:
    """
    Load GloVe 50-d vectors via gensim downloader.
    Falls back to random deterministic embeddings when offline.
    """
    if "glove" in _model_cache:
        return _model_cache["glove"]
    try:
        import gensim.downloader as api
        logger.info("Downloading GloVe-wiki-gigaword-50 …")
        model = api.load("glove-wiki-gigaword-50")
        _model_cache["glove"] = model
        logger.info("GloVe loaded.")
        return model
    except Exception as exc:
        logger.warning(f"GloVe download failed ({exc}). Using fallback random embeddings.")
        _model_cache["glove"] = None
        return None


def _glove_embed(texts: List[str]) -> np.ndarray:
    """
    Embed texts with GloVe (average word vectors).
    Falls back to reproducible random vectors if GloVe unavailable.
    """
    model = _load_glove()
    if model is None:
        # Deterministic fallback: hash-based pseudo-random 50-d vectors
        rng = np.random.default_rng(42)
        vectors = []
        for text in texts:
            seed = abs(hash(text)) % (2**31)
            local_rng = np.random.default_rng(seed)
            vectors.append(local_rng.standard_normal(50))
        return np.array(vectors, dtype=np.float32)

    def embed_one(text: str) -> np.ndarray:
        tokens = text.lower().split()
        vecs = [model[t] for t in tokens if t in model]
        if vecs:
            return np.mean(vecs, axis=0).astype(np.float32)
        return np.zeros(model.vector_size, dtype=np.float32)

    return np.array([embed_one(t) for t in texts])


def generate_embeddings(texts: List[str], model_key: str) -> Tuple[np.ndarray, float]:
    """
    Returns (embeddings_matrix, elapsed_seconds).
    embeddings_matrix shape: (N, D)
    """
    t0 = time.perf_counter()
    if model_key in ("minilm", "mpnet"):
        model = _load_sentence_transformer(model_key)
        embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
    elif model_key == "glove":
        embeddings = _glove_embed(texts)
    else:
        raise ValueError(f"Unknown model key: {model_key}")
    elapsed = time.perf_counter() - t0
    return embeddings.astype(np.float32), round(elapsed, 3)


def preload_default_model():
    """Called at startup to warm the primary model."""
    try:
        _load_sentence_transformer("minilm")
    except Exception as e:
        logger.warning(f"Could not preload MiniLM: {e}")


def loaded_models() -> List[str]:
    return list(_model_cache.keys())
