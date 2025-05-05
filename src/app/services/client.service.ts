import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Client, ClientListResponse, ClientResponse, CreateClientRequest, UpdateClientRequest } from '../models/client.model';
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

  getClients(page: number = 1, perPage: number = 10, search?: string): Observable<ClientListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ClientListResponse>(this.apiUrl, { 
      params,
      headers: this.getHeaders()
    });
  }

  createClient(client: { id: string; first_name: string; last_name: string; email: string; phone: string }): Observable<{ message: string; client: Client }> {
    return this.http.post<{ message: string; client: Client }>(
      this.apiUrl,
      client,
      { headers: this.getHeaders() }
    );
  }

  deleteClient(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      this.apiUrl,
      { 
        body: { id },
        headers: this.getHeaders()
      }
    );
  }

  updateClient(id: string, email: string, phone: string): Observable<{ message: string; client: Client }> {
    return this.http.put<{ message: string; client: Client }>(
      this.apiUrl,
      { id, email, phone },
      { headers: this.getHeaders() }
    );
  }
} 