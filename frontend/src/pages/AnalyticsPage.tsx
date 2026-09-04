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
  LabelList
} from 'recharts';
import { 
  DollarSign, 
  Building2, 
  AlertTriangle, 
  TrendingUp, 
  PieChart 
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [works, setWorks] = useState<WorkRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'financial' | 'vendor'>('financial');

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
      <div className="p-8 text-center text-xs text-slate-400">
        Loading Financial & Vendor Analytics...
      </div>
    );
  }

  // Financial Stats
  const highFinancialWorks = works.filter((w) => (w.financial_risk_score || 0) >= 65);
  const highVendorWorks = works.filter((w) => (w.vendor_risk_score || 0) >= 65);

  // Financial Budget Outlier Categories for Bar Chart (log-scaled visual width for non-zero counts)
  const normalBudgetCount = works.filter((w) => (w.amount_to_peer_ratio || 1) <= 1.5).length;
  const elevatedBudgetCount = works.filter((w) => (w.amount_to_peer_ratio || 1) > 1.5 && (w.amount_to_peer_ratio || 1) <= 3.0).length;
  const extremeBudgetCount = works.filter((w) => (w.amount_to_peer_ratio || 1) > 3.0).length;

  const getVisualWidth = (count: number) => {
    if (count <= 0) return 0;
    return Math.max(Math.log10(count + 1) * 25, 8);
  };

  const budgetDistribution = [
    { 
      label: 'Normal Budget (<=1.5x Peer Median)', 
      count: normalBudgetCount, 
      visualWidth: getVisualWidth(normalBudgetCount), 
      fill: '#34d399' 
    },
    { 
      label: 'Elevated Budget (1.5x - 3x Peer Median)', 
      count: elevatedBudgetCount, 
      visualWidth: getVisualWidth(elevatedBudgetCount), 
      fill: '#fbbf24' 
    },
    { 
      label: 'Extreme Outlier (>3x Peer Median)', 
      count: extremeBudgetCount, 
      visualWidth: getVisualWidth(extremeBudgetCount), 
      fill: '#f87171' 
    },
  ];

  // Top Vendors from records
  const vendorMap: { [key: string]: { name: string; count: number; totalAmount: number; highRiskCount: number } } = {};
  works.forEach((w) => {
    if (w.top_vendor) {
      if (!vendorMap[w.top_vendor]) {
        vendorMap[w.top_vendor] = { name: w.top_vendor, count: 0, totalAmount: 0, highRiskCount: 0 };
      }
      vendorMap[w.top_vendor].count += 1;
      vendorMap[w.top_vendor].totalAmount += w.sanction_amount || 0;
      if ((w.vendor_risk_score || 0) >= 65) {
        vendorMap[w.top_vendor].highRiskCount += 1;
      }
    }
  });

  const topVendorsList = Object.values(vendorMap)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 6);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Financial & Vendor Risk Analytics</h2>
        <p className="text-xs text-slate-400 mt-1">
          Executive summary explaining financial budget anomalies, peer group comparisons, and vendor market concentration.
        </p>
      </div>

      {/* Guide / Concept Banner for Easy Understanding */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Financial Risk Explanation Box */}
        <div className="card-panel p-4 bg-slate-900/90 border-amber-900/40 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
            <DollarSign className="w-4 h-4" /> How to Understand Financial Risk
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-amber-300">Financial Risk</strong> identifies projects where the sanctioned cost or payment disbursal is unusually high compared to similar works in the same State and Work Category.
          </p>
          <div className="text-[11px] text-slate-400 space-y-1 bg-slate-950 p-2.5 rounded border border-slate-800">
            <div>• <strong>Peer Group Comparison:</strong> Checks how many times higher a project budget is relative to the average similar project.</div>
            <div>• <strong>IQR Statistical Fence:</strong> Flags extreme upper-tail cost outliers.</div>
          </div>
        </div>

        {/* Vendor Risk Explanation Box */}
        <div className="card-panel p-4 bg-slate-900/90 border-orange-900/40 space-y-2">
          <div className="flex items-center gap-2 text-orange-400 font-semibold text-xs">
            <Building2 className="w-4 h-4" /> How to Understand Vendor Risk
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-orange-300">Vendor Risk</strong> highlights contractors who hold a disproportionately high market share of projects in a constituency or receive rapid payment bursts.
          </p>
          <div className="text-[11px] text-slate-400 space-y-1 bg-slate-950 p-2.5 rounded border border-slate-800">
            <div>• <strong>Payment Concentration:</strong> Indicates if a single vendor receives most of a constituency&apos;s funds.</div>
            <div>• <strong>Payment Frequency:</strong> Detects multiple large payments released in short time intervals.</div>
          </div>
        </div>
      </div>

      {/* Key Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-panel p-4 flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium">Extreme Cost Outliers</span>
            <div className="text-lg font-bold text-slate-100">{extremeBudgetCount} Works</div>
            <span className="text-[10px] text-amber-400">&gt;3.0x Peer Group Median</span>
          </div>
        </div>

        <div className="card-panel p-4 flex items-center gap-3">
          <div className="p-2.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium">High Financial Risk Cases</span>
            <div className="text-lg font-bold text-slate-100">{highFinancialWorks.length} Works</div>
            <span className="text-[10px] text-orange-400">Score &ge; 65 Outlier Score</span>
          </div>
        </div>

        <div className="card-panel p-4 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium">High Vendor Risk Cases</span>
            <div className="text-lg font-bold text-slate-100">{highVendorWorks.length} Works</div>
            <span className="text-[10px] text-indigo-400">High Concentration Score</span>
          </div>
        </div>

        <div className="card-panel p-4 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium">Active Key Vendors</span>
            <div className="text-lg font-bold text-slate-100">{Object.keys(vendorMap).length} Vendors</div>
            <span className="text-[10px] text-emerald-400">Identified in Sample Queue</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('financial')}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'financial'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Financial Budget Outlier Breakdown
        </button>
        <button
          onClick={() => setActiveTab('vendor')}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'vendor'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" /> Vendor Market Concentration Analysis
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'financial' ? (
        <div className="space-y-6">
          {/* Budget Outlier Bar Chart */}
          <div className="card-panel p-5 bg-slate-900/80">
            <h3 className="text-sm font-semibold text-slate-100 mb-1">Project Budget Distribution Relative to Peer Median</h3>
            <p className="text-xs text-slate-400 mb-4">Compares project budgets against expected cost baselines for similar category works in the state.</p>
            
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetDistribution} layout="vertical" margin={{ top: 10, right: 100, left: 180, bottom: 5 }}>
                  <XAxis type="number" hide domain={[0, 'dataMax + 15']} />
                  <YAxis type="category" dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} width={170} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', fontSize: '11px' }}
                    formatter={(val: any, name: any, item: any) => [`${formatIndianNumber(item.payload.count)} Projects`, 'Count']}
                  />
                  <Bar dataKey="visualWidth" radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="count" position="right" formatter={(v: any) => `${formatIndianNumber(v)} Projects`} fontSize={11} fill="#94a3b8" />
                    {budgetDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sample Flagged Works Table */}
          <div className="card-panel p-5 bg-slate-900/80">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">Top Financial Risk Cases Needing Review</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Work ID</th>
                    <th className="p-3">State & Constituency</th>
                    <th className="p-3 text-right">Sanction Budget</th>
                    <th className="p-3 text-right">Peer Median</th>
                    <th className="p-3 text-center">Peer Ratio</th>
                    <th className="p-3 text-center">Financial Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {highFinancialWorks.slice(0, 5).map((w) => (
                    <tr key={w.work_id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-blue-400 font-medium">{w.work_id}</td>
                      <td className="p-3">
                        <div>{w.state || w.State}</div>
                        <div className="text-[10px] text-slate-400">{w.constituency || w.Constituency}</div>
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-100">
                        {formatIndianCurrency(w.sanction_amount)}
                      </td>
                      <td className="p-3 text-right text-slate-400">
                        {formatIndianCurrency(w.peer_category_median_amount)}
                      </td>
                      <td className="p-3 text-center font-bold text-amber-400">
                        {(w.amount_to_peer_ratio || 1).toFixed(1)}x
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                          {(w.financial_risk_score || 0).toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Vendors by Expenditure */}
          <div className="card-panel p-5 bg-slate-900/80">
            <h3 className="text-sm font-semibold text-slate-100 mb-1">Top Vendors by Disbursed Expenditure</h3>
            <p className="text-xs text-slate-400 mb-4">Identifies contractors receiving major fund allocations and their associated vendor risk levels.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topVendorsList.map((v) => (
                <div key={v.name} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 text-xs truncate max-w-[160px]">{v.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                      {v.count} Works
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-100">
                    {formatIndianCurrency(v.totalAmount)}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>High Risk Projects:</span>
                    <span className={v.highRiskCount > 0 ? 'text-orange-400 font-bold' : 'text-emerald-400 font-medium'}>
                      {v.highRiskCount} Flagged
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
