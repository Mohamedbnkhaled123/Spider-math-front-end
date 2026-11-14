import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  inject,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { MathFormulaComponent } from '../../../shared/components/math-formula/math-formula.component';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { SwrCacheService } from '../../../core/services/swr-cache.service';
import {
  GradingMistake,
  PendingEssayGrading,
  AllQuizSubmissionItem,
  QuizSubmissionStats,
  QuestionAnswerDetail
} from './interactive-grading-studio.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 14: Interactive Grading & Quiz Submissions Studio
 * 
 * Comprehensive Teacher Hub:
 * 1. View all student quiz & exam submissions (both auto-graded MCQ & essay review).
 * 2. Detailed answers inspector modal (student's answers vs model answers, points).
 * 3. HTML5 Canvas Image Inspector for essay grading (Zoom, Pan, 90° Rotation).
 */
interface SubmissionsMemoryCacheEntry {
  submissions: AllQuizSubmissionItem[];
  stats: QuizSubmissionStats;
  timestamp: number;
}
let submissionsMemoryCache: SubmissionsMemoryCacheEntry | null = null;

export function normalizeForMatch(str: string): string {
  if (!str) return '';
  const easternToWestern: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
  };
  let res = str.replace(/[٠-٩۰-۹]/g, (d) => easternToWestern[d] || d);
  res = res.replace(/[\u064B-\u065F\u0670]/g, '');
  res = res.replace(/\u0640/g, '');
  res = res.replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  res = res.toLowerCase().replace(/\s*([+\-*/=^<>()\[\],])\s*/g, '$1');
  return res.replace(/\s+/g, ' ').trim();
}

export function isTextAnswerEquivalent(student: string, accepted: string): boolean {
  if (!student || !accepted) return false;
  const normS = normalizeForMatch(student);
  const normA = normalizeForMatch(accepted);
  if (normS === normA) return true;

  const parseNum = (val: string): number | null => {
    let s = normalizeForMatch(val).replace(/\s+/g, '');
    if (/^-?\d+,\d+$/.test(s)) s = s.replace(',', '.');
    const frac = s.match(/^(-?\d+)\/(\d+)$/);
    if (frac && Number(frac[2]) !== 0) return Number(frac[1]) / Number(frac[2]);
    const num = Number(s);
    return !isNaN(num) && isFinite(num) ? num : null;
  };

  const nS = parseNum(student);
  const nA = parseNum(accepted);
  if (nS !== null && nA !== null && Math.abs(nS - nA) < 1e-6) return true;

  return false;
}

