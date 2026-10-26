import { Injectable, inject, signal, computed, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, from, map, switchMap } from 'rxjs';
import { spiderMathDb } from './spider-math-db';
import {
  ActiveQuizRecord,
  AssessmentStartResponse,
  CachedQuestion,
  UrgencyState
} from './quiz-cache.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 12: Offline-First Quiz Cache & Monotonic Clock Service
 * 
 * - Starts assessments and caches sanitized question bundles in Dexie.js
 * - Runs a tamper-proof monotonic clock (performance.now()) resisting OS clock rollback
 * - Automatically persists elapsed seconds to IndexedDB every 1000ms
 * - Enforces Animation 4.6 Urgency States (> 5m CALM, < 5m WARNING, < 2m CRITICAL)
 */
@Injectable({
  providedIn: 'root'
})
export class QuizCacheService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiBase = '/api/v1/assessments';

  // State Signals
  readonly activeQuiz = signal<ActiveQuizRecord | null>(null);
  readonly elapsedSeconds = signal<number>(0);
  readonly isTimerRunning = signal<boolean>(false);

  // Monotonic Clock Internal State
  private startPerformanceNow = 0;
  private baseElapsedSeconds = 0;
  private timerIntervalId: any = null;

  // Computed Remaining Time & Urgency (Animation 4.6)
  readonly remainingSeconds = computed(() => {
    const quiz = this.activeQuiz();
    if (!quiz || !quiz.durationMinutes) return 0;
    const totalSeconds = quiz.durationMinutes * 60;
    return Math.max(0, totalSeconds - this.elapsedSeconds());
  });

  readonly urgencyState = computed<UrgencyState>(() => {
    const remaining = this.remainingSeconds();
    if (remaining <= 0) return 'EXPIRED';
    if (remaining < 120) return 'CRITICAL'; // < 2 mins: red urgency pulse
    if (remaining < 300) return 'WARNING';  // < 5 mins: warm amber pulse
    return 'CALM';                          // > 5 mins: calm slate/cyan
  });

  ngOnDestroy(): void {
    this.stopMonotonicClock();
  }

  /**
   * Starts assessment via backend API, sanitizes questions, and saves to Dexie.js.
   * If offline or API fails, attempts to load from existing Dexie.js cache.
   */
  startAndCache(assessmentId: string): Observable<ActiveQuizRecord> {
    const clientStartedAt = new Date().toISOString();

    return this.http
      .post<{ success: boolean; data: AssessmentStartResponse }>(
        `${this.apiBase}/${assessmentId}/start-and-cache`,
        { client_started_at: clientStartedAt }
      )
      .pipe(
        switchMap(response => {
          const data: any = response.data;
          const asm = data.assessment || data;
          const questionsList = asm.questions || data.questions || [];
          const sanitizedQuestions: CachedQuestion[] = questionsList.map((q: any, idx: number) => ({
            _id: q._id || `q_${idx}`,
            question_order: q.question_order ?? q.order ?? idx + 1,
            question_text_ar: q.question_text_ar || q.question_text || q.textAr || '',
            question_text_en: q.question_text_en || q.textEn || '',
            question_image_url: q.question_image_url || q.questionImageUrl || null,
            options: (q.options || []).map((opt: any, oIdx: number) => ({
              option_index: typeof opt === 'object' && opt.option_index !== undefined ? opt.option_index : oIdx,
              text_ar: typeof opt === 'string' ? opt : (opt.text_ar || opt.text || ''),
              text_en: typeof opt === 'string' ? opt : (opt.text_en || opt.text || '')
            })),
            points: q.points ?? 1,
            requires_desmos: !!(q.requires_desmos || q.requiresDesmos)
          }));

          const record: ActiveQuizRecord = {
            assessmentId,
            title: asm.title_ar || asm.titleAr || data.title || 'Interactive Assessment',
            unitId: asm.unit_package_id || asm.unit_id || data.unit_id,
            durationMinutes: asm.time_limit_minutes || asm.duration_minutes || data.durationMinutes || 30,
            questions: sanitizedQuestions,
            elapsedSeconds: 0,
            selectedAnswers: {},
            uploadedImages: [],
            clientStartedAt,
            cachedAt: Date.now(),
            lastSavedAt: Date.now(),
            isCompleted: false
          };

          return from(this.saveQuizToDb(record)).pipe(map(() => record));
        }),
        tap(record => {
          this.activeQuiz.set(record);
          this.startMonotonicClock(0, record.durationMinutes);
        }),
        catchError(err => {
          console.warn('Network call failed, attempting fallback to Dexie cache:', err);
          return from(this.loadCachedQuiz(assessmentId)).pipe(
            map(cached => {
              if (cached) {
                this.activeQuiz.set(cached);
                this.startMonotonicClock(cached.elapsedSeconds, cached.durationMinutes);
                return cached;
              }
              throw new Error('Assessment not available offline and no cache found.');
            })
          );
        })
      );
  }

  /**
   * Loads cached quiz record from Dexie.js and restores state.
   */
  async loadCachedQuiz(assessmentId: string): Promise<ActiveQuizRecord | undefined> {
    if (!isPlatformBrowser(this.platformId)) return undefined;
    try {
      const record = await spiderMathDb.activeQuizzes.get(assessmentId);
      if (record) {
        this.activeQuiz.set(record);
        this.elapsedSeconds.set(record.elapsedSeconds);
      }
      return record;
    } catch (err) {
      console.error('Failed to load cached quiz from Dexie:', err);
      return undefined;
    }
  }

  /**
   * Records student's MCQ choice locally and updates Dexie.js (< 2ms).
   */
  async recordAnswer(questionId: string, optionIndex: number): Promise<void> {
    const current = this.activeQuiz();
    if (!current) return;

    const updatedAnswers = {
      ...current.selectedAnswers,
      [questionId]: optionIndex
    };

    current.selectedAnswers = updatedAnswers;
    current.lastSavedAt = Date.now();
    this.activeQuiz.set({ ...current });

    if (isPlatformBrowser(this.platformId)) {
      try {
        await spiderMathDb.activeQuizzes.update(current.assessmentId, {
          selectedAnswers: updatedAnswers,
          lastSavedAt: current.lastSavedAt
        });
      } catch (err) {
        console.warn('Failed to persist MCQ answer to Dexie:', err);
      }
    }
  }

  /**
   * Records uploaded homework solutions locally in Dexie.js.
   */
  async recordHomeworkImages(
    images: Array<{ questionId?: string; imageUrl: string; rotation: number; sizeKb: number }>
  ): Promise<void> {
    const current = this.activeQuiz();
    if (!current) return;

    current.uploadedImages = [...images];
    current.lastSavedAt = Date.now();
    this.activeQuiz.set({ ...current });

    if (isPlatformBrowser(this.platformId)) {
      try {
        await spiderMathDb.activeQuizzes.update(current.assessmentId, {
          uploadedImages: current.uploadedImages,
          lastSavedAt: current.lastSavedAt
        });
      } catch (err) {
        console.warn('Failed to persist homework images to Dexie:', err);
      }
    }
  }

  /**
   * Marks active quiz as locally completed and halts monotonic clock.
   */
  async completeQuizLocally(): Promise<ActiveQuizRecord | null> {
    const current = this.activeQuiz();
    if (!current) return null;

    this.stopMonotonicClock();
    current.isCompleted = true;
    current.lastSavedAt = Date.now();
    this.activeQuiz.set({ ...current });

    if (isPlatformBrowser(this.platformId)) {
      try {
        await spiderMathDb.activeQuizzes.update(current.assessmentId, {
          isCompleted: true,
          lastSavedAt: current.lastSavedAt
        });
      } catch (err) {
        console.warn('Failed to update completed status in Dexie:', err);
      }
    }

    return current;
  }

  /**
   * Removes quiz from Dexie.js after successful online sync.
   */
  async clearQuiz(assessmentId: string): Promise<void> {
    this.stopMonotonicClock();
    if (this.activeQuiz()?.assessmentId === assessmentId) {
      this.activeQuiz.set(null);
      this.elapsedSeconds.set(0);
    }

    if (isPlatformBrowser(this.platformId)) {
      try {
        await spiderMathDb.activeQuizzes.delete(assessmentId);
      } catch (err) {
        console.warn('Failed to delete quiz from Dexie:', err);
      }
    }
  }

  /**
   * Internal helper to save/put record to Dexie.js.
   */
  private async saveQuizToDb(record: ActiveQuizRecord): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      await spiderMathDb.activeQuizzes.put(record);
    } catch (err) {
      console.warn('Failed to put quiz record in Dexie:', err);
    }
  }

  /**
   * Monotonic Clock implementation using performance.now() deltas.
   * Resists manual device/OS clock rollbacks.
   */
  private startMonotonicClock(initialElapsedSeconds: number, durationMinutes: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.stopMonotonicClock();

    this.baseElapsedSeconds = initialElapsedSeconds;
    this.startPerformanceNow = performance.now();
    this.elapsedSeconds.set(initialElapsedSeconds);
    this.isTimerRunning.set(true);

    this.timerIntervalId = setInterval(() => {
      const deltaMs = performance.now() - this.startPerformanceNow;
      const currentElapsed = this.baseElapsedSeconds + Math.floor(deltaMs / 1000);
      this.elapsedSeconds.set(currentElapsed);

      // Persist to Dexie every 1000ms
      const quiz = this.activeQuiz();
      if (quiz) {
        quiz.elapsedSeconds = currentElapsed;
        quiz.lastSavedAt = Date.now();
        spiderMathDb.activeQuizzes
          .update(quiz.assessmentId, {
            elapsedSeconds: currentElapsed,
            lastSavedAt: quiz.lastSavedAt
          })
          .catch(() => {});
      }
    }, 1000);
  }

  private stopMonotonicClock(): void {
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
    this.isTimerRunning.set(false);
  }
}
