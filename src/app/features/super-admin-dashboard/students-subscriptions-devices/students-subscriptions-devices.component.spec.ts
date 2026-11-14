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
});
