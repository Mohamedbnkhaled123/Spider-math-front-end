import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AiQuestionExtractionModalComponent } from '../features/super-admin-dashboard/assessment-studio/ai-question-extraction-modal/ai-question-extraction-modal.component';
import { IStagedQuestion } from '../features/super-admin-dashboard/assessment-studio/ai-question-extraction-modal/ai-question-extraction-modal.models';
import { stripLatexDelimiters } from '../shared/components/math-virtual-keyboard/math-virtual-keyboard.models';
import { CurriculumStudioComponent } from '../features/super-admin-dashboard/curriculum-studio/curriculum-studio.component';

describe('Requirement R1: INPUT_TEXT Question Type Support', () => {
  describe('AiQuestionExtractionModalComponent - INPUT_TEXT & Accepted Answers', () => {
    let component: AiQuestionExtractionModalComponent;
    let fixture: ComponentFixture<AiQuestionExtractionModalComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [AiQuestionExtractionModalComponent],
        providers: [provideHttpClient(), provideHttpClientTesting()]
      }).compileComponents();

      fixture = TestBed.createComponent(AiQuestionExtractionModalComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should switch question type from MCQ to INPUT_TEXT and initialize accepted answers', () => {
      const q: IStagedQuestion = {
        id: 'staged_1',
        checked: true,
        question_text: 'Solve for x: 2x + 4 = 10',
        type: 'MCQ',
        options: ['1', '2', '3', '4'],
        correct_option_index: 2,
        points: 5,
        has_geometry_diagram: false
      };

      component.setQuestionType(q, 'INPUT_TEXT');

      expect(q.type).toBe('INPUT_TEXT');
      expect(q.acceptedAnswers).toBeDefined();
      expect(q.acceptedAnswers?.length).toBe(1);
      expect(q.acceptedAnswers?.[0]).toBe('');
    });

    it('should add multiple accepted answers to an INPUT_TEXT question', () => {
      const q: IStagedQuestion = {
        id: 'staged_2',
        checked: true,
        question_text: 'What is 5 + 5?',
        type: 'INPUT_TEXT',
        options: [],
        correct_option_index: 0,
        acceptedAnswers: ['10'],
        points: 5,
        has_geometry_diagram: false
      };

      component.addAcceptedAnswer(q);
      expect(q.acceptedAnswers?.length).toBe(2);
      expect(q.acceptedAnswers?.[1]).toBe('');

      component.addAcceptedAnswer(q);
      expect(q.acceptedAnswers?.length).toBe(3);
    });

    it('should remove accepted answers and enforce minimum of 1 answer boundary', () => {
      const q: IStagedQuestion = {
        id: 'staged_3',
        checked: true,
        question_text: 'Evaluate x^2 at x = 3',
        type: 'INPUT_TEXT',
        options: [],
        correct_option_index: 0,
        acceptedAnswers: ['9', '3^2', 'nine'],
        points: 5,
        has_geometry_diagram: false
      };

      component.removeAcceptedAnswer(q, 1);
      expect(q.acceptedAnswers).toEqual(['9', 'nine']);

      component.removeAcceptedAnswer(q, 1);
      expect(q.acceptedAnswers).toEqual(['9']);

      // Attempting to remove the last one resets to empty string rather than removing
      component.removeAcceptedAnswer(q, 0);
      expect(q.acceptedAnswers).toEqual(['']);
    });

    it('should strip LaTeX delimiters when inputting accepted answers', () => {
      const q: IStagedQuestion = {
        id: 'staged_4',
        checked: true,
        question_text: 'Compute the integral',
        type: 'INPUT_TEXT',
        options: [],
        correct_option_index: 0,
        acceptedAnswers: [''],
        points: 5,
        has_geometry_diagram: false
      };

      const inputEl = document.createElement('input');
      inputEl.value = '$$x^2 + 1$$';

      component.onAcceptedAnswerInput(q, 0, { target: inputEl } as unknown as Event);

      expect(q.acceptedAnswers?.[0]).toBe('x² + 1');
      expect(stripLatexDelimiters('$$x^2 + 1$$')).toBe('x² + 1');
    });

    it('should emit acceptedAnswers when insertSelectedQuestions is executed', async () => {
      const q: IStagedQuestion = {
        id: 'staged_5',
        checked: true,
        question_text: 'Find the slope of line 2x - y = 3',
        type: 'INPUT_TEXT',
        options: [],
        correct_option_index: 0,
        acceptedAnswers: ['2', '2/1'],
        points: 10,
        has_geometry_diagram: false
      };

      component.stagedQuestions.set([q]);

      let emitted: any[] = [];
      component.questionsExtracted.subscribe((questions) => {
        emitted = questions;
      });

      await component.insertSelectedQuestions();

      expect(emitted.length).toBe(1);
      expect(emitted[0].type).toBe('INPUT_TEXT');
      expect(emitted[0].textAr).toBe('Find the slope of line 2x - y = 3');
      expect(emitted[0].acceptedAnswers).toEqual(['2', '2/1']);
      expect(emitted[0].options).toEqual([]);
      expect(emitted[0].points).toBe(10);
    });
  });

  describe('CurriculumStudioComponent - INPUT_TEXT Composer Validation', () => {
    let component: CurriculumStudioComponent;
    let fixture: ComponentFixture<CurriculumStudioComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [CurriculumStudioComponent],
        providers: [provideHttpClient(), provideHttpClientTesting()]
      }).compileComponents();

      fixture = TestBed.createComponent(CurriculumStudioComponent);
      fixture.componentRef.setInput('units', []);
      fixture.componentRef.setInput('selectedCurriculum', 'EGYPTIAN');
      fixture.componentRef.setInput('selectedGrade', 'SEC_3');
      fixture.componentRef.setInput('selectedTerm', 'TERM_1');
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should reject INPUT_TEXT question addition when accepted answers are empty', () => {
      component.activeAssessment.set({
        id: 'asm_test',
        unitId: 'unit_1',
        titleAr: 'Test Assessment',
        type: 'QUIZ',
        calculatorType: 'NONE',
        durationMinutes: 20,
        submissionsCount: 0,
        questions: []
      });

      component.newQuestionType.set('INPUT_TEXT');
      component.newQuestionTextAr.set('Calculate 2 + 2');
      component.newQuestionAcceptedAnswers.set(['', '   ']);

      let toast: any = null;
      component.toastTriggered.subscribe((t) => (toast = t));

      component.addQuestionToAssessment();

      expect(component.activeAssessment()?.questions.length).toBe(0);
      expect(toast?.type).toBe('error');
    });

    it('should successfully add INPUT_TEXT question with valid accepted answers', () => {
      component.activeAssessment.set({
        id: 'asm_test_valid',
        unitId: 'unit_1',
        titleAr: 'Test Assessment',
        type: 'QUIZ',
        calculatorType: 'NONE',
        durationMinutes: 20,
        submissionsCount: 0,
        questions: []
      });

      component.newQuestionType.set('INPUT_TEXT');
      component.newQuestionTextAr.set('Solve 3x = 9');
      component.newQuestionAcceptedAnswers.set(['3', 'x=3']);
      component.newQuestionPoints.set(5);

      component.addQuestionToAssessment();

      const questions = component.activeAssessment()?.questions || [];
      expect(questions.length).toBe(1);
      expect(questions[0].type).toBe('INPUT_TEXT');
      expect(questions[0].acceptedAnswers).toEqual(['3', 'x=3']);
      expect(questions[0].points).toBe(5);
    });
  });
});
