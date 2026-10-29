/**
 * Spider Math Educational Platform (v2.2)
 * Phase 14: Curriculum Studio Models
 */

export type CurriculumCode = 'EGYPTIAN' | 'GULF' | 'INTERNATIONAL' | 'AMERICAN';
export type AcademicTermCode = 'TERM_1' | 'TERM_2';
export type CalculatorMode = 'NONE' | 'DESMOS';
export type QuestionType = 'MCQ' | 'ESSAY' | 'ESSAY_PHOTO';

export interface GradeOption {
  code: string;
  titleAr: string;
  titleEn: string;
}

export interface CurriculumTrackItem {
  code: CurriculumCode;
  nameAr: string;
  grades: GradeOption[];
}

export interface QuestionAdminItem {
  id: string;
  order: number;
  type: QuestionType;
  textAr: string;
  questionImageUrl?: string | null;
  options: string[];
  correctOptionIndex: number;
  points: number;
}

export type AssessmentAdminType = 'QUIZ' | 'HOMEWORK' | 'COMPREHENSIVE_EXAM';

export interface AssessmentAdminItem {
  id: string;
  unitId: string;
  titleAr: string;
  type?: AssessmentAdminType;
  calculatorType: CalculatorMode;
  durationMinutes: number;
  submissionsCount: number;
  xpReward?: number | null;
  questions: QuestionAdminItem[];
}

export interface LectureAdminItem {
  id: string;
  order: number;
  titleAr: string;
  youtubeUrl: string;
  encryptedVideoId: string;
  googleDrivePdfFileId: string;
  isPrintAllowed: boolean;
  durationMinutes: number;
  isFreeTrial?: boolean;
  xpReward?: number | null;
}

export interface UnitPackageAdminItem {
  id: string;
  titleAr: string;
  titleEn: string;
  curriculum: CurriculumCode;
  gradeLevel: string;
  term: AcademicTermCode;
  type: 'STUDY_UNIT' | 'REVISION_PACKAGE';
  isPublished: boolean;
  priceEgp: number;
  lectures: LectureAdminItem[];
  assessments: AssessmentAdminItem[];
}
