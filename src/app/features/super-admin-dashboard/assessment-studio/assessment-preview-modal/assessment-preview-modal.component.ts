import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  input,
  output,
  effect,
  OnDestroy,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon.component';
import { MathFormulaComponent } from '../../../../shared/components/math-formula/math-formula.component';
import { GraphCalculatorModalComponent } from '../../../../shared/components/graph-calculator-modal/graph-calculator-modal.component';
import { LangService } from '../../../../core/seo-theme-i18n/lang.service';
import { AssessmentItem, AssessmentQuestionItem } from '../assessment-studio.models';
import {
  PreviewScoringSummary,
  isEssayQuestion,
  isInputTextQuestion,
  isMcqQuestion,
  isTextAnswerMatch
} from './assessment-preview-modal.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 15 - Milestone 3: Teacher Student-Simulation Preview Modal
 * 
 * - Pure client-side sandbox simulating student assessment experience
 * - Zero HTTP network mutations (no submission API calls)
 * - Zero IndexedDB / Dexie writes (isolated from activeQuizzes & syncQueue)
 * - Distinct 3-Question Type Engine:
 *   1. MCQ: Auto-graded against correctOptionIndex.
 *   2. INPUT_TEXT: Auto-graded against teacher's acceptedAnswers with normalization.
 *   3. ESSAY_PHOTO: Exclusively requires teacher manual grading.
 * - Strict R4 compliance (zero Unicode emojis, standard SVG <app-icon> exclusively)
 */
