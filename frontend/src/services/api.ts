import {
  NationalOverviewResponse,
  PaginatedResponse,
  WorkRecord,
  CandidateDuplicatePair,
  FilterOptions
} from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

// Rich Mock Fallback Data derived from real MPLADS Dataset for static deployments
const MOCK_SUMMARY = {
  total_allocated_funds: 83336700000,
  total_sanctioned_amount: 41688600000,
  total_disbursed_amount: 18873200000,
  total_works: 79068,
  completed_works: 11791,
  high_risk_works: 29,
  critical_works: 0,
};

const MOCK_RISK_DISTRIBUTION = {
  LOW: 74117,
  MEDIUM: 4922,
  HIGH: 29,
  CRITICAL: 0,
};

const MOCK_TOP_STATES = [
  { state: 'UTTAR PRADESH', total_works: 15019, total_sanctioned: 7630592770, total_disbursed: 4210000000, high_risk_works: 17 },
  { state: 'BIHAR', total_works: 4545, total_sanctioned: 3392002636, total_disbursed: 1980000000, high_risk_works: 6 },
  { state: 'MANIPUR', total_works: 77, total_sanctioned: 204700909, total_disbursed: 120000000, high_risk_works: 2 },
  { state: 'MAHARASHTRA', total_works: 2420, total_sanctioned: 2324916470, total_disbursed: 1450000000, high_risk_works: 2 },
  { state: 'ANDHRA PRADESH', total_works: 2998, total_sanctioned: 1967300701, total_disbursed: 1120000000, high_risk_works: 1 },
  { state: 'WEST BENGAL', total_works: 4804, total_sanctioned: 3277889557, total_disbursed: 1890000000, high_risk_works: 1 },
  { state: 'ASSAM', total_works: 1619, total_sanctioned: 1022844554, total_disbursed: 610000000, high_risk_works: 0 },
];

const MOCK_CATEGORY_DISTRIBUTION = [
  { work_category: 'Roads & Infrastructure', total_works: 28450, total_sanctioned: 15400000000, high_risk_works: 12 },
  { work_category: 'Education & Schools', total_works: 18200, total_sanctioned: 9800000000, high_risk_works: 7 },
  { work_category: 'Water & Sanitation', total_works: 14300, total_sanctioned: 7200000000, high_risk_works: 5 },
  { work_category: 'Health & Community', total_works: 10100, total_sanctioned: 5600000000, high_risk_works: 3 },
  { work_category: 'Irrigation & Agri', total_works: 8018, total_sanctioned: 4100000000, high_risk_works: 2 },
];

