import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { LandingHomeComponent } from './landing-home.component';

describe('LandingHomeComponent', () => {
  let component: LandingHomeComponent;
  let fixture: ComponentFixture<LandingHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LandingHomeComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ar: {} },
          translocoConfig: { availableLangs: ['en', 'ar'], defaultLang: 'en' }
        })
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the LandingHomeComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default curriculum and term', () => {
    expect(component.selectedCurriculum()).toBe('EGYPTIAN');
    expect(component.selectedTerm()).toBe('TERM_1');
  });

  it('should update mouse coordinates on mouse move', () => {
    const fakeEvent = {
      clientX: 200,
      clientY: 100,
      currentTarget: {
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 200 })
      }
    } as unknown as MouseEvent;

    component.onMouseMove(fakeEvent);
    expect(component.mouseX()).toBe(50);
    expect(component.mouseY()).toBe(50);
  });

  describe('Lighthouse Optimizations', () => {
    it('should initialize landingData synchronously from default data preventing critical path latency', () => {
      expect(component.landingData()).toBeTruthy();
      expect(component.landingData()?.heroHeadlineAr).toBeTruthy();
    });

    it('should render Hero LCP image with decoding="sync" and fetchpriority="high"', () => {
      const heroImg: HTMLImageElement | null = fixture.nativeElement.querySelector('section img[fetchpriority="high"]');
      expect(heroImg).toBeTruthy();
      expect(heroImg?.getAttribute('decoding')).toBe('sync');
      expect(heroImg?.getAttribute('fetchpriority')).toBe('high');
      expect(heroImg?.getAttribute('width')).toBe('640');
      expect(heroImg?.getAttribute('height')).toBe('640');
      expect(heroImg?.getAttribute('src')).toContain('spider-mascot-hero-book');
    });
  });

  describe('Placement Test Section Responsive & Ribbon Enhancements', () => {
    it('should render placement section with lg:flex-row container preventing 768px tablet text squeezing', () => {
      const placementSec: HTMLElement | null = fixture.nativeElement.querySelector('#placement-test-section');
      expect(placementSec).toBeTruthy();

      const flexContainer = placementSec?.querySelector('.spider-rim-glass-card .flex-col');
      expect(flexContainer).toBeTruthy();
      expect(flexContainer?.classList.contains('lg:flex-row')).toBeTrue();
      expect(flexContainer?.classList.contains('md:flex-row')).toBeFalse();
    });

    it('should render corner ribbon, badge, features, and dynamically reflect Placement CMS updates and clears', () => {
      component.langService.setLanguage('ar');
      fixture.detectChanges();

      const placementSec: HTMLElement | null = fixture.nativeElement.querySelector('#placement-test-section');
      const ribbon = placementSec?.querySelector('[data-testid="placement-section-ribbon"]');
      expect(ribbon).toBeTruthy();
      expect(ribbon?.textContent || '').toContain('مجاني');

      expect(placementSec?.querySelector('[data-testid="placement-section-badge"]')).toBeTruthy();
      expect(placementSec?.querySelector('[data-testid="placement-section-features"]')).toBeTruthy();

      const current = component.landingData()!;
      component.landingData.set({
        ...current,
        placementRibbonAr: 'تقييم مجاني',
        placementBadgeAr: 'تشخيص فوري للمهارات',
        placementHeadlineAr: 'اختبر مستواك المخصص الآن',
        placementSubtitleAr: 'وصف تشخيصي محدث من لوحة التحكم.',
        placementFeature1Ar: 'نتيجة فورية',
        placementFeature2Ar: 'تحليل شامل',
        placementFeature3Ar: '',
        placementCtaAr: 'انطلق الآن'
      });
      fixture.detectChanges();

      expect(placementSec?.querySelector('[data-testid="placement-section-ribbon"]')?.textContent).toContain('تقييم مجاني');
      expect(placementSec?.querySelector('[data-testid="placement-section-badge"]')?.textContent).toContain('تشخيص فوري للمهارات');
      expect(placementSec?.querySelector('[data-testid="placement-section-headline"]')?.textContent?.trim()).toBe('اختبر مستواك المخصص الآن');
      expect(placementSec?.querySelector('[data-testid="placement-section-subtitle"]')?.textContent?.trim()).toBe('وصف تشخيصي محدث من لوحة التحكم.');
      expect(placementSec?.querySelector('[data-testid="placement-section-cta-text"]')?.textContent?.trim()).toBe('انطلق الآن');
      const featureChips = placementSec?.querySelectorAll('[data-testid="placement-section-features"] > span');
      expect(featureChips?.length).toBe(2);

      // Clearing optional badge, ribbon, and features hides them cleanly
      component.landingData.set({
        ...current,
        placementRibbonAr: '',
        placementBadgeAr: '',
        placementFeature1Ar: '',
        placementFeature2Ar: '',
        placementFeature3Ar: ''
      });
      fixture.detectChanges();

      expect(placementSec?.querySelector('[data-testid="placement-section-ribbon"]')).toBeNull();
      expect(placementSec?.querySelector('[data-testid="placement-section-badge"]')).toBeNull();
      expect(placementSec?.querySelector('[data-testid="placement-section-features"]')).toBeNull();
    });

    it('should render compact placement CTA button controlled by CMS placementCtaAr/En', () => {
      component.langService.setLanguage('ar');
      fixture.detectChanges();

      const placementSec: HTMLElement | null = fixture.nativeElement.querySelector('#placement-test-section');
      const btn = placementSec?.querySelector('button.btn-gold-metallic');
      expect(btn).toBeTruthy();

      const btnText = btn?.textContent || '';
      expect(btnText.includes('ابدأ الآن') || btnText.includes('Start now')).toBeTrue();
      expect(btn?.classList.contains('w-full')).toBeFalse();
      expect(btn?.classList.contains('inline-flex')).toBeTrue();
    });
  });

  describe('Dynamic CMS Binding Across All Landing Sections', () => {
    it('should bind Hero, About, Curricula, Honor Board CTA, and Testimonials headings to CMS data', () => {
      component.langService.setLanguage('ar');
      const base = component.landingData()!;
      component.landingData.set({
        ...base,
        heroBadgeAr: 'منصة سبايدر المحدثة',
        heroHeadlineAr: 'السطر الأول\nالسطر الذهبي\nالسطر الثالث',
        heroSubheadlineAr: 'وصف فرعي تجريبي من لوحة التحكم',
        heroCtaPrimaryAr: 'تصفح المقررات',
        heroCtaSecondaryAr: 'اختبار تحديد المستوى المباشر',
        aboutHeadlineAr: 'شرح مبسط\nالرياضيات بوضوح\nتفوق مستمر',
        curriculumBadgeAr: 'مساراتنا الجديدة',
        curriculumTitleAr: 'المناهج المعتمدة للعام الجديد',
        curriculumSubtitleAr: 'اختر الصف والمنهج المحدث',
        hallOfFameBadgeAr: 'أوائل المنصة المعتمدون',
        honorCtaTitleAr: 'سجل إنجازك معنا',
        honorCtaSubtitleAr: 'ابدأ رحلة التفوق من تحديد المستوى.',
        honorCtaButtonAr: 'خض الاختبار الآن',
        testimonialsBadgeAr: 'انطباعات الطلاب',
        testimonialsTitleAr: 'تجارب حقيقية لطلابنا',
        testimonialsSubtitleAr: 'آراء منشورة ومعتمدة.'
      });
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;

      // Hero section: pill badge and secondary CTA are intentionally omitted
      expect(el.querySelector('[data-testid="hero-cms-badge"]')).toBeNull();
      expect(el.querySelector('[data-testid="hero-cms-cta-secondary"]')).toBeNull();
      const heroSpans = el.querySelectorAll('[data-testid="hero-cms-headline"] span');
      expect(heroSpans.length).toBe(3);
      expect(heroSpans[0]?.textContent?.trim()).toBe('السطر الأول');
      expect(heroSpans[1]?.textContent?.trim()).toBe('السطر الذهبي');
      expect(heroSpans[1]?.classList.contains('text-gold-accent')).toBeTrue();
      expect(heroSpans[2]?.textContent?.trim()).toBe('السطر الثالث');
      expect(el.querySelector('[data-testid="hero-cms-subheadline"]')?.textContent?.trim()).toBe('وصف فرعي تجريبي من لوحة التحكم');
      expect(el.querySelector('[data-testid="hero-cms-cta-primary"]')?.textContent?.trim()).toBe('تصفح المقررات');

      // About headline
      const aboutSpans = el.querySelectorAll('[data-testid="about-cms-headline"] span');
      expect(aboutSpans.length).toBe(3);
      expect(aboutSpans[1]?.textContent?.trim()).toBe('الرياضيات بوضوح');
      expect(aboutSpans[1]?.classList.contains('text-gold-accent')).toBeTrue();

      // Curricula section header
      expect(el.querySelector('[data-testid="curriculum-section-badge"]')?.textContent).toContain('مساراتنا الجديدة');
      expect(el.querySelector('[data-testid="curriculum-section-title"]')?.textContent?.trim()).toBe('المناهج المعتمدة للعام الجديد');
      expect(el.querySelector('[data-testid="curriculum-section-subtitle"]')?.textContent?.trim()).toBe('اختر الصف والمنهج المحدث');

      // Hall of Fame badge & CTA
      expect(el.querySelector('[data-testid="hall-of-fame-badge"]')?.textContent).toContain('أوائل المنصة المعتمدون');
      expect(el.querySelector('[data-testid="honor-cta-title"]')?.textContent?.trim()).toBe('سجل إنجازك معنا');
      expect(el.querySelector('[data-testid="honor-cta-subtitle"]')?.textContent?.trim()).toBe('ابدأ رحلة التفوق من تحديد المستوى.');
      expect(el.querySelector('[data-testid="honor-cta-button"]')?.textContent).toContain('خض الاختبار الآن');

      // Testimonials section header
      expect(el.querySelector('[data-testid="testimonials-section-badge"]')?.textContent).toContain('انطباعات الطلاب');
      expect(el.querySelector('[data-testid="testimonials-section-title"]')?.textContent?.trim()).toBe('تجارب حقيقية لطلابنا');
      expect(el.querySelector('[data-testid="testimonials-section-subtitle"]')?.textContent?.trim()).toBe('آراء منشورة ومعتمدة.');
    });
  });

  describe('Placement Track Modal Subdivisions (Gulf Countries & International Divisions)', () => {
    it('should render all 4 Gulf countries when Gulf curriculum is selected in placement modal and pass countryCode to runner', () => {
      component.isPlacementModalOpen.set(true);
      component.setPlacementCurriculum('GULF');
      fixture.detectChanges();

      const gulfSection = fixture.nativeElement.querySelector('[data-testid="placement-gulf-countries"]') as HTMLElement;
      expect(gulfSection).toBeTruthy();
      expect(gulfSection.querySelector('[data-country="SA"]')).toBeTruthy();
      expect(gulfSection.querySelector('[data-country="QA"]')).toBeTruthy();
      expect(gulfSection.querySelector('[data-country="AE"]')).toBeTruthy();
      expect(gulfSection.querySelector('[data-country="KW"]')).toBeTruthy();

      const router = (component as any).router;
      const navigateSpy = spyOn(router, 'navigate');
      component.setPlacementGulfCountry('AE');
      fixture.detectChanges();
      component.startPlacementExam();

      expect(navigateSpy).toHaveBeenCalledWith(
        ['/placement-test'],
        jasmine.objectContaining({
          queryParams: jasmine.objectContaining({
            curriculum: 'GULF',
            countryCode: 'AE'
          })
        })
      );
    });

    it('should render American & British division switchers when International curriculum is selected in placement modal', () => {
      component.isPlacementModalOpen.set(true);
      component.setPlacementCurriculum('INTERNATIONAL');
      fixture.detectChanges();

      const intlSection = fixture.nativeElement.querySelector('[data-testid="placement-intl-divisions"]') as HTMLElement;
      expect(intlSection).toBeTruthy();
      expect(intlSection.querySelector('[data-division="AMERICAN_CURRICULUM"]')).toBeTruthy();
      expect(intlSection.querySelector('[data-division="BRITISH_CURRICULUM"]')).toBeTruthy();
      expect(component.placementHasTerms()).toBeFalse();

      const router = (component as any).router;
      const navigateSpy = spyOn(router, 'navigate');
      component.setPlacementIntlDivision('BRITISH_CURRICULUM');
      fixture.detectChanges();
      component.startPlacementExam();

      expect(navigateSpy).toHaveBeenCalledWith(
        ['/placement-test'],
        jasmine.objectContaining({
          queryParams: jasmine.objectContaining({
            curriculum: 'INTERNATIONAL',
            divisionCode: 'BRITISH_CURRICULUM'
          })
        })
      );
    });

    it('should reserve logical end padding and place chevron at end-3.5 on placement select controls for RTL Arabic', () => {
      component.isPlacementModalOpen.set(true);
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const curriculumSelect = hostEl.querySelector('[data-testid="placement-curriculum-select"]') as HTMLSelectElement | null;
      const gradeSelect = hostEl.querySelector('[data-testid="placement-grade-select"]') as HTMLSelectElement | null;
      const curriculumChevron = hostEl.querySelector('[data-testid="placement-curriculum-chevron"]') as HTMLElement | null;
      const gradeChevron = hostEl.querySelector('[data-testid="placement-grade-chevron"]') as HTMLElement | null;

      expect(curriculumSelect).toBeTruthy();
      expect(curriculumSelect?.classList.contains('ps-4')).toBeTrue();
      expect(curriculumSelect?.classList.contains('pe-10')).toBeTrue();
      expect(curriculumSelect?.classList.contains('px-4')).toBeFalse();

      expect(gradeSelect).toBeTruthy();
      expect(gradeSelect?.classList.contains('ps-4')).toBeTrue();
      expect(gradeSelect?.classList.contains('pe-10')).toBeTrue();
      expect(gradeSelect?.classList.contains('px-4')).toBeFalse();

      expect(curriculumChevron).toBeTruthy();
      expect(curriculumChevron?.classList.contains('end-3.5')).toBeTrue();
      expect(curriculumChevron?.classList.contains('left-3')).toBeFalse();
      expect(curriculumChevron?.classList.contains('rtl:right-3')).toBeFalse();

      expect(gradeChevron).toBeTruthy();
      expect(gradeChevron?.classList.contains('end-3.5')).toBeTrue();
      expect(gradeChevron?.classList.contains('left-3')).toBeFalse();
      expect(gradeChevron?.classList.contains('rtl:right-3')).toBeFalse();
    });
  });
});
