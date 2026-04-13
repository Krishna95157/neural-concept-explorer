import React from 'react';
import type { EmbedResponse } from '../../types';
import { ScatterPlot } from './ScatterPlot';

interface Props {
  results: Record<string, EmbedResponse>;
}

const MODEL_LABELS: Record<string, string> = {
  minilm: 'MiniLM-L6-v2 (contextual)',
  mpnet: 'MPNet-base-v2 (contextual)',
  glove: 'GloVe 50d (static)',
};

export const CompareView: React.FC<Props> = ({ results }) => {
  const entries = Object.entries(results).filter(([, v]) => v && v.points);

  if (entries.length === 0) {
    return (
      <div className="card text-gray-400 text-sm text-center py-12">
        Run a comparison to see model differences.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${Math.min(entries.length, 2)}, 1fr)` }}
      >
        {entries.map(([modelKey, result]) => (
          <div key={modelKey} className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">
                {MODEL_LABELS[modelKey] ?? modelKey}
              </h3>
              <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded-full">
                {result.timing?.total_seconds}s
              </span>
            </div>
            <ScatterPlot
              points={result.points}
              dimensions={result.dimensions as 2 | 3}
              colorBy="category"
            />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <StatBox label="Points" value={result.points.length} />
              <StatBox label="Avg Sim" value={averageSim(result.similarity_matrix).toFixed(3)} />
              <StatBox label="Reduction" value={result.reduction_used.toUpperCase()} />
            </div>
          </div>
        ))}
      </div>

      {/* Timing */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Runtime Comparison</h3>
        <div className="space-y-3">
          {entries.map(([key, r]) => {
            const total = r.timing?.total_seconds ?? 0;
            const maxT = Math.max(...entries.map(([, e]) => e.timing?.total_seconds ?? 0));
            const pct = maxT > 0 ? (total / maxT) * 100 : 50;
            return (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{MODEL_LABELS[key] ?? key}</span>
                  <span className="text-gray-400 font-mono">{total}s</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-brand-500 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-lg p-2">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-sm font-semibold text-gray-800 mt-0.5">{value}</div>
    </div>
  );
}

function averageSim(matrix: number[][]): number {
  const n = matrix.length;
  if (n < 2) return 0;
  let sum = 0, count = 0;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) { sum += matrix[i][j]; count++; }
  return count > 0 ? sum / count : 0;
}
