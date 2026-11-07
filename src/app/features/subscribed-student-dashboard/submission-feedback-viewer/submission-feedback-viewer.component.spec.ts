import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SubmissionFeedbackViewerComponent } from './submission-feedback-viewer.component';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';

describe('SubmissionFeedbackViewerComponent', () => {
  let component: SubmissionFeedbackViewerComponent;
  let fixture: ComponentFixture<SubmissionFeedbackViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmissionFeedbackViewerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: LangService,
          useValue: {
            isArabic: () => true,
            currentLang: () => 'ar'
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubmissionFeedbackViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle visibility between pending and published', () => {
    component.feedback.update((f) => ({ ...f, resultVisibility: 'PUBLISHED_TO_STUDENT_AND_PARENT' }));
    expect(component.isPublished()).toBeTrue();
    component.feedback.update((f) => ({ ...f, resultVisibility: 'HIDDEN_PENDING_TEACHER' }));
    expect(component.isPublished()).toBeFalse();
  });
});
