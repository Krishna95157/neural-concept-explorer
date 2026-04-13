"""
Knowledge Graph service:
- Rule-based + spaCy entity extraction
- Relation extraction via sentence patterns
- NetworkX graph construction
- Graph analytics (centrality, communities)
"""
import re
import logging
import json
from typing import List, Dict, Tuple, Optional
from collections import defaultdict

import networkx as nx
import numpy as np

logger = logging.getLogger(__name__)

# ─── AI / ML Domain Entity Dictionary ────────────────────────────────────────
AI_ENTITIES: Dict[str, str] = {
    # Models
    "transformer": "model", "transformers": "model",
    "bert": "model", "gpt": "model", "gpt-2": "model", "gpt-3": "model",
    "gpt-4": "model", "llm": "model", "llms": "model",
    "t5": "model", "roberta": "model", "xlnet": "model", "llama": "model",
    "mistral": "model", "gemini": "model", "claude": "model",
    "minilm": "model", "mpnet": "model",
    # Concepts / Techniques
    "attention": "concept", "self-attention": "concept",
    "embedding": "concept", "embeddings": "concept",
    "tokenization": "concept", "tokenizer": "concept", "tokens": "concept",
    "fine-tuning": "technique", "fine tuning": "technique",
    "pre-training": "technique", "pretraining": "technique",
    "backpropagation": "technique", "backprop": "technique",
    "gradient descent": "technique", "adam": "technique",
    "dropout": "technique", "batch normalization": "technique",
    "layer normalization": "technique",
    "knowledge graph": "concept", "knowledge graphs": "concept",
    "vector database": "tool", "vector databases": "tool",
    "rag": "technique", "retrieval augmented generation": "technique",
    "retrieval": "technique",
    "pca": "technique", "t-sne": "technique", "tsne": "technique",
    "umap": "technique",
    "cosine similarity": "concept", "similarity": "concept",
    "clustering": "technique", "kmeans": "technique",
    "neural network": "concept", "neural networks": "concept",
    "deep learning": "concept", "machine learning": "concept",
    "reinforcement learning": "concept",
    "supervised learning": "concept", "unsupervised learning": "concept",
    "cnn": "model", "convolutional neural network": "model",
    "rnn": "model", "lstm": "model", "gru": "model",
    "vit": "model", "vision transformer": "model",
    "yolo": "model",
    "diffusion": "concept", "diffusion model": "model",
    "gan": "model", "generative adversarial network": "model",
    "vae": "model", "variational autoencoder": "model",
    # Datasets / Benchmarks
    "imagenet": "dataset", "squad": "dataset", "glue": "dataset",
    "mnli": "dataset", "coco": "dataset",
    # Tools / Frameworks
    "pytorch": "tool", "tensorflow": "tool", "keras": "tool",
    "hugging face": "tool", "huggingface": "tool",
    "spacy": "tool", "nltk": "tool",
    "langchain": "tool", "llamaindex": "tool",
    "pinecone": "tool", "weaviate": "tool", "chromadb": "tool",
    "faiss": "tool",
    "openai": "company", "anthropic": "company", "google": "company",
    "meta": "company", "microsoft": "company",
    # Tasks
    "classification": "task", "regression": "task",
    "named entity recognition": "task", "ner": "task",
    "question answering": "task", "text generation": "task",
    "summarization": "task", "translation": "task",
    "sentiment analysis": "task", "object detection": "task",
    "image segmentation": "task",
    # Components
    "encoder": "component", "decoder": "component",
    "feedforward": "component", "mlp": "component",
    "residual connection": "component", "positional encoding": "component",
    "layer": "component", "head": "component", "weights": "component",
    "loss function": "component", "activation function": "component",
    "relu": "component", "softmax": "component", "sigmoid": "component",
    "overfitting": "concept", "underfitting": "concept",
    "regularization": "technique",
    "cross-entropy": "concept", "perplexity": "concept",
}

