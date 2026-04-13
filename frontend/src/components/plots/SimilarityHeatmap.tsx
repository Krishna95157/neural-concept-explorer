import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import type { PointData } from '../../types';

interface Props {
  matrix: number[][];
  points: PointData[];
}

export const SimilarityHeatmap: React.FC<Props> = ({ matrix, points }) => {
  const labels = points.map((p) => p.label ?? p.text).map((t) =>
    t.length > 18 ? t.slice(0, 16) + '…' : t
  );

  const trace = useMemo<Plotly.Data>(
    () => ({
      type: 'heatmap',
      z: matrix,
      x: labels,
      y: labels,
      colorscale: [
        [0,    '#f0f4ff'],
        [0.25, '#c7d7fd'],
        [0.5,  '#818cf8'],
        [0.75, '#4f46e5'],
        [1,    '#1e1b6e'],
      ],
      zmin: -1,
      zmax: 1,
      hovertemplate:
        '<b>%{y}</b> vs <b>%{x}</b><br>Cosine similarity: <b>%{z:.3f}</b><extra></extra>',
      showscale: true,
      colorbar: {
        title: { text: 'Cosine Sim', side: 'right', font: { color: '#6b7280', size: 11 } },
        tickfont: { color: '#6b7280', size: 10 },
        thickness: 14,
      },
    }),
    [matrix, labels]
  );

  const layout = useMemo<Partial<Plotly.Layout>>(
    () => ({
      paper_bgcolor: 'transparent',
      plot_bgcolor: '#f9fafb',
      font: { color: '#374151', family: 'Inter, sans-serif' },
      margin: { l: 110, r: 60, t: 20, b: 110 },
      xaxis: {
        tickangle: -35,
        tickfont: { size: 10, color: '#6b7280' },
        gridcolor: '#e5e7eb',
      },
      yaxis: {
        tickfont: { size: 10, color: '#6b7280' },
        gridcolor: '#e5e7eb',
      },
    }),
    []
  );

  return (
    <Plot
      data={[trace]}
      layout={layout as any}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: '100%', height: 480 }}
    />
  );
};
