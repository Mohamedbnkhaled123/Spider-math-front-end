import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { AssessmentDraftService } from './assessment-draft.service';
import { spiderMathDb } from './spider-math-db';
import { AssessmentDraft } from './assessment-draft.models';

describe('AssessmentDraftService', () => {
  let service: AssessmentDraftService;

  const sampleDraft1: AssessmentDraft = {
    draftId: 'draft_asm_1',
    assessmentId: 'asm_1',
    draftType: 'EDIT',
    titleAr: 'كويز تفاضل تجريبي',
    titleEn: 'Calculus Quiz Trial',
    curriculum: 'EGYPTIAN',
    gradeLevel: 'SEC_3',
    term: 'TERM_1',
    calculatorType: 'DESMOS',
    referenceSheetUrl: 'https://cdn.example.com/sheet.webp',
    durationMinutes: 45,
    passPercentage: 60,
    maxAttempts: 2,
    isScheduled: false,
    isPlacementTest: false,
    requiresTeacherReview: false,
    totalPoints: 10,
    questions: [
      {
        id: 'q_1',
        order: 1,
        type: 'MCQ',
        textAr: 'ما هي مشتقة $x^3$؟',
        options: ['$3x^2$', '$2x$', '$x^2$', '$3x$'],
        correctOptionIndex: 0,
        points: 5
      }
    ],
    composerSnapshot: {
      editingQuestionId: null,
      type: 'MCQ',
      textAr: 'مسألة جديدة',
      imageUrl: null,
      options: ['1', '2', '3', '4'],
      correctIndex: 1,
      points: 5,
      youtubeUrl: ''
    },
    createdAt: 1000,
    updatedAt: 1000
  };

  const sampleDraft2: AssessmentDraft = {
    draftId: 'draft_asm_2',
    assessmentId: 'asm_2',
    draftType: 'EDIT',
    titleAr: 'امتحان الجبر الشامل',
    curriculum: 'EGYPTIAN',
    gradeLevel: 'SEC_3',
    term: 'TERM_1',
    calculatorType: 'NONE',
    durationMinutes: 60,
    passPercentage: 50,
    maxAttempts: 1,
    isScheduled: true,
    isPlacementTest: false,
    requiresTeacherReview: true,
    totalPoints: 20,
    questions: [],
    createdAt: 2000,
    updatedAt: 2500
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [AssessmentDraftService]
    });
    service = TestBed.inject(AssessmentDraftService);

    // Clean up table before each test
    await spiderMathDb.assessmentDrafts.clear();
  });

  afterEach(async () => {
    service.ngOnDestroy();
    await spiderMathDb.assessmentDrafts.clear();
  });

  it('should be created with initial state', () => {
    expect(service).toBeTruthy();
    expect(service.isAutoSaving()).toBeFalse();
    expect(service.lastSavedTimestamp()).toBeNull();
  });

  it('should persist a draft to Dexie assessmentDrafts table via saveDraft', async () => {
    await service.saveDraft(sampleDraft1);

    const fromDb = await spiderMathDb.assessmentDrafts.get('draft_asm_1');
    expect(fromDb).toBeDefined();
    expect(fromDb?.titleAr).toBe('كويز تفاضل تجريبي');
    expect(fromDb?.questions.length).toBe(1);
    expect(fromDb?.questions[0].textAr).toBe('ما هي مشتقة $x^3$؟');
    expect(fromDb?.composerSnapshot?.textAr).toBe('مسألة جديدة');
    expect(service.isAutoSaving()).toBeFalse();
    expect(service.lastSavedTimestamp()).toBeGreaterThan(0);
  });

  it('should retrieve a draft by draftId or by assessmentId via getDraft', async () => {
    await service.saveDraft(sampleDraft1);

    const byDraftId = await service.getDraft('draft_asm_1');
    expect(byDraftId).toBeDefined();
    expect(byDraftId?.draftId).toBe('draft_asm_1');

    const byAssessmentId = await service.getDraft('asm_1');
    expect(byAssessmentId).toBeDefined();
    expect(byAssessmentId?.assessmentId).toBe('asm_1');

    const nonExistent = await service.getDraft('unknown_id');
    expect(nonExistent).toBeUndefined();
  });

  it('should retrieve the latest draft ordered by updatedAt via getLatestDraft', async () => {
    await service.saveDraft(sampleDraft1); // updatedAt set to now (~Date.now())
    await new Promise(r => setTimeout(r, 20));
    await service.saveDraft(sampleDraft2); // newer updatedAt

    const latest = await service.getLatestDraft();
    expect(latest).toBeDefined();
    expect(latest?.draftId).toBe('draft_asm_2');
    expect(latest?.titleAr).toBe('امتحان الجبر الشامل');
  });

  it('should list all drafts via listDrafts', async () => {
    await service.saveDraft(sampleDraft1);
    await service.saveDraft(sampleDraft2);

    const all = await service.listDrafts();
    expect(all.length).toBe(2);
    expect(all.some(d => d.draftId === 'draft_asm_1')).toBeTrue();
    expect(all.some(d => d.draftId === 'draft_asm_2')).toBeTrue();
  });

  it('should delete a draft completely from Dexie via deleteDraft', async () => {
    await service.saveDraft(sampleDraft1);
    expect(await spiderMathDb.assessmentDrafts.get('draft_asm_1')).toBeDefined();

    await service.deleteDraft('draft_asm_1');
    expect(await spiderMathDb.assessmentDrafts.get('draft_asm_1')).toBeUndefined();
  });

  it('should delete a draft by assessmentId index via deleteDraft', async () => {
    await service.saveDraft(sampleDraft1);
    expect(await spiderMathDb.assessmentDrafts.get('draft_asm_1')).toBeDefined();

    await service.deleteDraft('asm_1');
    expect(await spiderMathDb.assessmentDrafts.get('draft_asm_1')).toBeUndefined();
  });

  it('should debounce rapid consecutive saves via scheduleDebouncedSave', async () => {
    const draftV1 = { ...sampleDraft1, titleAr: 'نسخة 1' };
    const draftV2 = { ...sampleDraft1, titleAr: 'نسخة 2' };
    const draftV3 = { ...sampleDraft1, titleAr: 'النسخة النهائية المستقرة' };

    service.scheduleDebouncedSave(draftV1, 100);
    expect(service.isAutoSaving()).toBeTrue();

    // Call again before timer expires
    service.scheduleDebouncedSave(draftV2, 100);
    // Call again with final value
    service.scheduleDebouncedSave(draftV3, 100);

    // Wait for debounce timer to fire
    await new Promise(r => setTimeout(r, 150));

    const saved = await spiderMathDb.assessmentDrafts.get('draft_asm_1');
    expect(saved).toBeDefined();
    expect(saved?.titleAr).toBe('النسخة النهائية المستقرة');
    expect(service.isAutoSaving()).toBeFalse();
  });

  it('should clear all drafts via clearAllDrafts', async () => {
    await service.saveDraft(sampleDraft1);
    await service.saveDraft(sampleDraft2);
    expect((await service.listDrafts()).length).toBe(2);

    await service.clearAllDrafts();
    expect((await service.listDrafts()).length).toBe(0);
  });

  it('should safely do nothing in non-browser platform (SSR safety)', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AssessmentDraftService,
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    });
    const serverService = TestBed.inject(AssessmentDraftService);

    // None of these should throw in server platform
    await serverService.saveDraft(sampleDraft1);
    serverService.scheduleDebouncedSave(sampleDraft1, 50);
    const draft = await serverService.getDraft('draft_asm_1');
    const latest = await serverService.getLatestDraft();
    const all = await serverService.listDrafts();
    await serverService.deleteDraft('draft_asm_1');
    await serverService.clearAllDrafts();

    expect(draft).toBeUndefined();
    expect(latest).toBeUndefined();
    expect(all).toEqual([]);
  });
});
