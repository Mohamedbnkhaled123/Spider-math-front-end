/**
 * Spider Math Educational Platform (v2.2)
 * Phase 14: Interactive Grading Studio Models
 */

export interface GradingMistake {
  questionOrder: number;
  questionPromptText: string;
  errorNote: string;
  youtubeSolutionUrl: string;
}

export interface QuestionAnswerDetail {
  questionText: string;
  questionType: 'MCQ' | 'ESSAY';
  points: number;
  pointsEarned: number;
  isCorrect: boolean;
  selectedOptionIndex?: number;
  correctOptionIndex?: number;
  options?: string[];
  imageUrl?: string | null;
  uploadedImageUrl?: string | null;
}

export interface AllQuizSubmissionItem {
  id: string;
  studentId: string;
  studentName: string;
  haCode: string;
  parentPhone?: string;
  curriculum: string;
  gradeLevel: string;
  assessmentId: string;
  assessmentTitle: string;
  assessmentType: 'QUIZ' | 'EXAM' | 'HOMEWORK';
  attemptNumber: number;
  totalPoints: number;
  mcqAutoScore: number;
  essayManualScore: number;
  finalTotalScore: number;
  scorePercentage: number;
  status: 'PENDING' | 'PUBLISHED' | 'IN_PROGRESS';
  hasEssayQuestions: boolean;
  submittedAt: string;
  elapsedTimeSec: number;
  isSuspiciousFastSolve: boolean;
  clockTamperDetected: boolean;
  answers: QuestionAnswerDetail[];
  homeworkImages?: Array<{ imageUrl: string; rotation?: number }>;
  teacherFeedbackNotes?: string;
}

export interface QuizSubmissionStats {
  totalSubmissions: number;
  pendingReviewCount: number;
  publishedCount: number;
  inProgressCount: number;
}

export interface PendingEssayGrading {
  id: string;
  studentId: string;
  studentName: string;
  haCode: string;
  assessmentId: string;
  assessmentTitle: string;
  questionNumber: number;
  questionText: string;
  studentAnswerImageWebp: string;
  maxScore: number;
  awardedScore: number;
  generalTeacherNote: string;
  mistakes: GradingMistake[];
  status: 'PENDING' | 'PUBLISHED';
  submittedAt: string;
}
