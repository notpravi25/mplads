import {
  NationalOverviewResponse,
  PaginatedResponse,
  WorkRecord,
  CandidateDuplicatePair,
  FilterOptions
} from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export async function fetchHealth(): Promise<{ status: string; total_projects_loaded: number }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchOverview(): Promise<NationalOverviewResponse> {
  const res = await fetch(`${API_BASE}/overview`);
  if (!res.ok) throw new Error(`Overview fetch failed: ${res.statusText}`);
  return res.json();
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

  const res = await fetch(`${API_BASE}/risk-monitor?${query.toString()}`);
  if (!res.ok) throw new Error(`Risk monitor fetch failed: ${res.statusText}`);
  return res.json();
}

export async function fetchWorkDetail(workId: string): Promise<{
  work: WorkRecord;
  candidate_duplicates: CandidateDuplicatePair[];
}> {
  const query = new URLSearchParams({ work_id: workId });
  let res = await fetch(`${API_BASE}/work-detail?${query.toString()}`);
  if (!res.ok) {
    res = await fetch(`${API_BASE}/work-detail/${encodeURIComponent(workId)}`);
  }
  if (!res.ok) throw new Error(`Work detail fetch failed for ${workId}`);
  return res.json();
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

  const res = await fetch(`${API_BASE}/duplicate-candidates?${query.toString()}`);
  if (!res.ok) throw new Error(`Duplicate candidates fetch failed: ${res.statusText}`);
  return res.json();
}

export async function fetchFilters(): Promise<FilterOptions> {
  const res = await fetch(`${API_BASE}/filters`);
  if (!res.ok) throw new Error(`Filter options fetch failed: ${res.statusText}`);
  return res.json();
}
