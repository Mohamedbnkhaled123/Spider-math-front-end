import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../auth/auth.service';

/**
 * Functional Guard ensuring a student user has an active, paid curriculum subscription.
 * Inactive students are redirected to the Inactive Student Portal to view trial lessons and WhatsApp activation.
 */
export const activeStudentGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  // SuperAdmins and registered students can access student dashboard
  if (authService.isSuperAdmin() || authService.isStudent()) {
    return true;
  }

  if (authService.hasActiveSubscription()) {
    return true;
  }

  // Redirect to Inactive Student Portal
  return router.createUrlTree(['/inactive-student-portal']);
};
