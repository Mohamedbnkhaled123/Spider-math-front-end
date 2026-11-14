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

  describe('GULF Curriculum 4-Country Breakdown & Stage Division', () => {
    it('should have 4 Gulf countries defined with correct codes and flags', () => {
      expect(component.GULF_COUNTRIES.length).toBe(4);
      const codes = component.GULF_COUNTRIES.map((c) => c.code);
      expect(codes).toEqual(['SA', 'QA', 'AE', 'KW']);
    });

    it('should switch selected Gulf country and update grade options accordingly', () => {
      component.selectGulfCountry('KW');
      expect(component.selectedGulfCountry()).toBe('KW');

      fixture.componentRef.setInput('selectedCurriculum', 'GULF');
      fixture.detectChanges();

      const options = component.gradeOptions();
      expect(options.length).toBe(12);
      expect(options[0].code).toBe('GRADE_12');
      expect(options[0].titleAr).toContain('الكويت');
    });

    it('should divide Gulf curriculum by stages for UAE (Cycles 1, 2, 3)', () => {
      component.selectModalGulfCountry('AE');
      const stages = component.getGulfStagesForModal();
      expect(stages.length).toBe(3);
      expect(stages[0].nameAr).toBe('الحلقة الثالثة');
      expect(stages[1].nameAr).toBe('الحلقة الثانية');
      expect(stages[2].nameAr).toBe('الحلقة الأولى');

      const gulfTrack = component.allCurriculaTracks().find((t) => t.code === 'GULF');
      expect(gulfTrack).toBeDefined();
      if (gulfTrack) {
        const cycle3Grades = component.getGradesForGulfStage(stages[0], gulfTrack);
        expect(cycle3Grades.map((g) => g.code)).toEqual(['GRADE_12', 'GRADE_11', 'GRADE_10', 'GRADE_9']);
      }
    });

    it('should divide Gulf curriculum by stages for Kuwait (Secondary, Intermediate, Primary 1-5)', () => {
      component.selectModalGulfCountry('KW');
      const stages = component.getGulfStagesForModal();
      expect(stages.length).toBe(3);
      expect(stages[0].nameAr).toBe('المرحلة الثانوية');
      expect(stages[1].nameAr).toBe('المرحلة المتوسطة');
      expect(stages[2].nameAr).toBe('المرحلة الابتدائية');

      const gulfTrack = component.allCurriculaTracks().find((t) => t.code === 'GULF');
      expect(gulfTrack).toBeDefined();
      if (gulfTrack) {
        const kwPriGrades = component.getGradesForGulfStage(stages[2], gulfTrack);
        expect(kwPriGrades.map((g) => g.code)).toEqual(['GRADE_5', 'GRADE_4', 'GRADE_3', 'GRADE_2', 'GRADE_1']);
      }
    });
  });

  describe('Descending Sorting (Secondary -> Prep -> Primary)', () => {
    it('should sort Egyptian grades descending (SEC_3 down to PRI_1)', () => {
      const egyptianTrack = component.allCurriculaTracks().find((t) => t.code === 'EGYPTIAN');
      expect(egyptianTrack).toBeDefined();
      if (egyptianTrack) {
        const codes = egyptianTrack.grades.map((g) => g.code);
        expect(codes[0]).toBe('SEC_3');
        expect(codes[codes.length - 1]).toBe('PRI_1');
      }
    });
  });

  describe('Add/Edit Grade Modal & Student Display Name Customization', () => {
    it('should open add grade modal prefilling canonical details and allowing student display name customization', () => {
      component.openAddGrade('EGYPTIAN');
      const gm = component.gradeModal();
      expect(gm.isOpen).toBeTrue();
      expect(gm.mode).toBe('add');
      expect(gm.trackCode).toBe('EGYPTIAN');
      expect(gm.titleAr).toBeTruthy();

      // Customizing student display name and new grade code in add mode
      component.gradeModal.update((s) => ({
        ...s,
        code: 'SEC_NEW_TEST',
        titleAr: 'تالتة ثانوي رياضيات متقدمة',
        titleEn: 'Grade 12 Advanced Math'
      }));

      // When saved, should add the customized grade
      component.saveGradeModal();
      const track = component.allCurriculaTracks().find((t) => t.code === 'EGYPTIAN');
      const added = track?.grades.find((g) => g.code === 'SEC_NEW_TEST');
      expect(added).toBeDefined();
      expect(added?.titleAr).toBe('تالتة ثانوي رياضيات متقدمة');
      expect(component.gradeModal().isOpen).toBeFalse();
    });

    it('should allow editing student display name for existing grade', () => {
      const egyptianTrack = component.allCurriculaTracks().find((t) => t.code === 'EGYPTIAN');
      expect(egyptianTrack).toBeDefined();
      const firstGrade = egyptianTrack!.grades[0];

      component.openEditGrade('EGYPTIAN', firstGrade);
      expect(component.gradeModal().isOpen).toBeTrue();
      expect(component.gradeModal().mode).toBe('edit');

      component.gradeModal.update((s) => ({
        ...s,
        titleAr: 'الثالث الثانوي العام المطور',
        titleEn: 'Grade 12 Advanced Elite'
      }));

      component.saveGradeModal();
      expect(component.gradeModal().isOpen).toBeFalse();

      const updatedTrack = component.allCurriculaTracks().find((t) => t.code === 'EGYPTIAN');
      const edited = updatedTrack?.grades.find((g) => g.code === firstGrade.code);
      expect(edited?.titleAr).toBe('الثالث الثانوي العام المطور');
      expect(edited?.titleEn).toBe('Grade 12 Advanced Elite');
    });

    it('should update modal canonical grades when changing Gulf country in Add Grade modal', () => {
      component.openAddGrade('GULF');
      component.onModalAddGradeCountryChange('QA');
      expect(component.modalAddGradeCountry()).toBe('QA');
      const canonGrades = component.canonicalGradesForModal();
      expect(canonGrades.length).toBe(12);
      expect(canonGrades[0].titleAr).toContain('قطر');
    });

    it('should update student display name cleanly when adding an existing canonical grade without duplicate error', () => {
      // In default state, SEC_3 already exists in EGYPTIAN track
      component.openAddGrade('EGYPTIAN');
      component.onModalGradeChange('SEC_3');
      component.gradeModal.update((s) => ({
        ...s,
        titleAr: 'الصف الثالث الثانوي — دفعة التحدي 2027',
        titleEn: '3rd Secondary — Challenge Batch 2027'
      }));

      component.saveGradeModal();
      expect(component.gradeModal().isOpen).toBeFalse();

      const track = component.allCurriculaTracks().find((t) => t.code === 'EGYPTIAN');
      const updated = track?.grades.find((g) => g.code === 'SEC_3');
      expect(updated).toBeDefined();
      expect(updated?.titleAr).toBe('الصف الثالث الثانوي — دفعة التحدي 2027');
      expect(updated?.titleEn).toBe('3rd Secondary — Challenge Batch 2027');
    });

    it('should preserve custom edited title in GULF curriculum and not override with canonical country title', () => {
      component.openAddGrade('GULF');
      component.onModalAddGradeCountryChange('AE');
      component.onModalGradeChange('GRADE_12');
      component.gradeModal.update((s) => ({
        ...s,
        titleAr: 'رياضيات 12 متقدم - منهاج الإمارات',
        titleEn: 'Grade 12 Advanced Math - UAE'
      }));

      component.saveGradeModal();

      const gulfTrack = component.allCurriculaTracks().find((t) => t.code === 'GULF');
      expect(gulfTrack).toBeDefined();

      component.selectModalGulfCountry('AE');
      const displayed = component.getDisplayedGradesForTrack(gulfTrack!);
      const grade12 = displayed.find((g) => g.code === 'GRADE_12');
      expect(grade12).toBeDefined();
      expect(grade12?.titleAr).toBe('رياضيات 12 متقدم - منهاج الإمارات');
      expect(grade12?.titleEn).toBe('Grade 12 Advanced Math - UAE');
    });

    it('should support selecting custom grade code via __CUSTOM__ in Add mode', () => {
      component.openAddGrade('GULF');
      component.onModalGradeChange('__CUSTOM__');
      expect(component.gradeModal().selectedCanonicalCode).toBe('__CUSTOM__');

      component.onCustomGradeCodeChange('GRADE_SAT_GULF');
      expect(component.gradeModal().code).toBe('GRADE_SAT_GULF');

      component.gradeModal.update((s) => ({
        ...s,
        titleAr: 'سات خليجي تمهيدي',
        titleEn: 'SAT Gulf Prep'
      }));

      component.saveGradeModal();
      const gulfTrack = component.allCurriculaTracks().find((t) => t.code === 'GULF');
      const added = gulfTrack?.grades.find((g) => g.code === 'GRADE_SAT_GULF');
      expect(added).toBeDefined();
      expect(added?.titleAr).toBe('سات خليجي تمهيدي');
    });

    it('should sync modalGulfCountry with selectedGulfCountry when opening grades modal', () => {
      component.selectGulfCountry('KW');
      component.openGradesModal();
      expect(component.isGradesModalOpen()).toBeTrue();
      expect(component.modalGulfCountry()).toBe('KW');
    });
  });
});
