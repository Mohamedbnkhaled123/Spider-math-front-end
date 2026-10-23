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
  type: 'MCQ' | 'ESSAY';
}

export interface AssessmentAttemptBundle {
  assessmentId: string;
  unitId: string;
  titleAr: string;
  titleEn: string;
  durationMinutes: number;
  questions: AssessmentQuestionItem[];
}
