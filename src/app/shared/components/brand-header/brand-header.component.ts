import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AppIconComponent } from '../app-icon/app-icon.component';
import { AuthRoleModalComponent } from '../auth-role-modal/auth-role-modal.component';
import { ThemeService } from '../../../core/seo-theme-i18n/theme.service';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SeoMetaService } from '../../../core/seo-theme-i18n/seo-meta.service';
import { NotificationsService } from '../../../core/services/notifications.service';
import { INotificationItem } from '../../../core/services/notifications.models';

@Component({
  selector: 'app-brand-header',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoPipe, AppIconComponent, AuthRoleModalComponent],
  templateUrl: './brand-header.component.html',
  styleUrl: './brand-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandHeaderComponent implements OnInit {
  readonly themeService = inject(ThemeService);
  readonly langService = inject(LangService);
  readonly authService = inject(AuthService);
  readonly notificationsService = inject(NotificationsService);
  private readonly seoMetaService = inject(SeoMetaService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  readonly isAuthModalOpen = signal<boolean>(false);
  readonly isMobileMenuOpen = signal<boolean>(false);
  readonly isCopiedToastVisible = signal<boolean>(false);

  // Dynamic Dashboard / Portal Route & Label
  readonly activePortal = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return null;

    if (user.role === 'SUPER_ADMIN') {
      return {
        route: '/admin',
        label: this.langService.isArabic() ? 'لوحة التحكم' : 'Admin Dashboard'
      };
    }

    if (user.role === 'PARENT') {
      return {
        route: '/parent',
        label: this.langService.isArabic() ? 'لوحة التحكم' : 'Parent Dashboard'
      };
    }

    if (user.role === 'STUDENT') {
      if (this.authService.isPendingDeviceApproval()) {
        return {
          route: '/device-pending',
          label: this.langService.isArabic() ? 'لوحة التحكم (اعتماد الجهاز)' : 'Device Pending'
        };
      }
      if (user.has_active_subscription) {
        return {
          route: '/student',
          label: this.langService.isArabic() ? 'لوحة التحكم' : 'Student Dashboard'
        };
      }
      return {
        route: '/inactive-student',
        label: this.langService.isArabic() ? 'لوحة التحكم' : 'Inactive Portal'
      };
    }

    return {
      route: '/',
      label: this.langService.isArabic() ? 'لوحة التحكم' : 'Dashboard'
    };
  });

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.notificationsService.fetchNotifications();
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleLanguage(): void {
    this.langService.toggleLanguage();
    this.seoMetaService.setDefaultPlatformSeo(this.langService.currentLang());
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  openAuthModal(): void {
    this.isAuthModalOpen.set(true);
    this.closeMobileMenu();
  }

  toggleNotifications(): void {
    this.notificationsService.toggleDropdown();
  }

  onNotificationClick(notif: INotificationItem): void {
    this.notificationsService.markAsRead(notif._id).subscribe();
    this.notificationsService.closeDropdown();
    if (notif.action_url) {
      this.router.navigateByUrl(notif.action_url);
    }
  }

  markAllRead(): void {
    this.notificationsService.markAllAsRead().subscribe();
  }

  copyHaCode(code: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (isPlatformBrowser(this.platformId) && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        this.isCopiedToastVisible.set(true);
        setTimeout(() => this.isCopiedToastVisible.set(false), 2500);
      });
    }
  }

  navigateToSection(sectionId: string): void {
    this.closeMobileMenu();
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.router.url === '/' || this.router.url.startsWith('/?')) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    this.router.navigate(['/'], { fragment: sectionId });
  }

  logout(): void {
    this.closeMobileMenu();
    this.notificationsService.closeDropdown();
    this.authService.clearSession('/');
  }
}
