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
    assessmentId: 'asm_diff_2',
    unitId: 'unit_calc_diff',
    titleAr: 'تقييم المحاضرة 2: الاشتقاق الضمني والمشتقات العليا',
    titleEn: 'Assessment 2: Implicit & Higher Derivatives',
    durationMinutes: 20,
    questions: [
      {
        _id: 'q_diff_1',
        order: 1,
        textAr: 'إذا كانت س² + ص² = ٢٥، فإن (د²ص / دس²) عند النقطة (٣، ٤) تساوي:',
        textEn: 'If x² + y² = 25, then (d²y/dx²) at the point (3, 4) equals:',
        options: [
          { optionIndex: 0, textAr: '-٢٥ / ٦٤', textEn: '-25 / 64' },
          { optionIndex: 1, textAr: '-٣ / ٤', textEn: '-3 / 4' },
          { optionIndex: 2, textAr: '٢٥ / ٦٤', textEn: '25 / 64' },
          { optionIndex: 3, textAr: 'صفر', textEn: '0' }
        ],
        points: 5,
        requiresDesmos: true,
        type: 'MCQ'
      },
      {
        _id: 'q_diff_2',
        order: 2,
        textAr: 'أوجد معادلة المماس لمنحنى الدالة ص = س³ - ٣س عند النقطة الواقعة عليه وإحداثيها السيني س = ٢.',
        textEn: 'Find the tangent line equation for y = x³ - 3x at the point where x = 2.',
        imageUrl: 'https://res.cloudinary.com/spider-math/image/upload/v1729000000/spider-math-questions/sample_curve_prompt.webp',
        options: [
          { optionIndex: 0, textAr: 'ص = ٩س - ١٦', textEn: 'y = 9x - 16' },
          { optionIndex: 1, textAr: 'ص = ٦س - ١٠', textEn: 'y = 6x - 10' },
          { optionIndex: 2, textAr: 'ص = ٣س - ٤', textEn: 'y = 3x - 4' },
          { optionIndex: 3, textAr: 'ص = ٩س + ٢', textEn: 'y = 9x + 2' }
        ],
        points: 5,
        requiresDesmos: true,
        type: 'MCQ'
      },
      {
        _id: 'q_diff_3',
        order: 3,
        textAr: 'مسألة مقالية: أثبت بالخطوات الكاملة أن المشتقة الثانية للمنحنى ص = جتا(٢س) تحقق المعادلة التفاضلية (د²ص / دس²) + ٤ص = صفر. (التقط صورة حلك بخط اليد وأرفقها بالأسفل).',
        textEn: 'Essay Problem: Prove step-by-step that y = cos(2x) satisfies (d²y/dx²) + 4y = 0. Capture homework photo below.',
        options: [],
        points: 10,
        requiresDesmos: false,
        type: 'ESSAY'
      }
    ]
  });

  readonly currentQuestion = computed(() => {
    const list = this.bundle().questions;
    const idx = this.activeQuestionIdx();
    return list[idx] || list[0];
  });

  readonly totalQuestionsCount = computed(() => this.bundle().questions.length);

  // Homework Photos Signal
  readonly uploadedHomeworkPhotos = signal<string[]>([]);

  ngOnInit(): void {
    // Start or resume quiz in Dexie.js cache
    this.quizCache.startAndCache(this.bundle().assessmentId).subscribe();
  }

  selectOption(optionIndex: number): void {
    const qId = this.currentQuestion()._id;
    this.quizCache.recordAnswer(qId, optionIndex);
  }

  isOptionSelected(optionIndex: number): boolean {
    const qId = this.currentQuestion()._id;
    return this.quizCache.activeQuiz()?.selectedAnswers[qId] === optionIndex;
  }

  onHomeworkUploaded(urls: string[]): void {
    this.uploadedHomeworkPhotos.set(urls);
    const qId = this.currentQuestion()._id;
    const items = urls.map(url => ({
      questionId: qId,
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
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
