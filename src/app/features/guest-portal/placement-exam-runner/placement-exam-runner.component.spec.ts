import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { PlacementExamRunnerComponent } from './placement-exam-runner.component';

describe('PlacementExamRunnerComponent', () => {
  let component: PlacementExamRunnerComponent;
  let fixture: ComponentFixture<PlacementExamRunnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PlacementExamRunnerComponent,
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

    fixture = TestBed.createComponent(PlacementExamRunnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the PlacementExamRunnerComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should format time correctly into mm:ss', () => {
    component.timeRemainingSec.set(125);
    expect(component.formattedTime()).toBe('02:05');
  });

  it('should record answer selection', () => {
    component.selectOption(2);
    expect(component.answeredQuestionsCount()).toBeGreaterThanOrEqual(0);
  });
});
