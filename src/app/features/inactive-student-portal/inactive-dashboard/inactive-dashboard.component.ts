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
import { Router, RouterLink } from '@angular/router';
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
  imports: [CommonModule, RouterLink, TranslocoPipe, AppIconComponent],
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
  readonly haCode = computed(() => this.student()?.student_ha_code ?? '—');
  readonly studentName = computed(() => this.student()?.full_name ?? (this.langService.isArabic() ? 'طالب سبايدر ماث' : 'Spider Math Student'));
  readonly curriculum = computed<CurriculumCode>(() => (this.student()?.curriculum as CurriculumCode) ?? 'EGYPTIAN');
  readonly gradeLevel = computed<string>(() => this.student()?.grade_level ?? '—');
  readonly term = computed<AcademicTermCode>(() => (this.student()?.academic_term as AcademicTermCode) ?? 'TERM_1');

  // UI Interactive States
  readonly isCopied = signal<boolean>(false);
  readonly activeTrialLecture = signal<ITrialLecture | null>(null);
  readonly unitPackages = signal<IUnitPackageItem[]>([]);
  readonly isLoadingUnits = signal<boolean>(true);
  readonly subscribingUnitId = signal<string | null>(null);

  // Placement Exam Diagnostic Report (Pure Database Driven)
  readonly placementReport = signal<IPlacementReportSummary | null>(null);
  readonly isLoadingPlacement = signal<boolean>(true);

  private readonly http = inject(HttpClient);

  // Active Grades check
  readonly activeGrades = signal<string[]>(['SEC_3']);
  readonly isCurrentGradeActive = computed(() => this.activeGrades().includes(this.gradeLevel()));

  // Free Trial Lectures (dynamically populated from real units)
  readonly trialLectures = signal<ITrialLecture[]>([]);

  ngOnInit(): void {
    this.loadActiveGrades();
    this.loadUnitPackages();
    this.loadMyPlacementAttempt();
  }

  loadMyPlacementAttempt(): void {
    this.isLoadingPlacement.set(true);
    this.http.get<{ success: boolean; data: any }>('/api/v1/public/placement-test/my-attempt').subscribe({
      next: (res) => {
        this.isLoadingPlacement.set(false);
        const attempt = res?.data;
        if (!attempt) {
          this.placementReport.set(null);
          return;
        }

        const scorePct = attempt.scorePercentage ?? attempt.score_percentage ?? 0;
        const badge = attempt.academicLevelBadge ?? attempt.academic_level_badge ?? 'GOOD';

        let badgeAr = 'مستوى متقدم — عبقري رياضيات (Advanced Mastery)';
        let badgeEn = 'Advanced Mastery — Math Genius';
        let recAr = 'مستوى الطالب يؤهله لتحقيق الدرجة النهائية بإذن الله. ننصح بالبدء فوراً بالوحدة الأولى والتركيز على ورش العمل التطبيقية مع م/ هبة.';
        let recEn = 'Excellent algebraic intuition. Enrolling in Unit 1 will bridge trigonometry gaps and solidify speed tactics.';

        if (badge === 'EXCELLENT' || scorePct >= 85) {
          badgeAr = 'مستوى متقدم — عبقري رياضيات (Advanced Mastery)';
          badgeEn = 'Advanced Mastery — Math Genius';
          recAr = 'مستوى الطالب يؤهله لتحقيق الدرجة النهائية بإذن الله. ننصح بالبدء فوراً بالوحدة الأولى والتركيز على ورش العمل التطبيقية مع م/ هبة.';
          recEn = 'Excellent algebraic intuition. Enrolling in Unit 1 will bridge trigonometry gaps and solidify speed tactics.';
        } else if (badge === 'GOOD' || scorePct >= 65) {
          badgeAr = 'مستوى جيد جداً ومتمكن (Proficient)';
          badgeEn = 'Proficient Mastery';
          recAr = 'أداء متميز مع استيعاب جيد جداً للمفاهيم الرياضية الأساسية، وبعض الجزئيات تحتاج إلى تدريب وتطبيق مكثف مع م/ هبة.';
          recEn = 'Good conceptual understanding. Focus on problem sets and speed optimization with Eng. Heba.';
        } else if (badge === 'NEEDS_REVISION' || scorePct >= 50) {
          badgeAr = 'يحتاج إلى مراجعة وتثبيت المفاهيم (Needs Revision)';
          badgeEn = 'Needs Concept Revision';
          recAr = 'ينصح بالتركيز على مراجعة الأساسيات وحضور الحصص التأسيسية لردم الفجوات الرياضية والتفوق.';
          recEn = 'Core foundations require targeted revision. Participating in fundamentals sessions will close knowledge gaps.';
        } else {
          badgeAr = 'تأسيس مكثف مطلوب (Foundation Required)';
          badgeEn = 'Foundation Required';
          recAr = 'يحتاج الطالب إلى مسار تأسيسي مخصص لتثبيت القواعد الأساسية، وفريق م/ هبة جاهز لدعمه خطوة بخطوة.';
          recEn = 'Intensive foundational drills are recommended to build confidence and essential mathematical mastery.';
        }

        const sw = attempt.strengthsWeaknesses || attempt.strengths_weaknesses || {};
        const strengths = Array.isArray(sw.strong_topics) && sw.strong_topics.length > 0
          ? sw.strong_topics
          : ['الجبر والعمليات الرياضية الأساسية', 'القدرة على استيعاب الأسئلة التحليلية'];
        const weaknesses = Array.isArray(sw.weak_topics) && sw.weak_topics.length > 0
          ? sw.weak_topics
          : ['المسائل المركبة متعددة الخطوات', 'إدارة الوقت وحيل السرعة'];

        this.placementReport.set({
          score: attempt.correctCount ?? attempt.correct_count ?? Math.round(scorePct),
          percentage: scorePct,
          academicLevelBadgeAr: badgeAr,
          academicLevelBadgeEn: badgeEn,
          strengths,
          weaknesses,
          teacherRecommendationAr: recAr,
          teacherRecommendationEn: recEn
        });
      },
      error: () => {
        this.isLoadingPlacement.set(false);
        this.placementReport.set(null);
      }
    });
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
