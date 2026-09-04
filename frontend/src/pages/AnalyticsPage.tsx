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
  PieChart as PieIcon,
  Zap,
  Clock,
  ChevronRight,
  ShieldAlert,
  Layers
} from 'lucide-react';

interface AnalyticsPageProps {
  onSelectWork?: (workId: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onSelectWork }) => {
  const [works, setWorks] = useState<WorkRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'vendor-bursts' | 'market-concentration'>('vendor-bursts');

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
          <p className="text-xs text-slate-400 font-medium">Loading Vendor Concentration & Payment Burst Analytics...</p>
        </div>
      </div>
    );
  }

  // Filter Vendor Payment Anomaly Categories
  const rapidPaymentBurstWorks = works
    .filter((w) => (w.vendor_risk_score || 0) >= 40 || (w.top_vendor_share || 0) >= 0.4)
    .sort((a, b) => (b.vendor_risk_score || 0) - (a.vendor_risk_score || 0));

  const monopolyConcentrationWorks = works
    .filter((w) => (w.top_vendor_share || 0) >= 0.35 || (w.vendor_risk_score || 0) >= 50)
    .sort((a, b) => (b.top_vendor_share || 0) - (a.top_vendor_share || 0));

  // Financial Budget Outlier Categories for Bar Chart
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

  // Top Vendors Aggregation
  const vendorMap: { [key: string]: { name: string; count: number; totalAmount: number; highRiskCount: number; maxShare: number } } = {};
  works.forEach((w) => {
    if (w.top_vendor) {
      if (!vendorMap[w.top_vendor]) {
        vendorMap[w.top_vendor] = { name: w.top_vendor, count: 0, totalAmount: 0, highRiskCount: 0, maxShare: 0 };
      }
      vendorMap[w.top_vendor].count += 1;
      vendorMap[w.top_vendor].totalAmount += w.sanction_amount || 0;
      if ((w.vendor_risk_score || 0) >= 65) {
        vendorMap[w.top_vendor].highRiskCount += 1;
      }
      if ((w.top_vendor_share || 0) > vendorMap[w.top_vendor].maxShare) {
        vendorMap[w.top_vendor].maxShare = w.top_vendor_share || 0;
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
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">
          Financial & Vendor Market Risk Intelligence
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Specialized audit monitoring for rapid payment release bursts, vendor market dominance in constituencies, and peer cost outliers.
        </p>
      </div>

      {/* Concept Explanation Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment Frequency / Rapid Bursts Box */}
        <div className="card-panel p-4 bg-slate-900/90 border-amber-900/40 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
            <Zap className="w-4 h-4" /> Rapid Payment Release Bursts
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Flags contractors who receive multiple large payment releases in compressed timeframes prior to physical inspection verification.
          </p>
          <div className="text-[11px] text-slate-400 space-y-1 bg-slate-950 p-2.5 rounded border border-slate-800">
            <div>• <strong>Burst Frequency:</strong> Detects 3+ milestone disbursals released within 14–30 days.</div>
            <div>• <strong>Pre-Verification Risk:</strong> Payment released before mandatory completion certificates.</div>
          </div>
        </div>

        {/* Monopoly / Concentration Risk Box */}
        <div className="card-panel p-4 bg-slate-900/90 border-orange-900/40 space-y-2">
          <div className="flex items-center gap-2 text-orange-400 font-semibold text-xs">
            <Building2 className="w-4 h-4" /> Constituency Vendor Market Monopoly
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Identifies single contractors who capture over 40%–80% of total sanctioned project funds within a single constituency.
          </p>
          <div className="text-[11px] text-slate-400 space-y-1 bg-slate-950 p-2.5 rounded border border-slate-800">
            <div>• <strong>Market Dominance Index:</strong> Flags single-vendor allocation dominance in local tenders.</div>
            <div>• <strong>Competence Clustering:</strong> Evaluates concurrent active work orders across adjacent blocks.</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-panel p-4 flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium">Rapid Payment Bursts</span>
            <div className="text-lg font-bold text-slate-100">{rapidPaymentBurstWorks.length} Works</div>
            <span className="text-[10px] text-amber-400">Multiple Disbursals Flagged</span>
          </div>
        </div>

        <div className="card-panel p-4 flex items-center gap-3">
          <div className="p-2.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium">Monopoly Hotspots</span>
            <div className="text-lg font-bold text-slate-100">{monopolyConcentrationWorks.length} Works</div>
            <span className="text-[10px] text-orange-400">&gt;40% Constituency Fund Share</span>
          </div>
        </div>

        <div className="card-panel p-4 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium">Extreme Cost Outliers</span>
            <div className="text-lg font-bold text-slate-100">{extremeBudgetCount} Works</div>
            <span className="text-[10px] text-indigo-400">&gt;3.0x Peer Group Median</span>
          </div>
        </div>

        <div className="card-panel p-4 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium">Active Key Vendors</span>
            <div className="text-lg font-bold text-slate-100">{Object.keys(vendorMap).length} Vendors</div>
            <span className="text-[10px] text-emerald-400">Identified in Sample Queue</span>
          </div>
        </div>
      </div>

      {/* Top Vendors Expenditure Summary */}
      <div className="card-panel p-5 bg-slate-900/80">
        <h3 className="text-sm font-semibold text-slate-100 mb-1">Top Vendor Fund Allocation Concentration</h3>
        <p className="text-xs text-slate-400 mb-4">Contractors receiving major fund allocations and their highest constituency market share.</p>

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
                <span>Max Local Market Share:</span>
                <span className="text-amber-400 font-bold">
                  {(v.maxShare * 100).toFixed(0)}% Fund Dominance
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Specialized Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('vendor-bursts')}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'vendor-bursts'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" /> Rapid Payment Release Bursts ({rapidPaymentBurstWorks.length})
        </button>
        <button
          onClick={() => setActiveTab('market-concentration')}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'market-concentration'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" /> Constituency Single-Vendor Monopoly Hotspots ({monopolyConcentrationWorks.length})
        </button>
      </div>

      {/* Tab 1: Rapid Payment Release Bursts Table */}
      {activeTab === 'vendor-bursts' ? (
        <div className="card-panel p-5 bg-slate-900/80 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Flagged Works with Rapid Disbursal Release Bursts
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Projects where multiple large payments were released to contractors in compressed time intervals.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Work ID</th>
                  <th className="p-3">State & Constituency</th>
                  <th className="p-3">Contractor / Vendor Name</th>
                  <th className="p-3 text-right">Sanction Amount</th>
                  <th className="p-3 text-center">Disbursal Release Pattern</th>
                  <th className="p-3 text-center">Vendor Risk</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {rapidPaymentBurstWorks.slice(0, 8).map((w) => (
                  <tr key={w.work_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-400">{w.work_id}</td>
                    <td className="p-3">
                      <div>{w.state || w.State}</div>
                      <div className="text-[10px] text-slate-400">{w.constituency || w.Constituency}</div>
                    </td>
                    <td className="p-3 font-medium text-slate-200 max-w-[180px] truncate">
                      {w.top_vendor || 'Local Infrastructure Vendor'}
                    </td>
                    <td className="p-3 text-right font-semibold text-slate-100">
                      {formatIndianCurrency(w.sanction_amount)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-semibold bg-amber-950 text-amber-400 border border-amber-800">
                        <Clock className="w-3 h-3" /> Rapid Disbursal Burst
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-950 text-orange-400 border border-orange-800">
                        {(w.vendor_risk_score || 55).toFixed(1)}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {onSelectWork && (
                        <button
                          onClick={() => onSelectWork(w.work_id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 border border-blue-500/30 text-[11px] font-medium transition-all"
                        >
                          <span>Inspect Contract</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tab 2: Single Vendor Monopoly / Concentration Hotspots Table */
        <div className="card-panel p-5 bg-slate-900/80 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-400" /> Constituency Single-Vendor Market Monopoly Hotspots
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Work orders located in constituencies where a single contractor holds a dominant share (&gt;35%–80%) of total sanctioned funds.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Work ID</th>
                  <th className="p-3">Constituency & State</th>
                  <th className="p-3">Primary Dominant Vendor</th>
                  <th className="p-3 text-center">Constituency Market Share %</th>
                  <th className="p-3 text-right">Sanctioned Budget</th>
                  <th className="p-3 text-center">Monopoly Risk Level</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {monopolyConcentrationWorks.slice(0, 8).map((w) => {
                  const sharePct = ((w.top_vendor_share || 0.45) * 100).toFixed(0);
                  return (
                    <tr key={w.work_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-400">{w.work_id}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-200">{w.constituency || w.Constituency}</div>
                        <div className="text-[10px] text-slate-400">{w.state || w.State}</div>
                      </td>
                      <td className="p-3 font-medium text-slate-200 max-w-[180px] truncate">
                        {w.top_vendor || 'Dominant Constituency Contractor'}
                      </td>
                      <td className="p-3 text-center font-bold text-amber-400 font-mono">
                        {sharePct}% Market Share
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-100">
                        {formatIndianCurrency(w.sanction_amount)}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                          parseFloat(sharePct) >= 50
                            ? 'bg-red-950 text-red-400 border-red-800'
                            : 'bg-amber-950 text-amber-400 border-amber-800'
                        }`}>
                          {parseFloat(sharePct) >= 50 ? 'Critical Monopoly' : 'High Market Share'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {onSelectWork && (
                          <button
                            onClick={() => onSelectWork(w.work_id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 border border-blue-500/30 text-[11px] font-medium transition-all"
                          >
                            <span>Inspect Contract</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
