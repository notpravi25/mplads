export interface OverviewSummary {
  total_allocated_funds: number;
  total_sanctioned_amount: number;
  total_disbursed_amount: number;
  total_works: number;
  completed_works: number;
  high_risk_works: number;
  critical_works: number;
}

export interface RiskDistribution {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
  CRITICAL: number;
}

export interface StateSummary {
  state: string;
  total_works: number;
  total_sanctioned: number;
  high_risk_works: number;
}

export interface NationalOverviewResponse {
  summary: OverviewSummary;
  risk_distribution: RiskDistribution;
  top_states: StateSummary[];
}

export interface WorkRecord {
  work_id: string;
  work_category: string;
  State: string;
  Constituency: string;
  state?: string;
  constituency?: string;
  peer_category_median_amount?: number;
  mp_name: string;
  description: string;
  sanction_amount: number;
  effective_expenditure: number;
  completion_date?: string;
  sanction_date?: string;
  recommended_date?: string;
  has_evidence_image?: boolean;
  top_vendor?: string;
  top_vendor_share?: number;
  financial_risk_score: number;
  financial_risk_level: string;
  financial_explanation: string;
  vendor_risk_score: number;
  vendor_risk_level: string;
  vendor_risk_explanation: string;
  duplicate_risk_score: number;
  compliance_risk_score: number;
  compliance_risk_level: string;
  compliance_explanation: string;
  composite_risk_score: number;
  overall_risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explainable_audit_summary: string;
  recommended_reviewer_action: string;
  amount_to_peer_ratio?: number;
  category_percentile?: number;
}

export interface CandidateDuplicatePair {
  work_id_1: string;
  work_id_2: string;
  state: string;
  constituency: string;
  similarity_score: number;
  sanction_amount_1: number;
  sanction_amount_2: number;
  description_1: string;
  description_2: string;
  sanction_date_1?: string;
  sanction_date_2?: string;
  duplicate_risk_level: string;
  nlp_explanation: string;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  total_pages?: number;
  records: T[];
}


export interface FilterOptions {
  states: string[];
  categories: string[];
  severities: string[];
}
