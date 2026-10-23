import { CurriculumCode, AcademicTermCode } from '../../../core/constants/curriculum-tree.constant';
import {
  ITeacherBio,
  IScheduleItem,
  IPricingPackage,
  ITestimonial
} from '../../../core/services/public-discovery.models';

export interface ILandingHomeState {
  selectedCurriculum: CurriculumCode;
  selectedGradeLevel: string;
  selectedTerm: AcademicTermCode;
}

export type { ITeacherBio, IScheduleItem, IPricingPackage, ITestimonial };
