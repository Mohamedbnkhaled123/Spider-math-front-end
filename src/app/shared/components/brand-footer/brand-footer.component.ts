import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppIconComponent } from '../app-icon/app-icon.component';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-brand-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoPipe, AppIconComponent],
  templateUrl: './brand-footer.component.html',
  styleUrl: './brand-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandFooterComponent {
  readonly langService = inject(LangService);
  readonly authService = inject(AuthService);
  readonly currentYear = new Date().getFullYear();

  readonly homeRoute = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '/';
    if (user.role === 'STUDENT') return '/student';
    if (user.role === 'PARENT') return '/parent';
    if (user.role === 'SUPER_ADMIN') return '/admin';
    return '/';
  });

  scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  scrollToSection(sectionId: string): void {
    if (typeof window !== 'undefined') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
}
