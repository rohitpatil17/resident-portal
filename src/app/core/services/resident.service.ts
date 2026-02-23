// src/app/core/services/resident.service.ts

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  BalanceSummary, Transaction, BillingStatement, Notice, AccountSection
} from '../models/resident.model';

@Injectable({ providedIn: 'root' })
export class ResidentService {

  getBalanceSummary(): Observable<BalanceSummary> {
    return of({
      totalDue: 8000.00,
      currentDue: 8000.00,
      lotRent: 650.00,
      pastBalance: 7350.00,
      lateFees: 0.00,
      dueDate: 'March 1, 2026',
      autoPay: false
    });
  }

  getRecentTransactions(): Observable<Transaction[]> {
    return of([
      { id: 't1', description: 'Lot Rent — Jan 2026',   date: 'Jan 1, 2026',  amount: 650.00, status: 'paid',    method: 'ACH Bank' },
      { id: 't2', description: 'Lot Rent — Dec 2025',   date: 'Dec 1, 2025',  amount: 650.00, status: 'pending', method: '' },
      { id: 't3', description: 'Utility Fee — Nov 2025', date: 'Nov 15, 2025', amount: 82.50,  status: 'paid',    method: 'ACH Bank' },
      { id: 't4', description: 'Lot Rent — Nov 2025',   date: 'Nov 1, 2025',  amount: 650.00, status: 'paid',    method: 'Credit Card' },
      { id: 't5', description: 'Lot Rent — Oct 2025',   date: 'Oct 1, 2025',  amount: 650.00, status: 'paid',    method: 'ACH Bank' },
    ]);
  }

  getBillingStatements(): Observable<BillingStatement[]> {
    return of([
      { id: 'b1', period: 'Jul 2021', description: 'Monthly Statement', amount: 650.00, status: 'paid' },
      { id: 'b2', period: 'Jan 2021', description: 'Monthly Statement', amount: 630.00, status: 'paid' },
      { id: 'b3', period: 'Oct 2020', description: 'Monthly Statement', amount: 630.00, status: 'paid' },
      { id: 'b4', period: 'Jun 2020', description: 'Monthly Statement', amount: 610.00, status: 'pending' },
      { id: 'b5', period: 'Nov 2019', description: 'Monthly Statement', amount: 600.00, status: 'paid' },
      { id: 'b6', period: 'Aug 2019', description: 'Monthly Statement', amount: 600.00, status: 'paid' },
    ]);
  }

  getCommunityNotices(): Observable<Notice[]> {
    return of([
      { id: 'n1', title: 'Balance overdue — action required', date: 'Feb 10, 2026', type: 'alert' },
      { id: 'n2', title: 'Pool closure — Feb 22–24',           date: 'Feb 15, 2026', type: 'warning' },
      { id: 'n3', title: 'New recycling schedule — March',     date: 'Feb 12, 2026', type: 'info' },
      { id: 'n4', title: 'Town hall — Feb 28 @ 6PM',           date: 'Feb 8, 2026',  type: 'info' },
    ]);
  }

  getAccountSections(): Observable<AccountSection[]> {
    return of([
      { id: 'login',    title: 'Login Information',  description: 'Manage Username, Password' },
      { id: 'contact',  title: 'Contact Information', description: 'Name, Email, Phone number' },
      { id: 'payment',  title: 'Payment Accounts',    description: 'Manage your payment accounts' },
      { id: 'autopay',  title: 'Manage AutoPay',      description: 'Adjust your AutoPay settings' },
      { id: 'self',     title: 'Self',                description: 'Enroll in or access your Self account to get free rent reporting to all three credit bureaus' },
      { id: 'lease',    title: 'Lease Information',   description: 'See information about property', disabled: true },
      { id: 'cashpay',  title: 'CashPay Accounts',    description: 'See details to pay rent at retail locations' },
      { id: 'addsite',  title: 'Add Additional Site', description: 'Connect another site to this account' },
    ]);
  }
}
