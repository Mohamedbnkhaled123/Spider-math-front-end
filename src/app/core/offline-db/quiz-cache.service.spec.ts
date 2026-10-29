import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { QuizCacheService } from './quiz-cache.service';

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

  afterEach(() => {
    httpMock.verify();
    service.ngOnDestroy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate remaining seconds and urgency state correctly', () => {
    // Set mock active quiz
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
});
