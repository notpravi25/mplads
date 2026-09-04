import React, { useState, useEffect } from 'react';
import { fetchOverview } from '../services/api';
import { NationalOverviewResponse } from '../types';
import { KpiCard } from '../components/cards/KpiCard';
import { RiskBadge } from '../components/cards/RiskBadge';
import { formatIndianCurrency, formatIndianNumber } from '../utils/formatters';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { DollarSign, Landmark, AlertTriangle, CheckCircle, ShieldAlert, Layers } from 'lucide-react';

interface OverviewPageProps {
  onNavigateToRiskMonitor: (severity?: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigateToRiskMonitor }) => {
  const [data, setData] = useState<NationalOverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rankingMetric, setRankingMetric] = useState<'count' | 'rate'>('count');

  useEffect(() => {
    fetchOverview()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load national overview data.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium">Fetching Live Portfolio Overview...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-950/40 border border-red-800 rounded-md text-xs text-red-300">
          <p className="font-semibold">Unable to Load Overview Data</p>
          <p className="mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const { summary, risk_distribution, top_states } = data;

  // Chart Data for Risk Distribution
  const distChartData = [
    { name: 'LOW', count: risk_distribution.LOW, color: '#34d399' },
    { name: 'MEDIUM', count: risk_distribution.MEDIUM, color: '#fbbf24' },
    { name: 'HIGH', count: risk_distribution.HIGH, color: '#fb923c' },
    { name: 'CRITICAL', count: risk_distribution.CRITICAL, color: '#f87171' },
  ];

  // Process State Ranking
  const processedStates = top_states.map((st) => {
    const rate = st.total_works > 0 ? (st.high_risk_works / st.total_works) * 100 : 0;
    return {
      ...st,
      risk_rate: parseFloat(rate.toFixed(2))
    };
  });

  const sortedStates = [...processedStates].sort((a, b) => {
    return rankingMetric === 'count' 
      ? b.high_risk_works - a.high_risk_works 
      : b.risk_rate - a.risk_rate;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">National Portfolio Executive Overview</h2>
        <p className="text-xs text-slate-400 mt-1">
          Macro fund allocation baselines, approved sanctions, disbursals, and portfolio risk intelligence distribution across 79,068 works.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Allocated Limit (T1)"
          value={formatIndianCurrency(summary.total_allocated_funds)}
          subtitle="MP Fund Allocation Ceiling"
          explanation="Macro allocation baseline across all 544 Members of Parliament."
          icon={<Landmark className="w-5 h-5" />}
        />

        <KpiCard
          title="Sanctioned Project Budget (T4)"
          value={formatIndianCurrency(summary.total_sanctioned_amount)}
          subtitle={`${formatIndianNumber(summary.total_works)} Total Works Base`}
          explanation="Total approved project cost ceiling across all sanctioned works."
          icon={<DollarSign className="w-5 h-5" />}
        />

        <KpiCard
          title="Disbursed Expenditure (T6)"
          value={formatIndianCurrency(summary.total_disbursed_amount)}
          subtitle={`${formatIndianNumber(summary.completed_works)} Completed Works Linked`}
          explanation="Actual payment disbursals processed across vendor transactions."
          icon={<CheckCircle className="w-5 h-5" />}
        />

        <KpiCard
          title="Projects Requiring Review"
          value={formatIndianNumber(summary.high_risk_works + risk_distribution.MEDIUM)}
          subtitle={`${formatIndianNumber(summary.high_risk_works)} High Risk Cases`}
          badge={<RiskBadge level="HIGH" count={summary.high_risk_works} />}
          explanation="Projects with composite risk score >= 35 flagged for reviewer audit."
          icon={<ShieldAlert className="w-5 h-5 text-orange-400" />}
        />
      </div>

      {/* Risk Distribution & State Rankings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Bar Chart */}
        <div className="card-panel p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">System Risk Distribution</h3>
                <p className="text-[11px] text-slate-400">Composite Risk Score breakdown across entire portfolio</p>
              </div>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '6px', fontSize: '12px' }}
                    formatter={(val: any) => [formatIndianNumber(val), 'Projects']}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {distChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Review Filter Shortcuts:</span>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigateToRiskMonitor('HIGH')}
                className="px-2.5 py-1 bg-orange-950/60 border border-orange-800/60 text-orange-400 rounded text-[11px] hover:bg-orange-900/60 transition-all font-medium"
              >
                View High Risk ({risk_distribution.HIGH})
              </button>
            </div>
          </div>
        </div>

        {/* State-Wise Risk Rankings Table */}
        <div className="card-panel p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">State Risk Concentration Ranking</h3>
                <p className="text-[11px] text-slate-400">States ranked by high-risk project counts and risk rates</p>
              </div>

              {/* Metric Switcher Toggle */}
              <div className="flex bg-slate-900 p-0.5 rounded border border-slate-800 text-[11px]">
                <button
                  onClick={() => setRankingMetric('count')}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    rankingMetric === 'count' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Absolute High-Risk Count
                </button>
                <button
                  onClick={() => setRankingMetric('rate')}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    rankingMetric === 'rate' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Risk Rate %
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2 px-3">State Name</th>
                    <th className="py-2 px-3 text-right">Total Works</th>
                    <th className="py-2 px-3 text-right">Sanctioned Budget</th>
                    <th className="py-2 px-3 text-right">High Risk Cases</th>
                    <th className="py-2 px-3 text-right">Risk Rate %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {sortedStates.slice(0, 7).map((st, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-100">{st.state}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">{formatIndianNumber(st.total_works)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">{formatIndianCurrency(st.total_sanctioned)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-orange-400">
                        {formatIndianNumber(st.high_risk_works)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          st.risk_rate >= 5.0 ? 'bg-red-950/60 text-red-400 border border-red-800/40' : 'text-slate-300'
                        }`}>
                          {st.risk_rate.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 pt-2 text-[11px] text-slate-400 border-t border-slate-800 text-right">
            Showing Top States • Data dynamically fetched from backend API
          </div>
        </div>
      </div>
    </div>
  );
};
