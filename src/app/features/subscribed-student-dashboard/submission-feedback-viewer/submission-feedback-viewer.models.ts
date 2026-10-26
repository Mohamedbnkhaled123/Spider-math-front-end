/**
 * Spider Math Educational Platform (v2.2)
 * Phase 13: Submission Feedback Viewer Models
 */

export interface CustomMistakeItem {
  questionId?: string;
  questionOrder: number;
  questionPromptText: string;
  studentAnswerText: string;
  correctAnswerText?: string;
  errorNote: string; // Teacher's written note by Eng. Heba Abdel-Wahab
  youtubeSolutionUrl?: string | null; // Unprotected YouTube solution/post link
}

export interface QuestionReviewItem {
  questionId: string;
  questionOrder: number;
  questionType: 'MCQ' | 'ESSAY_PHOTO';
  questionText: string;
  questionImageUrl?: string | null;
  options: string[];
  studentSelectedOptionIndex?: number | null;
  studentAnswerText: string;
  correctOptionIndex?: number;
  correctAnswerText?: string;
  isCorrect?: boolean;
  points: number;
  awardedPoints?: number;
  youtubeSolutionUrl?: string | null;
  teacherNote?: string | null;
}

export interface EssaySolutionImageItem {
  imageUrl: string;
  rotationDeg: number;
  sizeKb?: number;
}

export interface SubmissionFeedbackData {
  submissionId: string;
  assessmentTitleAr: string;
  assessmentTitleEn: string;
  unitTitleAr: string;
  resultVisibility: 'HIDDEN_PENDING_TEACHER' | 'PUBLISHED_TO_STUDENT_AND_PARENT';
  mcqAutoScore: number;
  essayManualScore: number;
  finalTotalScore: number;
  maxScore: number;
  scorePercentage: number;
  gradedAt?: string;
  teacherFeedbackNotes?: string;
  customMistakeCases: CustomMistakeItem[];
  questionsReview: QuestionReviewItem[];
  essaySolutionImages: EssaySolutionImageItem[];
}
