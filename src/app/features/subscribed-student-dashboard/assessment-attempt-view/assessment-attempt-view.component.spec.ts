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
});
