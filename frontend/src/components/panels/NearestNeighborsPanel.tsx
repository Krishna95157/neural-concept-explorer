import React from 'react';
import type { PointData, NearestNeighbor } from '../../types';

interface Props {
  selectedPoint: PointData | null;
  neighbors: NearestNeighbor[];
}

function SimilarityBar({ value }: { value: number }) {
  const pct = Math.round(((value + 1) / 2) * 100);
  const color =
    value > 0.8 ? '#10b981' : value > 0.5 ? '#4f6cf5' : value > 0.2 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-2 mt-0.5">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono w-12 text-right" style={{ color }}>
        {value.toFixed(3)}
      </span>
    </div>
  );
}

export const NearestNeighborsPanel: React.FC<Props> = ({ selectedPoint, neighbors }) => {
  if (!selectedPoint) {
    return (
      <div className="card flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
        <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="11" cy="11" r="8" strokeWidth="1.5" />
          <path strokeLinecap="round" strokeWidth="1.5" d="M21 21l-4.35-4.35" />
        </svg>
        <p className="text-sm text-center">Click a point on the scatter plot<br />to inspect its neighbours.</p>
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      {/* Selected point header */}
      <div className="rounded-lg bg-brand-50 border border-brand-200 px-4 py-3">
        <div className="text-[10px] text-brand-500 font-bold uppercase tracking-widest mb-1">
          Selected point
        </div>
        <div className="text-gray-900 font-semibold">{selectedPoint.text}</div>
        <div className="flex gap-2 mt-1.5 flex-wrap">
          {selectedPoint.category && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
              {selectedPoint.category}
            </span>
          )}
          {selectedPoint.cluster != null && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
              Cluster {selectedPoint.cluster}
            </span>
          )}
        </div>
      </div>

      {/* Neighbors */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Top {neighbors.length} Nearest Neighbours
        </h3>
        <div className="space-y-3">
          {neighbors.map((n, i) => (
            <div key={n.id} className="flex flex-col gap-0.5">
              <div className="flex items-start gap-2">
                <span className="text-xs text-gray-400 w-4 mt-0.5">{i + 1}.</span>
                <span className="text-sm text-gray-700 flex-1 leading-snug">{n.text}</span>
              </div>
              <div className="pl-6">
                <SimilarityBar value={n.similarity} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
