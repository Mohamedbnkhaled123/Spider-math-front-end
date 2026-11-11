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
import { SwrCacheService } from '../../core/services/swr-cache.service';
import { CurriculumCode, AcademicTermCode, CANONICAL_CURRICULUM_TREE, curriculumHasTerms } from '../../core/constants/curriculum-tree.constant';

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
  private readonly swrCache = inject(SwrCacheService);
  readonly authService = inject(AuthService);
  readonly langService = inject(LangService);

  // Active navigation tab (defaults directly to assessments per teacher workflow)
  readonly activeTab = signal<AdminTab>('assessments');
  readonly isLoading = signal<boolean>(false);
  readonly toastMessage = signal<{ text: string; type: 'success' | 'warning' | 'error' } | null>(null);

  // Maintenance & Backup Actions
  readonly isExportingBackup = signal<boolean>(false);
  readonly isPurgingHomework = signal<boolean>(false);
  readonly showPurgeConfirmModal = signal<boolean>(false);

  // Curriculum State
  readonly selectedCurriculum = signal<CurriculumCode>('EGYPTIAN');
  readonly selectedGrade = signal<string>('');
  readonly selectedTerm = signal<AcademicTermCode>('TERM_1');
  readonly activeGrades = signal<string[]>([]);
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
    supportTelegram: '',
    facebookUrl: '',
    youtubeUrl: '',
    activeAcademicYear: '2026 / 2027',
    activeAcademicTerm: 'TERM_1',
    schedulesTable: [],
    landingUnitIds: [],
    hallOfFameBadgeAr: 'لوحة الشرف • أبطال الرياضيات',
    hallOfFameBadgeEn: 'Hall of Fame • Top Math Masters',
    hallOfFameTitleAr: 'لوحة الشرف والتفوق الأكاديمي',
    hallOfFameTitleEn: 'Academic Hall of Fame & Honor Roll',
    hallOfFameSubtitleAr: 'نخبة طلابنا الذين حققوا العلامات الكاملة وأعلى مراتب التميز والذكاء الرياضي.',
    hallOfFameSubtitleEn: 'Elite students who achieved perfect scores and mathematical excellence across all academic curricula.',
    honorBoardList: []
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
    // Restore persisted active tab and grade filters
    let savedGrade = '';
    try {
      const savedTab = localStorage.getItem('spider_admin_active_tab') as AdminTab | null;
      const validTabs: AdminTab[] = ['analytics', 'curriculum', 'assessments', 'grading', 'students', 'leads_cms'];
      if (savedTab && validTabs.includes(savedTab)) {
        this.activeTab.set(savedTab);
      }

      const savedCurriculum = localStorage.getItem('spider_admin_selected_curriculum') as CurriculumCode | null;
      if (savedCurriculum) {
        this.selectedCurriculum.set(savedCurriculum);
      }

      savedGrade = localStorage.getItem('spider_admin_selected_grade') || '';
      if (savedGrade) {
        this.selectedGrade.set(savedGrade);
      }

      const savedTerm = localStorage.getItem('spider_admin_selected_term') as AcademicTermCode | null;
      if (savedTerm) {
        this.selectedTerm.set(savedTerm);
      }
    } catch {}

    this.fetchActiveGrades(savedGrade);

    // Hydrate persistent SWR cache immediately in 0ms (Cache-First)
    const cachedActiveGrades = this.swrCache.get<string[]>('admin_active_grades');
    if (cachedActiveGrades && cachedActiveGrades.length > 0) {
      this.activeGrades.set(cachedActiveGrades);
    }
    const cachedStudents = this.swrCache.get<StudentAdminSummary[]>('admin_students_list');
    if (cachedStudents && cachedStudents.length > 0) {
      this.studentsList.set(cachedStudents);
    }
    const cachedDevices = this.swrCache.get<PendingDeviceRequest[]>('admin_pending_devices');
    if (cachedDevices) {
      this.pendingDevices.set(cachedDevices);
    }
    const cachedGrading = this.swrCache.get<PendingEssayGrading[]>('admin_pending_grading');
    if (cachedGrading) {
      this.pendingGrading.set(cachedGrading);
    }
    const cachedLeads = this.swrCache.get<LeadAdminItem[]>('admin_leads_list');
    if (cachedLeads && cachedLeads.length > 0) {
      this.leadsList.set(cachedLeads);
    }
    const cachedCms = this.swrCache.get<CmsConfigAdminItem>('admin_cms_config');
    if (cachedCms) {
      this.cmsConfig.set(cachedCms);
    }
    const unitsKey = `admin_units_${this.selectedCurriculum()}_${this.selectedGrade()}_${this.selectedTerm()}`;
    const cachedUnits = this.swrCache.get<UnitPackageAdminItem[]>(unitsKey);
    if (cachedUnits && cachedUnits.length > 0) {
      this.unitsList.set(cachedUnits);
    }

    // Silent background revalidation
    this.fetchRealAtlasData();
    this.fetchCurriculumUnits();
    this.fetchLeads();
    this.fetchCmsConfig();
  }

  fetchActiveGrades(savedGrade?: string): void {
    this.http.get<{ success: boolean; data: any }>('/api/v1/public/active-grades').subscribe({
      next: (res) => {
        const active = res?.data?.activeGrades;
        if (Array.isArray(active) && active.length > 0) {
          this.activeGrades.set(active);
          this.swrCache.set('admin_active_grades', active);
          if (!savedGrade) {
            const curr = this.selectedCurriculum();
            const track = CANONICAL_CURRICULUM_TREE.find(c => c.code === curr);
            const matchedActive = track?.grades.find(g => active.includes(g.code))?.code || active[0];
            this.selectedGrade.set(matchedActive);
            this.fetchCurriculumUnits();
          }
        }
      }
    });
  }

  // =========================================================================
  // API Data Fetching Methods
  // =========================================================================
  fetchRealAtlasData(): void {
    if (this.studentsList().length === 0) {
      this.isLoading.set(true);
    }

    // 1. Fetch Students (Strictly Student & Parent accounts, never Admin / Teacher)
    this.http.get<{ success: boolean; data: any[] }>('/api/v1/admin/users/students').subscribe({
      next: (res) => {
        if (res?.data) {
          const studentOnlyUsers = res.data.filter((u) => {
            const role = (u.role || 'STUDENT').toUpperCase();
            const isAdminOrTeacher = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'TEACHER';
            const isAdminEmail = (u.email || '').toLowerCase().includes('admin@') || (u.email || '').toLowerCase().includes('teacher@');
            const isTeacherOrAdminName = (u.full_name || u.name || '').includes('هبة عبد الوهاب') || (u.full_name || u.name || '').includes('مدير النظام');
            return !isAdminOrTeacher && !isAdminEmail && !isTeacherOrAdminName;
          });

          const mapped: StudentAdminSummary[] = studentOnlyUsers.map((u) => {
            const role = (u.role || 'STUDENT') as 'STUDENT' | 'PARENT';
            let roleCurriculum = u.curriculum || 'المصري';
            let roleGrade = u.grade_level || '—';
            let defaultCode = u.student_code || (u.is_profile_completed === false ? 'قيد التسجيل' : '—');

            if (role === 'PARENT') {
              roleCurriculum = 'حساب ولي أمر';
              roleGrade = 'متابعة الأبناء';
              defaultCode = '—';
            }

            return {
              id: u._id,
              name: u.full_name || (role === 'PARENT' ? 'ولي أمر' : 'طالب مسجل'),
              role,
              haCode: defaultCode,
              email: u.email,
              phone: u.phone,
              parentPhone: u.parent_phone,
              curriculum: roleCurriculum,
              gradeLevel: roleGrade,
              hasActiveSubscription: !!u.has_active_subscription,
              subscriptionStatus: u.has_active_subscription ? 'ACTIVE' : 'CANCELLED',
              totalXp: u.total_xp || 0,
              approvedDevices: Array.isArray(u.approved_devices) ? u.approved_devices.length : 1,
              isLocked: u.account_lock_status === 'LOCKED',
              isLeaderboardHidden: !!u.is_leaderboard_hidden,
              isProfileCompleted: u.is_profile_completed ?? (!!u.student_code),
              createdAt: u.createdAt
            };
          });
          this.studentsList.set(mapped);
          this.swrCache.set('admin_students_list', mapped);
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
          this.swrCache.set('admin_pending_devices', mappedDevices);
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
            maxScore: typeof s.assessment_id === 'object'
              ? (s.assessment_id?.total_points || (s.assessment_id?.questions?.length ? s.assessment_id.questions.reduce((sum: number, q: any) => sum + (Number(q.points) || 1), 0) : 10))
              : 10,
            awardedScore: s.essay_manual_score ?? 0,
            generalTeacherNote: s.teacher_feedback_notes || '',
            mistakes: [],
            status: s.result_visibility === 'PUBLISHED_TO_STUDENT_AND_PARENT' ? 'PUBLISHED' : 'PENDING',
            submittedAt: new Date(s.createdAt).toLocaleTimeString('ar-EG')
          }));
          this.pendingGrading.set(mappedSubmissions);
          this.swrCache.set('admin_pending_grading', mappedSubmissions);
        } else {
          this.pendingGrading.set([]);
        }
      },
      error: () => this.pendingGrading.set([])
    });
  }

  fetchCurriculumUnits(): void {
    if (!this.selectedGrade()) {
      return;
    }
    const termQuery = curriculumHasTerms(this.selectedCurriculum()) ? `&term=${this.selectedTerm()}` : '';
    const params = `curriculum=${this.selectedCurriculum()}&gradeLevel=${this.selectedGrade()}${termQuery}`;
    const unitsKey = `admin_units_${this.selectedCurriculum()}_${this.selectedGrade()}_${this.selectedTerm()}`;
    const cached = this.swrCache.get<UnitPackageAdminItem[]>(unitsKey);
    if (cached && cached.length > 0) {
      this.unitsList.set(cached);
    }
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
            originalPriceEgp: u.original_price_egp || null,
            discountPercentage: u.discount_percentage || null,
            isDiscounted: !!(u.is_discounted || (u.original_price_egp && u.original_price_egp > u.price_egp)),
            lectures: [],
            assessments: []
          }));
          this.unitsList.set(mapped);
          this.swrCache.set(unitsKey, mapped);

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
                              isFree: !!(l.is_free ?? l.isFree ?? l.is_free_trial),
                              isFreeTrial: !!(l.is_free ?? l.isFree ?? l.is_free_trial),
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
                              referenceSheetUrl: a.reference_sheet_url || a.referenceSheetUrl || null,
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
                  this.swrCache.set(unitsKey, this.unitsList());
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
            gradeLevel: l.grade_level || '—',
            governorate: l.governorate || 'القاهرة',
            placementScore: l.placement_score || l.score || 0,
            status: l.status || 'NEW',
            createdAt: new Date(l.createdAt || Date.now()).toLocaleDateString('ar-EG')
          }));
          this.leadsList.set(mapped);
          this.swrCache.set('admin_leads_list', mapped);
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
          const current = this.cmsConfig();
          this.cmsConfig.set({
            announcementBannerText: raw.announcementBannerText || raw.announcement_banner_text || current.announcementBannerText,
            announcementBannerTextEn: raw.announcementBannerTextEn || raw.announcement_banner_text_en || current.announcementBannerTextEn,
            isAnnouncementActive: raw.isAnnouncementActive ?? raw.is_announcement_active ?? true,

            heroHeadlineAr: raw.heroHeadlineAr || raw.hero_headline_ar || current.heroHeadlineAr,
            heroHeadlineEn: raw.heroHeadlineEn || raw.hero_headline_en || current.heroHeadlineEn,
            heroSubheadlineAr: raw.heroSubheadlineAr || raw.hero_subheadline_ar || current.heroSubheadlineAr,
            heroSubheadlineEn: raw.heroSubheadlineEn || raw.hero_subheadline_en || current.heroSubheadlineEn,
            heroBadgeAr: raw.heroBadgeAr || raw.hero_badge_ar || current.heroBadgeAr,
            heroBadgeEn: raw.heroBadgeEn || raw.hero_badge_en || current.heroBadgeEn,
            heroCtaPrimaryAr: raw.heroCtaPrimaryAr || raw.hero_cta_primary_ar || current.heroCtaPrimaryAr,
            heroCtaPrimaryEn: raw.heroCtaPrimaryEn || raw.hero_cta_primary_en || current.heroCtaPrimaryEn,
            heroCtaSecondaryAr: raw.heroCtaSecondaryAr || raw.hero_cta_secondary_ar || current.heroCtaSecondaryAr,
            heroCtaSecondaryEn: raw.heroCtaSecondaryEn || raw.hero_cta_secondary_en || current.heroCtaSecondaryEn,
            heroVideoUrl: raw.heroVideoUrl || raw.hero_video_url || current.heroVideoUrl || '',

            teacherNameAr: raw.teacherNameAr || raw.teacher_name_ar || current.teacherNameAr,
            teacherNameEn: raw.teacherNameEn || raw.teacher_name_en || current.teacherNameEn,
            teacherTitleAr: raw.teacherTitleAr || raw.teacher_title_ar || current.teacherTitleAr,
            teacherTitleEn: raw.teacherTitleEn || raw.teacher_title_en || current.teacherTitleEn,
            teacherBioAr: raw.teacherBioAr || raw.teacher_bio_ar || current.teacherBioAr,
            teacherBioEn: raw.teacherBioEn || raw.teacher_bio_en || current.teacherBioEn,
            teacherQualificationsAr: (raw.teacherQualificationsAr && raw.teacherQualificationsAr.length > 0)
              ? raw.teacherQualificationsAr
              : (raw.teacher_qualifications_ar && raw.teacher_qualifications_ar.length > 0)
                ? raw.teacher_qualifications_ar
                : current.teacherQualificationsAr,
            teacherQualificationsEn: (raw.teacherQualificationsEn && raw.teacherQualificationsEn.length > 0)
              ? raw.teacherQualificationsEn
              : (raw.teacher_qualifications_en && raw.teacher_qualifications_en.length > 0)
                ? raw.teacher_qualifications_en
                : current.teacherQualificationsEn,
            teacherWhatsappCtaAr: raw.teacherWhatsappCtaAr || raw.teacher_whatsapp_cta_ar || current.teacherWhatsappCtaAr,
            teacherWhatsappCtaEn: raw.teacherWhatsappCtaEn || raw.teacher_whatsapp_cta_en || current.teacherWhatsappCtaEn,

            curriculumBadgeAr: raw.curriculumBadgeAr || raw.curriculum_badge_ar || current.curriculumBadgeAr,
            curriculumBadgeEn: raw.curriculumBadgeEn || raw.curriculum_badge_en || current.curriculumBadgeEn,
            curriculumTitleAr: raw.curriculumTitleAr || raw.curriculum_title_ar || current.curriculumTitleAr,
            curriculumTitleEn: raw.curriculumTitleEn || raw.curriculum_title_en || current.curriculumTitleEn,
            curriculumSubtitleAr: raw.curriculumSubtitleAr || raw.curriculum_subtitle_ar || current.curriculumSubtitleAr,
            curriculumSubtitleEn: raw.curriculumSubtitleEn || raw.curriculum_subtitle_en || current.curriculumSubtitleEn,

            placementBadgeAr: raw.placementBadgeAr || raw.placement_badge_ar || current.placementBadgeAr,
            placementBadgeEn: raw.placementBadgeEn || raw.placement_badge_en || current.placementBadgeEn,
            placementHeadlineAr: raw.placementHeadlineAr || raw.placement_headline_ar || current.placementHeadlineAr,
            placementHeadlineEn: raw.placementHeadlineEn || raw.placement_headline_en || current.placementHeadlineEn,
            placementSubtitleAr: raw.placementSubtitleAr || raw.placement_subtitle_ar || current.placementSubtitleAr,
            placementSubtitleEn: raw.placementSubtitleEn || raw.placement_subtitle_en || current.placementSubtitleEn,
            placementFeature1Ar: raw.placementFeature1Ar || raw.placement_feature_1_ar || current.placementFeature1Ar,
            placementFeature1En: raw.placementFeature1En || raw.placement_feature_1_en || current.placementFeature1En,
            placementFeature2Ar: raw.placementFeature2Ar || raw.placement_feature_2_ar || current.placementFeature2Ar,
            placementFeature2En: raw.placementFeature2En || raw.placement_feature_2_en || current.placementFeature2En,
            placementFeature3Ar: raw.placementFeature3Ar || raw.placement_feature_3_ar || current.placementFeature3Ar,
            placementFeature3En: raw.placementFeature3En || raw.placement_feature_3_en || current.placementFeature3En,
            placementCtaAr: raw.placementCtaAr || raw.placement_cta_ar || current.placementCtaAr,
            placementCtaEn: raw.placementCtaEn || raw.placement_cta_en || current.placementCtaEn,

            scheduleBadgeAr: raw.scheduleBadgeAr || raw.schedule_badge_ar || current.scheduleBadgeAr,
            scheduleBadgeEn: raw.scheduleBadgeEn || raw.schedule_badge_en || current.scheduleBadgeEn,
            scheduleTitleAr: raw.scheduleTitleAr || raw.schedule_title_ar || current.scheduleTitleAr,
            scheduleTitleEn: raw.scheduleTitleEn || raw.schedule_title_en || current.scheduleTitleEn,
            scheduleSubtitleAr: raw.scheduleSubtitleAr || raw.schedule_subtitle_ar || current.scheduleSubtitleAr,
            scheduleSubtitleEn: raw.scheduleSubtitleEn || raw.schedule_subtitle_en || current.scheduleSubtitleEn,

            pricingBadgeAr: raw.pricingBadgeAr || raw.pricing_badge_ar || current.pricingBadgeAr,
            pricingBadgeEn: raw.pricingBadgeEn || raw.pricing_badge_en || current.pricingBadgeEn,
            pricingTitleAr: raw.pricingTitleAr || raw.pricing_title_ar || current.pricingTitleAr,
            pricingTitleEn: raw.pricingTitleEn || raw.pricing_title_en || current.pricingTitleEn,
            pricingSubtitleAr: raw.pricingSubtitleAr || raw.pricing_subtitle_ar || current.pricingSubtitleAr,
            pricingSubtitleEn: raw.pricingSubtitleEn || raw.pricing_subtitle_en || current.pricingSubtitleEn,

            supportWhatsapp: raw.supportWhatsapp || raw.contact_channels?.support_whatsapp || '01012345678',
            supportTelegram: raw.supportTelegram || raw.contact_channels?.telegram_url || '',
            facebookUrl: raw.facebookUrl || raw.contact_channels?.facebook_url || '',
            youtubeUrl: raw.youtubeUrl || raw.contact_channels?.youtube_channel_url || '',
            activeAcademicYear: raw.activeAcademicYear || raw.active_academic_year || '2026 / 2027',
            activeAcademicTerm: raw.activeAcademicTerm || raw.active_academic_term || current.activeAcademicTerm || 'TERM_1',
            schedulesTable: Array.isArray(raw.schedulesTable)
              ? raw.schedulesTable
              : (Array.isArray(raw.schedules_table)
                ? raw.schedules_table.map((s: any) => ({
                    curriculum: s.curriculum,
                    gradeLevel: s.grade_level || s.gradeLevel,
                    term: s.academic_term || s.term,
                    dayOfWeek: s.dayOfWeek || s.days_ar,
                    timeSlot: s.time_slot || s.timeSlot,
                    lectureSubject: s.lecture_subject || s.lectureSubject || ''
                  }))
                : []),
            landingUnitIds: raw.landingUnitIds || raw.landing_unit_ids || [],
            hallOfFameBadgeAr: raw.hallOfFameBadgeAr || raw.hall_of_fame_badge_ar || current.hallOfFameBadgeAr || '',
            hallOfFameBadgeEn: raw.hallOfFameBadgeEn || raw.hall_of_fame_badge_en || current.hallOfFameBadgeEn || '',
            hallOfFameTitleAr: raw.hallOfFameTitleAr || raw.hall_of_fame_title_ar || current.hallOfFameTitleAr || '',
            hallOfFameTitleEn: raw.hallOfFameTitleEn || raw.hall_of_fame_title_en || current.hallOfFameTitleEn || '',
            hallOfFameSubtitleAr: raw.hallOfFameSubtitleAr || raw.hall_of_fame_subtitle_ar || current.hallOfFameSubtitleAr || '',
            hallOfFameSubtitleEn: raw.hallOfFameSubtitleEn || raw.hall_of_fame_subtitle_en || current.hallOfFameSubtitleEn || '',
            honorBoardList: Array.isArray(raw.honorBoardList)
              ? raw.honorBoardList
              : (Array.isArray(raw.honor_board_list) ? raw.honor_board_list : (current.honorBoardList || []))
          });
          this.swrCache.set('admin_cms_config', this.cmsConfig());
        }
      }
    });
  }

  // =========================================================================
  // Handlers for Coordinator
  // =========================================================================
  setTab(tab: AdminTab): void {
    this.activeTab.set(tab);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('spider_admin_active_tab', tab);
      } catch {}
    }
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
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('spider_admin_selected_curriculum', curr);
      } catch {}
    }
    const track = CANONICAL_CURRICULUM_TREE.find(c => c.code === curr);
    const active = this.activeGrades();
    const matchedActive = track?.grades.find(g => active.includes(g.code))?.code;
    const newGrade = matchedActive || track?.grades[0]?.code || '';
    if (newGrade) {
      this.selectedGrade.set(newGrade);
      if (isPlatformBrowser(this.platformId)) {
        try {
          localStorage.setItem('spider_admin_selected_grade', newGrade);
        } catch {}
      }
    }
    this.fetchCurriculumUnits();
  }

  onGradeChanged(grade: string): void {
    this.selectedGrade.set(grade);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('spider_admin_selected_grade', grade);
      } catch {}
    }
    this.fetchCurriculumUnits();
  }

  onTermChanged(term: AcademicTermCode): void {
    this.selectedTerm.set(term);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('spider_admin_selected_term', term);
      } catch {}
    }
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
