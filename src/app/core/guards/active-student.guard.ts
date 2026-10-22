import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

/**
 * Functional Guard ensuring a student user has an active, paid curriculum subscription.
 * Inactive students are redirected to the Inactive Student Portal to view trial lessons and WhatsApp activation.
 */
export const activeStudentGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // SuperAdmins bypass subscription guard
  if (authService.isSuperAdmin()) {
    return true;
  }

  if (authService.hasActiveSubscription()) {
    return true;
  }

  // Redirect to Inactive Student Portal
  return router.createUrlTree(['/inactive-student-portal']);
};
