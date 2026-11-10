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
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { CurriculumSelectorCardsComponent } from '../../../shared/components/curriculum-selector-cards/curriculum-selector-cards.component';
import { ProtectedYoutubePlayerComponent } from '../../../shared/components/protected-youtube-player/protected-youtube-player.component';
import { ICurriculumSelection } from '../../../shared/components/curriculum-selector-cards/curriculum-selector-cards.models';
import { PublicDiscoveryService } from '../../../core/services/public-discovery.service';
import {
  IPublicLandingData,
  IScheduleItem,
  IPricingPackage,
  IPlacementTestResponse
} from '../../../core/services/public-discovery.models';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { SeoMetaService } from '../../../core/seo-theme-i18n/seo-meta.service';
import { ThemeService } from '../../../core/seo-theme-i18n/theme.service';
import {
  CurriculumCode,
  AcademicTermCode,
  CANONICAL_CURRICULUM_TREE,
  ICurriculumNode,
  IGradeLevelMeta
} from '../../../core/constants/curriculum-tree.constant';
import { AuthService } from '../../../core/auth/auth.service';
import { FormsModule } from '@angular/forms';
import {
  getUnitMathTheme,
  isUnitContentEmpty
} from '../../../core/utils/unit-math-art.util';
import { TestimonialsService, TestimonialItem } from '../../../core/services/testimonials.service';
@Component({
  selector: 'app-landing-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AppIconComponent,
    CurriculumSelectorCardsComponent,
    ProtectedYoutubePlayerComponent
  ],
  templateUrl: './landing-home.component.html',
  styleUrl: './landing-home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingHomeComponent implements OnInit {
  private readonly discoveryService = inject(PublicDiscoveryService);
  private readonly seoMetaService = inject(SeoMetaService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  readonly langService = inject(LangService);
  readonly themeService = inject(ThemeService);
  readonly authService = inject(AuthService);
  private readonly testimonialsService = inject(TestimonialsService);

  // Testimonials State
  readonly testimonials = signal<TestimonialItem[]>([]);
  readonly isLoadingTestimonials = signal<boolean>(false);
  readonly isTestimonialModalOpen = signal<boolean>(false);
  readonly isSubmittingTestimonial = signal<boolean>(false);
  readonly testimonialReviewText = signal<string>('');
  readonly testimonialRating = signal<number>(5);
  readonly testimonialSubmitted = signal<boolean>(false);
  readonly testimonialSubmitError = signal<string | null>(null);

  readonly canSubmitTestimonial = computed<boolean>(() => {
    return this.authService.isAuthenticated() && (this.authService.isStudent() || this.authService.isParent());
  });
  // Authenticated Student State
  readonly isStudentLoggedIn = computed(() => this.authService.isAuthenticated() && this.authService.isStudent());
  readonly currentStudent = computed(() => this.authService.currentUser());
  readonly studentUnits = signal<any[]>([]);
  readonly isLoadingStudentUnits = signal<boolean>(false);
  readonly showFullCurriculumExplorer = signal<boolean>(false);

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

  handleStudentUnitClick(unit: any, event?: Event): void {
    if (this.isUnitEmpty(unit)) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      this.triggerComingSoon(unit?.title_ar || unit?.title_en || unit?.titleAr);
      return;
    }
    this.router.navigate(['/student/units', unit._id]);
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
  // User Selection State
  readonly selectedCurriculum = signal<CurriculumCode>('EGYPTIAN');
  readonly selectedGradeLevel = signal<string>('SEC_3');
  readonly selectedTerm = signal<AcademicTermCode>('TERM_1');
  readonly activeUnitTab = signal<'STUDY_UNIT' | 'FINAL_REVISION'>('STUDY_UNIT');
  // Landing Data Signal
  readonly landingData = signal<IPublicLandingData | null>(null);
  readonly isLoading = signal<boolean>(true);
  // Active Academic Term from CMS (Set by Admin, applies platform-wide)
  readonly activeAcademicTerm = computed<AcademicTermCode>(() => {
    return this.landingData()?.activeAcademicTerm || 'TERM_1';
  });
  readonly placementCurriculum = signal<CurriculumCode>('EGYPTIAN');
  readonly placementGrade = signal<string>('SEC_3');
  readonly placementTestInfo = signal<IPlacementTestResponse | null>(null);
  readonly isCheckingPlacement = signal<boolean>(false);
  readonly isPlacementModalOpen = signal<boolean>(false);
  readonly canonicalCurricula = CANONICAL_CURRICULUM_TREE;
  readonly placementAvailableGrades = computed<readonly IGradeLevelMeta[]>(() => {
    const curr = this.placementCurriculum();
    const node = CANONICAL_CURRICULUM_TREE.find(c => c.code === curr);
    return node ? node.grades : [];
  });
  // Hero Video State (Lite YouTube Facade: Unprotected Public Video controlled by Super Admin via CMS)
  readonly isHeroVideoPlaying = signal<boolean>(false);
  readonly heroRawVideoUrl = computed<string>(() => {
    return this.landingData()?.heroVideoUrl || 'https://www.youtube.com/watch?v=AOtzdDq7vrI';
  });
  readonly isHeroYouTube = computed<boolean>(() => {
    const url = this.heroRawVideoUrl();
    return !!(url && (url.includes('youtube.com') || url.includes('youtu.be')));
  });
  readonly heroYoutubeVideoId = computed<string | null>(() => {
    const raw = this.heroRawVideoUrl()?.trim();
    if (!raw) return null;
    return this.extractYouTubeId(raw);
  });
  readonly heroVideoThumbnailUrl = computed<string | null>(() => {
    const id = this.heroYoutubeVideoId();
    return id ? `https://i.ytimg.com/vi_webp/${id}/hqdefault.webp` : null;
  });
  readonly heroVideoSafeEmbedUrl = computed<SafeResourceUrl | null>(() => {
    const raw = this.heroRawVideoUrl()?.trim();
    if (!raw) return null;
    if (this.isHeroYouTube()) {
      const videoId = this.heroYoutubeVideoId();
      if (videoId) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
        );
      }

    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(raw);
  });
  playHeroPromoVideo(): void {
    this.isHeroVideoPlaying.set(true);
  }

  // Phase 2.2: Interactive Video Showcase & Chapters
  readonly activeVideoChapter = signal<number>(2);
  readonly videoChapters = computed(() => {
    const isAr = this.langService.isArabic();
    return [
      { id: 1, label: isAr ? 'الفصل 1' : 'Chapter 1', title: isAr ? 'الأسس والمفاهيم' : 'Core Foundations' },
      { id: 2, label: isAr ? 'الفصل 2' : 'Chapter 2', title: isAr ? 'النمذجة البصرية' : 'Visual Models' },
      { id: 3, label: isAr ? 'الفصل 3' : 'Chapter 3', title: isAr ? 'المنحنيات التفاعلية' : 'Interactive Curves' },
      { id: 4, label: isAr ? 'الفصل 4' : 'Chapter 4', title: isAr ? 'حل مسائل الامتحانات' : 'Exam Problem Solving' },
      { id: 5, label: isAr ? 'الفصل 5' : 'Chapter 5', title: isAr ? 'التوجيه الذكي اللحظي' : 'AI Mastery Guidance' },
    ];
  });
  selectVideoChapter(chapterId: number): void {
    this.activeVideoChapter.set(chapterId);
  }

  readonly aboutSectionBadge = computed<string>(() => {
    return this.langService.isArabic()
      ? 'عن منصة Spider Math'
      : 'About Spider Math';
  });
  readonly aboutSectionSubtitle = computed<string>(() => {
    const data = this.landingData();
    const isAr = this.langService.isArabic();
    if (isAr) {
      return data?.teacherBioAr || 'تجربة سينمائية فريدة للتعلم. تمكّن من الرياضيات المتقدمة عبر النمذجة البصرية ثلاثية الأبعاد، التوجيه الذكي اللحظي، وحل المسائل الهندسية التفاعلي.';
    }

    return data?.teacherBioEn || 'Experience a cinematic way to learn. Master advanced mathematics through visualization, instant AI-guided feedback, and active problem-solving.';
  });
  private extractYouTubeId(url: string): string | null {
    if (!url) return null;
    const clean = url.trim();
    if (/^[\w-]{11}$/.test(clean)) {
      return clean;
    }

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/,
      /(?:youtube-nocookie\.com\/(?:embed\/|v\/|shorts\/|watch\?v=))([\w-]{11})/
    ];
    for (const pattern of patterns) {
      const match = clean.match(pattern);
      if (match && match[1]) {
        return match[1];
      }

    }

    return null;
  }

  // Mouse coordinates for interactive Cartesian Spotlight (Animation 4.1)
  readonly mouseX = signal<number>(50);
  readonly mouseY = signal<number>(50);
  // Dynamic CMS computed properties
  readonly isCustomHeadline = computed<boolean>(() => {
    const data = this.landingData();
    return this.langService.isArabic()
      ? !!data?.heroHeadlineAr
      : !!data?.heroHeadlineEn;
  });
  readonly heroHeadline = computed<string>(() => {
    const data = this.landingData();
    if (this.langService.isArabic()) {
      return data?.heroHeadlineAr || 'التميز الرياضي المتقدم';
    }

    return data?.heroHeadlineEn || 'Advanced Mathematics Mastery';
  });
  readonly heroSubheadline = computed<string>(() => {
    const data = this.landingData();
    if (this.langService.isArabic()) {
      return data?.heroSubheadlineAr || 'تأهيل أكاديمي متفوق للجامعات والثانوية العامة والأنظمة الدولية (ثانوية عامة • IGCSE • SAT).';
    }

    return data?.heroSubheadlineEn || 'University-Prep & High School Excellence (Thanweya Amma • IGCSE • SAT)';
  });
  readonly academicYearText = computed<string>(() => {
    const year = this.landingData()?.activeAcademicYear || '2026 / 2027';
    if (this.langService.isArabic()) {
      return `العام الأكاديمي ${year} متاح الآن — بإشراف م/ هبة عبدالوهاب`;
    }

    return `Academic Year ${year} Open — Supervised by Eng. Heba Abdel-Wahab`;
  });
  readonly announcement = computed<{ text: string; isActive: boolean }>(() => {
    const data = this.landingData();
    const isAr = this.langService.isArabic();
    const text = isAr
      ? (data?.announcementBannerText || '✦ خصم 20% لفترة محدودة على اشتراك باقات الترم الأول بمناسبة تدشين المنصة ✦')
      : (data?.announcementBannerTextEn || '✦ 20% Limited Discount on Term 1 Master Packages for Platform Launch ✦');
    return {
      text,
      isActive: !!(data?.isAnnouncementActive && text)
    };
  });
  readonly heroBadge = computed<string>(() => {
    const data = this.landingData();
    return this.langService.isArabic()
      ? (data?.heroBadgeAr || 'Spider Math✦ المنظومة الهندسية الرائدة')
      : (data?.heroBadgeEn || 'Spider Math✦ Engineering Excellence');
  });
  readonly heroCtaPrimary = computed<string>(() => {
    const data = this.landingData();
    return this.langService.isArabic()
      ? (data?.heroCtaPrimaryAr || 'استكشف المناهج')
      : (data?.heroCtaPrimaryEn || 'Explore Curricula');
  });
  readonly heroCtaSecondary = computed<string>(() => {
    const data = this.landingData();
    return this.langService.isArabic()
      ? (data?.heroCtaSecondaryAr || 'تواصل مع المساعد الذكي')
      : (data?.heroCtaSecondaryEn || 'Speak to AI Tutor');
  });
  readonly teacherProfile = computed(() => {
    const data = this.landingData();
    const isAr = this.langService.isArabic();
    const bio = data?.teacherBio;
    return {
      name: isAr
        ? (data?.teacherNameAr || bio?.nameAr || 'المهندسة / هبة عبدالوهاب')
        : (data?.teacherNameEn || bio?.nameEn || 'Eng. Heba Abdel-Wahab'),
      title: isAr
        ? (data?.teacherTitleAr || bio?.titleAr || 'كبير محاضري الرياضيات للشهادات العامة والدولية وخبير الدبلومة الأمريكية و Desmos')
        : (data?.teacherTitleEn || bio?.titleEn || 'Principal Mathematics Educator, American Diploma & Desmos Graphing Specialist'),
      bio: isAr
        ? (data?.teacherBioAr || bio?.bioAr || 'خبرة تزيد عن 14 عاماً في تدريس وتبسيط مناهج الرياضيات المصرية والخليجية والدولية (IGCSE) والدبلومة الأمريكية (SAT/EST/ACT). متخصصة في توظيف حاسبة ديسموس البيانية وحل المسائل الهندسية المعقدة بأسهل الطرق.')
        : (data?.teacherBioEn || bio?.bioEn || 'Over 14 years of excellence in teaching Egyptian, Gulf, IGCSE, and American Diploma Mathematics with deep interactive mastery of the Desmos Graphing Calculator.'),
      qualifications: isAr
        ? ((data?.teacherQualificationsAr && data.teacherQualificationsAr.length > 0)
            ? data.teacherQualificationsAr
            : (bio?.qualifications || [
                'بكالوريوس هندسة — جامعة القاهرة مع مرتبة الشرف',
                'خبير معتمد ومحاضر دولي في حاسبة Desmos البيانية المتقدمة',
                'مدرب معتمد لاختبارات الـ SAT I/II و EST I/II و ACT Math',
                'أعلى نسب تفوق في الثانوية العامة والشهادة الإعدادية لسنوات متتالية'
              ]))
        : ((data?.teacherQualificationsEn && data.teacherQualificationsEn.length > 0)
            ? data.teacherQualificationsEn
            : [
                'B.Sc. in Engineering — Cairo University with Honors',
                'Certified International Desmos Graphing Calculator Specialist',
                'Certified Instructor for SAT I/II, EST I/II and ACT Math',
                'Consistent top scores and highest student rankings year over year'
              ]),
      whatsappCta: isAr
        ? (data?.teacherWhatsappCtaAr || 'تواصل مباشرة مع فريق م/ هبة عبر واتساب')
        : (data?.teacherWhatsappCtaEn || 'Direct WhatsApp Consultation')
    };
  });
  readonly curriculumSection = computed(() => {
    const data = this.landingData();
    const isAr = this.langService.isArabic();
    return {
      badge: isAr
        ? (data?.curriculumBadgeAr || 'المسارات الأكاديمية والمناهج')
        : (data?.curriculumBadgeEn || 'Academic Tracks & Curriculums'),
      title: isAr
        ? (data?.curriculumTitleAr || 'اختر منهجك الدراسي وابدأ رحلة التفوق')
        : (data?.curriculumTitleEn || 'Choose Your Curriculum & Begin Mastery'),
      subtitle: isAr
        ? (data?.curriculumSubtitleAr || 'مناهج تعليمية متكاملة مصممة بأعلى معايير الجودة لتناسب نظامك الدراسي')
        : (data?.curriculumSubtitleEn || 'Comprehensive educational tracks designed with high engineering standards')
    };
  });
  readonly placementSection = computed(() => {
    const data = this.landingData();
    const isAr = this.langService.isArabic();
    return {
      badge: isAr
        ? (data?.placementBadgeAr || 'اختبار تحديد المستوى وتشخيص المهارات')
        : (data?.placementBadgeEn || 'Diagnostic Skill Assessment'),
      headline: isAr
        ? (data?.placementHeadlineAr || 'اكتشف مستواك الحقيقي في الرياضيات خلال 5 دقائق')
        : (data?.placementHeadlineEn || 'Discover Your True Math Level in 5 Minutes'),
      subtitle: isAr
        ? (data?.placementSubtitleAr || 'احصل على خارطة طريق ذكية ومخصصة لاحتياجاتك تركز على نقاط قوتك وتعالج الفجوات.')
        : (data?.placementSubtitleEn || 'Get a personalized AI study roadmap tailored to your strengths and gaps.'),
      feature1: isAr
        ? (data?.placementFeature1Ar || 'تقييم ذكي ومباشر')
        : (data?.placementFeature1En || 'Instant Diagnostic Feedback'),
      feature2: isAr
        ? (data?.placementFeature2Ar || 'تقرير مفصل بنقاط القوة والضعف')
        : (data?.placementFeature2En || 'Strengths & Weaknesses Report'),
      feature3: isAr
        ? (data?.placementFeature3Ar || 'متابعة شخصية من م/ هبة عبدالوهاب')
        : (data?.placementFeature3En || 'Eng. Heba Follow-up'),
      cta: isAr
        ? (data?.placementCtaAr || 'ابدأ التقييم الآن')
        : (data?.placementCtaEn || 'Start Assessment')
    };
  });
  readonly heroVideoAriaLabel = computed<string>(() => {
    return this.langService.isArabic()
      ? 'تشغيل الفيديو التعريفي لمنصة سبايدر ماث'
      : 'Play Spider Math Platform Intro Video';
  });
  readonly heroVideoAlt = computed<string>(() => {
    const teacherName = this.teacherProfile().name;
    return this.langService.isArabic()
      ? `الفيديو التعريفي لمنصة سبايدر ماث — ${teacherName}`
      : `Spider Math Intro Video — ${teacherName}`;
  });
  readonly studentBannerNotice = computed<string>(() => {
    return this.langService.isArabic()
      ? 'أنت تتصفح الصفحة الرئيسية للمنصة'
      : 'You are browsing the platform main page';
  });
  readonly studentBannerCta = computed<string>(() => {
    return this.langService.isArabic()
      ? 'العودة إلى لوحة دراستك'
      : 'Back to Study Dashboard';
  });
  readonly studentContinueLearningCta = computed<string>(() => {
    return this.langService.isArabic()
      ? 'متابعة المذاكرة (لوحة تحكم الطالب)'
      : 'Continue Learning (Student Dashboard)';
  });
  readonly studentPlacementTestCta = computed<string>(() => {
    return this.langService.isArabic()
      ? 'امتحان تحديد المستوى لصفك'
      : 'Your Placement Test';
  });
  readonly scheduleSection = computed(() => {
    const data = this.landingData();
    const isAr = this.langService.isArabic();
    return {
      badge: isAr
        ? (data?.scheduleBadgeAr || 'جدول المواعيد والحصص')
        : (data?.scheduleBadgeEn || 'Live Lecture Schedule'),
      title: isAr
        ? (data?.scheduleTitleAr || 'مواعيد المحاضرات والبث المباشر')
        : (data?.scheduleTitleEn || 'Class Timetable & Streaming Schedule'),
      subtitle: isAr
        ? (data?.scheduleSubtitleAr || 'يتم تحديث المواعيد وفقاً للتوقيت المحلي لمدينة القاهرة (GMT+2)')
        : (data?.scheduleSubtitleEn || 'Times shown in Cairo Local Time (GMT+2)')
    };
  });
  readonly schedulesList = computed<IScheduleItem[]>(() => {
    const data = this.landingData();
    return Array.isArray(data?.schedules) ? data.schedules : [];
  });
  readonly whatsappButtonLabel = computed<string>(() => {
    return this.langService.isArabic() ? 'تواصل معنا عبر واتساب' : 'WhatsApp Support';
  });
  readonly pricingSection = computed(() => {
    const data = this.landingData();
    const isAr = this.langService.isArabic();
    return {
      badge: isAr
        ? (data?.pricingBadgeAr || 'الباقات الدراسية والمراجعات')
        : (data?.pricingBadgeEn || 'Packages & Tuition Plans'),
      title: isAr
        ? (data?.pricingTitleAr || 'استثمر في مستقبلك الأكاديمي بأعلى معايير الجودة')
        : (data?.pricingTitleEn || 'Transparent Tuition & Revision Packages'),
      subtitle: isAr
        ? (data?.pricingSubtitleAr || 'خطط دراسية مرنة ومراجعات نهائية مكثفة تضمن لك التفوق بأفضل الأسعار')
        : (data?.pricingSubtitleEn || 'Flexible study units and intensive final revisions engineered for mastery')
    };
  });
  // Filtered Pricing Packages (Reacts immediately to curriculum and activeUnitTab)
  readonly filteredPackages = computed<IPricingPackage[]>(() => {
    const data = this.landingData();
    if (!data || !Array.isArray(data.pricingPackages)) return [];
    const curr = this.selectedCurriculum();
    const tab = this.activeUnitTab();
    const list = data.pricingPackages.filter(p => p.curriculum === curr && p.type === tab);
    if (list.length > 0) return list;
    const tabList = data.pricingPackages.filter(p => p.type === tab);
    return tabList.length > 0 ? tabList : data.pricingPackages.filter(p => p.curriculum === curr);
  });
  // Temporarily hidden pricing & packages section (consult user before public release whether to re-enable)
  readonly showPricingPackagesSection = signal<boolean>(false);
  // Hard-Coded Wall of Fame & Top Scorers (لوحة شرف أوائل الطلبة)
  readonly hardcodedTopThree = [
    {
      rank: 1,
      nameAr: 'سارة أحمد محمود',
      nameEn: 'Sarah Ahmed Mahmoud',
      systemAr: 'ثانوية عامة (علمي رياضة)',
      systemEn: 'Egyptian Curriculum (Thanaweya)',
      achievementAr: '100% الدرجة النهائية في التفاضل والتكامل',
      achievementEn: '100% Final Score in Calculus & Analysis',
      locationAr: 'القاهرة — مدرسة المتفوقين STEM',
      locationEn: 'Cairo — STEM High School',
      xp: 2950,
      badgeAr: 'المركز الأول على مستوى المنصة',
      badgeEn: 'Rank #1 Platform Champion'
    },
    {
      rank: 2,
      nameAr: 'عمر خالد الشناوي',
      nameEn: 'Omar Khaled El-Shenawy',
      systemAr: 'الدبلومة الأمريكية (Digital SAT)',
      systemEn: 'American Diploma (Digital SAT Math)',
      achievementAr: '800 / 800 الدرجة الكاملة في الرياضيات',
      achievementEn: '800 / 800 Perfect Math Score',
      locationAr: 'الجيزة — مدرسة الألسن الدولية',
      locationEn: 'Giza — Al-Alson Int. School',
      xp: 2780,
      badgeAr: 'الدرجة الكاملة SAT',
      badgeEn: 'Perfect SAT Score'
    },
    {
      rank: 3,
      nameAr: 'مريم يوسف عبد الرحمن',
      nameEn: 'Mariam Youssef Abdel-Rahman',
      systemAr: 'المنهج الخليجي (الصف 12 متقدم)',
      systemEn: 'Gulf Curriculum (Grade 12 Advanced)',
      achievementAr: '99.8% في الرياضيات المتقدمة',
      achievementEn: '99.8% in Advanced Mathematics',
      locationAr: 'الرياض — مدارس الرواد',
      locationEn: 'Riyadh — Al-Rowad Schools',
      xp: 2620,
      badgeAr: 'تفوق استثنائي',
      badgeEn: 'Exceptional Mastery'
    }

  ];
  readonly hardcodedHonorsList = [
    {
      rank: 4,
      nameAr: 'زياد طارق إبراهيم',
      nameEn: 'Ziad Tarek Ibrahim',
      systemAr: 'ثانوية عامة (الجبر والهندسة الفراغية)',
      systemEn: 'Egyptian Curriculum (Algebra & Solid Geom)',
      achievementAr: '100% الدرجة النهائية',
      achievementEn: '100% Final Score',
      locationAr: 'الإسكندرية',
      locationEn: 'Alexandria',
      xp: 2450,
      badgeAr: 'عبقري الجبر',
      badgeEn: 'Algebra Master'
    },
    {
      rank: 5,
      nameAr: 'ياسمين حازم المهدي',
      nameEn: 'Yasmine Hazem El-Mahdy',
      systemAr: 'البريطاني الدولي (IGCSE Cambridge)',
      systemEn: 'British Curriculum (IGCSE Cambridge)',
      achievementAr: 'Grade A* في الرياضيات البحتة المتقدمة',
      achievementEn: 'Grade A* in Further Pure Math',
      locationAr: 'القاهرة',
      locationEn: 'Cairo',
      xp: 2390,
      badgeAr: 'امتياز كامبريدج',
      badgeEn: 'Cambridge A*'
    },
    {
      rank: 6,
      nameAr: 'أحمد هشام النجار',
      nameEn: 'Ahmed Hesham El-Naggar',
      systemAr: 'ثانوية عامة (الميكانيكا والديناميكا)',
      systemEn: 'Egyptian Curriculum (Mechanics & Dynamics)',
      achievementAr: '100% في الرياضيات التطبيقية',
      achievementEn: '100% in Applied Math',
      locationAr: 'الدقهلية — المنصورة',
      locationEn: 'Mansoura',
      xp: 2280,
      badgeAr: 'فارس الميكانيكا',
      badgeEn: 'Mechanics Pro'
    },
    {
      rank: 7,
      nameAr: 'نور الدين وليد',
      nameEn: 'Nour Eldin Walid',
      systemAr: 'الدبلومة الأمريكية (ACT Math)',
      systemEn: 'American Diploma (ACT Math 36/36)',
      achievementAr: '36 / 36 الدرجة الكاملة في الـ ACT',
      achievementEn: '36 / 36 Perfect ACT Score',
      locationAr: 'الغربية — طنطا',
      locationEn: 'Tanta',
      xp: 2190,
      badgeAr: 'الدرجة الكاملة ACT',
      badgeEn: 'Perfect ACT 36'
    }

  ];
  ngOnInit(): void {
    const hasPublicViewParam =
      this.route.snapshot.queryParamMap.get('view') === 'public' ||
      this.route.snapshot.queryParamMap.has('preview') ||
      this.route.snapshot.queryParamMap.has('public');
    if (isPlatformBrowser(this.platformId) && this.authService.isAuthenticated() && !hasPublicViewParam) {
      if (this.authService.isStudent()) {
        if (this.authService.isPendingDeviceApproval()) {
          this.router.navigateByUrl('/pending-device-approval');
        } else {
          this.router.navigateByUrl('/student');
        }

        return;
      }

      if (this.authService.isParent()) {
        this.router.navigateByUrl('/parent');
        return;
      }

      if (this.authService.isSuperAdmin()) {
        this.router.navigateByUrl('/admin');
        return;
      }

    }

    // Auto-bind student grade and curriculum if logged in
    const student = this.authService.currentUser();
    if (this.authService.isAuthenticated() && student) {
      if (student.curriculum) this.selectedCurriculum.set(student.curriculum as CurriculumCode);
      if (student.grade_level) this.selectedGradeLevel.set(student.grade_level);
      if (student.academic_term) this.selectedTerm.set(student.academic_term as AcademicTermCode);
      this.loadStudentUnits();
    }

    this.discoveryService.getLandingData().subscribe({
      next: data => {
        this.landingData.set(data);
        this.isLoading.set(false);
        this.checkPlacementAvailability();
      },
      error: () => {
        this.isLoading.set(false);
        this.checkPlacementAvailability();
      }

    });

    this.loadTestimonials();
  }

  openPlacementModal(): void {
    this.isPlacementModalOpen.set(true);
    this.checkPlacementAvailability();
  }

  closePlacementModal(): void {
    this.isPlacementModalOpen.set(false);
  }

  startPlacementExam(): void {
    this.closePlacementModal();
    this.router.navigate(['/placement-test'], {
      queryParams: {
        curriculum: this.placementCurriculum(),
        gradeLevel: this.placementGrade(),
        term: this.activeAcademicTerm()
      }

    });
  }

  setPlacementCurriculum(curr: CurriculumCode): void {
    this.placementCurriculum.set(curr);
    const grades = this.placementAvailableGrades();
    if (grades.length > 0 && !grades.some(g => g.code === this.placementGrade())) {
      this.placementGrade.set(grades[0].code);
    }

    this.checkPlacementAvailability();
  }

  setPlacementGrade(gradeCode: string): void {
    this.placementGrade.set(gradeCode);
    this.checkPlacementAvailability();
  }

  checkPlacementAvailability(): void {
    this.isCheckingPlacement.set(true);
    const curr = this.placementCurriculum();
    const grade = this.placementGrade();
    const term = this.activeAcademicTerm();
    this.discoveryService.getPlacementTest(curr, grade, term).subscribe({
      next: (res) => {
        this.placementTestInfo.set(res);
        this.isCheckingPlacement.set(false);
      },
      error: () => {
        this.placementTestInfo.set({
          hasTest: false,
          assessment_id: '',
          title: `امتحان تحديد المستوى — ${curr} (${grade})`,
          curriculum: curr,
          grade_level: grade,
          academic_term: term,
          total_questions: 0,
          time_limit_minutes: 15,
          questions: []
        });
        this.isCheckingPlacement.set(false);
      }

    });
  }

  loadStudentUnits(): void {
    this.isLoadingStudentUnits.set(true);
    this.discoveryService.getUnitsCatalog(
      this.selectedCurriculum(),
      this.selectedGradeLevel(),
      this.selectedTerm()
    ).subscribe({
      next: units => {
        this.studentUnits.set(units || []);
        this.isLoadingStudentUnits.set(false);
      },
      error: () => {
        this.studentUnits.set([]);
        this.isLoadingStudentUnits.set(false);
      }

    });
  }

  toggleFullCurriculumExplorer(): void {
    this.showFullCurriculumExplorer.update(v => !v);
  }

  onCurriculumSelectionChanged(selection: ICurriculumSelection): void {
    this.selectedCurriculum.set(selection.curriculum);
    this.selectedGradeLevel.set(selection.gradeLevel);
    this.selectedTerm.set(selection.academicTerm);
  }

  onMouseMove(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((event.clientY - rect.top) / rect.height) * 100);
    this.mouseX.set(x);
    this.mouseY.set(y);
  }

  setUnitTab(tab: 'STUDY_UNIT' | 'FINAL_REVISION'): void {
    this.activeUnitTab.set(tab);
  }

  scrollToSection(sectionId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

  }

  openWhatsAppSupport(): void {
    const data = this.landingData();
    const phone = data?.whatsappSupportNumber || '+201000000000';
    const message = encodeURIComponent(
      this.langService.isArabic()
        ? 'مرحباً، أرغب بالاستفسار عن اشتراكات منصة Spider Math والدروس المتاحة.'
        : 'Hello, I would like to inquire about Spider Math platform subscriptions and courses.'
    );
    if (isPlatformBrowser(this.platformId)) {
      window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    }

  }

  loadTestimonials(): void {
    this.isLoadingTestimonials.set(true);
    this.testimonialsService.getApprovedTestimonials().subscribe({
      next: (res) => {
        this.testimonials.set(res.data || []);
        this.isLoadingTestimonials.set(false);
      },
      error: () => {
        this.isLoadingTestimonials.set(false);
      }
    });
  }

  openTestimonialModal(): void {
    if (!this.canSubmitTestimonial()) {
      if (!this.authService.isAuthenticated()) {
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/#testimonials' } });
      }
      return;
    }
    this.testimonialReviewText.set('');
    this.testimonialRating.set(5);
    this.testimonialSubmitted.set(false);
    this.testimonialSubmitError.set(null);
    this.isTestimonialModalOpen.set(true);
  }

  closeTestimonialModal(): void {
    this.isTestimonialModalOpen.set(false);
  }

  setRating(rating: number): void {
    this.testimonialRating.set(rating);
  }

  submitTestimonial(): void {
    const text = this.testimonialReviewText().trim();
    if (!text || text.length < 5) {
      this.testimonialSubmitError.set(
        this.langService.isArabic()
          ? 'يرجى كتابة رأيك بشكل واضح (5 أحرف على الأقل).'
          : 'Please write a meaningful review (at least 5 characters).'
      );
      return;
    }
    this.isSubmittingTestimonial.set(true);
    this.testimonialSubmitError.set(null);

    this.testimonialsService.submitTestimonial({
      review_text: text,
      rating: this.testimonialRating()
    }).subscribe({
      next: () => {
        this.isSubmittingTestimonial.set(false);
        this.testimonialSubmitted.set(true);
      },
      error: (err) => {
        this.isSubmittingTestimonial.set(false);
        this.testimonialSubmitError.set(
          err?.error?.error?.message ||
          err?.error?.message ||
          (this.langService.isArabic() ? 'تعذر إرسال الرأي، يرجى المحاولة لاحقاً.' : 'Failed to submit review.')
        );
      }
    });
  }

  formatStudentStage(rawStage?: string): string {
    if (!rawStage) return '';
    const replacements: Record<string, string> = {
      'SEC_3': 'الصف الثالث الثانوي',
      'SEC_2': 'الصف الثاني الثانوي',
      'SEC_1': 'الصف الأول الثانوي',
      'PREP_3': 'الصف الثالث الإعدادي',
      'PREP_2': 'الصف الثاني الإعدادي',
      'PREP_1': 'الصف الأول الإعدادي',
      'GRADE_12': 'الصف الثاني عشر',
      'GRADE_11': 'الصف الحادي عشر',
      'GRADE_10': 'الصف العاشر',
      'IGCSE_AL': 'A-Level',
      'IGCSE_AS': 'AS-Level',
      'IGCSE_OL': 'O-Level',
      'SAT_MATH': 'SAT Math',
      'EGYPTIAN': 'المنهج المصري',
      'GULF': 'المنهج الخليجي',
      'INTERNATIONAL': 'البريطانية (IGCSE)',
      'AMERICAN': 'الأمريكية (SAT)'
    };
    let formatted = rawStage;
    for (const [key, val] of Object.entries(replacements)) {
      formatted = formatted.replace(new RegExp(`\\b${key}\\b`, 'g'), val);
    }
    return formatted;
  }

}

