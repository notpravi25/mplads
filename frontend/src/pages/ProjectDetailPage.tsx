import React, { useState, useEffect } from 'react';
import { fetchWorkDetail } from '../services/api';
import { WorkRecord, CandidateDuplicatePair } from '../types';
import { RiskBadge } from '../components/cards/RiskBadge';
import { RiskEvidencePanel } from '../components/risk/RiskEvidencePanel';
import { formatIndianCurrency } from '../utils/formatters';
import { ArrowLeft, Landmark, DollarSign, Calendar, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ProjectDetailPageProps {
  workId: string;
  onBack: () => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ workId, onBack }) => {
  const [data, setData] = useState<{ work: WorkRecord; candidate_duplicates: CandidateDuplicatePair[] } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchWorkDetail(workId)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load project detail record.');
        setLoading(false);
      });
  }, [workId]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium">Loading 360° Decision Support Profile for {workId}...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <button onClick={onBack} className="mb-4 text-xs text-blue-400 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Risk Monitor
        </button>
        <div className="p-4 bg-red-950/40 border border-red-800 rounded text-xs text-red-300">
          <p className="font-semibold">Unable to Load Project Record</p>
          <p className="mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const { work, candidate_duplicates } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Top Back Navigation */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 transition-all mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Risk Queue
        </button>

        {/* Project Header Banner */}
        <div className="card-panel p-6 bg-slate-900/90 border-slate-700">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-blue-400 bg-blue-950/60 px-3 py-1 rounded border border-blue-800/40">
                  {work.work_id}
                </span>
                <span className="text-xs text-slate-400 font-medium">{work.work_category}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-2 leading-snug">
                {work.description || 'Project description text unavailable.'}
              </h2>
              <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2">
                <span>State: <strong className="text-slate-200">{work.State}</strong></span>
                <span>Constituency: <strong className="text-slate-200">{work.Constituency}</strong></span>
                <span>MP: <strong className="text-slate-200">{work.mp_name || 'N/A'}</strong></span>
              </div>
            </div>

            {/* Overall Composite Score Box */}
            <div className="text-right p-4 rounded-lg bg-slate-850 border border-slate-700 flex flex-col items-end justify-center min-w-[180px]">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Composite Risk Score</span>
              <div className="text-3xl font-extrabold text-slate-100 my-1">{work.composite_risk_score.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
              <RiskBadge level={work.overall_risk_level} />
            </div>
          </div>
        </div>
      </div>

      {/* Component Risk Scores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-panel p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">Financial Risk Component</span>
          <div className="text-2xl font-bold text-slate-100 my-2">{work.financial_risk_score.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
          <RiskBadge level={work.financial_risk_level} />
        </div>

        <div className="card-panel p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-400">Vendor Risk Component</span>
          <div className="text-2xl font-bold text-slate-100 my-2">{work.vendor_risk_score.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
          <RiskBadge level={work.vendor_risk_level} />
        </div>

        <div className="card-panel p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">Duplicate NLP Component</span>
          <div className="text-2xl font-bold text-slate-100 my-2">{work.duplicate_risk_score ? work.duplicate_risk_score.toFixed(1) : '0.0'} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
          <span className="text-xs text-slate-400">
            {work.duplicate_risk_score >= 85 ? 'HIGH Overlap Candidate' : 'No Major Similarity'}
          </span>
        </div>

        <div className="card-panel p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Compliance Risk Component</span>
          <div className="text-2xl font-bold text-slate-100 my-2">{work.compliance_risk_score.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
          <RiskBadge level={work.compliance_risk_level} />
        </div>
      </div>

      {/* Main Evidence Panel ("Why Flagged?") */}
      <RiskEvidencePanel work={work} />

      {/* Candidate Duplicate Comparisons if Present */}
      {candidate_duplicates.length > 0 && (
        <div className="card-panel p-6 bg-slate-900 border-indigo-900/50">
          <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wide mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Candidate Duplicate Pair Inspection ({candidate_duplicates.length} Matches Found)
          </h3>
          <div className="space-y-4">
            {candidate_duplicates.map((dup, idx) => (
              <div key={idx} className="p-4 rounded-md bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-indigo-400 font-mono font-semibold">
                  <span>Match Candidate: {dup.work_id_1 === work.work_id ? dup.work_id_2 : dup.work_id_1}</span>
                  <span className="bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800 text-indigo-300 font-bold">
                    {dup.similarity_score.toFixed(1)}% Text Match
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-slate-300 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Work Description ({work.work_id}):</span>
                    <p className="mt-1 leading-relaxed text-slate-200">{dup.description_1}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Matched Work Description ({dup.work_id_2}):</span>
                    <p className="mt-1 leading-relaxed text-slate-200">{dup.description_2}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
