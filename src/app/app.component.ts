import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';

import { BrandHeaderComponent } from './shared/components/brand-header/brand-header.component';
import { BrandFooterComponent } from './shared/components/brand-footer/brand-footer.component';
import { LangService } from './core/seo-theme-i18n/lang.service';
import { SeoMetaService } from './core/seo-theme-i18n/seo-meta.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    BrandHeaderComponent,
    BrandFooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  readonly langService = inject(LangService);
  private readonly seoMetaService = inject(SeoMetaService);

  ngOnInit(): void {
    this.seoMetaService.setDefaultPlatformSeo(this.langService.currentLang());
  }
}
