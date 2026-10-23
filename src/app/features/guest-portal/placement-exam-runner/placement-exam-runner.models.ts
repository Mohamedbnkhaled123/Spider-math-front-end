import { CurriculumCode, AcademicTermCode } from '../../../core/constants/curriculum-tree.constant';
import { IPlacementQuestion, ISubmitPlacementResult } from '../../../core/services/public-discovery.models';

export interface IPlacementExamState {
  curriculum: CurriculumCode;
  gradeLevel: string;
  term: AcademicTermCode;
  currentQuestionIndex: number;
  selectedAnswers: Map<string, number>;
  timeRemainingSec: number;
  isCompleted: boolean;
}

export type { IPlacementQuestion, ISubmitPlacementResult };
