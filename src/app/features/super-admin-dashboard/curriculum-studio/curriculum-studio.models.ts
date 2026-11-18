/**
 * Spider Math Educational Platform (v2.2)
 * Phase 14: Curriculum Studio Models
 */

export type CurriculumCode = 'EGYPTIAN' | 'GULF' | 'INTERNATIONAL' | 'AMERICAN';
export type AcademicTermCode = 'TERM_1' | 'TERM_2';
export type CalculatorMode = 'NONE' | 'DESMOS';
export type QuestionType = 'MCQ' | 'ESSAY' | 'ESSAY_PHOTO' | 'INPUT_TEXT';

export interface GradeOption {
  code: string;
  order?: number;
  titleAr: string;
  titleEn: string;
  shortLabelAr?: string;
  shortLabelEn?: string;
  stageCode?: string;
  stageAr?: string;
  stageEn?: string;
  countryCode?: string;
  divisionCode?: string;
  isCustom?: boolean;
}

export interface CurriculumStageItem {
  code: string;
  order?: number;
  nameAr: string;
  nameEn?: string;
  gradeCodes?: string[];
}

export interface CurriculumDivisionItem {
  code: string;
  nameAr: string;
  nameEn?: string;
  iconName?: string;
  stages?: CurriculumStageItem[];
}

export interface CurriculumTrackItem {
  code: CurriculumCode;
  nameAr: string;
  nameEn?: string;
  divisions?: CurriculumDivisionItem[];
  stages?: CurriculumStageItem[];
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
  acceptedAnswers?: string[];
  points: number;
  moduleIndex?: 1 | 2;
}

export type AssessmentAdminType = 'QUIZ' | 'HOMEWORK' | 'COMPREHENSIVE_EXAM';

export interface AssessmentAdminItem {
  id: string;
  unitId: string;
  lectureId?: string | null;
  titleAr: string;
  titleEn?: string;
  type?: AssessmentAdminType;
  calculatorType: CalculatorMode;
  durationMinutes: number;
  isMultiModule?: boolean;
  module1TimeMinutes?: number;
  module2TimeMinutes?: number;
  submissionsCount: number;
  xpReward?: number | null;
  referenceSheetUrl?: string | null;
  requiresTeacherReview?: boolean;
  questions: QuestionAdminItem[];
}

export interface LectureAdminItem {
  id: string;
  order: number;
  titleAr: string;
  titleEn?: string;
  youtubeUrl: string;
  encryptedVideoId: string;
  googleDrivePdfFileId: string;
  isPrintAllowed: boolean;
  durationMinutes: number;
  isFree?: boolean;
  isFreeTrial?: boolean;
  xpReward?: number | null;
  hasAssessment?: boolean;
  assessmentId?: string;
}

export interface UnitPackageAdminItem {
  id: string;
  order?: number;
  titleAr: string;
  titleEn: string;
  curriculum: CurriculumCode;
  gradeLevel: string;
  term: AcademicTermCode;
  type: 'STUDY_UNIT' | 'REVISION_PACKAGE';
  isPublished: boolean;
  priceEgp: number;
  originalPriceEgp?: number | null;
  discountPercentage?: number | null;
  isDiscounted?: boolean;
  lectures: LectureAdminItem[];
  assessments: AssessmentAdminItem[];
}
