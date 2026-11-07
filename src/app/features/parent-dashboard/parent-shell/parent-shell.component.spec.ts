import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { ParentShellComponent } from './parent-shell.component';

describe('ParentShellComponent', () => {
  let component: ParentShellComponent;
  let fixture: ComponentFixture<ParentShellComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentShellComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ParentShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const req = httpTesting.expectOne('/api/v1/parent/children-list');
    req.flush({
      success: true,
      data: {
        children: [
          { studentId: 'child-ahmed-01', fullName: 'أحمد محمد علي', studentCode: 'HA1001' },
          { studentId: 'child-sara-02', fullName: 'سارة محمد علي', studentCode: 'HA1002' }
        ]
      }
    });
    fixture.detectChanges();

    const reportReq = httpTesting.expectOne('/api/v1/parent/child/child-ahmed-01/full-report');
    reportReq.flush({
      success: true,
      data: {
        student: { studentCode: 'HA1001', fullName: 'أحمد محمد علي', totalXp: 100 },
        presence: { isOnline: false },
        attendanceMetrics: { overallWatchPercentage: 70 },
        units: [],
        gradedAssessments: []
      }
    });
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create the parent shell component', () => {
    expect(component).toBeTruthy();
  });

  it('should load linked children and select the first child by default', () => {
    expect(component.linkedChildren().length).toBeGreaterThan(0);
    expect(component.selectedChildId()).toBe('child-ahmed-01');
    expect(component.selectedChild()?.fullName).toBe('أحمد محمد علي');
  });

  it('should allow switching between children', () => {
    component.selectChild('child-sara-02');
    fixture.detectChanges();
    const saraReq = httpTesting.expectOne('/api/v1/parent/child/child-sara-02/full-report');
    saraReq.flush({
      success: true,
      data: {
        student: { studentCode: 'HA1002', fullName: 'سارة محمد علي', totalXp: 200 },
        presence: { isOnline: true },
        attendanceMetrics: { overallWatchPercentage: 90 },
        units: [],
        gradedAssessments: []
      }
    });
    fixture.detectChanges();
    expect(component.selectedChildId()).toBe('child-sara-02');
    expect(component.selectedChild()?.fullName).toBe('سارة محمد علي');
  });

  it('should toggle link child modal', () => {
    expect(component.isLinkModalOpen()).toBeFalse();
    component.openLinkModal();
    expect(component.isLinkModalOpen()).toBeTrue();
    component.closeLinkModal();
    expect(component.isLinkModalOpen()).toBeFalse();
  });
});
