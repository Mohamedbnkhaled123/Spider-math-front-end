import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTransloco } from '@jsverse/transloco';

import { SubscribedStudentDashboardComponent } from './subscribed-student-dashboard.component';
import { TranslocoHttpLoader } from '../../core/seo-theme-i18n/transloco-loader';

describe('SubscribedStudentDashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscribedStudentDashboardComponent],
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

  it('should create the subscribed student dashboard component', () => {
    const fixture = TestBed.createComponent(SubscribedStudentDashboardComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
