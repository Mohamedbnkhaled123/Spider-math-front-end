import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  effect,
  inject,
  OnInit,
  OnDestroy,
  output,
  PLATFORM_ID,
  HostListener
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { timeout, Subscription } from 'rxjs';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { ImageCompressorUploaderComponent } from '../../../shared/components/image-compressor-uploader/image-compressor-uploader.component';
import {
  AssessmentItem,
  AssessmentQuestionItem
} from './assessment-studio.models';
import {
  CANONICAL_CURRICULUM_TREE,
  curriculumHasTerms,
  findGulfCountry,
  IGulfStageDefinition,
  INTERNATIONAL_DIVISIONS_DATA,
  findInternationalDivision
} from '../../../core/constants/curriculum-tree.constant';
import { sortGradesDescending } from '../curriculum-studio/curriculum-studio.component';
import {
  CurriculumCode,
  AcademicTermCode,
  CalculatorMode,
  QuestionType,
  GradeOption,
  CurriculumTrackItem
} from '../curriculum-studio/curriculum-studio.models';
import { AssessmentDraftService } from '../../../core/offline-db/assessment-draft.service';
import { AssessmentDraft } from '../../../core/offline-db/assessment-draft.models';
import { AiExtractionSessionService } from '../../../core/offline-db/ai-extraction-session.service';
import { ModalNavigationService } from '../../../core/services/modal-navigation.service';
import { SwrCacheService } from '../../../core/services/swr-cache.service';
import { UiLayoutService } from '../../../core/services/ui-layout.service';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 14: Dedicated Assessment & Exam Studio Component
 * 
 * Centralized Assessment Bank, Safe Exam Creator, Question Level Visual Editor,
 * Strict Grade-Level Isolation, and Custom In-App Decision Confirmation.
 */
import { ScheduleAlarmPickerComponent } from '../../../shared/components/schedule-alarm-picker/schedule-alarm-picker.component';
import { MathFormulaComponent } from '../../../shared/components/math-formula/math-formula.component';
import { MathVirtualKeyboardComponent } from '../../../shared/components/math-virtual-keyboard/math-virtual-keyboard.component';
import { toVisualMath, stripLatexDelimiters } from '../../../shared/components/math-virtual-keyboard/math-virtual-keyboard.models';
import { AiQuestionExtractionModalComponent } from './ai-question-extraction-modal/ai-question-extraction-modal.component';
import { ICachedFileSession } from './ai-question-extraction-modal/ai-question-extraction-modal.models';
import { ManualImageSlicerModalComponent } from '../../../shared/components/manual-image-slicer-modal/manual-image-slicer-modal.component';
import { ISliceResult } from '../../../shared/components/manual-image-slicer-modal/manual-image-slicer-modal.models';
import { AssessmentPreviewModalComponent } from './assessment-preview-modal/assessment-preview-modal.component';

/**
 * Timezone Drift Fix (Fix #2): Converts UTC/ISO timestamp to local input string (YYYY-MM-DDTHH:mm)
 * preserving browser local time without UTC offset skew.
 */
