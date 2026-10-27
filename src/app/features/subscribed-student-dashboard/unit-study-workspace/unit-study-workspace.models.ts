/**
 * Spider Math Educational Platform (v2.2)
 * Phase 13: Unit Study Workspace Models
 */

export interface LessonLectureItem {
  _id: string;
  order: number;
  titleAr: string;
  titleEn: string;
  durationMinutes: number;
  encryptedVideoId: string;
  googleDrivePdfFileId?: string;
  isPrintAllowed: boolean;
  watchPercentage: number;
  isCompleted: boolean;
  hasAssessment: boolean;
  assessmentId?: string;
  isAccessible?: boolean;
  isFreeTrial?: boolean;
}

export interface UnitAssessmentItem {
  _id: string;
  titleAr: string;
  titleEn: string;
  assessmentType: 'QUIZ' | 'HOMEWORK' | 'EXAM';
  totalPoints: number;
  timeLimitMinutes: number;
  maxAttempts: number;
  availableFrom?: string | null;
  availableUntil?: string | null;
  studentAttemptStatus?: {
    completedAttemptsCount: number;
    inProgressSubmissionId: string | null;
    latestSubmissionId: string | null;
    resultVisibility: string | null;
    finalTotalScore: number | null;
    timeWindowState: 'UPCOMING' | 'EXPIRED' | 'OPEN';
  };
}

export interface UnitWorkspaceData {
  unitId: string;
  titleAr: string;
  titleEn: string;
  curriculum: string;
  gradeLevel: string;
  term: string;
  isSubscribed?: boolean;
  lectures: LessonLectureItem[];
  assessments: UnitAssessmentItem[];
}
