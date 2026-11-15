/**
 * Spider Math Educational Platform (v2.2)
 * Phase 14: Interactive Grading Studio Models
 */

export interface GradingMistake {
  questionOrder: number;
  questionPromptText: string;
  errorNote: string;
  youtubeSolutionUrl?: string;
  solutionType?: 'VIDEO' | 'POST';
}

export interface QuestionAnswerDetail {
  questionId?: string;
  questionText: string;
  questionType: 'MCQ' | 'INPUT_TEXT' | 'ESSAY_PHOTO' | 'ESSAY';
  points: number;
  pointsEarned: number;
  isCorrect: boolean;
  // MCQ fields
  selectedOptionIndex?: number;
  correctOptionIndex?: number;
  options?: string[];
  // INPUT_TEXT fields
  studentTextAnswer?: string;
  acceptedAnswers?: string[];
  modelAnswerText?: string;
  // ESSAY / PHOTO fields
  isPendingManualGrading?: boolean;
  gradingDecision?: 'FULL' | 'HALF' | 'ZERO' | 'CUSTOM' | null;
  studentSolutionImages?: Array<{ imageUrl: string; rotation?: number }>;
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
  essayAnswers?: Array<{ question_id: string; points_earned: number; decision?: 'FULL' | 'HALF' | 'ZERO' | 'CUSTOM' }>;
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

export interface StudentQuizGroup {
  studentKey: string;
  studentId: string;
  haCode: string;
  studentName: string;
  gradeLevel: string;
  curriculum: string;
  parentPhone?: string;
  totalQuizzes: number;
  publishedQuizzes: number;
  pendingQuizzes: number;
  inProgressQuizzes: number;
  quizzes: AllQuizSubmissionItem[];
}

