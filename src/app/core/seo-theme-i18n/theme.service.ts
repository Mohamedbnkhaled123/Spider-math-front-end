import { Injectable, signal, computed, inject, PLATFORM_ID, DOCUMENT } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly THEME_STORAGE_KEY = 'spider_math_theme';

  // Signals
  readonly currentTheme = signal<AppTheme>('light');
  readonly isDark = computed(() => this.currentTheme() === 'dark');

  constructor() {
    this.initializeTheme();
  }

  /**
   * Sets the theme explicitly.
   */
  setTheme(theme: AppTheme): void {
    this.currentTheme.set(theme);
    this.applyThemeToDom(theme);

    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(this.THEME_STORAGE_KEY, theme);
      } catch (err) {
        console.warn('[ThemeService] LocalStorage write error:', err);
      }
    }
  }

  /**
   * Toggles between light and dark themes.
   */
  toggleTheme(): void {
    const nextTheme: AppTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(nextTheme);
  }

  private initializeTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const storedTheme = localStorage.getItem(this.THEME_STORAGE_KEY) as AppTheme | null;
        if (storedTheme === 'dark' || storedTheme === 'light') {
          this.setTheme(storedTheme);
          return;
        }

        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setTheme(prefersDark ? 'dark' : 'light');
      } catch {
        this.setTheme('light');
      }
    } else {
      this.applyThemeToDom('light');
    }
  }

  private applyThemeToDom(theme: AppTheme): void {
    const root = this.document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }
}
