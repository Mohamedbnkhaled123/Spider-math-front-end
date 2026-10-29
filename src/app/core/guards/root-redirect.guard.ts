import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../auth/auth.service';

/**
 * Functional Guard for the root path ('').
 * When an authenticated user visits the root URL (http://localhost:4200/):
 * - If STUDENT: redirects automatically to their home dashboard ('/student').
 * - If PARENT: redirects to ('/parent').
 * - If SUPER_ADMIN: redirects to ('/admin').
 * Guests (unauthenticated visitors) proceed to the public landing page.
 */
export const rootRedirectGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    if (authService.isStudent()) {
      if (authService.isPendingDeviceApproval()) {
        return router.createUrlTree(['/pending-device-approval']);
      }
      return router.createUrlTree(['/student']);
    }

    if (authService.isParent()) {
      return router.createUrlTree(['/parent']);
    }

    if (authService.isSuperAdmin()) {
      return router.createUrlTree(['/admin']);
    }
  }

  return true;
};
