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
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { ImageCompressorUploaderComponent } from '../../../shared/components/image-compressor-uploader/image-compressor-uploader.component';
import {
  AssessmentItem,
  AssessmentQuestionItem
} from './assessment-studio.models';
import { CANONICAL_CURRICULUM_TREE, curriculumHasTerms } from '../../../core/constants/curriculum-tree.constant';
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
import { SwrCacheService } from '../../../core/services/swr-cache.service';

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
  private readonly swrCache = inject(SwrCacheService);

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

  // State
  readonly assessmentsList = signal<AssessmentItem[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);

  // Active Grades & Tracks State
  readonly activeGrades = signal<string[]>([]);
  readonly currentCurriculumHasTerms = computed<boolean>(() => curriculumHasTerms(this.selectedCurriculum()));

  readonly allCurriculaTracks = signal<CurriculumTrackItem[]>(
    CANONICAL_CURRICULUM_TREE.map(c => ({
      code: c.code as CurriculumCode,
      nameAr: c.titleAr,
      grades: c.grades.map(g => ({
        code: g.code,
        titleAr: g.titleAr,
        titleEn: g.titleEn
      }))
    }))
  );

  readonly gradeOptions = computed<GradeOption[]>(() => {
    const track = this.allCurriculaTracks().find((t) => t.code === this.selectedCurriculum());
    return track ? track.grades : [];
  });

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
    titleAr: string;
    titleEn: string;
    curriculum: CurriculumCode;
    gradeLevel: string;
    term: AcademicTermCode;
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
    titleAr: '',
    titleEn: '',
    curriculum: 'EGYPTIAN',
    gradeLevel: '',
    term: 'TERM_1',
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

  readonly createGradeOptions = computed<GradeOption[]>(() => {
    const formCurr = this.createForm().curriculum;
    const track = this.allCurriculaTracks().find((t) => t.code === formCurr);
    return track ? track.grades : [];
  });

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
    const track = this.allCurriculaTracks().find((t) => t.code === asm.curriculum);
    return track ? track.grades : [];
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
    if (tab === 'ALL') return asm.questions;
    if (tab === 1) return asm.questions.filter((q) => q.moduleIndex !== 2);
    return asm.questions.filter((q) => q.moduleIndex === 2);
  });

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

  updateAcceptedAnswer(idx: number, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.newQuestionAcceptedAnswers.update((arr) => {
      const copy = [...arr];
      copy[idx] = val;
      return copy;
    });
  }

  // Math Virtual Keyboard Integration
  readonly isMathKeyboardOpen = signal<boolean>(false);
  readonly mathKeyboardTarget = signal<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // AI Question Extraction & Slicer State (Phase 5)
  readonly isAiExtractionModalOpen = signal<boolean>(false);
  readonly cachedFileSession = signal<ICachedFileSession | null>(null);
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

  constructor() {
    effect(() => {
      const modalOpen = this.isAnyModalOpen();
      if (isPlatformBrowser(this.platformId) && typeof document !== 'undefined') {
        document.body.style.overflow = modalOpen ? 'hidden' : '';
      }
    });
  }

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
      const pos = target.selectionStart ?? visualVal.length;
      target.value = visualVal;
      target.setSelectionRange(pos, pos);
    }
    if (target.tagName.toLowerCase() === 'textarea') {
      this.newQuestionTextAr.set(visualVal);
    } else {
      const optIdx = target.getAttribute('data-opt-index');
      if (optIdx !== null) {
        this.updateOption(Number(optIdx), visualVal);
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
    const formattedNewQuestions = extractedQuestions.map((q, idx) => ({
      ...q,
      order: startOrder + idx + 1
    }));

    const updatedQuestions = [...currentQuestions, ...formattedNewQuestions];
    const updatedAsm: AssessmentItem = {
      ...asm,
      questions: updatedQuestions,
      totalPoints: updatedQuestions.reduce((sum, q) => sum + (q.points || 1), 0)
    };
    this.activeAssessment.set(updatedAsm);
    this.syncAssessmentInMemoryList(updatedAsm);
    this.triggerDraftAutoSave(true);
    this.autoPersistAssessmentToBackend(updatedAsm);

    this.toastTriggered.emit({
      text: this.langService.isArabic()
        ? `تم إدراج وحفظ ${extractedQuestions.length} أسئلة بنجاح بالامتحان!`
        : `Successfully inserted and saved ${extractedQuestions.length} questions into assessment!`,
      type: 'success'
    });
  }

  onFileSessionCached(session: ICachedFileSession): void {
    this.cachedFileSession.set(session);
    this.toastTriggered.emit({
      text: this.langService.isArabic()
        ? `تم تجهيز ملف "${session.fileName}" (صفحة ${session.pageNumber}) للقص اليدوي.`
        : `File "${session.fileName}" (page ${session.pageNumber}) ready for cropping.`,
      type: 'success'
    });
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
      const asm = this.activeAssessment();
      if (asm) {
        this.activeAssessment.set({ ...asm });
      }
    } else {
      this.newQuestionImageUrl.set(result.imageUrl);
    }
    this.isManualSlicerOpen.set(false);
    this.activeQuestionForSlicing.set(null);
    this.triggerDraftAutoSave(true);
    this.toastTriggered.emit({
      text: this.langService.isArabic() ? 'تم قص الصورة وحفظها بنجاح!' : 'Image cropped successfully!',
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
    if (ASSESSMENTS_MEMORY_CACHE.has(cacheKey)) {
      const entry = ASSESSMENTS_MEMORY_CACHE.get(cacheKey)!;
      ASSESSMENTS_MEMORY_CACHE.set(cacheKey, {
        items: entry.items.map((a) => (a.id === cloned.id ? cloned : a)),
        timestamp: Date.now()
      });
    }
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
    if (!asm || !asm.id || asm.id === 'new_assessment_draft') return;
    const rawTitle = (asm.titleAr || asm.titleEn || '').trim();
    if (!rawTitle) return;
    if (!asm.questions || asm.questions.length === 0) return;

    // Validate all MCQ and INPUT_TEXT questions before auto-persisting to backend
    for (const q of asm.questions) {
      if (q.type === 'MCQ') {
        const opts = (q.options || []).map((o) => (o || '').trim());
        if (opts.length < 2 || opts.some((o) => !o) || new Set(opts).size < opts.length) {
          return;
        }
      } else if (q.type === 'INPUT_TEXT') {
        const accepted = (q.acceptedAnswers || []).map((a) => (a || '').trim()).filter(Boolean);
        if (accepted.length === 0) {
          return;
        }
      }
    }

    const payload = {
      title_ar: rawTitle,
      title_en: (asm.titleEn || rawTitle).trim(),
      curriculum: asm.curriculum,
      grade_level: asm.gradeLevel,
      academic_term: asm.term,
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
      available_from: asm.isScheduled && asm.availableFrom ? new Date(asm.availableFrom).toISOString() : null,
      available_until: asm.isScheduled && asm.availableUntil ? new Date(asm.availableUntil).toISOString() : null,
      is_placement_test: !!asm.isPlacementTest,
      requires_teacher_review: asm.questions.some(q => q.type === 'ESSAY' || (q.type as string) === 'ESSAY_PHOTO')
        ? true
        : !!asm.requiresTeacherReview,
      questions: asm.questions.map((q, idx) => {
        const isEssay = q.type === 'ESSAY' || (q.type as string) === 'ESSAY_PHOTO';
        const isInputText = q.type === 'INPUT_TEXT';
        const qType = isEssay ? 'ESSAY_PHOTO' : isInputText ? 'INPUT_TEXT' : 'MCQ';
        return {
          _id: q.id && !q.id.startsWith('q_') ? q.id : undefined,
          order: q.order || idx + 1,
          question_type: qType,
          question_text: q.textAr || 'مسألة رياضية',
          question_image_url: q.questionImageUrl || null,
          options: (isEssay || isInputText) ? [] : (q.options || []).map((o) => o.trim()),
          correct_option_index: (isEssay || isInputText) ? 0 : Number(q.correctOptionIndex ?? 0),
          accepted_answers: isInputText ? (q.acceptedAnswers || []).map((a) => a.trim()).filter(Boolean) : undefined,
          points: Number(q.points || 1),
          module_index: q.moduleIndex === 2 ? 2 : 1,
          model_answer_text: q.explanationAr || '',
          youtube_solution_url: q.youtubeSolutionUrl || null
        };
      })
    };

    this.http.patch(`/api/v1/admin/assessments/${asm.id}`, payload).subscribe({
      next: async () => {
        this.draftService.lastSavedTimestamp.set(Date.now());
        if (!this.hasUnsavedComposerInput()) {
          await this.draftService.deleteDraft(asm.id);
          if (this.pendingDraft()?.draftId === asm.id || this.pendingDraft()?.assessmentId === asm.id) {
            this.pendingDraft.set(null);
          }
        }
      },
      error: () => {
        // Keep local draft in Dexie + localStorage so nothing is ever lost on network failure
      }
    });
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
        ? 'تمت استعادة المسودة بنجاح!'
        : 'Draft restored successfully!',
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
    this.checkForPendingDrafts();
    if (isPlatformBrowser(this.platformId)) {
      try {
        const savedCurriculum = localStorage.getItem('spider_admin_selected_curriculum') as CurriculumCode | null;
        if (savedCurriculum) {
          this.selectedCurriculum.set(savedCurriculum);
        }

        const savedGrade = localStorage.getItem('spider_admin_selected_grade');
        if (savedGrade) {
          this.selectedGrade.set(savedGrade);
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
    this.isQuestionDrawerOpen.set(false);
    this.isQuestionDrawerOpen.set(false);
    this.isExamOptionsOpen.set(false);
    this.isMathKeyboardOpen.set(false);
    this.mathKeyboardTarget.set(null);
    if (isPlatformBrowser(this.platformId) && typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  loadTracksAndActiveGrades(): void {
    this.http.get<{ success: boolean; data: any }>('/api/v1/public/active-grades').subscribe({
      next: (res) => {
        const active: string[] = Array.isArray(res?.data?.activeGrades) ? res.data.activeGrades : [];
        if (active.length > 0) {
          this.activeGrades.set(active);
        }
        if (res?.data?.curriculaTracks && Array.isArray(res.data.curriculaTracks) && res.data.curriculaTracks.length > 0) {
          this.allCurriculaTracks.set(res.data.curriculaTracks);
        }

        // If no grade was saved in localStorage, pick the first active grade dynamically
        let savedGrade: string | null = null;
        if (isPlatformBrowser(this.platformId)) {
          try {
            savedGrade = localStorage.getItem('spider_admin_selected_grade');
          } catch {}
        }
        if (!savedGrade) {
          const currentTrackGrades = this.gradeOptions();
          const activeGrade = currentTrackGrades.find(g => active.includes(g.code))?.code || active[0] || currentTrackGrades[0]?.code || '';
          if (activeGrade && this.selectedGrade() !== activeGrade) {
            this.selectedGrade.set(activeGrade);
            this.loadAssessments();
          }
        }
      }
    });
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
        const items: AssessmentItem[] = raw.map((a: any): AssessmentItem => {
          const fromIso = a.available_from ? new Date(a.available_from).toISOString() : null;
          const untilIso = a.available_until ? new Date(a.available_until).toISOString() : null;
          return {
            id: a._id || a.id,
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
              id: q._id || `q_${idx}`,
              order: q.order || idx + 1,
              type: q.question_type || q.type || 'MCQ',
              textAr: q.question_text || q.text_ar || q.textAr || '',
              questionImageUrl: q.question_image_url || null,
              options: q.options || [],
              correctOptionIndex: q.correct_option_index ?? 0,
              acceptedAnswers: q.accepted_answers || q.acceptedAnswers || [],
              points: q.points || 5,
              moduleIndex: (q.module_index === 2 || q.moduleIndex === 2) ? 2 : 1,
              explanationAr: q.model_answer_text || q.explanation_ar || '',
              youtubeSolutionUrl: q.youtube_solution_url || q.youtubeSolutionUrl || null
            }))
          };
        }).map((item: AssessmentItem) => {
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

  selectCurriculum(curr: CurriculumCode): void {
    this.selectedCurriculum.set(curr);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('spider_admin_selected_curriculum', curr);
      } catch {}
    }
    const track = this.allCurriculaTracks().find((t) => t.code === curr);
    const firstActive = track?.grades.find((g) => this.isGradeActive(g.code))?.code;
    const firstGrade = firstActive || track?.grades[0]?.code || '';
    this.selectedGrade.set(firstGrade);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('spider_admin_selected_grade', firstGrade);
      } catch {}
    }
    this.currentPage.set(1);
    this.loadAssessments();
  }

  selectGrade(grade: string): void {
    this.selectedGrade.set(grade);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('spider_admin_selected_grade', grade);
      } catch {}
    }
    this.currentPage.set(1);
    this.loadAssessments();
  }

  selectTerm(term: AcademicTermCode): void {
    this.selectedTerm.set(term);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('spider_admin_selected_term', term);
      } catch {}
    }
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
    const track = this.allCurriculaTracks().find((t) => t.code === this.selectedCurriculum());
    const initialGrade = track?.grades.some((g) => g.code === this.selectedGrade())
      ? this.selectedGrade()
      : (track?.grades.find((g) => this.isGradeActive(g.code))?.code || track?.grades[0]?.code || '');

    this.createErrorMessage.set(null);
    this.isRefSheetActiveInCreate.set(false);
    this.createForm.set({
      titleAr: '',
      titleEn: '',
      curriculum: this.selectedCurriculum(),
      gradeLevel: initialGrade,
      term: this.selectedTerm(),
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
    this.isCreateModalOpen.set(true);
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
    const track = this.allCurriculaTracks().find((t) => t.code === curr);
    const firstGrade = track?.grades.find((g) => this.isGradeActive(g.code))?.code || track?.grades[0]?.code || '';
    this.createForm.update((f) => ({
      ...f,
      curriculum: curr,
      gradeLevel: firstGrade
    }));
  }

  saveNewAssessment(): void {
    this.createErrorMessage.set(null);
    const form = this.createForm();
    const rawTitle = (form.titleAr || form.titleEn || '').trim();
    if (!rawTitle) {
      this.showCreateError(this.langService.isArabic() ? 'يرجى إدخال عنوان الامتحان!' : 'Please enter assessment title!');
      return;
    }

    if (form.isScheduled) {
      if (!form.availableFrom && !form.availableUntil) {
        this.showCreateError('تنبيه: قمتِ بتفعيل الجدولة، يرجى ضبط موعد التنزيل أو الإغلاق من التقويم، أو إلغاء تفعيل الجدولة.');
        return;
      }
      if (form.availableFrom && form.availableUntil) {
        if (new Date(form.availableUntil) <= new Date(form.availableFrom)) {
          this.showCreateError('تنبيه: موعد إغلاق الامتحان يجب أن يكون بعد موعد بدء وتنزيل الامتحان!');
          return;
        }
      }
    }

    this.isSaving.set(true);
    const isMultiMod = !!form.isMultiModule;
    const durMins = isMultiMod
      ? ((Number(form.module1TimeMinutes) || 35) + (Number(form.module2TimeMinutes) || 35))
      : form.durationMinutes;

    const payload = {
      title_ar: rawTitle,
      title_en: (form.titleEn || rawTitle).trim(),
      curriculum: form.curriculum,
      grade_level: form.gradeLevel,
      academic_term: form.term,
      assessment_type: form.isPlacementTest ? 'COMPREHENSIVE_EXAM' : 'QUIZ',
      calculator_mode: form.calculatorType,
      graph_calculator: form.calculatorType,
      reference_sheet_url: form.referenceSheetUrl || null,
      duration_minutes: durMins,
      time_limit_minutes: durMins,
      is_multi_module: isMultiMod,
      module_1_time_minutes: isMultiMod ? (Number(form.module1TimeMinutes) || 35) : null,
      module_2_time_minutes: isMultiMod ? (Number(form.module2TimeMinutes) || 35) : null,
      pass_percentage: form.passPercentage,
      max_attempts: form.maxAttempts || 1,
      available_from: form.isScheduled && form.availableFrom ? new Date(form.availableFrom).toISOString() : null,
      available_until: form.isScheduled && form.availableUntil ? new Date(form.availableUntil).toISOString() : null,
      is_placement_test: !!form.isPlacementTest,
      requires_teacher_review: form.requiresTeacherReview ?? false,
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
        this.toastTriggered.emit({
          text: `تم إنشاء الامتحان وتخصيصه لـ (${form.gradeLevel}) بنجاح!`,
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
          errorMsg = 'تعذر إنشاء الامتحان. يرجى مراجعة البيانات المدخلة.';
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
        text: 'لا يمكن نشر كويز فارغ. أضف أسئلة أولاً.',
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
              text: `تم ${actionText} الامتحان بنجاح!`,
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
      nextState ? 'نعم، انشر الامتحان' : 'نعم، قم بإلغاء النشر',
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
          ? 'الواجب المنزلي خاص دائماً بالطلاب المشتركين ولا يمكن جعله مجانياً'
          : 'Homework is strictly private for subscribed students',
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
          ? (this.langService.isArabic() ? 'تم تفعيل إتاحة الكويز مجاناً لجميع الطلاب' : 'Quiz is now free for all students')
          : (this.langService.isArabic() ? 'تم قفل الكويز ليكون خاصاً بالطلاب المشتركين' : 'Quiz is now private for subscribed students'));
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
            if (this.pendingDraft()?.draftId === item.id || this.pendingDraft()?.assessmentId === item.id) {
              this.pendingDraft.set(null);
            }
            ASSESSMENTS_MEMORY_CACHE.clear();
            this.assessmentsList.update((list) => list.filter((a) => a.id !== item.id));
            this.toastTriggered.emit({ text: 'تم حذف الامتحان بنجاح!', type: 'warning' });
          },
          error: (err) => {
            this.toastTriggered.emit({
              text: err?.error?.message || 'تعذر حذف الامتحان من قاعدة البيانات.',
              type: 'error'
            });
          }
        });
      },
      true,
      'نعم، احذف الامتحان',
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
      this.toastTriggered.emit({ text: 'تم رفع صورة ورقة القوانين بنجاح!', type: 'success' });
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
      this.toastTriggered.emit({ text: 'تم إرفاق ورقة القوانين بالامتحان بنجاح!', type: 'success' });
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

    const syncDraft = this.draftService.getDraftSync(copy.id);
    if (syncDraft) {
      copy = this.applyDraftToAssessmentItem(copy, syncDraft);
      this.restoreComposerFromSnapshot(syncDraft.composerSnapshot);
    } else {
      this.resetQuestionForm();
    }

    this.activeAssessment.set(copy);
    this.isRefSheetActiveInEditor.set(Boolean(copy.referenceSheetUrl));
    this.editorActiveTab.set(initialTab);
    this.editorErrorMessage.set(null);
    this.autoRegradeWarning.set(false);
    this.isEditorOpen.set(true);

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
      if (this.hasUnsavedComposerInput()) {
        this.triggerDraftAutoSave(true);
      }
    }
    this.isQuestionDrawerOpen.set(false);
    this.isExamOptionsOpen.set(false);
    this.isMathKeyboardOpen.set(false);
    this.mathKeyboardTarget.set(null);
    this.editorErrorMessage.set(null);
    this.isEditorOpen.set(false);
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
    const track = this.allCurriculaTracks().find((t) => t.code === curr);
    const firstGrade = track?.grades.find((g) => this.isGradeActive(g.code))?.code || track?.grades[0]?.code || '';
    this.activeAssessment.set({
      ...asm,
      curriculum: curr,
      gradeLevel: firstGrade
    });
    this.triggerDraftAutoSave(true);
  }

  onQuestionImageUploaded(url: string): void {
    this.newQuestionImageUrl.set(url);
    this.triggerDraftAutoSave(true);
    this.toastTriggered.emit({ text: 'تم ضغط ورفع صورة المسألة بنجاح!', type: 'success' });
  }

  updateOption(index: number, value: string): void {
    const visualVal = toVisualMath(value);
    this.newQuestionOptions.update((opts) => {
      const copy = opts.length === 4 ? [...opts] : [...opts, '', '', ''].slice(0, 4);
      copy[index] = visualVal;
      return copy;
    });
  }

  resetQuestionForm(): void {
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
    this.newQuestionModuleIndex.set(this.moduleFilterTab() === 2 ? 2 : 1);
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

  saveQuestion(): void {
    if (this.editingQuestionId()) {
      this.updateExistingQuestion();
    } else {
      this.addQuestion();
    }
  }

  updateExistingQuestion(): void {
    const asm = this.activeAssessment();
    const editId = this.editingQuestionId();
    if (!asm || !editId) return;

    const text = this.newQuestionTextAr().trim();
    if (!text && !this.newQuestionImageUrl()) {
      this.toastTriggered.emit({
        text: this.langService.isArabic()
          ? 'يرجى كتابة نص السؤال أو رفع صورة المسألة الرياضية!'
          : 'Please enter question text or upload a problem image!',
        type: 'error'
      });
      return;
    }

    if (this.newQuestionType() === 'MCQ') {
      const rawOpts = this.newQuestionOptions();
      const trimmedOpts = rawOpts.map((o) => (o || '').trim());

      // 1. Check for empty options
      if (trimmedOpts.some((o) => !o)) {
        this.toastTriggered.emit({
          text: this.langService.isArabic()
            ? 'تنبيه: لا يمكن ترك أحد خيارات الإجابة فارغاً! يرجى ملء كافة خيارات الإجابة الأربعة.'
            : 'Warning: Cannot leave any answer option empty! Please fill all 4 options.',
          type: 'error'
        });
        return;
      }

      // 2. Check for duplicate options (CRITICAL REQUIREMENT)
      const uniqueOpts = new Set(trimmedOpts);
      if (uniqueOpts.size < trimmedOpts.length) {
        this.toastTriggered.emit({
          text: this.langService.isArabic()
            ? 'تنبيه: لا يمكن أن يتطابق خياران بنفس الإجابة! يرجى التأكد من كتابة إجابات مختلفة لكل خيار.'
            : 'Warning: Answer options cannot be identical! Please provide distinct options.',
          type: 'error'
        });
        return;
      }
    } else if (this.newQuestionType() === 'INPUT_TEXT') {
      const validAccepted = this.newQuestionAcceptedAnswers().map((a) => (a || '').trim()).filter(Boolean);
      if (validAccepted.length === 0) {
        this.toastTriggered.emit({
          text: this.langService.isArabic()
            ? 'تنبيه: يجب إضافة إجابة صحيحة واحدة على الأقل للسؤال النصي (الإجابات المحتملة المقبولة)!'
            : 'Warning: Please add at least one accepted answer for the text question!',
          type: 'error'
        });
        return;
      }
    }

    const questionIndex = asm.questions.findIndex((q) => q.id === editId);
    if (questionIndex === -1) {
      this.resetQuestionForm();
      return;
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
      moduleIndex: this.newQuestionModuleIndex() === 2 ? 2 : 1,
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
    this.autoPersistAssessmentToBackend(updatedAsm);

    if (asm.submissionsCount > 0) {
      this.autoRegradeWarning.set(true);
    }

    this.toastTriggered.emit({
      text: this.langService.isArabic() ? 'تم حفظ تعديلات السؤال بنجاح!' : 'Question changes saved successfully!',
      type: 'success'
    });
  }

  addQuestion(): void {
    if (this.editingQuestionId()) {
      this.updateExistingQuestion();
      return;
    }

    const asm = this.activeAssessment();
    if (!asm) return;

    const text = this.newQuestionTextAr().trim();
    if (!text && !this.newQuestionImageUrl()) {
      this.toastTriggered.emit({
        text: this.langService.isArabic()
          ? 'يرجى كتابة نص السؤال أو رفع صورة المسألة الرياضية!'
          : 'Please enter question text or upload a problem image!',
        type: 'error'
      });
      return;
    }

    if (this.newQuestionType() === 'MCQ') {
      const rawOpts = this.newQuestionOptions();
      const trimmedOpts = rawOpts.map((o) => (o || '').trim());

      // 1. Check for empty options
      if (trimmedOpts.some((o) => !o)) {
        this.toastTriggered.emit({
          text: this.langService.isArabic()
            ? 'تنبيه: لا يمكن ترك أحد خيارات الإجابة فارغاً! يرجى ملء كافة خيارات الإجابة الأربعة.'
            : 'Warning: Cannot leave any answer option empty! Please fill all 4 options.',
          type: 'error'
        });
        return;
      }

      // 2. Check for duplicate options (CRITICAL REQUIREMENT)
      const uniqueOpts = new Set(trimmedOpts);
      if (uniqueOpts.size < trimmedOpts.length) {
        this.toastTriggered.emit({
          text: this.langService.isArabic()
            ? 'تنبيه: لا يمكن أن يتطابق خياران بنفس الإجابة! يرجى التأكد من كتابة إجابات مختلفة لكل خيار.'
            : 'Warning: Answer options cannot be identical! Please provide distinct options.',
          type: 'error'
        });
        return;
      }
    } else if (this.newQuestionType() === 'INPUT_TEXT') {
      const validAccepted = this.newQuestionAcceptedAnswers().map((a) => (a || '').trim()).filter(Boolean);
      if (validAccepted.length === 0) {
        this.toastTriggered.emit({
          text: this.langService.isArabic()
            ? 'تنبيه: يجب إضافة إجابة صحيحة واحدة على الأقل للسؤال النصي (الإجابات المحتملة المقبولة)!'
            : 'Warning: Please add at least one accepted answer for the text question!',
          type: 'error'
        });
        return;
      }
    }

    const points = Math.max(1, Math.min(50, Number(this.newQuestionPoints()) || 5));
    const newQ: AssessmentQuestionItem = {
      id: `q_${Date.now()}`,
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
      moduleIndex: this.newQuestionModuleIndex() === 2 ? 2 : 1,
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
    this.autoPersistAssessmentToBackend(updatedAsm);

    this.toastTriggered.emit({
      text: this.langService.isArabic() ? 'تمت إضافة وحفظ السؤال بنجاح!' : 'Question added and saved successfully!',
      type: 'success'
    });
  }

  deleteQuestion(order: number): void {
    const asm = this.activeAssessment();
    if (!asm) return;

    if (asm.submissionsCount > 0) {
      this.toastTriggered.emit({
        text: 'لا يمكن حذف الأسئلة بعد بدء التسليمات.',
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
        this.toastTriggered.emit({ text: 'تم حذف السؤال من الامتحان!', type: 'warning' });
      },
      true,
      'نعم، احذف السؤال',
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
    const asm = this.activeAssessment();
    if (!asm) return;

    this.isQuestionDrawerOpen.set(false);
    this.isExamOptionsOpen.set(false);
    this.isMathKeyboardOpen.set(false);
    this.mathKeyboardTarget.set(null);
    this.editorErrorMessage.set(null);

    const rawTitle = (asm.titleAr || asm.titleEn || '').trim();
    if (!rawTitle) {
      this.showEditorError(this.langService.isArabic() ? 'يرجى إدخال عنوان الامتحان!' : 'Please enter assessment title!', 'SETTINGS');
      return;
    }

    if (asm.isScheduled) {
      if (!asm.availableFrom && !asm.availableUntil) {
        this.showEditorError('تنبيه: قمتِ بتفعيل الجدولة، يرجى ضبط موعد التنزيل أو الإغلاق من التقويم، أو إلغاء تفعيل الجدولة.', 'SETTINGS');
        return;
      }
      if (asm.availableFrom && asm.availableUntil) {
        if (new Date(asm.availableUntil) <= new Date(asm.availableFrom)) {
          this.showEditorError('تنبيه: موعد إغلاق الامتحان يجب أن يكون بعد موعد بدء وتنزيل الامتحان!', 'SETTINGS');
          return;
        }
      }
    }

    if (!asm.questions || asm.questions.length === 0) {
      this.showEditorError('تنبيه: يجب إضافة سؤال واحد على الأقل قبل حفظ الكويز! يرجى إضافة الأسئلة من تبويب الأسئلة.', 'QUESTIONS');
      return;
    }

    // Pre-flight validation on all questions in this assessment
    for (let i = 0; i < asm.questions.length; i++) {
      const q = asm.questions[i];
      if (q.type === 'MCQ') {
        const opts = (q.options || []).map((o) => (o || '').trim());
        if (opts.length < 2) {
          this.showEditorError(`السؤال رقم ${q.order}: يجب أن يحتوي على خيارين على الأقل.`, 'QUESTIONS');
          return;
        }

        // Empty check
        if (opts.some((o) => !o)) {
          this.showEditorError(`السؤال رقم ${q.order}: يحتوي على خيار إجابة فارغ! يرجى ملء جميع الخيارات.`, 'QUESTIONS');
          return;
        }

        // Duplicate check (CRITICAL REQUIREMENT)
        const unique = new Set(opts);
        if (unique.size < opts.length) {
          this.showEditorError(`السؤال رقم ${q.order}: يحتوي على خيارات إجابة متطابقة! لا يمكن أن تتكرر نفس الإجابة في أكثر من خيار.`, 'QUESTIONS');
          return;
        }

        // Correct option bounds check
        if (q.correctOptionIndex === undefined || q.correctOptionIndex === null || q.correctOptionIndex < 0 || q.correctOptionIndex >= opts.length) {
          this.showEditorError(`السؤال رقم ${q.order}: يرجى تحديد الإجابة الصحيحة من بين الخيارات المتاحة.`, 'QUESTIONS');
          return;
        }
      } else if (q.type === 'INPUT_TEXT') {
        const answers = (q.acceptedAnswers || []).map((a) => (a || '').trim()).filter(Boolean);
        if (answers.length === 0) {
          this.showEditorError(`السؤال رقم ${q.order}: يجب إضافة إجابة صحيحة مقبولة واحدة على الأقل.`, 'QUESTIONS');
          return;
        }
      }
    }

    this.isSaving.set(true);

    // Transform full assessment settings & questions into normalized schema for backend
    const payload = {
      title_ar: rawTitle,
      title_en: (asm.titleEn || rawTitle).trim(),
      curriculum: asm.curriculum,
      grade_level: asm.gradeLevel,
      academic_term: asm.term,
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
      available_from: asm.isScheduled && asm.availableFrom ? new Date(asm.availableFrom).toISOString() : null,
      available_until: asm.isScheduled && asm.availableUntil ? new Date(asm.availableUntil).toISOString() : null,
      is_placement_test: !!asm.isPlacementTest,
      requires_teacher_review: asm.questions.some(q => q.type === 'ESSAY' || (q.type as string) === 'ESSAY_PHOTO') ? true : !!asm.requiresTeacherReview,
      questions: asm.questions.map((q, idx) => {
        const isEssay = q.type === 'ESSAY' || (q.type as string) === 'ESSAY_PHOTO';
        const isInputText = q.type === 'INPUT_TEXT';
        const qType = isEssay ? 'ESSAY_PHOTO' : isInputText ? 'INPUT_TEXT' : 'MCQ';
        return {
          _id: q.id && !q.id.startsWith('q_') ? q.id : undefined,
          order: q.order || idx + 1,
          question_type: qType,
          question_text: q.textAr || 'مسألة رياضية',
          question_image_url: q.questionImageUrl || null,
          options: (isEssay || isInputText) ? [] : (q.options || []).map((o) => o.trim()),
          correct_option_index: (isEssay || isInputText) ? 0 : Number(q.correctOptionIndex ?? 0),
          accepted_answers: isInputText ? (q.acceptedAnswers || []).map((a) => a.trim()).filter(Boolean) : undefined,
          points: Number(q.points || 1),
          module_index: q.moduleIndex === 2 ? 2 : 1,
          model_answer_text: q.explanationAr || '',
          youtube_solution_url: q.youtubeSolutionUrl || null
        };
      })
    };

    this.http.patch(`/api/v1/admin/assessments/${asm.id}`, payload).subscribe({
      next: async () => {
        // R2: Guaranteed complete deletion of draft from Dexie upon successful save/publish
        await this.draftService.deleteDraft(asm.id);
        this.pendingDraft.set(null);

        this.isSaving.set(false);
        ASSESSMENTS_MEMORY_CACHE.clear();
        this.assessmentsList.update((list) =>
          list.map((a) => (a.id === asm.id ? asm : a))
        );
        this.closeEditor();
        this.loadAssessments(true);
        this.toastTriggered.emit({
          text: this.autoRegradeWarning()
            ? 'تم حفظ الامتحان وتفعيل إعادة التصحيح التلقائي للطلاب المسلمين بنجاح!'
            : 'تم حفظ وتحديث إعدادات وبنك أسئلة الامتحان بنجاح!',
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
          errorMsg = 'تعذر حفظ وتحديث إعدادات الامتحان. يرجى مراجعة البيانات المدخلة.';
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