# Relation patterns: (pattern, relation_label)
RELATION_PATTERNS: List[Tuple[re.Pattern, str]] = [
    (re.compile(r'(\w[\w\s-]+)\s+(?:uses?|utilises?|employs?)\s+(\w[\w\s-]+)', re.I), "uses"),
    (re.compile(r'(\w[\w\s-]+)\s+(?:is\s+(?:a|an|based on|built on|part of|type of))\s+(\w[\w\s-]+)', re.I), "is_a"),
    (re.compile(r'(\w[\w\s-]+)\s+(?:improves?|enhances?|extends?)\s+(\w[\w\s-]+)', re.I), "improves"),
    (re.compile(r'(\w[\w\s-]+)\s+(?:combines?|integrates?|merges?)\s+(\w[\w\s-]+)', re.I), "combines"),
    (re.compile(r'(\w[\w\s-]+)\s+(?:trains?(?:\s+on)?|fine-tunes?\s+on)\s+(\w[\w\s-]+)', re.I), "trained_on"),
    (re.compile(r'(\w[\w\s-]+)\s+(?:achieves?|reaches?)\s+(?:state-of-the-art|sota|best)\s+(?:on|results?)', re.I), "achieves_sota"),
    (re.compile(r'(\w[\w\s-]+)\s+(?:requires?|needs?)\s+(\w[\w\s-]+)', re.I), "requires"),
    (re.compile(r'(\w[\w\s-]+)\s+(?:produces?|generates?|outputs?)\s+(\w[\w\s-]+)', re.I), "produces"),
    (re.compile(r'(\w[\w\s-]+)\s+(?:(?:is\s+)?introduced?\s+(?:in|by)|proposed\s+by)\s+(\w[\w\s-]+)', re.I), "introduced_by"),
    (re.compile(r'(\w[\w\s-]+)\s+(?:replaces?|supersedes?)\s+(\w[\w\s-]+)', re.I), "replaces"),
    (re.compile(r'(\w[\w\s-]+)\s+(?:(?:is\s+)?applied\s+(?:to|in)|used\s+for)\s+(\w[\w\s-]+)', re.I), "applied_to"),
]

ENTITY_COLORS = {
    "model": "#4f6cf5",
    "concept": "#10b981",
    "technique": "#f59e0b",
    "tool": "#8b5cf6",
    "dataset": "#ef4444",
    "task": "#06b6d4",
    "component": "#6b7280",
    "company": "#f97316",
    "other": "#9ca3af",
}


def _normalize(text: str) -> str:
    """Normalize entity text for matching."""
    return re.sub(r'\s+', ' ', text.lower().strip())


def _extract_entities_from_text(text: str) -> List[Dict]:
    """Extract known AI entities from a text string."""
    text_lower = text.lower()
    found = []
    seen_spans = set()

    # Sort by length (longest first) to prefer longer matches
    sorted_entities = sorted(AI_ENTITIES.items(), key=lambda x: len(x[0]), reverse=True)

    for entity_text, entity_type in sorted_entities:
        pattern = re.compile(r'\b' + re.escape(entity_text) + r'\b', re.I)
        for m in pattern.finditer(text_lower):
            span = (m.start(), m.end())
            # Check no overlap with already-found spans
            if not any(s[0] <= span[0] < s[1] or span[0] <= s[0] < span[1] for s in seen_spans):
                seen_spans.add(span)
                found.append({
                    "text": entity_text,
                    "normalized": _normalize(entity_text),
                    "type": entity_type,
                    "start": m.start(),
                    "end": m.end(),
                })

    # Try spaCy for extra named entities (models, organizations)
    try:
        import spacy
        try:
            nlp = spacy.load("en_core_web_sm")
            doc = nlp(text)
            for ent in doc.ents:
                norm = _normalize(ent.text)
                if norm not in AI_ENTITIES and norm not in [f["normalized"] for f in found]:
                    if ent.label_ in ("ORG", "PRODUCT", "WORK_OF_ART", "EVENT"):
                        span = (ent.start_char, ent.end_char)
                        if not any(s[0] <= span[0] < s[1] for s in seen_spans):
                            found.append({
                                "text": ent.text,
                                "normalized": norm,
                                "type": "other",
                                "start": ent.start_char,
                                "end": ent.end_char,
                            })
        except Exception:
            pass
    except ImportError:
        pass

    return found


