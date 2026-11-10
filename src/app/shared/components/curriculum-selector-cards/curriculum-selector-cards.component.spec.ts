import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { CurriculumSelectorCardsComponent } from './curriculum-selector-cards.component';
import { IGradeLevelAvailability } from './curriculum-selector-cards.models';
import { IGradeQuizItem } from '../../../core/services/public-discovery.models';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

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
});
