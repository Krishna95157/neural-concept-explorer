import axios from 'axios';
import type {
  EmbedRequest,
  EmbedResponse,
  CompareRequest,
  CompareResponse,
  DatasetMeta,
  Dataset,
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
};
