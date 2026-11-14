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

  it('should display all units when showAllUnits toggle is activated', () => {
    component.realUnits.set([
      { id: 'u_sec1_1', titleAr: 'الهندسة', curriculum: 'EGYPTIAN', gradeLevel: 'SEC_1' },
      { id: 'u_sec3_1', titleAr: 'التفاضل', curriculum: 'EGYPTIAN', gradeLevel: 'SEC_3' }
    ]);

    component.studentToActivate.set({
      id: 'student_1',
      name: 'Mohammed Khaled',
      haCode: 'HA1001',
      email: 'mk@test.com',
      curriculum: 'EGYPTIAN',
      gradeLevel: 'SEC_1',
      hasActiveSubscription: false,
      subscriptionStatus: 'CANCELLED',
      totalXp: 0,
      approvedDevices: 1,
      isLocked: false,
      isLeaderboardHidden: false
    });

    component.showAllUnits.set(true);
    expect(component.studentMatchingUnits().length).toBe(2);
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
});
