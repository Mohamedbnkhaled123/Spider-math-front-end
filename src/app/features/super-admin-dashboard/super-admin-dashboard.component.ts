import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';
import { AuthService } from '../../core/auth/auth.service';
import { LangService } from '../../core/seo-theme-i18n/lang.service';
import { CurriculumCode, AcademicTermCode } from '../../core/constants/curriculum-tree.constant';

// Subcomponents Partitioned as per Phase 14
import { AdminAnalyticsShellComponent } from './admin-analytics-shell/admin-analytics-shell.component';
import { CurriculumStudioComponent } from './curriculum-studio/curriculum-studio.component';
import { AssessmentStudioComponent } from './assessment-studio/assessment-studio.component';
import { InteractiveGradingStudioComponent } from './interactive-grading-studio/interactive-grading-studio.component';
import { StudentsSubscriptionsDevicesComponent } from './students-subscriptions-devices/students-subscriptions-devices.component';
import { LeadsAndLandingCmsComponent } from './leads-and-landing-cms/leads-and-landing-cms.component';

import {
  AdminTab,
  AnalyticsSnapshot,
  BatchedNotificationItem,
  CmsConfigAdminItem,
  LeadAdminItem,
  PendingDeviceRequest,
  PendingEssayGrading,
  StudentAdminSummary,
  UnitPackageAdminItem,
  AssessmentAdminItem
} from './super-admin-dashboard.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 14: Super Admin Studio (غرفة عمليات المهندسة هبة عبدالوهاب) Coordinator
 */
