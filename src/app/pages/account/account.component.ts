// src/app/pages/account/account.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, catchError, of } from 'rxjs';
import { ResidentService } from '../../core/services/resident.service';
import { AuthService } from '../../core/services/auth.service';
import { PaymentNavService } from '../../core/services/payment-nav.service';
import { AccountSection, BalanceSummary } from '../../core/models/resident.model';
import { environment } from '../../../environments/environment';

type PaymentView = 'none' | 'menu' | 'bank' | 'card' | 'details';
type SectionView  = 'none' | 'contact' | 'cashpay' | 'addsite' | 'self' | 'autopay';

interface SavedCard {
  accountNumber: string;
  bankName:      string;
  cardBrand:     string;
  tokenId:       string;
  accountKey:    string;
}

interface SavedBank {
  routingNumber:   string;
  accountNumber:   string;
  bankName:        string;
  bankAccountType: string;
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  sections: AccountSection[] = [];

  // ── Section Views ─────────────────────────────────────────────────────────
  sectionView: SectionView = 'none';

  contactForm = { firstName: '', lastName: '', email: '', phone: '' };
  contactError   = '';
  contactSuccess = '';

  addSiteCode    = '';
  addSiteError   = '';
  addSiteSuccess = '';

  autopayBalance: BalanceSummary | null = null;
  autopayNotice  = '';
  cashpayNotice  = '';

  // ── Login Modal ──────────────────────────────────────────────────────────
  showLoginModal = false;
  loginForm = {
    username:        '',
    email:           '',
    currentPassword: '',
    newPassword:     '',
    verifyPassword:  ''
  };
  loginError   = '';
  loginSuccess = '';

  // ── Payment Modal ────────────────────────────────────────────────────────
  paymentView: PaymentView = 'none';
  isPaymentLoading         = false;

  bankForm = {
    accountType: '',
    name:        '',
    routing:     '',
    account:     '',
    reAccount:   ''
  };
  bankError     = '';
  bankSuccess   = '';
  isBankLoading = false;

  savedBank:           SavedBank | null = null;
  savedBankTokenId:    string | null    = null;
  savedBankAccountKey: string | null    = null;
  savedCard:           SavedCard | null = null;
  tokenList:           any[]            = [];
  isRemoveLoading      = false;
  isRemoveCardLoading  = false;
  removeError          = '';
  removeCardError      = '';

  cardForm = {
    cardholderName:  '',
    cardNumber:      '',
    reCardNumber:    '',
    expirationMonth: '',
    expirationYear:  '',
    cvv:             ''
  };
  cardError   = '';
  cardSuccess = '';

  accountTypes = ['Checking', 'Savings'];
  months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  years  = Array.from({ length: 12 }, (_, i) => String(new Date().getFullYear() + i));

  // ── API URLs ─────────────────────────────────────────────────────────────
  private readonly platformTokensUrl  = `${environment.platformPayments.baseUrl}/${environment.platformPayments.resources.tokens}`;
  private readonly platformAccountKey = `${environment.platformPayments.baseUrl}/${environment.platformPayments.resources.accountKey}`;
  private readonly dhangoTokensUrl    = `${environment.dhango.baseUrl}/${environment.dhango.resources.postToken}`;

  // ── Constants ─────────────────────────────────────────────────────────────
  private readonly propertyId = 5177;
  private readonly groupId    = 318329;
  private readonly residentId = 10195442;
  private readonly payTo      = 1;

  private get userId(): number {
    const id = this.authService.currentUser?.id ?? '';
    return parseInt(id.replace(/^\D+/, ''), 10);
  }

  private get companyId(): number {
    const community = this.authService.currentUser?.community ?? '';
    return parseInt(community.replace(/\D+/g, ''), 10);
  }

  private get dhangoUserId(): string {
    return `${this.userId}-${this.companyId}-${this.residentId}`;
  }

  private returnToPayment = false;

  constructor(
    private residentService: ResidentService,
    private authService:     AuthService,
    private http:            HttpClient,
    private route:      ActivatedRoute,
    private router:     Router,
    private paymentNav: PaymentNavService
  ) {}

  ngOnInit(): void {
    this.residentService.getAccountSections().subscribe(s => this.sections = s);
    const user = this.authService.currentUser;
    if (user) {
      this.loginForm.username = user.name;
      this.loginForm.email    = user.email;
    }

    const openPayment = this.route.snapshot.queryParamMap.get('openPayment');
    if (openPayment === 'bank' || openPayment === 'card') {
      this.returnToPayment = true;
      this.openPaymentMenu();
      // after tokens load, jump straight to the relevant form
      const interval = setInterval(() => {
        if (!this.isPaymentLoading) {
          clearInterval(interval);
          if (openPayment === 'bank') this.goToBank();
          else                        this.goToCard();
        }
      }, 100);
    }
  }

