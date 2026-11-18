import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssessmentStudioComponent } from './assessment-studio.component';
import { HttpClient } from '@angular/common/http';
import { of, throwError, TimeoutError } from 'rxjs';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { AssessmentItem } from './assessment-studio.models';
import { AssessmentDraftService } from '../../../core/offline-db/assessment-draft.service';
import { AssessmentDraft } from '../../../core/offline-db/assessment-draft.models';
import { AiExtractionSessionService } from '../../../core/offline-db/ai-extraction-session.service';
import { SwrCacheService } from '../../../core/services/swr-cache.service';

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
    mockHttpClient.patch.calls.reset();
    mockHttpClient.patch.and.returnValue(of({ success: true, data: sampleAssessment }));
    mockHttpClient.post.calls.reset();
    mockHttpClient.post.and.returnValue(of({ success: true, data: {} }));
    mockHttpClient.delete.calls.reset();
    mockHttpClient.delete.and.returnValue(of({ success: true, data: {} }));

    await TestBed.configureTestingModule({
      imports: [AssessmentStudioComponent],
      providers: [
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: LangService, useValue: mockLangService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentStudioComponent);
    component = fixture.componentInstance;
    await component.draftService.clearAllDrafts();
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

    it('should preserve newly added question when closing and reopening the exam editor and auto-persist to backend', () => {
      component.assessmentsList.set([sampleAssessment]);
      component.openEditor(component.assessmentsList()[0], 'QUESTIONS');
      mockHttpClient.patch.calls.reset();

      component.newQuestionType.set('MCQ');
      component.newQuestionTextAr.set('سؤال محفوظ بعد الإغلاق وإعادة الفتح');
      component.newQuestionOptions.set(['أ', 'ب', 'ج', 'د']);
      component.newQuestionCorrectIndex.set(1);
      component.newQuestionPoints.set(5);

      component.saveQuestion();

      expect(mockHttpClient.patch).toHaveBeenCalled();
      expect(component.assessmentsList()[0].questions.length).toBe(3);

      // Teacher closes the exam modal without clicking the bottom Save button
      component.closeEditor();
      expect(component.isEditorOpen()).toBeFalse();

      // Teacher reopens the exam from the list
      component.openEditor(component.assessmentsList()[0], 'QUESTIONS');
      const reopenedQuestions = component.activeAssessment()?.questions || [];
      expect(reopenedQuestions.length).toBe(3);
      expect(reopenedQuestions[2].textAr).toBe('سؤال محفوظ بعد الإغلاق وإعادة الفتح');
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

    it('should open AI extraction modal when openAiExtractionModal is invoked', () => {
      expect(component.isAiExtractionModalOpen()).toBe(false);
      component.openAiExtractionModal();
      expect(component.isAiExtractionModalOpen()).toBe(true);
    });

    it('should bulk insert AI-extracted questions with sequential orders and update totalPoints', () => {
      component.openEditor(sampleAssessment);
      const initialCount = component.activeAssessment()!.questions.length;

      const aiQuestions: any[] = [
        {
          id: 'q_ai_1',
          order: 0,
          type: 'MCQ',
          textAr: 'سؤال ذكاء اصطناعي 1 $x^2$',
          options: ['أ', 'ب', 'ج', 'د'],
          correctOptionIndex: 1,
          points: 3
        },
        {
          id: 'q_ai_2',
          order: 0,
          type: 'ESSAY',
          textAr: 'سؤال مقالي ذكاء اصطناعي',
          options: [],
          correctOptionIndex: 0,
          points: 5
        }
      ];

      component.onQuestionsExtracted(aiQuestions);

      const updatedAsm = component.activeAssessment()!;
      expect(updatedAsm.questions.length).toBe(initialCount + 2);
      expect(updatedAsm.questions[initialCount].order).toBe(initialCount + 1);
      expect(updatedAsm.questions[initialCount].textAr).toBe('سؤال ذكاء اصطناعي 1 $x^2$');
      expect(updatedAsm.questions[initialCount + 1].order).toBe(initialCount + 2);
      expect(updatedAsm.totalPoints).toBe(sampleAssessment.totalPoints + 3 + 5);
    });

    it('should cache file session and enable manual slicer for existing question', () => {
      component.openEditor(sampleAssessment);

      const mockSession: any = {
        fileName: 'exam_2026.pdf',
        fileType: 'pdf',
        file: null,
        pageNumber: 3,
        canvas: document.createElement('canvas'),
        dataUrl: 'data:image/webp;base64,mockCanvas'
      };

      component.onFileSessionCached(mockSession);
      expect(component.cachedFileSession()).toBe(mockSession);

      const targetQ = component.activeAssessment()!.questions[0];
      component.openManualSlicerForExistingQuestion(targetQ);

      expect(component.isManualSlicerOpen()).toBe(true);
      expect(component.activeQuestionForSlicing()).toBe(targetQ);

      component.onManualSliceSaved({
        imageUrl: 'https://cloudinary.com/cropped_q1.webp',
        blob: new Blob(['cropped']),
        dataUrl: 'data:image/webp;base64,cropped',
        sizeKb: 45,
        width: 300,
        height: 200
      });

      expect(targetQ.questionImageUrl).toBe('https://cloudinary.com/cropped_q1.webp');
      expect(component.isManualSlicerOpen()).toBe(false);
      expect(component.activeQuestionForSlicing()).toBeNull();
    });

    it('should open manual slicer for composer when manual slicing is requested from extraction modal', () => {
      component.openEditor(sampleAssessment);

      const mockSession: any = {
        fileName: 'exam_page2.pdf',
        fileType: 'pdf',
        file: null,
        pageNumber: 2,
        canvas: document.createElement('canvas'),
        dataUrl: 'data:image/webp;base64,mockPage2'
      };

      component.onManualSlicingRequestedFromExtraction(mockSession);
      expect(component.cachedFileSession()).toBe(mockSession);
      expect(component.isManualSlicerOpen()).toBe(true);
      expect(component.activeQuestionForSlicing()).toBeNull();
    });

    it('should suppress footer on init and restore on destroy', () => {
      const uiLayout = (component as any).uiLayoutService;
      expect(uiLayout.isFooterSuppressed()).toBe(true);

      component.ngOnDestroy();
      expect(uiLayout.isFooterSuppressed()).toBe(false);
    });
  });

  describe('Teacher Assessment Auto-Save in Dexie & 1-Click Restoration (Milestone 2 - R2 & R4)', () => {
    const mockDraft: AssessmentDraft = {
      draftId: 'asm_draft_test',
      assessmentId: 'asm_123',
      draftType: 'EDIT',
      titleAr: 'مسودة اختبار تفاضل مستعادة',
      titleEn: 'Restored Calculus Draft',
      curriculum: 'EGYPTIAN',
      gradeLevel: 'SEC_3',
      term: 'TERM_1',
      calculatorType: 'DESMOS',
      referenceSheetUrl: null,
      durationMinutes: 50,
      passPercentage: 65,
      maxAttempts: 2,
      isScheduled: false,
      isPlacementTest: false,
      requiresTeacherReview: false,
      totalPoints: 15,
      questions: [
        {
          id: 'q_draft_1',
          order: 1,
          type: 'MCQ',
          textAr: 'أوجد مشتقة $f(x) = \\sin(x)$',
          options: ['$\\cos(x)$', '$-\\cos(x)$', '$\\tan(x)$', '$1$'],
          correctOptionIndex: 0,
          points: 5
        }
      ],
      composerSnapshot: {
        editingQuestionId: null,
        type: 'MCQ',
        textAr: 'مسألة قيد الكتابة أثناء الحفظ التلقائي',
        imageUrl: null,
        options: ['أ', 'ب', 'ج', 'د'],
        correctIndex: 2,
        points: 5,
        youtubeUrl: ''
      },
      createdAt: 1700000000000,
      updatedAt: 1700000050000
    };

    it('should check for pending drafts on ngOnInit and set pendingDraft signal', async () => {
      spyOn(component.draftService, 'getLatestDraft').and.returnValue(Promise.resolve(mockDraft));

      await component.checkForPendingDrafts();

      expect(component.pendingDraft()).toEqual(mockDraft);
    });

    it('should render the restorable draft banner with 1-click restore and discard buttons', () => {
      component.pendingDraft.set(mockDraft);
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const banner = hostEl.querySelector('[data-testid="draft-restore-banner"]');
      expect(banner).toBeTruthy();
      expect(banner?.textContent).toContain('مسودة اختبار تفاضل مستعادة');
      expect(banner?.textContent).toContain('استعادة المسودة بنقرة واحدة');
      expect(banner?.textContent).toContain('تجاهل المسودة');

      const restoreBtn = hostEl.querySelector('[data-testid="restore-draft-btn"]');
      const discardBtn = hostEl.querySelector('[data-testid="discard-draft-btn"]');
      expect(restoreBtn).toBeTruthy();
      expect(discardBtn).toBeTruthy();
    });

    it('should restore draft questions, options, settings, and composer state in 1 click and open editor in QUESTIONS tab', () => {
      component.pendingDraft.set(mockDraft);
      fixture.detectChanges();

      let toastEmitted: any = null;
      component.toastTriggered.subscribe((t) => (toastEmitted = t));

      component.restoreDraft(mockDraft);

      // Verify activeAssessment is restored
      const asm = component.activeAssessment();
      expect(asm).toBeTruthy();
      expect(asm?.titleAr).toBe('مسودة اختبار تفاضل مستعادة');
      expect(asm?.durationMinutes).toBe(50);
      expect(asm?.questions.length).toBe(1);
      expect(asm?.questions[0].textAr).toBe('أوجد مشتقة $f(x) = \\sin(x)$');

      // Verify composer snapshot is restored
      expect(component.newQuestionTextAr()).toBe('مسألة قيد الكتابة أثناء الحفظ التلقائي');
      expect(component.newQuestionOptions()).toEqual(['أ', 'ب', 'ج', 'د']);
      expect(component.newQuestionCorrectIndex()).toBe(2);

      // Verify editor is opened to QUESTIONS tab
      expect(component.isEditorOpen()).toBeTrue();
      expect(component.editorActiveTab()).toBe('QUESTIONS');

      // Verify banner is dismissed
      expect(component.pendingDraft()).toBeNull();
      expect(toastEmitted?.type).toBe('success');
    });

    it('should discard draft, delete it from Dexie via draftService.deleteDraft, and dismiss banner', async () => {
      component.pendingDraft.set(mockDraft);
      spyOn(component.draftService, 'deleteDraft').and.returnValue(Promise.resolve());

      let toastEmitted: any = null;
      component.toastTriggered.subscribe((t) => (toastEmitted = t));

      await component.discardDraft(mockDraft.draftId);

      expect(component.draftService.deleteDraft).toHaveBeenCalledWith(mockDraft.draftId);
      expect(component.pendingDraft()).toBeNull();
      expect(toastEmitted?.type).toBe('warning');
    });

    it('should trigger debounced draft auto-save when typing into question text or options', () => {
      component.openEditor(sampleAssessment, 'QUESTIONS');
      fixture.detectChanges();
      spyOn(component, 'triggerDraftAutoSave');

      const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      expect(textarea).toBeTruthy();
      textarea.value = 'تعديل نص السؤال التلقائي';
      textarea.dispatchEvent(new Event('input'));

      expect(component.triggerDraftAutoSave).toHaveBeenCalledWith(false);

      const optionInput: HTMLInputElement = fixture.nativeElement.querySelector('input[data-opt-index="0"]');
      if (optionInput) {
        optionInput.value = 'خيار جديد';
        optionInput.dispatchEvent(new Event('input'));
        expect(component.triggerDraftAutoSave).toHaveBeenCalledWith(false);
      }
    });

    it('should trigger immediate draft auto-save when adding, updating, or deleting questions', () => {
      component.openEditor(sampleAssessment, 'QUESTIONS');
      spyOn(component, 'triggerDraftAutoSave');

      // Test addQuestion
      component.newQuestionType.set('MCQ');
      component.newQuestionTextAr.set('سؤال جديد للاختبار');
      component.newQuestionOptions.set(['1', '2', '3', '4']);
      component.saveQuestion();
      expect(component.triggerDraftAutoSave).toHaveBeenCalledWith(true);

      // Test deleteQuestion
      spyOn(component, 'openConfirm').and.callFake((title, msg, onConfirm) => onConfirm());
      component.deleteQuestion(1);
      expect(component.triggerDraftAutoSave).toHaveBeenCalledWith(true);
    });

    it('should completely delete draft from Dexie upon successful saveAssessmentEditor', async () => {
      component.openEditor(sampleAssessment, 'QUESTIONS');
      spyOn(component.draftService, 'deleteDraft').and.returnValue(Promise.resolve());
      component.pendingDraft.set(mockDraft);

      component.saveAssessmentEditor();
      await Promise.resolve();

      expect(mockHttpClient.patch).toHaveBeenCalled();
      expect(component.draftService.deleteDraft).toHaveBeenCalledWith(sampleAssessment.id);
      expect(component.pendingDraft()).toBeNull();
    });

    it('should trigger immediate auto-save on window:beforeunload if editor is open', () => {
      component.openEditor(sampleAssessment, 'QUESTIONS');
      spyOn(component, 'triggerDraftAutoSave');

      component.onBeforeUnload();

      expect(component.triggerDraftAutoSave).toHaveBeenCalledWith(true);
    });

    it('should strictly comply with R4: zero Unicode emojis across all draft messages, badges, and templates', () => {
      component.pendingDraft.set(mockDraft);
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const htmlText = hostEl.innerHTML;

      // Unicode Emoji regex range
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
      const hasEmoji = emojiRegex.test(htmlText);
      expect(hasEmoji).toBeFalse();

      // Verify standard SVG <app-icon> components are used
      const banner = hostEl.querySelector('[data-testid="draft-restore-banner"]');
      const icons = banner?.querySelectorAll('app-icon');
      expect(icons?.length).toBeGreaterThanOrEqual(3); // clock, rotate-ccw, trash
    });
  });

  describe('Milestone 3: Teacher Student-Simulation Preview (R3 & R4)', () => {
    it('should open preview modal with selected assessment item from the bank', () => {
      component.openPreviewModal(sampleAssessment);
      expect(component.isPreviewModalOpen()).toBeTrue();
      expect(component.previewAssessment()?.id).toBe(sampleAssessment.id);
    });

    it('should open preview modal from question editor drawer with working draft questions', () => {
      component.openEditor(sampleAssessment, 'QUESTIONS');
      expect(component.isEditorOpen()).toBeTrue();

      const workingCopy = component.activeAssessment()!;
      component.openPreviewModal(workingCopy);

      expect(component.isPreviewModalOpen()).toBeTrue();
      expect(component.previewAssessment()?.id).toBe(sampleAssessment.id);
    });

    it('should close preview modal and reset preview assessment', () => {
      component.openPreviewModal(sampleAssessment);
      expect(component.isPreviewModalOpen()).toBeTrue();

      component.closePreviewModal();
      expect(component.isPreviewModalOpen()).toBeFalse();
      expect(component.previewAssessment()).toBeNull();
    });

    it('should render preview button on assessment card and trigger openPreviewModal on click', () => {
      component.assessmentsList.set([sampleAssessment]);
      component.selectedCurriculum.set(sampleAssessment.curriculum);
      component.selectedGrade.set(sampleAssessment.gradeLevel);
      component.selectedTerm.set(sampleAssessment.term);
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const previewBtn: HTMLButtonElement | null = hostEl.querySelector('[data-testid="card-preview-btn"]');
      expect(previewBtn).toBeTruthy();

      spyOn(component, 'openPreviewModal');
      previewBtn?.click();
      expect(component.openPreviewModal).toHaveBeenCalledWith(sampleAssessment);
    });

    it('should render preview button in editor drawer header and trigger openPreviewModal on click', () => {
      component.openEditor(sampleAssessment, 'QUESTIONS');
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const drawerPreviewBtn: HTMLButtonElement | null = hostEl.querySelector('[data-testid="drawer-preview-btn"]');
      expect(drawerPreviewBtn).toBeTruthy();

      spyOn(component, 'openPreviewModal');
      drawerPreviewBtn?.click();
      expect(component.openPreviewModal).toHaveBeenCalled();
    });
  });

  describe('Assessment Save & Question Composer Fixes', () => {
    it('should automatically commit unsaved composer question with uploaded image when saveAssessmentEditor is triggered', async () => {
      component.openEditor(sampleAssessment, 'QUESTIONS');
      expect(component.activeAssessment()?.questions.length).toBe(2);

      // Simulate teacher uploading question image and filling choices in composer without clicking Add Question
      component.newQuestionType.set('MCQ');
      component.newQuestionImageUrl.set('https://storage.googleapis.com/spider-math-bucket/questions/uploaded_crop.webp');
      component.newQuestionOptions.set(['خيار 1', 'خيار 2', 'خيار 3', 'خيار 4']);
      component.newQuestionCorrectIndex.set(1);
      component.newQuestionPoints.set(5);

      mockHttpClient.patch.calls.reset();
      component.saveAssessmentEditor();
      await Promise.resolve();

      expect(mockHttpClient.patch).toHaveBeenCalled();
      const patchArgs = mockHttpClient.patch.calls.mostRecent().args;
      const patchUrl = patchArgs[0];
      const patchPayload = patchArgs[1];

      expect(patchUrl).toBe(`/api/v1/admin/assessments/${sampleAssessment.id}`);
      expect(patchPayload.questions.length).toBe(3);

      const addedQ = patchPayload.questions[2];
      expect(addedQ.question_image_url).toBe('https://storage.googleapis.com/spider-math-bucket/questions/uploaded_crop.webp');
      expect(addedQ.options).toEqual(['خيار 1', 'خيار 2', 'خيار 3', 'خيار 4']);
      expect(addedQ.correct_option_index).toBe(1);
      expect(addedQ.points).toBe(5);
      expect(component.isSaving()).toBeFalse();
    });

    it('should update existing question if editingQuestionId is active when saveAssessmentEditor is clicked', async () => {
      component.openEditor(sampleAssessment, 'QUESTIONS');
      const targetQ = sampleAssessment.questions[0];
      component.editQuestion(targetQ);

      // Modify question text and options in composer
      component.newQuestionTextAr.set('تعديل نص السؤال رقم 1');
      component.newQuestionOptions.set(['10', '20', '30', '40']);
      component.newQuestionCorrectIndex.set(2);

      mockHttpClient.patch.calls.reset();
      component.saveAssessmentEditor();
      await Promise.resolve();

      expect(mockHttpClient.patch).toHaveBeenCalled();
      const patchPayload = mockHttpClient.patch.calls.mostRecent().args[1];
      const editedQ = patchPayload.questions.find((q: any) => q.order === targetQ.order);

      expect(editedQ.question_text).toBe('تعديل نص السؤال رقم 1');
      expect(editedQ.options).toEqual(['10', '20', '30', '40']);
      expect(editedQ.correct_option_index).toBe(2);
      expect(component.isSaving()).toBeFalse();
    });

    it('should abort save and never set isSaving to true if composer validation fails', () => {
      component.openEditor(sampleAssessment, 'QUESTIONS');

      // Invalid composer state: empty options for MCQ
      component.newQuestionTextAr.set('سؤال بدون خيارات صحيحة');
      component.newQuestionOptions.set(['', '', '', '']);

      mockHttpClient.patch.calls.reset();
      component.saveAssessmentEditor();

      expect(mockHttpClient.patch).not.toHaveBeenCalled();
      expect(component.isSaving()).toBeFalse();
    });

    it('should reliably reset isSaving to false and show error message if HTTP patch fails', () => {
      component.openEditor(sampleAssessment, 'QUESTIONS');

      mockHttpClient.patch.and.returnValue(
        throwError(() => ({
          error: { message: 'فشل حفظ الامتحان في الخادم' }
        }))
      );

      component.saveAssessmentEditor();

      expect(component.isSaving()).toBeFalse();
      expect(component.editorErrorMessage()).toBe('فشل حفظ الامتحان في الخادم');
    });

    it('should reset isSaving to false on request timeout error', () => {
      component.openEditor(sampleAssessment, 'QUESTIONS');

      const timeoutErr = new TimeoutError();
      mockHttpClient.patch.and.returnValue(throwError(() => timeoutErr));

      component.saveAssessmentEditor();

      expect(component.isSaving()).toBeFalse();
      expect(component.editorErrorMessage()).toContain('انتهت مهلة حفظ الامتحان');
    });

    it('should reliably reset isSaving to false even if draftService.deleteDraft throws', async () => {
      component.openEditor(sampleAssessment, 'QUESTIONS');
      mockHttpClient.patch.and.returnValue(of({ success: true, data: sampleAssessment }));
      spyOn(component.draftService, 'deleteDraft').and.returnValue(Promise.reject(new Error('IndexedDB failure')));

      component.saveAssessmentEditor();
      await Promise.resolve();

      expect(component.isSaving()).toBeFalse();
      expect(component.isEditorOpen()).toBeFalse();
    });

    it('should upload question image via onQuestionImageUploaded, auto-commit it, and save assessment cleanly', () => {
      component.openEditor(sampleAssessment, 'QUESTIONS');
      expect(component.activeAssessment()?.questions.length).toBe(2);

      // Teacher uploads an image using the uploader callback
      const uploadedUrl = 'https://storage.googleapis.com/spider-math-bucket/questions/geometry_crop_verified.webp';
      component.onQuestionImageUploaded(uploadedUrl);
      expect(component.newQuestionImageUrl()).toBe(uploadedUrl);

      // Fill options for MCQ without text (visual math problem)
      component.newQuestionType.set('MCQ');
      component.newQuestionOptions.set(['12 سم', '24 سم', '36 سم', '48 سم']);
      component.newQuestionCorrectIndex.set(2);
      component.newQuestionPoints.set(10);

      let toastEmitted: any = null;
      component.toastTriggered.subscribe((t) => (toastEmitted = t));

      mockHttpClient.patch.calls.reset();
      component.saveAssessmentEditor();

      expect(mockHttpClient.patch).toHaveBeenCalled();
      const patchPayload = mockHttpClient.patch.calls.mostRecent().args[1];
      expect(patchPayload.questions.length).toBe(3);

      const uploadedQ = patchPayload.questions[2];
      expect(uploadedQ.question_image_url).toBe(uploadedUrl);
      expect(uploadedQ.question_text).toBe('مسألة رياضية مصورة');
      expect(uploadedQ.options).toEqual(['12 سم', '24 سم', '36 سم', '48 سم']);
      expect(uploadedQ.correct_option_index).toBe(2);
      expect(uploadedQ.points).toBe(10);

      expect(component.isSaving()).toBeFalse();
      expect(component.isEditorOpen()).toBeFalse();
      expect(toastEmitted?.type).toBe('success');
    });

    it('should shield against rapid double clicks by ignoring saveAssessmentEditor when isSaving is already true', () => {
      component.openEditor(sampleAssessment, 'QUESTIONS');
      component.isSaving.set(true);

      mockHttpClient.patch.calls.reset();
      component.saveAssessmentEditor();

      expect(mockHttpClient.patch).not.toHaveBeenCalled();
    });

    it('should cancel in-flight background autoPersistSub before executing explicit saveAssessmentEditor', () => {
      component.openEditor(sampleAssessment, 'QUESTIONS');

      const mockSub = jasmine.createSpyObj('Subscription', ['unsubscribe']);
      (component as any).autoPersistSub = mockSub;

      mockHttpClient.patch.calls.reset();
      component.saveAssessmentEditor();

      expect(mockSub.unsubscribe).toHaveBeenCalled();
      expect(mockHttpClient.patch).toHaveBeenCalled();
      expect(component.isSaving()).toBeFalse();
    });

    it('should successfully update an existing question with a newly uploaded question image and save', () => {
      component.openEditor(sampleAssessment, 'QUESTIONS');
      const targetQ = sampleAssessment.questions[1];
      component.editQuestion(targetQ);

      const replacementImageUrl = 'https://storage.googleapis.com/spider-math-bucket/questions/derivative_graph.webp';
      component.onQuestionImageUploaded(replacementImageUrl);
      component.newQuestionPoints.set(8);

      mockHttpClient.patch.calls.reset();
      component.saveAssessmentEditor();

      expect(mockHttpClient.patch).toHaveBeenCalled();
      const patchPayload = mockHttpClient.patch.calls.mostRecent().args[1];
      const updatedQ = patchPayload.questions.find((q: any) => q.order === targetQ.order);

      expect(updatedQ.question_image_url).toBe(replacementImageUrl);
      expect(updatedQ.points).toBe(8);
      expect(component.isSaving()).toBeFalse();
      expect(component.isEditorOpen()).toBeFalse();
    });

    it('should assign z-layer-modal and navbar safe clearance to edit assessment modal', () => {
      component.openEditor(sampleAssessment, 'QUESTIONS');
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const modalBackdrop = hostEl.querySelector('.z-layer-modal');
      expect(modalBackdrop).toBeTruthy();
      expect(modalBackdrop?.classList.contains('fixed')).toBeTrue();
      expect(modalBackdrop?.classList.contains('inset-0')).toBeTrue();
      expect(modalBackdrop?.classList.contains('pt-16')).toBeTrue();
      expect(modalBackdrop?.classList.contains('sm:pt-20')).toBeTrue();
    });

    it('should use clean translucent frosted glass backdrop and preserve documentElement scroll context', () => {
      component.openEditor(sampleAssessment, 'QUESTIONS');
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const modalBackdrop = hostEl.querySelector('.z-layer-modal');
      expect(modalBackdrop).toBeTruthy();
      expect(modalBackdrop?.classList.contains('bg-black/35')).toBeTrue();
      expect(modalBackdrop?.classList.contains('backdrop-blur-sm')).toBeTrue();
      expect(modalBackdrop?.classList.contains('bg-black/85')).toBeFalse();

      // documentElement overflow must NOT be locked to hidden, preserving sticky navbar
      expect(document.documentElement.style.overflow).not.toBe('hidden');
    });

    it('should configure inner scrollable container to eliminate double scrolling', () => {
      component.openEditor(sampleAssessment, 'QUESTIONS');
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const modalContainer = hostEl.querySelector('.z-layer-modal > div');
      expect(modalContainer).toBeTruthy();
      expect(modalContainer?.classList.contains('overflow-hidden')).toBeTrue();
      expect(modalContainer?.classList.contains('lg:h-[calc(100dvh-10.5rem)]')).toBeTrue();
      expect(modalContainer?.classList.contains('lg:max-h-[calc(100dvh-10.5rem)]')).toBeTrue();

      const innerBody = modalContainer?.querySelector('.overflow-y-auto');
      expect(innerBody).toBeTruthy();
      expect(innerBody?.classList.contains('flex-1')).toBeTrue();
      expect(innerBody?.classList.contains('min-h-0')).toBeTrue();
    });
  });

  describe('Hierarchical Gulf Country and International Division Parity', () => {
    it('should render Gulf country selector and group Gulf grades by country stages', () => {
      component.selectCurriculum('GULF');
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      expect(hostEl.textContent).toContain('المملكة العربية السعودية');
      expect(hostEl.textContent).toContain('دولة قطر');
      expect(hostEl.textContent).toContain('الإمارات العربية المتحدة');
      expect(hostEl.textContent).toContain('دولة الكويت');

      const optgroups = Array.from(hostEl.querySelectorAll('optgroup')).map((g) => g.getAttribute('label'));
      expect(optgroups).toContain('المرحلة الثانوية');
      expect(optgroups).toContain('المرحلة المتوسطة');

      // Switch to UAE and verify UAE Cycle stages appear
      component.selectGulfCountry('AE');
      fixture.detectChanges();
      const uaeOptgroups = Array.from(hostEl.querySelectorAll('optgroup')).map((g) => g.getAttribute('label'));
      expect(uaeOptgroups).toContain('الحلقة الثالثة');
      expect(uaeOptgroups).toContain('الحلقة الثانية');
    });

    it('should render International divisions selector and strictly scope American vs British grades', () => {
      component.selectCurriculum('INTERNATIONAL');
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      expect(hostEl.textContent).toContain('المنهج الأمريكي');
      expect(hostEl.textContent).toContain('المنهج البريطاني');
      expect(component.currentCurriculumHasTerms()).toBeFalse();

      // American division grades should start with US_GRADE_*
      expect(component.selectedIntlDivision()).toBe('AMERICAN_CURRICULUM');
      expect(component.gradeOptions().some((g) => g.code.startsWith('US_GRADE_'))).toBeTrue();
      expect(component.gradeOptions().some((g) => g.code.startsWith('IGCSE_'))).toBeFalse();

      // Switching to British division scopes exclusively to British/IGCSE grades
      component.selectIntlDivision('BRITISH_CURRICULUM');
      fixture.detectChanges();
      expect(component.selectedGrade().startsWith('IGCSE_')).toBeTrue();
      expect(component.gradeOptions().some((g) => g.code.startsWith('IGCSE_'))).toBeTrue();
      expect(component.gradeOptions().some((g) => g.code.startsWith('US_GRADE_'))).toBeFalse();
    });

    it('should provide Gulf/International division controls and accurate term visibility inside Create Modal', () => {
      component.selectCurriculum('EGYPTIAN');
      component.openCreateModal();
      fixture.detectChanges();
      expect(component.hasCurriculumTerms(component.createForm().curriculum)).toBeTrue();

      component.onCurriculumChangeInCreate('INTERNATIONAL');
      fixture.detectChanges();
      expect(component.hasCurriculumTerms(component.createForm().curriculum)).toBeFalse();

      component.selectCreateIntlDivision('BRITISH_CURRICULUM');
      fixture.detectChanges();
      expect(component.createForm().gradeLevel.startsWith('IGCSE_')).toBeTrue();

      component.onCurriculumChangeInCreate('GULF');
      fixture.detectChanges();
      expect(component.hasCurriculumTerms(component.createForm().curriculum)).toBeTrue();
      component.selectCreateGulfCountry('KW');
      fixture.detectChanges();
      expect(component.createGulfCountry()).toBe('KW');
    });
  });

  describe('Question 8 & Question 9 Image Isolation During Creation and Auto-Persist', () => {
    it('should keep Question 8 and Question 9 images isolated and sync editingQuestionId on auto-persist _id update', () => {
      component.openEditor({ ...sampleAssessment, questions: [] });

      // Add Question 8 WITH an image
      component.newQuestionType.set('MCQ');
      component.newQuestionTextAr.set('السؤال الثامن بالصورة');
      component.newQuestionImageUrl.set('https://cdn.example.com/q8_diagram.webp');
      component.newQuestionOptions.set(['1', '2', '3', '4']);
      component.addQuestion(false);

      // Composer image must reset so Question 9 starts clean
      expect(component.newQuestionImageUrl()).toBeNull();

      // Add Question 9 WITH its own distinct image
      component.newQuestionTextAr.set('السؤال التاسع بالصورة');
      component.newQuestionImageUrl.set('https://cdn.example.com/q9_diagram.webp');
      component.newQuestionOptions.set(['5', '6', '7', '8']);
      component.addQuestion(false);

      const asm = component.activeAssessment()!;
      expect(asm.questions.length).toBe(2);
      expect(asm.questions[0].id).not.toBe(asm.questions[1].id);
      expect(asm.questions[0].questionImageUrl).toBe('https://cdn.example.com/q8_diagram.webp');
      expect(asm.questions[1].questionImageUrl).toBe('https://cdn.example.com/q9_diagram.webp');

      // Simulate active edit session on temporary Question 8 while autoPersist resolves with server MongoDB _id
      const tempQ8 = asm.questions[0];
      component.editQuestion(tempQ8);
      mockHttpClient.patch.and.returnValue(of({
        success: true,
        data: {
          ...asm,
          questions: [
            { _id: '673000000000000000000008', order: 1 },
            { _id: '673000000000000000000009', order: 2 }
          ]
        }
      }));
      component.autoPersistAssessmentToBackend(asm);

      expect(component.editingQuestionId()).toBe('673000000000000000000008');
      expect(component.activeAssessment()!.questions[0].questionImageUrl).toBe('https://cdn.example.com/q8_diagram.webp');
      expect(component.activeAssessment()!.questions[1].questionImageUrl).toBe('https://cdn.example.com/q9_diagram.webp');
    });

    it('should auto-persist AI-extracted questions, sync swrCache, and restore persisted file session after refresh', async () => {
      const sessionService = TestBed.inject(AiExtractionSessionService);
      const swrCache = TestBed.inject(SwrCacheService);
      const baseAsm: AssessmentItem = { ...sampleAssessment, questions: [], totalPoints: 0 };
      component.assessmentsList.set([baseAsm]);
      component.openEditor(baseAsm, 'QUESTIONS');
      mockHttpClient.patch.calls.reset();

      const pdfBlob = new Blob(['%PDF-1.4 saved'], { type: 'application/pdf' });
      await sessionService.saveSession({
        assessmentId: baseAsm.id,
        fileName: 'saved_revision.pdf',
        fileType: 'pdf',
        fileBlob: pdfBlob,
        uploadedImages: [],
        pageNumber: 9,
        totalPages: 25,
        currentDataUrl: 'data:image/webp;base64,page9',
        pageScopeMode: 'CURRENT_PAGE',
        extractionMode: 'SMART_HYBRID',
        stagedQuestions: [],
        currentStep: 'PREVIEW_AND_PAGE',
        updatedAt: Date.now()
      });

      component.onQuestionsExtracted([
        {
          id: 'q_ext_1',
          order: 0,
          type: 'MCQ',
          textAr: 'سؤال مستخرج من الملف',
          options: ['أ', 'ب', 'ج', 'د'],
          correctOptionIndex: 0,
          points: 5
        }
      ]);

      expect(mockHttpClient.patch).toHaveBeenCalled();
      const cachedList = swrCache.get<AssessmentItem[]>(`admin_asm_${baseAsm.curriculum}_${baseAsm.gradeLevel}_${baseAsm.term}`);
      expect(cachedList?.find((a) => a.id === baseAsm.id)?.questions.length).toBe(1);

      component.closeEditor();
      (component as any).assessmentFileSessions.set({});
      sessionService.clearMemoryCache();

      component.openEditor(component.assessmentsList()[0], 'QUESTIONS');
      await new Promise((r) => setTimeout(r, 80));

      expect(component.activeAssessment()?.questions.length).toBe(1);
      expect(component.activeAssessment()?.questions[0].textAr).toBe('سؤال مستخرج من الملف');
      expect(component.cachedFileSession()?.fileName).toBe('saved_revision.pdf');
      expect(component.cachedFileSession()?.pageNumber).toBe(9);

      await sessionService.deleteSession(baseAsm.id);
    });
  });
});
