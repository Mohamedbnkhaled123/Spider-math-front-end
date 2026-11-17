import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AdminAccessModalComponent } from './admin-access-modal.component';

describe('AdminAccessModalComponent', () => {
  let component: AdminAccessModalComponent;
  let fixture: ComponentFixture<AdminAccessModalComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
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
    expect(setupReq.request.body).toEqual({ accessCode: 'MySecureDev#1' });
    setupReq.flush({
      success: true,
      data: { token: 'dev_jwt_1', user: { _id: 'adm1', role: 'SUPER_ADMIN', full_name: 'Admin' } }
    });
    fixture.detectChanges();

    expect(component.isOpen()).toBeFalse();
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
    expect(loginReq.request.body).toEqual({ accessCode: 'ExistingDevSecret', mode: 'dev' });
    loginReq.flush({
      success: true,
      data: { token: 'dev_jwt_2', user: { _id: 'adm1', role: 'SUPER_ADMIN', full_name: 'Admin' } }
    });
  });
});
