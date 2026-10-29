import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';

import arTranslations from '../../../assets/i18n/ar.json';
import enTranslations from '../../../assets/i18n/en.json';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  getTranslation(lang: string): Observable<Translation> {
    const dictionary = lang === 'ar' ? (arTranslations as Translation) : (enTranslations as Translation);
    return of(dictionary);
  }
}
