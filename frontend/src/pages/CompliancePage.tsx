import React, { useState, useEffect } from 'react';
import { fetchRiskQueue } from '../services/api';
import { WorkRecord } from '../types';
import { formatIndianCurrency, formatIndianNumber } from '../utils/formatters';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';
import { 
  CheckSquare, 
  Camera, 
  AlertOctagon, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  XCircle,
  FileCheck
} from 'lucide-react';

interface CompliancePageProps {
  onSelectWork: (workId: string) => void;
}

export const CompliancePage: React.FC<CompliancePageProps> = ({ onSelectWork }) => {
  const [works, setWorks] = useState<WorkRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  useEffect(() => {
    fetchRiskQueue({ limit: 100 })
      .then((res) => {
        setWorks(res.records);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium">Loading Compliance & Evidence Audit Engine...</p>
        </div>
      </div>
    );
  }

  // Calculate compliance statistics
  const totalSample = works.length;
  const worksWithPhoto = works.filter((w) => w.has_evidence_image).length;
  const worksMissingPhoto = totalSample - worksWithPhoto;
  const photoComplianceRate = totalSample > 0 ? ((worksWithPhoto / totalSample) * 100).toFixed(1) : '0.0';

  const criticalComplianceWorks = works.filter((w) => (w.compliance_risk_score || 0) >= 65);
  const mediumComplianceWorks = works.filter(
    (w) => (w.compliance_risk_score || 0) >= 35 && (w.compliance_risk_score || 0) < 65
  );
  const compliantWorks = works.filter((w) => (w.compliance_risk_score || 0) < 35);

  // Category Photo Compliance Aggregation
  const categoryMap: { [cat: string]: { total: number; photo: number } } = {};
  works.forEach((w) => {
    const cat = w.work_category || 'General Infrastructure';
    if (!categoryMap[cat]) categoryMap[cat] = { total: 0, photo: 0 };
    categoryMap[cat].total += 1;
    if (w.has_evidence_image) categoryMap[cat].photo += 1;
  });

  const categoryComplianceData = Object.entries(categoryMap)
    .map(([cat, val]) => ({
      category: cat.length > 18 ? cat.substring(0, 16) + '...' : cat,
      fullCategory: cat,
      complianceRate: parseFloat(((val.photo / val.total) * 100).toFixed(1)),
      uploaded: val.photo,
      missing: val.total - val.photo,
    }))
    .sort((a, b) => a.complianceRate - b.complianceRate)
    .slice(0, 6);

  // Donut Chart Data for Compliance Risk Tiers
  const complianceDonutData = [
    { name: 'Fully Compliant (<35 Risk)', count: compliantWorks.length, color: '#34d399' },
    { name: 'Moderate Evidence Gap (35-64)', count: mediumComplianceWorks.length, color: '#fbbf24' },
    { name: 'Critical Evidence Deficit (>=65)', count: criticalComplianceWorks.length, color: '#f87171' },
  ];

  // Filter table records
  const filteredWorks = works.filter((w) => {
    if (filterSeverity === 'CRITICAL') return (w.compliance_risk_score || 0) >= 65;
    if (filterSeverity === 'MEDIUM') return (w.compliance_risk_score || 0) >= 35 && (w.compliance_risk_score || 0) < 65;
    if (filterSeverity === 'LOW') return (w.compliance_risk_score || 0) < 35;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">
          Compliance & Evidence Gap Intelligence
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Verification of physical completion evidence, geo-tagged photo uploads, and milestone audit compliance across MPLADS work orders.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-panel p-4 flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium">Audited Sample Base</span>
            <div className="text-lg font-bold text-slate-100">{totalSample} Works</div>
            <span className="text-[10px] text-blue-400">Sampled Risk Queue</span>
          </div>
        </div>

        <div className="card-panel p-4 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium">Photo Proof Compliance</span>
            <div className="text-lg font-bold text-slate-100">{photoComplianceRate}%</div>
            <span className="text-[10px] text-emerald-400">{worksWithPhoto} Works Uploaded</span>
          </div>
        </div>

        <div className="card-panel p-4 flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium">Missing Evidence Gaps</span>
            <div className="text-lg font-bold text-slate-100">{worksMissingPhoto} Works</div>
            <span className="text-[10px] text-amber-400">Requires Photo Evidence</span>
          </div>
        </div>

        <div className="card-panel p-4 flex items-center gap-3">
          <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium">Critical Deficit Cases</span>
            <div className="text-lg font-bold text-slate-100">{criticalComplianceWorks.length} Works</div>
            <span className="text-[10px] text-red-400">Score &ge; 65 Outlier</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Photo Compliance Rate Bar Chart */}
        <div className="card-panel p-5 bg-slate-900/80">
          <h3 className="text-sm font-semibold text-slate-100 mb-1">
            Photo Proof Upload Rate by Sector (%)
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Percentage of works with verified geo-tagged photo evidence across major work categories.
          </p>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryComplianceData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                <XAxis dataKey="category" stroke="#64748b" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', fontSize: '11px', color: '#f8fafc' }}
                  itemStyle={{ color: '#34d399', fontWeight: 600 }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  formatter={(val: any, name: any, item: any) => [`${val}% Uploaded`, item && item.payload && item.payload.fullCategory ? item.payload.fullCategory : 'Compliance Rate']}
                />
                <Bar dataKey="complianceRate" radius={[4, 4, 0, 0]}>
                  {categoryComplianceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.complianceRate >= 50 ? '#34d399' : entry.complianceRate >= 30 ? '#fbbf24' : '#f87171'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compliance Risk Tier Donut Chart */}
        <div className="card-panel p-5 bg-slate-900/80 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">
              Compliance Risk Tier Distribution
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Breakdown of sampled works by compliance risk score tiers and evidence gap severity.
            </p>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complianceDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {complianceDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', fontSize: '11px', color: '#f8fafc' }}
                    itemStyle={{ color: '#60a5fa', fontWeight: 600 }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                    formatter={(val: any, name: any, item: any) => [`${formatIndianNumber(val)} Works`, item && item.payload && item.payload.name ? item.payload.name : 'Category Tier']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Evidence Verification Table */}
      <div className="card-panel p-5 bg-slate-900/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Evidence Audit Verification Queue
            </h3>
            <p className="text-xs text-slate-400">
              Review flagged work orders requiring visual photo evidence or milestone completion certification.
            </p>
          </div>

          {/* Filter Switcher */}
          <div className="flex bg-slate-950 p-1 rounded border border-slate-800 text-[11px] self-start sm:self-auto">
            <button
              onClick={() => setFilterSeverity('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                filterSeverity === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({works.length})
            </button>
            <button
              onClick={() => setFilterSeverity('CRITICAL')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                filterSeverity === 'CRITICAL' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Critical Gap ({criticalComplianceWorks.length})
            </button>
            <button
              onClick={() => setFilterSeverity('MEDIUM')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                filterSeverity === 'MEDIUM' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Moderate ({mediumComplianceWorks.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Work ID</th>
                <th className="p-3">State & Constituency</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Sanction Budget</th>
                <th className="p-3 text-center">Photo Proof</th>
                <th className="p-3 text-center">Compliance Score</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredWorks.slice(0, 10).map((w) => (
                <tr key={w.work_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-blue-400">{w.work_id}</td>
                  <td className="p-3">
                    <div>{w.state || w.State}</div>
                    <div className="text-[10px] text-slate-400">{w.constituency || w.Constituency}</div>
                  </td>
                  <td className="p-3 text-slate-300 max-w-[140px] truncate">{w.work_category}</td>
                  <td className="p-3 text-right font-semibold text-slate-100">
                    {formatIndianCurrency(w.sanction_amount)}
                  </td>
                  <td className="p-3 text-center">
                    {w.has_evidence_image ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Uploaded
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-950 text-red-400 border border-red-800">
                        <XCircle className="w-3 h-3" /> Missing
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        (w.compliance_risk_score || 0) >= 65
                          ? 'bg-red-950 text-red-400 border-red-800'
                          : (w.compliance_risk_score || 0) >= 35
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      }`}
                    >
                      {(w.compliance_risk_score || 0).toFixed(1)}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onSelectWork(w.work_id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 border border-blue-500/30 text-[11px] font-medium transition-all"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