export function toLocalDatetimeInputValue(isoDateStr?: string | null): string {
  if (!isoDateStr) return '';
  const d = new Date(isoDateStr);
  if (isNaN(d.getTime())) return '';
  const tzOffsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

interface AssessmentCacheEntry {
  items: AssessmentItem[];
  timestamp: number;
}
const ASSESSMENTS_MEMORY_CACHE = new Map<string, AssessmentCacheEntry>();

@Component({
  selector: 'app-assessment-studio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppIconComponent,
    ImageCompressorUploaderComponent,
    ScheduleAlarmPickerComponent,
    MathFormulaComponent,
    MathVirtualKeyboardComponent,
    AiQuestionExtractionModalComponent,
    ManualImageSlicerModalComponent,
    AssessmentPreviewModalComponent
  ],
  templateUrl: './assessment-studio.component.html',
  styleUrl: './assessment-studio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssessmentStudioComponent implements OnInit, OnDestroy {
  readonly toVisualMath = toVisualMath;
  readonly stripLatexDelimiters = stripLatexDelimiters;
  readonly langService = inject(LangService);
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  readonly draftService = inject(AssessmentDraftService);
  private readonly aiExtractionSessionService = inject(AiExtractionSessionService);
  private readonly swrCache = inject(SwrCacheService);
  private readonly uiLayoutService = inject(UiLayoutService);
  private readonly modalNav = inject(ModalNavigationService);

  readonly toastTriggered = output<{ text: string; type: 'success' | 'warning' | 'error' }>();

  // Teacher Draft Auto-Save State (Phase 15 - Milestone 2 - R2)
  readonly pendingDraft = signal<AssessmentDraft | null>(null);

  // Simulation Preview State (Phase 15 - Milestone 3 - R3)
  readonly previewAssessment = signal<AssessmentItem | null>(null);
  readonly isPreviewModalOpen = signal<boolean>(false);

  openPreviewModal(item: AssessmentItem): void {
    this.previewAssessment.set(item);
    this.isPreviewModalOpen.set(true);
  }

  closePreviewModal(): void {
    this.isPreviewModalOpen.set(false);
    this.previewAssessment.set(null);
  }

  // Filter Signals (persisted per teacher selection, dynamically loaded from active grades)
  readonly selectedCurriculum = signal<CurriculumCode>('EGYPTIAN');
  readonly selectedGrade = signal<string>('');
  readonly selectedTerm = signal<AcademicTermCode>('TERM_1');
  readonly selectedGulfCountry = signal<'SA' | 'QA' | 'AE' | 'KW'>('SA');
  readonly selectedIntlDivision = signal<'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM'>('AMERICAN_CURRICULUM');
  readonly createGulfCountry = signal<'SA' | 'QA' | 'AE' | 'KW'>('SA');
  readonly createIntlDivision = signal<'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM'>('AMERICAN_CURRICULUM');
  readonly editorGulfCountry = signal<'SA' | 'QA' | 'AE' | 'KW'>('SA');
  readonly editorIntlDivision = signal<'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM'>('AMERICAN_CURRICULUM');

  readonly GULF_COUNTRIES = [
    { code: 'SA' as const, nameAr: 'المملكة العربية السعودية', shortNameAr: 'السعودية', nameEn: 'Saudi Arabia', shortNameEn: 'Saudi', flag: '' },
    { code: 'QA' as const, nameAr: 'دولة قطر', shortNameAr: 'قطر', nameEn: 'Qatar', shortNameEn: 'Qatar', flag: '' },
    { code: 'AE' as const, nameAr: 'الإمارات العربية المتحدة', shortNameAr: 'الإمارات', nameEn: 'United Arab Emirates', shortNameEn: 'UAE', flag: '' },
    { code: 'KW' as const, nameAr: 'دولة الكويت', shortNameAr: 'الكويت', nameEn: 'Kuwait', shortNameEn: 'Kuwait', flag: '' }
  ];

  // State
  readonly assessmentsList = signal<AssessmentItem[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  private autoPersistSub: Subscription | null = null;
  private closingFromExplicitSave = false;
  private isDestroyed = false;

  // Active Grades & Tracks State
  readonly activeGrades = signal<string[]>([]);
  readonly currentCurriculumHasTerms = computed<boolean>(() => curriculumHasTerms(this.selectedCurriculum()));

  readonly allCurriculaTracks = signal<CurriculumTrackItem[]>(
    CANONICAL_CURRICULUM_TREE.map(c => ({
      code: c.code as CurriculumCode,
      nameAr: c.titleAr,
      nameEn: c.titleEn,
      divisions: c.code === 'INTERNATIONAL'
        ? INTERNATIONAL_DIVISIONS_DATA.map(d => ({
            code: d.code,
            nameAr: d.nameAr,
            nameEn: d.nameEn,
            iconName: d.iconName,
            stages: d.stages.map(s => ({
              code: s.code,
              nameAr: s.nameAr,
              nameEn: s.nameEn,
              gradeCodes: [...s.gradeCodes]
            }))
          }))
        : undefined,
      grades: sortGradesDescending(c.grades.map(g => ({
        code: g.code,
        titleAr: g.titleAr,
        titleEn: g.titleEn
      })))
    }))
  );

  hasCurriculumTerms(curr: string | null | undefined): boolean {
    return curriculumHasTerms(curr);
  }

  getCurriculumTrackName(code: CurriculumCode): string {
    const track = this.allCurriculaTracks().find((t) => t.code === code);
    if (code === 'INTERNATIONAL') {
      const isLegacy = !track?.nameAr || track.nameAr.includes('البريطانية');
      if (this.langService.isArabic()) {
        return !isLegacy ? track!.nameAr : 'المناهج الدولية';
      }
      return (!isLegacy && track?.nameEn) ? track.nameEn : 'International Curriculum';
    }
    if (this.langService.isArabic()) {
      return track?.nameAr || code;
    }
    return track?.nameEn || track?.nameAr || code;
  }

  getIntlDivisions(): { code: 'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM'; nameAr: string; nameEn: string; iconName?: string; flag: string }[] {
    const track = this.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL');
    const configuredDivs = track?.divisions || [];
    return [
      {
        code: 'AMERICAN_CURRICULUM',
        nameAr: configuredDivs.find((d) => d.code === 'AMERICAN_CURRICULUM')?.nameAr || 'المنهج الأمريكي',
        nameEn: configuredDivs.find((d) => d.code === 'AMERICAN_CURRICULUM')?.nameEn || 'American Curriculum',
        iconName: 'award',
        flag: ''
      },
      {
        code: 'BRITISH_CURRICULUM',
        nameAr: configuredDivs.find((d) => d.code === 'BRITISH_CURRICULUM')?.nameAr || 'المنهج البريطاني',
        nameEn: configuredDivs.find((d) => d.code === 'BRITISH_CURRICULUM')?.nameEn || 'British Curriculum',
        iconName: 'graduation-cap',
        flag: ''
      }
    ];
  }

  private resolveGradesForScope(
    curr: CurriculumCode,
    gulfCountry: 'SA' | 'QA' | 'AE' | 'KW',
    intlDivision: 'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM'
  ): GradeOption[] {
    const track = this.allCurriculaTracks().find((t) => t.code === curr);
    if (curr === 'GULF') {
      const countryData = findGulfCountry(gulfCountry);
      if (countryData) {
        const canonical = countryData.grades.map(g => ({
          code: g.code,
          titleAr: g.titleAr,
          titleEn: g.titleEn,
          isCustom: false
        }));
        const customForCountry = (track?.grades || []).filter(
          g => g.isCustom && (!g.countryCode || g.countryCode === countryData.code)
        );
        return [...canonical, ...customForCountry];
      }
    }
    if (curr === 'INTERNATIONAL') {
      const divData = findInternationalDivision(intlDivision);
      if (divData) {
        const divGradeCodes = new Set(divData.stages.flatMap(s => s.gradeCodes));
        const customForDiv = (track?.grades || []).filter(
          g => g.isCustom && (!g.divisionCode || g.divisionCode === intlDivision)
        );
        if (track) {
          const filtered = track.grades.filter(g => divGradeCodes.has(g.code));
          if (filtered.length > 0) return [...filtered, ...customForDiv];
        }
        return [
          ...divData.grades.map(g => ({
            code: g.code,
            titleAr: g.titleAr,
            titleEn: g.titleEn,
            isCustom: false
          })),
          ...customForDiv
        ];
      }
    }
    return track ? track.grades : [];
  }

  getGulfStages(countryCode: 'SA' | 'QA' | 'AE' | 'KW' = this.selectedGulfCountry()): readonly IGulfStageDefinition[] {
    return findGulfCountry(countryCode)?.stages || [];
  }

  getGradesForGulfStage(stage: IGulfStageDefinition, options: GradeOption[]): GradeOption[] {
    return options.filter((g) => stage.gradeCodes.includes(g.code));
  }

  getOtherGulfGrades(countryCode: 'SA' | 'QA' | 'AE' | 'KW', options: GradeOption[]): GradeOption[] {
    const stageCodes = new Set(this.getGulfStages(countryCode).flatMap((s) => s.gradeCodes));
    return options.filter((g) => !stageCodes.has(g.code));
  }

  getIntlStages(divCode: 'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM' = this.selectedIntlDivision()): { code: string; nameAr: string; nameEn: string; gradeCodes: readonly string[] }[] {
    const track = this.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL');
    const configuredDiv = track?.divisions?.find((d) => d.code === divCode);
    const canonDiv = INTERNATIONAL_DIVISIONS_DATA.find((d) => d.code === divCode);
    if (!canonDiv) return [];
    return canonDiv.stages.map((s) => {
      const configuredStage = configuredDiv?.stages?.find((cs) => cs.code === s.code);
      return {
        code: s.code,
        nameAr: configuredStage?.nameAr || s.nameAr,
        nameEn: configuredStage?.nameEn || s.nameEn,
        gradeCodes: s.gradeCodes
      };
    });
  }

  getGradesForIntlStage(stage: { gradeCodes: readonly string[] }): GradeOption[] {
    const track = this.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL');
    if (!track) return [];
    return stage.gradeCodes
      .map((code) => track.grades.find((g) => g.code === code))
      .filter((g): g is GradeOption => Boolean(g));
  }

  getOtherIntlGrades(divCode: 'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM' = this.selectedIntlDivision()): GradeOption[] {
    const track = this.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL');
    if (!track) return [];
    const allStageCodes = new Set(
      INTERNATIONAL_DIVISIONS_DATA.flatMap((d) => d.stages.flatMap((s) => s.gradeCodes))
    );
    return track.grades.filter((g) => {
      if (allStageCodes.has(g.code)) return false;
      if (g.divisionCode && g.divisionCode !== divCode) return false;
      return true;
    });
  }

  detectIntlDivisionForGrade(gradeCode: string): 'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM' {
    for (const div of INTERNATIONAL_DIVISIONS_DATA) {
      const divCodes = new Set(div.stages.flatMap((s) => s.gradeCodes));
      if (divCodes.has(gradeCode)) {
        return div.code;
      }
    }
    const track = this.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL');
    const customGrade = track?.grades.find((g) => g.code === gradeCode);
    if (customGrade?.divisionCode === 'BRITISH_CURRICULUM') return 'BRITISH_CURRICULUM';
    return 'AMERICAN_CURRICULUM';
  }

  getSelectedGradeTitle(): string {
    const code = this.selectedGrade();
    const opt = this.gradeOptions().find((g) => g.code === code);
    if (opt) {
      return this.langService.isArabic() ? opt.titleAr : (opt.titleEn || opt.titleAr);
    }
    return code;
  }

  readonly gradeOptions = computed<GradeOption[]>(() =>
    this.resolveGradesForScope(
      this.selectedCurriculum(),
      this.selectedGulfCountry(),
      this.selectedIntlDivision()
    )
  );

  // Filtered Assessments strictly isolated by Grade Level and Curriculum
  readonly scopedAssessments = computed<AssessmentItem[]>(() => {
    return this.assessmentsList().filter(
      (a) =>
        a.curriculum === this.selectedCurriculum() &&
        a.gradeLevel === this.selectedGrade() &&
        (!this.currentCurriculumHasTerms() || a.term === this.selectedTerm())
    );
  });

  // Pagination State (15 Quizzes/Assessments Per Page with In-Memory Caching)
  readonly pageSize = 15;
  readonly currentPage = signal<number>(1);
  readonly totalItems = computed(() => this.scopedAssessments().length);
  readonly totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize) || 1);
  readonly paginatedAssessments = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.scopedAssessments().slice(start, start + this.pageSize);
  });
  readonly displayedPages = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  // In-App Confirmation Modal State (Zero JavaScript window.confirm)
  readonly confirmDialog = signal<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    isDestructive: boolean;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'تأكيد',
    cancelLabel: 'إلغاء',
    isDestructive: false,
    action: () => {}
  });

  // Create Assessment Modal State
  readonly isCreateModalOpen = signal<boolean>(false);
  readonly createForm = signal<{
    assessmentType: 'QUIZ' | 'HOMEWORK' | 'COMPREHENSIVE_EXAM';
    titleAr: string;
    titleEn: string;
    curriculum: CurriculumCode;
    gradeLevel: string;
    term: AcademicTermCode;
    unitPackageId: string | null;
    lectureId: string | null;
    durationMinutes: number;
    isMultiModule: boolean;
    module1TimeMinutes: number;
    module2TimeMinutes: number;
    passPercentage: number;
    maxAttempts: number;
    isScheduled: boolean;
    availableFrom: string | null;
    availableUntil: string | null;
    calculatorType: CalculatorMode;
    referenceSheetUrl: string | null;
    isPlacementTest: boolean;
    requiresTeacherReview: boolean;
  }>({
    assessmentType: 'QUIZ',
    titleAr: '',
    titleEn: '',
    curriculum: 'EGYPTIAN',
    gradeLevel: '',
    term: 'TERM_1',
    unitPackageId: null,
    lectureId: null,
    durationMinutes: 45,
    isMultiModule: false,
    module1TimeMinutes: 35,
    module2TimeMinutes: 35,
    passPercentage: 60,
    maxAttempts: 1,
    isScheduled: false,
    availableFrom: null,
    availableUntil: null,
    calculatorType: 'NONE',
    referenceSheetUrl: null,
    isPlacementTest: false,
    requiresTeacherReview: false
  });

  readonly createGradeOptions = computed<GradeOption[]>(() =>
    this.resolveGradesForScope(
      this.createForm().curriculum,
      this.createGulfCountry(),
      this.createIntlDivision()
    )
  );

  readonly availableUnitsInCreate = signal<{ id: string; titleAr: string; lectures: { id: string; order: number; titleAr: string }[] }[]>([]);
  readonly createSelectedUnit = computed(() => {
    const unitId = this.createForm().unitPackageId;
    if (!unitId) return null;
    return this.availableUnitsInCreate().find((u) => u.id === unitId) || null;
  });

  onUnitChangeInCreate(unitId: string | null): void {
    this.createForm.update((prev) => ({
      ...prev,
      unitPackageId: unitId || null,
      lectureId: null
    }));
  }

  loadUnitsForCreate(curr: string, grade: string, term: string): void {
    if (!grade) {
      this.availableUnitsInCreate.set([]);
      return;
    }
    const termQuery = curriculumHasTerms(curr as CurriculumCode) ? `&term=${term}` : '';
    this.http.get<{ success: boolean; data: any[] }>(`/api/v1/units?curriculum=${curr}&gradeLevel=${grade}${termQuery}`).subscribe({
      next: (res) => {
        const rawUnits = Array.isArray(res?.data) ? res.data : [];
        const unitsWithLectures = rawUnits.map((u: any) => ({
          id: u._id || u.id,
          titleAr: u.title_ar || '',
          lectures: [] as { id: string; order: number; titleAr: string }[]
        }));
        this.availableUnitsInCreate.set(unitsWithLectures);

        unitsWithLectures.forEach((unit) => {
          this.http.get<{ success: boolean; data: any }>(`/api/v1/units/${unit.id}/curriculum-contents`).subscribe({
            next: (cRes) => {
              if (cRes?.data?.lectures) {
                const lecs = (cRes.data.lectures || []).map((l: any) => ({
                  id: l._id || l.id,
                  order: l.order_index || l.order || 1,
                  titleAr: l.lecture_title_ar || l.title_ar || l.title || ('محاضرة ' + (l.order_index || l.order || 1))
                }));
                this.availableUnitsInCreate.update((list) =>
                  list.map((item) => (item.id === unit.id ? { ...item, lectures: lecs } : item))
                );
              }
            }
          });
        });
      },
      error: () => this.availableUnitsInCreate.set([])
    });
  }

  readonly availableUnitsInEditor = signal<{ id: string; titleAr: string; lectures: { id: string; order: number; titleAr: string }[] }[]>([]);
  readonly editorSelectedUnit = computed(() => {
    const unitId = this.activeAssessment()?.unitId;
    if (!unitId) return null;
    return this.availableUnitsInEditor().find((u) => u.id === unitId) || null;
  });

  onUnitChangeInEditor(unitId: string | null): void {
    const asm = this.activeAssessment();
    if (!asm) return;
    asm.unitId = unitId || null;
    asm.lectureId = null;
    const selUnit = this.availableUnitsInEditor().find((u) => u.id === unitId);
    asm.unitTitle = selUnit ? selUnit.titleAr : null;
    asm.lectureTitle = null;
  }

  onLectureChangeInEditor(lectureId: string | null): void {
    const asm = this.activeAssessment();
    if (!asm) return;
    asm.lectureId = lectureId || null;
    const selUnit = this.editorSelectedUnit();
    const selLec = selUnit?.lectures.find((l) => l.id === lectureId);
    asm.lectureTitle = selLec ? selLec.titleAr : null;
  }

  loadUnitsForEditor(curr: string, grade: string, term: string): void {
    if (!grade) {
      this.availableUnitsInEditor.set([]);
      return;
    }
    const termQuery = curriculumHasTerms(curr as CurriculumCode) ? `&term=${term}` : '';
    this.http.get<{ success: boolean; data: any[] }>(`/api/v1/units?curriculum=${curr}&gradeLevel=${grade}${termQuery}`).subscribe({
      next: (res) => {
        const rawUnits = Array.isArray(res?.data) ? res.data : [];
        const unitsWithLectures = rawUnits.map((u: any) => ({
          id: u._id || u.id,
          titleAr: u.title_ar || '',
          lectures: [] as { id: string; order: number; titleAr: string }[]
        }));
        this.availableUnitsInEditor.set(unitsWithLectures);

        unitsWithLectures.forEach((unit) => {
          this.http.get<{ success: boolean; data: any }>(`/api/v1/units/${unit.id}/curriculum-contents`).subscribe({
            next: (cRes) => {
              if (cRes?.data?.lectures) {
                const lecs = (cRes.data.lectures || []).map((l: any) => ({
                  id: l._id || l.id,
                  order: l.order_index || l.order || 1,
                  titleAr: l.lecture_title_ar || l.title_ar || l.title || ('محاضرة ' + (l.order_index || l.order || 1))
                }));
                this.availableUnitsInEditor.update((list) =>
                  list.map((item) => (item.id === unit.id ? { ...item, lectures: lecs } : item))
                );
              }
            }
          });
        });
      },
      error: () => this.availableUnitsInEditor.set([])
    });
  }

  // Question & Settings Safe Visual Editor State
  readonly isEditorOpen = signal<boolean>(false);
  readonly editorActiveTab = signal<'SETTINGS' | 'QUESTIONS'>('SETTINGS');
  readonly activeAssessment = signal<AssessmentItem | null>(null);
  readonly autoRegradeWarning = signal<boolean>(false);
  readonly editorErrorMessage = signal<string | null>(null);
  readonly createErrorMessage = signal<string | null>(null);

  // Reference Sheet (ورقة القوانين) Toggles
  readonly isRefSheetActiveInCreate = signal<boolean>(false);
  readonly isRefSheetActiveInEditor = signal<boolean>(false);

  readonly editorGradeOptions = computed<GradeOption[]>(() => {
    const asm = this.activeAssessment();
    if (!asm) return [];
    return this.resolveGradesForScope(
      asm.curriculum,
      this.editorGulfCountry(),
      this.editorIntlDivision()
    );
  });

  // New Question Form Inside Safe Visual Editor
  readonly newQuestionType = signal<QuestionType>('MCQ');
  readonly newQuestionTextAr = signal<string>('');
  readonly newQuestionImageUrl = signal<string | null>(null);
  readonly newQuestionOptions = signal<string[]>(['', '', '', '']);
  readonly newQuestionAcceptedAnswers = signal<string[]>(['']);
  readonly newQuestionCorrectIndex = signal<number>(0);
  readonly newQuestionPoints = signal<number>(5);
  readonly newQuestionModuleIndex = signal<1 | 2>(1);
  readonly newQuestionYoutubeUrl = signal<string>('');
  readonly newQuestionSolutionType = signal<'VIDEO' | 'POST'>('VIDEO');
  readonly editingQuestionId = signal<string | null>(null);

  // Multi-Module Questions Filtering in Studio
  readonly moduleFilterTab = signal<'ALL' | 1 | 2>('ALL');

  readonly module1QuestionsCount = computed(() => {
    const asm = this.activeAssessment();
    if (!asm || !asm.questions) return 0;
    return asm.questions.filter((q) => q.moduleIndex !== 2).length;
  });

  readonly module2QuestionsCount = computed(() => {
    const asm = this.activeAssessment();
    if (!asm || !asm.questions) return 0;
    return asm.questions.filter((q) => q.moduleIndex === 2).length;
  });

  readonly editorFilteredQuestions = computed(() => {
    const asm = this.activeAssessment();
    if (!asm || !asm.questions) return [];
    const tab = this.moduleFilterTab();
    if (tab === 'ALL' || !asm.isMultiModule) return asm.questions;
    if (tab === 1) return asm.questions.filter((q) => q.moduleIndex !== 2);
    return asm.questions.filter((q) => q.moduleIndex === 2);
  });

  toggleCreateMultiModule(): void {
    this.createForm.update((f) => ({
      ...f,
      isMultiModule: !f.isMultiModule,
      module1TimeMinutes: f.module1TimeMinutes || 35,
      module2TimeMinutes: f.module2TimeMinutes || 35
    }));
  }

  toggleEditorMultiModule(): void {
    const asm = this.activeAssessment();
    if (!asm) return;
    const nextMulti = !asm.isMultiModule;
    const updatedAsm: AssessmentItem = {
      ...asm,
      isMultiModule: nextMulti,
      module1TimeMinutes: asm.module1TimeMinutes || 35,
      module2TimeMinutes: asm.module2TimeMinutes || 35
    };
    this.activeAssessment.set(updatedAsm);
    this.syncAssessmentInMemoryList(updatedAsm);
    if (!nextMulti) {
      this.moduleFilterTab.set('ALL');
      this.newQuestionModuleIndex.set(1);
    }
    this.triggerDraftAutoSave(true);
  }

  selectModuleFilterTab(tab: 'ALL' | 1 | 2): void {
    this.moduleFilterTab.set(tab);
    if (tab === 1 || tab === 2) {
      this.newQuestionModuleIndex.set(tab);
    }
  }

  selectComposerModule(mod: 1 | 2): void {
    this.newQuestionModuleIndex.set(mod);
    if (this.moduleFilterTab() !== 'ALL') {
      this.moduleFilterTab.set(mod);
    }
  }

  addAcceptedAnswerOption(): void {
    this.newQuestionAcceptedAnswers.update((arr) => [...arr, '']);
  }

  removeAcceptedAnswerOption(idx: number): void {
    this.newQuestionAcceptedAnswers.update((arr) => {
      const copy = [...arr];
      copy.splice(idx, 1);
      return copy.length > 0 ? copy : [''];
    });
  }

  updateAcceptedAnswer(idx: number, eventOrVal: Event | string): void {
    const val = typeof eventOrVal === 'string'
      ? toVisualMath(eventOrVal)
      : toVisualMath((eventOrVal.target as HTMLInputElement)?.value || '');
    this.newQuestionAcceptedAnswers.update((arr) => {
      const copy = [...arr];
      copy[idx] = val;
      return copy;
    });
  }

  // Math Virtual Keyboard Integration
  readonly isMathKeyboardOpen = signal<boolean>(false);
  readonly mathKeyboardTarget = signal<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // AI Question Extraction & Slicer State (Phase 5 - Scoped per assessment R3)
  readonly isAiExtractionModalOpen = signal<boolean>(false);
  private readonly assessmentFileSessions = signal<Record<string, ICachedFileSession>>({});
  readonly cachedFileSession = computed<ICachedFileSession | null>(() => {
    const asm = this.activeAssessment();
    if (!asm || !asm.id) return null;
    return this.assessmentFileSessions()[asm.id] || null;
  });
  readonly isManualSlicerOpen = signal<boolean>(false);
  readonly activeQuestionForSlicing = signal<AssessmentQuestionItem | null>(null);

  // Exam Options Dropdown (Question Types & Math Keyboard)
  readonly isExamOptionsOpen = signal<boolean>(false);

  toggleExamOptions(): void {
    this.isExamOptionsOpen.update((v) => !v);
  }

  closeExamOptions(): void {
    this.isExamOptionsOpen.set(false);
  }

  // Quiz Items Navigation Drawer (Milestone 4 - R6)
  readonly isQuestionDrawerOpen = signal<boolean>(false);

  toggleQuestionDrawer(): void {
    this.isQuestionDrawerOpen.update((v) => !v);
  }

  closeQuestionDrawer(): void {
    this.isQuestionDrawerOpen.set(false);
  }

  scrollToQuestion(index: number): void {
    this.isQuestionDrawerOpen.set(false);
    const questions = this.activeAssessment()?.questions || [];
    if (index >= 0 && index < questions.length) {
      const q = questions[index];
      if (isPlatformBrowser(this.platformId) && typeof document !== 'undefined') {
        const qCard = document.getElementById(`question-card-${q.id || index}`);
        if (qCard) {
          qCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }

  scrollToComposer(): void {
    if (isPlatformBrowser(this.platformId) && typeof document !== 'undefined') {
      const composerEl = document.getElementById('questionComposerSection');
      if (composerEl) {
        composerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  // Background Body Scroll Lock (Milestone 1 - F1.5 & Milestone 4 - R6)
  readonly isAnyModalOpen = computed<boolean>(() => {
    return (
      this.isCreateModalOpen() ||
      this.isEditorOpen() ||
      this.confirmDialog().isOpen ||
      this.isPreviewModalOpen() ||
      this.isAiExtractionModalOpen() ||
      this.isManualSlicerOpen() ||
      this.isQuestionDrawerOpen()
    );
  });

  constructor() {}

  toggleMathKeyboard(fallbackTarget?: HTMLInputElement | HTMLTextAreaElement): void {
    if (this.isMathKeyboardOpen()) {
      this.isMathKeyboardOpen.set(false);
    } else {
      if (!this.mathKeyboardTarget()) {
        if (fallbackTarget) {
          this.mathKeyboardTarget.set(fallbackTarget);
        } else if (typeof document !== 'undefined') {
          const firstTarget = document.querySelector<HTMLTextAreaElement | HTMLInputElement>(
            '.question-input-wrapper textarea, .question-input-wrapper input'
          );
          if (firstTarget) {
            this.mathKeyboardTarget.set(firstTarget);
          }
        }
      }
      this.isMathKeyboardOpen.set(true);
    }
  }

  openMathKeyboard(target: HTMLInputElement | HTMLTextAreaElement): void {
    this.mathKeyboardTarget.set(target);
    this.isMathKeyboardOpen.set(true);
  }

  onMathKeyboardValueChange(val: string): void {
    const target = this.mathKeyboardTarget();
    if (!target) return;
    const visualVal = stripLatexDelimiters(val);
    if (target.value !== visualVal) {
      const rawPos = target.selectionStart ?? val.length;
      const adjustedPos = Math.min(stripLatexDelimiters(val.slice(0, rawPos)).length, visualVal.length);
      target.value = visualVal;
      target.setSelectionRange(adjustedPos, adjustedPos);
    }
    if (target.tagName.toLowerCase() === 'textarea') {
      this.newQuestionTextAr.set(visualVal);
    } else {
      const optIdx = target.getAttribute('data-opt-index');
      if (optIdx !== null) {
        this.updateOption(Number(optIdx), visualVal);
      }
      const ansIdx = target.getAttribute('data-ans-index');
      if (ansIdx !== null) {
        this.updateAcceptedAnswer(Number(ansIdx), visualVal);
      }
    }
    this.triggerDraftAutoSave(false);
  }

  onQuestionTextInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    if (!target) return;
    this.newQuestionTextAr.set(target.value);
    this.triggerDraftAutoSave(false);
  }

  onOptionInput(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target) return;
    this.updateOption(index, target.value);
    this.triggerDraftAutoSave(false);
  }

  openAiExtractionModal(): void {
    this.isAiExtractionModalOpen.set(true);
  }

  onQuestionsExtracted(extractedQuestions: AssessmentQuestionItem[]): void {
    const asm = this.activeAssessment();
    if (!asm || extractedQuestions.length === 0) return;

    const currentQuestions = asm.questions || [];
    const startOrder = currentQuestions.length;
    const defaultMod: 1 | 2 =
      asm.isMultiModule && (this.moduleFilterTab() === 2 || this.newQuestionModuleIndex() === 2)
        ? 2
        : 1;
    const formattedNewQuestions: AssessmentQuestionItem[] = extractedQuestions.map((q, idx) => ({
      ...q,
      order: startOrder + idx + 1,
      moduleIndex: (asm.isMultiModule
        ? (q.moduleIndex === 2 ? 2 : (q.moduleIndex === 1 ? 1 : defaultMod))
        : 1) as 1 | 2
    }));

    const updatedQuestions = [...currentQuestions, ...formattedNewQuestions];
    const hasEssay = updatedQuestions.some((q) => q.type === 'ESSAY' || (q.type as string) === 'ESSAY_PHOTO');
    const updatedAsm: AssessmentItem = {
      ...asm,
      questions: updatedQuestions,
      requiresTeacherReview: hasEssay ? true : asm.requiresTeacherReview,
      totalPoints: updatedQuestions.reduce((sum, q) => sum + (q.points || 1), 0)
    };
    this.activeAssessment.set(updatedAsm);
    this.syncAssessmentInMemoryList(updatedAsm);
    if (asm.isMultiModule) {
      const hasM2 = formattedNewQuestions.some((q) => q.moduleIndex === 2);
      const hasM1 = formattedNewQuestions.some((q) => q.moduleIndex !== 2);
      if (hasM2 && hasM1) {
        this.moduleFilterTab.set('ALL');
      } else if (hasM2 && this.moduleFilterTab() === 1) {
        this.selectModuleFilterTab(2);
      } else if (hasM1 && !hasM2 && this.moduleFilterTab() === 2) {
        this.selectModuleFilterTab(1);
      }
    }
    this.triggerDraftAutoSave(true);
    if (!this.isSaving()) {
      this.autoPersistAssessmentToBackend(updatedAsm);
    }

    this.toastTriggered.emit({
      text: this.langService.isArabic()
        ? `تم حفظ ${extractedQuestions.length} أسئلة`
        : `Saved ${extractedQuestions.length} questions`,
      type: 'success'
    });
  }

  onFileSessionCached(session: ICachedFileSession): void {
    const asm = this.activeAssessment();
    if (asm && asm.id) {
      this.assessmentFileSessions.update((sessions) => ({
        ...sessions,
        [asm.id]: session
      }));
    }
    this.toastTriggered.emit({
      text: this.langService.isArabic()
        ? `تم تجهيز صفحة ${session.pageNumber} للقص.`
        : `Page ${session.pageNumber} ready for cropping.`,
      type: 'success'
    });
  }

  onManualSlicingRequestedFromExtraction(session: ICachedFileSession): void {
    const asm = this.activeAssessment();
    if (asm && asm.id) {
      this.assessmentFileSessions.update((sessions) => ({
        ...sessions,
        [asm.id]: session
      }));
      if (asm.isMultiModule && session.targetModuleIndex) {
        this.selectComposerModule(session.targetModuleIndex);
      }
    }
    this.openManualSlicerForComposer();
  }

  openManualSlicerForExistingQuestion(q: AssessmentQuestionItem): void {
    this.activeQuestionForSlicing.set(q);
    this.isManualSlicerOpen.set(true);
  }

  openManualSlicerForComposer(): void {
    this.activeQuestionForSlicing.set(null);
    this.isManualSlicerOpen.set(true);
  }

  onManualSliceSaved(result: ISliceResult): void {
    const q = this.activeQuestionForSlicing();
    if (q) {
      q.questionImageUrl = result.imageUrl;
      if (this.editingQuestionId() === q.id) {
        this.newQuestionImageUrl.set(result.imageUrl);
      }
      const asm = this.activeAssessment();
      if (asm) {
        const updatedQuestions = asm.questions.map((item) =>
          item.id === q.id ? { ...item, questionImageUrl: result.imageUrl } : item
        );
        const updatedAsm: AssessmentItem = { ...asm, questions: updatedQuestions };
        this.activeAssessment.set(updatedAsm);
        this.syncAssessmentInMemoryList(updatedAsm);
        this.autoPersistAssessmentToBackend(updatedAsm);
      }
    } else {
      this.newQuestionImageUrl.set(result.imageUrl);
      setTimeout(() => this.scrollToComposer(), 50);
    }
    this.isManualSlicerOpen.set(false);
    this.activeQuestionForSlicing.set(null);
    this.triggerDraftAutoSave(true);
    this.toastTriggered.emit({
      text: this.langService.isArabic() ? 'تم قص الصورة' : 'Image cropped',
      type: 'success'
    });
  }

  // =========================================================================
  // Teacher Draft Auto-Save in Dexie & 1-Click Restoration (Milestone 2 - R2)
  // =========================================================================

  @HostListener('window:beforeunload')
  onBeforeUnload(): void {
    if (this.isEditorOpen() && this.activeAssessment()) {
      this.triggerDraftAutoSave(true);
    }
  }

  triggerDraftAutoSave(immediate = false): void {
    const asm = this.activeAssessment();
    if (!asm) return;

    const draft: AssessmentDraft = {
      draftId: asm.id || 'new_assessment_draft',
      assessmentId: asm.id || null,
      draftType: 'EDIT',
      titleAr: asm.titleAr || '',
      titleEn: asm.titleEn || '',
      curriculum: asm.curriculum,
      gradeLevel: asm.gradeLevel,
      term: asm.term,
      calculatorType: asm.calculatorType,
      referenceSheetUrl: asm.referenceSheetUrl || null,
      durationMinutes: asm.durationMinutes,
      isMultiModule: !!asm.isMultiModule,
      module1TimeMinutes: asm.module1TimeMinutes ?? 35,
      module2TimeMinutes: asm.module2TimeMinutes ?? 35,
      passPercentage: asm.passPercentage,
      maxAttempts: asm.maxAttempts,
      isScheduled: !!asm.isScheduled,
      availableFrom: asm.availableFrom || null,
      availableUntil: asm.availableUntil || null,
      isPlacementTest: !!asm.isPlacementTest,
      requiresTeacherReview: !!asm.requiresTeacherReview,
      totalPoints: asm.totalPoints,
      questions: asm.questions || [],
      composerSnapshot: {
        editingQuestionId: this.editingQuestionId(),
        type: this.newQuestionType(),
        textAr: this.newQuestionTextAr(),
        imageUrl: this.newQuestionImageUrl(),
        options: this.newQuestionOptions(),
        acceptedAnswers: this.newQuestionAcceptedAnswers(),
        correctIndex: this.newQuestionCorrectIndex(),
        points: this.newQuestionPoints(),
        moduleIndex: this.newQuestionModuleIndex(),
        youtubeUrl: this.newQuestionYoutubeUrl()
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    if (immediate) {
      this.draftService.saveDraft(draft);
    } else {
      this.draftService.scheduleDebouncedSave(draft, 600);
    }
  }

  async checkForPendingDrafts(): Promise<void> {
    try {
      const latest = await this.draftService.getLatestDraft();
      if (latest) {
        this.pendingDraft.set(latest);
      }
    } catch (err) {
      console.warn('Failed to check for pending drafts:', err);
    }
  }

  formatDraftTime(timestamp?: number): string {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    return d.toLocaleTimeString(this.langService.isArabic() ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    });
  }

  hasUnsavedComposerInput(): boolean {
    const hasText = Boolean(this.newQuestionTextAr().trim());
    const hasImg = Boolean(this.newQuestionImageUrl());
    const hasOpts = this.newQuestionOptions().some((o) => Boolean((o || '').trim()));
    const hasAccepted = this.newQuestionAcceptedAnswers().some((a) => Boolean((a || '').trim()));
    return hasText || hasImg || hasOpts || hasAccepted;
  }

  syncAssessmentInMemoryList(updatedAsm: AssessmentItem): void {
    const cloned: AssessmentItem = JSON.parse(JSON.stringify(updatedAsm));
    this.assessmentsList.update((list) =>
      list.map((a) => (a.id === cloned.id ? cloned : a))
    );
    const cacheKey = `${cloned.curriculum}_${cloned.gradeLevel}_${cloned.term}`;
    const updatedList = this.assessmentsList();
    if (ASSESSMENTS_MEMORY_CACHE.has(cacheKey)) {
      const entry = ASSESSMENTS_MEMORY_CACHE.get(cacheKey)!;
      ASSESSMENTS_MEMORY_CACHE.set(cacheKey, {
        items: entry.items.map((a) => (a.id === cloned.id ? cloned : a)),
        timestamp: Date.now()
      });
    }
    this.swrCache.set(`admin_asm_${cacheKey}`, updatedList);
  }

  private applyDraftToAssessmentItem(baseItem: AssessmentItem, draft: AssessmentDraft): AssessmentItem {
    const draftQuestions = Array.isArray(draft.questions) ? draft.questions : baseItem.questions;
    return {
      ...baseItem,
      titleAr: draft.titleAr || baseItem.titleAr,
      titleEn: draft.titleEn ?? baseItem.titleEn,
      curriculum: draft.curriculum || baseItem.curriculum,
      gradeLevel: draft.gradeLevel || baseItem.gradeLevel,
      term: draft.term || baseItem.term,
      calculatorType: draft.calculatorType || baseItem.calculatorType,
      referenceSheetUrl: draft.referenceSheetUrl !== undefined ? (draft.referenceSheetUrl || null) : baseItem.referenceSheetUrl,
      durationMinutes: draft.durationMinutes || baseItem.durationMinutes || 45,
      isMultiModule: draft.isMultiModule ?? baseItem.isMultiModule ?? false,
      module1TimeMinutes: draft.module1TimeMinutes ?? baseItem.module1TimeMinutes ?? 35,
      module2TimeMinutes: draft.module2TimeMinutes ?? baseItem.module2TimeMinutes ?? 35,
      passPercentage: draft.passPercentage ?? baseItem.passPercentage ?? 60,
      maxAttempts: draft.maxAttempts || baseItem.maxAttempts || 1,
      isScheduled: draft.isScheduled ?? baseItem.isScheduled,
      availableFrom: draft.availableFrom !== undefined ? (draft.availableFrom || null) : baseItem.availableFrom,
      availableUntil: draft.availableUntil !== undefined ? (draft.availableUntil || null) : baseItem.availableUntil,
      isPlacementTest: draft.isPlacementTest ?? baseItem.isPlacementTest,
      requiresTeacherReview: draft.requiresTeacherReview ?? baseItem.requiresTeacherReview,
      questions: draftQuestions,
      totalPoints: draft.totalPoints || draftQuestions.reduce((sum, q) => sum + (q.points || 1), 0)
    };
  }

  private restoreComposerFromSnapshot(snapshot?: AssessmentDraft['composerSnapshot']): void {
    if (
      snapshot &&
      (Boolean(snapshot.textAr?.trim()) ||
        Boolean(snapshot.imageUrl) ||
        (snapshot.options || []).some((o) => Boolean((o || '').trim())) ||
        (snapshot.acceptedAnswers || []).some((a) => Boolean((a || '').trim())))
    ) {
      this.editingQuestionId.set(snapshot.editingQuestionId);
      this.newQuestionType.set(snapshot.type || 'MCQ');
      this.newQuestionTextAr.set(snapshot.textAr || '');
      this.newQuestionImageUrl.set(snapshot.imageUrl || null);
      this.newQuestionOptions.set(snapshot.options || ['', '', '', '']);
      this.newQuestionAcceptedAnswers.set(
        snapshot.acceptedAnswers && snapshot.acceptedAnswers.length > 0
          ? [...snapshot.acceptedAnswers]
          : ['']
      );
      this.newQuestionCorrectIndex.set(snapshot.correctIndex ?? 0);
      this.newQuestionPoints.set(snapshot.points ?? 5);
      this.newQuestionModuleIndex.set(snapshot.moduleIndex ?? 1);
      this.newQuestionYoutubeUrl.set(snapshot.youtubeUrl || '');
    } else {
      this.resetQuestionForm();
    }
  }

  /**
   * Automatically persists structural question/setting updates to the backend database
   * in the background so that adding/editing/deleting a question is immediately saved on the server
   * even if the teacher closes the modal or refreshes without clicking the bottom Save button.
   */
  autoPersistAssessmentToBackend(asm: AssessmentItem): void {
    if (this.isSaving()) return;
    if (!asm || !asm.id || asm.id === 'new_assessment_draft') return;
    const rawTitle = (asm.titleAr || asm.titleEn || '').trim();
    if (!rawTitle) return;
    if (!asm.questions || asm.questions.length === 0) return;

    const sanitizeMcq = (rawOpts: string[] | undefined, rawCorrectIdx: number | undefined): { options: string[]; correctIndex: number } => {
      const seen = new Set<string>();
      const trimmed = (rawOpts || []).map((o) => (o || '').trim());
      const selectedText = typeof rawCorrectIdx === 'number' && rawCorrectIdx >= 0 && rawCorrectIdx < trimmed.length ? trimmed[rawCorrectIdx] : '';
      const uniqueOpts: string[] = [];
      let mappedCorrect = -1;
      for (let i = 0; i < trimmed.length; i++) {
        const opt = trimmed[i];
        if (!opt) continue;
        let candidate = opt;
        let suffix = 2;
        while (seen.has(candidate)) {
          candidate = `${opt} (${suffix++})`;
        }
        seen.add(candidate);
        if (i === rawCorrectIdx) mappedCorrect = uniqueOpts.length;
        uniqueOpts.push(candidate);
      }
      let pad = 1;
      while (uniqueOpts.length < 2) {
        let fb = this.langService.isArabic() ? `الخيار ${pad}` : `Option ${pad}`;
        pad++;
        while (seen.has(fb)) fb = this.langService.isArabic() ? `الخيار ${pad++}` : `Option ${pad++}`;
        seen.add(fb);
        uniqueOpts.push(fb);
      }
      if (mappedCorrect === -1) {
        const idxByText = selectedText ? uniqueOpts.indexOf(selectedText) : -1;
        mappedCorrect = idxByText !== -1 ? idxByText : Math.min(uniqueOpts.length - 1, Math.max(0, Number(rawCorrectIdx ?? 0)));
      }
      return { options: uniqueOpts, correctIndex: mappedCorrect };
    };

    if (this.autoPersistSub) {
      this.autoPersistSub.unsubscribe();
      this.autoPersistSub = null;
    }

    let fromIso: string | null = null;
    let untilIso: string | null = null;
    try {
      if (asm.isScheduled && asm.availableFrom) {
        const d = new Date(asm.availableFrom);
        fromIso = !isNaN(d.getTime()) ? d.toISOString() : null;
      }
      if (asm.isScheduled && asm.availableUntil) {
        const d = new Date(asm.availableUntil);
        untilIso = !isNaN(d.getTime()) ? d.toISOString() : null;
      }
    } catch {}

    const payload = {
      title_ar: rawTitle,
      title_en: (asm.titleEn || rawTitle).trim(),
      curriculum: asm.curriculum,
      grade_level: asm.gradeLevel,
      academic_term: asm.term,
      unit_package_id: asm.unitId && /^[0-9a-fA-F]{24}$/.test(asm.unitId) ? asm.unitId : null,
      lecture_id: asm.lectureId && /^[0-9a-fA-F]{24}$/.test(asm.lectureId) ? asm.lectureId : null,
      calculator_mode: asm.calculatorType,
      graph_calculator: asm.calculatorType,
      reference_sheet_url: asm.referenceSheetUrl || null,
      duration_minutes: asm.isMultiModule ? ((Number(asm.module1TimeMinutes) || 35) + (Number(asm.module2TimeMinutes) || 35)) : asm.durationMinutes,
      time_limit_minutes: asm.isMultiModule ? ((Number(asm.module1TimeMinutes) || 35) + (Number(asm.module2TimeMinutes) || 35)) : asm.durationMinutes,
      is_multi_module: !!asm.isMultiModule,
      module_1_time_minutes: asm.isMultiModule ? (Number(asm.module1TimeMinutes) || 35) : null,
      module_2_time_minutes: asm.isMultiModule ? (Number(asm.module2TimeMinutes) || 35) : null,
      pass_percentage: asm.passPercentage,
      max_attempts: asm.maxAttempts || 1,
      available_from: fromIso,
      available_until: untilIso,
      is_placement_test: !!asm.isPlacementTest,
      requires_teacher_review: asm.questions.some(q => q.type === 'ESSAY' || (q.type as string) === 'ESSAY_PHOTO')
        ? true
        : !!asm.requiresTeacherReview,
      questions: asm.questions.map((q, idx) => {
        const isEssay = q.type === 'ESSAY' || (q.type as string) === 'ESSAY_PHOTO';
        const isInputText = q.type === 'INPUT_TEXT';
        const qType = isEssay ? 'ESSAY_PHOTO' : isInputText ? 'INPUT_TEXT' : 'MCQ';
        const validId = q.id && /^[0-9a-fA-F]{24}$/.test(q.id) ? q.id : undefined;
        const mcqSanitized = (!isEssay && !isInputText)
          ? sanitizeMcq(q.options, q.correctOptionIndex)
          : { options: [] as string[], correctIndex: 0 };
        const accepted = isInputText
          ? (q.acceptedAnswers || []).map((a) => (a || '').trim()).filter(Boolean)
          : undefined;
        return {
          _id: validId,
          order: q.order || idx + 1,
          question_type: qType,
          question_text: (q.textAr || '').trim() || (this.langService.isArabic() ? 'مسألة رياضية مصورة' : 'Visual Math Problem'),
          question_image_url: q.questionImageUrl || null,
          options: mcqSanitized.options,
          correct_option_index: mcqSanitized.correctIndex,
          accepted_answers: isInputText ? (accepted && accepted.length > 0 ? accepted : [(q.textAr || '').trim() || 'إجابة']) : undefined,
          points: Math.max(1, Math.min(50, Number(q.points || 1))),
          module_index: asm.isMultiModule ? (q.moduleIndex === 2 ? 2 : 1) : 1,
          model_answer_text: (q.explanationAr || '').trim(),
          youtube_solution_url: (q.youtubeSolutionUrl || '').trim() || null
        };
      })
    };

    let syncDone = false;
    const sub = this.http.patch<{ success: boolean; data: any }>(`/api/v1/admin/assessments/${asm.id}`, payload).subscribe({
      next: (res) => {
        syncDone = true;
        this.autoPersistSub = null;
        this.draftService.lastSavedTimestamp.set(Date.now());
        if (!this.isDestroyed && res?.data?.questions && Array.isArray(res.data.questions)) {
          const currentAsm = this.activeAssessment();
          const serverQuestions = res.data.questions;
          if (currentAsm && currentAsm.id === asm.id) {
            const currentEditId = this.editingQuestionId();
            const updatedQuestions = currentAsm.questions.map((q, idx) => {
              const matched = serverQuestions.find((sq: any) => sq.order === q.order) || serverQuestions[idx];
              if (matched && (matched._id || matched.id)) {
                const newId = (matched._id || matched.id).toString();
                if (currentEditId === q.id && newId !== q.id) {
                  this.editingQuestionId.set(newId);
                }
                return { ...q, id: newId };
              }
              return q;
            });
            const refreshedAsm = { ...currentAsm, questions: updatedQuestions };
            this.activeAssessment.set(refreshedAsm);
            this.syncAssessmentInMemoryList(refreshedAsm);
          } else {
            const listItem = this.assessmentsList().find((a) => a.id === asm.id);
            if (listItem) {
              const updatedQuestions = listItem.questions.map((q, idx) => {
                const matched = serverQuestions.find((sq: any) => sq.order === q.order) || serverQuestions[idx];
                if (matched && (matched._id || matched.id)) {
                  return { ...q, id: (matched._id || matched.id).toString() };
                }
                return q;
              });
              this.syncAssessmentInMemoryList({ ...listItem, questions: updatedQuestions });
            }
          }
        }
        if (this.isDestroyed || !this.hasUnsavedComposerInput()) {
          this.draftService.deleteDraft(asm.id).catch(() => {});
          if (!this.isDestroyed && (this.pendingDraft()?.draftId === asm.id || this.pendingDraft()?.assessmentId === asm.id)) {
            this.pendingDraft.set(null);
          }
        }
      },
      error: () => {
        syncDone = true;
        this.autoPersistSub = null;
        // Keep local draft in Dexie + localStorage so nothing is ever lost on network failure
      }
    });
    if (!syncDone && !sub.closed) {
      this.autoPersistSub = sub;
    }
  }

  restoreDraft(draft: AssessmentDraft): void {
    const existingItem = this.assessmentsList().find(
      (a) => a.id === (draft.assessmentId || draft.draftId)
    );
    const baseItem: AssessmentItem = existingItem || {
      id: draft.assessmentId || draft.draftId,
      titleAr: draft.titleAr || '',
      titleEn: draft.titleEn || '',
      curriculum: draft.curriculum,
      gradeLevel: draft.gradeLevel,
      term: draft.term,
      calculatorType: draft.calculatorType,
      referenceSheetUrl: draft.referenceSheetUrl || null,
      durationMinutes: draft.durationMinutes || 45,
      isMultiModule: !!draft.isMultiModule,
      module1TimeMinutes: draft.module1TimeMinutes || 35,
      module2TimeMinutes: draft.module2TimeMinutes || 35,
      passPercentage: draft.passPercentage || 60,
      maxAttempts: draft.maxAttempts || 1,
      isScheduled: !!draft.isScheduled,
      availableFrom: draft.availableFrom || null,
      availableUntil: draft.availableUntil || null,
      isPlacementTest: !!draft.isPlacementTest,
      requiresTeacherReview: !!draft.requiresTeacherReview,
      totalPoints: draft.totalPoints || (draft.questions || []).reduce((sum, q) => sum + (q.points || 1), 0),
      isPublished: false,
      submissionsCount: 0,
      questions: draft.questions || []
    };

    const restoredAsm = this.applyDraftToAssessmentItem(baseItem, draft);

    this.activeAssessment.set(restoredAsm);
    this.syncAssessmentInMemoryList(restoredAsm);
    this.isRefSheetActiveInEditor.set(Boolean(restoredAsm.referenceSheetUrl));
    this.editorActiveTab.set('QUESTIONS');
    this.editorErrorMessage.set(null);
    this.autoRegradeWarning.set(false);
    this.restoreComposerFromSnapshot(draft.composerSnapshot);

    this.isEditorOpen.set(true);
    this.pendingDraft.set(null);

    this.toastTriggered.emit({
      text: this.langService.isArabic()
        ? 'تمت استعادة المسودة'
        : 'Draft restored',
      type: 'success'
    });
  }

  async discardDraft(draftId: string): Promise<void> {
    await this.draftService.deleteDraft(draftId);
    this.pendingDraft.set(null);
    this.toastTriggered.emit({
      text: this.langService.isArabic() ? 'تم حذف المسودة' : 'Draft discarded',
      type: 'warning'
    });
  }

  ngOnInit(): void {
    this.uiLayoutService.suppressFooter(true);
    this.checkForPendingDrafts();
    if (isPlatformBrowser(this.platformId)) {
      try {
        const savedCurriculum = localStorage.getItem('spider_admin_selected_curriculum') as CurriculumCode | null;
        if (savedCurriculum) {
          this.selectedCurriculum.set(savedCurriculum);
        }

        const savedGulfCountry = localStorage.getItem('spider_admin_selected_gulf_country') as 'SA' | 'QA' | 'AE' | 'KW' | null;
        if (savedGulfCountry && ['SA', 'QA', 'AE', 'KW'].includes(savedGulfCountry)) {
          this.selectedGulfCountry.set(savedGulfCountry);
        }

        const savedIntlDiv = localStorage.getItem('spider_admin_selected_intl_division') as 'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM' | null;
        if (savedIntlDiv && (savedIntlDiv === 'AMERICAN_CURRICULUM' || savedIntlDiv === 'BRITISH_CURRICULUM')) {
          this.selectedIntlDivision.set(savedIntlDiv);
        }

        const savedGrade = localStorage.getItem('spider_admin_selected_grade');
        if (savedGrade) {
          this.selectedGrade.set(savedGrade);
          if (savedCurriculum === 'INTERNATIONAL') {
            this.selectedIntlDivision.set(this.detectIntlDivisionForGrade(savedGrade));
          }
        }

        const savedTerm = localStorage.getItem('spider_admin_selected_term') as AcademicTermCode | null;
        if (savedTerm) {
          this.selectedTerm.set(savedTerm);
        }
      } catch {}
    }
    this.loadTracksAndActiveGrades();
    if (this.selectedGrade()) {
      this.loadAssessments();
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.uiLayoutService.restoreFooter();
    this.isQuestionDrawerOpen.set(false);
    this.isExamOptionsOpen.set(false);
    this.isMathKeyboardOpen.set(false);
    this.mathKeyboardTarget.set(null);
  }

  loadTracksAndActiveGrades(): void {
    this.http.get<{ success: boolean; data: any }>('/api/v1/public/active-grades').subscribe({
      next: (res) => {
        const active: string[] = Array.isArray(res?.data?.activeGrades) ? res.data.activeGrades : [];
        if (active.length > 0) {
          this.activeGrades.set(active);
        }
        if (res?.data?.curriculaTracks && Array.isArray(res.data.curriculaTracks) && res.data.curriculaTracks.length > 0) {
          const remoteTracks = res.data.curriculaTracks as any[];
          const mergedTracks: CurriculumTrackItem[] = CANONICAL_CURRICULUM_TREE.map((node) => {
            const t = remoteTracks.find((rt) => rt.code === node.code);
            let divisions = t?.divisions;
            let nameAr = t?.nameAr || node.titleAr || node.code;
            let nameEn = t?.nameEn || node.titleEn || nameAr;
            let grades = Array.isArray(t?.grades) && t.grades.length > 0
              ? t.grades
              : node.grades.map((g) => ({ code: g.code, titleAr: g.titleAr, titleEn: g.titleEn }));

            if (node.code === 'INTERNATIONAL') {
              const isLegacy = !t?.nameAr || t.nameAr.includes('البريطانية');
              if (isLegacy) {
                nameAr = 'المناهج الدولية';
                nameEn = 'International Curriculum';
              }
              if (!divisions || divisions.length === 0) {
                divisions = INTERNATIONAL_DIVISIONS_DATA.map((d) => ({
                  code: d.code,
                  nameAr: d.nameAr,
                  nameEn: d.nameEn,
                  iconName: d.iconName,
                  stages: d.stages.map((s) => ({
                    code: s.code,
                    nameAr: s.nameAr,
                    nameEn: s.nameEn
                  }))
                }));
              }
              if (!grades || grades.length <= 4) {
                grades = node.grades.map((g) => ({ code: g.code, titleAr: g.titleAr, titleEn: g.titleEn }));
              }
            }
            return {
              code: node.code as CurriculumCode,
              nameAr,
              nameEn,
              divisions,
              grades: sortGradesDescending(grades)
            };
          });
          this.allCurriculaTracks.set(mergedTracks);
        }

        // Sync grade within current curriculum/division/country if missing or invalid for scoped options
        const currentTrackGrades = this.gradeOptions();
        const currentSelected = this.selectedGrade();
        const isCurrentInOptions = currentSelected && currentTrackGrades.some((g) => g.code === currentSelected);
        if (!isCurrentInOptions) {
          const activeGrade = currentTrackGrades.find((g) => active.includes(g.code))?.code || active[0] || currentTrackGrades[0]?.code || '';
          if (activeGrade && this.selectedGrade() !== activeGrade) {
            this.selectedGrade.set(activeGrade);
            this.loadAssessments();
          }
        }
      }
    });
  }

  mapDocToAssessmentItem(a: any): AssessmentItem {
    let fromIso: string | null = null;
    let untilIso: string | null = null;
    try {
      if (a.available_from) {
        const d = new Date(a.available_from);
        fromIso = !isNaN(d.getTime()) ? d.toISOString() : null;
      }
      if (a.available_until) {
        const d = new Date(a.available_until);
        untilIso = !isNaN(d.getTime()) ? d.toISOString() : null;
      }
    } catch {}

    return {
      id: a._id ? a._id.toString() : (a.id || ''),
      unitId: a.unit_package_id ? (a.unit_package_id._id || a.unit_package_id).toString() : null,
      lectureId: a.lecture_id ? (a.lecture_id._id || a.lecture_id).toString() : null,
      unitTitle: (typeof a.unit_package_id === 'object' && a.unit_package_id) ? (a.unit_package_id.title_ar || a.unit_package_id.title_en || null) : null,
      lectureTitle: (typeof a.lecture_id === 'object' && a.lecture_id) ? (a.lecture_id.lecture_title_ar || a.lecture_id.lecture_title_en || null) : null,
      titleAr: a.title_ar || a.titleAr || a.title_en || a.titleEn || a.title || '',
      titleEn: a.title_en || a.titleEn || a.title_ar || a.titleAr || a.title || '',
      curriculum: a.curriculum,
      gradeLevel: a.grade_level || a.gradeLevel,
      term: a.academic_term || a.term || 'TERM_1',
      calculatorType: (a.graph_calculator === 'DESMOS' || a.calculator_mode === 'DESMOS' || a.calculatorType === 'DESMOS') ? 'DESMOS' : 'NONE',
      referenceSheetUrl: a.reference_sheet_url || a.referenceSheetUrl || null,
      durationMinutes: a.time_limit_minutes || a.duration_minutes || a.durationMinutes || 45,
      isMultiModule: !!(a.is_multi_module ?? a.isMultiModule),
      module1TimeMinutes: a.module_1_time_minutes ?? a.module1TimeMinutes ?? 35,
      module2TimeMinutes: a.module_2_time_minutes ?? a.module2TimeMinutes ?? 35,
      passPercentage: a.pass_percentage ?? a.passPercentage ?? 60,
      maxAttempts: a.max_attempts ?? a.maxAttempts ?? 1,
      availableFrom: fromIso,
      availableUntil: untilIso,
      isScheduled: !!(fromIso || untilIso),
      totalPoints: a.total_points || (a.questions?.length ? a.questions.reduce((sum: number, q: any) => sum + (Number(q.points) || 1), 0) : 20),
      isPublished: !!a.is_published,
      isPlacementTest: !!a.is_placement_test,
      assessmentType: a.assessment_type || a.assessmentType || 'QUIZ',
      isFree: !!(a.is_free ?? a.isFree),
      requiresTeacherReview: !!(a.requires_teacher_review ?? a.requiresTeacherReview),
      submissionsCount: a.submissions_count || 0,
      questions: (a.questions || []).map((q: any, idx: number) => ({
        id: q._id ? q._id.toString() : (q.id || `q_${idx}`),
        order: q.order || idx + 1,
        type: q.question_type || q.type || 'MCQ',
        textAr: q.question_text || q.text_ar || q.textAr || '',
        questionImageUrl: q.question_image_url || null,
        options: (q.options || []).map((o: any) => (o || '').toString()),
        correctOptionIndex: q.correct_option_index ?? 0,
        acceptedAnswers: (q.accepted_answers || q.acceptedAnswers || []).map((ans: any) => (ans || '').toString()),
        points: q.points || 5,
        moduleIndex: (q.module_index === 2 || q.moduleIndex === 2) ? 2 : 1,
        explanationAr: q.model_answer_text || q.explanation_ar || '',
        youtubeSolutionUrl: q.youtube_solution_url || q.youtubeSolutionUrl || null
      }))
    };
  }

  loadAssessments(forceRefresh = false): void {
    const curr = this.selectedCurriculum();
    const gr = this.selectedGrade();
    const tm = this.selectedTerm();
    if (!gr) {
      return;
    }
    const cacheKey = `${curr}_${gr}_${tm}`;
    const persistentKey = `admin_asm_${cacheKey}`;

    // Stale-While-Revalidate: Instant 0ms render from memory or localStorage
    if (!forceRefresh && ASSESSMENTS_MEMORY_CACHE.has(cacheKey)) {
      const cached = ASSESSMENTS_MEMORY_CACHE.get(cacheKey)!;
      this.assessmentsList.set(cached.items);
      this.isLoading.set(false);
      if (Date.now() - cached.timestamp < 60_000) {
        return;
      }
    } else if (!forceRefresh) {
      const persisted = this.swrCache.get<AssessmentItem[]>(persistentKey);
      if (persisted && persisted.length > 0) {
        this.assessmentsList.set(persisted);
        this.isLoading.set(false);
        ASSESSMENTS_MEMORY_CACHE.set(cacheKey, { items: persisted, timestamp: Date.now() });
      } else {
        this.isLoading.set(true);
      }
    } else {
      this.isLoading.set(true);
    }

    const termQuery = this.currentCurriculumHasTerms() ? `&academicTerm=${tm}` : '';
    this.http.get<{ success: boolean; data: any[] }>(
      `/api/v1/admin/assessments?curriculum=${curr}&gradeLevel=${gr}${termQuery}`
    ).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const raw = Array.isArray(res?.data) ? res.data : [];
        const items: AssessmentItem[] = raw
          .map((a: any) => this.mapDocToAssessmentItem(a))
          .map((item: AssessmentItem) => {
            const localDraft = this.draftService.getDraftSync(item.id);
            if (localDraft && Array.isArray(localDraft.questions) && localDraft.questions.length > 0) {
              return this.applyDraftToAssessmentItem(item, localDraft);
            }
            return item;
          });
        this.assessmentsList.set(items);
        ASSESSMENTS_MEMORY_CACHE.set(cacheKey, { items, timestamp: Date.now() });
        this.swrCache.set(persistentKey, items);
        this.checkForPendingDrafts();
      },
      error: () => {
        this.isLoading.set(false);
        if (!ASSESSMENTS_MEMORY_CACHE.has(cacheKey)) {
          this.assessmentsList.set([]);
        }
      }
    });
  }

  isGradeActive(gradeCode: string): boolean {
    return this.activeGrades().includes(gradeCode);
  }

  private saveLocalPref(key: string, val: string): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(key, val);
      } catch {}
    }
  }

  private pickDefaultGrade(options: GradeOption[]): string {
    return options.find((g) => this.isGradeActive(g.code))?.code || options[0]?.code || '';
  }

  selectCurriculum(curr: CurriculumCode): void {
    this.selectedCurriculum.set(curr);
    this.saveLocalPref('spider_admin_selected_curriculum', curr);
    const options = this.gradeOptions();
    const firstGrade = this.pickDefaultGrade(options);
    this.selectedGrade.set(firstGrade);
    this.saveLocalPref('spider_admin_selected_grade', firstGrade);
    this.currentPage.set(1);
    this.loadAssessments();
  }

  selectGulfCountry(code: 'SA' | 'QA' | 'AE' | 'KW'): void {
    this.selectedGulfCountry.set(code);
    this.saveLocalPref('spider_admin_selected_gulf_country', code);
    const options = this.gradeOptions();
    if (!options.some((g) => g.code === this.selectedGrade())) {
      const nextGrade = this.pickDefaultGrade(options);
      this.selectedGrade.set(nextGrade);
      this.saveLocalPref('spider_admin_selected_grade', nextGrade);
    }
    this.currentPage.set(1);
    this.loadAssessments();
  }

  selectIntlDivision(code: 'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM'): void {
    this.selectedIntlDivision.set(code);
    this.saveLocalPref('spider_admin_selected_intl_division', code);
    const options = this.gradeOptions();
    const nextGrade = this.pickDefaultGrade(options);
    this.selectedGrade.set(nextGrade);
    this.saveLocalPref('spider_admin_selected_grade', nextGrade);
    this.currentPage.set(1);
    this.loadAssessments();
  }

  selectGrade(grade: string): void {
    this.selectedGrade.set(grade);
    this.saveLocalPref('spider_admin_selected_grade', grade);
    this.currentPage.set(1);
    this.loadAssessments();
  }

  selectTerm(term: AcademicTermCode): void {
    this.selectedTerm.set(term);
    this.saveLocalPref('spider_admin_selected_term', term);
    this.currentPage.set(1);
    this.loadAssessments();
  }

  // =========================================================================
  // In-App Confirmation Modal (Strictly Zero window.confirm)
  // =========================================================================
  openConfirm(
    title: string,
    message: string,
    action: () => void,
    isDestructive = false,
    confirmLabel = 'تأكيد',
    cancelLabel = 'إلغاء'
  ): void {
    this.confirmDialog.set({
      isOpen: true,
      title,
      message,
      confirmLabel,
      cancelLabel,
      isDestructive,
      action
    });
  }

  closeConfirm(): void {
    this.confirmDialog.update((s) => ({ ...s, isOpen: false }));
  }

  proceedConfirm(): void {
    const act = this.confirmDialog().action;
    this.closeConfirm();
    if (act) act();
  }

  // =========================================================================
  // Create Assessment
  // =========================================================================
  openCreateModal(): void {
    this.createGulfCountry.set(this.selectedGulfCountry());
    this.createIntlDivision.set(this.selectedIntlDivision());
    const options = this.resolveGradesForScope(
      this.selectedCurriculum(),
      this.createGulfCountry(),
      this.createIntlDivision()
    );
    const initialGrade = options.some((g) => g.code === this.selectedGrade())
      ? this.selectedGrade()
      : this.pickDefaultGrade(options);

    this.createErrorMessage.set(null);
    this.isRefSheetActiveInCreate.set(false);
    this.createForm.set({
      assessmentType: 'QUIZ',
      titleAr: '',
      titleEn: '',
      curriculum: this.selectedCurriculum(),
      gradeLevel: initialGrade,
      term: this.selectedTerm(),
      unitPackageId: null,
      lectureId: null,
      durationMinutes: 45,
      isMultiModule: false,
      module1TimeMinutes: 35,
      module2TimeMinutes: 35,
      passPercentage: 60,
      maxAttempts: 1,
      isScheduled: false,
      availableFrom: null,
      availableUntil: null,
      calculatorType: 'NONE',
      referenceSheetUrl: null,
      isPlacementTest: false,
      requiresTeacherReview: false
    });
    this.loadUnitsForCreate(this.selectedCurriculum(), initialGrade, this.selectedTerm());
    this.isCreateModalOpen.set(true);
  }

  setCreateAssessmentType(type: 'QUIZ' | 'HOMEWORK' | 'COMPREHENSIVE_EXAM'): void {
    this.createForm.update((prev) => ({
      ...prev,
      assessmentType: type,
      durationMinutes: type === 'HOMEWORK' ? 60 : (type === 'COMPREHENSIVE_EXAM' ? 45 : 20),
      maxAttempts: type === 'HOMEWORK' ? 5 : 1,
      requiresTeacherReview: type === 'HOMEWORK' ? true : prev.requiresTeacherReview
    }));
  }

  closeCreateModal(): void {
    this.createErrorMessage.set(null);
    this.isCreateModalOpen.set(false);
    this.isQuestionDrawerOpen.set(false);
    this.isExamOptionsOpen.set(false);
    this.isMathKeyboardOpen.set(false);
    this.mathKeyboardTarget.set(null);
  }

  showCreateError(msg: string): void {
    this.createErrorMessage.set(msg);
    this.toastTriggered.emit({ text: msg, type: 'error' });
  }

  showEditorError(msg: string, tab?: 'SETTINGS' | 'QUESTIONS'): void {
    this.editorErrorMessage.set(msg);
    if (tab) {
      this.editorActiveTab.set(tab);
    }
    this.toastTriggered.emit({ text: msg, type: 'error' });
  }

  onCurriculumChangeInCreate(curr: CurriculumCode): void {
    const options = this.resolveGradesForScope(
      curr,
      this.createGulfCountry(),
      this.createIntlDivision()
    );
    const firstGrade = this.pickDefaultGrade(options);
    this.createForm.update((f) => ({
      ...f,
      curriculum: curr,
      gradeLevel: firstGrade,
      unitPackageId: null,
      lectureId: null
    }));
    this.loadUnitsForCreate(curr, firstGrade, this.createForm().term);
  }

  selectCreateGulfCountry(code: 'SA' | 'QA' | 'AE' | 'KW'): void {
    this.createGulfCountry.set(code);
    const options = this.createGradeOptions();
    if (!options.some((g) => g.code === this.createForm().gradeLevel)) {
      const firstGrade = this.pickDefaultGrade(options);
      this.onGradeChangeInCreate(firstGrade);
    }
  }

  selectCreateIntlDivision(code: 'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM'): void {
    this.createIntlDivision.set(code);
    const options = this.createGradeOptions();
    const firstGrade = this.pickDefaultGrade(options);
    this.onGradeChangeInCreate(firstGrade);
  }

  onGradeChangeInCreate(grade: string): void {
    this.createForm.update((f) => ({
      ...f,
      gradeLevel: grade,
      unitPackageId: null,
      lectureId: null
    }));
    this.loadUnitsForCreate(this.createForm().curriculum, grade, this.createForm().term);
  }

  onTermChangeInCreate(term: AcademicTermCode): void {
    this.createForm.update((f) => ({
      ...f,
      term,
      unitPackageId: null,
      lectureId: null
    }));
    this.loadUnitsForCreate(this.createForm().curriculum, this.createForm().gradeLevel, term);
  }

  saveNewAssessment(): void {
    this.createErrorMessage.set(null);
    const form = this.createForm();
    const rawTitle = (form.titleAr || form.titleEn || '').trim();
    if (!rawTitle) {
      this.showCreateError(this.langService.isArabic() ? 'أدخل عنوان الامتحان' : 'Enter assessment title');
      return;
    }

    if (form.isScheduled) {
      if (!form.availableFrom && !form.availableUntil) {
        this.showCreateError('اضبط موعد الجدولة.');
        return;
      }
      if (form.availableFrom && form.availableUntil) {
        if (new Date(form.availableUntil) <= new Date(form.availableFrom)) {
          this.showCreateError('يجب أن يلي الإغلاق البدء.');
          return;
        }
      }
    }

    this.isSaving.set(true);
    const isMultiMod = !!form.isMultiModule;
    const durMins = isMultiMod
      ? ((Number(form.module1TimeMinutes) || 35) + (Number(form.module2TimeMinutes) || 35))
      : form.durationMinutes;

    const isHw = form.assessmentType === 'HOMEWORK';
    const computedType = isHw
      ? 'HOMEWORK'
      : (form.isPlacementTest ? 'COMPREHENSIVE_EXAM' : (form.assessmentType || 'QUIZ'));

    const payload = {
      title_ar: rawTitle,
      title_en: (form.titleEn || rawTitle).trim(),
      curriculum: form.curriculum,
      grade_level: form.gradeLevel,
      academic_term: form.term,
      unit_package_id: form.unitPackageId || null,
      lecture_id: form.lectureId || null,
      assessment_type: computedType,
      calculator_mode: form.calculatorType,
      graph_calculator: form.calculatorType,
      reference_sheet_url: form.referenceSheetUrl || null,
      duration_minutes: durMins,
      time_limit_minutes: durMins,
      is_multi_module: isMultiMod,
      module_1_time_minutes: isMultiMod ? (Number(form.module1TimeMinutes) || 35) : null,
      module_2_time_minutes: isMultiMod ? (Number(form.module2TimeMinutes) || 35) : null,
      pass_percentage: form.passPercentage,
      max_attempts: form.maxAttempts || (isHw ? 5 : 1),
      available_from: form.isScheduled && form.availableFrom ? new Date(form.availableFrom).toISOString() : null,
      available_until: form.isScheduled && form.availableUntil ? new Date(form.availableUntil).toISOString() : null,
      is_placement_test: !!form.isPlacementTest,
      requires_teacher_review: isHw ? true : (form.requiresTeacherReview ?? false),
      is_published: true,
      questions: []
    };

    this.http.post<{ success: boolean; data: any }>('/api/v1/admin/assessments', payload).subscribe({
      next: async (res) => {
        // R2: Guaranteed cleanup of draft from Dexie upon successful creation
        await this.draftService.deleteDraft('new_assessment_draft');
        if (res?.data?._id || res?.data?.id) {
          await this.draftService.deleteDraft(res.data._id || res.data.id);
        }
        this.pendingDraft.set(null);

        this.isSaving.set(false);
        ASSESSMENTS_MEMORY_CACHE.clear();
        this.closeCreateModal();
        this.loadAssessments(true);
        const successLabel = isHw
          ? (this.langService.isArabic() ? 'تم إنشاء الواجب المنزلي' : 'Homework Created')
          : (this.langService.isArabic() ? 'تم إنشاء الامتحان' : 'Assessment Created');
        this.toastTriggered.emit({
          text: `${successLabel} (${form.gradeLevel})`,
          type: 'success'
        });
      },
      error: (err) => {
        this.isSaving.set(false);
        let errorMsg = err?.error?.error?.message || err?.error?.message;
        if (err?.error?.error?.details && Array.isArray(err.error.error.details)) {
          const first = err.error.error.details[0];
          if (first?.message) errorMsg = first.message;
        }
        if (!errorMsg) {
          errorMsg = 'تعذر الإنشاء. راجع البيانات.';
        }
        this.showCreateError(errorMsg);
      }
    });
  }

  // =========================================================================
  // Toggle Publish Status
  // =========================================================================
  togglePublish(item: AssessmentItem): void {
    const nextState = !item.isPublished;
    const actionText = nextState ? 'نشر وتفعيل' : 'إلغاء نشر';

    if (nextState && (!item.questions || item.questions.length === 0)) {
      this.toastTriggered.emit({
        text: 'لا يمكن نشر كويز فارغ.',
        type: 'error'
      });
      return;
    }

    this.openConfirm(
      `${actionText} الامتحان`,
      `${actionText} "${item.titleAr}"؟`,
      () => {
        this.http.patch(`/api/v1/admin/assessments/${item.id}`, { is_published: nextState }).subscribe({
          next: () => {
            ASSESSMENTS_MEMORY_CACHE.clear();
            this.assessmentsList.update((list) =>
              list.map((a) => (a.id === item.id ? { ...a, isPublished: nextState } : a))
            );
            this.toastTriggered.emit({
              text: `تم ${actionText} الامتحان`,
              type: 'success'
            });
          },
          error: (err) => {
            this.toastTriggered.emit({
              text: err?.error?.message || `تعذر ${actionText} الامتحان.`,
              type: 'error'
            });
          }
        });
      },
      !nextState,
      nextState ? 'نعم، انشر الامتحان' : 'نعم، ألغِ النشر',
      'تراجع'
    );
  }

  // =========================================================================
  // Delete Assessment
  // =========================================================================
  toggleFree(item: AssessmentItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (item.assessmentType === 'HOMEWORK') {
      this.toastTriggered.emit({
        text: this.langService.isArabic()
          ? 'الواجب للمشتركين فقط'
          : 'Homework is private for subscribed students',
        type: 'warning'
      });
      return;
    }

    const previousStatus = !!item.isFree;
    const newStatus = !previousStatus;

    // Optimistic UI update
    this.assessmentsList.update((list) =>
      list.map((a) => (a.id === item.id ? { ...a, isFree: newStatus } : a))
    );

    this.http.patch<{ success: boolean; data: any; message?: string }>(
      `/api/v1/admin/assessments/${item.id}/toggle-free`,
      {}
    ).subscribe({
      next: (res) => {
        const text = res?.message || (newStatus
          ? (this.langService.isArabic() ? 'الكويز متاح مجاناً' : 'Quiz is now free')
          : (this.langService.isArabic() ? 'الكويز للمشتركين فقط' : 'Quiz is private for subscribers'));
        this.toastTriggered.emit({ text, type: 'success' });
        ASSESSMENTS_MEMORY_CACHE.delete(`${this.selectedCurriculum()}_${this.selectedGrade()}_${this.selectedTerm()}`);
      },
      error: (err) => {
        this.assessmentsList.update((list) =>
          list.map((a) => (a.id === item.id ? { ...a, isFree: previousStatus } : a))
        );
        const errMsg = err?.error?.error?.message || err?.error?.message || (this.langService.isArabic() ? 'تعذر تعديل حالة إتاحة الامتحان' : 'Failed to update assessment free status');
        this.toastTriggered.emit({ text: errMsg, type: 'error' });
      }
    });
  }

  deleteAssessment(item: AssessmentItem): void {
    this.openConfirm(
      'حذف الامتحان',
      `حذف امتحان "${item.titleAr}" نهائياً؟`,
      () => {
        this.http.delete(`/api/v1/admin/assessments/${item.id}`).subscribe({
          next: async () => {
            await this.draftService.deleteDraft(item.id);
            void this.aiExtractionSessionService.deleteSession(item.id);
            if (this.pendingDraft()?.draftId === item.id || this.pendingDraft()?.assessmentId === item.id) {
              this.pendingDraft.set(null);
            }
            ASSESSMENTS_MEMORY_CACHE.clear();
            this.assessmentsList.update((list) => list.filter((a) => a.id !== item.id));
            this.toastTriggered.emit({ text: 'تم حذف الامتحان', type: 'warning' });
          },
          error: (err) => {
            this.toastTriggered.emit({
              text: err?.error?.message || 'تعذر حذف الامتحان',
              type: 'error'
            });
          }
        });
      },
      true,
      'نعم، احذف',
      'إلغاء'
    );
  }

  // =========================================================================
  // Reference Sheet (ورقة القوانين والمفاهيم)
  // =========================================================================
  setReferenceSheetActiveInCreate(active: boolean): void {
    this.isRefSheetActiveInCreate.set(active);
    if (!active) {
      this.createForm.update((f) => ({ ...f, referenceSheetUrl: null }));
    }
  }

  setReferenceSheetActiveInEditor(active: boolean): void {
    this.isRefSheetActiveInEditor.set(active);
    if (!active) {
      this.activeAssessment.update((a) => (a ? { ...a, referenceSheetUrl: null } : null));
      this.triggerDraftAutoSave(true);
    }
  }

  onReferenceSheetUploadedInCreate(url: string): void {
    if (url) {
      this.createForm.update((f) => ({ ...f, referenceSheetUrl: url }));
      this.isRefSheetActiveInCreate.set(true);
      this.toastTriggered.emit({ text: 'تم رفع ورقة القوانين', type: 'success' });
    }
  }

  removeReferenceSheetInCreate(): void {
    this.createForm.update((f) => ({ ...f, referenceSheetUrl: null }));
    this.isRefSheetActiveInCreate.set(false);
  }

  onReferenceSheetUploadedInEditor(url: string): void {
    if (url) {
      this.activeAssessment.update((a) => (a ? { ...a, referenceSheetUrl: url } : null));
      this.isRefSheetActiveInEditor.set(true);
      this.triggerDraftAutoSave(true);
      this.toastTriggered.emit({ text: 'تم إرفاق ورقة القوانين', type: 'success' });
    }
  }

  removeReferenceSheetInEditor(): void {
    this.activeAssessment.update((a) => (a ? { ...a, referenceSheetUrl: null } : null));
    this.isRefSheetActiveInEditor.set(false);
    this.triggerDraftAutoSave(true);
  }

  // =========================================================================
  // Question Safe Visual Editor & Settings
  // =========================================================================
  openEditor(item: AssessmentItem, initialTab: 'SETTINGS' | 'QUESTIONS' = 'SETTINGS'): void {
    let copy: AssessmentItem = JSON.parse(JSON.stringify(item));
    // Ensure scheduling flag is properly set if availableFrom or availableUntil exists
    copy.isScheduled = !!(copy.availableFrom || copy.availableUntil);
    copy.isMultiModule = !!copy.isMultiModule;
    copy.module1TimeMinutes = copy.module1TimeMinutes || 35;
    copy.module2TimeMinutes = copy.module2TimeMinutes || 35;

    this.moduleFilterTab.set('ALL');
    const syncDraft = this.draftService.getDraftSync(copy.id);
    if (syncDraft) {
      copy = this.applyDraftToAssessmentItem(copy, syncDraft);
      this.restoreComposerFromSnapshot(syncDraft.composerSnapshot);
    } else {
      this.resetQuestionForm(true);
    }

    this.editorGulfCountry.set(this.selectedGulfCountry());
    if (copy.curriculum === 'INTERNATIONAL') {
      this.editorIntlDivision.set(this.detectIntlDivisionForGrade(copy.gradeLevel));
    } else {
      this.editorIntlDivision.set(this.selectedIntlDivision());
    }
    this.activeAssessment.set(copy);
    this.isRefSheetActiveInEditor.set(Boolean(copy.referenceSheetUrl));
    this.editorActiveTab.set(initialTab);
    this.editorErrorMessage.set(null);
    this.autoRegradeWarning.set(false);
    this.isEditorOpen.set(true);
    this.modalNav.registerModal({
      id: 'assessment-studio-editor',
      saveDraft: () => this.triggerDraftAutoSave(true),
      close: () => this.closeEditor()
    });
    this.loadUnitsForEditor(copy.curriculum, copy.gradeLevel, copy.term);

    // Restore cached AI extraction file session synchronously if already in memory, or async from IndexedDB after refresh
    if (copy.id && !this.assessmentFileSessions()[copy.id]) {
      const syncFileRecord = this.aiExtractionSessionService.getSessionSync(copy.id);
      if (syncFileRecord && (syncFileRecord.fileName || syncFileRecord.fileBlob || syncFileRecord.currentDataUrl)) {
        const cached = this.aiExtractionSessionService.toCachedFileSession(syncFileRecord);
        this.assessmentFileSessions.update((sessions) => ({
          ...sessions,
          [copy.id]: cached
        }));
      } else {
        this.aiExtractionSessionService.getSession(copy.id).then((persistedRecord) => {
          if (
            persistedRecord &&
            (persistedRecord.fileName || persistedRecord.fileBlob || persistedRecord.currentDataUrl) &&
            !this.isDestroyed &&
            this.isEditorOpen() &&
            this.activeAssessment()?.id === copy.id &&
            !this.assessmentFileSessions()[copy.id]
          ) {
            const cached = this.aiExtractionSessionService.toCachedFileSession(persistedRecord);
            this.assessmentFileSessions.update((sessions) => ({
              ...sessions,
              [copy.id]: cached
            }));
          }
        });
      }
    }

    // Also check async Dexie draft in case IndexedDB holds a newer version than localStorage
    this.draftService.getDraft(copy.id).then((asyncDraft) => {
      if (
        asyncDraft &&
        this.isEditorOpen() &&
        this.activeAssessment()?.id === copy.id &&
        (!syncDraft || (asyncDraft.updatedAt || 0) > (syncDraft.updatedAt || 0))
      ) {
        const merged = this.applyDraftToAssessmentItem(this.activeAssessment()!, asyncDraft);
        this.activeAssessment.set(merged);
        this.syncAssessmentInMemoryList(merged);
        this.isRefSheetActiveInEditor.set(Boolean(merged.referenceSheetUrl));
        this.restoreComposerFromSnapshot(asyncDraft.composerSnapshot);
      }
    });
  }

  closeEditor(): void {
    const currentAsm = this.activeAssessment();
    if (currentAsm) {
      this.syncAssessmentInMemoryList(currentAsm);
      if (!this.closingFromExplicitSave) {
        this.triggerDraftAutoSave(true);
        if (currentAsm.questions?.length > 0 && !this.isSaving() && !this.autoPersistSub) {
          this.autoPersistAssessmentToBackend(currentAsm);
        }
      }
    }
    this.isQuestionDrawerOpen.set(false);
    this.isExamOptionsOpen.set(false);
    this.isMathKeyboardOpen.set(false);
    this.mathKeyboardTarget.set(null);
    this.editorErrorMessage.set(null);
    this.isEditorOpen.set(false);
    this.modalNav.dismissModal('assessment-studio-editor');
    this.activeAssessment.set(null);
    this.resetQuestionForm();
    this.checkForPendingDrafts();
  }

  setEditorTab(tab: 'SETTINGS' | 'QUESTIONS'): void {
    this.editorErrorMessage.set(null);
    this.editorActiveTab.set(tab);
  }

  onCurriculumChangeInEditor(curr: CurriculumCode): void {
    const asm = this.activeAssessment();
    if (!asm || asm.submissionsCount > 0) return;
    const options = this.resolveGradesForScope(
      curr,
      this.editorGulfCountry(),
      this.editorIntlDivision()
    );
    const firstGrade = this.pickDefaultGrade(options);
    this.activeAssessment.set({
      ...asm,
      curriculum: curr,
      gradeLevel: firstGrade,
      unitId: null,
      lectureId: null,
      unitTitle: null,
      lectureTitle: null
    });
    this.loadUnitsForEditor(curr, firstGrade, asm.term);
    this.triggerDraftAutoSave(true);
  }

  selectEditorGulfCountry(code: 'SA' | 'QA' | 'AE' | 'KW'): void {
    const asm = this.activeAssessment();
    if (!asm || asm.submissionsCount > 0) return;
    this.editorGulfCountry.set(code);
    const options = this.editorGradeOptions();
    if (!options.some((g) => g.code === asm.gradeLevel)) {
      const firstGrade = this.pickDefaultGrade(options);
      this.onGradeChangeInEditor(firstGrade);
    }
  }

  selectEditorIntlDivision(code: 'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM'): void {
    const asm = this.activeAssessment();
    if (!asm || asm.submissionsCount > 0) return;
    this.editorIntlDivision.set(code);
    const options = this.editorGradeOptions();
    const firstGrade = this.pickDefaultGrade(options);
    this.onGradeChangeInEditor(firstGrade);
  }

  onGradeChangeInEditor(grade: string): void {
    const asm = this.activeAssessment();
    if (!asm || asm.submissionsCount > 0) return;
    asm.gradeLevel = grade;
    asm.unitId = null;
    asm.lectureId = null;
    asm.unitTitle = null;
    asm.lectureTitle = null;
    this.loadUnitsForEditor(asm.curriculum, grade, asm.term);
    this.triggerDraftAutoSave(true);
  }

  onTermChangeInEditor(term: AcademicTermCode): void {
    const asm = this.activeAssessment();
    if (!asm) return;
    asm.term = term;
    asm.unitId = null;
    asm.lectureId = null;
    asm.unitTitle = null;
    asm.lectureTitle = null;
    this.loadUnitsForEditor(asm.curriculum, asm.gradeLevel, term);
    this.triggerDraftAutoSave(true);
  }

  onQuestionImageUploaded(url: string): void {
    this.newQuestionImageUrl.set(url);
    this.triggerDraftAutoSave(true);
    this.toastTriggered.emit({ text: 'تم رفع صورة المسألة', type: 'success' });
  }

  updateOption(index: number, value: string): void {
    const visualVal = toVisualMath(value);
    this.newQuestionOptions.update((opts) => {
      const copy = opts.length === 4 ? [...opts] : [...opts, '', '', ''].slice(0, 4);
      copy[index] = visualVal;
      return copy;
    });
  }

  resetQuestionForm(resetModuleToDefault = false): void {
    this.isQuestionDrawerOpen.set(false);
    this.isExamOptionsOpen.set(false);
    this.isMathKeyboardOpen.set(false);
    this.mathKeyboardTarget.set(null);
    this.editingQuestionId.set(null);
    this.newQuestionType.set('MCQ');
    this.newQuestionTextAr.set('');
    this.newQuestionImageUrl.set(null);
    this.newQuestionOptions.set(['', '', '', '']);
    this.newQuestionAcceptedAnswers.set(['']);
    this.newQuestionCorrectIndex.set(0);
    this.newQuestionPoints.set(5);
    if (resetModuleToDefault) {
      this.newQuestionModuleIndex.set(1);
    } else {
      const tab = this.moduleFilterTab();
      if (tab === 1 || tab === 2) {
        this.newQuestionModuleIndex.set(tab);
      }
    }
    this.newQuestionYoutubeUrl.set('');
  }

  editQuestion(q: AssessmentQuestionItem): void {
    this.editorActiveTab.set('QUESTIONS');
    this.editingQuestionId.set(q.id);
    this.newQuestionType.set(q.type === 'ESSAY_PHOTO' ? 'ESSAY' : q.type);
    this.newQuestionTextAr.set(q.textAr || '');
    this.newQuestionImageUrl.set(q.questionImageUrl || null);
    const rawOpts = q.options && q.options.length === 4
      ? [...q.options]
      : (q.options?.length ? [...q.options, '', '', ''].slice(0, 4) : ['', '', '', '']);
    this.newQuestionOptions.set(rawOpts);
    this.newQuestionAcceptedAnswers.set(
      q.acceptedAnswers && q.acceptedAnswers.length > 0 ? [...q.acceptedAnswers] : ['']
    );
    this.newQuestionCorrectIndex.set(q.correctOptionIndex >= 0 ? q.correctOptionIndex : 0);
    this.newQuestionPoints.set(Math.max(1, Math.min(50, Number(q.points) || 5)));
    this.newQuestionModuleIndex.set(q.moduleIndex === 2 ? 2 : 1);
    this.newQuestionYoutubeUrl.set(q.youtubeSolutionUrl || '');

    if (typeof document !== 'undefined') {
      setTimeout(() => {
        const composerEl = document.getElementById('questionComposerSection');
        if (composerEl) {
          composerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }

    this.toastTriggered.emit({
      text: this.langService.isArabic()
        ? `جاري تعديل السؤال رقم ${q.order}`
        : `Editing Question #${q.order}`,
      type: 'warning'
    });
  }

  cancelQuestionEdit(): void {
    this.resetQuestionForm();
    this.toastTriggered.emit({
      text: this.langService.isArabic() ? 'تم إلغاء التعديل' : 'Edit cancelled',
      type: 'warning'
    });
  }

  saveQuestion(autoPersist = true): boolean {
    if (this.editingQuestionId()) {
      return this.updateExistingQuestion(autoPersist);
    } else {
      return this.addQuestion(autoPersist);
    }
  }

  updateExistingQuestion(autoPersist = true): boolean {
    const asm = this.activeAssessment();
    const editId = this.editingQuestionId();
    if (!asm || !editId) return false;

    const text = this.newQuestionTextAr().trim();
    if (!text && !this.newQuestionImageUrl()) {
      this.toastTriggered.emit({
        text: this.langService.isArabic()
          ? 'أدخل نص السؤال أو صورته'
          : 'Enter question text or image',
        type: 'error'
      });
      return false;
    }

    if (this.newQuestionType() === 'MCQ') {
      const rawOpts = this.newQuestionOptions();
      const trimmedOpts = rawOpts.map((o) => (o || '').trim());

      // 1. Check for empty options
      if (trimmedOpts.some((o) => !o)) {
        this.toastTriggered.emit({
          text: this.langService.isArabic()
            ? 'املأ جميع الخيارات الأربعة'
            : 'Fill all 4 options',
          type: 'error'
        });
        return false;
      }

      // 2. Check for duplicate options (CRITICAL REQUIREMENT)
      const uniqueOpts = new Set(trimmedOpts);
      if (uniqueOpts.size < trimmedOpts.length) {
        this.toastTriggered.emit({
          text: this.langService.isArabic()
            ? 'الخيارات يجب أن تكون مختلفة'
            : 'Options must be unique',
          type: 'error'
        });
        return false;
      }
    } else if (this.newQuestionType() === 'INPUT_TEXT') {
      const validAccepted = this.newQuestionAcceptedAnswers().map((a) => (a || '').trim()).filter(Boolean);
      if (validAccepted.length === 0) {
        this.toastTriggered.emit({
          text: this.langService.isArabic()
            ? 'أضف إجابة مقبولة'
            : 'Add accepted answer',
          type: 'error'
        });
        return false;
      }
    }

    const questionIndex = asm.questions.findIndex((q) => q.id === editId);
    if (questionIndex === -1) {
      this.resetQuestionForm();
      return false;
    }

    const existingQ = asm.questions[questionIndex];
    const points = Math.max(1, Math.min(50, Number(this.newQuestionPoints()) || 5));
    const updatedQ: AssessmentQuestionItem = {
      ...existingQ,
      type: this.newQuestionType(),
      textAr: text || (this.langService.isArabic() ? 'مسألة رياضية مصورة' : 'Visual Math Problem'),
      questionImageUrl: this.newQuestionImageUrl(),
      options: this.newQuestionType() === 'MCQ' ? this.newQuestionOptions().map((o) => o.trim()) : [],
      correctOptionIndex: this.newQuestionType() === 'MCQ' ? this.newQuestionCorrectIndex() : -1,
      acceptedAnswers: this.newQuestionType() === 'INPUT_TEXT'
        ? this.newQuestionAcceptedAnswers().map((a) => a.trim()).filter(Boolean)
        : undefined,
      points,
      moduleIndex: asm.isMultiModule ? (this.newQuestionModuleIndex() === 2 ? 2 : 1) : 1,
      youtubeSolutionUrl: (this.newQuestionYoutubeUrl() || '').trim() || null
    };

    const nextQuestions = [...asm.questions];
    nextQuestions[questionIndex] = updatedQ;

    const hasAnyEssay = nextQuestions.some((q) => q.type === 'ESSAY' || (q.type as string) === 'ESSAY_PHOTO');
    const updatedAsm: AssessmentItem = {
      ...asm,
      questions: nextQuestions,
      requiresTeacherReview: hasAnyEssay ? true : asm.requiresTeacherReview,
      totalPoints: nextQuestions.reduce((sum, q) => sum + (q.points || 1), 0)
    };
    this.activeAssessment.set(updatedAsm);
    this.syncAssessmentInMemoryList(updatedAsm);
    this.resetQuestionForm();
    this.triggerDraftAutoSave(true);
    if (autoPersist && !this.isSaving()) {
      this.autoPersistAssessmentToBackend(updatedAsm);
    }

    if (asm.submissionsCount > 0) {
      this.autoRegradeWarning.set(true);
    }

    this.toastTriggered.emit({
      text: this.langService.isArabic() ? 'تم حفظ السؤال' : 'Question saved',
      type: 'success'
    });
    return true;
  }

  addQuestion(autoPersist = true): boolean {
    if (this.editingQuestionId()) {
      return this.updateExistingQuestion(autoPersist);
    }

    const asm = this.activeAssessment();
    if (!asm) return false;

    const text = this.newQuestionTextAr().trim();
    if (!text && !this.newQuestionImageUrl()) {
      this.toastTriggered.emit({
        text: this.langService.isArabic()
          ? 'أدخل نص السؤال أو صورته'
          : 'Enter question text or image',
        type: 'error'
      });
      return false;
    }

    if (this.newQuestionType() === 'MCQ') {
      const rawOpts = this.newQuestionOptions();
      const trimmedOpts = rawOpts.map((o) => (o || '').trim());

      // 1. Check for empty options
      if (trimmedOpts.some((o) => !o)) {
        this.toastTriggered.emit({
          text: this.langService.isArabic()
            ? 'املأ جميع الخيارات الأربعة'
            : 'Fill all 4 options',
          type: 'error'
        });
        return false;
      }

      // 2. Check for duplicate options (CRITICAL REQUIREMENT)
      const uniqueOpts = new Set(trimmedOpts);
      if (uniqueOpts.size < trimmedOpts.length) {
        this.toastTriggered.emit({
          text: this.langService.isArabic()
            ? 'الخيارات يجب أن تكون مختلفة'
            : 'Options must be unique',
          type: 'error'
        });
        return false;
      }
    } else if (this.newQuestionType() === 'INPUT_TEXT') {
      const validAccepted = this.newQuestionAcceptedAnswers().map((a) => (a || '').trim()).filter(Boolean);
      if (validAccepted.length === 0) {
        this.toastTriggered.emit({
          text: this.langService.isArabic()
            ? 'أضف إجابة مقبولة'
            : 'Add accepted answer',
          type: 'error'
        });
        return false;
      }
    }

    const points = Math.max(1, Math.min(50, Number(this.newQuestionPoints()) || 5));
    const newQ: AssessmentQuestionItem = {
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      order: asm.questions.length + 1,
      type: this.newQuestionType(),
      textAr: text || (this.langService.isArabic() ? 'مسألة رياضية مصورة' : 'Visual Math Problem'),
      questionImageUrl: this.newQuestionImageUrl(),
      options: this.newQuestionType() === 'MCQ' ? this.newQuestionOptions().map((o) => o.trim()) : [],
      correctOptionIndex: this.newQuestionType() === 'MCQ' ? this.newQuestionCorrectIndex() : -1,
      acceptedAnswers: this.newQuestionType() === 'INPUT_TEXT'
        ? this.newQuestionAcceptedAnswers().map((a) => a.trim()).filter(Boolean)
        : undefined,
      points,
      moduleIndex: asm.isMultiModule ? (this.newQuestionModuleIndex() === 2 ? 2 : 1) : 1,
      youtubeSolutionUrl: (this.newQuestionYoutubeUrl() || '').trim() || null
    };

    const nextQuestions = [...asm.questions, newQ];
    const isEssay = this.newQuestionType() === 'ESSAY' || (this.newQuestionType() as string) === 'ESSAY_PHOTO';
    const updatedAsm: AssessmentItem = {
      ...asm,
      questions: nextQuestions,
      requiresTeacherReview: isEssay ? true : asm.requiresTeacherReview,
      totalPoints: nextQuestions.reduce((sum, q) => sum + (q.points || 1), 0)
    };
    this.activeAssessment.set(updatedAsm);
    this.syncAssessmentInMemoryList(updatedAsm);
    this.resetQuestionForm();
    this.triggerDraftAutoSave(true);
    if (autoPersist && !this.isSaving()) {
      this.autoPersistAssessmentToBackend(updatedAsm);
    }

    this.toastTriggered.emit({
      text: this.langService.isArabic() ? 'تمت إضافة السؤال' : 'Question added',
      type: 'success'
    });
    return true;
  }

  deleteQuestion(order: number): void {
    const asm = this.activeAssessment();
    if (!asm) return;

    if (asm.submissionsCount > 0) {
      this.toastTriggered.emit({
        text: 'لا يمكن الحذف بعد بدء التسليمات.',
        type: 'error'
      });
      return;
    }

    this.openConfirm(
      'حذف السؤال',
      `حذف السؤال رقم ${order}؟`,
      () => {
        const deletedQuestion = asm.questions.find((q) => q.order === order);
        if (deletedQuestion && deletedQuestion.id === this.editingQuestionId()) {
          this.resetQuestionForm();
        }

        const filtered = asm.questions
          .filter((q) => q.order !== order)
          .map((q, idx) => ({ ...q, order: idx + 1 }));

        const updatedAsm: AssessmentItem = {
          ...asm,
          questions: filtered,
          totalPoints: filtered.reduce((sum, q) => sum + (q.points || 1), 0)
        };
        this.activeAssessment.set(updatedAsm);
        this.syncAssessmentInMemoryList(updatedAsm);
        this.triggerDraftAutoSave(true);
        this.autoPersistAssessmentToBackend(updatedAsm);
        this.toastTriggered.emit({ text: 'تم حذف السؤال', type: 'warning' });
      },
      true,
      'نعم، احذف',
      'إلغاء'
    );
  }

  onMcqKeyChanged(): void {
    const asm = this.activeAssessment();
    if (asm && asm.submissionsCount > 0) {
      this.autoRegradeWarning.set(true);
    }
  }

  saveAssessmentEditor(): void {
    if (this.isSaving()) return;

    const asm = this.activeAssessment();
    if (!asm) return;

    // Cancel any background auto-persist so it does not conflict with explicit user save
    if (this.autoPersistSub) {
      this.autoPersistSub.unsubscribe();
      this.autoPersistSub = null;
    }

    // 1. If user is composing or editing a question in the Questions tab, commit it first
    if (this.editingQuestionId() || this.hasUnsavedComposerInput()) {
      const committed = this.saveQuestion(false);
      if (!committed) {
        // Validation failed on current question composer; error already shown via toast
        return;
      }
    }

    const currentAsm = this.activeAssessment();
    if (!currentAsm) return;

    this.isQuestionDrawerOpen.set(false);
    this.isExamOptionsOpen.set(false);
    this.isMathKeyboardOpen.set(false);
    this.mathKeyboardTarget.set(null);
    this.editorErrorMessage.set(null);

    const rawTitle = (currentAsm.titleAr || currentAsm.titleEn || '').trim();
    if (!rawTitle) {
      this.showEditorError(this.langService.isArabic() ? 'أدخل عنوان الامتحان' : 'Enter assessment title', 'SETTINGS');
      return;
    }

    if (currentAsm.isScheduled) {
      if (!currentAsm.availableFrom && !currentAsm.availableUntil) {
        this.showEditorError('اضبط موعد الجدولة.', 'SETTINGS');
        return;
      }
      if (currentAsm.availableFrom && currentAsm.availableUntil) {
        const fromDate = new Date(currentAsm.availableFrom);
        const untilDate = new Date(currentAsm.availableUntil);
        if (isNaN(fromDate.getTime()) || isNaN(untilDate.getTime())) {
          this.showEditorError(this.langService.isArabic() ? 'تاريخ الجدولة غير صالح' : 'Invalid schedule date', 'SETTINGS');
          return;
        }
        if (untilDate <= fromDate) {
          this.showEditorError('يجب أن يلي الإغلاق البدء.', 'SETTINGS');
          return;
        }
      }
    }

    if (!currentAsm.questions || currentAsm.questions.length === 0) {
      this.showEditorError(this.langService.isArabic() ? 'أضف سؤالاً واحداً على الأقل' : 'Add at least one question', 'QUESTIONS');
      return;
    }

    // Pre-flight validation on all questions in this assessment
    for (let i = 0; i < currentAsm.questions.length; i++) {
      const q = currentAsm.questions[i];
      if (q.type === 'MCQ') {
        const opts = (q.options || []).map((o) => (o || '').trim());
        if (opts.length < 2) {
          this.showEditorError(`س${q.order}: أضف خيارين على الأقل`, 'QUESTIONS');
          return;
        }

        // Empty check
        if (opts.some((o) => !o)) {
          this.showEditorError(`س${q.order}: املأ جميع الخيارات`, 'QUESTIONS');
          return;
        }

        // Duplicate check (CRITICAL REQUIREMENT)
        const unique = new Set(opts);
        if (unique.size < opts.length) {
          this.showEditorError(`س${q.order}: الخيارات متطابقة`, 'QUESTIONS');
          return;
        }

        // Correct option bounds check
        if (q.correctOptionIndex === undefined || q.correctOptionIndex === null || q.correctOptionIndex < 0 || q.correctOptionIndex >= opts.length) {
          this.showEditorError(`س${q.order}: حدد الإجابة الصحيحة`, 'QUESTIONS');
          return;
        }
      } else if (q.type === 'INPUT_TEXT') {
        const answers = (q.acceptedAnswers || []).map((a) => (a || '').trim()).filter(Boolean);
        if (answers.length === 0) {
          this.showEditorError(`س${q.order}: أضف إجابة مقبولة`, 'QUESTIONS');
          return;
        }
      }
    }

    let payload: any;
    try {
      let fromIso: string | null = null;
      let untilIso: string | null = null;
      if (currentAsm.isScheduled && currentAsm.availableFrom) {
        const d = new Date(currentAsm.availableFrom);
        fromIso = !isNaN(d.getTime()) ? d.toISOString() : null;
      }
      if (currentAsm.isScheduled && currentAsm.availableUntil) {
        const d = new Date(currentAsm.availableUntil);
        untilIso = !isNaN(d.getTime()) ? d.toISOString() : null;
      }

      payload = {
        title_ar: rawTitle,
        title_en: (currentAsm.titleEn || rawTitle).trim(),
        curriculum: currentAsm.curriculum,
        grade_level: currentAsm.gradeLevel,
        academic_term: currentAsm.term,
        unit_package_id: currentAsm.unitId && /^[0-9a-fA-F]{24}$/.test(currentAsm.unitId) ? currentAsm.unitId : null,
        lecture_id: currentAsm.lectureId && /^[0-9a-fA-F]{24}$/.test(currentAsm.lectureId) ? currentAsm.lectureId : null,
        calculator_mode: currentAsm.calculatorType,
        graph_calculator: currentAsm.calculatorType,
        reference_sheet_url: currentAsm.referenceSheetUrl || null,
        duration_minutes: currentAsm.isMultiModule
          ? ((Number(currentAsm.module1TimeMinutes) || 35) + (Number(currentAsm.module2TimeMinutes) || 35))
          : currentAsm.durationMinutes,
        time_limit_minutes: currentAsm.isMultiModule
          ? ((Number(currentAsm.module1TimeMinutes) || 35) + (Number(currentAsm.module2TimeMinutes) || 35))
          : currentAsm.durationMinutes,
        is_multi_module: !!currentAsm.isMultiModule,
        module_1_time_minutes: currentAsm.isMultiModule ? (Number(currentAsm.module1TimeMinutes) || 35) : null,
        module_2_time_minutes: currentAsm.isMultiModule ? (Number(currentAsm.module2TimeMinutes) || 35) : null,
        pass_percentage: currentAsm.passPercentage,
        max_attempts: currentAsm.maxAttempts || 1,
        available_from: fromIso,
        available_until: untilIso,
        is_placement_test: !!currentAsm.isPlacementTest,
        requires_teacher_review: currentAsm.questions.some(q => q.type === 'ESSAY' || (q.type as string) === 'ESSAY_PHOTO')
          ? true
          : !!currentAsm.requiresTeacherReview,
        questions: currentAsm.questions.map((q, idx) => {
          const isEssay = q.type === 'ESSAY' || (q.type as string) === 'ESSAY_PHOTO';
          const isInputText = q.type === 'INPUT_TEXT';
          const qType = isEssay ? 'ESSAY_PHOTO' : isInputText ? 'INPUT_TEXT' : 'MCQ';
          const validId = q.id && /^[0-9a-fA-F]{24}$/.test(q.id) ? q.id : undefined;
          return {
            _id: validId,
            order: q.order || idx + 1,
            question_type: qType,
            question_text: (q.textAr || '').trim() || (this.langService.isArabic() ? 'مسألة رياضية مصورة' : 'Visual Math Problem'),
            question_image_url: q.questionImageUrl || null,
            options: (isEssay || isInputText) ? [] : (q.options || []).map((o) => (o || '').trim()),
            correct_option_index: (isEssay || isInputText) ? 0 : Math.max(0, Number(q.correctOptionIndex ?? 0)),
            accepted_answers: isInputText ? (q.acceptedAnswers || []).map((a) => (a || '').trim()).filter(Boolean) : undefined,
            points: Math.max(1, Math.min(50, Number(q.points || 1))),
            module_index: currentAsm.isMultiModule ? (q.moduleIndex === 2 ? 2 : 1) : 1,
            model_answer_text: (q.explanationAr || '').trim(),
            youtube_solution_url: (q.youtubeSolutionUrl || '').trim() || null
          };
        })
      };
    } catch (err: any) {
      console.error('Failed to construct save payload:', err);
      this.showEditorError(this.langService.isArabic() ? 'خطأ في معالجة بيانات الامتحان' : 'Failed to process assessment data');
      return;
    }

    this.isSaving.set(true);

    this.http.patch<{ success: boolean; data: any }>(`/api/v1/admin/assessments/${currentAsm.id}`, payload)
      .pipe(timeout(25000))
      .subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.closingFromExplicitSave = true;
          this.closeEditor();
          this.closingFromExplicitSave = false;
          this.loadAssessments(true);
          this.pendingDraft.set(null);
          ASSESSMENTS_MEMORY_CACHE.clear();

          if (res?.data && (res.data._id || res.data.id)) {
            const updatedItem = this.mapDocToAssessmentItem(res.data);
            this.assessmentsList.update((list) =>
              list.map((a) => (a.id === currentAsm.id ? updatedItem : a))
            );
          } else {
            this.assessmentsList.update((list) =>
              list.map((a) => (a.id === currentAsm.id ? currentAsm : a))
            );
          }

          this.toastTriggered.emit({
            text: this.autoRegradeWarning()
              ? (this.langService.isArabic() ? 'تم الحفظ وتفعيل إعادة التصحيح' : 'Saved and regrading triggered')
              : (this.langService.isArabic() ? 'تم حفظ الامتحان' : 'Assessment saved successfully'),
            type: 'success'
          });

          // R2: Guaranteed complete deletion of draft from Dexie upon successful save/publish (non-blocking)
          this.draftService.deleteDraft(currentAsm.id).catch((cleanupErr) => {
            console.warn('Error during post-save cleanup:', cleanupErr);
          });
        },
        error: (err) => {
          this.isSaving.set(false);
          let errorMsg = err?.error?.error?.message || err?.error?.message;
          if (err?.error?.error?.details && Array.isArray(err.error.error.details)) {
            const first = err.error.error.details[0];
            if (first?.message) errorMsg = first.message;
          }
          if (err?.name === 'TimeoutError') {
            errorMsg = this.langService.isArabic()
              ? 'انتهت مهلة حفظ الامتحان، يرجى التحقق من الاتصال والمحاولة مرة أخرى.'
              : 'Save request timed out. Please check your connection and try again.';
          }
          if (!errorMsg) {
            errorMsg = this.langService.isArabic() ? 'تعذر الحفظ. راجع البيانات.' : 'Failed to save. Check data.';
          }
          this.showEditorError(errorMsg);
        }
      });
  }

  hasEssayQuestions(asm: AssessmentItem | null | undefined): boolean {
    if (!asm || !asm.questions) return false;
    return asm.questions.some((q) => q.type === 'ESSAY' || (q.type as string) === 'ESSAY_PHOTO');
  }
}
