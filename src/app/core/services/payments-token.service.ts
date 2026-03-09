// src/app/core/services/payments-token.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentsTokenService {

  private cachedToken: string | null = null;
  private tokenExpiresAt             = 0;

  // mirrors AccessTokenCacheMinutes = 15
  private readonly cacheMinutes = 15;

  private readonly tokenUrl =
    `${environment.identity.baseUrl}/${environment.identity.tokenResource}`;

  constructor(private http: HttpClient) {}

  // Returns a valid Bearer token — uses cache if still valid
  getToken(): Observable<string> {
    const now = Date.now();

    if (this.cachedToken && now < this.tokenExpiresAt) {
      return of(this.cachedToken);
    }

    const body = new URLSearchParams({
      grant_type:    environment.platformPayments.grantType,
      client_id:     environment.platformPayments.clientId,
      client_secret: environment.platformPayments.clientSecret,
      scope:         environment.platformPayments.scope
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http
      .post<{ access_token: string; expires_in: number }>(
        this.tokenUrl,
        body.toString(),
        { headers }
      )
      .pipe(
        tap({
          next: res => {
            this.cachedToken    = res.access_token;
            // Cache for 15 min minus 30s buffer
            this.tokenExpiresAt = now + (this.cacheMinutes * 60 - 30) * 1000;
          },
          error: () => {
            this.cachedToken    = null;
            this.tokenExpiresAt = 0;
          }
        }),
        switchMap(res => of(res.access_token))
      );
  }
}