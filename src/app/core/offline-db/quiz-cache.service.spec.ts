import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { QuizCacheService } from './quiz-cache.service';
import { spiderMathDb } from './spider-math-db';

describe('QuizCacheService', () => {
  let service: QuizCacheService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QuizCacheService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(QuizCacheService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(async () => {
    httpMock.verify();
    service.ngOnDestroy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate remaining seconds and urgency state correctly', () => {
    service.activeQuiz.set({
      assessmentId: 'test_123',
      title: 'Test Quiz',
      durationMinutes: 10,
      questions: [],
      elapsedSeconds: 0,
      selectedAnswers: {},
      uploadedImages: [],
      clientStartedAt: new Date().toISOString(),
      cachedAt: Date.now(),
      lastSavedAt: Date.now(),
      isCompleted: false
    });

    // 10 mins remaining -> CALM (> 5 mins)
    expect(service.urgencyState()).toBe('CALM');

    // Simulate elapsed 350s (250s remaining <= 300s) -> WARNING (Yellow)
    service.elapsedSeconds.set(350);
    expect(service.remainingSeconds()).toBe(250);
    expect(service.urgencyState()).toBe('WARNING');

    // Simulate elapsed 500s (100s remaining <= 120s) -> ORANGE_WARNING (Orange)
    service.elapsedSeconds.set(500);
    expect(service.remainingSeconds()).toBe(100);
    expect(service.urgencyState()).toBe('ORANGE_WARNING');

    // Simulate elapsed 550s (50s remaining <= 60s) -> CRITICAL (Red)
    service.elapsedSeconds.set(550);
    expect(service.remainingSeconds()).toBe(50);
    expect(service.urgencyState()).toBe('CRITICAL');

    // Simulate elapsed 600s -> EXPIRED
    service.elapsedSeconds.set(600);
    expect(service.remainingSeconds()).toBe(0);
    expect(service.urgencyState()).toBe('EXPIRED');
  });

  it('should record MCQ answers in signal state', async () => {
    service.activeQuiz.set({
      assessmentId: 'test_123',
      title: 'Test Quiz',
      durationMinutes: 10,
      questions: [],
      elapsedSeconds: 0,
      selectedAnswers: {},
      uploadedImages: [],
      clientStartedAt: new Date().toISOString(),
      cachedAt: Date.now(),
      lastSavedAt: Date.now(),
      isCompleted: false
    });

    await service.recordAnswer('q_1', 2);
    expect(service.activeQuiz()?.selectedAnswers['q_1']).toBe(2);
  });

  it('should preserve selectedAnswers and uploadedImages when startAndCache() reloads an existing session', async () => {
    const assessmentId = 'test_asm_preserve';
    const startedAt = new Date(Date.now() - 30 * 1000).toISOString();

    const existingRecord = {
      assessmentId,
      title: 'Cached Title',
      durationMinutes: 15,
      questions: [
        { _id: 'q_1', question_order: 1, question_text_ar: 'س 1', question_text_en: 'Q 1', options: [], points: 1 },
        { _id: 'q_2', question_order: 2, question_text_ar: 'س 2', question_text_en: 'Q 2', options: [], points: 1 }
      ],
      elapsedSeconds: 30,
      selectedAnswers: { q_1: 1, q_2: 3 },
      uploadedImages: [
        { questionId: 'q_2', imageUrl: 'https://cdn.example.com/photo1.jpg', rotation: 0, sizeKb: 150 }
      ],
      clientStartedAt: startedAt,
      serverStartedAt: startedAt,
      cachedAt: Date.now() - 30 * 1000,
      lastSavedAt: Date.now() - 30 * 1000,
      isCompleted: false
    };

    await spiderMathDb.activeQuizzes.put(existingRecord as any);
    localStorage.setItem(`sm_exam_session_${assessmentId}`, JSON.stringify(existingRecord));

    let loadedRecord: any;
    service.startAndCache(assessmentId).subscribe(record => {
      loadedRecord = record;
    });

    const req = httpMock.expectOne(`/api/v1/assessments/${assessmentId}/start-and-cache`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.client_started_at).toBe(startedAt);

    req.flush({
      success: true,
      data: {
        assessment: {
          title_ar: 'Interactive Assessment Title',
          time_limit_minutes: 15,
          questions: [
            { _id: 'q_1', question_order: 1, question_text_ar: 'س 1', options: [] },
            { _id: 'q_2', question_order: 2, question_text_ar: 'س 2', options: [] }
          ]
        },
        idempotencyKey: 'idemp_key_123',
        serverStartedAt: startedAt
      }
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(loadedRecord).toBeDefined();
    expect(loadedRecord.selectedAnswers).toEqual({ q_1: 1, q_2: 3 });
    expect(loadedRecord.uploadedImages.length).toBe(1);
    expect(loadedRecord.uploadedImages[0].imageUrl).toBe('https://cdn.example.com/photo1.jpg');

    expect(service.activeQuiz()?.selectedAnswers).toEqual({ q_1: 1, q_2: 3 });
    expect(service.activeQuiz()?.uploadedImages.length).toBe(1);

    await service.clearQuiz(assessmentId);
  });

  it('should calculate real elapsed time based on authoritative start timestamp and deduct from remaining time', async () => {
    const assessmentId = 'test_asm_anticheat';
    const start5MinAgo = new Date(Date.now() - 300 * 1000).toISOString();

    let loadedRecord: any;
    service.startAndCache(assessmentId).subscribe(record => {
      loadedRecord = record;
    });

    const req = httpMock.expectOne(`/api/v1/assessments/${assessmentId}/start-and-cache`);
    req.flush({
      success: true,
      data: {
        assessment: {
          title_ar: 'Math Exam',
          time_limit_minutes: 20, // 20 mins = 1200 seconds total
          questions: [{ _id: 'q_1', question_text_ar: 'سؤال' }]
        },
        serverStartedAt: start5MinAgo
      }
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(loadedRecord).toBeDefined();
    expect(service.elapsedSeconds()).toBeGreaterThanOrEqual(299);
    expect(service.elapsedSeconds()).toBeLessThanOrEqual(305);

    expect(service.remainingSeconds()).toBeLessThanOrEqual(901);
    expect(service.remainingSeconds()).toBeGreaterThanOrEqual(895);
    expect(service.urgencyState()).toBe('CALM');

    await service.clearQuiz(assessmentId);
  });

  it('should automatically set EXPIRED urgency state and remainingSeconds=0 when elapsed time exceeds duration', async () => {
    const assessmentId = 'test_asm_expired';
    const start12MinAgo = new Date(Date.now() - 720 * 1000).toISOString();

    let loadedRecord: any;
    service.startAndCache(assessmentId).subscribe(record => {
      loadedRecord = record;
    });

    const req = httpMock.expectOne(`/api/v1/assessments/${assessmentId}/start-and-cache`);
    req.flush({
      success: true,
      data: {
        assessment: {
          title_ar: 'Short Quiz',
          time_limit_minutes: 10, // 600 seconds
          questions: [{ _id: 'q_1', question_text_ar: 'سؤال' }]
        },
        serverStartedAt: start12MinAgo
      }
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(loadedRecord).toBeDefined();
    expect(service.elapsedSeconds()).toBe(600);
    expect(service.remainingSeconds()).toBe(0);
    expect(service.urgencyState()).toBe('EXPIRED');
    expect(service.isTimerRunning()).toBeFalse();

    await service.clearQuiz(assessmentId);
  });

  it('should resist OS clock rollback by never allowing elapsedSeconds to decrease below cached elapsedSeconds', async () => {
    const assessmentId = 'test_asm_rollback';
    const cachedElapsed = 400;
    const artificiallyManipulatedStart = new Date(Date.now() - 50 * 1000).toISOString();

    const existingRecord = {
      assessmentId,
      title: 'Tamper Test',
      durationMinutes: 10,
      questions: [],
      elapsedSeconds: cachedElapsed,
      selectedAnswers: { q_1: 2 },
      uploadedImages: [],
      clientStartedAt: artificiallyManipulatedStart,
      serverStartedAt: artificiallyManipulatedStart,
      cachedAt: Date.now(),
      lastSavedAt: Date.now(),
      isCompleted: false
    };

    await spiderMathDb.activeQuizzes.put(existingRecord as any);
    localStorage.setItem(`sm_exam_session_${assessmentId}`, JSON.stringify(existingRecord));

    let loadedRecord: any;
    service.startAndCache(assessmentId).subscribe(record => {
      loadedRecord = record;
    });

    const req = httpMock.expectOne(`/api/v1/assessments/${assessmentId}/start-and-cache`);
    req.flush({
      success: true,
      data: {
        assessment: {
          title_ar: 'Tamper Test',
          time_limit_minutes: 10,
          questions: []
        },
        serverStartedAt: artificiallyManipulatedStart
      }
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(loadedRecord).toBeDefined();
    expect(service.elapsedSeconds()).toBeGreaterThanOrEqual(400);
    expect(service.remainingSeconds()).toBeLessThanOrEqual(200);

    await service.clearQuiz(assessmentId);
  });

  it('should cleanly remove records from both Dexie and localStorage on clearQuiz()', async () => {
    const assessmentId = 'test_asm_clear';
    const record = {
      assessmentId,
      title: 'To Clear',
      durationMinutes: 10,
      questions: [],
      elapsedSeconds: 50,
      selectedAnswers: {},
      uploadedImages: [],
      clientStartedAt: new Date().toISOString(),
      cachedAt: Date.now(),
      lastSavedAt: Date.now(),
      isCompleted: false
    };

    await spiderMathDb.activeQuizzes.put(record as any);
    localStorage.setItem(`sm_exam_session_${assessmentId}`, JSON.stringify(record));
    localStorage.setItem(`sm_exam_answers_${assessmentId}`, JSON.stringify({ q_1: 0 }));

    service.activeQuiz.set(record as any);
    service.elapsedSeconds.set(50);

    await service.clearQuiz(assessmentId);

    expect(service.activeQuiz()).toBeNull();
    expect(service.elapsedSeconds()).toBe(0);
    expect(localStorage.getItem(`sm_exam_session_${assessmentId}`)).toBeNull();
    expect(localStorage.getItem(`sm_exam_answers_${assessmentId}`)).toBeNull();
    const inDb = await spiderMathDb.activeQuizzes.get(assessmentId);
    expect(inDb).toBeUndefined();
  });
});
