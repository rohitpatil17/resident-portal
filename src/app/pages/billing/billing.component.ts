// src/app/pages/billing/billing.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ResidentService } from '../../core/services/resident.service';
import { AuthService } from '../../core/services/auth.service';
import { BillingStatement, Transaction } from '../../core/models/resident.model';
import { jsPDF } from 'jspdf';

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
  previewUrl: SafeResourceUrl | null = null;
  private logoBase64: string | null = null;

  eBillingSettings = [
    { title: 'Email Notifications',  desc: 'Receive bill reminders and payment confirmations via email' },
    { title: 'Paperless Billing',    desc: 'Switch to paperless — view bills online only' },
    { title: 'AutoPay Settings',     desc: 'Configure automatic payments from your bank account' },
    { title: 'Payment Accounts',     desc: 'Manage saved bank accounts and credit cards' },
  ];

  constructor(private residentService: ResidentService, private auth: AuthService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.residentService.getBillingStatements().subscribe(s => this.statements = s);
    this.residentService.getRecentTransactions().subscribe(t => this.transactions = t);
    fetch('assets/manage-america-logo-white.png')
      .then(r => r.blob())
      .then(blob => new Promise<string>(res => {
        const reader = new FileReader();
        reader.onloadend = () => res(reader.result as string);
        reader.readAsDataURL(blob);
      }))
      .then(dataUrl => this.logoBase64 = dataUrl)
      .catch(e => console.log('logo load failed', e));
  }

  setTab(tab: 'billing' | 'payments' | 'settings'): void {
    this.activeTab = tab;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  viewTransaction(id: string): void {
    const tx = this.transactions.find(x => x.id === id);
    if (!tx) return;
    const blob = this.buildTransactionPdf(tx).output('blob');
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
  }

  downloadTransaction(id: string): void {
    const tx = this.transactions.find(x => x.id === id);
    if (!tx) return;
    const pdf = this.buildTransactionPdf(tx);
    pdf.save(`payment-${tx.date}.pdf`);
  }

  viewStatement(id: string): void {
    const s = this.statements.find(x => x.id === id);
    if (!s) return;
    const blob = this.buildPdf(s).output('blob');
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
  }

  closePreview(): void {
    this.previewUrl = null;
  }

  downloadStatement(id: string): void {
    const s = this.statements.find(x => x.id === id);
    if (!s) return;
    const pdf = this.buildPdf(s);
    pdf.save(`statement-${s.period.replace(' ', '-')}.pdf`);
  }

  private buildTransactionPdf(tx: Transaction): jsPDF {
    const r = this.auth.currentUser;
    const name = r?.name ?? 'Resident';
    const unit = r?.unit ?? '-';
    const community = r?.community ?? '-';
    const email = r?.email ?? '-';
    const generated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const doc = new jsPDF();

    // header bar
    doc.setFillColor(86, 83, 161);
    doc.rect(0, 0, 210, 22, 'F');
    if (this.logoBase64)
      doc.addImage(this.logoBase64, 'PNG', 10, 2, 60, 19);
    else {
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('ManageAmerica', 14, 14);
    }
    doc.setTextColor(220, 220, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Payment Receipt', 196, 14, { align: 'right' });

    // title
    doc.setTextColor(86, 83, 161);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Receipt', 14, 38);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${generated}`, 14, 45);

    // divider
    doc.setDrawColor(86, 83, 161);
    doc.setLineWidth(0.5);
    doc.line(14, 50, 196, 50);
    doc.setLineWidth(0.2);

    // resident block
    doc.setFontSize(8);
    doc.setTextColor(86, 83, 161);
    doc.setFont('helvetica', 'bold');
    doc.text('RESIDENT', 14, 58);
    doc.text('COMMUNITY', 100, 58);

    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(name, 14, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`Unit ${unit}`, 14, 71);
    doc.text(email, 14, 77);
    doc.text(community, 100, 65);

    // table header
    doc.setFillColor(86, 83, 161);
    doc.rect(14, 88, 182, 8, 'F');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', 18, 94);
    doc.text('DATE', 90, 94);
    doc.text('AMOUNT', 130, 94);
    doc.text('STATUS', 170, 94);

    // table row
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(tx.description, 18, 105);
    doc.text(tx.date, 90, 105);
    doc.text(this.formatCurrency(tx.amount), 130, 105);
    const statusLabel = tx.status === 'paid' ? 'Paid' : tx.status === 'pending' ? 'In Progress' : 'Failed';
    if (tx.status === 'paid') doc.setTextColor(6, 95, 70);
    else if (tx.status === 'pending') doc.setTextColor(146, 64, 14);
    else doc.setTextColor(180, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(statusLabel, 170, 105);

    if (tx.method) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.text(`Payment method: ${tx.method}`, 18, 117);
    }

    // footer
    doc.setDrawColor(86, 83, 161);
    doc.setLineWidth(0.5);
    doc.line(14, 272, 196, 272);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('This is a system-generated receipt. For questions, contact your community office.', 105, 278, { align: 'center' });

    return doc;
  }

  private buildPdf(s: BillingStatement): jsPDF {
    const r = this.auth.currentUser;
    const name = r?.name ?? 'Resident';
    const unit = r?.unit ?? '-';
    const community = r?.community ?? '-';
    const email = r?.email ?? '-';
    const generated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const doc = new jsPDF();

    // header bar
    doc.setFillColor(86, 83, 161);
    doc.rect(0, 0, 210, 22, 'F');
    if (this.logoBase64)
      doc.addImage(this.logoBase64, 'PNG', 10, 2, 60, 19);
    else {
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('ManageAmerica', 14, 14);
    }
    doc.setTextColor(220, 220, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Monthly Statement', 196, 14, { align: 'right' });

    // title
    doc.setTextColor(86, 83, 161);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`Statement - ${s.period}`, 14, 38);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${generated}`, 14, 45);

    // divider
    doc.setDrawColor(86, 83, 161);
    doc.setLineWidth(0.5);
    doc.line(14, 50, 196, 50);
    doc.setLineWidth(0.2);

    // resident block
    doc.setFontSize(8);
    doc.setTextColor(86, 83, 161);
    doc.setFont('helvetica', 'bold');
    doc.text('RESIDENT', 14, 58);
    doc.text('COMMUNITY', 100, 58);

    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(name, 14, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`Unit ${unit}`, 14, 71);
    doc.text(email, 14, 77);
    doc.text(community, 100, 65);

    // table header
    doc.setFillColor(86, 83, 161);
    doc.rect(14, 88, 182, 8, 'F');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', 18, 94);
    doc.text('PERIOD', 130, 94);
    doc.text('STATUS', 170, 94);

    // table row
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(s.description, 18, 105);
    doc.text(s.period, 130, 105);
    const statusLabel = s.status === 'paid' ? 'Paid' : 'Pending';
    if (s.status === 'paid') doc.setTextColor(6, 95, 70);
    else doc.setTextColor(146, 64, 14);
    doc.setFont('helvetica', 'bold');
    doc.text(statusLabel, 170, 105);

    // footer
    doc.setDrawColor(86, 83, 161);
    doc.setLineWidth(0.5);
    doc.line(14, 272, 196, 272);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('This is a system-generated statement. For questions, contact your community office.', 105, 278, { align: 'center' });

    return doc;
  }
}
