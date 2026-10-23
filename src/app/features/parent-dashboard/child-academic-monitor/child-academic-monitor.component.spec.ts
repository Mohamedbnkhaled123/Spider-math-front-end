import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ChildAcademicMonitorComponent } from './child-academic-monitor.component';

describe('ChildAcademicMonitorComponent', () => {
  let component: ChildAcademicMonitorComponent;
  let fixture: ComponentFixture<ChildAcademicMonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildAcademicMonitorComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChildAcademicMonitorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('childId', 'student-test-01');
    fixture.detectChanges();
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
