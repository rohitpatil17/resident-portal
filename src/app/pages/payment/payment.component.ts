import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ResidentService } from '../../core/services/resident.service';
import { AuthService } from '../../core/services/auth.service';
import { PaymentNavService } from '../../core/services/payment-nav.service';
import { BalanceSummary } from '../../core/models/resident.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  balance!: BalanceSummary;

  // modal state
  showPayModal  = false;
  payError      = '';
  paySuccess    = '';
  isBankPaying  = false;
  isCardPaying  = false;

  // saved tokens (loaded on init)
  bankTokenId:    string | null = null;
  bankAccountKey: string | null = null;
  cardTokenId:    string | null = null;
  cardAccountKey: string | null = null;
  isLoadingToken  = false;

  private readonly platformTokensUrl = `${environment.platformPayments.baseUrl}/${environment.platformPayments.resources.tokens}`;
  private readonly payTo      = 1;
  private readonly residentId = 10195442;

  private get userId(): number {
    const id = this.auth.currentUser?.id ?? '';
    return parseInt(id.replace(/^\D+/, ''), 10);
  }

  private get companyId(): number {
    const community = this.auth.currentUser?.community ?? '';
    return parseInt(community.replace(/\D+/g, ''), 10);
  }

  get isPaying(): boolean {
    return this.isBankPaying || this.isCardPaying;
  }

  constructor(
    private residentService: ResidentService,
    public auth: AuthService,
    private http: HttpClient,
    private router: Router,
    private paymentNav: PaymentNavService
  ) {}

  ngOnInit(): void {
    this.residentService.getBalanceSummary().subscribe(b => this.balance = b);
    this.loadSavedTokens();
    if (this.paymentNav.openModalOnReturn) {
      this.paymentNav.openModalOnReturn = false;
      this.showPayModal = true;
    }
  }

  private loadSavedTokens(): void {
    this.isLoadingToken = true;
    this.http.get<any[]>(this.platformTokensUrl, {
      params: {
        CompanyId:           String(this.companyId),
        UserId:              String(this.userId),
        ResidentId:          String(this.residentId),
        PaymentOptionTypeId: String(this.payTo)
      },
      headers: this.rpHeaders()
    }).subscribe({
      next: (data) => {
        this.isLoadingToken = false;
        const bank = data?.find(t => t.paymentAccountType === 'BankAccount');
        const card = data?.find(t => t.paymentAccountType === 'CreditCard');
        if (bank) { this.bankTokenId = bank.tokenId; this.bankAccountKey = bank.accountKey; }
        if (card) { this.cardTokenId = card.tokenId; this.cardAccountKey = card.accountKey; }
      },
      error: () => { this.isLoadingToken = false; }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  setupAutoPay(): void {
    alert('AutoPay setup flow would open here.');
  }

  oneTimePayment(): void {
    this.payError    = '';
    this.paySuccess  = '';
    this.showPayModal = true;
  }

  closePayModal(): void {
    if (this.isPaying) return;
    this.showPayModal = false;
    this.payError    = '';
    this.paySuccess  = '';
  }

  payWithBank(): void {
    if (!this.bankTokenId || !this.bankAccountKey) {
      this.showPayModal = false;
      this.router.navigate(['/account'], { queryParams: { openPayment: 'bank' } });
      return;
    }
    // TODO: wire up Dhango transaction call
  }

  payWithCard(): void {
    if (!this.cardTokenId || !this.cardAccountKey) {
      this.showPayModal = false;
      this.router.navigate(['/account'], { queryParams: { openPayment: 'card' } });
      return;
    }
    // TODO: wire up Dhango transaction call
  }

  private rpHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('rpAccessToken') ?? '';
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }
}