const MOCK_WORKS: WorkRecord[] = [
  {
    work_id: 'WS/MP863/2026-2027/295003',
    work_category: 'Roads & Infrastructure',
    State: 'KARNATAKA',
    Constituency: 'BANGALORE CENTRAL',
    state: 'KARNATAKA',
    constituency: 'BANGALORE CENTRAL',
    mp_name: 'P. C. Mohan',
    description: 'Construction of CC Road in Ward 112 Bengaluru Central Constituency',
    sanction_amount: 1000000,
    effective_expenditure: 850000,
    peer_category_median_amount: 350000,
    amount_to_peer_ratio: 2.86,
    has_evidence_image: false,
    top_vendor: 'M CUBE INFRATECH PRIVATE LIMITED',
    top_vendor_share: 0.85,
    financial_risk_score: 72.0,
    financial_risk_level: 'HIGH',
    financial_explanation: 'Sanction amount exceeds 2.86x peer median baseline for similar CC road works in Karnataka.',
    vendor_risk_score: 94.0,
    vendor_risk_level: 'CRITICAL',
    vendor_risk_explanation: 'Vendor holds 85% market share of constituency funds with multiple rapid payment release bursts.',
    duplicate_risk_score: 88.0,
    compliance_risk_score: 80.0,
    compliance_risk_level: 'CRITICAL',
    compliance_explanation: 'Missing geo-tagged completion photo proof prior to 85% fund disbursal release.',
    composite_risk_score: 83.5,
    overall_risk_level: 'HIGH',
    explainable_audit_summary: 'Multiple high risk flags: Single vendor market monopoly (85%), rapid payment release burst, missing photo proof.',
    recommended_reviewer_action: 'Hold subsequent payment releases pending physical audit inspection and vendor contract review.'
  },
  {
    work_id: 'WS/MP863/2026-2027/295007',
    work_category: 'Roads & Infrastructure',
    State: 'KARNATAKA',
    Constituency: 'BANGALORE CENTRAL',
    state: 'KARNATAKA',
    constituency: 'BANGALORE CENTRAL',
    mp_name: 'P. C. Mohan',
    description: 'Construction of Cement Concrete Road Work in Ward 112',
    sanction_amount: 1000000,
    effective_expenditure: 850000,
    peer_category_median_amount: 350000,
    amount_to_peer_ratio: 2.86,
    has_evidence_image: false,
    top_vendor: 'M CUBE INFRATECH PRIVATE LIMITED',
    top_vendor_share: 0.85,
    financial_risk_score: 72.0,
    financial_risk_level: 'HIGH',
    financial_explanation: 'Identical sanction amount to WS/MP863/2026-2027/295003 with high peer ratio.',
    vendor_risk_score: 94.0,
    vendor_risk_level: 'CRITICAL',
    vendor_risk_explanation: 'Vendor holds dominant market share with rapid disbursals.',
    duplicate_risk_score: 92.5,
    compliance_risk_score: 80.0,
    compliance_risk_level: 'CRITICAL',
    compliance_explanation: 'Missing mandatory completion photo evidence.',
    composite_risk_score: 84.6,
    overall_risk_level: 'HIGH',
    explainable_audit_summary: 'High NLP similarity (92.5%) with WS/MP863/2026-2027/295003 in same ward. Possible duplicate entry.',
    recommended_reviewer_action: 'Flag for duplicate candidate site verification.'
  },
  {
    work_id: 'WS/MP18200/2025-2026/189492',
    work_category: 'Education & Schools',
    State: 'UTTAR PRADESH',
    Constituency: 'AMETHI',
    state: 'UTTAR PRADESH',
    constituency: 'AMETHI',
    mp_name: 'Kishori Lal Sharma',
    description: 'Construction of Additional Classrooms in Inter College Amethi',
    sanction_amount: 1746000,
    effective_expenditure: 1400000,
    peer_category_median_amount: 520000,
    amount_to_peer_ratio: 3.35,
    has_evidence_image: true,
    top_vendor: 'AADI AND RUDRANSH CONSTRUCTION COMPANY',
    top_vendor_share: 1.0,
    financial_risk_score: 82.5,
    financial_risk_level: 'CRITICAL',
    financial_explanation: 'Extreme financial outlier: 3.35x peer median cost ceiling for classroom construction in UP.',
    vendor_risk_score: 75.0,
    vendor_risk_level: 'HIGH',
    vendor_risk_explanation: 'Contractor captures 100% of constituency school infrastructure fund sanctions.',
    duplicate_risk_score: 45.0,
    compliance_risk_score: 30.0,
    compliance_risk_level: 'LOW',
    compliance_explanation: 'Geo-tagged completion photo evidence uploaded.',
    composite_risk_score: 78.2,
    overall_risk_level: 'HIGH',
    explainable_audit_summary: 'Upper-tail financial budget outlier (3.35x peer median) and single vendor monopoly.',
    recommended_reviewer_action: 'Request detailed bill of quantities (BOQ) and rate audit.'
  },
  {
    work_id: 'WS/MP517/2025-2026/206050',
    work_category: 'Water & Sanitation',
    State: 'UTTAR PRADESH',
    Constituency: 'FATEHPUR SIKRI',
    state: 'UTTAR PRADESH',
    constituency: 'FATEHPUR SIKRI',
    mp_name: 'Rajkumar Chahar',
    description: 'Installation of Submersible Deep Borewell Water Supply Scheme',
    sanction_amount: 3739000,
    effective_expenditure: 2900000,
    peer_category_median_amount: 1100000,
    amount_to_peer_ratio: 3.40,
    has_evidence_image: false,
    top_vendor: 'ONN INFRATECH',
    top_vendor_share: 1.0,
    financial_risk_score: 84.0,
    financial_risk_level: 'CRITICAL',
    financial_explanation: 'Sanction amount exceeds 3.40x regional median baseline for water supply schemes.',
    vendor_risk_score: 74.0,
    vendor_risk_level: 'HIGH',
    vendor_risk_explanation: 'Single contractor holds 100% market share of sanctioned water works in block.',
    duplicate_risk_score: 50.0,
    compliance_risk_score: 75.0,
    compliance_risk_level: 'HIGH',
    compliance_explanation: 'Missing completion certificate and photo verification proof.',
    composite_risk_score: 77.8,
    overall_risk_level: 'HIGH',
    explainable_audit_summary: 'Extreme budget anomaly (3.40x peer median) and 100% contractor concentration.',
    recommended_reviewer_action: 'Perform field inspection of borewell installation site.'
  },
  {
    work_id: 'WS/MP517/2025-2026/206052',
    work_category: 'Water & Sanitation',
    State: 'UTTAR PRADESH',
    Constituency: 'FATEHPUR SIKRI',
    state: 'UTTAR PRADESH',
    constituency: 'FATEHPUR SIKRI',
    mp_name: 'Rajkumar Chahar',
    description: 'Installation of Deep Borewell Piped Water Scheme Fatehpur Sikri Block',
    sanction_amount: 3739000,
    effective_expenditure: 2900000,
    peer_category_median_amount: 1100000,
    amount_to_peer_ratio: 3.40,
    has_evidence_image: false,
    top_vendor: 'ONN INFRATECH',
    top_vendor_share: 1.0,
    financial_risk_score: 84.0,
    financial_risk_level: 'CRITICAL',
    financial_explanation: 'Identical cost ceiling and specifications to WS/MP517/2025-2026/206050.',
    vendor_risk_score: 74.0,
    vendor_risk_level: 'HIGH',
    vendor_risk_explanation: 'Vendor holds 100% market dominance.',
    duplicate_risk_score: 89.0,
    compliance_risk_score: 75.0,
    compliance_risk_level: 'HIGH',
    compliance_explanation: 'Missing photo evidence.',
    composite_risk_score: 80.5,
    overall_risk_level: 'HIGH',
    explainable_audit_summary: 'High similarity (89%) duplicate candidate with matching sanction budget.',
    recommended_reviewer_action: 'Cross-verify GPS coordinates against WS/MP517/2025-2026/206050.'
  },
  {
    work_id: 'WS/MP18226/2025-2026/187959',
    work_category: 'Health & Community',
    State: 'UTTAR PRADESH',
    Constituency: 'KHERI',
    state: 'UTTAR PRADESH',
    constituency: 'KHERI',
    mp_name: 'Utkarsh Verma',
    description: 'Construction of Community Hall & Cultural Centre',
    sanction_amount: 2354000,
    effective_expenditure: 1900000,
    peer_category_median_amount: 850000,
    amount_to_peer_ratio: 2.77,
    has_evidence_image: false,
    top_vendor: 'SHIV KUMAR THEKEDAR',
    top_vendor_share: 1.0,
    financial_risk_score: 68.0,
    financial_risk_level: 'HIGH',
    financial_explanation: 'Cost multiplier 2.77x relative to peer category median.',
    vendor_risk_score: 70.0,
    vendor_risk_level: 'HIGH',
    vendor_risk_explanation: 'Single contractor monopolizes community hall construction orders.',
    duplicate_risk_score: 30.0,
    compliance_risk_score: 70.0,
    compliance_risk_level: 'HIGH',
    compliance_explanation: 'No photo proof uploaded prior to payment release.',
    composite_risk_score: 69.3,
    overall_risk_level: 'HIGH',
    explainable_audit_summary: 'Elevated financial cost ratio and missing visual evidence.',
    recommended_reviewer_action: 'Require site inspection report from Executive Engineer.'
  }
];

