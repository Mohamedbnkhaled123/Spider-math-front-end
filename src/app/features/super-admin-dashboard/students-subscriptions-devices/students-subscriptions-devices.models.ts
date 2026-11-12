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
  hasActiveSubscription: boolean;
  subscriptionStatus: 'ACTIVE' | 'FROZEN' | 'CANCELLED';
  totalXp: number;
  approvedDevices: number;
  isLocked: boolean;
  isLeaderboardHidden: boolean;
  isProfileCompleted?: boolean;
  createdAt?: string;
}
