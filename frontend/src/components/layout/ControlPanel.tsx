import React, { useEffect, useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { api } from '../../utils/api';
import type { DatasetMeta, ModelKey, ReductionMethod } from '../../types';

const MODELS: { key: ModelKey; label: string; desc: string }[] = [
  { key: 'minilm', label: 'MiniLM-L6-v2', desc: 'Fast · contextual · 384d' },
  { key: 'mpnet', label: 'MPNet-base-v2', desc: 'Better · contextual · 768d' },
  { key: 'glove', label: 'GloVe 50d', desc: 'Static · word-level · 50d' },
];

const REDUCTIONS: { key: ReductionMethod; label: string }[] = [
  { key: 'pca', label: 'PCA' },
  { key: 'tsne', label: 't-SNE' },
  { key: 'umap', label: 'UMAP' },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
      {children}
    </div>
  );
}

export const ControlPanel: React.FC<{ onRun: () => void; onCompare: () => void }> = ({
  onRun,
  onCompare,
}) => {
  const {
    inputTexts, setInputTexts,
    selectedDataset, setSelectedDataset,
    model, setModel,
    reduction, setReduction,
    dimensions, setDimensions,
    compareModels, setCompareModels,
    mode, setMode,
    loading,
  } = useStore();

  const [datasets, setDatasets] = useState<DatasetMeta[]>([]);
  const [backendOk, setBackendOk] = useState<boolean | null>(null);

  useEffect(() => {
    api.health()
      .then(() => {
        setBackendOk(true);
        api.listDatasets().then(setDatasets).catch(() => {});
      })
      .catch(() => setBackendOk(false));
  }, []);

  async function handleDatasetSelect(key: string) {
    setSelectedDataset(key);
    if (!key) { setInputTexts(''); return; }
    try {
      const ds = await api.getDataset(key);
      setInputTexts(ds.items.map((i) => i.text).join('\n'));
    } catch {}
  }

  function toggleCompareModel(m: ModelKey) {
    if (compareModels.includes(m)) {
      if (compareModels.length > 1) setCompareModels(compareModels.filter((x) => x !== m));
    } else {
      setCompareModels([...compareModels, m]);
    }
  }

  return (
    <aside className="space-y-3">
      {/* Backend status */}
      <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${
        backendOk === null
          ? 'bg-gray-50 border-gray-200 text-gray-400'
          : backendOk
          ? 'bg-green-50 border-green-200 text-green-700'
          : 'bg-red-50 border-red-200 text-red-600'
      }`}>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
          backendOk === null ? 'bg-gray-300 animate-pulse'
          : backendOk ? 'bg-green-500'
          : 'bg-red-500'
        }`} />
        {backendOk === null ? 'Connecting to backend…'
          : backendOk ? 'Backend connected'
          : 'Backend offline — run: uvicorn app.main:app'}
      </div>

      {/* Mode toggle */}
      <div className="card !p-1.5">
        <div className="flex rounded-lg overflow-hidden bg-gray-100">
          {(['explore', 'compare'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 text-xs font-semibold capitalize rounded-md transition-all ${
                mode === m
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {m === 'explore' ? '🔍 Explore' : '⚖️ Compare'}
            </button>
          ))}
        </div>
      </div>

      {/* Dataset */}
      <div className="card space-y-1.5">
        <SectionLabel>Sample Dataset</SectionLabel>
        <select
          value={selectedDataset}
          onChange={(e) => handleDatasetSelect(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
        >
          <option value="">— Enter custom text —</option>
          {datasets.map((d) => (
            <option key={d.key} value={d.key}>
              {d.name} ({d.count})
            </option>
          ))}
        </select>
      </div>

      {/* Text input */}
      <div className="card space-y-1.5">
        <SectionLabel>Input Texts (one per line)</SectionLabel>
        <textarea
          value={inputTexts}
          onChange={(e) => setInputTexts(e.target.value)}
          placeholder={"dog\ncat\napple\ncar\n…"}
          rows={7}
          className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent font-mono"
        />
        <div className="text-xs text-gray-400">
          {inputTexts.split('\n').filter((l) => l.trim()).length} texts
        </div>
      </div>

      {/* Model */}
      <div className="card space-y-1.5">
        <SectionLabel>{mode === 'explore' ? 'Embedding Model' : 'Models to Compare'}</SectionLabel>
        {MODELS.map((m) => (
          <label
            key={m.key}
            className={`flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer border transition-all ${
              (mode === 'explore' ? model === m.key : compareModels.includes(m.key))
                ? 'border-brand-400 bg-brand-50'
                : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input
              type={mode === 'explore' ? 'radio' : 'checkbox'}
              name="model"
              value={m.key}
              checked={mode === 'explore' ? model === m.key : compareModels.includes(m.key)}
              onChange={() =>
                mode === 'explore' ? setModel(m.key) : toggleCompareModel(m.key)
              }
              className="mt-0.5 accent-brand-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-800">{m.label}</div>
              <div className="text-xs text-gray-400">{m.desc}</div>
            </div>
          </label>
        ))}
      </div>

      {/* Reduction */}
      <div className="card space-y-1.5">
        <SectionLabel>Reduction Method</SectionLabel>
        <div className="flex gap-1.5">
          {REDUCTIONS.map((r) => (
            <button
              key={r.key}
              onClick={() => setReduction(r.key)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                reduction === r.key
                  ? 'border-brand-400 bg-brand-50 text-brand-600'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dimensions */}
      <div className="card space-y-1.5">
        <SectionLabel>Dimensions</SectionLabel>
        <div className="flex gap-1.5">
          {([2, 3] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDimensions(d)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                dimensions === d
                  ? 'border-brand-400 bg-brand-50 text-brand-600'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>

      {/* Run button */}
      <button
        disabled={loading || backendOk === false}
        onClick={mode === 'explore' ? onRun : onCompare}
        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating…
          </>
        ) : (
          <>{mode === 'explore' ? '▶  Generate' : '⚖️  Compare Models'}</>
        )}
      </button>
    </aside>
  );
};
