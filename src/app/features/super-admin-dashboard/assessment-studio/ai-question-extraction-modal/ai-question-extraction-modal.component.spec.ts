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
        options: ['1', '2', '3', '4'],
        correct_option_index: 0,
        points: 1,
        has_geometry_diagram: false
      },
      {
        id: 'q2',
        checked: true,
        question_text: '$\\int_0^1 x dx$',
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
        options: [],
        correct_option_index: 0,
        points: 1,
        has_geometry_diagram: false
      },
      {
        id: 'q2',
        checked: true,
        question_text: 'Question 2',
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
        options: ['1', '2', '3', '4'],
        correct_option_index: 0,
        points: 2,
        has_geometry_diagram: false
      },
      {
        id: 'q2',
        checked: false, // Unchecked: must NOT be inserted!
        question_text: 'نص السؤال الثاني',
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
});
