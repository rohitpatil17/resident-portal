// src/app/pages/dashboard/dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ResidentService } from '../../core/services/resident.service';
import { AuthService } from '../../core/services/auth.service';
import { BalanceSummary, Transaction, Notice } from '../../core/models/resident.model';

interface QuickAction {
  label: string;
  desc: string;
  icon: string;
  colorClass: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  balance!: BalanceSummary;
  transactions: Transaction[] = [];
  notices: Notice[] = [];
  resident$ = this.auth.currentUser$;

  quickActions: QuickAction[] = [
    { label: 'Make a Payment',      desc: 'Pay securely via ACH or card',       icon: 'card',    colorClass: 'ic-purple', route: '/payment' },
    { label: 'E-Billing & History', desc: 'Statements & past transactions',      icon: 'clock',   colorClass: 'ic-teal',   route: '/billing' },
    { label: 'My Account',          desc: 'Update info & preferences',           icon: 'user',    colorClass: 'ic-navy',   route: '/account' },
    { label: 'Maintenance',         desc: 'Submit & track service requests',     icon: 'tool',    colorClass: 'ic-green',  route: '/maintenance' },
    { label: 'Documents',           desc: 'Lease & community documents',         icon: 'file',    colorClass: 'ic-red',    route: '/documents' },
    { label: 'Contact Office',      desc: 'Reach your community manager',        icon: 'phone',   colorClass: 'ic-gold',   route: '/contact' },
  ];

  constructor(
    private residentService: ResidentService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.residentService.getBalanceSummary().subscribe(b => this.balance = b);
    this.residentService.getRecentTransactions().subscribe(t => this.transactions = t.slice(0, 4));
    this.residentService.getCommunityNotices().subscribe(n => this.notices = n);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  getIcon(name: string): string {
    const icons: Record<string, string> = {
      card:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>`,
      clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg>`,
      user:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
      tool:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
      file:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
      phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 6.29 6.29l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    };
    return icons[name] || '';
  }
}
