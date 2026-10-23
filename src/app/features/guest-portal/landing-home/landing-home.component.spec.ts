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
});
