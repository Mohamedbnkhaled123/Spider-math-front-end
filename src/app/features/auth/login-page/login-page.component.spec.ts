import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPageComponent } from './login-page.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import {
  savePendingPlacementResult,
  clearPendingPlacementResult
} from '../../../core/utils/pending-placement.util';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  beforeEach(async () => {
    clearPendingPlacementResult();
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    clearPendingPlacementResult();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with student tab', () => {
    expect(component.activeTab()).toBe('student');
  });

  it('should switch tabs cleanly between student and parent without exposing an admin tab', () => {
    component.setTab('parent');
    expect(component.activeTab()).toBe('parent');
    expect(fixture.nativeElement.textContent).not.toContain('استوديو الإدارة');
  });

  describe('Dynamic custom grades in student direct registration', () => {
    it('should dynamically include custom grades configured in CMS for Gulf curriculum', () => {
      const discoveryService = (component as any).discoveryService;
      discoveryService.curriculaTracks.set([
        {
          code: 'GULF',
          isActive: true,
          grades: [
            {
              code: 'QODORAT',
              titleAr: 'قدرات عامة',
              titleEn: 'General Abilities Test (GAT)',
              shortLabelAr: 'قدرات',
              shortLabelEn: 'GAT',
              stageCode: 'OTHER',
              countryCode: 'SA',
              isCustom: true,
              isActive: true,
              isAvailable: true
            }
          ]
        }
      ]);
      discoveryService.activeGrades.set(['QODORAT', 'SA_GRADE_1', 'SA_GRADE_12']);

      component.onRegCurriculumChange('GULF');
      component.onRegGulfCountryChange('SA');

      const grades = component.regAvailableGrades();
      const qodorat = grades.find(g => g.code === 'QODORAT');
      expect(qodorat).toBeDefined();
      expect(qodorat?.shortLabelAr).toBe('قدرات');
    });
  });

  describe('Placement Test Return & Attempt Linking Flow', () => {
    it('should display placement login banner, pre-fill signup track, and redirect HA code login straight to placement result', async () => {
      const route = TestBed.inject(ActivatedRoute);
      const router = TestBed.inject(Router);
      const httpMock = TestBed.inject(HttpTestingController);
      const navByUrlSpy = spyOn(router, 'navigateByUrl');

      const qpObj = {
        from: 'placement-test',
        attemptId: '673000000000000000000333',
        curriculum: 'EGYPTIAN',
        gradeLevel: 'SEC_2',
        term: 'TERM_2',
        returnUrl: '/placement-test?showResult=true&attemptId=673000000000000000000333'
      };
      (route as any).snapshot = {
        ...route.snapshot,
        queryParams: qpObj,
        queryParamMap: convertToParamMap(qpObj)
      };

      const placementFixture = TestBed.createComponent(LoginPageComponent);
      const placementComp = placementFixture.componentInstance;
      placementFixture.detectChanges();

      expect(placementComp.isFromPlacementTest()).toBeTrue();
      expect(placementComp.regCurriculum()).toBe('EGYPTIAN');
      expect(placementComp.regGradeLevel()).toBe('SEC_2');
      expect(placementComp.regAcademicTerm()).toBe('TERM_2');
      expect(placementFixture.nativeElement.querySelector('[data-testid="placement-login-banner"]')).toBeTruthy();

      placementComp.studentHaCode.set('HA4920');
      await placementComp.submitStudentLogin();

      const loginReq = httpMock.expectOne('/api/v1/auth/student-code-login');
      expect(loginReq.request.body.placementAttemptId).toBe('673000000000000000000333');
      loginReq.flush({
        success: true,
        data: {
          token: 'jwt_ha_token',
          user: { _id: 'u1', full_name: 'Omar', role: 'STUDENT', student_ha_code: 'HA4920' }
        }
      });

      expect(navByUrlSpy).toHaveBeenCalledWith('/placement-test?showResult=true&attemptId=673000000000000000000333');
    });

    it('should redirect Google login straight to placement result when profile is already complete, and preserve returnUrl when incomplete', async () => {
      const route = TestBed.inject(ActivatedRoute);
      const router = TestBed.inject(Router);
      const httpMock = TestBed.inject(HttpTestingController);
      const navByUrlSpy = spyOn(router, 'navigateByUrl');
      const navSpy = spyOn(router, 'navigate');

      const qpObj = {
        from: 'placement-test',
        attemptId: '673000000000000000000444',
        returnUrl: '/placement-test?showResult=true&attemptId=673000000000000000000444'
      };
      (route as any).snapshot = {
        ...route.snapshot,
        queryParams: qpObj,
        queryParamMap: convertToParamMap(qpObj)
      };

      const gFixture = TestBed.createComponent(LoginPageComponent);
      const gComp = gFixture.componentInstance;
      gFixture.detectChanges();

      // Case 1: Completed profile even with signup intent returns straight to placement result
      await gComp.handleVerifiedGoogleToken('ya29.mock_access_token_valid', 'signup');
      const gReq1 = httpMock.expectOne('/api/v1/auth/google-login');
      expect(gReq1.request.body.placementAttemptId).toBe('673000000000000000000444');
      gReq1.flush({
        success: true,
        data: {
          isNewUser: false,
          isProfileCompleted: true,
          token: 'jwt_g_1',
          user: { id: 'u2', fullName: 'Sara', role: 'STUDENT', studentCode: 'HA1002' }
        }
      });
      expect(navByUrlSpy).toHaveBeenCalledWith('/placement-test?showResult=true&attemptId=673000000000000000000444');

      // Case 2: Incomplete profile forwards attemptId and returnUrl to /complete-profile
      await gComp.handleVerifiedGoogleToken('ya29.mock_access_token_new', 'signup');
      const gReq2 = httpMock.expectOne('/api/v1/auth/google-login');
      gReq2.flush({
        success: true,
        data: {
          isNewUser: true,
          isProfileCompleted: false,
          token: 'jwt_g_2',
          user: { id: 'u3', fullName: 'New Student', role: 'STUDENT' }
        }
      });
      expect(navSpy).toHaveBeenCalledWith(
        ['/complete-profile'],
        jasmine.objectContaining({
          queryParams: jasmine.objectContaining({
            attemptId: '673000000000000000000444',
            returnUrl: '/placement-test?showResult=true&attemptId=673000000000000000000444'
          })
        })
      );
    });

    it('should fall back to pending placement result in storage when returnUrl queryParam is absent', async () => {
      const router = TestBed.inject(Router);
      const httpMock = TestBed.inject(HttpTestingController);
      const authService = TestBed.inject(AuthService);
      authService.clearSession('/');
      const navByUrlSpy = spyOn(router, 'navigateByUrl');

      savePendingPlacementResult({
        attemptId: '673000000000000000000555',
        curriculum: 'EGYPTIAN',
        gradeLevel: 'SEC_3',
        academicTerm: 'TERM_1',
        score: 5,
        maxScore: 5,
        percentage: 100,
        passed: true,
        totalQuestions: 5,
        correctAnswersCount: 5
      });

      const fallbackFixture = TestBed.createComponent(LoginPageComponent);
      const fallbackComp = fallbackFixture.componentInstance;
      fallbackFixture.detectChanges();

      fallbackComp.studentHaCode.set('HA5555');
      await fallbackComp.submitStudentLogin();

      const req = httpMock.expectOne('/api/v1/auth/student-code-login');
      expect(req.request.body.placementAttemptId).toBe('673000000000000000000555');
      req.flush({
        success: true,
        data: {
          token: 'jwt_555',
          user: { _id: 'u555', full_name: 'Ali', role: 'STUDENT', student_ha_code: 'HA5555' }
        }
      });

      expect(navByUrlSpy).toHaveBeenCalledWith('/placement-test?showResult=true&attemptId=673000000000000000000555');
    });
  });
});
