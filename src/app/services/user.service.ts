import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { User, UserResponse, CreateUserRequest, UpdateUserRequest } from '../models/user.model';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { map } from 'rxjs/operators';

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

  getUsers(page: number = 1, limit: number = 10, search?: string): Observable<ApiResponse<PaginatedResponse<UserResponse>>> {
    let url = `${this.apiUrl}?page=${page}&per_page=${limit}`;
    if (search) {
      url += `&search=${search}`;
    }
    return this.http.get<{ users: UserResponse[], pagination: any }>(url, { headers: this.getHeaders() })
      .pipe(
        map(response => ({
          success: true,
          data: {
            data: response.users,
            total: response.pagination.total,
            page: response.pagination.current_page,
            limit: response.pagination.per_page,
            totalPages: response.pagination.last_page,
            last_page: response.pagination.last_page,
            from: response.pagination.from,
            to: response.pagination.to
          }
        }))
      );
  }

  getUser(id: number): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createUser(user: CreateUserRequest): Observable<ApiResponse<UserResponse>> {
    return this.http.post<ApiResponse<UserResponse>>(this.apiUrl, user, { headers: this.getHeaders() });
  }

  updateUser(id: string, user: UpdateUserRequest): Observable<ApiResponse<UserResponse>> {
    return this.http.put<ApiResponse<UserResponse>>(this.apiUrl, { 
      id,
      ...user 
    }, { headers: this.getHeaders() });
  }

  deleteUser(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(this.apiUrl, { 
      body: { id },
      headers: this.getHeaders() 
    });
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