import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { useStore } from '../../hooks/useStore';
import { api } from '../../utils/api';
import type { TokenizerModel } from '../../types';

const TOKENIZER_MODELS: { key: TokenizerModel; label: string; desc: string }[] = [
  { key: 'bert', label: 'BERT (WordPiece)', desc: '## subword splits' },
  { key: 'gpt2', label: 'GPT-2 (BPE)', desc: 'Ġ byte-pair encoding' },
  { key: 'roberta', label: 'RoBERTa (BPE)', desc: 'RoBERTa tokenizer' },
];

const TOKEN_TYPE_COLORS: Record<string, string> = {
  special: '#94a3b8',
  subword: '#f59e0b',
  normal: '#4f6cf5',
};

export const TokenView: React.FC = () => {
  const {
    inputTexts,
    tokenizerModel, setTokenizerModel,
    tokenText, setTokenText,
    tokenizeResult, setTokenizeResult,
    corpusStats, setCorpusStats,
    tokenLoading, setTokenLoading,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'breakdown' | 'frequency' | 'cooccurrence'>('breakdown');
  const [error, setError] = useState<string | null>(null);

  const texts = inputTexts.split('\n').map(l => l.trim()).filter(Boolean);

  async function handleTokenize() {
    if (!tokenText.trim()) return;
    setTokenLoading(true);
    setError(null);
    try {
      const result = await api.tokenize(tokenText, tokenizerModel);
      setTokenizeResult(result);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e.message ?? 'Error');
    } finally {
      setTokenLoading(false);
    }
  }

  async function handleCorpusStats() {
    if (texts.length < 2) {
      setError('Load a dataset or enter texts first (at least 2 lines).');
      return;
    }
    setTokenLoading(true);
    setError(null);
    try {
      const result = await api.corpusStats(texts, tokenizerModel);
      setCorpusStats(result);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e.message ?? 'Error');
    } finally {
      setTokenLoading(false);
    }
  }

  function getTokenColor(token: string, isSubword: boolean): string {
    if (['[CLS]', '[SEP]', '<s>', '</s>', '<|endoftext|>'].includes(token)) return TOKEN_TYPE_COLORS.special;
    if (isSubword) return TOKEN_TYPE_COLORS.subword;
    return TOKEN_TYPE_COLORS.normal;
  }

  return (
    <div className="space-y-4">
      {/* Sub-tab bar */}
      <div className="flex gap-1 border-b border-gray-200">
        {(['breakdown', 'frequency', 'cooccurrence'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveSubTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              activeSubTab === t
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {t === 'breakdown' ? 'Token Breakdown' : t === 'frequency' ? 'Frequency Chart' : 'Co-occurrence'}
          </button>
        ))}
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Tokenizer model selector */}
      <div className="card">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tokenizer</div>
        <div className="flex gap-2 flex-wrap">
          {TOKENIZER_MODELS.map((m) => (
            <button
              key={m.key}
              onClick={() => setTokenizerModel(m.key)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                tokenizerModel === m.key
                  ? 'border-brand-400 bg-brand-50 text-brand-600 font-semibold'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <span className="font-medium">{m.label}</span>
              <span className="ml-1.5 text-gray-400">{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── BREAKDOWN TAB ── */}
      {activeSubTab === 'breakdown' && (
        <div className="space-y-3">
          <div className="card space-y-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Input Sentence</div>
            <textarea
              value={tokenText}
              onChange={(e) => setTokenText(e.target.value)}
              placeholder="Enter a sentence to tokenize…"
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleTokenize}
                disabled={tokenLoading || !tokenText.trim()}
                className="btn-primary text-sm py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {tokenLoading ? 'Tokenizing…' : 'Tokenize'}
              </button>
              <button
                onClick={() => setTokenText(texts[0] ?? '')}
                disabled={!texts.length}
                className="btn-secondary text-xs disabled:opacity-40"
              >
                Use first text
              </button>
            </div>
          </div>

          {tokenizeResult && (
            <div className="card space-y-4">
              {/* Stats row */}
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'Tokens', value: tokenizeResult.token_count },
                  { label: 'Unique', value: tokenizeResult.unique_tokens },
                  { label: 'Model', value: tokenizeResult.model_used.split('/').pop() ?? tokenizeResult.model_used },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center px-4 py-2 rounded-lg bg-brand-50 border border-brand-100">
                    <span className="text-lg font-bold text-brand-600">{s.value}</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Token tiles */}
              <div>
                <div className="text-xs text-gray-500 mb-2 flex items-center gap-4">
                  <span>Token breakdown:</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" /> Normal</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Subword</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" /> Special</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tokenizeResult.tokens.map((token, i) => {
                    const isSubword = tokenizeResult.is_subword[i];
                    const bg = getTokenColor(token, isSubword);
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-0.5 transition-transform hover:scale-105"
                        title={`ID: ${tokenizeResult.token_ids[i]}`}
                      >
                        <span
                          className="px-2 py-1 rounded text-xs font-mono text-white"
                          style={{ backgroundColor: bg }}
                        >
                          {token}
                        </span>
                        <span className="text-[9px] text-gray-400">{tokenizeResult.token_ids[i]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Flow: original → tokens */}
              <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-xs text-gray-400 mb-1">Original text →</div>
                <div className="text-sm text-gray-700 font-medium leading-relaxed">
                  {tokenizeResult.original_text}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span className="text-xs text-gray-400">{tokenizeResult.token_count} tokens</span>
                </div>
              </div>
            </div>
          )}

          {!tokenizeResult && (
            <div className="card text-center py-10 text-gray-400 text-sm">
              Enter a sentence above and click Tokenize to see the breakdown.
            </div>
          )}
        </div>
      )}

      {/* ── FREQUENCY TAB ── */}
      {activeSubTab === 'frequency' && (
        <div className="space-y-3">
          <div className="card">
            <div className="text-xs text-gray-500 mb-3">
              Analyze token frequencies across all {texts.length} loaded texts.
            </div>
            <button
              onClick={handleCorpusStats}
              disabled={tokenLoading || texts.length < 2}
              className="btn-primary text-sm py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {tokenLoading ? 'Analyzing…' : 'Analyze Corpus Tokens'}
            </button>
          </div>

          {corpusStats && (
            <>
              {/* Stats summary */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Tokens', value: corpusStats.total_tokens.toLocaleString() },
                  { label: 'Vocab Size', value: corpusStats.vocab_size.toLocaleString() },
                  { label: 'Avg / Text', value: corpusStats.avg_tokens_per_text },
                ].map((s) => (
                  <div key={s.label} className="card text-center !p-3">
                    <div className="text-2xl font-bold text-brand-600">{s.value}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Frequency bar chart */}
              <div className="card !p-3">
                <div className="text-xs font-semibold text-gray-600 mb-2">Top 20 Tokens by Frequency</div>
                <Plot
                  data={[{
                    type: 'bar',
                    x: corpusStats.token_frequencies.slice(0, 20).map(t => t.token),
                    y: corpusStats.token_frequencies.slice(0, 20).map(t => t.count),
                    marker: {
                      color: corpusStats.token_frequencies.slice(0, 20).map((_, i) =>
                        `hsl(${220 + i * 4}, 70%, ${65 - i * 1.5}%)`
                      ),
                    },
                    hovertemplate: '<b>%{x}</b><br>Count: %{y}<extra></extra>',
                  } as any]}
                  layout={{
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: '#f9fafb',
                    font: { color: '#374151', family: 'Inter, sans-serif', size: 11 },
                    margin: { l: 40, r: 10, t: 10, b: 60 },
                    xaxis: { tickangle: -40, tickfont: { size: 10 }, gridcolor: '#f3f4f6' },
                    yaxis: { gridcolor: '#e5e7eb', tickfont: { size: 10 } },
                    bargap: 0.3,
                  } as any}
                  config={{ responsive: true, displayModeBar: false }}
                  style={{ width: '100%', height: 280 }}
                />
              </div>
            </>
          )}

          {!corpusStats && (
            <div className="card text-center py-10 text-gray-400 text-sm">
              Click Analyze Corpus Tokens to generate statistics.
            </div>
          )}
        </div>
      )}

      {/* ── CO-OCCURRENCE TAB ── */}
      {activeSubTab === 'cooccurrence' && (
        <div className="space-y-3">
          <div className="card">
            <div className="text-xs text-gray-500 mb-3">
              Shows which tokens frequently appear together within the same text.
            </div>
            <button
              onClick={handleCorpusStats}
              disabled={tokenLoading || texts.length < 2}
              className="btn-primary text-sm py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {tokenLoading ? 'Analyzing…' : 'Compute Co-occurrence'}
            </button>
          </div>

          {corpusStats && corpusStats.cooccurrence.length > 0 && (
            <div className="card !p-3">
              <div className="text-xs font-semibold text-gray-600 mb-2">
                Token Co-occurrence Heatmap (top pairs)
              </div>
              <CooccurrenceHeatmap data={corpusStats.cooccurrence.slice(0, 25)} />
            </div>
          )}

          {corpusStats && corpusStats.cooccurrence.length === 0 && (
            <div className="card text-center py-8 text-gray-400 text-sm">
              Not enough co-occurrence data. Try a larger dataset.
            </div>
          )}

          {!corpusStats && (
            <div className="card text-center py-10 text-gray-400 text-sm">
              Click Compute Co-occurrence to see the heatmap.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function CooccurrenceHeatmap({ data }: { data: Array<{ token_a: string; token_b: string; count: number }> }) {
  const tokens = Array.from(new Set(data.flatMap(d => [d.token_a, d.token_b]))).slice(0, 15);
  const n = tokens.length;
  const matrix = Array.from({ length: n }, () => Array(n).fill(0));

  for (const d of data) {
    const i = tokens.indexOf(d.token_a);
    const j = tokens.indexOf(d.token_b);
    if (i >= 0 && j >= 0) {
      matrix[i][j] = d.count;
      matrix[j][i] = d.count;
    }
  }

  return (
    <Plot
      data={[{
        type: 'heatmap',
        z: matrix,
        x: tokens,
        y: tokens,
        colorscale: [
          [0, '#f9fafb'],
          [0.3, '#dde8ff'],
          [0.6, '#6e8efb'],
          [1, '#2c40c8'],
        ],
        hovertemplate: '%{y} + %{x}: %{z}<extra></extra>',
        showscale: true,
      } as any]}
      layout={{
        paper_bgcolor: 'transparent',
        plot_bgcolor: '#f9fafb',
        font: { color: '#374151', family: 'Inter, sans-serif', size: 10 },
        margin: { l: 80, r: 20, t: 10, b: 80 },
        xaxis: { tickangle: -45, tickfont: { size: 9 } },
        yaxis: { tickfont: { size: 9 } },
      } as any}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: '100%', height: 360 }}
    />
  );
}
