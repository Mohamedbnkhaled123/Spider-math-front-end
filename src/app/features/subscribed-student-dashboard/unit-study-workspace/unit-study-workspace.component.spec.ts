import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { UnitStudyWorkspaceComponent } from './unit-study-workspace.component';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';

describe('UnitStudyWorkspaceComponent', () => {
  let component: UnitStudyWorkspaceComponent;
  let fixture: ComponentFixture<UnitStudyWorkspaceComponent>;
  let httpMock: HttpTestingController;

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

    httpMock = TestBed.inject(HttpTestingController);
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

  it('should select target lecture and activate pdf tab if files-only', () => {
    const mockLectures = [
      {
        _id: 'lec_1',
        titleAr: 'المحاضرة 1',
        titleEn: 'Lecture 1',
        order: 1,
        durationMinutes: 30,
        encryptedVideoId: 'video_1',
        isPrintAllowed: false,
        watchPercentage: 0,
        isCompleted: false,
        hasAssessment: false
      },
      {
        _id: 'lec_2',
        titleAr: 'المحاضرة 2 (ملزمة فقط)',
        titleEn: 'Lecture 2 (Handout only)',
        order: 2,
        durationMinutes: 0,
        encryptedVideoId: '',
        googleDrivePdfFileId: 'pdf_file_2',
        isPrintAllowed: true,
        watchPercentage: 0,
        isCompleted: false,
        hasAssessment: false
      }
    ];

    component.workspaceData.update(w => ({ ...w, lectures: mockLectures }));
    component.selectLecture('lec_2');

    expect(component.selectedLectureId()).toBe('lec_2');
    expect(component.activeTab()).toBe('pdf');
  });

  it('should activate video tab if target lecture has video', () => {
    const mockLectures = [
      {
        _id: 'lec_video',
        titleAr: 'محاضرة فيديو',
        titleEn: 'Video Lecture',
        order: 1,
        durationMinutes: 45,
        encryptedVideoId: 'yt_vid_123',
        googleDrivePdfFileId: 'pdf_123',
        isPrintAllowed: false,
        watchPercentage: 10,
        isCompleted: false,
        hasAssessment: false
      }
    ];
    component.workspaceData.update(w => ({ ...w, lectures: mockLectures }));
    component.selectLecture('lec_video');
    expect(component.selectedLectureId()).toBe('lec_video');
    expect(component.activeTab()).toBe('video');
  });

  it('should sanitize raw id with ?lectureId= and extract fallback lecture ID', () => {
    const result = component.sanitizeUnitIdAndExtractFallback('unit_abc_123?lectureId=lec_xyz_456');
    expect(result.unitId).toBe('unit_abc_123');
    expect(result.fallbackLectureId).toBe('lec_xyz_456');
  });

  it('should sanitize percent-encoded raw id with %3FlectureId%3D and extract fallback lecture ID', () => {
    const result = component.sanitizeUnitIdAndExtractFallback('unit_abc_123%3FlectureId%3Dlec_xyz_789');
    expect(result.unitId).toBe('unit_abc_123');
    expect(result.fallbackLectureId).toBe('lec_xyz_789');
  });

  it('should sanitize raw id with multiple query params and extract fallback lecture ID', () => {
    const result = component.sanitizeUnitIdAndExtractFallback('unit_abc_123?foo=bar&lectureId=lec_multi_999&baz=qux');
    expect(result.unitId).toBe('unit_abc_123');
    expect(result.fallbackLectureId).toBe('lec_multi_999');
  });

  it('should sanitize raw unit id during loadUnitCurriculum and select fallback lecture', () => {
    component.loadUnitCurriculum('unit_corr_99?lectureId=lec_target');

    const req = httpMock.expectOne('/api/v1/units/unit_corr_99/curriculum-contents');
    expect(req.request.method).toBe('GET');

    req.flush({
      success: true,
      data: {
        unit: { _id: 'unit_corr_99', title_ar: 'الوحدة' },
        isSubscribed: true,
        lectures: [
          { _id: 'lec_first', lecture_title_ar: 'المحاضرة الأولى', order_index: 1 },
          { _id: 'lec_target', lecture_title_ar: 'المحاضرة المستهدفة', order_index: 2, youtube_video_id: 'vid_123' }
        ],
        assessments: []
      }
    });

    expect(component.selectedLectureId()).toBe('lec_target');
    expect(component.activeTab()).toBe('video');

    const tokenReq = httpMock.expectOne('/api/v1/lectures/lec_target/secure-playback');
    tokenReq.flush({ success: true, data: { token: 'mock_token' } });
  });

  it('should scroll lecture viewport into view when selecting a lecture interactively', () => {
    const scrollIntoViewSpy = jasmine.createSpy('scrollIntoView');
    const originalGetById = document.getElementById.bind(document);
    spyOn(document, 'getElementById').and.callFake((id: string) => {
      if (id === 'lecture-viewport') {
        return { scrollIntoView: scrollIntoViewSpy } as unknown as HTMLElement;
      }
      return originalGetById(id);
    });

    const originalRaf = window.requestAnimationFrame;
    spyOn(window, 'requestAnimationFrame').and.callFake((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });

    component.workspaceData.update((w) => ({
      ...w,
      lectures: [
        {
          _id: 'lec_scroll_1',
          titleAr: 'المحاضرة 1',
          titleEn: 'Lecture 1',
          order: 1,
          durationMinutes: 20,
          encryptedVideoId: 'vid_scroll_1',
          isPrintAllowed: false,
          watchPercentage: 0,
          isCompleted: false,
          hasAssessment: false
        }
      ]
    }));

    component.selectLecture('lec_scroll_1', true);
    expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(originalRaf).toBeDefined();
  });

  it('should navigate directly to standalone assessment route when startAssessment is confirmed', async () => {
    spyOn(component.confirmDialogService, 'confirm').and.returnValue(Promise.resolve(true));
    const router = (component as any).router;
    const navigateSpy = spyOn(router, 'navigate');

    await component.startAssessment('asm_standalone_1', 'كويز تجريبي');
    expect(navigateSpy).toHaveBeenCalledWith(
      ['/student/assessments', 'asm_standalone_1'],
      { queryParams: undefined }
    );
  });
});
