import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CurriculumStudioComponent } from '../features/super-admin-dashboard/curriculum-studio/curriculum-studio.component';
import { AssessmentAdminItem } from '../features/super-admin-dashboard/curriculum-studio/curriculum-studio.models';
import { ICachedFileSession } from '../features/super-admin-dashboard/assessment-studio/ai-question-extraction-modal/ai-question-extraction-modal.models';
import { AiQuestionExtractionModalComponent } from '../features/super-admin-dashboard/assessment-studio/ai-question-extraction-modal/ai-question-extraction-modal.component';

describe('Requirement R3: Assessment Session and Staged Question Isolation', () => {
  describe('CurriculumStudioComponent - Scoped cachedFileSession per Assessment', () => {
    let component: CurriculumStudioComponent;
    let fixture: ComponentFixture<CurriculumStudioComponent>;

    const quizAssessment: AssessmentAdminItem = {
      id: 'asm_quiz_alpha',
      unitId: 'unit_1',
      titleAr: 'كويز الجبر 1',
      type: 'QUIZ',
      calculatorType: 'NONE',
      durationMinutes: 15,
      submissionsCount: 0,
      questions: []
    };

    const homeworkAssessment: AssessmentAdminItem = {
      id: 'asm_hw_beta',
      unitId: 'unit_1',
      titleAr: 'واجب التفاضل 1',
      type: 'HOMEWORK',
      calculatorType: 'NONE',
      durationMinutes: 60,
      submissionsCount: 0,
      questions: []
    };

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

    it('should strictly isolate file sessions between quiz and homework assessments', () => {
      // 1. Open Quiz Alpha and cache a PDF session
      component.openAssessmentEditor(quizAssessment);
      expect(component.cachedFileSession()).toBeNull();

      const quizSession: ICachedFileSession = {
        fileName: 'algebra_quiz_alpha.pdf',
        fileType: 'pdf',
        file: null,
        pageNumber: 2,
        canvas: null,
        dataUrl: 'data:image/png;base64,quizAlphaData'
      };
      component.onFileSessionCached(quizSession);

      // Quiz Alpha must have its session
      expect(component.cachedFileSession()?.fileName).toBe('algebra_quiz_alpha.pdf');
      expect(component.cachedFileSession()?.pageNumber).toBe(2);

      // 2. Close Quiz Alpha and switch to Homework Beta
      component.closeAssessmentEditor();
      component.openAssessmentEditor(homeworkAssessment);

      // CRITICAL ASSERTION: Homework Beta MUST NOT inherit Quiz Alpha's session!
      expect(component.cachedFileSession()).toBeNull();

      // 3. Cache a different session in Homework Beta
      const hwSession: ICachedFileSession = {
        fileName: 'calculus_hw_beta.pdf',
        fileType: 'pdf',
        file: null,
        pageNumber: 5,
        canvas: null,
        dataUrl: 'data:image/png;base64,hwBetaData'
      };
      component.onFileSessionCached(hwSession);

      expect(component.cachedFileSession()?.fileName).toBe('calculus_hw_beta.pdf');
      expect(component.cachedFileSession()?.pageNumber).toBe(5);

      // 4. Switch back to Quiz Alpha
      component.closeAssessmentEditor();
      component.openAssessmentEditor(quizAssessment);

      // CRITICAL ASSERTION: Quiz Alpha retains its own session without corruption
      expect(component.cachedFileSession()?.fileName).toBe('algebra_quiz_alpha.pdf');
      expect(component.cachedFileSession()?.pageNumber).toBe(2);
    });
  });

  describe('AiQuestionExtractionModalComponent - Staged Question Assessment Scoping', () => {
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

    it('should maintain independent staged questions per assessment ID without cross-contamination', () => {
      // 1. Open modal for Assessment 1
      fixture.componentRef.setInput('assessmentId', 'asm_1');
      component.isOpen.set(true);
      fixture.detectChanges();

      const stagedAsm1 = [
        {
          id: 'q_asm1_1',
          checked: true,
          question_text: 'Question from Assessment 1',
          type: 'MCQ' as const,
          options: ['A', 'B', 'C', 'D'],
          correct_option_index: 0,
          points: 5,
          has_geometry_diagram: false
        }
      ];
      component.stagedQuestions.set(stagedAsm1);
      component.saveTransientDraft();

      expect(component.stagedQuestions().length).toBe(1);
      expect(component.stagedQuestions()[0].question_text).toBe('Question from Assessment 1');

      // 2. Switch to Assessment 2
      component.close();
      fixture.detectChanges();

      fixture.componentRef.setInput('assessmentId', 'asm_2');
      component.isOpen.set(true);
      fixture.detectChanges();

      // Assessment 2 must start with clean/empty staged questions!
      expect(component.stagedQuestions().length).toBe(0);

      // Add staged questions for Assessment 2
      const stagedAsm2 = [
        {
          id: 'q_asm2_1',
          checked: true,
          question_text: 'Question from Assessment 2',
          type: 'INPUT_TEXT' as const,
          options: [],
          correct_option_index: 0,
          acceptedAnswers: ['Ans2'],
          points: 10,
          has_geometry_diagram: false
        }
      ];
      component.stagedQuestions.set(stagedAsm2);
      component.saveTransientDraft();

      expect(component.stagedQuestions().length).toBe(1);
      expect(component.stagedQuestions()[0].question_text).toBe('Question from Assessment 2');

      // 3. Switch back to Assessment 1
      component.close();
      fixture.detectChanges();

      fixture.componentRef.setInput('assessmentId', 'asm_1');
      component.isOpen.set(true);
      fixture.detectChanges();

      // Staged questions for Assessment 1 must be cleanly restored!
      expect(component.stagedQuestions().length).toBe(1);
      expect(component.stagedQuestions()[0].question_text).toBe('Question from Assessment 1');
      expect(component.stagedQuestions()[0].id).toBe('q_asm1_1');
    });
  });
});
