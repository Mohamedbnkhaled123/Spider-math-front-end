import { CurriculumCode, AcademicTermCode } from '../../../core/constants/curriculum-tree.constant';

export interface ITrialLecture {
  _id: string;
  titleAr: string;
  titleEn: string;
  durationMinutes: number;
  curriculum: CurriculumCode;
  gradeLevel: string;
  academicTerm: AcademicTermCode;
  videoThumbnailUrl?: string;
  descriptionAr: string;
  descriptionEn: string;
}

export interface IInactiveStudentDashboardState {
  studentHaCode: string;
  studentName: string;
  curriculum: CurriculumCode;
  gradeLevel: string;
  academicTerm: AcademicTermCode;
  placementScore?: number;
  trialLectures: ITrialLecture[];
}
