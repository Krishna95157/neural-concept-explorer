import React from 'react';

export const Header: React.FC = () => (
  <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
        E
      </div>
      <div>
        <h1 className="text-gray-900 font-bold text-base leading-tight">
          Embedding Space Explorer
        </h1>
        <p className="text-gray-400 text-xs">Visualise meaning in vector space</p>
      </div>
    </div>
    <div className="hidden md:flex items-center gap-2">
      {['FastAPI', 'sentence-transformers', 'Plotly.js'].map((t) => (
        <span key={t} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
          {t}
        </span>
      ))}
    </div>
  </header>
);
