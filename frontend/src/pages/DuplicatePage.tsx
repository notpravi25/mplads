import React, { useState, useEffect } from 'react';
import { fetchDuplicateCandidates, fetchFilters } from '../services/api';
import { CandidateDuplicatePair, FilterOptions } from '../types';
import { formatIndianCurrency } from '../utils/formatters';
import { Copy, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface DuplicatePageProps {
  onSelectWork: (workId: string) => void;
}

export const DuplicatePage: React.FC<DuplicatePageProps> = ({ onSelectWork }) => {
  const [candidates, setCandidates] = useState<CandidateDuplicatePair[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState<string>('');
  const [minSim, setMinSim] = useState<number>(75.0);
  const [filterOpts, setFilterOpts] = useState<FilterOptions | null>(null);

  useEffect(() => {
    fetchFilters().then(setFilterOpts).catch(console.error);
  }, []);

  const loadCandidates = () => {
    setLoading(true);
    fetchDuplicateCandidates({
      state,
      min_similarity: minSim,
      page,
      limit: 15
    })
      .then((res) => {
        setCandidates(res.records);
        setTotal(res.total);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load candidate duplicate pairs.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCandidates();
  }, [state, minSim, page]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Candidate Duplicate & Similar Work Inspector</h2>
          <p className="text-xs text-slate-400 mt-1">
            Pairwise textual and semantic similarity candidates extracted using TF-IDF vectorization and cosine similarity within constituency blocks.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1.5 rounded border border-slate-700">
          Showing {total.toLocaleString()} Candidate Pairs
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card-panel p-4 flex flex-wrap items-center gap-3 bg-slate-900/80">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
          <span>Min Similarity:</span>
          <select
            value={minSim}
            onChange={(e) => { setMinSim(parseFloat(e.target.value)); setPage(1); }}
            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
          >
            <option value={95.0}>95% Exact Similarity</option>
            <option value={85.0}>85% High Similarity</option>
            <option value={75.0}>75% Moderate Similarity</option>
            <option value={70.0}>70% Baseline Similarity</option>
          </select>
        </div>

        <select
          value={state}
          onChange={(e) => { setState(e.target.value); setPage(1); }}
          className="bg-slate-950 border border-slate-700 rounded px-3 py-1 text-xs text-slate-200 max-w-[200px]"
        >
          <option value="">All States / UTs</option>
          {filterOpts?.states.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      </div>

      {/* Candidates List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading Candidate Duplicate Pairs...</div>
      ) : error ? (
        <div className="p-6 text-xs text-red-400">{error}</div>
      ) : candidates.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 card-panel">No duplicate candidates match the selected filters.</div>
      ) : (
        <div className="space-y-4">
          {candidates.map((pair, idx) => (
            <div key={idx} className="card-panel p-5 space-y-3 bg-slate-900/90 border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-100 uppercase">{pair.state} • {pair.constituency}</span>
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {pair.similarity_score.toFixed(1)}% Match Similarity
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectWork(pair.work_id_1)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded text-xs border border-slate-700 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Work 1
                  </button>
                  <button
                    onClick={() => onSelectWork(pair.work_id_2)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded text-xs border border-slate-700 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Work 2
                  </button>
                </div>
              </div>

              {/* Side-by-Side Description Text Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="flex justify-between font-mono text-[11px] text-slate-400 border-b border-slate-800 pb-1">
                    <span className="font-semibold text-blue-400">Work ID: {pair.work_id_1}</span>
                    <span>Budget: {formatIndianCurrency(pair.sanction_amount_1)}</span>
                  </div>
                  <p className="text-slate-200 pt-1 leading-relaxed">{pair.description_1}</p>
                </div>

                <div className="p-3.5 rounded bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="flex justify-between font-mono text-[11px] text-slate-400 border-b border-slate-800 pb-1">
                    <span className="font-semibold text-blue-400">Work ID: {pair.work_id_2}</span>
                    <span>Budget: {formatIndianCurrency(pair.sanction_amount_2)}</span>
                  </div>
                  <p className="text-slate-200 pt-1 leading-relaxed">{pair.description_2}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
