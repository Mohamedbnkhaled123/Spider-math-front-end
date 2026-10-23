import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { StudentOverviewComponent } from './student-overview.component';

describe('StudentOverviewComponent', () => {
  let component: StudentOverviewComponent;
  let fixture: ComponentFixture<StudentOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentOverviewComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle academic terms correctly', () => {
    expect(component.selectedTerm()).toBe('TERM_1');
    component.setTerm('TERM_2');
    expect(component.selectedTerm()).toBe('TERM_2');
  });

  it('should compute overall watch percentage', () => {
    const pct = component.overallWatchPercentage();
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(100);
  });

  it('should toggle notifications dropdown', () => {
    expect(component.isNotificationsOpen()).toBeFalse();
    component.toggleNotifications();
    expect(component.isNotificationsOpen()).toBeTrue();
  });
});
