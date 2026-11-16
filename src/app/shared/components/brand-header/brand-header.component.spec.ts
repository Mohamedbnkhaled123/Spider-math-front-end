import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTransloco } from '@jsverse/transloco';

import { BrandHeaderComponent } from './brand-header.component';
import { TranslocoHttpLoader } from '../../../core/seo-theme-i18n/transloco-loader';

describe('BrandHeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandHeaderComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTransloco({
          config: {
            availableLangs: ['en', 'ar'],
            defaultLang: 'en',
            fallbackLang: 'en'
          },
          loader: TranslocoHttpLoader
        })
      ]
    }).compileComponents();
  });

  it('should create the brand header component', () => {
    const fixture = TestBed.createComponent(BrandHeaderComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should toggle theme when toggleTheme is clicked', () => {
    const fixture = TestBed.createComponent(BrandHeaderComponent);
    const component = fixture.componentInstance;
    const initialTheme = component.themeService.currentTheme();
    component.toggleTheme();
    expect(component.themeService.currentTheme()).not.toEqual(initialTheme);
  });

  describe('Navbar Visibility, Layering & Dropdowns Contract', () => {
    it('should have sticky top positioning and z-layer-header on the main header element', () => {
      const fixture = TestBed.createComponent(BrandHeaderComponent);
      fixture.detectChanges();
      const headerEl: HTMLElement | null = fixture.nativeElement.querySelector('header');
      expect(headerEl).toBeTruthy();
      expect(headerEl?.classList.contains('sticky')).toBeTrue();
      expect(headerEl?.classList.contains('top-0')).toBeTrue();
      expect(headerEl?.classList.contains('z-layer-header')).toBeTrue();
    });

    it('should assign z-layer-header-dropdown to the mobile drawer when opened', () => {
      const fixture = TestBed.createComponent(BrandHeaderComponent);
      const component = fixture.componentInstance;
      component.isMobileMenuOpen.set(true);
      fixture.detectChanges();

      const mobileDrawer: HTMLElement | null = fixture.nativeElement.querySelector('.drawer-smooth-05');
      expect(mobileDrawer).toBeTruthy();
      expect(mobileDrawer?.classList.contains('z-layer-header-dropdown')).toBeTrue();
    });

    it('should assign z-layer-header-dropdown to notifications dropdown when opened', () => {
      const fixture = TestBed.createComponent(BrandHeaderComponent);
      const component = fixture.componentInstance;
      component.notificationsService.isDropdownOpen.set(true);
      fixture.detectChanges();

      const notifDropdown: HTMLElement | null = fixture.nativeElement.querySelector('.notifications-dropdown');
      expect(notifDropdown).toBeTruthy();
      expect(notifDropdown?.classList.contains('z-layer-header-dropdown')).toBeTrue();
    });

    it('should keep header visible when auth modal or simulation modal is opened', () => {
      const fixture = TestBed.createComponent(BrandHeaderComponent);
      const component = fixture.componentInstance;
      component.openAuthModal();
      fixture.detectChanges();

      expect(component.isAuthModalOpen()).toBeTrue();
      const headerEl: HTMLElement | null = fixture.nativeElement.querySelector('header');
      expect(headerEl).toBeTruthy();
      expect(headerEl?.classList.contains('z-layer-header')).toBeTrue();
    });
  });

  describe('Zero-Emoji Compliance', () => {
    it('should contain zero Unicode emojis in the rendered template', () => {
      const fixture = TestBed.createComponent(BrandHeaderComponent);
      fixture.detectChanges();
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
      expect(emojiRegex.test(fixture.nativeElement.innerHTML)).toBeFalse();
    });
  });
});
