import Dexie, { type Table } from 'dexie';
import { ActiveQuizRecord, SyncQueueRecord } from './quiz-cache.models';
import { AssessmentDraft } from './assessment-draft.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 12 & Phase 15: Dexie.js Client-Side IndexedDB Database
 * 
 * Tables:
 * - activeQuizzes: In-progress assessment bundles with elapsed seconds & answers
 * - syncQueue: Completed attempts queued offline or awaiting sync with 1s-15s jitter shield
 * - assessmentDrafts: Teacher assessment drafts auto-saved locally before publish
 */
export class SpiderMathDatabase extends Dexie {
  activeQuizzes!: Table<ActiveQuizRecord, string>;
  syncQueue!: Table<SyncQueueRecord, string>;
  assessmentDrafts!: Table<AssessmentDraft, string>;

  constructor() {
    super('SpiderMathOfflineDB');
    this.version(1).stores({
      activeQuizzes: 'assessmentId, unitId, cachedAt, isCompleted',
      syncQueue: 'idempotencyKey, assessmentId, status, createdAt'
    });
    this.version(2).stores({
      assessmentDrafts: 'draftId, assessmentId, curriculum, gradeLevel, updatedAt'
    });
  }
}

/**
 * Singleton database instance for client-side storage.
 */
export const spiderMathDb = new SpiderMathDatabase();
