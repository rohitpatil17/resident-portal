// src/app/pages/login/login.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LogoComponent } from '../../shared/components/logo/logo.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LogoComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username     = '';
  password     = '';
  showPassword = false;
  errorMessage = '';
  isLoading    = false;

  // Auto-updates every year — no manual change needed
  readonly currentYear = new Date().getFullYear();

  constructor(
    private auth:  AuthService,
    private router: Router,
    private route:  ActivatedRoute     // ← added for returnUrl support
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    this.errorMessage = '';

    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter your username and password.';
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      const success = this.auth.login(this.username, this.password);
      this.isLoading = false;

      if (success) {
        // Return to the page they refreshed on, or fall back to /dashboard
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
        this.router.navigateByUrl(returnUrl);
      } else {
        this.errorMessage = 'Invalid credentials. Please try again.';
      }
    }, 800);
  }

  onRhpLogin(): void {
    this.auth.login('rhp-user', 'rhp-pass');
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
    this.router.navigateByUrl(returnUrl);
  }
}