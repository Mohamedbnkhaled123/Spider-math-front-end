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
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { AuthService } from '../../../core/auth/auth.service';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { UnitsSubscriptionsService } from '../../../core/services/units-subscriptions.service';
import { PublicDiscoveryService } from '../../../core/services/public-discovery.service';
import { IUnitPackageItem } from '../../../core/services/units-subscriptions.models';
import { ITrialLecture, IPlacementReportSummary } from './inactive-dashboard.models';
import { CurriculumCode, AcademicTermCode, curriculumHasTerms } from '../../../core/constants/curriculum-tree.constant';
import {
  getUnitMathTheme,
  isUnitContentEmpty
} from '../../../core/utils/unit-math-art.util';
import { SwrCacheService } from '../../../core/services/swr-cache.service';

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
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly unitsService = inject(UnitsSubscriptionsService);
  private readonly discoveryService = inject(PublicDiscoveryService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly swrCache = inject(SwrCacheService);

  // Dynamic Contact Channels from CMS
  readonly landingData = toSignal(this.discoveryService.getLandingData(), { initialValue: null });
  readonly teacherWhatsAppNumber = computed(() => {
    return this.landingData()?.whatsappSupportNumber ||
      this.landingData()?.contactChannels?.subscription_whatsapp ||
      this.landingData()?.contactChannels?.support_whatsapp ||
      '';
  });

  activateAndOpenDashboard(): void {
    this.authService.updateCurrentUser({ has_active_subscription: true });
    this.router.navigateByUrl('/student');
  }

  openPlacementDiscussionWhatsApp(): void {
    const phone = this.teacherWhatsAppNumber().replace(/[^0-9]/g, '');
    const rep = this.placementReport();
    const scoreText = rep ? `بنسبة (${rep.percentage}%)` : '';
    const msg = encodeURIComponent(
      `مرحباً م/ هبة عبدالوهاب، أنا الطالب (${this.studentName()}) كود: (${this.haCode()})، سلمت امتحان تحديد المستوى ${scoreText} وأرغب في معرفة تقييمك لمستواي وتحديد ما أحتاجه والوحدة المناسبة لي.`
    );
    if (isPlatformBrowser(this.platformId)) {
      const targetPhone = phone || '201000000001';
      window.open(`https://wa.me/${targetPhone}?text=${msg}`, '_blank');
    }
  }

  // Student Profile Data
  readonly student = computed(() => this.authService.currentUser());
  readonly haCode = computed(() => this.student()?.student_ha_code ?? '—');
  readonly studentName = computed(() => this.student()?.full_name ?? (this.langService.isArabic() ? 'طالب سبايدر ماث' : 'Spider Math Student'));
  readonly curriculum = computed<CurriculumCode>(() => (this.student()?.curriculum as CurriculumCode) ?? 'EGYPTIAN');
  readonly gradeLevel = computed<string>(() => this.student()?.grade_level ?? '—');
  readonly term = computed<AcademicTermCode>(() => (this.student()?.academic_term as AcademicTermCode) ?? 'TERM_1');
  readonly hasAcademicTerms = computed<boolean>(() => curriculumHasTerms(this.curriculum()));

  // UI Interactive States
  readonly isCopied = signal<boolean>(false);
  readonly activeTrialLecture = signal<ITrialLecture | null>(null);
  readonly unitPackages = signal<IUnitPackageItem[]>([]);
  readonly isLoadingUnits = signal<boolean>(true);
  readonly subscribingUnitId = signal<string | null>(null);

  // Coming Soon Modal & Toast State (When clicking on empty units)
  readonly showComingSoonModal = signal<boolean>(false);
  readonly comingSoonUnitTitle = signal<string>('');
  readonly toastMessage = signal<string | null>(null);

  getUnitMathArt(unit: any, idx: number) {
    return getUnitMathTheme(unit, idx);
  }

  isUnitEmpty(unit: any): boolean {
    return isUnitContentEmpty(unit);
  }

  hasDiscount(unit: any): boolean {
    if (!unit) return false;
    const orig = unit.original_price_egp ?? unit.originalPriceEgp;
    const price = unit.price_egp ?? unit.priceEgp ?? 0;
    return !!(
      unit.is_discounted ||
      unit.isDiscounted ||
      (orig && orig > price) ||
      (unit.discount_percentage && unit.discount_percentage > 0) ||
      (unit.discountPercentage && unit.discountPercentage > 0)
    );
  }

  getDiscountPct(unit: any): number {
    if (!unit) return 0;
    if (unit.discount_percentage && unit.discount_percentage > 0) return unit.discount_percentage;
    if (unit.discountPercentage && unit.discountPercentage > 0) return unit.discountPercentage;
    const orig = unit.original_price_egp ?? unit.originalPriceEgp;
    const price = unit.price_egp ?? unit.priceEgp ?? 0;
    if (orig && orig > price) {
      return Math.round(((orig - price) / orig) * 100);
    }
    return 0;
  }

  getOriginalPrice(unit: any): number {
    if (!unit) return 0;
    const orig = unit.original_price_egp ?? unit.originalPriceEgp;
    if (orig) return orig;
    const price = unit.price_egp ?? unit.priceEgp ?? 0;
    const pct = unit.discount_percentage ?? unit.discountPercentage;
    if (price && pct && pct < 100) {
      return Math.round(price / (1 - pct / 100));
    }
    return 0;
  }

  handleUnitCardClick(unit: any): void {
    if (this.isUnitEmpty(unit)) {
      this.triggerComingSoon(unit?.title_ar || unit?.title_en);
    }
  }

  triggerComingSoon(unitTitle?: string): void {
    const title = unitTitle || (this.langService.isArabic() ? 'الوحدة الدراسية' : 'Study Unit');
    this.comingSoonUnitTitle.set(title);
    this.showComingSoonModal.set(true);
    const toast = this.langService.isArabic()
      ? `⏳ قريباً — محتوى "${title}" قيد الإعداد والتسجيل بإشراف م/ هبة عبدالوهاب!`
      : `⏳ Coming Soon — "${title}" is being prepared by Eng. Heba Abdel-Wahab!`;
    this.toastMessage.set(toast);
    setTimeout(() => {
      if (this.toastMessage() === toast) {
        this.toastMessage.set(null);
      }
    }, 4500);
  }

  closeComingSoonModal(): void {
    this.showComingSoonModal.set(false);
  }

  // Placement Exam Diagnostic Report (Pure Database Driven)
  readonly placementReport = signal<IPlacementReportSummary | null>(null);
  readonly isLoadingPlacement = signal<boolean>(true);

  private readonly http = inject(HttpClient);

  // Active Grades check
  readonly activeGrades = signal<string[]>(['SEC_3']);
  readonly isCurrentGradeActive = computed(() => this.activeGrades().includes(this.gradeLevel()));

  // Free Trial Lectures (defaults with real units override)
  readonly trialLectures = signal<ITrialLecture[]>([
    {
      _id: 'trial_lec_1',
      titleAr: 'المحاضرة التمهيدية المجانية: أساسيات واستراتيجيات التميز',
      titleEn: 'Free Introductory Masterclass: Core Fundamentals',
      durationMinutes: 45,
      curriculum: 'EGYPTIAN',
      gradeLevel: 'SEC_3',
      academicTerm: 'TERM_1',
      descriptionAr: 'شرح تمهيدي مفصل يوضح خرائط المنهج وحل مسائل نموذجية باستخدام حاسبة ديسموس.',
      descriptionEn: 'Introductory lecture demonstrating syllabus blueprints and Desmos speed tactics.',
      is_free_trial: true
    },
    {
      _id: 'trial_lec_2',
      titleAr: 'حل نماذج الامتحانات الاسترشادية وبنك الأسئلة الذكي',
      titleEn: 'Sample Practice Workouts & Smart Question Bank',
      durationMinutes: 40,
      curriculum: 'EGYPTIAN',
      gradeLevel: 'SEC_3',
      academicTerm: 'TERM_1',
      descriptionAr: 'تدريب تطبيقي على أفكار المسائل المركبة التي تتكرر في الاختبارات الرسمية.',
      descriptionEn: 'High-yield practical problem solving covering recurring exam patterns.',
      is_free_trial: true
    }
  ]);

  ngOnInit(): void {
    this.loadActiveGrades();
    this.loadUnitPackages();
    this.loadMyPlacementAttempt();
  }

  loadMyPlacementAttempt(): void {
    const cachedAttempt = this.swrCache.get<IPlacementReportSummary>('inactive_my_placement');
    if (cachedAttempt) {
      this.placementReport.set(cachedAttempt);
      this.isLoadingPlacement.set(false);
    } else {
      this.isLoadingPlacement.set(true);
    }

    this.http.get<{ success: boolean; data: any }>('/api/v1/public/placement-test/my-attempt').subscribe({
      next: (res) => {
        this.isLoadingPlacement.set(false);
        const attempt = res?.data;
        if (!attempt) {
          if (!this.swrCache.has('inactive_my_placement')) {
            this.placementReport.set(null);
          }
          return;
        }

        const scorePct = attempt.scorePercentage ?? attempt.score_percentage ?? 0;
        const correct = attempt.correctCount ?? attempt.correct_count ?? Math.round(scorePct);

        const summary: IPlacementReportSummary = {
          score: correct,
          percentage: scorePct,
          academicLevelBadgeAr: `${scorePct}%`,
          academicLevelBadgeEn: `${scorePct}%`,
          strengths: [],
          weaknesses: [],
          teacherRecommendationAr: '',
          teacherRecommendationEn: ''
        };
        this.placementReport.set(summary);
        this.swrCache.set('inactive_my_placement', summary);
      },
      error: () => {
        this.isLoadingPlacement.set(false);
        if (!this.swrCache.has('inactive_my_placement')) {
          this.placementReport.set(null);
        }
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
    const unitsKey = `inactive_units_${this.curriculum()}_${this.gradeLevel()}_${this.term()}`;
    const cachedUnits = this.swrCache.get<IUnitPackageItem[]>(unitsKey);
    if (cachedUnits && cachedUnits.length > 0) {
      this.unitPackages.set(cachedUnits);
      this.isLoadingUnits.set(false);
    } else {
      this.isLoadingUnits.set(true);
    }

    this.unitsService.getUnitsCatalog({
      curriculum: this.curriculum(),
      gradeLevel: this.gradeLevel(),
      ...(this.hasAcademicTerms() ? { term: this.term() } : {})
    }).subscribe({
      next: units => {
        const list = units || [];
        this.unitPackages.set(list);
        this.swrCache.set(unitsKey, list);
        this.isLoadingUnits.set(false);
      },
      error: () => {
        if (!this.swrCache.has(unitsKey)) {
          this.unitPackages.set([]);
        }
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

  async logout(): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm({
      title: this.langService.isArabic() ? 'تأكيد تسجيل الخروج' : 'Confirm Logout',
      message: this.langService.isArabic()
        ? 'هل أنت متأكد من رغبتك في تسجيل الخروج من حسابك؟'
        : 'Are you sure you want to log out of your account?',
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
