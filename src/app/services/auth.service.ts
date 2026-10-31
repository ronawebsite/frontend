import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { User } from '../core/models/fintech.models';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor() {
    this.loadStoredUser();
  }

  private loadStoredUser() {
    const stored = localStorage.getItem('fichain_user');
    const token = localStorage.getItem('fichain_access_token');
    if (stored && token) {
      try {
        this.currentUser.set(JSON.parse(stored));
        this.fetchMe().subscribe();
      } catch (e) {
        this.logout();
      }
    }
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.handleAuthSuccess(res.data.user, res.data.tokens.accessToken);
        }
      })
    );
  }

  phraseLogin(phrase: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/phrase-login`, { phrase }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.handleAuthSuccess(res.data.user, res.data.tokens.accessToken);
        }
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.handleAuthSuccess(res.data.user, res.data.tokens.accessToken);
        }
      })
    );
  }

  fetchMe(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/auth/me`).pipe(
      tap(res => {
        if (res.success && res.data.user) {
          this.currentUser.set(res.data.user);
          localStorage.setItem('fichain_user', JSON.stringify(res.data.user));
        }
      })
    );
  }

  setPin(new_pin: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/set-pin`, { new_pin });
  }

  logout() {
    localStorage.removeItem('fichain_user');
    localStorage.removeItem('fichain_access_token');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  private handleAuthSuccess(user: User, token: string) {
    this.currentUser.set(user);
    localStorage.setItem('fichain_user', JSON.stringify(user));
    localStorage.setItem('fichain_access_token', token);
  }
}
