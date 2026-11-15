import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import {
  InteractiveGradingStudioComponent,
  normalizeForMatch,
  isTextAnswerEquivalent
} from './interactive-grading-studio.component';

describe('InteractiveGradingStudioComponent', () => {
  let component: InteractiveGradingStudioComponent;
  let fixture: ComponentFixture<InteractiveGradingStudioComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InteractiveGradingStudioComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(InteractiveGradingStudioComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pendingSubmissions', []);
    fixture.detectChanges();
  });

  afterEach(() => {
    // Clean up any pending initial requests
    const pendingReqs = httpMock.match('/api/v1/admin/submissions');
    pendingReqs.forEach((req) => req.flush({ success: true, data: { submissions: [], stats: {} } }));
  });

  it('should create interactive grading studio component', () => {
    expect(component).toBeTruthy();
  });

  it('should adjust zoom levels appropriately', () => {
    expect(component.canvasZoom()).toBe(1);
    component.zoomIn();
    expect(component.canvasZoom()).toBe(1.25);
    component.zoomOut();
    expect(component.canvasZoom()).toBe(1);
  });

  it('should rotate canvas by 90 degrees intervals', () => {
    expect(component.canvasRotation()).toBe(0);
    component.rotateCanvas();
    expect(component.canvasRotation()).toBe(90);
    component.rotateCanvas();
    expect(component.canvasRotation()).toBe(180);
  });

  it('should accurately handle teacher essay grading decisions in details modal', () => {
    const mockSubmission: any = {
      id: 'sub_test_1',
      studentName: 'Mohammed Khaled',
      haCode: 'HA1001',
      totalPoints: 15,
      mcqAutoScore: 0,
      essayManualScore: 0,
      finalTotalScore: 5,
      scorePercentage: 33,
      status: 'PENDING',
      answers: [
        {
          questionId: 'q1',
          questionText: 'MCQ Question',
          questionType: 'MCQ',
          points: 5,
          pointsEarned: 0,
          isCorrect: false
        },
        {
          questionId: 'q2',
          questionText: 'Input Text Question',
          questionType: 'INPUT_TEXT',
          points: 5,
          pointsEarned: 5,
          isCorrect: true,
          studentTextAnswer: '5'
        },
        {
          questionId: 'q3',
          questionText: 'Essay Photo Question',
          questionType: 'ESSAY_PHOTO',
          points: 5,
          pointsEarned: 0,
          isCorrect: false,
          isPendingManualGrading: true
        }
      ]
    };

    const essayQ = mockSubmission.answers[2];
    expect(essayQ.isPendingManualGrading).toBe(true);

    // 1. Grade FULL
    component.gradeEssayQuestionInModal(mockSubmission, essayQ, 'FULL');
    expect(essayQ.pointsEarned).toBe(5);
    expect(essayQ.gradingDecision).toBe('FULL');
    expect(essayQ.isPendingManualGrading).toBe(false);
    expect(mockSubmission.finalTotalScore).toBe(10); // 5 (auto) + 5 (essay)

    // 2. Grade HALF
    component.gradeEssayQuestionInModal(mockSubmission, essayQ, 'HALF');
    expect(essayQ.pointsEarned).toBe(2.5);
    expect(essayQ.gradingDecision).toBe('HALF');
    expect(mockSubmission.finalTotalScore).toBe(7.5); // 5 (auto) + 2.5 (essay)

    // 3. Grade ZERO
    component.gradeEssayQuestionInModal(mockSubmission, essayQ, 'ZERO');
    expect(essayQ.pointsEarned).toBe(0);
    expect(essayQ.gradingDecision).toBe('ZERO');
    expect(mockSubmission.finalTotalScore).toBe(5); // 5 (auto) + 0 (essay)
  });

  it('should control lightbox image preview zoom and rotation', () => {
    component.openImagePreview('https://example.com/image.webp');
    expect(component.previewImageUrl()).toBe('https://example.com/image.webp');
    expect(component.previewImageZoom()).toBe(1);

    component.zoomInPreview();
    expect(component.previewImageZoom()).toBe(1.25);

    component.rotatePreview();
    expect(component.previewImageRotation()).toBe(90);

    component.closeImagePreview();
    expect(component.previewImageUrl()).toBeNull();
  });

  it('should normalize and match student typed text accurately', () => {
    expect(normalizeForMatch(' ٥ ')).toBe('5');
    expect(isTextAnswerEquivalent('٥', '5')).toBe(true);
    expect(isTextAnswerEquivalent('5.0', '5')).toBe(true);
    expect(isTextAnswerEquivalent('1/2', '0.5')).toBe(true);
    expect(isTextAnswerEquivalent('دائره', 'دائرة')).toBe(true);
    expect(isTextAnswerEquivalent('خَمْسَة', 'خمسة')).toBe(true);
    expect(isTextAnswerEquivalent('7', '5')).toBe(false);
  });

  it('should keep multi-essay quiz PENDING until all essay questions are graded', () => {
    const multiSubmission: any = {
      id: 'sub_multi',
      totalPoints: 15,
      finalTotalScore: 5,
      status: 'PENDING',
      answers: [
        { questionId: 'q1', questionType: 'MCQ', points: 5, pointsEarned: 5 },
        { questionId: 'q2', questionType: 'ESSAY_PHOTO', points: 5, pointsEarned: 0, isPendingManualGrading: true },
        { questionId: 'q3', questionType: 'ESSAY_PHOTO', points: 5, pointsEarned: 0, isPendingManualGrading: true }
      ]
    };

    // Grade only Q2
    component.gradeEssayQuestionInModal(multiSubmission, multiSubmission.answers[1], 'FULL');
    expect(multiSubmission.answers[1].isPendingManualGrading).toBe(false);
    expect(multiSubmission.answers[2].isPendingManualGrading).toBe(true);
    expect(multiSubmission.status).toBe('PENDING'); // Must remain PENDING!

    // Grade Q3
    component.gradeEssayQuestionInModal(multiSubmission, multiSubmission.answers[2], 'HALF');
    expect(multiSubmission.answers[2].isPendingManualGrading).toBe(false);
    expect(multiSubmission.status).toBe('PUBLISHED'); // Now transitions to PUBLISHED
    expect(multiSubmission.finalTotalScore).toBe(12.5); // 5 + 5 + 2.5
  });

  it('should allow teacher to freely set custom grade or presets for essay questions', () => {
    const testSub: any = {
      id: 'sub_test_points',
      studentName: 'Mohammed Khaled',
      haCode: 'HA1001',
      assessmentId: 'asm_1',
      assessmentTitle: 'October test',
      totalPoints: 15,
      mcqAutoScore: 10,
      essayManualScore: 0,
      finalTotalScore: 10,
      status: 'PENDING',
      answers: [
        { questionId: 'q1', questionType: 'MCQ', points: 5, pointsEarned: 5 },
        { questionId: 'q2', questionType: 'INPUT_TEXT', points: 5, pointsEarned: 5 },
        { questionId: 'q3', questionType: 'ESSAY_PHOTO', points: 5, pointsEarned: 0, isPendingManualGrading: true }
      ],
      homeworkImages: [{ imageUrl: 'https://example.com/step.webp' }]
    };

    const essayQ = testSub.answers[2];
    // Test custom score setting (e.g. 3.5 out of 5)
    component.gradeEssayQuestionInModal(testSub, essayQ, 'CUSTOM', 3.5);
    expect(essayQ.pointsEarned).toBe(3.5);
    expect(essayQ.gradingDecision).toBe('CUSTOM');
    expect(testSub.finalTotalScore).toBe(13.5);

    const req = httpMock.expectOne('/api/v1/admin/submissions/sub_test_points/grade');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.essay_manual_score).toBe(3.5);
    req.flush({ success: true, data: {} });
  });

  it('should manage approval confirmation flow before publishing', () => {
    const mockSub: any = {
      id: 'sub_approve_test',
      studentName: 'Ziad Ammar',
      haCode: 'HA1002',
      assessmentTitle: 'Algebra Quiz',
      finalTotalScore: 10,
      totalPoints: 10,
      status: 'PENDING'
    };

    // 1. Trigger confirmation
    component.confirmAndApproveSubmission(mockSub);
    expect(component.pendingApprovalSubmission()).toEqual(mockSub);

    // 2. Cancel confirmation
    component.cancelApprovalConfirmation();
    expect(component.pendingApprovalSubmission()).toBeNull();

    // 3. Confirm and proceed with approval
    component.confirmAndApproveSubmission(mockSub);
    component.proceedWithApproval();
    // In-flight state holds dialog and shows loading indicator
    expect(component.isApprovingId()).toBe('sub_approve_test');
    expect(component.pendingApprovalSubmission()).toEqual(mockSub);

    const req = httpMock.expectOne('/api/v1/admin/submissions/sub_approve_test/approve');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, message: 'Approved' });

    expect(component.isApprovingId()).toBeNull();
    expect(component.pendingApprovalSubmission()).toBeNull();
    expect(mockSub.status).toBe('PUBLISHED');
  });

  it('should prevent duplicate approval if submission is already PUBLISHED', () => {
    const alreadyPublishedSub: any = {
      id: 'sub_already_published',
      studentName: 'Heba Student',
      haCode: 'HA1003',
      status: 'PUBLISHED'
    };

    // Attempting confirmation on already published submission does nothing
    component.confirmAndApproveSubmission(alreadyPublishedSub);
    expect(component.pendingApprovalSubmission()).toBeNull();

    // Attempting direct approval on already published submission does not fire HTTP request
    component.approveSubmissionDirectly(alreadyPublishedSub);
    httpMock.expectNone('/api/v1/admin/submissions/sub_already_published/approve');
  });

  it('should accurately calculate unreviewed/pending quizzes per student (e.g. 5 submitted, 3 graded -> 2 pending)', () => {
    const submissionsList: any[] = [
      { id: 'sub_1', studentId: 'stu_1', haCode: 'HA1001', studentName: 'Student One', status: 'PUBLISHED' },
      { id: 'sub_2', studentId: 'stu_1', haCode: 'HA1001', studentName: 'Student One', status: 'PUBLISHED' },
      { id: 'sub_3', studentId: 'stu_1', haCode: 'HA1001', studentName: 'Student One', status: 'PUBLISHED' },
      { id: 'sub_4', studentId: 'stu_1', haCode: 'HA1001', studentName: 'Student One', status: 'PENDING' },
      { id: 'sub_5', studentId: 'stu_1', haCode: 'HA1001', studentName: 'Student One', status: 'PENDING' },
      { id: 'sub_6', studentId: 'stu_2', haCode: 'HA1002', studentName: 'Student Two', status: 'PUBLISHED' }
    ];

    component.allSubmissions.set(submissionsList);

    // Student One: 5 total submitted quizzes, 3 published, 2 pending
    expect(component.getStudentTotalQuizCount('stu_1', 'HA1001')).toBe(5);
    expect(component.getStudentPendingQuizCount('stu_1', 'HA1001')).toBe(2);

    const summaryOne = component.getStudentSummary('stu_1', 'HA1001');
    expect(summaryOne).toBeTruthy();
    expect(summaryOne?.total).toBe(5);
    expect(summaryOne?.published).toBe(3);
    expect(summaryOne?.pending).toBe(2);

    // Student Two: 1 total, 1 published, 0 pending
    expect(component.getStudentTotalQuizCount('stu_2', 'HA1002')).toBe(1);
    expect(component.getStudentPendingQuizCount('stu_2', 'HA1002')).toBe(0);
  });

  it('should group submissions by student, displaying only unreviewed count and quizzes cleanly', () => {
    const submissionsList: any[] = [
      { id: 'sub_1', studentId: 'stu_1', haCode: 'HA1001', studentName: 'Ahmed Ali', assessmentTitle: 'Quiz 1', attemptNumber: 1, status: 'PUBLISHED', totalPoints: 10, finalTotalScore: 10, scorePercentage: 100 },
      { id: 'sub_2', studentId: 'stu_1', haCode: 'HA1001', studentName: 'Ahmed Ali', assessmentTitle: 'Quiz 2', attemptNumber: 1, status: 'PUBLISHED', totalPoints: 10, finalTotalScore: 8, scorePercentage: 80 },
      { id: 'sub_3', studentId: 'stu_1', haCode: 'HA1001', studentName: 'Ahmed Ali', assessmentTitle: 'Quiz 3', attemptNumber: 1, status: 'PUBLISHED', totalPoints: 10, finalTotalScore: 9, scorePercentage: 90 },
      { id: 'sub_4', studentId: 'stu_1', haCode: 'HA1001', studentName: 'Ahmed Ali', assessmentTitle: 'Quiz 4', attemptNumber: 1, status: 'PENDING', totalPoints: 10, finalTotalScore: 7, scorePercentage: 70 },
      { id: 'sub_5', studentId: 'stu_1', haCode: 'HA1001', studentName: 'Ahmed Ali', assessmentTitle: 'Quiz 5', attemptNumber: 1, status: 'PENDING', totalPoints: 10, finalTotalScore: 6, scorePercentage: 60 },
      { id: 'sub_6', studentId: 'stu_2', haCode: 'HA1002', studentName: 'Sara Nour', assessmentTitle: 'Quiz 1', attemptNumber: 1, status: 'PUBLISHED', totalPoints: 10, finalTotalScore: 10, scorePercentage: 100 }
    ];

    component.allSubmissions.set(submissionsList);

    const groups = component.studentGroups();
    expect(groups.length).toBe(2);

    // Ahmed has 2 pending quizzes, so he is sorted first
    const ahmedGroup = groups.find((g) => g.studentId === 'stu_1');
    expect(ahmedGroup).toBeTruthy();
    expect(ahmedGroup?.totalQuizzes).toBe(5);
    expect(ahmedGroup?.publishedQuizzes).toBe(3);
    expect(ahmedGroup?.pendingQuizzes).toBe(2);
    expect(ahmedGroup?.quizzes.length).toBe(5);

    // Sara has 0 pending quizzes
    const saraGroup = groups.find((g) => g.studentId === 'stu_2');
    expect(saraGroup).toBeTruthy();
    expect(saraGroup?.totalQuizzes).toBe(1);
    expect(saraGroup?.publishedQuizzes).toBe(1);
    expect(saraGroup?.pendingQuizzes).toBe(0);

    // Default view mode is BY_STUDENT
    expect(component.viewGroupingMode()).toBe('BY_STUDENT');

    // Toggle expand for Ahmed
    expect(component.isStudentExpanded('stu_1')).toBeFalse();
    component.toggleStudentExpanded('stu_1');
    expect(component.isStudentExpanded('stu_1')).toBeTrue();

    // Auto-expand on search
    component.setSearchQuery('Sara');
    expect(component.isStudentExpanded('stu_2')).toBeTrue();

    // Switch view mode
    component.viewStudentGroup('Ahmed Ali');
    expect(component.viewGroupingMode()).toBe('BY_STUDENT');
    expect(component.searchQuery()).toBe('Ahmed Ali');
  });

  it('should provide student filter and active student summary banner', () => {
    const submissionsList: any[] = [
      { id: 'sub_1', studentId: 'stu_1', haCode: 'HA1001', studentName: 'Omar Khaled', assessmentTitle: 'Quiz 1', status: 'PUBLISHED' },
      { id: 'sub_2', studentId: 'stu_1', haCode: 'HA1001', studentName: 'Omar Khaled', assessmentTitle: 'Quiz 2', status: 'PENDING' }
    ];

    component.allSubmissions.set(submissionsList);

    // Filter by student
    component.filterByStudent('Omar Khaled');
    expect(component.searchQuery()).toBe('Omar Khaled');
    expect(component.viewGroupingMode()).toBe('BY_STUDENT');

    const summary = component.activeStudentSummary();
    expect(summary).toBeTruthy();
    expect(summary?.studentName).toBe('Omar Khaled');
    expect(summary?.pending).toBe(1);
    expect(summary?.total).toBe(2);

    // Clear filter
    component.clearStudentFilter();
    expect(component.searchQuery()).toBe('');
    expect(component.activeStudentSummary()).toBeNull();
  });

  describe('Navbar Clearance and Lightbox Layering Contract', () => {
    it('should assign z-layer-preview and safe navbar clearance to image preview lightbox', () => {
      component.previewImageUrl.set('https://example.com/solution-essay.jpg');
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const lightbox = hostEl.querySelector('.z-layer-preview');
      expect(lightbox).toBeTruthy();
      expect(lightbox?.classList.contains('pt-16')).toBeTrue();
      expect(lightbox?.classList.contains('sm:pt-20')).toBeTrue();

      // Verify toolbar is positioned below the navbar (top-18 / top-24)
      const toolbar = lightbox?.querySelector('.absolute.top-18');
      expect(toolbar).toBeTruthy();
      expect(toolbar?.classList.contains('sm:top-24')).toBeTrue();

      // Close button inside toolbar (4th button in toolbar controls)
      const allButtons = toolbar?.querySelectorAll('button');
      const closeBtn = allButtons ? allButtons[allButtons.length - 1] as HTMLButtonElement : null;
      expect(closeBtn).toBeTruthy();
      closeBtn?.click();
      expect(component.previewImageUrl()).toBeNull();
    });

    it('should contain zero Unicode emojis in rendered template', () => {
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
      expect(emojiRegex.test(fixture.nativeElement.innerHTML)).toBeFalse();
    });
  });
});