def _extract_relations(text: str, entity_norms: set) -> List[Dict]:
    """Extract relations between entities in a sentence."""
    relations = []
    sentences = re.split(r'[.!?]+', text)

    for sent in sentences:
        sent = sent.strip()
        if len(sent) < 10:
            continue
        for pattern, rel_label in RELATION_PATTERNS:
            for m in pattern.finditer(sent):
                try:
                    src = _normalize(m.group(1))
                    tgt = _normalize(m.group(2))

                    # Resolve to known entities or close matches
                    src_match = _closest_entity(src, entity_norms)
                    tgt_match = _closest_entity(tgt, entity_norms)

                    if src_match and tgt_match and src_match != tgt_match:
                        relations.append({
                            "source": src_match,
                            "target": tgt_match,
                            "relation": rel_label,
                            "sentence": sent[:200],
                        })
                except IndexError:
                    pass

    return relations


def _closest_entity(text: str, entity_norms: set) -> Optional[str]:
    """Find if text matches or closely matches a known entity."""
    text = _normalize(text)

    # Exact match
    if text in entity_norms:
        return text

    # Substring match (entity contained in text or text in entity)
    for norm in entity_norms:
        if norm in text or text in norm:
            if abs(len(norm) - len(text)) < 8:
                return norm

    return None


