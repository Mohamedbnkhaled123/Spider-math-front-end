import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppIconComponent } from '../app-icon/app-icon.component';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';

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
  readonly currentYear = new Date().getFullYear();

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
