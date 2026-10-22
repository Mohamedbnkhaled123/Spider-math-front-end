import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

/**
 * Functional HTTP Interceptor handling authorization revivals,
 * device approvals (HTTP 423 Locked), and authentication expirations.
 */
export const errorRevokeInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // HTTP 423: Device Pending Teacher Approval
      if (error.status === 423) {
        authService.setPendingDeviceApproval(true);
        router.navigate(['/pending-device-approval']);
      }

      // HTTP 401: Unauthorized / Token Expired
      else if (error.status === 401) {
        // Do not force logout if attempting guest authentication
        if (!req.url.includes('/api/v1/auth/google') && !req.url.includes('/api/v1/auth/parent-login')) {
          authService.clearSession('/login');
        }
      }

      // HTTP 429: Rate-Limiting Threshold Exceeded
      else if (error.status === 429) {
        console.warn('[errorRevokeInterceptor] Rate limit reached. Backoff advised.');
      }

      return throwError(() => error);
    })
  );
};
