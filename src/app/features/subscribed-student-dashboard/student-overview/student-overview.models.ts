import { CurriculumCode, AcademicTermCode } from '../../../core/constants/curriculum-tree.constant';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 13: Subscribed Student Overview Models
 */

export interface EnrolledUnitSummary {
  _id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  type: 'STUDY_UNIT' | 'FINAL_REVISION';
  curriculum: CurriculumCode;
  gradeLevel: string;
  term: AcademicTermCode;
  totalLectures: number;
  completedLectures: number;
  completionPercentage: number;
  totalQuizzes: number;
  completedQuizzes: number;
  thumbnailUrl?: string;
  isActive: boolean;
  accessScope?: 'FULL' | 'ASSESSMENTS_ONLY';
  subscriptionExpiresAt?: string;
  subscriptionExpiresAtIso?: string;
  isExpired?: boolean;
  lectures?: Array<{
    id: string;
    order: number;
    titleAr: string;
    titleEn?: string;
    durationMinutes: number;
    videoDurationSec?: number;
    isWatched: boolean;
    watchProgressPercentage: number;
    actionUrl: string;
  }>;
}

export interface LeaderboardRankEntry {
  rank: number;
  studentId: string;
  studentName: string;
  haCode: string;
  totalXp: number;
  avatarSeed?: string;
  isCurrentUser: boolean;
}

export interface StudentNotificationItem {
  id: string;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  type: 'HOMEWORK_GRADED' | 'NEW_LECTURE' | 'XP_AWARD' | 'ANNOUNCEMENT';
  timestamp: string;
  createdAtIso?: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface StudentLectureItem {
  id: string;
  unitId: string;
  unitTitleAr: string;
  unitTitleEn?: string;
  titleAr: string;
  titleEn?: string;
  durationMinutes: number;
  videoDurationSec?: number;
  isWatched: boolean;
  watchProgressPercentage: number;
  xpReward: number;
  actionUrl: string;
}

export interface StudentDueQuizItem {
  id: string;
  titleAr: string;
  titleEn?: string;
  unitTitleAr: string;
  unitTitleEn?: string;
  categoryType: 'LECTURE_QUIZ' | 'HOMEWORK' | 'COMPREHENSIVE_EXAM' | 'GENERAL_QUIZ';
  categoryLabelAr: string;
  categoryLabelEn?: string;
  questionsCount: number;
  totalPoints: number;
  xpReward: number;
  dueDateAr: string;
  dueDateEn?: string;
  isUrgent?: boolean;
  canStart?: boolean;
  statusNote?: string;
  statusNoteEn?: string;
  assessmentUrl: string;
  isCompleted?: boolean;
  submissionId?: string;
  score?: number | null;
  maxScore?: number;
  status?: string;
  isPending?: boolean;
  feedbackUrl?: string;
  maxAttempts?: number;
  completedAttemptsCount?: number;
  canRetake?: boolean;
}

export interface StudentCompletedGradeItem {
  id: string;
  submissionId?: string;
  assessmentId?: string;
  maxAttempts?: number;
  attemptNumber?: number;
  titleAr: string;
  titleEn?: string;
  unitTitleAr: string;
  unitTitleEn?: string;
  score: number | null;
  maxScore: number;
  percentage: number | null;
  gradeLabelAr: string;
  gradeLabelEn?: string;
  status?: string;
  isPending?: boolean;
  gradedBy: string;
  gradedByAr?: string;
  gradedByEn?: string;
  gradedDateAr: string;
  gradedDateEn?: string;
  gradedAtIso?: string;
  feedbackUrl: string;
}

