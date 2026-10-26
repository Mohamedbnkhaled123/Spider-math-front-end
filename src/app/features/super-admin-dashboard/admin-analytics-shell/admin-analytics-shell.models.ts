/**
 * Spider Math Educational Platform (v2.2)
 * Phase 14: Admin Analytics Shell Models
 */

export type AdminTab = 'analytics' | 'curriculum' | 'assessments' | 'grading' | 'students' | 'leads_cms';

export interface AnalyticsSnapshot {
  readonly registeredStudents: number;
  readonly activeSubscriptions: number;
  readonly pendingGradingCount: number;
  readonly pendingDevicesCount: number;
  readonly newLeadsCount: number;
}

export interface BatchedNotificationItem {
  readonly id: string;
  readonly batchCount: number; // e.g. consolidated alert every 5 student submissions
  readonly assessmentTitle: string;
  readonly curriculum: string;
  readonly gradeLevel: string;
  readonly timestamp: string;
  readonly isRead: boolean;
}
