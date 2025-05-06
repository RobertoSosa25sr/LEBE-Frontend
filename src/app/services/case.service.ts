import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  getCases(page: number = 1, limit: number = 10, search: string = ""): Observable<ApiResponse<PaginatedResponse<CaseResponse>>> {
    const params = {
      search: search,
      per_page: limit.toString(),
      page: page.toString()
    };
    return this.http.get<{ cases: CaseResponse[], pagination: any }>(this.apiUrl, { headers: this.getHeaders(), params })
      .pipe(
        map(response => ({
          success: true,
          data: {
            data: response.cases,
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

  getCase(id: number): Observable<ApiResponse<CaseResponse>> {
    return this.http.get<ApiResponse<CaseResponse>>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createCase(caseData: CreateCaseRequest): Observable<ApiResponse<CaseResponse>> {
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