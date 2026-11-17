import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, PLATFORM_ID } from '@angular/core';
import {
  RouterOutlet,
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  RouteConfigLoadStart,
  RouteConfigLoadEnd
} from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { filter } from 'rxjs/operators';
import { TranslocoPipe } from '@jsverse/transloco';

import { BrandHeaderComponent } from './shared/components/brand-header/brand-header.component';
import { BrandFooterComponent } from './shared/components/brand-footer/brand-footer.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { RouteSkeletonLoaderComponent } from './shared/components/route-skeleton-loader/route-skeleton-loader.component';
import { AdminAccessModalComponent } from './shared/components/admin-access-modal/admin-access-modal.component';
import { ConfirmDialogService } from './core/services/confirm-dialog.service';
import { AdminAccessPortalService } from './core/auth/admin-access-portal.service';
import { UiLayoutService } from './core/services/ui-layout.service';
import { LangService } from './core/seo-theme-i18n/lang.service';
import { ThemeService } from './core/seo-theme-i18n/theme.service';
import { SeoMetaService } from './core/seo-theme-i18n/seo-meta.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    BrandHeaderComponent,
    BrandFooterComponent,
    ConfirmDialogComponent,
    RouteSkeletonLoaderComponent,
    AdminAccessModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  readonly langService = inject(LangService);
  readonly themeService = inject(ThemeService);
  readonly confirmDialogService = inject(ConfirmDialogService);
  readonly adminAccessPortal = inject(AdminAccessPortalService);
  readonly uiLayoutService = inject(UiLayoutService);
  private readonly seoMetaService = inject(SeoMetaService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private speedInsightsHandler: ReturnType<typeof injectSpeedInsights> | null = null;

  readonly isExamOrQuizPage = signal<boolean>(false);
  readonly isRouteNavigating = signal<boolean>(false);
  readonly navigatingUrl = signal<string>('');

  readonly shouldRenderFooter = computed<boolean>(() => {
    return !this.isExamOrQuizPage() && !this.uiLayoutService.isFooterSuppressed();
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.speedInsightsHandler = injectSpeedInsights({ framework: 'angular' });
    }

    this.seoMetaService.setDefaultPlatformSeo(this.langService.currentLang());
    this.checkIsExamPage(this.router.url);

    // Detect if initial route navigation is in progress during bootstrap
    const currentNav = this.router.getCurrentNavigation();
    if (currentNav) {
      this.isRouteNavigating.set(true);
      const url = currentNav.initialUrl?.toString() || currentNav.extractedUrl?.toString() || '';
      if (url) {
        this.navigatingUrl.set(url);
      }
    }

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.navigatingUrl.set(event.url);
        this.isRouteNavigating.set(true);
      } else if (event instanceof RouteConfigLoadStart) {
        this.isRouteNavigating.set(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        if (event instanceof NavigationEnd) {
          const activeUrl = event.urlAfterRedirects || event.url;
          this.checkIsExamPage(activeUrl);
          this.speedInsightsHandler?.setRoute(activeUrl);
          if (isPlatformBrowser(this.platformId) && !activeUrl.includes('#')) {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            requestAnimationFrame(() => {
              window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            });
          }
        }
        this.navigatingUrl.set('');
        this.isRouteNavigating.set(false);
      }
    });
  }

  private checkIsExamPage(url: string): void {
    const isExam = !!url && (
      url.includes('/assessments/') ||
      url.includes('/placement-test') ||
      url.includes('/attempt') ||
      url.includes('/exam') ||
      url.includes('/quiz') ||
      url.includes('/homework') ||
      url.includes('/admin')
    );
    this.isExamOrQuizPage.set(isExam);
  }
}
