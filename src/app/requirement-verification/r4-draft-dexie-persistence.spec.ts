import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CurriculumStudioComponent } from '../features/super-admin-dashboard/curriculum-studio/curriculum-studio.component';
import { AssessmentDraftService } from '../core/offline-db/assessment-draft.service';
import { AssessmentDraft } from '../core/offline-db/assessment-draft.models';
import { spiderMathDb } from '../core/offline-db/spider-math-db';

describe('Requirement R4: Draft Auto-Save and Restore on Refresh (Dexie F5 Persistence)', () => {
  let component: CurriculumStudioComponent;
  let fixture: ComponentFixture<CurriculumStudioComponent>;
  let draftService: AssessmentDraftService;

  const testDraftId = 'draft_f5_curriculum_test';

  const mockDraft: AssessmentDraft = {
    draftId: testDraftId,
    assessmentId: testDraftId,
    draftType: 'EDIT',
    titleAr: 'اختبار الجبر الفصلي المستعاد',
    titleEn: 'Restored Algebra Quiz',
    curriculum: 'EGYPTIAN',
    gradeLevel: 'SEC_3',
    term: 'TERM_1',
    calculatorType: 'DESMOS',
    referenceSheetUrl: 'https://example.com/ref-sheet.pdf',
    durationMinutes: 45,
    passPercentage: 60,
    maxAttempts: 2,
    isScheduled: false,
    isPlacementTest: false,
    requiresTeacherReview: false,
    totalPoints: 15,
    studioContext: 'CURRICULUM_STUDIO',
    questions: [
      {
        id: 'q_draft_1',
        order: 1,
        type: 'MCQ',
        textAr: 'إذا كانت د(س) = س^2 + 1، فما هي د(3)؟',
        options: ['7', '8', '10', '12'],
        correctOptionIndex: 2,
        points: 5
      },
      {
        id: 'q_draft_2',
        order: 2,
        type: 'INPUT_TEXT',
        textAr: 'أوجد نهاية الدالة عندما س تقترب من الصفر',
        options: [],
        correctOptionIndex: 0,
        acceptedAnswers: ['0', 'صفر'],
        points: 10
      }
    ],
    composerSnapshot: {
      editingQuestionId: null,
      type: 'INPUT_TEXT',
      textAr: 'مسألة قيد الكتابة في المسودة',
      imageUrl: null,
      options: ['', '', '', ''],
      acceptedAnswers: ['إجابة مسودة'],
      correctIndex: 0,
      points: 7,
      youtubeUrl: ''
    },
    createdAt: Date.now() - 5000,
    updatedAt: Date.now() - 1000
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurriculumStudioComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AssessmentDraftService
      ]
    }).compileComponents();

    draftService = TestBed.inject(AssessmentDraftService);
    fixture = TestBed.createComponent(CurriculumStudioComponent);
    fixture.componentRef.setInput('units', []);
    fixture.componentRef.setInput('selectedCurriculum', 'EGYPTIAN');
    fixture.componentRef.setInput('selectedGrade', 'SEC_3');
    fixture.componentRef.setInput('selectedTerm', 'TERM_1');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(async () => {
    try {
      await draftService.deleteDraft(testDraftId);
      await spiderMathDb.assessmentDrafts.delete(testDraftId);
    } catch {}
  });

  it('should auto-save assessment state to Dexie and LocalStorage on triggerDraftAutoSave', async () => {
    component.activeAssessment.set({
      id: testDraftId,
      unitId: 'unit_test_99',
      titleAr: 'اختبار تجريبي للحفظ التلقائي',
      type: 'QUIZ',
      calculatorType: 'DESMOS',
      durationMinutes: 30,
      submissionsCount: 0,
      questions: [
        {
          id: 'q_auto_1',
          order: 1,
          type: 'MCQ',
          textAr: 'سؤال الحفظ الفوري',
          options: ['أ', 'ب', 'ج', 'د'],
          correctOptionIndex: 0,
          points: 5
        }
      ]
    });

    component.triggerDraftAutoSave(true);

    // Verify written to Dexie
    const savedDexie = await draftService.getDraft(testDraftId);
    expect(savedDexie).toBeDefined();
    expect(savedDexie?.draftId).toBe(testDraftId);
    expect(savedDexie?.titleAr).toBe('اختبار تجريبي للحفظ التلقائي');
    expect(savedDexie?.questions.length).toBe(1);
    expect(savedDexie?.questions[0].textAr).toBe('سؤال الحفظ الفوري');
    expect(savedDexie?.studioContext).toBe('CURRICULUM_STUDIO');

    // Verify written to LocalStorage sync mirror
    const savedSync = draftService.getDraftSync(testDraftId);
    expect(savedSync).toBeDefined();
    expect(savedSync?.titleAr).toBe('اختبار تجريبي للحفظ التلقائي');
  });

  it('should detect pending draft upon page load / initialization (simulating F5 refresh)', async () => {
    // Seed draft into Dexie
    await draftService.saveDraft(mockDraft);

    // Simulate F5 refresh by calling checkForPendingDrafts
    await component.checkForPendingDrafts();

    expect(component.pendingDraft()).toBeDefined();
    expect(component.pendingDraft()?.draftId).toBe(testDraftId);
    expect(component.pendingDraft()?.titleAr).toBe('اختبار الجبر الفصلي المستعاد');
    expect(component.pendingDraft()?.questions.length).toBe(2);
  });

  it('should restore draft state in 1-click and rehydrate active assessment, questions and composer', () => {
    component.restoreDraft(mockDraft);

    expect(component.isAssessmentEditorOpen()).toBeTrue();
    expect(component.activeAssessment()).toBeDefined();
    expect(component.activeAssessment()?.id).toBe(testDraftId);
    expect(component.activeAssessment()?.titleAr).toBe('اختبار الجبر الفصلي المستعاد');
    expect(component.activeAssessment()?.questions.length).toBe(2);
    expect(component.activeAssessment()?.questions[1].type).toBe('INPUT_TEXT');
    expect(component.activeAssessment()?.questions[1].acceptedAnswers).toEqual(['0', 'صفر']);

    // Composer signals rehydrated from snapshot
    expect(component.newQuestionType()).toBe('INPUT_TEXT');
    expect(component.newQuestionTextAr()).toBe('مسألة قيد الكتابة في المسودة');
    expect(component.newQuestionAcceptedAnswers()).toEqual(['إجابة مسودة']);
    expect(component.newQuestionPoints()).toBe(7);

    // Pending draft signal cleared upon restoration
    expect(component.pendingDraft()).toBeNull();
  });

  it('should discard draft and remove it from Dexie and LocalStorage', async () => {
    await draftService.saveDraft(mockDraft);
    component.pendingDraft.set(mockDraft);

    await component.discardDraft(testDraftId);

    expect(component.pendingDraft()).toBeNull();
    const checked = await draftService.getDraft(testDraftId);
    expect(checked).toBeUndefined();
    expect(draftService.getDraftSync(testDraftId)).toBeUndefined();
  });
});
