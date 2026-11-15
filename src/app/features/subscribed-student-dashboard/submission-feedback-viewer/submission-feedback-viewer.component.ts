import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { MathFormulaComponent } from '../../../shared/components/math-formula/math-formula.component';
import { CelebrationModalComponent } from '../../../shared/components/celebration-modal/celebration-modal.component';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { SwrCacheService } from '../../../core/services/swr-cache.service';
import { AuthService } from '../../../core/auth/auth.service';
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
  imports: [CommonModule, RouterLink, AppIconComponent, MathFormulaComponent, CelebrationModalComponent],
  templateUrl: './submission-feedback-viewer.component.html',
  styleUrls: ['./submission-feedback-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmissionFeedbackViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  readonly langService = inject(LangService);
  private readonly swrCache = inject(SwrCacheService);
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly isLoading = signal<boolean>(true);
  readonly loadError = signal<string | null>(null);
  readonly returnToHome = computed<boolean>(() => this.route.snapshot.queryParamMap.get('returnToHome') === 'true');

  // Celebration Modal State
  readonly isCelebrationOpen = signal<boolean>(false);
  readonly studentName = computed(() => this.authService.currentUser()?.full_name || 'طالب متميز');
  readonly earnedXp = computed(() => {
    const f = this.feedback();
    return Math.max(50, f.finalTotalScore * 10);
  });

  readonly feedback = signal<SubmissionFeedbackData>({
    submissionId: '',
    assessmentId: '',
    unitId: '',
    maxAttempts: 1,
    completedAttemptsCount: 1,
    canRetake: false,
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
    hasEssayQuestions: false,
    isReviewExpired: false,
    reviewExpiresAt: null,
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

  readonly canRetake = computed(
    () => !!this.feedback().canRetake && !!this.feedback().assessmentId
  );

  readonly remainingAttempts = computed(() =>
    Math.max(0, (this.feedback().maxAttempts || 1) - (this.feedback().completedAttemptsCount || 1))
  );

  readonly isReviewExpired = computed(
    () => !!this.feedback().isReviewExpired
  );

  readonly hasEssayQuestions = computed(
    () => !!this.feedback().hasEssayQuestions
  );

  readonly reviewTimeRemaining = computed(() => {
    const f = this.feedback();
    if (!f.hasEssayQuestions || !f.reviewExpiresAt || f.isReviewExpired) return null;
    const diff = new Date(f.reviewExpiresAt).getTime() - Date.now();
    if (diff <= 0) return 'انتهت فترة المراجعة';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (days > 0) {
      return `متبقي ${days} يوم و ${remainingHours} ساعة`;
    }
    return `متبقي ${hours} ساعة`;
  });

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
      const cached = this.swrCache.get<SubmissionFeedbackData>(`sub_feedback_${id}`);
      if (cached) {
        this.feedback.set(cached);
        this.isLoading.set(false);
      }
      this.fetchFeedback(id);
    } else {
      this.isLoading.set(false);
    }
  }

  fetchFeedback(id: string): void {
    const cacheKey = `sub_feedback_${id}`;
    if (!this.swrCache.has(cacheKey)) {
      this.isLoading.set(true);
    }
    this.http.get<{ success?: boolean; data?: any }>(`/api/v1/assessments/submissions/${id}/feedback`).subscribe({
      next: (res) => {
        const data = res?.data || res;
        if (data) {
          this.feedback.set({
            submissionId: data.submissionId || id,
            assessmentId: data.assessmentId || '',
            unitId: data.unitId || '',
            maxAttempts: data.maxAttempts ?? 1,
            completedAttemptsCount: data.completedAttemptsCount ?? 1,
            canRetake: data.canRetake ?? false,
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
            hasEssayQuestions: data.hasEssayQuestions ?? false,
            isReviewExpired: data.isReviewExpired ?? false,
            reviewExpiresAt: data.reviewExpiresAt || null,
            teacherFeedbackNotes: data.teacherFeedbackNotes || '',
            customMistakeCases: (data.customMistakeCases || []).map((m: any, idx: number) => ({
              questionId: m.questionId,
              questionOrder: m.questionOrder ?? idx + 1,
              questionPromptText: m.questionPromptText || '',
              questionImageUrl: m.questionImageUrl || m.question_image_url || m.imageUrl || null,
              studentAnswerText: m.studentAnswerText || '',
              correctAnswerText: m.correctAnswerText || '',
              errorNote: m.errorNote || '',
              youtubeSolutionUrl: m.youtubeSolutionUrl || null
            })),
            questionsReview: (data.questionsReview || []).map((q: any, idx: number) => ({
              questionId: q.questionId,
              questionOrder: q.questionOrder ?? idx + 1,
              questionType: q.questionType || q.question_type || q.type || 'MCQ',
              questionText: q.questionText || '',
              questionImageUrl: q.questionImageUrl || q.question_image_url || q.imageUrl || null,
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
          this.swrCache.set(cacheKey, this.feedback());

          // Trigger Celebration when results appear published
          if (this.isPublished() && isPlatformBrowser(this.platformId)) {
            try {
              const celebrationKey = `sm_celebration_shown_${id}`;
              if (!sessionStorage.getItem(celebrationKey)) {
                sessionStorage.setItem(celebrationKey, 'true');
                this.isCelebrationOpen.set(true);
              }
            } catch {
              this.isCelebrationOpen.set(true);
            }
          }
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.warn('Failed to load real submission feedback:', err);
        this.isLoading.set(false);
        this.loadError.set(err?.error?.error?.message || 'لا يوجد تسليم معتمد.');
      }
    });
  }

  openCelebration(): void {
    this.isCelebrationOpen.set(true);
  }

  closeCelebration(): void {
    this.isCelebrationOpen.set(false);
  }

  onCelebrationReturn(): void {
    this.isCelebrationOpen.set(false);
    if (this.returnToHome()) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/student']);
    }
  }

  onCelebrationReviewAnswers(): void {
    this.isCelebrationOpen.set(false);
  }

  readonly activeInPlatformSolution = signal<{
    rawUrl: string;
    embedUrl?: SafeResourceUrl | null;
    type: 'VIDEO' | 'POST';
    title: string;
  } | null>(null);

  openInPlatformSolution(url: string | null | undefined, title?: string): void {
    if (!url) return;
    const trimmed = url.trim();
    const videoId = this.extractYoutubeId(trimmed);

    if (videoId) {
      const embed = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
      );
      this.activeInPlatformSolution.set({
        rawUrl: trimmed,
        embedUrl: embed,
        type: 'VIDEO',
        title: title || (this.langService.isArabic() ? 'فيديو الحل النموذجي' : 'Video Solution')
      });
    } else {
      const safePostUrl = this.sanitizer.bypassSecurityTrustResourceUrl(trimmed);
      this.activeInPlatformSolution.set({
        rawUrl: trimmed,
        embedUrl: safePostUrl,
        type: 'POST',
        title: title || (this.langService.isArabic() ? 'منشور الحل النموذجي' : 'Post Solution')
      });
    }
  }

  closeInPlatformSolution(): void {
    this.activeInPlatformSolution.set(null);
  }

  private extractYoutubeId(url: string): string | null {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    return match ? match[1] : null;
  }

  isYoutubePost(url?: string | null): boolean {
    if (!url) return false;
    return !this.extractYoutubeId(url) && (url.includes('/post/') || url.includes('/community'));
  }

  openSolutionVideo(url: string | null | undefined): void {
    this.openInPlatformSolution(url);
  }
}
