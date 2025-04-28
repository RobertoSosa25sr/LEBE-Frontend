export interface Appointment {
  id: number;
  ticket_number: string;
  subject: string;
  start_datetime: string;
  duration_hours: number;
  duration_minutes: number;
  status: 'pendiente' | 'en progreso' | 'cancelada' | 'reagendada';
  result: string;
  client_id: number;
  responsible_id: number;
  case_id: number;
  client: Client;
  responsible: User;
  case: Case;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  profile_photo_url: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  profile_photo_url: string;
}

export interface Case {
  id: number;
  title: string;
  description: string;
  status: string;
} 