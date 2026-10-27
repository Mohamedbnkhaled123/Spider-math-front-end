import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../auth/auth.service';

/**
 * Functional Guard guarding private routes against unauthenticated guests.
 * Allows SSR server pass-through so client-side hydration can inspect localStorage.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

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

