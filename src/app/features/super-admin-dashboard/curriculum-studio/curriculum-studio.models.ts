/**
 * Spider Math Educational Platform (v2.2)
 * Phase 14: Curriculum Studio Models
 */

export type CurriculumCode = 'EGYPTIAN' | 'GULF' | 'INTERNATIONAL' | 'AMERICAN';
export type AcademicTermCode = 'TERM_1' | 'TERM_2';
export type CalculatorMode = 'NONE' | 'DESMOS';
export type QuestionType = 'MCQ' | 'ESSAY';

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

export interface AssessmentAdminItem {
  id: string;
  unitId: string;
  titleAr: string;
  calculatorType: CalculatorMode;
  durationMinutes: number;
  submissionsCount: number;
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
