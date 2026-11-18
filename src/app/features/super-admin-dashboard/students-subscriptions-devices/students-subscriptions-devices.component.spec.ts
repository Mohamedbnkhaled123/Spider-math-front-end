import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { StudentsSubscriptionsDevicesComponent } from './students-subscriptions-devices.component';

describe('StudentsSubscriptionsDevicesComponent', () => {
  let component: StudentsSubscriptionsDevicesComponent;
  let fixture: ComponentFixture<StudentsSubscriptionsDevicesComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentsSubscriptionsDevicesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(StudentsSubscriptionsDevicesComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('studentsList', []);
    fixture.componentRef.setInput('pendingDevices', []);
    fixture.detectChanges();

    // Flush initial /api/v1/admin/units call if made
    const req = httpTesting.match('/api/v1/admin/units');
    if (req.length > 0) {
      req[0].flush({
        success: true,
        data: [
          { id: 'u_sec1_1', titleAr: 'الهندسة والتشابه', curriculum: 'EGYPTIAN', gradeLevel: 'SEC_1', priceEgp: 200 },
          { id: 'u_sec1_2', titleAr: 'حساب المثلثات', curriculum: 'EGYPTIAN', gradeLevel: 'SEC_1', priceEgp: 180 },
          { id: 'u_sec3_1', titleAr: 'التفاضل والتكامل', curriculum: 'EGYPTIAN', gradeLevel: 'SEC_3', priceEgp: 300 }
        ]
      });
    }
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create students subscriptions devices component', () => {
    expect(component).toBeTruthy();
  });

  it('should filter students list by search query', () => {
    fixture.componentRef.setInput('studentsList', [
      {
        id: '1',
        name: 'Mohammed Khaled',
        haCode: 'HA1001',
        email: 'mohammed@test.com',
        curriculum: 'EGYPTIAN',
        gradeLevel: 'SEC_1',
        hasActiveSubscription: true,
        subscriptionStatus: 'ACTIVE',
        totalXp: 100,
        approvedDevices: 1,
        isLocked: false,
        isLeaderboardHidden: false
      },
      {
        id: '2',
        name: 'Sara Omar',
        haCode: 'HA2002',
        email: 'sara@test.com',
        curriculum: 'GULF',
        gradeLevel: 'GRADE_12',
        hasActiveSubscription: false,
        subscriptionStatus: 'CANCELLED',
        totalXp: 50,
        approvedDevices: 1,
        isLocked: false,
        isLeaderboardHidden: false
      }
    ]);
    fixture.detectChanges();

    component.searchQuery.set('HA1001');
    expect(component.filteredStudents().length).toBe(1);
    expect(component.filteredStudents()[0].name).toBe('Mohammed Khaled');
  });

  it('should accurately match units for Mohammed Khaled (EGYPTIAN - SEC_1)', () => {
    component.realUnits.set([
      { id: 'u_sec1_1', titleAr: 'الهندسة والتشابه', curriculum: 'EGYPTIAN', gradeLevel: 'SEC_1', priceEgp: 200 },
      { id: 'u_sec1_2', titleAr: 'حساب المثلثات', curriculum: 'EGYPTIAN', gradeLevel: 'SEC_1', priceEgp: 180 },
      { id: 'u_sec3_1', titleAr: 'التفاضل والتكامل', curriculum: 'EGYPTIAN', gradeLevel: 'SEC_3', priceEgp: 300 }
    ]);

    const mohammedKhaled = {
      id: 'student_mk_1',
      name: 'Mohammed Khaled',
      haCode: 'HA1001',
      email: 'mk@test.com',
      curriculum: 'EGYPTIAN',
      gradeLevel: 'SEC_1',
      hasActiveSubscription: false,
      subscriptionStatus: 'CANCELLED' as const,
      totalXp: 50,
      approvedDevices: 1,
      isLocked: false,
      isLeaderboardHidden: false
    };

    component.studentToActivate.set(mohammedKhaled);
    fixture.detectChanges();

    const matching = component.studentMatchingUnits();
    expect(matching.length).toBe(2);
    expect(matching[0].id).toBe('u_sec1_1');
    expect(matching[1].id).toBe('u_sec1_2');
  });

  it('should strictly filter units to student curriculum and grade without collisions or cross-track units', () => {
    component.realUnits.set([
      { id: 'u_us1_intl', titleAr: 'Numbers', curriculum: 'INTERNATIONAL', gradeLevel: 'US_GRADE_1' },
      { id: 'u_us12_intl', titleAr: 'AP Prep', curriculum: 'INTERNATIONAL', gradeLevel: 'US_GRADE_12' },
      { id: 'u_gulf12', titleAr: 'free test', curriculum: 'GULF', gradeLevel: 'GRADE_12' },
      { id: 'u_sec1_1', titleAr: 'الهندسة', curriculum: 'EGYPTIAN', gradeLevel: 'SEC_1' },
      { id: 'u_sat', titleAr: 'November2026', curriculum: 'AMERICAN', gradeLevel: 'SAT_MATH' }
    ]);

    component.studentToActivate.set({
      id: 'student_heba',
      name: 'Heba c',
      haCode: 'HA1004',
      email: 'heba@test.com',
      curriculum: 'AMERICAN',
      gradeLevel: 'US_GRADE_1',
      hasActiveSubscription: false,
      subscriptionStatus: 'CANCELLED',
      totalXp: 0,
      approvedDevices: 1,
      isLocked: false,
      isLeaderboardHidden: false
    });
    expect(component.studentMatchingUnits().map(u => u.id)).toEqual(['u_us1_intl']);

    component.studentToActivate.set({
      id: 'student_gulf12',
      name: 'Sara Gulf',
      haCode: 'HA2002',
      email: 'sara@test.com',
      curriculum: 'GULF',
      gradeLevel: 'GRADE_12',
      hasActiveSubscription: false,
      subscriptionStatus: 'CANCELLED',
      totalXp: 0,
      approvedDevices: 1,
      isLocked: false,
      isLeaderboardHidden: false
    });
    expect(component.studentMatchingUnits().map(u => u.id)).toEqual(['u_gulf12']);

    // Newly added unit via availableUnits input appears immediately even if realUnits has older snapshot
    fixture.componentRef.setInput('availableUnits', [
      { id: 'u_gulf12_new', titleAr: 'New Gulf Unit', curriculum: 'GULF', gradeLevel: 'GRADE_12' }
    ]);
    fixture.detectChanges();
    expect(component.studentMatchingUnits().map(u => u.id)).toEqual(['u_gulf12', 'u_gulf12_new']);
  });

  it('should revoke a student unit subscription and update state', () => {
    const student = {
      id: 'student_1',
      name: 'Mohammed Khaled',
      haCode: 'HA1001',
      email: 'mk@test.com',
      curriculum: 'EGYPTIAN',
      gradeLevel: 'SEC_1',
      hasActiveSubscription: true,
      subscriptionStatus: 'ACTIVE' as const,
      totalXp: 100,
      approvedDevices: 1,
      isLocked: false,
      isLeaderboardHidden: false
    };

    component.studentForSubscriptions.set(student);
    component.studentActiveSubscriptions.set([
      {
        _id: 'sub_123',
        id: 'sub_123',
        unitPackageId: 'unit_geom_1',
        unitTitleAr: 'الهندسة والتشابه',
        curriculum: 'EGYPTIAN',
        gradeLevel: 'SEC_1',
        subscriptionStatus: 'ACTIVE'
      }
    ]);

    let emittedStudent: any = null;
    component.studentUpdated.subscribe(s => emittedStudent = s);

    component.revokeStudentSubscription({ _id: 'sub_123', unitTitleAr: 'الهندسة والتشابه' });

    const req = httpTesting.expectOne('/api/v1/admin/subscriptions/revoke');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.subscription_id).toBe('sub_123');

    req.flush({
      success: true,
      remainingActiveCount: 0,
      hasActiveSubscription: false
    });

    expect(component.studentActiveSubscriptions()[0].subscriptionStatus).toBe('CANCELLED');
    expect(emittedStudent).toBeTruthy();
    expect(emittedStudent.hasActiveSubscription).toBe(false);
    expect(emittedStudent.subscriptionStatus).toBe('CANCELLED');
  });

  it('should open unified modal and activate a new unit for student', () => {
    const student = {
      id: 'student_1',
      name: 'Mohammed Khaled',
      haCode: 'HA1001',
      email: 'mk@test.com',
      curriculum: 'EGYPTIAN',
      gradeLevel: 'SEC_1',
      hasActiveSubscription: false,
      subscriptionStatus: 'CANCELLED' as const,
      totalXp: 50,
      approvedDevices: 1,
      isLocked: false,
      isLeaderboardHidden: false
    };

    component.openSubscriptionsModal(student);
    expect(component.isSubscriptionsModalOpen()).toBe(true);
    expect(component.isActivateModalOpen()).toBe(true);
    expect(component.studentForSubscriptions()).toEqual(student);
    expect(component.studentToActivate()).toEqual(student);

    // Flush loadStudentSubscriptions
    const subReq = httpTesting.expectOne('/api/v1/admin/subscriptions/student/student_1');
    subReq.flush({ success: true, data: [] });

    // Activate a unit
    component.activationUnitId.set('u_sec1_1');
    component.activationScope.set('FULL');

    let emittedStudent: any = null;
    component.studentUpdated.subscribe(s => emittedStudent = s);

    component.confirmUnitActivation();

    const actReq = httpTesting.expectOne('/api/v1/admin/subscriptions/activate');
    expect(actReq.request.body).toEqual({
      student_id: 'student_1',
      unit_id: 'u_sec1_1',
      access_scope: 'FULL'
    });
    actReq.flush({ success: true });

    // Expect subscription reload
    const reloadReq = httpTesting.expectOne('/api/v1/admin/subscriptions/student/student_1');
    reloadReq.flush({ success: true, data: [{ id: 'sub_new', unitTitleAr: 'الهندسة والتشابه', subscriptionStatus: 'ACTIVE' }] });

    expect(emittedStudent).toBeTruthy();
    expect(emittedStudent.hasActiveSubscription).toBe(true);
    expect(emittedStudent.subscriptionStatus).toBe('ACTIVE');

    component.closeUnitsModal();
    expect(component.isSubscriptionsModalOpen()).toBe(false);
    expect(component.isActivateModalOpen()).toBe(false);
    expect(component.studentForSubscriptions()).toBeNull();
    expect(component.studentToActivate()).toBeNull();
    expect(component.studentActiveSubscriptions()).toEqual([]);
    expect(component.activationUnitId()).toBe('');
  });

  it('should correctly handle and allow revoking a FROZEN subscription', () => {
    const student = {
      id: 'student_f1',
      name: 'Ahmed Frozen',
      haCode: 'HA3003',
      email: 'ahmed@test.com',
      curriculum: 'EGYPTIAN',
      gradeLevel: 'SEC_1',
      hasActiveSubscription: true,
      subscriptionStatus: 'FROZEN' as const,
      totalXp: 80,
      approvedDevices: 1,
      isLocked: false,
      isLeaderboardHidden: false
    };

    component.openSubscriptionsModal(student);
    const subReq = httpTesting.expectOne('/api/v1/admin/subscriptions/student/student_f1');
    subReq.flush({
      success: true,
      data: [
        {
          _id: 'sub_frozen_1',
          id: 'sub_frozen_1',
          unitPackageId: 'u_sec1_1',
          unitTitleAr: 'الهندسة والتشابه',
          curriculum: 'EGYPTIAN',
          gradeLevel: 'SEC_1',
          subscriptionStatus: 'FROZEN',
          isExpired: false
        }
      ]
    });
    fixture.detectChanges();

    expect(component.activeSubscriptionsCount()).toBe(1);
    expect(component.isUnitActiveForStudent('u_sec1_1')).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;
    const badge = compiled.querySelector('.z-layer-modal .text-amber-500');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain('مجمّد');

    // Revoke the frozen subscription
    component.revokeStudentSubscription(component.studentActiveSubscriptions()[0]);
    const revokeReq = httpTesting.expectOne('/api/v1/admin/subscriptions/revoke');
    expect(revokeReq.request.body.subscription_id).toBe('sub_frozen_1');
    revokeReq.flush({
      success: true,
      remainingActiveCount: 0,
      hasActiveSubscription: false
    });

    expect(component.studentActiveSubscriptions()[0].subscriptionStatus).toBe('CANCELLED');
    expect(component.activeSubscriptionsCount()).toBe(0);
    expect(component.isUnitActiveForStudent('u_sec1_1')).toBe(false);
  });

  it('should prioritize selecting an unenrolled matching unit in syncSelectedActivationUnit', () => {
    component.realUnits.set([
      { id: 'u_sec1_1', titleAr: 'الهندسة والتشابه', curriculum: 'EGYPTIAN', gradeLevel: 'SEC_1', priceEgp: 200 },
      { id: 'u_sec1_2', titleAr: 'حساب المثلثات', curriculum: 'EGYPTIAN', gradeLevel: 'SEC_1', priceEgp: 180 }
    ]);

    const student = {
      id: 'student_p1',
      name: 'Tamer Test',
      haCode: 'HA4004',
      email: 'tamer@test.com',
      curriculum: 'EGYPTIAN',
      gradeLevel: 'SEC_1',
      hasActiveSubscription: true,
      subscriptionStatus: 'ACTIVE' as const,
      totalXp: 120,
      approvedDevices: 1,
      isLocked: false,
      isLeaderboardHidden: false
    };

    component.studentForSubscriptions.set(student);
    component.studentToActivate.set(student);
    // Student already actively enrolled in u_sec1_1
    component.studentActiveSubscriptions.set([
      {
        id: 'sub_1',
        unitPackageId: 'u_sec1_1',
        unitTitleAr: 'الهندسة والتشابه',
        subscriptionStatus: 'ACTIVE',
        isExpired: false
      }
    ]);

    component.activationUnitId.set('');
    component.syncSelectedActivationUnit();

    // Should smartly auto-select u_sec1_2 because u_sec1_1 is already active
    expect(component.activationUnitId()).toBe('u_sec1_2');
  });

  it('should close modal when backdrop is clicked', () => {
    const student = {
      id: 'student_bd',
      name: 'Backdrop Student',
      haCode: 'HA5005',
      email: 'bd@test.com',
      curriculum: 'EGYPTIAN',
      gradeLevel: 'SEC_1',
      hasActiveSubscription: false,
      subscriptionStatus: 'CANCELLED' as const,
      totalXp: 10,
      approvedDevices: 1,
      isLocked: false,
      isLeaderboardHidden: false
    };

    component.openSubscriptionsModal(student);
    const subReq = httpTesting.expectOne('/api/v1/admin/subscriptions/student/student_bd');
    subReq.flush({ success: true, data: [] });
    fixture.detectChanges();

    expect(component.isSubscriptionsModalOpen()).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;
    const backdrop = compiled.querySelector('.fixed.inset-0.z-layer-modal') as HTMLElement;
    expect(backdrop).toBeTruthy();
    backdrop.click();
    fixture.detectChanges();

    expect(component.isSubscriptionsModalOpen()).toBe(false);
  });

  it('should not display unit, XP, or freeze buttons for parent accounts in the template', () => {
    fixture.componentRef.setInput('studentsList', [
      {
        id: 'parent_1',
        name: 'Parent User',
        haCode: 'HA9999',
        email: 'parent@test.com',
        role: 'PARENT',
        curriculum: 'EGYPTIAN',
        gradeLevel: 'SEC_1',
        hasActiveSubscription: false,
        subscriptionStatus: 'CANCELLED',
        totalXp: 0,
        approvedDevices: 1,
        isLocked: false,
        isLeaderboardHidden: false
      }
    ]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const actionCell = compiled.querySelector('tbody tr td.text-center');
    expect(actionCell?.textContent).toContain('حساب ولي أمر');
    expect(actionCell?.querySelector('button')).toBeNull();
  });

  describe('Academic Promotion & Graduation Requirements', () => {
    const buildStudent = (overrides: Partial<any>) => ({
      id: 'st_default',
      name: 'طالب افتراضي',
      haCode: 'HA1000',
      email: 'student@test.com',
      role: 'STUDENT' as const,
      curriculum: 'EGYPTIAN',
      gradeLevel: 'PRI_5',
      academicTerm: 'TERM_1' as const,
      hasActiveSubscription: true,
      subscriptionStatus: 'ACTIVE' as const,
      totalXp: 100,
      approvedDevices: 1,
      isLocked: false,
      isLeaderboardHidden: false,
      isProfileCompleted: true,
      isArchived: false,
      ...overrides
    });

    it('UI REQ-1 & REQ-2: teacher switches between Term and Grade modes, uses Select All, excludes a failed/cancelled student, and sends excludedStudentIds', () => {
      const sPri5 = buildStudent({ id: 's_pri5', name: 'أحمد ناجح', haCode: 'HA101', curriculum: 'EGYPTIAN', gradeLevel: 'PRI_5', academicTerm: 'TERM_1' });
      const sCancelled = buildStudent({ id: 's_cancel', name: 'كريم راسب', haCode: 'HA102', curriculum: 'EGYPTIAN', gradeLevel: 'PRI_5', academicTerm: 'TERM_1', hasActiveSubscription: false, subscriptionStatus: 'CANCELLED' });

      fixture.componentRef.setInput('studentsList', [sPri5, sCancelled]);
      fixture.detectChanges();

      const hostEl = fixture.nativeElement as HTMLElement;
      const openBtn = hostEl.querySelector('[data-testid="open-promotion-modal-btn"]') as HTMLButtonElement;
      expect(openBtn).toBeTruthy();
      openBtn.click();
      fixture.detectChanges();

      expect(hostEl.querySelector('[data-testid="academic-promotion-modal"]')).toBeTruthy();

      // Teacher switches to Term promotion mode first
      (hostEl.querySelector('[data-testid="promo-mode-term"]') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(component.promotionMode()).toBe('TERM');

      // Switch to Grade promotion mode
      (hostEl.querySelector('[data-testid="promo-mode-grade"]') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(component.promotionMode()).toBe('GRADE');

      // Click Select All
      const selectAllBox = hostEl.querySelector('[data-testid="promo-select-all-checkbox"]') as HTMLInputElement;
      selectAllBox.click();
      fixture.detectChanges();
      expect(component.promotionSelectedIds().has('s_pri5')).toBeTrue();
      expect(component.promotionSelectedIds().has('s_cancel')).toBeTrue();

      // Exclude cancelled/failed student by unchecking their row checkbox
      const cancelRow = hostEl.querySelector('[data-testid="promo-student-row"][data-student-id="s_cancel"]') as HTMLElement;
      const cancelCheckbox = cancelRow.querySelector('[data-testid="promo-student-checkbox"]') as HTMLInputElement;
      cancelCheckbox.click();
      fixture.detectChanges();

      expect(component.promotionSelectedIds().has('s_pri5')).toBeTrue();
      expect(component.promotionSelectedIds().has('s_cancel')).toBeFalse();
      expect(component.promotionExcludedIds().has('s_cancel')).toBeTrue();

      const updatedEvents: any[] = [];
      component.studentUpdated.subscribe((u) => updatedEvents.push(u));

      // Execute promotion
      (hostEl.querySelector('[data-testid="promo-continue-btn"]') as HTMLButtonElement).click();
      fixture.detectChanges();

      const req = httpTesting.expectOne('/api/v1/admin/users/students/promote');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        mode: 'GRADE',
        studentIds: ['s_pri5'],
        excludedStudentIds: ['s_cancel'],
        graduationDecisions: {}
      });

      req.flush({
        success: true,
        data: {
          mode: 'GRADE',
          promotedCount: 1,
          archivedCount: 0,
          deletedCount: 0,
          skippedCount: 0,
          excludedCount: 1,
          promoted: [{ studentId: 's_pri5', fullName: 'أحمد ناجح', fromGrade: 'PRI_5', toGrade: 'PRI_6', fromTerm: 'TERM_1', toTerm: 'TERM_1', status: 'PROMOTED' }],
          archived: [],
          deleted: [],
          skipped: []
        }
      });

      expect(updatedEvents.length).toBe(1);
      expect(updatedEvents[0].id).toBe('s_pri5');
      expect(updatedEvents[0].gradeLevel).toBe('PRI_6');
    });

    it('UI REQ-3: disables SAT / International term-less and already-Term-2 students in Term mode and excludes them from Select All', () => {
      const sEgT1 = buildStudent({ id: 's_eg_t1', name: 'سارة ترم 1', haCode: 'HA201', curriculum: 'EGYPTIAN', gradeLevel: 'PREP_2', academicTerm: 'TERM_1' });
      const sEgT2 = buildStudent({ id: 's_eg_t2', name: 'ندى ترم 2', haCode: 'HA202', curriculum: 'EGYPTIAN', gradeLevel: 'PREP_2', academicTerm: 'TERM_2' });
      const sSat = buildStudent({ id: 's_sat', name: 'طارق SAT', haCode: 'HA203', curriculum: 'AMERICAN', gradeLevel: 'SAT_MATH', academicTerm: null });
      const sIntl = buildStudent({ id: 's_us10', name: 'لوجي US', haCode: 'HA204', curriculum: 'INTERNATIONAL', gradeLevel: 'US_GRADE_10', academicTerm: null });

      fixture.componentRef.setInput('studentsList', [sEgT1, sEgT2, sSat, sIntl]);
      fixture.detectChanges();

      component.openPromotionModal('TERM');
      fixture.detectChanges();

      const hostEl = fixture.nativeElement as HTMLElement;
      const satCheckbox = hostEl.querySelector('[data-student-id="s_sat"] [data-testid="promo-student-checkbox"]') as HTMLInputElement;
      const intlCheckbox = hostEl.querySelector('[data-student-id="s_us10"] [data-testid="promo-student-checkbox"]') as HTMLInputElement;
      const t2Checkbox = hostEl.querySelector('[data-student-id="s_eg_t2"] [data-testid="promo-student-checkbox"]') as HTMLInputElement;
      const t1Checkbox = hostEl.querySelector('[data-student-id="s_eg_t1"] [data-testid="promo-student-checkbox"]') as HTMLInputElement;

      expect(satCheckbox.disabled).toBeTrue();
      expect(intlCheckbox.disabled).toBeTrue();
      expect(t2Checkbox.disabled).toBeTrue();
      expect(t1Checkbox.disabled).toBeFalse();

      // Click Select All in TERM mode -> ONLY s_eg_t1 is selected
      (hostEl.querySelector('[data-testid="promo-select-all-checkbox"]') as HTMLInputElement).click();
      fixture.detectChanges();
      expect(Array.from(component.promotionSelectedIds())).toEqual(['s_eg_t1']);

      // Switching to GRADE mode unlocks SAT (as graduating) and US_GRADE_10 and TERM_2
      (hostEl.querySelector('[data-testid="promo-mode-grade"]') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect((hostEl.querySelector('[data-student-id="s_sat"] [data-testid="promo-student-checkbox"]') as HTMLInputElement).disabled).toBeFalse();
      expect((hostEl.querySelector('[data-student-id="s_us10"] [data-testid="promo-student-checkbox"]') as HTMLInputElement).disabled).toBeFalse();
      expect(hostEl.querySelector('[data-student-id="s_sat"]')?.textContent).toContain('تخرج');
    });

    it('UI REQ-4: prompts teacher with "تم تخرج هذا الطالب" (Archive vs Permanent Delete) for final-grade students and submits explicit decisions', () => {
      const sSec3 = buildStudent({ id: 's_sec3', name: 'ياسمين 3 ثانوي', haCode: 'HA301', curriculum: 'EGYPTIAN', gradeLevel: 'SEC_3', academicTerm: 'TERM_2' });
      const sGulf12 = buildStudent({ id: 's_gulf12', name: 'فيصل الصف 12', haCode: 'HA302', curriculum: 'GULF', gradeLevel: 'GRADE_12', academicTerm: 'TERM_2' });

      fixture.componentRef.setInput('studentsList', [sSec3, sGulf12]);
      fixture.detectChanges();

      component.openPromotionModal('GRADE');
      fixture.detectChanges();

      const hostEl = fixture.nativeElement as HTMLElement;
      (hostEl.querySelector('[data-testid="promo-select-all-checkbox"]') as HTMLInputElement).click();
      fixture.detectChanges();

      // Clicking continue transitions to Graduation Review stage instead of firing immediately
      (hostEl.querySelector('[data-testid="promo-continue-btn"]') as HTMLButtonElement).click();
      fixture.detectChanges();

      const banner = hostEl.querySelector('[data-testid="graduation-prompt-banner"]') as HTMLElement;
      expect(banner).toBeTruthy();
      expect(banner.textContent).toContain('الأرشيف');
      expect(banner.textContent).toContain('حذف');

      // Set s_sec3 -> ARCHIVE, s_gulf12 -> DELETE
      const sec3ArchiveBtn = hostEl.querySelector('[data-graduating-student-id="s_sec3"] [data-testid="grad-decision-archive"]') as HTMLButtonElement;
      const gulfDeleteBtn = hostEl.querySelector('[data-graduating-student-id="s_gulf12"] [data-testid="grad-decision-delete"]') as HTMLButtonElement;
      sec3ArchiveBtn.click();
      gulfDeleteBtn.click();
      fixture.detectChanges();

      const deletedBatches: string[][] = [];
      component.studentsDeleted.subscribe((ids) => deletedBatches.push(ids));

      (hostEl.querySelector('[data-testid="promo-confirm-execute-btn"]') as HTMLButtonElement).click();
      fixture.detectChanges();

      const req = httpTesting.expectOne('/api/v1/admin/users/students/promote');
      expect(req.request.body.graduationDecisions).toEqual({
        s_sec3: 'ARCHIVE',
        s_gulf12: 'DELETE'
      });

      req.flush({
        success: true,
        data: {
          mode: 'GRADE',
          promotedCount: 0,
          archivedCount: 1,
          deletedCount: 1,
          skippedCount: 0,
          excludedCount: 0,
          promoted: [],
          archived: [{ studentId: 's_sec3', fullName: 'ياسمين 3 ثانوي', fromGrade: 'SEC_3', status: 'ARCHIVED' }],
          deleted: [{ studentId: 's_gulf12', fullName: 'فيصل الصف 12', fromGrade: 'GRADE_12', status: 'DELETED' }],
          skipped: []
        }
      });

      expect(deletedBatches).toEqual([['s_gulf12']]);
    });

    it('UI REQ-5: isolates archived graduates under Archived tab and supports Restore & Permanent Delete actions', () => {
      const sActive = buildStudent({ id: 's_act', name: 'طالب نشط', haCode: 'HA401', isArchived: false });
      const sArchived = buildStudent({
        id: 's_arch',
        name: 'خريج بالأرشيف',
        haCode: 'HA402',
        gradeLevel: 'SEC_3',
        isArchived: true,
        graduationStatus: 'GRADUATED',
        graduatedFromGrade: 'SEC_3'
      });

      fixture.componentRef.setInput('studentsList', [sActive, sArchived]);
      fixture.detectChanges();

      // Active ALL view hides archived students
      expect(component.filteredStudents().map((s) => s.id)).toEqual(['s_act']);
      expect(component.userCounts().archived).toBe(1);

      const hostEl = fixture.nativeElement as HTMLElement;
      (hostEl.querySelector('[data-testid="tab-archived-students"]') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(component.filteredStudents().map((s) => s.id)).toEqual(['s_arch']);

      // Restore archived student
      const updated: any[] = [];
      component.studentUpdated.subscribe((s) => updated.push(s));
      (hostEl.querySelector('[data-testid="restore-archived-student-btn"]') as HTMLButtonElement).click();

      const restoreReq = httpTesting.expectOne('/api/v1/admin/users/students/s_arch/archive');
      expect(restoreReq.request.method).toBe('PATCH');
      expect(restoreReq.request.body).toEqual({ archived: false });
      restoreReq.flush({ success: true, data: { studentId: 's_arch', isArchived: false } });

      expect(updated[0].isArchived).toBeFalse();
      expect(updated[0].graduationStatus).toBe('ACTIVE');

      // Permanent Delete flow from Archived tab
      (hostEl.querySelector('[data-testid="delete-archived-student-btn"]') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(hostEl.querySelector('[data-testid="confirm-permanent-delete-modal"]')).toBeTruthy();
      (hostEl.querySelector('[data-testid="confirm-permanent-delete-btn"]') as HTMLButtonElement).click();

      const delReq = httpTesting.expectOne('/api/v1/admin/users/students/s_arch');
      expect(delReq.request.method).toBe('DELETE');
      delReq.flush({ success: true, data: { deletedStudentId: 's_arch' } });
    });
  });
});