  // ── Section Router ───────────────────────────────────────────────────────
  viewSection(section: AccountSection): void {
    if (section.disabled) return;
    if      (section.id === 'login')   { this.openLoginModal(); }
    else if (section.id === 'payment') { this.openPaymentMenu(); }
    else if (section.id === 'contact') { this.openContact(); }
    else if (section.id === 'autopay') { this.openAutoPay(); }
    else if (section.id === 'cashpay') { this.sectionView = 'cashpay'; }
    else if (section.id === 'addsite') { this.openAddSite(); }
    else if (section.id === 'self')    { this.sectionView = 'self'; }
    else                               { alert(`Opening: ${section.title}`); }
  }

  openAutoPay(): void {
    this.autopayBalance = null;
    this.sectionView = 'autopay';
    this.residentService.getBalanceSummary().subscribe(b => this.autopayBalance = b);
  }

  openContact(): void {
    const user = this.authService.currentUser;
    const parts = (user?.name ?? '').trim().split(' ');
    this.contactForm = {
      firstName: parts[0] ?? '',
      lastName:  parts.slice(1).join(' ') ?? '',
      email:     user?.email ?? '',
      phone:     user?.phone ?? ''
    };
    this.contactError   = '';
    this.contactSuccess = '';
    this.sectionView    = 'contact';
  }

  saveContact(): void {
    this.contactError = '';
    if (!this.contactForm.email.trim()) { this.contactError = 'Email is required.'; return; }
    this.contactSuccess = 'Contact information updated successfully.';
    setTimeout(() => { this.contactSuccess = ''; this.sectionView = 'none'; }, 1500);
  }

  openAddSite(): void {
    this.addSiteCode  = '';
    this.addSiteError = '';
    this.sectionView  = 'addsite';
  }

  submitAddSite(): void {
    this.addSiteError   = '';
    this.addSiteSuccess = '';
    if (!this.addSiteCode.trim()) { this.addSiteError = 'Please enter a registration code.'; return; }
    this.addSiteSuccess = 'Registration code submitted. We\'ll connect your site shortly.';
    setTimeout(() => { this.addSiteSuccess = ''; this.sectionView = 'none'; }, 2000);
  }

  setupAutoPay(): void {
    this.autopayNotice = 'AutoPay configuration is coming soon.';
  }

  findPaymentLocation(): void {
    this.cashpayNotice = 'Payment location finder is coming soon.';
  }

  continueToSelf(): void {
    this.closeSectionView();
  }

  closeSectionView(): void {
    this.sectionView    = 'none';
    this.contactError   = '';
    this.contactSuccess = '';
    this.addSiteCode    = '';
    this.addSiteError   = '';
    this.addSiteSuccess = '';
    this.autopayNotice  = '';
    this.cashpayNotice  = '';
  }

