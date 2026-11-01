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

  it('should add qualification in Arabic to CMS config', () => {
    const initialCount = component.editableCms().teacherQualificationsAr?.length || 0;
    component.newQualAr.set('خبير معتمد في تدريس الرياضيات');
    component.addQualificationAr();
    expect(component.editableCms().teacherQualificationsAr?.length).toBe(initialCount + 1);
  });
});
