import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ClientListResponse, ClientResponse, CreateClientRequest, UpdateClientRequest } from '../models/client.model';
import { ApiResponse } from '../models/api-response.model';

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

  getClients(page: number = 1, perPage: number = 10, search?: string, serviceParams?: any[]): Observable<ClientListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

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
    return this.http.get<ClientListResponse>(this.apiUrl, { 
      params,
      headers: this.getHeaders()
    });
  }

  createClient(client: CreateClientRequest): Observable<ApiResponse<ClientResponse>> {
    return this.http.post<ApiResponse<ClientResponse>>(this.apiUrl, client, { headers: this.getHeaders() });
  }

  updateClient(id: string, client: UpdateClientRequest): Observable<ApiResponse<ClientResponse>> {
    return this.http.put<ApiResponse<ClientResponse>>(this.apiUrl, { 
      id,
      ...client 
    }, { headers: this.getHeaders() });
  }

  deleteClient(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(this.apiUrl, { 
        body: { id },
        headers: this.getHeaders()
      });
  }

} 