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
  actions: string[];
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
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
  private selectedRoleSubject = new BehaviorSubject<string | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();
  menuItems$ = this.menuItemsSubject.asObservable();
  token$ = this.tokenSubject.asObservable();
  selectedRole$ = this.selectedRoleSubject.asObservable();

  constructor(private http: HttpClient) {
    if (typeof window !== 'undefined') {
      this.tokenSubject.next(localStorage.getItem('token'));
      this.selectedRoleSubject.next(localStorage.getItem('selectedRole'));
      const storedMenuItems = localStorage.getItem('menuItems');
      if (storedMenuItems) {
        this.menuItemsSubject.next(JSON.parse(storedMenuItems));
      }
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  login(idNumber: string, password: string, role: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      id: idNumber,
      password,
      role
    }).pipe(
      tap(response => {
        this.tokenSubject.next(response.token);
        this.currentUserSubject.next(response.user);
        this.menuItemsSubject.next(response.menu_items);
        this.selectedRoleSubject.next(role);
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('menuItems', JSON.stringify(response.menu_items));
        localStorage.setItem('selectedRole', role);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      })
    );
  }

  logout() {
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.menuItemsSubject.next([]);
    this.selectedRoleSubject.next(null);
    
    localStorage.removeItem('token');
    localStorage.removeItem('menuItems');
    localStorage.removeItem('selectedRole');
    localStorage.removeItem('currentUser');
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

  getUserRole(): string {
    return this.selectedRoleSubject.value || '';
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.roles.includes(role) || false;
  }
}