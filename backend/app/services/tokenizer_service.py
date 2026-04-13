"""
Tokenizer service: tokenizes text using HuggingFace tokenizers
and provides corpus-level token statistics.
"""
import logging
import re
from typing import List, Dict, Tuple
from collections import Counter

logger = logging.getLogger(__name__)

_tokenizer_cache: Dict[str, object] = {}

TOKENIZER_SPECS = {
    "bert": "bert-base-uncased",
    "gpt2": "gpt2",
    "roberta": "roberta-base",
}


def _load_tokenizer(model_key: str = "bert"):
    if model_key in _tokenizer_cache:
        return _tokenizer_cache[model_key]
    try:
        from transformers import AutoTokenizer
        spec = TOKENIZER_SPECS.get(model_key, "bert-base-uncased")
        logger.info(f"Loading tokenizer: {spec}")
        tok = AutoTokenizer.from_pretrained(spec)
        _tokenizer_cache[model_key] = tok
        return tok
    except Exception as e:
        logger.warning(f"Could not load tokenizer {model_key}: {e}")
        return None


def tokenize_text(text: str, model_key: str = "bert") -> Dict:
    """
    Returns token breakdown for a single text:
    - tokens: list of token strings
    - token_ids: list of token IDs
    - subword_map: which tokens are subwords
    - stats: count, unique count
    """
    tok = _load_tokenizer(model_key)
    if tok is None:
        # Fallback: simple whitespace tokenization
        tokens = text.lower().split()
        return {
            "tokens": tokens,
            "token_ids": list(range(len(tokens))),
            "is_subword": [False] * len(tokens),
            "original_text": text,
            "token_count": len(tokens),
            "unique_tokens": len(set(tokens)),
            "model_used": "whitespace-fallback",
        }

    encoded = tok(text, return_tensors=None, add_special_tokens=True)
    token_ids = encoded["input_ids"]
    tokens = tok.convert_ids_to_tokens(token_ids)

    # Mark subword tokens (start with ## for BERT, Ġ for GPT2/RoBERTa)
    is_subword = []
    for t in tokens:
        if t in ("[CLS]", "[SEP]", "<s>", "</s>", "<|endoftext|>"):
            is_subword.append(False)
        elif t.startswith("##") or (not t.startswith("Ġ") and t not in tok.all_special_tokens
                                     and len(is_subword) > 0 and not is_subword[-1]
                                     and model_key in ("gpt2", "roberta")):
            is_subword.append(True)
        else:
            is_subword.append(False)

    return {
        "tokens": tokens,
        "token_ids": token_ids,
        "is_subword": is_subword,
        "original_text": text,
        "token_count": len(tokens),
        "unique_tokens": len(set(tokens)),
        "model_used": TOKENIZER_SPECS.get(model_key, model_key),
    }


def corpus_token_stats(texts: List[str], model_key: str = "bert") -> Dict:
    """
    Compute corpus-level token statistics:
    - token_frequencies: top-N token counts
    - cooccurrence: token co-occurrence counts (top pairs)
    - vocab_size: unique tokens
    - total_tokens: total token count
    - avg_tokens_per_text: average
    """
    tok = _load_tokenizer(model_key)

    all_tokens: List[str] = []
    per_text_tokens: List[List[str]] = []

    if tok is None:
        for text in texts:
            tokens = re.findall(r'\b\w+\b', text.lower())
            per_text_tokens.append(tokens)
            all_tokens.extend(tokens)
    else:
        for text in texts:
            enc = tok(text, add_special_tokens=False)
            tokens = tok.convert_ids_to_tokens(enc["input_ids"])
            # Clean BERT subword markers for readability
            clean_tokens = [t.lstrip("##").lstrip("Ġ").lower() for t in tokens if t not in tok.all_special_tokens]
            per_text_tokens.append(clean_tokens)
            all_tokens.extend(clean_tokens)

    # Token frequencies (exclude very short tokens)
    freq = Counter(t for t in all_tokens if len(t) > 1)
    top_tokens = [{"token": t, "count": c} for t, c in freq.most_common(30)]

    # Co-occurrence within each text (window = full text for small texts)
    cooccur: Counter = Counter()
    for tokens in per_text_tokens:
        unique = list(set(t for t in tokens if len(t) > 1))
        for i in range(len(unique)):
            for j in range(i + 1, len(unique)):
                pair = tuple(sorted([unique[i], unique[j]]))
                cooccur[pair] += 1

    top_cooccur = [
        {"token_a": a, "token_b": b, "count": c}
        for (a, b), c in cooccur.most_common(40)
        if c > 1
    ]

    return {
        "token_frequencies": top_tokens,
        "cooccurrence": top_cooccur,
        "vocab_size": len(freq),
        "total_tokens": len(all_tokens),
        "avg_tokens_per_text": round(len(all_tokens) / max(len(texts), 1), 1),
        "model_used": TOKENIZER_SPECS.get(model_key, model_key),
    }
