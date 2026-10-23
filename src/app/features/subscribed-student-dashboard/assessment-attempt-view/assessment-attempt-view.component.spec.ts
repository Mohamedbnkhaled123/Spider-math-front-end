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
});
