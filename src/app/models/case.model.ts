import { Client } from "./client.model";
import { User } from "./user.model";
export interface Case {
  id: string;
  manager_id: string;
  client_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  client: Client;
  manager: User;
  }

export interface CaseListResponse {
  cases: Case[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface CaseResponse extends Case {
  created_at: string;
  updated_at: string;
}

export interface CreateCaseRequest {
  manager_id?: string;
  client_id: string;
  status?: string;
}

export interface UpdateCaseRequest {
  manager_id?: string;
  client_id?: string;
  status?: string;
}

export interface DeleteCaseRequest {
  id: string;
}







