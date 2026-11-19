import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AssessmentStudioComponent } from '../features/super-admin-dashboard/assessment-studio/assessment-studio.component';
import { CurriculumStudioComponent } from '../features/super-admin-dashboard/curriculum-studio/curriculum-studio.component';
import { AssessmentItem } from '../features/super-admin-dashboard/assessment-studio/assessment-studio.models';
import { AssessmentAdminItem } from '../features/super-admin-dashboard/curriculum-studio/curriculum-studio.models';
import { getMcqOptionLabel, cleanOptionText } from '../shared/utils/option-formatter.util';

describe('Requirement: In-Place Question Editing & a:, b:, c:, d: MCQ Lettering', () => {
  let component: AssessmentStudioComponent;
  let fixture: ComponentFixture<AssessmentStudioComponent>;

  const mockAssessment: AssessmentItem = {
    id: 'asm_inplace_test',
    titleAr: 'امتحان التفاضل والتكامل الشامل',
    titleEn: 'Calculus Comprehensive Exam',
    curriculum: 'EGYPTIAN',
    gradeLevel: 'SEC_3',
    term: 'TERM_1',
    calculatorType: 'DESMOS',
    durationMinutes: 60,
    passPercentage: 50,
    maxAttempts: 1,
    totalPoints: 15,
    isPublished: true,
    isPlacementTest: false,
    submissionsCount: 0,
    questions: [
      {
        id: 'q_item_1',
        order: 1,
        type: 'MCQ',
        textAr: 'ما هو ميل المماس للمنحنى عند س = 2؟',
        options: ['4', '8', '12', '16'],
        correctOptionIndex: 1,
        points: 5
      },
      {
        id: 'q_item_2',
        order: 2,
        type: 'MCQ',
        textAr: 'أوجد قيمة النهاية $\\lim_{x \\to 0} \\frac{\\sin x}{x}$',
        options: ['0', '1', '\\infty', 'غير معرفة'],
        correctOptionIndex: 1,
        points: 5
      },
      {
        id: 'q_item_3',
        order: 3,
        type: 'INPUT_TEXT',
        textAr: 'أوجد قيمة x إذا كانت $3^x = 81$',
        options: [],
        correctOptionIndex: 0,
        acceptedAnswers: ['4', 'x=4'],
        points: 5
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentStudioComponent, CurriculumStudioComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentStudioComponent);
    component = fixture.componentInstance;
    await component.draftService.clearAllDrafts();
    component.openEditor(JSON.parse(JSON.stringify(mockAssessment)), 'QUESTIONS');
    fixture.detectChanges();
  });

  it('REQ-1: should format MCQ options with canonical a:, b:, c:, d: labels with lowercase class in read-only cards', () => {
    const hostEl: HTMLElement = fixture.nativeElement;
    const q1Card = hostEl.querySelector('#question-card-q_item_1');
    expect(q1Card).toBeTruthy();

    const textContent = q1Card?.textContent || '';
    expect(textContent).toContain('a:');
    expect(textContent).toContain('b:');
    expect(textContent).toContain('c:');
    expect(textContent).toContain('d:');

    // Ensure labels are lowercase and do not have uppercase styling
    const optionLabels = q1Card?.querySelectorAll('.grid span.font-mono');
    expect(optionLabels && optionLabels.length > 0).toBeTrue();
    optionLabels?.forEach((labelEl) => {
      expect(labelEl.classList.contains('uppercase')).toBeFalse();
      expect(labelEl.classList.contains('lowercase')).toBeTrue();
    });
  });

  it('REQ-2: should open in-place editor inside the question card when editQuestion is invoked', () => {
    const targetQ = component.activeAssessment()!.questions[1]; // q_item_2
    component.editQuestion(targetQ);
    fixture.detectChanges();

    expect(component.editingQuestionId()).toBe('q_item_2');

    const hostEl: HTMLElement = fixture.nativeElement;
    const q2Card = hostEl.querySelector('#question-card-q_item_2');
    expect(q2Card).toBeTruthy();

    // Inline editor exists inside card #question-card-q_item_2
    const inlineEditor = q2Card?.querySelector('[data-testid="inline-question-editor"]');
    expect(inlineEditor).toBeTruthy();

    // Card contains in-place title and cancel button
    expect(inlineEditor?.textContent).toContain('تعديل السؤال الحالي بالامتحان');
    expect(inlineEditor?.textContent).toContain('تعديل في المكان');

    // Options inside inline editor have a:, b:, c:, d: with lowercase class
    expect(inlineEditor?.textContent).toContain('a:');
    expect(inlineEditor?.textContent).toContain('b:');
    expect(inlineEditor?.textContent).toContain('c:');
    expect(inlineEditor?.textContent).toContain('d:');

    const inlineOptionLabels = inlineEditor?.querySelectorAll('.grid span.font-mono');
    expect(inlineOptionLabels && inlineOptionLabels.length > 0).toBeTrue();
    inlineOptionLabels?.forEach((labelEl) => {
      expect(labelEl.classList.contains('uppercase')).toBeFalse();
      expect(labelEl.classList.contains('lowercase')).toBeTrue();
    });

    // Top banner informs user that editing is taking place in-place below
    const topBanner = hostEl.querySelector('[data-testid="editing-in-place-top-banner"]');
    expect(topBanner).toBeTruthy();
    expect(topBanner?.textContent).toContain('تعديل السؤال الحالي بالامتحان يتم في مكانه');
  });

  it('REQ-3: should update the question content in place without reordering or duplicating', () => {
    const targetQ = component.activeAssessment()!.questions[1]; // q_item_2
    component.editQuestion(targetQ);
    fixture.detectChanges();

    // Modify fields in place
    component.newQuestionTextAr.set('نص معدل للسؤال رقم 2 في مكانه');
    component.newQuestionOptions.set(['خيار أ جديد', 'خيار ب جديد', 'خيار ج جديد', 'خيار د جديد']);
    component.newQuestionCorrectIndex.set(2);
    component.newQuestionPoints.set(10);

    const saved = component.saveQuestion(false);
    expect(saved).toBeTrue();
    fixture.detectChanges();

    // Edit mode exited
    expect(component.editingQuestionId()).toBeNull();

    // Questions count preserved
    const questions = component.activeAssessment()!.questions;
    expect(questions.length).toBe(3);

    // Question 2 stayed at index 1 with order 2
    expect(questions[1].id).toBe('q_item_2');
    expect(questions[1].order).toBe(2);
    expect(questions[1].textAr).toBe('نص معدل للسؤال رقم 2 في مكانه');
    expect(questions[1].options).toEqual(['خيار أ جديد', 'خيار ب جديد', 'خيار ج جديد', 'خيار د جديد']);
    expect(questions[1].correctOptionIndex).toBe(2);
    expect(questions[1].points).toBe(10);
  });

  it('REQ-4: should cancel editing without altering question content or card position', () => {
    const originalQ2 = { ...component.activeAssessment()!.questions[1] };
    component.editQuestion(component.activeAssessment()!.questions[1]);
    fixture.detectChanges();

    component.newQuestionTextAr.set('تعديل تجريبي ملغى');
    component.cancelQuestionEdit();
    fixture.detectChanges();

    expect(component.editingQuestionId()).toBeNull();
    const currentQ2 = component.activeAssessment()!.questions[1];
    expect(currentQ2.textAr).toBe(originalQ2.textAr);
    expect(currentQ2.options).toEqual(originalQ2.options);
  });

  it('REQ-5: option formatter utility returns a:, b:, c:, d: strictly and cleans redundant prefixes', () => {
    expect(getMcqOptionLabel(0)).toBe('a:');
    expect(getMcqOptionLabel(1)).toBe('b:');
    expect(getMcqOptionLabel(2)).toBe('c:');
    expect(getMcqOptionLabel(3)).toBe('d:');
    expect(getMcqOptionLabel(4)).toBe('e:');

    // Redundant prefix cleaning
    expect(cleanOptionText('a: 42')).toBe('42');
    expect(cleanOptionText('b) \\frac{1}{2}')).toBe('\\frac{1}{2}');
    expect(cleanOptionText('c. 100')).toBe('100');
    expect(cleanOptionText('d: 5')).toBe('5');
    expect(cleanOptionText('e: 99')).toBe('99');
  });

  it('REQ-6: should support in-place question editing in CurriculumStudioComponent', () => {
    const currFixture = TestBed.createComponent(CurriculumStudioComponent);
    currFixture.componentRef.setInput('units', []);
    currFixture.componentRef.setInput('selectedCurriculum', 'EGYPTIAN');
    currFixture.componentRef.setInput('selectedGrade', 'SEC_3');
    currFixture.componentRef.setInput('selectedTerm', 'TERM_1');
    const currComponent = currFixture.componentInstance;

    const mockCurrAssessment: AssessmentAdminItem = {
      id: 'asm_curr_inplace',
      unitId: 'unit_math_1',
      titleAr: 'اختبار تجريبي في استوديو المنهج',
      type: 'QUIZ',
      calculatorType: 'DESMOS',
      durationMinutes: 30,
      submissionsCount: 0,
      questions: [
        {
          id: 'curr_q_1',
          order: 1,
          type: 'MCQ',
          textAr: 'السؤال الأول في المنهج',
          options: ['خيار 1', 'خيار 2', 'خيار 3', 'خيار 4'],
          correctOptionIndex: 0,
          points: 5
        },
        {
          id: 'curr_q_2',
          order: 2,
          type: 'MCQ',
          textAr: 'السؤال الثاني في المنهج',
          options: ['أ', 'ب', 'ج', 'د'],
          correctOptionIndex: 1,
          points: 5
        }
      ]
    };

    currComponent.activeAssessment.set(JSON.parse(JSON.stringify(mockCurrAssessment)));
    currComponent.isAssessmentEditorOpen.set(true);
    currFixture.detectChanges();

    // Trigger edit on question 2
    const q2 = currComponent.activeAssessment()!.questions[1];
    currComponent.editQuestion(q2);
    currFixture.detectChanges();

    expect(currComponent.editingQuestionId()).toBe('curr_q_2');

    // In-place editor must appear inside card #curriculum-question-curr_q_2
    const hostEl: HTMLElement = currFixture.nativeElement;
    const q2Card = hostEl.querySelector('#curriculum-question-curr_q_2');
    expect(q2Card).toBeTruthy();

    const inlineEditor = q2Card?.querySelector('[data-testid="curriculum-inline-question-editor"]');
    expect(inlineEditor).toBeTruthy();

    // Banner indicates in-place editing
    const composerBanner = hostEl.querySelector('[data-testid="curriculum-editing-in-place-banner"]');
    expect(composerBanner).toBeTruthy();

    // Modifying in place
    currComponent.newQuestionTextAr.set('السؤال الثاني المعدل في مكانه تماماً');
    currComponent.addQuestionToAssessment();
    currFixture.detectChanges();

    expect(currComponent.editingQuestionId()).toBeNull();
    const updatedQ2 = currComponent.activeAssessment()!.questions[1];
    expect(updatedQ2.textAr).toBe('السؤال الثاني المعدل في مكانه تماماً');
    expect(currComponent.activeAssessment()!.questions.length).toBe(2);
  });
});
