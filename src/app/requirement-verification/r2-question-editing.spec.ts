import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CurriculumStudioComponent } from '../features/super-admin-dashboard/curriculum-studio/curriculum-studio.component';
import { QuestionAdminItem, AssessmentAdminItem } from '../features/super-admin-dashboard/curriculum-studio/curriculum-studio.models';

describe('Requirement R2: Post-Attachment Question Editing in Curriculum Studio', () => {
  let component: CurriculumStudioComponent;
  let fixture: ComponentFixture<CurriculumStudioComponent>;

  const mockAssessment: AssessmentAdminItem = {
    id: 'asm_r2_test',
    unitId: 'unit_math_1',
    titleAr: 'اختبار الجبر والهندسة',
    type: 'QUIZ',
    calculatorType: 'DESMOS',
    durationMinutes: 45,
    submissionsCount: 0,
    questions: [
      {
        id: 'q_1',
        order: 1,
        type: 'MCQ',
        textAr: 'ما هي قيمة x في 2x = 8؟',
        options: ['2', '3', '4', '5'],
        correctOptionIndex: 2,
        points: 5
      },
      {
        id: 'q_2',
        order: 2,
        type: 'INPUT_TEXT',
        textAr: 'أوجد مساحة المربع الذي طول ضلعه 6',
        options: [],
        correctOptionIndex: 0,
        acceptedAnswers: ['36', '36 cm^2'],
        points: 5
      },
      {
        id: 'q_3',
        order: 3,
        type: 'ESSAY',
        textAr: 'برهن أن مجموع زوايا المثلث 180 درجة',
        options: [],
        correctOptionIndex: 0,
        points: 10
      }
    ]
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
    component.activeAssessment.set(JSON.parse(JSON.stringify(mockAssessment)));
    fixture.detectChanges();
  });

  it('should populate composer form signals when editQuestion is invoked', () => {
    const q1 = component.activeAssessment()!.questions[0];

    component.editQuestion(q1);

    expect(component.editingQuestionId()).toBe(q1.id);
    expect(component.newQuestionType()).toBe('MCQ');
    expect(component.newQuestionTextAr()).toBe(q1.textAr);
    expect(component.newQuestionOptions()).toEqual(['2', '3', '4', '5']);
    expect(component.newQuestionCorrectIndex()).toBe(2);
    expect(component.newQuestionPoints()).toBe(5);
  });

  it('should update statement, options, points and correct index of existing question without appending', () => {
    const q1 = component.activeAssessment()!.questions[0];
    component.editQuestion(q1);

    // Modify composer fields
    component.newQuestionTextAr.set('ما هي قيمة x في 2x + 2 = 10؟');
    component.newQuestionOptions.set(['3', '4', '5', '6']);
    component.newQuestionCorrectIndex.set(1); // '4'
    component.newQuestionPoints.set(8);

    component.addQuestionToAssessment();

    const questions = component.activeAssessment()!.questions;
    expect(questions.length).toBe(3); // Preserved length, did not append!
    expect(questions[0].id).toBe('q_1');
    expect(questions[0].order).toBe(1);
    expect(questions[0].textAr).toBe('ما هي قيمة x في 2x + 2 = 10؟');
    expect(questions[0].options).toEqual(['3', '4', '5', '6']);
    expect(questions[0].correctOptionIndex).toBe(1);
    expect(questions[0].points).toBe(8);
    expect(component.editingQuestionId()).toBeNull();
  });

  it('should switch question type from MCQ to INPUT_TEXT during edit', () => {
    const q1 = component.activeAssessment()!.questions[0];
    component.editQuestion(q1);

    // Switch type to INPUT_TEXT
    component.newQuestionType.set('INPUT_TEXT');
    component.newQuestionAcceptedAnswers.set(['4', 'x=4']);

    component.addQuestionToAssessment();

    const questions = component.activeAssessment()!.questions;
    expect(questions.length).toBe(3);
    expect(questions[0].type).toBe('INPUT_TEXT');
    expect(questions[0].options).toEqual([]);
    expect(questions[0].acceptedAnswers).toEqual(['4', 'x=4']);
  });

  it('should switch question type from INPUT_TEXT to ESSAY and mark requiresTeacherReview', () => {
    const q2 = component.activeAssessment()!.questions[1];
    component.editQuestion(q2);

    // Switch type to ESSAY
    component.newQuestionType.set('ESSAY');
    component.newQuestionTextAr.set('اشرح خطوات حساب مساحة المربع بالتفصيل');

    component.addQuestionToAssessment();

    const questions = component.activeAssessment()!.questions;
    expect(questions[1].type).toBe('ESSAY');
    expect(questions[1].acceptedAnswers).toBeUndefined();
    expect(component.activeAssessment()?.requiresTeacherReview).toBeTrue();
  });

  it('should cancel editing without mutating the existing question or array', () => {
    const originalQuestions = JSON.parse(JSON.stringify(component.activeAssessment()!.questions));
    const q1 = component.activeAssessment()!.questions[0];

    component.editQuestion(q1);
    component.newQuestionTextAr.set('Modified text that should be discarded');

    component.cancelQuestionEdit();

    expect(component.editingQuestionId()).toBeNull();
    expect(component.newQuestionTextAr()).toBe('');
    expect(component.activeAssessment()!.questions).toEqual(originalQuestions);
  });

  it('should trigger autoRegradeWarning when editing an assessment with existing student submissions', () => {
    // Set submissionsCount > 0
    component.activeAssessment.update((asm) => asm ? { ...asm, submissionsCount: 15 } : null);

    const q1 = component.activeAssessment()!.questions[0];
    component.editQuestion(q1);
    component.newQuestionPoints.set(10);

    component.addQuestionToAssessment();

    expect(component.autoRegradeWarning()).toBeTrue();
  });
});
