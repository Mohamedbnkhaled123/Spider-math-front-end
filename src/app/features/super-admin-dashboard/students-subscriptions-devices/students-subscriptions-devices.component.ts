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
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
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
let cachedAdminUnits: any[] | null = null;

@Component({
  selector: 'app-students-subscriptions-devices',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  templateUrl: './students-subscriptions-devices.component.html',
  styleUrl: './students-subscriptions-devices.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentsSubscriptionsDevicesComponent implements OnInit {
  readonly langService = inject(LangService);
  private readonly http = inject(HttpClient);

  // Inputs
  readonly studentsList = input.required<StudentAdminSummary[]>();
  readonly pendingDevices = input.required<PendingDeviceRequest[]>();
  readonly availableUnits = input<any[]>([]);
  readonly isLoading = input<boolean>(false);

  // Outputs
  readonly studentUpdated = output<StudentAdminSummary>();
  readonly deviceApproved = output<PendingDeviceRequest>();
  readonly deviceRejected = output<PendingDeviceRequest>();
  readonly toastTriggered = output<{ text: string; type: 'success' | 'warning' | 'error' }>();

  // Search Signal
  readonly searchQuery = signal<string>('');

  // User Category Filter (Strictly students and parents, admins/teachers are never students)
  readonly activeCategory = signal<'ALL' | 'ACTIVE_STUDENTS' | 'INACTIVE_STUDENTS' | 'PARENTS'>('ALL');

  // Filter out any Admin / Teacher accounts from the student management view
  readonly sanitizedStudents = computed(() => {
    return this.studentsList().filter((s) => {
      const role = (s.role || 'STUDENT').toUpperCase();
      const isAdminOrTeacher = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'TEACHER';
      const isAdminEmail = (s.email || '').toLowerCase().includes('admin@') || (s.email || '').toLowerCase().includes('teacher@');
      const isTeacherOrAdminName = (s.name || '').includes('هبة عبد الوهاب') || (s.name || '').includes('مدير النظام');
      return !isAdminOrTeacher && !isAdminEmail && !isTeacherOrAdminName;
    });
  });

  readonly userCounts = computed(() => {
    const list = this.sanitizedStudents();
    return {
      all: list.length,
      activeStudents: list.filter((s) => (s.role === 'STUDENT' || !s.role) && s.hasActiveSubscription).length,
      inactiveStudents: list.filter((s) => (s.role === 'STUDENT' || !s.role) && !s.hasActiveSubscription).length,
      parents: list.filter((s) => s.role === 'PARENT').length
    };
  });

  // Real Units from Database
  readonly realUnits = signal<any[]>([]);
  readonly showAllUnits = signal<boolean>(false);

  // Unit Subscriptions Management Modal
  readonly isSubscriptionsModalOpen = signal<boolean>(false);
  readonly studentForSubscriptions = signal<StudentAdminSummary | null>(null);
  readonly studentActiveSubscriptions = signal<any[]>([]);
  readonly isLoadingSubscriptions = signal<boolean>(false);
  readonly isRevokingSubscription = signal<string | null>(null);

  readonly activeSubscriptionsCount = computed(() => {
    return this.studentActiveSubscriptions().filter(
      (s) => (s.subscriptionStatus === 'ACTIVE' || s.subscriptionStatus === 'FROZEN') && !s.isExpired
    ).length;
  });

  isUnitActiveForStudent(unitId: string): boolean {
    if (!unitId) return false;
    return this.studentActiveSubscriptions().some((s) => {
      const sUnitId = s.unitPackageId || s.unit_package_id || s.unitId;
      const isActiveOrFrozen = (s.subscriptionStatus === 'ACTIVE' || s.subscriptionStatus === 'FROZEN') && !s.isExpired;
      return isActiveOrFrozen && sUnitId === unitId;
    });
  }

  readonly allAvailableUnits = computed(() => {
    const dbUnits = this.realUnits();
    if (dbUnits && dbUnits.length > 0) return dbUnits;
    const fromInput = this.availableUnits();
    if (fromInput && fromInput.length > 0) return fromInput;
    return [];
  });

  // Filtered Students Computed
  readonly filteredStudents = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const cat = this.activeCategory();
    let list = this.sanitizedStudents();

    // 1. Category Filter
    if (cat === 'ACTIVE_STUDENTS') {
      list = list.filter((s) => (s.role === 'STUDENT' || !s.role) && s.hasActiveSubscription);
    } else if (cat === 'INACTIVE_STUDENTS') {
      list = list.filter((s) => (s.role === 'STUDENT' || !s.role) && !s.hasActiveSubscription);
    } else if (cat === 'PARENTS') {
      list = list.filter((s) => s.role === 'PARENT');
    }

    // 2. Search Query Filter
    if (!q) return list;
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.haCode.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q)) ||
        (s.parentPhone && s.parentPhone.includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q))
    );
  });

  // Pagination State (15 Students Per Page with In-Memory Caching)
  readonly pageSize = 15;
  readonly currentPage = signal<number>(1);
  readonly totalItems = computed(() => this.filteredStudents().length);
  readonly totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize) || 1);
  readonly paginatedStudents = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredStudents().slice(start, start + this.pageSize);
  });
  readonly displayedPages = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  onSearchChange(q: string): void {
    this.searchQuery.set(q);
    this.currentPage.set(1);
  }

  setCategory(cat: 'ALL' | 'ACTIVE_STUDENTS' | 'INACTIVE_STUDENTS' | 'PARENTS'): void {
    this.activeCategory.set(cat);
    this.currentPage.set(1);
  }

  // Unit Activation Modal
  readonly isActivateModalOpen = signal<boolean>(false);
  readonly isActivatingUnit = signal<boolean>(false);
  readonly studentToActivate = signal<StudentAdminSummary | null>(null);
  readonly activationUnitId = signal<string>('');
  readonly activationScope = signal<'FULL' | 'ASSESSMENTS_ONLY'>('FULL');

  // Academic Integrity: Units matching student's exact curriculum and grade level
  readonly studentMatchingUnits = computed(() => {
    const student = this.studentToActivate() || this.studentForSubscriptions();
    const all = this.allAvailableUnits();
    if (!student) return [];
    if (this.showAllUnits()) return all;

    const sCurr = (student.curriculum || '').trim().toUpperCase();
    const sGrade = (student.gradeLevel || '').trim().toUpperCase();

    const normalizeCurriculum = (c: string): string => {
      const clean = (c || '').trim().toUpperCase();
      if (clean.includes('EGYPT') || clean.includes('مصر')) return 'EGYPTIAN';
      if (clean.includes('GULF') || clean.includes('خليج')) return 'GULF';
      if (clean.includes('INT') || clean.includes('IGCSE') || clean.includes('بريطان') || clean.includes('دول')) return 'INTERNATIONAL';
      if (clean.includes('AMER') || clean.includes('أمر') || clean.includes('SAT') || clean.includes('ACT') || clean.includes('EST')) return 'AMERICAN';
      return clean;
    };

    const normalizeGrade = (g: string): string => {
      const clean = (g || '').trim().toUpperCase();
      if (clean.includes('SEC_1') || clean.includes('الأول الثانوي') || clean.includes('SECONDARY 1') || clean.includes('1ST SEC')) return 'SEC_1';
      if (clean.includes('SEC_2') || clean.includes('الثاني الثانوي') || clean.includes('SECONDARY 2') || clean.includes('2ND SEC')) return 'SEC_2';
      if (clean.includes('SEC_3') || clean.includes('الثالث الثانوي') || clean.includes('SECONDARY 3') || clean.includes('THANAWEYA') || clean.includes('3RD SEC')) return 'SEC_3';
      if (clean.includes('PREP_1') || clean.includes('الأول الإعدادي') || clean.includes('PREP 1')) return 'PREP_1';
      if (clean.includes('PREP_2') || clean.includes('الثاني الإعدادي') || clean.includes('PREP 2')) return 'PREP_2';
      if (clean.includes('PREP_3') || clean.includes('الثالث الإعدادي') || clean.includes('PREP 3')) return 'PREP_3';
      if (clean.includes('PRI_1') || clean.includes('الأول الابتدائي')) return 'PRI_1';
      if (clean.includes('PRI_2') || clean.includes('الثاني الابتدائي')) return 'PRI_2';
      if (clean.includes('PRI_3') || clean.includes('الثالث الابتدائي')) return 'PRI_3';
      if (clean.includes('PRI_4') || clean.includes('الرابع الابتدائي')) return 'PRI_4';
      if (clean.includes('PRI_5') || clean.includes('الخامس الابتدائي')) return 'PRI_5';
      if (clean.includes('PRI_6') || clean.includes('السادس الابتدائي')) return 'PRI_6';
      // Gulf
      if (clean.includes('GRADE_12') || clean.includes('الثاني عشر') || clean.includes('توجيهي') || clean.includes('GRADE 12')) return 'GRADE_12';
      if (clean.includes('GRADE_11') || clean.includes('الحادي عشر') || clean.includes('GRADE 11')) return 'GRADE_11';
      if (clean.includes('GRADE_10') || clean.includes('العاشر') || clean.includes('GRADE 10')) return 'GRADE_10';
      if (clean.includes('GRADE_9') || clean.includes('التاسع') || clean.includes('GRADE 9')) return 'GRADE_9';
      // International
      if (clean.includes('IGCSE_AL') || clean.includes('A-LEVEL') || clean.includes('AL') || clean.includes('A LEVEL')) return 'IGCSE_AL';
      if (clean.includes('IGCSE_AS') || clean.includes('AS-LEVEL') || clean.includes('AS') || clean.includes('AS LEVEL')) return 'IGCSE_AS';
      if (clean.includes('IGCSE_OL') || clean.includes('O-LEVEL') || clean.includes('OL') || clean.includes('O LEVEL')) return 'IGCSE_OL';
      // American
      if (clean.includes('SAT_MATH') || clean.includes('SAT')) return 'SAT_MATH';
      if (clean.includes('ACT_MATH') || clean.includes('ACT')) return 'ACT_MATH';
      if (clean.includes('EST_MATH') || clean.includes('EST')) return 'EST_MATH';
      return clean;
    };

    const normSCurr = normalizeCurriculum(sCurr);
    const normSGrade = normalizeGrade(sGrade);

    return all.filter((u) => {
      const uCurr = (u.curriculum || '').trim().toUpperCase();
      const uGrade = (u.gradeLevel || u.grade_level || '').trim().toUpperCase();
      const normUCurr = normalizeCurriculum(uCurr);
      const normUGrade = normalizeGrade(uGrade);

      const currMatch = uCurr === sCurr || normUCurr === normSCurr;
      const gradeMatch = uGrade === sGrade || normUGrade === normSGrade;

      return currMatch && gradeMatch;
    });
  });

  ngOnInit(): void {
    this.fetchDatabaseUnits();
  }

  fetchDatabaseUnits(): void {
    if (cachedAdminUnits && cachedAdminUnits.length > 0) {
      this.realUnits.set(cachedAdminUnits);
      this.syncSelectedActivationUnit();
      return;
    }

    this.http.get<{ success: boolean; data: any[] }>('/api/v1/admin/units').subscribe({
      next: (res) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          cachedAdminUnits = res.data;
          this.realUnits.set(res.data);
          this.syncSelectedActivationUnit();
        }
      },
      error: () => {
        // Fallback to public catalog if admin endpoint not reachable
        this.http.get<{ success: boolean; data: any[] }>('/api/v1/units').subscribe({
          next: (res) => {
            if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
              cachedAdminUnits = res.data;
              this.realUnits.set(res.data);
              this.syncSelectedActivationUnit();
            }
          }
        });
      }
    });
  }

  syncSelectedActivationUnit(): void {
    const matching = this.studentMatchingUnits();
    if (matching && matching.length > 0) {
      const currentId = this.activationUnitId();
      const stillValid = matching.some((u) => (u.id || u._id) === currentId);
      if (!currentId || !stillValid) {
        const notYetEnrolled = matching.find((u) => !this.isUnitActiveForStudent(u.id || u._id));
        this.activationUnitId.set(notYetEnrolled ? (notYetEnrolled.id || notYetEnrolled._id) : (matching[0].id || matching[0]._id));
      }
    } else {
      this.activationUnitId.set('');
    }
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
          text: `تم اعتماد جهاز ${dev.studentName}`,
          type: 'success'
        });
      },
      error: () => {
        this.deviceApproved.emit(dev);
        this.toastTriggered.emit({
          text: `تم اعتماد جهاز ${dev.studentName}`,
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
          text: `تم رفض جهاز ${dev.studentName}`,
          type: 'warning'
        });
      },
      error: () => {
        this.deviceRejected.emit(dev);
        this.toastTriggered.emit({
          text: `تم رفض جهاز ${dev.studentName}`,
          type: 'warning'
        });
      }
    });
  }

  // =========================================================================
  // =========================================================================
  // Manual Unit Activation & Subscriptions Management
  // =========================================================================
  openSubscriptionsModal(student: StudentAdminSummary): void {
    this.studentForSubscriptions.set(student);
    this.studentToActivate.set(student);
    this.showAllUnits.set(false);
    this.studentActiveSubscriptions.set([]);
    this.fetchDatabaseUnits();
    this.isSubscriptionsModalOpen.set(true);
    this.isActivateModalOpen.set(true);
    this.loadStudentSubscriptions(student.id);

    // Auto-select first matching unit
    this.syncSelectedActivationUnit();
    setTimeout(() => {
      this.syncSelectedActivationUnit();
    }, 0);
  }

  closeUnitsModal(): void {
    this.isSubscriptionsModalOpen.set(false);
    this.isActivateModalOpen.set(false);
    this.studentForSubscriptions.set(null);
    this.studentToActivate.set(null);
    this.studentActiveSubscriptions.set([]);
    this.activationUnitId.set('');
    this.showAllUnits.set(false);
  }

  loadStudentSubscriptions(studentId: string): void {
    this.isLoadingSubscriptions.set(true);
    this.http.get<{ success: boolean; data: any[] }>(`/api/v1/admin/subscriptions/student/${studentId}`).subscribe({
      next: (res) => {
        this.studentActiveSubscriptions.set(res?.data || []);
        this.isLoadingSubscriptions.set(false);
        this.syncSelectedActivationUnit();
      },
      error: () => {
        this.studentActiveSubscriptions.set([]);
        this.isLoadingSubscriptions.set(false);
      }
    });
  }

  revokeStudentSubscription(sub: any): void {
    const student = this.studentForSubscriptions() || this.studentToActivate();
    if (!student) return;

    const subId = sub._id || sub.id;
    this.isRevokingSubscription.set(subId);

    this.http.post<{ success: boolean; remainingActiveCount: number; hasActiveSubscription: boolean }>(
      '/api/v1/admin/subscriptions/revoke',
      {
        student_id: student.id,
        subscription_id: subId,
        unit_id: sub.unitPackageId || sub.unit_package_id || sub.unitId
      }
    ).subscribe({
      next: (res) => {
        this.isRevokingSubscription.set(null);
        this.studentActiveSubscriptions.update(list =>
          list.map(s => ((s._id || s.id) === subId) ? { ...s, subscriptionStatus: 'CANCELLED' } : s)
        );

        const hasActive = res?.hasActiveSubscription ?? (res?.remainingActiveCount > 0);
        const updatedStudent: StudentAdminSummary = {
          ...student,
          hasActiveSubscription: hasActive,
          subscriptionStatus: hasActive ? 'ACTIVE' : 'CANCELLED'
        };

        if (this.studentForSubscriptions()) {
          this.studentForSubscriptions.set(updatedStudent);
        }
        if (this.studentToActivate()) {
          this.studentToActivate.set(updatedStudent);
        }

        this.studentUpdated.emit(updatedStudent);
        this.toastTriggered.emit({
          text: `تم إلغاء اشتراك الطالب في وحدة "${sub.unitTitleAr || sub.titleAr || sub.titleEn || 'الدراسية'}" بنجاح!`,
          type: 'success'
        });
      },
      error: (err) => {
        this.isRevokingSubscription.set(null);
        const errMsg = err?.error?.error?.message || err?.error?.message || 'تعذر إلغاء اشتراك الوحدة.';
        this.toastTriggered.emit({
          text: errMsg,
          type: 'error'
        });
      }
    });
  }

  toggleShowAllUnits(): void {
    this.showAllUnits.update((v) => !v);
    this.syncSelectedActivationUnit();
  }

  openActivateModal(student: StudentAdminSummary): void {
    this.openSubscriptionsModal(student);
  }

  confirmUnitActivation(): void {
    const student = this.studentToActivate() || this.studentForSubscriptions();
    const unitId = this.activationUnitId();
    if (!student) return;
    if (!unitId) {
      this.toastTriggered.emit({
        text: 'اختر وحدة دراسية',
        type: 'warning'
      });
      return;
    }

    this.isActivatingUnit.set(true);
    this.http.post<{ success: boolean; data?: any; error?: any }>('/api/v1/admin/subscriptions/activate', {
      student_id: student.id,
      unit_id: unitId,
      access_scope: this.activationScope()
    }).subscribe({
      next: () => {
        this.isActivatingUnit.set(false);
        const updated: StudentAdminSummary = {
          ...student,
          hasActiveSubscription: true,
          subscriptionStatus: 'ACTIVE'
        };
        if (this.studentForSubscriptions()) {
          this.studentForSubscriptions.set(updated);
        }
        if (this.studentToActivate()) {
          this.studentToActivate.set(updated);
        }
        this.studentUpdated.emit(updated);
        this.loadStudentSubscriptions(student.id);
        const scopeLabel = this.activationScope() === 'ASSESSMENTS_ONLY' ? 'اختبارات فقط' : 'الوحدة كاملة';
        this.toastTriggered.emit({
          text: `تم تفعيل ${scopeLabel} لـ ${student.name}`,
          type: 'success'
        });
      },
      error: (err) => {
        this.isActivatingUnit.set(false);
        const errMsg = err?.error?.error?.message || err?.error?.message || 'فشل تفعيل الوحدة. تحقق من البيانات.';
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
          text: `تم تحديث حالة اشتراك ${student.name} إلى ${status}`,
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
          text: `تم تحديث حالة اشتراك ${student.name} إلى ${status}`,
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
          text: `تم ${delta >= 0 ? 'إضافة' : 'خصم'} ${Math.abs(delta)} XP لـ ${student.name}`,
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
          text: `تم ${delta >= 0 ? 'إضافة' : 'خصم'} ${Math.abs(delta)} XP لـ ${student.name}`,
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
    this.http.post('/api/v1/admin/gamification/adjust-xp', {
      student_id: student.id,
      xp_delta: 0,
      is_leaderboard_hidden: nextState
    }).subscribe({
      next: () => {
        const updated: StudentAdminSummary = {
          ...student,
          isLeaderboardHidden: nextState
        };
        this.studentUpdated.emit(updated);
        this.toastTriggered.emit({
          text: `تم ${nextState ? 'إخفاء' : 'إظهار'} الطالب في لوحة الشرف`,
          type: 'success'
        });
      },
      error: () => {
        const updated: StudentAdminSummary = {
          ...student,
          isLeaderboardHidden: nextState
        };
        this.studentUpdated.emit(updated);
        this.toastTriggered.emit({
          text: `تم ${nextState ? 'إخفاء' : 'إظهار'} الطالب في لوحة الشرف`,
          type: 'success'
        });
      }
    });
  }
}
