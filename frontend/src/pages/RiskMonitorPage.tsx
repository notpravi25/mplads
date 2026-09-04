import React, { useState, useEffect } from 'react';
import { fetchRiskQueue, fetchFilters } from '../services/api';
import { WorkRecord, FilterOptions } from '../types';
import { RiskBadge } from '../components/cards/RiskBadge';
import { formatIndianCurrency, formatIndianNumber } from '../utils/formatters';
import { Search, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface RiskMonitorPageProps {
  initialSeverity?: string;
  onSelectWork: (workId: string) => void;
}

export const RiskMonitorPage: React.FC<RiskMonitorPageProps> = ({
  initialSeverity,
  onSelectWork
}) => {
  const [records, setRecords] = useState<WorkRecord[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [state, setState] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [severity, setSeverity] = useState<string>(initialSeverity || '');
  const [search, setSearch] = useState<string>('');

  const [filterOpts, setFilterOpts] = useState<FilterOptions | null>(null);

  // Load Dropdown Options
  useEffect(() => {
    fetchFilters()
      .then(setFilterOpts)
      .catch((err) => console.error('Failed to load filter options:', err));
  }, []);

  // Fetch Risk Queue
  const loadQueue = () => {
    setLoading(true);
    fetchRiskQueue({
      state,
      category,
      severity,
      search,
      page,
      limit: 25
    })
      .then((res) => {
        setRecords(res.records);
        setTotal(res.total);
        setTotalPages(res.total_pages || 1);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load risk monitor queue.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadQueue();
  }, [state, category, severity, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadQueue();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Risk Intelligence Audit Monitor</h2>
          <p className="text-xs text-slate-400 mt-1">
            Filterable priority audit queue ranking works by composite risk score across financial, vendor, NLP duplicate, and compliance indicators.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1.5 rounded border border-slate-700">
          Showing {formatIndianNumber(total)} Matching Works
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card-panel p-4 flex flex-wrap items-center gap-3 bg-slate-900/80">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Work ID, Title Description, MP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white font-medium placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </form>

        {/* Severity Dropdown */}
        <select
          value={severity}
          onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
          className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Risk Severities</option>
          <option value="CRITICAL">CRITICAL (85+ Score)</option>
          <option value="HIGH">HIGH (65 - 84 Score)</option>
          <option value="MEDIUM">MEDIUM (35 - 64 Score)</option>
          <option value="LOW">LOW (Below 35 Score)</option>
        </select>

        {/* State Dropdown */}
        <select
          value={state}
          onChange={(e) => { setState(e.target.value); setPage(1); }}
          className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 max-w-[180px]"
        >
          <option value="">All States / UTs</option>
          {filterOpts?.states.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>

        {/* Category Dropdown */}
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 max-w-[200px]"
        >
          <option value="">All Work Categories</option>
          {filterOpts?.categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <button
          onClick={() => { setState(''); setCategory(''); setSeverity(''); setSearch(''); setPage(1); }}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700 transition-all font-medium"
        >
          Reset Filters
        </button>
      </div>

      {/* Main Table Panel */}
      <div className="card-panel overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Loading Risk Audit Queue...
          </div>
        ) : error ? (
          <div className="p-6 text-xs text-red-400">{error}</div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No projects match the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Work ID</th>
                  <th className="py-3 px-3">State & Constituency</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Sanction Budget</th>
                  <th className="py-3 px-3 text-center">Financial</th>
                  <th className="py-3 px-3 text-center">Vendor</th>
                  <th className="py-3 px-3 text-center">Duplicate</th>
                  <th className="py-3 px-3 text-center">Compliance</th>
                  <th className="py-3 px-3 text-center">Composite Risk</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {records.map((r) => (
                  <tr key={r.work_id} className="hover:bg-slate-800/40 transition-all">
                    <td className="py-3 px-3 font-mono font-semibold text-blue-400">{r.work_id}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-100">{r.State}</div>
                      <div className="text-[11px] text-slate-400">{r.Constituency}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-[150px] truncate">{r.work_category}</td>
                    <td className="py-3 px-3 text-right font-mono font-medium">{formatIndianCurrency(r.sanction_amount)}</td>
                    
                    {/* Component Score Cells */}
                    <td className="py-3 px-3 text-center font-mono text-[11px]">
                      <span className={r.financial_risk_score >= 65 ? 'text-orange-400 font-bold' : 'text-slate-400'}>
                        {r.financial_risk_score.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-[11px]">
                      <span className={r.vendor_risk_score >= 65 ? 'text-orange-400 font-bold' : 'text-slate-400'}>
                        {r.vendor_risk_score.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-[11px]">
                      <span className={r.duplicate_risk_score >= 85 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                        {r.duplicate_risk_score ? r.duplicate_risk_score.toFixed(1) : '0'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-[11px]">
                      <span className={r.compliance_risk_score >= 35 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                        {r.compliance_risk_score.toFixed(1)}
                      </span>
                    </td>

                    {/* Composite Risk Badge */}
                    <td className="py-3 px-3 text-center">
                      <RiskBadge level={r.overall_risk_level} score={r.composite_risk_score} />
                    </td>

                    {/* View Detail Action */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onSelectWork(r.work_id)}
                        className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded transition-all inline-flex items-center gap-1 text-[11px] font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Page <strong className="text-slate-200">{page}</strong> of <strong className="text-slate-200">{totalPages}</strong>
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 bg-slate-800 disabled:opacity-40 text-slate-300 rounded border border-slate-700 flex items-center gap-1 text-xs font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 bg-slate-800 disabled:opacity-40 text-slate-300 rounded border border-slate-700 flex items-center gap-1 text-xs font-medium"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
