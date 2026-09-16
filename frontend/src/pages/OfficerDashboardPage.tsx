import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  ArrowLeft, 
  CheckCircle2, 
  ChevronRight, 
  ClipboardCheck, 
  Copy, 
  FileSearch, 
  MapPin, 
  Search, 
  ShieldAlert, 
  Users, 
  WalletCards, 
  CalendarClock, 
  Scale, 
  Clock3,
  FileCheck,
  Building2,
  ExternalLink,
  MessageSquareWarning,
  RefreshCw,
  Camera,
  AlertOctagon,
  UserCheck
} from 'lucide-react';
import { 
  fetchOfficerDashboard, 
  fetchOfficerWork, 
  fetchCitizenComplaints, 
  updateCitizenComplaintAction 
} from '../services/api';
import { 
  OfficerDashboardResponse, 
  OfficerWorkResponse, 
  CitizenComplaint 
} from '../types';
import { RiskBadge } from '../components/cards/RiskBadge';
import { MaterialFairnessPage } from './MaterialFairnessPage';

const initialDashboard: OfficerDashboardResponse = {
  selected_filters: {}, 
  available: { states: [], constituencies: [], statuses: [], severities: [] },
  summary: { 
    total_works: 0, 
    high_priority_works: 0, 
    material_price_reviews: 0, 
    attendance_issues: 0, 
    citizen_complaints: 0, 
    compliance_issues: 0, 
    schedule_risks: 0, 
    duplicate_candidates: 0, 
    financial_reviews: 0 
  },
  data_availability: {}, 
  priority_works: [],
};

