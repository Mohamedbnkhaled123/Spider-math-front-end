import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  input,
  output,
  inject,
  effect,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  NgZone,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

import { AppIconComponent } from '../app-icon/app-icon.component';
import {
  CANONICAL_CURRICULUM_TREE,
  CurriculumCode,
  AcademicTermCode,
  curriculumHasTerms
} from '../../../core/constants/curriculum-tree.constant';
import { PublicDiscoveryService } from '../../../core/services/public-discovery.service';
import {
  ICurriculumTreeItem,
  IGradeQuizzesResponse,
  IGradeQuizItem
} from '../../../core/services/public-discovery.models';
import {
  ICurriculumSelection,
  ICurriculumUiCard,
  IGradeLevelAvailability
} from './curriculum-selector-cards.models';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { ThemeService } from '../../../core/seo-theme-i18n/theme.service';
import {
  getUnitMathTheme,
  isUnitContentEmpty,
  COMING_SOON_DATA
} from '../../../core/utils/unit-math-art.util';
import { AuthService } from '../../../core/auth/auth.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

export type StageFilterType = 'ALL' | 'PRIMARY' | 'PREPARATORY' | 'SECONDARY';

@Component({
  selector: 'app-curriculum-selector-cards',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  templateUrl: './curriculum-selector-cards.component.html',
  styleUrl: './curriculum-selector-cards.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurriculumSelectorCardsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly discoveryService = inject(PublicDiscoveryService);
  private readonly router = inject(Router);
  readonly langService = inject(LangService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  readonly themeService = inject(ThemeService);
  readonly authService = inject(AuthService);

  // Inputs
  readonly initialCurriculum = input<CurriculumCode>('EGYPTIAN');
  readonly initialGrade = input<string>('SEC_3');
  readonly initialTerm = input<AcademicTermCode>('TERM_1');
  readonly showDetails = input<boolean>(true);
  readonly landingUnitIds = input<string[] | undefined>();

  // Outputs
  readonly selectionChange = output<ICurriculumSelection>();

  // State Signals
  readonly selectedCurriculumCode = signal<CurriculumCode>('EGYPTIAN');
  readonly selectedGradeCode = signal<string>('SEC_3');
  readonly selectedTermCode = signal<AcademicTermCode>('TERM_1');
  readonly currentCurriculumHasTerms = computed<boolean>(() => curriculumHasTerms(this.selectedCurriculumCode()));
  readonly dynamicTree = signal<ICurriculumTreeItem[]>([]);
  readonly isLoading = signal<boolean>(true);

  // Units Catalog State (Real from Atlas)
  readonly publishedUnits = signal<any[]>([]);
  readonly isLoadingUnits = signal<boolean>(false);

  // Unit Preview Modal & Protected Content Auth Gate
  readonly selectedUnitForPreview = signal<any | null>(null);
  readonly unitLectures = signal<any[]>([]);
  readonly isLoadingUnitContents = signal<boolean>(false);
  readonly showAuthGateModal = signal<boolean>(false);
  readonly authGateActionMessage = signal<string>('');

  // Curriculum Grade Quizzes & Accordion State
  readonly gradeQuizzesData = signal<IGradeQuizzesResponse>({ units: [], generalQuizzes: [] });
  readonly pendingTargetUrl = signal<string | null>(null);
  readonly isLoadingGradeQuizzes = signal<boolean>(false);
  readonly expandedUnitAccordions = signal<Set<string>>(new Set());

  // Locked Content Modal (Subscription via WhatsApp)
  readonly showLockedContentModal = signal<boolean>(false);
  readonly lockedContentTitle = signal<string>('');
  readonly landingData = signal<any>(null);

  // Coming Soon Modal & Toast State (When clicking on empty units)
  readonly showComingSoonModal = signal<boolean>(false);
  readonly comingSoonUnitTitle = signal<string>('');
  readonly toastMessage = signal<string | null>(null);

  readonly supportWhatsappNumber = computed<string>(() => {
    const data = this.landingData();
    return (
      data?.whatsappSupportNumber ||
      data?.contactChannels?.support_whatsapp ||
      data?.contactChannels?.subscription_whatsapp ||
      '01012345678'
    );
  });

  readonly whatsappSubscriptionUrl = computed<string>(() => {
    const title = this.lockedContentTitle();
    let phone = this.supportWhatsappNumber().replace(/[^0-9]/g, '') || '201012345678';
    if (phone.startsWith('0') && phone.length === 11) {
      phone = '2' + phone;
    }
    const msg = encodeURIComponent(
      `مرحباً م/ هبة عبدالوهاب، أود الاستفادة من محتوى: "${title}". يرجى التكرم بتوضيح تفاصيل الاشتراك.`
    );
    return `https://wa.me/${phone}?text=${msg}`;
  });

  readonly totalGradeQuizzesCount = computed<number>(() => {
    const data = this.gradeQuizzesData();
    const fromUnits = (data.units || []).reduce((sum, u) => sum + (u.quizzes?.length || 0), 0);
    const fromGeneral = data.generalQuizzes?.length || 0;
    return fromUnits + fromGeneral;
  });

  // Phase 2.3: Frosted Glass Track Modal State
  readonly isTrackModalOpen = signal<boolean>(false);
  readonly modalStep = signal<'GRADES' | 'UNITS'>('GRADES');
  readonly activeStageFilter = signal<StageFilterType>('ALL');

  // Stable Spider Web Canvas & DOM References
  @ViewChild('desktopCurriculaContainer') desktopContainerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('spiderMascotDesktop') spiderDesktopRef!: ElementRef<HTMLImageElement>;
  @ViewChild('silkCanvasDesktop') silkCanvasDesktopRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('silkCanvasMobile') silkCanvasMobileRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('mobileCurriculaContainer') mobileContainerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('spiderMascotMobile') spiderMobileRef!: ElementRef<HTMLImageElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private silkAnimFrameId = 0;
  private isSilkLoopRunning = false;
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private isSectionVisible = false;
  private isCurriculumTreeRequested = false;
  private desktopSilkCache: {
    W: number;
    H: number;
    dpr: number;
    spiderOrigins: { x: number; y: number }[];
    cardAnchors: { x: number; y: number }[];
  } | null = null;
  private mobileSilkCache: {
    W: number;
    H: number;
    dpr: number;
    spiderOrigins: { x: number; y: number }[];
    cardAnchors: { x: number; y: number }[];
  } | null = null;

  // Computed: Merges dynamic curricula tracks with dynamic availability flags from MongoDB
  readonly curriculumCards = computed<ICurriculumUiCard[]>(() => {
    const rawTree = this.dynamicTree();
    const tracks = this.discoveryService.curriculaTracks();
    return CANONICAL_CURRICULUM_TREE.map(node => {
      const serverCurriculum = rawTree.find(c => c.curriculum === node.code);
      const configuredTrack = tracks.find(t => t.code === node.code);
      const gradesToMap = (configuredTrack?.grades && configuredTrack.grades.length > 0)
        ? configuredTrack.grades
        : node.grades;

      const availableGrades: IGradeLevelAvailability[] = gradesToMap.map(configuredGrade => {
        const canonicalMeta = node.grades.find(g => g.code === configuredGrade.code);
        const serverGrade = serverCurriculum?.gradeLevels.find(g => g.gradeLevel === configuredGrade.code);
        const hasPublished = serverGrade ? serverGrade.hasPublishedUnits : false;
        const count = serverGrade ? serverGrade.totalPublishedUnitsCount : 0;
        const hasPlacement = serverGrade ? (serverGrade.hasPlacementTest ?? serverGrade.terms?.some(t => t.hasPlacementTest) ?? false) : false;
        const isActive = this.discoveryService.isGradeActive(configuredGrade.code);
        const isAvail = serverGrade ? (serverGrade.isAvailable || hasPlacement) : false;

        return {
          code: configuredGrade.code,
          titleAr: configuredGrade.titleAr || canonicalMeta?.titleAr || configuredGrade.code,
          titleEn: configuredGrade.titleEn || canonicalMeta?.titleEn || configuredGrade.code,
          shortLabelAr: canonicalMeta?.shortLabelAr || configuredGrade.titleAr || configuredGrade.code,
          shortLabelEn: canonicalMeta?.shortLabelEn || configuredGrade.titleEn || configuredGrade.code,
          stageAr: canonicalMeta?.stageAr || 'المرحلة الدراسية',
          stageEn: canonicalMeta?.stageEn || 'Academic Stage',
          subjectAr: canonicalMeta?.subjectAr,
          subjectEn: canonicalMeta?.subjectEn,
          branchAr: canonicalMeta?.branchAr,
          branchEn: canonicalMeta?.branchEn,
          tracks: canonicalMeta?.tracks,
          isAvailable: isAvail && isActive,
          isActive,
          hasPublishedUnits: hasPublished,
          publishedUnitsCount: count,
          hasPlacementTest: hasPlacement
        };
      });

      return {
        ...node,
        titleAr: configuredTrack?.nameAr || node.titleAr,
        availableGrades,
        isAvailable: serverCurriculum ? serverCurriculum.hasPublishedUnits : false,
        publishedUnitsCount: serverCurriculum ? serverCurriculum.totalPublishedUnitsCount : 0
      };
    });
  });

  // Computed: 2 Top Curricula (Egyptian & Gulf) for Mobile 2x2 Layout
  readonly topCurricula = computed<ICurriculumUiCard[]>(() => {
    const cards = this.curriculumCards();
    return cards.slice(0, 2);
  });

  // Computed: 2 Bottom Curricula (International & American) for Mobile 2x2 Layout
  readonly bottomCurricula = computed<ICurriculumUiCard[]>(() => {
    const cards = this.curriculumCards();
    return cards.slice(2, 4);
  });

  // Computed: The currently selected curriculum card
  readonly selectedCurriculum = computed<ICurriculumUiCard>(() => {
    const cards = this.curriculumCards();
    return (
      cards.find(c => c.code === this.selectedCurriculumCode()) ?? cards[0]
    );
  });

  // Filtered grades for the Frosted Glass Modal according to activeStageFilter
  // Dynamically bound: eliminated hardcoded grade arrays; deactivated and deleted grades immediately excluded
  readonly filteredGradesForModal = computed<IGradeLevelAvailability[]>(() => {
    const curr = this.selectedCurriculum();
    if (!curr) return [];

    // Only show active grades (if deactivated or deleted, it does NOT appear on the home page or modal cards)
    const activeGradesOnly = curr.availableGrades.filter(g => g.isActive ?? this.discoveryService.isGradeActive(g.code));
    const filter = this.activeStageFilter();

    if (filter === 'ALL') {
      return activeGradesOnly;
    }

    return activeGradesOnly.filter(g => {
      const stageEn = (g.stageEn || '').toLowerCase();
      const code = g.code;
      if (filter === 'PRIMARY') {
        return (
          stageEn.includes('primary') ||
          stageEn.includes('elementary') ||
          code.startsWith('PRI') ||
          code.startsWith('US_GRADE_1') ||
          code.startsWith('US_GRADE_2') ||
          code.startsWith('US_GRADE_3') ||
          code.startsWith('US_GRADE_4') ||
          code.startsWith('US_GRADE_5') ||
          ['GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6'].includes(code) ||
          code.startsWith('IGCSE_YEAR_1') ||
          code.startsWith('IGCSE_YEAR_2') ||
          code.startsWith('IGCSE_YEAR_3') ||
          code.startsWith('IGCSE_YEAR_4') ||
          code.startsWith('IGCSE_YEAR_5') ||
          code.startsWith('IGCSE_YEAR_6')
        );
      }
      if (filter === 'PREPARATORY') {
        return (
          stageEn.includes('prep') ||
          stageEn.includes('middle') ||
          code.startsWith('PREP') ||
          code === 'US_GRADE_6' ||
          code === 'US_GRADE_7' ||
          code === 'US_GRADE_8' ||
          code === 'GRADE_7' ||
          code === 'GRADE_8' ||
          code === 'GRADE_9' ||
          code === 'IGCSE_YEAR_7' ||
          code === 'IGCSE_YEAR_8' ||
          code === 'IGCSE_YEAR_9'
        );
      }
      if (filter === 'SECONDARY') {
        return (
          stageEn.includes('second') ||
          stageEn.includes('high') ||
          stageEn.includes('entrance') ||
          stageEn.includes('bacc') ||
          code.startsWith('SEC') ||
          code.startsWith('BACC') ||
          code === 'SAT' ||
          code.startsWith('SAT') ||
          code.startsWith('EST') ||
          code.startsWith('ACT') ||
          code.startsWith('US_GRADE_9') ||
          code.startsWith('US_GRADE_10') ||
          code.startsWith('US_GRADE_11') ||
          code.startsWith('US_GRADE_12') ||
          code.startsWith('IGCSE_OL') ||
          code.startsWith('IGCSE_AS') ||
          code.startsWith('IGCSE_AL') ||
          ['GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12'].includes(code)
        );
      }
      return true;
    });
  });

  // Computed: Selected Grade Object
  readonly currentSelectedGrade = computed<IGradeLevelAvailability | undefined>(() => {
    const curr = this.selectedCurriculum();
    if (!curr) return undefined;
    return curr.availableGrades.find(g => g.code === this.selectedGradeCode()) || curr.availableGrades[0];
  });

  constructor() {
    effect(() => {
      const term = this.initialTerm();
      if (term) {
        this.selectedTermCode.set(term);
        if (this.isTrackModalOpen() && this.modalStep() === 'UNITS') {
          this.loadUnitsForSelection();
        }
      }
    });

    effect(() => {
      this.themeService.isDark();
      this.langService.currentLang();
      if (isPlatformBrowser(this.platformId)) {
        this.desktopSilkCache = null;
        this.mobileSilkCache = null;
        this.scheduleSilkRender();
      }
    });
  }

  ngOnInit(): void {
    this.selectedCurriculumCode.set(this.initialCurriculum());
    this.selectedGradeCode.set(this.initialGrade());
    this.selectedTermCode.set(this.initialTerm());

    this.discoveryService.loadActiveGradesAndTracks().subscribe();
    this.ensureCurriculumTreeLoaded();

    this.discoveryService.getLandingData().subscribe({
      next: data => {
        this.landingData.set(data);
        const serverActiveTerm = (data?.activeAcademicTerm || (data as any)?.active_academic_term) as AcademicTermCode | undefined;
        if (serverActiveTerm && this.selectedTermCode() !== serverActiveTerm) {
          this.selectedTermCode.set(serverActiveTerm);
          if (this.isTrackModalOpen() && this.modalStep() === 'UNITS') {
            this.loadUnitsForSelection();
          }
        }
      },
      error: () => {}
    });
  }

  private ensureCurriculumTreeLoaded(): void {
    if (this.isCurriculumTreeRequested) return;
    this.isCurriculumTreeRequested = true;
    this.discoveryService.getCurriculumTree().subscribe({
      next: tree => {
        this.dynamicTree.set(tree);
        this.isLoading.set(false);
      },
      error: () => {
        this.isCurriculumTreeRequested = false;
        this.isLoading.set(false);
      }
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ngZone.runOutsideAngular(() => {
      const desktopEl = this.desktopContainerRef?.nativeElement;
      const mobileEl = this.mobileContainerRef?.nativeElement;

      if (typeof IntersectionObserver !== 'undefined') {
        this.intersectionObserver = new IntersectionObserver(
          entries => {
            const visible = entries.some(e => e.isIntersecting);
            this.isSectionVisible = visible;
            if (visible) {
              this.ngZone.run(() => this.ensureCurriculumTreeLoaded());
              this.scheduleSilkRender();
            } else {
              this.stopSilkLoop();
            }
          },
          { rootMargin: '200px 0px' }
        );
        if (desktopEl) this.intersectionObserver.observe(desktopEl);
        if (mobileEl) this.intersectionObserver.observe(mobileEl);
      } else {
        this.isSectionVisible = true;
        this.ngZone.run(() => this.ensureCurriculumTreeLoaded());
        this.scheduleSilkRender();
      }

      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => {
          this.desktopSilkCache = null;
          this.mobileSilkCache = null;
          if (this.isSectionVisible) {
            this.scheduleSilkRender();
          }
        });
        if (desktopEl) this.resizeObserver.observe(desktopEl);
        if (mobileEl) this.resizeObserver.observe(mobileEl);
      }

      const spiderDesktop = this.spiderDesktopRef?.nativeElement;
      const spiderMobile = this.spiderMobileRef?.nativeElement;
      const onImgLoad = () => {
        this.desktopSilkCache = null;
        this.mobileSilkCache = null;
        if (this.isSectionVisible) this.scheduleSilkRender();
      };
      if (spiderDesktop && !spiderDesktop.complete) {
        spiderDesktop.addEventListener('load', onImgLoad, { once: true });
      }
      if (spiderMobile && !spiderMobile.complete) {
        spiderMobile.addEventListener('load', onImgLoad, { once: true });
      }
    });
  }

  ngOnDestroy(): void {
    this.stopSilkLoop();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
  }

  private scheduleSilkRender(): void {
    if (!isPlatformBrowser(this.platformId) || this.isTrackModalOpen()) return;
    this.desktopSilkCache = null;
    this.mobileSilkCache = null;
    this.startSilkLoop();
  }

  private startSilkLoop(): void {
    if (!isPlatformBrowser(this.platformId) || this.isSilkLoopRunning || !this.isSectionVisible || this.isTrackModalOpen()) return;

    // Respect user prefers-reduced-motion preferences
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.renderCurrentSilkFrame(0);
      return;
    }

    this.isSilkLoopRunning = true;
    this.ngZone.runOutsideAngular(() => {
      const step = (timeMs: number) => {
        if (!this.isSilkLoopRunning || !this.isSectionVisible || this.isTrackModalOpen()) {
          this.isSilkLoopRunning = false;
          this.silkAnimFrameId = 0;
          return;
        }
        this.renderCurrentSilkFrame(timeMs * 0.001);
        this.silkAnimFrameId = requestAnimationFrame(step);
      };
      this.silkAnimFrameId = requestAnimationFrame(step);
    });
  }

  private stopSilkLoop(): void {
    this.isSilkLoopRunning = false;
    if (this.silkAnimFrameId) {
      cancelAnimationFrame(this.silkAnimFrameId);
      this.silkAnimFrameId = 0;
    }
  }

  // ── Desktop Silk Geometry Update (Read-Before-Write, Cached for 60fps Physics Sway) ──
  private updateDesktopGeometry(): void {
    const canvasEl = this.silkCanvasDesktopRef?.nativeElement;
    const containerEl = this.desktopContainerRef?.nativeElement;
    const spiderEl = this.spiderDesktopRef?.nativeElement;
    if (!canvasEl || !containerEl || !spiderEl) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const containerRect = containerEl.getBoundingClientRect();
    const W = containerRect.width;
    const H = containerRect.height;
    if (W === 0 || H === 0) return;

    const spiderRect = spiderEl.getBoundingClientRect();
    const cardEls = containerEl.querySelectorAll<HTMLElement>('.curriculum-card');
    const cardRects: DOMRect[] = [];
    for (let i = 0; i < 4; i++) {
      if (cardEls[i]) {
        cardRects.push(cardEls[i].getBoundingClientRect());
      }
    }

    const spiderX = spiderRect.left - containerRect.left;
    const spiderY = spiderRect.top - containerRect.top;
    const spiderW = spiderRect.width;
    const spiderH = spiderRect.height;

    // Zero air-gap: Origins tightly anchor to the bottom paws and book contours of the new mascot
    const spiderOrigins = [
      { x: spiderX + spiderW * 0.22, y: spiderY + spiderH * 0.84 },
      { x: spiderX + spiderW * 0.42, y: spiderY + spiderH * 0.86 },
      { x: spiderX + spiderW * 0.58, y: spiderY + spiderH * 0.86 },
      { x: spiderX + spiderW * 0.78, y: spiderY + spiderH * 0.84 },
    ];

    const cardAnchors: { x: number; y: number }[] = [];
    for (let i = 0; i < 4; i++) {
      if (cardRects[i]) {
        const r = cardRects[i];
        cardAnchors.push({
          x: r.left - containerRect.left + r.width * 0.5,
          y: r.top - containerRect.top + 1
        });
      } else {
        cardAnchors.push({ x: W * (0.125 + i * 0.25), y: H * 0.85 });
      }
    }

    const targetW = Math.round(W * dpr);
    const targetH = Math.round(H * dpr);
    if (canvasEl.width !== targetW || canvasEl.height !== targetH) {
      canvasEl.width = targetW;
      canvasEl.height = targetH;
    }

    this.desktopSilkCache = { W, H, dpr, spiderOrigins, cardAnchors };
  }

  // ── Mobile Silk Geometry Update (Read-Before-Write, Cached for 60fps Physics Sway) ──
  private updateMobileGeometry(): void {
    const canvasEl = this.silkCanvasMobileRef?.nativeElement;
    const containerEl = this.mobileContainerRef?.nativeElement;
    const spiderEl = this.spiderMobileRef?.nativeElement;
    if (!canvasEl || !containerEl || !spiderEl) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const curContainerRect = containerEl.getBoundingClientRect();
    const W = curContainerRect.width;
    const H = curContainerRect.height;
    if (W === 0 || H === 0) return;

    const cardEls = containerEl.querySelectorAll<HTMLElement>('.curriculum-card');
    const cardRects: DOMRect[] = [];
    for (let i = 0; i < cardEls.length; i++) {
      cardRects.push(cardEls[i].getBoundingClientRect());
    }
    const curSpiderRect = spiderEl.getBoundingClientRect();

    const spiderOrigins: { x: number; y: number }[] = [
      { x: W * 0.38, y: H * 0.45 },
      { x: W * 0.62, y: H * 0.45 },
      { x: W * 0.36, y: H * 0.55 },
      { x: W * 0.64, y: H * 0.55 }
    ];

    const cardAnchors: { x: number; y: number }[] = [
      { x: W * 0.25, y: H * 0.28 },
      { x: W * 0.75, y: H * 0.28 },
      { x: W * 0.25, y: H * 0.72 },
      { x: W * 0.75, y: H * 0.72 }
    ];

    if (cardRects.length >= 4) {
      const [r0, r1, r2, r3] = cardRects;
      if (r0.height > 10 && r2.height > 10) {
        cardAnchors[0] = { x: r0.left - curContainerRect.left + r0.width * 0.5, y: r0.bottom - curContainerRect.top };
        cardAnchors[1] = { x: r1.left - curContainerRect.left + r1.width * 0.5, y: r1.bottom - curContainerRect.top };
        cardAnchors[2] = { x: r2.left - curContainerRect.left + r2.width * 0.5, y: r2.top - curContainerRect.top };
        cardAnchors[3] = { x: r3.left - curContainerRect.left + r3.width * 0.5, y: r3.top - curContainerRect.top };
      }
    }

    if (curSpiderRect.width > 20) {
      const sx = curSpiderRect.left - curContainerRect.left;
      const sy = curSpiderRect.top - curContainerRect.top;
      const sw = curSpiderRect.width;
      const sh = curSpiderRect.height;

      spiderOrigins[0] = { x: sx + sw * 0.20, y: sy + sh * 0.46 };
      spiderOrigins[1] = { x: sx + sw * 0.80, y: sy + sh * 0.46 };
      spiderOrigins[2] = { x: sx + sw * 0.22, y: sy + sh * 0.84 };
      spiderOrigins[3] = { x: sx + sw * 0.78, y: sy + sh * 0.84 };
    }

    const targetW = Math.round(W * dpr);
    const targetH = Math.round(H * dpr);
    if (canvasEl.width !== targetW || canvasEl.height !== targetH) {
      canvasEl.width = targetW;
      canvasEl.height = targetH;
    }

    this.mobileSilkCache = { W, H, dpr, spiderOrigins, cardAnchors };
  }

  // ── Render Silk Frame with Organic Harmonic Sway (Zero Layout Measurement inside RAF) ──
  private renderCurrentSilkFrame(timeSec: number): void {
    if (typeof window === 'undefined' || this.isTrackModalOpen()) return;
    const isDesktop = window.innerWidth >= 1024;
    const isDark = this.themeService.isDark();

    if (isDesktop) {
      const canvasEl = this.silkCanvasDesktopRef?.nativeElement;
      if (!canvasEl) return;
      if (!this.desktopSilkCache) {
        this.updateDesktopGeometry();
      }
      const geom = this.desktopSilkCache;
      if (!geom) return;

      const ctx = canvasEl.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(geom.dpr, 0, 0, geom.dpr, 0, 0);
      ctx.clearRect(0, 0, geom.W, geom.H);
      renderCardConnectedWeb(ctx, geom.spiderOrigins, geom.cardAnchors, timeSec, false, isDark, geom.W, geom.H);
      for (const anchor of geom.cardAnchors) {
        drawSubtleCardAnchorFlare(ctx, anchor.x, anchor.y, isDark);
      }
    } else {
      const canvasEl = this.silkCanvasMobileRef?.nativeElement;
      if (!canvasEl) return;
      if (!this.mobileSilkCache) {
        this.updateMobileGeometry();
      }
      const geom = this.mobileSilkCache;
      if (!geom) return;

      const ctx = canvasEl.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(geom.dpr, 0, 0, geom.dpr, 0, 0);
      ctx.clearRect(0, 0, geom.W, geom.H);
      renderCardConnectedWeb(ctx, geom.spiderOrigins, geom.cardAnchors, timeSec, true, isDark, geom.W, geom.H);
      for (const anchor of geom.cardAnchors) {
        drawSubtleCardAnchorFlare(ctx, anchor.x, anchor.y, isDark);
      }
    }
  }

  loadUnitsForSelection(): void {
    this.isLoadingUnits.set(true);
    this.loadGradeQuizzes();
    const term = this.currentCurriculumHasTerms() ? this.selectedTermCode() : undefined;
    this.discoveryService.getUnitsCatalog(
      this.selectedCurriculumCode(),
      this.selectedGradeCode(),
      term
    ).subscribe({
      next: units => {
        const allowedIds = this.landingUnitIds();
        let filtered = units || [];
        if (allowedIds && allowedIds.length > 0) {
          filtered = filtered.filter(u => allowedIds.includes(u._id));
        }
        this.publishedUnits.set(filtered);
        this.isLoadingUnits.set(false);
      },
      error: () => {
        this.publishedUnits.set([]);
        this.isLoadingUnits.set(false);
      }
    });
  }

  loadGradeQuizzes(): void {
    this.isLoadingGradeQuizzes.set(true);
    const term = this.currentCurriculumHasTerms() ? this.selectedTermCode() : undefined;
    this.discoveryService.getGradeQuizzes(
      this.selectedCurriculumCode(),
      this.selectedGradeCode(),
      term
    ).subscribe({
      next: (res) => {
        this.gradeQuizzesData.set(res || { units: [], generalQuizzes: [] });
        this.isLoadingGradeQuizzes.set(false);
        const initialExpanded = new Set<string>();
        (res?.units || []).forEach(u => {
          if (u.quizzes && u.quizzes.length > 0) {
            initialExpanded.add(u.unitId);
          }
        });
        if (initialExpanded.size === 0 && res?.units?.length) {
          initialExpanded.add(res.units[0].unitId);
        }
        if (res?.generalQuizzes?.length) {
          initialExpanded.add('general');
        }
        this.expandedUnitAccordions.set(initialExpanded);
      },
      error: () => {
        this.gradeQuizzesData.set({ units: [], generalQuizzes: [] });
        this.isLoadingGradeQuizzes.set(false);
      }
    });
  }

  toggleUnitAccordion(unitId: string): void {
    this.expandedUnitAccordions.update(set => {
      const next = new Set(set);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
    });
  }

  isUnitExpanded(unitId: string): boolean {
    return this.expandedUnitAccordions().has(unitId);
  }

  onQuizClick(quiz: IGradeQuizItem): void {
    if (quiz.isFree) {
      if (this.authService.isAuthenticated()) {
        this.closeTrackModal();
        if (quiz.isPlacementTest) {
          this.router.navigate(['/placement-test'], {
            queryParams: {
              curriculum: this.selectedCurriculumCode(),
              gradeLevel: this.selectedGradeCode(),
              term: this.selectedTermCode(),
              testId: quiz.id
            }
          });
        } else {
          this.confirmDialogService.confirm({
            title: this.langService.isArabic() ? 'تأكيد بدء الاختبار' : 'Confirm Exam Start',
            message: this.langService.isArabic()
              ? `هل أنت مستعد لبدء "${quiz.titleAr || quiz.titleEn}" الآن؟ سيبدأ احتساب الوقت فور الدخول ولن تتمكن من إيقاف المؤقت بعد البدء.`
              : `Are you ready to start "${quiz.titleEn || quiz.titleAr}" now? The countdown timer begins immediately and cannot be paused.`,
            confirmLabel: this.langService.isArabic() ? 'ابدأ الاختبار الآن' : 'Start Exam Now',
            cancelLabel: this.langService.isArabic() ? 'إلغاء' : 'Cancel',
            icon: 'play-circle',
            isDestructive: false
          }).then(confirmed => {
            if (confirmed) {
              this.router.navigate(['/student/assessments', quiz.id]);
            }
          });
        }
      } else {
        const targetUrl = quiz.isPlacementTest
          ? `/placement-test?curriculum=${this.selectedCurriculumCode()}&gradeLevel=${this.selectedGradeCode()}&term=${this.selectedTermCode()}&testId=${quiz.id}`
          : `/student/assessments/${quiz.id}?returnToHome=true`;
        this.pendingTargetUrl.set(targetUrl);
        this.authGateActionMessage.set(
          this.langService.isArabic()
            ? 'سجل دخولك مجاناً لبدء هذا الكويز ومتابعة درجاتك وإجاباتك مع المعلمة'
            : 'Sign in for free to take this quiz and submit your answers to the teacher'
        );
        this.showAuthGateModal.set(true);
      }
    } else {
      this.openLockedContentModal(quiz.titleAr || quiz.titleEn || (this.langService.isArabic() ? 'كويز خاص' : 'Private Quiz'));
    }
  }

  onLectureClick(lec: any): void {
    const isFree = !!(lec.is_free || lec.is_free_trial || lec.isFree || lec.isFreeTrial);
    if (isFree) {
      if (this.authService.isAuthenticated()) {
        const unitId = this.selectedUnitForPreview()?._id || this.selectedGradeCode();
        this.closeTrackModal();
        this.router.navigate(['/student/units', unitId], { queryParams: { lectureId: lec._id || lec.id } });
      } else {
        const unitId = this.selectedUnitForPreview()?._id || this.selectedGradeCode();
        const targetUrl = `/student/units/${unitId}?lectureId=${lec._id || lec.id}&returnToHome=true`;
        this.pendingTargetUrl.set(targetUrl);
        this.authGateActionMessage.set(
          this.langService.isArabic()
            ? 'سجل دخولك مجاناً لمشاهدة هذه المحاضرة والملزمة المرفقة'
            : 'Sign in for free to watch this lecture and its study material'
        );
        this.showAuthGateModal.set(true);
      }
    } else {
      this.openLockedContentModal(lec.lecture_title_ar || lec.titleAr || lec.title || (this.langService.isArabic() ? 'محاضرة خاصة' : 'Private Lecture'));
    }
  }

  openLockedContentModal(title: string): void {
    this.lockedContentTitle.set(title);
    this.showLockedContentModal.set(true);
  }

  closeLockedContentModal(): void {
    this.showLockedContentModal.set(false);
  }

  openWhatsAppSubscription(): void {
    const title = this.lockedContentTitle();
    let phone = this.supportWhatsappNumber().replace(/[^0-9]/g, '') || '201012345678';
    if (phone.startsWith('0') && phone.length === 11) {
      phone = '2' + phone;
    }
    const msg = encodeURIComponent(
      `مرحباً م/ هبة عبدالوهاب، أود الاستفادة من محتوى: "${title}". يرجى التكرم بتوضيح تفاصيل الاشتراك.`
    );
    if (isPlatformBrowser(this.platformId)) {
      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    }
  }

  startPlacementExamForGrade(grade: IGradeLevelAvailability): void {
    this.selectedGradeCode.set(grade.code);
    this.closeTrackModal();
    const queryParams: Record<string, string> = {
      curriculum: this.selectedCurriculumCode(),
      gradeLevel: grade.code
    };
    if (this.currentCurriculumHasTerms()) {
      queryParams['term'] = this.selectedTermCode();
    }
    this.router.navigate(['/placement-test'], { queryParams });
  }

  openTrackModal(code: CurriculumCode): void {
    this.stopSilkLoop();
    this.ensureCurriculumTreeLoaded();
    this.selectedCurriculumCode.set(code);
    const curr = this.curriculumCards().find(c => c.code === code);
    if (curr && curr.availableGrades.length > 0) {
      const activeGrades = curr.availableGrades.filter(g => g.isActive ?? this.discoveryService.isGradeActive(g.code));
      this.selectedGradeCode.set(activeGrades.length > 0 ? activeGrades[0].code : curr.availableGrades[0].code);
    }
    this.modalStep.set('GRADES');
    this.activeStageFilter.set('ALL');
    this.isTrackModalOpen.set(true);
    this.emitSelection();

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const panel = document.querySelector('.track-panel-glass') || document.querySelector('#curriculum-section');
        if (panel) {
          panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    }
  }

  handleGradeCardClick(grade: any): void {
    if (grade.hasPublishedUnits && grade.publishedUnitsCount > 0) {
      this.openGradeUnits(grade.code);
    } else {
      const title = this.getGradeDisplayTitle(grade);
      this.triggerComingSoon(title);
    }
  }

  closeTrackModal(): void {
    this.isTrackModalOpen.set(false);
    this.modalStep.set('GRADES');
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.scheduleSilkRender();
        }, 60);
      });
    }
  }

  setStageFilter(filter: StageFilterType): void {
    this.activeStageFilter.set(filter);
  }

  openGradeUnits(gradeCode: string): void {
    this.selectedGradeCode.set(gradeCode);
    this.modalStep.set('UNITS');
    this.emitSelection();
    this.loadUnitsForSelection();

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const panel = document.querySelector('.track-panel-glass');
        if (panel) {
          panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    }
  }

  backToGrades(): void {
    this.modalStep.set('GRADES');
  }

  selectCurriculum(code: CurriculumCode): void {
    this.openTrackModal(code);
  }

  selectGrade(gradeCode: string): void {
    this.selectedGradeCode.set(gradeCode);
    this.emitSelection();
    this.loadUnitsForSelection();
  }

  selectTerm(term: AcademicTermCode): void {
    this.selectedTermCode.set(term);
    this.emitSelection();
    this.loadUnitsForSelection();
  }

  startPlacementExamForCurrentGrade(): void {
    this.closeTrackModal();
    const queryParams: Record<string, string> = {
      curriculum: this.selectedCurriculumCode(),
      gradeLevel: this.selectedGradeCode()
    };
    if (this.currentCurriculumHasTerms()) {
      queryParams['term'] = this.selectedTermCode();
    }
    this.router.navigate(['/placement-test'], { queryParams });
  }

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

  getDiscountPercentage(unit: any): number {
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
      return;
    }
    this.openUnitPreview(unit);
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

  openUnitPreview(unit: any): void {
    if (this.isUnitEmpty(unit)) {
      this.triggerComingSoon(unit?.title_ar || unit?.title_en);
      return;
    }
    this.selectedUnitForPreview.set(unit);
    this.isLoadingUnitContents.set(true);
    this.discoveryService.getUnitContents(unit._id).subscribe({
      next: data => {
        this.unitLectures.set(data?.lectures || []);
        this.isLoadingUnitContents.set(false);
      },
      error: () => {
        this.unitLectures.set([]);
        this.isLoadingUnitContents.set(false);
      }
    });
  }

  closeUnitPreview(): void {
    this.selectedUnitForPreview.set(null);
    this.unitLectures.set([]);
  }

  attemptWatchLecture(unit: any): void {
    if (this.isUnitEmpty(unit)) {
      this.triggerComingSoon(unit?.title_ar || unit?.title_en);
      return;
    }
    if (unit?.isSubscribed) {
      this.closeTrackModal();
      this.router.navigate(['/student/units', unit._id]);
    } else {
      this.openLockedContentModal(unit?.title_ar || unit?.title_en || (this.langService.isArabic() ? 'الوحدة الدراسية' : 'Study Unit'));
    }
  }

  closeAuthGateModal(): void {
    this.showAuthGateModal.set(false);
  }

  goToLogin(): void {
    const returnUrl = this.pendingTargetUrl();
    this.showAuthGateModal.set(false);
    this.router.navigate(['/login'], returnUrl ? { queryParams: { returnUrl } } : undefined);
  }

  goToSignup(): void {
    const returnUrl = this.pendingTargetUrl();
    this.showAuthGateModal.set(false);
    this.router.navigate(['/login'], { queryParams: { mode: 'signup', ...(returnUrl ? { returnUrl } : {}) } });
  }

  getGradeLabel(gradeCode?: string): string {
    if (!gradeCode) return '';
    const tracks = this.discoveryService.curriculaTracks();
    for (const track of tracks) {
      const g = track.grades.find(item => item.code === gradeCode);
      if (g) {
        return this.langService.isArabic() ? g.titleAr : (g.titleEn || g.titleAr);
      }
    }
    for (const c of CANONICAL_CURRICULUM_TREE) {
      const g = c.grades.find(item => item.code === gradeCode);
      if (g) {
        return this.langService.isArabic()
          ? `${g.stageAr} • ${g.shortLabelAr}`
          : `${g.stageEn} • ${g.shortLabelEn}`;
      }
    }
    return gradeCode;
  }

  getGradeSubtitle(grade: IGradeLevelAvailability): string {
    const isAr = this.langService.isArabic();
    if (grade.hasPublishedUnits && grade.publishedUnitsCount > 0) {
      return isAr
        ? `${grade.publishedUnitsCount} وحدات متاحة`
        : `${grade.publishedUnitsCount} Units Available`;
    }
    if (grade.hasPlacementTest) {
      return isAr ? 'امتحان تحديد المستوى متاح' : 'Placement Test Available';
    }
    return isAr ? 'Coming Soon (قريباً)' : 'Coming Soon (قريباً)';
  }

  getGradeMathIcon(code: string): 'operators' | 'division' | 'triangle' | 'calculus' {
    if (code.includes('SEC_2') || code.includes('SEC_3') || code.includes('11') || code.includes('12')) {
      return 'calculus';
    }
    if (code.includes('PREP_3') || code.includes('SEC_1') || code.includes('9') || code.includes('10')) {
      return 'triangle';
    }
    if (code.includes('PREP_1') || code.includes('PREP_2') || code.includes('7') || code.includes('8')) {
      return 'division';
    }
    return 'operators';
  }

  getGradeDisplayTitle(grade: IGradeLevelAvailability): string {
    const isAr = this.langService.isArabic();
    if (isAr && grade.titleAr) {
      return grade.titleAr;
    }
    if (!isAr && grade.titleEn) {
      return grade.titleEn;
    }
    const code = grade.code;
    switch (code) {
      case 'PRI_1': return isAr ? 'الأول الابتدائي' : 'Primary 1';
      case 'PRI_2': return isAr ? 'الثاني الابتدائي' : 'Primary 2';
      case 'PRI_3': return isAr ? 'الثالث الابتدائي' : 'Primary 3';
      case 'PRI_4': return isAr ? 'الرابع الابتدائي' : 'Primary 4';
      case 'PRI_5': return isAr ? 'الخامس الابتدائي' : 'Primary 5';
      case 'PRI_6': return isAr ? 'السادس الابتدائي' : 'Primary 6';
      case 'PREP_1': return isAr ? 'الأول الإعدادي' : 'Prep 1';
      case 'PREP_2': return isAr ? 'الثاني الإعدادي' : 'Prep 2';
      case 'PREP_3': return isAr ? 'الثالث الإعدادي' : 'Prep 3';
      case 'SEC_1': return isAr ? 'الأول الثانوي' : 'Secondary 1';
      case 'SEC_2': return isAr ? 'الثاني الثانوي' : 'Secondary 2';
      case 'SEC_3': return isAr ? 'الثالث الثانوي' : 'Secondary 3';
      case 'GRADE_1': return isAr ? 'الصف الأول' : 'Grade 1';
      case 'GRADE_2': return isAr ? 'الصف الثاني' : 'Grade 2';
      case 'GRADE_3': return isAr ? 'الصف الثالث' : 'Grade 3';
      case 'GRADE_4': return isAr ? 'الصف الرابع' : 'Grade 4';
      case 'GRADE_5': return isAr ? 'الصف الخامس' : 'Grade 5';
      case 'GRADE_6': return isAr ? 'الصف السادس' : 'Grade 6';
      case 'GRADE_7': return isAr ? 'الصف السابع' : 'Grade 7';
      case 'GRADE_8': return isAr ? 'الصف الثامن' : 'Grade 8';
      case 'GRADE_9': return isAr ? 'الصف التاسع' : 'Grade 9';
      case 'GRADE_10': return isAr ? 'الصف العاشر' : 'Grade 10';
      case 'GRADE_11': return isAr ? 'الصف الحادي عشر' : 'Grade 11';
      case 'GRADE_12': return isAr ? 'الصف الثاني عشر' : 'Grade 12';
      case 'US_GRADE_1': return isAr ? 'الصف الأول (الابتدائي)' : 'Grade 1';
      case 'US_GRADE_2': return isAr ? 'الصف الثاني (الابتدائي)' : 'Grade 2';
      case 'US_GRADE_3': return isAr ? 'الصف الثالث (الابتدائي)' : 'Grade 3';
      case 'US_GRADE_4': return isAr ? 'الصف الرابع (الابتدائي)' : 'Grade 4';
      case 'US_GRADE_5': return isAr ? 'الصف الخامس (الابتدائي)' : 'Grade 5';
      case 'US_GRADE_6': return isAr ? 'الصف السادس (الابتدائي)' : 'Grade 6';
      case 'US_GRADE_7': return isAr ? 'الصف السابع (المتوسط)' : 'Grade 7';
      case 'US_GRADE_8': return isAr ? 'الصف الثامن (المتوسط)' : 'Grade 8';
      case 'US_GRADE_9': return isAr ? 'الصف التاسع (أمريكي)' : 'US Grade 9';
      case 'US_GRADE_10': return isAr ? 'الصف العاشر (أمريكي)' : 'US Grade 10';
      case 'US_GRADE_11': return isAr ? 'الصف الحادي عشر (أمريكي)' : 'US Grade 11';
      case 'US_GRADE_12': return isAr ? 'الصف الثاني عشر (أمريكي)' : 'US Grade 12';
      case 'BACC_10': return isAr ? 'العاشر (بكالوريا)' : 'Bacc 10';
      case 'BACC_11': return isAr ? 'الحادي عشر (بكالوريا)' : 'Bacc 11';
      case 'BACC_12': return isAr ? 'الثاني عشر (بكالوريا)' : 'Bacc 12';
      case 'SAT': return 'Digital SAT';
      case 'SAT_1': return 'SAT 1';
      case 'SAT_2': return 'SAT 2';
      case 'SAT_MATH': return 'SAT Math';
      case 'EST_1': return 'EST 1';
      case 'EST_2': return 'EST 2';
      case 'EST_MATH': return 'EST Math';
      case 'ACT_1': return 'ACT 1';
      case 'ACT_2': return 'ACT 2';
      case 'ACT_MATH': return 'ACT Math';
      default:
        return isAr ? (grade.shortLabelAr || grade.titleAr) : (grade.shortLabelEn || grade.titleEn);
    }
  }

  getGradeStageLabel(grade: IGradeLevelAvailability): string {
    const isAr = this.langService.isArabic();
    const code = grade.code;
    if (code.startsWith('PRI') || code.includes('PRIMARY') || ['GRADE_1','GRADE_2','GRADE_3','GRADE_4','GRADE_5','GRADE_6'].includes(code)) {
      return isAr ? 'المرحلة الابتدائية' : 'Primary Stage';
    }
    if (code.startsWith('PREP') || code.includes('PREP') || ['GRADE_7','GRADE_8','GRADE_9'].includes(code)) {
      return isAr ? 'المرحلة الإعدادية' : 'Preparatory Stage';
    }
    if (code.startsWith('SEC') || code.includes('HIGH') || code.includes('SECONDARY') || ['GRADE_10','GRADE_11','GRADE_12'].includes(code)) {
      return isAr ? 'المرحلة الثانوية' : 'Secondary Stage';
    }
    return isAr ? (grade.stageAr || 'المرحلة الدراسية') : (grade.stageEn || 'Academic Stage');
  }

  getCurriculumSummary(code: CurriculumCode): string {
    const isAr = this.langService.isArabic();
    switch (code) {
      case 'EGYPTIAN': return isAr ? 'الثانوية العامة • صفوف 1-3 ثانوي' : 'Thanawiya Amma • Sec 1-3';
      case 'GULF': return isAr ? 'السعودية • الإمارات • الكويت • قطر' : 'KSA • UAE • Kuwait • Qatar';
      case 'INTERNATIONAL': return isAr ? 'كامبريدج • إدكسل • أكسفورد' : 'Cambridge • Edexcel • Oxford';
      case 'AMERICAN': return isAr ? 'Digital SAT • EST I & II • ACT' : 'Digital SAT • EST I & II • ACT';
    }
  }

  getCurriculumBranches(code: CurriculumCode): string {
    const isAr = this.langService.isArabic();
    switch (code) {
      case 'EGYPTIAN': return isAr ? 'الجبر والهندسة • التفاضل والتكامل • الاستاتيكا والديناميكا' : 'Algebra & Geometry • Calculus • Statics & Dynamics';
      case 'GULF': return isAr ? 'القدرات • التحصيلي • الرياضيات المتقدمة' : 'Qudurat • Tahsili • Advanced Math';
      case 'INTERNATIONAL': return isAr ? 'الرياضيات البحتة والميكانيكا والإحصاء' : 'OL & AL Pure Math • Mechanics • Statistics';
      case 'AMERICAN': return isAr ? 'الجبر المتقدم وحل المسائل الهندسية' : 'Heart of Algebra • Problem Solving • Advanced Math';
    }
  }

  getCurriculumBgImage(code: CurriculumCode): string {
    switch (code) {
      case 'AMERICAN':
        return '/assets/branding/curriculum-sat-mascot.jpg';
      case 'EGYPTIAN':
        return '/assets/branding/curriculum-egyptian-mascot.jpg';
      case 'GULF':
        return '/assets/branding/curriculum-gulf-mascot.jpg';
      case 'INTERNATIONAL':
      default:
        return '/assets/branding/curriculum-international-mascot.jpg';
    }
  }

  getCurriculumBgSrcset(code: CurriculumCode): string {
    const img = this.getCurriculumBgImage(code);
    return `${img} 512w, ${img} 1024w`;
  }

  getCurrentGradeUnitsBgImage(): string {
    return this.getCurriculumBgImage(this.selectedCurriculumCode());
  }

  private emitSelection(): void {
    this.selectionChange.emit({
      curriculum: this.selectedCurriculumCode(),
      gradeLevel: this.selectedGradeCode(),
      academicTerm: this.selectedTermCode()
    });
  }
}

