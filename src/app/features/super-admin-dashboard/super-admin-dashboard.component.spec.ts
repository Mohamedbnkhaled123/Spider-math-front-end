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

  it('should render toast notification with z-layer-toast above modals and opaque glass surface', () => {
    component.triggerToast('تم حذف السؤال', 'warning');
    fixture.detectChanges();

    const hostEl: HTMLElement = fixture.nativeElement;
    const toastLayer = hostEl.querySelector('.z-layer-toast') as HTMLElement | null;
    expect(toastLayer).toBeTruthy();
    expect(toastLayer?.classList.contains('z-layer-modal')).toBeFalse();
    expect(toastLayer?.textContent).toContain('تم حذف السؤال');

    const card = toastLayer?.querySelector('.bg-surface-card\\/95');
    expect(card).toBeTruthy();
    component.toastMessage.set(null);
  });
});
