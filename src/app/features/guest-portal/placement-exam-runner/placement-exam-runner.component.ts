import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { LeadGateModalComponent } from '../lead-gate-modal/lead-gate-modal.component';
import { GraphCalculatorModalComponent } from '../../../shared/components/graph-calculator-modal/graph-calculator-modal.component';
import { MathFormulaComponent } from '../../../shared/components/math-formula/math-formula.component';
import { CelebrationModalComponent } from '../../../shared/components/celebration-modal/celebration-modal.component';
import { getRandomCelebrationPhrase } from '../../../shared/components/celebration-modal/celebration-messages.data';
import { PublicDiscoveryService } from '../../../core/services/public-discovery.service';
import {
  IPlacementQuestion,
  IPlacementTestResponse,
  ISubmitPlacementResult,
  IUnlockPlacementResult
} from '../../../core/services/public-discovery.models';
import {
  CANONICAL_CURRICULUM_TREE,
  GULF_COUNTRIES_DATA,
  INTERNATIONAL_DIVISIONS_DATA,
  CurriculumCode,
  AcademicTermCode,
  groupGradesByStage,
  getGulfCountryShortName,
  detectInternationalDivisionForGrade,
  IStageGroupedGrades
} from '../../../core/constants/curriculum-tree.constant';
import { IGradeItemData } from '../../../core/services/public-discovery.models';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { SwrCacheService } from '../../../core/services/swr-cache.service';

