import React from 'react';

interface Props {
  value: 'category' | 'cluster';
  onChange: (v: 'category' | 'cluster') => void;
}

export const ColorByToggle: React.FC<Props> = ({ value, onChange }) => (
  <div className="flex items-center gap-2 text-xs">
    <span className="text-gray-400">Colour by:</span>
    {(['category', 'cluster'] as const).map((opt) => (
      <button
        key={opt}
        onClick={() => onChange(opt)}
        className={`px-3 py-1 rounded-full border capitalize transition-colors ${
          value === opt
            ? 'border-brand-400 bg-brand-50 text-brand-600'
            : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
);
