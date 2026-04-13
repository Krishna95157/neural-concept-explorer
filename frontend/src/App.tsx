import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { ControlPanel } from './components/layout/ControlPanel';
import { TabBar } from './components/layout/TabBar';
import { ScatterPlot } from './components/plots/ScatterPlot';
import { SimilarityHeatmap } from './components/plots/SimilarityHeatmap';
import { NearestNeighborsPanel } from './components/panels/NearestNeighborsPanel';
import { CompareView } from './components/plots/CompareView';
import { ExplainPanel } from './components/panels/ExplainPanel';
import { TimingBadge } from './components/panels/TimingBadge';
import { ColorByToggle } from './components/panels/ColorByToggle';
import { useStore } from './hooks/useStore';
import { api } from './utils/api';
import type { PointData } from './types';
import { resetColors } from './utils/colors';

function LandingHero() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-100 border border-brand-200 flex items-center justify-center text-3xl mb-2 shadow-sm">
        🧠
      </div>
      <h2 className="text-3xl font-bold gradient-text">
        Embedding Space Explorer
      </h2>
      <p className="text-gray-500 max-w-xl leading-relaxed">
        Select a dataset or enter your own text, choose an embedding model and
        reduction method, then click <strong className="text-gray-700">Generate</strong> to
        visualise how language lives in vector space.
      </p>
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        {['2D & 3D Scatter Plots', 'Cosine Similarity Heatmap', 'Nearest Neighbours', 'Model Comparison', 'Context-Shift Demo'].map((f) => (
          <span
            key={f}
            className="text-xs px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-500 shadow-sm"
          >
            ✓ {f}
          </span>
        ))}
      </div>
    </div>
  );
}

function App() {
  const {
    inputTexts,
    model, reduction, dimensions,
    compareModels,
    embedResult, setEmbedResult,
    compareResult, setCompareResult,
    selectedPoint, setSelectedPoint,
    setLoading,
    error, setError,
    activeTab,
  } = useStore();

  const [colorBy, setColorBy] = useState<'category' | 'cluster'>('category');

  function parseTexts() {
    return inputTexts.split('\n').map((l) => l.trim()).filter(Boolean);
  }

  async function handleRun() {
    const texts = parseTexts();
    if (texts.length < 2) { setError('Enter at least 2 lines of text.'); return; }
    setError(null);
    setLoading(true);
    resetColors();
    try {
      const result = await api.embed({ texts, model, reduction, dimensions });
      setEmbedResult(result);
      setCompareResult(null);
      setSelectedPoint(null);
      useStore.getState().setActiveTab('scatter');
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCompare() {
    const texts = parseTexts();
    if (texts.length < 2) { setError('Enter at least 2 lines of text.'); return; }
    setError(null);
    setLoading(true);
    resetColors();
    try {
      const result = await api.compare({ texts, models: compareModels, reduction, dimensions });
      setCompareResult(result);
      setEmbedResult(null);
      useStore.getState().setActiveTab('compare');
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function handlePointClick(point: PointData) {
    setSelectedPoint(point);
    useStore.getState().setActiveTab('neighbors');
  }

  const selectedNeighbors = React.useMemo(() => {
    if (!embedResult || !selectedPoint) return [];
    return embedResult.nearest_neighbors[String(selectedPoint.id)] ?? [];
  }, [embedResult, selectedPoint]);

  const hasResult = !!embedResult;
  const hasCompare = !!compareResult;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className="p-4 border-r border-gray-200 bg-gray-50 overflow-y-auto shrink-0"
          style={{ width: 288 }}
        >
          <ControlPanel onRun={handleRun} onCompare={handleCompare} />
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 overflow-y-auto">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <span className="text-red-500 flex-shrink-0">⚠️</span>
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 font-bold">✕</button>
            </div>
          )}

          {!hasResult && !hasCompare && activeTab !== 'explain' && <LandingHero />}

          {(hasResult || hasCompare || activeTab === 'explain') && (
            <>
              {hasResult && embedResult && (
                <div className="mb-3">
                  <TimingBadge
                    timing={embedResult.timing}
                    model={embedResult.model_used}
                    reduction={embedResult.reduction_used}
                  />
                </div>
              )}

              <TabBar />

              {activeTab === 'scatter' && hasResult && embedResult && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-700">
                      {embedResult.points.length} points · {embedResult.dimensions}D
                    </h2>
                    <ColorByToggle value={colorBy} onChange={setColorBy} />
                  </div>
                  <div className="card p-2">
                    <ScatterPlot
                      points={embedResult.points}
                      dimensions={embedResult.dimensions as 2 | 3}
                      colorBy={colorBy}
                      onPointClick={handlePointClick}
                      selectedId={selectedPoint?.id}
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    Click any point to inspect its nearest neighbours →
                  </p>
                </div>
              )}

              {activeTab === 'heatmap' && hasResult && embedResult && (
                <div className="card">
                  <h2 className="text-sm font-semibold text-gray-700 mb-3">
                    Pairwise Cosine Similarity Matrix
                  </h2>
                  <SimilarityHeatmap
                    matrix={embedResult.similarity_matrix}
                    points={embedResult.points}
                  />
                </div>
              )}

              {activeTab === 'neighbors' && (
                <div className="max-w-xl">
                  <NearestNeighborsPanel
                    selectedPoint={selectedPoint}
                    neighbors={selectedNeighbors}
                  />
                </div>
              )}

              {activeTab === 'compare' && hasCompare && compareResult && (
                <CompareView results={compareResult.results as any} />
              )}
              {activeTab === 'compare' && !hasCompare && (
                <div className="card text-gray-400 text-sm text-center py-12">
                  Switch to <strong className="text-gray-700">Compare</strong> mode in the sidebar
                  and click <strong className="text-gray-700">Compare Models</strong>.
                </div>
              )}

              {activeTab === 'explain' && <ExplainPanel />}
            </>
          )}
        </main>
      </div>

      <footer className="border-t border-gray-200 bg-white px-6 py-3 flex items-center justify-between text-xs text-gray-400">
        <span>Embedding Space Explorer — AI Visualisation Portfolio Project</span>
        <span>FastAPI · sentence-transformers · Plotly.js · React · Tailwind</span>
      </footer>
    </div>
  );
}

export default App;
