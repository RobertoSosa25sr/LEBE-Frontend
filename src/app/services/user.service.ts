import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  id_number: string;
  roles: string[];
}

export interface UserListResponse {
  data: User[];
  current_page: number;
  per_page: number;
  total: number;
}

export interface CreateUserRequest {
  id_number: string;
  password: string;
}

export interface UpdatePasswordRequest {
  id_number: string;
  password: string;
}

export interface DeleteUserRequest {
  id_number: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(page: number = 1, perPage: number = 10, search?: string): Observable<UserListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<UserListResponse>(this.apiUrl, { params });
  }

  createUser(user: CreateUserRequest): Observable<{ message: string; user: User }> {
    return this.http.post<{ message: string; user: User }>(this.apiUrl, user);
  }

  updatePassword(user: UpdatePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(this.apiUrl, user);
  }

  deleteUser(user: DeleteUserRequest): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(this.apiUrl, { body: user });
  }
} 