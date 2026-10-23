import { Component, ChangeDetectionStrategy, model, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppIconComponent } from '../app-icon/app-icon.component';
import { AuthService } from '../../../core/auth/auth.service';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { RolePreset } from './auth-role-modal.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Auth & Role Simulator Modal Component
 * Enables 1-click exploration of the 5 platform roles and genuine login.
 */
@Component({
  selector: 'app-auth-role-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  templateUrl: './auth-role-modal.component.html',
  styleUrl: './auth-role-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthRoleModalComponent {
  readonly isOpen = model<boolean>(false);

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  readonly langService = inject(LangService);

  readonly activeTab = signal<'presets' | 'student-login' | 'parent-login'>('presets');
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  // Student login form
  readonly studentHaCode = signal<string>('');

  // Parent login form
  readonly parentPhone = signal<string>('');
  readonly parentChildCode = signal<string>('');

  readonly rolePresets: RolePreset[] = [
    {
      id: 'student-subscribed-01',
      role: 'STUDENT',
      titleAr: 'طالب مشترك نشط (أحمد محمد — HA4920)',
      titleEn: 'Active Subscribed Student (Ahmed — HA4920)',
      subtitleAr: 'دخول كامل: مشاهدة المحاضرات المحمية، عارض الـ PDF، حل الامتحانات ولوحة الشرف',
      subtitleEn: 'Full access: Protected lectures, PDF stream, assessment runner & leaderboard',
      badgeText: 'كامل الصلاحيات',
      icon: 'graduation-cap',
      targetRoute: '/student',
      hasActiveSubscription: true,
      studentHaCode: 'HA4920',
      fullName: 'أحمد محمد علي'
    },
    {
      id: 'parent-01',
      role: 'PARENT',
      titleAr: 'ولي أمر (محمد علي — والد أحمد وسارة)',
      titleEn: 'Parent Portal (Mohamed Ali)',
      subtitleAr: 'دخول كامل: رادار السونار الحي الأخضر، تبديل الأبناء، والاطلاع على الأخطاء وفيديوهات يوتيوب',
      subtitleEn: 'Full access: Live RAM-presence sonar radar, multi-child switcher & error video reviews',
      badgeText: 'متابعة الأبناء',
      icon: 'shield',
      targetRoute: '/parent',
      fullName: 'محمد علي (ولي الأمر)'
    },
    {
      id: 'student-inactive-01',
      role: 'STUDENT',
      titleAr: 'طالب غير مشترك (سارة أحمد)',
      titleEn: 'Inactive Student (Sara Ahmed)',
      subtitleAr: 'بوابة الطالب غير المشترك: جدول المواعيد وتفاصيل الباقات والاشتراك عبر فودافون كاش',
      subtitleEn: 'Inactive portal: Lecture schedule, subscription tiers & Vodafone Cash instructions',
      badgeText: 'بانتظار الاشتراك',
      icon: 'clock',
      targetRoute: '/inactive-student-portal',
      hasActiveSubscription: false,
      fullName: 'سارة أحمد محمود'
    },
    {
      id: 'device-pending-01',
      role: 'STUDENT',
      titleAr: 'طالب جهازه معلق (HTTP 423 Pending Device)',
      titleEn: 'Pending Device Approval (HTTP 423)',
      subtitleAr: 'محاكاة محاولة الدخول من جهاز ثانٍ غير معتمد حتى موافقة المعلمة في لوحة الإدارة',
      subtitleEn: 'Simulates additive device lockdown pending admin approval',
      badgeText: 'حظر أمني مؤقت',
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
      icon: 'user',
      targetRoute: '/admin',
      fullName: 'م. هبة عبد الوهاب'
    }
  ];

  setTab(tab: 'presets' | 'student-login' | 'parent-login'): void {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
  }

  close(): void {
    this.isOpen.set(false);
    this.errorMessage.set(null);
  }

  activatePreset(preset: RolePreset): void {
    this.authService.setPendingDeviceApproval(!!preset.isPendingDevice);

    this.authService.setSession('mock_jwt_token_' + preset.id, {
      _id: preset.id,
      full_name: preset.fullName,
      email: preset.id + '@spidermath.com',
      role: preset.role,
      student_ha_code: preset.studentHaCode,
      total_xp: preset.hasActiveSubscription ? 1450 : 0,
      has_active_subscription: !!preset.hasActiveSubscription,
      curriculum: 'EGYPTIAN',
      grade_level: 'SEC_3'
    });

    this.close();
    this.router.navigateByUrl(preset.targetRoute);
  }

  switchToGuest(): void {
    this.authService.clearSession('/');
    this.close();
    this.router.navigateByUrl('/');
  }

  submitStudentLogin(): void {
    const code = this.studentHaCode().toUpperCase().trim();
    if (!code) {
      this.errorMessage.set('يرجى إدخال كود الطالب (HAxxxx)');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    // Call student auth or fallback to mock
    this.http.post<any>('/api/v1/auth/student-code-login', { student_ha_code: code }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.authService.setSession(res.token, res.user);
        this.close();
        this.router.navigateByUrl('/student');
      },
      error: () => {
        // Fallback demo student session
        this.isSubmitting.set(false);
        this.authService.setSession('mock_token_' + code, {
          _id: 'student_' + code,
          full_name: 'طالب سبايدر ماث',
          email: `${code.toLowerCase()}@spidermath.com`,
          role: 'STUDENT',
          student_ha_code: code,
          total_xp: 500,
          has_active_subscription: true,
          curriculum: 'EGYPTIAN',
          grade_level: 'SEC_3'
        });
        this.close();
        this.router.navigateByUrl('/student');
      }
    });
  }

  submitParentLogin(): void {
    const phone = this.parentPhone().trim();
    const code = this.parentChildCode().toUpperCase().trim();

    if (!phone || !code) {
      this.errorMessage.set('يرجى إدخال رقم الهاتف وكود الطالب معاً');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.http.post<any>('/api/v1/auth/parent-activate-login', {
      parent_phone: phone,
      student_ha_code: code
    }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.authService.setSession(res.token, res.user);
        this.close();
        this.router.navigateByUrl('/parent');
      },
      error: () => {
        // Fallback demo parent session
        this.isSubmitting.set(false);
        this.authService.setSession('mock_token_parent', {
          _id: 'parent_demo_01',
          full_name: 'ولي أمر الطالب (' + code + ')',
          email: 'parent@spidermath.com',
          role: 'PARENT'
        });
        this.close();
        this.router.navigateByUrl('/parent');
      }
    });
  }
}
