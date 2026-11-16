import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SuperAdminDashboardComponent } from './super-admin-dashboard.component';

describe('SuperAdminDashboardComponent', () => {
  let component: SuperAdminDashboardComponent;
  let fixture: ComponentFixture<SuperAdminDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperAdminDashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SuperAdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the admin dashboard component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize admin signals properly as arrays', () => {
    expect(Array.isArray(component.pendingDevices())).toBeTrue();
    expect(Array.isArray(component.pendingGrading())).toBeTrue();
    expect(Array.isArray(component.unitsList())).toBeTrue();
    expect(Array.isArray(component.leadsList())).toBeTrue();
  });

  it('should control desktop tools and notifications flyouts cleanly', () => {
    expect(component.isDesktopToolsOpen()).toBeFalse();
    expect(component.isDesktopNotificationsOpen()).toBeFalse();

    // Toggle tools open
    component.toggleDesktopTools();
    expect(component.isDesktopToolsOpen()).toBeTrue();
    expect(component.isDesktopNotificationsOpen()).toBeFalse();

    // Toggle notifications open (must close tools)
    component.toggleDesktopNotifications();
    expect(component.isDesktopToolsOpen()).toBeFalse();
    expect(component.isDesktopNotificationsOpen()).toBeTrue();

    // Close flyouts
    component.closeDesktopFlyouts();
    expect(component.isDesktopToolsOpen()).toBeFalse();
    expect(component.isDesktopNotificationsOpen()).toBeFalse();
  });

  it('should render desktop workspace navigation bar with comfortable clearance and relative z-20 layout', () => {
    const hostEl: HTMLElement = fixture.nativeElement;
    const desktopBar = hostEl.querySelector('main .spider-rim-glass-card');
    expect(desktopBar).toBeTruthy();
    expect(desktopBar?.classList.contains('relative')).toBeTrue();
    expect(desktopBar?.classList.contains('z-20')).toBeTrue();
    expect(desktopBar?.classList.contains('sticky')).toBeFalse();
  });
});
