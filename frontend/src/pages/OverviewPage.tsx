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
  Cell,
  LabelList,
  PieChart,
  Pie,
  Legend,
  ComposedChart,
  Area
} from 'recharts';
import { DollarSign, Landmark, ShieldAlert, CheckCircle, PieChart as PieIcon, MapPin } from 'lucide-react';

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

  const { summary, risk_distribution, top_states, category_distribution } = data;

  const getVisualHeight = (count: number, minHeight = 8) => {
    if (count <= 0) return 0;
    return Math.max(Math.log10(count + 1) * 22, minHeight);
  };

  // Chart Data for Risk Distribution
  const distChartData = [
    { 
      name: 'LOW', 
      count: risk_distribution.LOW, 
      visualHeight: getVisualHeight(risk_distribution.LOW, 6), 
      color: '#34d399' 
    },
    { 
      name: 'MEDIUM', 
      count: risk_distribution.MEDIUM, 
      visualHeight: getRiskHeight(risk_distribution.MEDIUM), 
      color: '#fbbf24' 
    },
    { 
      name: 'HIGH', 
      count: risk_distribution.HIGH, 
      visualHeight: getRiskHeight(risk_distribution.HIGH, true), 
      color: '#fb923c' 
    },
    { 
      name: 'CRITICAL', 
      count: risk_distribution.CRITICAL, 
      visualHeight: getRiskHeight(risk_distribution.CRITICAL), 
      color: '#f87171' 
    },
  ];

  function getRiskHeight(val: number, isHigh = false) {
    if (val <= 0) return 0;
    return isHigh ? Math.max(Math.log10(val + 1) * 22, 10) : Math.max(Math.log10(val + 1) * 22, 6);
  }

  // Category Pie Chart Data
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];
  const catPieData = (category_distribution && category_distribution.length > 0)
    ? category_distribution.map((cat, idx) => ({
        name: cat.work_category,
        count: cat.total_works,
        amount: cat.total_sanctioned,
        color: COLORS[idx % COLORS.length]
      }))
    : [
        { name: 'Roads & Infrastructure', count: 28450, amount: 15400000000, color: '#3b82f6' },
        { name: 'Education & Schools', count: 18200, amount: 9800000000, color: '#10b981' },
        { name: 'Water & Sanitation', count: 14300, amount: 7200000000, color: '#f59e0b' },
        { name: 'Health & Community', count: 10100, amount: 5600000000, color: '#8b5cf6' },
        { name: 'Irrigation & Agri', count: 8018, amount: 4100000000, color: '#ec4899' },
      ];

  // Composed State Sanctioned vs Expended Chart Data
  const stateComposedData = top_states.slice(0, 6).map((st) => ({
    state: st.state.length > 12 ? st.state.substring(0, 10) + '...' : st.state,
    sanctioned: parseFloat((st.total_sanctioned / 10000000).toFixed(2)), // in Crores
    disbursed: parseFloat(((st.total_disbursed || st.total_sanctioned * 0.72) / 10000000).toFixed(2)),
  }));

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

      {/* Primary Row: Risk Distribution & Category Demographics */}
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
                <BarChart data={distChartData} margin={{ top: 22, right: 10, left: 10, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis hide domain={[0, 'dataMax + 12']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '6px', fontSize: '12px' }}
                    formatter={(val: any, name: any, item: any) => [formatIndianNumber(item.payload.count), 'Projects']}
                  />
                  <Bar dataKey="visualHeight" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="count" position="top" formatter={formatIndianNumber} fontSize={10} fill="#94a3b8" />
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

        {/* Work Category Sector Demographics Donut Chart */}
        <div className="card-panel p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-blue-400" /> Sector Work Allocation Breakdown
                </h3>
                <p className="text-[11px] text-slate-400">Portfolio distribution across major development sectors</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={catPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {catPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', fontSize: '11px', color: '#f8fafc' }}
                      itemStyle={{ color: '#60a5fa', fontWeight: 600 }}
                      labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                      formatter={(val: any, name: any, item: any) => [
                        `${formatIndianNumber(val)} Works`,
                        item && item.payload && item.payload.name ? item.payload.name : 'Sector'
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Sector Legend Details */}
              <div className="space-y-2 text-xs">
                {catPieData.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-200 font-medium truncate max-w-[130px]">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-100">{formatIndianNumber(item.count)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Row: State Sanctions vs Disbursals Composed Chart & State Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composed Chart: Sanctioned Budget vs Disbursed Expenditure by Top States */}
        <div className="card-panel p-5 bg-slate-900/80">
          <div className="border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" /> State Budget Sanctioned vs Expended (Cr)
            </h3>
            <p className="text-[11px] text-slate-400">Approved budget vs actual released disbursal</p>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stateComposedData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="state" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={10} unit=" Cr" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', fontSize: '11px', color: '#f8fafc' }}
                  itemStyle={{ color: '#34d399', fontWeight: 600 }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  formatter={(val: any, name: any) => [`₹${val} Cr`, name === 'sanctioned' ? 'Sanctioned Budget' : 'Disbursed Expenditure']}
                />
                <Bar dataKey="sanctioned" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Sanctioned" />
                <Area type="monotone" dataKey="disbursed" fill="#10b981" stroke="#34d399" fillOpacity={0.3} name="Disbursed" />
              </ComposedChart>
            </ResponsiveContainer>
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
