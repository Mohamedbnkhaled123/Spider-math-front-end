import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SubmissionFeedbackViewerComponent } from './submission-feedback-viewer.component';

describe('SubmissionFeedbackViewerComponent', () => {
  let component: SubmissionFeedbackViewerComponent;
  let fixture: ComponentFixture<SubmissionFeedbackViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmissionFeedbackViewerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
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
    expect(component.isPublished()).toBeTrue();
    component.toggleVisibilityState();
    expect(component.isPublished()).toBeFalse();
    component.toggleVisibilityState();
    expect(component.isPublished()).toBeTrue();
  });
});
