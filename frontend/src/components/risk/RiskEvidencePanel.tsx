import React from 'react';
import { WorkRecord } from '../../types';
import { formatIndianCurrency } from '../../utils/formatters';

interface RiskEvidencePanelProps {
  work: WorkRecord;
}

export const RiskEvidencePanel: React.FC<RiskEvidencePanelProps> = ({ work }) => {
  const amount = work.sanction_amount || 0;
  const ratio = work.amount_to_peer_ratio || 1.0;
  const pct = work.category_percentile || 50.0;
  const vendorShare = (work.top_vendor_share || 0) * 100;
  const hasImage = work.has_evidence_image || false;

  return (
    <div className="card-panel p-6 border-slate-700 bg-slate-900/90">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-100 uppercase tracking-wide">
            Audit Evidence Breakdown ("Why Flagged?")
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical deviations, mathematical peer ratios, and compliance checks supporting the composite risk indicator.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
          Work ID: {work.work_id}
        </span>
      </div>

      {/* Evidence Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-800/60 text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-700">
              <th className="py-2.5 px-3">Risk Dimension</th>
              <th className="py-2.5 px-3">Observed Value</th>
              <th className="py-2.5 px-3">Peer / Baseline Expectation</th>
              <th className="py-2.5 px-3">Statistical Deviation</th>
              <th className="py-2.5 px-3">Audit Interpretation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {/* Financial Dimension */}
            <tr>
              <td className="py-3 px-3 font-semibold text-amber-400">Financial Risk</td>
              <td className="py-3 px-3 font-mono">{formatIndianCurrency(amount)}</td>
              <td className="py-3 px-3 text-slate-400">Category Median Baseline</td>
              <td className="py-3 px-3">
                <span className={`font-mono font-bold ${ratio >= 2.0 ? 'text-orange-400' : 'text-slate-300'}`}>
                  {ratio.toFixed(2)}x Peer Ratio ({pct.toFixed(1)}th Percentile)
                </span>
              </td>
              <td className="py-3 px-3 text-slate-300 leading-snug">
                {work.financial_explanation || 'Expenditure falls within normal baseline bounds.'}
              </td>
            </tr>

            {/* Vendor Dimension */}
            <tr>
              <td className="py-3 px-3 font-semibold text-orange-400">Vendor Risk</td>
              <td className="py-3 px-3 text-slate-200">{work.top_vendor || 'N/A'}</td>
              <td className="py-3 px-3 text-slate-400">Multi-Vendor Procurement Threshold (&lt; 25%)</td>
              <td className="py-3 px-3 font-mono">
                <span className={vendorShare >= 30 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                  {vendorShare.toFixed(1)}% Disbursal Share
                </span>
              </td>
              <td className="py-3 px-3 text-slate-300 leading-snug">
                {work.vendor_risk_explanation || 'Vendor concentration within standard limits.'}
              </td>
            </tr>

            {/* Duplicate NLP Dimension */}
            <tr>
              <td className="py-3 px-3 font-semibold text-indigo-400">Duplicate NLP Risk</td>
              <td className="py-3 px-3 text-slate-300 truncate max-w-xs">{work.description || 'N/A'}</td>
              <td className="py-3 px-3 text-slate-400">Independent Description Threshold (&lt; 70%)</td>
              <td className="py-3 px-3 font-mono">
                <span className={work.duplicate_risk_score >= 85 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                  {work.duplicate_risk_score ? `${work.duplicate_risk_score.toFixed(1)}% Match` : 'No Match'}
                </span>
              </td>
              <td className="py-3 px-3 text-slate-300 leading-snug">
                {work.duplicate_risk_score >= 70
                  ? `Candidate duplicate description found in ${work.Constituency} constituency.`
                  : 'Unique description text verified.'}
              </td>
            </tr>

            {/* Compliance Evidence Dimension */}
            <tr>
              <td className="py-3 px-3 font-semibold text-emerald-400">Compliance & Evidence</td>
              <td className="py-3 px-3 font-mono">
                {hasImage ? (
                  <span className="text-emerald-400 font-medium">Image Uploaded</span>
                ) : (
                  <span className="text-amber-400 font-medium">Missing Image</span>
                )}
              </td>
              <td className="py-3 px-3 text-slate-400">Physical Site Evidence Mandatory for Completion</td>
              <td className="py-3 px-3">
                <span className={!hasImage && work.completion_date ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                  {!hasImage && work.completion_date ? 'RULE_COMP_01 Triggered' : 'Compliant'}
                </span>
              </td>
              <td className="py-3 px-3 text-slate-300 leading-snug">
                {work.compliance_explanation || 'Full compliance verified.'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Reviewer Audit Action Callout */}
      <div className="mt-5 p-4 rounded-md bg-slate-800/90 border border-slate-700 flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Suggested Administrative Review Action:
        </span>
        <p className="text-xs text-slate-200 font-medium leading-relaxed">
          {work.recommended_reviewer_action || 'Perform standard periodic monitoring.'}
        </p>
      </div>
    </div>
  );
};
