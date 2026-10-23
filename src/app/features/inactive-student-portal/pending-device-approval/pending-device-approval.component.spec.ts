import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { PendingDeviceApprovalComponent } from './pending-device-approval.component';

describe('PendingDeviceApprovalComponent', () => {
  let component: PendingDeviceApprovalComponent;
  let fixture: ComponentFixture<PendingDeviceApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PendingDeviceApprovalComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ar: {} },
          translocoConfig: { availableLangs: ['en', 'ar'], defaultLang: 'en' }
        })
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PendingDeviceApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the PendingDeviceApprovalComponent', () => {
    expect(component).toBeTruthy();
  });
});
