import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { TranslocoPipe } from '@jsverse/transloco';

import { BrandHeaderComponent } from './shared/components/brand-header/brand-header.component';
import { BrandFooterComponent } from './shared/components/brand-footer/brand-footer.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
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
    ConfirmDialogComponent
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

  ngOnInit(): void {
    this.seoMetaService.setDefaultPlatformSeo(this.langService.currentLang());
    this.checkIsExamPage(this.router.url);

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.checkIsExamPage(e.urlAfterRedirects || e.url);
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
