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
  isRead: boolean;
  actionUrl?: string;
}

export interface StudentLectureItem {
  id: string;
  unitId: string;
  unitTitleAr: string;
  titleAr: string;
  durationMinutes: number;
  isWatched: boolean;
  watchProgressPercentage: number;
  xpReward: number;
  actionUrl: string;
}

export interface StudentDueQuizItem {
  id: string;
  titleAr: string;
  unitTitleAr: string;
  questionsCount: number;
  totalPoints: number;
  xpReward: number;
  dueDateAr: string;
  isUrgent?: boolean;
  canStart?: boolean;
  statusNote?: string;
  assessmentUrl: string;
}

export interface StudentCompletedGradeItem {
  id: string;
  titleAr: string;
  unitTitleAr: string;
  score: number;
  maxScore: number;
  percentage: number;
  gradeLabelAr: string;
  gradedBy: string;
  gradedDateAr: string;
  feedbackUrl: string;
}

