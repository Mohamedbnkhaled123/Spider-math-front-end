import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { ChildAcademicMonitorComponent } from './child-academic-monitor.component';

describe('ChildAcademicMonitorComponent', () => {
  let component: ChildAcademicMonitorComponent;
  let fixture: ComponentFixture<ChildAcademicMonitorComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildAcademicMonitorComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ChildAcademicMonitorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('childId', 'student-test-01');
    fixture.detectChanges();

    const req = httpTesting.expectOne('/api/v1/parent/child/student-test-01/full-report');
    req.flush({
      success: true,
      data: {
        student: { studentCode: 'HA4920', fullName: 'أحمد محمد علي', totalXp: 450 },
        haCode: 'HA4920',
        presence: { isOnline: true },
        attendanceMetrics: { overallWatchPercentage: 88 },
        units: [{ unitId: 'u1', titleAr: 'الجبر', completedLecturesCount: 2, totalLecturesCount: 4, isCompleted: false, watchPercentage: 50, lectures: [] }],
        gradedAssessments: [{ submissionId: 's1', titleAr: 'امتحان 1', score: 10, totalPoints: 10 }]
      }
    });
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create the academic monitor component', () => {
    expect(component).toBeTruthy();
  });

  it('should set report when initialized with mock fallback', () => {
    expect(component.report()).toBeTruthy();
    expect(component.report()?.haCode).toBe('HA4920');
  });

  it('should have online presence status and units metrics', () => {
    const rep = component.report();
    expect(rep?.presence.isOnline).toBeTrue();
    expect(rep?.units.length).toBeGreaterThan(0);
    expect(rep?.submissions.length).toBeGreaterThan(0);
  });
});
