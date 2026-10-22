import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTransloco } from '@jsverse/transloco';

import { InactiveStudentPortalComponent } from './inactive-student-portal.component';
import { TranslocoHttpLoader } from '../../core/seo-theme-i18n/transloco-loader';

describe('InactiveStudentPortalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InactiveStudentPortalComponent],
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

  it('should create the inactive student portal component', () => {
    const fixture = TestBed.createComponent(InactiveStudentPortalComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
