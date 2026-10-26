import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { BrandFooterComponent } from './brand-footer.component';

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
      providers: [provideRouter([])]
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
});