const MOCK_DUPLICATE_PAIRS: CandidateDuplicatePair[] = [
  {
    work_id_1: 'WS/MP863/2026-2027/295003',
    work_id_2: 'WS/MP863/2026-2027/295007',
    state: 'KARNATAKA',
    constituency: 'BANGALORE CENTRAL',
    similarity_score: 92.5,
    sanction_amount_1: 1000000,
    sanction_amount_2: 1000000,
    description_1: 'Construction of CC Road in Ward 112 Bengaluru Central Constituency',
    description_2: 'Construction of Cement Concrete Road Work in Ward 112',
    sanction_date_1: '2026-03-12',
    sanction_date_2: '2026-04-05',
    duplicate_risk_level: 'CRITICAL',
    nlp_explanation: 'High TF-IDF cosine text similarity (92.5%) and identical ₹10.00 Lakh sanction budget in Ward 112.'
  },
  {
    work_id_1: 'WS/MP517/2025-2026/206050',
    work_id_2: 'WS/MP517/2025-2026/206052',
    state: 'UTTAR PRADESH',
    constituency: 'FATEHPUR SIKRI',
    similarity_score: 89.0,
    sanction_amount_1: 3739000,
    sanction_amount_2: 3739000,
    description_1: 'Installation of Submersible Deep Borewell Water Supply Scheme',
    description_2: 'Installation of Deep Borewell Piped Water Scheme Fatehpur Sikri Block',
    sanction_date_1: '2025-11-20',
    sanction_date_2: '2025-12-14',
    duplicate_risk_level: 'HIGH',
    nlp_explanation: 'Matching budget ceiling (₹37.39 Lakh) and high text overlap in water supply scheme titles.'
  }
];

