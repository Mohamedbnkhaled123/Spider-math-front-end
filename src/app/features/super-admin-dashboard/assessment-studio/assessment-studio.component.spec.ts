import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssessmentStudioComponent } from './assessment-studio.component';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { AssessmentItem } from './assessment-studio.models';

describe('AssessmentStudioComponent', () => {
  let component: AssessmentStudioComponent;
  let fixture: ComponentFixture<AssessmentStudioComponent>;

  const mockHttpClient = {
    get: jasmine.createSpy('get').and.callFake((url: string) => {
      if (url.includes('/api/v1/public/active-grades')) {
        return of({
          success: true,
          data: {
            activeGrades: ['SEC_3', 'SEC_2'],
            curriculaTracks: [
              {
                code: 'EGYPTIAN',
                nameAr: 'المنهج المصري',
                grades: [{ code: 'SEC_3', titleAr: 'الصف الثالث الثانوي' }]
              }
            ]
          }
        });
      }
      return of({ success: true, data: [] });
    }),
    post: jasmine.createSpy('post').and.returnValue(of({ success: true, data: {} })),
    patch: jasmine.createSpy('patch').and.returnValue(of({ success: true, data: {} })),
    delete: jasmine.createSpy('delete').and.returnValue(of({ success: true, data: {} }))
  };

  const mockLangService = {
    isArabic: () => true,
    isRtl: () => true,
    isEnglish: () => false,
    currentLang: () => 'ar'
  };

  const sampleAssessment: AssessmentItem = {
    id: 'asm_123',
    titleAr: 'امتحان تفاضل وتكامل',
    titleEn: 'Calculus Exam',
    curriculum: 'EGYPTIAN',
    gradeLevel: 'SEC_3',
    term: 'TERM_1',
    calculatorType: 'NONE',
    durationMinutes: 60,
    passPercentage: 50,
    maxAttempts: 1,
    totalPoints: 10,
    isPublished: true,
    isPlacementTest: false,
    submissionsCount: 0,
    questions: [
      {
        id: 'q_1',
        order: 1,
        type: 'MCQ',
        textAr: 'أوجد نهاية د(س) عندما س تقترب من 0',
        options: ['1', '2', '0', 'غير موجودة'],
        correctOptionIndex: 0,
        points: 5
      },
      {
        id: 'q_2',
        order: 2,
        type: 'MCQ',
        textAr: 'اشتقاق س^2 هو',
        options: ['2س', 'س', '2', '0'],
        correctOptionIndex: 0,
        points: 5
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentStudioComponent],
      providers: [
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: LangService, useValue: mockLangService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentStudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the assessment studio component', () => {
    expect(component).toBeTruthy();
  });

  describe('Question safe editor and live preview', () => {
    beforeEach(() => {
      component.openEditor(sampleAssessment, 'QUESTIONS');
      fixture.detectChanges();
    });

    it('should open editor and reset question form', () => {
      expect(component.isEditorOpen()).toBeTrue();
      expect(component.editorActiveTab()).toBe('QUESTIONS');
      expect(component.editingQuestionId()).toBeNull();
      expect(component.newQuestionTextAr()).toBe('');
      expect(component.newQuestionOptions()).toEqual(['', '', '', '']);
    });

    it('should render live math formula preview when newQuestionTextAr has content', () => {
      component.newQuestionTextAr.set('$$\\frac{\\sqrt{x^2 + 1}}{2x - 5} = 10$$');
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const previewTitle = hostEl.textContent;
      expect(previewTitle).toContain('معاينة حية');
    });

    it('should update newQuestionTextAr and show preview when typing into textarea', async () => {
      const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      expect(textarea).toBeTruthy();
      textarea.value = 'اختبار نص المسألة $x+1=0$';
      textarea.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.newQuestionTextAr()).toBe('اختبار نص المسألة $x+1=0$');
      expect(fixture.nativeElement.textContent).toContain('معاينة حية للمسألة الرياضية أثناء الكتابة:');
    });

    it('should add a new MCQ question to the assessment', () => {
      component.newQuestionType.set('MCQ');
      component.newQuestionTextAr.set('ما هو تفاضل جتا(س)؟');
      component.newQuestionOptions.set(['-جا(س)', 'جا(س)', 'ظا(س)', 'صفر']);
      component.newQuestionCorrectIndex.set(0);
      component.newQuestionPoints.set(10);

      component.saveQuestion();

      const questions = component.activeAssessment()?.questions || [];
      expect(questions.length).toBe(3);
      expect(questions[2].textAr).toBe('ما هو تفاضل جتا(س)؟');
      expect(questions[2].points).toBe(10);
      expect(component.activeAssessment()?.totalPoints).toBe(20);
      expect(component.editingQuestionId()).toBeNull();
      expect(component.newQuestionTextAr()).toBe('');
    });

    it('should enter edit mode when editQuestion is invoked', () => {
      const qToEdit = sampleAssessment.questions[0];
      component.editQuestion(qToEdit);
      fixture.detectChanges();

      expect(component.editingQuestionId()).toBe('q_1');
      expect(component.newQuestionTextAr()).toBe(qToEdit.textAr);
      expect(component.newQuestionOptions()).toEqual(qToEdit.options);
      expect(component.newQuestionCorrectIndex()).toBe(qToEdit.correctOptionIndex);
      expect(component.newQuestionPoints()).toBe(qToEdit.points);

      const hostEl: HTMLElement = fixture.nativeElement;
      expect(hostEl.textContent).toContain('تعديل السؤال الحالي بالامتحان');
      expect(hostEl.textContent).toContain('حفظ تعديلات السؤال');
    });

    it('should save updated question in place without duplicating', () => {
      const qToEdit = sampleAssessment.questions[0];
      component.editQuestion(qToEdit);

      component.newQuestionTextAr.set('نص السؤال المعدل مع الرموز $x^2 + 1$');
      component.newQuestionOptions.set(['خيار 1', 'خيار 2', 'خيار 3', 'خيار 4']);
      component.newQuestionCorrectIndex.set(2);
      component.newQuestionPoints.set(8);

      component.saveQuestion();

      const questions = component.activeAssessment()?.questions || [];
      expect(questions.length).toBe(2); // Still 2 questions, no duplicates!
      expect(questions[0].id).toBe('q_1');
      expect(questions[0].textAr).toBe('نص السؤال المعدل مع الرموز $x^2 + 1$');
      expect(questions[0].correctOptionIndex).toBe(2);
      expect(questions[0].points).toBe(8);
      expect(component.activeAssessment()?.totalPoints).toBe(13); // 8 + 5
      expect(component.editingQuestionId()).toBeNull();
    });

    it('should cancel question edit and restore form to blank state', () => {
      const qToEdit = sampleAssessment.questions[0];
      component.editQuestion(qToEdit);
      expect(component.editingQuestionId()).toBe('q_1');

      component.cancelQuestionEdit();

      expect(component.editingQuestionId()).toBeNull();
      expect(component.newQuestionTextAr()).toBe('');
      expect(component.newQuestionOptions()).toEqual(['', '', '', '']);
      // Original questions unchanged
      expect(component.activeAssessment()?.questions[0].textAr).toBe(qToEdit.textAr);
    });

    it('should reset question form if currently edited question is deleted', () => {
      const qToEdit = sampleAssessment.questions[0];
      component.editQuestion(qToEdit);
      expect(component.editingQuestionId()).toBe('q_1');

      // deleteQuestion opens confirm dialog and calls callback
      spyOn(component, 'openConfirm').and.callFake((title, msg, onConfirm) => {
        onConfirm();
      });

      component.deleteQuestion(1);

      expect(component.editingQuestionId()).toBeNull();
      expect(component.newQuestionTextAr()).toBe('');
      expect(component.activeAssessment()?.questions.length).toBe(1);
    });

    it('should reject MCQ question with empty options', () => {
      let emittedToast: any = null;
      component.toastTriggered.subscribe((t) => (emittedToast = t));

      component.newQuestionType.set('MCQ');
      component.newQuestionTextAr.set('سؤال ناقص خيارات');
      component.newQuestionOptions.set(['خيار 1', '', 'خيار 3', 'خيار 4']);

      component.saveQuestion();

      expect(emittedToast?.type).toBe('error');
      expect(component.activeAssessment()?.questions.length).toBe(2); // not added
    });

    it('should reject MCQ question with duplicate options', () => {
      let emittedToast: any = null;
      component.toastTriggered.subscribe((t) => (emittedToast = t));

      component.newQuestionType.set('MCQ');
      component.newQuestionTextAr.set('سؤال بخيارات مكررة');
      component.newQuestionOptions.set(['خيار 1', 'خيار 1', 'خيار 3', 'خيار 4']);

      component.saveQuestion();

      expect(emittedToast?.type).toBe('error');
      expect(component.activeAssessment()?.questions.length).toBe(2); // not added
    });

    it('should render live KaTeX preview for option inputs when filled', () => {
      component.updateOption(0, '\\sqrt{16} = 4');
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      expect(hostEl.textContent).toContain('معاينة فورية:');
    });

    it('should trigger autoRegradeWarning when editing question in assessment with existing submissions', () => {
      component.activeAssessment.set({
        ...sampleAssessment,
        submissionsCount: 5
      });
      expect(component.autoRegradeWarning()).toBeFalse();

      const qToEdit = sampleAssessment.questions[0];
      component.editQuestion(qToEdit);
      component.newQuestionPoints.set(20);
      component.saveQuestion();

      expect(component.autoRegradeWarning()).toBeTrue();
    });

    it('should edit essay question properly without requiring options', () => {
      const essayAsm: AssessmentItem = {
        ...sampleAssessment,
        questions: [
          {
            id: 'q_essay_1',
            order: 1,
            type: 'ESSAY',
            textAr: 'ارسم منحنى الدالة د(س) = س^3',
            options: [],
            correctOptionIndex: -1,
            points: 10
          }
        ]
      };
      component.openEditor(essayAsm, 'QUESTIONS');

      component.editQuestion(essayAsm.questions[0]);
      expect(component.newQuestionType()).toBe('ESSAY');
      expect(component.newQuestionTextAr()).toBe('ارسم منحنى الدالة د(س) = س^3');

      component.newQuestionTextAr.set('ارسم منحنى الدالة د(س) = س^3 ومحدداتها');
      component.saveQuestion();

      const questions = component.activeAssessment()?.questions || [];
      expect(questions.length).toBe(1);
      expect(questions[0].textAr).toBe('ارسم منحنى الدالة د(س) = س^3 ومحدداتها');
      expect(questions[0].type).toBe('ESSAY');
    });

    it('should normalize ESSAY_PHOTO type to ESSAY when editQuestion is called', () => {
      const essayPhotoQ = {
        id: 'q_photo_1',
        order: 1,
        type: 'ESSAY_PHOTO' as any,
        textAr: 'مسألة مقالية مصورة',
        options: [],
        correctOptionIndex: -1,
        points: 10
      };
      component.editQuestion(essayPhotoQ);
      expect(component.newQuestionType()).toBe('ESSAY');
    });

    it('should handle rapid switching between editing multiple questions', () => {
      component.editQuestion(sampleAssessment.questions[0]);
      expect(component.editingQuestionId()).toBe('q_1');
      expect(component.newQuestionTextAr()).toBe(sampleAssessment.questions[0].textAr);

      // Switch to question 2 without saving
      component.editQuestion(sampleAssessment.questions[1]);
      expect(component.editingQuestionId()).toBe('q_2');
      expect(component.newQuestionTextAr()).toBe(sampleAssessment.questions[1].textAr);

      // Question 1 in activeAssessment remains unmodified
      const q1 = component.activeAssessment()?.questions[0];
      expect(q1?.textAr).toBe(sampleAssessment.questions[0].textAr);
    });

    it('should clamp points to valid range [1, 50] on edit and save', () => {
      component.editQuestion(sampleAssessment.questions[0]);
      component.newQuestionPoints.set(999);
      component.saveQuestion();

      let q1 = component.activeAssessment()?.questions[0];
      expect(q1?.points).toBe(50);

      component.editQuestion(sampleAssessment.questions[0]);
      component.newQuestionPoints.set(-5);
      component.saveQuestion();

      q1 = component.activeAssessment()?.questions[0];
      expect(q1?.points).toBe(1);
    });

    it('should handle question image preview and removal in edit mode', () => {
      const qWithImage = {
        ...sampleAssessment.questions[0],
        questionImageUrl: 'https://cdn.example.com/question.webp'
      };
      component.editQuestion(qWithImage);
      expect(component.newQuestionImageUrl()).toBe('https://cdn.example.com/question.webp');

      fixture.detectChanges();
      const hostEl: HTMLElement = fixture.nativeElement;
      const img = hostEl.querySelector('img[alt="صورة المسألة المرفقة"]') as HTMLImageElement;
      expect(img).toBeTruthy();
      expect(img.src).toContain('question.webp');

      // Clear image
      component.newQuestionImageUrl.set(null);
      component.saveQuestion();

      const q1 = component.activeAssessment()?.questions[0];
      expect(q1?.questionImageUrl).toBeNull();
    });
  });
});
