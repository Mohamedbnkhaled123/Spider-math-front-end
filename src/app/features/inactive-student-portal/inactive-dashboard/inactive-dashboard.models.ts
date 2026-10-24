import { CurriculumCode, AcademicTermCode } from '../../../core/constants/curriculum-tree.constant';

export interface ITrialLecture {
  _id: string;
  titleAr: string;
  titleEn: string;
  durationMinutes: number;
  curriculum: CurriculumCode;
  gradeLevel: string;
  academicTerm: AcademicTermCode;
  videoThumbnailUrl?: string;
  descriptionAr: string;
  descriptionEn: string;
  is_free_trial: boolean;
  videoEmbedId?: string;
}

export interface IPlacementReportSummary {
  score: number;
  percentage: number;
  academicLevelBadgeAr: string;
  academicLevelBadgeEn: string;
  strengths: string[];
  weaknesses: string[];
  teacherRecommendationAr: string;
  teacherRecommendationEn: string;
}

export interface IInactiveStudentDashboardState {
  studentHaCode: string;
  studentName: string;
  curriculum: CurriculumCode;
  gradeLevel: string;
  academicTerm: AcademicTermCode;
  placementReport: IPlacementReportSummary;
  trialLectures: ITrialLecture[];
}
