import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { BrandFooterComponent } from './brand-footer.component';
import { AdminAccessPortalService } from '../../../core/auth/admin-access-portal.service';

describe('BrandFooterComponent', () => {
  let component: BrandFooterComponent;
  let fixture: ComponentFixture<BrandFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrandFooterComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ar: {} },
          translocoConfig: { availableLangs: ['en', 'ar'], defaultLang: 'en' }
        })
      ],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(BrandFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the BrandFooterComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should have current year defined', () => {
    expect(component.currentYear).toBeGreaterThanOrEqual(2026);
  });

  it('should render the English hero mascot logo image in footer', () => {
    const logoImg: HTMLImageElement | null = fixture.nativeElement.querySelector('footer img');
    expect(logoImg).toBeTruthy();
    expect(logoImg?.getAttribute('src')).toContain('/assets/branding/spider-mascot-hero-book-v3.webp?v=12');
  });

  it('should open teacher portal after 5 rapid clicks on footer logo', () => {
    const portal = TestBed.inject(AdminAccessPortalService);
    portal.close();
    const event = { preventDefault: jasmine.createSpy('preventDefault'), stopPropagation: jasmine.createSpy('stopPropagation') } as unknown as Event;
    for (let i = 0; i < 4; i++) {
      component.onFooterLogoClick(event);
      expect(portal.isOpen()).toBeFalse();
    }
    component.onFooterLogoClick(event);
    expect(portal.isOpen()).toBeTrue();
    expect(portal.portalMode()).toBe('teacher');
  });

  it('should never scroll or navigate on single click on footer logo', () => {
    const event = { preventDefault: jasmine.createSpy('preventDefault'), stopPropagation: jasmine.createSpy('stopPropagation') } as unknown as Event;
    spyOn(window, 'scrollTo');
    component.onFooterLogoClick(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
