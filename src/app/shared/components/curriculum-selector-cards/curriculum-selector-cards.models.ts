import { CurriculumCode, AcademicTermCode, ICurriculumNode, IGradeLevelMeta } from '../../../core/constants/curriculum-tree.constant';

export interface ICurriculumSelection {
  curriculum: CurriculumCode;
  gradeLevel: string;
  academicTerm: AcademicTermCode;
}

export interface IGradeLevelAvailability extends IGradeLevelMeta {
  isAvailable: boolean;
  publishedUnitsCount: number;
  hasPublishedUnits: boolean;
}

export interface ICurriculumUiCard extends ICurriculumNode {
  availableGrades: IGradeLevelAvailability[];
  isAvailable: boolean;
  publishedUnitsCount: number;
}
