import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export interface IDeviceIdentity {
  readonly deviceUuid: string;
  readonly deviceType: string;
  readonly browserInfo: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceFingerprintService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'spider_math_device_uuid';
  
  private cachedDeviceIdentity: IDeviceIdentity | null = null;
  private fpPromise: ReturnType<typeof FingerprintJS.load> | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        const entropySeed = Math.random().toString(36).substring(2, 10);
        const initialUuid = `SM-INIT-${Date.now()}-${entropySeed}`.toUpperCase();
        localStorage.setItem(this.STORAGE_KEY, initialUuid);
      }
      this.fpPromise = FingerprintJS.load();
    }
  }

  /**
   * Generates or retrieves the persistent composite X-Device-UUID.
   */
  async getOrCreateDeviceIdentity(): Promise<IDeviceIdentity> {
    if (this.cachedDeviceIdentity) {
      return this.cachedDeviceIdentity;
    }

    if (!isPlatformBrowser(this.platformId)) {
      // SSR Fallback
      return {
        deviceUuid: 'SSR_STATIC_DEVICE_NODE',
        deviceType: 'Server-Side Rendering Environment',
        browserInfo: 'Angular SSR / Node.js'
      };
    }

    // 1. Check LocalStorage for existing verified UUID
    let storedUuid = localStorage.getItem(this.STORAGE_KEY);

    if (!storedUuid) {
      try {
        const fp = await (this.fpPromise ?? FingerprintJS.load());
        const result = await fp.get();
        // Create composite UUID combining visitorId and high-entropy seed
        const entropySeed = Math.random().toString(36).substring(2, 10);
        storedUuid = `SM-${result.visitorId}-${entropySeed}`.toUpperCase();
        localStorage.setItem(this.STORAGE_KEY, storedUuid);
      } catch (err) {
        console.warn('[DeviceFingerprintService] Fingerprint generation fallback:', err);
        // Resilient fallback UUID
        storedUuid = `SM-FALLBACK-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`.toUpperCase();
        localStorage.setItem(this.STORAGE_KEY, storedUuid);
      }
    }

    const deviceType = this.resolveDeviceType();
    const browserInfo = this.resolveBrowserInfo();

    this.cachedDeviceIdentity = {
      deviceUuid: storedUuid,
      deviceType,
      browserInfo
    };

    return this.cachedDeviceIdentity;
  }

  /**
   * Synchronously reads the existing device UUID if available in localStorage.
   */
  getExistingDeviceUuidSync(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return 'SSR_STATIC_DEVICE_NODE';
    }
    return localStorage.getItem(this.STORAGE_KEY) || 'SM-PENDING-FINGERPRINT';
  }

  private resolveDeviceType(): string {
    const ua = navigator.userAgent;
    if (/tablet|ipad/i.test(ua)) return 'Tablet Device';
    if (/mobile|android|iphone/i.test(ua)) return 'Mobile Smartphone';
    if (/macintosh|mac os x/i.test(ua)) return 'Desktop - macOS';
    if (/windows/i.test(ua)) return 'Desktop - Windows';
    if (/linux/i.test(ua)) return 'Desktop - Linux';
    return 'Desktop Browser';
  }

  private resolveBrowserInfo(): string {
    const ua = navigator.userAgent;
    let browser = 'Unknown Browser';
    if (ua.includes('Firefox/')) browser = `Firefox ${ua.split('Firefox/')[1]?.split(' ')[0] ?? ''}`;
    else if (ua.includes('Edg/')) browser = `Edge ${ua.split('Edg/')[1]?.split(' ')[0] ?? ''}`;
    else if (ua.includes('Chrome/')) browser = `Chrome ${ua.split('Chrome/')[1]?.split(' ')[0] ?? ''}`;
    else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
    return browser.trim();
  }
}
