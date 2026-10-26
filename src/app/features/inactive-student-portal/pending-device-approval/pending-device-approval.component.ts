import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslocoPipe } from '@jsverse/transloco';

import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { AuthService } from '../../../core/auth/auth.service';
import { DeviceFingerprintService } from '../../../core/auth/device-fingerprint.service';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';

@Component({
  selector: 'app-pending-device-approval',
  standalone: true,
  imports: [CommonModule, TranslocoPipe, AppIconComponent],
  templateUrl: './pending-device-approval.component.html',
  styleUrl: './pending-device-approval.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingDeviceApprovalComponent implements OnInit, OnDestroy {
  readonly authService = inject(AuthService);
  readonly langService = inject(LangService);
  private readonly http = inject(HttpClient);
  private readonly fingerprintService = inject(DeviceFingerprintService);
  private readonly router = inject(Router);

  readonly isCheckingStatus = signal<boolean>(false);
  readonly deviceUuid = signal<string>(this.fingerprintService.getExistingDeviceUuidSync());
  readonly statusMessage = signal<string | null>(null);

  private pollIntervalId: any = null;

  ngOnInit(): void {
    // Initial check on mount
    this.checkApprovalStatus(false);

    // Auto-poll every 5 seconds to unlock immediately once approved by Eng. Heba
    this.pollIntervalId = setInterval(() => {
      this.checkApprovalStatus(false);
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }

  checkApprovalStatus(isManual = true): void {
    if (isManual) {
      this.isCheckingStatus.set(true);
      this.statusMessage.set(null);
    }

    this.http.get<{ success: boolean; data: any }>('/api/v1/auth/device-status').subscribe({
      next: (res) => {
        if (isManual) {
          this.isCheckingStatus.set(false);
        }

        if (res?.data?.isApproved) {
          // Device has been authorized by Eng. Heba!
          this.authService.setPendingDeviceApproval(false);
          if (res.data.token && res.data.user) {
            this.authService.setSession(res.data.token, res.data.user);
          }
          if (this.pollIntervalId) {
            clearInterval(this.pollIntervalId);
            this.pollIntervalId = null;
          }
          this.router.navigate(['/student']);
        } else if (isManual) {
          const msg = this.langService.isArabic()
            ? 'طلبك قيد مراجعة المهندسة هبة عبدالوهاب حالياً. سيتم التفعيل فور اعتماد الجهاز.'
            : 'Your request is currently awaiting authorization by Eng. Heba Abdel-Wahab.';
          this.statusMessage.set(msg);
        }
      },
      error: () => {
        if (isManual) {
          this.isCheckingStatus.set(false);
          const msg = this.langService.isArabic()
            ? 'تعذر التحقق من حالة الجهاز حالياً، يُرجى المحاولة بعد قليل.'
            : 'Unable to verify device status at this moment, please try again shortly.';
          this.statusMessage.set(msg);
        }
      }
    });
  }

  logout(): void {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
    }
    this.authService.clearSession('/');
  }
}
