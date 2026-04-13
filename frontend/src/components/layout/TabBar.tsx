import React from 'react';
import { useStore } from '../../hooks/useStore';
import type { ActiveTab } from '../../hooks/useStore';

const TABS: { key: ActiveTab; label: string; icon: string; group?: string }[] = [
  { key: 'scatter',  label: 'Scatter',   icon: '🗺️',  group: 'embed' },
  { key: 'heatmap',  label: 'Heatmap',   icon: '🌡️',  group: 'embed' },
  { key: 'neighbors',label: 'Neighbours',icon: '🔗',  group: 'embed' },
  { key: 'compare',  label: 'Compare',   icon: '⚖️',  group: 'embed' },
  { key: 'tokens',   label: 'Tokens',    icon: '🔤',  group: 'new' },
  { key: 'graph',    label: 'Graph',     icon: '⬡',   group: 'new' },
  { key: 'hybrid',   label: 'Hybrid',    icon: '🔀',  group: 'new' },
  { key: 'explain',  label: 'Explain',   icon: '📚',  group: 'misc' },
];

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useStore();
  return (
    <div className="flex gap-0.5 border-b border-gray-200 mb-4 flex-wrap">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => setActiveTab(t.key)}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === t.key
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
          } ${t.group === 'new' ? '' : ''}`}
        >
          <span className="text-base">{t.icon}</span>
          <span>{t.label}</span>
          {t.group === 'new' && (
            <span className="text-[8px] px-1 py-0.5 rounded bg-brand-100 text-brand-600 font-semibold uppercase tracking-wide">new</span>
          )}
        </button>
      ))}
    </div>
  );
};
