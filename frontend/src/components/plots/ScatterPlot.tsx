import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import type { PointData } from '../../types';
import { getColor } from '../../utils/colors';

// Plotly's TypeScript types are strict about mode strings; cast via unknown.
type AnyData = Record<string, unknown>;

interface Props {
  points: PointData[];
  dimensions: 2 | 3;
  colorBy: 'category' | 'cluster';
  onPointClick?: (point: PointData) => void;
  selectedId?: number | null;
}

export const ScatterPlot: React.FC<Props> = ({
  points,
  dimensions,
  colorBy,
  onPointClick,
  selectedId,
}) => {
  const { traces, layout } = useMemo(() => {
    // Group by color key
    const groups: Record<string, PointData[]> = {};
    for (const p of points) {
      const key =
        colorBy === 'category'
          ? (p.category ?? 'unknown')
          : `Cluster ${p.cluster ?? 0}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    }

    const traces: AnyData[] = Object.entries(groups).map(([groupKey, pts]) => {
      const color = getColor(groupKey);
      const xs = pts.map((p) => p.x);
      const ys = pts.map((p) => p.y);
      const texts = pts.map((p) => p.label ?? p.text);
      const hovers = pts.map(
        (p) =>
          `<b>${p.label ?? p.text}</b><br>Category: ${p.category ?? '—'}<br>Cluster: ${p.cluster ?? '—'}<br>x: ${p.x.toFixed(3)}, y: ${p.y.toFixed(3)}`
      );
      const sizes = pts.map((p) => (p.id === selectedId ? 16 : 10));
      const lineWidths = pts.map((p) => (p.id === selectedId ? 3 : 0));

      if (dimensions === 3) {
        const zs = pts.map((p) => p.z ?? 0);
        return {
          type: 'scatter3d',
          mode: 'markers+text',
          name: groupKey,
          x: xs,
          y: ys,
          z: zs,
          text: texts,
          hovertext: hovers,
          hoverinfo: 'text',
          textfont: { size: 9, color: '#94a3b8' },
          textposition: 'top center',
          marker: {
            size: sizes,
            color,
            opacity: 0.85,
            line: { color: '#ffffff', width: lineWidths },
          },
          customdata: pts.map((p) => p.id),
        } as AnyData;
      }

      return {
        type: 'scatter',
        mode: 'markers+text',
        name: groupKey,
        x: xs,
        y: ys,
        text: texts,
        hovertext: hovers,
        hoverinfo: 'text',
        textfont: { size: 9, color: '#94a3b8' },
        textposition: 'top center',
        marker: {
          size: sizes,
          color,
          opacity: 0.85,
          line: { color: '#ffffff', width: lineWidths },
        },
        customdata: pts.map((p) => p.id),
      } as AnyData;
    });

    const baseLayout: Partial<Plotly.Layout> = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: '#f9fafb',
      font: { color: '#374151', family: 'Inter, sans-serif' },
      legend: {
        font: { color: '#374151', size: 11 },
        bgcolor: 'rgba(255,255,255,0.92)',
        bordercolor: '#e5e7eb',
        borderwidth: 1,
      },
      margin: { l: 40, r: 20, t: 20, b: 40 },
      xaxis: {
        gridcolor: '#e5e7eb',
        zerolinecolor: '#d1d5db',
        tickfont: { size: 10, color: '#9ca3af' },
      },
      yaxis: {
        gridcolor: '#e5e7eb',
        zerolinecolor: '#d1d5db',
        tickfont: { size: 10, color: '#9ca3af' },
      },
    };

    if (dimensions === 3) {
      (baseLayout as any).scene = {
        bgcolor: '#f9fafb',
        xaxis: { gridcolor: '#e5e7eb', color: '#9ca3af' },
        yaxis: { gridcolor: '#e5e7eb', color: '#9ca3af' },
        zaxis: { gridcolor: '#e5e7eb', color: '#9ca3af' },
      };
    }

    return { traces, layout: baseLayout };
  }, [points, dimensions, colorBy, selectedId]);

  return (
    <Plot
      data={traces as Plotly.Data[]}
      layout={layout as any}
      config={{ responsive: true, displayModeBar: true, displaylogo: false }}
      style={{ width: '100%', height: dimensions === 3 ? 520 : 460 }}
      onClick={(e: any) => {
        if (!onPointClick) return;
        const pt = e.points?.[0];
        if (pt == null) return;
        const id: number = pt.customdata;
        const found = points.find((p) => p.id === id);
        if (found) onPointClick(found);
      }}
    />
  );
};
