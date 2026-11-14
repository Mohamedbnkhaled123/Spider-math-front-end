import { Injectable, inject, signal, computed, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, from, map, switchMap, throwError } from 'rxjs';
import { spiderMathDb } from './spider-math-db';
import {
  ActiveQuizRecord,
  AssessmentStartResponse,
  CachedQuestion,
  UrgencyState
} from './quiz-cache.models';
import { optimizeCloudinaryUrl } from '../../shared/utils/box2d-cropper.util';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 12: Offline-First Quiz Cache & Monotonic Clock Service
 * 
 * - Starts assessments and caches sanitized question bundles in Dexie.js & localStorage
 * - Runs a tamper-proof monotonic clock resisting OS clock rollback
 * - Enforces authoritative start timestamp anti-cheat calculations across browser refreshes
 * - Automatically persists elapsed seconds to IndexedDB and localStorage every 1000ms
 * - Enforces Urgency States (> 5m CALM, < 5m WARNING, < 2m CRITICAL, <= 0s EXPIRED)
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
    if (!quiz) return 0;
    let totalSeconds = (quiz.durationMinutes !== undefined && quiz.durationMinutes !== null ? quiz.durationMinutes : 30) * 60;
    if (quiz.isMultiModule) {
      const activeMins = quiz.currentModule === 2
        ? (quiz.module2DurationMinutes || 35)
        : (quiz.module1DurationMinutes || 35);
      totalSeconds = activeMins * 60;
    }
    return Math.max(0, totalSeconds - this.elapsedSeconds());
  });

  readonly urgencyState = computed<UrgencyState>(() => {
    const remaining = this.remainingSeconds();
    if (remaining <= 0) return 'EXPIRED';
    if (remaining <= 60) return 'CRITICAL';       // <= 1 min (60s): red urgency pulse
    if (remaining <= 120) return 'ORANGE_WARNING'; // <= 2 mins (120s): vivid orange
    if (remaining <= 300) return 'WARNING';        // <= 5 mins (300s): warm yellow
    return 'CALM';                                // > 5 mins: calm slate/neutral
  });

  readonly formattedRemainingTime = computed<string>(() => {
    const sec = this.remainingSeconds();
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  });

  ngOnDestroy(): void {
    this.stopMonotonicClock();
  }

  /**
   * Starts assessment via backend API, sanitizes questions, and saves to Dexie.js & localStorage.
   * Merges previously saved answers/images and computes monotonic elapsed time from authoritative start.
   * If offline or API fails, attempts to load from existing Dexie.js & localStorage cache.
   */
  startAndCache(assessmentId: string): Observable<ActiveQuizRecord> {
    const localSession = this.getLocalSession(assessmentId);
    const initialClientStartedAt = localSession?.clientStartedAt || new Date().toISOString();

    return this.http
      .post<{ success: boolean; data: AssessmentStartResponse }>(
        `${this.apiBase}/${assessmentId}/start-and-cache`,
        { client_started_at: initialClientStartedAt }
      )
      .pipe(
        switchMap(async response => {
          const data: any = response.data;
          const asm = data.assessment || data;
          const questionsList = asm.questions || data.questions || [];
          const sanitizedQuestions: CachedQuestion[] = questionsList.map((q: any, idx: number) => ({
            _id: q._id || `q_${idx}`,
            question_order: q.question_order ?? q.order ?? idx + 1,
            question_type: q.question_type || q.questionType || q.type || ((q.options && q.options.length > 0) ? 'MCQ' : 'ESSAY'),
            question_text_ar: q.question_text_ar || q.question_text || q.textAr || '',
            question_text_en: q.question_text_en || q.textEn || '',
            question_image_url: optimizeCloudinaryUrl(q.question_image_url || q.questionImageUrl || null, 960),
            options: (q.options || []).map((opt: any, oIdx: number) => ({
              option_index: typeof opt === 'object' && opt.option_index !== undefined ? opt.option_index : oIdx,
              text_ar: typeof opt === 'string' ? opt : (opt.text_ar || opt.text || ''),
              text_en: typeof opt === 'string' ? opt : (opt.text_en || opt.text || '')
            })),
            points: q.points ?? 1,
            module_index: (q.module_index === 2 || q.moduleIndex === 2) ? 2 : 1,
            requires_desmos: !!(q.requires_desmos || q.requiresDesmos)
          }));

          // Check Dexie and synchronous localStorage fallback before updating record
          const cached = await this.getExistingState(assessmentId);

          // Multi-module metadata resolution
          const isMultiModule = Boolean(asm.is_multi_module ?? asm.isMultiModule ?? data.isMultiModule ?? cached?.isMultiModule);
          const module1DurationMinutes = asm.module_1_time_minutes ?? asm.module1TimeMinutes ?? data.module1TimeMinutes ?? cached?.module1DurationMinutes ?? undefined;
          const module2DurationMinutes = asm.module_2_time_minutes ?? asm.module2TimeMinutes ?? data.module2TimeMinutes ?? cached?.module2DurationMinutes ?? undefined;
          const currentModule: 1 | 2 = (cached?.currentModule === 2) ? 2 : 1;
          const module1Locked = Boolean(cached?.module1Locked);
          const module1ElapsedSeconds = cached?.module1ElapsedSeconds ?? 0;
          const module2StartedAt = cached?.module2StartedAt;

          // Merge answers and images: never overwrite with empty structures
          const preservedAnswers: Record<string, number> = {
            ...(cached?.selectedAnswers ?? {})
          };
          const preservedTextAnswers: Record<string, string> = {
            ...(cached?.textAnswers ?? {})
          };
          const preservedImages = (cached?.uploadedImages && cached.uploadedImages.length > 0)
            ? cached.uploadedImages
            : [];

          // Authoritative start timestamp: data.serverStartedAt || cached.serverStartedAt || cached.clientStartedAt || clientStartedAt
          const serverStartedAt = data.serverStartedAt || data.server_started_at || cached?.serverStartedAt;
          const clientStartedAt = cached?.clientStartedAt || data.clientStartedAt || data.client_started_at || initialClientStartedAt;
          let authoritativeStart = serverStartedAt || clientStartedAt;

          const durationMinutes = asm.time_limit_minutes || asm.duration_minutes || data.durationMinutes || data.duration_minutes || cached?.durationMinutes || 30;
          let activeDurationMinutes = durationMinutes;

          if (isMultiModule) {
            if (currentModule === 2) {
              activeDurationMinutes = module2DurationMinutes || 35;
              if (module2StartedAt) {
                authoritativeStart = module2StartedAt;
              }
            } else {
              activeDurationMinutes = module1DurationMinutes || 35;
            }
          }

          const startMs = new Date(authoritativeStart).getTime();
          const realElapsedSec = !isNaN(startMs)
            ? Math.max(0, Math.floor((Date.now() - startMs) / 1000))
            : 0;

          // Guard against OS clock rollback (monotonicity):
          const monotonicElapsedSec = Math.max(realElapsedSec, cached?.elapsedSeconds ?? 0);
          const totalDurationSec = activeDurationMinutes * 60;

          const isExpired = monotonicElapsedSec >= totalDurationSec;
          const finalElapsedSec = isExpired ? totalDurationSec : monotonicElapsedSec;

          const record: ActiveQuizRecord = {
            assessmentId,
            idempotencyKey: data.idempotencyKey || cached?.idempotencyKey || undefined,
            title: asm.title_ar || asm.titleAr || data.title || cached?.title || 'Interactive Assessment',
            unitId: asm.unit_package_id || asm.unit_id || data.unit_id || cached?.unitId,
            referenceSheetUrl: optimizeCloudinaryUrl(asm.reference_sheet_url || asm.referenceSheetUrl || data.reference_sheet_url || cached?.referenceSheetUrl || null, 1280),
            durationMinutes,
            isMultiModule,
            module1DurationMinutes,
            module2DurationMinutes,
            currentModule,
            module1Locked,
            module1ElapsedSeconds,
            module2StartedAt,
            questions: sanitizedQuestions.length > 0 ? sanitizedQuestions : (cached?.questions || []),
            elapsedSeconds: finalElapsedSec,
            selectedAnswers: preservedAnswers,
            textAnswers: preservedTextAnswers,
            uploadedImages: preservedImages,
            clientStartedAt,
            serverStartedAt,
            cachedAt: cached?.cachedAt || Date.now(),
            lastSavedAt: Date.now(),
            isCompleted: cached?.isCompleted || false
          };

          await this.saveQuizToDb(record);

          this.activeQuiz.set(record);
          this.elapsedSeconds.set(finalElapsedSec);

          if (isExpired) {
            this.stopMonotonicClock();
          } else {
            this.startMonotonicClock(finalElapsedSec, activeDurationMinutes);
          }

          return record;
        }),
        catchError(err => {
          if (err && (err.status === 403 || err.status === 400 || err.status === 404)) {
            return throwError(() => err);
          }
          console.warn('Network call failed, attempting fallback to Dexie cache:', err);
          return from(this.loadCachedQuiz(assessmentId)).pipe(
            map(cached => {
              if (cached) {
                return cached;
              }
              throw new Error('Assessment not available offline and no cache found.');
            })
          );
        })
      );
  }

  /**
   * Loads cached quiz record from Dexie.js & localStorage, applying monotonic real-elapsed time calculation.
   */
  async loadCachedQuiz(assessmentId: string): Promise<ActiveQuizRecord | undefined> {
    if (!isPlatformBrowser(this.platformId)) return undefined;
    try {
      const record = await this.getExistingState(assessmentId);
      if (record) {
        let authoritativeStart = record.serverStartedAt || record.clientStartedAt;
        let activeDurationMinutes = record.durationMinutes || 30;

        if (record.isMultiModule) {
          if (record.currentModule === 2) {
            activeDurationMinutes = record.module2DurationMinutes || 35;
            if (record.module2StartedAt) {
              authoritativeStart = record.module2StartedAt;
            }
          } else {
            activeDurationMinutes = record.module1DurationMinutes || 35;
          }
        }

        let finalElapsedSec = record.elapsedSeconds || 0;
        if (authoritativeStart) {
          const startMs = new Date(authoritativeStart).getTime();
          if (!isNaN(startMs)) {
            const realElapsedSec = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
            finalElapsedSec = Math.max(realElapsedSec, record.elapsedSeconds || 0);
          }
        }

        const totalDurationSec = activeDurationMinutes * 60;
        const isExpired = finalElapsedSec >= totalDurationSec;
        finalElapsedSec = isExpired ? totalDurationSec : finalElapsedSec;

        record.elapsedSeconds = finalElapsedSec;
        this.activeQuiz.set(record);
        this.elapsedSeconds.set(finalElapsedSec);

        if (isExpired) {
          this.stopMonotonicClock();
        } else {
          this.startMonotonicClock(finalElapsedSec, activeDurationMinutes);
        }

        await this.saveQuizToDb(record);
      }
      return record;
    } catch (err) {
      console.error('Failed to load cached quiz from Dexie/localStorage:', err);
      return undefined;
    }
  }

  /**
   * Transitions a multi-module exam to Module 2.
   * Locks Module 1, records Module 1 elapsed time, and resets the monotonic clock for Module 2.
   */
  async transitionToModule2(assessmentId: string): Promise<ActiveQuizRecord | undefined> {
    let record: ActiveQuizRecord | null | undefined = this.activeQuiz();
    if (!record || record.assessmentId !== assessmentId) {
      record = await this.getExistingState(assessmentId);
    }
    if (!record) return undefined;

    const module1Elapsed = record.elapsedSeconds || 0;
    const nowIso = new Date().toISOString();

    record.currentModule = 2;
    record.module1Locked = true;
    record.module1ElapsedSeconds = module1Elapsed;
    record.module2StartedAt = nowIso;
    record.elapsedSeconds = 0;
    record.lastSavedAt = Date.now();

    const module2Minutes = record.module2DurationMinutes || 35;

    this.stopMonotonicClock();
    this.activeQuiz.set({ ...record });
    this.elapsedSeconds.set(0);
    this.startMonotonicClock(0, module2Minutes);

    await this.saveQuizToDb(record);
    return record;
  }

  /**
   * Records student's MCQ choice locally in memory, Dexie.js, and localStorage (< 2ms).
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
      this.saveLocalSession(current);
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
   * Records student's plain text answer locally in memory, Dexie.js, and localStorage (< 2ms).
   */
  async recordTextAnswer(questionId: string, text: string): Promise<void> {
    const current = this.activeQuiz();
    if (!current) return;

    const updatedTextAnswers = {
      ...(current.textAnswers || {}),
      [questionId]: text
    };

    current.textAnswers = updatedTextAnswers;
    current.lastSavedAt = Date.now();
    this.activeQuiz.set({ ...current });

    if (isPlatformBrowser(this.platformId)) {
      this.saveLocalSession(current);
      try {
        await spiderMathDb.activeQuizzes.update(current.assessmentId, {
          textAnswers: updatedTextAnswers,
          lastSavedAt: current.lastSavedAt
        });
      } catch (err) {
        console.warn('Failed to persist text answer to Dexie:', err);
      }
    }
  }

  /**
   * Records uploaded homework solutions locally in Dexie.js and localStorage.
   * If questionId is provided, preserves and merges images for that specific question.
   */
  async recordHomeworkImages(
    images: Array<{ questionId?: string; imageUrl: string; rotation: number; sizeKb: number }>,
    questionId?: string
  ): Promise<void> {
    const current = this.activeQuiz();
    if (!current) return;

    const existing = current.uploadedImages || [];
    let updated: typeof existing;
    if (questionId) {
      updated = [
        ...existing.filter(img => img.questionId !== questionId),
        ...images.map(img => ({ ...img, questionId }))
      ];
    } else {
      updated = [...images];
    }

    current.uploadedImages = updated;
    current.lastSavedAt = Date.now();
    this.activeQuiz.set({ ...current });

    if (isPlatformBrowser(this.platformId)) {
      this.saveLocalSession(current);
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
   * Removes a specific attached solution photo for a question.
   */
  async removeHomeworkImage(questionId: string, imageUrl: string): Promise<void> {
    const current = this.activeQuiz();
    if (!current) return;

    current.uploadedImages = (current.uploadedImages || []).filter(
      img => !(img.questionId === questionId && img.imageUrl === imageUrl)
    );
    current.lastSavedAt = Date.now();
    this.activeQuiz.set({ ...current });

    if (isPlatformBrowser(this.platformId)) {
      this.saveLocalSession(current);
      try {
        await spiderMathDb.activeQuizzes.update(current.assessmentId, {
          uploadedImages: current.uploadedImages,
          lastSavedAt: current.lastSavedAt
        });
      } catch (err) {
        console.warn('Failed to update removed image in Dexie:', err);
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
      this.saveLocalSession(current);
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
   * Removes quiz from Dexie.js and localStorage after successful online sync.
   */
  async clearQuiz(assessmentId: string): Promise<void> {
    this.stopMonotonicClock();
    if (this.activeQuiz()?.assessmentId === assessmentId) {
      this.activeQuiz.set(null);
      this.elapsedSeconds.set(0);
    }

    if (isPlatformBrowser(this.platformId)) {
      this.removeLocalSession(assessmentId);
      try {
        await spiderMathDb.activeQuizzes.delete(assessmentId);
      } catch (err) {
        console.warn('Failed to delete quiz from Dexie:', err);
      }
    }
  }

  /**
   * Internal helper to save/put record to Dexie.js and localStorage.
   */
  private async saveQuizToDb(record: ActiveQuizRecord): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    this.saveLocalSession(record);
    try {
      await spiderMathDb.activeQuizzes.put(record);
    } catch (err) {
      console.warn('Failed to put quiz record in Dexie:', err);
    }
  }

  /**
   * Fetches existing quiz state from Dexie and localStorage, merging their data.
   * Compares `lastSavedAt` to prioritize whichever store holds fresher state.
   */
  private async getExistingState(assessmentId: string): Promise<ActiveQuizRecord | undefined> {
    let dexieRecord: ActiveQuizRecord | undefined;
    if (isPlatformBrowser(this.platformId)) {
      try {
        dexieRecord = await spiderMathDb.activeQuizzes.get(assessmentId);
      } catch (err) {
        console.warn('Failed to read active quiz from Dexie:', err);
      }
    }
    const localRecord = this.getLocalSession(assessmentId);

    if (dexieRecord && localRecord) {
      const localTime = localRecord.lastSavedAt ?? 0;
      const dexieTime = dexieRecord.lastSavedAt ?? 0;
      const isLocalFresher = localTime >= dexieTime;

      const baseRecord = isLocalFresher
        ? { ...dexieRecord, ...localRecord }
        : { ...localRecord, ...dexieRecord };

      const selectedAnswers = isLocalFresher
        ? {
            ...(dexieRecord.selectedAnswers || {}),
            ...(localRecord.selectedAnswers || {})
          }
        : {
            ...(localRecord.selectedAnswers || {}),
            ...(dexieRecord.selectedAnswers || {})
          };

      const textAnswers = isLocalFresher
        ? {
            ...(dexieRecord.textAnswers || {}),
            ...(localRecord.textAnswers || {})
          }
        : {
            ...(localRecord.textAnswers || {}),
            ...(dexieRecord.textAnswers || {})
          };

      const uploadedImages = isLocalFresher
        ? (localRecord.uploadedImages ?? dexieRecord.uploadedImages ?? [])
        : (dexieRecord.uploadedImages ?? localRecord.uploadedImages ?? []);

      return {
        ...baseRecord,
        selectedAnswers,
        textAnswers,
        uploadedImages
      } as ActiveQuizRecord;
    }
    return dexieRecord || (localRecord as ActiveQuizRecord) || undefined;
  }

  /**
   * Synchronous localStorage fallback helpers.
   */
  private getLocalSession(assessmentId: string): Partial<ActiveQuizRecord> | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const raw = localStorage.getItem(`sm_exam_session_${assessmentId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private saveLocalSession(record: ActiveQuizRecord): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(`sm_exam_session_${record.assessmentId}`, JSON.stringify(record));
    } catch (err) {
      console.warn('Failed to save exam session to localStorage:', err);
    }
  }

  private removeLocalSession(assessmentId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.removeItem(`sm_exam_session_${assessmentId}`);
      localStorage.removeItem(`sm_exam_answers_${assessmentId}`);
    } catch (err) {
      console.warn('Failed to clear exam session from localStorage:', err);
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
      const totalSec = durationMinutes * 60;

      if (currentElapsed >= totalSec) {
        this.elapsedSeconds.set(totalSec);
        const quiz = this.activeQuiz();
        if (quiz) {
          quiz.elapsedSeconds = totalSec;
          quiz.lastSavedAt = Date.now();
          this.saveLocalSession(quiz);
          spiderMathDb.activeQuizzes
            .update(quiz.assessmentId, {
              elapsedSeconds: totalSec,
              lastSavedAt: quiz.lastSavedAt
            })
            .catch(() => {});
        }
        this.stopMonotonicClock();
        return;
      }

      this.elapsedSeconds.set(currentElapsed);

      // Persist to Dexie and localStorage every 1000ms
      const quiz = this.activeQuiz();
      if (quiz) {
        quiz.elapsedSeconds = currentElapsed;
        quiz.lastSavedAt = Date.now();
        this.saveLocalSession(quiz);
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
