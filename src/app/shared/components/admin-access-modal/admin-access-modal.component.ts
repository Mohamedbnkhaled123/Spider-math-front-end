import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  model,
  signal,
  effect,
  OnDestroy,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AppIconComponent } from '../app-icon/app-icon.component';
import { AuthService } from '../../../core/auth/auth.service';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { ModalNavigationService } from '../../../core/services/modal-navigation.service';
import { ensureGoogleGsiScriptLoaded, SPIDER_GOOGLE_CLIENT_ID } from '../../../core/auth/google-gsi.util';

export interface AdminPortalStatus {
  teacherCodeSet: boolean;
  teacherGoogleSet: boolean;
  devCodeSet: boolean;
}

@Component({
  selector: 'app-admin-access-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  templateUrl: './admin-access-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminAccessModalComponent implements OnDestroy {
  readonly isOpen = model<boolean>(false);
  readonly portalMode = input<'teacher' | 'developer'>('teacher');

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly modalNav = inject(ModalNavigationService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly langService = inject(LangService);

  readonly teacherTab = signal<'code' | 'google'>('code');
  readonly portalStatus = signal<AdminPortalStatus>({
    teacherCodeSet: true,
    teacherGoogleSet: true,
    devCodeSet: true
  });
  readonly isLoadingStatus = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly isGoogleAuthenticating = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly accessCodeInput = signal<string>('');
  readonly confirmCodeInput = signal<string>('');

  private get modalId(): string {
    return `admin-secret-access-${this.portalMode()}`;
  }

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const mode = this.portalMode();
      if (open) {
        this.resetFormState();
        this.modalNav.registerModal({
          id: this.modalId,
          close: () => this.close()
        });
        this.fetchPortalStatus();
        if (mode === 'teacher' && isPlatformBrowser(this.platformId)) {
          ensureGoogleGsiScriptLoaded().catch(() => {});
        }
      } else {
        this.modalNav.dismissModal(this.modalId);
      }
    });
  }

  ngOnDestroy(): void {
    this.modalNav.dismissModal(this.modalId);
  }

  private resetFormState(): void {
    this.accessCodeInput.set('');
    this.confirmCodeInput.set('');
    this.errorMessage.set(null);
    this.showPassword.set(false);
    this.teacherTab.set('code');
    this.isSubmitting.set(false);
    this.isGoogleAuthenticating.set(false);
  }

  fetchPortalStatus(): void {
    this.isLoadingStatus.set(true);
    this.http.get<{ success: boolean; data: AdminPortalStatus }>('/api/v1/auth/admin-portal-status').subscribe({
      next: (res) => {
        this.isLoadingStatus.set(false);
        if (res?.data) {
          this.portalStatus.set(res.data);
          if (
            this.portalMode() === 'teacher' &&
            !res.data.teacherCodeSet &&
            res.data.teacherGoogleSet
          ) {
            this.teacherTab.set('google');
          }
        }
      },
      error: () => {
        this.isLoadingStatus.set(false);
      }
    });
  }

  close(): void {
    this.resetFormState();
    this.isOpen.set(false);
    this.modalNav.dismissModal(this.modalId);
  }

  isTeacherFirstTimeSetup(): boolean {
    const status = this.portalStatus();
    return this.portalMode() === 'teacher' && !status.teacherCodeSet && !status.teacherGoogleSet;
  }

  isDevFirstTimeSetup(): boolean {
    return this.portalMode() === 'developer' && !this.portalStatus().devCodeSet;
  }

  submitCode(): void {
    const code = this.accessCodeInput().trim();
    if (code.length < 4) {
      this.errorMessage.set(
        this.langService.isArabic()
          ? 'الكود السري يجب أن لا يقل عن 4 أحرف.'
          : 'Access code must be at least 4 characters.'
      );
      return;
    }

    const isSetup = this.portalMode() === 'developer'
      ? this.isDevFirstTimeSetup()
      : this.isTeacherFirstTimeSetup();

    if (isSetup) {
      const confirm = this.confirmCodeInput().trim();
      if (code !== confirm) {
        this.errorMessage.set(
          this.langService.isArabic()
            ? 'كلمتا المرور غير متطابقتين.'
            : 'Access codes do not match.'
        );
        return;
      }
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const endpoint = this.portalMode() === 'developer'
      ? (isSetup ? '/api/v1/auth/dev-setup-code' : '/api/v1/auth/admin-login')
      : (isSetup ? '/api/v1/auth/teacher-setup-code' : '/api/v1/auth/admin-login');

    const payload = isSetup
      ? { accessCode: code }
      : { accessCode: code, mode: this.portalMode() === 'developer' ? 'dev' : 'teacher' };

    this.http.post<{ success: boolean; data: { token: string; user: any } }>(endpoint, payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res?.data?.token && res?.data?.user) {
          this.completeAdminSession(res.data.token, res.data.user);
        } else {
          this.errorMessage.set(
            this.langService.isArabic() ? 'تعذر تسجيل الدخول.' : 'Authentication failed.'
          );
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err?.error?.error?.message || err?.error?.message;
        this.errorMessage.set(
          typeof msg === 'string' && msg.trim()
            ? msg
            : (this.langService.isArabic() ? 'كود الدخول غير صحيح.' : 'Invalid access code.')
        );
      }
    });
  }

  async triggerTeacherGoogleLogin(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    this.errorMessage.set(null);

    const win = window as any;
    if (typeof win.google === 'undefined' || !win.google?.accounts?.oauth2) {
      const loaded = await ensureGoogleGsiScriptLoaded();
      if (!loaded || !win.google?.accounts?.oauth2) {
        this.errorMessage.set(
          this.langService.isArabic()
            ? 'تعذر الاتصال بخدمة Google. تحقق من الإنترنت وأعد المحاولة.'
            : 'Failed to connect to Google Sign-In.'
        );
        return;
      }
    }

    try {
      const client = win.google.accounts.oauth2.initTokenClient({
        client_id: SPIDER_GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        prompt: 'select_account',
        callback: (response: any) => {
          if (response?.error) {
            if (response.error !== 'popup_closed_by_user') {
              this.errorMessage.set(
                this.langService.isArabic()
                  ? 'تعذر تسجيل الدخول عبر Google.'
                  : 'Google Sign-In failed.'
              );
            }
            return;
          }
          if (response?.access_token) {
            this.verifyTeacherGoogleToken(response.access_token);
          }
        }
      });

      client.requestAccessToken({ prompt: 'select_account' });
    } catch {
      this.errorMessage.set(
        this.langService.isArabic() ? 'تعذر فتح نافذة Google.' : 'Unable to open Google sign-in popup.'
      );
    }
  }

  verifyTeacherGoogleToken(accessToken: string): void {
    this.isGoogleAuthenticating.set(true);
    this.errorMessage.set(null);

    this.http
      .post<{ success: boolean; data: { token: string; user: any } }>(
        '/api/v1/auth/teacher-google-login',
        { idToken: accessToken }
      )
      .subscribe({
        next: (res) => {
          this.isGoogleAuthenticating.set(false);
          if (res?.data?.token && res?.data?.user) {
            this.completeAdminSession(res.data.token, res.data.user);
          } else {
            this.errorMessage.set(
              this.langService.isArabic() ? 'تعذر التحقق من حساب Google.' : 'Google verification failed.'
            );
          }
        },
        error: (err) => {
          this.isGoogleAuthenticating.set(false);
          const msg = err?.error?.error?.message || err?.error?.message;
          this.errorMessage.set(
            typeof msg === 'string' && msg.trim()
              ? msg
              : (this.langService.isArabic()
                  ? 'حساب Google هذا غير مصرح له بالدخول كمعلمة.'
                  : 'This Google account is not authorized for teacher login.')
          );
        }
      });
  }

  private completeAdminSession(token: string, user: any): void {
    this.authService.setPendingDeviceApproval(false);
    this.authService.setSession(token, user);
    this.close();
    this.router.navigateByUrl('/admin');
  }
}