const money = (amount?: number) => {
  if (amount === undefined || amount === null) return 'Not available';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

const ScoreBar = ({ label, score, source }: { label: string; score: number; source?: string }) => (
  <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4">
    <div className="flex justify-between gap-3 text-xs font-bold text-slate-800">
      <span>{label}</span>
      <span className="font-mono">{Number(score || 0).toFixed(1)} / 100</span>
    </div>
    <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
      <div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.min(100, Math.max(0, Number(score || 0)))}%` }} />
    </div>
    {source && <p className="mt-2 text-[10px] font-medium text-slate-500">Source: {source}</p>}
  </div>
);

const DataWarning = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-900">
    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
    {children}
  </div>
);

export const OfficerDashboardPage: React.FC = () => {
  const [activeOfficerTab, setActiveOfficerTab] = useState<'queue' | 'complaints' | 'materials' | 'benchmarks'>('queue');
  const [dashboard, setDashboard] = useState<OfficerDashboardResponse>(initialDashboard);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ state: '', constituency: '', work_status: '', severity: '', search: '' });
  const [focusDimension, setFocusDimension] = useState('all');
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OfficerWorkResponse | null>(null);
  const [detailError, setDetailError] = useState('');
  const [actionNotice, setActionNotice] = useState('');

  // Citizen Complaints State in Officer Portal
  const [citizenComplaints, setCitizenComplaints] = useState<CitizenComplaint[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState<boolean>(false);
  const [complaintActionSuccess, setComplaintActionSuccess] = useState<string>('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchOfficerDashboard(filters).then((result) => {
      if (active) { setDashboard(result); setLoading(false); }
    }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filters]);

  useEffect(() => {
    loadComplaints();
  }, [filters.state, filters.constituency]);

  const loadComplaints = () => {
    setComplaintsLoading(true);
    fetchCitizenComplaints({
      state: filters.state || undefined,
      constituency: filters.constituency || undefined
    }).then((res) => {
      setCitizenComplaints(res.complaints || []);
      setComplaintsLoading(false);
    }).catch(() => setComplaintsLoading(false));
  };

  const handleOfficerComplaintAction = async (complaintId: string, status: string, notes: string) => {
    try {
      await updateCitizenComplaintAction(complaintId, status, notes);
      setComplaintActionSuccess(`Status updated to ${status.replace(/_/g, ' ')}`);
      setTimeout(() => setComplaintActionSuccess(''), 4000);
      loadComplaints();
    } catch (err: any) {
      alert(err.message || 'Failed to update complaint action');
    }
  };

  useEffect(() => {
    if (!selectedWorkId) return;
    let active = true;
    setDetail(null); 
    setDetailError(''); 
    setActionNotice('');
    fetchOfficerWork(selectedWorkId).then((result) => { 
      if (active) setDetail(result); 
    }).catch((error) => { 
      if (active) setDetailError(error.message || 'Unable to load work monitoring record.'); 
    });
    return () => { active = false; };
  }, [selectedWorkId]);

  const setFilter = (key: keyof typeof filters, value: string) => 
    setFilters((current) => ({ ...current, [key]: value, ...(key === 'state' ? { constituency: '' } : {}) }));

  const visiblePriority = focusDimension === 'all'
    ? dashboard.priority_works
    : dashboard.priority_works.filter((item) => {
        if (focusDimension === 'material') {
          return item.signals.some((s) => s.key === 'financial' || s.label.toLowerCase().includes('material'));
        }
        return item.signals.some((signal) => signal.key === focusDimension);
      });

  if (selectedWorkId) {
    if (detailError) {
      return (
        <div className="p-6 space-y-4">
          <button onClick={() => setSelectedWorkId(null)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold">
            <ArrowLeft className="h-4 w-4" />Back to officer queue
          </button>
          <DataWarning>{detailError}</DataWarning>
        </div>
      );
    }
    if (!detail) {
      return <div className="p-10 text-center text-sm font-medium text-slate-500">Loading Project Monitoring 360° for {selectedWorkId}…</div>;
    }
    return (
      <OfficerWorkView 
        detail={detail} 
        onBack={() => setSelectedWorkId(null)} 
        onOpenMaterialScanner={() => {
          setSelectedWorkId(null);
          setActiveOfficerTab('materials');
        }}
        actionNotice={actionNotice} 
        onAction={(label) => setActionNotice(`${label} has been recorded in the field inspection protocol.`)} 
      />
    );
  }

  // 7 KPI cards connecting real Citizen Complaints
  const cards = [
    { label: 'Total works', value: dashboard.summary.total_works, icon: ClipboardCheck, tone: 'slate', dimension: 'all' },
    { label: 'High priority works', value: dashboard.summary.high_priority_works, icon: ShieldAlert, tone: 'rose', dimension: 'all' },
    { label: 'Citizen complaints', value: dashboard.summary.citizen_complaints, icon: MessageSquareWarning, tone: 'orange', dimension: 'complaints' },
    { label: 'Material price reviews', value: dashboard.summary.material_price_reviews, icon: Scale, tone: 'amber', dimension: 'material' },
    { label: 'Compliance issues', value: dashboard.summary.compliance_issues, icon: FileSearch, tone: 'emerald', dimension: 'compliance' },
    { label: 'Schedule risks', value: dashboard.summary.schedule_risks, icon: CalendarClock, tone: 'sky', dimension: 'schedule' },
    { label: 'Candidate duplicates', value: dashboard.summary.duplicate_candidates, icon: Copy, tone: 'violet', dimension: 'duplicate' },
  ] as const;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Officer Operational Workspace Navigation */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-emerald-700">MPLADS Implementing Officer</p>
            <h2 className="mt-1 text-xl font-black text-slate-900">Monitoring &amp; Action Center</h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
              Evidence-led verification center for implementing district authorities. Inspect priority queues, address public citizen grievances with geotagged proof, and scan material vouchers vs Schedule of Rates (SOR).
            </p>
          </div>
          
          {/* Sub-Module Operational Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveOfficerTab('queue')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeOfficerTab === 'queue'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardCheck className="w-4 h-4 text-emerald-600" />
              Priority Work Queue
            </button>
            <button
              onClick={() => setActiveOfficerTab('complaints')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeOfficerTab === 'complaints'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquareWarning className="w-4 h-4 text-orange-600" />
              Citizen Grievances ({dashboard.summary.citizen_complaints})
            </button>
            <button
              onClick={() => setActiveOfficerTab('materials')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeOfficerTab === 'materials'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-4 h-4 text-amber-600" />
              Material Voucher Scanner &amp; Fairness
            </button>
            <button
              onClick={() => setActiveOfficerTab('benchmarks')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeOfficerTab === 'benchmarks'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-indigo-600" />
              SOR Reference Rates
            </button>
          </div>
        </div>

        {/* Filters for Priority Work Queue */}
        {activeOfficerTab === 'queue' && (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5 pt-4 border-t border-slate-100">
            <select value={filters.state} onChange={(e) => setFilter('state', e.target.value)} className="rounded-xl px-3 py-2 text-xs font-medium border border-slate-200 bg-slate-50">
              <option value="">All states</option>
              {dashboard.available.states.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={filters.constituency} onChange={(e) => setFilter('constituency', e.target.value)} className="rounded-xl px-3 py-2 text-xs font-medium border border-slate-200 bg-slate-50">
              <option value="">All constituencies</option>
              {dashboard.available.constituencies.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={filters.work_status} onChange={(e) => setFilter('work_status', e.target.value)} className="rounded-xl px-3 py-2 text-xs font-medium border border-slate-200 bg-slate-50">
              <option value="">All work statuses</option>
              {dashboard.available.statuses.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={filters.severity} onChange={(e) => setFilter('severity', e.target.value)} className="rounded-xl px-3 py-2 text-xs font-medium border border-slate-200 bg-slate-50">
              <option value="">All risk levels</option>
              {dashboard.available.severities.map((item) => <option key={item}>{item}</option>)}
            </select>
            <label className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input value={filters.search} onChange={(e) => setFilter('search', e.target.value)} placeholder="Search Work ID or project" className="w-full rounded-xl py-2 pl-9 pr-3 text-xs border border-slate-200 bg-slate-50" />
            </label>
          </div>
        )}
      </div>

      {/* Sub-tab 1: Citizen Grievances & Malpractice Reports */}
      {activeOfficerTab === 'complaints' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 text-xs">
            <div>
              <span className="font-bold text-orange-950 flex items-center gap-2">
                <MessageSquareWarning className="w-4 h-4 text-orange-600" />
                Live Citizen Grievances &amp; Geotagged Malpractice Reports
              </span>
              <p className="text-orange-800 text-[11px] mt-0.5">
                Reports filed by local citizens with photo evidence and GPS verification. Orders issued here notify field inspecting engineers.
              </p>
            </div>
            <button
              onClick={loadComplaints}
              className="px-3 py-1.5 rounded-lg bg-orange-600 text-white font-bold flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${complaintsLoading ? 'animate-spin' : ''}`} />
              Refresh Complaints
            </button>
          </div>

          {complaintActionSuccess && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {complaintActionSuccess}
            </div>
          )}

          {complaintsLoading ? (
            <div className="p-12 text-center text-xs text-slate-500">Loading citizen grievances...</div>
          ) : citizenComplaints.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
              No citizen grievances have been submitted for this constituency.
            </div>
          ) : (
            <div className="space-y-4">
              {citizenComplaints.map((c) => {
                const isPending = c.status === 'PENDING_VERIFICATION';
                const isInspection = c.status === 'FIELD_INSPECTION_ORDERED';
                const isResolved = c.status === 'RESOLVED';
                return (
                  <div key={c.complaint_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{c.complaint_id}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800">
                            {c.category_label}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isResolved
                              ? 'bg-emerald-100 text-emerald-800'
                              : isInspection
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {c.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {c.work_id && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedWorkId(c.work_id!)}
                              className="font-mono text-xs font-bold text-indigo-700 hover:underline"
                            >
                              Linked Work: {c.work_id}
                            </button>
                          </div>
                        )}
                        <h4 className="text-sm font-bold text-slate-800">{c.work_title || 'General Local Public Work'}</h4>
                        <div className="text-[11px] text-slate-400">
                          {c.state} · {c.constituency} · Reported on {new Date(c.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </div>
                      </div>

                      <div className="text-right text-xs shrink-0">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Reported By</span>
                        <span className="font-bold text-slate-700">{c.citizen_name || 'Anonymous Whistleblower'}</span>
                        {c.citizen_phone && <p className="text-[10px] text-slate-500 font-mono mt-0.5">{c.citizen_phone}</p>}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 rounded-xl p-3 leading-relaxed font-medium">
                      "{c.description}"
                    </p>

                    {/* Geotag & GPS */}
                    {c.location && (c.location.lat || c.location.address) && (
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1 text-emerald-700">
                          <MapPin className="w-3.5 h-3.5" />
                          {c.location.address}
                        </span>
                        {c.location.lat && (
                          <span className="font-mono text-[10px] text-slate-500">
                            GPS Coordinates: {c.location.lat}°, {c.location.lon}°
                          </span>
                        )}
                      </div>
                    )}

                    {/* Photographic Proof Display */}
                    {c.proof_images && c.proof_images.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Uploaded Photographic Evidence ({c.proof_images.length})
                        </span>
                        <div className="flex items-center gap-3 overflow-x-auto">
                          {c.proof_images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt="Citizen evidence"
                              className="w-24 h-16 object-cover rounded-xl border border-slate-200 shadow-2xs"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Officer Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-slate-600">
                        Current Action: <strong className="text-slate-800">{c.officer_action_notes || 'Pending initial review'}</strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOfficerComplaintAction(c.complaint_id, 'FIELD_INSPECTION_ORDERED', 'Field verification assigned to Junior Engineer / Assistant Executive Engineer.')}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition-colors"
                        >
                          Order Field Inspection
                        </button>
                        <button
                          onClick={() => handleOfficerComplaintAction(c.complaint_id, 'SHOW_CAUSE_ISSUED', 'Show cause notice issued to contractor regarding specification deviation.')}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs transition-colors"
                        >
                          Issue Contractor Notice
                        </button>
                        <button
                          onClick={() => handleOfficerComplaintAction(c.complaint_id, 'RESOLVED', 'Field inspection completed and remedial action verified on site.')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 2: Material Voucher Scanner */}
      {activeOfficerTab === 'materials' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 px-4 text-xs text-amber-900 dark:text-amber-300">
            <span className="flex items-center gap-2 font-semibold">
              <Scale className="w-4 h-4 text-amber-600" />
              Implementing Officer Material Quality &amp; Price Verification Hub
            </span>
            <button
              onClick={() => setActiveOfficerTab('queue')}
              className="font-bold underline text-amber-800 dark:text-amber-200"
            >
              Back to Officer Work Queue →
            </button>
          </div>
          <MaterialFairnessPage initialViewTab="audit" onSelectWork={(workId) => setSelectedWorkId(workId)} />
        </div>
      )}

      {/* Sub-tab 3: SOR Reference Rates */}
      {activeOfficerTab === 'benchmarks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 px-4 text-xs text-indigo-900 dark:text-indigo-300">
            <span className="flex items-center gap-2 font-semibold">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Schedule of Rates (SOR) &amp; CPWD Reference Benchmark Matrix
            </span>
            <button
              onClick={() => setActiveOfficerTab('queue')}
              className="font-bold underline text-indigo-800 dark:text-indigo-200"
            >
              Back to Officer Work Queue →
            </button>
          </div>
          <MaterialFairnessPage initialViewTab="benchmarks" onSelectWork={(workId) => setSelectedWorkId(workId)} />
        </div>
      )}

      {/* Sub-tab 4: Primary Priority Queue */}
      {activeOfficerTab === 'queue' && (
        <>
          {/* 7 Metric Summary Cards including Citizen complaints */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
            {cards.map((card) => {
              const Icon = card.icon;
              const isSelected = focusDimension === card.dimension;
              return (
                <button 
                  type="button" 
                  key={card.label} 
                  onClick={() => {
                    if (card.label === 'Citizen complaints') {
                      setActiveOfficerTab('complaints');
                    } else if (card.label === 'Material price reviews') {
                      setFocusDimension('material');
                    } else {
                      setFocusDimension(card.dimension);
                    }
                  }} 
                  className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 ${
                    isSelected ? 'border-slate-900 ring-2 ring-slate-200' : 'border-slate-200/80'
                  }`}
                >
                  <div className={`mb-3 inline-flex rounded-lg p-2 ${
                    card.tone === 'rose'
                      ? 'bg-rose-50 text-rose-600'
                      : card.tone === 'orange'
                      ? 'bg-orange-50 text-orange-600'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{loading ? '—' : card.value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">{card.label}</p>
                  <p className="mt-2 text-[10px] font-semibold text-indigo-600">
                    {card.label === 'Citizen complaints' ? 'View grievances →' : 'Filter queue →'}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Focus Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Queue focus</span>
            {[
              ['all', 'All Priority'], 
              ['material', 'Material Reviews'],
              ['financial', 'Financial Reviews'], 
              ['compliance', 'Compliance Gaps'], 
              ['schedule', 'Schedule Risks'], 
              ['duplicate', 'Duplicates']
            ].map(([key, label]) => (
              <button 
                type="button" 
                key={key} 
                onClick={() => setFocusDimension(key)} 
                className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold transition ${
                  focusDimension === key ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Priority Review Table */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">Priority Work Action Queue</h3>
                <p className="mt-0.5 text-xs text-slate-500">Ranked by analytical risk indicators. Select a Work ID for the 360° verification profile.</p>
              </div>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{visiblePriority.length} shown</span>
            </div>
            
            {visiblePriority.length === 0 && !loading ? (
              <div className="p-8 text-center text-xs text-slate-500">No works match the selected filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Work ID / Project</th>
                      <th className="px-4 py-3">Why Flagged</th>
                      <th className="px-4 py-3">Severity</th>
                      <th className="px-4 py-3">Officer Action</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visiblePriority.map((item) => (
                      <tr key={item.work_id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <button onClick={() => setSelectedWorkId(item.work_id)} className="font-mono font-bold text-indigo-700 hover:underline">
                            {item.work_id}
                          </button>
                          <p className="mt-1 max-w-xs truncate text-slate-500">{item.description || 'Description unavailable'}</p>
                          <p className="mt-1 text-[10px] text-slate-400">{item.state} · {item.constituency}</p>
                        </td>
                        <td className="max-w-sm px-4 py-4 leading-relaxed text-slate-600">{item.why_flagged}</td>
                        <td className="px-4 py-4"><RiskBadge level={item.overall_risk} score={item.overall_risk_score} /></td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-slate-700">{item.recommended_action}</span>
                          <p className="mt-1 text-[10px] font-bold uppercase text-slate-400">{item.officer_review_status}</p>
                        </td>
                        <td className="px-5 py-4">
                          <button onClick={() => setSelectedWorkId(item.work_id)} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 font-bold text-white">
                            Review <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

const OfficerWorkView: React.FC<{ 
  detail: OfficerWorkResponse; 
  onBack: () => void; 
  onOpenMaterialScanner: () => void;
  actionNotice: string; 
  onAction: (label: string) => void;
}> = ({ detail, onBack, onOpenMaterialScanner, actionNotice, onAction }) => {
  const { work } = detail;
  const rootRef = React.useRef<HTMLDivElement>(null);
  
  const jumpTo = (id: string) => {
    const order: Record<string, number> = { 'risk-summary': 0, evidence: 1, financial: 2, material: 3, citizen: 3, compliance: 4, duplicates: 4, schedule: 5, actions: 1 };
    const target = rootRef.current?.querySelectorAll(':scope > section')[order[id]];
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const materialItems = detail.material?.material_benchmark_details || [];
  const citizenComplaintsList = detail.citizen_feedback?.complaints || [];

  const actions = [
    'Mark for Field Verification', 
    'Request Supporting Documents', 
    'Review Material Invoices & Vouchers', 
    'Verify Measurement Book (MB)', 
    'Check Site Geo-tag Evidence', 
    'Order Lab Quality Testing (Core/Tensile)',
    'Mark as Reviewed'
  ];

  return (
    <div ref={rootRef} className="p-4 md:p-6 space-y-6">
      <button onClick={onBack} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm">
        <ArrowLeft className="h-4 w-4" />Return to priority work queue
      </button>

      {/* Header Profile */}
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 lg:flex-row">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-emerald-700">Project Monitoring — 360° Decision Support</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs font-bold text-slate-800">{work.work_id}</span>
              <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                <MapPin className="mr-1 inline h-3.5 w-3.5" />{work.state || work.State} · {work.constituency || work.Constituency}
              </span>
              <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">{work.work_status || 'Status unavailable'}</span>
            </div>
            <h1 className="mt-4 max-w-4xl text-lg font-black leading-snug text-slate-900">{work.description || 'Project description unavailable'}</h1>
            <p className="mt-2 text-xs text-slate-500">
              Category: {work.work_category || 'Not available'} · Analytical Result: {work.overall_risk_level || 'UNASSESSED'} · Officer Review: <strong className="text-slate-700">{detail.officer_review.status}</strong>
            </p>
          </div>
          <div className="self-start rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Overall Risk Score</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{Number(work.composite_risk_score || 0).toFixed(1)}</p>
            <RiskBadge level={work.overall_risk_level || 'LOW'} />
          </div>
        </div>
      </header>

      {/* Jump Links */}
      <nav className="sticky top-2 z-10 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur">
        {[
          ['risk-summary', 'Risk Summary'], 
          ['evidence', 'Cross-Module Evidence'], 
          ['financial', 'Financial'], 
          ['material', 'Material & SOR'],
          ['citizen', `Citizen Grievances (${citizenComplaintsList.length})`],
          ['compliance', 'Compliance'], 
          ['schedule', 'Schedule'], 
          ['duplicates', 'Duplicates'], 
          ['actions', 'Officer Actions']
        ].map(([id, label]) => (
          <button type="button" key={id} onClick={() => jumpTo(id)} className="whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900">
            {label}
          </button>
        ))}
      </nav>

      {/* Component Scores */}
      <section id="risk-summary" className="grid gap-4 lg:grid-cols-4">
        {detail.risk_components.map((component) => (
          <ScoreBar key={component.key} label={component.label} score={component.score} source={component.source} />
        ))}
      </section>

      {/* Cross Module Evidence & Action Center */}
      <section className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-black text-slate-900">Cross-Module Evidence Summary</h2>
          <p className="mt-1 text-xs text-slate-500">Independent analytical indicators requiring verification by the implementing authority.</p>
          {detail.evidence_summary.length ? (
            <ul className="mt-4 space-y-3">
              {detail.evidence_summary.map((signal) => (
                <li key={signal.key} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-800">{signal.label}</span>
                    <span className="font-mono text-xs font-bold text-slate-600">{signal.score.toFixed(1)} / 100</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{signal.explanation}</p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Suggested verification: {signal.recommended_action}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-xs text-slate-500">No component score meets the review threshold in the currently available analytical data.</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-black text-slate-900">Implementing Officer Action Center</h2>
          <p className="mt-1 text-xs text-slate-500">Log statutory field inspection status.</p>
          <div className="mt-4 space-y-2">
            {actions.map((action) => (
              <button key={action} onClick={() => onAction(action)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                {action}
              </button>
            ))}
          </div>
          {actionNotice && <div className="mt-3"><DataWarning>{actionNotice}</DataWarning></div>}
        </div>
      </section>

      {/* Financial & Schedule Modules */}
      <section className="grid gap-5 lg:grid-cols-2">
        <ModuleCard title="Financial Cost & Expenditure Analysis" icon={<WalletCards className="h-4 w-4" />}>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <Metric label="Sanction amount" value={money(work.sanction_amount)} />
            <Metric label="Effective expenditure" value={money(work.effective_expenditure)} />
            <Metric label="Peer median" value={money(work.peer_median || work.peer_group_median)} />
            <Metric label="Peer ratio" value={work.amount_to_peer_ratio?.toFixed(2) || 'Not available'} />
            <Metric label="Payment count" value={String(work.payment_count ?? 'Not available')} />
            <Metric label="Financial risk" value={`${Number(work.financial_risk_score || 0).toFixed(1)} / 100`} />
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-slate-600">{work.financial_explanation || 'No financial explanation is available.'}</p>
        </ModuleCard>

        <ModuleCard title="Schedule & Timeline Progress Monitoring" icon={<Clock3 className="h-4 w-4" />}>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <Metric label="Sanction date" value={work.sanction_date || 'Not available'} />
            <Metric label="Expected completion" value={work.estimated_completion_date || 'Not available'} />
            <Metric label="Expected progress" value={work.expected_timeline_progress_pct !== undefined ? `${work.expected_timeline_progress_pct}%` : 'Not available'} />
            <Metric label="Expenditure progress" value={work.expenditure_progress_pct !== undefined ? `${work.expenditure_progress_pct}%` : 'Not available'} />
            <Metric label="Progress gap" value={work.progress_gap_pct !== undefined ? `${work.progress_gap_pct}%` : 'Not available'} />
            <Metric label="Schedule risk" value={`${Number(work.schedule_risk_score || 0).toFixed(1)} / 100`} />
          </dl>
          {!work.sanction_date || !work.estimated_completion_date ? (
            <div className="mt-4"><DataWarning>Timeline information is incomplete. Do not infer a definite delay without missing dates.</DataWarning></div>
          ) : (
            <p className="mt-4 text-xs text-slate-600">Schedule indicator: <strong>{Number(work.schedule_risk_score || 0) >= 35 ? 'REQUIRES REVIEW' : 'Standard monitoring'}</strong></p>
          )}
        </ModuleCard>
      </section>

      {/* Material & Citizen Grievance Modules */}
      <section className="grid gap-5 lg:grid-cols-2">
        <ModuleCard title="Material Quality & Price Fairness Context" icon={<Scale className="h-4 w-4" />}>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Observed description → rule-based inference → Schedule of Rates (SOR) benchmark.</p>
            <button
              onClick={onOpenMaterialScanner}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 shrink-0"
            >
              Open Material Scanner <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          {detail.material_warning && <div className="mt-3"><DataWarning>{detail.material_warning}</DataWarning></div>}
          {materialItems.length ? (
            <div className="mt-4 space-y-3">
              {materialItems.map((item: any) => (
                <div key={item.material} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                  <div className="flex justify-between gap-3">
                    <strong className="text-slate-800">{item.material}</strong>
                    <span className="font-bold text-slate-600">{item.source === 'EXPLICIT' ? 'Observed in description' : 'AI-inferred from work type'}</span>
                  </div>
                  <p className="mt-1 text-slate-600">
                    Reference SOR: {item.benchmark_price ? `${money(item.benchmark_price)} / ${item.benchmark_unit || 'unit'}` : 'No matching reference price'} · Quantity: {item.quantity ? `${item.quantity} ${item.unit || ''}` : 'Not specified in title'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <DataWarning>Material specification or detailed Bill of Quantities (BOQ) requires manual voucher verification.</DataWarning>
            </div>
          )}
        </ModuleCard>

        {/* Real Citizen Grievances on this specific work */}
        <ModuleCard title={`Citizen Grievances on this Project (${citizenComplaintsList.length})`} icon={<MessageSquareWarning className="h-4 w-4 text-orange-600" />}>
          {citizenComplaintsList.length > 0 ? (
            <div className="space-y-3">
              {citizenComplaintsList.map((c) => (
                <div key={c.complaint_id} className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{c.complaint_id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-800">
                        {c.category_label}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-900 text-white">
                      {c.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-medium">"{c.description}"</p>
                  {c.location && (c.location.lat || c.location.address) && (
                    <div className="text-[11px] text-slate-600 font-mono flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {c.location.address} {c.location.lat ? `(GPS: ${c.location.lat}°, ${c.location.lon}°)` : ''}
                    </div>
                  )}
                  {c.proof_images && c.proof_images.length > 0 && (
                    <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                      {c.proof_images.map((img, i) => (
                        <img key={i} src={img} alt="Evidence" className="w-16 h-12 object-cover rounded-lg border border-slate-300" />
                      ))}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400">
                    Reported by <strong>{c.citizen_name || 'Anonymous Whistleblower'}</strong> on {new Date(c.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              No citizen grievances have been recorded for this specific Work ID yet.
            </p>
          )}
        </ModuleCard>
      </section>

      {/* Practical Field Site Verification Protocol */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-black text-slate-900">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Field Verification &amp; Physical Audit Protocol
        </h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              1. Photographic Evidence &amp; Geo-tag Verification
            </div>
            <p className="text-slate-600">
              Confirm GPS-tagged photos are recorded for commencement, intermediate progress, and completion stages.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              2. Measurement Book (MB) Reconciliation
            </div>
            <p className="text-slate-600">
              Cross-verify physical dimensions and contractor measurement entries with sanctioned Detailed Project Report (DPR).
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              3. Contractor Vouchers &amp; Material Quality Inspection
            </div>
            <p className="text-slate-600">
              Ensure supplied materials (OPC 53 Cement, Fe500D TMT Steel, Aggregates) match Bureau of Indian Standards (BIS) specifications.
            </p>
          </div>
        </div>
      </section>

      {/* Compliance Findings & Duplicates */}
      <section className="grid gap-5 lg:grid-cols-2">
        <ModuleCard title={`Compliance Monitoring Findings (${detail.compliance_findings.length})`} icon={<ClipboardCheck className="h-4 w-4" />}>
          {detail.compliance_findings.length ? (
            <div className="space-y-3">
              {detail.compliance_findings.map((finding) => (
                <div key={finding.rule_id} className="rounded-xl border border-slate-200 p-3 text-xs">
                  <div className="flex justify-between gap-3">
                    <strong>{finding.rule_id}: {finding.rule_name}</strong>
                    <span className="font-bold text-slate-600">{finding.status}</span>
                  </div>
                  <p className="mt-2 text-slate-600">{finding.what_happened || finding.supporting_details || 'No explanatory evidence is available.'}</p>
                  <p className="mt-2 text-[10px] font-bold uppercase text-emerald-700">Requires verification: {finding.why_it_matters || 'Review underlying compliance evidence.'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No rule-level compliance findings are flagged for this work.</p>
          )}
        </ModuleCard>

        <ModuleCard title={`Potentially Similar / Duplicate Works (${detail.candidate_duplicates.length})`} icon={<Copy className="h-4 w-4" />}>
          {detail.candidate_duplicates.length ? (
            <div className="space-y-3">
              {detail.candidate_duplicates.map((candidate, index) => {
                const other = candidate.work_id_1 === work.work_id ? candidate.work_id_2 : candidate.work_id_1;
                const similarity = Number(candidate.similarity_score || 0);
                return (
                  <div key={`${other}-${index}`} className="rounded-xl border border-slate-200 p-3 text-xs">
                    <strong className="font-mono text-slate-800">Candidate duplicate: {other}</strong>
                    <p className="mt-1 text-slate-600">Similarity: {similarity.toFixed(1)}% · {candidate.nlp_explanation || 'Potentially similar work; officer review required.'}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No candidate duplicate pairs flagged for this Work ID.</p>
          )}
        </ModuleCard>
      </section>

      {/* Timeline & Traceability */}
      <section className="grid gap-5 lg:grid-cols-2">
        <ModuleCard title="Evidence Timeline" icon={<CalendarClock className="h-4 w-4" />}>
          {detail.timeline.length ? (
            <ol className="space-y-3 border-l-2 border-slate-200 pl-4">
              {detail.timeline.map((entry, index) => (
                <li key={`${entry.event}-${index}`} className="relative text-xs">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <strong className="text-slate-800">{entry.event}</strong>
                  <span className="ml-2 font-mono text-slate-500">{entry.date}</span>
                  <p className="mt-0.5 text-slate-500">Source: {entry.source}{entry.detail ? ` · ${entry.detail}` : ''}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-slate-500">No dated monitoring events are available.</p>
          )}
        </ModuleCard>

        <ModuleCard title="Data Source Traceability" icon={<FileSearch className="h-4 w-4" />}>
          <div className="space-y-3">
            {detail.traceability.map((source) => (
              <div key={source.label} className="rounded-xl bg-slate-50 p-3 text-xs">
                <strong className="text-slate-800">{source.label}</strong>
                <p className="mt-1 text-slate-600">Source: {source.source}</p>
                <p className="font-mono text-[10px] text-slate-500">Dataset: {source.dataset}</p>
              </div>
            ))}
          </div>
        </ModuleCard>
      </section>
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</dt>
    <dd className="mt-1 font-bold text-slate-800">{value}</dd>
  </div>
);

const ModuleCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="flex items-center gap-2 text-sm font-black text-slate-900">{icon}{title}</h2>
    <div className="mt-4">{children}</div>
  </section>
);
