import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronRight, ClipboardCheck, Copy, FileSearch, MapPin, Search, ShieldAlert, Users, WalletCards, CalendarClock, MessageSquareWarning, Scale, Clock3 } from 'lucide-react';
import { fetchOfficerDashboard, fetchOfficerWork } from '../services/api';
import { OfficerDashboardResponse, OfficerWorkResponse } from '../types';
import { RiskBadge } from '../components/cards/RiskBadge';

const initialDashboard: OfficerDashboardResponse = {
  selected_filters: {}, available: { states: [], constituencies: [], statuses: [], severities: [] },
  summary: { total_works: 0, high_priority_works: 0, material_price_reviews: 0, attendance_issues: 0, citizen_complaints: 0, compliance_issues: 0, schedule_risks: 0, duplicate_candidates: 0, financial_reviews: 0 },
  data_availability: {}, priority_works: [],
};

const money = (amount?: number) => {
  if (amount === undefined || amount === null) return 'Not available';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

const ScoreBar = ({ label, score, source }: { label: string; score: number; source?: string }) => (
  <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4">
    <div className="flex justify-between gap-3 text-xs font-bold text-slate-800"><span>{label}</span><span className="font-mono">{Number(score || 0).toFixed(1)} / 100</span></div>
    <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden"><div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.min(100, Math.max(0, Number(score || 0)))}%` }} /></div>
    {source && <p className="mt-2 text-[10px] font-medium text-slate-500">Source: {source}</p>}
  </div>
);

const DataWarning = ({ children }: { children: React.ReactNode }) => <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-900"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{children}</div>;

export const OfficerDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<OfficerDashboardResponse>(initialDashboard);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ state: '', constituency: '', work_status: '', severity: '', search: '' });
  const [focusDimension, setFocusDimension] = useState('all');
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OfficerWorkResponse | null>(null);
  const [detailError, setDetailError] = useState('');
  const [actionNotice, setActionNotice] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchOfficerDashboard(filters).then((result) => {
      if (active) { setDashboard(result); setLoading(false); }
    }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filters]);

  useEffect(() => {
    if (!selectedWorkId) return;
    let active = true;
    setDetail(null); setDetailError(''); setActionNotice('');
    fetchOfficerWork(selectedWorkId).then((result) => { if (active) setDetail(result); }).catch((error) => { if (active) setDetailError(error.message || 'Unable to load work monitoring record.'); });
    return () => { active = false; };
  }, [selectedWorkId]);

  const setFilter = (key: keyof typeof filters, value: string) => setFilters((current) => ({ ...current, [key]: value, ...(key === 'state' ? { constituency: '' } : {}) }));
  const visiblePriority = focusDimension === 'all'
    ? dashboard.priority_works
    : dashboard.priority_works.filter((item) => item.signals.some((signal) => signal.key === focusDimension));

  if (selectedWorkId) {
    if (detailError) return <div className="p-6 space-y-4"><button onClick={() => setSelectedWorkId(null)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold"><ArrowLeft className="h-4 w-4" />Back to officer queue</button><DataWarning>{detailError}</DataWarning></div>;
    if (!detail) return <div className="p-10 text-center text-sm font-medium text-slate-500">Loading Project Monitoring 360° for {selectedWorkId}…</div>;
    return <OfficerWorkView detail={detail} onBack={() => setSelectedWorkId(null)} actionNotice={actionNotice} onAction={(label) => setActionNotice(`${label} is ready to submit when officer-action persistence is connected.`)} />;
  }

  const cards = [
    ['Total works', dashboard.summary.total_works, ClipboardCheck, 'slate'], ['High priority works', dashboard.summary.high_priority_works, ShieldAlert, 'rose'],
    ['Material price reviews', dashboard.summary.material_price_reviews, Scale, 'amber'], ['Attendance issues', dashboard.summary.attendance_issues, Users, 'indigo'],
    ['Citizen complaints', dashboard.summary.citizen_complaints, MessageSquareWarning, 'orange'], ['Compliance issues', dashboard.summary.compliance_issues, FileSearch, 'emerald'],
    ['Schedule risks', dashboard.summary.schedule_risks, CalendarClock, 'sky'], ['Candidate duplicates', dashboard.summary.duplicate_candidates, Copy, 'violet'],
  ] as const;

  return <div className="p-4 md:p-6 space-y-6">
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-emerald-700">MPLADS Implementing Officer</p><h2 className="mt-1 text-xl font-black text-slate-900">Monitoring &amp; Action Center</h2><p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">Evidence-led priority review across the analytical systems. Indicators require verification; they are not findings of wrongdoing.</p></div>
        <div className="flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-500" />Analytical results retained separately from officer review status</div>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <select value={filters.state} onChange={(e) => setFilter('state', e.target.value)} className="rounded-xl px-3 py-2 text-xs font-medium"><option value="">All states</option>{dashboard.available.states.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={filters.constituency} onChange={(e) => setFilter('constituency', e.target.value)} className="rounded-xl px-3 py-2 text-xs font-medium"><option value="">All constituencies</option>{dashboard.available.constituencies.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={filters.work_status} onChange={(e) => setFilter('work_status', e.target.value)} className="rounded-xl px-3 py-2 text-xs font-medium"><option value="">All work statuses</option>{dashboard.available.statuses.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={filters.severity} onChange={(e) => setFilter('severity', e.target.value)} className="rounded-xl px-3 py-2 text-xs font-medium"><option value="">All risk levels</option>{dashboard.available.severities.map((item) => <option key={item}>{item}</option>)}</select>
        <label className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={filters.search} onChange={(e) => setFilter('search', e.target.value)} placeholder="Search Work ID or project" className="w-full rounded-xl py-2 pl-9 pr-3 text-xs" /></label>
      </div>
    </div>

    {(dashboard.data_availability.attendance && !dashboard.data_availability.attendance.available || dashboard.data_availability.citizen && !dashboard.data_availability.citizen.available) && <DataWarning>Attendance and citizen report cards use zero only because their datasets are not connected; zero is not an analytical finding.</DataWarning>}

    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">{cards.map(([label, value, Icon, tone]) => <button type="button" key={label} onClick={() => setFocusDimension(label === 'Material price reviews' ? 'financial' : label === 'Compliance issues' ? 'compliance' : label === 'Schedule risks' ? 'schedule' : label === 'Candidate duplicates' ? 'duplicate' : label === 'High priority works' ? 'all' : 'all')} className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 ${focusDimension !== 'all' && (label === 'Material price reviews' && focusDimension === 'financial' || label === 'Compliance issues' && focusDimension === 'compliance' || label === 'Schedule risks' && focusDimension === 'schedule' || label === 'Candidate duplicates' && focusDimension === 'duplicate') ? 'border-slate-900 ring-2 ring-slate-200' : 'border-slate-200/80'}`}><div className={`mb-3 inline-flex rounded-lg p-2 ${tone === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-700'}`}><Icon className="h-4 w-4" /></div><p className="text-2xl font-black text-slate-900">{loading ? '—' : value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-[10px] font-semibold text-indigo-600">Filter queue →</p></button>)}</div>
    <div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Queue focus</span>{[['all', 'All priority'], ['financial', 'Financial'], ['compliance', 'Compliance'], ['schedule', 'Schedule'], ['duplicate', 'Duplicates']].map(([key, label]) => <button type="button" key={key} onClick={() => setFocusDimension(key)} className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold transition ${focusDimension === key ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}>{label}</button>)}</div>

    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h3 className="text-sm font-black text-slate-900">Priority work review</h3><p className="mt-0.5 text-xs text-slate-500">Ranked by existing analytical indicators. Select a Work ID for the full 360° evidence view.</p></div><span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{visiblePriority.length} shown</span></div>
      {visiblePriority.length === 0 && !loading ? <div className="p-8 text-center text-xs text-slate-500">No works match the selected filters.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Work ID / Project</th><th className="px-4 py-3">Why flagged</th><th className="px-4 py-3">Severity</th><th className="px-4 py-3">Officer action</th><th className="px-5 py-3" /></tr></thead><tbody className="divide-y divide-slate-100">{visiblePriority.map((item) => <tr key={item.work_id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><button onClick={() => setSelectedWorkId(item.work_id)} className="font-mono font-bold text-indigo-700 hover:underline">{item.work_id}</button><p className="mt-1 max-w-xs truncate text-slate-500">{item.description || 'Description unavailable'}</p><p className="mt-1 text-[10px] text-slate-400">{item.state} · {item.constituency}</p></td><td className="max-w-sm px-4 py-4 leading-relaxed text-slate-600">{item.why_flagged}</td><td className="px-4 py-4"><RiskBadge level={item.overall_risk} score={item.overall_risk_score} /></td><td className="px-4 py-4"><span className="font-semibold text-slate-700">{item.recommended_action}</span><p className="mt-1 text-[10px] font-bold uppercase text-slate-400">{item.officer_review_status}</p></td><td className="px-5 py-4"><button onClick={() => setSelectedWorkId(item.work_id)} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 font-bold text-white">Review <ChevronRight className="h-3.5 w-3.5" /></button></td></tr>)}</tbody></table></div>}
    </section>
  </div>;
};

const OfficerWorkView: React.FC<{ detail: OfficerWorkResponse; onBack: () => void; actionNotice: string; onAction: (label: string) => void }> = ({ detail, onBack, actionNotice, onAction }) => {
  const { work } = detail;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const jumpTo = (id: string) => {
    const order: Record<string, number> = { 'risk-summary': 0, evidence: 1, financial: 2, material: 3, compliance: 4, duplicates: 4, schedule: 5, actions: 1 };
    const target = rootRef.current?.querySelectorAll(':scope > section')[order[id]];
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const materialItems = detail.material?.material_benchmark_details || [];
  const actions = ['Mark for Field Verification', 'Request Supporting Documents', 'Review Material Evidence', 'Review Attendance', 'Review Citizen Complaint', 'Mark as Reviewed'];
  return <div ref={rootRef} className="p-4 md:p-6 space-y-6">
    <button onClick={onBack} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm"><ArrowLeft className="h-4 w-4" />Return to priority work review</button>
    <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-5 lg:flex-row"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-emerald-700">Project monitoring — 360°</p><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs font-bold text-slate-800">{work.work_id}</span><span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"><MapPin className="mr-1 inline h-3.5 w-3.5" />{work.state || work.State} · {work.constituency || work.Constituency}</span><span className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">{work.work_status || 'Status unavailable'}</span></div><h1 className="mt-4 max-w-4xl text-lg font-black leading-snug text-slate-900">{work.description || 'Project description unavailable'}</h1><p className="mt-2 text-xs text-slate-500">Category: {work.work_category || 'Not available'} · Analytical result: {work.overall_risk_level || 'UNASSESSED'} · Officer review: <strong className="text-slate-700">{detail.officer_review.status}</strong></p></div><div className="self-start rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-center"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Overall risk</p><p className="mt-1 text-3xl font-black text-slate-900">{Number(work.composite_risk_score || 0).toFixed(1)}</p><RiskBadge level={work.overall_risk_level || 'LOW'} /></div></div></header>

    <nav className="sticky top-2 z-10 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur">{[['risk-summary', 'Risk summary'], ['evidence', 'Evidence'], ['financial', 'Financial'], ['material', 'Material'], ['compliance', 'Compliance'], ['schedule', 'Schedule'], ['duplicates', 'Duplicates'], ['actions', 'Actions']].map(([id, label]) => <button type="button" key={id} onClick={() => jumpTo(id)} className="whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900">{label}</button>)}</nav>
    <section id="risk-summary" className="grid gap-4 lg:grid-cols-4">{detail.risk_components.map((component) => <ScoreBar key={component.key} label={component.label} score={component.score} source={component.source} />)}</section>
    <section className="grid gap-5 xl:grid-cols-3"><div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-sm font-black text-slate-900">Cross-module evidence summary</h2><p className="mt-1 text-xs text-slate-500">Independent analytical indicators that require officer verification.</p>{detail.evidence_summary.length ? <ul className="mt-4 space-y-3">{detail.evidence_summary.map((signal) => <li key={signal.key} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-bold text-slate-800">{signal.label}</span><span className="font-mono text-xs font-bold text-slate-600">{signal.score.toFixed(1)} / 100</span></div><p className="mt-1.5 text-xs leading-relaxed text-slate-600">{signal.explanation}</p><p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Suggested verification: {signal.recommended_action}</p></li>)}</ul> : <p className="mt-4 text-xs text-slate-500">No component score meets the review threshold in the currently available analytical data.</p>}</div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-sm font-black text-slate-900">Officer action center</h2><p className="mt-1 text-xs text-slate-500">UI is ready for the action backend. It does not alter analytical risk.</p><div className="mt-4 space-y-2">{actions.map((action) => <button key={action} onClick={() => onAction(action)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50">{action}</button>)}</div>{actionNotice && <DataWarning>{actionNotice}</DataWarning>}</div></section>

    <section className="grid gap-5 lg:grid-cols-2"><ModuleCard title="Financial analysis" icon={<WalletCards className="h-4 w-4" />}><dl className="grid grid-cols-2 gap-3 text-xs"><Metric label="Sanction amount" value={money(work.sanction_amount)} /><Metric label="Effective expenditure" value={money(work.effective_expenditure)} /><Metric label="Peer median" value={money(work.peer_median || work.peer_group_median)} /><Metric label="Peer ratio" value={work.amount_to_peer_ratio?.toFixed(2) || 'Not available'} /><Metric label="Payment count" value={String(work.payment_count ?? 'Not available')} /><Metric label="Financial risk" value={`${Number(work.financial_risk_score || 0).toFixed(1)} / 100`} /></dl><p className="mt-4 text-xs leading-relaxed text-slate-600">{work.financial_explanation || 'No financial explanation is available.'}</p></ModuleCard><ModuleCard title="Schedule / progress monitoring" icon={<Clock3 className="h-4 w-4" />}><dl className="grid grid-cols-2 gap-3 text-xs"><Metric label="Sanction date" value={work.sanction_date || 'Not available'} /><Metric label="Expected completion" value={work.estimated_completion_date || 'Not available'} /><Metric label="Expected progress" value={work.expected_timeline_progress_pct !== undefined ? `${work.expected_timeline_progress_pct}%` : 'Not available'} /><Metric label="Expenditure progress" value={work.expenditure_progress_pct !== undefined ? `${work.expenditure_progress_pct}%` : 'Not available'} /><Metric label="Progress gap" value={work.progress_gap_pct !== undefined ? `${work.progress_gap_pct}%` : 'Not available'} /><Metric label="Schedule risk" value={`${Number(work.schedule_risk_score || 0).toFixed(1)} / 100`} /></dl>{!work.sanction_date || !work.estimated_completion_date ? <div className="mt-4"><DataWarning>Timeline information is incomplete. Do not infer a definite delay without the missing dates.</DataWarning></div> : <p className="mt-4 text-xs text-slate-600">Schedule indicator: <strong>{Number(work.schedule_risk_score || 0) >= 35 ? 'REQUIRES REVIEW' : 'Standard monitoring'}</strong></p>}</ModuleCard></section>

    <section className="grid gap-5 lg:grid-cols-2"><ModuleCard title="Material quality & price context" icon={<Scale className="h-4 w-4" />}><p className="text-xs text-slate-500">Observed description → rule-based inference → externally referenced benchmark. This is not laboratory quality confirmation.</p>{detail.material_warning && <div className="mt-3"><DataWarning>{detail.material_warning}</DataWarning></div>}{materialItems.length ? <div className="mt-4 space-y-3">{materialItems.map((item: any) => <div key={item.material} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs"><div className="flex justify-between gap-3"><strong className="text-slate-800">{item.material}</strong><span className="font-bold text-slate-600">{item.source === 'EXPLICIT' ? 'Observed in description' : 'AI-inferred from work type'}</span></div><p className="mt-1 text-slate-600">Reference: {item.benchmark_price ? `${money(item.benchmark_price)} / ${item.benchmark_unit || 'unit'}` : 'No matching reference price'} · Quantity: {item.quantity ? `${item.quantity} ${item.unit || ''}` : 'Not provided'}</p></div>)}</div> : <div className="mt-4"><DataWarning>Material specification or BOQ could not be verified from the available work data. Manual verification is required.</DataWarning></div>}</ModuleCard><ModuleCard title="Attendance & citizen feedback" icon={<Users className="h-4 w-4" />}><div className="space-y-3"><DataWarning>{detail.attendance.warning || 'No current attendance data available.'}</DataWarning><DataWarning>{detail.citizen_feedback.warning || 'No citizen reports are associated with this Work ID.'}</DataWarning></div><p className="mt-4 text-xs leading-relaxed text-slate-500">When connected, citizen reports will be presented as reported concerns requiring field verification—not as proof of wrongdoing.</p></ModuleCard></section>

    <section className="grid gap-5 lg:grid-cols-2"><ModuleCard title={`Compliance monitoring (${detail.compliance_findings.length})`} icon={<ClipboardCheck className="h-4 w-4" />}>{detail.compliance_findings.length ? <div className="space-y-3">{detail.compliance_findings.map((finding) => <div key={finding.rule_id} className="rounded-xl border border-slate-200 p-3 text-xs"><div className="flex justify-between gap-3"><strong>{finding.rule_id}: {finding.rule_name}</strong><span className="font-bold text-slate-600">{finding.status}</span></div><p className="mt-2 text-slate-600">{finding.what_happened || finding.supporting_details || 'No explanatory evidence is available for this rule.'}</p><p className="mt-2 text-[10px] font-bold uppercase text-emerald-700">Requires verification: {finding.why_it_matters || 'Review underlying compliance evidence.'}</p></div>)}</div> : <p className="text-xs text-slate-500">No rule-level compliance findings are available for this work.</p>}</ModuleCard><ModuleCard title={`Potentially similar works (${detail.candidate_duplicates.length})`} icon={<Copy className="h-4 w-4" />}>{detail.candidate_duplicates.length ? <div className="space-y-3">{detail.candidate_duplicates.map((candidate, index) => { const other = candidate.work_id_1 === work.work_id ? candidate.work_id_2 : candidate.work_id_1; const similarity = Number(candidate.similarity_score || 0); return <div key={`${other}-${index}`} className="rounded-xl border border-slate-200 p-3 text-xs"><strong className="font-mono text-slate-800">Candidate duplicate: {other}</strong><p className="mt-1 text-slate-600">Similarity: {similarity.toFixed(1)}% · {candidate.nlp_explanation || 'Potentially similar work; officer review required.'}</p></div>; })}</div> : <p className="text-xs text-slate-500">No candidate duplicate result is associated with this Work ID.</p>}</ModuleCard></section>

    <section className="grid gap-5 lg:grid-cols-2"><ModuleCard title="Evidence timeline" icon={<CalendarClock className="h-4 w-4" />}>{detail.timeline.length ? <ol className="space-y-3 border-l-2 border-slate-200 pl-4">{detail.timeline.map((entry, index) => <li key={`${entry.event}-${index}`} className="relative text-xs"><span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-500" /><strong className="text-slate-800">{entry.event}</strong><span className="ml-2 font-mono text-slate-500">{entry.date}</span><p className="mt-0.5 text-slate-500">Source: {entry.source}{entry.detail ? ` · ${entry.detail}` : ''}</p></li>)}</ol> : <p className="text-xs text-slate-500">No dated monitoring events are available.</p>}</ModuleCard><ModuleCard title="Data source traceability" icon={<FileSearch className="h-4 w-4" />}><div className="space-y-3">{detail.traceability.map((source) => <div key={source.label} className="rounded-xl bg-slate-50 p-3 text-xs"><strong className="text-slate-800">{source.label}</strong><p className="mt-1 text-slate-600">Source: {source.source}</p><p className="font-mono text-[10px] text-slate-500">Dataset: {source.dataset}</p></div>)}</div></ModuleCard></section>
  </div>;
};

const Metric = ({ label, value }: { label: string; value: string }) => <div><dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 font-bold text-slate-800">{value}</dd></div>;
const ModuleCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 text-sm font-black text-slate-900">{icon}{title}</h2><div className="mt-4">{children}</div></section>;
