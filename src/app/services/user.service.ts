import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { UserListResponse, UserResponse, CreateUserRequest, UpdateUserRequest } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

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

  getUsers(page: number = 1, limit: number = 10, search: string = "", serviceParams?: any[]): Observable<UserListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (serviceParams && serviceParams.length > 0) {
      serviceParams.forEach(param => {
        Object.entries(param).forEach(([key, value]: [string, any]) => {
          if (Array.isArray(value)) {
              value.forEach((val: any) => {
              params = params.append(`${key}[]`, val);
            });
          } else {
            params = params.set(key, value.toString());
          }
        });
      });
    }  
    return this.http.get<UserListResponse>(this.apiUrl, { 
      headers: this.getHeaders(),
      params
    });
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