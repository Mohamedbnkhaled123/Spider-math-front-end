import { CurriculumCode } from '../../../core/constants/curriculum-tree.constant';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 13: Multi-Child Parent Shell Models
 */

export interface LinkedChildSummary {
  studentId: string;
  fullName: string;
  haCode: string;
  curriculum: CurriculumCode;
  gradeLevel: string;
  avatarSeed?: string;
  activeUnitsCount: number;
  totalXp: number;
}

export interface LinkChildRequestPayload {
  student_ha_code: string;
}
