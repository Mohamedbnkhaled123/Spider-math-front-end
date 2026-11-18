import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { spiderMathDb } from './spider-math-db';
import {
  IAiExtractionSessionRecord,
  ICachedFileSession,
  IStagedQuestion
} from '../../features/super-admin-dashboard/assessment-studio/ai-question-extraction-modal/ai-question-extraction-modal.models';

/**
 * Persists uploaded extraction files (PDF/image Blobs), current page, selected range,
 * and staged extracted questions in IndexedDB + in-memory mirror, strictly isolated per assessmentId.
 */
@Injectable({
  providedIn: 'root'
})
export class AiExtractionSessionService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly memoryCache = new Map<string, IAiExtractionSessionRecord>();

  private cloneStagedQuestions(list: IStagedQuestion[] | undefined): IStagedQuestion[] {
    if (!Array.isArray(list)) return [];
    return list.map((q) => ({
      ...q,
      options: Array.isArray(q.options) ? [...q.options] : ['', '', '', ''],
      acceptedAnswers: Array.isArray(q.acceptedAnswers) ? [...q.acceptedAnswers] : undefined,
      accepted_answers: Array.isArray(q.accepted_answers) ? [...q.accepted_answers] : undefined,
      box_2d: Array.isArray(q.box_2d) ? ([...q.box_2d] as [number, number, number, number]) : undefined,
      moduleIndex: q.moduleIndex === 2 ? 2 : 1
    }));
  }

  private sanitizeRecord(record: IAiExtractionSessionRecord): IAiExtractionSessionRecord {
    return {
      assessmentId: (record.assessmentId || '').trim(),
      fileName: record.fileName || '',
      fileType: record.fileType === 'image' ? 'image' : 'pdf',
      fileBlob: record.fileBlob instanceof Blob ? record.fileBlob : null,
      uploadedImages: Array.isArray(record.uploadedImages)
        ? record.uploadedImages.map((img) => ({
            fileName: img.fileName || '',
            dataUrl: img.dataUrl || ''
          }))
        : [],
      pageNumber: Math.max(1, Number(record.pageNumber) || 1),
      totalPages: Math.max(1, Number(record.totalPages) || 1),
      currentDataUrl: record.currentDataUrl || null,
      lastSelectedRange: record.lastSelectedRange
        ? {
            startPage: Math.max(1, Number(record.lastSelectedRange.startPage) || 1),
            endPage: Math.max(1, Number(record.lastSelectedRange.endPage) || 1)
          }
        : undefined,
      pageScopeMode: record.pageScopeMode === 'PAGE_RANGE' ? 'PAGE_RANGE' : 'CURRENT_PAGE',
      extractionMode: record.extractionMode || 'SMART_HYBRID',
      stagedQuestions: this.cloneStagedQuestions(record.stagedQuestions),
      targetModuleIndex: record.targetModuleIndex === 2 ? 2 : 1,
      currentStep: record.currentStep || 'UPLOAD_AND_SELECT',
      updatedAt: record.updatedAt || Date.now()
    };
  }

  private reconstructFile(record: IAiExtractionSessionRecord): File | Blob | null {
    const blob = record.fileBlob;
    if (!blob) return null;
    if (typeof File !== 'undefined' && blob instanceof File) {
      return blob;
    }
    if (typeof File !== 'undefined' && blob instanceof Blob) {
      const fallbackType = record.fileType === 'pdf' ? 'application/pdf' : 'image/png';
      try {
        return new File([blob], record.fileName || (record.fileType === 'pdf' ? 'document.pdf' : 'image.png'), {
          type: blob.type || fallbackType
        });
      } catch {
        return blob;
      }
    }
    return blob;
  }

  getSessionSync(assessmentId: string): IAiExtractionSessionRecord | null {
    const cleanId = (assessmentId || '').trim();
    if (!cleanId) return null;
    return this.memoryCache.get(cleanId) || null;
  }

  async saveSession(record: IAiExtractionSessionRecord): Promise<void> {
    const cleanId = (record.assessmentId || '').trim();
    if (!cleanId) return;

    const clean = this.sanitizeRecord({ ...record, assessmentId: cleanId, updatedAt: Date.now() });
    this.memoryCache.set(cleanId, clean);

    if (!isPlatformBrowser(this.platformId) || typeof indexedDB === 'undefined') {
      return;
    }

    try {
      await spiderMathDb.aiExtractionSessions.put(clean);
    } catch (err) {
      // Fallback without Blob if structured clone ever fails on synthetic test blobs
      try {
        await spiderMathDb.aiExtractionSessions.put({ ...clean, fileBlob: null });
      } catch {
        console.warn('Failed to persist AI extraction session to IndexedDB:', err);
      }
    }
  }

  async getSession(assessmentId: string): Promise<IAiExtractionSessionRecord | null> {
    const cleanId = (assessmentId || '').trim();
    if (!cleanId) return null;

    const cached = this.memoryCache.get(cleanId);
    if (cached) return cached;

    if (!isPlatformBrowser(this.platformId) || typeof indexedDB === 'undefined') {
      return null;
    }

    try {
      const stored = await spiderMathDb.aiExtractionSessions.get(cleanId);
      if (stored) {
        const clean = this.sanitizeRecord(stored);
        this.memoryCache.set(cleanId, clean);
        return clean;
      }
    } catch (err) {
      console.warn('Failed to load AI extraction session from IndexedDB:', err);
    }
    return null;
  }

  async deleteSession(assessmentId: string): Promise<void> {
    const cleanId = (assessmentId || '').trim();
    if (!cleanId) return;

    this.memoryCache.delete(cleanId);
    if (!isPlatformBrowser(this.platformId) || typeof indexedDB === 'undefined') {
      return;
    }

    try {
      await spiderMathDb.aiExtractionSessions.delete(cleanId);
    } catch (err) {
      console.warn('Failed to delete AI extraction session from IndexedDB:', err);
    }
  }

  clearMemoryCache(): void {
    this.memoryCache.clear();
  }

  toCachedFileSession(record: IAiExtractionSessionRecord): ICachedFileSession {
    return {
      fileName: record.fileName,
      fileType: record.fileType,
      file: this.reconstructFile(record),
      pageNumber: Math.max(1, Number(record.pageNumber) || 1),
      canvas: null,
      dataUrl: record.currentDataUrl || null,
      totalPages: Math.max(1, Number(record.totalPages) || 1),
      lastSelectedRange: record.lastSelectedRange
        ? { ...record.lastSelectedRange }
        : undefined,
      uploadedImages: record.uploadedImages?.length ? [...record.uploadedImages] : undefined,
      pageScopeMode: record.pageScopeMode,
      extractionMode: record.extractionMode,
      stagedQuestions: this.cloneStagedQuestions(record.stagedQuestions),
      targetModuleIndex: record.targetModuleIndex === 2 ? 2 : 1
    };
  }
}
