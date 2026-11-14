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
});
