import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTransloco } from '@jsverse/transloco';

import { ParentDashboardComponent } from './parent-dashboard.component';
import { TranslocoHttpLoader } from '../../core/seo-theme-i18n/transloco-loader';

describe('ParentDashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentDashboardComponent],
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

  it('should create the parent dashboard component', () => {
    const fixture = TestBed.createComponent(ParentDashboardComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
