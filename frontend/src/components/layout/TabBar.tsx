import React from 'react';
import { useStore } from '../../hooks/useStore';

type Tab = 'scatter' | 'heatmap' | 'neighbors' | 'compare' | 'explain';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'scatter', label: 'Scatter Plot', icon: '🗺️' },
  { key: 'heatmap', label: 'Heatmap', icon: '🌡️' },
  { key: 'neighbors', label: 'Neighbours', icon: '🔗' },
  { key: 'compare', label: 'Compare', icon: '⚖️' },
  { key: 'explain', label: 'Explain', icon: '📚' },
];

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useStore();
  return (
    <div className="flex gap-0.5 border-b border-gray-200 mb-4">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => setActiveTab(t.key)}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === t.key
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <span>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
};
