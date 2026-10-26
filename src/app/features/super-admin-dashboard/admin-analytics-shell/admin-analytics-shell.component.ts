import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import {
  AdminTab,
  AnalyticsSnapshot,
  BatchedNotificationItem
} from './admin-analytics-shell.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 14: Admin Analytics Shell Component
 * 
 * Sticky Sidebar Navigation, Batched Notification Center (5 submissions per alert),
 * Live KPI Analytics Cards, and 1-Click Database Backup + Ephemeral Homework Purge.
 */
@Component({
  selector: 'app-admin-analytics-shell',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  templateUrl: './admin-analytics-shell.component.html',
  styleUrl: './admin-analytics-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminAnalyticsShellComponent {
  readonly activeTab = input.required<AdminTab>();
  readonly tabChange = output<AdminTab>();

  readonly analytics = input.required<AnalyticsSnapshot>();
  readonly batchedNotifications = input<BatchedNotificationItem[]>([]);
  readonly isExporting = input<boolean>(false);
  readonly isPurging = input<boolean>(false);

  readonly backupExportRequested = output<void>();
  readonly purgeHomeworkRequested = output<void>();

  // Notification Flyout State
  readonly isNotificationsOpen = signal<boolean>(false);

  selectTab(tab: AdminTab): void {
    this.tabChange.emit(tab);
  }

  toggleNotifications(): void {
    this.isNotificationsOpen.update((open) => !open);
  }

  triggerBackup(): void {
    this.backupExportRequested.emit();
  }

  triggerPurge(): void {
    this.purgeHomeworkRequested.emit();
  }
}
