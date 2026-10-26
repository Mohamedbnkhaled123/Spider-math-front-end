import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { DeviceFingerprintService } from '../auth/device-fingerprint.service';

/**
 * Functional HTTP Interceptor that attaches the Bearer JWT token
 * and the composite X-Device-UUID header to all outgoing API requests.
 */
export const jwtDeviceInterceptor: HttpInterceptorFn = (req, next) => {
  // Never attach Authorization or custom device headers to external third-party services (e.g. Cloudinary, Desmos)
  if (
    req.url.includes('cloudinary.com') ||
    req.url.includes('desmos.com') ||
    (req.url.startsWith('http') && !req.url.includes('/api/'))
  ) {
    return next(req);
  }

  const authService = inject(AuthService);
  const fingerprintService = inject(DeviceFingerprintService);

  const token = authService.currentToken();
  const deviceUuid = fingerprintService.getExistingDeviceUuidSync();

  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (deviceUuid) {
    headers['X-Device-UUID'] = deviceUuid;
  }

  const clonedReq = req.clone({
    setHeaders: headers
  });

  return next(clonedReq);
};
