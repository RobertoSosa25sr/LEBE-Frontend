import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Client, ClientResponse, CreateClientRequest, UpdateClientRequest } from '../models/client.model';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = `${environment.apiUrl}/clients`;

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

  getClients(): Observable<ApiResponse<PaginatedResponse<ClientResponse>>> {
    return this.http.get<ApiResponse<PaginatedResponse<ClientResponse>>>(this.apiUrl);
  }

  getClient(id: number): Observable<ApiResponse<ClientResponse>> {
    return this.http.get<ApiResponse<ClientResponse>>(`${this.apiUrl}/${id}`);
  }

  createClient(client: CreateClientRequest): Observable<ApiResponse<ClientResponse>> {
    return this.http.post<ApiResponse<ClientResponse>>(this.apiUrl, client);
  }

  updateClient(id: string, email: string, phone: string): Observable<{ message: string; client: Client }> {
    return this.http.put<{ message: string; client: Client }>(
      this.apiUrl,
      { id, email, phone },
      { headers: this.getHeaders() }
    );
  }

  deleteClient(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
} 