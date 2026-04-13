import React, { useState, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';

export const HybridView: React.FC = () => {
  const { graphData } = useStore();
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  const hasGraph = !!graphData && graphData.nodes.length > 0;

  const nodes = graphData?.nodes ?? [];
  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  const analysisResult = useMemo(() => {
    if (!selectedEntity || !graphData) return null;

    const node = nodeMap.get(selectedEntity);
    if (!node) return null;

    // Graph neighbors
    const graphNeighborIds = new Set<string>();
    const graphNeighborDetails: Array<{ id: string; label: string; type: string; color: string; relation: string }> = [];

    for (const edge of graphData.edges) {
      if (edge.source === selectedEntity) {
        const n = nodeMap.get(edge.target);
        if (n) { graphNeighborIds.add(edge.target); graphNeighborDetails.push({ id: edge.target, label: n.label, type: n.type, color: n.color, relation: edge.relation }); }
      } else if (edge.target === selectedEntity) {
        const n = nodeMap.get(edge.source);
        if (n) { graphNeighborIds.add(edge.source); graphNeighborDetails.push({ id: edge.source, label: n.label, type: n.type, color: n.color, relation: edge.relation }); }
      }
    }

    // Embedding neighbors (from the node's stored embedding_neighbors)
    const embedNeighborIds = new Set<string>();
    const embedNeighborDetails: Array<{ id: string; label: string; type: string; color: string; similarity: number }> = [];

    if (node.embedding_neighbors) {
      for (const en of node.embedding_neighbors) {
        // en.text is the label of another node
        const matchNode = nodes.find(n => n.label === en.text);
        if (matchNode && matchNode.id !== selectedEntity) {
          embedNeighborIds.add(matchNode.id);
          embedNeighborDetails.push({
            id: matchNode.id,
            label: matchNode.label,
            type: matchNode.type,
            color: matchNode.color,
            similarity: en.similarity,
          });
        }
      }
    }

    // Overlap and mismatch
    const overlapIds = new Set([...graphNeighborIds].filter(id => embedNeighborIds.has(id)));
    const graphOnlyIds = new Set([...graphNeighborIds].filter(id => !embedNeighborIds.has(id)));
    const embedOnlyIds = new Set([...embedNeighborIds].filter(id => !graphNeighborIds.has(id)));

    return {
      node,
      graphNeighbors: graphNeighborDetails,
      embedNeighbors: embedNeighborDetails,
      overlap: [...overlapIds].map(id => nodeMap.get(id)!).filter(Boolean),
      graphOnly: [...graphOnlyIds].map(id => nodeMap.get(id)!).filter(Boolean),
      embedOnly: [...embedOnlyIds].map(id => nodeMap.get(id)!).filter(Boolean),
    };
  }, [selectedEntity, graphData, nodeMap, nodes]);

  if (!hasGraph) {
    return (
      <div className="card text-center py-16 text-gray-400">
        <div className="text-3xl mb-3">⬡</div>
        <div className="text-sm">Build a Knowledge Graph first (in the Graph tab), then come back here to compare structural vs semantic neighbors.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Intro */}
      <div className="card bg-brand-50 border-brand-100 !p-4">
        <div className="text-sm font-semibold text-brand-700 mb-1">Hybrid Analysis: Graph vs Embedding Space</div>
        <p className="text-xs text-brand-600 leading-relaxed">
          Select an entity to compare its <strong>structural neighbors</strong> (connected in the knowledge graph)
          vs its <strong>semantic neighbors</strong> (close in embedding space). Overlap = both agree.
          Mismatches reveal hidden or surprising relationships.
        </p>
      </div>

      {/* Entity selector */}
      <div className="card !p-3">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Select Entity</div>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {nodes.sort((a, b) => b.degree - a.degree).map(n => (
            <button
              key={n.id}
              onClick={() => setSelectedEntity(n.id === selectedEntity ? null : n.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-all ${
                selectedEntity === n.id
                  ? 'border-brand-400 bg-brand-50 text-brand-700 font-semibold shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: n.color }} />
              {n.label}
            </button>
          ))}
        </div>
      </div>

      {!selectedEntity && (
        <div className="card text-center py-10 text-gray-400 text-sm">
          Select an entity above to see the hybrid comparison.
        </div>
      )}

      {analysisResult && (
        <div className="space-y-4">
          {/* Selected node header */}
          <div className="card !p-3 flex items-center gap-3">
            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: analysisResult.node.color }} />
            <div>
              <div className="font-semibold text-gray-800">{analysisResult.node.label}</div>
              <div className="text-xs text-gray-400 capitalize">{analysisResult.node.type} · degree {analysisResult.node.degree} · community #{analysisResult.node.community + 1}</div>
            </div>
          </div>

          {/* Three-column comparison */}
          <div className="grid grid-cols-3 gap-3">
            {/* Graph-only */}
            <div className="card !p-3 border-orange-100">
              <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                Graph Only
                <span className="ml-auto text-gray-400 font-normal">{analysisResult.graphOnly.length}</span>
              </div>
              <div className="text-[10px] text-gray-400 mb-2">Structurally connected, not semantically similar</div>
              {analysisResult.graphNeighbors
                .filter(n => analysisResult.graphOnly.some(o => o.id === n.id))
                .slice(0, 6)
                .map((n, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs py-1 border-b border-gray-50 last:border-0">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: n.color }} />
                    <span className="flex-1 truncate text-gray-700">{n.label}</span>
                    <span className="text-[9px] text-gray-400">{n.relation}</span>
                  </div>
                ))}
              {analysisResult.graphOnly.length === 0 && (
                <div className="text-xs text-gray-300 italic">None</div>
              )}
            </div>

            {/* Overlap */}
            <div className="card !p-3 border-green-100 bg-green-50">
              <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Overlap
                <span className="ml-auto text-gray-400 font-normal">{analysisResult.overlap.length}</span>
              </div>
              <div className="text-[10px] text-gray-400 mb-2">Both structurally & semantically related</div>
              {analysisResult.overlap.slice(0, 6).map((n, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs py-1 border-b border-green-100 last:border-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: n.color }} />
                  <span className="flex-1 truncate text-gray-800 font-medium">{n.label}</span>
                </div>
              ))}
              {analysisResult.overlap.length === 0 && (
                <div className="text-xs text-gray-400 italic">No overlap found</div>
              )}
            </div>

            {/* Embedding-only */}
            <div className="card !p-3 border-purple-100">
              <div className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Semantic Only
                <span className="ml-auto text-gray-400 font-normal">{analysisResult.embedOnly.length}</span>
              </div>
              <div className="text-[10px] text-gray-400 mb-2">Semantically close, not directly connected</div>
              {analysisResult.embedNeighbors
                .filter(n => analysisResult.embedOnly.some(o => o.id === n.id))
                .slice(0, 6)
                .map((n, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs py-1 border-b border-gray-50 last:border-0">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: n.color }} />
                    <span className="flex-1 truncate text-gray-700">{n.label}</span>
                    <span className="text-brand-500 font-mono text-[9px]">{n.similarity !== undefined ? `${(n.similarity * 100).toFixed(0)}%` : ''}</span>
                  </div>
                ))}
              {analysisResult.embedOnly.length === 0 && (
                <div className="text-xs text-gray-300 italic">None</div>
              )}
            </div>
          </div>

          {/* Insight card */}
          <div className="card bg-gray-50 !p-4">
            <div className="text-xs font-semibold text-gray-600 mb-2">Insight for "{analysisResult.node.label}"</div>
            <ul className="text-xs text-gray-600 space-y-1.5 leading-relaxed">
              {analysisResult.overlap.length > 0 && (
                <li className="flex items-start gap-1.5">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <span><strong>{analysisResult.overlap.map(n => n.label).join(', ')}</strong> appear in both the graph and semantic space — strong alignment.</span>
                </li>
              )}
              {analysisResult.graphOnly.length > 0 && (
                <li className="flex items-start gap-1.5">
                  <span className="text-orange-400 mt-0.5 flex-shrink-0">→</span>
                  <span><strong>{analysisResult.graphOnly.map(n => n.label).join(', ')}</strong> are structurally connected but semantically distant — functional relationship without meaning overlap.</span>
                </li>
              )}
              {analysisResult.embedOnly.length > 0 && (
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-400 mt-0.5 flex-shrink-0">~</span>
                  <span><strong>{analysisResult.embedOnly.map(n => n.label).join(', ')}</strong> are semantically similar but not connected in the graph — potential hidden relationships.</span>
                </li>
              )}
              {analysisResult.overlap.length === 0 && analysisResult.graphOnly.length === 0 && analysisResult.embedOnly.length === 0 && (
                <li className="text-gray-400">No neighbors found. This entity may be isolated or the graph needs more data.</li>
              )}
            </ul>
          </div>

          {/* Full neighbor lists */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card !p-3">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">All Graph Neighbors</div>
              {analysisResult.graphNeighbors.length === 0 && <div className="text-xs text-gray-300 italic">No connections</div>}
              {analysisResult.graphNeighbors.map((n, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-gray-50 last:border-0">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: n.color }} />
                  <span className="flex-1 truncate">{n.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${analysisResult.overlap.some(o => o.id === n.id) ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500'}`}>
                    {n.relation}
                  </span>
                </div>
              ))}
            </div>
            <div className="card !p-3">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">All Semantic Neighbors</div>
              {analysisResult.embedNeighbors.length === 0 && <div className="text-xs text-gray-300 italic">No embedding neighbors (build graph with embed model)</div>}
              {analysisResult.embedNeighbors.map((n, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-gray-50 last:border-0">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: n.color }} />
                  <span className="flex-1 truncate">{n.label}</span>
                  <span className={`text-[9px] font-mono ${analysisResult.overlap.some(o => o.id === n.id) ? 'text-green-600 font-semibold' : 'text-brand-500'}`}>
                    {(n.similarity * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
