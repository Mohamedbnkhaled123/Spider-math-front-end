/**
 * Spider Math Educational Platform (v2.2)
 * Phase 15: Teacher Assessment Auto-Save & Draft Models (Milestone 2 - R2)
 */

import {
  AssessmentItem,
  AssessmentQuestionItem
} from '../../features/super-admin-dashboard/assessment-studio/assessment-studio.models';
import {
  CurriculumCode,
  AcademicTermCode,
  CalculatorMode,
  QuestionType
} from '../../features/super-admin-dashboard/curriculum-studio/curriculum-studio.models';

export type DraftType = 'NEW' | 'EDIT';

export interface QuestionComposerSnapshot {
  editingQuestionId: string | null;
  type: QuestionType;
  textAr: string;
  imageUrl: string | null;
  options: string[];
  correctIndex: number;
  points: number;
  youtubeUrl: string;
}

export interface AssessmentDraft {
  draftId: string;              // Primary key (assessmentId for existing, or 'new_assessment_draft')
  assessmentId?: string | null; // Nullable if creating a new assessment
  draftType?: DraftType;        // 'NEW' | 'EDIT'
  titleAr: string;
  titleEn?: string;
  curriculum: CurriculumCode;
  gradeLevel: string;
  term: AcademicTermCode;
  calculatorType: CalculatorMode;
  referenceSheetUrl?: string | null;
  durationMinutes: number;
  passPercentage: number;
  maxAttempts: number;
  isScheduled: boolean;
  availableFrom?: string | null;
  availableUntil?: string | null;
  isPlacementTest: boolean;
  requiresTeacherReview: boolean;
  totalPoints: number;
  questions: AssessmentQuestionItem[];
  composerSnapshot?: QuestionComposerSnapshot;
  createdAt: number;
  updatedAt: number;
}

export type AssessmentDraftRecord = AssessmentDraft;
