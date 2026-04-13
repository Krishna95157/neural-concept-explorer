import axios from 'axios';
import type {
  EmbedRequest,
  EmbedResponse,
  CompareRequest,
  CompareResponse,
  DatasetMeta,
  Dataset,
  TokenizeResult,
  CorpusTokenStats,
  TokenizerModel,
  GraphData,
  NodeDetail,
} from '../types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const client = axios.create({ baseURL: BASE, timeout: 120_000 });

export const api = {
  health: () => client.get('/health'),
  embed: (req: EmbedRequest) =>
    client.post<EmbedResponse>('/api/embed', req).then((r) => r.data),
  compare: (req: CompareRequest) =>
    client.post<CompareResponse>('/api/compare', req).then((r) => r.data),
  listDatasets: () =>
    client.get<DatasetMeta[]>('/api/datasets').then((r) => r.data),
  getDataset: (name: string) =>
    client.get<Dataset>(`/api/datasets/${name}`).then((r) => r.data),

  // Token endpoints
  tokenize: (text: string, model: TokenizerModel = 'bert') =>
    client.post<TokenizeResult>('/api/tokens/tokenize', { text, model }).then((r) => r.data),
  corpusStats: (texts: string[], model: TokenizerModel = 'bert') =>
    client.post<CorpusTokenStats>('/api/tokens/corpus-stats', { texts, model }).then((r) => r.data),

  // Graph endpoints
  buildGraph: (texts: string[], labels?: string[], embed_model = 'minilm') =>
    client.post<GraphData>('/api/graph/build', { texts, labels, embed_model }).then((r) => r.data),
  getNodeDetail: (node_id: string, top_k = 5) =>
    client.post<NodeDetail>('/api/graph/node-detail', { node_id, top_k }).then((r) => r.data),
};
