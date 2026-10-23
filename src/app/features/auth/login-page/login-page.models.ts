import { UserRole } from '../../../core/auth/auth.service';
import { AppIconName } from '../../../shared/components/app-icon/app-icon.component';

export type LoginTab = 'student' | 'parent' | 'admin';

export interface RoleSimulatorPreset {
  readonly id: string;
  readonly role: UserRole;
  readonly titleAr: string;
  readonly titleEn: string;
  readonly subtitleAr: string;
  readonly subtitleEn: string;
  readonly badgeText: string;
  readonly badgeType: 'primary' | 'success' | 'warning' | 'danger' | 'accent';
  readonly icon: AppIconName;
  readonly targetRoute: string;
  readonly studentHaCode?: string;
  readonly isPendingDevice?: boolean;
  readonly hasActiveSubscription?: boolean;
  readonly fullName: string;
}