  // ── Login ────────────────────────────────────────────────────────────────
  openLoginModal(): void {
    this.loginForm.newPassword    = '';
    this.loginForm.verifyPassword = '';
    this.loginError               = '';
    this.loginSuccess             = '';
    this.showLoginModal           = true;
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

  // ── Payment — load existing tokens ───────────────────────────────────────
  openPaymentMenu(): void {
    this.resetForms();
    this.isPaymentLoading = true;
    this.paymentView      = 'none';

    this.getCurrentPlatformToken().subscribe({
      next: (data) => {
        this.isPaymentLoading = false;
        this.tokenList        = data ?? [];
        this.applyTokenData(data ?? []);
      },
      error: () => {
        this.isPaymentLoading = false;
        this.savedBank        = null;
        this.savedCard        = null;
        this.paymentView      = 'menu';
      }
    });
  }

  // ── Parse token list → savedBank + savedCard ─────────────────────────────
  private applyTokenData(data: any[]): void {
    const bank = data.find(t => t.paymentAccountType === 'BankAccount');
    const card = data.find(t => t.paymentAccountType === 'CreditCard');

    if (bank) {
      this.savedBank = {
        routingNumber:   bank.routingNumber   ?? '',
        accountNumber:   bank.accountNumber   ?? '',
        bankName:        bank.bankName         ?? '',
        bankAccountType: (bank.bankAccountType ?? '').replace('Personal', '')
      };
      this.savedBankTokenId    = bank.tokenId    ?? null;
      this.savedBankAccountKey = bank.accountKey ?? null;
    } else {
      this.savedBank           = null;
      this.savedBankTokenId    = null;
      this.savedBankAccountKey = null;
    }

    if (card) {
      this.savedCard = {
        accountNumber: card.accountNumber   ?? '',
        bankName:      card.bankName        ?? '',
        cardBrand:     card.bankAccountType ?? '',
        tokenId:       card.tokenId         ?? '',
        accountKey:    card.accountKey      ?? ''
      };
    } else {
      this.savedCard = null;
    }

    this.paymentView = (bank || card) ? 'details' : 'menu';
  }

  closePaymentModal(): void {
    this.paymentView = 'none';
    if (this.returnToPayment) {
      this.paymentNav.openModalOnReturn = true;
      this.router.navigate(['/payment']);
    }
  }

  // cancel from bank/card form — skip menu and go back if came from payment page
  cancelPaymentForm(): void {
    if (this.returnToPayment) {
      this.paymentView = 'none';
      this.paymentNav.openModalOnReturn = true;
      this.router.navigate(['/payment']);
    } else {
      this.openPaymentMenu();
    }
  }

  goToBank(): void {
    this.bankError   = '';
    this.bankSuccess = '';
    if (this.savedBank) {
      this.bankForm = {
        accountType: this.savedBank.bankAccountType,
        name:        this.savedBank.bankName,
        routing:     this.savedBank.routingNumber,
        account:     '',
        reAccount:   ''
      };
    } else {
      this.bankForm = { accountType: '', name: '', routing: '', account: '', reAccount: '' };
    }
    this.paymentView = 'bank';
  }

  goToCard(): void {
    this.cardError   = '';
    this.cardSuccess = '';
    this.cardForm    = { cardholderName: '', cardNumber: '', reCardNumber: '', expirationMonth: '', expirationYear: '', cvv: '' };
    this.paymentView = 'card';
  }

  getMaskedAccount(account: string): string {
    if (!account || account.length <= 4) return account;
    return 'X'.repeat(account.length - 4) + account.slice(-4);
  }

  // ── Save Bank Account ─────────────────────────────────────────────────────
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
    const existingTokenId = this.savedBankTokenId;

    this.getDhangoAccountKey().pipe(
      switchMap((accountKey: string) =>
        this.createDhangoToken(accountKey).pipe(
          switchMap((dhangoResponse: any) => this.savePlatformToken(dhangoResponse, accountKey)),
          catchError(err => { console.error('createDhangoToken failed:', err); return of(null); })
        )
      ),
      switchMap(() => {
        if (existingTokenId) {
          return this.deleteExistingPlatformToken(existingTokenId).pipe(catchError(() => of(null)));
        }
        return of(null);
      }),
      switchMap(() => this.getCurrentPlatformToken().pipe(catchError(() => of([]))))
    ).subscribe({
      next: (data: any) => {
        this.isBankLoading = false;
        this.tokenList     = data ?? [];
        this.applyTokenData(data ?? []);
      },
      error: (err) => {
        this.isBankLoading = false;
        this.bankError = err?.error?.message || 'Failed to save bank account. Please try again.';
      }
    });
  }

