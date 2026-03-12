import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
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

  const auth = inject(AuthService);
  const token = auth.getToken();
  const request = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) auth.logout();
      return throwError(() => err);
    })
  );
};
