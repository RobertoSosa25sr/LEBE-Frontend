export interface User {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  profile_photo_url?: string;
  roles: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UserResponse extends User {
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  roles: string[];
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  password?: string;
} 