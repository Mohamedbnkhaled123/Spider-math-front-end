import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { of } from 'rxjs';

import { StudentProfileCompletionComponent } from './student-profile-completion.component';
import { AuthService } from '../../../core/auth/auth.service';
import { PublicDiscoveryService } from '../../../core/services/public-discovery.service';
import { clearPendingPlacementResult } from '../../../core/utils/pending-placement.util';

describe('StudentProfileCompletionComponent', () => {
  let component: StudentProfileCompletionComponent;
  let fixture: ComponentFixture<StudentProfileCompletionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StudentProfileCompletionComponent,
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

    fixture = TestBed.createComponent(StudentProfileCompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the StudentProfileCompletionComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should enable governorate validation when country is EG', () => {
    component.country.set('EG');
    expect(component.isEgypt()).toBeTrue();
  });

  it('should disable governorate requirement when country is SA', () => {
    component.country.set('SA');
    expect(component.isEgypt()).toBeFalse();
  });

  it('should submit placementAttemptId and return directly to placement result when originated from placement test', () => {
    clearPendingPlacementResult();
    const authService = TestBed.inject(AuthService);
    const discoveryService = TestBed.inject(PublicDiscoveryService);
    const router = TestBed.inject(Router);
    const route = TestBed.inject(ActivatedRoute);

    authService.setSession('jwt_incomplete', {
      _id: 'usr_99',
      full_name: 'Student Placement',
      email: 'student@spidermath.edu',
      role: 'STUDENT'
    });

    const qp = {
      from: 'placement-test',
      attemptId: '673000000000000000000099',
      curriculum: 'EGYPTIAN',
      gradeLevel: 'SEC_3',
      academicTerm: 'TERM_1',
      returnUrl: '/placement-test?showResult=true&attemptId=673000000000000000000099'
    };
    (route as any).snapshot = {
      ...route.snapshot,
      queryParams: qp,
      queryParamMap: convertToParamMap(qp)
    };

    const navByUrlSpy = spyOn(router, 'navigateByUrl');
    const completeSpy = spyOn(discoveryService, 'completeStudentProfile').and.returnValue(of({
      studentHaCode: 'HA9099',
      token: 'jwt_completed',
      user: {
        _id: 'usr_99',
        full_name: 'Ahmed Khaled Ali',
        email: 'ha9099@spidermath.edu',
        role: 'STUDENT',
        student_ha_code: 'HA9099',
        curriculum: 'EGYPTIAN',
        grade_level: 'SEC_3',
        academic_term: 'TERM_1'
      }
    }));

    const pFixture = TestBed.createComponent(StudentProfileCompletionComponent);
    const pComp = pFixture.componentInstance;
    pFixture.detectChanges();

    pComp.fullName.set('Ahmed Khaled Ali');
    pComp.phone.set('01012345678');
    pComp.parentPhone.set('01112345678');
    pComp.country.set('EG');
    pComp.governorate.set('CAIRO');
    pComp.attemptId.set('673000000000000000000099');

    pComp.submitProfile();

    expect(completeSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      placementAttemptId: '673000000000000000000099'
    }));

    pComp.goToInactivePortal();
    expect(navByUrlSpy).toHaveBeenCalledWith('/placement-test?showResult=true&attemptId=673000000000000000000099');
    clearPendingPlacementResult();
  });
});
