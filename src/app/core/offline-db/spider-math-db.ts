import Dexie, { type Table } from 'dexie';
import { ActiveQuizRecord, SyncQueueRecord } from './quiz-cache.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 12: Dexie.js Client-Side IndexedDB Database
 * 
 * Tables:
 * - activeQuizzes: In-progress assessment bundles with elapsed seconds & answers
 * - syncQueue: Completed attempts queued offline or awaiting sync with 1s-15s jitter shield
 */
export class SpiderMathDatabase extends Dexie {
  activeQuizzes!: Table<ActiveQuizRecord, string>;
  syncQueue!: Table<SyncQueueRecord, string>;

  constructor() {
    super('SpiderMathOfflineDB');
    this.version(1).stores({
      activeQuizzes: 'assessmentId, unitId, cachedAt, isCompleted',
      syncQueue: 'idempotencyKey, assessmentId, status, createdAt'
    });
  }
}

/**
 * Singleton database instance for client-side storage.
 */
export const spiderMathDb = new SpiderMathDatabase();
