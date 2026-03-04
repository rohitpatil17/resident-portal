import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Resident, LoginResponse } from '../models/resident.model';
import { environment } from '../../../environments/environment';
const SESSION_KEY = 'ma_session';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private currentUserSubject = new BehaviorSubject<Resident | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // restore session if token exists in localStorage
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserSubject.next({
          id: payload.sub,
          name: payload.name,
          unit: payload.unit,
          community: payload.community,
          email: payload.email,
          phone: ''
        });
      } catch (e) {
        localStorage.removeItem(this.TOKEN_KEY);
      }
    }
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Resident } from '../models/resident.model';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  token: string;
  resident: Resident;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<Resident | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): Resident | null {
    const stored = localStorage.getItem('resident');
    return stored ? JSON.parse(stored) : null;

  }

  get currentUser(): Resident | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {

    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, { username, password })
      .pipe(
        tap(response => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          this.currentUserSubject.next(response.resident);
        }),
        map(() => true)
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);

    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, { username, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('resident', JSON.stringify(res.resident));
        this.currentUserSubject.next(res.resident);
      }),
      map(() => true)
    );
  }

	logout(): void {
	localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem('resident');

    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ── Private ───────────────────────────────────────────────────────────────
  private loadSession(): Resident | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as Resident) : null;
    } catch {
      return null;
    }
  }
}