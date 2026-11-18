import Dexie, { type Table } from 'dexie';
import { ActiveQuizRecord, SyncQueueRecord } from './quiz-cache.models';
import { AssessmentDraft } from './assessment-draft.models';
import { IAiExtractionSessionRecord } from '../../features/super-admin-dashboard/assessment-studio/ai-question-extraction-modal/ai-question-extraction-modal.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 12, 15 & 18: Dexie.js Client-Side IndexedDB Database
 * 
 * Tables:
 * - activeQuizzes: In-progress assessment bundles with elapsed seconds & answers
 * - syncQueue: Completed attempts queued offline or awaiting sync with 1s-15s jitter shield
 * - assessmentDrafts: Teacher assessment drafts auto-saved locally before publish
 * - aiExtractionSessions: Uploaded PDF/image files, last page, and staged AI questions isolated per assessmentId
 */
export class SpiderMathDatabase extends Dexie {
  activeQuizzes!: Table<ActiveQuizRecord, string>;
  syncQueue!: Table<SyncQueueRecord, string>;
  assessmentDrafts!: Table<AssessmentDraft, string>;
  aiExtractionSessions!: Table<IAiExtractionSessionRecord, string>;

  constructor() {
    super('SpiderMathOfflineDB');
    this.version(1).stores({
      activeQuizzes: 'assessmentId, unitId, cachedAt, isCompleted',
      syncQueue: 'idempotencyKey, assessmentId, status, createdAt'
    });
    this.version(2).stores({
      assessmentDrafts: 'draftId, assessmentId, curriculum, gradeLevel, updatedAt'
    });
    this.version(3).stores({
      aiExtractionSessions: 'assessmentId, updatedAt'
    });
  }
}

/**
 * Singleton database instance for client-side storage.
 */
export const spiderMathDb = new SpiderMathDatabase();
