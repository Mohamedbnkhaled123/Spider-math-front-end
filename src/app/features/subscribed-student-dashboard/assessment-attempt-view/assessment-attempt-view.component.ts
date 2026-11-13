import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  effect,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { GraphCalculatorModalComponent } from '../../../shared/components/graph-calculator-modal/graph-calculator-modal.component';
import { ImageCompressorUploaderComponent } from '../../../shared/components/image-compressor-uploader/image-compressor-uploader.component';
import { MathFormulaComponent } from '../../../shared/components/math-formula/math-formula.component';
import { QuizCacheService } from '../../../core/offline-db/quiz-cache.service';
import { OfflineSyncQueueService } from '../../../core/offline-db/offline-sync-queue.service';
import { spiderMathDb } from '../../../core/offline-db/spider-math-db';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { AssessmentAttemptBundle, AssessmentQuestionItem } from './assessment-attempt-view.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 13: Assessment Attempt View Component
 * 
 * - Full offline-first assessment execution with Dexie.js cache
 * - Tamper-proof monotonic clock (performance.now()) with 4 urgency states
 * - 500-Concurrent Request Jitter Shield integration (OfflineSyncQueueService)
 * - Draggable Desmos-Only Graphing Calculator modal
 * - Dual-folder WebP image compressor & clarity preview for student homework
 * - Auto-submission on time expiration (even with unanswered questions)
 * - Toggleable timer visibility with hour/min/sec precision formatting
 */
