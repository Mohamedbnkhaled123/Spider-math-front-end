import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { ThemeService } from '../../../core/seo-theme-i18n/theme.service';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SeoMetaService } from '../../../core/seo-theme-i18n/seo-meta.service';

@Component({
  selector: 'app-brand-header',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoPipe],
  templateUrl: './brand-header.component.html',
  styleUrl: './brand-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandHeaderComponent {
  readonly themeService = inject(ThemeService);
  readonly langService = inject(LangService);
  readonly authService = inject(AuthService);
  private readonly seoMetaService = inject(SeoMetaService);

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleLanguage(): void {
    this.langService.toggleLanguage();
    this.seoMetaService.setDefaultPlatformSeo(this.langService.currentLang());
  }

  logout(): void {
    this.authService.clearSession('/');
  }
}
