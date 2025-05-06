export interface Case {
  id: string;
  manager_id: string;
  client_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CaseListResponse {
  cases: Case[];
}

