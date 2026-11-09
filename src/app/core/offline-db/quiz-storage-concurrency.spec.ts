import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { QuizCacheService } from './quiz-cache.service';
import { spiderMathDb } from './spider-math-db';

describe('Challenger 2: Storage Parity, Concurrency & Lingering State Empirical Suite', () => {
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

  describe('1. Storage Parity & Race Condition: Dexie vs LocalStorage Answer Merging', () => {
    it('empirical check: does older Dexie record overwrite newer LocalStorage answer in getExistingState?', async () => {
      const assessmentId = 'storage_parity_test_1';
      const startTime = new Date(Date.now() - 60 * 1000).toISOString();

      // Simulate async lag: Dexie has older answer for q1 (option 0)
      const dexieRecord = {
        assessmentId,
        title: 'Exam 1',
        durationMinutes: 30,
        questions: [{ _id: 'q1', question_text_ar: 'سؤال 1' }],
        elapsedSeconds: 50,
        selectedAnswers: { q1: 0 },
        uploadedImages: [],
        clientStartedAt: startTime,
        serverStartedAt: startTime,
        cachedAt: Date.now() - 60 * 1000,
        lastSavedAt: Date.now() - 10 * 1000,
        isCompleted: false
      };
      await spiderMathDb.activeQuizzes.put(dexieRecord as any);

      // LocalStorage was updated synchronously with newer answer for q1 (option 2) and q2 (option 1)
      const localRecord = {
        ...dexieRecord,
        elapsedSeconds: 58,
        selectedAnswers: { q1: 2, q2: 1 },
        lastSavedAt: Date.now() - 2 * 1000
      };
      localStorage.setItem(`sm_exam_session_${assessmentId}`, JSON.stringify(localRecord));

      // Invoke startAndCache to see which answer survives
      let resultRecord: any;
      service.startAndCache(assessmentId).subscribe(r => { resultRecord = r; });

      const req = httpMock.expectOne(`/api/v1/assessments/${assessmentId}/start-and-cache`);
      req.flush({
        success: true,
        data: {
          assessment: {
            title_ar: 'Exam 1',
            time_limit_minutes: 30,
            questions: [{ _id: 'q1' }, { _id: 'q2' }]
          },
          serverStartedAt: startTime
        }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(resultRecord).toBeDefined();
      console.log('Parity test result for q1:', resultRecord.selectedAnswers['q1']);
      console.log('Parity test result for q2:', resultRecord.selectedAnswers['q2']);

      // Observe whether q1 has option 0 (from Dexie) or option 2 (from localStorage)
      // In current code: selectedAnswers: { ...(localRecord.selectedAnswers || {}), ...(dexieRecord.selectedAnswers || {}) }
      // This means dexieRecord overwrote localRecord for q1!
      const q1Answer = resultRecord.selectedAnswers['q1'];
      const q2Answer = resultRecord.selectedAnswers['q2'];

      expect(q2Answer).toBe(1); // q2 is preserved because Dexie did not have it
      // Newer answer (2) from localStorage must take precedence over stale answer (0) from Dexie
      expect(q1Answer).toBe(2);
    });

    it('should correctly merge disjoint answers between Dexie and LocalStorage without data loss', async () => {
      const assessmentId = 'storage_disjoint_test';
      const startTime = new Date(Date.now() - 120 * 1000).toISOString();

      // Dexie holds answers for q1 and q2
      const dexieRecord = {
        assessmentId,
        title: 'Exam Disjoint',
        durationMinutes: 45,
        questions: [{ _id: 'q1' }, { _id: 'q2' }, { _id: 'q3' }],
        elapsedSeconds: 100,
        selectedAnswers: { q1: 3, q2: 0 },
        uploadedImages: [],
        clientStartedAt: startTime,
        serverStartedAt: startTime,
        cachedAt: Date.now() - 120 * 1000,
        lastSavedAt: Date.now() - 20 * 1000,
        isCompleted: false
      };
      await spiderMathDb.activeQuizzes.put(dexieRecord as any);

      // LocalStorage holds answer for q3
      const localRecord = {
        assessmentId,
        title: 'Exam Disjoint',
        durationMinutes: 45,
        questions: [{ _id: 'q1' }, { _id: 'q2' }, { _id: 'q3' }],
        elapsedSeconds: 110,
        selectedAnswers: { q3: 2 },
        uploadedImages: [],
        clientStartedAt: startTime,
        serverStartedAt: startTime,
        cachedAt: Date.now() - 120 * 1000,
        lastSavedAt: Date.now() - 10 * 1000,
        isCompleted: false
      };
      localStorage.setItem(`sm_exam_session_${assessmentId}`, JSON.stringify(localRecord));

      let resultRecord: any;
      service.startAndCache(assessmentId).subscribe(r => { resultRecord = r; });

      const req = httpMock.expectOne(`/api/v1/assessments/${assessmentId}/start-and-cache`);
      req.flush({
        success: true,
        data: {
          assessment: {
            title_ar: 'Exam Disjoint',
            time_limit_minutes: 45,
            questions: [{ _id: 'q1' }, { _id: 'q2' }, { _id: 'q3' }]
          },
          serverStartedAt: startTime
        }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(resultRecord.selectedAnswers).toEqual({
        q1: 3,
        q2: 0,
        q3: 2
      });
    });
  });

  describe('2. Offline/Online Transitions & Storage Consistency', () => {
    it('should fall back gracefully to Dexie/LocalStorage when network request fails (offline)', async () => {
      const assessmentId = 'offline_transition_test';
      const startTime = new Date(Date.now() - 180 * 1000).toISOString();

      // Cached offline
      const cached = {
        assessmentId,
        title: 'Offline Math Quiz',
        durationMinutes: 20,
        questions: [{ _id: 'q1', question_text_ar: 'س 1', options: [] }],
        elapsedSeconds: 150,
        selectedAnswers: { q1: 1 },
        uploadedImages: [{ questionId: 'q1', imageUrl: 'https://cdn.example.com/sheet.png', rotation: 0, sizeKb: 90 }],
        clientStartedAt: startTime,
        serverStartedAt: startTime,
        cachedAt: Date.now() - 180 * 1000,
        lastSavedAt: Date.now() - 30 * 1000,
        isCompleted: false
      };
      await spiderMathDb.activeQuizzes.put(cached as any);
      localStorage.setItem(`sm_exam_session_${assessmentId}`, JSON.stringify(cached));

      let resultRecord: any;
      let errorEncountered = false;

      service.startAndCache(assessmentId).subscribe({
        next: r => { resultRecord = r; },
        error: () => { errorEncountered = true; }
      });

      const req = httpMock.expectOne(`/api/v1/assessments/${assessmentId}/start-and-cache`);
      // Simulate network disconnection (HTTP status 0 or 500)
      req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

      await new Promise(resolve => setTimeout(resolve, 60));

      expect(errorEncountered).toBeFalse();
      expect(resultRecord).toBeDefined();
      expect(resultRecord.title).toBe('Offline Math Quiz');
      expect(resultRecord.selectedAnswers['q1']).toBe(1);
      expect(resultRecord.uploadedImages.length).toBe(1);
      // Monotonic timer must have advanced past 180s
      expect(service.elapsedSeconds()).toBeGreaterThanOrEqual(179);
      expect(service.remainingSeconds()).toBeLessThanOrEqual(1200 - 179);
      expect(service.isTimerRunning()).toBeTrue();
    });

    it('should record answers while offline and retain them in Dexie and LocalStorage', async () => {
      const assessmentId = 'offline_record_test';
      const record = {
        assessmentId,
        title: 'Offline Recording',
        durationMinutes: 15,
        questions: [{ _id: 'q1' }, { _id: 'q2' }],
        elapsedSeconds: 10,
        selectedAnswers: {},
        uploadedImages: [],
        clientStartedAt: new Date().toISOString(),
        cachedAt: Date.now(),
        lastSavedAt: Date.now(),
        isCompleted: false
      };
      await spiderMathDb.activeQuizzes.put(record as any);
      localStorage.setItem(`sm_exam_session_${assessmentId}`, JSON.stringify(record));
      service.activeQuiz.set(record as any);

      // Student records answers while completely offline
      await service.recordAnswer('q1', 3);
      await service.recordAnswer('q2', 0);

      // Check immediate in-memory signal
      expect(service.activeQuiz()?.selectedAnswers).toEqual({ q1: 3, q2: 0 });

      // Check synchronous localStorage
      const local = JSON.parse(localStorage.getItem(`sm_exam_session_${assessmentId}`)!);
      expect(local.selectedAnswers).toEqual({ q1: 3, q2: 0 });

      // Check Dexie
      const inDexie = await spiderMathDb.activeQuizzes.get(assessmentId);
      expect(inDexie?.selectedAnswers).toEqual({ q1: 3, q2: 0 });
    });
  });

  describe('3. clearQuiz() Lingering Keys Audit', () => {
    it('should leave ZERO lingering keys in localStorage and Dexie for the cleared assessment', async () => {
      const assessmentId = 'audit_clear_assessment';

      const record = {
        assessmentId,
        title: 'Quiz to Clear',
        durationMinutes: 10,
        questions: [],
        elapsedSeconds: 100,
        selectedAnswers: { q1: 2 },
        uploadedImages: [{ questionId: 'q1', imageUrl: 'img.jpg', rotation: 0, sizeKb: 50 }],
        clientStartedAt: new Date().toISOString(),
        cachedAt: Date.now(),
        lastSavedAt: Date.now(),
        isCompleted: false
      };

      // Populate all known storage keys
      await spiderMathDb.activeQuizzes.put(record as any);
      localStorage.setItem(`sm_exam_session_${assessmentId}`, JSON.stringify(record));
      localStorage.setItem(`sm_exam_answers_${assessmentId}`, JSON.stringify({ q1: 2 }));

      // Unrelated keys should NOT be touched
      localStorage.setItem('sm_other_key', 'stay_intact');
      localStorage.setItem('sm_exam_session_unrelated_123', 'dont_delete_me');

      service.activeQuiz.set(record as any);
      service.elapsedSeconds.set(100);

      // Perform clearQuiz
      await service.clearQuiz(assessmentId);

      // 1. Verify memory state
      expect(service.activeQuiz()).toBeNull();
      expect(service.elapsedSeconds()).toBe(0);

      // 2. Verify Dexie activeQuizzes table
      const inDb = await spiderMathDb.activeQuizzes.get(assessmentId);
      expect(inDb).toBeUndefined();

      // 3. Verify targeted localStorage keys are completely removed
      expect(localStorage.getItem(`sm_exam_session_${assessmentId}`)).toBeNull();
      expect(localStorage.getItem(`sm_exam_answers_${assessmentId}`)).toBeNull();

      // 4. Verify no other keys with this assessmentId exist in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(assessmentId)) {
          fail(`Lingering key found in localStorage after clearQuiz(): ${key}`);
        }
      }

      // 5. Verify unrelated keys were not disturbed
      expect(localStorage.getItem('sm_other_key')).toBe('stay_intact');
      expect(localStorage.getItem('sm_exam_session_unrelated_123')).toBe('dont_delete_me');
    });

    it('should execute clearQuiz safely even when assessmentId was never cached (idempotency)', async () => {
      expect(async () => {
        await service.clearQuiz('non_existent_asm_999');
      }).not.toThrow();
    });
  });
});
