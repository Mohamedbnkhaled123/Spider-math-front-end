import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentsSubscriptionsDevicesComponent } from './students-subscriptions-devices.component';

describe('StudentsSubscriptionsDevicesComponent', () => {
  let component: StudentsSubscriptionsDevicesComponent;
  let fixture: ComponentFixture<StudentsSubscriptionsDevicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentsSubscriptionsDevicesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentsSubscriptionsDevicesComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('studentsList', []);
    fixture.componentRef.setInput('pendingDevices', []);
    fixture.detectChanges();
  });

  it('should create students subscriptions devices component', () => {
    expect(component).toBeTruthy();
  });

  it('should filter students list by search query', () => {
    fixture.componentRef.setInput('studentsList', [
      {
        id: '1',
        name: 'Ahmed Youssef',
        haCode: 'HA1001',
        email: 'ahmed@test.com',
        curriculum: 'EGYPTIAN',
        gradeLevel: 'SEC_3',
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
    expect(component.filteredStudents()[0].name).toBe('Ahmed Youssef');
  });
});