// =============================================================================
// 4-Branch Card-Connected Spider Web Drawing Engine (Zero Drift, Stable, Muted)
// =============================================================================

function renderCardConnectedWeb(
  ctx: CanvasRenderingContext2D,
  origins: { x: number; y: number }[],
  anchors: { x: number; y: number }[],
  time: number,
  isMobile: boolean,
  isDark: boolean = true,
  measuredW?: number,
  measuredH?: number
): void {
  ctx.save();

  const dpr = typeof window !== 'undefined' && window.devicePixelRatio ? Math.min(window.devicePixelRatio, 2) : 1;
  const canvasW = measuredW ?? (ctx.canvas.width / dpr);
  const canvasH = measuredH ?? (ctx.canvas.height / dpr);

  // Soft subtle glow/shadow to ensure strands pop with clarity in both modes
  if (!isDark) {
    ctx.shadowColor = 'rgba(165, 110, 25, 0.28)';
    ctx.shadowBlur = 3;
  } else {
    ctx.shadowColor = 'rgba(212, 175, 106, 0.20)';
    ctx.shadowBlur = 2;
  }

  // 4 Card Branches:
  // All rays converge DIRECTLY into the spider limbs (ZERO air gap on sides)
  // Each branch has exactly 3 balanced rays: Outer Companion, Center Guide, Inner Companion
  // This yields the identical perfect symmetry praised on Branches 2 & 3 across all 4 cards.

  // Mobile Concentric Web Arcs radiating around the spider mascot
  if (isMobile && origins.length >= 4) {
    const cx = (origins[0].x + origins[1].x + origins[2].x + origins[3].x) / 4;
    const cy = (origins[0].y + origins[1].y + origins[2].y + origins[3].y) / 4;
    const baseR = Math.hypot(origins[0].x - cx, origins[0].y - cy);
    const ringRadii = [
      baseR * 1.25,
      baseR * 1.75,
      baseR * 2.30,
      baseR * 2.95,
      baseR * 3.65,
      baseR * 4.40,
      baseR * 5.25
    ];

    ctx.save();
    for (let r = 0; r < ringRadii.length; r++) {
      const radius = ringRadii[r];
      const pulse = Math.sin(time * 1.2 + r * 0.9) * 1.3;
      const alpha = Math.max(0.04, 0.35 * Math.pow(0.72, r));
      ctx.strokeStyle = isDark
        ? `rgba(212, 175, 106, ${alpha.toFixed(3)})`
        : `rgba(160, 105, 22, ${Math.min(0.85, alpha * 2.2).toFixed(3)})`;
      ctx.lineWidth = isDark
        ? Math.max(0.35, 0.65 * Math.pow(0.88, r))
        : Math.max(0.55, 1.25 * Math.pow(0.88, r));
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(10, radius + pulse), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Downward radiating spokes from center extending towards the bottom edge (y = H) with organic wave sway
    const downwardSpokeAngles = [
      0.28 * Math.PI,
      0.36 * Math.PI,
      0.44 * Math.PI,
      0.52 * Math.PI,
      0.60 * Math.PI,
      0.68 * Math.PI
    ];

    ctx.save();
    for (let s = 0; s < downwardSpokeAngles.length; s++) {
      const angle = downwardSpokeAngles[s];
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const startR = baseR * 1.15;
      const startX = cx + cosA * startR;
      const startY = cy + sinA * startR;

      const distToBottom = (canvasH - startY) / (sinA || 0.001);
      const endX = startX + cosA * distToBottom;
      const endY = canvasH;

      const segs = 18;
      ctx.beginPath();
      for (let k = 0; k <= segs; k++) {
        const t = k / segs;
        const envelope = Math.sin(t * Math.PI);
        const sway = Math.sin(time * 1.15 + t * 2.6 + s * 0.9) * 2.4 * envelope;
        const px = startX + (endX - startX) * t + sway;
        const py = startY + (endY - startY) * t;

        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }

      ctx.strokeStyle = isDark ? 'rgba(212, 175, 106, 0.16)' : 'rgba(160, 105, 22, 0.45)';
      ctx.lineWidth = isDark ? 0.45 : 0.85;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Precision card-surface horizontal spreading (Zero Ray Drift, Zero Air Gap)
  // At the card anchor, y must ALWAYS equal anchor.y so rays NEVER float in the air or penetrate!
  const makeBranchRays = (origin: { x: number; y: number }, anchor: { x: number; y: number }, isOuter: boolean) => {
    const dx = anchor.x - origin.x;
    const dy = anchor.y - origin.y;
    const spreadX = isMobile ? 12 : (isOuter ? 22 : 18);
    let sag = isOuter ? 0.038 : 0.055;
    if (isMobile && dy < 0) {
      sag = -sag;
    }

    return [
      { s: { x: origin.x - 2.5, y: origin.y }, c: { x: anchor.x - spreadX, y: anchor.y }, sag: sag * 1.08 },
      { s: origin, c: anchor, sag: sag },
      { s: { x: origin.x + 2.5, y: origin.y }, c: { x: anchor.x + spreadX, y: anchor.y }, sag: sag * 1.08 },
    ];
  };

  const branch1Rays = makeBranchRays(origins[0], anchors[0], true);
  const branch2Rays = makeBranchRays(origins[1], anchors[1], false);
  const branch3Rays = makeBranchRays(origins[2], anchors[2], false);
  const branch4Rays = makeBranchRays(origins[3], anchors[3], true);

  const branches = [branch1Rays, branch2Rays, branch3Rays, branch4Rays];

  // -------------------------------------------------------------------------
  // Coherent, Fluid Organic Silk Sway Engine
  // Strict boundary condition: envelope = sin(t * PI) = 0 at t=0 and t=1
  // Guaranteeing ZERO detachment from paws and cards at all times!
  // -------------------------------------------------------------------------
  const getRayPoint = (
    s: { x: number; y: number },
    c: { x: number; y: number },
    sag: number,
    t: number,
    branchIdx: number,
    rayIdx: number
  ) => {
    const envelope = Math.sin(t * Math.PI);
    const dist = Math.hypot(c.x - s.x, c.y - s.y);
    const primaryWave = Math.sin(time * 1.15 + t * 2.8 + branchIdx * 0.9 + rayIdx * 0.15);
    const secondaryWave = 0.35 * Math.sin(time * 1.8 + t * 4.5 + branchIdx * 1.2);
    const swayX = (primaryWave + secondaryWave) * 2.8 * envelope;
    const swayY = Math.sin(time * 0.90 + t * 2.4 + branchIdx * 0.8 + rayIdx * 0.1) * 1.6 * envelope;
    const sagY = dist * sag * envelope;
    return {
      x: s.x + (c.x - s.x) * t + swayX,
      y: s.y + (c.y - s.y) * t + sagY + swayY
    };
  };

  // =========================================================================
  // 1. Draw Inward-Scalloped Cross-Threads for each Branch with Fluid Wave Sway
  // =========================================================================
  ctx.strokeStyle = isDark ? 'rgba(212, 175, 106, 0.35)' : 'rgba(160, 105, 20, 0.80)';
  ctx.lineWidth = isDark ? 0.55 : 1.05;

  const ringT = isMobile ? [0.35, 0.65] : [0.22, 0.42, 0.62, 0.80];

  for (let b = 0; b < branches.length; b++) {
    const rays = branches[b];

    for (const t of ringT) {
      const envelope = Math.sin(t * Math.PI);

      for (let r = 0; r < rays.length - 1; r++) {
        const r1 = rays[r];
        const r2 = rays[r + 1];

        const p1 = getRayPoint(r1.s, r1.c, r1.sag, t, b, r);
        const p2 = getRayPoint(r2.s, r2.c, r2.sag, t, b, r + 1);

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        // Normal perpendicular scallop pointing towards spider hub (identical on all branches)
        const cdx = p2.x - p1.x;
        const cdy = p2.y - p1.y;
        const chordLen = Math.hypot(cdx, cdy) || 1;
        let nx = -cdy / chordLen;
        let ny = cdx / chordLen;
        const branchDy = anchors[b] ? (anchors[b].y - origins[b].y) : 1;
        if (isMobile && branchDy < 0) {
          if (ny < 0) { nx = -nx; ny = -ny; } // Point down towards spider paws
        } else {
          if (ny > 0) { nx = -nx; ny = -ny; } // Point up towards spider paws
        }

        const dip = Math.min(chordLen * 0.26, 7);
        const arcBreathing = Math.sin(time * 1.1 + t * 3.2 + b) * 1.2 * envelope;
        const ctrlX = midX + nx * (dip + arcBreathing);
        const ctrlY = midY + ny * (dip + arcBreathing);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(ctrlX, ctrlY, p2.x, p2.y);
        ctx.stroke();

        // Subtle stationary silk node locked to intersection
        ctx.fillStyle = isDark ? 'rgba(255, 250, 235, 0.45)' : 'rgba(140, 85, 12, 0.95)';
        const nodeRadius = isDark ? 0.85 : 1.35;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, nodeRadius, 0, Math.PI * 2);
        ctx.fill();
        if (r === rays.length - 2) {
          ctx.beginPath();
          ctx.arc(p2.x, p2.y, nodeRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // =========================================================================
  // 2. Draw Fanning Web Spokes with Organic Harmonic Sway
  // =========================================================================
  ctx.strokeStyle = isDark ? 'rgba(212, 175, 106, 0.28)' : 'rgba(170, 115, 25, 0.72)';
  ctx.lineWidth = isDark ? 0.5 : 0.95;

  for (let b = 0; b < branches.length; b++) {
    const rays = branches[b];
    for (let r = 0; r < rays.length; r++) {
      if (r === 1) continue; // Ray 1 is the main center guide strand, drawn in Section 3

      const ray = rays[r];
      const segs = isMobile ? 14 : 22;

      ctx.beginPath();
      for (let k = 0; k <= segs; k++) {
        const t = k / segs;
        const pt = getRayPoint(ray.s, ray.c, ray.sag, t, b, r);
        if (k === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }
  }

  // =========================================================================
  // 3. Draw the 4 Main Guide Strands (Soft Silk Sway, NO moving light pulse)
  // =========================================================================
  for (let i = 0; i < 4; i++) {
    const s = origins[i];
    const c = anchors[i];
    if (!s || !c) continue;

    const isOuter = (i === 0 || i === 3);
    const sagBase = isOuter ? 0.038 : 0.055;
    const segs = isMobile ? 18 : 28;

    // --- Soft Core Silk Strand (Fluid Silky Sway) ---
    ctx.beginPath();
    for (let k = 0; k <= segs; k++) {
      const t = k / segs;
      const pt = getRayPoint(s, c, sagBase, t, i, 1);
      if (k === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.strokeStyle = isDark ? 'rgba(240, 222, 175, 0.62)' : 'rgba(145, 88, 12, 0.98)';
    ctx.lineWidth = isDark ? 0.75 : 1.55;
    ctx.stroke();

    // --- Delicate Whispering Companion (Twinned Silk Effect) ---
    ctx.beginPath();
    for (let k = 0; k <= segs; k++) {
      const t = k / segs;
      const pt = getRayPoint(s, c, sagBase * 1.22, t, i, 1);
      if (k === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.strokeStyle = isDark ? 'rgba(212, 175, 106, 0.35)' : 'rgba(175, 120, 28, 0.80)';
    ctx.lineWidth = isDark ? 0.4 : 0.95;
    ctx.stroke();
  }

  // Apply a smooth vertical fade gradient near y = H - 40px to H so the spider web dissolves seamlessly
  const fadeH = 40;
  if (canvasH > fadeH) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    const bottomFade = ctx.createLinearGradient(0, canvasH - fadeH, 0, canvasH);
    bottomFade.addColorStop(0, 'rgba(0, 0, 0, 0)');
    bottomFade.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx.fillStyle = bottomFade;
    ctx.fillRect(0, canvasH - fadeH, canvasW, fadeH);
    ctx.restore();
  }

  ctx.restore();
}

function drawSubtleCardAnchorFlare(ctx: CanvasRenderingContext2D, x: number, y: number, isDark: boolean = true): void {
  ctx.save();

  if (isDark) {
    // Dimmed, soft, subtle halo (reduced from 16px to 8px, opacity 0.35)
    const grad = ctx.createRadialGradient(x, y, 0, x, y, 8);
    grad.addColorStop(0, 'rgba(255, 250, 235, 0.55)');
    grad.addColorStop(0.4, 'rgba(245, 215, 142, 0.35)');
    grad.addColorStop(1, 'rgba(212, 175, 106, 0)');

    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Subtle horizontal contact line
    ctx.beginPath();
    ctx.ellipse(x, y, 10, 1.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245, 225, 170, 0.45)';
    ctx.fill();

    // Subtle center pinhead point
    ctx.beginPath();
    ctx.arc(x, y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fill();
  } else {
    // Light Mode: High-contrast warm amber-gold flare against ivory cards
    const grad = ctx.createRadialGradient(x, y, 0, x, y, 10);
    grad.addColorStop(0, 'rgba(185, 125, 25, 0.70)');
    grad.addColorStop(0.5, 'rgba(212, 165, 75, 0.35)');
    grad.addColorStop(1, 'rgba(212, 175, 106, 0)');

    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Prominent warm contact line
    ctx.beginPath();
    ctx.ellipse(x, y, 12, 1.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(160, 100, 18, 0.90)';
    ctx.fill();

    // Center pinhead point
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(130, 75, 8, 1)';
    ctx.fill();
  }

  ctx.restore();
}
