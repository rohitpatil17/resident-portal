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
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Invalid credentials. Please try again.';

      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Invalid credentials. Please try again.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Unable to connect. Please try again.';

      }
    });
  }

  onRhpLogin(): void {
    this.auth.login('rhp-user', 'rhp-pass').subscribe({

      next: () => this.router.navigate(['/dashboard'])

      next: (success) => {
        if (success) this.router.navigate(['/dashboard']);
        else this.errorMessage = 'RHP login failed.';
      }

    });
  }
}