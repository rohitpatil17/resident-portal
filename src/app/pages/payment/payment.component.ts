// src/app/pages/payment/payment.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResidentService } from '../../core/services/resident.service';
import { BalanceSummary } from '../../core/models/resident.model';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  balance!: BalanceSummary;

  constructor(private residentService: ResidentService) {}

  ngOnInit(): void {
    this.residentService.getBalanceSummary().subscribe(b => this.balance = b);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  setupAutoPay(): void {
    alert('AutoPay setup flow would open here (bank account linking).');
  }

  oneTimePayment(): void {
    alert('One-time payment flow would open here.');
  }
}
