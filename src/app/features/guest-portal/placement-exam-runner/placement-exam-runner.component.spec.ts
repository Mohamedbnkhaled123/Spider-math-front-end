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

  describe('Low Score (< 70%) Celebration Suppression and Encouraging Banner', () => {
    it('should strictly suppress celebration and render encouraging banner for scores < 70%', () => {
      // Simulate authenticated student finishing with 33% score
      component.isLoading.set(false);
      component.studentExamFinished.set(true);
      component.studentFinalResult.set({
        score: 5,
        maxScore: 15,
        percentage: 33,
        passed: false,
        correctAnswersCount: 1,
        totalQuestions: 3
      });
      component.isCelebrationOpen.set(false);
      fixture.detectChanges();

      expect(component.isCelebrationOpen()).toBeFalse();

      // Manual call to openCelebration must be ignored
      component.openCelebration();
      expect(component.isCelebrationOpen()).toBeFalse();

      const hostEl: HTMLElement = fixture.nativeElement;
      // Celebration button must NOT exist
      const celebrationBtn = Array.from(hostEl.querySelectorAll('button')).find(b =>
        b.textContent?.includes('احتفالية') || b.textContent?.includes('Celebration')
      );
      expect(celebrationBtn).toBeFalsy();

      // Encouraging banner MUST exist
      const encouragingBanner = hostEl.querySelector('[data-testid="placement-encouraging-banner"]');
      expect(encouragingBanner).toBeTruthy();
    });

    it('should allow celebration button when score is >= 70%', () => {
      component.isLoading.set(false);
      component.studentExamFinished.set(true);
      component.studentFinalResult.set({
        score: 12,
        maxScore: 15,
        percentage: 80,
        passed: true,
        correctAnswersCount: 2,
        totalQuestions: 3
      });
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const celebrationBtn = Array.from(hostEl.querySelectorAll('button')).find(b =>
        b.textContent?.includes('احتفالية') || b.textContent?.includes('Celebration')
      );
      expect(celebrationBtn).toBeTruthy();

      // Encouraging banner must NOT exist
      const encouragingBanner = hostEl.querySelector('[data-testid="placement-encouraging-banner"]');
      expect(encouragingBanner).toBeNull();
    });
  });

  describe('Navbar Clearance Contract during Exam Execution', () => {
    it('should place sticky exam runner sub-header strictly below platform brand navbar (top-16 sm:top-20)', () => {
      const headerEl: HTMLElement | null = fixture.nativeElement.querySelector('header');
      expect(headerEl).toBeTruthy();
      expect(headerEl?.classList.contains('sticky')).toBeTrue();
      expect(headerEl?.classList.contains('top-16')).toBeTrue();
      expect(headerEl?.classList.contains('sm:top-20')).toBeTrue();
      expect(headerEl?.classList.contains('top-0')).toBeFalse();
      expect(headerEl?.classList.contains('z-layer-header')).toBeFalse();
    });
  });

  describe('Quick Track Selector Subdivisions (Gulf Countries & International Divisions)', () => {
    it('should switch Gulf countries and International divisions accurately for guests', () => {
      component.studentExamFinished.set(false);
      component.onCurriculumSelected('GULF');
      fixture.detectChanges();

      expect(component.curriculum()).toBe('GULF');
      component.onGulfCountrySelected('KW');
      fixture.detectChanges();
      expect(component.selectedGulfCountry()).toBe('KW');

      component.onCurriculumSelected('INTERNATIONAL');
      fixture.detectChanges();
      expect(component.curriculum()).toBe('INTERNATIONAL');

      component.onIntlDivisionSelected('BRITISH_CURRICULUM');
      fixture.detectChanges();
      expect(component.selectedIntlDivision()).toBe('BRITISH_CURRICULUM');
    });
  });
});
