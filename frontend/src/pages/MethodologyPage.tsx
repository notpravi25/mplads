import React from 'react';
import { Layers, ShieldCheck, Calculator, FileText, Database } from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Analytical Methodology & Risk Engine Specification</h2>
        <p className="text-xs text-slate-400 mt-1">
          Complete mathematical formulas, model specifications, feature definitions, and audit interpretability rules powering the MPLADS Risk Intelligence Platform.
        </p>
      </div>

      {/* Purpose Banner */}
      <div className="card-panel p-4 bg-slate-900/90 border-blue-900/40 text-xs text-slate-300 space-y-1">
        <strong className="text-blue-400 font-semibold">Why is Analytical Methodology Included?</strong>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          Public-sector governance and audit compliance require complete mathematical transparency. Government monitoring systems cannot rely on unexplainable &quot;black-box AI&quot;. This section documents the exact, verifiable formulas used by the composite risk engine so government officials can audit and validate every risk flag.
        </p>
      </div>

      {/* 1. Composite Risk Score Weighting */}
      <div className="card-panel p-6 space-y-3 bg-slate-900/90 border-slate-700">
        <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm border-b border-slate-800 pb-2">
          <Calculator className="w-4 h-4" /> 1. Composite Risk Intelligence Aggregation Formula
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The Composite Risk Score combines normalized scores (range 0 to 100) across 4 analytical components using documented administrative weights:
        </p>
        <div className="p-4 rounded-md bg-slate-950 border border-slate-800 font-mono text-xs text-blue-300 text-center">
          Composite Risk Score = (0.35 × Financial Risk) + (0.25 × Vendor Risk) + (0.25 × Duplicate NLP Risk) + (0.15 × Compliance Risk)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-amber-400 font-bold">Financial Risk (35%)</span>
            <p className="text-slate-400 text-[11px] mt-1">Peer group IQR, percentile rank & Isolation Forest score</p>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-orange-400 font-bold">Vendor Risk (25%)</span>
            <p className="text-slate-400 text-[11px] mt-1">Constituency market share, HHI index & payment bursts</p>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-indigo-400 font-bold">Duplicate NLP (25%)</span>
            <p className="text-slate-400 text-[11px] mt-1">TF-IDF ngram vectorization & cosine similarity</p>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-emerald-400 font-bold">Compliance (15%)</span>
            <p className="text-slate-400 text-[11px] mt-1">Deterministic evidence image & date sequence rules</p>
          </div>
        </div>
      </div>

      {/* 2. Statistical IQR & Peer Baseline Formula */}
      <div className="card-panel p-6 space-y-3 bg-slate-900/90 border-slate-700">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm border-b border-slate-800 pb-2">
          <Layers className="w-4 h-4" /> 2. Financial Anomaly Engine & Peer Group Baselines
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Financial comparisons are evaluated within localized peer groups defined by <code className="text-amber-300 font-mono">(Work Category, State)</code>:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-semibold text-slate-200 uppercase text-[11px]">Peer Ratio Formula:</span>
            <div className="font-mono text-amber-300">Peer Ratio = Sanctioned Budget / Peer Group Median</div>
            <p className="text-slate-400 text-[11px]">Quantifies how many times higher a project budget is relative to similar works.</p>
          </div>
          <div className="p-4 rounded bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-semibold text-slate-200 uppercase text-[11px]">IQR Outlier Upper Bound:</span>
            <div className="font-mono text-amber-300">Upper Bound = Q3 + (1.5 × IQR)</div>
            <p className="text-slate-400 text-[11px]">Statistical fence identifying extreme upper tail expenditure outliers.</p>
          </div>
        </div>
      </div>

      {/* 3. NLP Cosine Similarity Formula */}
      <div className="card-panel p-6 space-y-3 bg-slate-900/90 border-slate-700">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm border-b border-slate-800 pb-2">
          <FileText className="w-4 h-4" /> 3. Potential Duplicate Detection (TF-IDF & Cosine Similarity)
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Text descriptions are tokenized into n-grams (1,2) and transformed into term-frequency inverse-document frequency vectors:
        </p>
        <div className="p-4 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 text-center">
          Cosine Similarity(A, B) = (A · B) / (||A|| × ||B||)
        </div>
        <p className="text-xs text-slate-400">
          Pairs with similarity match threshold &ge; 70% within the same constituency are extracted as candidate duplicate pairs for reviewer verification.
        </p>
      </div>
    </div>
  );
};
