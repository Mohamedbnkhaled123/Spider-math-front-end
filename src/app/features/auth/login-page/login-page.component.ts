import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { LoginTab, RoleSimulatorPreset } from './login-page.models';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AppIconComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  readonly activeTab = signal<LoginTab>('student');
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Form Models
  readonly studentHaCode = signal<string>('HA4920');
  readonly parentPhone = signal<string>('01012345678');
  readonly parentStudentCode = signal<string>('HA4920');
  readonly adminPin = signal<string>('');

  // 5 Role Simulator Presets
  readonly rolePresets: readonly RoleSimulatorPreset[] = [
    {
      id: 'student-subscribed-01',
      role: 'STUDENT',
      titleAr: 'طالب مشترك نشط (HA4920 — أحمد محمد)',
      titleEn: 'Subscribed Student (HA4920 - Ahmed Mohamed)',
      subtitleAr: 'كامل الصلاحيات: مشاهدة المحاضرات المحمية، عارض PDF، حل الامتحانات ولوحة الشرف',
      subtitleEn: 'Full access: Protected lectures, PDF viewer, exam engine & leaderboard',
      badgeText: 'كامل الصلاحيات',
      badgeType: 'accent',
      icon: 'graduation-cap',
      targetRoute: '/student',
      studentHaCode: 'HA4920',
      hasActiveSubscription: true,
      fullName: 'أحمد محمد'
    },
    {
      id: 'parent-demo-01',
      role: 'PARENT',
      titleAr: 'ولي أمر (محمد علي — والد أحمد وسارة)',
      titleEn: 'Parent Portal (Mohamed Ali - Father of Ahmed & Sarah)',
      subtitleAr: 'متابعة الأبناء: رادار السونار الحي الأخضر، تبديل الأبناء، والاطلاع على الأخطاء وفيديوهات يوتيوب',
      subtitleEn: 'Child monitoring: Live Sonar radar, switch child, error breakdown & YouTube clips',
      badgeText: 'متابعة الأبناء',
      badgeType: 'primary',
      icon: 'shield',
      targetRoute: '/parent',
      fullName: 'محمد علي'
    },
    {
      id: 'student-inactive-01',
      role: 'STUDENT',
      titleAr: 'طالب غير مشترك (سارة أحمد)',
      titleEn: 'Inactive Student (Sarah Ahmed)',
      subtitleAr: 'بوابة الطالب غير المشترك: جدول المواعيد وتفاصيل الباقات والاشتراك عبر فودافون كاش',
      subtitleEn: 'Inactive portal: Schedule grid, bundle tiers, and Vodafone Cash checkout',
      badgeText: 'بانتظار الاشتراك',
      badgeType: 'warning',
      icon: 'clock',
      targetRoute: '/inactive-student-portal',
      studentHaCode: 'HA9081',
      hasActiveSubscription: false,
      fullName: 'سارة أحمد'
    },
    {
      id: 'student-pending-device-01',
      role: 'STUDENT',
      titleAr: 'طالب جهازه معلق (عمر خالد)',
      titleEn: 'Pending Device Approval (Omar Khaled)',
      subtitleAr: 'حظر أمني مؤقت (HTTP 423): محاكاة الدخول من جهاز ثانٍ غير معتمد حتى موافقة المعلمة في لوحة الإدارة',
      subtitleEn: 'Temporary device lock (HTTP 423) until Eng. Heba approves from Admin Studio',
      badgeText: 'حظر أمني مؤقت',
      badgeType: 'danger',
      icon: 'sparkles',
      targetRoute: '/pending-device-approval',
      isPendingDevice: true,
      fullName: 'عمر خالد'
    },
    {
      id: 'super-admin-01',
      role: 'SUPER_ADMIN',
      titleAr: 'مدير النظام / م. هبة عبدالوهاب (Super Admin)',
      titleEn: 'Super Admin / Eng. Heba Abdel-Wahab',
      subtitleAr: 'لوحة الإدارة: اعتماد الأجهزة، تصحيح الأسئلة المقالية وإدخال درجات وملاحظات المعلمة',
      subtitleEn: 'Admin studio: Device approvals, essay grading & student management',
      badgeText: 'إشراف كامل',
      badgeType: 'primary',
      icon: 'user',
      targetRoute: '/admin',
      fullName: 'م. هبة عبد الوهاب'
    }
  ];

  setTab(tab: LoginTab): void {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  activatePreset(preset: RoleSimulatorPreset): void {
    this.authService.setPendingDeviceApproval(!!preset.isPendingDevice);

    this.authService.setSession('mock_jwt_token_' + preset.id, {
      _id: preset.id,
      full_name: preset.fullName,
      email: `${preset.id}@spidermath.com`,
      role: preset.role,
      student_ha_code: preset.studentHaCode,
      total_xp: preset.hasActiveSubscription ? 1450 : 0,
      has_active_subscription: !!preset.hasActiveSubscription,
      curriculum: 'EGYPTIAN',
      grade_level: 'SEC_3',
      academic_term: 'TERM_1'
    });

    this.router.navigateByUrl(preset.targetRoute);
  }

  submitStudentLogin(): void {
    const code = this.studentHaCode().trim().toUpperCase();
    if (!code) {
      this.errorMessage.set('يرجى إدخال كود الطالب الخاص بك (HAxxxx)');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.http.post<{ success: boolean; data: { token: string; user: any } }>(
      '/api/v1/auth/student-code-login',
      { student_ha_code: code }
    ).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res?.data?.token && res?.data?.user) {
          this.authService.setSession(res.data.token, res.data.user);
          const target = res.data.user.has_active_subscription ? '/student' : '/inactive-student-portal';
          this.router.navigateByUrl(target);
        } else {
          this.fallbackStudentLogin(code);
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        // If real student code not found in DB, fallback to demo student session gracefully
        if (err.status === 404) {
          this.fallbackStudentLogin(code);
        } else {
          this.errorMessage.set(err?.error?.message || 'تعذر تسجيل الدخول بالكود المدخل، يرجى التحقق وإعادة المحاولة.');
        }
      }
    });
  }

  private fallbackStudentLogin(code: string): void {
    this.authService.setSession('mock_jwt_token_student-subscribed-01', {
      _id: 'student_' + code,
      full_name: 'طالب سبايدر ماث (' + code + ')',
      email: `${code.toLowerCase()}@spidermath.com`,
      role: 'STUDENT',
      student_ha_code: code,
      total_xp: 680,
      has_active_subscription: true,
      curriculum: 'EGYPTIAN',
      grade_level: 'SEC_3',
      academic_term: 'TERM_1'
    });
    this.router.navigateByUrl('/student');
  }

  submitParentLogin(): void {
    const phone = this.parentPhone().trim();
    const code = this.parentStudentCode().trim().toUpperCase();

    if (!phone || !code) {
      this.errorMessage.set('يرجى إدخال رقم هاتف ولي الأمر وكود الطالب معاً');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.http.post<{ success: boolean; data: any }>(
      '/api/v1/auth/parent-activate-login',
      {
        parentPhone: phone,
        studentCode: code,
        deviceUuid: 'dev-parent-browser-uuid'
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
          this.fallbackParentLogin(phone, code);
        }
      },
      error: () => {
        this.isSubmitting.set(false);
        // Fallback demo parent session
        this.fallbackParentLogin(phone, code);
      }
    });
  }

  private fallbackParentLogin(phone: string, code: string): void {
    this.authService.setSession('mock_jwt_token_parent-demo-01', {
      _id: 'parent_demo_01',
      full_name: 'ولي أمر الطالب (' + code + ')',
      email: 'parent@spidermath.com',
      phone,
      role: 'PARENT'
    });
    this.router.navigateByUrl('/parent');
  }

  submitAdminLogin(): void {
    this.isSubmitting.set(true);
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.authService.setSession('mock_jwt_token_super-admin-01', {
        _id: 'super-admin-01',
        full_name: 'م. هبة عبد الوهاب',
        email: 'admin@spidermath.com',
        role: 'SUPER_ADMIN'
      });
      this.router.navigateByUrl('/admin');
    }, 400);
  }

  loginWithGoogle(): void {
    // Demo 1-click Google sign in simulation
    this.fallbackStudentLogin('HA4920');
  }

  switchToGuest(): void {
    this.authService.clearSession('/');
    this.router.navigateByUrl('/');
  }
}
