import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { switchMap, catchError, of } from 'rxjs';
import { ResidentService } from '../../core/services/resident.service';
import { AuthService } from '../../core/services/auth.service';
import { BalanceSummary } from '../../core/models/resident.model';
import { environment } from '../../../environments/environment';

type PayView = 'main' | 'bank' | 'card' | 'confirm';

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
  showPayModal     = false;
  showAutopayModal = false;
  autopayNotice    = '';
  payError         = '';
  paySuccess       = '';
  isBankPaying     = false;
  isCardPaying     = false;

  // inline form view inside pay modal
  payView: PayView = 'main';

  // confirm view
  confirmType: 'bank' | 'card' = 'bank';
  payAmount    = 0;
  authorized   = false;
  confirmError = '';
  isConfirming = false;
  showAgreementModal = false;

  // bank form
  bankForm = { accountType: '', name: '', routing: '', account: '', reAccount: '' };
  bankError     = '';
  bankSuccess   = '';
  isBankLoading = false;

  // card form
  cardForm = { cardholderName: '', cardNumber: '', reCardNumber: '', expirationMonth: '', expirationYear: '', cvv: '' };
  cardError   = '';
  cardSuccess = '';

  accountTypes = ['Checking', 'Savings'];
  months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  years  = Array.from({ length: 12 }, (_, i) => String(new Date().getFullYear() + i));

  // saved tokens (loaded on init)
  bankTokenId:       string | null = null;
  bankAccountKey:    string | null = null;
  bankAccountNumber: string | null = null;
  cardTokenId:       string | null = null;
  cardAccountKey:    string | null = null;
  cardAccountNumber: string | null = null;
  isLoadingToken     = false;

  private readonly platformTokensUrl  = `${environment.platformPayments.baseUrl}/${environment.platformPayments.resources.tokens}`;
  private readonly platformAccountKey = `${environment.platformPayments.baseUrl}/${environment.platformPayments.resources.accountKey}`;
  private readonly dhangoTokensUrl    = `${environment.dhango.baseUrl}/${environment.dhango.resources.postToken}`;
  private readonly payTo      = 1;
  private readonly residentId = 10195442;
  private readonly propertyId = 5177;
  private readonly groupId    = 318329;

  private get userId(): number {
    const id = this.auth.currentUser?.id ?? '';
    return parseInt(id.replace(/^\D+/, ''), 10);
  }

  private get companyId(): number {
    const community = this.auth.currentUser?.community ?? '';
    return parseInt(community.replace(/\D+/g, ''), 10);
  }

  private get dhangoUserId(): string {
    return `${this.userId}-${this.companyId}-${this.residentId}`;
  }

  get isPaying(): boolean {
    return this.isBankPaying || this.isCardPaying;
  }

  constructor(
    private residentService: ResidentService,
    public auth: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.residentService.getBalanceSummary().subscribe(b => this.balance = b);
    this.loadSavedTokens();
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
        if (bank) { this.bankTokenId = bank.tokenId; this.bankAccountKey = bank.accountKey; this.bankAccountNumber = bank.accountNumber ?? null; }
        if (card) { this.cardTokenId = card.tokenId; this.cardAccountKey = card.accountKey; this.cardAccountNumber = card.accountNumber ?? null; }
      },
      error: () => { this.isLoadingToken = false; }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  setupAutoPay(): void {
    this.autopayNotice    = '';
    this.showAutopayModal = true;
  }

  closeAutopayModal(): void {
    this.showAutopayModal = false;
    this.autopayNotice    = '';
  }

  confirmSetupAutopay(): void {
    this.autopayNotice = 'AutoPay configuration is coming soon.';
  }

  oneTimePayment(): void {
    this.payError    = '';
    this.paySuccess  = '';
    this.payView     = 'main';
    this.showPayModal = true;
  }

  closePayModal(): void {
    if (this.isPaying || this.isBankLoading) return;
    this.showPayModal = false;
    this.payView      = 'main';
    this.payError     = '';
    this.paySuccess   = '';
    this.bankError    = '';
    this.bankSuccess  = '';
    this.cardError    = '';
    this.cardSuccess  = '';
  }

  payWithBank(): void {
    if (!this.bankTokenId || !this.bankAccountKey) {
      // no saved bank — show add form inline
      this.bankForm    = { accountType: '', name: '', routing: '', account: '', reAccount: '' };
      this.bankError   = '';
      this.bankSuccess = '';
      this.payView     = 'bank';
      return;
    }
    // saved bank exists — show confirm screen
    this.confirmType  = 'bank';
    this.payAmount    = this.balance.totalDue;
    this.authorized   = false;
    this.confirmError = '';
    this.payView      = 'confirm';
  }

  payWithCard(): void {
    if (!this.cardTokenId || !this.cardAccountKey) {
      // no saved card — show add form inline
      this.cardForm    = { cardholderName: '', cardNumber: '', reCardNumber: '', expirationMonth: '', expirationYear: '', cvv: '' };
      this.cardError   = '';
      this.cardSuccess = '';
      this.payView     = 'card';
      return;
    }
    // saved card exists — show confirm screen
    this.confirmType  = 'card';
    this.payAmount    = this.balance.totalDue;
    this.authorized   = false;
    this.confirmError = '';
    this.payView      = 'confirm';
  }

  getMaskedAccount(account: string): string {
    if (!account || account.length <= 4) return account;
    return 'X'.repeat(account.length - 4) + account.slice(-4);
  }

  confirmPayment(): void {
    this.confirmError = '';
    if (!this.payAmount || this.payAmount <= 0) { this.confirmError = 'Please enter a valid payment amount.'; return; }
    this.isConfirming = true;
    // TODO: wire up Dhango transaction call
    setTimeout(() => {
      this.isConfirming = false;
      this.paySuccess   = `Payment of ${this.formatCurrency(this.payAmount)} submitted successfully!`;
      this.payView      = 'main';
    }, 1200);
  }

  backToMain(): void {
    this.payView      = 'main';
    this.bankError    = '';
    this.bankSuccess  = '';
    this.cardError    = '';
    this.cardSuccess  = '';
    this.confirmError = '';
  }

  saveBankAccount(): void {
    this.bankError   = '';
    this.bankSuccess = '';

    if (!this.bankForm.accountType)                        { this.bankError = 'Please select an account type.'; return; }
    if (!this.bankForm.name.trim())                        { this.bankError = 'Please enter the name on bank account.'; return; }
    if (!/^\d{9}$/.test(this.bankForm.routing))            { this.bankError = 'Routing number must be 9 digits.'; return; }
    if (!this.bankForm.account.trim())                     { this.bankError = 'Please enter your account number.'; return; }
    if (this.bankForm.account !== this.bankForm.reAccount) { this.bankError = 'Account numbers do not match.'; return; }
    if (this.bankForm.account.length > 17)                 { this.bankError = 'Account number must have a maximum length of 17.'; return; }
    if (/[^a-zA-Z0-9]/.test(this.bankForm.account))       { this.bankError = 'Account number cannot contain special characters.'; return; }

    this.isBankLoading = true;
    const existingTokenId = this.bankTokenId;

    this.getDhangoAccountKey().pipe(
      switchMap((accountKey: string) =>
        this.createDhangoToken(accountKey).pipe(
          switchMap((dhangoResponse: any) => this.savePlatformToken(dhangoResponse, accountKey)),
          catchError(err => { console.error('createDhangoToken failed:', err); return of(null); })
        )
      ),
      switchMap(() => {
        if (existingTokenId) {
          return this.deletePlatformToken(existingTokenId).pipe(catchError(() => of(null)));
        }
        return of(null);
      }),
      switchMap(() => this.getCurrentPlatformToken().pipe(catchError(() => of([]))))
    ).subscribe({
      next: (data: any) => {
        this.isBankLoading = false;
        const bank = (data ?? []).find((t: any) => t.paymentAccountType === 'BankAccount');
        if (bank) { this.bankTokenId = bank.tokenId; this.bankAccountKey = bank.accountKey; this.bankAccountNumber = bank.accountNumber ?? null; }
        this.bankSuccess = 'Bank account saved!';
        setTimeout(() => { this.bankSuccess = ''; this.payView = 'main'; }, 1200);
      },
      error: (err) => {
        this.isBankLoading = false;
        this.bankError = err?.error?.message || 'Failed to save bank account. Please try again.';
      }
    });
  }

  saveCreditCard(): void {
    this.cardError   = '';
    this.cardSuccess = '';

    if (!this.cardForm.cardholderName.trim())                              { this.cardError = 'Please enter cardholder name.'; return; }
    if (!/^\d{13,19}$/.test(this.cardForm.cardNumber.replace(/\s/g,''))) { this.cardError = 'Please enter a valid card number.'; return; }
    if (this.cardForm.cardNumber !== this.cardForm.reCardNumber)          { this.cardError = 'Card numbers do not match.'; return; }
    if (!this.cardForm.expirationMonth)                                   { this.cardError = 'Please select expiration month.'; return; }
    if (!this.cardForm.expirationYear)                                    { this.cardError = 'Please select expiration year.'; return; }
    if (!/^\d{3,4}$/.test(this.cardForm.cvv))                            { this.cardError = 'Please enter a valid CVV.'; return; }

    this.isBankLoading = true;

    this.getDhangoAccountKey().pipe(
      switchMap((accountKey: string) =>
        this.createDhangoCardToken(accountKey).pipe(
          switchMap((dhangoResponse: any) => this.savePlatformCardToken(dhangoResponse, accountKey))
        )
      )
    ).subscribe({
      next: (data: any) => {
        this.isBankLoading = false;
        this.cardTokenId    = data?.tokenId ?? null;
        this.cardAccountKey = data?.accountKey ?? null;
        this.cardSuccess    = 'Credit card saved!';
        setTimeout(() => { this.cardSuccess = ''; this.payView = 'main'; }, 1200);
      },
      error: (err) => {
        this.isBankLoading = false;
        this.cardError = err?.error?.message
          || Object.values(err?.error?.errors ?? {}).map((v: any) => v[0]).join(', ')
          || 'Failed to save credit card. Please try again.';
      }
    });
  }

  // ── Private API Helpers ───────────────────────────────────────────────────

  private getCurrentPlatformToken() {
    return this.http.get<any[]>(this.platformTokensUrl, {
      params: {
        CompanyId:           String(this.companyId),
        UserId:              String(this.userId),
        ResidentId:          String(this.residentId),
        PaymentOptionTypeId: String(this.payTo)
      },
      headers: this.rpHeaders()
    });
  }

  private getDhangoAccountKey() {
    return this.http.get<string>(this.platformAccountKey, {
      params: {
        companyId:  String(this.companyId),
        propertyId: String(this.propertyId),
        ledgerType: String(this.payTo)
      },
      headers: this.rpHeaders()
    });
  }

  private createDhangoToken(accountKey: string) {
    const bankAccountType = this.bankForm.accountType === 'Checking'
      ? 'PersonalChecking' : 'PersonalSavings';

    return this.http.post<any>(this.dhangoTokensUrl, {
      userId: this.dhangoUserId,
      ach: {
        accountNumber:     this.bankForm.account,
        bankAccountHolder: this.bankForm.name.trim(),
        bankAccountType:   bankAccountType,
        routingNumber:     this.bankForm.routing
      },
      metadata: { payTo: String(this.payTo), tenantKey: this.dhangoUserId },
      validateAccount: false
    }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=UTF-8',
        'accountKey':   accountKey,
        'culture':      'en'
      })
    });
  }

  private createDhangoCardToken(accountKey: string) {
    return this.http.post<any>(this.dhangoTokensUrl, {
      userId: String(this.userId),
      card: {
        cardHolder:      this.cardForm.cardholderName.trim(),
        cardNumber:      this.cardForm.cardNumber.replace(/\s/g, ''),
        expirationMonth: parseInt(this.cardForm.expirationMonth, 10),
        expirationYear:  parseInt(this.cardForm.expirationYear, 10),
        securityCode:    this.cardForm.cvv
      },
      metadata: { payTo: this.payTo.toString(), tenantKey: String(this.userId) },
      validateAccount: false
    }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=UTF-8',
        'accountKey':   accountKey,
        'culture':      'en'
      })
    });
  }

  private savePlatformToken(dhangoResponse: any, accountKey: string) {
    return this.http.post<any>(this.platformTokensUrl, {
      tokenId:             dhangoResponse.id,
      accountKey:          accountKey,
      entityType:          'Resident',
      companyId:           this.companyId,
      groupId:             this.groupId,
      propertyId:          this.propertyId,
      paymentAccountType:  'BankAccount',
      paymentOptionTypeId: String(dhangoResponse.metadata?.payTo ?? this.payTo),
      residentId:          this.residentId,
      userId:              this.userId,
      participantId:       null,
      reservationId:       null,
      cardType:            null,
      routingNumber:       dhangoResponse.ach?.routingNumber,
      accountNumber:       dhangoResponse.ach?.accountNumber,
      bankName:            dhangoResponse.ach?.bankAccountHolder,
      bankAccountType:     dhangoResponse.ach?.bankAccountType
    }, { headers: this.rpHeaders() });
  }

  private savePlatformCardToken(dhangoResponse: any, accountKey: string) {
    return this.http.post<any>(this.platformTokensUrl, {
      tokenId:             dhangoResponse.id,
      accountKey:          accountKey,
      entityType:          'Resident',
      companyId:           this.companyId,
      groupId:             this.groupId,
      propertyId:          this.propertyId,
      paymentAccountType:  'CreditCard',
      paymentOptionTypeId: dhangoResponse.metadata?.payTo,
      residentId:          this.residentId,
      userId:              this.userId,
      participantId:       null,
      reservationId:       null,
      accountNumber:       dhangoResponse.card?.cardNumber ?? null,
      bankName:            dhangoResponse.card?.cardHolder ?? this.cardForm.cardholderName.trim(),
      bankAccountType:     dhangoResponse.card?.cardBrand  ?? null,
      routingNumber:       null
    }, { headers: this.rpHeaders() });
  }

  private deletePlatformToken(tokenId: string) {
    return this.http.delete(`${this.platformTokensUrl}/${tokenId}`, { headers: this.rpHeaders() });
  }

  private rpHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('rpAccessToken') ?? '';
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }
}
