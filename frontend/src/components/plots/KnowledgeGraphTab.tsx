import React, { useState } from 'react';
import { GraphView } from './GraphView';
import { useStore } from '../../hooks/useStore';
import { api } from '../../utils/api';

const ENTITY_TYPE_LABELS: Record<string, string> = {
  model: 'Model',
  concept: 'Concept',
  technique: 'Technique',
  tool: 'Tool',
  dataset: 'Dataset',
  task: 'Task',
  component: 'Component',
  company: 'Company',
  other: 'Other',
};

export const KnowledgeGraphTab: React.FC = () => {
  const {
    inputTexts,
    model,
    graphData, setGraphData,
    selectedNode, setSelectedNode,
    nodeDetail, setNodeDetail,
    graphLoading, setGraphLoading,
  } = useStore();

  const [error, setError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'overview' | 'node'>('overview');

  const texts = inputTexts.split('\n').map(l => l.trim()).filter(Boolean);

  async function handleBuild() {
    if (texts.length < 2) {
      setError('Load a dataset or enter at least 2 texts first.');
      return;
    }
    setGraphLoading(true);
    setError(null);
    try {
      const result = await api.buildGraph(texts, undefined, model);
      setGraphData(result);
      setSelectedNode(null);
      setNodeDetail(null);
      setActivePanel('overview');
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e.message ?? 'Error building graph');
    } finally {
      setGraphLoading(false);
    }
  }

  async function handleNodeClick(nodeId: string) {
    setSelectedNode(nodeId);
    setActivePanel('node');
    try {
      const detail = await api.getNodeDetail(nodeId);
      setNodeDetail(detail);
    } catch (e) {
      // Silent fail — node detail panel will show basic info
    }
  }

  const selectedNodeData = graphData?.nodes.find(n => n.id === selectedNode);

  // Build type distribution
  const typeCounts: Record<string, number> = {};
  if (graphData) {
    for (const n of graphData.nodes) {
      typeCounts[n.type] = (typeCounts[n.type] ?? 0) + 1;
    }
  }

  return (
    <div className="space-y-4">
      {/* Build toolbar */}
      <div className="card flex items-center gap-3 flex-wrap">
        <div className="flex-1 text-sm text-gray-600">
          {texts.length > 0
            ? <><span className="font-semibold text-gray-800">{texts.length}</span> texts loaded</>
            : <span className="text-gray-400">Load a dataset or enter texts in the sidebar first</span>
          }
        </div>
        <button
          onClick={handleBuild}
          disabled={graphLoading || texts.length < 2}
          className="btn-primary text-sm py-2 px-5 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {graphLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Building…
            </>
          ) : '⬡ Build Knowledge Graph'}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {!graphData && !graphLoading && (
        <div className="card text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">⬡</div>
          <div className="text-sm">Click Build Knowledge Graph to extract entities and relationships from your texts.</div>
          <div className="text-xs mt-2 text-gray-300">Works best with the AI Knowledge Graph Corpus dataset</div>
        </div>
      )}

      {graphData && (
        <div className="flex gap-4">
          {/* Left: graph canvas */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Stats strip */}
            <div className="flex gap-2 flex-wrap">
              {[
                { label: 'Entities', value: graphData.node_count, color: 'brand' },
                { label: 'Relations', value: graphData.edge_count, color: 'green' },
                { label: 'Density', value: graphData.graph_density, color: 'amber' },
                { label: 'Communities', value: graphData.community_summary.length, color: 'purple' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`flex flex-col items-center px-3 py-1.5 rounded-lg bg-${color === 'brand' ? 'brand-50 border-brand-100' : color === 'green' ? 'green-50 border-green-100' : color === 'amber' ? 'amber-50 border-amber-100' : 'purple-50 border-purple-100'} border text-center min-w-[70px]`}>
                  <span className={`text-lg font-bold text-${color === 'brand' ? 'brand-600' : color === 'green' ? 'green-600' : color === 'amber' ? 'amber-600' : 'purple-600'}`}>{value}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</span>
                </div>
              ))}
              {graphData.timing && (
                <div className="flex flex-col items-center px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-center">
                  <span className="text-lg font-bold text-gray-600">{graphData.timing.total_seconds}s</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">Build Time</span>
                </div>
              )}
            </div>

            {/* Graph */}
            <div className="card !p-2">
              <GraphView
                data={graphData}
                selectedNode={selectedNode}
                onNodeClick={handleNodeClick}
              />
              <p className="text-xs text-gray-400 text-center mt-2">
                Click a node to inspect · Drag to reposition · Scroll to zoom · Drag background to pan
              </p>
            </div>

            {/* Legend */}
            <div className="card !p-3">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Entity Types</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(graphData.entity_type_colors).filter(([t]) => typeCounts[t] > 0).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    {ENTITY_TYPE_LABELS[type] ?? type}
                    <span className="text-gray-300">({typeCounts[type]})</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#d1d5db" strokeWidth="1" strokeDasharray="3,2" /></svg>
                  Co-occurs
                </span>
                <span className="flex items-center gap-1">
                  <svg width="20" height="4"><line x1="0" y1="2" x2="16" y2="2" stroke="#9ca3af" strokeWidth="1.5" /><polygon points="16,0 20,2 16,4" fill="#9ca3af" /></svg>
                  Relation
                </span>
              </div>
            </div>
          </div>

          {/* Right: detail panel */}
          <div className="w-72 flex-shrink-0 space-y-3">
            {/* Panel tabs */}
            <div className="flex gap-0.5 border-b border-gray-200">
              {(['overview', 'node'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setActivePanel(t)}
                  className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                    activePanel === t ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {t === 'overview' ? 'Overview' : 'Node Detail'}
                </button>
              ))}
            </div>

            {activePanel === 'overview' && (
              <div className="space-y-3">
                {/* Top entities */}
                <div className="card !p-3 space-y-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Top Entities by Centrality</div>
                  {graphData.top_nodes.slice(0, 8).map((n, i) => (
                    <button
                      key={n.id}
                      onClick={() => handleNodeClick(n.id)}
                      className="w-full flex items-center gap-2 hover:bg-gray-50 rounded p-1 transition-colors text-left"
                    >
                      <span className="w-5 text-[10px] text-gray-400 text-right flex-shrink-0">#{i + 1}</span>
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: n.color }} />
                      <span className="text-xs text-gray-800 font-medium flex-1 truncate">{n.label}</span>
                      <span className="text-[10px] text-gray-400">{n.degree}d</span>
                    </button>
                  ))}
                </div>

                {/* Communities */}
                {graphData.community_summary.length > 0 && (
                  <div className="card !p-3 space-y-2">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Communities</div>
                    {graphData.community_summary.slice(0, 5).map((c) => (
                      <div key={c.community_id} className="text-xs">
                        <span className="text-gray-500 font-medium">Cluster {c.community_id + 1}:</span>
                        <span className="text-gray-600 ml-1">{c.members.slice(0, 4).join(', ')}{c.members.length > 4 ? ` +${c.members.length - 4}` : ''}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activePanel === 'node' && (
              <div className="space-y-3">
                {!selectedNodeData && (
                  <div className="card text-center py-8 text-gray-400 text-xs">
                    Click a node in the graph to see its details here.
                  </div>
                )}

                {selectedNodeData && (
                  <>
                    {/* Node header */}
                    <div className="card !p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedNodeData.color }} />
                        <span className="font-semibold text-gray-800">{selectedNodeData.label}</span>
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 capitalize">{selectedNodeData.type}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {[
                          { label: 'Degree', value: selectedNodeData.degree },
                          { label: 'Centrality', value: selectedNodeData.degree_centrality.toFixed(3) },
                          { label: 'Community', value: `#${selectedNodeData.community + 1}` },
                        ].map(s => (
                          <div key={s.label} className="text-center">
                            <div className="text-sm font-bold text-brand-600">{s.value}</div>
                            <div className="text-[9px] text-gray-400">{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Graph neighbors */}
                    {nodeDetail && nodeDetail.graph_neighbors.length > 0 && (
                      <div className="card !p-3 space-y-1.5">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Graph Neighbors</div>
                        {nodeDetail.graph_neighbors.slice(0, 6).map((n, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className={`text-[9px] px-1 py-0.5 rounded ${n.direction === 'outgoing' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-600'}`}>
                              {n.direction === 'outgoing' ? '→' : '←'}
                            </span>
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: n.color }} />
                            <span className="text-gray-700 flex-1 truncate">{n.label}</span>
                            <span className="text-gray-400 text-[9px]">{n.relation}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Embedding neighbors */}
                    {selectedNodeData.embedding_neighbors && selectedNodeData.embedding_neighbors.length > 0 && (
                      <div className="card !p-3 space-y-1.5">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Semantic Neighbors</div>
                        <div className="text-[10px] text-gray-400 mb-1">Closest in embedding space</div>
                        {selectedNodeData.embedding_neighbors.slice(0, 5).map((n, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="text-[9px] text-gray-400 w-4">#{i + 1}</span>
                            <span className="flex-1 text-gray-700 truncate">{n.text}</span>
                            <span className="text-brand-500 font-mono">{(n.similarity * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
