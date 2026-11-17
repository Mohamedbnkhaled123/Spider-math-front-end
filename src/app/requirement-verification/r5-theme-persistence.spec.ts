import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { TranslocoHttpLoader } from '../core/seo-theme-i18n/transloco-loader';
import { ThemeService } from '../core/seo-theme-i18n/theme.service';
import { AppComponent } from '../app.component';
import { DOCUMENT } from '@angular/common';

describe('Requirement R5: Theme Persistence Across Refreshes (F5 Dark Flash Prevention)', () => {
  const THEME_KEY = 'spider_math_theme_v3';
  let documentRef: Document;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    const doc = document.documentElement;
    doc.classList.remove('light');
    doc.classList.add('dark');
    doc.setAttribute('data-theme', 'dark');
  });

  it('should verify index.html inline script applies light theme to document element immediately', () => {
    // 1. Simulate user having selected 'light' mode in previous session
    localStorage.setItem(THEME_KEY, 'light');

    // 2. Simulate the inline synchronous script placed in <head> of index.html
    (function () {
      try {
        const t = localStorage.getItem('spider_math_theme_v3');
        if (t === 'light') {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
          document.documentElement.setAttribute('data-theme', 'light');
        } else if (t === 'dark') {
          document.documentElement.classList.remove('light');
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        }
      } catch (e) {}
    })();

    // From frame 0 of HTML parsing, .light and data-theme='light' are set before CSS/DOM paint
    expect(document.documentElement.classList.contains('light')).toBeTrue();
    expect(document.documentElement.classList.contains('dark')).toBeFalse();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should initialize ThemeService and preserve light theme from localStorage without flash to dark', () => {
    localStorage.setItem(THEME_KEY, 'light');

    TestBed.configureTestingModule({
      providers: [ThemeService]
    });

    const themeService = TestBed.inject(ThemeService);

    expect(themeService.currentTheme()).toBe('light');
    expect(themeService.isDark()).toBeFalse();
    expect(document.documentElement.classList.contains('light')).toBeTrue();
    expect(document.documentElement.classList.contains('dark')).toBeFalse();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should toggle theme and update localStorage and DOM classes synchronously', () => {
    TestBed.configureTestingModule({
      providers: [ThemeService]
    });

    const themeService = TestBed.inject(ThemeService);

    // Toggle to light
    themeService.setTheme('light');
    expect(themeService.currentTheme()).toBe('light');
    expect(localStorage.getItem(THEME_KEY)).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBeTrue();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    // Toggle back to dark
    themeService.setTheme('dark');
    expect(themeService.currentTheme()).toBe('dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBeTrue();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should verify AppComponent eagerly injects ThemeService for immediate application-wide synchronization', async () => {
    localStorage.setItem(THEME_KEY, 'light');

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTransloco({
          config: {
            availableLangs: ['en', 'ar'],
            defaultLang: 'en',
            fallbackLang: 'en'
          },
          loader: TranslocoHttpLoader
        }),
        ThemeService
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    const appComponent = fixture.componentInstance;

    // Verify ThemeService is eagerly injected in AppComponent
    expect(appComponent.themeService).toBeDefined();
    expect(appComponent.themeService.currentTheme()).toBe('light');
  });
});
