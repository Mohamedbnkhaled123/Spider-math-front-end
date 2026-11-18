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

    it('should render corner ribbon with Free or مجاني text and not render old pill badge', () => {
      const placementSec: HTMLElement | null = fixture.nativeElement.querySelector('#placement-test-section');
      const ribbonWrapper = placementSec?.querySelector('.placement-corner-ribbon-wrapper');
      expect(ribbonWrapper).toBeTruthy();

      const ribbon = placementSec?.querySelector('.placement-corner-ribbon');
      expect(ribbon).toBeTruthy();
      const ribbonText = ribbon?.textContent || '';
      expect(ribbonText.includes('Free') || ribbonText.includes('مجاني')).toBeTrue();

      // Ensure the old inline pill badge with target icon is removed
      const oldBadge = placementSec?.querySelector('.max-w-2xl .rounded-full.bg-brand-gold\\/15');
      expect(oldBadge).toBeNull();
    });

    it('should render compact placement CTA button with "Start now" or "ابدأ الآن"', () => {
      const placementSec: HTMLElement | null = fixture.nativeElement.querySelector('#placement-test-section');
      const btn = placementSec?.querySelector('button.btn-gold-metallic');
      expect(btn).toBeTruthy();

      const btnText = btn?.textContent || '';
      expect(btnText.includes('ابدأ الآن') || btnText.includes('Start now')).toBeTrue();
      expect(btnText).not.toContain('Free Placement & Diagnostic Assessment');

      // Verify compact styling on small screens
      expect(btn?.classList.contains('w-full')).toBeFalse();
      expect(btn?.classList.contains('inline-flex')).toBeTrue();
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
