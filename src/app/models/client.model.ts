export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  profile_photo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClientListResponse {
  clients: Client[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface ClientResponse extends Client {
  created_at: string;
  updated_at: string;
}

export interface CreateClientRequest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface UpdateClientRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
} 

export interface DeleteClientRequest {
  id: string;
}