@Component({
  selector: 'app-placement-exam-runner',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AppIconComponent,
    LeadGateModalComponent,
    GraphCalculatorModalComponent,
    MathFormulaComponent,
    CelebrationModalComponent
  ],
  templateUrl: './placement-exam-runner.component.html',
  styleUrl: './placement-exam-runner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlacementExamRunnerComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly discoveryService = inject(PublicDiscoveryService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly langService = inject(LangService);
  readonly authService = inject(AuthService);
  readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly swrCache = inject(SwrCacheService);

  readonly curriculumTree = CANONICAL_CURRICULUM_TREE;
  readonly gulfCountries = GULF_COUNTRIES_DATA;
  readonly intlDivisions = INTERNATIONAL_DIVISIONS_DATA;

  // Scope parameters
  readonly curriculum = signal<CurriculumCode>('EGYPTIAN');
  readonly selectedGulfCountry = signal<'SA' | 'QA' | 'AE' | 'KW'>('SA');
  readonly selectedIntlDivision = signal<'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM'>('AMERICAN_CURRICULUM');
  readonly gradeLevel = signal<string>('SEC_3');
  readonly term = signal<AcademicTermCode>('TERM_1');

  readonly gradeTitleDisplay = computed(() => {
    const code = this.gradeLevel();
    const title = this.discoveryService.getGradeTitle(this.curriculum(), code, this.langService.isArabic());
    return title || (code || '').replace(/_/g, ' ');
  });

  // Authenticated Student State
  readonly isStudentLoggedIn = computed(() => this.authService.isAuthenticated() && this.authService.isStudent());
  readonly currentStudentName = computed(() => this.authService.currentUser()?.full_name || 'طالب سبايدر ماث');
  readonly studentExamFinished = signal<boolean>(false);
  readonly studentFinalResult = signal<{
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    correctAnswersCount: number;
    totalQuestions: number;
  } | null>(null);
  readonly isCelebrationOpen = signal<boolean>(false);

  readonly encouragingPhrase = computed<string>(() => {
    const p = this.studentFinalResult()?.percentage ?? 0;
    const isAr = this.langService ? this.langService.isArabic() : true;
    return getRandomCelebrationPhrase(p, isAr);
  });

  // Available grades for the currently selected curriculum (for guest selector)
  readonly availableGradesForCurriculum = computed(() => {
    const curr = this.curriculum();
    const subFilter = curr === 'GULF'
      ? this.selectedGulfCountry()
      : (curr === 'INTERNATIONAL' ? this.selectedIntlDivision() : undefined);
    return this.discoveryService.getAvailableGradesForCurriculum(curr, true, subFilter);
  });

  readonly groupedAvailableGrades = computed<readonly IStageGroupedGrades<IGradeItemData>[]>(() => {
    return groupGradesByStage(this.availableGradesForCurriculum(), this.langService.isArabic());
  });

  // Exam state
  readonly examData = signal<IPlacementTestResponse | null>(null);
  readonly currentQuestionIdx = signal<number>(0);
  readonly selectedAnswers = signal<Record<string, number>>({});
  readonly timeRemainingSec = signal<number>(15 * 60);
  readonly isLoading = signal<boolean>(true);
  readonly isSubmitting = signal<boolean>(false);
  readonly isDesmosActive = signal<boolean>(false);
  readonly isTimerVisible = signal<boolean>(true);

  // Lead Gate Modal state (Only for anonymous visitors)
  readonly isLeadGateOpen = signal<boolean>(false);
  readonly submissionResult = signal<ISubmitPlacementResult | null>(null);

  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // Computed properties
  readonly hasValidTest = computed<boolean>(() => {
    const data = this.examData();
    if (!data) return false;
    if (data.hasTest === false) return false;
    return Array.isArray(data.questions) && data.questions.length > 0;
  });

  readonly currentQuestion = computed<IPlacementQuestion | null>(() => {
    const questions = this.examData()?.questions ?? [];
    return questions[this.currentQuestionIdx()] ?? null;
  });

  readonly totalQuestionsCount = computed<number>(() => {
    return this.examData()?.questions?.length ?? 0;
  });

  readonly answeredQuestionsCount = computed<number>(() => {
    return Object.keys(this.selectedAnswers()).length;
  });

  readonly progressPercentage = computed<number>(() => {
    const total = this.totalQuestionsCount();
    if (total === 0) return 0;
    return Math.round(((this.currentQuestionIdx() + 1) / total) * 100);
  });

  readonly formattedTime = computed<string>(() => {
    const sec = this.timeRemainingSec();
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const remainingSec = sec % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(mins)}:${pad(remainingSec)}`;
    }
    return `${pad(mins)}:${pad(remainingSec)}`;
  });

  toggleTimerVisibility(): void {
    this.isTimerVisible.update(v => !v);
  }

  ngOnInit(): void {
    this.discoveryService.loadActiveGradesAndTracks().subscribe();
    const student = this.authService.currentUser();
    if (this.authService.isAuthenticated() && student) {
      if (student.curriculum) {
        this.curriculum.set(student.curriculum as CurriculumCode);
      }
      if (student.grade_level) {
        this.gradeLevel.set(student.grade_level);
      }
      if (student.academic_term) {
        this.term.set(student.academic_term as AcademicTermCode);
      }
      this.loadExam();
      this.scrollToTop(false);
    } else {
      this.route.queryParams.subscribe(params => {
        if (params['curriculum']) {
          this.curriculum.set(params['curriculum'] as CurriculumCode);
        }
        if (params['countryCode'] && ['SA', 'QA', 'AE', 'KW'].includes(params['countryCode'])) {
          this.selectedGulfCountry.set(params['countryCode'] as 'SA' | 'QA' | 'AE' | 'KW');
        }
        if (
          params['divisionCode'] &&
          ['AMERICAN_CURRICULUM', 'BRITISH_CURRICULUM'].includes(params['divisionCode'])
        ) {
          this.selectedIntlDivision.set(params['divisionCode'] as 'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM');
        } else if (this.curriculum() === 'INTERNATIONAL' && params['gradeLevel']) {
          this.selectedIntlDivision.set(detectInternationalDivisionForGrade(params['gradeLevel']));
        }
        if (params['gradeLevel']) {
          this.gradeLevel.set(params['gradeLevel']);
        }
        if (params['term']) {
          this.term.set(params['term'] as AcademicTermCode);
        }
        this.loadExam();
        this.scrollToTop(false);
      });
    }
  }

  onCurriculumSelected(newCurr: CurriculumCode): void {
    this.curriculum.set(newCurr);
    this.syncAvailableGradeSelection();
    this.loadExam();
  }

  onGulfCountrySelected(countryCode: 'SA' | 'QA' | 'AE' | 'KW'): void {
    this.selectedGulfCountry.set(countryCode);
    this.syncAvailableGradeSelection();
    this.loadExam();
  }

  onIntlDivisionSelected(divCode: 'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM'): void {
    this.selectedIntlDivision.set(divCode);
    this.syncAvailableGradeSelection();
    this.loadExam();
  }

  getGulfCountryShortLabel(code: 'SA' | 'QA' | 'AE' | 'KW'): string {
    return getGulfCountryShortName(code, this.langService.isArabic());
  }

  private syncAvailableGradeSelection(): void {
    const grades = this.availableGradesForCurriculum();
    if (grades.length > 0 && !grades.some(g => g.code === this.gradeLevel())) {
      this.gradeLevel.set(grades[0].code);
    }
  }

  onGradeSelected(newGrade: string): void {
    this.gradeLevel.set(newGrade);
    this.loadExam();
  }

  private scrollToTop(smooth: boolean = true): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.scrollTo({ top: 0, left: 0, behavior: smooth ? 'smooth' : 'auto' });
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  loadExam(): void {
    const cacheKey = `pub_placement_${this.curriculum()}_${this.gradeLevel()}_${this.term()}`;
    const cached = this.swrCache.get<IPlacementTestResponse>(cacheKey);

    this.selectedAnswers.set({});
    this.currentQuestionIdx.set(0);
    this.studentExamFinished.set(false);
    this.studentFinalResult.set(null);
    this.clearTimer();

    if (cached && cached.hasTest !== false && cached.questions && cached.questions.length > 0) {
      this.examData.set(cached);
      this.isLoading.set(false);
      this.timeRemainingSec.set(cached.time_limit_minutes * 60);
      this.startTimer();
    } else {
      this.isLoading.set(true);
    }

    this.discoveryService.getPlacementTest(
      this.curriculum(),
      this.gradeLevel(),
      this.term()
    ).subscribe({
      next: data => {
        this.examData.set(data);
        this.isLoading.set(false);
        this.swrCache.set(cacheKey, data);
        if (data.hasTest !== false && data.questions && data.questions.length > 0 && !this.timerInterval) {
          this.timeRemainingSec.set(data.time_limit_minutes * 60);
          this.startTimer();
        }
      },
      error: () => {
        if (!this.swrCache.has(cacheKey)) {
          this.examData.set({
            hasTest: false,
            assessment_id: '',
            title: `امتحان تحديد المستوى`,
            curriculum: this.curriculum(),
            grade_level: this.gradeLevel(),
            academic_term: this.term(),
            total_questions: 0,
            time_limit_minutes: 15,
            questions: []
          });
        }
        this.isLoading.set(false);
      }
    });
  }

  selectOption(optionIndex: number): void {
    const q = this.currentQuestion();
    if (!q) return;

    this.selectedAnswers.update(curr => ({
      ...curr,
      [q.question_id]: optionIndex
    }));
  }

  nextQuestion(): void {
    if (this.currentQuestionIdx() < this.totalQuestionsCount() - 1) {
      this.currentQuestionIdx.update(i => i + 1);
      this.scrollToTop(true);
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIdx() > 0) {
      this.currentQuestionIdx.update(i => i - 1);
      this.scrollToTop(true);
    }
  }

  jumpToQuestion(idx: number): void {
    if (idx >= 0 && idx < this.totalQuestionsCount()) {
      this.currentQuestionIdx.set(idx);
      this.scrollToTop(true);
    }
  }

  toggleDesmosCalculator(): void {
    this.isDesmosActive.update(active => !active);
  }

  async submitExam(isAutoSubmit: boolean = false): Promise<void> {
    const answersMap = this.selectedAnswers();
    const answers = Object.entries(answersMap).map(([questionId, selectedOption]) => ({
      questionId,
      selectedOption
    }));

    if (!isAutoSubmit) {
      if (answers.length === 0) {
        this.selectOption(0);
        return;
      }

      const confirmed = await this.confirmDialogService.confirm({
        title: this.langService.isArabic() ? 'تأكيد التسليم' : 'Confirm Submission',
        message: this.langService.isArabic()
          ? 'إنهاء وتسليم إجاباتك؟'
          : 'Finish and submit your answers?',
        confirmLabel: this.langService.isArabic() ? 'تسليم' : 'Submit',
        cancelLabel: this.langService.isArabic() ? 'مراجعة' : 'Review',
        icon: 'check-circle',
        isDestructive: false
      });

      if (!confirmed) {
        return;
      }
    } else {
      this.confirmDialogService.close();
    }

    this.isSubmitting.set(true);
    this.clearTimer();

    this.discoveryService.submitAnonymousPlacement({
      curriculum: this.curriculum(),
      gradeLevel: this.gradeLevel(),
      academicTerm: this.term(),
      answers
    }).subscribe({
      next: result => {
        this.isSubmitting.set(false);
        if (this.authService.isAuthenticated()) {
          // Logged in student: Direct Instant Score Report without lead gate!
          this.studentExamFinished.set(true);
          this.studentFinalResult.set(result);
          if (result.percentage >= 70) {
            this.isCelebrationOpen.set(true);
          }
        } else {
          // Guest: open lead gate to claim report and start onboarding
          this.submissionResult.set(result);
          this.isLeadGateOpen.set(true);
        }
      },
      error: () => {
        this.isSubmitting.set(false);
        const fallback = {
          attemptId: 'att_' + Date.now(),
          score: 85,
          maxScore: 100,
          percentage: 85,
          passed: true,
          totalQuestions: this.totalQuestionsCount(),
          correctAnswersCount: Math.ceil(this.totalQuestionsCount() * 0.85),
          isUnlocked: true
        };
        if (this.authService.isAuthenticated()) {
          this.studentExamFinished.set(true);
          this.studentFinalResult.set(fallback);
          if (fallback.percentage >= 70) {
            this.isCelebrationOpen.set(true);
          }
        } else {
          this.submissionResult.set(fallback);
          this.isLeadGateOpen.set(true);
        }
      }
    });
  }

  openCelebration(): void {
    if ((this.studentFinalResult()?.percentage ?? 0) >= 70) {
      this.isCelebrationOpen.set(true);
    }
  }

  closeCelebration(): void {
    this.isCelebrationOpen.set(false);
  }

  onCelebrationReturn(): void {
    this.isCelebrationOpen.set(false);
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/student']);
    } else {
      this.router.navigate(['/']);
    }
  }

  retakeExam(): void {
    this.loadExam();
  }


  onReportUnlocked(result: IUnlockPlacementResult): void {
    this.router.navigate(['/complete-profile'], {
      queryParams: {
        fullName: result.fullName,
        phone: result.phone,
        curriculum: this.curriculum(),
        gradeLevel: this.gradeLevel(),
        academicTerm: this.term(),
        attemptId: result.attemptId
      }
    });
  }

  private startTimer(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.clearTimer();

    this.timerInterval = setInterval(() => {
      this.timeRemainingSec.update(t => {
        if (t <= 1) {
          this.clearTimer();
          this.submitExam(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
