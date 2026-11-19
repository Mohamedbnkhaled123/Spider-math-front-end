import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { StudentOverviewComponent } from './student-overview.component';
import { AuthService } from '../../../core/auth/auth.service';

describe('StudentOverviewComponent', () => {
  let component: StudentOverviewComponent;
  let fixture: ComponentFixture<StudentOverviewComponent>;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [StudentOverviewComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(StudentOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle academic terms correctly', () => {
    expect(component.selectedTerm()).toBe('TERM_1');
    component.setTerm('TERM_2');
    expect(component.selectedTerm()).toBe('TERM_2');
  });

  it('should compute overall watch percentage', () => {
    const pct = component.overallWatchPercentage();
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(100);
  });

  it('should toggle notifications dropdown', () => {
    expect(component.isNotificationsOpen()).toBeFalse();
    component.toggleNotifications();
    expect(component.isNotificationsOpen()).toBeTrue();
  });

  it('should open profile modal and select new avatar', () => {
    authService.setSession('test_token', {
      _id: 'std_123',
      full_name: 'Mohammed Khaled',
      email: 'mohammed@spidermath.edu',
      role: 'STUDENT',
      avatar_url: '/assets/avatars/student-avatar-01.webp'
    });

    component.openProfileModal();
    expect(component.isProfileModalOpen()).toBeTrue();
    expect(component.editFullName()).toBe('Mohammed Khaled');
    expect(component.editAvatarUrl()).toBe('/assets/avatars/student-avatar-01.webp');

    // Select a different preset avatar
    component.selectAvatar('/assets/avatars/student-avatar-07.webp');
    expect(component.editAvatarUrl()).toBe('/assets/avatars/student-avatar-07.webp');
    expect(component.isCustomUploadedAvatar()).toBeFalse();

    component.closeProfileModal();
    expect(component.isProfileModalOpen()).toBeFalse();
  });

  it('should send both avatarUrl and avatar_url on saveProfile and update auth session', () => {
    authService.setSession('test_token', {
      _id: 'std_456',
      full_name: 'Sara Omar',
      email: 'sara@spidermath.edu',
      role: 'STUDENT',
      avatar_url: '/assets/avatars/student-avatar-02.webp'
    });

    component.openProfileModal();
    component.selectAvatar('/assets/avatars/student-avatar-11.webp');

    component.saveProfile();
    expect(component.isSavingProfile()).toBeTrue();

    const req = httpMock.expectOne('/api/v1/auth/profile');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.avatarUrl).toBe('/assets/avatars/student-avatar-11.webp');
    expect(req.request.body.avatar_url).toBe('/assets/avatars/student-avatar-11.webp');

    req.flush({
      success: true,
      data: {
        user: {
          fullName: 'Sara Omar',
          avatarUrl: '/assets/avatars/student-avatar-11.webp',
          avatar_url: '/assets/avatars/student-avatar-11.webp'
        }
      }
    });

    expect(component.isSavingProfile()).toBeFalse();
    expect(authService.currentUser()?.avatar_url).toBe('/assets/avatars/student-avatar-11.webp');
    expect(authService.currentUser()?.avatarUrl).toBe('/assets/avatars/student-avatar-11.webp');
  });

  it('should render modal with pinned header, scrollable body, and pinned footer when open', () => {
    component.openProfileModal();
    fixture.detectChanges();

    const modalEl: HTMLElement = fixture.nativeElement;
    // Check backdrop has overflow-y-auto
    const backdrop = modalEl.querySelector('[role="dialog"]') as HTMLElement;
    expect(backdrop).toBeTruthy();
    expect(backdrop.classList.contains('overflow-y-auto')).toBeTrue();

    // Check card has flex-col, overflow-hidden and max-h limit
    const card = backdrop.querySelector('.spider-rim-glass-card') as HTMLElement;
    expect(card).toBeTruthy();
    expect(card.classList.contains('flex-col')).toBeTrue();
    expect(card.classList.contains('overflow-hidden')).toBeTrue();

    // Check scrollable body has overflow-y-auto and overscroll-contain
    const scrollableBody = card.querySelector('.overflow-y-auto.overscroll-contain') as HTMLElement;
    expect(scrollableBody).toBeTruthy();
    expect(scrollableBody.classList.contains('flex-1')).toBeTrue();

    // Check pinned footer with action buttons
    const footer = card.querySelector('.shrink-0.border-t') as HTMLElement;
    expect(footer).toBeTruthy();
  });

  it('should format student track badge accurately including legacy AMERICAN US_GRADE_1 records', () => {
    authService.setSession('test_token', {
      _id: 'std_heba_c',
      full_name: 'Heba c',
      email: 'heba@spidermath.edu',
      role: 'STUDENT',
      curriculum: 'AMERICAN',
      grade_level: 'US_GRADE_1'
    });

    component.langService.setLanguage('en');
    const enLabel = component.getStudentTrackBadgeLabel();
    expect(enLabel).toContain('International Curriculum');
    expect(enLabel).toContain('Gr 1');

    component.langService.setLanguage('ar');
    const arLabel = component.getStudentTrackBadgeLabel();
    expect(arLabel).toContain('المناهج الدولية');
  });

  it('should show subscribed active units even when grade has unsubscribed units', () => {
    authService.setSession('test_token', {
      _id: 'std_heba_c2',
      full_name: 'Heba c',
      email: 'heba2@spidermath.edu',
      role: 'STUDENT',
      curriculum: 'AMERICAN',
      grade_level: 'US_GRADE_1'
    });

    component.fetchRealStudentData();
    const reqs = httpMock.match((r) => r.url.startsWith('/api/v1/units'));
    expect(reqs.length).toBeGreaterThan(0);

    reqs[0].flush({
      success: true,
      data: [
        {
          _id: 'unit_numbers',
          title_ar: 'Numbers',
          title_en: 'Numbers',
          curriculum: 'INTERNATIONAL',
          grade_level: 'US_GRADE_1',
          academic_term: 'TERM_1',
          lectures_count: 2,
          quizzes_count: 1,
          isSubscribed: true
        },
        {
          _id: 'unit_locked',
          title_ar: 'Algebra',
          title_en: 'Algebra',
          curriculum: 'INTERNATIONAL',
          grade_level: 'US_GRADE_1',
          academic_term: 'TERM_1',
          lectures_count: 1,
          quizzes_count: 0,
          isSubscribed: false
        }
      ]
    });

    expect(component.units().length).toBe(1);
    expect(component.units()[0]._id).toBe('unit_numbers');

    const contentsReqs = httpMock.match('/api/v1/units/unit_numbers/curriculum-contents');
    expect(contentsReqs.length).toBe(1);
    contentsReqs[0].flush({
      success: true,
      data: {
        isSubscribed: true,
        isExpired: false,
        lectures: [
          { _id: 'lec_1', title_ar: 'Counting 1-10', order_index: 1, video_duration_sec: 300, youtube_video_id: 'abc' }
        ]
      }
    });

    expect(component.lectures().length).toBe(1);
    expect(component.lectures()[0].titleAr).toBe('Counting 1-10');
  });

  it('should render zero Arabic characters or Arabic-Indic digits in English mode even with Arabic-only fallback data', () => {
    authService.setSession('test_token', {
      _id: 'std_en_1',
      full_name: 'Omar Ali',
      email: 'omar@spidermath.edu',
      role: 'STUDENT',
      curriculum: 'EGYPTIAN',
      grade_level: 'SEC_3',
      student_ha_code: 'HA4920',
      total_xp: 250
    });
    component.langService.setLanguage('en');

    component.completedGrades.set([
      {
        id: 'sub_1',
        submissionId: 'sub_1',
        assessmentId: 'asm_1',
        titleAr: 'رياضه',
        titleEn: '',
        unitTitleAr: 'رياضه',
        unitTitleEn: '',
        score: null,
        maxScore: 5,
        percentage: null,
        gradeLabelAr: 'في انتظار التصحيح اليدوي',
        gradeLabelEn: 'Pending Manual Review',
        status: 'PENDING_REVIEW',
        isPending: true,
        gradedBy: 'في انتظار التصحيح اليدوي',
        gradedByAr: 'في انتظار التصحيح اليدوي',
        gradedByEn: 'Pending Manual Review',
        gradedDateAr: '١٧ نوفمبر ٢٠٢٦',
        gradedDateEn: 'Nov 17, 2026',
        gradedAtIso: '2026-11-17T10:00:00.000Z',
        feedbackUrl: '/student/submissions/sub_1/feedback'
      }
    ]);

    component.dueQuizzes.set([
      {
        id: 'asm_1',
        titleAr: 'رياضه',
        titleEn: '',
        unitTitleAr: 'رياضه',
        unitTitleEn: 'Course Unit',
        categoryType: 'GENERAL_QUIZ',
        categoryLabelAr: 'كويز عام',
        categoryLabelEn: 'General Quiz',
        questionsCount: 1,
        totalPoints: 5,
        xpReward: 50,
        dueDateAr: 'تم التسليم بنجاح',
        dueDateEn: 'Submitted Successfully',
        canStart: false,
        isCompleted: true,
        isPending: true,
        statusNote: 'تم التسليم — في انتظار التصحيح اليدوي',
        statusNoteEn: 'Submitted — Pending manual grading',
        assessmentUrl: '/student/assessments/asm_1',
        feedbackUrl: '/student/submissions/sub_1/feedback'
      }
    ]);

    component.leaderboard.set([
      { rank: 1, studentId: 'std_en_1', studentName: 'Omar Ali (أنت)', haCode: 'HA4920', totalXp: 250, isCurrentUser: true }
    ]);

    fixture.detectChanges();
    const containerText = (fixture.nativeElement.querySelector('.student-overview-container')?.textContent || '') as string;

    expect(/[\u0600-\u06FF\u0660-\u0669]/.test(containerText)).toBeFalse();
    expect(containerText).toContain('Pending Manual Review');
    expect(containerText).toContain('Submitted Successfully');
    expect(containerText).toContain('Omar Ali (You)');
  });

  it('should render zero leaked English labels (XP, Lv., Mastery, 1st/2nd/3rd) in Arabic mode', () => {
    authService.setSession('test_token', {
      _id: 'std_ar_1',
      full_name: 'طالب متفوق',
      email: 'student@spidermath.edu',
      role: 'STUDENT',
      curriculum: 'EGYPTIAN',
      grade_level: 'SEC_3',
      student_ha_code: 'HA4920',
      total_xp: 250
    });
    component.langService.setLanguage('ar');

    component.completedGrades.set([
      {
        id: 'sub_2',
        submissionId: 'sub_2',
        assessmentId: 'asm_2',
        titleAr: 'اختبار الجبر',
        titleEn: 'Algebra Quiz',
        unitTitleAr: 'الوحدة الأولى',
        unitTitleEn: 'Unit 1',
        score: 9,
        maxScore: 10,
        percentage: 90,
        gradeLabelAr: 'ممتاز (Mastery)',
        gradeLabelEn: 'Excellent',
        status: 'PUBLISHED',
        isPending: false,
        gradedBy: 'م/ هبة عبدالوهاب',
        gradedDateAr: '١٨ نوفمبر ٢٠٢٦',
        feedbackUrl: '/student/submissions/sub_2/feedback'
      }
    ]);

    component.leaderboard.set([
      { rank: 1, studentId: 'std_ar_1', studentName: 'طالب متفوق', haCode: 'HA4920', totalXp: 250, isCurrentUser: true },
      { rank: 2, studentId: 'std_ar_2', studentName: 'أحمد علي', haCode: 'HA4921', totalXp: 200, isCurrentUser: false },
      { rank: 3, studentId: 'std_ar_3', studentName: 'سارة حسن', haCode: 'HA4922', totalXp: 150, isCurrentUser: false }
    ]);

    fixture.detectChanges();
    const containerText = (fixture.nativeElement.querySelector('.student-overview-container')?.textContent || '') as string;
    const withoutAllowedCode = containerText.replace(/HA4920|HA4921|HA4922/g, '');

    expect(/[A-Za-z]/.test(withoutAllowedCode)).toBeFalse();
    expect(containerText).toContain('HA4920');
    expect(containerText).toContain('المستوى');
    expect(containerText).toContain('نقطة');
  });
});