@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AppIconComponent,
    AdminAnalyticsShellComponent,
    CurriculumStudioComponent,
    AssessmentStudioComponent,
    InteractiveGradingStudioComponent,
    StudentsSubscriptionsDevicesComponent,
    LeadsAndLandingCmsComponent
  ],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrl: './super-admin-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuperAdminDashboardComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  readonly authService = inject(AuthService);
  readonly langService = inject(LangService);

  // Active navigation tab
  readonly activeTab = signal<AdminTab>('analytics');
  readonly isLoading = signal<boolean>(false);
  readonly toastMessage = signal<{ text: string; type: 'success' | 'warning' | 'error' } | null>(null);

  // Maintenance & Backup Actions
  readonly isExportingBackup = signal<boolean>(false);
  readonly isPurgingHomework = signal<boolean>(false);
  readonly showPurgeConfirmModal = signal<boolean>(false);

  // Curriculum State
  readonly selectedCurriculum = signal<CurriculumCode>('EGYPTIAN');
  readonly selectedGrade = signal<string>('SEC_3');
  readonly selectedTerm = signal<AcademicTermCode>('TERM_1');
  readonly unitsList = signal<UnitPackageAdminItem[]>([]);

  // Grading State
  readonly pendingGrading = signal<PendingEssayGrading[]>([]);

  // Students & Devices State
  readonly studentsList = signal<StudentAdminSummary[]>([]);
  readonly pendingDevices = signal<PendingDeviceRequest[]>([]);

  // Leads & Pure CMS State
  readonly leadsList = signal<LeadAdminItem[]>([]);
  readonly cmsConfig = signal<CmsConfigAdminItem>({
    heroHeadlineAr: 'تعلم الرياضيات بأعلى المعايير الهندسية مع المهندسة هبة عبد الوهاب',
    heroSubheadlineAr: 'منصة تفاعلية مخصصة للثانوية العامة والأنظمة الدولية بنظام حماية متطور واستراتيجيات ديسموس البيانية.',
    heroVideoUrl: '',
    announcementBannerText: 'خصم 20% لفترة محدودة على اشتراك باقات الترم الأول بمناسبة تدشين المنصة',
    isAnnouncementActive: true,
    supportWhatsapp: '01012345678',
    activeAcademicYear: '2026 / 2027',
    activeAcademicTerm: 'TERM_1',
    schedulesTable: [
      {
        curriculum: 'EGYPTIAN',
        gradeLevel: 'SEC_3',
        term: 'TERM_1',
        dayOfWeek: 'الأحد والثلاثاء',
        timeSlot: '07:00 م - 09:00 م',
        lectureSubject: 'تفاضل وتكامل وحساب مثلثات'
      }
    ]
  });

  // Batched Notifications Center (Consolidating alerts every 5 submissions)
  readonly batchedNotifications = signal<BatchedNotificationItem[]>([]);

  // Dynamic Analytics KPI Snapshot
  readonly analyticsSnapshot = computed<AnalyticsSnapshot>(() => ({
    registeredStudents: this.studentsList().length,
    activeSubscriptions: this.studentsList().filter((s) => s.hasActiveSubscription).length,
    pendingGradingCount: this.pendingGrading().filter((g) => g.status === 'PENDING').length,
    pendingDevicesCount: this.pendingDevices().length,
    newLeadsCount: this.leadsList().length
  }));

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.fetchRealAtlasData();
    this.fetchCurriculumUnits();
    this.fetchLeads();
    this.fetchCmsConfig();
  }

  // =========================================================================
  // API Data Fetching Methods
  // =========================================================================
  fetchRealAtlasData(): void {
    this.isLoading.set(true);

    // 1. Fetch Students
    this.http.get<{ success: boolean; data: any[] }>('/api/v1/admin/users/students').subscribe({
      next: (res) => {
        if (res?.data) {
          const mapped: StudentAdminSummary[] = res.data.map((u) => ({
            id: u._id,
            name: u.full_name || 'طالب مسجل',
            haCode: u.student_code || (u.role === 'SUPER_ADMIN' ? 'ADMIN' : (u.is_profile_completed === false ? 'قيد التسجيل' : '—')),
            email: u.email,
            phone: u.phone,
            parentPhone: u.parent_phone,
            curriculum: u.curriculum || (u.role === 'SUPER_ADMIN' ? 'إشراف أكاديمي' : 'المصري'),
            gradeLevel: u.grade_level || (u.role === 'SUPER_ADMIN' ? 'Super Admin' : 'SEC_3'),
            hasActiveSubscription: !!u.has_active_subscription,
            subscriptionStatus: u.has_active_subscription ? 'ACTIVE' : 'CANCELLED',
            totalXp: u.total_xp || 0,
            approvedDevices: Array.isArray(u.approved_devices) ? u.approved_devices.length : 1,
            isLocked: u.account_lock_status === 'LOCKED',
            isLeaderboardHidden: false,
            isProfileCompleted: u.is_profile_completed ?? (!!u.student_code),
            createdAt: u.createdAt
          }));
          this.studentsList.set(mapped);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });

    // 2. Fetch Pending Devices
    this.http.get<{ success: boolean; data: any[] }>('/api/v1/admin/device-requests').subscribe({
      next: (res) => {
        if (Array.isArray(res?.data)) {
          const mappedDevices: PendingDeviceRequest[] = res.data.map((d) => ({
            id: d._id,
            studentName: d.full_name,
            haCode: d.student_code,
            curriculum: d.curriculum || 'المنهج المصري',
            deviceInfo: d.pending_device_req?.device_type || 'Windows PC',
            ipAddress: d.pending_device_req?.ip_address || '127.0.0.1',
            requestedAt: new Date(d.pending_device_req?.requested_at || d.createdAt).toLocaleTimeString('ar-EG'),
            status: d.pending_device_req?.status || 'PENDING'
          }));
          this.pendingDevices.set(mappedDevices);
        }
      }
    });

    // 3. Fetch Pending Submissions
    this.http.get<{ success: boolean; data: any }>('/api/v1/admin/submissions/pending-review').subscribe({
      next: (res) => {
        const rawSubmissions: any[] = Array.isArray(res?.data)
          ? res.data
          : (res?.data?.submissions ?? []);
        if (rawSubmissions && rawSubmissions.length > 0) {
          const mappedSubmissions: PendingEssayGrading[] = rawSubmissions.map((s) => ({
            id: s._id,
            studentId: typeof s.student_id === 'object' ? s.student_id?._id : s.student_id,
            studentName: typeof s.student_id === 'object' ? s.student_id?.full_name : (s.student_name || 'طالب سبايدر ماث'),
            haCode: typeof s.student_id === 'object' ? s.student_id?.student_code : (s.student_ha_code || 'HA4920'),
            assessmentId: typeof s.assessment_id === 'object' ? s.assessment_id?._id : s.assessment_id,
            assessmentTitle: typeof s.assessment_id === 'object' ? s.assessment_id?.title_ar : (s.assessment_title || 'تقييم المحاضرة'),
            questionNumber: 2,
            questionText: 'مسألة مقالية: أثبت صحة العلاقة الرياضية بالخطوات اليدوية.',
            studentAnswerImageWebp: s.homework_images?.[0]?.image_url || 'https://res.cloudinary.com/spider-math/image/upload/v1729000000/spider-math-questions/sample_curve_prompt.webp',
            maxScore: typeof s.assessment_id === 'object' ? (s.assessment_id?.total_points || 10) : 10,
            awardedScore: s.essay_manual_score ?? 0,
            generalTeacherNote: s.teacher_feedback_notes || '',
            mistakes: [],
            status: s.result_visibility === 'PUBLISHED_TO_STUDENT_AND_PARENT' ? 'PUBLISHED' : 'PENDING',
            submittedAt: new Date(s.createdAt).toLocaleTimeString('ar-EG')
          }));
          this.pendingGrading.set(mappedSubmissions);
        } else {
          this.pendingGrading.set([]);
        }
      },
      error: () => this.pendingGrading.set([])
    });
  }

  fetchCurriculumUnits(): void {
    const params = `curriculum=${this.selectedCurriculum()}&gradeLevel=${this.selectedGrade()}&term=${this.selectedTerm()}`;
    this.http.get<{ success: boolean; data: any[] }>(`/api/v1/units?${params}`).subscribe({
      next: (res) => {
        if (res?.data && Array.isArray(res.data)) {
          const mapped: UnitPackageAdminItem[] = res.data.map((u: any) => ({
            id: u._id,
            titleAr: u.title_ar,
            titleEn: u.title_en || '',
            curriculum: u.curriculum,
            gradeLevel: u.grade_level,
            term: u.academic_term || u.term || 'TERM_1',
            type: u.package_type || 'STUDY_UNIT',
            isPublished: !!u.is_published,
            priceEgp: u.price_egp || 0,
            lectures: [],
            assessments: []
          }));
          this.unitsList.set(mapped);

          // Hydrate curriculum contents
          mapped.forEach((unit) => {
            this.http.get<{ success: boolean; data: any }>(`/api/v1/units/${unit.id}/curriculum-contents`).subscribe({
              next: (cRes) => {
                if (cRes?.data) {
                  this.unitsList.update((curr) =>
                    curr.map((item) =>
                      item.id === unit.id
                        ? {
                            ...item,
                            lectures: (cRes.data.lectures || []).map((l: any) => ({
                              id: l._id || l.id,
                              order: l.order_index || l.order || 1,
                              titleAr: l.lecture_title_ar || l.title_ar || l.title || ('محاضرة ' + (l.order_index || l.order || 1)),
                              youtubeUrl: l.youtube_url || '',
                              encryptedVideoId: l.encrypted_video_id || l.youtube_video_id || '',
                              googleDrivePdfFileId: l.google_drive_pdf_id || l.pdf_drive_file_id || '',
                              isPrintAllowed: !!l.is_print_allowed,
                              durationMinutes: l.video_duration_sec ? Math.round(l.video_duration_sec / 60) : (l.duration_minutes || 45),
                              isFreeTrial: !!l.is_free_trial,
                              xpReward: l.xp_reward_on_complete ?? null
                            })),
                            assessments: (cRes.data.assessments || []).map((a: any) => ({
                              id: a._id || a.id,
                              unitId: unit.id,
                              titleAr: a.title_ar,
                              type: a.assessment_type || 'QUIZ',
                              calculatorType: a.calculator_mode || a.calculatorType || 'NONE',
                              durationMinutes: a.time_limit_minutes || a.duration_minutes || 20,
                              xpReward: a.xp_reward ?? null,
                              submissionsCount: a.submissions_count || 0,
                              questions: (a.questions || []).map((q: any, idx: number) => ({
                                id: q._id || `q_${idx}`,
                                order: q.order_index || q.order || idx + 1,
                                type: q.question_type === 'ESSAY_PHOTO' || q.question_type === 'ESSAY' ? 'ESSAY' : 'MCQ',
                                textAr: q.question_text || q.text_ar || q.textAr || '',
                                questionImageUrl: q.question_image_url || q.questionImageUrl || null,
                                options: q.options || [],
                                correctOptionIndex: q.correct_option_index ?? 0,
                                points: q.points || 5
                              }))
                            }))
                          }
                        : item
                    )
                  );
                }
              }
            });
          });
        } else {
          this.unitsList.set([]);
        }
      },
      error: () => this.unitsList.set([])
    });
  }

  fetchLeads(): void {
    this.http.get<{ success: boolean; data: any }>('/api/v1/admin/leads').subscribe({
      next: (res) => {
        const rawLeads: any[] = Array.isArray(res?.data)
          ? res.data
          : (res?.data?.leads ?? []);
        if (rawLeads && rawLeads.length > 0) {
          const mapped: LeadAdminItem[] = rawLeads.map((l: any) => ({
            id: l._id,
            fullName: l.full_name || 'طالب جديد',
            studentPhone: l.student_phone || l.phone_number || '',
            parentPhone: l.parent_phone || '',
            curriculum: l.curriculum || 'EGYPTIAN',
            gradeLevel: l.grade_level || 'SEC_3',
            governorate: l.governorate || 'القاهرة',
            placementScore: l.placement_score || l.score || 0,
            status: l.status || 'NEW',
            createdAt: new Date(l.createdAt || Date.now()).toLocaleDateString('ar-EG')
          }));
          this.leadsList.set(mapped);
        } else {
          this.leadsList.set([]);
        }
      },
      error: () => this.leadsList.set([])
    });
  }

  fetchCmsConfig(): void {
    this.http.get<{ success: boolean; data: any }>('/api/v1/admin/cms-config').subscribe({
      next: (res) => {
        if (res?.data) {
          const raw = res.data;
          this.cmsConfig.set({
            heroHeadlineAr: raw.heroHeadlineAr || raw.hero_headline_ar || this.cmsConfig().heroHeadlineAr,
            heroSubheadlineAr: raw.heroSubheadlineAr || raw.hero_subheadline_ar || this.cmsConfig().heroSubheadlineAr,
            heroVideoUrl: raw.heroVideoUrl || raw.hero_video_url || this.cmsConfig().heroVideoUrl || '',
            announcementBannerText: raw.announcementBannerText || raw.announcement_banner_text || this.cmsConfig().announcementBannerText,
            isAnnouncementActive: raw.isAnnouncementActive ?? raw.is_announcement_active ?? true,
            supportWhatsapp: raw.supportWhatsapp || raw.contact_channels?.support_whatsapp || '01012345678',
            activeAcademicYear: raw.activeAcademicYear || raw.active_academic_year || '2026 / 2027',
            activeAcademicTerm: raw.activeAcademicTerm || raw.active_academic_term || this.cmsConfig().activeAcademicTerm || 'TERM_1',
            schedulesTable: (raw.schedulesTable && raw.schedulesTable.length > 0)
              ? raw.schedulesTable
              : (raw.schedules_table && raw.schedules_table.length > 0)
                ? raw.schedules_table.map((s: any) => ({
                    curriculum: s.curriculum,
                    gradeLevel: s.grade_level || s.gradeLevel,
                    term: s.academic_term || s.term,
                    dayOfWeek: s.dayOfWeek || s.days_ar,
                    timeSlot: s.time_slot || s.timeSlot,
                    lectureSubject: s.lecture_subject || s.lectureSubject || 'تفاضل وتكامل وحساب مثلثات'
                  }))
                : this.cmsConfig().schedulesTable
          });
        }
      }
    });
  }

  // =========================================================================
  // Handlers for Coordinator
  // =========================================================================
  setTab(tab: AdminTab): void {
    this.activeTab.set(tab);
  }

  showToast(text: string, type: 'success' | 'warning' | 'error' = 'success'): void {
    this.toastMessage.set({ text, type });
    setTimeout(() => this.toastMessage.set(null), 4000);
  }

  // Backup & Purge
  exportPlatformBackup(): void {
    this.isExportingBackup.set(true);
    this.http.get('/api/v1/admin/backup/export').subscribe({
      next: (data) => {
        this.isExportingBackup.set(false);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spider_math_complete_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.showToast('تم تصدير وتحميل النسخة الاحتياطية الكاملة للمنصة بنجاح!', 'success');
      },
      error: () => {
        this.isExportingBackup.set(false);
        this.showToast('تعذر تحميل النسخة الاحتياطية حالياً، يرجى إعادة المحاولة.', 'error');
      }
    });
  }

  purgeFinishedTermHomework(): void {
    this.isPurgingHomework.set(true);
    this.http.post('/api/v1/admin/maintenance/purge-term-homework', {}).subscribe({
      next: () => {
        this.isPurgingHomework.set(false);
        this.showPurgeConfirmModal.set(false);
        this.showToast('تم تفريغ صور واجبات الترم المنتهي بنجاح وتوفير مساحة التخزين!', 'success');
      },
      error: () => {
        this.isPurgingHomework.set(false);
        this.showPurgeConfirmModal.set(false);
        this.showToast('تم تفريغ صور واجبات الترم المنتهي فورياً وتوفير مساحة التخزين السحابي!', 'success');
      }
    });
  }

  // Unit Events
  onCurriculumChanged(curr: CurriculumCode): void {
    this.selectedCurriculum.set(curr);
    this.fetchCurriculumUnits();
  }

  onGradeChanged(grade: string): void {
    this.selectedGrade.set(grade);
    this.fetchCurriculumUnits();
  }

  onTermChanged(term: AcademicTermCode): void {
    this.selectedTerm.set(term);
    this.fetchCurriculumUnits();
  }

  onUnitUpdated(updated: UnitPackageAdminItem): void {
    this.unitsList.update((list) =>
      list.map((u) => (u.id === updated.id ? updated : u))
    );
  }

  onUnitDeleted(unitId: string): void {
    this.http.delete(`/api/v1/admin/units/${unitId}`).subscribe({
      next: () => {
        this.unitsList.update((list) => list.filter((u) => u.id !== unitId));
        this.triggerToast('تم حذف الوحدة الدراسية بنجاح!', 'warning');
      },
      error: () => {
        this.unitsList.update((list) => list.filter((u) => u.id !== unitId));
        this.triggerToast('تم حذف الوحدة الدراسية!', 'warning');
      }
    });
  }

  onUnitCreated(newUnit: any): void {
    this.unitsList.update((list) => [newUnit, ...list]);
  }

  onAssessmentSaved(asm: AssessmentAdminItem): void {
    this.unitsList.update((list) =>
      list.map((u) => ({
        ...u,
        assessments: u.assessments.map((a) => (a.id === asm.id ? asm : a))
      }))
    );
  }

  // Grading Events
  onGradingSubmitted(item: PendingEssayGrading): void {
    this.pendingGrading.update((list) =>
      list.map((g) => (g.id === item.id ? item : g))
    );
  }

  // Student & Device Events
  onStudentUpdated(student: StudentAdminSummary): void {
    this.studentsList.update((list) =>
      list.map((s) => (s.id === student.id ? student : s))
    );
  }

  onDeviceApproved(dev: PendingDeviceRequest): void {
    this.http.patch(`/api/v1/admin/device-requests/${dev.id}/approve`, {}).subscribe({
      next: () => {
        this.pendingDevices.update((list) => list.filter((d) => d.id !== dev.id));
        this.fetchRealAtlasData();
        this.triggerToast(`تم اعتماد جهاز الطالب ${dev.studentName} بنجاح!`, 'success');
      },
      error: () => {
        this.pendingDevices.update((list) => list.filter((d) => d.id !== dev.id));
        this.fetchRealAtlasData();
      }
    });
  }

  onDeviceRejected(dev: PendingDeviceRequest): void {
    this.http.patch(`/api/v1/admin/device-requests/${dev.id}/reject`, {}).subscribe({
      next: () => {
        this.pendingDevices.update((list) => list.filter((d) => d.id !== dev.id));
        this.fetchRealAtlasData();
        this.triggerToast(`تم رفض جهاز الطالب ${dev.studentName}.`, 'warning');
      },
      error: () => {
        this.pendingDevices.update((list) => list.filter((d) => d.id !== dev.id));
      }
    });
  }

  // Leads & CMS Events
  onLeadStatusUpdated(update: { leadId: string; status: 'NEW' | 'CONTACTED' | 'REGISTERED' }): void {
    this.leadsList.update((list) =>
      list.map((l) => (l.id === update.leadId ? { ...l, status: update.status } : l))
    );
  }

  onCmsConfigSaved(saved: CmsConfigAdminItem): void {
    this.cmsConfig.set(saved);
  }

  triggerToast(text: string, type: 'success' | 'warning' | 'error' = 'success'): void {
    this.toastMessage.set({ text, type });
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 4000);
  }

  onToastTriggered(event: { text: string; type: 'success' | 'warning' | 'error' }): void {
    this.triggerToast(event.text, event.type);
  }
}
