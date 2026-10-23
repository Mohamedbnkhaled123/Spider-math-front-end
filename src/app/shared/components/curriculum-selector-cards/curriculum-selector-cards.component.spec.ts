import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { CurriculumSelectorCardsComponent } from './curriculum-selector-cards.component';

describe('CurriculumSelectorCardsComponent', () => {
  let component: CurriculumSelectorCardsComponent;
  let fixture: ComponentFixture<CurriculumSelectorCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CurriculumSelectorCardsComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ar: {} },
          translocoConfig: { availableLangs: ['en', 'ar'], defaultLang: 'en' }
        })
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CurriculumSelectorCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the curriculum selector cards component', () => {
    expect(component).toBeTruthy();
  });

  it('should default to EGYPTIAN curriculum and SEC_3 grade', () => {
    expect(component.selectedCurriculumCode()).toBe('EGYPTIAN');
    expect(component.selectedGradeCode()).toBe('SEC_3');
  });

  it('should emit selectionChange when curriculum is changed', () => {
    spyOn(component.selectionChange, 'emit');
    component.selectCurriculum('AMERICAN');
    expect(component.selectedCurriculumCode()).toBe('AMERICAN');
    expect(component.selectionChange.emit).toHaveBeenCalled();
  });
});
