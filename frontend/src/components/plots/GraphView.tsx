import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { GraphData, GraphNode, GraphEdge } from '../../types';

interface Props {
  data: GraphData;
  selectedNode: string | null;
  onNodeClick: (nodeId: string) => void;
}

interface SimNode extends GraphNode {
  vx: number;
  vy: number;
  fx?: number | null;
  fy?: number | null;
}

const WIDTH = 900;
const HEIGHT = 540;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export const GraphView: React.FC<Props> = ({ data, selectedNode, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [edges] = useState<GraphEdge[]>(data.edges);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const frameRef = useRef<number>();
  const draggingRef = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const isPanningRef = useRef<{ ox: number; oy: number; tx: number; ty: number } | null>(null);

  // Initialize node positions from layout
  useEffect(() => {
    const w = WIDTH, h = HEIGHT;
    const xs = data.nodes.map(n => n.x);
    const ys = data.nodes.map(n => n.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const scaleX = maxX > minX ? (w * 0.7) / (maxX - minX) : 1;
    const scaleY = maxY > minY ? (h * 0.7) / (maxY - minY) : 1;
    const s = Math.min(scaleX, scaleY, 150);

    const simNodes: SimNode[] = data.nodes.map(n => ({
      ...n,
      x: (n.x - (minX + maxX) / 2) * s + w / 2,
      y: (n.y - (minY + maxY) / 2) * s + h / 2,
      vx: 0, vy: 0,
    }));
    setNodes(simNodes);
  }, [data]);

  // Simple force simulation
  useEffect(() => {
    if (nodes.length === 0) return;
    let running = true;
    let iter = 0;

    function tick() {
      if (!running || iter > 200) return;
      iter++;
      const alpha = Math.max(0.01, 1 - iter / 200);

      setNodes(prev => {
        const next = prev.map(n => ({ ...n }));
        const nodeMap = new Map(next.map(n => [n.id, n]));

        // Repulsion
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const a = next[i], b = next[j];
            const dx = b.x - a.x, dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = (2500 / (dist * dist)) * alpha;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            a.vx -= fx; a.vy -= fy;
            b.vx += fx; b.vy += fy;
          }
        }

        // Attraction along edges
        for (const edge of edges) {
          const a = nodeMap.get(edge.source), b = nodeMap.get(edge.target);
          if (!a || !b) continue;
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const target = 100;
          const force = ((dist - target) / dist) * 0.04 * alpha;
          const fx = dx * force, fy = dy * force;
          if (!a.fx) { a.vx += fx; a.vy += fy; }
          if (!b.fx) { b.vx -= fx; b.vy -= fy; }
        }

        // Center gravity
        const cx = WIDTH / 2, cy = HEIGHT / 2;
        for (const n of next) {
          if (n.fx != null) { n.x = n.fx; n.y = n.fy ?? n.y; continue; }
          n.vx += (cx - n.x) * 0.005 * alpha;
          n.vy += (cy - n.y) * 0.005 * alpha;
          n.vx *= 0.88; n.vy *= 0.88;
          n.x = clamp(n.x + n.vx, 30, WIDTH - 30);
          n.y = clamp(n.y + n.vy, 30, HEIGHT - 30);
        }
        return next;
      });

      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [data, edges]);

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // Drag handlers
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const svgRect = svgRef.current!.getBoundingClientRect();
    const mx = (e.clientX - svgRect.left - transform.x) / transform.scale;
    const my = (e.clientY - svgRect.top - transform.y) / transform.scale;
    draggingRef.current = { id: nodeId, ox: mx, oy: my };
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, fx: n.x, fy: n.y } : n));
  }, [transform]);

  const handleSvgMouseMove = useCallback((e: React.MouseEvent) => {
    const svgRect = svgRef.current!.getBoundingClientRect();

    if (draggingRef.current) {
      const mx = (e.clientX - svgRect.left - transform.x) / transform.scale;
      const my = (e.clientY - svgRect.top - transform.y) / transform.scale;
      const { id } = draggingRef.current;
      setNodes(prev => prev.map(n => n.id === id ? { ...n, fx: mx, fy: my, x: mx, y: my } : n));
    } else if (isPanningRef.current) {
      const { ox, oy, tx, ty } = isPanningRef.current;
      setTransform(t => ({ ...t, x: tx + (e.clientX - ox), y: ty + (e.clientY - oy) }));
    }
  }, [transform]);

  const handleSvgMouseUp = useCallback((_e: React.MouseEvent) => {
    if (draggingRef.current) {
      const { id } = draggingRef.current;
      // Unpin after drag
      setNodes(prev => prev.map(n => n.id === id ? { ...n, fx: null, fy: null } : n));
      draggingRef.current = null;
    }
    isPanningRef.current = null;
  }, []);

  const handleSvgMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as Element).tagName === 'svg' || (e.target as Element).tagName === 'rect') {
      isPanningRef.current = { ox: e.clientX, oy: e.clientY, tx: transform.x, ty: transform.y };
    }
  }, [transform]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(t => ({
      ...t,
      scale: clamp(t.scale * delta, 0.3, 3),
    }));
  }, []);

  const relLabel: Record<string, string> = {
    co_occurs: '~',
    uses: '→ uses',
    is_a: '→ is a',
    improves: '→ improves',
    combines: '→ combines',
    requires: '→ requires',
    applied_to: '→ applied to',
    trained_on: '→ trained on',
    introduced_by: '→ by',
    replaces: '→ replaces',
    produces: '→ produces',
  };

  return (
    <div className="relative">
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        {[
          { label: '+', delta: 1.2 },
          { label: '−', delta: 0.8 },
          { label: '⌖', delta: 0, reset: true },
        ].map(({ label, delta, reset }) => (
          <button
            key={label}
            onClick={() => {
              if (reset) setTransform({ x: 0, y: 0, scale: 1 });
              else setTransform(t => ({ ...t, scale: clamp(t.scale * delta, 0.3, 3) }));
            }}
            className="w-7 h-7 rounded border border-gray-200 bg-white text-gray-600 text-sm hover:bg-gray-50 shadow-sm flex items-center justify-center"
          >
            {label}
          </button>
        ))}
      </div>

      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="rounded-xl border border-gray-200 bg-gray-50 cursor-grab active:cursor-grabbing"
        style={{ userSelect: 'none' }}
        onMouseMove={handleSvgMouseMove}
        onMouseUp={handleSvgMouseUp}
        onMouseLeave={handleSvgMouseUp}
        onMouseDown={handleSvgMouseDown}
        onWheel={handleWheel}
      >
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#d1d5db" />
          </marker>
          <marker id="arrow-selected" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#4f6cf5" />
          </marker>
        </defs>

        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
          {/* Background */}
          <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="transparent" />

          {/* Edges */}
          {edges.map((edge, i) => {
            const src = nodeMap.get(edge.source);
            const tgt = nodeMap.get(edge.target);
            if (!src || !tgt) return null;
            const isSelected = edge.source === selectedNode || edge.target === selectedNode;
            const isHovered = edge.source === hoveredNode || edge.target === hoveredNode;
            const highlight = isSelected || isHovered;

            // Offset for directionality
            const dx = tgt.x - src.x, dy = tgt.y - src.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = dx / dist, ny = dy / dist;
            const r = 14;
            const x1 = src.x + nx * r, y1 = src.y + ny * r;
            const x2 = tgt.x - nx * (r + 4), y2 = tgt.y - ny * (r + 4);

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            return (
              <g key={i}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={highlight ? '#4f6cf5' : edge.relation === 'co_occurs' ? '#e5e7eb' : '#d1d5db'}
                  strokeWidth={highlight ? 2 : edge.relation === 'co_occurs' ? 1 : 1.5}
                  strokeDasharray={edge.relation === 'co_occurs' ? '4,3' : undefined}
                  markerEnd={edge.relation !== 'co_occurs' ? (highlight ? 'url(#arrow-selected)' : 'url(#arrow)') : undefined}
                  opacity={highlight ? 1 : 0.5}
                />
                {highlight && edge.relation !== 'co_occurs' && (
                  <text x={midX} y={midY - 4} textAnchor="middle" fontSize={8} fill="#4f6cf5" fontFamily="Inter, sans-serif">
                    {relLabel[edge.relation] ?? edge.relation}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = node.id === selectedNode;
            const isHovered = node.id === hoveredNode;
            const r = Math.max(10, Math.min(22, 10 + node.frequency * 2));

            return (
              <g
                key={node.id}
                transform={`translate(${node.x},${node.y})`}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={(e) => { e.stopPropagation(); onNodeClick(node.id); }}
                style={{ cursor: 'pointer' }}
              >
                {/* Selection ring */}
                {(isSelected || isHovered) && (
                  <circle
                    r={r + 5}
                    fill="none"
                    stroke={isSelected ? '#4f6cf5' : '#94a3b8'}
                    strokeWidth={2}
                    opacity={0.6}
                  />
                )}
                <circle
                  r={r}
                  fill={node.color}
                  opacity={isSelected || isHovered ? 1 : 0.82}
                  stroke="white"
                  strokeWidth={2}
                />
                <text
                  textAnchor="middle"
                  dy={r + 11}
                  fontSize={9}
                  fontFamily="Inter, sans-serif"
                  fill={isSelected ? '#1d4ed8' : '#374151'}
                  fontWeight={isSelected ? '600' : '400'}
                  style={{ pointerEvents: 'none' }}
                >
                  {node.label.length > 14 ? node.label.slice(0, 12) + '…' : node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
