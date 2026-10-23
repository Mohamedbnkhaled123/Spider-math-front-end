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
    submissionId: 'sub_calc_1',
    assessmentTitleAr: 'تقييم المحاضرة 2: الاشتقاق الضمني والمشتقات العليا',
    assessmentTitleEn: 'Assessment 2: Implicit & Higher Derivatives',
    unitTitleAr: 'الوحدة الأولى: التفاضل والاشتقاق وتطبيقاته الهندسية',
    resultVisibility: 'PUBLISHED_TO_STUDENT_AND_PARENT',
    mcqAutoScore: 10,
    essayManualScore: 8,
    finalTotalScore: 18,
    maxScore: 20,
    scorePercentage: 90,
    gradedAt: '24 أكتوبر 2026 - 18:30',
    teacherFeedbackNotes:
      'ممتاز جداً يا بطل! خطوات الاشتقاق الضمني كانت منظمة ودقيقة للغاية. انتبه فقط لإشارة الحد الأخير في مسألة المشتقة الثانية عند التعويض.',
    customMistakeCases: [
      {
        questionId: 'q_diff_3',
        questionOrder: 3,
        questionPromptText:
          'أثبت أن المشتقة الثانية للمنحنى ص = جتا(٢س) تحقق المعادلة التفاضلية (د²ص / دس²) + ٤ص = صفر.',
        studentAnswerText: 'تم الاشتقاق مع خطأ في إشارة السالب عند تفاضل الجتا.',
        errorNote:
          'تذكر أن تفاضل جتا(٢س) هو -٢جا(٢س)، المشتقة الثانية تصبح -٤جتا(٢س). شاهد شرح هذا النمط بالضغط على زر الحل بالفيديو.',
        youtubeSolutionUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ]
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
