import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip auto Bearer token for platform payments — it handles its own auth
  const isPaymentsUrl = req.url.startsWith(environment.platformPayments.baseUrl);
  // Skip auto Bearer token for Dhango — it uses Basic Auth set manually in the service
  const isDhangoUrl   = req.url.startsWith(environment.dhango.baseUrl);

  if (isPaymentsUrl || isDhangoUrl) {
    return next(req);
  }

  const token = inject(AuthService).getToken();
  if (token) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }
  return next(req);
};