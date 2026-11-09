import { TestBed } from '@angular/core/testing';
import { AssessmentDraftService } from './assessment-draft.service';
import { spiderMathDb } from './spider-math-db';
import { AssessmentDraft } from './assessment-draft.models';
import { AssessmentStudioComponent } from '../../features/super-admin-dashboard/assessment-studio/assessment-studio.component';
import { HttpClient } from '@angular/common/http';
import { LangService } from '../seo-theme-i18n/lang.service';
import { of } from 'rxjs';

/**
 * Milestone 2 Challenger Stress & Invalidation Suite
 * Adversarial tests probing concurrency, race conditions, stale overwrites,
 * draft deletion integrity, and 1-click restoration completeness.
 */
describe('Milestone 2 Challenger Stress Harness', () => {
  let draftService: AssessmentDraftService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [AssessmentDraftService]
    });
    draftService = TestBed.inject(AssessmentDraftService);
    await spiderMathDb.assessmentDrafts.clear();
  });

  afterEach(async () => {
    draftService.ngOnDestroy();
    await spiderMathDb.assessmentDrafts.clear();
  });

  describe('Adversarial Concurrency & Debounce Stress', () => {
    it('STRESS-1: Rapid keystrokes (50 writes) should collapse into a single final state in Dexie', async () => {
      const baseDraft: AssessmentDraft = {
        draftId: 'stress_keystrokes',
        assessmentId: 'stress_keystrokes',
        titleAr: 'Initial Title',
        curriculum: 'EGYPTIAN',
        gradeLevel: 'SEC_3',
        term: 'TERM_1',
        calculatorType: 'NONE',
        durationMinutes: 45,
        passPercentage: 60,
        maxAttempts: 1,
        isScheduled: false,
        isPlacementTest: false,
        requiresTeacherReview: false,
        totalPoints: 10,
        questions: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Simulate 50 keystrokes arriving rapidly every 5ms
      for (let i = 1; i <= 50; i++) {
        const draft = { ...baseDraft, titleAr: `Keystroke iteration ${i}` };
        draftService.scheduleDebouncedSave(draft, 120);
        await new Promise((r) => setTimeout(r, 4));
      }

      // Mid-flight check: before debounce window elapses, Dexie should not have the final keystroke
      expect(draftService.isAutoSaving()).toBeTrue();

      // Wait for debounce timer to fire
      await new Promise((r) => setTimeout(r, 160));

      const inDb = await spiderMathDb.assessmentDrafts.get('stress_keystrokes');
      expect(inDb).toBeDefined();
      expect(inDb?.titleAr).toBe('Keystroke iteration 50');
      expect(draftService.isAutoSaving()).toBeFalse();

      // Total records in table must be strictly 1
      const count = await spiderMathDb.assessmentDrafts.count();
      expect(count).toBe(1);
    });

    it('STRESS-2: Immediate saveDraft should cancel pending debounced timer to prevent stale data overwrite', async () => {
      const draftA_typing: AssessmentDraft = {
        draftId: 'race_test_1',
        assessmentId: 'race_test_1',
        titleAr: 'Draft A - Typing in Progress (Stale)',
        curriculum: 'EGYPTIAN',
        gradeLevel: 'SEC_3',
        term: 'TERM_1',
        calculatorType: 'NONE',
        durationMinutes: 45,
        passPercentage: 60,
        maxAttempts: 1,
        isScheduled: false,
        isPlacementTest: false,
        requiresTeacherReview: false,
        totalPoints: 0,
        questions: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const draftB_immediateAdd: AssessmentDraft = {
        ...draftA_typing,
        titleAr: 'Draft B - New Question Added Immediately',
        totalPoints: 5,
        questions: [
          {
            id: 'q_fresh',
            order: 1,
            type: 'MCQ',
            textAr: 'Fresh Question Added By Teacher',
            options: ['Option 1', 'Option 2'],
            correctOptionIndex: 0,
            points: 5
          }
        ]
      };

      // 1. Teacher starts typing -> debounced save scheduled with 100ms delay
      draftService.scheduleDebouncedSave(draftA_typing, 100);

      // 2. 25ms later, teacher adds a question -> triggers immediate saveDraft
      await new Promise((r) => setTimeout(r, 25));
      await draftService.saveDraft(draftB_immediateAdd);

      // Verify immediate save wrote Draft B
      let currentInDb = await spiderMathDb.assessmentDrafts.get('race_test_1');
      expect(currentInDb?.titleAr).toBe('Draft B - New Question Added Immediately');
      expect(currentInDb?.questions.length).toBe(1);

      // 3. Wait for the initial 100ms debounce timer to expire (120ms total)
      await new Promise((r) => setTimeout(r, 120));

      // 4. Verify whether the debounced timer from step 1 overwrote Draft B with stale Draft A!
      currentInDb = await spiderMathDb.assessmentDrafts.get('race_test_1');
      expect(currentInDb?.titleAr).toBe('Draft B - New Question Added Immediately');
      expect(currentInDb?.questions.length).toBe(1);
    });

    it('STRESS-3: Deletion while debounce timer is active must cancel timer and not respawn draft', async () => {
      const draft: AssessmentDraft = {
        draftId: 'del_race_1',
        assessmentId: 'del_race_1',
        titleAr: 'To Be Deleted',
        curriculum: 'EGYPTIAN',
        gradeLevel: 'SEC_3',
        term: 'TERM_1',
        calculatorType: 'NONE',
        durationMinutes: 45,
        passPercentage: 60,
        maxAttempts: 1,
        isScheduled: false,
        isPlacementTest: false,
        requiresTeacherReview: false,
        totalPoints: 0,
        questions: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Schedule save in 100ms
      draftService.scheduleDebouncedSave(draft, 100);

      // User deletes draft at 30ms
      await new Promise((r) => setTimeout(r, 30));
      await draftService.deleteDraft('del_race_1');

      // Verify it is not in DB
      let inDb = await spiderMathDb.assessmentDrafts.get('del_race_1');
      expect(inDb).toBeUndefined();

      // Wait beyond the 100ms mark
      await new Promise((r) => setTimeout(r, 120));

      // Dexie must remain clean - debounce must NOT have resurrected the deleted draft
      inDb = await spiderMathDb.assessmentDrafts.get('del_race_1');
      expect(inDb).toBeUndefined();
    });

    it('STRESS-4: Complete purge on publish without residual orphan records', async () => {
      // Create 3 drafts
      for (let i = 1; i <= 3; i++) {
        await draftService.saveDraft({
          draftId: `draft_${i}`,
          assessmentId: `asm_${i}`,
          titleAr: `Exam ${i}`,
          curriculum: 'EGYPTIAN',
          gradeLevel: 'SEC_3',
          term: 'TERM_1',
          calculatorType: 'NONE',
          durationMinutes: 45,
          passPercentage: 60,
          maxAttempts: 1,
          isScheduled: false,
          isPlacementTest: false,
          requiresTeacherReview: false,
          totalPoints: 10,
          questions: [],
          createdAt: Date.now() + i,
          updatedAt: Date.now() + i
        });
      }

      expect((await draftService.listDrafts()).length).toBe(3);

      // Simulate publishing exam 2 by its assessmentId
      await draftService.deleteDraft('asm_2');

      const remaining = await draftService.listDrafts();
      expect(remaining.length).toBe(2);
      expect(remaining.some((d) => d.assessmentId === 'asm_2')).toBeFalse();
      expect(remaining.some((d) => d.draftId === 'draft_2')).toBeFalse();

      // Ensure other drafts are untouched
      expect(remaining.some((d) => d.draftId === 'draft_1')).toBeTrue();
      expect(remaining.some((d) => d.draftId === 'draft_3')).toBeTrue();
    });
  });

  describe('Adversarial 1-Click Restoration & Data Integrity', () => {
    let component: AssessmentStudioComponent;
    let fixture: any;

    const mockHttp = {
      get: jasmine.createSpy('get').and.returnValue(of({ success: true, data: [] })),
      post: jasmine.createSpy('post').and.returnValue(of({ success: true, data: {} })),
      patch: jasmine.createSpy('patch').and.returnValue(of({ success: true, data: {} })),
      delete: jasmine.createSpy('delete').and.returnValue(of({ success: true, data: {} }))
    };

    const mockLang = {
      isArabic: () => true,
      isRtl: () => true,
      isEnglish: () => false,
      currentLang: () => 'ar'
    };

    beforeEach(async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [AssessmentStudioComponent],
        providers: [
          AssessmentDraftService,
          { provide: HttpClient, useValue: mockHttp },
          { provide: LangService, useValue: mockLang }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(AssessmentStudioComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('RESTORE-1: 1-click restore handles drafts without composerSnapshot gracefully without throwing', () => {
      const minimalDraft: AssessmentDraft = {
        draftId: 'asm_min',
        assessmentId: 'asm_min',
        titleAr: 'Minimal Draft without Composer',
        curriculum: 'INTERNATIONAL',
        gradeLevel: 'IGCSE_AL',
        term: 'TERM_2',
        calculatorType: 'DESMOS',
        durationMinutes: 90,
        passPercentage: 75,
        maxAttempts: 3,
        isScheduled: false,
        isPlacementTest: true,
        requiresTeacherReview: false,
        totalPoints: 0,
        questions: [],
        createdAt: 12345,
        updatedAt: 12345
      };

      expect(() => component.restoreDraft(minimalDraft)).not.toThrow();
      expect(component.isEditorOpen()).toBeTrue();
      expect(component.editorActiveTab()).toBe('QUESTIONS');
      expect(component.activeAssessment()?.curriculum).toBe('INTERNATIONAL');
      expect(component.activeAssessment()?.gradeLevel).toBe('IGCSE_AL');
      expect(component.activeAssessment()?.calculatorType).toBe('DESMOS');
      expect(component.activeAssessment()?.isPlacementTest).toBeTrue();
      expect(component.newQuestionTextAr()).toBe('');
      expect(component.editingQuestionId()).toBeNull();
    });

    it('RESTORE-2: 1-click restore correctly hydrates rich questions, math KaTeX, options, and in-progress composer', () => {
      const richDraft: AssessmentDraft = {
        draftId: 'asm_rich',
        assessmentId: 'asm_rich',
        titleAr: 'امتحان تفاضل متقدم مع ورقة قوانين',
        curriculum: 'EGYPTIAN',
        gradeLevel: 'SEC_3',
        term: 'TERM_1',
        calculatorType: 'DESMOS',
        referenceSheetUrl: 'https://cdn.spider-math.com/formula_sheet.pdf',
        durationMinutes: 120,
        passPercentage: 70,
        maxAttempts: 2,
        isScheduled: true,
        availableFrom: '2026-12-01T08:00:00Z',
        availableUntil: '2026-12-01T20:00:00Z',
        isPlacementTest: false,
        requiresTeacherReview: true,
        totalPoints: 25,
        questions: [
          {
            id: 'q_1',
            order: 1,
            type: 'MCQ',
            textAr: 'أوجد $\\int x \\sin(x) dx$',
            options: ['$-x \\cos(x) + \\sin(x) + C$', '$x \\sin(x) + C$', '$\\cos(x) + C$', '$0$'],
            correctOptionIndex: 0,
            points: 10,
            questionImageUrl: 'https://cdn.spider-math.com/integral.png'
          },
          {
            id: 'q_2',
            order: 2,
            type: 'ESSAY',
            textAr: 'أثبت أن المشتقة الثانية دالة متصلة',
            options: [],
            correctOptionIndex: -1,
            points: 15
          }
        ],
        composerSnapshot: {
          editingQuestionId: 'q_1',
          type: 'MCQ',
          textAr: 'تعديل مسودة المسألة أثناء الحفظ',
          imageUrl: 'https://cdn.spider-math.com/composer.png',
          options: ['خيار أ', 'خيار ب', 'خيار ج', 'خيار د'],
          correctIndex: 1,
          points: 10,
          youtubeUrl: 'https://youtube.com/watch?v=mock123'
        },
        createdAt: 1000,
        updatedAt: 2000
      };

      component.restoreDraft(richDraft);

      const asm = component.activeAssessment();
      expect(asm).toBeTruthy();
      expect(asm?.titleAr).toBe('امتحان تفاضل متقدم مع ورقة قوانين');
      expect(asm?.referenceSheetUrl).toBe('https://cdn.spider-math.com/formula_sheet.pdf');
      expect(component.isRefSheetActiveInEditor()).toBeTrue();
      expect(asm?.questions.length).toBe(2);
      expect(asm?.questions[0].questionImageUrl).toBe('https://cdn.spider-math.com/integral.png');
      expect(asm?.questions[1].type).toBe('ESSAY');

      // Composer snapshot hydration
      expect(component.editingQuestionId()).toBe('q_1');
      expect(component.newQuestionTextAr()).toBe('تعديل مسودة المسألة أثناء الحفظ');
      expect(component.newQuestionImageUrl()).toBe('https://cdn.spider-math.com/composer.png');
      expect(component.newQuestionOptions()).toEqual(['خيار أ', 'خيار ب', 'خيار ج', 'خيار د']);
      expect(component.newQuestionCorrectIndex()).toBe(1);
      expect(component.newQuestionYoutubeUrl()).toBe('https://youtube.com/watch?v=mock123');
    });
  });
});
