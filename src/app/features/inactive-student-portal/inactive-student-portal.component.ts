import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';
import { AuthService } from '../../core/auth/auth.service';
import { LangService } from '../../core/seo-theme-i18n/lang.service';

@Component({
  selector: 'app-inactive-student-portal',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  templateUrl: './inactive-student-portal.component.html',
  styleUrl: './inactive-student-portal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InactiveStudentPortalComponent {
  readonly authService = inject(AuthService);
  readonly langService = inject(LangService);

  openWhatsAppSubscription(): void {
    const student = this.authService.currentUser();
    const haCode = student?.student_ha_code ?? 'HA-PENDING';
    const name = student?.full_name ?? 'طالب جديد';
    const curriculum = student?.curriculum ?? 'EGYPTIAN';
    const grade = student?.grade_level ?? 'SEC_3';

    const message = encodeURIComponent(
      `مرحباً م/ هبة عبدالوهاب، أرغب في تفعيل اشتراكي على منصة سبايدر ماث.\nكود الطالب: ${haCode}\nالاسم: ${name}\nالمنهج: ${curriculum}\nالصف: ${grade}`
    );

    window.open(`https://wa.me/201000000000?text=${message}`, '_blank');
  }
}
