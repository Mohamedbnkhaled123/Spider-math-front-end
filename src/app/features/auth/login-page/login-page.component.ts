import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService, IUserDto } from '../../../core/auth/auth.service';
import { DeviceFingerprintService } from '../../../core/auth/device-fingerprint.service';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import {
  CANONICAL_CURRICULUM_TREE,
  CurriculumCode,
  AcademicTermCode
} from '../../../core/constants/curriculum-tree.constant';
import { EGYPT_GOVERNORATES } from '../../../core/constants/governorates.constant';
import {
  validatePhoneNumber,
  arePhoneNumbersIdentical,
  getPhonePlaceholderByCountry
} from '../../../core/utils/phone-validator.util';
import { LoginTab } from './login-page.models';

declare const google: any;

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly fingerprintService = inject(DeviceFingerprintService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  // Active navigation tab
  readonly activeTab = signal<LoginTab>('student');
  readonly studentAuthMode = signal<'login' | 'signup'>('login');

  // Request & Feedback States
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Real Google OAuth Signals
  readonly isGoogleAuthenticating = signal<boolean>(false);
  readonly googleAuthErrorMessage = signal<string | null>(null);
  readonly unregisteredGoogleEmail = signal<string | null>(null);

  // Student Code Login Models
  readonly studentHaCode = signal<string>('');
  readonly parentPhone = signal<string>('');
  readonly parentStudentCode = signal<string>('');
  readonly adminPin = signal<string>('');

  // =========================================================================
  // Direct Registration Form Signals (Non-Google Option)
  // =========================================================================
  readonly regFullName = signal<string>('');
  readonly regEmail = signal<string>('');
  readonly regCountry = signal<string>('EG');
  readonly regPhone = signal<string>('');
  readonly regParentPhone = signal<string>('');
  readonly regCurriculum = signal<CurriculumCode>('EGYPTIAN');
  readonly regGradeLevel = signal<string>('SEC_3');
  readonly regAcademicTerm = signal<AcademicTermCode>('TERM_1');
  readonly regGovernorate = signal<string>('CAIRO');

  // Constants & Computed for Direct Registration
  readonly curriculumTree = CANONICAL_CURRICULUM_TREE;
  readonly egyptGovernorates = EGYPT_GOVERNORATES;

  readonly isRegEgypt = computed<boolean>(() => this.regCountry() === 'EG');

  readonly regPhonePlaceholder = computed<string>(() =>
    getPhonePlaceholderByCountry(this.regCountry())
  );

  readonly regAvailableGrades = computed(() => {
    const curr = this.curriculumTree.find(c => c.code === this.regCurriculum());
    return curr?.grades ?? this.curriculumTree[0].grades;
  });

  ngOnInit(): void {
    if (this.router.url.includes('parent')) {
      this.activeTab.set('parent');
    }
  }

  setTab(tab: LoginTab): void {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.googleAuthErrorMessage.set(null);
    this.unregisteredGoogleEmail.set(null);
  }

  setStudentAuthMode(mode: 'login' | 'signup'): void {
    this.studentAuthMode.set(mode);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.googleAuthErrorMessage.set(null);
    this.unregisteredGoogleEmail.set(null);
  }

  onRegCurriculumChange(code: CurriculumCode): void {
    this.regCurriculum.set(code);
    const grades = this.regAvailableGrades();
    if (grades.length > 0) {
      this.regGradeLevel.set(grades[0].code);
    }
  }

  // =========================================================================
  // Direct Student Registration (Form-based, Optional Google)
  // =========================================================================
  async submitDirectRegistration(): Promise<void> {
    const name = this.regFullName().trim();
    const stPhone = this.regPhone().trim();
    const prPhone = this.regParentPhone().trim();
    const country = this.regCountry();

    // 1. Full name validation
    if (!name || name.length < 3) {
      this.errorMessage.set('يرجى كتابة اسم الطالب ثلاثياً بشكل صحيح');
      return;
    }

    // 2. Student phone validation
    const stVal = validatePhoneNumber(stPhone, country);
    if (!stVal.isValid) {
      this.errorMessage.set(`هاتف الطالب: ${stVal.messageAr}`);
      return;
    }

    // 3. Parent phone validation
    const prVal = validatePhoneNumber(prPhone, country);
    if (!prVal.isValid) {
      this.errorMessage.set(`هاتف ولي الأمر: ${prVal.messageAr}`);
      return;
    }

    // 4. Strict constraint: Parent phone !== Student phone
    if (arePhoneNumbersIdentical(stPhone, prPhone, country)) {
      this.errorMessage.set(
        'رقم هاتف ولي الأمر لا يمكن أن يكون مطابقاً لرقم هاتف الطالب نهائياً. يرجى إدخال رقم مختلف لولي الأمر.'
      );
      return;
    }

    // 5. Governorate check for Egypt
    if (this.isRegEgypt() && !this.regGovernorate()) {
      this.errorMessage.set('يرجى اختيار المحافظة للطلاب المقيمين في مصر');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const deviceIdentity = await this.fingerprintService.getOrCreateDeviceIdentity();

    this.http.post<{
      success: boolean;
      data: {
        studentCode: string;
        token: string;
        user: any;
      };
    }>('/api/v1/auth/register-student-direct', {
      fullName: name,
      email: this.regEmail().trim() || undefined,
      phone: stPhone,
      parentPhone: prPhone,
      curriculum: this.regCurriculum(),
      gradeLevel: this.regGradeLevel(),
      academicTerm: this.regAcademicTerm(),
      country,
      governorate: this.isRegEgypt() ? this.regGovernorate() : null,
      deviceUuid: deviceIdentity.deviceUuid,
      deviceType: deviceIdentity.deviceType,
      browserInfo: deviceIdentity.browserInfo
    }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        const data = res.data;
        if (data?.token && data?.user) {
          const userPayload: IUserDto = {
            _id: data.user._id || data.user.id,
            student_ha_code: data.user.student_ha_code || data.user.studentCode,
            full_name: data.user.full_name || data.user.fullName,
            email: data.user.email,
            phone: data.user.phone,
            parent_phone: data.user.parent_phone || data.user.parentPhone,
            country: data.user.country,
            avatar_url: data.user.avatar_url || data.user.avatarUrl,
            role: data.user.role || 'STUDENT',
            curriculum: data.user.curriculum,
            grade_level: data.user.grade_level || data.user.gradeLevel,
            academic_term: data.user.academic_term || data.user.academicTerm,
            governorate: data.user.governorate,
            total_xp: data.user.total_xp ?? data.user.totalXp ?? 50,
            has_active_subscription: true
          };
          this.authService.setSession(data.token, userPayload);
          this.router.navigateByUrl('/student');
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          this.extractErrorMessage(
            err,
            'حدث خطأ أثناء تسجيل حساب الطالب. يرجى مراجعة البيانات والمحاولة مجدداً.'
          )
        );
      }
    });
  }

  // =========================================================================
  // Authentic Google Identity Services (GIS) OAuth Popup Flow
  // =========================================================================
  triggerGoogleOAuth(intent: 'login' | 'signup'): void {
    this.errorMessage.set(null);
    this.googleAuthErrorMessage.set(null);
    this.unregisteredGoogleEmail.set(null);

    const win = window as any;
    if (typeof win.google === 'undefined' || !win.google?.accounts?.oauth2) {
      this.googleAuthErrorMessage.set(
        'جاري الاتصال بخدمات Google... يرجى الانتظار بضع ثوانٍ أو التحقق من اتصال الإنترنت ثم إعادة المحاولة.'
      );
      return;
    }

    try {
      const client = win.google.accounts.oauth2.initTokenClient({
        client_id: '157492277386-n7dudqv4devn897v381bpvf8b101bi8s.apps.googleusercontent.com',
        scope: 'email profile openid',
        prompt: 'select_account',
        callback: (response: any) => {
          if (response?.error) {
            console.error('Google OAuth token client error:', response);
            if (response.error !== 'popup_closed_by_user') {
              if (response.error === 'origin_mismatch' || String(response.error).includes('origin')) {
                this.googleAuthErrorMessage.set(
                  'تم حظر تسجيل الدخول بواسطة Google (origin_mismatch). يجب تشغيل المنصة على المنفذ 4200 المصرح به أو إضافة المنفذ الحالي في Google Cloud Console.'
                );
              } else {
                this.googleAuthErrorMessage.set(`تعذر استكمال الاتصال بحساب Google (${response.error})`);
              }
            }
            return;
          }

          if (response?.access_token) {
            this.handleVerifiedGoogleToken(response.access_token, intent);
          }
        }
      });

      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err: any) {
      console.error('Failed to trigger Google OAuth popup:', err);
      this.googleAuthErrorMessage.set('حدث خطأ أثناء فتح نافذة اختيار حساب Google: ' + (err?.message || ''));
    }
  }

  async handleVerifiedGoogleToken(accessToken: string, intent: 'login' | 'signup'): Promise<void> {
    this.isGoogleAuthenticating.set(true);
    this.googleAuthErrorMessage.set(null);
    this.unregisteredGoogleEmail.set(null);

    const deviceIdentity = await this.fingerprintService.getOrCreateDeviceIdentity();

    this.http.post<{
      success: boolean;
      data: {
        isNewUser: boolean;
        isProfileCompleted: boolean;
        isPendingApproval?: boolean;
        token: string;
        user: any;
      };
    }>('/api/v1/auth/google-login', {
      idToken: accessToken,
      deviceUuid: deviceIdentity.deviceUuid,
      deviceType: deviceIdentity.deviceType,
      browserInfo: deviceIdentity.browserInfo,
      intent
    }).subscribe({
      next: (res) => {
        this.isGoogleAuthenticating.set(false);
        const data = res.data;

        if (data.isPendingApproval) {
          this.googleAuthErrorMessage.set('هذا الجهاز غير معتمد بعد، وهو قيد المراجعة لدى م. هبة عبد الوهاب.');
          return;
        }

        if (data.token && data.user) {
          const userPayload: IUserDto = {
            _id: data.user.id || data.user._id,
            student_ha_code: data.user.studentCode || data.user.student_code,
            full_name: data.user.fullName || data.user.full_name,
            email: data.user.email,
            phone: data.user.phone,
            role: data.user.role || 'STUDENT',
            curriculum: data.user.curriculum,
            grade_level: data.user.gradeLevel || data.user.grade_level,
            academic_term: data.user.academicTerm || data.user.academic_term,
            governorate: data.user.governorate,
            total_xp: data.user.totalXp ?? 0,
            has_active_subscription: !!data.user.has_active_subscription
          };

          this.authService.setSession(data.token, userPayload);

          // If signup intent OR profile not completed -> Redirect to Complete Profile!
          if (intent === 'signup' || !data.isProfileCompleted) {
            this.router.navigate(['/complete-profile'], {
              queryParams: {
                fullName: data.user.fullName || data.user.full_name || ''
              }
            });
          } else {
            // Already registered & profile completed
            const target = data.user.has_active_subscription ? '/student' : '/inactive-student-portal';
            this.router.navigateByUrl(target);
          }
        }
      },
      error: (err) => {
        this.isGoogleAuthenticating.set(false);
        if (err.status === 404 && intent === 'login') {
          this.unregisteredGoogleEmail.set('unregistered');
          this.googleAuthErrorMessage.set(
            'هذا الحساب غير مسجل في المنصة مسبقاً. يرجى إنشاء حساب جديد كطالب أولاً.'
          );
        } else {
          this.googleAuthErrorMessage.set(
            this.extractErrorMessage(err, 'حدث خطأ أثناء التحقق من حساب Google. يرجى إعادة المحاولة.')
          );
        }
      }
    });
  }

  switchToSignUpAndTriggerGoogle(): void {
    this.studentAuthMode.set('signup');
    this.googleAuthErrorMessage.set(null);
    this.unregisteredGoogleEmail.set(null);
    this.triggerGoogleOAuth('signup');
  }

  // =========================================================================
  // Student HA Code Login
  // =========================================================================
  async submitStudentLogin(): Promise<void> {
    const code = this.studentHaCode().trim().toUpperCase();
    if (!code) {
      this.errorMessage.set('يرجى إدخال كود الطالب الخاص بك (HAxxxx)');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const deviceIdentity = await this.fingerprintService.getOrCreateDeviceIdentity();

    this.http.post<{ success: boolean; data: { token: string; user: any } }>(
      '/api/v1/auth/student-code-login',
      {
        student_ha_code: code,
        deviceUuid: deviceIdentity.deviceUuid
      }
    ).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res?.data?.token && res?.data?.user) {
          this.authService.setSession(res.data.token, res.data.user);
          const target = res.data.user.has_active_subscription ? '/student' : '/inactive-student-portal';
          this.router.navigateByUrl(target);
        } else {
          this.errorMessage.set('كود الطالب غير صحيح أو غير مسجل في المنصة. يرجى التأكد من الكود أو إنشاء حساب جديد.');
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          this.extractErrorMessage(
            err,
            'كود الطالب غير صحيح أو غير مسجل في المنصة. يرجى التأكد من الكود أو إنشاء حساب جديد.'
          )
        );
      }
    });
  }

  // =========================================================================
  // Parent Login
  // =========================================================================
  async submitParentLogin(): Promise<void> {
    const phone = this.parentPhone().trim();
    const code = this.parentStudentCode().trim().toUpperCase();

    if (!phone || !code) {
      this.errorMessage.set('يرجى إدخال رقم هاتف ولي الأمر وكود الطالب معاً');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const deviceIdentity = await this.fingerprintService.getOrCreateDeviceIdentity();

    this.http.post<{ success: boolean; data: any }>(
      '/api/v1/auth/parent-activate-login',
      {
        parentPhone: phone,
        studentCode: code,
        deviceUuid: deviceIdentity.deviceUuid
      }
    ).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res?.data?.token) {
          this.authService.setSession(res.data.token, {
            _id: res.data.parent?.id || 'parent_user',
            full_name: res.data.parent?.fullName || 'ولي أمر الطالب',
            email: 'parent@spidermath.com',
            role: 'PARENT'
          });
          this.router.navigateByUrl('/parent');
        } else {
          this.errorMessage.set('بيانات ولي الأمر أو كود الطالب غير مطابقة. يرجى التحقق وإعادة المحاولة.');
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          this.extractErrorMessage(
            err,
            'بيانات ولي الأمر أو كود الطالب غير مطابقة. يرجى التحقق من الأرقام وإعادة المحاولة.'
          )
        );
      }
    });
  }

  // =========================================================================
  // Super Admin Login
  // =========================================================================
  submitAdminLogin(): void {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.http.post<{ success: boolean; data: { token: string; user: any } }>(
      '/api/v1/auth/admin-login',
      {}
    ).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res?.data?.token && res?.data?.user) {
          this.authService.setSession(res.data.token, res.data.user);
          this.router.navigateByUrl('/admin');
        } else {
          this.errorMessage.set('تعذر تسجيل دخول المشرف. يرجى إعادة المحاولة.');
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(this.extractErrorMessage(err, 'تعذر الاتصال بسيرفر الإدارة.'));
      }
    });
  }

  switchToGuest(): void {
    this.authService.clearSession('/');
    this.router.navigateByUrl('/');
  }

  /**
   * Extracts clean, human-friendly Arabic error messages from HTTP error responses
   * and prevents exposing raw syntax parser tokens or HTML doctype leaks.
   */
  private extractErrorMessage(err: any, fallback: string): string {
    const rawMsg = err?.error?.error?.message || err?.error?.message;
    if (typeof rawMsg === 'string') {
      if (
        rawMsg.includes('Unexpected token') ||
        rawMsg.includes('DOCTYPE') ||
        rawMsg.includes('JSON') ||
        rawMsg.includes('is not valid')
      ) {
        return 'تعذر الاتصال بخادم المنصة بشكل صحيح (استجابة غير صالحة من السيرفر). يرجى التأكد من تشغيل السيرفر الخلفي.';
      }
      return rawMsg;
    }
    if (err?.status === 0) {
      return 'تعذر الاتصال بالسيرفر. يرجى التأكد من تشغيل الباك إند واتصالك بالإنترنت.';
    }
    if (err?.status === 502 || err?.status === 503) {
      return 'خادم المنصة الخلفي (API) غير متاح حالياً. يرجى التأكد من تشغيل السيرفر على المنفذ 5000.';
    }
    return fallback;
  }
}
