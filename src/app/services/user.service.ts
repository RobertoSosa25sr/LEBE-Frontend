import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface User {
  id_number: string;
  name: string;
  profile_photo_url: string;
  roles: string[];
}

export interface Client {
  id_number: string;
  name: string;
  email: string;
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
  id_number: string;
  name: string;
  password: string;
  roles: string[];
}

export interface UpdateUserRequest {
  id_number: string;
  name?: string;
  password?: string;
  roles?: string[];
}

export interface UpdatePasswordRequest {
  id_number: string;
  password: string;
}

export interface DeleteUserRequest {
  id_number: string;
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
} 