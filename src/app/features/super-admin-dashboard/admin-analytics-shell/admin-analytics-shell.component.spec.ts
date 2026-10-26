import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminAnalyticsShellComponent } from './admin-analytics-shell.component';

describe('AdminAnalyticsShellComponent', () => {
  let component: AdminAnalyticsShellComponent;
  let fixture: ComponentFixture<AdminAnalyticsShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAnalyticsShellComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAnalyticsShellComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('activeTab', 'analytics');
    fixture.componentRef.setInput('analytics', {
      registeredStudents: 10,
      activeSubscriptions: 2,
      pendingGradingCount: 1,
      pendingDevicesCount: 1,
      newLeadsCount: 3
    });
    fixture.detectChanges();
  });

  it('should create the admin analytics shell component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit tabChange when selecting a tab', () => {
    spyOn(component.tabChange, 'emit');
    component.selectTab('curriculum');
    expect(component.tabChange.emit).toHaveBeenCalledWith('curriculum');
  });

  it('should emit backupExportRequested when backup button is triggered', () => {
    spyOn(component.backupExportRequested, 'emit');
    component.triggerBackup();
    expect(component.backupExportRequested.emit).toHaveBeenCalled();
  });
});
