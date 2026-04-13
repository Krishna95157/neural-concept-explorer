import { create } from 'zustand';
import type {
  EmbedResponse,
  CompareResponse,
  ModelKey,
  ReductionMethod,
  Dimensions,
  PointData,
  TokenizeResult,
  CorpusTokenStats,
  TokenizerModel,
  GraphData,
  NodeDetail,
} from '../types';

export type ActiveTab = 'scatter' | 'heatmap' | 'neighbors' | 'compare' | 'explain' | 'tokens' | 'graph' | 'hybrid';

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

  // Token state
  tokenText: string;
  tokenizerModel: TokenizerModel;
  tokenizeResult: TokenizeResult | null;
  corpusStats: CorpusTokenStats | null;
  tokenLoading: boolean;

  // Graph state
  graphData: GraphData | null;
  selectedNode: string | null;
  nodeDetail: NodeDetail | null;
  graphLoading: boolean;

  // UI
  loading: boolean;
  error: string | null;
  activeTab: ActiveTab;

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
  setActiveTab: (v: ActiveTab) => void;

  setTokenText: (v: string) => void;
  setTokenizerModel: (v: TokenizerModel) => void;
  setTokenizeResult: (v: TokenizeResult | null) => void;
  setCorpusStats: (v: CorpusTokenStats | null) => void;
  setTokenLoading: (v: boolean) => void;

  setGraphData: (v: GraphData | null) => void;
  setSelectedNode: (v: string | null) => void;
  setNodeDetail: (v: NodeDetail | null) => void;
  setGraphLoading: (v: boolean) => void;
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

  tokenText: '',
  tokenizerModel: 'bert',
  tokenizeResult: null,
  corpusStats: null,
  tokenLoading: false,

  graphData: null,
  selectedNode: null,
  nodeDetail: null,
  graphLoading: false,

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

  setTokenText: (v) => set({ tokenText: v }),
  setTokenizerModel: (v) => set({ tokenizerModel: v }),
  setTokenizeResult: (v) => set({ tokenizeResult: v }),
  setCorpusStats: (v) => set({ corpusStats: v }),
  setTokenLoading: (v) => set({ tokenLoading: v }),

  setGraphData: (v) => set({ graphData: v }),
  setSelectedNode: (v) => set({ selectedNode: v }),
  setNodeDetail: (v) => set({ nodeDetail: v }),
  setGraphLoading: (v) => set({ graphLoading: v }),
}));
