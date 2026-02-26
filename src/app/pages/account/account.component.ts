// src/app/pages/account/account.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResidentService } from '../../core/services/resident.service';
import { AccountSection } from '../../core/models/resident.model';

type PaymentView = 'none' | 'menu' | 'bank' | 'card';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  sections: AccountSection[] = [];

  // ── Login Modal ─────────────────────────────────────────────────────────
  showLoginModal = false;
  loginForm = {
    username: 'AppleMeadow29',
    email: 'rohit.patil@manageamerica.com',
    currentPassword: 'password123',
    newPassword: '',
    verifyPassword: ''
  };
  loginError   = '';
  loginSuccess = '';

  // ── Payment Modal ────────────────────────────────────────────────────────
  paymentView: PaymentView = 'none';

  bankForm = {
    accountType: '',
    name: '',
    routing: '',
    account: '',
    reAccount: ''
  };
  bankError   = '';
  bankSuccess = '';

  cardForm = {
    cardholderName: '',
    cardNumber: '',
    reCardNumber: '',
    expirationMonth: '',
    expirationYear: '',
    cvv: ''
  };
  cardError   = '';
  cardSuccess = '';

  accountTypes = ['Checking', 'Savings'];
  months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  years  = Array.from({ length: 12 }, (_, i) => String(new Date().getFullYear() + i));

  constructor(private residentService: ResidentService) {}

  ngOnInit(): void {
    this.residentService.getAccountSections().subscribe(s => this.sections = s);
  }

  // ── Section Router ───────────────────────────────────────────────────────
  viewSection(section: AccountSection): void {
    if (section.disabled) return;
    if (section.id === 'login') {
      this.openLoginModal();
    } else if (section.id === 'payment') {
      this.openPaymentMenu();
    } else {
      alert(`Opening: ${section.title}`);
    }
  }

  // ── Login ────────────────────────────────────────────────────────────────
  openLoginModal(): void {
    this.loginForm.newPassword  = '';
    this.loginForm.verifyPassword = '';
    this.loginError   = '';
    this.loginSuccess = '';
    this.showLoginModal = true;
  }

  closeLoginModal(): void { this.showLoginModal = false; }

  saveLoginChanges(): void {
    this.loginError   = '';
    this.loginSuccess = '';
    if (!this.loginForm.currentPassword) {
      this.loginError = 'Please enter your current password.'; return;
    }
    if (this.loginForm.newPassword || this.loginForm.verifyPassword) {
      if (this.loginForm.newPassword.length < 8) {
        this.loginError = 'New password must be at least 8 characters.'; return;
      }
      if (!/\d/.test(this.loginForm.newPassword)) {
        this.loginError = 'New password must contain at least one numeric character.'; return;
      }
      if (!/[!@#$%^&*()+= ]/.test(this.loginForm.newPassword)) {
        this.loginError = 'New password must contain at least one symbol character.'; return;
      }
      if (this.loginForm.newPassword !== this.loginForm.verifyPassword) {
        this.loginError = 'New passwords do not match.'; return;
      }
    }
    this.loginSuccess = 'Login information updated successfully.';
    setTimeout(() => this.closeLoginModal(), 1500);
  }

  // ── Payment ──────────────────────────────────────────────────────────────
  openPaymentMenu(): void {
    this.bankForm   = { accountType: '', name: '', routing: '', account: '', reAccount: '' };
    this.cardForm   = { cardholderName: '', cardNumber: '', reCardNumber: '', expirationMonth: '', expirationYear: '', cvv: '' };
    this.bankError  = ''; this.bankSuccess = '';
    this.cardError  = ''; this.cardSuccess = '';
    this.paymentView = 'menu';
  }

  closePaymentModal(): void { this.paymentView = 'none'; }

  goToBank(): void { this.bankError = ''; this.bankSuccess = ''; this.paymentView = 'bank'; }
  goToCard(): void { this.cardError = ''; this.cardSuccess = ''; this.paymentView = 'card'; }

  saveBankAccount(): void {
    this.bankError = ''; this.bankSuccess = '';
    if (!this.bankForm.accountType) { this.bankError = 'Please select an account type.'; return; }
    if (!this.bankForm.name.trim()) { this.bankError = 'Please enter the name on bank account.'; return; }
    if (!/^\d{9}$/.test(this.bankForm.routing)) { this.bankError = 'Routing number must be 9 digits.'; return; }
    if (!this.bankForm.account.trim()) { this.bankError = 'Please enter your account number.'; return; }
    if (this.bankForm.account !== this.bankForm.reAccount) { this.bankError = 'Account numbers do not match.'; return; }
    this.bankSuccess = 'Bank account added successfully!';
    setTimeout(() => this.closePaymentModal(), 1500);
  }

  saveCreditCard(): void {
    this.cardError = ''; this.cardSuccess = '';
    if (!this.cardForm.cardholderName.trim()) { this.cardError = 'Please enter cardholder name.'; return; }
    if (!/^\d{13,19}$/.test(this.cardForm.cardNumber.replace(/\s/g, ''))) { this.cardError = 'Please enter a valid card number.'; return; }
    if (this.cardForm.cardNumber !== this.cardForm.reCardNumber) { this.cardError = 'Card numbers do not match.'; return; }
    if (!this.cardForm.expirationMonth) { this.cardError = 'Please select expiration month.'; return; }
    if (!this.cardForm.expirationYear)  { this.cardError = 'Please select expiration year.'; return; }
    if (!/^\d{3,4}$/.test(this.cardForm.cvv)) { this.cardError = 'Please enter a valid CVV.'; return; }
    this.cardSuccess = 'Credit card added successfully!';
    setTimeout(() => this.closePaymentModal(), 1500);
  }
}