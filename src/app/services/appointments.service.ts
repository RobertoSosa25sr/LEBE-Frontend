import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { map } from 'rxjs/operators';
import { AppointmentListResponse, AppointmentResponse, CreateAppointmentRequest, UpdateAppointmentRequest } from '../models/appointment.model';

export interface Appointment {
  id: string;
  subject: string;
  start_datetime: string;
  duration_hours: number;
  duration_minutes: number;
  status: string;
  result: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/appointments`;

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

  getAppointments(page: number = 1, limit: number = 10, search: string = "", serviceParams?: any[]): Observable<AppointmentListResponse> {
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
    
    return this.http.get<AppointmentListResponse>(this.apiUrl, { 
      params,
      headers: this.getHeaders()
    });
  }

  getAppointment(id: number): Observable<ApiResponse<AppointmentResponse>> {
    return this.http.get<ApiResponse<AppointmentResponse>>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createAppointment(appointment: CreateAppointmentRequest): Observable<ApiResponse<AppointmentResponse>> {
    return this.http.post<ApiResponse<AppointmentResponse>>(this.apiUrl, appointment, { headers: this.getHeaders() });
  }

  updateAppointment(id: string, appointment: UpdateAppointmentRequest): Observable<ApiResponse<AppointmentResponse>> {
    return this.http.put<ApiResponse<AppointmentResponse>>(this.apiUrl, { 
      id,
      ...appointment 
    }, { headers: this.getHeaders() });
  }

  deleteAppointment(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(this.apiUrl, { 
      body: { id },
      headers: this.getHeaders() 
    });
  }

} 