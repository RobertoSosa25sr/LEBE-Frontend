import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  profile_photo_url: string;
  roles: string[];
}

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  profile_photo_url: string;
  roles: string[];
}

export interface UserListResponse {
  users: User[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface CreateUserRequest {
  id: string;
  first_name: string;
  last_name: string;
  password: string;
  roles: string[];
}

export interface UpdateUserRequest {
  id: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  roles?: string[];
}

export interface UpdatePasswordRequest {
  id: string;
  password: string;
}

export interface DeleteUserRequest {
  id: string;
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

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  private clientsApiUrl = `${environment.apiUrl}/clients`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getUsers(page: number = 1, perPage: number = 10, search?: string): Observable<UserListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<UserListResponse>(this.apiUrl, { 
      params,
      headers: this.getHeaders()
    });
  }

  createUser(user: CreateUserRequest): Observable<{ message: string; user: User }> {
    return this.http.post<{ message: string; user: User }>(
      this.apiUrl, 
      user,
      { headers: this.getHeaders() }
    );
  }

  updateUser(user: UpdateUserRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      this.apiUrl, 
      user,
      { headers: this.getHeaders() }
    );
  }

  deleteUser(user: DeleteUserRequest): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      this.apiUrl, 
      { 
        body: user,
        headers: this.getHeaders()
      }
    );
  }

  getClients(page: number = 1, perPage: number = 10, search?: string): Observable<ClientListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ClientListResponse>(this.clientsApiUrl, { 
      params,
      headers: this.getHeaders()
    });
  }

  createClient(client: { id: string; first_name: string; last_name: string; email: string; phone: string }): Observable<{ message: string; client: Client }> {
    return this.http.post<{ message: string; client: Client }>(
      this.clientsApiUrl,
      client,
      { headers: this.getHeaders() }
    );
  }

  deleteClient(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      this.clientsApiUrl,
      { 
        body: { id },
        headers: this.getHeaders()
      }
    );
  }

  updateClient(id: string, email: string, phone: string): Observable<{ message: string; client: Client }> {
    return this.http.put<{ message: string; client: Client }>(
      this.clientsApiUrl,
      { id, email, phone },
      { headers: this.getHeaders() }
    );
  }
} 