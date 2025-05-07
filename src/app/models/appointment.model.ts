import { Client } from "./client.model";
import { User } from "./user.model";
import { Case } from "./case.model";

export interface Appointment {
  id: number; 
  ticket_number: number;
  responsible_id: string;
  client_id: string;
  case_id: string;
  subject: string;
  start_datetime: string;
  duration: string;
  status: string;
  result: string;
  created_at: string;
  updated_at: string;
  client: Client;
  responsible: User;
  case: Case;
}

export interface AppointmentListResponse {
  appointments: Appointment[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface AppointmentResponse extends Appointment {
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentRequest {
  responsible_id: string;
  client_id: string;
  case_id: string;
  subject: string;
  start_datetime: string;
  duration: string;
  status: string;
  result: string;
}

export interface UpdateAppointmentRequest {
  subject: string;
  start_datetime: string;
  duration: string;
  status: string;
  result: string;
} 

