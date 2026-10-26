import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
 * - Zero-Score False Positive Bug Fix: Only display full mark congratulation when
 *   final score equals maximum score and totalPoints > 0.
 */
@Component({
  selector: 'app-submission-feedback-viewer',
  standalone: true,
  imports: [CommonModule, RouterLink, AppIconComponent],
  templateUrl: './submission-feedback-viewer.component.html',
  styleUrls: ['./submission-feedback-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmissionFeedbackViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  readonly langService = inject(LangService);

  readonly isLoading = signal<boolean>(true);

  readonly feedback = signal<SubmissionFeedbackData>({
    submissionId: '',
    assessmentTitleAr: 'تقييم دراسي',
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
    customMistakeCases: [],
    questionsReview: [],
    essaySolutionImages: []
  });

  readonly activeReviewTab = signal<'ALL_QUESTIONS' | 'MISTAKES_ONLY'>('ALL_QUESTIONS');
  readonly previewImageUrl = signal<string | null>(null);

  readonly isPublished = computed(
    () => this.feedback().resultVisibility === 'PUBLISHED_TO_STUDENT_AND_PARENT'
  );

  readonly totalQuestionsCount = computed(() => this.feedback().questionsReview.length);
  readonly correctQuestionsCount = computed(
    () => this.feedback().questionsReview.filter((q) => q.isCorrect === true).length
  );
  readonly mistakesCount = computed(
    () => this.feedback().customMistakeCases.length || this.feedback().questionsReview.filter((q) => q.isCorrect === false).length
  );

  readonly scorePercentage = computed(() => {
    const f = this.feedback();
    return f.maxScore > 0 ? Math.round((f.finalTotalScore / f.maxScore) * 100) : 0;
  });

  readonly isFullMark = computed(() => {
    const f = this.feedback();
    return this.isPublished() && f.finalTotalScore === f.maxScore && f.maxScore > 0;
  });

  readonly scoreColorClass = computed(() => {
    const p = this.scorePercentage();
    if (p >= 85) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (p >= 50) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  });

  readonly scoreTextClass = computed(() => {
    const p = this.scorePercentage();
    if (p >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (p >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  });

  openImagePreview(url: string): void {
    this.previewImageUrl.set(url);
  }

  closeImagePreview(): void {
    this.previewImageUrl.set(null);
  }

  setReviewTab(tab: 'ALL_QUESTIONS' | 'MISTAKES_ONLY'): void {
    this.activeReviewTab.set(tab);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchFeedback(id);
    } else {
      this.isLoading.set(false);
    }
  }

  fetchFeedback(id: string): void {
    this.isLoading.set(true);
    this.http.get<{ success?: boolean; data?: any }>(`/api/v1/assessments/submissions/${id}/feedback`).subscribe({
      next: (res) => {
        const data = res?.data || res;
        if (data) {
          this.feedback.set({
            submissionId: data.submissionId || id,
            assessmentTitleAr: data.assessmentTitleAr || 'تقييم دراسي',
            assessmentTitleEn: data.assessmentTitleEn || 'Assessment Feedback',
            unitTitleAr: data.unitTitleAr || 'الوحدة الدراسية',
            resultVisibility: data.resultVisibility || 'HIDDEN_PENDING_TEACHER',
            mcqAutoScore: data.mcqAutoScore ?? 0,
            essayManualScore: data.essayManualScore ?? 0,
            finalTotalScore: data.finalTotalScore ?? 0,
            maxScore: data.maxScore ?? 20,
            scorePercentage: data.scorePercentage ?? 0,
            gradedAt: data.gradedAt ? new Date(data.gradedAt).toLocaleString('ar-EG') : '',
            teacherFeedbackNotes: data.teacherFeedbackNotes || '',
            customMistakeCases: (data.customMistakeCases || []).map((m: any, idx: number) => ({
              questionId: m.questionId,
              questionOrder: m.questionOrder ?? idx + 1,
              questionPromptText: m.questionPromptText || '',
              studentAnswerText: m.studentAnswerText || '',
              correctAnswerText: m.correctAnswerText || '',
              errorNote: m.errorNote || '',
              youtubeSolutionUrl: m.youtubeSolutionUrl || null
            })),
            questionsReview: (data.questionsReview || []).map((q: any, idx: number) => ({
              questionId: q.questionId,
              questionOrder: q.questionOrder ?? idx + 1,
              questionType: q.questionType || 'MCQ',
              questionText: q.questionText || '',
              questionImageUrl: q.questionImageUrl || null,
              options: q.options || [],
              studentSelectedOptionIndex: q.studentSelectedOptionIndex,
              studentAnswerText: q.studentAnswerText || '',
              correctOptionIndex: q.correctOptionIndex,
              correctAnswerText: q.correctAnswerText || '',
              isCorrect: q.isCorrect,
              points: q.points || 1,
              awardedPoints: q.awardedPoints,
              youtubeSolutionUrl: q.youtubeSolutionUrl || null,
              teacherNote: q.teacherNote || null
            })),
            essaySolutionImages: (data.essaySolutionImages || []).map((img: any) => ({
              imageUrl: img.imageUrl,
              rotationDeg: img.rotationDeg || 0,
              sizeKb: img.sizeKb
            }))
          });
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.warn('Failed to load real submission feedback:', err);
        this.isLoading.set(false);
      }
    });
  }

  openSolutionVideo(url: string | null | undefined): void {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}
