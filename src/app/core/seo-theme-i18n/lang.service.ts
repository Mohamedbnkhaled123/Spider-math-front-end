import { Injectable, signal, computed, inject, PLATFORM_ID, DOCUMENT } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';

export type SupportedLanguage = 'en' | 'ar';

@Injectable({
  providedIn: 'root'
})
export class LangService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly translocoService = inject(TranslocoService);

  private readonly LANG_STORAGE_KEY = 'spider_math_lang';

  // Signals
  readonly currentLang = signal<SupportedLanguage>('en'); // English as default
  readonly isRtl = computed(() => this.currentLang() === 'ar');
  readonly isArabic = computed(() => this.currentLang() === 'ar');
  readonly isEnglish = computed(() => this.currentLang() === 'en');

  constructor() {
    this.initializeLang();
  }

  /**
   * Sets the active language, updates Transloco and changes document direction.
   */
  setLanguage(lang: SupportedLanguage): void {
    this.currentLang.set(lang);
    this.translocoService.setActiveLang(lang);
    this.applyDocumentDirection(lang);

    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(this.LANG_STORAGE_KEY, lang);
      } catch (err) {
        console.warn('[LangService] LocalStorage write error:', err);
      }
    }
  }

  /**
   * Toggles between English and Arabic.
   */
  toggleLanguage(): void {
    const nextLang: SupportedLanguage = this.currentLang() === 'en' ? 'ar' : 'en';
    this.setLanguage(nextLang);
  }

  private initializeLang(): void {
    let initialLang: SupportedLanguage = 'en';

    if (isPlatformBrowser(this.platformId)) {
      try {
        const stored = localStorage.getItem(this.LANG_STORAGE_KEY) as SupportedLanguage | null;
        if (stored === 'ar' || stored === 'en') {
          initialLang = stored;
        }
      } catch {
        initialLang = 'en';
      }
    }

    this.setLanguage(initialLang);
  }

  private applyDocumentDirection(lang: SupportedLanguage): void {
    const root = this.document.documentElement;
    const isAr = lang === 'ar';
    root.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    root.setAttribute('lang', lang);
  }
}
