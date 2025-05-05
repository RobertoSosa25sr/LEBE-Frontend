import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { User, UserListResponse, UserResponse, CreateUserRequest, UpdateUserRequest } from '../models/user.model';
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

  getUsers(page: number = 1, limit: number = 10, search: string = ""): Observable<ApiResponse<PaginatedResponse<UserResponse>>> {
    const params = {
      search: search,
      per_page: limit.toString(),
      page: page.toString()
    };
    return this.http.get<{ users: UserResponse[], pagination: any }>(this.apiUrl, { headers: this.getHeaders(), params })
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

} 