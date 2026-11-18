/**
 * Spider Math Educational Platform (v2.2)
 * Phase 14: Students, Subscriptions & Devices Models
 */

export interface PendingDeviceRequest {
  id: string;
  studentName: string;
  haCode: string;
  curriculum: string;
  deviceInfo: string;
  ipAddress: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface StudentAdminSummary {
  id: string;
  name: string;
  avatarUrl?: string;
  avatar_url?: string;
  role?: 'STUDENT' | 'PARENT' | 'SUPER_ADMIN';
  haCode: string;
  email: string;
  phone?: string;
  parentPhone?: string;
  curriculum: string;
  gradeLevel: string;
  academicTerm?: 'TERM_1' | 'TERM_2' | null;
  country?: string;
  isArchived?: boolean;
  archivedAt?: string | null;
  graduationStatus?: 'ACTIVE' | 'GRADUATED';
  graduatedFromGrade?: string | null;
  graduatedAt?: string | null;
  hasActiveSubscription: boolean;
  subscriptionStatus: 'ACTIVE' | 'FROZEN' | 'CANCELLED';
  totalXp: number;
  approvedDevices: number;
  isLocked: boolean;
  isLeaderboardHidden: boolean;
  isProfileCompleted?: boolean;
  lastSeenAt?: string | Date | null;
  isOnline?: boolean;
  createdAt?: string;
}

export type PromotionMode = 'TERM' | 'GRADE';

export type GraduationDecision = 'ARCHIVE' | 'DELETE' | 'SKIP';

export type PromotionEligibilityStatus =
  | 'PROMOTABLE'
  | 'GRADUATING'
  | 'INELIGIBLE_NO_TERMS'
  | 'INELIGIBLE_ALREADY_TERM_2'
  | 'INELIGIBLE_ARCHIVED'
  | 'INELIGIBLE_INCOMPLETE_PROFILE'
  | 'INELIGIBLE_NOT_STUDENT';

export interface PromotionEvaluationResult {
  eligible: boolean;
  status: PromotionEligibilityStatus;
  isGraduating: boolean;
  hasTerms: boolean;
  currentCurriculum: string;
  currentGrade: string;
  currentTerm: 'TERM_1' | 'TERM_2' | null;
  nextGrade: string | null;
  nextTerm: 'TERM_1' | 'TERM_2' | null;
  reasonAr?: string;
  reasonEn?: string;
}

export interface PromotionActionItemResult {
  studentId: string;
  fullName: string;
  studentCode?: string;
  curriculum?: string;
  fromGrade?: string;
  toGrade?: string | null;
  fromTerm?: string | null;
  toTerm?: string | null;
  status: string;
  reasonAr?: string;
  reasonEn?: string;
}

export interface PromoteStudentsResponse {
  mode: PromotionMode;
  promotedCount: number;
  archivedCount: number;
  deletedCount: number;
  skippedCount: number;
  excludedCount: number;
  promoted: PromotionActionItemResult[];
  archived: PromotionActionItemResult[];
  deleted: PromotionActionItemResult[];
  skipped: PromotionActionItemResult[];
}
