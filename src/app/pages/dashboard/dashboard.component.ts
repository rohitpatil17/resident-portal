// src/app/pages/dashboard/dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ResidentService } from '../../core/services/resident.service';
import { AuthService } from '../../core/services/auth.service';
import { BalanceSummary, Transaction, Notice } from '../../core/models/resident.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  balance!: BalanceSummary;
  transactions: Transaction[] = [];
  notices:      Notice[]      = [];
  resident$     = this.auth.currentUser$;

  constructor(
    private residentService: ResidentService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.residentService.getBalanceSummary().subscribe(b  => this.balance      = b);
    this.residentService.getRecentTransactions().subscribe(t => this.transactions = t.slice(0, 4));
    this.residentService.getCommunityNotices().subscribe(n  => this.notices      = n);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style:                 'currency',
      currency:              'USD',
      minimumFractionDigits: 2,
    }).format(value);
  }

  /**
   * Returns number of days until the balance due date.
   * Negative = overdue, 0 = due today.
   */
  get daysUntilDue(): number {
    const raw = this.balance?.dueDate;
    if (!raw || raw === '—') return NaN;
    const due = new Date(raw).setHours(0, 0, 0, 0);
    if (isNaN(due)) return NaN;
    const today = new Date().setHours(0, 0, 0, 0);
    return Math.round((due - today) / 86_400_000);
  }

  get dueDateContext(): string {
    const d = this.daysUntilDue;
    if (isNaN(d)) return '';
    if (d < 0)   return `${Math.abs(d)} day${Math.abs(d) !== 1 ? 's' : ''} overdue`;
    if (d === 0) return 'Due today';
    if (d === 1) return '1 day remaining';
    return `${d} days remaining`;
  }

  get hasDueDate(): boolean {
    return !!this.balance?.dueDate && this.balance.dueDate !== '—';
  }
}