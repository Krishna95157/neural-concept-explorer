import React from 'react';

interface CardProps {
  title: string;
  tag: string;
  tagColor: string;
  children: React.ReactNode;
}

function ExplainCard({ title, tag, tagColor, children }: CardProps) {
  return (
    <div className="card space-y-3">
      <div className="flex items-center gap-3">
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
          style={{ background: tagColor + '22', color: tagColor }}
        >
          {tag}
        </span>
        <h3 className="text-gray-800 font-semibold">{title}</h3>
      </div>
      <div className="text-gray-500 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export const ExplainPanel: React.FC = () => (
  <div className="space-y-4">
    {/* Pipeline diagram */}
    <div className="card">
      <h3 className="text-gray-800 font-semibold mb-4">The Embedding Pipeline</h3>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {[
          { label: 'Raw Text', color: '#6e8efb', icon: '📝' },
          { label: 'Tokenise', color: '#a777e3', icon: '✂️' },
          { label: 'Embedding Model', color: '#f6a623', icon: '🧠' },
          { label: 'High-Dim Vector', color: '#50e3c2', icon: '📐' },
          { label: 'Similarity', color: '#f55e5e', icon: '📊' },
          { label: 'PCA / t-SNE / UMAP', color: '#fc83d2', icon: '🔻' },
          { label: '2D / 3D Plot', color: '#4ee4a6', icon: '🗺️' },
        ].map((step, i, arr) => (
          <React.Fragment key={step.label}>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border"
              style={{
                background: step.color + '18',
                borderColor: step.color + '55',
                color: step.color,
              }}
            >
              <span>{step.icon}</span>
              {step.label}
            </div>
            {i < arr.length - 1 && (
              <svg className="w-4 h-4 text-slate-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <ExplainCard title="What is an Embedding?" tag="core concept" tagColor="#6e8efb">
        An <strong className="text-slate-200">embedding</strong> maps text (a word, sentence, or
        document) to a dense numeric vector in a high-dimensional space — typically 50 to 768
        dimensions. Semantically similar inputs produce geometrically close vectors. The model
        learns these mappings during pre-training on billions of text examples.
      </ExplainCard>

      <ExplainCard title="Cosine Similarity" tag="math" tagColor="#50e3c2">
        Cosine similarity measures the <strong className="text-slate-200">angle</strong> between two
        vectors rather than their magnitude. A value of{' '}
        <code className="text-[#50e3c2] bg-[#0f1117] px-1 rounded">1.0</code> means identical
        direction (semantically identical), <code className="text-[#50e3c2] bg-[#0f1117] px-1 rounded">0.0</code>{' '}
        means orthogonal (unrelated), and{' '}
        <code className="text-[#50e3c2] bg-[#0f1117] px-1 rounded">-1.0</code> means opposite.
        <br />
        <br />
        <code className="text-xs font-mono text-[#94a3b8]">
          sim(A, B) = (A · B) / (‖A‖ · ‖B‖)
        </code>
      </ExplainCard>

      <ExplainCard title="PCA vs t-SNE vs UMAP" tag="reduction" tagColor="#f6a623">
        <strong className="text-slate-200">PCA</strong> is a linear projection that preserves
        global variance — fast, deterministic, and best for overview layouts.
        <br />
        <br />
        <strong className="text-slate-200">t-SNE</strong> is a non-linear method that preserves
        local neighborhoods — excellent for revealing clusters but slower and non-deterministic
        across runs.
        <br />
        <br />
        <strong className="text-slate-200">UMAP</strong> balances both local and global structure,
        runs faster than t-SNE, and scales to larger datasets.
      </ExplainCard>

      <ExplainCard title="Static vs Contextual Embeddings" tag="models" tagColor="#a777e3">
        <strong className="text-slate-200">Static embeddings</strong> (GloVe, Word2Vec) assign one
        fixed vector per word regardless of context. "bank" always maps to the same point.
        <br />
        <br />
        <strong className="text-slate-200">Contextual embeddings</strong> (MiniLM, MPNet, BERT)
        produce a different vector for each word depending on its surrounding context. "bank" in
        "river bank" and "bank account" land in different regions — this is the context-shift
        demo.
      </ExplainCard>

      <ExplainCard title="Why 2D Is Not the Whole Truth" tag="warning" tagColor="#f55e5e">
        Dimensionality reduction is an <em>approximation</em>. Compressing 384 dimensions into 2
        will always discard information. Two points that look far apart in 2D may be very close in
        the original space. Always cross-reference the cosine similarity heatmap — it shows the
        <strong className="text-slate-200"> exact</strong> pairwise relationships without any
        distortion.
      </ExplainCard>

      <ExplainCard title="Clustering (KMeans)" tag="clustering" tagColor="#4ee4a6">
        KMeans partitions points into <em>k</em> clusters by minimising the sum of squared
        distances to cluster centroids. In embedding space this groups semantically related items
        together. Cluster colours in the scatter plot are assigned automatically — compare them
        with the known category labels to evaluate embedding quality.
      </ExplainCard>
    </div>
  </div>
);
