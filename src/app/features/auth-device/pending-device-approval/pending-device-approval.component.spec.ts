import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTransloco } from '@jsverse/transloco';

import { PendingDeviceApprovalComponent } from './pending-device-approval.component';
import { TranslocoHttpLoader } from '../../../core/seo-theme-i18n/transloco-loader';

describe('PendingDeviceApprovalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingDeviceApprovalComponent],
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

  it('should create the pending device approval component', () => {
    const fixture = TestBed.createComponent(PendingDeviceApprovalComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
