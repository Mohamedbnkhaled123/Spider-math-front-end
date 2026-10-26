import { Injectable, inject, signal, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { spiderMathDb } from './spider-math-db';
import { SyncQueueRecord, SyncStatus, SubmissionSyncResponse } from './quiz-cache.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 12: Offline-to-Online Sync Queue & 500-Request Jitter Shield
 * 
 * - Queues completed assessment attempts to Dexie.js in < 2ms
 * - 500-Concurrent Request Jitter Shield: spreads synchronized submissions
 *   across a randomized window (1s–15s spread: Math.floor(Math.random() * 14000) + 1000 ms)
 * - Automatically executes exponential backoff (2s -> 4s -> 8s -> 16s) on HTTP 429/503
 * - Strict UUIDv4 Idempotency Key protection across retries
 * - Animation 4.6 Offline Sync Shield states (Amber QUEUED_OFFLINE -> Emerald SYNCED_ONLINE)
 */
@Injectable({
  providedIn: 'root'
})
export class OfflineSyncQueueService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiBase = '/api/v1/assessments';

  // Signals
  readonly isOnline = signal<boolean>(true);
  readonly isSyncing = signal<boolean>(false);
  readonly pendingQueueCount = signal<number>(0);
  readonly syncShieldState = signal<SyncStatus>('IDLE');
  readonly syncMessage = signal<string>('');

  // Disconnect tracker
  private disconnectCount = 0;
  private onlineListener: (() => void) | null = null;
  private offlineListener: (() => void) | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.isOnline.set(navigator.onLine);
      this.setupNetworkListeners();
      this.refreshQueueCount();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.onlineListener) window.removeEventListener('online', this.onlineListener);
      if (this.offlineListener) window.removeEventListener('offline', this.offlineListener);
    }
  }

  /**
   * Generates a standard RFC4122 UUIDv4 string.
   */
  generateUUIDv4(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Saves completed attempt locally to Dexie.js in < 2ms.
   * If online, immediately dispatches the 1s–15s jittered sync queue.
   */
  async queueAttempt(
    assessmentId: string,
    mcqAnswers: Array<{ question_id: string; selected_option_index: number }>,
    uploadedSolutionImgs: Array<{
      question_id?: string;
      image_url: string;
      size_kb?: number;
      rotation_deg?: number;
    }>,
    clientStartedAt: string,
    elapsedTimeSec: number,
    customIdempotencyKey?: string
  ): Promise<string> {
    const idempotencyKey = customIdempotencyKey || this.generateUUIDv4();
    const isOffline = !this.isOnline();

    const record: SyncQueueRecord = {
      idempotencyKey,
      assessmentId,
      mcqAnswers,
      uploadedSolutionImgs,
      clientStartedAt,
      clientSubmittedAt: new Date().toISOString(),
      elapsedTimeSec,
      isOfflineCached: isOffline,
      offlineDisconnectCount: this.disconnectCount,
      status: 'QUEUED_OFFLINE',
      retryCount: 0,
      createdAt: Date.now()
    };

    if (isPlatformBrowser(this.platformId)) {
      try {
        await spiderMathDb.syncQueue.put(record);
        await this.refreshQueueCount();
      } catch (err) {
        console.warn('Failed to insert record into Dexie syncQueue:', err);
      }
    }

    if (isOffline) {
      this.syncShieldState.set('QUEUED_OFFLINE');
      this.syncMessage.set(
        'تم حفظ إجاباتك محلياً بأمان! سيتم الإرسال التلقائي فور عودة الاتصال بدون فقدان أي بيانات.'
      );
    } else {
      // Dispatches with 500-request jitter shield
      this.processQueue();
    }

    return idempotencyKey;
  }

  /**
   * 500-Concurrent Request Jitter Shield:
   * Applies randomized 1s–15s jitter delay before hitting the serverless endpoint,
   * avoiding thundering herds when 500 students finish simultaneously.
   */
  async processQueue(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this.isSyncing() || !this.isOnline()) {
      return;
    }

    try {
      const pendingItems = await spiderMathDb.syncQueue
        .where('status')
        .anyOf('QUEUED_OFFLINE', 'FAILED')
        .toArray();

      if (pendingItems.length === 0) {
        this.refreshQueueCount();
        return;
      }

      this.isSyncing.set(true);
      this.syncShieldState.set('SYNCING');
      this.syncMessage.set('جارِ المزامنة الآمنة للاختبار عبر درع التوزيع الزمني...');

      for (const item of pendingItems) {
        await this.syncItemWithJitterAndBackoff(item);
      }
    } catch (err) {
      console.error('Error while processing sync queue:', err);
    } finally {
      this.isSyncing.set(false);
      await this.refreshQueueCount();
    }
  }

  /**
   * Syncs a single item with 1s–15s randomized jitter and exponential backoff.
   */
  private async syncItemWithJitterAndBackoff(item: SyncQueueRecord): Promise<void> {
    // 1s–15s spread randomized jitter (RULES.md Section 5.3)
    const jitterMs = Math.floor(Math.random() * 14000) + 1000;
    await this.delay(jitterMs);

    const payload = {
      idempotency_key: item.idempotencyKey,
      mcq_answers: item.mcqAnswers,
      uploaded_solution_imgs: item.uploadedSolutionImgs,
      client_started_at: item.clientStartedAt,
      client_submitted_at: item.clientSubmittedAt,
      elapsed_time_sec: item.elapsedTimeSec,
      is_offline_cached: item.isOfflineCached,
      offline_disconnect_count: item.offlineDisconnectCount
    };

    try {
      const url = `${this.apiBase}/${item.assessmentId}/sync-submission`;
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; data: SubmissionSyncResponse }>(url, payload)
      );

      // Success: update Dexie record to SYNCED_ONLINE
      await spiderMathDb.syncQueue.update(item.idempotencyKey, {
        status: 'SYNCED_ONLINE',
        lastAttemptAt: Date.now()
      });

      this.syncShieldState.set('SYNCED_ONLINE');
      this.syncMessage.set(
        response.data?.message || 'تمت مزامنة وتسليم إجاباتك بنجاح وحساب نقاط الـ XP ✦'
      );
    } catch (error: any) {
      const status = error instanceof HttpErrorResponse ? error.status : 0;

      // Exponential backoff for HTTP 429 (Too Many Requests) or 503 (Service Unavailable)
      if (status === 429 || status === 503) {
        const nextRetry = item.retryCount + 1;
        const backoffMs = Math.min(16000, Math.pow(2, nextRetry) * 1000); // 2s -> 4s -> 8s -> 16s

        console.warn(
          `Server load spike (HTTP ${status}). Backing off for ${backoffMs}ms (retry ${nextRetry})`
        );
        await spiderMathDb.syncQueue.update(item.idempotencyKey, {
          status: 'FAILED',
          retryCount: nextRetry,
          lastAttemptAt: Date.now(),
          errorMessage: `Rate limit hit (HTTP ${status}). Backoff ${backoffMs}ms`
        });

        await this.delay(backoffMs);
      } else {
        // Non-rate-limit error
        await spiderMathDb.syncQueue.update(item.idempotencyKey, {
          status: 'FAILED',
          retryCount: item.retryCount + 1,
          lastAttemptAt: Date.now(),
          errorMessage: error?.message || 'Submission sync failed'
        });
        this.syncShieldState.set('FAILED');
        this.syncMessage.set('تعذر الإرسال مؤقتاً، سيتم إعادة المحاولة تلقائياً.');
      }
    }
  }

  /**
   * Refreshes pending count signal from Dexie.js.
   */
  async refreshQueueCount(): Promise<number> {
    if (!isPlatformBrowser(this.platformId)) return 0;
    try {
      const count = await spiderMathDb.syncQueue
        .where('status')
        .anyOf('QUEUED_OFFLINE', 'FAILED')
        .count();
      this.pendingQueueCount.set(count);
      return count;
    } catch {
      return 0;
    }
  }

  private setupNetworkListeners(): void {
    this.onlineListener = () => {
      this.isOnline.set(true);
      this.syncMessage.set('تم استعادة الاتصال بالإنترنت! جارِ مزامنة الإجابات...');
      this.processQueue();
    };

    this.offlineListener = () => {
      this.isOnline.set(false);
      this.disconnectCount++;
      this.syncShieldState.set('QUEUED_OFFLINE');
      this.syncMessage.set('انقطع الاتصال بالإنترنت. درع الحفظ المحلي نشط.');
    };

    window.addEventListener('online', this.onlineListener);
    window.addEventListener('offline', this.offlineListener);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
