import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
<<<<<<< Updated upstream
import {
  BalanceSummary, Transaction, BillingStatement, Notice, AccountSection
} from '../models/resident.model';
=======
import { BalanceSummary, Transaction, BillingStatement, Notice, AccountSection } from '../models/resident.model';
>>>>>>> Stashed changes
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ResidentService {
<<<<<<< Updated upstream
  private readonly base = `${environment.apiUrl}/api/account`;
=======
  private base = `${environment.apiUrl}/api/account`;
>>>>>>> Stashed changes

  constructor(private http: HttpClient) {}

  getBalanceSummary(): Observable<BalanceSummary> {
    return this.http.get<BalanceSummary>(`${this.base}/balance`);
  }

  getRecentTransactions(): Observable<Transaction[]> {
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
