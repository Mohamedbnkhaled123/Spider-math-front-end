import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  InteractiveGradingStudioComponent,
  normalizeForMatch,
  isTextAnswerEquivalent
} from './interactive-grading-studio.component';

describe('InteractiveGradingStudioComponent', () => {
  let component: InteractiveGradingStudioComponent;
  let fixture: ComponentFixture<InteractiveGradingStudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InteractiveGradingStudioComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InteractiveGradingStudioComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pendingSubmissions', []);
    fixture.detectChanges();
  });

  it('should create interactive grading studio component', () => {
    expect(component).toBeTruthy();
  });

  it('should adjust zoom levels appropriately', () => {
    expect(component.canvasZoom()).toBe(1);
    component.zoomIn();
    expect(component.canvasZoom()).toBe(1.25);
    component.zoomOut();
    expect(component.canvasZoom()).toBe(1);
  });

  it('should rotate canvas by 90 degrees intervals', () => {
    expect(component.canvasRotation()).toBe(0);
    component.rotateCanvas();
    expect(component.canvasRotation()).toBe(90);
    component.rotateCanvas();
    expect(component.canvasRotation()).toBe(180);
  });

  it('should accurately handle teacher essay grading decisions in details modal', () => {
    const mockSubmission: any = {
      id: 'sub_test_1',
      studentName: 'Mohammed Khaled',
      haCode: 'HA1001',
      totalPoints: 15,
      mcqAutoScore: 0,
      essayManualScore: 0,
      finalTotalScore: 5,
      scorePercentage: 33,
      status: 'PENDING',
      answers: [
        {
          questionId: 'q1',
          questionText: 'MCQ Question',
          questionType: 'MCQ',
          points: 5,
          pointsEarned: 0,
          isCorrect: false
        },
        {
          questionId: 'q2',
          questionText: 'Input Text Question',
          questionType: 'INPUT_TEXT',
          points: 5,
          pointsEarned: 5,
          isCorrect: true,
          studentTextAnswer: '5'
        },
        {
          questionId: 'q3',
          questionText: 'Essay Photo Question',
          questionType: 'ESSAY_PHOTO',
          points: 5,
          pointsEarned: 0,
          isCorrect: false,
          isPendingManualGrading: true
        }
      ]
    };

    const essayQ = mockSubmission.answers[2];
    expect(essayQ.isPendingManualGrading).toBe(true);

    // 1. Grade FULL
    component.gradeEssayQuestionInModal(mockSubmission, essayQ, 'FULL');
    expect(essayQ.pointsEarned).toBe(5);
    expect(essayQ.gradingDecision).toBe('FULL');
    expect(essayQ.isPendingManualGrading).toBe(false);
    expect(mockSubmission.finalTotalScore).toBe(10); // 5 (auto) + 5 (essay)

    // 2. Grade HALF
    component.gradeEssayQuestionInModal(mockSubmission, essayQ, 'HALF');
    expect(essayQ.pointsEarned).toBe(2.5);
    expect(essayQ.gradingDecision).toBe('HALF');
    expect(mockSubmission.finalTotalScore).toBe(7.5); // 5 (auto) + 2.5 (essay)

    // 3. Grade ZERO
    component.gradeEssayQuestionInModal(mockSubmission, essayQ, 'ZERO');
    expect(essayQ.pointsEarned).toBe(0);
    expect(essayQ.gradingDecision).toBe('ZERO');
    expect(mockSubmission.finalTotalScore).toBe(5); // 5 (auto) + 0 (essay)
  });

  it('should control lightbox image preview zoom and rotation', () => {
    component.openImagePreview('https://example.com/image.webp');
    expect(component.previewImageUrl()).toBe('https://example.com/image.webp');
    expect(component.previewImageZoom()).toBe(1);

    component.zoomInPreview();
    expect(component.previewImageZoom()).toBe(1.25);

    component.rotatePreview();
    expect(component.previewImageRotation()).toBe(90);

    component.closeImagePreview();
    expect(component.previewImageUrl()).toBeNull();
  });

  it('should normalize and match student typed text accurately', () => {
    expect(normalizeForMatch(' ٥ ')).toBe('5');
    expect(isTextAnswerEquivalent('٥', '5')).toBe(true);
    expect(isTextAnswerEquivalent('5.0', '5')).toBe(true);
    expect(isTextAnswerEquivalent('1/2', '0.5')).toBe(true);
    expect(isTextAnswerEquivalent('دائره', 'دائرة')).toBe(true);
    expect(isTextAnswerEquivalent('خَمْسَة', 'خمسة')).toBe(true);
    expect(isTextAnswerEquivalent('7', '5')).toBe(false);
  });

  it('should keep multi-essay quiz PENDING until all essay questions are graded', () => {
    const multiSubmission: any = {
      id: 'sub_multi',
      totalPoints: 15,
      finalTotalScore: 5,
      status: 'PENDING',
      answers: [
        { questionId: 'q1', questionType: 'MCQ', points: 5, pointsEarned: 5 },
        { questionId: 'q2', questionType: 'ESSAY_PHOTO', points: 5, pointsEarned: 0, isPendingManualGrading: true },
        { questionId: 'q3', questionType: 'ESSAY_PHOTO', points: 5, pointsEarned: 0, isPendingManualGrading: true }
      ]
    };

    // Grade only Q2
    component.gradeEssayQuestionInModal(multiSubmission, multiSubmission.answers[1], 'FULL');
    expect(multiSubmission.answers[1].isPendingManualGrading).toBe(false);
    expect(multiSubmission.answers[2].isPendingManualGrading).toBe(true);
    expect(multiSubmission.status).toBe('PENDING'); // Must remain PENDING!

    // Grade Q3
    component.gradeEssayQuestionInModal(multiSubmission, multiSubmission.answers[2], 'HALF');
    expect(multiSubmission.answers[2].isPendingManualGrading).toBe(false);
    expect(multiSubmission.status).toBe('PUBLISHED'); // Now transitions to PUBLISHED
    expect(multiSubmission.finalTotalScore).toBe(12.5); // 5 + 5 + 2.5
  });

  it('should configure canvas grading item with essay points only, not total assessment points', () => {
    const testSub: any = {
      id: 'sub_test_points',
      studentName: 'Mohammed Khaled',
      haCode: 'HA1001',
      assessmentId: 'asm_1',
      assessmentTitle: 'October test',
      totalPoints: 15,
      mcqAutoScore: 10,
      essayManualScore: 0,
      finalTotalScore: 10,
      status: 'PENDING',
      answers: [
        { questionId: 'q1', questionType: 'MCQ', points: 5, pointsEarned: 5 },
        { questionId: 'q2', questionType: 'INPUT_TEXT', points: 5, pointsEarned: 5 },
        { questionId: 'q3', questionType: 'ESSAY_PHOTO', points: 5, pointsEarned: 0, isPendingManualGrading: true }
      ],
      homeworkImages: [{ imageUrl: 'https://example.com/step.webp' }]
    };

    component.openGradingFromSubmission(testSub);
    const gradingItem = component.currentGradingItem();
    expect(gradingItem).toBeTruthy();
    expect(gradingItem?.maxScore).toBe(5); // Essay points only, NOT 15!
    expect(gradingItem?.awardedScore).toBe(0); // Starts at essayManualScore (0), NOT finalTotalScore (10)!
  });
});
