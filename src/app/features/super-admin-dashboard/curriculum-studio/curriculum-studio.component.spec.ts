import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CurriculumStudioComponent } from './curriculum-studio.component';
import { AssessmentAdminItem, UnitPackageAdminItem } from './curriculum-studio.models';
import { AiExtractionSessionService } from '../../../core/offline-db/ai-extraction-session.service';

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

  describe('International Curriculum 2-Division Hierarchy & Dynamic Title Editing', () => {
    it('should initialize modalIntlDivision to AMERICAN_CURRICULUM and allow switching', () => {
      expect(component.modalIntlDivision()).toBe('AMERICAN_CURRICULUM');
      component.selectModalIntlDivision('BRITISH_CURRICULUM');
      expect(component.modalIntlDivision()).toBe('BRITISH_CURRICULUM');
    });

    it('should return 2 divisions for INTERNATIONAL track', () => {
      const intlTrack = component.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL');
      expect(intlTrack).toBeDefined();

      const divs = component.getIntlDivisionsForModal(intlTrack!);
      expect(divs.length).toBe(2);
      expect(divs[0].code).toBe('AMERICAN_CURRICULUM');
      expect(divs[1].code).toBe('BRITISH_CURRICULUM');
    });

    it('should return correct stages for American and British divisions', () => {
      const intlTrack = component.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL')!;

      component.selectModalIntlDivision('AMERICAN_CURRICULUM');
      const americanStages = component.getStagesForModalIntlDivision(intlTrack);
      expect(americanStages.length).toBe(3);
      expect(americanStages.map((s) => s.code)).toEqual([
        'ELEMENTARY_SCHOOL',
        'MIDDLE_SCHOOL',
        'HIGH_SCHOOL'
      ]);

      component.selectModalIntlDivision('BRITISH_CURRICULUM');
      const britishStages = component.getStagesForModalIntlDivision(intlTrack);
      expect(britishStages.length).toBe(5);
      expect(britishStages.map((s) => s.code)).toEqual([
        'PRIMARY_KS1',
        'PRIMARY_KS2',
        'SECONDARY_KS3',
        'KS4_IGCSE',
        'SIXTH_FORM_ALEVEL'
      ]);
    });

    it('should return correct grades for each stage in American curriculum', () => {
      const intlTrack = component.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL')!;
      component.selectModalIntlDivision('AMERICAN_CURRICULUM');

      const stages = component.getStagesForModalIntlDivision(intlTrack);
      const elementary = stages.find((s) => s.code === 'ELEMENTARY_SCHOOL')!;
      const elemGrades = component.getGradesForIntlStage(elementary, intlTrack);
      expect(elemGrades.map((g) => g.code)).toEqual([
        'US_GRADE_1', 'US_GRADE_2', 'US_GRADE_3', 'US_GRADE_4', 'US_GRADE_5'
      ]);

      const middle = stages.find((s) => s.code === 'MIDDLE_SCHOOL')!;
      const midGrades = component.getGradesForIntlStage(middle, intlTrack);
      expect(midGrades.map((g) => g.code)).toEqual([
        'US_GRADE_6', 'US_GRADE_7', 'US_GRADE_8'
      ]);

      const high = stages.find((s) => s.code === 'HIGH_SCHOOL')!;
      const highGrades = component.getGradesForIntlStage(high, intlTrack);
      expect(highGrades.map((g) => g.code)).toEqual([
        'US_GRADE_9', 'US_GRADE_10', 'US_GRADE_11', 'US_GRADE_12'
      ]);
    });

    it('should return correct grades for each stage in British curriculum', () => {
      const intlTrack = component.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL')!;
      component.selectModalIntlDivision('BRITISH_CURRICULUM');

      const stages = component.getStagesForModalIntlDivision(intlTrack);
      const ks1 = stages.find((s) => s.code === 'PRIMARY_KS1')!;
      const ks1Grades = component.getGradesForIntlStage(ks1, intlTrack);
      expect(ks1Grades.map((g) => g.code)).toEqual(['IGCSE_YEAR_1', 'IGCSE_YEAR_2']);

      const ks2 = stages.find((s) => s.code === 'PRIMARY_KS2')!;
      const ks2Grades = component.getGradesForIntlStage(ks2, intlTrack);
      expect(ks2Grades.map((g) => g.code)).toEqual([
        'IGCSE_YEAR_3', 'IGCSE_YEAR_4', 'IGCSE_YEAR_5', 'IGCSE_YEAR_6'
      ]);

      const ks3 = stages.find((s) => s.code === 'SECONDARY_KS3')!;
      const ks3Grades = component.getGradesForIntlStage(ks3, intlTrack);
      expect(ks3Grades.map((g) => g.code)).toEqual([
        'IGCSE_YEAR_7', 'IGCSE_YEAR_8', 'IGCSE_YEAR_9'
      ]);

      const ks4 = stages.find((s) => s.code === 'KS4_IGCSE')!;
      const ks4Grades = component.getGradesForIntlStage(ks4, intlTrack);
      expect(ks4Grades.map((g) => g.code)).toEqual([
        'IGCSE_YEAR_10', 'IGCSE_YEAR_11', 'IGCSE_OL'
      ]);

      const sixth = stages.find((s) => s.code === 'SIXTH_FORM_ALEVEL')!;
      const sixthGrades = component.getGradesForIntlStage(sixth, intlTrack);
      expect(sixthGrades.map((g) => g.code)).toEqual([
        'IGCSE_YEAR_12', 'IGCSE_YEAR_13', 'IGCSE_AS', 'IGCSE_AL'
      ]);
    });

    it('should handle custom grades in getOtherIntlGrades', () => {
      const intlTrack = component.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL')!;
      expect(component.getOtherIntlGrades(intlTrack).length).toBe(0);

      // Add a custom grade
      const updatedTrack = {
        ...intlTrack,
        grades: [...intlTrack.grades, { code: 'CUSTOM_INTL_AP', titleAr: 'AP كيمياء', titleEn: 'AP Chemistry', isCustom: true }]
      };
      const other = component.getOtherIntlGrades(updatedTrack);
      expect(other.length).toBe(1);
      expect(other[0].code).toBe('CUSTOM_INTL_AP');
    });

    it('should filter custom Gulf grades by countryCode in getOtherGulfGrades', () => {
      const gulfTrack = component.allCurriculaTracks().find((t) => t.code === 'GULF')!;
      component.modalGulfCountry.set('SA');

      const updatedTrack = {
        ...gulfTrack,
        grades: [
          ...gulfTrack.grades,
          { code: 'CUSTOM_SA_QUDURAT', titleAr: 'قدرات', titleEn: 'Abilities', isCustom: true, countryCode: 'SA' },
          { code: 'CUSTOM_KW_OTHER', titleAr: 'مادة كويتية', titleEn: 'Kuwait Subject', isCustom: true, countryCode: 'KW' }
        ]
      };

      const saOther = component.getOtherGulfGrades(updatedTrack);
      expect(saOther.some((g) => g.code === 'CUSTOM_SA_QUDURAT')).toBeTrue();
      expect(saOther.some((g) => g.code === 'CUSTOM_KW_OTHER')).toBeFalse();

      // Switch modal to Kuwait - SA grade should not appear
      component.modalGulfCountry.set('KW');
      const kwOther = component.getOtherGulfGrades(updatedTrack);
      expect(kwOther.some((g) => g.code === 'CUSTOM_SA_QUDURAT')).toBeFalse();
      expect(kwOther.some((g) => g.code === 'CUSTOM_KW_OTHER')).toBeTrue();
    });

    it('should support dynamic title editing for Track name', () => {
      component.openEditTrackName('INTERNATIONAL');
      expect(component.titleEditModal().isOpen).toBeTrue();
      expect(component.titleEditModal().type).toBe('track');
      expect(component.titleEditModal().trackCode).toBe('INTERNATIONAL');

      component.titleEditModal.update((s) => ({
        ...s,
        titleAr: 'المناهج الدولية واللغات',
        titleEn: 'International & Language Curricula'
      }));

      component.saveTitleEditModal();
      const track = component.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL');
      expect(track?.nameAr).toBe('المناهج الدولية واللغات');
      expect(track?.nameEn).toBe('International & Language Curricula');
      expect(component.titleEditModal().isOpen).toBeFalse();
    });

    it('should support dynamic title editing for Division name', () => {
      component.openEditDivisionName('INTERNATIONAL', 'AMERICAN_CURRICULUM');
      expect(component.titleEditModal().isOpen).toBeTrue();
      expect(component.titleEditModal().type).toBe('division');
      expect(component.titleEditModal().divisionCode).toBe('AMERICAN_CURRICULUM');

      component.titleEditModal.update((s) => ({
        ...s,
        titleAr: 'النظام الأمريكي المعتمد',
        titleEn: 'Accredited American System'
      }));

      component.saveTitleEditModal();
      const track = component.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL')!;
      const divs = component.getIntlDivisionsForModal(track);
      const americanDiv = divs.find((d) => d.code === 'AMERICAN_CURRICULUM');
      expect(americanDiv?.nameAr).toBe('النظام الأمريكي المعتمد');
      expect(americanDiv?.nameEn).toBe('Accredited American System');
    });

    it('should support dynamic title editing for Stage name', () => {
      component.openEditStageName('INTERNATIONAL', 'AMERICAN_CURRICULUM', 'ELEMENTARY_SCHOOL');
      expect(component.titleEditModal().isOpen).toBeTrue();
      expect(component.titleEditModal().type).toBe('stage');
      expect(component.titleEditModal().stageCode).toBe('ELEMENTARY_SCHOOL');

      component.titleEditModal.update((s) => ({
        ...s,
        titleAr: 'المرحلة الابتدائية التأسيسية',
        titleEn: 'Foundational Elementary Stage'
      }));

      component.saveTitleEditModal();
      const track = component.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL')!;
      const divs = component.getIntlDivisionsForModal(track);
      const americanDiv = divs.find((d) => d.code === 'AMERICAN_CURRICULUM');
      const stage = americanDiv?.stages?.find((s) => s.code === 'ELEMENTARY_SCHOOL');
      expect(stage?.nameAr).toBe('المرحلة الابتدائية التأسيسية');
      expect(stage?.nameEn).toBe('Foundational Elementary Stage');
    });

    it('should reject empty titleAr in saveTitleEditModal', () => {
      spyOn(component.toastTriggered, 'emit');
      component.openEditTrackName('INTERNATIONAL');
      component.titleEditModal.update((s) => ({ ...s, titleAr: '   ' }));
      component.saveTitleEditModal();

      expect(component.toastTriggered.emit).toHaveBeenCalledWith({
        text: 'يرجى إدخال الاسم بالعربية',
        type: 'error'
      });
      expect(component.titleEditModal().isOpen).toBeTrue();
    });

    it('should return dynamic track name and handle graduation-cap and division icon fallbacks', () => {
      expect(component.getCurriculumTrackName('INTERNATIONAL')).toBe('المناهج الدولية');
      expect(component.getDivisionIcon('graduation-cap')).toBe('graduation-cap');
      expect(component.getDivisionIcon(undefined, 'BRITISH_CURRICULUM')).toBe('graduation-cap');
      expect(component.getDivisionIcon(undefined, 'AMERICAN_CURRICULUM')).toBe('award');
    });

    it('should return filter divisions and stage grades for curriculum studio grade dropdown', () => {
      const divs = component.getIntlDivisionsForFilter();
      expect(divs.length).toBe(2);

      const grades = component.getGradesForIntlStageInFilter('AMERICAN_CURRICULUM', 'ELEMENTARY_SCHOOL');
      expect(grades.map((g) => g.code)).toEqual([
        'US_GRADE_1', 'US_GRADE_2', 'US_GRADE_3', 'US_GRADE_4', 'US_GRADE_5'
      ]);
    });

    it('should warn if neither video nor file is provided when saving lecture', () => {
      spyOn(component.toastTriggered, 'emit');
      const unit = {
        id: '6735e5d32b5f63901b0f1a91',
        titleAr: 'الوحدة 1',
        titleEn: 'Unit 1',
        curriculum: 'EGYPTIAN' as any,
        gradeLevel: 'SEC_3',
        term: 'TERM_1' as any,
        type: 'STUDY_UNIT' as any,
        isPublished: true,
        priceEgp: 300,
        lectures: [],
        assessments: []
      };
      component.openLectureModal(unit);
      component.lectureForm.update((f) => ({
        ...f,
        titleAr: 'درس بدون فيديو أو ملف',
        youtubeUrl: '',
        googleDrivePdfFileId: '',
        xpReward: 10
      }));

      component.saveLecture();

      expect(component.toastTriggered.emit).toHaveBeenCalledWith({
        text: 'أدخل رابط فيديو أو ملف PDF على الأقل',
        type: 'warning'
      });
    });

    it('should require confirmation before deleting a lecture', () => {
      const unit: any = {
        id: 'unit-123',
        titleAr: 'وحدة تجريبية',
        titleEn: 'Test Unit',
        curriculum: 'EGYPTIAN',
        gradeLevel: 'SEC_1',
        term: 'TERM_1',
        type: 'STUDY_UNIT',
        isPublished: true,
        priceEgp: 200,
        lectures: [
          {
            id: 'lec-456',
            order: 2,
            titleAr: 'محاضرة الجبر وحساب المثلثات',
            titleEn: 'Algebra Lecture',
            xpReward: 10,
            isFree: false,
            isPrintAllowed: true
          }
        ],
        assessments: []
      };

      spyOn(component, 'openConfirm').and.callThrough();
      const http = (component as any).http;
      spyOn(http, 'delete').and.returnValue({
        subscribe: (callbacks: any) => {
          callbacks.next?.();
        }
      });

      component.deleteLecture(unit, 'lec-456');

      expect(component.openConfirm).toHaveBeenCalled();
      expect(component.confirmDialog().isOpen).toBeTrue();
      expect(component.confirmDialog().title).toBe('حذف المحاضرة');
      expect(component.confirmDialog().message).toContain('محاضرة الجبر وحساب المثلثات');

      // Now simulate user confirming deletion
      component.proceedConfirm();

      expect(http.delete).toHaveBeenCalledWith('/api/v1/admin/lectures/lec-456');
    });

    it('should require confirmation before deleting an assessment', () => {
      const unit: any = {
        id: 'unit-123',
        titleAr: 'وحدة تجريبية',
        titleEn: 'Test Unit',
        curriculum: 'EGYPTIAN',
        gradeLevel: 'SEC_1',
        term: 'TERM_1',
        type: 'STUDY_UNIT',
        isPublished: true,
        priceEgp: 200,
        lectures: [],
        assessments: [
          {
            id: 'asm-789',
            titleAr: 'امتحان منتصف الفصل',
            titleEn: 'Midterm Exam',
            type: 'COMPREHENSIVE_EXAM',
            questions: [],
            submissionsCount: 0,
            calculatorType: 'DESMOS'
          }
        ]
      };

      spyOn(component, 'openConfirm').and.callThrough();
      const http = (component as any).http;
      spyOn(http, 'delete').and.returnValue({
        subscribe: (callbacks: any) => {
          callbacks.next?.();
        }
      });

      component.deleteAssessment(unit, 'asm-789');

      expect(component.openConfirm).toHaveBeenCalled();
      expect(component.confirmDialog().isOpen).toBeTrue();
      expect(component.confirmDialog().title).toBe('حذف التقييم');
      expect(component.confirmDialog().message).toContain('امتحان منتصف الفصل');

      // Now simulate user confirming deletion
      component.proceedConfirm();

      expect(http.delete).toHaveBeenCalledWith('/api/v1/admin/assessments/asm-789');
    });
  });

  describe('Units, Lectures, and Grades Reordering Suite', () => {
    it('should reorder units up and down sequentially', () => {
      const units: any[] = [
        { id: 'u1', titleAr: 'الوحدة الأولى', order: 1, lectures: [], assessments: [] },
        { id: 'u2', titleAr: 'الوحدة الثانية', order: 2, lectures: [], assessments: [] },
        { id: 'u3', titleAr: 'الوحدة الثالثة', order: 3, lectures: [], assessments: [] }
      ];
      fixture.componentRef.setInput('units', units);
      fixture.detectChanges();

      spyOn(component.unitsReordered, 'emit');
      const http = (component as any).http;
      spyOn(http, 'put').and.returnValue({
        subscribe: (callbacks: any) => callbacks.next?.({ success: true })
      });

      // Move u2 up (index 1 -> index 0)
      component.moveUnitUp(1);
      expect(component.unitsReordered.emit).toHaveBeenCalledWith([
        jasmine.objectContaining({ id: 'u2', order: 1 }),
        jasmine.objectContaining({ id: 'u1', order: 2 }),
        jasmine.objectContaining({ id: 'u3', order: 3 })
      ]);
      expect(http.put).toHaveBeenCalledWith(
        '/api/v1/admin/curriculum-units/reorder',
        jasmine.objectContaining({ unitIds: ['u2', 'u1', 'u3'] })
      );

      // Move top unit up should do nothing
      (component.unitsReordered.emit as jasmine.Spy).calls.reset();
      component.moveUnitUp(0);
      expect(component.unitsReordered.emit).not.toHaveBeenCalled();

      // Move bottom unit down should do nothing
      component.moveUnitDown(2);
      expect(component.unitsReordered.emit).not.toHaveBeenCalled();
    });

    it('should reorder lectures inside a unit up and down', () => {
      const unit: any = {
        id: 'u1',
        titleAr: 'الوحدة الأولى',
        lectures: [
          { id: 'l1', titleAr: 'محاضرة 1', order: 1 },
          { id: 'l2', titleAr: 'محاضرة 2', order: 2 }
        ],
        assessments: []
      };

      spyOn(component.unitUpdated, 'emit');
      const http = (component as any).http;
      spyOn(http, 'put').and.returnValue({
        subscribe: (callbacks: any) => callbacks.next?.({ success: true })
      });

      // Move l2 up (index 1 -> index 0)
      component.moveLectureUp(unit, 1);
      expect(component.unitUpdated.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          id: 'u1',
          lectures: [
            jasmine.objectContaining({ id: 'l2', order: 1 }),
            jasmine.objectContaining({ id: 'l1', order: 2 })
          ]
        })
      );
      expect(http.put).toHaveBeenCalledWith(
        '/api/v1/admin/lectures/reorder',
        jasmine.objectContaining({
          unitId: 'u1',
          lectureIds: ['l2', 'l1']
        })
      );
    });

    it('should reorder grades inside a curriculum track', () => {
      const track = component.allCurriculaTracks().find((t) => t.code === 'EGYPTIAN');
      expect(track).toBeDefined();

      const initialFirst = track!.grades[0].code;
      const initialSecond = track!.grades[1].code;

      const http = (component as any).http;
      spyOn(http, 'put').and.returnValue({
        subscribe: (callbacks: any) => callbacks.next?.({ success: true })
      });

      // Move second grade up to first
      component.moveGradeUp('EGYPTIAN', initialSecond);

      const updatedTrack = component.allCurriculaTracks().find((t) => t.code === 'EGYPTIAN');
      expect(updatedTrack!.grades[0].code).toBe(initialSecond);
      expect(updatedTrack!.grades[0].order).toBe(1);
      expect(updatedTrack!.grades[1].code).toBe(initialFirst);
      expect(updatedTrack!.grades[1].order).toBe(2);
      expect(http.put).toHaveBeenCalledWith(
        '/api/v1/admin/cms-config/active-grades',
        jasmine.any(Object)
      );
    });

    it('should reorder international stages inside division', () => {
      const track = component.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL');
      expect(track).toBeDefined();

      const divs = component.getIntlDivisionsForModal(track!);
      const americanDiv = divs.find((d) => d.code === 'AMERICAN_CURRICULUM');
      expect(americanDiv).toBeDefined();
      expect(americanDiv!.stages!.length).toBeGreaterThan(1);

      const initialStage0 = americanDiv!.stages![0].code;
      const initialStage1 = americanDiv!.stages![1].code;

      const http = (component as any).http;
      spyOn(http, 'put').and.returnValue({
        subscribe: (callbacks: any) => callbacks.next?.({ success: true })
      });

      component.moveStageUp('INTERNATIONAL', 'AMERICAN_CURRICULUM', initialStage1);

      const updatedTrack = component.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL');
      const updatedDivs = component.getIntlDivisionsForModal(updatedTrack!);
      const updatedAmDiv = updatedDivs.find((d) => d.code === 'AMERICAN_CURRICULUM');
      expect(updatedAmDiv!.stages![0].code).toBe(initialStage1);
      expect(updatedAmDiv!.stages![1].code).toBe(initialStage0);
    });

    it('should reorder gulf stages and preserve order property', () => {
      const track = component.allCurriculaTracks().find((t) => t.code === 'GULF');
      expect(track).toBeDefined();

      const stages = component.getGulfStagesForModal(track!);
      expect(stages.length).toBeGreaterThan(1);
      const stage0 = stages[0].code;
      const stage1 = stages[1].code;

      const http = (component as any).http;
      spyOn(http, 'put').and.returnValue({
        subscribe: (callbacks: any) => callbacks.next?.({ success: true })
      });

      component.moveGulfStageUp('GULF', 'SA', stage1);

      const updatedTrack = component.allCurriculaTracks().find((t) => t.code === 'GULF');
      const updatedStages = component.getGulfStagesForModal(updatedTrack!);
      expect(updatedStages[0].code).toBe(stage1);
      expect(updatedStages[0].order).toBe(1);
      expect(updatedStages[1].code).toBe(stage0);
      expect(updatedStages[1].order).toBe(2);
    });

    it('should retain order in getDisplayedGradesForTrack and getOverviewGradesForTrack for GULF', () => {
      const track = component.allCurriculaTracks().find((t) => t.code === 'GULF');
      expect(track).toBeDefined();

      // Assign custom order to first 2 grades
      const modifiedGrades = track!.grades.map((g, idx) => ({ ...g, order: idx + 1 }));
      component.allCurriculaTracks.update((tracks) =>
        tracks.map((t) => (t.code === 'GULF' ? { ...t, grades: modifiedGrades } : t))
      );

      const updatedTrack = component.allCurriculaTracks().find((t) => t.code === 'GULF')!;
      const displayed = component.getDisplayedGradesForTrack(updatedTrack);
      expect(displayed.length).toBeGreaterThan(0);
      expect(displayed[0].order).toBe(1);

      const overview = component.getOverviewGradesForTrack(updatedTrack);
      expect(overview.length).toBeGreaterThan(0);
      expect(overview[0].order).toBe(1);
    });

    it('should manage independent collapsible track lists for Active Grades Overview', () => {
      expect(component.isOverviewTrackExpanded('EGYPTIAN')).toBeFalse();
      expect(component.isOverviewTrackExpanded('GULF')).toBeFalse();

      component.toggleOverviewTrack('EGYPTIAN');
      expect(component.isOverviewTrackExpanded('EGYPTIAN')).toBeTrue();
      expect(component.isOverviewTrackExpanded('GULF')).toBeFalse();

      component.toggleOverviewTrack('GULF');
      expect(component.isOverviewTrackExpanded('EGYPTIAN')).toBeTrue();
      expect(component.isOverviewTrackExpanded('GULF')).toBeTrue();

      component.toggleOverviewTrack('EGYPTIAN');
      expect(component.isOverviewTrackExpanded('EGYPTIAN')).toBeFalse();
      expect(component.isOverviewTrackExpanded('GULF')).toBeTrue();

      component.activeGrades.set(['SEC_1', 'SEC_3']);
      const sampleGrades = [
        { code: 'SEC_1', titleAr: 'أولى ثانوي', titleEn: 'Grade 10' },
        { code: 'SEC_2', titleAr: 'ثانية ثانوي', titleEn: 'Grade 11' },
        { code: 'SEC_3', titleAr: 'ثالثة ثانوي', titleEn: 'Grade 12' }
      ];
      expect(component.getActiveGradesCountForList(sampleGrades)).toBe(2);
    });

    it('should not auto-open math keyboard on input focus, dismiss it on modal close/cancel, and normalize LaTeX visually', () => {
      component.openAssessmentEditor({
        id: 'asm_kb_test',
        unitId: 'unit_1',
        lectureId: null,
        titleAr: 'اختبار الكيبورد الرياضي',
        type: 'QUIZ',
        calculatorType: 'NONE',
        durationMinutes: 20,
        xpReward: 10,
        referenceSheetUrl: null,
        requiresTeacherReview: false,
        submissionsCount: 0,
        questions: [
          {
            id: 'q_latex_1',
            order: 1,
            type: 'MCQ',
            textAr: '$\\frac{3}{5} + \\sqrt{16} + x^{4}$',
            options: ['$x^{2}$', '$\\frac{1}{2}$', '$\\lim_{x \\to 0} x$', '$\\text{سم}$'],
            correctOptionIndex: 0,
            points: 5
          }
        ]
      });
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const textarea = hostEl.querySelector('#curriculumQuestionComposer textarea') as HTMLTextAreaElement;
      expect(textarea).toBeTruthy();

      // Focusing textarea sets target WITHOUT auto-opening keyboard
      textarea.dispatchEvent(new FocusEvent('focus'));
      fixture.detectChanges();
      expect(component.mathKeyboardTarget()).toBe(textarea);
      expect(component.isMathKeyboardOpen()).toBeFalse();

      // Focusing MCQ option sets target WITHOUT auto-opening keyboard
      const mcqInput = hostEl.querySelector('#curriculumQuestionComposer input[data-opt-index="0"]') as HTMLInputElement;
      expect(mcqInput).toBeTruthy();
      mcqInput.dispatchEvent(new FocusEvent('focus'));
      fixture.detectChanges();
      expect(component.mathKeyboardTarget()).toBe(mcqInput);
      expect(component.isMathKeyboardOpen()).toBeFalse();

      // Explicitly opening keyboard opens it
      component.openMathKeyboard(textarea);
      fixture.detectChanges();
      expect(component.isMathKeyboardOpen()).toBeTrue();
      expect(hostEl.querySelector('app-math-virtual-keyboard aside')).toBeTruthy();

      // Editing LaTeX question normalizes everything cleanly for non-LaTeX teachers
      const existingQ = component.activeAssessment()!.questions[0];
      component.editQuestion(existingQ);
      fixture.detectChanges();
      expect(component.newQuestionTextAr()).toBe('(3/5) + √16 + x⁴');
      expect(component.newQuestionOptions()[1]).toBe('½');
      expect(component.newQuestionOptions()[2]).toBe('lim(x→0) x');
      expect(component.newQuestionOptions()[3]).toBe('سم');
      expect(textarea.value).not.toContain('$');
      expect(textarea.value).not.toContain('\\frac');

      // Cancelling edit closes keyboard cleanly
      component.cancelQuestionEdit();
      fixture.detectChanges();
      expect(component.isMathKeyboardOpen()).toBeFalse();
      expect(component.mathKeyboardTarget()).toBeNull();

      // Closing assessment editor always dismisses and unmounts math keyboard
      component.openMathKeyboard(textarea);
      fixture.detectChanges();
      expect(component.isMathKeyboardOpen()).toBeTrue();

      component.closeAssessmentEditor();
      fixture.detectChanges();
      expect(component.isAssessmentEditorOpen()).toBeFalse();
      expect(component.isMathKeyboardOpen()).toBeFalse();
      expect(component.mathKeyboardTarget()).toBeNull();
      expect(hostEl.querySelector('app-math-virtual-keyboard')).toBeNull();
    });

    it('should remove duplicate question options button, remove math preview bar, and render thicker grade borders', () => {
      component.toggleOverviewTrack('EGYPTIAN');
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const gradeRows = hostEl.querySelectorAll('.border-\\[2\\.5px\\]');
      expect(gradeRows.length).toBeGreaterThan(0);

      component.openAssessmentEditor({
        id: 'asm_clean_ui_test',
        unitId: 'unit_1',
        lectureId: null,
        titleAr: 'اختبار واجهة المحرر',
        type: 'QUIZ',
        calculatorType: 'NONE',
        durationMinutes: 15,
        xpReward: 10,
        referenceSheetUrl: null,
        requiresTeacherReview: false,
        submissionsCount: 0,
        questions: []
      });
      component.newQuestionTextAr.set('sin(30°)');
      fixture.detectChanges();

      const composerEl = hostEl.querySelector('#curriculumQuestionComposer') as HTMLElement;
      expect(composerEl).toBeTruthy();
      expect(composerEl.textContent).not.toContain('خيارات نوع السؤال');
      expect(composerEl.textContent).not.toContain('Question Options');
      expect(composerEl.textContent).not.toContain('معاينة:');
      expect(composerEl.querySelector('app-math-formula')).toBeNull();
      expect(composerEl.querySelector('select')).toBeTruthy();
    });
  });

  describe('Two-Module Assessment System in Curriculum Studio (Quizzes & Comprehensive Exams)', () => {
    let httpTestingController: HttpTestingController;

    const mockUnit: UnitPackageAdminItem = {
      id: '65f1a2b3c4d5e6f7a8b9c0d1',
      titleAr: 'الوحدة الأولى',
      titleEn: 'Unit 1',
      curriculum: 'EGYPTIAN',
      gradeLevel: 'SEC_3',
      term: 'TERM_1',
      type: 'STUDY_UNIT',
      isPublished: true,
      priceEgp: 100,
      lectures: [],
      assessments: []
    };

    beforeEach(() => {
      httpTestingController = TestBed.inject(HttpTestingController);
      const reqs = httpTestingController.match('/api/v1/public/active-grades');
      reqs.forEach((r) => r.flush({ success: true, data: [] }));
    });

    afterEach(() => {
      httpTestingController.verify();
    });

    it('should initialize newAssessmentForm with two-module defaults', () => {
      component.openCreateAssessmentModal(mockUnit);
      const form = component.newAssessmentForm();
      expect(form.isMultiModule).toBeFalse();
      expect(form.module1TimeMinutes).toBe(35);
      expect(form.module2TimeMinutes).toBe(35);
    });

    it('should force isMultiModule to false when assessment type is set to HOMEWORK', () => {
      component.openCreateAssessmentModal(mockUnit);
      component.newAssessmentForm.update((f) => ({ ...f, isMultiModule: true }));
      expect(component.newAssessmentForm().isMultiModule).toBeTrue();

      component.setAssessmentType('HOMEWORK');
      expect(component.newAssessmentForm().type).toBe('HOMEWORK');
      expect(component.newAssessmentForm().isMultiModule).toBeFalse();
    });

    it('should calculate duration and send multi-module fields when creating QUIZ or COMPREHENSIVE_EXAM', () => {
      spyOn(component.unitUpdated, 'emit');
      component.openCreateAssessmentModal(mockUnit);
      component.newAssessmentForm.update((f) => ({
        ...f,
        type: 'COMPREHENSIVE_EXAM',
        titleAr: 'امتحان شامل تجريبي',
        xpReward: 10,
        isMultiModule: true,
        module1TimeMinutes: 35,
        module2TimeMinutes: 25,
        durationMinutes: 10
      }));

      component.saveNewAssessment();

      const req = httpTestingController.expectOne('/api/v1/admin/assessments');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.is_multi_module).toBeTrue();
      expect(req.request.body.module_1_time_minutes).toBe(35);
      expect(req.request.body.module_2_time_minutes).toBe(25);
      expect(req.request.body.duration_minutes).toBe(60);
      expect(req.request.body.time_limit_minutes).toBe(60);

      req.flush({
        success: true,
        data: {
          id: 'asm_multi_comp_1',
          unit_id: '65f1a2b3c4d5e6f7a8b9c0d1',
          title_ar: 'امتحان شامل تجريبي',
          assessment_type: 'COMPREHENSIVE_EXAM',
          is_multi_module: true,
          module_1_time_minutes: 35,
          module_2_time_minutes: 25,
          duration_minutes: 60,
          calculator_mode: 'NONE',
          questions: []
        }
      });

      expect(component.unitUpdated.emit).toHaveBeenCalledWith(jasmine.objectContaining({
        assessments: jasmine.arrayContaining([
          jasmine.objectContaining({
            id: 'asm_multi_comp_1',
            isMultiModule: true,
            module1TimeMinutes: 35,
            module2TimeMinutes: 25,
            durationMinutes: 60
          })
        ])
      }));
    });

    it('should assign moduleIndex 2 to question when composer selects Module 2', () => {
      const mockAsm: AssessmentAdminItem = {
        id: 'asm_test_editor',
        unitId: 'unit_1',
        lectureId: null,
        titleAr: 'كويز تفاعلي',
        type: 'QUIZ',
        calculatorType: 'NONE',
        durationMinutes: 70,
        isMultiModule: true,
        module1TimeMinutes: 35,
        module2TimeMinutes: 35,
        submissionsCount: 0,
        questions: []
      };

      component.openAssessmentEditor(mockAsm);
      expect(component.newQuestionModuleIndex()).toBe(1);
      expect(component.moduleFilterTab()).toBe('ALL');

      component.newQuestionModuleIndex.set(2);
      component.newQuestionTextAr.set('Calculate derivative of f(x) = x^2');
      component.newQuestionOptions.set(['2x', 'x', 'x^2', '2']);
      component.newQuestionCorrectIndex.set(0);

      component.addQuestionToAssessment();

      const patchReq = httpTestingController.expectOne('/api/v1/admin/assessments/asm_test_editor');
      expect(patchReq.request.method).toBe('PATCH');
      patchReq.flush({ success: true });

      const active = component.activeAssessment();
      expect(active?.questions.length).toBe(1);
      expect(active?.questions[0].moduleIndex).toBe(2);
      expect(component.module2QuestionsCount()).toBe(1);
      expect(component.module1QuestionsCount()).toBe(0);
    });

    it('should filter questions properly according to moduleFilterTab', () => {
      const mockAsm: AssessmentAdminItem = {
        id: 'asm_filter_test',
        unitId: 'unit_1',
        lectureId: null,
        titleAr: 'امتحان تجريبي',
        type: 'QUIZ',
        calculatorType: 'NONE',
        durationMinutes: 70,
        isMultiModule: true,
        module1TimeMinutes: 35,
        module2TimeMinutes: 35,
        submissionsCount: 0,
        questions: [
          {
            id: 'q1',
            order: 1,
            type: 'MCQ',
            textAr: 'سؤال موديول 1',
            options: ['A', 'B'],
            correctOptionIndex: 0,
            points: 5,
            moduleIndex: 1
          },
          {
            id: 'q2',
            order: 2,
            type: 'MCQ',
            textAr: 'سؤال موديول 2',
            options: ['C', 'D'],
            correctOptionIndex: 1,
            points: 5,
            moduleIndex: 2
          }
        ]
      };

      component.openAssessmentEditor(mockAsm);

      component.moduleFilterTab.set('ALL');
      expect(component.filteredQuestions().length).toBe(2);

      component.moduleFilterTab.set(1);
      expect(component.filteredQuestions().length).toBe(1);
      expect(component.filteredQuestions()[0].id).toBe('q1');

      component.moduleFilterTab.set(2);
      expect(component.filteredQuestions().length).toBe(1);
      expect(component.filteredQuestions()[0].id).toBe('q2');
    });

    it('should send multi-module attributes and per-question module_index on saveAssessmentSettings', () => {
      spyOn(component.assessmentSaved, 'emit');
      const mockAsm: AssessmentAdminItem = {
        id: 'asm_save_patch',
        unitId: 'unit_1',
        lectureId: null,
        titleAr: 'امتحان نهائي',
        type: 'COMPREHENSIVE_EXAM',
        calculatorType: 'DESMOS',
        durationMinutes: 60,
        isMultiModule: true,
        module1TimeMinutes: 35,
        module2TimeMinutes: 30,
        submissionsCount: 0,
        questions: [
          {
            id: 'q_mod1',
            order: 1,
            type: 'MCQ',
            textAr: 'Q1',
            options: ['1', '2'],
            correctOptionIndex: 0,
            points: 5,
            moduleIndex: 1
          },
          {
            id: 'q_mod2',
            order: 2,
            type: 'MCQ',
            textAr: 'Q2',
            options: ['3', '4'],
            correctOptionIndex: 1,
            points: 5,
            moduleIndex: 2
          }
        ]
      };

      component.openAssessmentEditor(mockAsm);
      component.saveAssessmentSettings();

      const req = httpTestingController.expectOne('/api/v1/admin/assessments/asm_save_patch');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body.is_multi_module).toBeTrue();
      expect(req.request.body.module_1_time_minutes).toBe(35);
      expect(req.request.body.module_2_time_minutes).toBe(30);
      expect(req.request.body.duration_minutes).toBe(65);
      expect(req.request.body.questions[0].module_index).toBe(1);
      expect(req.request.body.questions[1].module_index).toBe(2);

      req.flush({ success: true });

      expect(component.assessmentSaved.emit).toHaveBeenCalledWith(jasmine.objectContaining({
        id: 'asm_save_patch',
        isMultiModule: true,
        module1TimeMinutes: 35,
        module2TimeMinutes: 30,
        durationMinutes: 65
      }));
    });

    it('should auto-persist AI-extracted questions in CurriculumStudio and restore both questions and uploaded file on reopen after refresh', async () => {
      const sessionService = TestBed.inject(AiExtractionSessionService);
      spyOn(component.assessmentSaved, 'emit');

      const asmId = `asm_curr_persist_${Date.now()}`;
      const mockAsm: AssessmentAdminItem = {
        id: asmId,
        unitId: 'unit_1',
        lectureId: null,
        titleAr: 'كويز استخراج وحفظ',
        type: 'QUIZ',
        calculatorType: 'NONE',
        durationMinutes: 20,
        submissionsCount: 0,
        questions: []
      };

      await sessionService.saveSession({
        assessmentId: asmId,
        fileName: 'curriculum_file.pdf',
        fileType: 'pdf',
        fileBlob: new Blob(['%PDF-1.4 unit'], { type: 'application/pdf' }),
        uploadedImages: [],
        pageNumber: 12,
        totalPages: 30,
        currentDataUrl: 'data:image/webp;base64,p12',
        pageScopeMode: 'CURRENT_PAGE',
        extractionMode: 'SMART_HYBRID',
        stagedQuestions: [],
        currentStep: 'PREVIEW_AND_PAGE',
        updatedAt: Date.now()
      });

      component.openAssessmentEditor(mockAsm);
      await new Promise((r) => setTimeout(r, 60));
      expect(component.cachedFileSession()?.fileName).toBe('curriculum_file.pdf');
      expect(component.cachedFileSession()?.pageNumber).toBe(12);

      component.onQuestionsExtracted([
        {
          id: 'q_curr_ext_1',
          order: 0,
          type: 'MCQ',
          textAr: 'سؤال مستخرج في الوحدة',
          options: ['أ', 'ب', 'ج', 'د'],
          correctOptionIndex: 1,
          points: 5
        }
      ]);

      const req = httpTestingController.expectOne(`/api/v1/admin/assessments/${asmId}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body.questions.length).toBe(1);
      // Do NOT flush yet or flush an error so local draft remains, verifying both close & reopen restoration
      req.flush('Temporary network error', { status: 500, statusText: 'Server Error' });

      expect(component.assessmentSaved.emit).toHaveBeenCalledWith(jasmine.objectContaining({
        id: asmId,
        questions: jasmine.arrayContaining([
          jasmine.objectContaining({ textAr: 'سؤال مستخرج في الوحدة' })
        ])
      }));

      // Exit exam editor without clicking Save (triggers retry auto-persist since previous PATCH failed),
      // clear in-memory file cache to simulate refresh, and reopen stale mockAsm
      component.closeAssessmentEditor();
      const retryReq = httpTestingController.expectOne(`/api/v1/admin/assessments/${asmId}`);
      expect(retryReq.request.method).toBe('PATCH');
      retryReq.flush('Temporary network error', { status: 500, statusText: 'Server Error' });
      (component as any).assessmentFileSessions.set({});
      sessionService.clearMemoryCache();

      component.openAssessmentEditor({ ...mockAsm, questions: [] });
      await new Promise((r) => setTimeout(r, 80));

      expect(component.activeAssessment()?.questions.length).toBe(1);
      expect(component.activeAssessment()?.questions[0].textAr).toBe('سؤال مستخرج في الوحدة');
      expect(component.cachedFileSession()?.fileName).toBe('curriculum_file.pdf');
      expect(component.cachedFileSession()?.pageNumber).toBe(12);

      await component.draftService.deleteDraft(asmId);
      await sessionService.deleteSession(asmId);
    });

    it('should keep Module 2 selected across consecutive question additions and sync filter tabs with AI extraction', async () => {
      const asmId = 'asm_curric_m2_flow_1';
      const baseAsm: AssessmentAdminItem = {
        id: asmId,
        unitId: 'unit_m2_1',
        titleAr: 'كويز موديولين بالوحدة',
        type: 'QUIZ',
        calculatorType: 'NONE',
        durationMinutes: 70,
        isMultiModule: false,
        submissionsCount: 0,
        questions: []
      };

      component.openAssessmentEditor(baseAsm);
      component.toggleEditorMultiModule();
      expect(component.activeAssessment()?.isMultiModule).toBeTrue();

      // Switch to Module 2 filter tab -> composer module target syncs to 2
      component.selectModuleFilterTab(2);
      expect(component.newQuestionModuleIndex()).toBe(2);

      // Switch filter back to ALL, add two consecutive questions targeted at Module 2
      component.selectModuleFilterTab('ALL');
      component.selectComposerModule(2);
      component.newQuestionType.set('MCQ');
      component.newQuestionTextAr.set('سؤال 1 في الموديول الثاني');
      component.newQuestionOptions.set(['1', '2', '3', '4']);
      component.addQuestionToAssessment();
      httpTestingController.expectOne(`/api/v1/admin/assessments/${asmId}`).flush({ success: true, data: {} });

      expect(component.newQuestionModuleIndex()).toBe(2);

      component.newQuestionType.set('MCQ');
      component.newQuestionTextAr.set('سؤال 2 في الموديول الثاني');
      component.newQuestionOptions.set(['5', '6', '7', '8']);
      component.addQuestionToAssessment();
      httpTestingController.expectOne(`/api/v1/admin/assessments/${asmId}`).flush({ success: true, data: {} });

      expect(component.module2QuestionsCount()).toBe(2);
      expect(component.module1QuestionsCount()).toBe(0);
      expect(component.activeAssessment()?.questions.every((q) => q.moduleIndex === 2)).toBeTrue();

      // Switch filter tab to 1, then extract questions without explicit moduleIndex while composer is still M2
      component.selectModuleFilterTab(1);
      component.selectComposerModule(2);
      component.onQuestionsExtracted([
        {
          id: 'q_ai_m2',
          order: 0,
          type: 'MCQ',
          textAr: 'سؤال مستخرج للموديول الثاني',
          options: ['أ', 'ب', 'ج', 'د'],
          correctOptionIndex: 0,
          points: 5
        }
      ]);
      httpTestingController.expectOne(`/api/v1/admin/assessments/${asmId}`).flush({ success: true, data: {} });

      expect(component.module2QuestionsCount()).toBe(3);
      expect(component.moduleFilterTab()).toBe(2);
      expect(component.filteredQuestions().length).toBe(3);

      await component.draftService.deleteDraft(asmId);
    });
  });
});
