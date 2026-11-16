import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { CurriculumSelectorCardsComponent } from './curriculum-selector-cards.component';
import { IGradeLevelAvailability } from './curriculum-selector-cards.models';
import { IGradeQuizItem } from '../../../core/services/public-discovery.models';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { PublicDiscoveryService } from '../../../core/services/public-discovery.service';
import { of } from 'rxjs';

describe('CurriculumSelectorCardsComponent', () => {
  let component: CurriculumSelectorCardsComponent;
  let fixture: ComponentFixture<CurriculumSelectorCardsComponent>;
  let router: Router;

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
    router = TestBed.inject(Router);
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

  describe('getGradeSubtitle', () => {
    it('should return real unit count if grade has published units', () => {
      const grade: IGradeLevelAvailability = {
        code: 'PREP_1',
        titleAr: 'الصف الأول الإعدادي',
        titleEn: 'Prep 1',
        shortLabelAr: 'أولى إعدادي',
        shortLabelEn: 'Prep 1',
        stageAr: 'المرحلة الإعدادية',
        stageEn: 'Preparatory',
        isAvailable: true,
        hasPublishedUnits: true,
        publishedUnitsCount: 4,
        hasPlacementTest: false
      };
      const subtitle = component.getGradeSubtitle(grade);
      expect(subtitle).toMatch(/4 (Units Available|وحدات متاحة)/);
    });

    it('should return placement test message when grade has 0 units but has placement test', () => {
      const grade: IGradeLevelAvailability = {
        code: 'PREP_2',
        titleAr: 'الصف الثاني الإعدادي',
        titleEn: 'Prep 2',
        shortLabelAr: 'تانية إعدادي',
        shortLabelEn: 'Prep 2',
        stageAr: 'المرحلة الإعدادية',
        stageEn: 'Preparatory',
        isAvailable: true,
        hasPublishedUnits: false,
        publishedUnitsCount: 0,
        hasPlacementTest: true
      };
      const subtitle = component.getGradeSubtitle(grade);
      expect(subtitle).toMatch(/(Placement Test Available|امتحان تحديد المستوى متاح)/);
    });

    it('should return coming soon when grade has 0 units and no placement test', () => {
      const grade: IGradeLevelAvailability = {
        code: 'PRI_1',
        titleAr: 'الصف الأول الابتدائي',
        titleEn: 'Primary 1',
        shortLabelAr: 'أولى ابتدائي',
        shortLabelEn: 'Primary 1',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary',
        isAvailable: false,
        hasPublishedUnits: false,
        publishedUnitsCount: 0,
        hasPlacementTest: false
      };
      const subtitle = component.getGradeSubtitle(grade);
      expect(subtitle).toMatch(/(Coming Soon|قريباً)/);
    });
  });

  describe('Accordion & Quizzes logic', () => {
    it('should toggle unit accordion correctly', () => {
      const unitId = 'unit_123';
      expect(component.isUnitExpanded(unitId)).toBeFalse();

      component.toggleUnitAccordion(unitId);
      expect(component.isUnitExpanded(unitId)).toBeTrue();

      component.toggleUnitAccordion(unitId);
      expect(component.isUnitExpanded(unitId)).toBeFalse();
    });

    it('should open locked content modal when clicking a locked (paid) quiz', () => {
      const lockedQuiz: IGradeQuizItem = {
        id: 'quiz_locked_1',
        titleAr: 'اختبار تجريبي خاص',
        titleEn: 'Private Quiz',
        assessmentType: 'QUIZ',
        timeLimitMinutes: 20,
        totalPoints: 100,
        questionsCount: 10,
        isFree: false,
        isPlacementTest: false,
        xpReward: 50
      };

      component.onQuizClick(lockedQuiz);
      expect(component.showLockedContentModal()).toBeTrue();
      expect(component.lockedContentTitle()).toBe(lockedQuiz.titleAr);
    });

    it('should open auth gate modal when unauthenticated user clicks a free quiz', () => {
      spyOn(component.authService, 'isAuthenticated').and.returnValue(false);

      const freeQuiz: IGradeQuizItem = {
        id: 'quiz_free_1',
        titleAr: 'اختبار مجاني',
        titleEn: 'Free Quiz',
        assessmentType: 'QUIZ',
        timeLimitMinutes: 15,
        totalPoints: 50,
        questionsCount: 5,
        isFree: true,
        isPlacementTest: false,
        xpReward: 25
      };

      component.onQuizClick(freeQuiz);
      expect(component.showAuthGateModal()).toBeTrue();
      expect(component.authGateActionMessage()).toBeTruthy();
    });

    it('should navigate directly to assessment when authenticated user clicks a free quiz', async () => {
      const confirmDialogService = TestBed.inject(ConfirmDialogService);
      spyOn(confirmDialogService, 'confirm').and.returnValue(Promise.resolve(true));
      spyOn(component.authService, 'isAuthenticated').and.returnValue(true);
      const navigateSpy = spyOn(router, 'navigate');

      const freeQuiz: IGradeQuizItem = {
        id: 'quiz_free_2',
        titleAr: 'اختبار مجاني 2',
        titleEn: 'Free Quiz 2',
        assessmentType: 'QUIZ',
        timeLimitMinutes: 15,
        totalPoints: 50,
        questionsCount: 5,
        isFree: true,
        isPlacementTest: false,
        xpReward: 25
      };

      component.onQuizClick(freeQuiz);
      await fixture.whenStable();
      expect(component.showAuthGateModal()).toBeFalse();
      expect(navigateSpy).toHaveBeenCalledWith(['/student/assessments', 'quiz_free_2']);
    });

    it('should format whatsapp subscription URL with international country code for Egypt', () => {
      component.landingData.set({ whatsappSupportNumber: '01012345678' });
      component.lockedContentTitle.set('وحدة الجبر');

      const url = component.whatsappSubscriptionUrl();
      expect(url).toContain('https://wa.me/201012345678?text=');
      expect(url).toContain(encodeURIComponent('وحدة الجبر'));
    });
  });

  describe('Lighthouse Optimizations: Card WebP Assets & Deferred APIs', () => {
    it('should return optimized webp background images for each curriculum', () => {
      expect(component.getCurriculumBgImage('AMERICAN')).toBe('/assets/branding/curriculum-card-sat.webp');
      expect(component.getCurriculumBgImage('EGYPTIAN')).toBe('/assets/branding/curriculum-card-egyptian.webp');
      expect(component.getCurriculumBgImage('GULF')).toBe('/assets/branding/curriculum-card-gulf.webp');
      expect(component.getCurriculumBgImage('INTERNATIONAL')).toBe('/assets/branding/curriculum-card-british.webp?v=10');
    });

    it('should return responsive webp srcset with 320w and 512w descriptors for each curriculum', () => {
      expect(component.getCurriculumBgSrcset('AMERICAN')).toBe(
        '/assets/branding/curriculum-card-sat-sm.webp 320w, /assets/branding/curriculum-card-sat.webp 512w'
      );
      expect(component.getCurriculumBgSrcset('EGYPTIAN')).toBe(
        '/assets/branding/curriculum-card-egyptian-sm.webp 320w, /assets/branding/curriculum-card-egyptian.webp 512w'
      );
      expect(component.getCurriculumBgSrcset('GULF')).toBe(
        '/assets/branding/curriculum-card-gulf-sm.webp 320w, /assets/branding/curriculum-card-gulf.webp 512w'
      );
      expect(component.getCurriculumBgSrcset('INTERNATIONAL')).toBe(
        '/assets/branding/curriculum-card-british-sm.webp?v=10 320w, /assets/branding/curriculum-card-british.webp?v=10 512w'
      );
    });

    it('should trigger curriculum tree and active grades when opening track modal', () => {
      const treeSpy = spyOn<any>(component, 'ensureCurriculumTreeLoaded').and.callThrough();
      const gradesSpy = spyOn<any>(component, 'ensureActiveGradesLoaded').and.callThrough();

      component.openTrackModal('EGYPTIAN');

      expect(treeSpy).toHaveBeenCalled();
      expect(gradesSpy).toHaveBeenCalled();
    });

    it('should NOT call curriculum tree or active grades during ngOnInit, only getLandingData', () => {
      const discoveryService = TestBed.inject(PublicDiscoveryService);
      const landingSpy = spyOn(discoveryService, 'getLandingData').and.returnValue(of({} as any));
      const treeSpy = spyOn(discoveryService, 'getCurriculumTree').and.returnValue(of([]));
      const gradesSpy = spyOn(discoveryService, 'loadActiveGradesAndTracks').and.returnValue(of({ activeGrades: [], curriculaTracks: [] }));

      const freshFixture = TestBed.createComponent(CurriculumSelectorCardsComponent);
      freshFixture.detectChanges(); // triggers ngOnInit

      expect(landingSpy).toHaveBeenCalled();
      expect(treeSpy).not.toHaveBeenCalled();
      expect(gradesSpy).not.toHaveBeenCalled();

      // Opening track modal triggers both deferred calls
      freshFixture.componentInstance.openTrackModal('EGYPTIAN');
      expect(treeSpy).toHaveBeenCalledTimes(1);
      expect(gradesSpy).toHaveBeenCalledTimes(1);

      // Subsequent opening does not trigger duplicate API calls (idempotent guard)
      freshFixture.componentInstance.openTrackModal('GULF');
      expect(treeSpy).toHaveBeenCalledTimes(1);
      expect(gradesSpy).toHaveBeenCalledTimes(1);
    });

    it('should fall back to british card for unknown or international curriculum codes', () => {
      expect(component.getCurriculumBgImage('UNKNOWN' as any)).toBe('/assets/branding/curriculum-card-british.webp?v=10');
      expect(component.getCurriculumBgSrcset('UNKNOWN' as any)).toBe(
        '/assets/branding/curriculum-card-british-sm.webp?v=10 320w, /assets/branding/curriculum-card-british.webp?v=10 512w'
      );
    });
  });

  describe('International 2-Division Hierarchy', () => {
    it('should initialize selectedIntlDivision to AMERICAN_CURRICULUM', () => {
      expect(component.selectedIntlDivision()).toBe('AMERICAN_CURRICULUM');
    });

    it('should switch selectedIntlDivision to BRITISH_CURRICULUM', () => {
      component.selectIntlDivision('BRITISH_CURRICULUM');
      expect(component.selectedIntlDivision()).toBe('BRITISH_CURRICULUM');
      expect(component.activeIntlDivision().code).toBe('BRITISH_CURRICULUM');
    });

    it('should expose both American and British divisions in intlDivisions', () => {
      const divisions = component.intlDivisions();
      expect(divisions.length).toBe(2);
      expect(divisions[0].code).toBe('AMERICAN_CURRICULUM');
      expect(divisions[1].code).toBe('BRITISH_CURRICULUM');
    });

    it('should return correct division icon with fallback including graduation-cap and division codes', () => {
      expect(component.getDivisionIcon('award')).toBe('award');
      expect(component.getDivisionIcon('graduation-cap')).toBe('graduation-cap');
      expect(component.getDivisionIcon('book-open')).toBe('book-open');
      expect(component.getDivisionIcon('globe')).toBe('globe');
      expect(component.getDivisionIcon('unknown-icon')).toBe('book-open');
      expect(component.getDivisionIcon(undefined, 'AMERICAN_CURRICULUM')).toBe('award');
      expect(component.getDivisionIcon(undefined, 'BRITISH_CURRICULUM')).toBe('graduation-cap');
    });

    it('should assign calculus math icon to senior grades Year 13, AL, AS and triangle to OL', () => {
      expect(component.getGradeMathIcon('IGCSE_YEAR_13')).toBe('calculus');
      expect(component.getGradeMathIcon('IGCSE_AL')).toBe('calculus');
      expect(component.getGradeMathIcon('IGCSE_AS')).toBe('calculus');
      expect(component.getGradeMathIcon('IGCSE_OL')).toBe('triangle');
      expect(component.getGradeMathIcon('IGCSE_YEAR_7')).toBe('division');
      expect(component.getGradeMathIcon('US_GRADE_1')).toBe('operators');
    });

    it('should filter stage grades correctly for American and British stages', () => {
      const discoveryService = TestBed.inject(PublicDiscoveryService);
      discoveryService.activeGrades.set([
        'US_GRADE_1', 'US_GRADE_2', 'US_GRADE_3', 'US_GRADE_4', 'US_GRADE_5',
        'IGCSE_YEAR_1', 'IGCSE_YEAR_2'
      ]);
      component.openTrackModal('INTERNATIONAL');
      const americanDiv = component.intlDivisions().find((d) => d.code === 'AMERICAN_CURRICULUM')!;
      expect(americanDiv.stages.length).toBe(3);

      const elementaryStage = americanDiv.stages.find((s) => s.code === 'ELEMENTARY_SCHOOL')!;
      const elemGrades = component.getIntlStageGrades(elementaryStage);
      expect(elemGrades.map((g) => g.code)).toEqual([
        'US_GRADE_1', 'US_GRADE_2', 'US_GRADE_3', 'US_GRADE_4', 'US_GRADE_5'
      ]);

      const britishDiv = component.intlDivisions().find((d) => d.code === 'BRITISH_CURRICULUM')!;
      expect(britishDiv.stages.length).toBe(5);
      const ks1Stage = britishDiv.stages.find((s) => s.code === 'PRIMARY_KS1')!;
      const ks1Grades = component.getIntlStageGrades(ks1Stage);
      expect(ks1Grades.map((g) => g.code)).toEqual(['IGCSE_YEAR_1', 'IGCSE_YEAR_2']);
    });
  });

  describe('Dynamic Custom Stages & Other Grade Levels (QODORAT / GAT)', () => {
    let discoveryService: PublicDiscoveryService;

    beforeEach(() => {
      discoveryService = TestBed.inject(PublicDiscoveryService);
      // Simulate CMS track configuration returning custom grades under OTHER stage
      discoveryService.curriculaTracks.set([
        {
          code: 'GULF',
          nameAr: 'المنهج الخليجي',
          nameEn: 'Gulf Curriculum',
          isActive: true,
          grades: [
            {
              code: 'QODORAT',
              titleAr: 'قدرات عامة',
              titleEn: 'General Abilities Test (GAT)',
              shortLabelAr: 'قدرات',
              shortLabelEn: 'GAT',
              stageCode: 'OTHER',
              stageAr: 'صفوف دراسية أخرى',
              stageEn: 'Other Grade Levels',
              countryCode: 'SA',
              isCustom: true,
              isActive: true,
              isAvailable: true
            }
          ]
        } as any,
        {
          code: 'INTERNATIONAL',
          nameAr: 'المنهج الدولي',
          nameEn: 'International Curriculum',
          isActive: true,
          grades: [
            {
              code: 'INTL_ACT',
              titleAr: 'اختبار ACT الأمريكي',
              titleEn: 'American ACT Test',
              shortLabelAr: 'ACT',
              shortLabelEn: 'ACT',
              stageCode: 'OTHER',
              divisionCode: 'AMERICAN_CURRICULUM',
              isCustom: true,
              isActive: true,
              isAvailable: true
            }
          ]
        } as any
      ]);
      discoveryService.activeGrades.set(['QODORAT', 'INTL_ACT', 'SA_GRADE_1', 'US_GRADE_1']);
    });

    it('should surface custom active grades (QODORAT) for Saudi Arabia in getOtherGulfGrades', () => {
      component.openTrackModal('GULF');
      component.selectGulfCountry('SA');

      expect(component.hasOtherGulfGrades()).toBeTrue();
      const otherGrades = component.getOtherGulfGrades();
      expect(otherGrades.length).toBeGreaterThanOrEqual(1);
      const qodorat = otherGrades.find(g => g.code === 'QODORAT');
      expect(qodorat).toBeDefined();
      expect(qodorat?.shortLabelAr).toBe('قدرات');
      expect(qodorat?.countryCode).toBe('SA');
      expect(qodorat?.isCustom).toBeTrue();
    });

    it('should NOT surface Saudi Arabia custom grades when Kuwait is selected', () => {
      component.openTrackModal('GULF');
      component.selectGulfCountry('KW');

      const otherGrades = component.getOtherGulfGrades();
      const qodorat = otherGrades.find(g => g.code === 'QODORAT');
      expect(qodorat).toBeUndefined();
    });

    it('should filter out standard stage grades when activeStageFilter is OTHER', () => {
      component.openTrackModal('GULF');
      component.selectGulfCountry('SA');

      component.setStageFilter('OTHER');
      expect(component.activeStageFilter()).toBe('OTHER');

      const saCountry = component.activeGulfCountry();
      const primaryStage = saCountry.stages[0];
      const stageGrades = component.getGulfStageGrades(primaryStage);
      expect(stageGrades.length).toBe(0);

      const otherGrades = component.getOtherGulfGrades();
      expect(otherGrades.length).toBeGreaterThanOrEqual(1);
    });

    it('should reset activeStageFilter to ALL when switching to a country without other grades', () => {
      component.openTrackModal('GULF');
      component.selectGulfCountry('SA');
      component.setStageFilter('OTHER');
      expect(component.activeStageFilter()).toBe('OTHER');

      // Kuwait has no custom grades in this setup
      component.selectGulfCountry('KW');
      expect(component.activeStageFilter()).toBe('ALL');
    });

    it('should support custom tracks for International curriculum in getOtherIntlGrades', () => {
      component.openTrackModal('INTERNATIONAL');
      component.selectIntlDivision('AMERICAN_CURRICULUM');

      expect(component.hasOtherIntlGrades()).toBeTrue();
      const otherGrades = component.getOtherIntlGrades();
      const act = otherGrades.find(g => g.code === 'INTL_ACT');
      expect(act).toBeDefined();
      expect(act?.divisionCode).toBe('AMERICAN_CURRICULUM');

      // Switch to British curriculum - ACT should not appear
      component.selectIntlDivision('BRITISH_CURRICULUM');
      const britishOther = component.getOtherIntlGrades();
      expect(britishOther.find(g => g.code === 'INTL_ACT')).toBeUndefined();
    });

    it('should dynamically return custom stage label when configured', () => {
      component.openTrackModal('GULF');
      component.selectGulfCountry('SA');

      // SA has QODORAT which has stageAr configured
      const labelAr = component.getOtherGulfStageLabel(true);
      const labelEn = component.getOtherGulfStageLabel(false);
      expect(labelAr).toBeDefined();
      expect(labelEn).toBeDefined();

      const intlLabelAr = component.getOtherIntlStageLabel(true);
      const intlLabelEn = component.getOtherIntlStageLabel(false);
      expect(intlLabelAr).toBeDefined();
      expect(intlLabelEn).toBeDefined();
    });

    it('should preserve all canonical grades when custom grades are present', () => {
      const gulfCard = component.curriculumCards().find(c => c.code === 'GULF');
      expect(gulfCard).toBeDefined();
      // Canonical grade 1 to 12 should be preserved
      expect(gulfCard?.availableGrades.some(g => g.code === 'GRADE_1')).toBeTrue();
      expect(gulfCard?.availableGrades.some(g => g.code === 'GRADE_12')).toBeTrue();
      // And custom grade QODORAT should also be present
      expect(gulfCard?.availableGrades.some(g => g.code === 'QODORAT')).toBeTrue();
    });
  });
});
