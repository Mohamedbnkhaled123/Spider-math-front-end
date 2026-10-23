import { UserRole } from '../../../core/auth/auth.service';

/**
 * Spider Math Educational Platform (v2.2)
 * Auth & Role Simulator Modal Models
 */

export interface RolePreset {
  id: string;
  role: UserRole;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  badgeText: string;
  icon: 'graduation-cap' | 'user' | 'shield' | 'clock' | 'sparkles';
  targetRoute: string;
  hasActiveSubscription?: boolean;
  isPendingDevice?: boolean;
  studentHaCode?: string;
  fullName: string;
}
