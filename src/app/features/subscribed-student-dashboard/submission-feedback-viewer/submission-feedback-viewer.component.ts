import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { CustomMistakeItem, SubmissionFeedbackData } from './submission-feedback-viewer.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 13: Submission Feedback Viewer Component
 * 
 * - Conditional view depending on result_visibility:
 *   * HIDDEN_PENDING_TEACHER: Reassuring pending card while Eng. Heba grades the essay
 *   * PUBLISHED_TO_STUDENT_AND_PARENT: Full MCQ + Essay score breakdown
 * - Renders Eng. Heba Abdel-Wahab's written error_note + direct YouTube solution links
 *   per mistake case (RULES.md Section 5.1: Zero Image Bloat policy).
 */
@Component({
  selector: 'app-submission-feedback-viewer',
  standalone: true,
  imports: [CommonModule, RouterLink, AppIconComponent],
  templateUrl: './submission-feedback-viewer.component.html',
  styleUrls: ['./submission-feedback-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmissionFeedbackViewerComponent {
  private readonly route = inject(ActivatedRoute);
  readonly langService = inject(LangService);

  readonly feedback = signal<SubmissionFeedbackData>({
    submissionId: '',
    assessmentTitleAr: 'تقييم تدريبي',
    assessmentTitleEn: 'Assessment Feedback',
    unitTitleAr: 'الوحدة الدراسية',
    resultVisibility: 'HIDDEN_PENDING_TEACHER',
    mcqAutoScore: 0,
    essayManualScore: 0,
    finalTotalScore: 0,
    maxScore: 20,
    scorePercentage: 0,
    gradedAt: '',
    teacherFeedbackNotes: '',
    customMistakeCases: []
  });

  readonly isPublished = computed(
    () => this.feedback().resultVisibility === 'PUBLISHED_TO_STUDENT_AND_PARENT'
  );

  openSolutionVideo(url: string | null | undefined): void {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  toggleVisibilityState(): void {
    const current = this.feedback();
    const nextState =
      current.resultVisibility === 'HIDDEN_PENDING_TEACHER'
        ? 'PUBLISHED_TO_STUDENT_AND_PARENT'
        : 'HIDDEN_PENDING_TEACHER';
    this.feedback.set({ ...current, resultVisibility: nextState });
  }
}
