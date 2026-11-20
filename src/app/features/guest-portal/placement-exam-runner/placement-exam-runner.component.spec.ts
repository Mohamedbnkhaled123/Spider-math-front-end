import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { of } from 'rxjs';

import { PlacementExamRunnerComponent } from './placement-exam-runner.component';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { PublicDiscoveryService } from '../../../core/services/public-discovery.service';
import { AuthService } from '../../../core/auth/auth.service';
import {
  savePendingPlacementResult,
  getPendingPlacementResult,
  clearPendingPlacementResult
} from '../../../core/utils/pending-placement.util';

describe('PlacementExamRunnerComponent', () => {
  let component: PlacementExamRunnerComponent;
  let fixture: ComponentFixture<PlacementExamRunnerComponent>;

  beforeEach(async () => {
    clearPendingPlacementResult();
    localStorage.clear();
    sessionStorage.clear();
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

  afterEach(() => {
    clearPendingPlacementResult();
    localStorage.clear();
    sessionStorage.clear();
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

  describe('INPUT_TEXT and ESSAY_PHOTO Question Rendering & Submission', () => {
    it('should render text input for INPUT_TEXT and photo uploader for ESSAY_PHOTO, and include both in submit payload', async () => {
      const discoveryService = TestBed.inject(PublicDiscoveryService);
      const confirmDialogService = TestBed.inject(ConfirmDialogService);
      spyOn(confirmDialogService, 'confirm').and.resolveTo(true);
      const submitSpy = spyOn(discoveryService, 'submitAnonymousPlacement').and.returnValue(of({
        attemptId: 'att_multi',
        score: 2,
        maxScore: 2,
        percentage: 100,
        passed: true,
        totalQuestions: 2,
        correctAnswersCount: 2,
        isUnlocked: false
      }));

      component.isLoading.set(false);
      component.studentExamFinished.set(false);
      component.examData.set({
        assessment_id: 'asm_intl_1',
        hasTest: true,
        title: 'International Grade 1 Placement',
        curriculum: 'INTERNATIONAL',
        grade_level: 'US_GRADE_1',
        academic_term: 'TERM_1',
        total_questions: 2,
        time_limit_minutes: 20,
        questions: [
          {
            question_id: 'q7_input',
            question_type: 'INPUT_TEXT',
            question_text: 'Find GCF and LCM of 8 and 12',
            options: [],
            points: 1
          },
          {
            question_id: 'q9_essay',
            question_type: 'ESSAY_PHOTO',
            question_text: 'Giovanni fruit baskets problem',
            options: [],
            points: 1
          }
        ]
      });
      component.currentQuestionIdx.set(0);
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const textInput = hostEl.querySelector('[data-testid="placement-input-text"]') as HTMLInputElement;
      expect(textInput).toBeTruthy();

      textInput.value = '4 and 24';
      textInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(component.answeredQuestionsCount()).toBe(1);

      // Jump to Question 9 (ESSAY_PHOTO)
      component.jumpToQuestion(1);
      fixture.detectChanges();
      const essaySection = hostEl.querySelector('[data-testid="placement-essay-section"]');
      expect(essaySection).toBeTruthy();

      component.onHomeworkImagesUploaded('q9_essay', ['https://cdn.example.com/spider-math-homework/q9.webp']);
      fixture.detectChanges();
      expect(component.answeredQuestionsCount()).toBe(2);

      await component.submitExam(false);
      expect(submitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        answers: [
          { questionId: 'q7_input', textAnswer: '4 and 24' },
          { questionId: 'q9_essay', uploadedImageUrls: ['https://cdn.example.com/spider-math-homework/q9.webp'] }
        ]
      }));
    });
  });

  describe('Coming Soon State UI Verification', () => {
    it('should display coming soon card with centered clock icon and correct subtitle when no exam exists', () => {
      component.isLoading.set(false);
      component.studentExamFinished.set(false);
      component.examData.set({
        assessment_id: '',
        hasTest: false,
        title: 'امتحان تحديد المستوى',
        curriculum: 'EGYPTIAN',
        grade_level: 'SEC_1',
        academic_term: 'TERM_1',
        total_questions: 0,
        time_limit_minutes: 15,
        questions: []
      });
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const comingSoonCard = hostEl.querySelector('[data-testid="placement-coming-soon-card"]');
      expect(comingSoonCard).toBeTruthy();

      const iconContainer = hostEl.querySelector('.w-16.h-16.rounded-2xl');
      expect(iconContainer).toBeTruthy();
      expect(iconContainer?.classList.contains('shrink-0')).toBeTrue();
      expect(iconContainer?.classList.contains('mx-auto')).toBeTrue();

      const subtitle = hostEl.querySelector('[data-testid="placement-coming-soon-subtitle"]');
      expect(subtitle?.textContent?.trim()).toContain('سيتم انشاء هذا الاختبار قريبا كن علي تواصل معنا');

      const allButtons = Array.from(hostEl.querySelectorAll('button'));
      const sec3Button = allButtons.find(b => b.textContent?.includes('اختبار 3 ثانوي') || b.textContent?.includes('Sec 3 Exam'));
      expect(sec3Button).toBeUndefined();

      const navBtn = hostEl.querySelector('[data-testid="placement-coming-soon-nav-btn"]');
      expect(navBtn).toBeTruthy();
    });
  });

  describe('Guest Post-Submission Direct Login & Immediate Result Display', () => {
    it('should redirect anonymous guest straight to /login after submitting and save pending result without opening LeadGate', async () => {
      const discoveryService = TestBed.inject(PublicDiscoveryService);
      const confirmDialogService = TestBed.inject(ConfirmDialogService);
      const router = TestBed.inject(Router);
      const authService = TestBed.inject(AuthService);
      authService.clearSession('/');

      spyOn(confirmDialogService, 'confirm').and.resolveTo(true);
      const navSpy = spyOn(router, 'navigate');
      spyOn(discoveryService, 'submitAnonymousPlacement').and.returnValue(of({
        attemptId: '673000000000000000000111',
        score: 4,
        maxScore: 5,
        percentage: 80,
        passed: true,
        totalQuestions: 5,
        correctAnswersCount: 4,
        isUnlocked: false
      }));

      component.selectedAnswers.set({ q_1: 1 });
      await component.submitExam(false);

      expect(component.isLeadGateOpen()).toBeFalse();
      const pending = getPendingPlacementResult();
      expect(pending).toBeTruthy();
      expect(pending?.attemptId).toBe('673000000000000000000111');
      expect(pending?.percentage).toBe(80);
      expect(navSpy).toHaveBeenCalledWith(
        ['/login'],
        jasmine.objectContaining({
          queryParams: jasmine.objectContaining({
            from: 'placement-test',
            attemptId: '673000000000000000000111',
            returnUrl: '/placement-test?showResult=true&attemptId=673000000000000000000111'
          })
        })
      );
    });

    it('should immediately render saved placement result and claim attempt when authenticated student returns', () => {
      const authService = TestBed.inject(AuthService);
      const httpMock = TestBed.inject(HttpTestingController);
      const route = TestBed.inject(ActivatedRoute);

      savePendingPlacementResult({
        attemptId: '673000000000000000000222',
        curriculum: 'EGYPTIAN',
        gradeLevel: 'SEC_3',
        academicTerm: 'TERM_1',
        score: 4,
        maxScore: 5,
        percentage: 80,
        passed: true,
        totalQuestions: 5,
        correctAnswersCount: 4
      });

      authService.setSession('jwt_student_token', {
        _id: 'std_222',
        full_name: 'Omar Ali',
        email: 'omar@spidermath.edu',
        role: 'STUDENT',
        curriculum: 'EGYPTIAN',
        grade_level: 'SEC_3',
        academic_term: 'TERM_1'
      });

      (route as any).snapshot = {
        ...route.snapshot,
        queryParams: { showResult: 'true', attemptId: '673000000000000000000222' },
        queryParamMap: convertToParamMap({ showResult: 'true', attemptId: '673000000000000000000222' })
      };

      const returnFixture = TestBed.createComponent(PlacementExamRunnerComponent);
      const returnComp = returnFixture.componentInstance;
      returnFixture.detectChanges();

      expect(returnComp.studentExamFinished()).toBeTrue();
      expect(returnComp.studentFinalResult()?.percentage).toBe(80);
      expect(returnComp.studentFinalResult()?.score).toBe(4);
      expect(getPendingPlacementResult()).toBeNull();

      const claimReq = httpMock.expectOne('/api/v1/public/placement-test/673000000000000000000222/claim');
      expect(claimReq.request.method).toBe('POST');
      claimReq.flush({
        success: true,
        data: {
          attemptId: '673000000000000000000222',
          score: 4,
          maxScore: 5,
          percentage: 80,
          passed: true,
          totalQuestions: 5,
          correctAnswersCount: 4,
          isUnlocked: true
        }
      });

      returnFixture.detectChanges();
      expect(returnFixture.nativeElement.textContent).toContain('80%');
    });
  });
});
