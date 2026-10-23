import { CurriculumCode, AcademicTermCode } from '../../../core/constants/curriculum-tree.constant';

export interface IProfileCompletionForm {
  fullName: string;
  phone: string;
  parentPhone: string;
  curriculum: CurriculumCode;
  gradeLevel: string;
  academicTerm: AcademicTermCode;
  country: string;
  governorate?: string;
}

export interface IProfileCompletionResponse {
  studentHaCode: string;
  user: {
    _id: string;
    full_name: string;
    student_ha_code: string;
    role: string;
  };
}
