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
  avatarUrl?: string;
  avatar_url?: string;
  activeUnitsCount: number;
  totalXp: number;
  lastSeenAt?: string | Date | null;
  isOnline?: boolean;
  presence?: {
    isOnline: boolean;
    lastSeenAt?: string | Date | null;
    lastHeartbeatAt?: string | Date | null;
    activityType?: string;
  };
}

export interface LinkChildRequestPayload {
  studentCode?: string;
  student_ha_code?: string;
}
