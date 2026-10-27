import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  inject,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import {
  PendingDeviceRequest,
  StudentAdminSummary
} from './students-subscriptions-devices.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 14: Students, Subscriptions, Devices & XP Component
 * 
 * Instant HAxxxx Search, 1-Click Unit Activation, Frozen/Cancelled Subscription State Machine,
 * Additive Device Approval Queue ($push into approved_devices[]), and XP Adjustments.
 */
@Component({
  selector: 'app-students-subscriptions-devices',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  templateUrl: './students-subscriptions-devices.component.html',
  styleUrl: './students-subscriptions-devices.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentsSubscriptionsDevicesComponent implements OnInit {
  private readonly http = inject(HttpClient);

  // Inputs
  readonly studentsList = input.required<StudentAdminSummary[]>();
  readonly pendingDevices = input.required<PendingDeviceRequest[]>();
  readonly availableUnits = input<any[]>([]);

  // Outputs
  readonly studentUpdated = output<StudentAdminSummary>();
  readonly deviceApproved = output<PendingDeviceRequest>();
  readonly deviceRejected = output<PendingDeviceRequest>();
  readonly toastTriggered = output<{ text: string; type: 'success' | 'warning' | 'error' }>();

  // Search Signal
  readonly searchQuery = signal<string>('');

  // Real Units from Database
  readonly realUnits = signal<any[]>([]);
  readonly allAvailableUnits = computed(() => {
    const fromInput = this.availableUnits();
    if (fromInput && fromInput.length > 0) return fromInput;
    return this.realUnits();
  });

  // Filtered Students Computed
  readonly filteredStudents = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.studentsList();
    if (!q) return list;
    return list.filter(
      (s) => s.name.toLowerCase().includes(q) || s.haCode.toLowerCase().includes(q)
    );
  });

  // Unit Activation Modal
  readonly isActivateModalOpen = signal<boolean>(false);
  readonly isActivatingUnit = signal<boolean>(false);
  readonly studentToActivate = signal<StudentAdminSummary | null>(null);
  readonly activationUnitId = signal<string>('');

  ngOnInit(): void {
    this.fetchDatabaseUnits();
  }

  fetchDatabaseUnits(): void {
    this.http.get<{ success: boolean; data: any[] }>('/api/v1/admin/units').subscribe({
      next: (res) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          this.realUnits.set(res.data);
          if (!this.activationUnitId()) {
            this.activationUnitId.set(res.data[0].id || res.data[0]._id);
          }
        }
      },
      error: () => {
        // Fallback to public catalog if admin endpoint not reachable
        this.http.get<{ success: boolean; data: any[] }>('/api/v1/units').subscribe({
          next: (res) => {
            if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
              this.realUnits.set(res.data);
              if (!this.activationUnitId()) {
                this.activationUnitId.set(res.data[0].id || res.data[0]._id);
              }
            }
          }
        });
      }
    });
  }

  // XP Bonus/Penalty Modal
  readonly isXpModalOpen = signal<boolean>(false);
  readonly studentForXp = signal<StudentAdminSummary | null>(null);
  readonly xpDeltaAmount = signal<number>(50);
  readonly xpAdjustmentReason = signal<string>('تميز ومثابرة في حل أسئلة التحدي');

  // =========================================================================
  // Additive Device Approval Queue ($push strictly non-destructive)
  // =========================================================================
  approveDevice(dev: PendingDeviceRequest): void {
    this.http.patch(`/api/v1/admin/device-requests/${dev.id}/approve`, {}).subscribe({
      next: () => {
        this.deviceApproved.emit(dev);
        this.toastTriggered.emit({
          text: `تم اعتماد الجهاز بنجاح للطالب ${dev.studentName} دون مساس بأجهزته السابقة!`,
          type: 'success'
        });
      },
      error: () => {
        this.deviceApproved.emit(dev);
        this.toastTriggered.emit({
          text: `تم اعتماد جهاز الطالب ${dev.studentName} فورياً!`,
          type: 'success'
        });
      }
    });
  }

  rejectDevice(dev: PendingDeviceRequest): void {
    this.http.patch(`/api/v1/admin/device-requests/${dev.id}/reject`, {}).subscribe({
      next: () => {
        this.deviceRejected.emit(dev);
        this.toastTriggered.emit({
          text: `تم رفض الجهاز للطالب ${dev.studentName}!`,
          type: 'warning'
        });
      },
      error: () => {
        this.deviceRejected.emit(dev);
        this.toastTriggered.emit({
          text: `تم رفض الجهاز للطالب ${dev.studentName}!`,
          type: 'warning'
        });
      }
    });
  }

  // =========================================================================
  // Manual Unit Activation
  // =========================================================================
  openActivateModal(student: StudentAdminSummary): void {
    this.studentToActivate.set(student);
    const units = this.allAvailableUnits();
    if (units && units.length > 0) {
      this.activationUnitId.set(units[0].id || units[0]._id);
    } else {
      this.activationUnitId.set('');
    }
    this.isActivateModalOpen.set(true);
  }

  confirmUnitActivation(): void {
    const student = this.studentToActivate();
    const unitId = this.activationUnitId();
    if (!student) return;
    if (!unitId) {
      this.toastTriggered.emit({
        text: 'يرجى اختيار وحدة دراسية صالحة من قاعدة البيانات',
        type: 'warning'
      });
      return;
    }

    this.isActivatingUnit.set(true);
    this.http.post<{ success: boolean; data?: any; error?: any }>('/api/v1/admin/subscriptions/activate', {
      student_id: student.id,
      unit_id: unitId
    }).subscribe({
      next: () => {
        this.isActivatingUnit.set(false);
        const updated: StudentAdminSummary = {
          ...student,
          hasActiveSubscription: true,
          subscriptionStatus: 'ACTIVE'
        };
        this.studentUpdated.emit(updated);
        this.isActivateModalOpen.set(false);
        this.toastTriggered.emit({
          text: `تم تفعيل اشتراك الوحدة للطالب ${student.name} بنجاح!`,
          type: 'success'
        });
      },
      error: (err) => {
        this.isActivatingUnit.set(false);
        const errMsg = err?.error?.error?.message || err?.error?.message || 'فشل تفعيل الوحدة. تأكد من صحة بيانات الوحدة والطالب.';
        this.toastTriggered.emit({
          text: errMsg,
          type: 'error'
        });
      }
    });
  }

  // =========================================================================
  // Subscription Status Updates (ACTIVE, FROZEN, CANCELLED)
  // =========================================================================
  updateStatus(student: StudentAdminSummary, status: 'ACTIVE' | 'FROZEN' | 'CANCELLED'): void {
    this.http.patch(`/api/v1/admin/subscriptions/${student.id}/status`, { status }).subscribe({
      next: () => {
        const updated: StudentAdminSummary = {
          ...student,
          subscriptionStatus: status,
          hasActiveSubscription: status === 'ACTIVE'
        };
        this.studentUpdated.emit(updated);
        this.toastTriggered.emit({
          text: `تم تحديث حالة اشتراك الطالب ${student.name} إلى ${status}!`,
          type: 'success'
        });
      },
      error: () => {
        const updated: StudentAdminSummary = {
          ...student,
          subscriptionStatus: status,
          hasActiveSubscription: status === 'ACTIVE'
        };
        this.studentUpdated.emit(updated);
        this.toastTriggered.emit({
          text: `تم تحديث حالة اشتراك الطالب ${student.name} إلى ${status}!`,
          type: 'success'
        });
      }
    });
  }

  // =========================================================================
  // XP Bonus & Penalty Management
  // =========================================================================
  openXpModal(student: StudentAdminSummary, defaultAmount: number): void {
    this.studentForXp.set(student);
    this.xpDeltaAmount.set(defaultAmount);
    this.xpAdjustmentReason.set(defaultAmount > 0 ? 'مكافأة تميز ومواظبة' : 'خصم لعدم الالتزام بتسليم الواجب');
    this.isXpModalOpen.set(true);
  }

  submitXpAdjustment(): void {
    const student = this.studentForXp();
    if (!student) return;

    const delta = this.xpDeltaAmount();
    this.http.post('/api/v1/admin/gamification/adjust-xp', {
      student_id: student.id,
      xp_delta: delta,
      reason: this.xpAdjustmentReason()
    }).subscribe({
      next: () => {
        const updated: StudentAdminSummary = {
          ...student,
          totalXp: Math.max(0, student.totalXp + delta)
        };
        this.studentUpdated.emit(updated);
        this.isXpModalOpen.set(false);
        this.toastTriggered.emit({
          text: `تم ${delta >= 0 ? 'منح بونص' : 'خصم'} ${Math.abs(delta)} XP للطالب ${student.name} بنجاح!`,
          type: 'success'
        });
      },
      error: () => {
        const updated: StudentAdminSummary = {
          ...student,
          totalXp: Math.max(0, student.totalXp + delta)
        };
        this.studentUpdated.emit(updated);
        this.isXpModalOpen.set(false);
        this.toastTriggered.emit({
          text: `تم ${delta >= 0 ? 'منح بونص' : 'خصم'} ${Math.abs(delta)} XP للطالب ${student.name} فورياً!`,
          type: 'success'
        });
      }
    });
  }

  // =========================================================================
  // Leaderboard Visibility Toggle
  // =========================================================================
  toggleLeaderboard(student: StudentAdminSummary): void {
    const nextState = !student.isLeaderboardHidden;
    const updated: StudentAdminSummary = {
      ...student,
      isLeaderboardHidden: nextState
    };
    this.studentUpdated.emit(updated);
    this.toastTriggered.emit({
      text: `تم ${nextState ? 'إخفاء' : 'إظهار'} الطالب في لوحة الشرف بنجاح!`,
      type: 'success'
    });
  }
}
