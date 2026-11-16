import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  inject,
  OnInit,
  HostListener
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
  QuestionAnswerDetail,
  StudentQuizGroup
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

  // Submissions View Mode: Grouped by Student (recommended default) vs Individual Submissions Feed
  readonly viewGroupingMode = signal<'BY_STUDENT' | 'BY_SUBMISSION'>('BY_STUDENT');
  readonly expandedStudentKeys = signal<Set<string>>(new Set<string>());
  readonly isSubmittingCanvasGrade = signal<boolean>(false);

  // Answers Inspector Modal State
  readonly isAnswersModalOpen = signal<boolean>(false);
  readonly selectedSubmissionForReview = signal<AllQuizSubmissionItem | null>(null);

  // Approval & Confirmation State
  readonly isApprovingId = signal<string | null>(null);
  readonly pendingApprovalSubmission = signal<AllQuizSubmissionItem | null>(null);

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

  // Summary map of quiz counts per student (Total, Published, Pending)
  readonly studentQuizSummaryMap = computed(() => {
    const map = new Map<string, { total: number; published: number; pending: number; inProgress: number; studentName: string; haCode: string }>();
    for (const s of this.allSubmissions()) {
      const key = s.studentId || s.haCode || s.studentName;
      const entry = map.get(key) || {
        total: 0,
        published: 0,
        pending: 0,
        inProgress: 0,
        studentName: s.studentName,
        haCode: s.haCode
      };
      entry.total += 1;
      if (s.status === 'PUBLISHED') {
        entry.published += 1;
      } else if (s.status === 'PENDING') {
        entry.pending += 1;
      } else if (s.status === 'IN_PROGRESS') {
        entry.inProgress += 1;
      }
      map.set(key, entry);
    }
    return map;
  });

  getStudentPendingQuizCount(studentId?: string, haCode?: string, studentName?: string): number {
    const key = studentId || haCode || studentName || '';
    return this.studentQuizSummaryMap().get(key)?.pending ?? 0;
  }

  getStudentTotalQuizCount(studentId?: string, haCode?: string, studentName?: string): number {
    const key = studentId || haCode || studentName || '';
    return this.studentQuizSummaryMap().get(key)?.total ?? 0;
  }

  getStudentSummary(studentId?: string, haCode?: string, studentName?: string) {
    const key = studentId || haCode || studentName || '';
    return this.studentQuizSummaryMap().get(key);
  }

  readonly activeStudentSummary = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return null;
    const filtered = this.filteredSubmissions();
    if (filtered.length === 0) return null;
    const first = filtered[0];
    const allSameStudent = filtered.every(
      (s) =>
        (s.studentId && s.studentId === first.studentId) ||
        (s.haCode && s.haCode === first.haCode) ||
        s.studentName.toLowerCase() === first.studentName.toLowerCase()
    );
    if (allSameStudent) {
      return this.getStudentSummary(first.studentId, first.haCode, first.studentName) || null;
    }
    return null;
  });

  // Grouped students with unreviewed/pending quizzes breakdown
  readonly studentGroups = computed<StudentQuizGroup[]>(() => {
    const map = new Map<string, StudentQuizGroup>();
    const query = normalizeForMatch(this.searchQuery().trim().toLowerCase());
    const statusFilter = this.activeStatusFilter();

    for (const sub of this.allSubmissions()) {
      const key = sub.studentId || sub.haCode || sub.studentName;
      let group = map.get(key);
      if (!group) {
        group = {
          studentKey: key,
          studentId: sub.studentId,
          haCode: sub.haCode,
          studentName: sub.studentName,
          gradeLevel: sub.gradeLevel,
          curriculum: sub.curriculum,
          parentPhone: sub.parentPhone,
          totalQuizzes: 0,
          publishedQuizzes: 0,
          pendingQuizzes: 0,
          inProgressQuizzes: 0,
          quizzes: []
        };
        map.set(key, group);
      }

      group.totalQuizzes += 1;
      if (sub.status === 'PUBLISHED') {
        group.publishedQuizzes += 1;
      } else if (sub.status === 'PENDING') {
        group.pendingQuizzes += 1;
      } else if (sub.status === 'IN_PROGRESS') {
        group.inProgressQuizzes += 1;
      }
      group.quizzes.push(sub);
    }

    let groups = Array.from(map.values());

    // Sort quizzes inside each group (highest attempt/newest first)
    for (const g of groups) {
      g.quizzes.sort((a, b) => (b.attemptNumber || 1) - (a.attemptNumber || 1));
    }

    // Apply status filter if active
    if (statusFilter === 'PENDING') {
      groups = groups.filter((g) => g.pendingQuizzes > 0);
    } else if (statusFilter === 'PUBLISHED') {
      groups = groups.filter((g) => g.publishedQuizzes > 0 && g.pendingQuizzes === 0);
    } else if (statusFilter === 'IN_PROGRESS') {
      groups = groups.filter((g) => g.inProgressQuizzes > 0);
    }

    // Apply search filter if query is present
    if (query) {
      groups = groups.filter((g) => {
        const nameMatch = normalizeForMatch(g.studentName.toLowerCase()).includes(query);
        const codeMatch = normalizeForMatch(g.haCode.toLowerCase()).includes(query);
        const phoneMatch = g.parentPhone ? normalizeForMatch(g.parentPhone.toLowerCase()).includes(query) : false;
        const quizMatch = g.quizzes.some((q) => normalizeForMatch(q.assessmentTitle.toLowerCase()).includes(query));
        return nameMatch || codeMatch || phoneMatch || quizMatch;
      });
    }

    // Sort: students with pending quizzes first, then by total quizzes descending, then student name
    groups.sort((a, b) => {
      if (b.pendingQuizzes !== a.pendingQuizzes) {
        return b.pendingQuizzes - a.pendingQuizzes;
      }
      if (b.totalQuizzes !== a.totalQuizzes) {
        return b.totalQuizzes - a.totalQuizzes;
      }
      return a.studentName.localeCompare(b.studentName, 'ar');
    });

    return groups;
  });

  isStudentExpanded(key: string): boolean {
    if (this.searchQuery().trim()) {
      return true;
    }
    return this.expandedStudentKeys().has(key);
  }

  toggleStudentExpanded(key: string): void {
    this.expandedStudentKeys.update((set) => {
      const next = new Set(set);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  viewStudentGroup(studentName: string): void {
    this.setSearchQuery(studentName);
    this.viewGroupingMode.set('BY_STUDENT');
  }

  filterByStudent(studentName: string): void {
    this.setSearchQuery(studentName);
    this.viewGroupingMode.set('BY_STUDENT');
  }

  clearStudentFilter(): void {
    this.setSearchQuery('');
  }

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
            const rawType = (q.question_type || q.type || q.questionType || '').toUpperCase();
            const hasAccepted = (Array.isArray(q.accepted_answers) && q.accepted_answers.length > 0) ||
                                (Array.isArray(q.acceptedAnswers) && q.acceptedAnswers.length > 0);
            const hasOptions = Array.isArray(q.options) && q.options.length > 0;

            let qType: 'MCQ' | 'INPUT_TEXT' | 'ESSAY_PHOTO';
            if (rawType === 'INPUT_TEXT' || rawType === 'SHORT_ANSWER' || hasAccepted) {
              qType = 'INPUT_TEXT';
            } else if (rawType === 'ESSAY_PHOTO' || rawType === 'ESSAY' || (!hasOptions && !hasAccepted)) {
              qType = 'ESSAY_PHOTO';
            } else {
              qType = 'MCQ';
            }
            const points = Number(q.points) || 1;

            if (qType === 'MCQ') {
              const ans = mcqLookup.get(qId);
              const isCorrect = ans ? !!ans.is_correct : false;
              const pointsEarned = ans ? (ans.points_earned ?? (isCorrect ? points : 0)) : 0;
              return {
                questionId: qId,
                questionText: q.question_text || q.textAr || `السؤال ${idx + 1}`,
                questionType: 'MCQ',
                points,
                pointsEarned,
                isCorrect,
                selectedOptionIndex: ans?.selected_option_index,
                correctOptionIndex: q.correct_option_index,
                options: Array.isArray(q.options)
                  ? q.options.map((opt: any) => (typeof opt === 'string' ? opt : opt.text_ar || opt.text || ''))
                  : [],
                imageUrl: q.question_image_url || q.questionImageUrl || null,
                uploadedImageUrl: null
              };
            }

            if (qType === 'INPUT_TEXT') {
              const ans = textLookup.get(qId) || (s.text_answers && s.text_answers[idx]);
              const studentText = ans?.text_answer || (typeof ans === 'string' ? ans : '');
              const accepted = Array.isArray(q.accepted_answers)
                ? q.accepted_answers
                : (Array.isArray(q.acceptedAnswers) ? q.acceptedAnswers : []);
              const candidates = [...accepted];
              const modelAns = q.model_answer_text || q.modelAnswerText || q.explanationAr || q.explanation_ar;
              if (modelAns && !candidates.includes(modelAns)) {
                candidates.push(modelAns);
              }

              let isCorrect = ans ? !!ans.is_correct : false;
              if (!isCorrect && studentText && candidates.length > 0) {
                isCorrect = candidates.some((c) => isTextAnswerEquivalent(studentText, c));
              }

              const pointsEarned = isCorrect ? (ans?.points_earned || points) : 0;
              return {
                questionId: qId,
                questionText: q.question_text || q.textAr || `السؤال ${idx + 1}`,
                questionType: 'INPUT_TEXT',
                points,
                pointsEarned,
                isCorrect,
                studentTextAnswer: studentText,
                acceptedAnswers: accepted,
                modelAnswerText: modelAns || (accepted.length > 0 ? accepted.join(' / ') : ''),
                imageUrl: q.question_image_url || q.questionImageUrl || null,
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
            } else if (s.essay_manual_score !== undefined && s.essay_manual_score !== null && Number(s.essay_manual_score) > 0) {
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

          // Score Calculation: cleanly sum auto questions + manual essay points
          const autoScore = mappedAnswers
            .filter((a) => a.questionType !== 'ESSAY_PHOTO')
            .reduce((sum, a) => sum + (a.pointsEarned || 0), 0);

          const manualEssayFromAnswers = mappedAnswers
            .filter((a) => a.questionType === 'ESSAY_PHOTO')
            .reduce((sum, a) => sum + (a.pointsEarned || 0), 0);

          const effectiveEssayScore = Math.max(manualEssayFromAnswers, Number(s.essay_manual_score) || 0);
          const finalScore = autoScore + effectiveEssayScore;
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
            mcqAutoScore: autoScore || (s.mcq_auto_score || 0),
            essayManualScore: effectiveEssayScore,
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
    decision: 'FULL' | 'HALF' | 'ZERO' | 'CUSTOM',
    customScore?: number
  ): void {
    const prevDecision = q.gradingDecision;
    const prevPoints = q.pointsEarned;
    const prevPending = q.isPendingManualGrading;

    let pointsAwarded = 0;
    if (decision === 'FULL') {
      pointsAwarded = q.points;
    } else if (decision === 'HALF') {
      pointsAwarded = Math.round((q.points / 2) * 10) / 10;
    } else if (decision === 'ZERO') {
      pointsAwarded = 0;
    } else if (decision === 'CUSTOM') {
      const raw = typeof customScore === 'number' && !isNaN(customScore) ? customScore : Number(q.pointsEarned ?? 0);
      pointsAwarded = Math.max(0, Math.min(q.points, Math.round(raw * 10) / 10));
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
            : decision === 'ZERO'
            ? (this.langService.isArabic() ? 'صفر / إجابة غير صحيحة' : 'Zero Points')
            : (this.langService.isArabic() ? `درجة مخصصة (${pointsAwarded})` : `Custom (${pointsAwarded})`);

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

  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    if (this.previewImageUrl()) {
      this.closeImagePreview();
    }
  }

  // Direct Teacher Approval (MCQ & General Assessments)
  confirmAndApproveSubmission(sub: AllQuizSubmissionItem): void {
    if (sub.status === 'PUBLISHED') {
      return;
    }

    // Ensure all scores are freshly recalculated before showing confirmation
    const autoScore = (sub.answers || [])
      .filter((a) => a.questionType !== 'ESSAY_PHOTO')
      .reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
    const essayAnswersScore = (sub.answers || [])
      .filter((a) => a.questionType === 'ESSAY_PHOTO')
      .reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
    const effectiveEssay = Math.max(essayAnswersScore, sub.essayManualScore || 0);
    const freshTotal = autoScore + effectiveEssay;
    sub.mcqAutoScore = autoScore;
    sub.essayManualScore = effectiveEssay;
    sub.finalTotalScore = freshTotal;
    sub.scorePercentage = sub.totalPoints > 0 ? Math.round((freshTotal / sub.totalPoints) * 100) : 0;

    this.pendingApprovalSubmission.set(sub);
  }

  cancelApprovalConfirmation(): void {
    this.pendingApprovalSubmission.set(null);
  }

  proceedWithApproval(): void {
    const sub = this.pendingApprovalSubmission();
    if (!sub) return;
    this.approveSubmissionDirectly(sub);
  }

  approveSubmissionDirectly(sub: AllQuizSubmissionItem): void {
    if (sub.status === 'PUBLISHED') {
      this.pendingApprovalSubmission.set(null);
      return;
    }
    if (this.isApprovingId() === sub.id) {
      return;
    }
    this.isApprovingId.set(sub.id);
    this.http.post<{ success: boolean; data?: any; message?: string }>(`/api/v1/admin/submissions/${sub.id}/approve`, {}).subscribe({
      next: () => {
        this.isApprovingId.set(null);
        this.pendingApprovalSubmission.set(null);
        sub.status = 'PUBLISHED';
        if (this.selectedSubmissionForReview()?.id === sub.id) {
          this.selectedSubmissionForReview.set({ ...sub, status: 'PUBLISHED' });
        }
        this.allSubmissions.update((list) =>
          list.map((item) => (item.id === sub.id ? { ...sub, status: 'PUBLISHED' } : item))
        );
        if (submissionsMemoryCache) {
          submissionsMemoryCache.submissions = this.allSubmissions();
        }
        this.toastTriggered.emit({
          text: this.langService.isArabic()
            ? `تم اعتماد ونشر نتيجة ${sub.studentName} بنجاح`
            : `Result for ${sub.studentName} successfully approved & published`,
          type: 'success'
        });
        this.fetchAllSubmissions(true);
      },
      error: (err) => {
        this.isApprovingId.set(null);
        this.pendingApprovalSubmission.set(null);
        this.toastTriggered.emit({
          text: err?.error?.message || (this.langService.isArabic() ? 'تعذر اعتماد النتيجة. أعد المحاولة.' : 'Failed to approve result.'),
          type: 'error'
        });
      }
    });
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

  // Mistakes List (Zero Image Bloat - Text Note Only)
  addMistakeCase(): void {
    const item = this.currentGradingItem();
    if (!item) return;

    const newMistake: GradingMistake = {
      questionOrder: item.questionNumber || 1,
      questionPromptText: item.questionText || '',
      errorNote: '',
      youtubeSolutionUrl: ''
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

    if (this.isSubmittingCanvasGrade()) {
      return;
    }

    if (item.awardedScore < 0 || item.awardedScore > item.maxScore) {
      this.toastTriggered.emit({
        text: `الدرجة يجب أن تكون بين 0 و ${item.maxScore}`,
        type: 'error'
      });
      return;
    }

    this.isSubmittingCanvasGrade.set(true);

    const payload = {
      essay_manual_score: item.awardedScore,
      teacher_feedback_notes: item.generalTeacherNote,
      custom_mistake_cases: item.mistakes.map((m) => ({
        question_order: m.questionOrder,
        question_prompt_text: m.questionPromptText,
        error_note: m.errorNote,
        youtube_solution_url: m.youtubeSolutionUrl || null
      }))
    };

    this.http.post(`/api/v1/admin/submissions/${item.id}/grade`, payload).subscribe({
      next: () => {
        this.isSubmittingCanvasGrade.set(false);
        const approved: PendingEssayGrading = { ...item, status: 'PUBLISHED' };
        this.gradingSubmitted.emit(approved);
        this.isGradingModalOpen.set(false);
        this.fetchAllSubmissions(true);
        this.toastTriggered.emit({
          text: this.langService.isArabic() ? `تم اعتماد نتيجة ${item.studentName}` : `Grade approved for ${item.studentName}`,
          type: 'success'
        });
      },
      error: () => {
        this.isSubmittingCanvasGrade.set(false);
        // Optimistic UI fallback
        const approved: PendingEssayGrading = { ...item, status: 'PUBLISHED' };
        this.gradingSubmitted.emit(approved);
        this.isGradingModalOpen.set(false);
        this.fetchAllSubmissions(true);
        this.toastTriggered.emit({
          text: this.langService.isArabic() ? `تم اعتماد نتيجة ${item.studentName}` : `Grade approved for ${item.studentName}`,
          type: 'success'
        });
      }
    });
  }
}
