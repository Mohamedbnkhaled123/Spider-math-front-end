/**
 * Spider Math Educational Platform (v2.2)
 * Phase 15 - Milestone 3: Teacher Student-Simulation Preview Models
 */

import { AssessmentQuestionItem } from '../assessment-studio.models';

export interface PreviewScoringSummary {
  allQuestionsCount: number;
  mcqCount: number;
  inputTextCount: number;
  essayCount: number;
  hasEssayQuestions: boolean;
  totalPoints: number;
  autoTotalPoints: number;
  autoEarnedPoints: number;
  mcqTotalPoints: number;
  mcqEarnedPoints: number;
  inputTextTotalPoints: number;
  inputTextEarnedPoints: number;
  essayTotalPoints: number;
  percentage: number;
  isPassed: boolean;
}

export function isInputTextQuestion(q: AssessmentQuestionItem): boolean {
  if (!q) return false;
  const rawType = (q.type as string || '').toUpperCase();
  if (rawType === 'INPUT_TEXT' || rawType === 'SHORT_ANSWER') return true;
  if (rawType !== 'ESSAY' && rawType !== 'ESSAY_PHOTO' && Array.isArray(q.acceptedAnswers) && q.acceptedAnswers.length > 0) {
    return true;
  }
  return false;
}

export function isEssayQuestion(q: AssessmentQuestionItem): boolean {
  if (!q) return false;
  if (isInputTextQuestion(q)) return false;
  const rawType = (q.type as string || '').toUpperCase();
  if (rawType === 'ESSAY' || rawType === 'ESSAY_PHOTO') return true;
  if (rawType === 'MCQ') return false;
  // Fallback for legacy items without explicit question_type
  return !q.options || q.options.length === 0;
}

export function isMcqQuestion(q: AssessmentQuestionItem): boolean {
  if (!q) return false;
  return !isInputTextQuestion(q) && !isEssayQuestion(q);
}

/**
 * Digit and Text normalization matching utilities for INPUT_TEXT auto-grading.
 */
export function normalizeDigits(str: string): string {
  const easternToWestern: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
  };
  return str.replace(/[٠-٩۰-۹]/g, (d) => easternToWestern[d] || d);
}

export function normalizeTextAnswer(str: string): string {
  if (!str) return '';
  let res = normalizeDigits(str.trim());
  res = res.replace(/[\u064B-\u065F\u0670]/g, '');
  res = res.replace(/\u0640/g, '');
  res = res.replace(/[أإآٱ]/g, 'ا');
  res = res.replace(/ة/g, 'ه');
  res = res.replace(/ى/g, 'ي');
  res = res.toLowerCase();
  res = res.replace(/\s*([+\-*/=^<>()\[\],])\s*/g, '$1');
  return res.replace(/\s+/g, ' ').trim();
}

export function parseMathNumericValue(str: string): number | null {
  if (!str) return null;
  const cleaned = normalizeDigits(str.trim()).replace(/\s+/g, '');
  let normalizedDec = cleaned;
  if (/^-?\d+,\d+$/.test(normalizedDec)) {
    normalizedDec = normalizedDec.replace(',', '.');
  }
  const fractionMatch = normalizedDec.match(/^(-?\d+)\/(\d+)$/);
  if (fractionMatch) {
    const num = parseFloat(fractionMatch[1]);
    const den = parseFloat(fractionMatch[2]);
    if (den !== 0) return num / den;
  }
  if (/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(normalizedDec)) {
    const val = Number(normalizedDec);
    if (!isNaN(val) && isFinite(val)) return val;
  }
  return null;
}

export function isTextAnswerMatch(studentAns: string, acceptedAns: string): boolean {
  if (!studentAns || !acceptedAns) return false;
  const normS = normalizeTextAnswer(studentAns);
  const normA = normalizeTextAnswer(acceptedAns);
  if (normS === normA) return true;
  const studentNum = parseMathNumericValue(studentAns);
  const acceptedNum = parseMathNumericValue(acceptedAns);
  if (studentNum !== null && acceptedNum !== null && Math.abs(studentNum - acceptedNum) < 1e-6) {
    return true;
  }
  return false;
}


