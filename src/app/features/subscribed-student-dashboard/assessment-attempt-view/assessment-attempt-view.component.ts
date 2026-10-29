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
import { QuizCacheService } from '../../../core/offline-db/quiz-cache.service';
import { OfflineSyncQueueService } from '../../../core/offline-db/offline-sync-queue.service';
import { spiderMathDb } from '../../../core/offline-db/spider-math-db';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
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
    ImageCompressorUploaderComponent
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

  // Modal & Calculator State
  readonly isDesmosOpen = signal<boolean>(false);
  readonly isTimerVisible = signal<boolean>(true);
  readonly activeQuestionIdx = signal<number>(0);
  readonly isSubmitting = signal<boolean>(false);
  readonly isSubmissionCompleted = signal<boolean>(false);

  constructor() {
    // Auto-submit when time expires (urgencyState === 'EXPIRED') even if questions remain unanswered
    effect(() => {
      const urgency = this.quizCache.urgencyState();
      const isCompleted = this.isSubmissionCompleted();
      const submitting = this.isSubmitting();
      const hasQuestions = this.bundle().questions.length > 0;

      if (urgency === 'EXPIRED' && !isCompleted && !submitting && hasQuestions) {
        this.submitAssessment(true);
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

  readonly currentQuestion = computed<AssessmentQuestionItem | null>(() => {
    const list = this.bundle().questions;
    const idx = this.activeQuestionIdx();
    return list[idx] || (list.length > 0 ? list[0] : null);
  });

  readonly totalQuestionsCount = computed(() => this.bundle().questions.length);

  // Homework Photos Signal
  readonly uploadedHomeworkPhotos = signal<string[]>([]);

  // Unanswered Questions Tracking (Enforce 100% completion before submission)
  readonly unansweredQuestions = computed(() => {
    const list = this.bundle().questions;
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
            type: (q.options && q.options.length > 0) ? 'MCQ' : 'ESSAY'
          }));

          this.bundle.set({
            assessmentId: record.assessmentId,
            unitId: record.unitId || '',
            titleAr: record.title || 'تقييم تدريبي',
            titleEn: '',
            durationMinutes: record.durationMinutes || 30,
            questions: mappedQuestions
          });
        },
        error: (err) => {
          console.error('Failed to load assessment questions', err);
          const errorCode = err?.error?.error?.code;
          const latestSubId = err?.error?.error?.details?.latestSubmissionId || assessmentId;

          // If maximum attempts exceeded or attempt already completed:
          if (errorCode === 'MAX_ATTEMPTS_EXCEEDED' || err?.status === 403) {
            this.router.navigate(['/student/submissions', latestSubId, 'feedback']);
            return;
          }

          if (errorCode === 'ASSESSMENT_NOT_STARTED_YET') {
            alert('عذراً، هذا الاختبار لم يحن موعد بدئه بعد وفقاً لجدول النشر.');
            this.router.navigate(['/student']);
            return;
          }

          if (errorCode === 'ASSESSMENT_EXPIRED') {
            alert('عذراً، لقد انتهى الموعد المحدد لتسليم هذا الاختبار.');
            this.router.navigate(['/student']);
            return;
          }
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

  isQuestionAnswered(questionId: string): boolean {
    const active = this.quizCache.activeQuiz();
    if (!active) return false;
    const hasOption = active.selectedAnswers?.[questionId] !== undefined;
    const hasImage = (active.uploadedImages || []).some(img => img.questionId === questionId);
    return hasOption || hasImage;
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

  toggleTimerVisibility(): void {
    this.isTimerVisible.update(v => !v);
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
          `تنبيه: لا يمكن تسليم التقييم لوجود أسئلة غير مجاب عنها! يرجى إجابة الأسئلة التالية أولاً: (سؤال رقم: ${numbersList})`
        );
        // Automatically jump to the first unanswered question!
        this.activeQuestionIdx.set(unanswered[0].index);
        return;
      }
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

      const homeworkImgs = (record?.uploadedImages ?? []).map(img => ({
        question_id: img.questionId,
        image_url: img.imageUrl,
        size_kb: img.sizeKb,
        rotation_deg: img.rotation
      }));

      const payload = {
        idempotency_key: idempotencyKey,
        mcq_answers: mcqAnswers,
        uploaded_solution_imgs: homeworkImgs,
        client_started_at: record?.clientStartedAt ?? new Date().toISOString(),
        client_submitted_at: new Date().toISOString(),
        elapsed_time_sec: record?.elapsedSeconds ?? 120,
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
          // Delete active quiz from Dexie so offline queue does not double-send
          await spiderMathDb.activeQuizzes.delete(this.bundle().assessmentId);
          this.isSubmissionCompleted.set(true);
          const subId = res?.data?.submissionId || this.bundle().assessmentId;
          this.router.navigate(['/student/submissions', subId, 'feedback']);
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
        record?.elapsedSeconds ?? 120,
        idempotencyKey
      );

      this.isSubmissionCompleted.set(true);
      this.router.navigate(['/student/submissions', this.bundle().assessmentId, 'feedback']);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
