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
}

export interface UnitWorkspaceData {
  unitId: string;
  titleAr: string;
  titleEn: string;
  curriculum: string;
  gradeLevel: string;
  term: string;
  lectures: LessonLectureItem[];
}
