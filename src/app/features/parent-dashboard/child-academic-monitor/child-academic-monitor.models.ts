/**
 * Spider Math Educational Platform (v2.2)
 * Phase 13: Child Academic Monitor Models
 */

export interface ChildPresenceStatus {
  isOnline: boolean;
  activityTextAr: string;
  activityTextEn: string;
  lastActiveTextAr: string;
  lastActiveTextEn: string;
}

export interface ChildUnitWatchMetric {
  unitId: string;
  unitTitleAr: string;
  unitTitleEn: string;
  watchPercentage: number;
  completedLectures: number;
  totalLectures: number;
  subscriptionExpiresAt: string;
  isExpired: boolean;
  lectures?: Array<{
    lectureId: string;
    order: number;
    titleAr: string;
    titleEn: string;
    durationMinutes: number;
    videoDurationSec?: number;
    isCompleted: boolean;
    watchPercentage: number;
  }>;
}

export type AssessmentCategoryType = 'ALL' | 'QUIZ' | 'HOMEWORK' | 'EXAM';

export interface ChildSubmissionSummary {
  submissionId: string;
  assessmentTitleAr: string;
  assessmentTitleEn: string;
  unitTitleAr: string;
  unitTitleEn?: string;
  unitId?: string;
  category: 'QUIZ' | 'HOMEWORK' | 'EXAM';
  scorePercentage: number;
  finalTotalScore: number;
  maxScore: number;
  gradedAt: string;
  status?: string;
  isPendingReview?: boolean;
  isInProgress?: boolean;
  teacherNote?: string;
  mistakeCases: Array<{
    questionOrder: number;
    errorNote: string;
    youtubeSolutionUrl?: string | null;
  }>;
}

export interface ChildAcademicReport {
  studentId: string;
  studentName: string;
  haCode: string;
  avatarUrl?: string;
  avatar_url?: string;
  presence: ChildPresenceStatus;
  overallWatchPercentage: number;
  totalXp: number;
  units: ChildUnitWatchMetric[];
  submissions: ChildSubmissionSummary[];
}
