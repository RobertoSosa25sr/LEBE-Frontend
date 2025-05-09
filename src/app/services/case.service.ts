import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Case, CaseListResponse, CaseResponse, CreateCaseRequest, UpdateCaseRequest } from '../models/case.model';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { map } from 'rxjs/operators';
import { UserResponse } from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class CaseService {
  private apiUrl = `${environment.apiUrl}/cases`;

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

  getCases(page: number = 1, limit: number = 10, search: string = "", serviceParams?: any[]): Observable<CaseListResponse> {
    let params = new HttpParams()
      .set('search', search)
      .set('per_page', limit.toString())

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

    return this.http.get<CaseListResponse>(this.apiUrl, { 
      headers: this.getHeaders(), 
      params
    });
  }

  getCase(id: number): Observable<ApiResponse<CaseResponse>> {
    return this.http.get<ApiResponse<CaseResponse>>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createCase(caseData: CreateCaseRequest): Observable<ApiResponse<CaseResponse>> {
    console.log('Creating case with data:', caseData);
    return this.http.post<ApiResponse<CaseResponse>>(this.apiUrl, caseData, { headers: this.getHeaders() });
  }

  updateCase(id: string, caseData: UpdateCaseRequest): Observable<ApiResponse<CaseResponse>> {
    return this.http.put<ApiResponse<CaseResponse>>(`${this.apiUrl}/${id}`, { 
      id,
      ...caseData 
    }, { headers: this.getHeaders() });
  }

  deleteCase(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    });
  }

} 