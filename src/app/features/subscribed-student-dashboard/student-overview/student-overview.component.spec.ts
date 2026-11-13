import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { StudentOverviewComponent } from './student-overview.component';
import { AuthService } from '../../../core/auth/auth.service';

describe('StudentOverviewComponent', () => {
  let component: StudentOverviewComponent;
  let fixture: ComponentFixture<StudentOverviewComponent>;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [StudentOverviewComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(StudentOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
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

  it('should open profile modal and select new avatar', () => {
    authService.setSession('test_token', {
      _id: 'std_123',
      full_name: 'Mohammed Khaled',
      email: 'mohammed@spidermath.edu',
      role: 'STUDENT',
      avatar_url: '/assets/avatars/student-avatar-01.webp'
    });

    component.openProfileModal();
    expect(component.isProfileModalOpen()).toBeTrue();
    expect(component.editFullName()).toBe('Mohammed Khaled');
    expect(component.editAvatarUrl()).toBe('/assets/avatars/student-avatar-01.webp');

    // Select a different preset avatar
    component.selectAvatar('/assets/avatars/student-avatar-07.webp');
    expect(component.editAvatarUrl()).toBe('/assets/avatars/student-avatar-07.webp');
    expect(component.isCustomUploadedAvatar()).toBeFalse();

    component.closeProfileModal();
    expect(component.isProfileModalOpen()).toBeFalse();
  });

  it('should send both avatarUrl and avatar_url on saveProfile and update auth session', () => {
    authService.setSession('test_token', {
      _id: 'std_456',
      full_name: 'Sara Omar',
      email: 'sara@spidermath.edu',
      role: 'STUDENT',
      avatar_url: '/assets/avatars/student-avatar-02.webp'
    });

    component.openProfileModal();
    component.selectAvatar('/assets/avatars/student-avatar-11.webp');

    component.saveProfile();
    expect(component.isSavingProfile()).toBeTrue();

    const req = httpMock.expectOne('/api/v1/auth/profile');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.avatarUrl).toBe('/assets/avatars/student-avatar-11.webp');
    expect(req.request.body.avatar_url).toBe('/assets/avatars/student-avatar-11.webp');

    req.flush({
      success: true,
      data: {
        user: {
          fullName: 'Sara Omar',
          avatarUrl: '/assets/avatars/student-avatar-11.webp',
          avatar_url: '/assets/avatars/student-avatar-11.webp'
        }
      }
    });

    expect(component.isSavingProfile()).toBeFalse();
    expect(authService.currentUser()?.avatar_url).toBe('/assets/avatars/student-avatar-11.webp');
    expect(authService.currentUser()?.avatarUrl).toBe('/assets/avatars/student-avatar-11.webp');
  });

  it('should render modal with pinned header, scrollable body, and pinned footer when open', () => {
    component.openProfileModal();
    fixture.detectChanges();

    const modalEl: HTMLElement = fixture.nativeElement;
    // Check backdrop has overflow-y-auto
    const backdrop = modalEl.querySelector('[role="dialog"]') as HTMLElement;
    expect(backdrop).toBeTruthy();
    expect(backdrop.classList.contains('overflow-y-auto')).toBeTrue();

    // Check card has flex-col, overflow-hidden and max-h limit
    const card = backdrop.querySelector('.spider-rim-glass-card') as HTMLElement;
    expect(card).toBeTruthy();
    expect(card.classList.contains('flex-col')).toBeTrue();
    expect(card.classList.contains('overflow-hidden')).toBeTrue();

    // Check scrollable body has overflow-y-auto and overscroll-contain
    const scrollableBody = card.querySelector('.overflow-y-auto.overscroll-contain') as HTMLElement;
    expect(scrollableBody).toBeTruthy();
    expect(scrollableBody.classList.contains('flex-1')).toBeTrue();

    // Check pinned footer with action buttons
    const footer = card.querySelector('.shrink-0.border-t') as HTMLElement;
    expect(footer).toBeTruthy();
  });
});
