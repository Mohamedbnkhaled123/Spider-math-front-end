import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AppIconComponent } from '../app-icon/app-icon.component';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { AuthService } from '../../../core/auth/auth.service';
import { PublicDiscoveryService } from '../../../core/services/public-discovery.service';

@Component({
  selector: 'app-brand-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, AppIconComponent],
  templateUrl: './brand-footer.component.html',
  styleUrl: './brand-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandFooterComponent {
  readonly langService = inject(LangService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly discoveryService = inject(PublicDiscoveryService);

  readonly currentYear = new Date().getFullYear();

  // Dynamic Contact Channels from CMS
  readonly landingData = toSignal(this.discoveryService.getLandingData(), { initialValue: null });

  readonly contactChannels = computed(() => this.landingData()?.contactChannels);

  readonly isPortalRoute = computed(() => {
    const url = this.router.url;
    if (
      url.startsWith('/student') ||
      url.startsWith('/parent') ||
      url.startsWith('/admin') ||
      url.startsWith('/teacher') ||
      url.startsWith('/exam') ||
      url.startsWith('/quiz')
    ) {
      return true;
    }
    const user = this.authService.currentUser();
    if (user && (user.role === 'STUDENT' || user.role === 'PARENT' || user.role === 'SUPER_ADMIN')) {
      if (url !== '/' && !url.startsWith('/?')) {
        return true;
      }
    }
    return false;
  });

  readonly cleanWhatsappNumber = computed(() => {
    const rawNumber = this.landingData()?.whatsappSupportNumber ||
      this.contactChannels()?.support_whatsapp ||
      this.contactChannels()?.subscription_whatsapp ||
      '';
    return rawNumber.replace(/[^0-9]/g, '');
  });

  readonly cleanTelegramUrl = computed(() => {
    const raw = this.contactChannels()?.telegram_url || (this.landingData() as any)?.supportTelegram || '';
    if (!raw) return '';
    const trimmed = raw.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    if (trimmed.startsWith('@')) return `https://t.me/${trimmed.substring(1)}`;
    return `https://t.me/${trimmed}`;
  });

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
      } else {
        this.router.navigate(['/'], { fragment: sectionId }).then(() => {
          setTimeout(() => {
            const target = document.getElementById(sectionId);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 150);
        });
      }
    }
  }

  scrollToPlacementTest(): void {
    this.scrollToSection('placement-test-section');
  }
}