@Component({
  selector: 'app-assessment-attempt-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AppIconComponent,
    GraphCalculatorModalComponent,
    ImageCompressorUploaderComponent,
    MathFormulaComponent
  ],
  templateUrl: './assessment-attempt-view.component.html',
  styleUrls: ['./assessment-attempt-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssessmentAttemptViewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  readonly quizCache = inject(QuizCacheService);
  readonly syncQueue = inject(OfflineSyncQueueService);
  readonly langService = inject(LangService);
  readonly confirmDialogService = inject(ConfirmDialogService);

  // Modal & Calculator State
  readonly isDesmosOpen = signal<boolean>(false);
  readonly isReferenceOpen = signal<boolean>(false);
  readonly isTimerVisible = signal<boolean>(true);
  readonly activeQuestionIdx = signal<number>(0);
  readonly isSubmitting = signal<boolean>(false);
  readonly isSubmissionCompleted = signal<boolean>(false);
  readonly returnToHome = computed<boolean>(() => this.route.snapshot.queryParamMap.get('returnToHome') === 'true');

  // Multi-Module State
  readonly currentModule = signal<1 | 2>(1);
  readonly isModule1Locked = signal<boolean>(false);

  constructor() {
    // Auto-submit when time expires (urgencyState === 'EXPIRED') even if questions remain unanswered
    effect(() => {
      const urgency = this.quizCache.urgencyState();
      const isCompleted = this.isSubmissionCompleted();
      const submitting = this.isSubmitting();
      const hasQuestions = this.bundle().questions.length > 0;
      const isMulti = this.bundle().isMultiModule;
      const currMod = this.currentModule();

      if (urgency === 'EXPIRED' && !isCompleted && !submitting && hasQuestions) {
        if (isMulti && currMod === 1) {
          // In multi-module exams, Module 1 expiration auto-advances to Module 2 immediately
          this.confirmDialogService.close();
          this.transitionToModule2(true);
        } else {
          this.submitAssessment(true);
        }
      }
    });
  }

  // Bundle Data
  readonly bundle = signal<AssessmentAttemptBundle>({
    assessmentId: '',
    unitId: '',
    titleAr: '',
    titleEn: '',
    durationMinutes: 30,
    questions: []
  });

  // Partition questions per module
  readonly module1Questions = computed(() =>
    this.bundle().questions.filter(q => (q.moduleIndex ?? 1) === 1)
  );

  readonly module2Questions = computed(() =>
    this.bundle().questions.filter(q => q.moduleIndex === 2)
  );

  readonly activeModuleQuestions = computed(() => {
    if (!this.bundle().isMultiModule) {
      return this.bundle().questions;
    }
    return this.currentModule() === 1 ? this.module1Questions() : this.module2Questions();
  });

  readonly currentQuestion = computed<AssessmentQuestionItem | null>(() => {
    const list = this.activeModuleQuestions();
    const idx = this.activeQuestionIdx();
    return list[idx] || (list.length > 0 ? list[0] : null);
  });

  readonly totalQuestionsCount = computed(() => this.activeModuleQuestions().length);

  // Homework Photos Signal
  readonly uploadedHomeworkPhotos = signal<string[]>([]);

  // Unanswered Questions Tracking (Enforce 100% completion before submission / module advancement)
  readonly unansweredQuestions = computed(() => {
    const list = this.activeModuleQuestions();
    const active = this.quizCache.activeQuiz();
    if (!active || list.length === 0) return [];

    return list
      .map((q, idx) => ({
        index: idx,
        order: q.order || idx + 1,
        id: q._id,
        isAnswered: this.isQuestionAnswered(q._id)
      }))
      .filter((q) => !q.isAnswered);
  });

  readonly unansweredCount = computed(() => this.unansweredQuestions().length);
  readonly submissionWarning = signal<string>('');

  ngOnInit(): void {
    const assessmentId = this.route.snapshot.paramMap.get('id');
    if (assessmentId) {
      this.quizCache.startAndCache(assessmentId).subscribe({
        next: (record) => {
          const isMultiModule = !!(record.isMultiModule ?? (record as any).is_multi_module);
          const module1TimeMinutes = record.module1DurationMinutes ?? (record as any).module_1_time_minutes ?? 35;
          const module2TimeMinutes = record.module2DurationMinutes ?? (record as any).module_2_time_minutes ?? 35;

          const mappedQuestions: AssessmentQuestionItem[] = (record.questions || []).map((q, idx) => ({
            _id: q._id,
            order: q.question_order ?? idx + 1,
            textAr: q.question_text_ar,
            textEn: q.question_text_en,
            imageUrl: q.question_image_url,
            options: (q.options || []).map((o: any, oIdx: number) => ({
              optionIndex: typeof o === 'object' && o.option_index !== undefined ? o.option_index : oIdx,
              textAr: typeof o === 'string' ? o : (o.text_ar || ''),
              textEn: typeof o === 'string' ? o : (o.text_en || '')
            })),
            points: q.points || 1,
            requiresDesmos: !!q.requires_desmos,
            type: q.question_type === 'INPUT_TEXT'
              ? 'INPUT_TEXT'
              : (q.question_type === 'ESSAY_PHOTO' || q.question_type === 'ESSAY' || !q.options || q.options.length === 0)
              ? 'ESSAY'
              : 'MCQ',
            moduleIndex: ((q as any).module_index === 2 || (q as any).moduleIndex === 2) ? 2 : 1
          }));

          this.bundle.set({
            assessmentId: record.assessmentId,
            unitId: record.unitId || '',
            titleAr: record.title || 'تقييم تدريبي',
            titleEn: '',
            referenceSheetUrl: record.referenceSheetUrl || null,
            durationMinutes: record.durationMinutes || 30,
            isMultiModule,
            module1TimeMinutes,
            module2TimeMinutes,
            questions: mappedQuestions
          });

          if (isMultiModule) {
            if (record.currentModule === 2 || record.module1Locked) {
              this.currentModule.set(2);
              this.isModule1Locked.set(true);
            } else {
              this.currentModule.set(1);
              this.isModule1Locked.set(false);
            }
          }
        },
        error: (err) => {
          console.error('Failed to load assessment questions', err);
          const errorCode = err?.error?.error?.code;
          const latestSubId = err?.error?.error?.details?.latestSubmissionId;

          // If maximum attempts exceeded AND there is an actual completed submission:
          if (errorCode === 'MAX_ATTEMPTS_EXCEEDED' && latestSubId) {
            this.router.navigate(['/student/submissions', latestSubId, 'feedback']);
            return;
          }

          if (errorCode === 'NO_ACTIVE_SUBSCRIPTION_403') {
            const msg = err?.error?.error?.message || (this.langService.isArabic() ? 'هذا الاختبار للمشتركين فقط.' : 'Assessment is for subscribers only.');
            alert(msg);
            this.router.navigate(['/student']);
            return;
          }

          if (errorCode === 'FORBIDDEN_403') {
            const msg = err?.error?.error?.message || (this.langService.isArabic() ? 'هذا الاختبار غير متاح لصفك الدراسي.' : 'Assessment not available for your grade.');
            alert(msg);
            this.router.navigate(['/student']);
            return;
          }

          if (errorCode === 'ASSESSMENT_NOT_STARTED_YET') {
            alert(this.langService.isArabic() ? 'لم يحن موعد بدء الاختبار بعد.' : 'This assessment is not open yet.');
            this.router.navigate(['/student']);
            return;
          }

          if (errorCode === 'ASSESSMENT_EXPIRED') {
            alert(this.langService.isArabic() ? 'انتهى موعد تسليم هذا الاختبار.' : 'Submission deadline has passed.');
            this.router.navigate(['/student']);
            return;
          }

          const fallbackMsg = err?.error?.error?.message || err?.error?.message || (this.langService.isArabic() ? 'تعذر بدء الاختبار حالياً.' : 'Unable to start assessment.');
          alert(fallbackMsg);
          this.router.navigate(['/student']);
        }
      });
    }
  }

  selectOption(optionIndex: number): void {
    const curr = this.currentQuestion();
    if (!curr) return;
    this.submissionWarning.set('');
    this.quizCache.recordAnswer(curr._id, optionIndex);
  }

  isOptionSelected(optionIndex: number): boolean {
    const curr = this.currentQuestion();
    if (!curr) return false;
    return this.quizCache.activeQuiz()?.selectedAnswers[curr._id] === optionIndex;
  }

  clearOption(): void {
    const curr = this.currentQuestion();
    if (!curr) return;
    const currentQuiz = this.quizCache.activeQuiz();
    if (!currentQuiz) return;
    const updated = { ...currentQuiz.selectedAnswers };
    delete updated[curr._id];
    currentQuiz.selectedAnswers = updated;
    this.quizCache.activeQuiz.set({ ...currentQuiz });
  }

  getTextAnswer(questionId: string): string {
    return this.quizCache.activeQuiz()?.textAnswers?.[questionId] || '';
  }

  recordTextAnswer(questionId: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.submissionWarning.set('');
    this.quizCache.recordTextAnswer(questionId, val);
  }

  isQuestionAnswered(questionId: string): boolean {
    const active = this.quizCache.activeQuiz();
    if (!active) return false;
    const hasOption = active.selectedAnswers?.[questionId] !== undefined;
    const hasImage = (active.uploadedImages || []).some(img => img.questionId === questionId);
    const hasText = Boolean(active.textAnswers?.[questionId]?.trim());
    return hasOption || hasImage || hasText;
  }

  getQuestionImages(questionId: string) {
    const active = this.quizCache.activeQuiz();
    return (active?.uploadedImages || []).filter(img => img.questionId === questionId);
  }

  onHomeworkUploaded(urls: string[]): void {
    const curr = this.currentQuestion();
    if (!curr) return;
    this.onQuestionHomeworkUploaded(curr._id, urls);
  }

  onQuestionHomeworkUploaded(questionId: string, urls: string[]): void {
    const items = urls.map(url => ({
      questionId,
      imageUrl: url,
      rotation: 0,
      sizeKb: 120
    }));
    this.submissionWarning.set('');
    this.quizCache.recordHomeworkImages(items, questionId);
  }

  removeQuestionImage(questionId: string, imageUrl: string): void {
    this.quizCache.removeHomeworkImage(questionId, imageUrl);
  }

  prevQuestion(): void {
    if (this.activeQuestionIdx() > 0) {
      this.activeQuestionIdx.update(i => i - 1);
    }
  }

  nextQuestion(): void {
    if (this.activeQuestionIdx() < this.totalQuestionsCount() - 1) {
      this.activeQuestionIdx.update(i => i + 1);
    }
  }

  toggleDesmos(): void {
    this.isDesmosOpen.update(v => !v);
  }

  toggleReference(): void {
    this.isReferenceOpen.update(v => !v);
  }

  toggleTimerVisibility(): void {
    this.isTimerVisible.update(v => !v);
  }

  /**
   * Transitions from Module 1 to Module 2.
   * Prompts confirmation dialog warning that Module 1 will be permanently locked.
   * Once confirmed, resets question index, locks Module 1, and starts Module 2 clock.
   */
  async transitionToModule2(isAutoTransition: boolean = false): Promise<void> {
    if (this.currentModule() !== 1 || this.isModule1Locked()) return;

    if (!isAutoTransition) {
      const unanswered = this.unansweredQuestions();
      if (unanswered.length > 0) {
        const numbersList = unanswered.map((u) => u.order).join('، ');
        this.submissionWarning.set(
          this.langService.isArabic()
            ? `يرجى إجابة الأسئلة أولاً: (${numbersList})`
            : `Please answer remaining questions: (${numbersList})`
        );
        this.activeQuestionIdx.set(unanswered[0].index);
        return;
      }

      const confirmed = await this.confirmDialogService.confirm({
        title: this.langService.isArabic() ? 'تسليم الموديول الأول' : 'Submit Module 1',
        message: this.langService.isArabic()
          ? 'لن تتمكن من تعديل إجابات الموديول الأول بعد تسليمه. متابعة؟'
          : 'You cannot edit Module 1 after submitting. Proceed?',
        confirmLabel: this.langService.isArabic() ? 'الانتقال للموديول الثاني' : 'Proceed to Module 2',
        cancelLabel: this.langService.isArabic() ? 'مراجعة الموديول الأول' : 'Review Module 1',
        icon: 'alert-triangle',
        isDestructive: false
      });

      if (!confirmed) {
        return;
      }
    } else {
      this.confirmDialogService.close();
    }

    this.submissionWarning.set('');
    this.isModule1Locked.set(true);
    this.currentModule.set(2);
    this.activeQuestionIdx.set(0);

    await this.quizCache.transitionToModule2(this.bundle().assessmentId);
  }

  /**
   * Final submission: completes quiz locally in Dexie.js (< 2ms)
   * and queues attempt into OfflineSyncQueueService with 1s–15s jitter shield.
   * If isAutoSubmit is true (time expired), it automatically submits even if some questions are unanswered.
   */
  async submitAssessment(isAutoSubmit: boolean = false): Promise<void> {
    if (this.isSubmitting() || this.isSubmissionCompleted()) return;

    // Normal student manual submission: cannot submit if any question is unanswered!
    if (!isAutoSubmit) {
      const unanswered = this.unansweredQuestions();
      if (unanswered.length > 0) {
        const numbersList = unanswered.map((u) => u.order).join('، ');
        this.submissionWarning.set(
          this.langService.isArabic()
            ? `يرجى إجابة الأسئلة أولاً: (${numbersList})`
            : `Please answer remaining questions: (${numbersList})`
        );
        // Automatically jump to the first unanswered question!
        this.activeQuestionIdx.set(unanswered[0].index);
        return;
      }

      const confirmed = await this.confirmDialogService.confirm({
        title: this.langService.isArabic() ? 'تسليم التقييم' : 'Submit Assessment',
        message: this.langService.isArabic()
          ? 'تسليم التقييم نهائياً؟ لا يمكن التعديل بعد التسليم.'
          : 'Submit assessment? You cannot edit answers after submission.',
        confirmLabel: this.langService.isArabic() ? 'تسليم التقييم' : 'Submit Assessment',
        cancelLabel: this.langService.isArabic() ? 'مراجعة الإجابات' : 'Review Answers',
        icon: 'check-circle',
        isDestructive: false
      });

      if (!confirmed) {
        return;
      }
    } else {
      // Immediate auto-submit on timer expiration: dismiss any open confirmation dialog
      this.confirmDialogService.close();
    }

    this.submissionWarning.set('');
    this.isSubmitting.set(true);

    try {
      const active = this.quizCache.activeQuiz();
      const idempotencyKey = active?.idempotencyKey || this.syncQueue.generateUUIDv4();
      const record = await this.quizCache.completeQuizLocally();
      const mcqAnswers = Object.entries(record?.selectedAnswers ?? {}).map(
        ([question_id, selected_option_index]) => ({
          question_id,
          selected_option_index: Number(selected_option_index)
        })
      );

      const textAnswers = Object.entries(record?.textAnswers ?? {}).map(
        ([question_id, text_answer]) => ({
          question_id,
          text_answer: String(text_answer)
        })
      );

      const homeworkImgs = (record?.uploadedImages ?? []).map(img => ({
        question_id: img.questionId,
        image_url: img.imageUrl,
        size_kb: img.sizeKb,
        rotation_deg: img.rotation
      }));

      const totalElapsedSec = (record?.module1ElapsedSeconds || 0) + (record?.elapsedSeconds || 0);

      const payload = {
        idempotency_key: idempotencyKey,
        mcq_answers: mcqAnswers,
        text_answers: textAnswers,
        uploaded_solution_imgs: homeworkImgs,
        client_started_at: record?.clientStartedAt ?? new Date().toISOString(),
        client_submitted_at: new Date().toISOString(),
        elapsed_time_sec: totalElapsedSec || 120,
        is_auto_submit: isAutoSubmit,
        is_offline_cached: false,
        offline_disconnect_count: 0
      };

      if (typeof navigator !== 'undefined' && navigator.onLine) {
        try {
          const res = await firstValueFrom(
            this.http.post<{ success: boolean; data: any }>(
              `/api/v1/assessments/${this.bundle().assessmentId}/sync-submission`,
              payload
            )
          );
          // Clear active quiz cache from both Dexie and localStorage so state is cleanly purged
          await this.quizCache.clearQuiz(this.bundle().assessmentId);
          this.isSubmissionCompleted.set(true);
          const subId = res?.data?.submissionId || this.bundle().assessmentId;
          const returnToHome = this.route.snapshot.queryParamMap.get('returnToHome') === 'true';
          this.router.navigate(['/student/submissions', subId, 'feedback'], returnToHome ? { queryParams: { returnToHome: 'true' } } : undefined);
          return;
        } catch (onlineErr) {
          console.warn('Direct online submission failed, falling back to sync queue:', onlineErr);
        }
      }

      // Offline fallback: queue into Dexie with the exact same idempotencyKey
      await this.syncQueue.queueAttempt(
        this.bundle().assessmentId,
        mcqAnswers,
        homeworkImgs,
        record?.clientStartedAt ?? new Date().toISOString(),
        totalElapsedSec || 120,
        idempotencyKey,
        textAnswers
      );
      // Clear active quiz cache from both Dexie and localStorage after queuing offline attempt
      await this.quizCache.clearQuiz(this.bundle().assessmentId);

      this.isSubmissionCompleted.set(true);
      const returnToHome = this.route.snapshot.queryParamMap.get('returnToHome') === 'true';
      this.router.navigate(['/student/submissions', this.bundle().assessmentId, 'feedback'], returnToHome ? { queryParams: { returnToHome: 'true' } } : undefined);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
