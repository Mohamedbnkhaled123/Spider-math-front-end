import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../auth/auth.service';

/**
 * Functional Guard ensuring that the student's current device is not in a pending approval state.
 * If the device received HTTP 423 or is awaiting teacher approval, redirects to /pending-device-approval.
 * Allows SSR server pass-through so client-side hydration can inspect localStorage.
 */
export const deviceApprovedGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();
  if (user?.role === 'SUPER_ADMIN') {
    return true;
  }

  // If pending approval flag is active, prevent navigation to protected content
  if (authService.isPendingDeviceApproval()) {
    return router.createUrlTree(['/pending-device-approval']);
  }

  return true;
};
