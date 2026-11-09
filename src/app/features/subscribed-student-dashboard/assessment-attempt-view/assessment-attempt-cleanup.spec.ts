import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AssessmentAttemptViewComponent } from './assessment-attempt-view.component';
import { spiderMathDb } from '../../../core/offline-db/spider-math-db';

describe('Challenger 2: AssessmentAttemptViewComponent Storage Cleanup Verification', () => {
  let component: AssessmentAttemptViewComponent;
  let fixture: ComponentFixture<AssessmentAttemptViewComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await spiderMathDb.activeQuizzes.clear();

    await TestBed.configureTestingModule({
      imports: [AssessmentAttemptViewComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentAttemptViewComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(async () => {
    httpMock.verify();
    localStorage.clear();
    await spiderMathDb.activeQuizzes.clear();
  });

  it('checks whether localStorage is cleared or left lingering after successful online submission', async () => {
    const assessmentId = 'test_submit_cleanup_asm';

    // Set up active quiz in cache service and in localStorage & Dexie
    const record = {
      assessmentId,
      title: 'Exam Submission Test',
      durationMinutes: 30,
      questions: [{ _id: 'q1', textAr: 'سؤال 1', options: [{ optionIndex: 0, textAr: 'أ' }], questionType: 'MCQ', points: 1 }],
      elapsedSeconds: 120,
      selectedAnswers: { q1: 0 },
      uploadedImages: [],
      clientStartedAt: new Date().toISOString(),
      cachedAt: Date.now(),
      lastSavedAt: Date.now(),
      isCompleted: false
    };

    await spiderMathDb.activeQuizzes.put(record as any);
    localStorage.setItem(`sm_exam_session_${assessmentId}`, JSON.stringify(record));

    component.bundle.set({
      assessmentId,
      unitId: 'unit_1',
      titleAr: 'Exam Submission Test',
      titleEn: '',
      durationMinutes: 30,
      questions: [
        {
          _id: 'q1',
          order: 1,
          textAr: 'سؤال 1',
          textEn: '',
          imageUrl: undefined,
          options: [{ optionIndex: 0, textAr: 'أ', textEn: '' }],
          points: 1,
          requiresDesmos: false,
          type: 'MCQ'
        }
      ]
    });

    component.quizCache.activeQuiz.set(record as any);

    // Call submitAssessment(true) to trigger submission
    const submitPromise = component.submitAssessment(true);

    // Give microtask queue / completeQuizLocally IndexedDB time to resolve before HTTP post
    await new Promise(resolve => setTimeout(resolve, 50));

    // Expect the HTTP submission
    const req = httpMock.expectOne(`/api/v1/assessments/${assessmentId}/sync-submission`);
    expect(req.request.method).toBe('POST');
    req.flush({
      success: true,
      data: {
        submissionId: 'sub_xyz_123',
        status: 'SUBMITTED',
        score: 100
      }
    });

    await submitPromise;

    // Check Dexie: activeQuizzes record should be deleted
    const inDexie = await spiderMathDb.activeQuizzes.get(assessmentId);
    expect(inDexie).toBeUndefined();

    // Check localStorage: must be cleanly purged after successful submission
    const inLocalStorage = localStorage.getItem(`sm_exam_session_${assessmentId}`);
    expect(inLocalStorage).toBeNull();

    // Check answers localStorage key: must also be purged
    const inAnswers = localStorage.getItem(`sm_exam_answers_${assessmentId}`);
    expect(inAnswers).toBeNull();
  });
});
