/**
 * Spider Math Educational Platform (v2.2)
 * Phase 14: Dedicated Assessment & Quiz Studio Models
 */

import {
  CurriculumCode,
  AcademicTermCode,
  CalculatorMode,
  QuestionType,
  GradeOption
} from '../curriculum-studio/curriculum-studio.models';

export interface AssessmentQuestionItem {
  id: string;
  order: number;
  type: QuestionType;
  textAr: string;
  questionImageUrl?: string | null;
  options: string[];
  correctOptionIndex: number;
  points: number;
  explanationAr?: string;
  youtubeSolutionUrl?: string | null;
}

export interface AssessmentItem {
  id: string;
  titleAr: string;
  titleEn?: string;
  curriculum: CurriculumCode;
  gradeLevel: string;
  term: AcademicTermCode;
  calculatorType: CalculatorMode;
  durationMinutes: number;
  passPercentage: number;
  maxAttempts: number;
  availableFrom?: string | null;
  availableUntil?: string | null;
  isScheduled?: boolean;
  totalPoints: number;
  isPublished: boolean;
  isPlacementTest: boolean;
  submissionsCount: number;
  questions: AssessmentQuestionItem[];
}
