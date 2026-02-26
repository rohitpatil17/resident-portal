// src/app/core/services/auth.service.ts

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Resident } from '../models/resident.model';

const SESSION_KEY = 'ma_session';

@Injectable({ providedIn: 'root' })
export class AuthService {


  // Mock resident data
  private mockResident: Resident = {
    id:        'R-0029',
    name:      'Tony',
    unit:      '#29',
    community: 'Apple Meadow',
    email:     'tony@email.com',
    phone:     '(555) 123-4567'
  };

  // ── Rehydrate from localStorage on construction so refresh works ──────────
  private currentUserSubject = new BehaviorSubject<Resident | null>(
    this.loadSession()
  );
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {}

  get currentUser(): Resident | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  login(username: string, password: string): boolean {
    if (username && password) {
      // persist so page refresh doesn't log the user out
      localStorage.setItem(SESSION_KEY, JSON.stringify(this.mockResident));
      this.currentUserSubject.next(this.mockResident);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
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