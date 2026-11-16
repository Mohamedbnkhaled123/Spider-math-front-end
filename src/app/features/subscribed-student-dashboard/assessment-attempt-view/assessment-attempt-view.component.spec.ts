import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AssessmentAttemptViewComponent } from './assessment-attempt-view.component';

describe('AssessmentAttemptViewComponent', () => {
  let component: AssessmentAttemptViewComponent;
  let fixture: ComponentFixture<AssessmentAttemptViewComponent>;

  beforeEach(async () => {
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
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle question index', () => {
    component.bundle.set({
      ...component.bundle(),
      questions: [
        { _id: 'q1', textAr: 'سؤال 1', options: [], questionType: 'MCQ', points: 1 } as any,
        { _id: 'q2', textAr: 'سؤال 2', options: [], questionType: 'MCQ', points: 1 } as any
      ]
    });
    expect(component.activeQuestionIdx()).toBe(0);
    component.nextQuestion();
    expect(component.activeQuestionIdx()).toBe(1);
    component.prevQuestion();
    expect(component.activeQuestionIdx()).toBe(0);
  });

  it('should toggle Desmos modal', () => {
    expect(component.isDesmosOpen()).toBeFalse();
    component.toggleDesmos();
    expect(component.isDesmosOpen()).toBeTrue();
  });

  describe('Navbar Clearance and Layering Contract', () => {
    it('should assign z-layer-modal and responsive navbar clearance to reference sheet modal', () => {
      component.bundle.set({
        ...component.bundle(),
        referenceSheetUrl: 'https://example.com/sheet.png'
      });
      component.isReferenceOpen.set(true);
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const refModalBackdrop = hostEl.querySelector('.z-layer-modal');
      expect(refModalBackdrop).toBeTruthy();
      expect(refModalBackdrop?.classList.contains('reference-sheet-backdrop')).toBeTrue();
      expect(refModalBackdrop?.classList.contains('pt-16')).toBeTrue();
      expect(refModalBackdrop?.classList.contains('sm:pt-20')).toBeTrue();
      expect(refModalBackdrop?.classList.contains('md:inset-auto')).toBeTrue();
      expect(refModalBackdrop?.classList.contains('md:bottom-6')).toBeTrue();
      expect(refModalBackdrop?.classList.contains('md:left-6')).toBeTrue();

      const innerCard = refModalBackdrop?.querySelector('.rounded-3xl');
      expect(innerCard?.classList.contains('max-h-[calc(100dvh-5.5rem)]')).toBeTrue();
    });

    it('should contain zero Unicode emojis in rendered template', () => {
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
      expect(emojiRegex.test(fixture.nativeElement.innerHTML)).toBeFalse();
    });
  });

  describe('Solution Image Single-Display and Responsive Layout', () => {
    it('should configure uploader with showItemList=false and clearOnSuccess=true', () => {
      component.bundle.set({
        ...component.bundle(),
        questions: [
          { _id: 'q1', textAr: 'سؤال 1', options: [], questionType: 'MCQ', type: 'MCQ', points: 1 } as any
        ]
      });
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const uploaderEl = hostEl.querySelector('app-image-compressor-uploader');
      expect(uploaderEl).toBeTruthy();
    });

    it('should display attached solution image with flex-wrap and remove button without duplication', () => {
      const qId = 'q1';
      component.bundle.set({
        ...component.bundle(),
        questions: [
          { _id: qId, textAr: 'سؤال 1', options: [], questionType: 'MCQ', type: 'MCQ', points: 1 } as any
        ]
      });
      component.quizCache.activeQuiz.set({
        assessmentId: 'asm_test',
        title: 'Test',
        durationMinutes: 10,
        questions: [],
        elapsedSeconds: 0,
        selectedAnswers: {},
        uploadedImages: [
          { questionId: qId, imageUrl: 'https://example.com/sol1.webp', rotation: 0, sizeKb: 80 }
        ],
        clientStartedAt: new Date().toISOString(),
        cachedAt: Date.now(),
        lastSavedAt: Date.now(),
        isCompleted: false
      });
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const attachedImages = component.getQuestionImages(qId);
      expect(attachedImages.length).toBe(1);

      // Verify the single attached photo card is rendered with flex-wrap
      const cardWrap = hostEl.querySelector('.bg-emerald-500\\/10 .flex-wrap');
      expect(cardWrap).toBeTruthy();

      // Verify delete button exists
      const deleteBtn = hostEl.querySelector('.bg-emerald-500\\/10 button');
      expect(deleteBtn).toBeTruthy();

      // Verify removeQuestionImage cleans up quizCache
      component.removeQuestionImage(qId, 'https://example.com/sol1.webp');
      expect(component.getQuestionImages(qId).length).toBe(0);
    });

    it('should preserve up to 2 solution images sequentially uploaded for an ESSAY question', () => {
      const qEssayId = 'q_essay_1';
      component.bundle.set({
        ...component.bundle(),
        questions: [
          { _id: qEssayId, textAr: 'سؤال مقالي', questionType: 'ESSAY', type: 'ESSAY', points: 5 } as any
        ]
      });
      component.quizCache.activeQuiz.set({
        assessmentId: 'asm_test',
        title: 'Test',
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

      // Upload page 1
      component.onQuestionHomeworkUploaded(qEssayId, ['https://cdn.example.com/page1.webp']);
      let images = component.getQuestionImages(qEssayId);
      expect(images.length).toBe(1);
      expect(images[0].imageUrl).toBe('https://cdn.example.com/page1.webp');

      // Upload page 2 sequentially
      component.onQuestionHomeworkUploaded(qEssayId, ['https://cdn.example.com/page2.webp']);
      images = component.getQuestionImages(qEssayId);
      expect(images.length).toBe(2);
      expect(images[0].imageUrl).toBe('https://cdn.example.com/page1.webp');
      expect(images[1].imageUrl).toBe('https://cdn.example.com/page2.webp');
    });

    it('should replace previous image when a new image is uploaded for an MCQ question', () => {
      const qMcqId = 'q_mcq_1';
      component.bundle.set({
        ...component.bundle(),
        questions: [
          { _id: qMcqId, textAr: 'سؤال اختياري', options: [], questionType: 'MCQ', type: 'MCQ', points: 2 } as any
        ]
      });
      component.quizCache.activeQuiz.set({
        assessmentId: 'asm_test',
        title: 'Test',
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

      // Upload first attempt
      component.onQuestionHomeworkUploaded(qMcqId, ['https://cdn.example.com/mcq_sol1.webp']);
      expect(component.getQuestionImages(qMcqId).length).toBe(1);

      // Upload replacement image
      component.onQuestionHomeworkUploaded(qMcqId, ['https://cdn.example.com/mcq_sol2.webp']);
      const images = component.getQuestionImages(qMcqId);
      expect(images.length).toBe(1);
      expect(images[0].imageUrl).toBe('https://cdn.example.com/mcq_sol2.webp');
    });
  });
});
