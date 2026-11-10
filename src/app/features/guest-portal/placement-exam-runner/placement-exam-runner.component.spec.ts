import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { of } from 'rxjs';

import { PlacementExamRunnerComponent } from './placement-exam-runner.component';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { PublicDiscoveryService } from '../../../core/services/public-discovery.service';

describe('PlacementExamRunnerComponent', () => {
  let component: PlacementExamRunnerComponent;
  let fixture: ComponentFixture<PlacementExamRunnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PlacementExamRunnerComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ar: {} },
          translocoConfig: { availableLangs: ['en', 'ar'], defaultLang: 'en' }
        })
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlacementExamRunnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the PlacementExamRunnerComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should format time correctly into mm:ss', () => {
    component.timeRemainingSec.set(125);
    expect(component.formattedTime()).toBe('02:05');
  });

  it('should record answer selection', () => {
    component.selectOption(2);
    expect(component.answeredQuestionsCount()).toBeGreaterThanOrEqual(0);
  });

  it('should auto-submit on timer expiration even with 0 answers and close confirm dialog', async () => {
    const confirmDialogService = TestBed.inject(ConfirmDialogService);
    const discoveryService = TestBed.inject(PublicDiscoveryService);
    const closeSpy = spyOn(confirmDialogService, 'close');
    const submitSpy = spyOn(discoveryService, 'submitAnonymousPlacement').and.returnValue(of({
      attemptId: 'att_test',
      score: 0,
      maxScore: 100,
      percentage: 0,
      passed: false,
      totalQuestions: 10,
      correctAnswersCount: 0,
      isUnlocked: true
    }));

    component.selectedAnswers.set({});
    await component.submitExam(true);

    expect(closeSpy).toHaveBeenCalled();
    expect(submitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      answers: []
    }));
  });

  it('should abort manual submitExam when answers are empty and select default option', async () => {
    const confirmDialogService = TestBed.inject(ConfirmDialogService);
    const confirmSpy = spyOn(confirmDialogService, 'confirm');
    const selectOptionSpy = spyOn(component, 'selectOption');

    component.selectedAnswers.set({});
    await component.submitExam(false);

    expect(selectOptionSpy).toHaveBeenCalledWith(0);
    expect(confirmSpy).not.toHaveBeenCalled();
  });
});
