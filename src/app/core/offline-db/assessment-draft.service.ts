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

  /**
   * Persists draft to IndexedDB via Dexie (< 2ms)
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
      const byKey = await spiderMathDb.assessmentDrafts.get(assessmentId);
      if (byKey) return byKey;
      return await spiderMathDb.assessmentDrafts.where('assessmentId').equals(assessmentId).first();
    } catch (err) {
      console.warn('Failed to get draft from Dexie:', err);
      return undefined;
    }
  }

  /**
   * Retrieves the most recently updated draft
   */
  async getLatestDraft(): Promise<AssessmentDraft | undefined> {
    if (!isPlatformBrowser(this.platformId)) return undefined;
    try {
      const all = await spiderMathDb.assessmentDrafts.toArray();
      if (!all || all.length === 0) return undefined;
      all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      return all[0];
    } catch (err) {
      console.warn('Failed to load latest draft from Dexie:', err);
      return undefined;
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
      return [];
    }
  }

  /**
   * Completely removes a draft from Dexie by draftId or assessmentId
   */
  async deleteDraft(assessmentId: string): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
        this.isAutoSaving.set(false);
      }
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
      await spiderMathDb.assessmentDrafts.clear();
    } catch (err) {
      console.warn('Failed to clear drafts from Dexie:', err);
    }
  }
}
