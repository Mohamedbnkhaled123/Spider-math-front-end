/**
 * Spider Math Educational Platform (v2.2)
 * Phase 12: Offline-First Quiz Engine & Dexie.js Database Models
 */

export type UrgencyState = 'CALM' | 'WARNING' | 'ORANGE_WARNING' | 'CRITICAL' | 'EXPIRED';

export type SyncStatus = 'IDLE' | 'QUEUED_OFFLINE' | 'SYNCING' | 'SYNCED_ONLINE' | 'FAILED';

export interface CachedQuestionOption {
  option_index: number;
  text_ar: string;
  text_en: string;
}

export interface CachedQuestion {
  _id: string;
  question_order: number;
  question_type?: string;
  question_text_ar: string;
  question_text_en: string;
  question_image_url?: string;
  options: CachedQuestionOption[];
  points: number;
  module_index?: 1 | 2;
  requires_desmos?: boolean;
}

export interface ActiveQuizRecord {
  assessmentId: string;
  idempotencyKey?: string;
  title: string;
  unitId?: string;
  referenceSheetUrl?: string | null;
  durationMinutes: number;
  // Multi-Module Additive Fields
  isMultiModule?: boolean;
  module1DurationMinutes?: number;
  module2DurationMinutes?: number;
  currentModule?: 1 | 2;
  module1Locked?: boolean;
  module1ElapsedSeconds?: number;
  module2StartedAt?: string;
  questions: CachedQuestion[];
  elapsedSeconds: number;
  selectedAnswers: Record<string, number>;
  textAnswers?: Record<string, string>;
  uploadedImages: Array<{
    questionId?: string;
    imageUrl: string;
    rotation: number;
    sizeKb: number;
  }>;
  clientStartedAt: string;
  serverStartedAt?: string;
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
  textAnswers?: Array<{
    question_id: string;
    text_answer: string;
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
  assessment_id?: string;
  title?: string;
  unit_id?: string;
  duration_minutes?: number;
  questions?: CachedQuestion[];
  client_started_at?: string;
  server_started_at?: string;
  serverStartedAt?: string;
  idempotencyKey?: string;
  assessment?: any;
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
