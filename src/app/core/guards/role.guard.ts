import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService, UserRole } from '../auth/auth.service';

/**
 * Functional Role Guard ensuring the active user holds the necessary RBAC role.
 * Allows SSR server pass-through so client-side hydration can inspect localStorage.
 */
export const roleGuard = (allowedRoles: readonly UserRole[]): CanActivateFn => {
  return () => {
    const platformId = inject(PLATFORM_ID);
    if (!isPlatformBrowser(platformId)) {
      return true;
    }

    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentUser();
    if (!user) {
      return router.createUrlTree(['/login']);
    }

    if (allowedRoles.includes(user.role)) {
      return true;
    }

    // Redirect to default landing if role is forbidden
    return router.createUrlTree(['/']);
  };
};