@Component({
  selector: 'app-assessment-preview-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppIconComponent,
    MathFormulaComponent,
    GraphCalculatorModalComponent
  ],
  templateUrl: './assessment-preview-modal.component.html',
  styleUrl: './assessment-preview-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssessmentPreviewModalComponent implements OnDestroy {
  readonly langService = inject(LangService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sanitizer = inject(DomSanitizer);

  // Inputs & Outputs
  readonly isOpen = input<boolean>(false);
  readonly assessment = input<AssessmentItem | null>(null);
  readonly close = output<void>();

  // Interactive Simulation State
  readonly activeQuestionIndex = signal<number>(0);
  readonly selectedMcqAnswers = signal<Record<string, number>>({});
  readonly textAnswers = signal<Record<string, string>>({});
  readonly essayAnswers = signal<Record<string, string>>({});
  readonly essayPhotoAttached = signal<Record<string, boolean>>({});
  readonly isResultsMode = signal<boolean>(false);

  // Simulated Timer & Tool States
  readonly simulatedSecondsRemaining = signal<number>(2700);
  readonly isTimerPaused = signal<boolean>(false);
  readonly isCalculatorOpen = signal<boolean>(false);
  readonly isRefSheetOpen = signal<boolean>(false);

  private timerIntervalId: any = null;

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const asm = this.assessment();
      if (open && asm) {
        this.resetSimulation();
      } else {
        this.stopTimer();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  readonly questions = computed<AssessmentQuestionItem[]>(() => {
    return this.assessment()?.questions || [];
  });

  readonly totalQuestionsCount = computed<number>(() => {
    return this.questions().length;
  });

  readonly currentQuestion = computed<AssessmentQuestionItem | null>(() => {
    const list = this.questions();
    const idx = this.activeQuestionIndex();
    return list[idx] || null;
  });

  readonly isCurrentQuestionEssay = computed<boolean>(() => {
    const q = this.currentQuestion();
    return q ? isEssayQuestion(q) : false;
  });

  readonly isCurrentQuestionInputText = computed<boolean>(() => {
    const q = this.currentQuestion();
    return q ? isInputTextQuestion(q) : false;
  });

  readonly isCurrentQuestionMcq = computed<boolean>(() => {
    const q = this.currentQuestion();
    return q ? isMcqQuestion(q) : false;
  });

  getAcceptedAnswersList(q: AssessmentQuestionItem): string[] {
    if (!q) return [];
    const list: string[] = [];
    const rawAccepted = q.acceptedAnswers || (q as any).accepted_answers;
    if (Array.isArray(rawAccepted)) {
      for (const item of rawAccepted) {
        if (typeof item === 'string' && item.trim()) {
          const t = item.trim();
          if (!list.includes(t)) list.push(t);
        }
      }
    }
    const modelAns = q.explanationAr || (q as any).model_answer_text;
    if (modelAns && typeof modelAns === 'string' && modelAns.trim()) {
      const t = modelAns.trim();
      if (!list.includes(t)) list.push(t);
    }
    return list;
  }

  isInputTextCorrect(q: AssessmentQuestionItem): boolean {
    if (!q) return false;
    const studentText = (this.textAnswers()[q.id] || '').trim();
    if (!studentText) return false;
    const candidates = this.getAcceptedAnswersList(q);
    if (candidates.length === 0) return false;
    return candidates.some((cand) => isTextAnswerMatch(studentText, cand));
  }

  readonly scoringSummary = computed<PreviewScoringSummary>(() => {
    const qs = this.questions();
    const mcqAnswers = this.selectedMcqAnswers();
    const passPct = this.assessment()?.passPercentage ?? 60;

    let totalPoints = 0;
    let mcqTotalPoints = 0;
    let mcqEarnedPoints = 0;
    let inputTextTotalPoints = 0;
    let inputTextEarnedPoints = 0;
    let essayTotalPoints = 0;
    let mcqCount = 0;
    let inputTextCount = 0;
    let essayCount = 0;

    for (const q of qs) {
      const pts = Number(q.points) || 1;
      totalPoints += pts;

      if (isEssayQuestion(q)) {
        essayCount++;
        essayTotalPoints += pts;
        // Essay questions strictly require manual grading by teacher
      } else if (isInputTextQuestion(q)) {
        inputTextCount++;
        inputTextTotalPoints += pts;
        if (this.isInputTextCorrect(q)) {
          inputTextEarnedPoints += pts;
        }
      } else {
        mcqCount++;
        mcqTotalPoints += pts;
        const selected = mcqAnswers[q.id];
        if (selected !== undefined && selected === q.correctOptionIndex) {
          mcqEarnedPoints += pts;
        }
      }
    }

    const hasEssayQuestions = essayCount > 0;
    const autoTotalPoints = mcqTotalPoints + inputTextTotalPoints;
    const autoEarnedPoints = mcqEarnedPoints + inputTextEarnedPoints;
    const denominator = hasEssayQuestions ? autoTotalPoints : totalPoints;
    const percentage = denominator > 0 ? Math.round((autoEarnedPoints / denominator) * 100) : 0;
    const isPassed = percentage >= passPct;

    return {
      allQuestionsCount: qs.length,
      mcqCount,
      inputTextCount,
      essayCount,
      hasEssayQuestions,
      totalPoints,
      autoTotalPoints,
      autoEarnedPoints,
      mcqTotalPoints,
      mcqEarnedPoints,
      inputTextTotalPoints,
      inputTextEarnedPoints,
      essayTotalPoints,
      percentage,
      isPassed
    };
  });

  // Navigation & Answers
  selectQuestion(idx: number): void {
    if (idx >= 0 && idx < this.totalQuestionsCount()) {
      this.activeQuestionIndex.set(idx);
    }
  }

  nextQuestion(): void {
    if (this.activeQuestionIndex() < this.totalQuestionsCount() - 1) {
      this.activeQuestionIndex.update((i) => i + 1);
    }
  }

  prevQuestion(): void {
    if (this.activeQuestionIndex() > 0) {
      this.activeQuestionIndex.update((i) => i - 1);
    }
  }

  selectOption(questionId: string, optionIndex: number): void {
    this.selectedMcqAnswers.update((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  }

  isOptionSelected(questionId: string, optionIndex: number): boolean {
    return this.selectedMcqAnswers()[questionId] === optionIndex;
  }

  updateTextAnswer(questionId: string, text: string): void {
    this.textAnswers.update((prev) => ({
      ...prev,
      [questionId]: text
    }));
  }

  updateEssayAnswer(questionId: string, text: string): void {
    this.essayAnswers.update((prev) => ({
      ...prev,
      [questionId]: text
    }));
  }

  toggleEssayPhoto(questionId: string): void {
    this.essayPhotoAttached.update((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  }

  isQuestionAnswered(q: AssessmentQuestionItem): boolean {
    if (isInputTextQuestion(q)) {
      return Boolean(this.textAnswers()[q.id]?.trim());
    }
    if (isEssayQuestion(q)) {
      const text = this.essayAnswers()[q.id]?.trim();
      const hasPhoto = this.essayPhotoAttached()[q.id];
      return Boolean(text || hasPhoto);
    }
    return this.selectedMcqAnswers()[q.id] !== undefined;
  }

  isQuestionEssayType(q: AssessmentQuestionItem): boolean {
    return isEssayQuestion(q);
  }

  isQuestionInputText(q: AssessmentQuestionItem): boolean {
    return isInputTextQuestion(q);
  }

  isQuestionMcq(q: AssessmentQuestionItem): boolean {
    return isMcqQuestion(q);
  }

  getEarnedPointsForQuestion(q: AssessmentQuestionItem): number {
    if (isEssayQuestion(q)) {
      return 0; // Strictly excluded from automated scoring (requires manual teacher review)
    }
    if (isInputTextQuestion(q)) {
      return this.isInputTextCorrect(q) ? Number(q.points || 1) : 0;
    }
    const selected = this.selectedMcqAnswers()[q.id];
    return selected === q.correctOptionIndex ? Number(q.points || 1) : 0;
  }

  // Simulation Lifecycle Actions
  finishPreview(): void {
    this.isResultsMode.set(true);
    this.stopTimer();
  }

  resetSimulation(): void {
    this.selectedMcqAnswers.set({});
    this.textAnswers.set({});
    this.essayAnswers.set({});
    this.essayPhotoAttached.set({});
    this.activeQuestionIndex.set(0);
    this.isResultsMode.set(false);
    this.isCalculatorOpen.set(false);
    this.isRefSheetOpen.set(false);

    const duration = this.assessment()?.durationMinutes || 45;
    this.simulatedSecondsRemaining.set(duration * 60);
    this.startTimer();
  }

  closeModal(): void {
    this.stopTimer();
    this.close.emit();
  }

  // Timer Simulation
  private startTimer(): void {
    this.stopTimer();
    if (isPlatformBrowser(this.platformId)) {
      this.timerIntervalId = setInterval(() => {
        if (!this.isTimerPaused()) {
          this.simulatedSecondsRemaining.update((s) => (s > 0 ? s - 1 : 0));
        }
      }, 1000);
    }
  }

  private stopTimer(): void {
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  toggleTimerPause(): void {
    this.isTimerPaused.update((p) => !p);
  }

  formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const mStr = mins < 10 ? '0' + mins : '' + mins;
    const sStr = secs < 10 ? '0' + secs : '' + secs;
    return `${mStr}:${sStr}`;
  }

  // Desmos & Ref Sheet
  openCalculator(): void {
    this.isCalculatorOpen.set(true);
  }

  closeCalculator(): void {
    this.isCalculatorOpen.set(false);
  }

  openRefSheet(): void {
    this.isRefSheetOpen.set(true);
  }

  closeRefSheet(): void {
    this.isRefSheetOpen.set(false);
  }

  readonly activeInPlatformSolution = signal<{
    rawUrl: string;
    embedUrl?: SafeResourceUrl | null;
    type: 'VIDEO' | 'POST';
    title: string;
  } | null>(null);

  openInPlatformSolution(url?: string | null, title?: string): void {
    if (!url) return;
    const trimmed = url.trim();
    const videoId = this.extractYoutubeId(trimmed);

    if (videoId) {
      const embed = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
      );
      this.activeInPlatformSolution.set({
        rawUrl: trimmed,
        embedUrl: embed,
        type: 'VIDEO',
        title: title || (this.langService.isArabic() ? 'فيديو الحل النموذجي' : 'Video Solution')
      });
    } else {
      const safePostUrl = this.sanitizer.bypassSecurityTrustResourceUrl(trimmed);
      this.activeInPlatformSolution.set({
        rawUrl: trimmed,
        embedUrl: safePostUrl,
        type: 'POST',
        title: title || (this.langService.isArabic() ? 'منشور الحل النموذجي' : 'Post Solution')
      });
    }
  }

  closeInPlatformSolution(): void {
    this.activeInPlatformSolution.set(null);
  }

  extractYoutubeId(url: string): string | null {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    return match ? match[1] : null;
  }

  isYoutubePost(url?: string | null): boolean {
    if (!url) return false;
    return !this.extractYoutubeId(url) && (url.includes('/post/') || url.includes('/community'));
  }
}
