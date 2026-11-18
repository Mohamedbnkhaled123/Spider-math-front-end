import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { AiQuestionExtractionModalComponent } from './ai-question-extraction-modal.component';
import { IStagedQuestion, ICachedFileSession } from './ai-question-extraction-modal.models';

describe('AiQuestionExtractionModalComponent', () => {
  let component: AiQuestionExtractionModalComponent;
  let fixture: ComponentFixture<AiQuestionExtractionModalComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiQuestionExtractionModalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AiQuestionExtractionModalComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create the AI question extraction modal component with default state', () => {
    expect(component).toBeTruthy();
    expect(component.isOpen()).toBe(false);
    expect(component.currentStep()).toBe('UPLOAD_AND_SELECT');
    expect(component.extractionMode()).toBe('SMART_HYBRID');
    expect(component.stagedQuestions().length).toBe(0);
    expect(component.isProcessing()).toBe(false);
    expect(component.isInserting()).toBe(false);
  });

  it('should switch extraction modes correctly', () => {
    component.extractionMode.set('TEXT_LATEX_ONLY');
    expect(component.extractionMode()).toBe('TEXT_LATEX_ONLY');

    component.extractionMode.set('FULL_IMAGE_CROP');
    expect(component.extractionMode()).toBe('FULL_IMAGE_CROP');

    component.extractionMode.set('MANUAL_CROP');
    expect(component.extractionMode()).toBe('MANUAL_CROP');

    component.extractionMode.set('SMART_HYBRID');
    expect(component.extractionMode()).toBe('SMART_HYBRID');
  });

  it('should handle file selection for a PDF document', () => {
    const mockPdfFile = new File(['%PDF-1.4 test'], 'exam_prep.pdf', {
      type: 'application/pdf'
    });

    component.handleSelectedFile(mockPdfFile);

    expect(component.uploadedFile()).toBe(mockPdfFile);
    expect(component.fileName()).toBe('exam_prep.pdf');
    expect(component.fileType()).toBe('pdf');
    expect(component.currentStep()).toBe('PREVIEW_AND_PAGE');
    expect(component.errorMessage()).toBeNull();
  });

  it('should reject unsupported file types with Arabic error message', () => {
    const mockTxtFile = new File(['hello'], 'document.txt', {
      type: 'text/plain'
    });

    component.handleSelectedFile(mockTxtFile);

    expect(component.errorMessage()).toBeTruthy();
    expect(component.currentStep()).toBe('UPLOAD_AND_SELECT');
  });

  it('should update state and emit cache when PDF page is rendered', () => {
    let sessionEmitted: any = undefined;
    component.fileSessionCached.subscribe((sess: ICachedFileSession) => {
      sessionEmitted = sess;
    });

    const mockCanvas = document.createElement('canvas');
    mockCanvas.width = 400;
    mockCanvas.height = 600;

    component.onPdfPageRendered({
      pageNumber: 2,
      totalPages: 5,
      canvas: mockCanvas,
      blob: new Blob(['canvas-blob'], { type: 'image/webp' }),
      dataUrl: 'data:image/webp;base64,mockRenderedPage',
      width: 400,
      height: 600
    });

    expect(component.currentPageNumber()).toBe(2);
    expect(component.totalPages()).toBe(5);
    expect(component.currentDataUrl()).toBe('data:image/webp;base64,mockRenderedPage');
    expect(component.currentCanvas).toBe(mockCanvas);
    expect(sessionEmitted).toBeTruthy();
    expect(sessionEmitted?.pageNumber).toBe(2);
  });

  it('should toggle all questions checked status in staging', () => {
    const questions: IStagedQuestion[] = [
      {
        id: 'q1',
        checked: true,
        question_text: '$x^2 + 1 = 0$',
        type: 'MCQ',
        options: ['1', '2', '3', '4'],
        correct_option_index: 0,
        points: 1,
        has_geometry_diagram: false
      },
      {
        id: 'q2',
        checked: true,
        question_text: '$\\int_0^1 x dx$',
        type: 'MCQ',
        options: ['1/2', '1', '2', '0'],
        correct_option_index: 0,
        points: 2,
        has_geometry_diagram: false
      }
    ];

    component.stagedQuestions.set(questions);
    expect(component.allChecked()).toBe(true);
    expect(component.selectedCount()).toBe(2);

    component.toggleAll(false);
    expect(component.allChecked()).toBe(false);
    expect(component.selectedCount()).toBe(0);

    component.toggleAll(true);
    expect(component.allChecked()).toBe(true);
    expect(component.selectedCount()).toBe(2);
  });

  it('should toggle a single question checked status and clamp points', () => {
    const questions: IStagedQuestion[] = [
      {
        id: 'q1',
        checked: true,
        question_text: '$\\triangle ABC$',
        type: 'MCQ',
        options: ['A', 'B', 'C', 'D'],
        correct_option_index: 1,
        points: 1,
        has_geometry_diagram: true
      }
    ];

    component.stagedQuestions.set(questions);
    component.toggleQuestion('q1');
    expect(component.stagedQuestions()[0].checked).toBe(false);
    expect(component.selectedCount()).toBe(0);

    component.toggleQuestion('q1');
    expect(component.stagedQuestions()[0].checked).toBe(true);

    component.updatePoints(component.stagedQuestions()[0], 100);
    expect(component.stagedQuestions()[0].points).toBe(50); // Clamped to 50

    component.updatePoints(component.stagedQuestions()[0], -5);
    expect(component.stagedQuestions()[0].points).toBe(1); // Clamped to 1
  });

  it('should delete a staged question', () => {
    const questions: IStagedQuestion[] = [
      {
        id: 'q1',
        checked: true,
        question_text: 'Question 1',
        type: 'ESSAY',
        options: [],
        correct_option_index: 0,
        points: 1,
        has_geometry_diagram: false
      },
      {
        id: 'q2',
        checked: true,
        question_text: 'Question 2',
        type: 'ESSAY',
        options: [],
        correct_option_index: 0,
        points: 1,
        has_geometry_diagram: false
      }
    ];

    component.stagedQuestions.set(questions);
    expect(component.stagedQuestions().length).toBe(2);

    component.deleteStagedQuestion('q1');
    expect(component.stagedQuestions().length).toBe(1);
    expect(component.stagedQuestions()[0].id).toBe('q2');
  });

  it('should remove cropped image from a staged question', () => {
    const mockBlob = new Blob(['img'], { type: 'image/webp' });
    const questions: IStagedQuestion[] = [
      {
        id: 'q1',
        checked: true,
        question_text: 'Geometry question',
        type: 'ESSAY',
        options: [],
        correct_option_index: 0,
        points: 2,
        has_geometry_diagram: true,
        localCropBlob: mockBlob,
        localCropPreviewUrl: 'blob:preview',
        question_image_url: 'https://cloudinary.com/test.webp'
      }
    ];

    component.stagedQuestions.set(questions);
    component.removeCroppedImage(component.stagedQuestions()[0]);

    const updated = component.stagedQuestions()[0];
    expect(updated.localCropBlob).toBeNull();
    expect(updated.localCropPreviewUrl).toBeNull();
    expect(updated.question_image_url).toBeNull();
  });

  it('should perform AI question extraction via HTTP call and populate staging', async () => {
    component.currentDataUrl.set('data:image/webp;base64,mockPageImageBase64');
    component.extractionMode.set('SMART_HYBRID');

    const extractPromise = component.startAiExtraction();

    const req = httpTestingController.expectOne('/api/v1/assessments/ai-extract-questions');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.mode).toBe('SMART_HYBRID');

    req.flush({
      success: true,
      data: {
        questions: [
          {
            question_text: 'أوجد قيمة $x$ إذا كان $2x + 6 = 10$',
            options: ['$x=2$', '$x=4$', '$x=3$', '$x=1$'],
            correct_option_index: 0,
            has_geometry_diagram: false,
            points: 1
          }
        ],
        count: 1
      }
    });

    await extractPromise;

    expect(component.stagedQuestions().length).toBe(1);
    expect(component.stagedQuestions()[0].question_text).toBe('أوجد قيمة $x$ إذا كان $2x + 6 = 10$');
    expect(component.currentStep()).toBe('STAGING_REVIEW');
  });

  it('should emit questionsExtracted on insertSelectedQuestions for checked questions', async () => {
    let extractedQuestions: any[] = [];
    component.questionsExtracted.subscribe((qs) => {
      extractedQuestions = qs;
    });

    const questions: IStagedQuestion[] = [
      {
        id: 'q1',
        checked: true,
        question_text: 'نص السؤال الأول $x$',
        type: 'MCQ',
        options: ['1', '2', '3', '4'],
        correct_option_index: 0,
        points: 2,
        has_geometry_diagram: false
      },
      {
        id: 'q2',
        checked: false, // Unchecked: must NOT be inserted!
        question_text: 'نص السؤال الثاني',
        type: 'ESSAY',
        options: [],
        correct_option_index: 0,
        points: 1,
        has_geometry_diagram: false
      }
    ];

    component.stagedQuestions.set(questions);
    component.isOpen.set(true);

    await component.insertSelectedQuestions();

    expect(extractedQuestions.length).toBe(1);
    expect(extractedQuestions[0].textAr).toBe('نص السؤال الأول $x$');
    expect(extractedQuestions[0].type).toBe('MCQ');
    expect(extractedQuestions[0].points).toBe(2);
    expect(component.isOpen()).toBe(false);
  });

  it('should retain previously staged questions from other pages when extracting a new page', async () => {
    // Stage a question from page 1
    component.currentPageNumber.set(1);
    component.currentDataUrl.set('data:image/webp;base64,page1');

    const extractP1 = component.startAiExtraction();
    const req1 = httpTestingController.expectOne('/api/v1/assessments/ai-extract-questions');
    req1.flush({
      success: true,
      data: {
        questions: [{ question_text: 'Question from Page 1', options: [], correct_option_index: 0, has_geometry_diagram: false, points: 1 }],
        count: 1
      }
    });
    await extractP1;
    expect(component.stagedQuestions().length).toBe(1);
    expect(component.stagedQuestions()[0].pageNumber).toBe(1);

    // Extract page 2
    component.currentPageNumber.set(2);
    component.currentDataUrl.set('data:image/webp;base64,page2');

    const extractP2 = component.startAiExtraction();
    const req2 = httpTestingController.expectOne('/api/v1/assessments/ai-extract-questions');
    req2.flush({
      success: true,
      data: {
        questions: [{ question_text: 'Question from Page 2', options: [], correct_option_index: 0, has_geometry_diagram: false, points: 1 }],
        count: 1
      }
    });
    await extractP2;

    // Both questions should be preserved
    expect(component.stagedQuestions().length).toBe(2);
    expect(component.stagedQuestions()[0].question_text).toBe('Question from Page 1');
    expect(component.stagedQuestions()[1].question_text).toBe('Question from Page 2');
  });

  it('should preserve correct option index when empty choices are trimmed', async () => {
    let insertedList: any[] = [];
    component.questionsExtracted.subscribe((res) => {
      insertedList = res;
    });

    component.stagedQuestions.set([
      {
        id: 'q_test_idx',
        checked: true,
        question_text: 'MCQ with empty option',
        type: 'MCQ',
        // Option 0 is empty, correct choice was originally Option 2 ("Choice C")
        options: ['', 'Choice B', 'Choice C', 'Choice D'],
        correct_option_index: 2,
        points: 5,
        has_geometry_diagram: false
      }
    ]);
    component.isOpen.set(true);

    await component.insertSelectedQuestions();

    expect(insertedList.length).toBe(1);
    const q = insertedList[0];
    expect(q.options).toEqual(['Choice B', 'Choice C', 'Choice D']);
    // "Choice C" is at index 1 in trimmed options, so correctOptionIndex must be 1!
    expect(q.options[q.correctOptionIndex]).toBe('Choice C');
  });

  it('should toggle question type between MCQ and ESSAY', () => {
    const q: IStagedQuestion = {
      id: 'q_toggle',
      checked: true,
      question_text: 'مسألة مقالية بدون خيارات',
      type: 'MCQ',
      options: ['A', 'B', 'C', 'D'],
      correct_option_index: 0,
      points: 2,
      has_geometry_diagram: false
    };
    component.stagedQuestions.set([q]);

    component.setQuestionType(component.stagedQuestions()[0], 'ESSAY');
    expect(component.stagedQuestions()[0].type).toBe('ESSAY');

    component.setQuestionType(component.stagedQuestions()[0], 'MCQ');
    expect(component.stagedQuestions()[0].type).toBe('MCQ');
  });

  it('should show confirmation dialog before deleting question from staging', () => {
    const q: IStagedQuestion = {
      id: 'q_del',
      checked: true,
      question_text: 'سؤال للتجربة',
      type: 'MCQ',
      options: ['1', '2'],
      correct_option_index: 0,
      points: 1,
      has_geometry_diagram: false
    };
    component.stagedQuestions.set([q]);

    component.promptDeleteQuestion('q_del');
    expect(component.confirmationDialog()).not.toBeNull();
    expect(component.confirmationDialog()?.title).toContain('تأكيد حذف');

    // Confirm deletion
    component.confirmationDialog()?.onConfirm();
    expect(component.stagedQuestions().length).toBe(0);
    expect(component.confirmationDialog()).toBeNull();
  });

  it('should show confirmation dialog before removing cropped diagram', () => {
    const q: IStagedQuestion = {
      id: 'q_diag',
      checked: true,
      question_text: 'سؤال برسم',
      type: 'MCQ',
      options: ['1', '2'],
      correct_option_index: 0,
      points: 1,
      has_geometry_diagram: true,
      localCropPreviewUrl: 'data:image/webp;base64,diag'
    };
    component.stagedQuestions.set([q]);

    component.promptRemoveCroppedImage(component.stagedQuestions()[0]);
    expect(component.confirmationDialog()).not.toBeNull();
    expect(component.confirmationDialog()?.title).toContain('الرسم الهندسي');

    // Confirm diagram removal
    component.confirmationDialog()?.onConfirm();
    expect(component.stagedQuestions()[0].has_geometry_diagram).toBeFalse();
    expect(component.stagedQuestions()[0].localCropPreviewUrl).toBeNull();
  });

  it('should update staged question with sliced diagram and normalized box_2d on sliceSaved', () => {
    const q: IStagedQuestion = {
      id: 'q_slice_test',
      checked: true,
      question_text: 'مسألة هندسية',
      type: 'MCQ',
      options: ['A', 'B'],
      correct_option_index: 0,
      points: 1,
      has_geometry_diagram: false
    };
    component.stagedQuestions.set([q]);
    component.openManualSlicerForQuestion(q);
    expect(component.isSlicerOpen()).toBeTrue();
    expect(component.activeSlicingQuestion()?.id).toBe('q_slice_test');

    const mockBlob = new Blob(['mock-slice'], { type: 'image/webp' });
    component.onSliceSaved({
      imageUrl: 'data:image/webp;base64,newcrop',
      dataUrl: 'data:image/webp;base64,newcrop',
      blob: mockBlob,
      sizeKb: 45,
      width: 250,
      height: 200,
      box_2d: [150, 150, 450, 550]
    });

    expect(component.isSlicerOpen()).toBeFalse();
    expect(component.activeSlicingQuestion()).toBeNull();
    const updated = component.stagedQuestions()[0];
    expect(updated.has_geometry_diagram).toBeTrue();
    expect(updated.localCropPreviewUrl).toBe('data:image/webp;base64,newcrop');
    expect(updated.box_2d).toEqual([150, 150, 450, 550]);
  });

  it('should emit fileSessionCached and manualSlicingRequested when useFileForManualSlicing is called', () => {
    let sessionEmitted: any = undefined;
    let manualReqEmitted: any = undefined;

    component.fileSessionCached.subscribe((sess) => {
      sessionEmitted = sess;
    });
    component.manualSlicingRequested.subscribe((sess) => {
      manualReqEmitted = sess;
    });

    component.isOpen.set(true);
    component.fileName.set('sample_exam.pdf');
    component.fileType.set('pdf');
    component.currentPageNumber.set(4);
    component.currentDataUrl.set('data:image/webp;base64,page4data');

    component.useFileForManualSlicing();

    expect(sessionEmitted).toBeTruthy();
    expect(sessionEmitted.pageNumber).toBe(4);
    expect(manualReqEmitted).toBeTruthy();
    expect(manualReqEmitted.pageNumber).toBe(4);
    expect(component.isOpen()).toBe(false);
  });

  it('should redirect startAiExtraction to useFileForManualSlicing when extractionMode is MANUAL_CROP', async () => {
    spyOn(component, 'useFileForManualSlicing');
    component.extractionMode.set('MANUAL_CROP');
    await component.startAiExtraction();
    expect(component.useFileForManualSlicing).toHaveBeenCalled();
  });

  it('should restore cached session and keep step on UPLOAD_AND_SELECT so modes are visible', () => {
    const mockSession = {
      fileName: 'geometry_final.pdf',
      fileType: 'pdf' as const,
      file: null,
      pageNumber: 2,
      canvas: null,
      dataUrl: 'data:image/webp;base64,mockdata'
    };

    (component as any).restoreCachedSession(mockSession);

    expect(component.fileName()).toBe('geometry_final.pdf');
    expect(component.fileType()).toBe('pdf');
    expect(component.currentPageNumber()).toBe(2);
    expect(component.currentStep()).toBe('UPLOAD_AND_SELECT');
  });

  describe('Multi-Page Extraction & Page Range Controls', () => {
    beforeEach(() => {
      component.totalPages.set(20);
      component.currentPageNumber.set(5);
    });

    it('should initialize with CURRENT_PAGE mode and 1 selected page count', () => {
      expect(component.pageScopeMode()).toBe('CURRENT_PAGE');
      expect(component.selectedPageCount()).toBe(1);
      expect(component.isRangeValid()).toBeTrue();
    });

    it('should switch to PAGE_RANGE mode and configure default range', () => {
      component.setPageScopeMode('PAGE_RANGE');
      expect(component.pageScopeMode()).toBe('PAGE_RANGE');
      expect(component.rangeStartPage()).toBe(5);
      expect(component.rangeEndPage()).toBe(6);
      expect(component.selectedPageCount()).toBe(2);
      expect(component.isRangeValid()).toBeTrue();
    });

    it('should validate page range boundaries and clamp appropriately', () => {
      component.setPageScopeMode('PAGE_RANGE');
      component.onStartPageChanged(8);
      expect(component.rangeStartPage()).toBe(8);
      expect(component.rangeEndPage()).toBe(8);

      component.onEndPageChanged(12);
      expect(component.rangeEndPage()).toBe(12);
      expect(component.selectedPageCount()).toBe(5);
      expect(component.isRangeValid()).toBeTrue();

      component.onEndPageChanged(19);
      expect(component.isRangeValid()).toBeFalse();
    });

    it('should apply preset counts correctly', () => {
      component.setPageScopeMode('PAGE_RANGE');
      component.rangeStartPage.set(3);
      component.applyPresetCount(3);
      expect(component.rangeEndPage()).toBe(5);
      expect(component.selectedPageCount()).toBe(3);

      component.applyPresetCount(5);
      expect(component.rangeEndPage()).toBe(7);
      expect(component.selectedPageCount()).toBe(5);
    });

    it('should sequentially extract questions from multiple pages in range', async () => {
      component.setPageScopeMode('PAGE_RANGE');
      component.rangeStartPage.set(1);
      component.rangeEndPage.set(2);
      component.totalPages.set(10);
      component.fileType.set('pdf');
      component.currentPageNumber.set(1);

      const mockCanvas1 = document.createElement('canvas');
      mockCanvas1.width = 100;
      mockCanvas1.height = 100;
      component.currentCanvas = mockCanvas1;
      component.currentDataUrl.set('data:image/webp;base64,page1');

      const mockCanvas2 = document.createElement('canvas');
      mockCanvas2.width = 100;
      mockCanvas2.height = 100;
      const mockViewer = {
        renderPageToDataUrl: jasmine.createSpy('renderPageToDataUrl').and.resolveTo({
          canvas: mockCanvas2,
          dataUrl: 'data:image/webp;base64,page2'
        })
      };
      (component as any).pdfViewer = () => mockViewer;

      const extractionPromise = component.startAiExtraction();

      const req1 = httpTestingController.expectOne('/api/v1/assessments/ai-extract-questions');
      expect(req1.request.body.imageBase64).toBe('data:image/webp;base64,page1');
      req1.flush({
        success: true,
        data: {
          questions: [
            {
              question_text: 'Question from page 1',
              options: ['A', 'B', 'C', 'D'],
              correct_option_index: 0,
              has_geometry_diagram: false,
              points: 1
            }
          ],
          count: 1
        }
      });

      await new Promise(r => setTimeout(r, 10));

      const req2 = httpTestingController.expectOne('/api/v1/assessments/ai-extract-questions');
      expect(req2.request.body.imageBase64).toBe('data:image/webp;base64,page2');
      req2.flush({
        success: true,
        data: {
          questions: [
            {
              question_text: 'Question from page 2',
              options: ['1', '2', '3', '4'],
              correct_option_index: 1,
              has_geometry_diagram: false,
              points: 2
            }
          ],
          count: 1
        }
      });

      await extractionPromise;

      expect(component.stagedQuestions().length).toBe(2);
      expect(component.stagedQuestions()[0].pageNumber).toBe(1);
      expect(component.stagedQuestions()[0].question_text).toBe('Question from page 1');
      expect(component.stagedQuestions()[1].pageNumber).toBe(2);
      expect(component.stagedQuestions()[1].question_text).toBe('Question from page 2');
      expect(component.currentPageNumber()).toBe(2);
      expect(component.currentStep()).toBe('STAGING_REVIEW');
    });
  });

  describe('PDF Page Memory & Session Isolation', () => {
    it('should persist page to sessionStorage on page change and restore it', () => {
      const assessmentId = 'asm_test_session_1';
      const fileName = 'unit3_math.pdf';
      (component as any).assessmentId = () => assessmentId;
      component.fileName.set(fileName);

      component.onPdfPageChanged(7);
      expect(component.currentPageNumber()).toBe(7);

      const stored = component.getStoredPageFromSessionStorage(assessmentId, fileName);
      expect(stored).toBe(7);
    });

    it('should reset currentPageNumber to 1 when a different file is selected', () => {
      component.fileName.set('original_book.pdf');
      component.currentPageNumber.set(15);

      const newFile = new File(['content'], 'new_chapter.pdf', { type: 'application/pdf' });
      component.handleSelectedFile(newFile);

      expect(component.fileName()).toBe('new_chapter.pdf');
      expect(component.currentPageNumber()).toBe(1);
    });

    it('should return to PREVIEW_AND_PAGE step after insertSelectedQuestions', () => {
      component.currentStep.set('STAGING_REVIEW');
      component.stagedQuestions.set([
        {
          id: 'q_test_1',
          checked: true,
          question_text: 'Sample question',
          type: 'MCQ',
          options: ['A', 'B'],
          correct_option_index: 0,
          points: 1,
          has_geometry_diagram: false
        }
      ]);

      component.insertSelectedQuestions();

      expect(component.currentStep()).toBe('PREVIEW_AND_PAGE');
      expect(component.isOpen()).toBeFalse();
    });

    it('should use fallbackDraftId so empty assessmentId drafts never collide', () => {
      (component as any).assessmentId = () => '';
      const effId = component.getEffectiveAssessmentId();
      expect(effId).toBeTruthy();
      expect(effId.startsWith('draft_asm_')).toBeTrue();
    });

    it('should strictly isolate sessions between different assessments so assessment 2 does not inherit assessment 1 file or page', () => {
      const sessionAsm1: ICachedFileSession = {
        fileName: 'quiz1_exam.pdf',
        fileType: 'pdf',
        file: new File(['mock content'], 'quiz1_exam.pdf', { type: 'application/pdf' }),
        pageNumber: 30,
        canvas: document.createElement('canvas'),
        dataUrl: 'data:image/webp;base64,mock',
        totalPages: 45
      };

      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('assessmentId', 'assessment_quiz_1');
      fixture.componentRef.setInput('existingSession', sessionAsm1);
      fixture.detectChanges();

      expect(component.fileName()).toBe('quiz1_exam.pdf');
      expect(component.currentPageNumber()).toBe(30);

      // Now switch to Assessment 2 (e.g. homework) with NO session
      fixture.componentRef.setInput('assessmentId', 'assessment_homework_2');
      fixture.componentRef.setInput('existingSession', null);
      fixture.detectChanges();

      // Assessment 2 must start fresh on UPLOAD_AND_SELECT with empty file and page 1
      expect(component.fileName()).toBe('');
      expect(component.uploadedFile()).toBeNull();
      expect(component.currentPageNumber()).toBe(1);
      expect(component.currentStep()).toBe('UPLOAD_AND_SELECT');
      expect(component.currentCanvas).toBeNull();
      expect(component.currentDataUrl()).toBeNull();
    });

    it('should restore last viewed page when re-selecting the same file for the assessment', () => {
      const assessmentId = 'asm_test_restore_page';
      const fileName = 'unit_math_40_pages.pdf';
      (component as any).assessmentId = () => assessmentId;

      component.persistPageToSessionStorage(assessmentId, fileName, 30);

      const file = new File(['mock pdf content'], fileName, { type: 'application/pdf' });
      component.handleSelectedFile(file);

      expect(component.fileName()).toBe(fileName);
      expect(component.currentPageNumber()).toBe(30);
    });

    it('should configure narrower width and taller height on modal window for tablet and desktop viewports', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('assessmentId', 'asm_layout_test');
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const modalWin = hostEl.querySelector('.modal-window');
      expect(modalWin).toBeTruthy();
      expect(modalWin?.classList.contains('md:max-w-3xl')).toBeTrue();
      expect(modalWin?.classList.contains('lg:max-w-[820px]')).toBeTrue();
      expect(modalWin?.classList.contains('md:h-[calc(100dvh-2.5rem)]')).toBeTrue();
      expect(modalWin?.classList.contains('max-w-5xl')).toBeFalse();
      expect(modalWin?.classList.contains('lg:h-[calc(100dvh-10.5rem)]')).toBeFalse();
    });

    it('should compress oversized canvas for AI payload while preserving small canvases verbatim', () => {
      const smallCanvas = document.createElement('canvas');
      smallCanvas.width = 800;
      smallCanvas.height = 1000;
      expect(component.getOptimizedAiBase64(smallCanvas, 'data:image/webp;base64,small')).toBe('data:image/webp;base64,small');

      const largeCanvas = document.createElement('canvas');
      largeCanvas.width = 2400;
      largeCanvas.height = 3200;
      const optimized = component.getOptimizedAiBase64(largeCanvas, 'data:image/webp;base64,huge');
      expect(optimized.startsWith('data:image/')).toBeTrue();
      expect(optimized).not.toBe('data:image/webp;base64,huge');
    });

    it('should extract multiple uploaded images sequentially', async () => {
      const c1 = document.createElement('canvas');
      c1.width = 100;
      c1.height = 100;
      const c2 = document.createElement('canvas');
      c2.width = 100;
      c2.height = 100;

      component.fileType.set('image');
      component.uploadedImages.set([
        { fileName: 'img1.png', canvas: c1, dataUrl: 'data:image/webp;base64,img1' },
        { fileName: 'img2.png', canvas: c2, dataUrl: 'data:image/webp;base64,img2' }
      ]);
      component.totalPages.set(2);
      component.currentPageNumber.set(1);
      component.currentCanvas = c1;
      component.currentDataUrl.set('data:image/webp;base64,img1');
      component.pageScopeMode.set('PAGE_RANGE');
      component.rangeStartPage.set(1);
      component.rangeEndPage.set(2);

      const extractionPromise = component.startAiExtraction();

      const req1 = httpTestingController.expectOne('/api/v1/assessments/ai-extract-questions');
      expect(req1.request.body.imageBase64).toBe('data:image/webp;base64,img1');
      req1.flush({
        success: true,
        data: {
          questions: [{ question_text: 'Image 1 Q', options: ['A', 'B'], correct_option_index: 0, has_geometry_diagram: false, points: 1 }]
        }
      });

      await new Promise(r => setTimeout(r, 10));

      const req2 = httpTestingController.expectOne('/api/v1/assessments/ai-extract-questions');
      expect(req2.request.body.imageBase64).toBe('data:image/webp;base64,img2');
      req2.flush({
        success: true,
        data: {
          questions: [{ question_text: 'Image 2 Q', options: ['C', 'D'], correct_option_index: 1, has_geometry_diagram: false, points: 2 }]
        }
      });

      await extractionPromise;

      expect(component.stagedQuestions().length).toBe(2);
      expect(component.stagedQuestions()[0].question_text).toBe('Image 1 Q');
      expect(component.stagedQuestions()[1].question_text).toBe('Image 2 Q');
      expect(component.currentStep()).toBe('STAGING_REVIEW');
    });

    it('should preserve extracted questions on partial 504 failure during multi-page batch', async () => {
      component.setPageScopeMode('PAGE_RANGE');
      component.rangeStartPage.set(1);
      component.rangeEndPage.set(2);
      component.totalPages.set(5);
      component.fileType.set('pdf');
      component.currentPageNumber.set(1);

      const mockCanvas1 = document.createElement('canvas');
      mockCanvas1.width = 100;
      mockCanvas1.height = 100;
      component.currentCanvas = mockCanvas1;
      component.currentDataUrl.set('data:image/webp;base64,page1');

      const mockCanvas2 = document.createElement('canvas');
      mockCanvas2.width = 100;
      mockCanvas2.height = 100;
      const mockViewer = {
        renderPageToDataUrl: jasmine.createSpy('renderPageToDataUrl').and.resolveTo({
          canvas: mockCanvas2,
          dataUrl: 'data:image/webp;base64,page2'
        })
      };
      (component as any).pdfViewer = () => mockViewer;

      const extractionPromise = component.startAiExtraction();

      const req1 = httpTestingController.expectOne('/api/v1/assessments/ai-extract-questions');
      req1.flush({
        success: true,
        data: {
          questions: [{ question_text: 'Saved Q from Page 1', options: ['A', 'B'], correct_option_index: 0, has_geometry_diagram: false, points: 1 }]
        }
      });

      await new Promise(r => setTimeout(r, 10));

      const req2 = httpTestingController.expectOne('/api/v1/assessments/ai-extract-questions');
      req2.flush('An error occurred with your deployment', { status: 504, statusText: 'Gateway Timeout' });

      await extractionPromise;

      expect(component.stagedQuestions().length).toBe(1);
      expect(component.stagedQuestions()[0].question_text).toBe('Saved Q from Page 1');
      expect(component.currentStep()).toBe('STAGING_REVIEW');
      expect(component.errorMessage()).toContain('2');
    });

    it('should format 504 deployment timeout into clear Arabic guidance when all pages fail', async () => {
      component.currentDataUrl.set('data:image/webp;base64,page1');
      component.fileType.set('image');

      const extractionPromise = component.startAiExtraction();

      const req = httpTestingController.expectOne('/api/v1/assessments/ai-extract-questions');
      req.flush('An error occurred with your deployment', { status: 504, statusText: 'Gateway Timeout' });

      await extractionPromise;

      expect(component.errorMessage()).toContain('504');
    });
  });
});
