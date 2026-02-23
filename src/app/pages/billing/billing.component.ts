// src/app/pages/billing/billing.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResidentService } from '../../core/services/resident.service';
import { BillingStatement, Transaction } from '../../core/models/resident.model';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit {
  activeTab: 'billing' | 'payments' | 'settings' = 'billing';
  statements: BillingStatement[] = [];
  transactions: Transaction[] = [];

  eBillingSettings = [
    { title: 'Email Notifications',  desc: 'Receive bill reminders and payment confirmations via email' },
    { title: 'Paperless Billing',    desc: 'Switch to paperless — view bills online only' },
    { title: 'AutoPay Settings',     desc: 'Configure automatic payments from your bank account' },
    { title: 'Payment Accounts',     desc: 'Manage saved bank accounts and credit cards' },
  ];

  constructor(private residentService: ResidentService) {}

  ngOnInit(): void {
    this.residentService.getBillingStatements().subscribe(s => this.statements = s);
    this.residentService.getRecentTransactions().subscribe(t => this.transactions = t);
  }

  setTab(tab: 'billing' | 'payments' | 'settings'): void {
    this.activeTab = tab;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  viewStatement(id: string): void {
    alert(`Viewing statement ${id}`);
  }

  downloadStatement(id: string): void {
    alert(`Downloading statement ${id}`);
  }
}