  // ── Save Credit Card ──────────────────────────────────────────────────────
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
        this.getExistingCCToken().pipe(
          switchMap((data: any[]) => {
            const existingToken = data?.[0];
            if (existingToken?.tokenId) {
              return this.deleteExistingPlatformToken(existingToken.tokenId).pipe(
                catchError(() => of(null)),
                switchMap(() => of(accountKey))
              );
            }
            return of(accountKey);
          }),
          catchError(() => of(accountKey))
        )
      ),
      switchMap((accountKey: string) =>
        this.createDhangoCardToken(accountKey).pipe(
          switchMap((dhangoResponse: any) =>
            this.savePlatformCardToken(dhangoResponse, accountKey)
          )
        )
      )
    ).subscribe({
      next: () => {
        this.isBankLoading = false;
        this.cardSuccess   = 'Credit card added successfully!';
        setTimeout(() => this.openPaymentMenu(), 1500);
      },
      error: (err) => {
        this.isBankLoading = false;
        this.cardError = err?.error?.message
          || Object.values(err?.error?.errors ?? {}).map((v: any) => v[0]).join(', ')
          || 'Failed to save credit card. Please try again.';
      }
    });
  }

  // ── Remove Bank Account ───────────────────────────────────────────────────
  removeBankAccount(): void {
    this.removeError = '';

    if (!this.savedBankTokenId) {
      this.removeError = 'Unable to find bank account token. Please try again.';
      return;
    }

    this.isRemoveLoading = true;
    const tokenId    = this.savedBankTokenId;
    const accountKey = this.savedBankAccountKey ?? '';

    this.deleteExistingPlatformToken(tokenId).pipe(
      switchMap(() => this.deleteDhangoToken(tokenId, accountKey)),
      catchError(err => { console.error('Delete failed:', err); return of(null); })
    ).subscribe({
      next: () => {
        this.isRemoveLoading     = false;
        this.savedBank           = null;
        this.savedBankTokenId    = null;
        this.savedBankAccountKey = null;
        this.paymentView         = this.savedCard ? 'details' : 'menu';
      },
      error: (err) => {
        this.isRemoveLoading = false;
        this.removeError = err?.error?.message || 'Failed to remove bank account. Please try again.';
      }
    });
  }

  // ── Remove Credit Card ────────────────────────────────────────────────────
  removeCardAccount(): void {
    this.removeCardError = '';

    if (!this.savedCard?.tokenId) {
      this.removeCardError = 'Unable to find credit card token. Please try again.';
      return;
    }

    this.isRemoveCardLoading = true;
    const tokenId    = this.savedCard.tokenId;
    const accountKey = this.savedCard.accountKey ?? '';

    this.deleteExistingPlatformToken(tokenId).pipe(
      switchMap(() => this.deleteDhangoToken(tokenId, accountKey)),
      catchError(err => { console.error('Delete card failed:', err); return of(null); })
    ).subscribe({
      next: () => {
        this.isRemoveCardLoading = false;
        this.savedCard           = null;
        this.paymentView         = this.savedBank ? 'details' : 'menu';
      },
      error: (err) => {
        this.isRemoveCardLoading = false;
        this.removeCardError = err?.error?.message || 'Failed to remove credit card. Please try again.';
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

  private getExistingCCToken() {
    return this.http.get<any[]>(this.platformTokensUrl, {
      params: {
        CompanyId:           String(this.companyId),
        UserId:              String(this.userId),
        ResidentId:          String(this.residentId),
        PaymentOptionTypeId: String(this.payTo),
        accountType:         'CreditCard'
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

    const payload = {
      userId: this.dhangoUserId,
      ach: {
        accountNumber:     this.bankForm.account,
        bankAccountHolder: this.bankForm.name.trim(),
        bankAccountType:   bankAccountType,
        routingNumber:     this.bankForm.routing
      },
      metadata: {
        payTo:     String(this.payTo),
        tenantKey: this.dhangoUserId
      },
      validateAccount: false
    };

    return this.http.post<any>(this.dhangoTokensUrl, payload, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=UTF-8',
        'accountKey':   accountKey,
        'culture':      'en'
      })
    });
  }

  private createDhangoCardToken(accountKey: string) {
    const payload = {
      userId: String(this.userId),
      card: {
        cardHolder:      this.cardForm.cardholderName.trim(),
        cardNumber:      this.cardForm.cardNumber.replace(/\s/g, ''),
        expirationMonth: parseInt(this.cardForm.expirationMonth, 10),
        expirationYear:  parseInt(this.cardForm.expirationYear, 10),
        securityCode:    this.cardForm.cvv
      },
      metadata: {
        payTo:     this.payTo.toString(),
        tenantKey: String(this.userId)
      },
      validateAccount: false
    };

    return this.http.post<any>(this.dhangoTokensUrl, payload, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=UTF-8',
        'accountKey':   accountKey,
        'culture':      'en'
      })
    });
  }

  private savePlatformToken(dhangoResponse: any, accountKey: string) {
    const payload = {
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
    };

    return this.http.post<any>(this.platformTokensUrl, payload, { headers: this.rpHeaders() });
  }

  private savePlatformCardToken(dhangoResponse: any, accountKey: string) {
    const payload = {
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
    };

    return this.http.post<any>(this.platformTokensUrl, payload, { headers: this.rpHeaders() });
  }

  private deleteExistingPlatformToken(tokenId: string) {
    return this.http.delete(
      `${this.platformTokensUrl}/${tokenId}`,
      { headers: this.rpHeaders() }
    );
  }

  private deleteDhangoToken(tokenId: string, accountKey: string) {
    const url = `${environment.dhango.baseUrl}/${environment.dhango.resources.deleteToken.replace('{id}', tokenId)}`;
    return this.http.delete(url, {
      headers: new HttpHeaders({
        'accountKey': accountKey,
        'culture':    'en'
      })
    });
  }

  private rpHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('rpAccessToken') ?? '';
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  private resetForms(): void {
    this.bankForm            = { accountType: '', name: '', routing: '', account: '', reAccount: '' };
    this.cardForm            = { cardholderName: '', cardNumber: '', reCardNumber: '', expirationMonth: '', expirationYear: '', cvv: '' };
    this.bankError           = ''; this.bankSuccess = '';
    this.cardError           = ''; this.cardSuccess = '';
    this.removeError         = '';
    this.removeCardError     = '';
    this.savedBankTokenId    = null;
    this.savedBankAccountKey = null;
    this.savedCard           = null;
  }
}