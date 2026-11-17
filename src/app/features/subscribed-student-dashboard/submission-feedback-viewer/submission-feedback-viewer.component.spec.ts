import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SubmissionFeedbackViewerComponent } from './submission-feedback-viewer.component';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';

describe('SubmissionFeedbackViewerComponent', () => {
  let component: SubmissionFeedbackViewerComponent;
  let fixture: ComponentFixture<SubmissionFeedbackViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmissionFeedbackViewerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: LangService,
          useValue: {
            isArabic: () => true,
            currentLang: () => 'ar'
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubmissionFeedbackViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle visibility between pending and published', () => {
    component.feedback.update((f) => ({ ...f, resultVisibility: 'PUBLISHED_TO_STUDENT_AND_PARENT' }));
    expect(component.isPublished()).toBeTrue();
    component.feedback.update((f) => ({ ...f, resultVisibility: 'HIDDEN_PENDING_TEACHER' }));
    expect(component.isPublished()).toBeFalse();
  });

  it('should calculate score percentage and full mark condition correctly', () => {
    component.feedback.update((f) => ({
      ...f,
      resultVisibility: 'PUBLISHED_TO_STUDENT_AND_PARENT',
      finalTotalScore: 10,
      maxScore: 15
    }));
    expect(component.scorePercentage()).toBe(67);
    expect(component.isFullMark()).toBeFalse();

    component.feedback.update((f) => ({
      ...f,
      finalTotalScore: 15,
      maxScore: 15
    }));
    expect(component.scorePercentage()).toBe(100);
    expect(component.isFullMark()).toBeTrue();
  });

  describe('Mobile Responsiveness and Layout Contract', () => {
    it('should configure top navigation bar with responsive stacking and flex wrap classes', () => {
      component.feedback.update((f) => ({
        ...f,
        assessmentId: 'asm_test_1',
        unitTitleAr: 'الوحدة الأولى: الجبر والهندسة الفراغية',
        maxAttempts: 3,
        completedAttemptsCount: 1,
        resultVisibility: 'HIDDEN_PENDING_TEACHER'
      }));
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const topBar = hostEl.querySelector('.feedback-viewer-root > div:first-child');
      expect(topBar).toBeTruthy();
      expect(topBar?.classList.contains('flex')).toBeTrue();
      expect(topBar?.classList.contains('flex-col')).toBeTrue();
      expect(topBar?.classList.contains('sm:flex-row')).toBeTrue();
      expect(topBar?.classList.contains('sm:items-center')).toBeTrue();
      expect(topBar?.classList.contains('justify-between')).toBeTrue();

      // Actions container should wrap on narrow viewports
      const actionsContainer = topBar?.querySelector('div:last-child');
      expect(actionsContainer).toBeTruthy();
      expect(actionsContainer?.classList.contains('flex-wrap')).toBeTrue();

      // Breadcrumb title should have min-w-0 and truncate to prevent horizontal collision
      const unitTitle = topBar?.querySelector('.truncate');
      expect(unitTitle).toBeTruthy();
      expect(unitTitle?.classList.contains('min-w-0')).toBeTrue();
    });

    it('should contain zero Unicode emojis in rendered template', () => {
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
      expect(emojiRegex.test(fixture.nativeElement.innerHTML)).toBeFalse();
    });
  });

  describe('Half-Point Rendering & Per-Question Solution Image Isolation', () => {
    it('should display 0.5 / 1 as half point and isolate Question 8 vs Question 9 images', () => {
      component.feedback.set({
        submissionId: 'sub_half_iso',
        assessmentId: 'asm_1',
        unitId: 'u_1',
        assessmentTitleAr: 'امتحان تجريبي',
        assessmentTitleEn: 'Test Exam',
        unitTitleAr: 'الوحدة 1',
        resultVisibility: 'PUBLISHED_TO_STUDENT_AND_PARENT',
        mcqAutoScore: 0,
        essayManualScore: 0.5,
        finalTotalScore: 0.5,
        maxScore: 2,
        scorePercentage: 25,
        customMistakeCases: [],
        essaySolutionImages: [
          { questionId: 'q8', imageUrl: 'https://cdn.example.com/q8.webp', rotationDeg: 0 },
          { questionId: 'q9', imageUrl: 'https://cdn.example.com/q9.webp', rotationDeg: 0 }
        ],
        questionsReview: [
          {
            questionId: 'q8',
            questionOrder: 8,
            questionType: 'ESSAY_PHOTO',
            questionText: 'السؤال الثامن',
            options: [],
            studentAnswerText: '',
            points: 1,
            awardedPoints: 0.5,
            isCorrect: true,
            studentSolutionImages: [
              { questionId: 'q8', imageUrl: 'https://cdn.example.com/q8.webp', rotationDeg: 0 }
            ]
          },
          {
            questionId: 'q9',
            questionOrder: 9,
            questionType: 'ESSAY_PHOTO',
            questionText: 'السؤال التاسع',
            options: [],
            studentAnswerText: '',
            points: 1,
            awardedPoints: 0,
            isCorrect: false,
            studentSolutionImages: [
              { questionId: 'q9', imageUrl: 'https://cdn.example.com/q9.webp', rotationDeg: 0 }
            ]
          }
        ]
      });
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const cards = hostEl.querySelectorAll('.space-y-6 > .p-6.rounded-3xl');
      expect(cards.length).toBe(2);

      // Verify half point text shows "نصف درجة" and NOT "درجة كاملة"
      expect(cards[0].textContent).toContain('+0.5 / 1');
      expect(cards[0].textContent).toContain('نصف درجة');
      expect(cards[0].textContent).not.toContain('درجة كاملة');

      // Question 8 shows ONLY q8.webp
      const q8Imgs = Array.from(cards[0].querySelectorAll('img')).map((img) => img.getAttribute('src'));
      expect(q8Imgs).toEqual(['https://cdn.example.com/q8.webp']);

      // Question 9 shows ONLY q9.webp (never q8.webp!)
      const q9Imgs = Array.from(cards[1].querySelectorAll('img')).map((img) => img.getAttribute('src'));
      expect(q9Imgs).toEqual(['https://cdn.example.com/q9.webp']);
    });
  });
});