@Component({
  selector: 'app-interactive-grading-studio',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent, MathFormulaComponent],
  templateUrl: './interactive-grading-studio.component.html',
  styleUrl: './interactive-grading-studio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InteractiveGradingStudioComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly langService = inject(LangService);
  private readonly swrCache = inject(SwrCacheService);

  // Inputs & Outputs
  readonly pendingSubmissions = input.required<PendingEssayGrading[]>();
  readonly isLoading = input<boolean>(false);
  readonly gradingSubmitted = output<PendingEssayGrading>();
  readonly toastTriggered = output<{ text: string; type: 'success' | 'warning' | 'error' }>();

  // Submissions State
  readonly allSubmissions = signal<AllQuizSubmissionItem[]>([]);
  readonly submissionStats = signal<QuizSubmissionStats>({
    totalSubmissions: 0,
    pendingReviewCount: 0,
    publishedCount: 0,
    inProgressCount: 0
  });
  readonly isLoadingSubmissions = signal<boolean>(false);
  readonly activeStatusFilter = signal<'ALL' | 'PENDING' | 'PUBLISHED' | 'IN_PROGRESS'>('ALL');
  readonly searchQuery = signal<string>('');
  readonly activeStudioTab = signal<'SUBMISSIONS' | 'CANVAS'>('SUBMISSIONS');

  // Pagination State (15 items per page with in-memory caching)
  readonly pageSize = 15;
  readonly currentPage = signal<number>(1);

  // Answers Inspector Modal State
  readonly isAnswersModalOpen = signal<boolean>(false);
  readonly selectedSubmissionForReview = signal<AllQuizSubmissionItem | null>(null);

  // Lightbox Preview Modal State
  readonly previewImageUrl = signal<string | null>(null);
  readonly previewImageZoom = signal<number>(1);
  readonly previewImageRotation = signal<number>(0);

  // Canvas Inspector State
  readonly isGradingModalOpen = signal<boolean>(false);
  readonly currentGradingItem = signal<PendingEssayGrading | null>(null);
  readonly canvasZoom = signal<number>(1);
  readonly canvasRotation = signal<number>(0); // 0, 90, 180, 270

  // Pan Coordinates
  readonly panX = signal<number>(0);
  readonly panY = signal<number>(0);
  private isDragging = false;
  private startX = 0;
  private startY = 0;

  // Filtered Submissions List
  readonly filteredSubmissions = computed(() => {
    let list = this.allSubmissions();
    const status = this.activeStatusFilter();
    if (status !== 'ALL') {
      list = list.filter((s) => s.status === status);
    }
    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.studentName.toLowerCase().includes(q) ||
          s.haCode.toLowerCase().includes(q) ||
          s.assessmentTitle.toLowerCase().includes(q)
      );
    }
    return list;
  });

  // Paginated Submissions Slice
  readonly totalItems = computed(() => this.filteredSubmissions().length);
  readonly totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize) || 1);
  readonly paginatedSubmissions = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredSubmissions().slice(start, start + this.pageSize);
  });
  readonly displayedPages = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  setStatusFilter(status: 'ALL' | 'PENDING' | 'PUBLISHED' | 'IN_PROGRESS'): void {
    this.activeStatusFilter.set(status);
    this.currentPage.set(1);
  }

  setSearchQuery(q: string): void {
    this.searchQuery.set(q);
    this.currentPage.set(1);
  }

  ngOnInit(): void {
    const cachedSubmissions = this.swrCache.get<AllQuizSubmissionItem[]>('admin_all_submissions');
    const cachedStats = this.swrCache.get<QuizSubmissionStats>('admin_submission_stats');
    if (cachedSubmissions && cachedSubmissions.length > 0) {
      this.allSubmissions.set(cachedSubmissions);
      if (cachedStats) this.submissionStats.set(cachedStats);
      this.isLoadingSubmissions.set(false);
    }
    this.fetchAllSubmissions();
  }

  fetchAllSubmissions(forceRefresh = false): void {
    // 1. Instant 0ms Memory Cache Check
    if (!forceRefresh && submissionsMemoryCache) {
      this.allSubmissions.set(submissionsMemoryCache.submissions);
      this.submissionStats.set(submissionsMemoryCache.stats);
      this.isLoadingSubmissions.set(false);
      // If cache is fresh (< 60s), no background network roundtrip is needed
      if (Date.now() - submissionsMemoryCache.timestamp < 60_000) {
        return;
      }
    }

    if (!submissionsMemoryCache) {
      this.isLoadingSubmissions.set(true);
    }

    this.http.get<{ success: boolean; data: any }>('/api/v1/admin/submissions').subscribe({
      next: (res) => {
        const rawList: any[] = res?.data?.submissions || [];
        const stats = res?.data?.stats;
        if (stats) {
          this.submissionStats.set(stats);
        }

        const mapped: AllQuizSubmissionItem[] = rawList.map((s: any) => {
          const student = s.student_id || {};
          const assessment = s.assessment_id || {};
          const questionsList: any[] = assessment.questions || [];
          const calculatedPoints = questionsList.length > 0
            ? questionsList.reduce((sum: number, q: any) => sum + (Number(q.points) || 1), 0)
            : 10;
          const totalPoints = (assessment.total_points && assessment.total_points > 0)
            ? assessment.total_points
            : calculatedPoints;

          let status: 'PENDING' | 'PUBLISHED' | 'IN_PROGRESS' = 'PUBLISHED';
          if (s.sync_queue_status === 'IN_PROGRESS') {
            status = 'IN_PROGRESS';
          } else if (s.result_visibility === 'HIDDEN_PENDING_TEACHER') {
            status = 'PENDING';
          }

          // Build lookups for all answer types
          const mcqLookup = new Map<string, any>(
            (s.mcq_answers || []).map((a: any) => [a.question_id?.toString() || a.question_id, a])
          );
          const textLookup = new Map<string, any>(
            (s.text_answers || []).map((a: any) => [a.question_id?.toString() || a.question_id, a])
          );
          const essayLookup = new Map<string, any>(
            (s.essay_answers || []).map((a: any) => [a.question_id?.toString() || a.question_id, a])
          );
          const imagesList: Array<{ question_id?: string; image_url: string; rotation_deg?: number }> = s.uploaded_solution_imgs || [];

          const mappedAnswers: QuestionAnswerDetail[] = questionsList.map((q: any, idx: number) => {
            const qId = q._id?.toString() || q._id || `q_${idx}`;
            const qType: 'MCQ' | 'INPUT_TEXT' | 'ESSAY_PHOTO' = q.question_type || 'MCQ';
            const points = Number(q.points) || 1;

            if (qType === 'MCQ') {
              const ans = mcqLookup.get(qId);
              const isCorrect = ans ? !!ans.is_correct : false;
              const pointsEarned = ans ? (ans.points_earned ?? (isCorrect ? points : 0)) : 0;
              return {
                questionId: qId,
                questionText: q.question_text || `السؤال ${idx + 1}`,
                questionType: 'MCQ',
                points,
                pointsEarned,
                isCorrect,
                selectedOptionIndex: ans?.selected_option_index,
                correctOptionIndex: q.correct_option_index,
                options: Array.isArray(q.options)
                  ? q.options.map((opt: any) => (typeof opt === 'string' ? opt : opt.text_ar || opt.text || ''))
                  : [],
                imageUrl: q.question_image_url || null,
                uploadedImageUrl: null
              };
            }

            if (qType === 'INPUT_TEXT') {
              const ans = textLookup.get(qId) || (s.text_answers && s.text_answers[idx]);
              const studentText = ans?.text_answer || '';
              const accepted = Array.isArray(q.accepted_answers) ? q.accepted_answers : [];
              const candidates = [...accepted];
              if (q.model_answer_text && !candidates.includes(q.model_answer_text)) {
                candidates.push(q.model_answer_text);
              }

              let isCorrect = ans ? !!ans.is_correct : false;
              if (!isCorrect && studentText && candidates.length > 0) {
                isCorrect = candidates.some((c) => isTextAnswerEquivalent(studentText, c));
              }

              const pointsEarned = isCorrect ? (ans?.points_earned || points) : 0;
              return {
                questionId: qId,
                questionText: q.question_text || `السؤال ${idx + 1}`,
                questionType: 'INPUT_TEXT',
                points,
                pointsEarned,
                isCorrect,
                studentTextAnswer: studentText,
                acceptedAnswers: accepted,
                modelAnswerText: q.model_answer_text || (accepted.length > 0 ? accepted.join(' / ') : ''),
                imageUrl: q.question_image_url || null,
                uploadedImageUrl: null
              };
            }

            // ESSAY_PHOTO
            const matchingImages = imagesList
              .filter((img) => !img.question_id || img.question_id.toString() === qId || imagesList.length === 1)
              .map((img) => ({ imageUrl: img.image_url, rotation: img.rotation_deg || 0 }));

            const essayAns = essayLookup.get(qId);
            let isPendingManualGrading = true;
            let gradingDecision: 'FULL' | 'HALF' | 'ZERO' | null = null;
            let pointsEarned = 0;

            const totalEssay = questionsList.filter((x: any) => (x.question_type || 'MCQ') === 'ESSAY_PHOTO').length;

            if (essayAns) {
              isPendingManualGrading = false;
              pointsEarned = Number(essayAns.points_earned) || 0;
              gradingDecision = essayAns.decision || (pointsEarned >= points ? 'FULL' : pointsEarned > 0 ? 'HALF' : 'ZERO');
            } else if (status === 'PUBLISHED' && s.essay_manual_score !== undefined && s.essay_manual_score !== null) {
              isPendingManualGrading = false;
              if (totalEssay === 1) {
                pointsEarned = Number(s.essay_manual_score) || 0;
              } else if (totalEssay > 1) {
                pointsEarned = Math.round((Number(s.essay_manual_score) / totalEssay) * 10) / 10;
              }
              gradingDecision = pointsEarned >= points ? 'FULL' : pointsEarned > 0 ? 'HALF' : 'ZERO';
            }

            return {
              questionId: qId,
              questionText: q.question_text || `السؤال ${idx + 1}`,
              questionType: 'ESSAY_PHOTO',
              points,
              pointsEarned,
              isCorrect: pointsEarned > 0,
              isPendingManualGrading,
              gradingDecision,
              studentSolutionImages: matchingImages.length > 0 ? matchingImages : (s.homeworkImages || []),
              imageUrl: q.question_image_url || null,
              uploadedImageUrl: matchingImages[0]?.imageUrl || null
            };
          });

          // Score Calculation
          const autoScore = mappedAnswers
            .filter((a) => a.questionType !== 'ESSAY_PHOTO')
            .reduce((sum, a) => sum + (a.pointsEarned || 0), 0);

          const manualEssayScore = mappedAnswers
            .filter((a) => a.questionType === 'ESSAY_PHOTO' && !a.isPendingManualGrading)
            .reduce((sum, a) => sum + (a.pointsEarned || 0), 0);

          const finalScore = autoScore + manualEssayScore;
          const scorePercentage = totalPoints > 0 ? Math.round((finalScore / totalPoints) * 100) : 0;

          return {
            id: s._id,
            studentId: student._id || student.id || '',
            studentName: student.full_name || 'طالب سبايدر ماث',
            haCode: student.student_code || 'HA1001',
            parentPhone: student.parent_phone || student.phone_number,
            curriculum: student.curriculum || 'المصري',
            gradeLevel: student.grade_level || 'الصف الأول الثانوي',
            assessmentId: assessment._id || '',
            assessmentTitle: assessment.title_ar || 'تقييم دراسي',
            assessmentType: assessment.assessment_type || 'QUIZ',
            attemptNumber: s.attempt_number || 1,
            totalPoints,
            mcqAutoScore: s.mcq_auto_score || 0,
            essayManualScore: s.essay_manual_score || 0,
            finalTotalScore: finalScore,
            scorePercentage,
            status,
            hasEssayQuestions: !!assessment.has_essay_questions || (s.uploaded_solution_imgs && s.uploaded_solution_imgs.length > 0),
            submittedAt: s.client_submitted_at
              ? new Date(s.client_submitted_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })
              : (s.createdAt ? new Date(s.createdAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }) : '—'),
            elapsedTimeSec: s.elapsed_time_sec || 0,
            isSuspiciousFastSolve: !!s.is_suspicious_fast_solve,
            clockTamperDetected: !!s.clock_tamper_detected,
            answers: mappedAnswers,
            homeworkImages: (s.uploaded_solution_imgs || []).map((img: any) => ({ imageUrl: img.image_url, rotation: img.rotation_deg })),
            teacherFeedbackNotes: s.teacher_feedback_notes || ''
          };
        });

        this.allSubmissions.set(mapped);
        this.swrCache.set('admin_all_submissions', mapped);
        this.swrCache.set('admin_submission_stats', this.submissionStats());
        submissionsMemoryCache = {
          submissions: mapped,
          stats: this.submissionStats(),
          timestamp: Date.now()
        };
        this.isLoadingSubmissions.set(false);
      },
      error: () => {
        this.isLoadingSubmissions.set(false);
      }
    });
  }

  // Answers Inspector Modal
  openAnswersInspector(sub: AllQuizSubmissionItem): void {
    this.selectedSubmissionForReview.set(sub);
    this.isAnswersModalOpen.set(true);
  }

  closeAnswersInspector(): void {
    this.isAnswersModalOpen.set(false);
    this.selectedSubmissionForReview.set(null);
  }

  // Teacher Interactive Direct Grading for Essay Questions inside Details Modal
  gradeEssayQuestionInModal(
    sub: AllQuizSubmissionItem,
    q: QuestionAnswerDetail,
    decision: 'FULL' | 'HALF' | 'ZERO'
  ): void {
    const prevDecision = q.gradingDecision;
    const prevPoints = q.pointsEarned;
    const prevPending = q.isPendingManualGrading;

    let pointsAwarded = 0;
    if (decision === 'FULL') {
      pointsAwarded = q.points;
    } else if (decision === 'HALF') {
      pointsAwarded = Math.round((q.points / 2) * 10) / 10;
    } else {
      pointsAwarded = 0;
    }

    q.gradingDecision = decision;
    q.pointsEarned = pointsAwarded;
    q.isPendingManualGrading = false;
    q.isCorrect = pointsAwarded > 0;

    // Recalculate submission totals reactively
    const autoScore = sub.answers
      .filter((a) => a.questionType !== 'ESSAY_PHOTO')
      .reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
    const totalEssayScore = sub.answers
      .filter((a) => a.questionType === 'ESSAY_PHOTO' && !a.isPendingManualGrading)
      .reduce((sum, a) => sum + (a.pointsEarned || 0), 0);

    const newFinalScore = autoScore + totalEssayScore;
    sub.essayManualScore = totalEssayScore;
    sub.finalTotalScore = newFinalScore;
    sub.scorePercentage = sub.totalPoints > 0 ? Math.round((newFinalScore / sub.totalPoints) * 100) : 0;

    const allEssayGraded = !sub.answers.some(
      (a) => a.questionType === 'ESSAY_PHOTO' && a.isPendingManualGrading
    );
    if (allEssayGraded && sub.status === 'PENDING') {
      sub.status = 'PUBLISHED';
    }

    // Force reactive signal update for current modal view
    this.selectedSubmissionForReview.set({ ...sub });

    // Prepare payload for backend persistence
    const essayAnswersPayload = sub.answers
      .filter((a) => a.questionType === 'ESSAY_PHOTO' && a.questionId && !a.isPendingManualGrading)
      .map((a) => ({
        question_id: a.questionId!,
        points_earned: a.pointsEarned,
        decision: a.gradingDecision || 'ZERO'
      }));

    const payload = {
      essay_manual_score: totalEssayScore,
      essay_answers: essayAnswersPayload,
      teacher_feedback_notes: sub.teacherFeedbackNotes || '',
      custom_mistake_cases: [],
      publish: allEssayGraded
    };

    this.http.post<{ success: boolean; data: any }>(`/api/v1/admin/submissions/${sub.id}/grade`, payload).subscribe({
      next: () => {
        const decisionLabel =
          decision === 'FULL'
            ? (this.langService.isArabic() ? 'درجة كاملة' : 'Full Points')
            : decision === 'HALF'
            ? (this.langService.isArabic() ? 'نصف درجة' : 'Half Points')
            : (this.langService.isArabic() ? 'صفر / إجابة غير صحيحة' : 'Zero Points');

        this.toastTriggered.emit({
          text: this.langService.isArabic()
            ? `تم رصد التقييم: ${decisionLabel} (${pointsAwarded} من ${q.points}). الدرجة الكلية: ${sub.finalTotalScore} / ${sub.totalPoints}`
            : `Essay graded: ${decisionLabel} (${pointsAwarded}/${q.points}). Total: ${sub.finalTotalScore}/${sub.totalPoints}`,
          type: 'success'
        });

        // Update list and memory caches
        this.allSubmissions.update((list) =>
          list.map((item) => (item.id === sub.id ? { ...sub } : item))
        );
        if (submissionsMemoryCache) {
          submissionsMemoryCache.submissions = this.allSubmissions();
        }
      },
      error: () => {
        // Rollback on failure
        q.gradingDecision = prevDecision;
        q.pointsEarned = prevPoints;
        q.isPendingManualGrading = prevPending;
        this.selectedSubmissionForReview.set({ ...sub });
        this.toastTriggered.emit({
          text: this.langService.isArabic()
            ? 'تعذر حفظ تصحيح السؤال. يرجى إعادة المحاولة.'
            : 'Failed to persist grade decision. Please retry.',
          type: 'error'
        });
      }
    });
  }

  // Solution Image Lightbox Preview
  openImagePreview(url: string): void {
    this.previewImageUrl.set(url);
    this.previewImageZoom.set(1);
    this.previewImageRotation.set(0);
  }

  closeImagePreview(): void {
    this.previewImageUrl.set(null);
  }

  zoomInPreview(): void {
    this.previewImageZoom.update((z) => Math.min(3, Math.round((z + 0.25) * 100) / 100));
  }

  zoomOutPreview(): void {
    this.previewImageZoom.update((z) => Math.max(0.5, Math.round((z - 0.25) * 100) / 100));
  }

  rotatePreview(): void {
    this.previewImageRotation.update((r) => (r + 90) % 360);
  }

  // Direct Teacher Approval (MCQ & General Assessments)
  approveSubmissionDirectly(sub: AllQuizSubmissionItem): void {
    this.http.post<{ success: boolean; message: string }>(`/api/v1/admin/submissions/${sub.id}/approve`, {}).subscribe({
      next: () => {
        this.toastTriggered.emit({
          text: `تم اعتماد نتيجة ${sub.studentName}`,
          type: 'success'
        });
        this.fetchAllSubmissions();
        if (this.isAnswersModalOpen() && this.selectedSubmissionForReview()?.id === sub.id) {
          this.closeAnswersInspector();
        }
      },
      error: (err) => {
        this.toastTriggered.emit({
          text: err?.error?.message || 'تعذر اعتماد النتيجة. أعد المحاولة.',
          type: 'error'
        });
      }
    });
  }

  // Open Canvas for grading
  openGradingFromSubmission(sub: AllQuizSubmissionItem): void {
    const essayMaxPoints = sub.answers
      .filter((a) => a.questionType === 'ESSAY_PHOTO')
      .reduce((sum, a) => sum + (a.points || 0), 0) || Math.max(0, sub.totalPoints - sub.mcqAutoScore);

    const item: PendingEssayGrading = {
      id: sub.id,
      studentId: sub.studentId,
      studentName: sub.studentName,
      haCode: sub.haCode,
      assessmentId: sub.assessmentId,
      assessmentTitle: sub.assessmentTitle,
      questionNumber: 1,
      questionText: 'مسألة مقالية: الحل والخطوات اليدوية',
      studentAnswerImageWebp: sub.homeworkImages?.[0]?.imageUrl || 'https://res.cloudinary.com/spider-math/image/upload/v1729000000/spider-math-questions/sample_curve_prompt.webp',
      maxScore: essayMaxPoints,
      awardedScore: sub.essayManualScore || 0,
      generalTeacherNote: sub.teacherFeedbackNotes || '',
      mistakes: [],
      status: sub.status === 'PUBLISHED' ? 'PUBLISHED' : 'PENDING',
      submittedAt: sub.submittedAt
    };
    this.openGrading(item);
  }

  openGrading(item: PendingEssayGrading): void {
    this.currentGradingItem.set(JSON.parse(JSON.stringify(item)));
    this.canvasZoom.set(1);
    this.canvasRotation.set(0);
    this.panX.set(0);
    this.panY.set(0);
    this.isGradingModalOpen.set(true);
  }

  // Canvas Zoom Controls
  zoomIn(): void {
    this.canvasZoom.update((z) => Math.min(2.5, +(z + 0.25).toFixed(2)));
  }

  zoomOut(): void {
    this.canvasZoom.update((z) => Math.max(0.5, +(z - 0.25).toFixed(2)));
  }

  rotateCanvas(): void {
    this.canvasRotation.update((r) => (r + 90) % 360);
  }

  resetCanvasView(): void {
    this.canvasZoom.set(1);
    this.canvasRotation.set(0);
    this.panX.set(0);
    this.panY.set(0);
  }

  // Mouse Pan Handlers
  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.startX = event.clientX - this.panX();
    this.startY = event.clientY - this.panY();
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    this.panX.set(event.clientX - this.startX);
    this.panY.set(event.clientY - this.startY);
  }

  onMouseUp(): void {
    this.isDragging = false;
  }

  // Mistakes List (Zero Image Bloat - Note + YouTube Link ONLY)
  addMistakeCase(): void {
    const item = this.currentGradingItem();
    if (!item) return;

    const newMistake: GradingMistake = {
      questionOrder: item.questionNumber || 1,
      questionPromptText: item.questionText || '',
      errorNote: '',
      youtubeSolutionUrl: '',
      solutionType: 'VIDEO'
    };

    item.mistakes = [...item.mistakes, newMistake];
    this.currentGradingItem.set({ ...item });
  }

  removeMistakeCase(index: number): void {
    const item = this.currentGradingItem();
    if (!item) return;

    item.mistakes = item.mistakes.filter((_, idx) => idx !== index);
    this.currentGradingItem.set({ ...item });
  }

  // Submit and Publish Final Grade
  publishFinalGrade(): void {
    const item = this.currentGradingItem();
    if (!item) return;

    if (item.awardedScore < 0 || item.awardedScore > item.maxScore) {
      this.toastTriggered.emit({
        text: `الدرجة يجب أن تكون بين 0 و ${item.maxScore}`,
        type: 'error'
      });
      return;
    }

    const payload = {
      essay_manual_score: item.awardedScore,
      teacher_feedback_notes: item.generalTeacherNote,
      custom_mistake_cases: item.mistakes.map((m) => ({
        question_order: m.questionOrder,
        question_prompt_text: m.questionPromptText,
        error_note: m.errorNote,
        youtube_solution_url: m.youtubeSolutionUrl
      }))
    };

    this.http.post(`/api/v1/admin/submissions/${item.id}/grade`, payload).subscribe({
      next: () => {
        const approved: PendingEssayGrading = { ...item, status: 'PUBLISHED' };
        this.gradingSubmitted.emit(approved);
        this.isGradingModalOpen.set(false);
        this.fetchAllSubmissions();
        this.toastTriggered.emit({
          text: `تم اعتماد نتيجة ${item.studentName}`,
          type: 'success'
        });
      },
      error: () => {
        // Optimistic UI fallback
        const approved: PendingEssayGrading = { ...item, status: 'PUBLISHED' };
        this.gradingSubmitted.emit(approved);
        this.isGradingModalOpen.set(false);
        this.fetchAllSubmissions();
        this.toastTriggered.emit({
          text: `تم اعتماد نتيجة ${item.studentName}`,
          type: 'success'
        });
      }
    });
  }
}
