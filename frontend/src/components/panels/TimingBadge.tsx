import React from 'react';

interface Props {
  timing: { embedding_seconds: number; reduction_seconds: number; total_seconds: number };
  model: string;
  reduction: string;
}

export const TimingBadge: React.FC<Props> = ({ timing, model, reduction }) => (
  <div className="flex flex-wrap gap-2 text-xs">
    <span className="px-2 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-600">
      Model: <strong className="text-brand-600">{model}</strong>
    </span>
    <span className="px-2 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-600">
      Reduction: <strong className="text-brand-600">{reduction.toUpperCase()}</strong>
    </span>
    <span className="px-2 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-600">
      Embed: <strong className="text-emerald-600">{timing.embedding_seconds}s</strong>
    </span>
    <span className="px-2 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-600">
      Reduce: <strong className="text-emerald-600">{timing.reduction_seconds}s</strong>
    </span>
    <span className="px-2 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-600">
      Total: <strong className="text-emerald-600">{timing.total_seconds}s</strong>
    </span>
  </div>
);
