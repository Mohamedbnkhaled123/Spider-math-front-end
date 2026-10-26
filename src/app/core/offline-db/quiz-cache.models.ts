/**
 * Spider Math Educational Platform (v2.2)
 * Phase 12: Offline-First Quiz Engine & Dexie.js Database Models
 */

export type UrgencyState = 'CALM' | 'WARNING' | 'CRITICAL' | 'EXPIRED';

export type SyncStatus = 'IDLE' | 'QUEUED_OFFLINE' | 'SYNCING' | 'SYNCED_ONLINE' | 'FAILED';

export interface CachedQuestionOption {
  option_index: number;
  text_ar: string;
  text_en: string;
}

export interface CachedQuestion {
  _id: string;
  question_order: number;
  question_text_ar: string;
  question_text_en: string;
  question_image_url?: string;
  options: CachedQuestionOption[];
  points: number;
  requires_desmos?: boolean;
}

export interface ActiveQuizRecord {
  assessmentId: string;
  idempotencyKey?: string;
  title: string;
  unitId?: string;
  durationMinutes: number;
  questions: CachedQuestion[];
  elapsedSeconds: number;
  selectedAnswers: Record<string, number>;
  uploadedImages: Array<{
    questionId?: string;
    imageUrl: string;
    rotation: number;
    sizeKb: number;
  }>;
  clientStartedAt: string;
  cachedAt: number;
  lastSavedAt: number;
  isCompleted: boolean;
}

export interface SyncQueueRecord {
  idempotencyKey: string;
  assessmentId: string;
  studentId?: string;
  mcqAnswers: Array<{
    question_id: string;
    selected_option_index: number;
  }>;
  uploadedSolutionImgs: Array<{
    question_id?: string;
    image_url: string;
    size_kb?: number;
    rotation_deg?: number;
  }>;
  clientStartedAt: string;
  clientSubmittedAt: string;
  elapsedTimeSec: number;
  isOfflineCached: boolean;
  offlineDisconnectCount: number;
  status: SyncStatus;
  retryCount: number;
  createdAt: number;
  lastAttemptAt?: number;
  errorMessage?: string;
}

export interface AssessmentStartResponse {
  assessment_id: string;
  title: string;
  unit_id?: string;
  duration_minutes: number;
  questions: CachedQuestion[];
  client_started_at: string;
}

export interface SubmissionSyncResponse {
  submission_id: string;
  idempotency_key: string;
  status: 'GRADED_AUTO' | 'PENDING_TEACHER_REVIEW';
  score_achieved?: number;
  total_score?: number;
  xp_awarded?: number;
  message?: string;
}
