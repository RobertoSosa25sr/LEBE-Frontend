import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MenuItem {
  id: number;
  label: string;
  icon: string;
  route: string;
  order: number;
}

export interface User {
  id: number;
  id_number: string;
  roles: string[];
}

export interface LoginResponse {
  user: User;
  menu_items: MenuItem[];
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private menuItemsSubject = new BehaviorSubject<MenuItem[]>([]);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();
  menuItems$ = this.menuItemsSubject.asObservable();
  token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load token from localStorage on service initialization
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.tokenSubject.next(storedToken);
    }
  }

  login(idNumber: string, password: string, role: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      id_number: idNumber,
      password: password,
      role: role
    }).pipe(
      tap(response => {
        this.currentUserSubject.next(response.user);
        this.menuItemsSubject.next(response.menu_items);
        this.tokenSubject.next(response.token);
        localStorage.setItem('token', response.token);
      })
    );
  }

  logout() {
    this.currentUserSubject.next(null);
    this.menuItemsSubject.next([]);
    this.tokenSubject.next(null);
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getMenuItems(): MenuItem[] {
    return this.menuItemsSubject.value;
  }
}