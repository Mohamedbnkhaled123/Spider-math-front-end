import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { UnitStudyWorkspaceComponent } from './unit-study-workspace.component';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';

describe('UnitStudyWorkspaceComponent', () => {
  let component: UnitStudyWorkspaceComponent;
  let fixture: ComponentFixture<UnitStudyWorkspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitStudyWorkspaceComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: LangService,
          useValue: {
            isArabic: () => true,
            currentLang: () => 'ar'
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitStudyWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should switch between video and PDF tabs', () => {
    expect(component.activeTab()).toBe('video');
    component.setTab('pdf');
    expect(component.activeTab()).toBe('pdf');
  });

  it('should select a lecture and compute active lecture', () => {
    component.workspaceData.update((w) => ({
      ...w,
      lectures: [
        {
          _id: 'lec_diff_1',
          titleAr: 'المحاضرة 1',
          titleEn: 'Lecture 1',
          order: 1,
          durationMinutes: 30,
          encryptedVideoId: 'xyz',
          isPrintAllowed: false,
          watchPercentage: 100,
          isCompleted: true,
          hasAssessment: false
        }
      ]
    }));
    component.selectLecture('lec_diff_1');
    expect(component.selectedLectureId()).toBe('lec_diff_1');
    expect(component.activeLecture()?.order).toBe(1);
  });
});
