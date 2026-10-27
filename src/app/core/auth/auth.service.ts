import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export type UserRole = 'SUPER_ADMIN' | 'STUDENT' | 'PARENT';

export interface IUserDto {
  readonly _id: string;
  readonly student_ha_code?: string;
  readonly full_name: string;
  readonly email: string;
  readonly phone?: string;
  readonly parent_phone?: string;
  readonly country?: string;
  readonly avatar_url?: string;
  readonly role: UserRole;
  readonly curriculum?: string;
  readonly grade_level?: string;
  readonly academic_term?: string;
  readonly governorate?: string;
  readonly total_xp?: number;
  readonly has_active_subscription?: boolean;
  readonly account_lock_status?: string;
  readonly approved_devices_count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  private readonly TOKEN_KEY = 'spider_math_jwt';
  private readonly USER_KEY = 'spider_math_user';

  // Signals
  readonly currentUser = signal<IUserDto | null>(null);
  readonly currentToken = signal<string | null>(null);
  readonly isPendingDeviceApproval = signal<boolean>(false);
  readonly isAuthInitialized = signal<boolean>(false);

  // Computed Signals
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly currentRole = computed(() => this.currentUser()?.role ?? null);
  readonly isSuperAdmin = computed(() => this.currentUser()?.role === 'SUPER_ADMIN');
  readonly isStudent = computed(() => this.currentUser()?.role === 'STUDENT');
  readonly isParent = computed(() => this.currentUser()?.role === 'PARENT');
  readonly hasActiveSubscription = computed(() => !!this.currentUser()?.has_active_subscription);

  constructor() {
    this.restoreSession();
  }

  /**
   * Sets authenticated session and persists credentials in client storage.
   */
  setSession(token: string, user: IUserDto): void {
    this.currentToken.set(token);
    this.currentUser.set(user);
    this.isPendingDeviceApproval.set(false);

    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      } catch (err) {
        console.error('[AuthService] Failed to save session:', err);
      }
    }
  }

  /**
   * Updates partial properties on the active user signal.
   */
  updateCurrentUser(patch: Partial<IUserDto>): void {
    this.currentUser.update(current => current ? { ...current, ...patch } : null);
    if (isPlatformBrowser(this.platformId)) {
      const user = this.currentUser();
      if (user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }
    }
  }

  /**
   * Sets the pending device approval state (e.g. on HTTP 423).
   */
  setPendingDeviceApproval(status: boolean): void {
    this.isPendingDeviceApproval.set(status);
  }

  /**
   * Clears session and redirects to guest landing.
   */
  clearSession(redirectUrl: string = '/'): void {
    this.currentToken.set(null);
    this.currentUser.set(null);
    this.isPendingDeviceApproval.set(false);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      this.router.navigateByUrl(redirectUrl);
    }
  }

  /**
   * Restores session on browser launch.
   */
  private restoreSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const token = localStorage.getItem(this.TOKEN_KEY);
        const userJson = localStorage.getItem(this.USER_KEY);

        if (token && userJson) {
          const user = JSON.parse(userJson) as IUserDto;
          this.currentToken.set(token);
          this.currentUser.set(user);
        }
      } catch (err) {
        console.warn('[AuthService] Could not parse stored session:', err);
        this.clearSession();
      }
    }
    this.isAuthInitialized.set(true);
  }
}
