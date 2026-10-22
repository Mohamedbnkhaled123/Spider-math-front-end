import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';

import { ThemeService } from './core/seo-theme-i18n/theme.service';
import { LangService } from './core/seo-theme-i18n/lang.service';
import { AuthService } from './core/auth/auth.service';
import { SeoMetaService } from './core/seo-theme-i18n/seo-meta.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    TranslocoPipe
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  readonly themeService = inject(ThemeService);
  readonly langService = inject(LangService);
  readonly authService = inject(AuthService);
  private readonly seoMetaService = inject(SeoMetaService);

  ngOnInit(): void {
    this.seoMetaService.setDefaultPlatformSeo(this.langService.currentLang());
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleLanguage(): void {
    this.langService.toggleLanguage();
    this.seoMetaService.setDefaultPlatformSeo(this.langService.currentLang());
  }
}
