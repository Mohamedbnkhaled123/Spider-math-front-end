import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideTransloco } from '@jsverse/transloco';

import { routes } from './app.routes';
import { jwtDeviceInterceptor } from './core/interceptors/jwt-device.interceptor';
import { errorRevokeInterceptor } from './core/interceptors/error-revoke.interceptor';
import { TranslocoHttpLoader } from './core/seo-theme-i18n/transloco-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideClientHydration(
      withEventReplay(),
      withHttpTransferCacheOptions({ includePostRequests: false })
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([jwtDeviceInterceptor, errorRevokeInterceptor])
    ),
    provideTransloco({
      config: {
        availableLangs: ['en', 'ar'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode()
      },
      loader: TranslocoHttpLoader
    })
  ]
};
