import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTransloco } from '@jsverse/transloco';

import { AppComponent } from './app.component';
import { TranslocoHttpLoader } from './core/seo-theme-i18n/transloco-loader';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
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

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should suppress footer when uiLayoutService suppresses footer or on exam page', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.shouldRenderFooter()).toBe(true);

    app.uiLayoutService.suppressFooter(true);
    expect(app.shouldRenderFooter()).toBe(false);

    app.uiLayoutService.suppressFooter(false);
    expect(app.shouldRenderFooter()).toBe(true);

    app.isExamOrQuizPage.set(true);
    expect(app.shouldRenderFooter()).toBe(false);
  });

  it('should detect /admin route as suppressed exam/studio page', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance as any;
    app.checkIsExamPage('/admin');
    expect(app.isExamOrQuizPage()).toBe(true);
    expect(app.shouldRenderFooter()).toBe(false);
  });
});
