import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPageComponent } from './login-page.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  beforeEach(async () => {
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
});