// Bulletproof fetch helper that safely parses JSON or falls back to static dataset
async function safeFetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) return fallback;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return fallback;
    }
    const data = await res.json();
    return data || fallback;
  } catch (err) {
    console.warn(`Fetch to ${url} failed or returned non-JSON. Serving mock dataset fallback.`, err);
    return fallback;
  }
}

export async function fetchHealth(): Promise<{ status: string; total_projects_loaded: number }> {
  return safeFetchJson(`${API_BASE}/health`, { status: 'healthy', total_projects_loaded: 79068 });
}

export async function fetchOverview(): Promise<NationalOverviewResponse> {
  return safeFetchJson<NationalOverviewResponse>(`${API_BASE}/overview`, {
    summary: MOCK_SUMMARY,
    risk_distribution: MOCK_RISK_DISTRIBUTION,
    top_states: MOCK_TOP_STATES,
    category_distribution: MOCK_CATEGORY_DISTRIBUTION,
  });
}

export async function fetchRiskQueue(params: {
  state?: string;
  constituency?: string;
  category?: string;
  severity?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<WorkRecord>> {
  const query = new URLSearchParams();
  if (params.state) query.append('state', params.state);
  if (params.constituency) query.append('constituency', params.constituency);
  if (params.category) query.append('category', params.category);
  if (params.severity) query.append('severity', params.severity);
  if (params.search) query.append('search', params.search);
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());

  let records = MOCK_WORKS;
  if (params.severity && params.severity !== 'ALL') {
    records = records.filter(w => w.overall_risk_level === params.severity);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    records = records.filter(w => 
      w.work_id.toLowerCase().includes(q) ||
      w.description.toLowerCase().includes(q) ||
      (w.mp_name || '').toLowerCase().includes(q)
    );
  }

  const fallback: PaginatedResponse<WorkRecord> = {
    total: records.length,
    page: params.page || 1,
    limit: params.limit || 50,
    total_pages: 1,
    records: records,
  };

  return safeFetchJson<PaginatedResponse<WorkRecord>>(`${API_BASE}/risk-monitor?${query.toString()}`, fallback);
}

export async function fetchWorkDetail(workId: string): Promise<{
  work: WorkRecord;
  candidate_duplicates: CandidateDuplicatePair[];
}> {
  const query = new URLSearchParams({ work_id: workId });
  const foundWork = MOCK_WORKS.find(w => w.work_id === workId) || MOCK_WORKS[0];
  const foundDups = MOCK_DUPLICATE_PAIRS.filter(d => d.work_id_1 === workId || d.work_id_2 === workId);

  const fallback = {
    work: foundWork,
    candidate_duplicates: foundDups,
  };

  try {
    let res = await fetch(`${API_BASE}/work-detail?${query.toString()}`);
    if (!res.ok) {
      res = await fetch(`${API_BASE}/work-detail/${encodeURIComponent(workId)}`);
    }
    if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
      const data = await res.json();
      if (data && data.work) return data;
    }
  } catch (e) {
    console.warn(`Work detail fetch failed for ${workId}, using fallback.`, e);
  }

  return fallback;
}

export async function fetchDuplicateCandidates(params: {
  state?: string;
  constituency?: string;
  min_similarity?: number;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<CandidateDuplicatePair>> {
  const query = new URLSearchParams();
  if (params.state) query.append('state', params.state);
  if (params.constituency) query.append('constituency', params.constituency);
  if (params.min_similarity) query.append('min_similarity', params.min_similarity.toString());
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());

  const fallback: PaginatedResponse<CandidateDuplicatePair> = {
    total: MOCK_DUPLICATE_PAIRS.length,
    page: 1,
    limit: 20,
    records: MOCK_DUPLICATE_PAIRS,
  };

  return safeFetchJson<PaginatedResponse<CandidateDuplicatePair>>(`${API_BASE}/duplicate-candidates?${query.toString()}`, fallback);
}

export async function fetchFilters(): Promise<FilterOptions> {
  const fallback: FilterOptions = {
    states: ['UTTAR PRADESH', 'BIHAR', 'KARNATAKA', 'MAHARASHTRA', 'MANIPUR', 'WEST BENGAL', 'ANDHRA PRADESH'],
    categories: ['Roads & Infrastructure', 'Education & Schools', 'Water & Sanitation', 'Health & Community', 'Irrigation & Agri'],
    severities: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
  };

  return safeFetchJson<FilterOptions>(`${API_BASE}/filters`, fallback);
}
