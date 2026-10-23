import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { AuthService } from '../../../core/auth/auth.service';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { ITrialLecture } from './inactive-dashboard.models';
import { CurriculumCode, AcademicTermCode } from '../../../core/constants/curriculum-tree.constant';

@Component({
  selector: 'app-inactive-dashboard',
  standalone: true,
  imports: [CommonModule, TranslocoPipe, AppIconComponent],
  templateUrl: './inactive-dashboard.component.html',
  styleUrl: './inactive-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InactiveDashboardComponent {
  readonly authService = inject(AuthService);
  readonly langService = inject(LangService);

  readonly student = computed(() => this.authService.currentUser());
  readonly haCode = computed(() => this.student()?.student_ha_code ?? 'HA-PENDING');
  readonly studentName = computed(() => this.student()?.full_name ?? (this.langService.isArabic() ? 'طالب سبايدر ماث' : 'Spider Math Student'));
  readonly curriculum = computed<CurriculumCode>(() => (this.student()?.curriculum as CurriculumCode) ?? 'EGYPTIAN');
  readonly gradeLevel = computed<string>(() => this.student()?.grade_level ?? 'SEC_3');
  readonly term = computed<AcademicTermCode>(() => (this.student()?.academic_term as AcademicTermCode) ?? 'TERM_1');

  // Matched Free Trial Lectures for this student's (curriculum, gradeLevel, academicTerm)
  readonly trialLectures = computed<ITrialLecture[]>(() => {
    const curr = this.curriculum();
    const grade = this.gradeLevel();
    const t = this.term();

    return [
      {
        _id: 'trial_lec_1',
        titleAr: 'المحاضرة التمهيدية المجانية: أساسيات واستراتيجيات التميز',
        titleEn: 'Free Introductory Masterclass: Core Fundamentals',
        durationMinutes: 45,
        curriculum: curr,
        gradeLevel: grade,
        academicTerm: t,
        descriptionAr: 'شرح تمهيدي مفصل يوضح خرائط المنهج وحل مسائل نموذجية باستخدام حاسبة ديسموس.',
        descriptionEn: 'Introductory lecture demonstrating syllabus blueprints and Desmos speed tactics.'
      },
      {
        _id: 'trial_lec_2',
        titleAr: 'حل نماذج الامتحانات الاسترشادية وبنك الأسئلة الذكي',
        titleEn: 'Sample Practice Workouts & Smart Question Bank',
        durationMinutes: 40,
        curriculum: curr,
        gradeLevel: grade,
        academicTerm: t,
        descriptionAr: 'تدريب تطبيقي على أفكار المسائل المركبة التي تتكرر في الاختبارات الرسمية.',
        descriptionEn: 'High-yield practical problem solving covering recurring exam patterns.'
      }
    ];
  });

  openWhatsAppSubscription(): void {
    const code = this.haCode();
    const name = this.studentName();
    const curr = this.curriculum();
    const grade = this.gradeLevel();
    const term = this.term();

    const message = encodeURIComponent(
      `مرحباً م/ هبة عبدالوهاب، أرغب في تفعيل اشتراكي الأكاديمي على منصة سبايدر ماث.\nكود الطالب: ${code}\nالاسم: ${name}\nالمسار: ${curr} (${grade} - ${term})`
    );

    window.open(`https://wa.me/201000000000?text=${message}`, '_blank');
  }

  logout(): void {
    this.authService.clearSession('/');
  }
}
