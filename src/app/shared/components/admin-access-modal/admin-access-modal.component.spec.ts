import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AdminAccessModalComponent, DEV_TRUST_TOKEN_KEY } from './admin-access-modal.component';

describe('AdminAccessModalComponent', () => {
  let component: AdminAccessModalComponent;
  let fixture: ComponentFixture<AdminAccessModalComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AdminAccessModalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAccessModalComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should fetch portal status when opened in teacher mode', () => {
    component.isOpen.set(true);
    fixture.detectChanges();

    const req = httpMock.expectOne('/api/v1/auth/admin-portal-status');
    req.flush({
      success: true,
      data: { teacherCodeSet: false, teacherGoogleSet: false, devCodeSet: false }
    });
    fixture.detectChanges();

    expect(component.isTeacherFirstTimeSetup()).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('بوابة دخول المعلمة');
  });

  it('should perform one-time developer setup when devCodeSet is false and lock out resets afterward', () => {
    fixture.componentRef.setInput('portalMode', 'developer');
    component.isOpen.set(true);
    fixture.detectChanges();

    const req = httpMock.expectOne('/api/v1/auth/admin-portal-status');
    req.flush({
      success: true,
      data: { teacherCodeSet: true, teacherGoogleSet: false, devCodeSet: false }
    });
    fixture.detectChanges();

    expect(component.isDevFirstTimeSetup()).toBeTrue();
    component.accessCodeInput.set('MySecureDev#1');
    component.confirmCodeInput.set('MySecureDev#1');
    component.submitCode();

    const setupReq = httpMock.expectOne('/api/v1/auth/dev-setup-code');
    expect(setupReq.request.body.accessCode).toBe('MySecureDev#1');
    setupReq.flush({
      success: true,
      data: {
        token: 'dev_jwt_1',
        devDeviceTrustToken: 'a'.repeat(64),
        user: { _id: 'adm1', role: 'SUPER_ADMIN', full_name: 'Admin' }
      }
    });
    fixture.detectChanges();

    expect(component.isOpen()).toBeFalse();
    expect(localStorage.getItem(DEV_TRUST_TOKEN_KEY)).toBe('a'.repeat(64));
  });

  it('should enforce login-only mode for developer when devCodeSet is true', () => {
    fixture.componentRef.setInput('portalMode', 'developer');
    component.isOpen.set(true);
    fixture.detectChanges();

    const req = httpMock.expectOne('/api/v1/auth/admin-portal-status');
    req.flush({
      success: true,
      data: { teacherCodeSet: true, teacherGoogleSet: false, devCodeSet: true }
    });
    fixture.detectChanges();

    expect(component.isDevFirstTimeSetup()).toBeFalse();
    component.accessCodeInput.set('ExistingDevSecret');
    component.submitCode();

    const loginReq = httpMock.expectOne('/api/v1/auth/admin-login');
    expect(loginReq.request.body.accessCode).toBe('ExistingDevSecret');
    expect(loginReq.request.body.mode).toBe('dev');
    loginReq.flush({
      success: true,
      data: {
        token: 'dev_jwt_2',
        devDeviceTrustToken: 'b'.repeat(64),
        user: { _id: 'adm1', role: 'SUPER_ADMIN', full_name: 'Admin' }
      }
    });
    expect(localStorage.getItem(DEV_TRUST_TOKEN_KEY)).toBe('b'.repeat(64));
  });

  it('should automatically sign developer in without password prompt on a trusted device', () => {
    localStorage.setItem(DEV_TRUST_TOKEN_KEY, 'c'.repeat(64));
    fixture.componentRef.setInput('portalMode', 'developer');
    component.isOpen.set(true);
    fixture.detectChanges();

    const statusReq = httpMock.expectOne('/api/v1/auth/admin-portal-status');
    statusReq.flush({
      success: true,
      data: { teacherCodeSet: true, teacherGoogleSet: false, devCodeSet: true }
    });

    const autoReq = httpMock.expectOne('/api/v1/auth/dev-device-login');
    expect(autoReq.request.body.deviceTrustToken).toBe('c'.repeat(64));
    expect(autoReq.request.body.deviceUuid).toBeTruthy();
    autoReq.flush({
      success: true,
      data: {
        token: 'dev_trusted_jwt',
        portalScope: 'dev',
        user: { _id: 'adm1', role: 'SUPER_ADMIN', full_name: 'Admin' }
      }
    });
    fixture.detectChanges();

    expect(component.isOpen()).toBeFalse();
  });

  it('should clear invalid trust token and fall back to password form when device verification fails', () => {
    localStorage.setItem(DEV_TRUST_TOKEN_KEY, 'd'.repeat(64));
    fixture.componentRef.setInput('portalMode', 'developer');
    component.isOpen.set(true);
    fixture.detectChanges();

    const statusReq = httpMock.expectOne('/api/v1/auth/admin-portal-status');
    statusReq.flush({
      success: true,
      data: { teacherCodeSet: true, teacherGoogleSet: false, devCodeSet: true }
    });

    const autoReq = httpMock.expectOne('/api/v1/auth/dev-device-login');
    autoReq.flush({ message: 'Device not trusted' }, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();

    expect(localStorage.getItem(DEV_TRUST_TOKEN_KEY)).toBeNull();
    expect(component.isOpen()).toBeTrue();
    expect(component.isAutoAuthenticatingDev()).toBeFalse();
  });
});
