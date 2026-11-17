import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService, IUserDto } from './auth.service';
import { ModalNavigationService } from '../services/modal-navigation.service';

describe('AuthService Avatar Normalization & Persistence', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideRouter([])
      ]
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize and be created', () => {
    expect(service).toBeTruthy();
  });

  it('should normalize avatarUrl and avatar_url in setSession when only avatar_url is provided', () => {
    const mockUser: IUserDto = {
      _id: 'test_student_1',
      full_name: 'Test Student',
      email: 'student@spidermath.edu',
      role: 'STUDENT',
      avatar_url: '/assets/avatars/student-avatar-05.webp'
    };

    service.setSession('mock_token_123', mockUser);

    const currentUser = service.currentUser();
    expect(currentUser).toBeTruthy();
    expect(currentUser?.avatar_url).toBe('/assets/avatars/student-avatar-05.webp');
    expect(currentUser?.avatarUrl).toBe('/assets/avatars/student-avatar-05.webp');

    // Verify localStorage persistence
    const saved = JSON.parse(localStorage.getItem('spider_math_user') || '{}');
    expect(saved.avatar_url).toBe('/assets/avatars/student-avatar-05.webp');
    expect(saved.avatarUrl).toBe('/assets/avatars/student-avatar-05.webp');
  });

  it('should normalize avatarUrl and avatar_url in setSession when only avatarUrl is provided', () => {
    const mockUser: any = {
      _id: 'test_student_2',
      full_name: 'Test Student 2',
      email: 'student2@spidermath.edu',
      role: 'STUDENT',
      avatarUrl: '/assets/avatars/student-avatar-08.webp'
    };

    service.setSession('mock_token_456', mockUser);

    const currentUser = service.currentUser();
    expect(currentUser).toBeTruthy();
    expect(currentUser?.avatar_url).toBe('/assets/avatars/student-avatar-08.webp');
    expect(currentUser?.avatarUrl).toBe('/assets/avatars/student-avatar-08.webp');
  });

  it('should synchronize both avatar fields and persist to localStorage on updateCurrentUser', () => {
    const initialUser: IUserDto = {
      _id: 'test_student_3',
      full_name: 'Ahmed Student',
      email: 'ahmed@spidermath.edu',
      role: 'STUDENT',
      avatar_url: '/assets/avatars/student-avatar-01.webp',
      avatarUrl: '/assets/avatars/student-avatar-01.webp'
    };
    service.setSession('token_789', initialUser);

    // Update with avatar_url
    service.updateCurrentUser({ avatar_url: '/assets/avatars/student-avatar-12.webp' });

    let updated = service.currentUser();
    expect(updated?.avatar_url).toBe('/assets/avatars/student-avatar-12.webp');
    expect(updated?.avatarUrl).toBe('/assets/avatars/student-avatar-12.webp');

    let stored = JSON.parse(localStorage.getItem('spider_math_user') || '{}');
    expect(stored.avatar_url).toBe('/assets/avatars/student-avatar-12.webp');
    expect(stored.avatarUrl).toBe('/assets/avatars/student-avatar-12.webp');

    // Update with avatarUrl
    service.updateCurrentUser({ avatarUrl: '/assets/avatars/student-avatar-03.webp' });

    updated = service.currentUser();
    expect(updated?.avatar_url).toBe('/assets/avatars/student-avatar-03.webp');
    expect(updated?.avatarUrl).toBe('/assets/avatars/student-avatar-03.webp');

    stored = JSON.parse(localStorage.getItem('spider_math_user') || '{}');
    expect(stored.avatar_url).toBe('/assets/avatars/student-avatar-03.webp');
    expect(stored.avatarUrl).toBe('/assets/avatars/student-avatar-03.webp');
  });

  it('should restore session from localStorage with normalized avatar fields across page refresh / reload', () => {
    localStorage.setItem('spider_math_jwt', 'persisted_jwt_token');
    localStorage.setItem(
      'spider_math_user',
      JSON.stringify({
        _id: 'restored_student',
        full_name: 'Restored Student',
        email: 'restored@spidermath.edu',
        role: 'STUDENT',
        avatar_url: '/assets/avatars/student-avatar-09.webp'
      })
    );

    // Construct a new instance to simulate reload
    const reloadedService = TestBed.runInInjectionContext(() => new AuthService());

    expect(reloadedService.isAuthenticated()).toBeTrue();
    expect(reloadedService.currentUser()?.avatar_url).toBe('/assets/avatars/student-avatar-09.webp');
    expect(reloadedService.currentUser()?.avatarUrl).toBe('/assets/avatars/student-avatar-09.webp');
  });

  it('should wait for modal history settle, replaceUrl to landing page, and preserve trusted dev device storage on logout', async () => {
    const router = TestBed.inject(Router);
    const modalNav = TestBed.inject(ModalNavigationService);
    const navSpy = spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));
    spyOn(modalNav, 'isSettling').and.returnValue(true);
    spyOn(modalNav, 'whenSettled').and.returnValue(Promise.resolve());

    localStorage.setItem('spider_math_device_uuid', 'SM-DEV-123');
    localStorage.setItem('spider_math_dev_trust_token', 'trust_token_abc');
    service.setSession('jwt_active', {
      _id: 'std_1',
      full_name: 'Student One',
      email: 'std@spidermath.edu',
      role: 'STUDENT'
    });

    service.clearSession('/');
    expect(service.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('spider_math_jwt')).toBeNull();
    expect(localStorage.getItem('spider_math_device_uuid')).toBe('SM-DEV-123');
    expect(localStorage.getItem('spider_math_dev_trust_token')).toBe('trust_token_abc');

    await Promise.resolve();
    expect(navSpy).toHaveBeenCalledWith('/', { replaceUrl: true });
  });
});
