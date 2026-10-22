import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService, UserRole } from '../auth/auth.service';

/**
 * Functional Role Guard ensuring the active user holds the necessary RBAC role.
 */
export const roleGuard = (allowedRoles: readonly UserRole[]): CanActivateFn => {
  return () => {
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
