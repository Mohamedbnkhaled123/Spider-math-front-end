import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { AuthService } from '../../../core/auth/auth.service';
import { DeviceFingerprintService } from '../../../core/auth/device-fingerprint.service';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-pending-device-approval',
  standalone: true,
  imports: [CommonModule, TranslocoPipe, AppIconComponent],
  templateUrl: './pending-device-approval.component.html',
  styleUrl: './pending-device-approval.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingDeviceApprovalComponent {
  readonly authService = inject(AuthService);
  readonly langService = inject(LangService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly fingerprintService = inject(DeviceFingerprintService);
  private readonly router = inject(Router);

  readonly isCheckingStatus = signal<boolean>(false);
  readonly deviceUuid = signal<string>(this.fingerprintService.getExistingDeviceUuidSync());

  checkApprovalStatus(): void {
    this.isCheckingStatus.set(true);
    setTimeout(() => {
      this.isCheckingStatus.set(false);
      if (!this.authService.isPendingDeviceApproval()) {
        this.router.navigate(['/student']);
      }
    }, 1200);
  }

  async logout(): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm({
      title: this.langService.isArabic() ? 'تأكيد تسجيل الخروج' : 'Confirm Logout',
      message: this.langService.isArabic()
        ? 'تسجيل الخروج من حسابك؟'
        : 'Log out of your account?',
      confirmLabel: this.langService.isArabic() ? 'تسجيل الخروج' : 'Log Out',
      cancelLabel: this.langService.isArabic() ? 'إلغاء' : 'Cancel',
      isDestructive: true,
      icon: 'log-out'
    });

    if (confirmed) {
      this.authService.clearSession('/');
    }
  }
}
