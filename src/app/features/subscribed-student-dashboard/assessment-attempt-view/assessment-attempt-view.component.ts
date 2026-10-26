import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { GraphCalculatorModalComponent } from '../../../shared/components/graph-calculator-modal/graph-calculator-modal.component';
import { ImageCompressorUploaderComponent } from '../../../shared/components/image-compressor-uploader/image-compressor-uploader.component';
import { QuizCacheService } from '../../../core/offline-db/quiz-cache.service';
import { OfflineSyncQueueService } from '../../../core/offline-db/offline-sync-queue.service';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { AssessmentAttemptBundle, AssessmentQuestionItem } from './assessment-attempt-view.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 13: Assessment Attempt View Component
 * 
 * - Full offline-first assessment execution with Dexie.js cache
 * - Tamper-proof monotonic clock (performance.now()) with 3 urgency states (Animation 4.6)
 * - 500-Concurrent Request Jitter Shield integration (OfflineSyncQueueService)
 * - Draggable Desmos-Only Graphing Calculator modal
 * - Dual-folder WebP image compressor & clarity preview for student homework
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
  readonly quizCache = inject(QuizCacheService);
  readonly syncQueue = inject(OfflineSyncQueueService);
  readonly langService = inject(LangService);

  // Modal & Calculator State
  readonly isDesmosOpen = signal<boolean>(false);
  readonly activeQuestionIdx = signal<number>(0);
  readonly isSubmitting = signal<boolean>(false);
  readonly isSubmissionCompleted = signal<boolean>(false);

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
        }
      });
    }
  }

  selectOption(optionIndex: number): void {
    const curr = this.currentQuestion();
    if (!curr) return;
    this.quizCache.recordAnswer(curr._id, optionIndex);
  }

  isOptionSelected(optionIndex: number): boolean {
    const curr = this.currentQuestion();
    if (!curr) return false;
    return this.quizCache.activeQuiz()?.selectedAnswers[curr._id] === optionIndex;
  }

  onHomeworkUploaded(urls: string[]): void {
    this.uploadedHomeworkPhotos.set(urls);
    const curr = this.currentQuestion();
    if (!curr) return;
    const items = urls.map(url => ({
      questionId: curr._id,
      imageUrl: url,
      rotation: 0,
      sizeKb: 120
    }));
    this.quizCache.recordHomeworkImages(items);
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

  /**
   * Final submission: completes quiz locally in Dexie.js (< 2ms)
   * and queues attempt into OfflineSyncQueueService with 1s–15s jitter shield.
   */
  async submitAssessment(): Promise<void> {
    this.isSubmitting.set(true);

    try {
      const record = await this.quizCache.completeQuizLocally();
      const mcqAnswers = Object.entries(record?.selectedAnswers ?? {}).map(
        ([question_id, selected_option_index]) => ({
          question_id,
          selected_option_index
        })
      );

      const homeworkImgs = (record?.uploadedImages ?? []).map(img => ({
        question_id: img.questionId,
        image_url: img.imageUrl,
        size_kb: img.sizeKb,
        rotation_deg: img.rotation
      }));

      await this.syncQueue.queueAttempt(
        this.bundle().assessmentId,
        mcqAnswers,
        homeworkImgs,
        record?.clientStartedAt ?? new Date().toISOString(),
        record?.elapsedSeconds ?? 120
      );

      this.isSubmissionCompleted.set(true);
      // Automatically route student to submission feedback viewer
      this.router.navigate(['/student/submissions', this.bundle().assessmentId, 'feedback']);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
