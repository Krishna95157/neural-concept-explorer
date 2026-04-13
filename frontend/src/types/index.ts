export type ModelKey = 'minilm' | 'mpnet' | 'glove';
export type ReductionMethod = 'pca' | 'tsne' | 'umap';
export type Dimensions = 2 | 3;

export interface PointData {
  id: number;
  text: string;
  x: number;
  y: number;
  z?: number;
  label?: string;
  category?: string;
  cluster?: number;
}

export interface NearestNeighbor {
  id: number;
  text: string;
  similarity: number;
}

export interface EmbedResponse {
  points: PointData[];
  similarity_matrix: number[][];
  nearest_neighbors: Record<string, NearestNeighbor[]>;
  cluster_labels?: number[];
  model_used: string;
  reduction_used: string;
  dimensions: number;
  timing: { embedding_seconds: number; reduction_seconds: number; total_seconds: number };
}

export interface CompareResponse {
  results: Record<string, EmbedResponse>;
}

export interface DatasetMeta {
  key: string;
  name: string;
  description: string;
  count: number;
}

export interface DatasetItem {
  text: string;
  label: string;
  category: string;
}

export interface Dataset {
  name: string;
  description: string;
  items: DatasetItem[];
}

export interface EmbedRequest {
  texts: string[];
  model: ModelKey;
  reduction: ReductionMethod;
  dimensions: Dimensions;
  labels?: string[];
  categories?: string[];
}

export interface CompareRequest {
  texts: string[];
  models: ModelKey[];
  reduction: ReductionMethod;
  dimensions: Dimensions;
  labels?: string[];
  categories?: string[];
}

// ── Token types ──────────────────────────────────────────────
export type TokenizerModel = 'bert' | 'gpt2' | 'roberta';

export interface TokenizeResult {
  tokens: string[];
  token_ids: number[];
  is_subword: boolean[];
  original_text: string;
  token_count: number;
  unique_tokens: number;
  model_used: string;
}

export interface TokenFrequency {
  token: string;
  count: number;
}

export interface TokenCooccurrence {
  token_a: string;
  token_b: string;
  count: number;
}

export interface CorpusTokenStats {
  token_frequencies: TokenFrequency[];
  cooccurrence: TokenCooccurrence[];
  vocab_size: number;
  total_tokens: number;
  avg_tokens_per_text: number;
  model_used: string;
}

// ── Knowledge Graph types ─────────────────────────────────────
export interface GraphNode {
  id: string;
  label: string;
  type: string;
  color: string;
  frequency: number;
  degree: number;
  degree_centrality: number;
  betweenness: number;
  community: number;
  doc_indices: number[];
  x: number;
  y: number;
  embedding_neighbors?: Array<{ id: number; text: string; similarity: number }>;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
  sentence: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  node_count: number;
  edge_count: number;
  top_nodes: GraphNode[];
  community_summary: Array<{ community_id: number; members: string[] }>;
  entity_types: string[];
  entity_type_colors: Record<string, string>;
  graph_density: number;
  timing?: { total_seconds: number };
}

export interface NodeDetail {
  node: GraphNode;
  graph_neighbors: Array<{
    id: string;
    label: string;
    relation: string;
    type: string;
    color: string;
    direction: 'incoming' | 'outgoing';
  }>;
  embedding_neighbors: Array<{ id: number; text: string; similarity: number }>;
}
