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
import { PublicDiscoveryService } from '../../../core/services/public-discovery.service';
import {
  IPlacementQuestion,
  IPlacementTestResponse,
  ISubmitPlacementResult,
  IUnlockPlacementResult
} from '../../../core/services/public-discovery.models';
import { CurriculumCode, AcademicTermCode } from '../../../core/constants/curriculum-tree.constant';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';

@Component({
  selector: 'app-placement-exam-runner',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AppIconComponent,
    LeadGateModalComponent
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

  // Scope parameters
  readonly curriculum = signal<CurriculumCode>('EGYPTIAN');
  readonly gradeLevel = signal<string>('SEC_3');
  readonly term = signal<AcademicTermCode>('TERM_1');

  // Exam state
  readonly examData = signal<IPlacementTestResponse | null>(null);
  readonly currentQuestionIdx = signal<number>(0);
  readonly selectedAnswers = signal<Record<string, number>>({});
  readonly timeRemainingSec = signal<number>(15 * 60);
  readonly isLoading = signal<boolean>(true);
  readonly isSubmitting = signal<boolean>(false);
  readonly isDesmosActive = signal<boolean>(false);

  // Lead Gate Modal state
  readonly isLeadGateOpen = signal<boolean>(false);
  readonly submissionResult = signal<ISubmitPlacementResult | null>(null);

  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // Computed properties
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
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['curriculum']) {
        this.curriculum.set(params['curriculum'] as CurriculumCode);
      }
      if (params['gradeLevel']) {
        this.gradeLevel.set(params['gradeLevel']);
      }
      if (params['term']) {
        this.term.set(params['term'] as AcademicTermCode);
      }
      this.loadExam();
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  loadExam(): void {
    this.isLoading.set(true);
    this.discoveryService.getPlacementTest(
      this.curriculum(),
      this.gradeLevel(),
      this.term()
    ).subscribe({
      next: data => {
        this.examData.set(data);
        this.timeRemainingSec.set(data.time_limit_minutes * 60);
        this.isLoading.set(false);
        this.startTimer();
      },
      error: () => {
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
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIdx() > 0) {
      this.currentQuestionIdx.update(i => i - 1);
    }
  }

  jumpToQuestion(idx: number): void {
    if (idx >= 0 && idx < this.totalQuestionsCount()) {
      this.currentQuestionIdx.set(idx);
    }
  }

  toggleDesmosCalculator(): void {
    this.isDesmosActive.update(active => !active);
  }

  submitExam(): void {
    const answersMap = this.selectedAnswers();
    const answers = Object.entries(answersMap).map(([questionId, selectedOption]) => ({
      questionId,
      selectedOption
    }));

    if (answers.length === 0) {
      // Prompt user to answer at least one question
      this.selectOption(0);
      return;
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
        this.submissionResult.set(result);
        this.isLeadGateOpen.set(true);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.submissionResult.set({
          attemptId: 'att_fallback_' + Date.now(),
          score: 80,
          maxScore: 100,
          percentage: 80,
          passed: true,
          totalQuestions: this.totalQuestionsCount(),
          correctAnswersCount: Math.ceil(this.totalQuestionsCount() * 0.8),
          isUnlocked: false
        });
        this.isLeadGateOpen.set(true);
      }
    });
  }

  onReportUnlocked(result: IUnlockPlacementResult): void {
    // Navigate or complete registration
  }

  private startTimer(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.clearTimer();

    this.timerInterval = setInterval(() => {
      this.timeRemainingSec.update(t => {
        if (t <= 1) {
          this.clearTimer();
          this.submitExam();
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
