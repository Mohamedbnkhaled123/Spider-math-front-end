import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CurriculumStudioComponent } from './curriculum-studio.component';

describe('CurriculumStudioComponent', () => {
  let component: CurriculumStudioComponent;
  let fixture: ComponentFixture<CurriculumStudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurriculumStudioComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CurriculumStudioComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('units', []);
    fixture.componentRef.setInput('selectedCurriculum', 'EGYPTIAN');
    fixture.componentRef.setInput('selectedGrade', 'SEC_3');
    fixture.componentRef.setInput('selectedTerm', 'TERM_1');
    fixture.detectChanges();
  });

  it('should create curriculum studio component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit curriculumChange when changing curriculum', () => {
    spyOn(component.curriculumChange, 'emit');
    component.selectCurriculum('GULF');
    expect(component.curriculumChange.emit).toHaveBeenCalledWith('GULF');
  });

  it('should open and close unit creation modal', () => {
    expect(component.isUnitModalOpen()).toBeFalse();
    component.openCreateUnitModal();
    expect(component.isUnitModalOpen()).toBeTrue();
  });
});