def build_knowledge_graph(
    texts: List[str],
    embeddings: Optional[np.ndarray] = None,
    labels: Optional[List[str]] = None,
) -> Dict:
    """
    Build a knowledge graph from a list of texts.
    Returns serializable graph data for frontend.
    """
    G = nx.DiGraph()
    entity_sources: Dict[str, List[int]] = defaultdict(list)  # entity_norm -> doc indices
    entity_info: Dict[str, Dict] = {}  # entity_norm -> {type, display_text}

    # 1. Extract entities from all texts
    for doc_idx, text in enumerate(texts):
        entities = _extract_entities_from_text(text)
        for ent in entities:
            norm = ent["normalized"]
            entity_sources[norm].append(doc_idx)
            if norm not in entity_info:
                entity_info[norm] = {
                    "display": ent["text"],
                    "type": ent["type"],
                }

    # Only keep entities appearing in at least 1 text
    valid_entities = set(entity_info.keys())

    # Add nodes
    for norm, info in entity_info.items():
        freq = len(set(entity_sources[norm]))
        G.add_node(norm,
                   label=info["display"],
                   type=info["type"],
                   frequency=freq,
                   doc_indices=list(set(entity_sources[norm])),
                   color=ENTITY_COLORS.get(info["type"], ENTITY_COLORS["other"]))

    # 2. Co-occurrence edges (entities in same document)
    co_occur: Dict[Tuple, int] = defaultdict(int)
    for doc_idx, text in enumerate(texts):
        ents_in_doc = [norm for norm, srcs in entity_sources.items() if doc_idx in srcs]
        for i in range(len(ents_in_doc)):
            for j in range(i + 1, len(ents_in_doc)):
                pair = (ents_in_doc[i], ents_in_doc[j])
                co_occur[pair] += 1

    for (src, tgt), count in co_occur.items():
        if count >= 1 and not G.has_edge(src, tgt) and not G.has_edge(tgt, src):
            G.add_edge(src, tgt, relation="co_occurs", weight=count, sentence="")

    # 3. Relation edges from text patterns
    all_text = " ".join(texts)
    relations = _extract_relations(all_text, valid_entities)
    for rel in relations:
        src, tgt, rel_type, sent = rel["source"], rel["target"], rel["relation"], rel["sentence"]
        if G.has_node(src) and G.has_node(tgt):
            # Prefer explicit relation over co-occurrence
            if G.has_edge(src, tgt):
                G[src][tgt]["relation"] = rel_type
                G[src][tgt]["sentence"] = sent
            else:
                G.add_edge(src, tgt, relation=rel_type, weight=2, sentence=sent)

    # 4. Graph analytics
    undirected = G.to_undirected()
    degree_centrality = nx.degree_centrality(undirected) if len(G) > 0 else {}
    betweenness = {}
    if len(G) > 2:
        try:
            betweenness = nx.betweenness_centrality(undirected, normalized=True)
        except Exception:
            pass

    # Community detection
    communities: Dict[str, int] = {}
    if len(undirected) > 3:
        try:
            from networkx.algorithms.community import greedy_modularity_communities
            comms = greedy_modularity_communities(undirected)
            for comm_id, comm in enumerate(comms):
                for node in comm:
                    communities[node] = comm_id
        except Exception:
            pass

    # 5. Assign layout positions (spring layout for vis)
    pos: Dict[str, Tuple[float, float]] = {}
    if len(G) > 0:
        try:
            pos = nx.spring_layout(G, k=2.5, iterations=50, seed=42)
        except Exception:
            pos = {n: (float(i % 10), float(i // 10)) for i, n in enumerate(G.nodes())}

    # 6. Serialize nodes
    nodes = []
    for node in G.nodes(data=True):
        name, data = node
        nodes.append({
            "id": name,
            "label": data.get("label", name),
            "type": data.get("type", "other"),
            "color": data.get("color", ENTITY_COLORS["other"]),
            "frequency": data.get("frequency", 1),
            "degree": G.degree(name),
            "degree_centrality": round(degree_centrality.get(name, 0), 4),
            "betweenness": round(betweenness.get(name, 0), 4),
            "community": communities.get(name, 0),
            "doc_indices": data.get("doc_indices", []),
            "x": float(pos.get(name, (0, 0))[0]),
            "y": float(pos.get(name, (0, 0))[1]),
        })

    # 7. Serialize edges
    edges = []
    for src, tgt, data in G.edges(data=True):
        edges.append({
            "source": src,
            "target": tgt,
            "relation": data.get("relation", "co_occurs"),
            "weight": data.get("weight", 1),
            "sentence": data.get("sentence", ""),
        })

    # 8. Top nodes by centrality
    top_nodes = sorted(nodes, key=lambda n: n["degree_centrality"], reverse=True)[:10]

    # 9. Community summary
    comm_map: Dict[int, List[str]] = defaultdict(list)
    for node in nodes:
        comm_map[node["community"]].append(node["label"])
    community_summary = [
        {"community_id": cid, "members": members[:8]}
        for cid, members in comm_map.items()
    ]

    return {
        "nodes": nodes,
        "edges": edges,
        "node_count": len(nodes),
        "edge_count": len(edges),
        "top_nodes": top_nodes,
        "community_summary": community_summary,
        "entity_types": list(ENTITY_COLORS.keys()),
        "entity_type_colors": ENTITY_COLORS,
        "graph_density": round(nx.density(G), 4) if len(G) > 1 else 0.0,
    }


def get_node_details(graph_data: Dict, node_id: str, embedding_neighbors: Optional[List[Dict]] = None) -> Dict:
    """
    Return full details for a node: graph neighbors + embedding neighbors.
    """
    nodes_by_id = {n["id"]: n for n in graph_data["nodes"]}
    node = nodes_by_id.get(node_id)
    if not node:
        return {"error": "Node not found"}

    graph_neighbors = []
    for edge in graph_data["edges"]:
        if edge["source"] == node_id:
            neighbor = nodes_by_id.get(edge["target"])
            if neighbor:
                graph_neighbors.append({
                    "id": edge["target"],
                    "label": neighbor["label"],
                    "relation": edge["relation"],
                    "type": neighbor["type"],
                    "color": neighbor["color"],
                    "direction": "outgoing",
                })
        elif edge["target"] == node_id:
            neighbor = nodes_by_id.get(edge["source"])
            if neighbor:
                graph_neighbors.append({
                    "id": edge["source"],
                    "label": neighbor["label"],
                    "relation": edge["relation"],
                    "type": neighbor["type"],
                    "color": neighbor["color"],
                    "direction": "incoming",
                })

    return {
        "node": node,
        "graph_neighbors": graph_neighbors,
        "embedding_neighbors": embedding_neighbors or [],
    }
