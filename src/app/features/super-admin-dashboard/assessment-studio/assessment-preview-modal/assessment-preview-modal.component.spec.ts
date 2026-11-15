import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { AssessmentPreviewModalComponent } from './assessment-preview-modal.component';
import { LangService } from '../../../../core/seo-theme-i18n/lang.service';
import { AssessmentItem } from '../assessment-studio.models';

describe('AssessmentPreviewModalComponent', () => {
  let component: AssessmentPreviewModalComponent;
  let componentRef: ComponentRef<AssessmentPreviewModalComponent>;
  let fixture: ComponentFixture<AssessmentPreviewModalComponent>;

  const mockLangService = {
    isArabic: () => true,
    isRtl: () => true,
    isEnglish: () => false,
    currentLang: () => 'ar'
  };

  const pureMcqAssessment: AssessmentItem = {
    id: 'asm_mcq_pure',
    titleAr: 'اختبار تجريبي اختيار من متعدد',
    titleEn: 'Pure MCQ Assessment',
    curriculum: 'EGYPTIAN',
    gradeLevel: 'SEC_3',
    term: 'TERM_1',
    calculatorType: 'NONE',
    durationMinutes: 45,
    passPercentage: 60,
    maxAttempts: 1,
    totalPoints: 20,
    isPublished: true,
    isPlacementTest: false,
    submissionsCount: 0,
    questions: [
      {
        id: 'q1',
        order: 1,
        type: 'MCQ',
        textAr: 'ما قيمة المشتقة الأولى للدالة f(x) = x^2؟',
        options: ['x', '2x', 'x^2', '2'],
        correctOptionIndex: 1, // '2x'
        points: 10,
        explanationAr: 'مشتقة x^n هي n*x^(n-1)، بالتالي مشتقة x^2 هي 2x',
        youtubeSolutionUrl: 'https://youtube.com/watch?v=sample1'
      },
      {
        id: 'q2',
        order: 2,
        type: 'MCQ',
        textAr: 'ما قيمة تكامل 2x dx؟',
        options: ['x^2 + C', '2x^2 + C', 'x + C', '4x + C'],
        correctOptionIndex: 0, // 'x^2 + C'
        points: 10,
        explanationAr: 'تكامل 2x هو 2 * (x^2 / 2) + C = x^2 + C'
      }
    ]
  };

  const mixedAssessment: AssessmentItem = {
    id: 'asm_mixed',
    titleAr: 'امتحان تفاضل وتطبيقات (مختلط)',
    titleEn: 'Mixed Calculus Exam',
    curriculum: 'EGYPTIAN',
    gradeLevel: 'SEC_3',
    term: 'TERM_1',
    calculatorType: 'DESMOS',
    durationMinutes: 60,
    passPercentage: 50,
    maxAttempts: 1,
    totalPoints: 25,
    isPublished: true,
    isPlacementTest: false,
    submissionsCount: 0,
    questions: [
      {
        id: 'q_mcq_1',
        order: 1,
        type: 'MCQ',
        textAr: 'نهاية (sin x)/x عندما x تقترب من الصفر:',
        options: ['0', '1', 'غير معرفة', 'ما لا نهاية'],
        correctOptionIndex: 1, // '1'
        points: 5,
        explanationAr: 'نظرية أساسية في حساب المثلثات: lim sin(x)/x = 1'
      },
      {
        id: 'q_essay_1',
        order: 2,
        type: 'ESSAY',
        textAr: 'أوجدي القيم العظمى والصغرى المحلية للدالة f(x) = x^3 - 3x موضحاً خطوات الحل كاملة:',
        options: [],
        correctOptionIndex: 0,
        points: 15,
        explanationAr: 'نشتق الدالة ونساوي بالصفر: 3x^2 - 3 = 0 ومنها x = 1 أو x = -1...'
      },
      {
        id: 'q_mcq_2',
        order: 3,
        type: 'MCQ',
        textAr: 'ميل المماس للمنحنى y = 3x + 5 هو:',
        options: ['3', '5', '8', '0'],
        correctOptionIndex: 0, // '3'
        points: 5,
        explanationAr: 'معامل x في معادلة الخط المستقيم هو الميل'
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentPreviewModalComponent],
      providers: [{ provide: LangService, useValue: mockLangService }]
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentPreviewModalComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create the preview modal component', () => {
    expect(component).toBeTruthy();
  });

  describe('Pure MCQ instant score and percentage calculation', () => {
    beforeEach(() => {
      componentRef.setInput('isOpen', true);
      componentRef.setInput('assessment', pureMcqAssessment);
      fixture.detectChanges();
    });

    it('should correctly calculate 100% when all MCQ answers are correct', () => {
      // Simulate answering both questions correctly
      component.selectOption('q1', 1);
      component.selectOption('q2', 0);
      component.finishPreview();
      fixture.detectChanges();

      const summary = component.scoringSummary();
      expect(summary.totalPoints).toBe(20);
      expect(summary.mcqTotalPoints).toBe(20);
      expect(summary.mcqEarnedPoints).toBe(20);
      expect(summary.percentage).toBe(100);
      expect(summary.isPassed).toBeTrue();
      expect(summary.hasEssayQuestions).toBeFalse();

      // UI verification
      const el: HTMLElement = fixture.nativeElement;
      const pctEl = el.querySelector('[data-testid="preview-percentage"]');
      expect(pctEl?.textContent?.trim()).toContain('100%');
    });

    it('should correctly calculate partial score (50%) when 1 of 2 questions is correct', () => {
      component.selectOption('q1', 1); // Correct (10 pts)
      component.selectOption('q2', 2); // Wrong (0 pts)
      component.finishPreview();
      fixture.detectChanges();

      const summary = component.scoringSummary();
      expect(summary.mcqEarnedPoints).toBe(10);
      expect(summary.totalPoints).toBe(20);
      expect(summary.percentage).toBe(50);
      expect(summary.hasEssayQuestions).toBeFalse();
    });

    it('should correctly calculate 0% when no answers or all wrong answers are provided', () => {
      component.selectOption('q1', 0); // Wrong
      component.selectOption('q2', 1); // Wrong
      component.finishPreview();
      fixture.detectChanges();

      const summary = component.scoringSummary();
      expect(summary.mcqEarnedPoints).toBe(0);
      expect(summary.percentage).toBe(0);
      expect(summary.isPassed).toBeFalse();
    });
  });

  describe('Mixed MCQ + Essay scoring & manual review notice', () => {
    beforeEach(() => {
      componentRef.setInput('isOpen', true);
      componentRef.setInput('assessment', mixedAssessment);
      fixture.detectChanges();
    });

    it('should strictly exclude essay questions points from automated calculation (pointsEarned = 0)', () => {
      // Answer first MCQ correctly (+5) and second MCQ correctly (+5)
      component.selectOption('q_mcq_1', 1);
      component.selectOption('q_mcq_2', 0);
      // Simulate student answering the essay
      component.updateEssayAnswer('q_essay_1', 'f\'(x) = 3x^2 - 3 = 0...');
      component.toggleEssayPhoto('q_essay_1');

      component.finishPreview();
      fixture.detectChanges();

      const summary = component.scoringSummary();
      expect(summary.hasEssayQuestions).toBeTrue();
      expect(summary.essayCount).toBe(1);
      expect(summary.essayTotalPoints).toBe(15);
      expect(summary.mcqTotalPoints).toBe(10);
      expect(summary.mcqEarnedPoints).toBe(10);
      // Percentage must be calculated ONLY from MCQ questions: 10 / 10 = 100%
      expect(summary.percentage).toBe(100);

      // Verify individual essay points earned in simulation is 0
      const essayQ = mixedAssessment.questions.find((q) => q.id === 'q_essay_1')!;
      expect(component.getEarnedPointsForQuestion(essayQ)).toBe(0);
    });

    it('should display the prominent Arabic manual review banner for mixed assessments', () => {
      component.finishPreview();
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const banner = el.querySelector('[data-testid="essay-review-banner"]');
      expect(banner).toBeTruthy();
      expect(banner?.textContent).toContain(
        'يتضمن أسئلة مقالية للتصحيح اليدوي. النتيجة لأسئلة الاختيار فقط.'
      );
    });

    it('should badge every essay question with the required warning label', () => {
      // In simulation mode
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      // Navigate to essay question (index 1)
      component.selectQuestion(1);
      fixture.detectChanges();

      const badge = el.querySelector('[data-testid="essay-badge"]');
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toContain('سؤال مقالي - يتطلب تصحيحاً ومراجعة يدوية من المعلمة');

      // In results mode
      component.finishPreview();
      fixture.detectChanges();
      const resultEssayBadges = el.querySelectorAll('[data-testid="essay-question-badge"]');
      expect(resultEssayBadges.length).toBe(1);
      expect(resultEssayBadges[0].textContent).toContain('سؤال مقالي - يتطلب تصحيحاً ومراجعة يدوية من المعلمة');
    });
  });

  describe('Interactive navigation, answer recording & simulation controls', () => {
    beforeEach(() => {
      componentRef.setInput('isOpen', true);
      componentRef.setInput('assessment', mixedAssessment);
      fixture.detectChanges();
    });

    it('should navigate sequentially using next and previous buttons', () => {
      expect(component.activeQuestionIndex()).toBe(0);

      component.nextQuestion();
      expect(component.activeQuestionIndex()).toBe(1);

      component.nextQuestion();
      expect(component.activeQuestionIndex()).toBe(2);

      // Should not exceed bounds
      component.nextQuestion();
      expect(component.activeQuestionIndex()).toBe(2);

      component.prevQuestion();
      expect(component.activeQuestionIndex()).toBe(1);

      component.prevQuestion();
      expect(component.activeQuestionIndex()).toBe(0);

      component.prevQuestion();
      expect(component.activeQuestionIndex()).toBe(0);
    });

    it('should navigate directly to any question by index', () => {
      component.selectQuestion(2);
      expect(component.activeQuestionIndex()).toBe(2);
    });

    it('should record MCQ selection and update answered status indicator', () => {
      const q = mixedAssessment.questions[0];
      expect(component.isQuestionAnswered(q)).toBeFalse();

      component.selectOption(q.id, 1);
      expect(component.isOptionSelected(q.id, 1)).toBeTrue();
      expect(component.isOptionSelected(q.id, 0)).toBeFalse();
      expect(component.isQuestionAnswered(q)).toBeTrue();
    });

    it('should record simulated essay answer and photo toggle', () => {
      const essayQ = mixedAssessment.questions[1];
      expect(component.isQuestionAnswered(essayQ)).toBeFalse();

      component.updateEssayAnswer(essayQ.id, 'خطوات الحل: س = 1');
      expect(component.isQuestionAnswered(essayQ)).toBeTrue();

      component.toggleEssayPhoto(essayQ.id);
      expect(component.essayPhotoAttached()[essayQ.id]).toBeTrue();
    });

    it('should reset all simulation state when resetSimulation is invoked', () => {
      component.selectOption('q_mcq_1', 1);
      component.updateEssayAnswer('q_essay_1', 'some text');
      component.finishPreview();
      expect(component.isResultsMode()).toBeTrue();

      component.resetSimulation();
      expect(component.isResultsMode()).toBeFalse();
      expect(component.activeQuestionIndex()).toBe(0);
      expect(Object.keys(component.selectedMcqAnswers()).length).toBe(0);
      expect(Object.keys(component.essayAnswers()).length).toBe(0);
    });

    it('should emit close output when closeModal is invoked', () => {
      let closed = false;
      component.close.subscribe(() => (closed = true));

      component.closeModal();
      expect(closed).toBeTrue();
    });
  });

  describe('3-Question Types: INPUT_TEXT Auto-Grading & Accepted Answers Display', () => {
    const textAndEssayAssessment: AssessmentItem = {
      id: 'asm_text_and_essay',
      titleAr: 'اختبار تجريبي: إدخال نصي ومقالي واختيار',
      titleEn: 'Input Text & Essay & MCQ Assessment',
      curriculum: 'EGYPTIAN',
      gradeLevel: 'SEC_1',
      term: 'TERM_1',
      calculatorType: 'NONE',
      durationMinutes: 30,
      passPercentage: 60,
      maxAttempts: 1,
      totalPoints: 15,
      isPublished: true,
      isPlacementTest: false,
      submissionsCount: 0,
      questions: [
        {
          id: 'q1_mcq',
          order: 1,
          type: 'MCQ',
          textAr: 'test mcq',
          options: ['1', '2', '3', '4'],
          correctOptionIndex: 2,
          points: 5
        },
        {
          id: 'q2_text',
          order: 2,
          type: 'INPUT_TEXT',
          textAr: 'test text',
          options: [],
          correctOptionIndex: 0,
          acceptedAnswers: ['1', 'one'],
          points: 5
        },
        {
          id: 'q3_essay',
          order: 3,
          type: 'ESSAY',
          textAr: 'test 3 essay photo',
          options: [],
          correctOptionIndex: 0,
          points: 5
        }
      ]
    };

    beforeEach(() => {
      componentRef.setInput('isOpen', true);
      componentRef.setInput('assessment', textAndEssayAssessment);
      fixture.detectChanges();
    });

    it('should distinguish INPUT_TEXT from ESSAY and show correct badge in simulation', () => {
      // Question 2 is INPUT_TEXT
      component.selectQuestion(1);
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const textBadge = hostEl.querySelector('[data-testid="input-text-badge"]');
      const essayBadge = hostEl.querySelector('[data-testid="essay-badge"]');
      const textInput = hostEl.querySelector('[data-testid="preview-text-input-q2_text"]');

      expect(textBadge).toBeTruthy();
      expect(textBadge?.textContent).toContain('إدخال نص / كتابة - تصحيح تلقائي');
      expect(essayBadge).toBeNull();
      expect(textInput).toBeTruthy();
    });

    it('should auto-grade INPUT_TEXT with student answer "1" against accepted answers ["1", "one"] to full 5/5 points', () => {
      // Simulate student typing "1" for Question 2
      component.updateTextAnswer('q2_text', '1');
      // Answer MCQ incorrectly
      component.selectOption('q1_mcq', 0);
      // Finish simulation
      component.finishPreview();
      fixture.detectChanges();

      const q2 = textAndEssayAssessment.questions[1];
      expect(component.isInputTextCorrect(q2)).toBeTrue();
      expect(component.getEarnedPointsForQuestion(q2)).toBe(5);

      const summary = component.scoringSummary();
      expect(summary.inputTextEarnedPoints).toBe(5);
      expect(summary.inputTextTotalPoints).toBe(5);
      // Auto-points total is 5/10 (q1 wrong, q2 right, q3 essay excluded from auto denominator)
      expect(summary.autoEarnedPoints).toBe(5);
      expect(summary.autoTotalPoints).toBe(10);
      expect(summary.percentage).toBe(50);
    });

    it('should auto-grade Arabic numerals "١" matching "1" due to normalization', () => {
      component.updateTextAnswer('q2_text', '١');
      component.finishPreview();
      fixture.detectChanges();

      const q2 = textAndEssayAssessment.questions[1];
      expect(component.isInputTextCorrect(q2)).toBeTrue();
      expect(component.getEarnedPointsForQuestion(q2)).toBe(5);
    });

    it('should display accepted answers list ["1", "one"] clearly in results view', () => {
      component.updateTextAnswer('q2_text', '1');
      component.finishPreview();
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const acceptedAnswersContainer = hostEl.querySelector('[data-testid="preview-accepted-answers-list"]');
      expect(acceptedAnswersContainer).toBeTruthy();
      expect(acceptedAnswersContainer?.textContent).toContain('1');
      expect(acceptedAnswersContainer?.textContent).toContain('one');

      // Verify Question 2 does NOT get essay review badge
      const badges = hostEl.querySelectorAll('[data-testid="input-text-question-badge"]');
      expect(badges.length).toBe(1);
      expect(badges[0].textContent).toContain('إدخال نصي - تصحيح تلقائي');
    });

    it('should only mark ESSAY questions as requiring manual review', () => {
      component.finishPreview();
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const essayBadges = hostEl.querySelectorAll('[data-testid="essay-question-badge"]');
      // ONLY Question 3 is an essay question!
      expect(essayBadges.length).toBe(1);
    });
  });

  describe('Celebration Modal Full-Score Preview Integration', () => {
    beforeEach(() => {
      componentRef.setInput('isOpen', true);
      componentRef.setInput('assessment', pureMcqAssessment);
      fixture.detectChanges();
    });

    it('should have isCelebrationOpen initialized to false', () => {
      expect(component.isCelebrationOpen()).toBeFalse();
    });

    it('should automatically open celebration modal when teacher achieves 100% full score', () => {
      // Answer pureMcqAssessment questions correctly (q1 -> 1, q2 -> 0)
      component.selectOption('q1', 1);
      component.selectOption('q2', 0);

      expect(component.scoringSummary().percentage).toBe(100);

      component.finishPreview();
      fixture.detectChanges();

      expect(component.isResultsMode()).toBeTrue();
      expect(component.isCelebrationOpen()).toBeTrue();

      const hostEl: HTMLElement = fixture.nativeElement;
      const celebrationElem = hostEl.querySelector('app-celebration-modal');
      expect(celebrationElem).toBeTruthy();

      const perfectBadge = hostEl.querySelector('[data-testid="perfect-score-badge"]');
      expect(perfectBadge).toBeTruthy();
    });

    it('should NOT automatically open celebration modal when score is less than 100%', () => {
      // Answer q1 correctly, leave q2 unanswered
      component.selectOption('q1', 1);

      expect(component.scoringSummary().percentage).toBe(50);

      component.finishPreview();
      fixture.detectChanges();

      expect(component.isResultsMode()).toBeTrue();
      expect(component.isCelebrationOpen()).toBeFalse();
    });

    it('should allow the teacher to manually open and preview celebration anytime in results mode', () => {
      component.finishPreview();
      fixture.detectChanges();

      expect(component.isCelebrationOpen()).toBeFalse();

      component.openCelebrationPreview();
      fixture.detectChanges();
      expect(component.isCelebrationOpen()).toBeTrue();

      component.closeCelebration();
      fixture.detectChanges();
      expect(component.isCelebrationOpen()).toBeFalse();
    });

    it('should reset isCelebrationOpen when simulation is restarted or modal is closed', () => {
      component.openCelebrationPreview();
      expect(component.isCelebrationOpen()).toBeTrue();

      component.resetSimulation();
      expect(component.isCelebrationOpen()).toBeFalse();

      component.openCelebrationPreview();
      expect(component.isCelebrationOpen()).toBeTrue();

      component.closeModal();
      expect(component.isCelebrationOpen()).toBeFalse();
    });
  });

  describe('Navbar Safe Clearance & Layering Contract', () => {
    it('should apply z-layer-preview and safe top padding (pt-16 sm:pt-20) to ensure navbar visibility', () => {
      componentRef.setInput('isOpen', true);
      componentRef.setInput('assessment', pureMcqAssessment);
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const backdropEl = hostEl.querySelector('.z-layer-preview');
      expect(backdropEl).toBeTruthy();
      expect(backdropEl?.classList.contains('pt-16')).toBeTrue();
      expect(backdropEl?.classList.contains('sm:pt-20')).toBeTrue();
      expect(backdropEl?.classList.contains('fixed')).toBeTrue();
      expect(backdropEl?.classList.contains('inset-0')).toBeTrue();
    });

    it('should constrain modal container height so close button and header remain visible below navbar', () => {
      componentRef.setInput('isOpen', true);
      componentRef.setInput('assessment', pureMcqAssessment);
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const containerEl = hostEl.querySelector('[data-testid="assessment-preview-modal-container"]');
      expect(containerEl).toBeTruthy();
      expect(containerEl?.classList.contains('max-h-[calc(100dvh-5.5rem)]')).toBeTrue();
    });
  });

  describe('R4 Strict Zero-Emoji Compliance', () => {
    it('should strictly contain zero Unicode emojis across both simulation and results views', () => {
      componentRef.setInput('isOpen', true);
      componentRef.setInput('assessment', mixedAssessment);
      fixture.detectChanges();

      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;

      // 1. Simulation mode check
      const simulationHtml = fixture.nativeElement.innerHTML;
      expect(emojiRegex.test(simulationHtml)).toBeFalse();

      // 2. Results mode check
      component.finishPreview();
      fixture.detectChanges();
      const resultsHtml = fixture.nativeElement.innerHTML;
      expect(emojiRegex.test(resultsHtml)).toBeFalse();
    });
  });
});
