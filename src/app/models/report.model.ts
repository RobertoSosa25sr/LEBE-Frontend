import { User } from "./user.model";
import { Appointment } from "./appointment.model";
import { Client } from "./client.model";
import { Case } from "./case.model";

export interface Report {
  user: User,
  appointments: Appointment[],
  statistics: {
    total_appointments: number;
    total_clients: number;
    total_cases: number;
  },
}

export interface ReportListResponse {
  reports: Report[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface ReportResponse extends Report {
  created_at: string;
  updated_at: string;
}
