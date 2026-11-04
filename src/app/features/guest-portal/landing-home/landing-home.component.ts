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

@Component({
  selector: 'app-landing-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AppIconComponent,
    CurriculumSelectorCardsComponent
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

  // Authenticated Student State
  readonly isStudentLoggedIn = computed(() => this.authService.isAuthenticated() && this.authService.isStudent());
  readonly currentStudent = computed(() => this.authService.currentUser());
  readonly studentUnits = signal<any[]>([]);
  readonly isLoadingStudentUnits = signal<boolean>(false);
  readonly showFullCurriculumExplorer = signal<boolean>(false);

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
  readonly heroHeadline = computed<string>(() => {
    const data = this.landingData();
    if (this.langService.isArabic()) {
      return data?.heroHeadlineAr || 'تعلم الرياضيات بأعلى المعايير الهندسية مع المهندسة هبة عبد الوهاب';
    }
    return data?.heroHeadlineEn || 'Master Mathematics with Engineering Standards — Eng. Heba Abdel-Wahab';
  });

  readonly heroSubheadline = computed<string>(() => {
    const data = this.landingData();
    if (this.langService.isArabic()) {
      return data?.heroSubheadlineAr || 'منصة تفاعلية مخصصة للثانوية العامة والأنظمة الدولية بنظام حماية متطور واستراتيجيات ديسموس البيانية.';
    }
    return data?.heroSubheadlineEn || 'Interactive learning for Egyptian, Gulf, International, and American Curriculums with Desmos graphing strategies.';
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
      ? (data?.heroCtaPrimaryAr || 'اختار منهجك وابدأ الآن')
      : (data?.heroCtaPrimaryEn || 'Choose Your Curriculum & Begin');
  });

  readonly heroCtaSecondary = computed<string>(() => {
    const data = this.landingData();
    return this.langService.isArabic()
      ? (data?.heroCtaSecondaryAr || 'امتحان تحديد المستوى المجاني')
      : (data?.heroCtaSecondaryEn || 'Free Placement Test');
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
        ? (data?.placementBadgeAr || 'اختبار تحديد المستوى وتشخيص المهارات الرياضية')
        : (data?.placementBadgeEn || 'Free Placement & Diagnostic Assessment'),
      headline: isAr
        ? (data?.placementHeadlineAr || 'ابدأ اختبار تحديد المستوى واكتشف نقاط قوتك وضعفك')
        : (data?.placementHeadlineEn || 'Assess Your Skills & Discover Your Strengths'),
      subtitle: isAr
        ? (data?.placementSubtitleAr || 'تقييم تشخيصي تفاعلي ذكي يقيس مهاراتك التأسيسية وحل المسائل التحليلية لتحديد خطتك الأكاديمية بدقة وبإشراف مباشر من المهندسة هبة عبدالوهاب.')
        : (data?.placementSubtitleEn || 'Interactive diagnostic assessment designed to evaluate core foundational concepts and analytical problem solving with instant insights.'),
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
        ? (data?.placementCtaAr || 'ابدأ اختبار تحديد المستوى الآن')
        : (data?.placementCtaEn || 'Start Diagnostic Assessment Now')
    };
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
}
