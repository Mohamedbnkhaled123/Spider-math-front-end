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
  GraduationDecision,
  PendingDeviceRequest,
  PromoteStudentsResponse,
  PromotionMode,
  StudentAdminSummary
} from './students-subscriptions-devices.models';
import { formatLastSeen } from '../../../core/utils/last-seen.util';
import {
  curriculumSupportsTerms,
  evaluateStudentForPromotion,
  getCurriculumDisplayLabel,
  getGradeDisplayLabel,
  getTermDisplayLabel,
  normalizePromotionCurriculum
} from './student-promotion.util';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 14: Students, Subscriptions, Devices & XP Component
 * 
 * Instant HAxxxx Search, 1-Click Unit Activation, Frozen/Cancelled Subscription State Machine,
 * Additive Device Approval Queue ($push into approved_devices[]), and XP Adjustments.
 */
let cachedAdminUnits: any[] | null = null;
let cachedAdminUnitsFetchedAt = 0;
const ADMIN_UNITS_CACHE_TTL_MS = 5000;

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
  readonly studentsDeleted = output<string[]>();
  readonly studentsReloadRequested = output<void>();
  readonly deviceApproved = output<PendingDeviceRequest>();
  readonly deviceRejected = output<PendingDeviceRequest>();
  readonly toastTriggered = output<{ text: string; type: 'success' | 'warning' | 'error' }>();

  // Search Signal
  readonly searchQuery = signal<string>('');

  // User Category Filter (Strictly students and parents, admins/teachers are never students)
  readonly activeCategory = signal<'ALL' | 'ACTIVE_STUDENTS' | 'INACTIVE_STUDENTS' | 'ARCHIVED' | 'PARENTS'>('ALL');

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
    const isActiveStudent = (s: StudentAdminSummary) => (s.role === 'STUDENT' || !s.role) && !s.isArchived;
    return {
      all: list.filter((s) => !s.isArchived).length,
      activeStudents: list.filter((s) => isActiveStudent(s) && s.hasActiveSubscription).length,
      inactiveStudents: list.filter((s) => isActiveStudent(s) && !s.hasActiveSubscription).length,
      archived: list.filter((s) => (s.role === 'STUDENT' || !s.role) && !!s.isArchived).length,
      parents: list.filter((s) => s.role === 'PARENT').length
    };
  });

  // Real Units from Database
  readonly realUnits = signal<any[]>([]);

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
    const merged = new Map<string, any>();
    for (const u of (this.realUnits() || [])) {
      const uid = String(u?.id || u?._id || '');
      if (uid) merged.set(uid, u);
    }
    for (const u of (this.availableUnits() || [])) {
      const uid = String(u?.id || u?._id || '');
      if (!uid) continue;
      merged.set(uid, merged.has(uid) ? { ...merged.get(uid), ...u } : u);
    }
    return Array.from(merged.values());
  });

  // Filtered Students Computed
  readonly filteredStudents = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const cat = this.activeCategory();
    let list = this.sanitizedStudents();

    // 1. Category Filter
    if (cat === 'ARCHIVED') {
      list = list.filter((s) => (s.role === 'STUDENT' || !s.role) && !!s.isArchived);
    } else if (cat === 'PARENTS') {
      list = list.filter((s) => s.role === 'PARENT');
    } else if (cat === 'ACTIVE_STUDENTS') {
      list = list.filter((s) => (s.role === 'STUDENT' || !s.role) && !s.isArchived && s.hasActiveSubscription);
    } else if (cat === 'INACTIVE_STUDENTS') {
      list = list.filter((s) => (s.role === 'STUDENT' || !s.role) && !s.isArchived && !s.hasActiveSubscription);
    } else {
      // ALL excludes archived students so active lists stay uncluttered
      list = list.filter((s) => !s.isArchived);
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

  setCategory(cat: 'ALL' | 'ACTIVE_STUDENTS' | 'INACTIVE_STUDENTS' | 'ARCHIVED' | 'PARENTS'): void {
    this.activeCategory.set(cat);
    this.currentPage.set(1);
  }

  formatStudentLastSeen(student: StudentAdminSummary): string {
    return formatLastSeen(student.lastSeenAt, !!student.isOnline, this.langService.isArabic());
  }

  // Unit Activation Modal
  readonly isActivateModalOpen = signal<boolean>(false);
  readonly isActivatingUnit = signal<boolean>(false);
  readonly studentToActivate = signal<StudentAdminSummary | null>(null);
  readonly activationUnitId = signal<string>('');
  readonly activationScope = signal<'FULL' | 'ASSESSMENTS_ONLY'>('FULL');

  private normalizeCurriculumCode(c: string): string {
    const clean = (c || '').trim().toUpperCase();
    if (!clean) return '';
    if (clean === 'EGYPTIAN' || clean.includes('EGYPT') || clean.includes('مصر')) return 'EGYPTIAN';
    if (clean === 'GULF' || clean.includes('GULF') || clean.includes('خليج')) return 'GULF';
    if (clean === 'INTERNATIONAL' || clean.includes('INT') || clean.includes('IGCSE') || clean.includes('بريطان') || clean.includes('دول')) return 'INTERNATIONAL';
    if (clean === 'AMERICAN' || clean.includes('AMER') || clean.includes('أمر') || clean.includes('SAT') || clean.includes('ACT') || clean.includes('EST')) return 'AMERICAN';
    return clean;
  }

  private normalizeGradeCode(g: string): string {
    const clean = (g || '').trim().toUpperCase();
    if (!clean) return '';
    // Exact canonical grade codes first to prevent substring collisions (e.g. US_GRADE_12 vs GRADE_12)
    if (
      /^(PRI|PREP|SEC)_\d+$/.test(clean) ||
      /^US_GRADE_\d+$/.test(clean) ||
      /^IGCSE_YEAR_\d+$/.test(clean) ||
      /^GRADE_\d+$/.test(clean) ||
      /^(SAT|EST|ACT)(?:_[12]|_MATH)?$/.test(clean) ||
      clean === 'IGCSE_OL' ||
      clean === 'IGCSE_AS' ||
      clean === 'IGCSE_AL'
    ) {
      return clean;
    }
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
    if (clean.includes('IGCSE_AL') || clean.includes('A-LEVEL') || clean.includes('A LEVEL')) return 'IGCSE_AL';
    if (clean.includes('IGCSE_AS') || clean.includes('AS-LEVEL') || clean.includes('AS LEVEL')) return 'IGCSE_AS';
    if (clean.includes('IGCSE_OL') || clean.includes('O-LEVEL') || clean.includes('O LEVEL')) return 'IGCSE_OL';
    if (clean.includes('SAT_MATH') || clean === 'SAT') return 'SAT_MATH';
    if (clean.includes('ACT_MATH') || clean === 'ACT') return 'ACT_MATH';
    if (clean.includes('EST_MATH') || clean === 'EST') return 'EST_MATH';
    return clean;
  }

  private resolveEffectiveCurriculum(curr: string, grade: string): string {
    const normCurr = this.normalizeCurriculumCode(curr);
    const normGrade = this.normalizeGradeCode(grade);
    if (normCurr === 'AMERICAN' && /^US_GRADE_\d+$/.test(normGrade)) {
      return 'INTERNATIONAL';
    }
    return normCurr;
  }

  getStudentTrackDisplay(student: StudentAdminSummary): string {
    const effectiveCurr = this.resolveEffectiveCurriculum(student.curriculum || '', student.gradeLevel || '');
    return `${effectiveCurr || student.curriculum} - ${student.gradeLevel}`;
  }

  // Academic Integrity: Units strictly matching student's curriculum track and grade level
  readonly studentMatchingUnits = computed(() => {
    const student = this.studentToActivate() || this.studentForSubscriptions();
    const all = this.allAvailableUnits();
    if (!student) return [];

    const sCurr = (student.curriculum || '').trim().toUpperCase();
    const sGrade = (student.gradeLevel || '').trim().toUpperCase();
    const effSCurr = this.resolveEffectiveCurriculum(sCurr, sGrade);
    const normSGrade = this.normalizeGradeCode(sGrade);

    return all.filter((u) => {
      const uCurr = (u.curriculum || '').trim().toUpperCase();
      const uGrade = (u.gradeLevel || u.grade_level || '').trim().toUpperCase();
      const effUCurr = this.resolveEffectiveCurriculum(uCurr, uGrade);
      const normUGrade = this.normalizeGradeCode(uGrade);

      const currMatch = effUCurr === effSCurr;
      const gradeMatch = normUGrade === normSGrade;

      return currMatch && gradeMatch;
    });
  });

  ngOnInit(): void {
    this.fetchDatabaseUnits();
  }

  fetchDatabaseUnits(): void {
    const cacheFresh = cachedAdminUnits && cachedAdminUnits.length > 0 && (Date.now() - cachedAdminUnitsFetchedAt) < ADMIN_UNITS_CACHE_TTL_MS;
    if (cacheFresh) {
      this.realUnits.set(cachedAdminUnits!);
      this.syncSelectedActivationUnit();
      return;
    }

    this.http.get<{ success: boolean; data: any[] }>('/api/v1/admin/units').subscribe({
      next: (res) => {
        if (res?.data && Array.isArray(res.data)) {
          cachedAdminUnits = res.data;
          cachedAdminUnitsFetchedAt = Date.now();
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
              cachedAdminUnitsFetchedAt = Date.now();
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
  readonly xpAdjustmentReason = signal<string>('تميز في حل أسئلة التحدي');

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
          text: `تم إلغاء اشتراك "${sub.unitTitleAr || sub.titleAr || sub.titleEn || 'الوحدة'}"`,
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
        const errMsg = err?.error?.error?.message || err?.error?.message || 'فشل تفعيل الوحدة.';
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
    this.xpAdjustmentReason.set(defaultAmount > 0 ? 'مكافأة تميز' : 'خصم لعدم تسليم الواجب');
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

  // =========================================================================
  // Manual Academic Promotion (Term vs Grade), Select All & Graduation Flow
  // =========================================================================
  readonly isPromotionModalOpen = signal<boolean>(false);
  readonly promotionStage = signal<'SELECT' | 'GRADUATION_REVIEW'>('SELECT');
  readonly promotionMode = signal<PromotionMode>('GRADE');
  readonly promotionCurriculumFilter = signal<string>('ALL');
  readonly promotionGradeFilter = signal<string>('ALL');
  readonly promotionSearchQuery = signal<string>('');
  readonly promotionSelectedIds = signal<Set<string>>(new Set());
  readonly promotionExcludedIds = signal<Set<string>>(new Set());
  readonly graduationDecisions = signal<Record<string, GraduationDecision>>({});
  readonly isExecutingPromotion = signal<boolean>(false);

  // Archived Lifecycle Modals & Flags
  readonly studentPendingPermanentDelete = signal<StudentAdminSummary | null>(null);
  readonly isDeletingStudent = signal<boolean>(false);
  readonly isUpdatingArchiveStudentId = signal<string | null>(null);

  readonly nonArchivedStudentCandidates = computed(() =>
    this.sanitizedStudents().filter((s) => (s.role === 'STUDENT' || !s.role) && !s.isArchived)
  );

  readonly promotionGradeFilterOptions = computed(() => {
    const currFilter = this.promotionCurriculumFilter();
    const seen = new Set<string>();
    const options: Array<{ code: string; curriculum: string; label: string }> = [];
    const isAr = this.langService.isArabic();

    for (const s of this.nonArchivedStudentCandidates()) {
      const effCurr = normalizePromotionCurriculum(s.curriculum, s.gradeLevel);
      if (currFilter !== 'ALL' && effCurr !== currFilter) continue;
      const gradeCode = (s.gradeLevel || '').trim().toUpperCase();
      if (!gradeCode || gradeCode === '—' || seen.has(gradeCode)) continue;
      seen.add(gradeCode);
      options.push({
        code: gradeCode,
        curriculum: effCurr,
        label: getGradeDisplayLabel(effCurr, gradeCode, isAr)
      });
    }
    return options;
  });

  readonly promotionRows = computed(() => {
    const mode = this.promotionMode();
    const currFilter = this.promotionCurriculumFilter();
    const gradeFilter = this.promotionGradeFilter();
    const q = this.promotionSearchQuery().trim().toLowerCase();

    return this.nonArchivedStudentCandidates()
      .filter((s) => {
        const effCurr = normalizePromotionCurriculum(s.curriculum, s.gradeLevel);
        if (currFilter !== 'ALL' && effCurr !== currFilter) return false;
        const normGrade = (s.gradeLevel || '').trim().toUpperCase();
        if (gradeFilter !== 'ALL' && normGrade !== gradeFilter) return false;
        if (!q) return true;
        return (
          s.name.toLowerCase().includes(q) ||
          s.haCode.toLowerCase().includes(q) ||
          (s.email && s.email.toLowerCase().includes(q))
        );
      })
      .map((student) => ({
        student,
        eval: evaluateStudentForPromotion(student, mode)
      }));
  });

  readonly eligiblePromotionRows = computed(() =>
    this.promotionRows().filter((r) => r.eval.eligible)
  );

  readonly selectedEligibleRows = computed(() => {
    const mode = this.promotionMode();
    const selectedSet = this.promotionSelectedIds();
    return this.nonArchivedStudentCandidates()
      .map((student) => ({
        student,
        eval: evaluateStudentForPromotion(student, mode)
      }))
      .filter((r) => r.eval.eligible && selectedSet.has(r.student.id));
  });

  readonly selectedGraduatingRows = computed(() =>
    this.selectedEligibleRows().filter((r) => r.eval.isGraduating)
  );

  readonly selectedGraduatingDeleteCount = computed(() => {
    const decisions = this.graduationDecisions();
    return this.selectedGraduatingRows().filter((r) => decisions[r.student.id] === 'DELETE').length;
  });

  readonly isAllEligibleInViewSelected = computed(() => {
    const eligible = this.eligiblePromotionRows();
    const selected = this.promotionSelectedIds();
    return eligible.length > 0 && eligible.every((r) => selected.has(r.student.id));
  });

  readonly promotionStats = computed(() => {
    const rows = this.promotionRows();
    const eligibleInView = rows.filter((r) => r.eval.eligible);
    const selected = this.selectedEligibleRows();
    const selectedGraduating = selected.filter((r) => r.eval.isGraduating);
    const inactiveInSelected = selected.filter((r) => r.student.subscriptionStatus !== 'ACTIVE').length;

    return {
      totalInView: rows.length,
      eligibleInView: eligibleInView.length,
      ineligibleInView: rows.length - eligibleInView.length,
      selectedTotal: selected.length,
      selectedPromotable: selected.length - selectedGraduating.length,
      selectedGraduating: selectedGraduating.length,
      excludedCount: this.promotionExcludedIds().size,
      inactiveInSelected
    };
  });

  openPromotionModal(defaultMode: PromotionMode = 'GRADE'): void {
    this.promotionMode.set(defaultMode);
    this.promotionStage.set('SELECT');
    this.promotionCurriculumFilter.set('ALL');
    this.promotionGradeFilter.set('ALL');
    this.promotionSearchQuery.set('');
    this.promotionSelectedIds.set(new Set());
    this.promotionExcludedIds.set(new Set());
    this.graduationDecisions.set({});
    this.isPromotionModalOpen.set(true);
  }

  closePromotionModal(): void {
    if (this.isExecutingPromotion()) return;
    this.isPromotionModalOpen.set(false);
    this.promotionStage.set('SELECT');
  }

  setPromotionMode(mode: PromotionMode): void {
    this.promotionMode.set(mode);
    this.promotionStage.set('SELECT');
    this.graduationDecisions.set({});

    // Drop any previously checked students that are ineligible in the newly chosen mode
    const validSelected = new Set<string>();
    const prevSelected = this.promotionSelectedIds();
    for (const s of this.nonArchivedStudentCandidates()) {
      if (prevSelected.has(s.id) && evaluateStudentForPromotion(s, mode).eligible) {
        validSelected.add(s.id);
      }
    }
    this.promotionSelectedIds.set(validSelected);
  }

  setPromotionCurriculumFilter(curr: string): void {
    this.promotionCurriculumFilter.set(curr);
    this.promotionGradeFilter.set('ALL');
  }

  toggleSelectAllPromotion(): void {
    const visibleEligibleIds = this.eligiblePromotionRows().map((r) => r.student.id);
    if (visibleEligibleIds.length === 0) return;

    const nextSelected = new Set(this.promotionSelectedIds());
    const nextExcluded = new Set(this.promotionExcludedIds());

    if (this.isAllEligibleInViewSelected()) {
      for (const id of visibleEligibleIds) {
        nextSelected.delete(id);
      }
    } else {
      for (const id of visibleEligibleIds) {
        nextSelected.add(id);
        nextExcluded.delete(id);
      }
    }

    this.promotionSelectedIds.set(nextSelected);
    this.promotionExcludedIds.set(nextExcluded);
  }

  toggleStudentPromotionSelection(studentId: string): void {
    const student = this.nonArchivedStudentCandidates().find((s) => s.id === studentId);
    if (!student || !evaluateStudentForPromotion(student, this.promotionMode()).eligible) {
      return;
    }

    const nextSelected = new Set(this.promotionSelectedIds());
    const nextExcluded = new Set(this.promotionExcludedIds());

    if (nextSelected.has(studentId)) {
      nextSelected.delete(studentId);
      nextExcluded.add(studentId);
    } else {
      nextSelected.add(studentId);
      nextExcluded.delete(studentId);
    }

    this.promotionSelectedIds.set(nextSelected);
    this.promotionExcludedIds.set(nextExcluded);
  }

  excludeInactiveFromSelection(): void {
    const nextSelected = new Set(this.promotionSelectedIds());
    const nextExcluded = new Set(this.promotionExcludedIds());

    for (const r of this.selectedEligibleRows()) {
      if (r.student.subscriptionStatus !== 'ACTIVE') {
        nextSelected.delete(r.student.id);
        nextExcluded.add(r.student.id);
      }
    }

    this.promotionSelectedIds.set(nextSelected);
    this.promotionExcludedIds.set(nextExcluded);
  }

  proceedFromPromotionSelection(): void {
    const selected = this.selectedEligibleRows();
    if (selected.length === 0) {
      this.toastTriggered.emit({
        text: this.langService.isArabic()
          ? 'يرجى تحديد طالب واحد على الأقل للترقية'
          : 'Please select at least one eligible student',
        type: 'warning'
      });
      return;
    }

    const graduating = selected.filter((r) => r.eval.isGraduating);
    if (graduating.length > 0) {
      const decisions = { ...this.graduationDecisions() };
      for (const r of graduating) {
        if (!decisions[r.student.id]) {
          decisions[r.student.id] = 'ARCHIVE';
        }
      }
      this.graduationDecisions.set(decisions);
      this.promotionStage.set('GRADUATION_REVIEW');
      return;
    }

    this.executePromotion();
  }

  setGraduationDecision(studentId: string, decision: GraduationDecision): void {
    this.graduationDecisions.update((prev) => ({
      ...prev,
      [studentId]: decision
    }));
  }

  setAllGraduationDecisions(decision: GraduationDecision): void {
    const next: Record<string, GraduationDecision> = {};
    for (const r of this.selectedGraduatingRows()) {
      next[r.student.id] = decision;
    }
    this.graduationDecisions.set(next);
  }

  executePromotion(): void {
    const selected = this.selectedEligibleRows();
    if (selected.length === 0 || this.isExecutingPromotion()) return;

    const studentIds = selected.map((r) => r.student.id);
    const excludedStudentIds = Array.from(this.promotionExcludedIds());
    const gradMap: Record<string, GraduationDecision> = {};
    const currentDecisions = this.graduationDecisions();

    for (const r of selected) {
      if (r.eval.isGraduating) {
        gradMap[r.student.id] = currentDecisions[r.student.id] || 'ARCHIVE';
      }
    }

    this.isExecutingPromotion.set(true);
    this.http.post<{ success: boolean; data: PromoteStudentsResponse }>('/api/v1/admin/users/students/promote', {
      mode: this.promotionMode(),
      studentIds,
      excludedStudentIds,
      graduationDecisions: gradMap
    }).subscribe({
      next: (res) => {
        this.isExecutingPromotion.set(false);
        const result = res?.data;
        if (result) {
          this.applyPromotionResultUpdates(result);
          this.toastTriggered.emit({
            text: this.formatPromotionSummaryToast(result),
            type: 'success'
          });
        }
        this.isPromotionModalOpen.set(false);
        this.promotionStage.set('SELECT');
        this.studentsReloadRequested.emit();
      },
      error: (err) => {
        this.isExecutingPromotion.set(false);
        if (err?.status === 409 && err?.error?.error?.details?.requiresGraduationDecision) {
          const decisions = { ...this.graduationDecisions() };
          for (const g of err.error.error.details.graduatingStudents || []) {
            if (!decisions[g.studentId]) decisions[g.studentId] = 'ARCHIVE';
          }
          this.graduationDecisions.set(decisions);
          this.promotionStage.set('GRADUATION_REVIEW');
          return;
        }
        const errMsg = err?.error?.error?.message || err?.error?.message || 'تعذر تنفيذ عملية الترقية.';
        this.toastTriggered.emit({ text: errMsg, type: 'error' });
      }
    });
  }

  private applyPromotionResultUpdates(result: PromoteStudentsResponse): void {
    const currentById = new Map(this.sanitizedStudents().map((s) => [s.id, s]));

    for (const item of result.promoted || []) {
      const existing = currentById.get(item.studentId);
      if (!existing) continue;
      this.studentUpdated.emit({
        ...existing,
        gradeLevel: item.toGrade || existing.gradeLevel,
        academicTerm: (item.toTerm ?? existing.academicTerm ?? null) as 'TERM_1' | 'TERM_2' | null
      });
    }

    const nowIso = new Date().toISOString();
    for (const item of result.archived || []) {
      const existing = currentById.get(item.studentId);
      if (!existing) continue;
      this.studentUpdated.emit({
        ...existing,
        isArchived: true,
        archivedAt: nowIso,
        graduationStatus: 'GRADUATED',
        graduatedFromGrade: item.fromGrade || existing.gradeLevel,
        graduatedAt: nowIso,
        isLeaderboardHidden: true
      });
    }

    if ((result.deleted || []).length > 0) {
      this.studentsDeleted.emit(result.deleted.map((d) => d.studentId));
    }
  }

  private formatPromotionSummaryToast(result: PromoteStudentsResponse): string {
    const isAr = this.langService.isArabic();
    const parts: string[] = [];
    if (result.promotedCount > 0) {
      parts.push(isAr ? `ترقية ${result.promotedCount}` : `Promoted ${result.promotedCount}`);
    }
    if (result.archivedCount > 0) {
      parts.push(isAr ? `أرشفة ${result.archivedCount}` : `Archived ${result.archivedCount}`);
    }
    if (result.deletedCount > 0) {
      parts.push(isAr ? `حذف ${result.deletedCount}` : `Deleted ${result.deletedCount}`);
    }
    if (result.skippedCount > 0) {
      parts.push(isAr ? `تخطي ${result.skippedCount}` : `Skipped ${result.skippedCount}`);
    }
    return parts.length > 0
      ? (isAr ? `اكتملت العملية: ${parts.join(' • ')}` : `Completed: ${parts.join(' | ')}`)
      : (isAr ? 'لم يتم تعديل أي طالب' : 'No students updated');
  }

  toggleArchiveStudent(student: StudentAdminSummary, archived: boolean): void {
    if (student.role === 'PARENT' || this.isUpdatingArchiveStudentId() === student.id) return;
    this.isUpdatingArchiveStudentId.set(student.id);

    this.http.patch<{ success: boolean; data: any }>(`/api/v1/admin/users/students/${student.id}/archive`, {
      archived
    }).subscribe({
      next: () => {
        this.isUpdatingArchiveStudentId.set(null);
        const nowIso = new Date().toISOString();
        this.studentUpdated.emit({
          ...student,
          isArchived: archived,
          archivedAt: archived ? nowIso : null,
          graduationStatus: archived ? 'GRADUATED' : 'ACTIVE',
          graduatedFromGrade: archived ? (student.graduatedFromGrade || student.gradeLevel) : student.graduatedFromGrade,
          isLeaderboardHidden: archived ? true : false
        });
        this.studentsReloadRequested.emit();
        this.toastTriggered.emit({
          text: archived
            ? (this.langService.isArabic() ? `تم وضع ${student.name} في الأرشيف` : `Archived ${student.name}`)
            : (this.langService.isArabic() ? `تمت استعادة ${student.name} من الأرشيف` : `Restored ${student.name} from archive`),
          type: 'success'
        });
      },
      error: (err) => {
        this.isUpdatingArchiveStudentId.set(null);
        const errMsg = err?.error?.error?.message || err?.error?.message || 'تعذر تحديث حالة الأرشفة.';
        this.toastTriggered.emit({ text: errMsg, type: 'error' });
      }
    });
  }

  openPermanentDeleteModal(student: StudentAdminSummary): void {
    if (student.role === 'PARENT') return;
    this.studentPendingPermanentDelete.set(student);
  }

  closePermanentDeleteModal(): void {
    if (this.isDeletingStudent()) return;
    this.studentPendingPermanentDelete.set(null);
  }

  confirmPermanentDelete(): void {
    const target = this.studentPendingPermanentDelete();
    if (!target || this.isDeletingStudent()) return;

    this.isDeletingStudent.set(true);
    this.http.delete<{ success: boolean; data: any }>(`/api/v1/admin/users/students/${target.id}`).subscribe({
      next: () => {
        this.isDeletingStudent.set(false);
        this.studentPendingPermanentDelete.set(null);
        this.studentsDeleted.emit([target.id]);
        this.studentsReloadRequested.emit();
        this.toastTriggered.emit({
          text: this.langService.isArabic()
            ? `تم حذف سجل الطالب ${target.name} نهائياً`
            : `Permanently deleted student ${target.name}`,
          type: 'warning'
        });
      },
      error: (err) => {
        this.isDeletingStudent.set(false);
        const errMsg = err?.error?.error?.message || err?.error?.message || 'تعذر حذف سجل الطالب.';
        this.toastTriggered.emit({ text: errMsg, type: 'error' });
      }
    });
  }

  formatStudentCurriculumLabel(student: StudentAdminSummary): string {
    return getCurriculumDisplayLabel(student.curriculum, student.gradeLevel, this.langService.isArabic());
  }

  formatStudentGradeLabel(student: StudentAdminSummary): string {
    return getGradeDisplayLabel(student.curriculum, student.gradeLevel, this.langService.isArabic());
  }

  formatStudentTermLabel(student: StudentAdminSummary): string {
    return getTermDisplayLabel(student.curriculum, student.gradeLevel, student.academicTerm, this.langService.isArabic());
  }

  formatGradeCodeLabel(curriculum: string | null | undefined, gradeCode: string | null | undefined): string {
    return getGradeDisplayLabel(curriculum, gradeCode, this.langService.isArabic());
  }

  studentHasTerms(student: StudentAdminSummary): boolean {
    return curriculumSupportsTerms(student.curriculum, student.gradeLevel);
  }
}
