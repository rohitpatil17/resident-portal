// src/app/core/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Resident } from '../models/resident.model';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  token: string;
  resident: Resident;
}

const TOKEN_KEY    = 'ma_token';
const RESIDENT_KEY = 'ma_resident';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private currentUserSubject = new BehaviorSubject<Resident | null>(
    this.loadResident()
  );
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // ── Getters ───────────────────────────────────────────────────────────────

  get currentUser(): Resident | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // ── Auth actions ──────────────────────────────────────────────────────────

  login(username: string, password: string): Observable<boolean> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, { username, password })
      .pipe(
        tap(res => {
          localStorage.setItem(TOKEN_KEY, res.token);
          localStorage.setItem(RESIDENT_KEY, JSON.stringify(res.resident));
          this.currentUserSubject.next(res.resident);
        }),
        map(() => true)
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(RESIDENT_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private loadResident(): Resident | null {
    try {
      const raw = localStorage.getItem(RESIDENT_KEY);
      return raw ? (JSON.parse(raw) as Resident) : null;
    } catch {
      return null;
    }
  }
}