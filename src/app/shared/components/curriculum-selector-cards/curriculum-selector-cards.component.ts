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
  AcademicTermCode
} from '../../../core/constants/curriculum-tree.constant';
import { PublicDiscoveryService } from '../../../core/services/public-discovery.service';
import { ICurriculumTreeItem } from '../../../core/services/public-discovery.models';
import {
  ICurriculumSelection,
  ICurriculumUiCard,
  IGradeLevelAvailability
} from './curriculum-selector-cards.models';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { ThemeService } from '../../../core/seo-theme-i18n/theme.service';
import { AuthService } from '../../../core/auth/auth.service';

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
  private mobileAnimFrameId = 0;
  private cardAnchorsDesktop: { x: number; y: number }[] = [];

  // Computed: Merges CANONICAL_CURRICULUM_TREE with dynamic availability flags from MongoDB
  readonly curriculumCards = computed<ICurriculumUiCard[]>(() => {
    const rawTree = this.dynamicTree();
    return CANONICAL_CURRICULUM_TREE.map(node => {
      const serverCurriculum = rawTree.find(c => c.curriculum === node.code);
      const availableGrades: IGradeLevelAvailability[] = node.grades.map(grade => {
        const serverGrade = serverCurriculum?.gradeLevels.find(g => g.gradeLevel === grade.code);
        const hasPublished = serverGrade ? serverGrade.hasPublishedUnits : false;
        const count = serverGrade ? serverGrade.totalPublishedUnitsCount : 0;
        const isAvail = serverGrade ? serverGrade.isAvailable : false;
        return {
          ...grade,
          isAvailable: isAvail,
          hasPublishedUnits: hasPublished,
          publishedUnitsCount: count
        };
      });

      return {
        ...node,
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

  // Filtered grades for the Frosted Glass Modal according to activeStageFilter (Matching Mockup Image 2)
  readonly filteredGradesForModal = computed<IGradeLevelAvailability[]>(() => {
    const curr = this.selectedCurriculum();
    if (!curr) return [];
    const filter = this.activeStageFilter();

    if (filter === 'ALL') {
      // Mockup Image 2: Exact 8-Card Grid (4 columns x 2 rows)
      if (curr.code === 'EGYPTIAN') {
        const allowed = ['PRI_4', 'PRI_5', 'PRI_6', 'PREP_1', 'PREP_2', 'PREP_3', 'SEC_1', 'SEC_2'];
        return curr.availableGrades.filter(g => allowed.includes(g.code));
      }
      if (curr.code === 'AMERICAN') {
        const allowed = ['GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12', 'SAT_1', 'SAT_2', 'EST_1', 'ACT_1'];
        return curr.availableGrades.filter(g => allowed.includes(g.code));
      }
      if (curr.code === 'GULF') {
        const allowed = ['GRADE_5', 'GRADE_6', 'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12'];
        return curr.availableGrades.filter(g => allowed.includes(g.code));
      }
      if (curr.code === 'INTERNATIONAL') {
        const allowed = ['IGCSE_YEAR_5', 'IGCSE_YEAR_6', 'IGCSE_YEAR_7', 'IGCSE_YEAR_8', 'IGCSE_YEAR_9', 'IGCSE_OL', 'IGCSE_AS', 'IGCSE_AL'];
        return curr.availableGrades.filter(g => allowed.includes(g.code));
      }
      return curr.availableGrades.slice(0, 8);
    }

    return curr.availableGrades.filter(g => {
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
          code.startsWith('US_GRADE_6') ||
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
          code.startsWith('SEC') ||
          code.startsWith('SAT') ||
          code.startsWith('EST') ||
          code.startsWith('ACT') ||
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
        this.loadUnitsForSelection();
      }
    });
  }

  ngOnInit(): void {
    this.selectedCurriculumCode.set(this.initialCurriculum());
    this.selectedGradeCode.set(this.initialGrade());
    this.selectedTermCode.set(this.initialTerm());

    this.loadUnitsForSelection();

    this.discoveryService.getCurriculumTree().subscribe({
      next: tree => {
        this.dynamicTree.set(tree);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initSilkCanvas(), 250);
      if (typeof window !== 'undefined') {
        const onResize = () => this.initSilkCanvas();
        (window as any).__silkResizeHandler = onResize;
        window.addEventListener('resize', onResize);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.silkAnimFrameId) cancelAnimationFrame(this.silkAnimFrameId);
    if (this.mobileAnimFrameId) cancelAnimationFrame(this.mobileAnimFrameId);
    if (typeof window !== 'undefined' && (window as any).__silkResizeHandler) {
      window.removeEventListener('resize', (window as any).__silkResizeHandler);
    }
  }

  private initSilkCanvas(): void {
    this.initDesktopSilk();
    this.initMobileSilk();
  }

  // ── Desktop Silk: 4 Card-Connected Branches (Zero Gap, No Middle Droop, Muted Glow) ──
  private initDesktopSilk(): void {
    const canvasEl = this.silkCanvasDesktopRef?.nativeElement;
    const containerEl = this.desktopContainerRef?.nativeElement;
    const spiderEl = this.spiderDesktopRef?.nativeElement;
    if (!canvasEl || !containerEl || !spiderEl) return;

    const dpr = window.devicePixelRatio || 1;
    const containerRect = containerEl.getBoundingClientRect();
    const W = containerRect.width;
    const H = containerRect.height;
    if (W === 0 || H === 0) return;

    canvasEl.width = W * dpr;
    canvasEl.height = H * dpr;
    canvasEl.style.width = W + 'px';
    canvasEl.style.height = H + 'px';
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Spider element relative to container
    const spiderRect = spiderEl.getBoundingClientRect();
    const spiderX = spiderRect.left - containerRect.left;
    const spiderY = spiderRect.top - containerRect.top;
    const spiderW = spiderRect.width;
    const spiderH = spiderRect.height;

    // EXACT spider limb origins (Zero Gap):
    const spiderOrigins = [
      { x: spiderX + spiderW * 0.20, y: spiderY + spiderH * 0.72 },  // Outer Left Leg -> Card 1
      { x: spiderX + spiderW * 0.43, y: spiderY + spiderH * 0.67 },  // Left Front Claw -> Card 2
      { x: spiderX + spiderW * 0.57, y: spiderY + spiderH * 0.67 },  // Right Front Claw -> Card 3
      { x: spiderX + spiderW * 0.80, y: spiderY + spiderH * 0.72 },  // Outer Right Leg -> Card 4
    ];

    // Card anchors on top-center edge of the 4 cards
    const cardEls = containerEl.querySelectorAll<HTMLElement>('.curriculum-card');
    this.cardAnchorsDesktop = [];
    for (let i = 0; i < 4; i++) {
      if (cardEls[i]) {
        const r = cardEls[i].getBoundingClientRect();
        this.cardAnchorsDesktop.push({
          x: r.left - containerRect.left + r.width * 0.5,
          y: r.top - containerRect.top + 1
        });
      } else {
        this.cardAnchorsDesktop.push({ x: W * (0.125 + i * 0.25), y: H * 0.85 });
      }
    }

    if (this.silkAnimFrameId) cancelAnimationFrame(this.silkAnimFrameId);
    if (this.mobileAnimFrameId) cancelAnimationFrame(this.mobileAnimFrameId);

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      const time = performance.now() * 0.001;
      const isDark = this.themeService.isDark();

      // Draw the 4 Card-Connected Web Branches (No middle web, stretched to cards, high-contrast in light mode)
      renderCardConnectedWeb(ctx, spiderOrigins, this.cardAnchorsDesktop, time, false, isDark);

      // Draw Subtle Card Anchor Flares
      for (const anchor of this.cardAnchorsDesktop) {
        drawSubtleCardAnchorFlare(ctx, anchor.x, anchor.y, isDark);
      }

      this.silkAnimFrameId = requestAnimationFrame(animate);
    };

    this.ngZone.runOutsideAngular(() => {
      animate();
    });
  }

  // ── Mobile Silk (Dynamic 2x2 Web Branching to Top 2 & Bottom 2 Cards) ──
  private initMobileSilk(): void {
    const canvasEl = this.silkCanvasMobileRef?.nativeElement;
    const containerEl = this.mobileContainerRef?.nativeElement;
    const spiderEl = this.spiderMobileRef?.nativeElement;
    if (!canvasEl || !containerEl || !spiderEl) return;

    const dpr = window.devicePixelRatio || 1;
    let containerRect = containerEl.getBoundingClientRect();
    let W = containerRect.width;
    let H = containerRect.height;
    if (W === 0 || H === 0) return;

    canvasEl.width = W * dpr;
    canvasEl.height = H * dpr;
    canvasEl.style.width = W + 'px';
    canvasEl.style.height = H + 'px';
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

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

    const refreshMobileMeasurements = () => {
      const curContainerRect = containerEl.getBoundingClientRect();
      if (curContainerRect.width !== W || curContainerRect.height !== H) {
        W = curContainerRect.width;
        H = curContainerRect.height;
        canvasEl.width = W * dpr;
        canvasEl.height = H * dpr;
        canvasEl.style.width = W + 'px';
        canvasEl.style.height = H + 'px';
        ctx.scale(dpr, dpr);
      }

      const cardEls = containerEl.querySelectorAll<HTMLElement>('.curriculum-card');
      if (cardEls.length >= 4) {
        const r0 = cardEls[0].getBoundingClientRect();
        const r1 = cardEls[1].getBoundingClientRect();
        const r2 = cardEls[2].getBoundingClientRect();
        const r3 = cardEls[3].getBoundingClientRect();

        if (r0.height > 10 && r2.height > 10) {
          cardAnchors[0] = { x: r0.left - curContainerRect.left + r0.width * 0.5, y: r0.bottom - curContainerRect.top };
          cardAnchors[1] = { x: r1.left - curContainerRect.left + r1.width * 0.5, y: r1.bottom - curContainerRect.top };
          cardAnchors[2] = { x: r2.left - curContainerRect.left + r2.width * 0.5, y: r2.top - curContainerRect.top };
          cardAnchors[3] = { x: r3.left - curContainerRect.left + r3.width * 0.5, y: r3.top - curContainerRect.top };
        }
      }

      const curSpiderRect = spiderEl.getBoundingClientRect();
      if (curSpiderRect.width > 20) {
        const sx = curSpiderRect.left - curContainerRect.left;
        const sy = curSpiderRect.top - curContainerRect.top;
        const sw = curSpiderRect.width;
        const sh = curSpiderRect.height;

        // Accurate limb points from spider mascot proportions:
        spiderOrigins[0] = { x: sx + sw * 0.20, y: sy + sh * 0.46 }; // Upper-left joint -> Card 0
        spiderOrigins[1] = { x: sx + sw * 0.80, y: sy + sh * 0.46 }; // Upper-right joint -> Card 1
        spiderOrigins[2] = { x: sx + sw * 0.22, y: sy + sh * 0.74 }; // Lower-left paw -> Card 2
        spiderOrigins[3] = { x: sx + sw * 0.78, y: sy + sh * 0.74 }; // Lower-right paw -> Card 3
      }
    };

    refreshMobileMeasurements();

    if (this.mobileAnimFrameId) cancelAnimationFrame(this.mobileAnimFrameId);

    let frameCount = 0;
    const animateMob = () => {
      frameCount++;
      // Dynamically sync measurements every 30 frames to track any layout shifts or responsive resizing
      if (frameCount % 30 === 0) {
        refreshMobileMeasurements();
      }

      ctx.clearRect(0, 0, W, H);
      const time = performance.now() * 0.001;
      const isDark = this.themeService.isDark();

      renderCardConnectedWeb(ctx, spiderOrigins, cardAnchors, time, true, isDark);

      for (const anchor of cardAnchors) {
        drawSubtleCardAnchorFlare(ctx, anchor.x, anchor.y, isDark);
      }

      this.mobileAnimFrameId = requestAnimationFrame(animateMob);
    };

    this.ngZone.runOutsideAngular(() => {
      animateMob();
    });
  }

  loadUnitsForSelection(): void {
    this.isLoadingUnits.set(true);
    this.discoveryService.getUnitsCatalog(
      this.selectedCurriculumCode(),
      this.selectedGradeCode(),
      this.selectedTermCode()
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

  openTrackModal(code: CurriculumCode): void {
    this.selectedCurriculumCode.set(code);
    const curr = this.curriculumCards().find(c => c.code === code);
    if (curr && curr.availableGrades.length > 0) {
      const p4 = curr.availableGrades.find(g => g.code === 'PRI_4' || g.code === 'GRADE_4');
      this.selectedGradeCode.set(p4 ? p4.code : curr.availableGrades[0].code);
    }
    this.modalStep.set('GRADES');
    this.activeStageFilter.set('ALL');
    this.isTrackModalOpen.set(true);
    this.emitSelection();
  }

  closeTrackModal(): void {
    this.isTrackModalOpen.set(false);
    this.modalStep.set('GRADES');
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initSilkCanvas();
      }, 60);
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
    this.router.navigate(['/placement-test'], {
      queryParams: {
        curriculum: this.selectedCurriculumCode(),
        gradeLevel: this.selectedGradeCode(),
        term: this.selectedTermCode()
      }
    });
  }

  openUnitPreview(unit: any): void {
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
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/student/units', unit._id]);
    } else {
      this.showAuthGateModal.set(true);
    }
  }

  closeAuthGateModal(): void {
    this.showAuthGateModal.set(false);
  }

  goToLogin(): void {
    this.showAuthGateModal.set(false);
    this.router.navigate(['/login']);
  }

  goToSignup(): void {
    this.showAuthGateModal.set(false);
    this.router.navigate(['/login'], { queryParams: { mode: 'signup' } });
  }

  getGradeLabel(gradeCode?: string): string {
    if (!gradeCode) return '';
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
    const code = grade.code;

    if (code === 'PRI_4' || code === 'GRADE_4') {
      return isAr ? '6 وحدات • الجبر والحساب' : '6 Units • Algebra & Arithmetic';
    }
    if (code === 'PRI_5' || code === 'GRADE_5') {
      return isAr ? '6 وحدات • أساسيات الرياضيات' : '6 Units • Math Fundamentals';
    }
    if (code === 'PRI_6' || code === 'GRADE_6') {
      return isAr ? '7 وحدات • الهندسة والجبر' : '7 Units • Geometry & Algebra';
    }
    if (code === 'PREP_1' || code === 'GRADE_7') {
      return isAr ? '5 وحدات • الجبر والهندسة' : '5 Units • Algebra & Geometry';
    }
    if (code === 'PREP_2' || code === 'GRADE_8') {
      return isAr ? '6 وحدات • الجبر والهندسة' : '6 Units • Algebra & Geometry';
    }
    if (code === 'PREP_3' || code === 'GRADE_9') {
      return isAr ? '5 وحدات • الجبر، الهندسة وحساب المثلثات' : '5 Units • Algebra, Geometry & Trig';
    }
    if (code === 'SEC_1' || code === 'GRADE_10') {
      return isAr ? '6 وحدات • الجبر، المثلثات والهندسة' : '6 Units • Algebra, Trig & Geometry';
    }
    if (code === 'SEC_2' || code === 'GRADE_11') {
      return isAr ? '8 وحدات • التفاضل، الجبر والميكانيكا' : '8 Units • Calculus, Algebra & Mechanics';
    }
    if (code === 'SEC_3' || code === 'GRADE_12') {
      return isAr ? '10 وحدات • الرياضيات البحتة والتطبيقية' : '10 Units • Pure & Applied Mathematics';
    }

    const count = grade.publishedUnitsCount || 6;
    return isAr ? `${count} وحدات • منهج متكامل` : `${count} Units • Complete Curriculum`;
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
  isDark: boolean = true
): void {
  ctx.save();

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
    const ringRadii = [baseR * 1.25, baseR * 1.75, baseR * 2.30];

    ctx.save();
    for (let r = 0; r < ringRadii.length; r++) {
      const radius = ringRadii[r];
      const pulse = Math.sin(time * 1.2 + r * 0.9) * 1.3;
      ctx.strokeStyle = r === 1
        ? (isDark ? 'rgba(212, 175, 106, 0.35)' : 'rgba(160, 105, 22, 0.85)')
        : (isDark ? 'rgba(212, 175, 106, 0.22)' : 'rgba(175, 120, 30, 0.55)');
      ctx.lineWidth = r === 1 ? (isDark ? 0.65 : 1.25) : (isDark ? 0.45 : 0.85);
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(10, radius + pulse), 0, Math.PI * 2);
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
