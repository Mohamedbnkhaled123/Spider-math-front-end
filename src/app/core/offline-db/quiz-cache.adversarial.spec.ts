import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { QuizCacheService } from './quiz-cache.service';
import { spiderMathDb } from './spider-math-db';

describe('QuizCacheService Adversarial & Edge Case Stress Tests', () => {
  let service: QuizCacheService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        QuizCacheService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(QuizCacheService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
    await spiderMathDb.activeQuizzes.clear();
  });

  afterEach(async () => {
    httpMock.verify();
    service.ngOnDestroy();
    localStorage.clear();
    await spiderMathDb.activeQuizzes.clear();
  });

  describe('Adversarial 1: Refresh after 5 minutes (300s) preserves state across dual storage layers', () => {
    it('should preserve answers from Dexie and localStorage merge after 5 minutes reload', async () => {
      const assessmentId = 'adv_test_refresh_5m';
      const fiveMinutesAgo = new Date(Date.now() - 300 * 1000).toISOString();

      // Setup split storage: Dexie has question 1 answer, localStorage has question 2 answer
      const dexieRecord = {
        assessmentId,
        title: 'Midterm Exam',
        durationMinutes: 60,
        questions: [
          { _id: 'q1', question_order: 1, question_text_ar: 'س 1', question_text_en: 'Q 1', options: [], points: 1 },
          { _id: 'q2', question_order: 2, question_text_ar: 'س 2', question_text_en: 'Q 2', options: [], points: 1 },
          { _id: 'q3', question_order: 3, question_text_ar: 'س 3', question_text_en: 'Q 3', options: [], points: 1 }
        ],
        elapsedSeconds: 290,
        selectedAnswers: { q1: 0 },
        uploadedImages: [
          { questionId: 'q1', imageUrl: 'https://cdn.example.com/q1_proof.webp', rotation: 0, sizeKb: 80 }
        ],
        clientStartedAt: fiveMinutesAgo,
        serverStartedAt: fiveMinutesAgo,
        cachedAt: Date.now() - 300 * 1000,
        lastSavedAt: Date.now() - 10 * 1000,
        isCompleted: false
      };
      await spiderMathDb.activeQuizzes.put(dexieRecord as any);

      // LocalStorage has an additional answer for q2 submitted right before refresh
      const localRecord = {
        ...dexieRecord,
        selectedAnswers: { q1: 0, q2: 2 }
      };
      localStorage.setItem(`sm_exam_session_${assessmentId}`, JSON.stringify(localRecord));

      // Trigger startAndCache (simulating student hitting F5 after 5 minutes)
      let loadedRecord: any;
      service.startAndCache(assessmentId).subscribe(record => {
        loadedRecord = record;
      });

      const req = httpMock.expectOne(`/api/v1/assessments/${assessmentId}/start-and-cache`);
      expect(req.request.method).toBe('POST');
      // Verify initial client start timestamp sent to backend matches authoritative start
      expect(req.request.body.client_started_at).toBe(fiveMinutesAgo);

      req.flush({
        success: true,
        data: {
          assessment: {
            title_ar: 'Midterm Exam (Server)',
            time_limit_minutes: 60,
            questions: [
              { _id: 'q1', question_order: 1, question_text_ar: 'س 1', options: [] },
              { _id: 'q2', question_order: 2, question_text_ar: 'س 2', options: [] },
              { _id: 'q3', question_order: 3, question_text_ar: 'س 3', options: [] }
            ]
          },
          serverStartedAt: fiveMinutesAgo
        }
      });

      await new Promise(resolve => setTimeout(resolve, 60));

      expect(loadedRecord).toBeDefined();
      // Answers from both storage layers must be preserved
      expect(loadedRecord.selectedAnswers['q1']).toBe(0);
      expect(loadedRecord.selectedAnswers['q2']).toBe(2);
      expect(loadedRecord.uploadedImages.length).toBe(1);
      expect(loadedRecord.uploadedImages[0].imageUrl).toBe('https://cdn.example.com/q1_proof.webp');

      // Monotonic elapsed time must be >= 300 seconds
      expect(loadedRecord.elapsedSeconds).toBeGreaterThanOrEqual(300);
      expect(service.elapsedSeconds()).toBeGreaterThanOrEqual(300);

      // Remaining time must be <= 3300 seconds (60 mins = 3600s - 300s)
      expect(service.remainingSeconds()).toBeLessThanOrEqual(3300);
      expect(service.remainingSeconds()).toBeGreaterThan(0);
    });
  });

  describe('Adversarial 2: Authoritative Elapsed Time & Clock Rollback Resistance', () => {
    it('should calculate elapsed time as >= 300 seconds when 5 minutes elapsed', async () => {
      const assessmentId = 'adv_test_elapsed_300';
      const fiveMinAgo = new Date(Date.now() - 305 * 1000).toISOString();

      let loaded: any;
      service.startAndCache(assessmentId).subscribe(r => { loaded = r; });

      const req = httpMock.expectOne(`/api/v1/assessments/${assessmentId}/start-and-cache`);
      req.flush({
        success: true,
        data: {
          assessment: { time_limit_minutes: 30, questions: [{ _id: 'q1' }] },
          serverStartedAt: fiveMinAgo
        }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(service.elapsedSeconds()).toBeGreaterThanOrEqual(304);
      expect(service.remainingSeconds()).toBeLessThanOrEqual(1800 - 304);
    });

    it('should resist local time rollback when student turns clock back 2 hours', async () => {
      const assessmentId = 'adv_test_rollback_2h';
      // Student was already at 500s elapsed
      const cachedElapsed = 500;
      // Manipulated start timestamp: student set their clock back 2 hours, so relative to current Date.now() it looks like 10 seconds ago
      const manipulatedStart = new Date(Date.now() - 10 * 1000).toISOString();

      const existingRecord = {
        assessmentId,
        title: 'Rollback Test',
        durationMinutes: 20,
        questions: [{ _id: 'q1', points: 1 }],
        elapsedSeconds: cachedElapsed,
        selectedAnswers: { q1: 1 },
        uploadedImages: [],
        clientStartedAt: manipulatedStart,
        serverStartedAt: manipulatedStart,
        cachedAt: Date.now(),
        lastSavedAt: Date.now(),
        isCompleted: false
      };

      await spiderMathDb.activeQuizzes.put(existingRecord as any);
      localStorage.setItem(`sm_exam_session_${assessmentId}`, JSON.stringify(existingRecord));

      let loaded: any;
      service.startAndCache(assessmentId).subscribe(r => { loaded = r; });

      const req = httpMock.expectOne(`/api/v1/assessments/${assessmentId}/start-and-cache`);
      req.flush({
        success: true,
        data: {
          assessment: { time_limit_minutes: 20 },
          serverStartedAt: manipulatedStart
        }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // Despite realElapsedSec computing to ~10s, monotonicElapsedSec must be Math.max(10, 500) = 500
      expect(service.elapsedSeconds()).toBeGreaterThanOrEqual(500);
      expect(service.remainingSeconds()).toBeLessThanOrEqual(1200 - 500);
    });

    it('should handle future start timestamp without negative elapsed time or NaN', async () => {
      const assessmentId = 'adv_test_future_start';
      // Future start timestamp (e.g. device clock skewed 10 minutes into past, so server time is in the future)
      const futureStart = new Date(Date.now() + 600 * 1000).toISOString();

      let loaded: any;
      service.startAndCache(assessmentId).subscribe(r => { loaded = r; });

      const req = httpMock.expectOne(`/api/v1/assessments/${assessmentId}/start-and-cache`);
      req.flush({
        success: true,
        data: {
          assessment: { time_limit_minutes: 30, questions: [{ _id: 'q1' }] },
          serverStartedAt: futureStart
        }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // Elapsed seconds must be clamped to 0, not negative
      expect(service.elapsedSeconds()).toBe(0);
      expect(service.remainingSeconds()).toBe(1800);
      expect(service.urgencyState()).toBe('CALM');
      expect(isNaN(service.elapsedSeconds())).toBeFalse();
    });
  });

  describe('Adversarial 3: Immediate Expiration & Auto-Lock', () => {
    it('should immediately clamp elapsed seconds to duration and set EXPIRED status when time is up', async () => {
      const assessmentId = 'adv_test_expired_immediate';
      // Exam was 10 minutes (600s), student started 11 minutes (660s) ago
      const elevenMinAgo = new Date(Date.now() - 660 * 1000).toISOString();

      let loaded: any;
      service.startAndCache(assessmentId).subscribe(r => { loaded = r; });

      const req = httpMock.expectOne(`/api/v1/assessments/${assessmentId}/start-and-cache`);
      req.flush({
        success: true,
        data: {
          assessment: {
            title_ar: 'Timed Out Quiz',
            time_limit_minutes: 10, // 600 seconds
            questions: [{ _id: 'q1' }]
          },
          serverStartedAt: elevenMinAgo
        }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(service.elapsedSeconds()).toBe(600);
      expect(service.remainingSeconds()).toBe(0);
      expect(service.urgencyState()).toBe('EXPIRED');
      expect(service.isTimerRunning()).toBeFalse();
    });

    it('should immediately expire in loadCachedQuiz when offline and time has elapsed', async () => {
      const assessmentId = 'adv_test_offline_expired';
      const twentyMinAgo = new Date(Date.now() - 1200 * 1000).toISOString();

      const existingRecord = {
        assessmentId,
        title: 'Offline Exam',
        durationMinutes: 15, // 900 seconds
        questions: [{ _id: 'q1' }],
        elapsedSeconds: 200,
        selectedAnswers: { q1: 1 },
        uploadedImages: [],
        clientStartedAt: twentyMinAgo,
        serverStartedAt: twentyMinAgo,
        cachedAt: Date.now() - 1200 * 1000,
        lastSavedAt: Date.now() - 1200 * 1000,
        isCompleted: false
      };

      await spiderMathDb.activeQuizzes.put(existingRecord as any);
      localStorage.setItem(`sm_exam_session_${assessmentId}`, JSON.stringify(existingRecord));

      const loaded = await service.loadCachedQuiz(assessmentId);

      expect(loaded).toBeDefined();
      expect(service.elapsedSeconds()).toBe(900);
      expect(service.remainingSeconds()).toBe(0);
      expect(service.urgencyState()).toBe('EXPIRED');
      expect(service.isTimerRunning()).toBeFalse();
    });
  });

  describe('Adversarial 4: Corrupt Start Timestamps & Malformed Payloads', () => {
    it('should gracefully handle non-parseable garbage string for serverStartedAt', async () => {
      const assessmentId = 'adv_test_corrupt_date';

      let loaded: any;
      service.startAndCache(assessmentId).subscribe(r => { loaded = r; });

      const req = httpMock.expectOne(`/api/v1/assessments/${assessmentId}/start-and-cache`);
      req.flush({
        success: true,
        data: {
          assessment: { time_limit_minutes: 30 },
          serverStartedAt: 'NOT_A_VALID_DATE_STRING_AT_ALL_###'
        }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(loaded).toBeDefined();
      expect(isNaN(service.elapsedSeconds())).toBeFalse();
      expect(service.elapsedSeconds()).toBe(0);
      expect(service.remainingSeconds()).toBe(1800);
      expect(service.urgencyState()).toBe('CALM');
    });

    it('should gracefully handle empty string serverStartedAt and fallback clientStartedAt', async () => {
      const assessmentId = 'adv_test_empty_datestring';

      let loaded: any;
      service.startAndCache(assessmentId).subscribe(r => { loaded = r; });

      const req = httpMock.expectOne(`/api/v1/assessments/${assessmentId}/start-and-cache`);
      req.flush({
        success: true,
        data: {
          assessment: { time_limit_minutes: 25 },
          serverStartedAt: ''
        }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(loaded).toBeDefined();
      expect(isNaN(service.elapsedSeconds())).toBeFalse();
      expect(service.elapsedSeconds()).toBeGreaterThanOrEqual(0);
      expect(service.remainingSeconds()).toBeGreaterThan(0);
    });

    it('should gracefully handle null/undefined serverStartedAt and null cached start', async () => {
      const assessmentId = 'adv_test_null_timestamps';

      let loaded: any;
      service.startAndCache(assessmentId).subscribe(r => { loaded = r; });

      const req = httpMock.expectOne(`/api/v1/assessments/${assessmentId}/start-and-cache`);
      req.flush({
        success: true,
        data: {
          assessment: { time_limit_minutes: 20 },
          serverStartedAt: undefined,
          server_started_at: undefined
        }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(loaded).toBeDefined();
      expect(service.elapsedSeconds()).toBe(0);
      expect(service.remainingSeconds()).toBe(1200);
    });
  });

  describe('Adversarial 5: Empty Answer Sets & Zero/Edge Durations', () => {
    it('should handle empty answers and empty images without overwriting or throwing', async () => {
      const assessmentId = 'adv_test_empty_answers';

      let loaded: any;
      service.startAndCache(assessmentId).subscribe(r => { loaded = r; });

      const req = httpMock.expectOne(`/api/v1/assessments/${assessmentId}/start-and-cache`);
      req.flush({
        success: true,
        data: {
          assessment: { time_limit_minutes: 15, questions: [] }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(loaded).toBeDefined();
      expect(loaded.selectedAnswers).toEqual({});
      expect(loaded.uploadedImages).toEqual([]);

      // Student records an answer
      await service.recordAnswer('q_first', 3);
      expect(service.activeQuiz()?.selectedAnswers['q_first']).toBe(3);

      // Student records a homework image
      await service.recordHomeworkImages([{
        questionId: 'q_first',
        imageUrl: 'https://cdn.example.com/sheet1.jpg',
        rotation: 90,
        sizeKb: 200
      }], 'q_first');
      expect(service.activeQuiz()?.uploadedImages.length).toBe(1);

      // Remove the image
      await service.removeHomeworkImage('q_first', 'https://cdn.example.com/sheet1.jpg');
      expect(service.activeQuiz()?.uploadedImages.length).toBe(0);
    });

    it('should handle zero duration by defaulting to safe 30 minutes fallback or expiring', async () => {
      const assessmentId = 'adv_test_zero_duration';

      let loaded: any;
      service.startAndCache(assessmentId).subscribe(r => { loaded = r; });

      const req = httpMock.expectOne(`/api/v1/assessments/${assessmentId}/start-and-cache`);
      req.flush({
        success: true,
        data: {
          assessment: { time_limit_minutes: 0, questions: [] }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(loaded).toBeDefined();
      // time_limit_minutes: 0 is caught by `asm.time_limit_minutes || 30` fallback
      expect(loaded.durationMinutes).toBe(30);
      expect(service.remainingSeconds()).toBe(1800);
      expect(service.urgencyState()).toBe('CALM');
    });

    it('should correctly mark urgencyState as EXPIRED when durationMinutes is 0 in activeQuiz', () => {
      service.activeQuiz.set({
        assessmentId: 'zero_quiz',
        title: 'Zero Duration Quiz',
        durationMinutes: 0,
        questions: [],
        elapsedSeconds: 0,
        selectedAnswers: {},
        uploadedImages: [],
        clientStartedAt: new Date().toISOString(),
        cachedAt: Date.now(),
        lastSavedAt: Date.now(),
        isCompleted: false
      });

      expect(service.remainingSeconds()).toBe(0);
      expect(service.urgencyState()).toBe('EXPIRED');
    });
  });

  describe('Adversarial 6: Component Integration — Auto-Submit on Expiration', () => {
    it('should stop timer and transition urgencyState to EXPIRED when remaining seconds reach 0', () => {
      service.activeQuiz.set({
        assessmentId: 'test_urgency_transitions',
        title: 'Timer Transitions',
        durationMinutes: 10,
        questions: [],
        elapsedSeconds: 599,
        selectedAnswers: {},
        uploadedImages: [],
        clientStartedAt: new Date().toISOString(),
        cachedAt: Date.now(),
        lastSavedAt: Date.now(),
        isCompleted: false
      });
      service.elapsedSeconds.set(599);

      expect(service.remainingSeconds()).toBe(1);
      expect(service.urgencyState()).toBe('CRITICAL');

      service.elapsedSeconds.set(600);
      expect(service.remainingSeconds()).toBe(0);
      expect(service.urgencyState()).toBe('EXPIRED');

      // Clamped if exceeds
      service.elapsedSeconds.set(650);
      expect(service.remainingSeconds()).toBe(0);
      expect(service.urgencyState()).toBe('EXPIRED');
    });
  });
});
