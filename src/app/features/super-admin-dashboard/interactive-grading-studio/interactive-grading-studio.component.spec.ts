import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import {
  InteractiveGradingStudioComponent,
  normalizeForMatch,
  isTextAnswerEquivalent,
  normalizeCurriculumCode,
  normalizeCountryCode,
  normalizeAcademicTermCode
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
    const activeGradeReqs = httpMock.match('/api/v1/public/active-grades');
    activeGradeReqs.forEach((req) => req.flush({ success: true, data: { activeGrades: [], curriculaTracks: [] } }));
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

  describe('Half-Point Preservation & Question Image Isolation', () => {
    it('should isolate Question 8 and Question 9 images and preserve 0.5 half-point grades over stale essay_manual_score', () => {
      // Flush initial load queued by ngOnInit if unfulfilled
      httpMock.match('/api/v1/admin/submissions').forEach((r) => r.flush({ success: true, data: { submissions: [], stats: {} } }));

      component.fetchAllSubmissions(true);
      const req = httpMock.expectOne('/api/v1/admin/submissions');
      req.flush({
        success: true,
        data: {
          submissions: [
            {
              _id: 'sub_iso_1',
              result_visibility: 'PUBLISHED_TO_STUDENT_AND_PARENT',
              sync_queue_status: 'SYNCED_ONLINE',
              mcq_auto_score: 0,
              essay_manual_score: 1, // stale higher value that used to override 0.5 via Math.max
              final_total_score: 1.5,
              student_id: { _id: 'stu_1', full_name: 'Student A', student_code: 'HA1' },
              assessment_id: {
                _id: 'asm_1',
                title_ar: 'امتحان تجريبي',
                total_points: 2,
                questions: [
                  { _id: 'q8_id', question_type: 'ESSAY_PHOTO', question_text: 'Question 8', points: 1 },
                  { _id: 'q9_id', question_type: 'ESSAY_PHOTO', question_text: 'Question 9', points: 1 }
                ]
              },
              uploaded_solution_imgs: [
                { question_id: 'q8_id', image_url: 'https://cdn.example.com/q8_only.webp', rotation_deg: 0 }
              ],
              essay_answers: [
                { question_id: 'q8_id', points_earned: 0.5, decision: 'HALF' },
                { question_id: 'q9_id', points_earned: 0, decision: 'ZERO' }
              ]
            }
          ],
          stats: {}
        }
      });

      const sub = component.allSubmissions()[0];
      expect(sub).toBeTruthy();
      expect(sub.essayManualScore).toBe(0.5);
      expect(sub.finalTotalScore).toBe(0.5);

      const q8 = sub.answers[0];
      const q9 = sub.answers[1];
      expect(q8.pointsEarned).toBe(0.5);
      expect(q8.gradingDecision).toBe('HALF');
      expect(q8.studentSolutionImages?.length).toBe(1);
      expect(q8.studentSolutionImages?.[0].imageUrl).toBe('https://cdn.example.com/q8_only.webp');

      // Question 9 has NO image uploaded and must NOT inherit Question 8 image
      expect(q9.studentSolutionImages?.length).toBe(0);
    });
  });

  describe('Academic Categorization Filter Bar (Matching Curriculum Studio)', () => {
    const sampleCategorizedSubmissions: any[] = [
      {
        id: 'sub_egy_1',
        studentId: 'stu_egy_1',
        haCode: 'HA2001',
        studentName: 'يوسف أحمد',
        curriculum: 'EGYPTIAN',
        gradeLevel: 'SEC_3',
        academicTerm: 'TERM_1',
        country: 'EG',
        assessmentId: 'asm_e1',
        assessmentTitle: 'تفاضل ٣ ثانوي ترم ١',
        status: 'PENDING',
        totalPoints: 10,
        finalTotalScore: 5,
        scorePercentage: 50
      },
      {
        id: 'sub_egy_2',
        studentId: 'stu_egy_2',
        haCode: 'HA2002',
        studentName: 'مريم حسن',
        curriculum: 'المصري',
        gradeLevel: 'SEC_3',
        academicTerm: 'الترم الثاني',
        country: 'EG',
        assessmentId: 'asm_e2',
        assessmentTitle: 'جبر ٣ ثانوي ترم ٢',
        status: 'PUBLISHED',
        totalPoints: 10,
        finalTotalScore: 10,
        scorePercentage: 100
      },
      {
        id: 'sub_gulf_sa',
        studentId: 'stu_sa_1',
        haCode: 'HA2003',
        studentName: 'فهد القحطاني',
        curriculum: 'GULF',
        gradeLevel: 'GRADE_10',
        academicTerm: 'TERM_1',
        country: 'SA',
        assessmentId: 'asm_g1',
        assessmentTitle: 'رياضيات أول ثانوي السعودية',
        status: 'PENDING',
        totalPoints: 10,
        finalTotalScore: 7,
        scorePercentage: 70
      },
      {
        id: 'sub_gulf_kw',
        studentId: 'stu_kw_1',
        haCode: 'HA2004',
        studentName: 'ناصر العتيبي',
        curriculum: 'الخليجي',
        gradeLevel: 'GRADE_10',
        academicTerm: 'الترم الأول',
        country: 'الكويت',
        assessmentId: 'asm_g2',
        assessmentTitle: 'رياضيات عاشر الكويت',
        status: 'PUBLISHED',
        totalPoints: 10,
        finalTotalScore: 9,
        scorePercentage: 90
      },
      {
        id: 'sub_intl_us',
        studentId: 'stu_us_1',
        haCode: 'HA2005',
        studentName: 'Omar Tarek',
        curriculum: 'INTERNATIONAL',
        gradeLevel: 'US_GRADE_10',
        country: 'EG',
        assessmentId: 'asm_i1',
        assessmentTitle: 'Geometry Grade 10',
        status: 'PENDING',
        totalPoints: 10,
        finalTotalScore: 6,
        scorePercentage: 60
      },
      {
        id: 'sub_intl_uk',
        studentId: 'stu_uk_1',
        haCode: 'HA2006',
        studentName: 'Laila Sherif',
        curriculum: 'INTERNATIONAL',
        gradeLevel: 'IGCSE_YEAR_10',
        country: 'EG',
        assessmentId: 'asm_i2',
        assessmentTitle: 'IGCSE Year 10 Algebra',
        status: 'PUBLISHED',
        totalPoints: 10,
        finalTotalScore: 10,
        scorePercentage: 100
      },
      {
        id: 'sub_amer_sat',
        studentId: 'stu_sat_1',
        haCode: 'HA2007',
        studentName: 'Ziad Hany',
        curriculum: 'AMERICAN',
        gradeLevel: 'SAT_1',
        country: 'EG',
        assessmentId: 'asm_a1',
        assessmentTitle: 'SAT 1 Digital Mock',
        status: 'PUBLISHED',
        totalPoints: 10,
        finalTotalScore: 9,
        scorePercentage: 90
      }
    ];

    const samplePendingCanvas: any[] = [
      {
        id: 'canvas_egy_1',
        studentId: 'stu_egy_1',
        studentName: 'يوسف أحمد',
        haCode: 'HA2001',
        curriculum: 'EGYPTIAN',
        gradeLevel: 'SEC_3',
        academicTerm: 'TERM_1',
        country: 'EG',
        assessmentId: 'asm_e1',
        assessmentTitle: 'تفاضل ٣ ثانوي',
        questionNumber: 1,
        questionText: 'سؤال',
        studentAnswerImageWebp: 'https://cdn.example.com/1.webp',
        maxScore: 5,
        awardedScore: 0,
        generalTeacherNote: '',
        mistakes: [],
        status: 'PENDING',
        submittedAt: '10:00'
      },
      {
        id: 'canvas_gulf_sa',
        studentId: 'stu_sa_1',
        studentName: 'فهد القحطاني',
        haCode: 'HA2003',
        curriculum: 'GULF',
        gradeLevel: 'GRADE_10',
        academicTerm: 'TERM_1',
        country: 'SA',
        assessmentId: 'asm_g1',
        assessmentTitle: 'رياضيات السعودية',
        questionNumber: 1,
        questionText: 'سؤال',
        studentAnswerImageWebp: 'https://cdn.example.com/2.webp',
        maxScore: 5,
        awardedScore: 0,
        generalTeacherNote: '',
        mistakes: [],
        status: 'PENDING',
        submittedAt: '10:05'
      }
    ];

    it('should normalize Arabic/English curriculum, country, and term values accurately', () => {
      expect(normalizeCurriculumCode('المصري')).toBe('EGYPTIAN');
      expect(normalizeCurriculumCode('GULF')).toBe('GULF');
      expect(normalizeCurriculumCode('المناهج الدولية')).toBe('INTERNATIONAL');
      expect(normalizeCurriculumCode('الدبلومة الأمريكية')).toBe('AMERICAN');

      expect(normalizeCountryCode('السعودية')).toBe('SA');
      expect(normalizeCountryCode('UAE')).toBe('AE');
      expect(normalizeCountryCode('قطر')).toBe('QA');
      expect(normalizeCountryCode('الكويت')).toBe('KW');

      expect(normalizeAcademicTermCode('الترم الأول')).toBe('TERM_1');
      expect(normalizeAcademicTermCode('TERM_2')).toBe('TERM_2');
    });

    it('should filter by curriculum, grade level, and academic term across groups, stats, and canvas tab', () => {
      component.allSubmissions.set(sampleCategorizedSubmissions);
      component.submissionStats.set({
        totalSubmissions: 7,
        pendingReviewCount: 3,
        publishedCount: 4,
        inProgressCount: 0
      });
      fixture.componentRef.setInput('pendingSubmissions', samplePendingCanvas);
      fixture.detectChanges();

      expect(component.studentGroups().length).toBe(7);
      expect(component.filteredPendingSubmissions().length).toBe(2);

      // Select Egyptian -> SEC_3 -> TERM_1
      component.selectCurriculum('EGYPTIAN');
      expect(component.currentCurriculumHasTerms()).toBeTrue();
      expect(component.categoryFilteredSubmissions().length).toBe(2);
      expect(component.filteredPendingSubmissions().length).toBe(1);

      component.selectGrade('SEC_3');
      expect(component.categoryFilteredSubmissions().length).toBe(2);

      component.selectTerm('TERM_1');
      expect(component.categoryFilteredSubmissions().length).toBe(1);
      expect(component.studentGroups()[0].studentName).toBe('يوسف أحمد');
      expect(component.displayedStats().pendingReviewCount).toBe(1);
      expect(component.displayedStats().publishedCount).toBe(0);

      component.selectTerm('TERM_2');
      expect(component.categoryFilteredSubmissions().length).toBe(1);
      expect(component.studentGroups()[0].studentName).toBe('مريم حسن');
    });

    it('should filter Gulf by country, International by division, and American diploma, then reset cleanly', () => {
      component.allSubmissions.set(sampleCategorizedSubmissions);
      component.submissionStats.set({
        totalSubmissions: 7,
        pendingReviewCount: 3,
        publishedCount: 4,
        inProgressCount: 0
      });
      fixture.componentRef.setInput('pendingSubmissions', samplePendingCanvas);
      fixture.detectChanges();

      // Gulf -> SA vs KW
      component.selectCurriculum('GULF');
      expect(component.categoryFilteredSubmissions().length).toBe(2);

      component.selectGulfCountry('SA');
      expect(component.categoryFilteredSubmissions().length).toBe(1);
      expect(component.studentGroups()[0].haCode).toBe('HA2003');
      expect(component.filteredPendingSubmissions().length).toBe(1);

      component.selectGulfCountry('KW');
      expect(component.categoryFilteredSubmissions().length).toBe(1);
      expect(component.studentGroups()[0].haCode).toBe('HA2004');
      expect(component.filteredPendingSubmissions().length).toBe(0);

      // International -> American vs British division
      component.selectCurriculum('INTERNATIONAL');
      expect(component.currentCurriculumHasTerms()).toBeFalse();
      expect(component.categoryFilteredSubmissions().length).toBe(2);

      component.selectIntlDivision('AMERICAN_CURRICULUM');
      expect(component.categoryFilteredSubmissions().length).toBe(1);
      expect(component.categoryFilteredSubmissions()[0].gradeLevel).toBe('US_GRADE_10');

      component.selectIntlDivision('BRITISH_CURRICULUM');
      expect(component.categoryFilteredSubmissions().length).toBe(1);
      expect(component.categoryFilteredSubmissions()[0].gradeLevel).toBe('IGCSE_YEAR_10');

      // American Diploma -> SAT_1
      component.selectCurriculum('AMERICAN');
      component.selectGrade('SAT_1');
      expect(component.categoryFilteredSubmissions().length).toBe(1);
      expect(component.categoryFilteredSubmissions()[0].haCode).toBe('HA2007');

      // Reset all category filters
      component.resetCategoryFilters();
      expect(component.hasActiveCategoryFilter()).toBeFalse();
      expect(component.selectedCurriculum()).toBe('ALL');
      expect(component.selectedGrade()).toBe('ALL');
      expect(component.categoryFilteredSubmissions().length).toBe(7);
      expect(component.filteredPendingSubmissions().length).toBe(2);
    });
  });

  describe('Teacher Submission Deletion, Select All & Show Hidden Requirements', () => {
    it('should select all submissions, open 2-option modal, hide from teacher only, toggle Show Hidden, and restore or permanently delete', () => {
      // Flush initial load queued by ngOnInit
      httpMock.match('/api/v1/admin/submissions').forEach((r) => r.flush({ success: true, data: { submissions: [], stats: {} } }));

      const baseItem = {
        studentId: 'stu_vis_1',
        studentName: 'يوسف أحمد',
        haCode: 'HA2001',
        curriculum: 'EGYPTIAN',
        gradeLevel: 'SEC_3',
        academicTerm: 'TERM_1',
        country: 'EG',
        assessmentId: 'asm_vis_1',
        assessmentTitle: 'واجب التفاضل',
        assessmentType: 'HOMEWORK' as const,
        attemptNumber: 1,
        totalPoints: 10,
        mcqAutoScore: 10,
        essayManualScore: 0,
        finalTotalScore: 10,
        scorePercentage: 100,
        status: 'PENDING' as const,
        hasEssayQuestions: false,
        submittedAt: '1/1/2026',
        elapsedTimeSec: 120,
        isSuspiciousFastSolve: false,
        clockTamperDetected: false,
        answers: [],
        hiddenFromTeacher: false
      };

      component.allSubmissions.set([
        { ...baseItem, id: 'sub_vis_1', studentId: 'stu_vis_1', studentName: 'يوسف أحمد', haCode: 'HA2001', status: 'PENDING' },
        { ...baseItem, id: 'sub_vis_2', studentId: 'stu_vis_2', studentName: 'مريم حسن', haCode: 'HA2002', status: 'PUBLISHED' }
      ]);
      component.submissionStats.set({
        totalSubmissions: 2,
        pendingReviewCount: 1,
        publishedCount: 1,
        inProgressCount: 0,
        hiddenCount: 0
      });
      fixture.detectChanges();

      const hostEl = fixture.nativeElement as HTMLElement;

      // 1. Select All checkboxes
      const selectAll = hostEl.querySelector('[data-testid="grading-select-all-checkbox"]') as HTMLInputElement;
      expect(selectAll).toBeTruthy();
      selectAll.click();
      fixture.detectChanges();
      expect(component.selectedVisibleSubmissionsCount()).toBe(2);

      // 2. Click Bulk Delete -> opens 2-option modal defaulting to HIDE_FROM_TEACHER
      (hostEl.querySelector('[data-testid="grading-bulk-delete-btn"]') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(hostEl.querySelector('[data-testid="delete-submissions-modal"]')).toBeTruthy();
      (hostEl.querySelector('[data-testid="delete-mode-hide"]') as HTMLButtonElement).click();
      (hostEl.querySelector('[data-testid="confirm-delete-submissions-btn"]') as HTMLButtonElement).click();

      const hideReq = httpMock.expectOne('/api/v1/admin/submissions/bulk-delete');
      expect(hideReq.request.method).toBe('POST');
      expect(hideReq.request.body).toEqual({
        submissionIds: ['sub_vis_1', 'sub_vis_2'],
        mode: 'HIDE_FROM_TEACHER'
      });
      hideReq.flush({
        success: true,
        data: { mode: 'HIDE_FROM_TEACHER', affectedCount: 2, submissionIds: ['sub_vis_1', 'sub_vis_2'] }
      });
      fixture.detectChanges();

      expect(component.allSubmissions().length).toBe(0);
      expect(component.hiddenSubmissionsCount()).toBe(2);

      // 3. Toggle "Show Hidden" -> requests /api/v1/admin/submissions?includeHidden=true
      (hostEl.querySelector('[data-testid="toggle-hidden-submissions-btn"]') as HTMLButtonElement).click();
      const showHiddenReq = httpMock.expectOne('/api/v1/admin/submissions?includeHidden=true');
      showHiddenReq.flush({
        success: true,
        data: {
          submissions: [
            {
              _id: 'sub_vis_1',
              student_id: { _id: 'st_1', full_name: 'يوسف أحمد', student_code: 'HA2001', curriculum: 'EGYPTIAN', grade_level: 'SEC_3', academic_term: 'TERM_1' },
              assessment_id: { _id: 'asm_1', title_ar: 'واجب', curriculum: 'EGYPTIAN', grade_level: 'SEC_3', academic_term: 'TERM_1', total_points: 10, questions: [] },
              result_visibility: 'HIDDEN_PENDING_TEACHER',
              sync_queue_status: 'SYNCED_ONLINE',
              hidden_from_teacher: true,
              final_total_score: 0,
              createdAt: new Date().toISOString()
            }
          ],
          stats: { totalSubmissions: 1, pendingReviewCount: 1, publishedCount: 0, inProgressCount: 0, hiddenCount: 1 }
        }
      });
      fixture.detectChanges();

      expect(component.allSubmissions()[0].hiddenFromTeacher).toBeTrue();
      // Switch to feed view to inspect row actions directly
      component.viewGroupingMode.set('BY_SUBMISSION');
      fixture.detectChanges();
      expect(hostEl.querySelector('[data-testid="hidden-submission-badge"]')).toBeTruthy();

      // 4. Restore hidden submission
      (hostEl.querySelector('[data-testid="grading-restore-submission-btn"]') as HTMLButtonElement).click();
      const restoreReq = httpMock.expectOne('/api/v1/admin/submissions/restore-hidden');
      expect(restoreReq.request.method).toBe('POST');
      expect(restoreReq.request.body).toEqual({ submissionIds: ['sub_vis_1'] });
      restoreReq.flush({ success: true, data: { restoredCount: 1, submissionIds: ['sub_vis_1'] } });
      fixture.detectChanges();
      expect(component.allSubmissions()[0].hiddenFromTeacher).toBeFalse();

      // 5. Permanent delete single submission
      (hostEl.querySelector('[data-testid="grading-delete-submission-btn"]') as HTMLButtonElement).click();
      fixture.detectChanges();
      (hostEl.querySelector('[data-testid="delete-mode-permanent"]') as HTMLButtonElement).click();
      (hostEl.querySelector('[data-testid="confirm-delete-submissions-btn"]') as HTMLButtonElement).click();

      const permReq = httpMock.expectOne('/api/v1/admin/submissions/bulk-delete');
      expect(permReq.request.body).toEqual({
        submissionIds: ['sub_vis_1'],
        mode: 'PERMANENT_DELETE'
      });
      permReq.flush({
        success: true,
        data: { mode: 'PERMANENT_DELETE', affectedCount: 1, submissionIds: ['sub_vis_1'] }
      });
      fixture.detectChanges();
      expect(component.allSubmissions().length).toBe(0);
    });
  });
});
