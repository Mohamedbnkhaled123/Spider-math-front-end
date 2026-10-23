import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

/**
 * Functional Guard guarding private routes against unauthenticated guests.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Preserve attempted return URL and redirect to home
  return router.createUrlTree(['/'], {
    queryParams: { loginRequired: 'true', returnUrl: state.url }
  });
};
