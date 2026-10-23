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
});
