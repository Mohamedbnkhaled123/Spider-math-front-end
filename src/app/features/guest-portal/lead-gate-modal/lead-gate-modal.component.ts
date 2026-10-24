import {
  Component,
  ChangeDetectionStrategy,
  signal,
  input,
  output,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { PublicDiscoveryService } from '../../../core/services/public-discovery.service';
import { IUnlockPlacementResult } from '../../../core/services/public-discovery.models';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';

@Component({
  selector: 'app-lead-gate-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoPipe, AppIconComponent],
  templateUrl: './lead-gate-modal.component.html',
  styleUrl: './lead-gate-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeadGateModalComponent {
  private readonly discoveryService = inject(PublicDiscoveryService);
  private readonly router = inject(Router);
  readonly langService = inject(LangService);

  // Inputs
  readonly attemptId = input.required<string>();
  readonly isOpen = input<boolean>(false);
  readonly initialScore = input<number>(0);
  readonly totalQuestions = input<number>(5);
  readonly curriculum = input<string>('EGYPTIAN');
  readonly gradeLevel = input<string>('SEC_3');
  readonly academicTerm = input<string>('TERM_1');

  // Outputs
  readonly closed = output<void>();
  readonly unlocked = output<IUnlockPlacementResult>();

  // Form Signals
  readonly fullName = signal<string>('');
  readonly phone = signal<string>('');
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly unlockedResult = signal<IUnlockPlacementResult | null>(null);

  closeModal(): void {
    this.closed.emit();
  }

  submitUnlock(): void {
    const name = this.fullName().trim();
    const phone = this.phone().trim();

    if (!name || name.length < 3) {
      this.errorMessage.set(
        this.langService.isArabic()
          ? 'يرجى كتابة اسم الطالب ثلاثياً (٣ أحرف على الأقل)'
          : 'Please enter student full name (minimum 3 characters)'
      );
      return;
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      this.errorMessage.set(
        this.langService.isArabic()
          ? 'يرجى إدخال رقم هاتف واتساب صالح لتسليم تقرير التقييم'
          : 'Please enter a valid WhatsApp phone number'
      );
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.discoveryService.unlockPlacement(this.attemptId(), {
      fullName: name,
      phone: cleanPhone
    }).subscribe({
      next: result => {
        this.isSubmitting.set(false);
        this.unlockedResult.set(result);
        this.unlocked.emit(result);
      },
      error: err => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err?.error?.message ||
          (this.langService.isArabic() ? 'حدث خطأ أثناء فتح التقرير. يرجى المحاولة ثانية.' : 'Failed to unlock score report. Please retry.')
        );
      }
    });
  }

  triggerGoogleSignIn(): void {
    // One-click Google sign-in autofill simulation
    this.fullName.set('طالب متميز');
    this.phone.set('+201012345678');
    this.submitUnlock();
  }

  proceedToRegistration(): void {
    const res = this.unlockedResult();
    this.router.navigate(['/complete-profile'], {
      queryParams: {
        fullName: res?.fullName || this.fullName(),
        phone: res?.phone || this.phone(),
        curriculum: this.curriculum(),
        gradeLevel: this.gradeLevel(),
        academicTerm: this.academicTerm(),
        attemptId: this.attemptId()
      }
    });
  }
}
