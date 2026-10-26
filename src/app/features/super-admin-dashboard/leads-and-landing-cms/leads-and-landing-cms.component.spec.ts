import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LeadsAndLandingCmsComponent } from './leads-and-landing-cms.component';

describe('LeadsAndLandingCmsComponent', () => {
  let component: LeadsAndLandingCmsComponent;
  let fixture: ComponentFixture<LeadsAndLandingCmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadsAndLandingCmsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LeadsAndLandingCmsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('leadsList', []);
    fixture.componentRef.setInput('cmsConfig', {
      heroHeadlineAr: 'Hero Title',
      heroSubheadlineAr: 'Hero Subtitle',
      announcementBannerText: 'Announcement',
      isAnnouncementActive: true,
      supportWhatsapp: '01012345678',
      activeAcademicYear: '2026 / 2027',
      schedulesTable: []
    });
    fixture.detectChanges();
  });

  it('should create leads and landing cms component', () => {
    expect(component).toBeTruthy();
  });

  it('should add schedule row to CMS config', () => {
    const initialCount = component.editableCms().schedulesTable?.length || 0;
    component.newSchedule.set({
      curriculum: 'EGYPTIAN',
      gradeLevel: 'SEC_3',
      term: 'TERM_1',
      dayOfWeek: 'Monday',
      timeSlot: '07:00 PM',
      lectureSubject: 'Calculus'
    });
    component.addScheduleRow();
    expect(component.editableCms().schedulesTable.length).toBe(initialCount + 1);
  });
});
