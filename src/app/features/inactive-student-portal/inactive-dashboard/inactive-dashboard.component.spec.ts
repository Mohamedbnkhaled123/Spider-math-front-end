import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { InactiveDashboardComponent } from './inactive-dashboard.component';

describe('InactiveDashboardComponent', () => {
  let component: InactiveDashboardComponent;
  let fixture: ComponentFixture<InactiveDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        InactiveDashboardComponent,
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

    fixture = TestBed.createComponent(InactiveDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the InactiveDashboardComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should provide trial lectures', () => {
    expect(component.trialLectures().length).toBeGreaterThan(0);
  });
});
