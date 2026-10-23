import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AppIconComponent } from '../app-icon/app-icon.component';
import { AuthRoleModalComponent } from '../auth-role-modal/auth-role-modal.component';
import { ThemeService } from '../../../core/seo-theme-i18n/theme.service';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SeoMetaService } from '../../../core/seo-theme-i18n/seo-meta.service';

@Component({
  selector: 'app-brand-header',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoPipe, AppIconComponent, AuthRoleModalComponent],
  templateUrl: './brand-header.component.html',
  styleUrl: './brand-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandHeaderComponent {
  readonly themeService = inject(ThemeService);
  readonly langService = inject(LangService);
  readonly authService = inject(AuthService);
  private readonly seoMetaService = inject(SeoMetaService);

  readonly isAuthModalOpen = signal<boolean>(false);

  readonly activePortal = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return null;

    if (user.role === 'SUPER_ADMIN') {
      return { route: '/admin', label: 'لوحة الإدارة' };
    }
    if (user.role === 'PARENT') {
      return { route: '/parent', label: 'بوابة ولي الأمر' };
    }
    if (user.role === 'STUDENT') {
      if (this.authService.isPendingDeviceApproval()) {
        return { route: '/pending-device-approval', label: 'اعتماد الجهاز' };
      }
      if (user.has_active_subscription) {
        return { route: '/student', label: 'لوحة دراستي' };
      }
      return { route: '/inactive-student-portal', label: 'تفعيل الاشتراك' };
    }
    return { route: '/', label: 'الرئيسية' };
  });

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleLanguage(): void {
    this.langService.toggleLanguage();
    this.seoMetaService.setDefaultPlatformSeo(this.langService.currentLang());
  }

  openAuthModal(): void {
    this.isAuthModalOpen.set(true);
  }

  logout(): void {
    this.authService.clearSession('/');
  }
}
