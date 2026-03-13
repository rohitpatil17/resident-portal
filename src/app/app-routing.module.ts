// src/app/app-routing.module.ts

import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AppLayoutComponent } from './layout/app-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { BillingComponent } from './pages/billing/billing.component';
import { AccountComponent } from './pages/account/account.component';
import { ComingSoonComponent } from './shared/components/coming-soon/coming-soon.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'payment',   component: PaymentComponent },
      { path: 'billing',   component: BillingComponent },
      { path: 'account',   component: AccountComponent },
      { path: 'faq',      component: ComingSoonComponent },
      { path: 'terms',    component: ComingSoonComponent },
      { path: 'privacy',  component: ComingSoonComponent },
      { path: 'browsers', component: ComingSoonComponent },
      { path: 'about',    component: ComingSoonComponent },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
