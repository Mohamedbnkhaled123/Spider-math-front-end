import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LeadsAndLandingCmsComponent } from './leads-and-landing-cms.component';
import { PublicDiscoveryService } from '../../../core/services/public-discovery.service';

describe('LeadsAndLandingCmsComponent', () => {
  let component: LeadsAndLandingCmsComponent;
  let fixture: ComponentFixture<LeadsAndLandingCmsComponent>;
  let httpMock: HttpTestingController;
  let discoveryService: PublicDiscoveryService;

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
    httpMock = TestBed.inject(HttpTestingController);
    discoveryService = TestBed.inject(PublicDiscoveryService);
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

  it('should render mobile-safe responsive classes on Arabic qualification add row and items', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    const addRow = hostEl.querySelector('[data-testid="qual-add-row-ar"]') as HTMLElement | null;
    const addInput = addRow?.querySelector('input') as HTMLInputElement | null;
    const addBtn = hostEl.querySelector('[data-testid="qual-add-btn-ar"]') as HTMLButtonElement | null;

    expect(addRow).toBeTruthy();
    expect(addRow?.classList.contains('flex-col')).toBeTrue();
    expect(addRow?.classList.contains('sm:flex-row')).toBeTrue();
    expect(addRow?.classList.contains('min-w-0')).toBeTrue();

    expect(addInput).toBeTruthy();
    expect(addInput?.classList.contains('w-full')).toBeTrue();
    expect(addInput?.classList.contains('sm:flex-1')).toBeTrue();
    expect(addInput?.classList.contains('min-w-0')).toBeTrue();

    expect(addBtn).toBeTruthy();
    expect(addBtn?.classList.contains('w-full')).toBeTrue();
    expect(addBtn?.classList.contains('sm:w-auto')).toBeTrue();
    expect(addBtn?.classList.contains('shrink-0')).toBeTrue();
    expect(addBtn?.classList.contains('whitespace-nowrap')).toBeTrue();

    component.newQualAr.set('بكالوريوس هندسة قسم نظم وحاسبات تقدير عام جيد جدا مع مرتبة الشرف جامعة الأزهر');
    component.addQualificationAr();
    fixture.detectChanges();

    const qualItem = hostEl.querySelector('[data-testid="qual-item-ar"]') as HTMLElement | null;
    const deleteBtn = qualItem?.querySelector('button') as HTMLButtonElement | null;
    const textSpan = qualItem?.querySelector('span.break-words') as HTMLElement | null;

    expect(qualItem).toBeTruthy();
    expect(qualItem?.classList.contains('gap-3')).toBeTrue();
    expect(qualItem?.classList.contains('min-w-0')).toBeTrue();
    expect(deleteBtn?.classList.contains('shrink-0')).toBeTrue();
    expect(deleteBtn?.classList.contains('whitespace-nowrap')).toBeTrue();
    expect(textSpan?.classList.contains('break-words')).toBeTrue();
  });

  it('should render mobile-safe responsive classes on English qualification add row and items', () => {
    component.activeCmsTab.set('EN');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    const addRow = hostEl.querySelector('[data-testid="qual-add-row-en"]') as HTMLElement | null;
    const addInput = addRow?.querySelector('input') as HTMLInputElement | null;
    const addBtn = hostEl.querySelector('[data-testid="qual-add-btn-en"]') as HTMLButtonElement | null;

    expect(addRow).toBeTruthy();
    expect(addRow?.classList.contains('flex-col')).toBeTrue();
    expect(addRow?.classList.contains('sm:flex-row')).toBeTrue();
    expect(addRow?.classList.contains('min-w-0')).toBeTrue();

    expect(addInput).toBeTruthy();
    expect(addInput?.classList.contains('w-full')).toBeTrue();
    expect(addInput?.classList.contains('sm:flex-1')).toBeTrue();
    expect(addInput?.classList.contains('min-w-0')).toBeTrue();

    expect(addBtn).toBeTruthy();
    expect(addBtn?.classList.contains('w-full')).toBeTrue();
    expect(addBtn?.classList.contains('sm:w-auto')).toBeTrue();
    expect(addBtn?.classList.contains('shrink-0')).toBeTrue();
    expect(addBtn?.classList.contains('whitespace-nowrap')).toBeTrue();

    component.newQualEn.set('Certified SAT/EST/ACT Math Instructor with 14+ Years Experience');
    component.addQualificationEn();
    fixture.detectChanges();

    const qualItem = hostEl.querySelector('[data-testid="qual-item-en"]') as HTMLElement | null;
    const deleteBtn = qualItem?.querySelector('button') as HTMLButtonElement | null;
    const textSpan = qualItem?.querySelector('span.break-words') as HTMLElement | null;

    expect(qualItem).toBeTruthy();
    expect(qualItem?.classList.contains('gap-3')).toBeTrue();
    expect(qualItem?.classList.contains('min-w-0')).toBeTrue();
    expect(deleteBtn?.classList.contains('shrink-0')).toBeTrue();
    expect(deleteBtn?.classList.contains('whitespace-nowrap')).toBeTrue();
    expect(textSpan?.classList.contains('break-words')).toBeTrue();
  });

  it('should render new dynamic CMS section fields across AR, EN, and HONOR_BOARD tabs', () => {
    const hostEl = fixture.nativeElement as HTMLElement;

    expect(hostEl.querySelector('[data-testid="cms-about-headline-ar"]')).toBeTruthy();
    expect(hostEl.querySelector('[data-testid="cms-placement-ribbon-ar"]')).toBeTruthy();
    expect(hostEl.querySelector('[data-testid="cms-schedule-title-ar"]')).toBeTruthy();
    expect(hostEl.querySelector('[data-testid="cms-testimonials-title-ar"]')).toBeTruthy();

    component.activeCmsTab.set('EN');
    fixture.detectChanges();
    expect(hostEl.querySelector('[data-testid="cms-about-headline-en"]')).toBeTruthy();
    expect(hostEl.querySelector('[data-testid="cms-placement-ribbon-en"]')).toBeTruthy();
    expect(hostEl.querySelector('[data-testid="cms-schedule-title-en"]')).toBeTruthy();
    expect(hostEl.querySelector('[data-testid="cms-testimonials-title-en"]')).toBeTruthy();

    component.activeCmsTab.set('HONOR_BOARD');
    fixture.detectChanges();
    expect(hostEl.querySelector('[data-testid="cms-honor-cta-title-ar"]')).toBeTruthy();
  });

  it('should invalidate PublicDiscoveryService landing cache when saveCms succeeds', () => {
    const invalidateSpy = spyOn(discoveryService, 'invalidateLandingCache').and.callThrough();
    const emittedConfigs: any[] = [];
    component.cmsConfigSaved.subscribe((cfg) => emittedConfigs.push(cfg));

    component.editableCms.update((cfg) => ({
      ...cfg,
      placementRibbonAr: 'تقييم مجاني',
      placementHeadlineAr: 'اختبر مستواك الآن',
      testimonialsTitleAr: 'تجارب الطلاب'
    }));

    component.saveCms();

    const req = httpMock.expectOne('/api/v1/admin/cms-config');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.placementRibbonAr).toBe('تقييم مجاني');
    req.flush({ success: true, data: component.editableCms() });

    expect(invalidateSpy).toHaveBeenCalled();
    expect(emittedConfigs.length).toBe(1);
    expect(emittedConfigs[0].placementHeadlineAr).toBe('اختبر مستواك الآن');
  });
});
