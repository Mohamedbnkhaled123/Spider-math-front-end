/**
 * Spider Math Educational Platform (v2.2)
 * Phase 15 - Milestone 3: Teacher Student-Simulation Preview Models
 */

import { AssessmentQuestionItem } from '../assessment-studio.models';

export interface PreviewScoringSummary {
  allQuestionsCount: number;
  mcqCount: number;
  essayCount: number;
  hasEssayQuestions: boolean;
  totalPoints: number;
  mcqTotalPoints: number;
  mcqEarnedPoints: number;
  essayTotalPoints: number;
  percentage: number;
  isPassed: boolean;
}

export function isEssayQuestion(q: AssessmentQuestionItem): boolean {
  return q.type === 'ESSAY' || (q.type as string) === 'ESSAY_PHOTO' || !q.options || q.options.length === 0;
}
