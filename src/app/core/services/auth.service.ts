// src/app/core/services/auth.service.ts

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Resident } from '../models/resident.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<Resident | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  // Mock resident data
  private mockResident: Resident = {
    id: 'R-0029',
    name: 'Tony',
    unit: '#29',
    community: 'Apple Meadow',
    email: 'tony@email.com',
    phone: '(555) 123-4567'
  };

  constructor(private router: Router) {}

  get currentUser(): Resident | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  login(username: string, password: string): boolean {
    // Mock auth — accept any non-empty credentials
    if (username && password) {
      this.currentUserSubject.next(this.mockResident);
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}
