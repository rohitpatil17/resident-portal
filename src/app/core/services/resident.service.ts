import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BalanceSummary, Transaction, BillingStatement, Notice, AccountSection
} from '../models/resident.model';

import { BalanceSummary, Transaction, BillingStatement, Notice, AccountSection } from '../models/resident.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ResidentService {

  private readonly base = `${environment.apiUrl}/api/account`;

  private base = `${environment.apiUrl}/api/account`;

  constructor(private http: HttpClient) {}

  getBalanceSummary(): Observable<BalanceSummary> {
    return this.http.get<BalanceSummary>(`${this.base}/balance`);
  }

  getRecentTransactions(): Observable<Transaction[]> {

    return of([
      { id: 't1', description: 'Rent — Jan 2026',   date: 'Jan 1, 2026',  amount: 650.00, status: 'paid',    method: 'ACH Bank' },
      { id: 't2', description: 'Rent — Dec 2025',   date: 'Dec 1, 2025',  amount: 650.00, status: 'pending', method: '' },
      { id: 't3', description: 'Utility Fee — Nov 2025', date: 'Nov 15, 2025', amount: 82.50,  status: 'paid',    method: 'ACH Bank' },
      { id: 't4', description: 'Rent — Nov 2025',   date: 'Nov 1, 2025',  amount: 650.00, status: 'paid',    method: 'Credit Card' },
      { id: 't5', description: 'Rent — Oct 2025',   date: 'Oct 1, 2025',  amount: 650.00, status: 'paid',    method: 'ACH Bank' },
    ]);

    return this.http.get<Transaction[]>(`${this.base}/transactions`);

  }

  getBillingStatements(): Observable<BillingStatement[]> {
    return this.http.get<BillingStatement[]>(`${this.base}/statements`);
  }

  getCommunityNotices(): Observable<Notice[]> {
    return this.http.get<Notice[]>(`${this.base}/notices`);
  }

  getAccountSections(): Observable<AccountSection[]> {
    return this.http.get<AccountSection[]>(`${this.base}/sections`);
  }
}
