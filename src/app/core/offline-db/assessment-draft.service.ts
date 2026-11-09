import { Injectable, inject, PLATFORM_ID, signal, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { spiderMathDb } from './spider-math-db';
import { AssessmentDraft } from './assessment-draft.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 15: Teacher Assessment Auto-Save & Draft Dexie Service (Milestone 2 - R2)
 * 
 * - Manages IndexedDB persistence of assessment drafts using Dexie.js
 * - Provides debounced auto-save (default 600ms) for real-time keystroke safety
 * - Provides immediate draft save, retrieval, listing, and guaranteed cleanup
 * - SSR-safe with platform checks
 */
@Injectable({
  providedIn: 'root'
})
export class AssessmentDraftService implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly LOCAL_PREFIX = 'spider_assessment_draft_v2_';
  private readonly LOCAL_INDEX_KEY = 'spider_assessment_draft_v2_index';

  // Status Signals for Visual Feedback
  readonly isAutoSaving = signal<boolean>(false);
  readonly lastSavedTimestamp = signal<number | null>(null);

  private debounceTimer: any = null;

  ngOnDestroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  private writeLocalMirror(draft: AssessmentDraft): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const key = `${this.LOCAL_PREFIX}${draft.draftId}`;
      localStorage.setItem(key, JSON.stringify(draft));
      if (draft.assessmentId && draft.assessmentId !== draft.draftId) {
        localStorage.setItem(`${this.LOCAL_PREFIX}${draft.assessmentId}`, JSON.stringify(draft));
      }
      const rawIdx = localStorage.getItem(this.LOCAL_INDEX_KEY);
      const ids: string[] = rawIdx ? JSON.parse(rawIdx) : [];
      if (!ids.includes(draft.draftId)) {
        ids.push(draft.draftId);
        localStorage.setItem(this.LOCAL_INDEX_KEY, JSON.stringify(ids));
      }
    } catch {
      // Ignore quota errors on localStorage; IndexedDB still handles large payloads
    }
  }

  private readLocalMirror(assessmentId: string): AssessmentDraft | undefined {
    if (!isPlatformBrowser(this.platformId)) return undefined;
    try {
      const raw = localStorage.getItem(`${this.LOCAL_PREFIX}${assessmentId}`);
      if (!raw) return undefined;
      return JSON.parse(raw) as AssessmentDraft;
    } catch {
      return undefined;
    }
  }

  private removeLocalMirror(assessmentId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const existing = this.readLocalMirror(assessmentId);
      if (existing) {
        localStorage.removeItem(`${this.LOCAL_PREFIX}${existing.draftId}`);
        if (existing.assessmentId) {
          localStorage.removeItem(`${this.LOCAL_PREFIX}${existing.assessmentId}`);
        }
      }
      localStorage.removeItem(`${this.LOCAL_PREFIX}${assessmentId}`);
      const rawIdx = localStorage.getItem(this.LOCAL_INDEX_KEY);
      if (rawIdx) {
        const ids: string[] = JSON.parse(rawIdx);
        const remainingIds: string[] = [];
        for (const id of ids) {
          if (id === assessmentId || (existing && (id === existing.draftId || id === existing.assessmentId))) {
            localStorage.removeItem(`${this.LOCAL_PREFIX}${id}`);
            continue;
          }
          const item = this.readLocalMirror(id);
          if (!item || item.draftId === assessmentId || item.assessmentId === assessmentId) {
            localStorage.removeItem(`${this.LOCAL_PREFIX}${id}`);
            if (item?.assessmentId) {
              localStorage.removeItem(`${this.LOCAL_PREFIX}${item.assessmentId}`);
            }
            continue;
          }
          remainingIds.push(id);
        }
        localStorage.setItem(this.LOCAL_INDEX_KEY, JSON.stringify(remainingIds));
      }
    } catch {}
  }

  private readAllLocalMirrors(): AssessmentDraft[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const rawIdx = localStorage.getItem(this.LOCAL_INDEX_KEY);
      const ids: string[] = rawIdx ? JSON.parse(rawIdx) : [];
      const results: AssessmentDraft[] = [];
      for (const id of ids) {
        const item = this.readLocalMirror(id);
        if (item) results.push(item);
      }
      return results;
    } catch {
      return [];
    }
  }

  /**
   * Synchronously reads a draft from the localStorage mirror if available
   */
  getDraftSync(assessmentId: string): AssessmentDraft | undefined {
    return this.readLocalMirror(assessmentId);
  }

  /**
   * Persists draft to IndexedDB via Dexie (< 2ms) + synchronous localStorage mirror
   */
  async saveDraft(draft: AssessmentDraft): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    try {
      this.isAutoSaving.set(true);
      draft.updatedAt = Date.now();
      if (!draft.createdAt) {
        draft.createdAt = draft.updatedAt;
      }
      this.writeLocalMirror(draft);
      await spiderMathDb.assessmentDrafts.put(draft);
      this.lastSavedTimestamp.set(draft.updatedAt);
    } catch (err) {
      console.warn('Failed to save assessment draft to Dexie:', err);
    } finally {
      this.isAutoSaving.set(false);
    }
  }

  /**
   * Immediate alias to saveDraft
   */
  async saveDraftNow(draft: AssessmentDraft): Promise<void> {
    return this.saveDraft(draft);
  }

  /**
   * Debounced save (default 600ms) for reactive keystroke editing
   */
  scheduleDebouncedSave(draft: AssessmentDraft, delayMs = 600): void {
    if (!isPlatformBrowser(this.platformId)) return;
    draft.updatedAt = Date.now();
    if (!draft.createdAt) {
      draft.createdAt = draft.updatedAt;
    }
    this.writeLocalMirror(draft);
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.isAutoSaving.set(true);
    this.debounceTimer = setTimeout(async () => {
      await this.saveDraft(draft);
      this.debounceTimer = null;
    }, delayMs);
  }

  /**
   * Retrieves draft by assessmentId or draftId
   */
  async getDraft(assessmentId: string): Promise<AssessmentDraft | undefined> {
    if (!isPlatformBrowser(this.platformId)) return undefined;
    try {
      let dexieDraft = await spiderMathDb.assessmentDrafts.get(assessmentId);
      if (!dexieDraft) {
        dexieDraft = await spiderMathDb.assessmentDrafts.where('assessmentId').equals(assessmentId).first();
      }
      return dexieDraft;
    } catch (err) {
      console.warn('Failed to get draft from Dexie:', err);
      return this.readLocalMirror(assessmentId);
    }
  }

  /**
   * Retrieves the most recently updated draft
   */
  async getLatestDraft(): Promise<AssessmentDraft | undefined> {
    if (!isPlatformBrowser(this.platformId)) return undefined;
    try {
      const all = await spiderMathDb.assessmentDrafts.toArray();
      if (all.length === 0) return undefined;
      all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      return all[0];
    } catch (err) {
      console.warn('Failed to load latest draft from Dexie:', err);
      const localAll = this.readAllLocalMirrors();
      if (localAll.length === 0) return undefined;
      localAll.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      return localAll[0];
    }
  }

  /**
   * Lists all drafts in the database
   */
  async listDrafts(): Promise<AssessmentDraft[]> {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      return await spiderMathDb.assessmentDrafts.toArray();
    } catch (err) {
      console.warn('Failed to list drafts from Dexie:', err);
      return this.readAllLocalMirrors();
    }
  }

  /**
   * Completely removes a draft from Dexie and localStorage by draftId or assessmentId
   */
  async deleteDraft(assessmentId: string): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
        this.isAutoSaving.set(false);
      }
      this.removeLocalMirror(assessmentId);
      await spiderMathDb.assessmentDrafts.delete(assessmentId);
      await spiderMathDb.assessmentDrafts.where('assessmentId').equals(assessmentId).delete();
    } catch (err) {
      console.warn('Failed to delete draft from Dexie:', err);
    }
  }

  /**
   * Clears all assessment drafts
   */
  async clearAllDrafts(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
        this.isAutoSaving.set(false);
      }
      const localAll = this.readAllLocalMirrors();
      for (const d of localAll) {
        this.removeLocalMirror(d.draftId);
        if (d.assessmentId) this.removeLocalMirror(d.assessmentId);
      }
      localStorage.removeItem(this.LOCAL_INDEX_KEY);
      await spiderMathDb.assessmentDrafts.clear();
    } catch (err) {
      console.warn('Failed to clear drafts from Dexie:', err);
    }
  }
}
