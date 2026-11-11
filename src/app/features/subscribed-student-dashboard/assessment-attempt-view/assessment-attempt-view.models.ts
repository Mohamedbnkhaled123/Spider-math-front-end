/**
 * Spider Math Educational Platform (v2.2)
 * Phase 13: Assessment Attempt View Models
 */

export interface AssessmentQuestionItem {
  _id: string;
  order: number;
  textAr: string;
  textEn: string;
  imageUrl?: string;
  options: Array<{
    optionIndex: number;
    textAr: string;
    textEn: string;
  }>;
  points: number;
  requiresDesmos: boolean;
  type: 'MCQ' | 'ESSAY' | 'INPUT_TEXT';
  moduleIndex?: 1 | 2;
}

export interface AssessmentAttemptBundle {
  assessmentId: string;
  unitId: string;
  titleAr: string;
  titleEn: string;
  referenceSheetUrl?: string | null;
  durationMinutes: number;
  isMultiModule?: boolean;
  module1TimeMinutes?: number;
  module2TimeMinutes?: number;
  questions: AssessmentQuestionItem[];
}
