export interface Client {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  profile_photo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClientResponse extends Client {
  created_at: string;
  updated_at: string;
}

export interface CreateClientRequest {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface UpdateClientRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  password?: string;
} 