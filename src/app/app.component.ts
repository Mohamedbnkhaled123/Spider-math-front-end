import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
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
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { TranslocoPipe } from '@jsverse/transloco';

import { BrandHeaderComponent } from './shared/components/brand-header/brand-header.component';
import { BrandFooterComponent } from './shared/components/brand-footer/brand-footer.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { RouteSkeletonLoaderComponent } from './shared/components/route-skeleton-loader/route-skeleton-loader.component';
import { ConfirmDialogService } from './core/services/confirm-dialog.service';
import { LangService } from './core/seo-theme-i18n/lang.service';
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
    RouteSkeletonLoaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  readonly langService = inject(LangService);
  readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly seoMetaService = inject(SeoMetaService);
  private readonly router = inject(Router);

  readonly isExamOrQuizPage = signal<boolean>(false);
  readonly isRouteNavigating = signal<boolean>(false);
  readonly navigatingUrl = signal<string>('');

  ngOnInit(): void {
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
          this.checkIsExamPage(event.urlAfterRedirects || event.url);
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
      url.includes('/homework')
    );
    this.isExamOrQuizPage.set(isExam);
  }
}
