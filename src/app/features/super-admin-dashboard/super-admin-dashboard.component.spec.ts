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

  it('should render desktop workspace navigation bar as sticky with z-layer-header and backdrop blur', () => {
    const hostEl: HTMLElement = fixture.nativeElement;
    const desktopBar = hostEl.querySelector('.spider-rim-glass-card.sticky');
    expect(desktopBar).toBeTruthy();
    expect(desktopBar?.classList.contains('sticky')).toBeTrue();
    expect(desktopBar?.classList.contains('top-20')).toBeTrue();
    expect(desktopBar?.classList.contains('z-layer-header')).toBeTrue();
    expect(desktopBar?.classList.contains('backdrop-blur-xl')).toBeTrue();
  });
});
