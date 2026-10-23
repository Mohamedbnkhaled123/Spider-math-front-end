import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { LeadGateModalComponent } from './lead-gate-modal.component';

describe('LeadGateModalComponent', () => {
  let component: LeadGateModalComponent;
  let fixture: ComponentFixture<LeadGateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LeadGateModalComponent,
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

    fixture = TestBed.createComponent(LeadGateModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('attemptId', 'test-attempt-123');
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
  });

  it('should create the LeadGateModalComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should validate full name length before unlock', () => {
    component.fullName.set('Al');
    component.phone.set('01012345678');
    component.submitUnlock();
    expect(component.errorMessage()).toBeTruthy();
  });
});
