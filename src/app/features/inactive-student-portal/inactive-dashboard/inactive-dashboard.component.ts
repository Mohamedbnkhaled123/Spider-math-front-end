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

  // Free Trial Lectures (is_free_trial: true)
  readonly trialLectures = computed<ITrialLecture[]>(() => {
    const curr = this.curriculum();
    const grade = this.gradeLevel();
    const t = this.term();

    return [
      {
        _id: 'trial_lec_1',
        titleAr: 'المحاضرة التمهيدية الأولى: أسرار التميز وحل المسائل بحاسبة ديسموس',
        titleEn: 'Masterclass 1: Speed Tactics & Interactive Desmos Calculator',
        durationMinutes: 45,
        curriculum: curr,
        gradeLevel: grade,
        academicTerm: t,
        is_free_trial: true,
        videoEmbedId: 'dQw4w9WgXcQ',
        descriptionAr: 'حصة مجانية تمهيدية تشرح استراتيجيات التفكير الرياضي السريع وكيفية رسم المنحنيات باللمس.',
        descriptionEn: 'Introductory free lesson demonstrating lightning-fast curve sketching and algebraic insights.'
      },
      {
        _id: 'trial_lec_2',
        titleAr: 'المحاضرة التمهيدية الثانية: تفكيك المسائل المركبة والتطبيقات الهندسية',
        titleEn: 'Masterclass 2: Complex Problem Deconstruction',
        durationMinutes: 40,
        curriculum: curr,
        gradeLevel: grade,
        academicTerm: t,
        is_free_trial: true,
        videoEmbedId: 'dQw4w9WgXcQ',
        descriptionAr: 'شرح مجاني لنماذج أسئلة امتحانات الوزارة والربط بين قوانين الجبر والهندسة الفراغية.',
        descriptionEn: 'Free masterclass analyzing high-yield exam questions and vector spatial foundations.'
      }
    ];
  });

  ngOnInit(): void {
    this.loadUnitPackages();
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
