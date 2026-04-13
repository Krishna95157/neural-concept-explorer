import { create } from 'zustand';
import type {
  EmbedResponse,
  CompareResponse,
  ModelKey,
  ReductionMethod,
  Dimensions,
  PointData,
} from '../types';

interface AppState {
  // Control panel
  inputTexts: string;
  selectedDataset: string;
  model: ModelKey;
  reduction: ReductionMethod;
  dimensions: Dimensions;
  compareModels: ModelKey[];
  mode: 'explore' | 'compare';

  // Results
  embedResult: EmbedResponse | null;
  compareResult: CompareResponse | null;
  selectedPoint: PointData | null;

  // UI
  loading: boolean;
  error: string | null;
  activeTab: 'scatter' | 'heatmap' | 'neighbors' | 'compare' | 'explain';

  // Actions
  setInputTexts: (v: string) => void;
  setSelectedDataset: (v: string) => void;
  setModel: (v: ModelKey) => void;
  setReduction: (v: ReductionMethod) => void;
  setDimensions: (v: Dimensions) => void;
  setCompareModels: (v: ModelKey[]) => void;
  setMode: (v: 'explore' | 'compare') => void;
  setEmbedResult: (v: EmbedResponse | null) => void;
  setCompareResult: (v: CompareResponse | null) => void;
  setSelectedPoint: (v: PointData | null) => void;
  setLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
  setActiveTab: (v: AppState['activeTab']) => void;
}

export const useStore = create<AppState>((set) => ({
  inputTexts: '',
  selectedDataset: '',
  model: 'minilm',
  reduction: 'pca',
  dimensions: 2,
  compareModels: ['minilm', 'glove'],
  mode: 'explore',
  embedResult: null,
  compareResult: null,
  selectedPoint: null,
  loading: false,
  error: null,
  activeTab: 'scatter',

  setInputTexts: (v) => set({ inputTexts: v }),
  setSelectedDataset: (v) => set({ selectedDataset: v }),
  setModel: (v) => set({ model: v }),
  setReduction: (v) => set({ reduction: v }),
  setDimensions: (v) => set({ dimensions: v }),
  setCompareModels: (v) => set({ compareModels: v }),
  setMode: (v) => set({ mode: v }),
  setEmbedResult: (v) => set({ embedResult: v }),
  setCompareResult: (v) => set({ compareResult: v }),
  setSelectedPoint: (v) => set({ selectedPoint: v }),
  setLoading: (v) => set({ loading: v }),
  setError: (v) => set({ error: v }),
  setActiveTab: (v) => set({ activeTab: v }),
}));
