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
