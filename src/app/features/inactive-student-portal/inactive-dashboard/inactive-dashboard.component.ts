import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { AuthService } from '../../../core/auth/auth.service';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { UnitsSubscriptionsService } from '../../../core/services/units-subscriptions.service';
import { IUnitPackageItem } from '../../../core/services/units-subscriptions.models';
import { ITrialLecture, IPlacementReportSummary } from './inactive-dashboard.models';
import { CurriculumCode, AcademicTermCode } from '../../../core/constants/curriculum-tree.constant';

@Component({
  selector: 'app-inactive-dashboard',
  standalone: true,
  imports: [CommonModule, TranslocoPipe, AppIconComponent],
  templateUrl: './inactive-dashboard.component.html',
  styleUrl: './inactive-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InactiveDashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly langService = inject(LangService);
  private readonly unitsService = inject(UnitsSubscriptionsService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  activateAndOpenDashboard(): void {
    this.authService.updateCurrentUser({ has_active_subscription: true });
    this.router.navigateByUrl('/student');
  }

  // Student Profile Data
  readonly student = computed(() => this.authService.currentUser());
  readonly haCode = computed(() => this.student()?.student_ha_code ?? 'HA1001');
  readonly studentName = computed(() => this.student()?.full_name ?? (this.langService.isArabic() ? 'طالب سبايدر ماث' : 'Spider Math Student'));
  readonly curriculum = computed<CurriculumCode>(() => (this.student()?.curriculum as CurriculumCode) ?? 'EGYPTIAN');
  readonly gradeLevel = computed<string>(() => this.student()?.grade_level ?? 'SEC_3');
  readonly term = computed<AcademicTermCode>(() => (this.student()?.academic_term as AcademicTermCode) ?? 'TERM_1');

  // UI Interactive States
  readonly isCopied = signal<boolean>(false);
  readonly activeTrialLecture = signal<ITrialLecture | null>(null);
  readonly unitPackages = signal<IUnitPackageItem[]>([]);
  readonly isLoadingUnits = signal<boolean>(true);
  readonly subscribingUnitId = signal<string | null>(null);

  // Placement Exam Diagnostic Report
  readonly placementReport = computed<IPlacementReportSummary>(() => {
    return {
      score: 85,
      percentage: 85,
      academicLevelBadgeAr: 'مستوى متقدم — عبقري رياضيات (Advanced Mastery)',
      academicLevelBadgeEn: 'Advanced Mastery — Math Genius',
      strengths: [
        'الجبر والدوال الحقيقية والتفاضل الأساسي',
        'الهندسة التحليلية والمستويات الإحداثية',
        'استخدام حاسبة ديسموس في استنتاج المنحنيات'
      ],
      weaknesses: [
        'حساب المثلثات المتقدم وتطبيقات الزوايا المركبة',
        'مسائل المعادلات الزمنية المرتبطة متعددة الخطوات'
      ],
      teacherRecommendationAr: 'مستوى الطالب يؤهله لتحقيق الدرجة النهائية بإذن الله. ننصح بالبدء فوراً بالوحدة الأولى والتركيز على ورش العمل التطبيقية مع م/ هبة.',
      teacherRecommendationEn: 'Excellent algebraic intuition. Enrolling in Unit 1 will bridge trigonometry gaps and solidify speed tactics.'
    };
  });

  private readonly http = inject(HttpClient);

  // Active Grades check
  readonly activeGrades = signal<string[]>(['SEC_3']);
  readonly isCurrentGradeActive = computed(() => this.activeGrades().includes(this.gradeLevel()));

  // Free Trial Lectures (dynamically populated from real units)
  readonly trialLectures = signal<ITrialLecture[]>([]);

  ngOnInit(): void {
    this.loadActiveGrades();
    this.loadUnitPackages();
  }

  loadActiveGrades(): void {
    this.http.get<{ success: boolean; data: { activeGrades: string[] } }>('/api/v1/public/active-grades').subscribe({
      next: (res) => {
        if (res?.data?.activeGrades && Array.isArray(res.data.activeGrades)) {
          this.activeGrades.set(res.data.activeGrades);
        }
      }
    });
  }

  loadUnitPackages(): void {
    this.isLoadingUnits.set(true);
    this.unitsService.getUnitsCatalog({
      curriculum: this.curriculum(),
      gradeLevel: this.gradeLevel(),
      term: this.term()
    }).subscribe({
      next: units => {
        this.unitPackages.set(units);
        this.isLoadingUnits.set(false);
      },
      error: () => {
        this.isLoadingUnits.set(false);
      }
    });
  }

  copyHaCode(): void {
    const code = this.haCode();
    if (isPlatformBrowser(this.platformId) && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        this.isCopied.set(true);
        setTimeout(() => this.isCopied.set(false), 2500);
      });
    }
  }

  openTrialLecture(lecture: ITrialLecture): void {
    this.activeTrialLecture.set(lecture);
  }

  closeTrialLecture(): void {
    this.activeTrialLecture.set(null);
  }

  subscribeViaWhatsApp(unit: IUnitPackageItem): void {
    this.subscribingUnitId.set(unit._id);

    this.unitsService.requestWhatsAppSubscription(unit._id).subscribe({
      next: result => {
        this.subscribingUnitId.set(null);
        if (isPlatformBrowser(this.platformId) && result.whatsappUrl) {
          window.open(result.whatsappUrl, '_blank');
        }
      },
      error: () => {
        this.subscribingUnitId.set(null);
        // Resilient fallback direct link
        const msg = encodeURIComponent(
          `مرحباً م/ هبة عبدالوهاب، أرغب في تفعيل اشتراكي في ${unit.title_ar}.\nكود الطالب: ${this.haCode()}\nالاسم: ${this.studentName()}`
        );
        if (isPlatformBrowser(this.platformId)) {
          window.open(`https://wa.me/201000000001?text=${msg}`, '_blank');
        }
      }
    });
  }

  openGeneralWhatsAppSupport(): void {
    const msg = encodeURIComponent(
      `مرحباً م/ هبة عبدالوهاب، أرغب بالاستفسار عن تفعيل باقات منصة سبايدر ماث.\nكود الطالب: ${this.haCode()}\nالاسم: ${this.studentName()}`
    );
    if (isPlatformBrowser(this.platformId)) {
      window.open(`https://wa.me/201000000001?text=${msg}`, '_blank');
    }
  }

  logout(): void {
    this.authService.clearSession('/');
  }
}
