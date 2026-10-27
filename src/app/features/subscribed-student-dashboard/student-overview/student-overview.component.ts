import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { AuthService, IUserDto } from '../../../core/auth/auth.service';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { AcademicTermCode } from '../../../core/constants/curriculum-tree.constant';
import { EGYPT_GOVERNORATES } from '../../../core/constants/governorates.constant';
import {
  validatePhoneNumber,
  arePhoneNumbersIdentical,
  getPhonePlaceholderByCountry
} from '../../../core/utils/phone-validator.util';
import {
  EnrolledUnitSummary,
  LeaderboardRankEntry,
  StudentNotificationItem,
  StudentLectureItem,
  StudentDueQuizItem,
  StudentCompletedGradeItem
} from './student-overview.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 13: Subscribed Student Overview Component
 * 
 * - Academic Term Switcher (TERM_1 / TERM_2)
 * - Enrolled units & final revisions grid with watch progress
 * - Dynamic XP Progress Ring (Animation 4.4)
 * - Glowing Podium Leaderboard (GET /api/v1/gamification/leaderboard - Animation 4.5)
 * - Notification bell with unread indicator
 * - Profile Editor Modal (Full name, student phone, parent phone, avatar, governorate)
 * - Detailed Lecture Tracker (Watched vs. Pending / Not Watched)
 * - Quizzes & Assessments Tracker (Due quizzes + Graded submissions with teacher feedback)
 */
@Component({
  selector: 'app-student-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AppIconComponent],
  templateUrl: './student-overview.component.html',
  styleUrls: ['./student-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentOverviewComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly authService = inject(AuthService);
  readonly langService = inject(LangService);

  // Term Switcher Signal
  readonly selectedTerm = signal<AcademicTermCode>('TERM_1');
  readonly isNotificationsOpen = signal<boolean>(false);
  readonly isLoadingLeaderboard = signal<boolean>(false);
  readonly expandedUnitId = signal<string | null>(null);

  toggleUnitLectures(unitId: string): void {
    if (this.expandedUnitId() === unitId) {
      this.expandedUnitId.set(null);
    } else {
      this.expandedUnitId.set(unitId);
    }
  }

  // Filter tabs for lectures
  readonly lecturesFilter = signal<'ALL' | 'WATCHED' | 'UNWATCHED'>('ALL');

  // Egypt Governorates
  readonly egyptGovernorates = EGYPT_GOVERNORATES;

  // Preset Avatars for Student Selection
  readonly presetAvatars = [
    { id: 'av_1', label: 'رائد الرياضيات', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SpiderMath1' },
    { id: 'av_2', label: 'عبقري التفاضل', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SpiderMath2' },
    { id: 'av_3', label: 'مهندس الفراغية', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SpiderMath3' },
    { id: 'av_4', label: 'بطل الجبر', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SpiderMath4' },
    { id: 'av_5', label: 'محلل ديسموس', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SpiderMath5' },
    { id: 'av_6', label: 'نجم سبايدر ماث', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SpiderMath6' }
  ];

  // =========================================================================
  // Profile Editor Signals & State
  // =========================================================================
  readonly isProfileModalOpen = signal<boolean>(false);
  readonly editFullName = signal<string>('');
  readonly editPhone = signal<string>('');
  readonly editParentPhone = signal<string>('');
  readonly editCountry = signal<string>('EG');
  readonly editGovernorate = signal<string>('CAIRO');
  readonly editAvatarUrl = signal<string>('');
  readonly isSavingProfile = signal<boolean>(false);
  readonly profileErrorMessage = signal<string | null>(null);
  readonly profileSuccessMessage = signal<string | null>(null);

  readonly isEditEgypt = computed<boolean>(() => this.editCountry() === 'EG');
  readonly editPhonePlaceholder = computed<string>(() =>
    getPhonePlaceholderByCountry(this.editCountry())
  );

  // XP Progress Ring Computations (Animation 4.4)
  readonly userTotalXp = computed(() => this.authService.currentUser()?.total_xp ?? 1150);
  readonly currentLevel = computed(() => Math.floor(this.userTotalXp() / 500) + 1);
  readonly xpInCurrentLevel = computed(() => this.userTotalXp() % 500);
  readonly xpLevelProgressPct = computed(() => Math.min(100, Math.round((this.xpInCurrentLevel() / 500) * 100)));
  readonly xpRingDashoffset = computed(() => {
    const circumference = 226.19; // 2 * PI * 36
    return circumference - (this.xpLevelProgressPct() / 100) * circumference;
  });

  // =========================================================================
  // Dynamic Real Atlas Signals & Active Grades Check
  // =========================================================================
  readonly activeGrades = signal<string[]>(['SEC_3']);
  readonly currentUserGrade = computed(() => this.authService.currentUser()?.grade_level || 'SEC_3');
  readonly currentUserCurriculum = computed(() => this.authService.currentUser()?.curriculum || 'EGYPTIAN');
  readonly isCurrentGradeActive = computed(() => this.activeGrades().includes(this.currentUserGrade()));
  readonly isLoadingUnits = signal<boolean>(true);

  // Active units catalog (Real from Atlas)
  readonly units = signal<EnrolledUnitSummary[]>([]);

  // Filtered units by selected academic term
  readonly filteredUnits = computed(() => {
    const term = this.selectedTerm();
    return this.units().filter(u => u.term === term);
  });

  // Overall watch percentage across current term
  readonly overallWatchPercentage = computed(() => {
    const list = this.filteredUnits();
    if (list.length === 0) return 0;
    const totalLectures = list.reduce((acc, u) => acc + u.totalLectures, 0);
    const completedLectures = list.reduce((acc, u) => acc + u.completedLectures, 0);
    return totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
  });

  // =========================================================================
  // Detailed Lectures Progress List (المحاضرات اللي شافها واللي لسه مشافهاش - Real from Atlas)
  // =========================================================================
  readonly lectures = signal<StudentLectureItem[]>([]);

  // Filtered lectures computed based on user tab selection
  readonly filteredLectures = computed(() => {
    const filter = this.lecturesFilter();
    const all = this.lectures();
    if (filter === 'WATCHED') {
      return all.filter(l => l.isWatched);
    }
    if (filter === 'UNWATCHED') {
      return all.filter(l => !l.isWatched);
    }
    return all;
  });

  readonly totalLecturesCount = computed(() => this.lectures().length);
  readonly watchedLecturesCount = computed(() => this.lectures().filter(l => l.isWatched).length);
  readonly unwatchedLecturesCount = computed(() => this.lectures().filter(l => !l.isWatched).length);

  // =========================================================================
  // Due Quizzes (الكويزات اللي عليه - Real from Atlas)
  // =========================================================================
  readonly dueQuizzes = signal<StudentDueQuizItem[]>([]);
  private readonly rawAssessmentsList = signal<any[]>([]);

  // =========================================================================
  // Graded Assessments & Teacher Feedback (درجات الطالب وتقييماته - Real from Atlas)
  // =========================================================================
  readonly completedGrades = signal<StudentCompletedGradeItem[]>([]);

  // Average Quiz Score
  readonly averageScorePercentage = computed(() => {
    const list = this.completedGrades();
    if (list.length === 0) return 0;
    const totalAchieved = list.reduce((acc, g) => acc + g.score, 0);
    const totalPossible = list.reduce((acc, g) => acc + g.maxScore, 0);
    return totalPossible > 0 ? Math.round((totalAchieved / totalPossible) * 100) : 0;
  });

  // Animation 4.5 Leaderboard Podiums (Real from Gamification API)
  readonly leaderboard = signal<LeaderboardRankEntry[]>([]);
  readonly topThreePodium = computed(() => this.leaderboard().filter(e => e.rank <= 3));
  readonly currentUserRank = computed(() => this.leaderboard().find(e => e.isCurrentUser));

  // Notifications List (Real from Notifications API)
  readonly notifications = signal<StudentNotificationItem[]>([]);
  readonly unreadNotificationsCount = computed(
    () => this.notifications().filter(n => !n.isRead).length
  );

  ngOnInit(): void {
    this.loadActiveGrades();
    this.fetchRealStudentData();
    this.fetchRealAssessments();
    this.fetchLeaderboard();
    this.fetchRealNotifications();
    this.fetchCompletedGrades();
  }

  fetchCompletedGrades(): void {
    this.http.get<{ success: boolean; data: any[] }>('/api/v1/assessments/my-submissions').subscribe({
      next: (res) => {
        const list = res?.data || [];
        this.completedGrades.set(list);
        this.processDueQuizzes();
      },
      error: () => {
        this.completedGrades.set([]);
      }
    });
  }

  loadActiveGrades(): void {
    this.http.get<{ success: boolean; data: { activeGrades: string[] } }>('/api/v1/public/active-grades').subscribe({
      next: (res) => {
        if (res?.data?.activeGrades && Array.isArray(res.data.activeGrades)) {
          this.activeGrades.set(res.data.activeGrades);
        }
      }
    });
  }

  fetchRealStudentData(): void {
    this.isLoadingUnits.set(true);
    const curr = this.currentUserCurriculum();
    const grade = this.currentUserGrade();
    const term = this.selectedTerm();

    this.http.get<{ success: boolean; data: any[] }>(
      `/api/v1/units?curriculum=${curr}&gradeLevel=${grade}&term=${term}`
    ).subscribe({
      next: (res) => {
        this.isLoadingUnits.set(false);
        const apiUnits = res?.data || [];
        if (apiUnits.length === 0) {
          this.units.set([]);
          this.lectures.set([]);
          return;
        }

        const mappedUnits: EnrolledUnitSummary[] = apiUnits.map((u: any) => ({
          _id: u._id,
          titleAr: u.title_ar,
          titleEn: u.title_en || '',
          descriptionAr: u.description_ar || '',
          descriptionEn: u.description_en || '',
          type: u.package_type || 'STUDY_UNIT',
          curriculum: u.curriculum,
          gradeLevel: u.grade_level,
          term: u.academic_term || 'TERM_1',
          totalLectures: u.lectures_count || 0,
          completedLectures: 0,
          completionPercentage: 0,
          totalQuizzes: u.quizzes_count || 0,
          completedQuizzes: 0,
          isActive: true
        }));
        this.units.set(mappedUnits);

        // Hydrate lectures across all units
        const allLectures: StudentLectureItem[] = [];

        mappedUnits.forEach((u) => {
          this.http.get<{ success: boolean; data: any }>(`/api/v1/units/${u._id}/curriculum-contents`).subscribe({
            next: (cRes) => {
              if (cRes?.data) {
                const rawLectures: any[] = cRes.data.lectures || [];

                const unitLectures = rawLectures.map((lec: any, idx: number) => {
                  const durMinutes = lec.video_duration_sec
                    ? Math.max(1, Math.round(lec.video_duration_sec / 60))
                    : 5;

                  const item = {
                    id: lec._id,
                    order: lec.order_index ?? idx + 1,
                    unitId: u._id,
                    unitTitleAr: u.titleAr,
                    titleAr: lec.lecture_title_ar || lec.title_ar,
                    durationMinutes: durMinutes,
                    isWatched: !!lec.isCompleted,
                    watchProgressPercentage: lec.watchPercentage || 0,
                    xpReward: lec.xp_reward_on_complete || 50,
                    actionUrl: `/student/units/${u._id}`
                  };
                  allLectures.push(item);
                  return item;
                });

                const completedCount = unitLectures.filter(l => l.isWatched).length;
                const totalCount = unitLectures.length;
                const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                this.units.update(prevUnits =>
                  prevUnits.map(unitItem =>
                    unitItem._id === u._id
                      ? {
                          ...unitItem,
                          totalLectures: totalCount,
                          completedLectures: completedCount,
                          completionPercentage: pct,
                          isActive: !!cRes.data.isSubscribed,
                          subscriptionExpiresAt: cRes.data.subscriptionExpiresAt
                            ? new Date(cRes.data.subscriptionExpiresAt).toLocaleDateString('ar-EG')
                            : (cRes.data.isSubscribed ? 'ساري' : 'غير مفعل'),
                          isExpired: cRes.data.isExpired ?? false,
                          lectures: unitLectures
                        }
                      : unitItem
                  )
                );

                this.lectures.set([...allLectures]);
              }
            }
          });
        });
      },
      error: () => {
        this.isLoadingUnits.set(false);
        this.units.set([]);
        this.lectures.set([]);
      }
    });
  }

  fetchRealNotifications(): void {
    this.http.get<{ success: boolean; data: any }>('/api/v1/notifications?limit=10').subscribe({
      next: (res) => {
        const notifs = res?.data?.notifications || res?.data || [];
        if (Array.isArray(notifs) && notifs.length > 0) {
          this.notifications.set(
            notifs.map((n: any) => ({
              id: n._id,
              titleAr: n.title_ar,
              titleEn: n.title_en || n.title_ar,
              messageAr: n.message_ar,
              messageEn: n.message_en || n.message_ar,
              type: n.notification_type || 'SYSTEM_BROADCAST',
              timestamp: new Date(n.createdAt).toLocaleTimeString('ar-EG'),
              isRead: !!n.is_read,
              actionUrl: n.action_url || '/student'
            }))
          );
        } else {
          this.notifications.set([]);
        }
      },
      error: () => this.notifications.set([])
    });
  }

  fetchRealAssessments(): void {
    const curr = this.currentUserCurriculum();
    const grade = this.currentUserGrade();
    const term = this.selectedTerm();

    // Strictly grade-isolated via backend session auth & filters
    this.http.get<{ success: boolean; data: any }>(
      `/api/v1/assessments?curriculum=${curr}&gradeLevel=${grade}&term=${term}&limit=30`
    ).subscribe({
      next: (res) => {
        const rawList: any[] = Array.isArray(res?.data)
          ? res.data
          : (res?.data?.assessments || []);

        this.rawAssessmentsList.set(rawList);
        this.processDueQuizzes();
      },
      error: () => {
        this.rawAssessmentsList.set([]);
        this.dueQuizzes.set([]);
      }
    });
  }

  processDueQuizzes(): void {
    const rawList = this.rawAssessmentsList();
    if (!Array.isArray(rawList) || rawList.length === 0) {
      this.dueQuizzes.set([]);
      return;
    }

    const completed = this.completedGrades();
    const completedMap = new Map<string, StudentCompletedGradeItem>();
    completed.forEach((c) => {
      if (c.assessmentId) completedMap.set(c.assessmentId, c);
      if (c.id) completedMap.set(c.id, c);
    });

    const now = new Date();
    const mapped: StudentDueQuizItem[] = rawList.map((asm: any) => {
      const match = completedMap.get(asm._id);
      let dueDateAr = asm.time_limit_minutes ? `${asm.time_limit_minutes} دقيقة` : 'متاح للحل الآن';
      let isUrgent = false;
      let canStart = true;
      let statusNote: string | undefined = undefined;

      if (match) {
        canStart = false;
        dueDateAr = 'تم التسليم بنجاح';
        statusNote = match.status === 'PENDING_REVIEW'
          ? 'تم التسليم — قيد مراجعة وتصحيح المعلمة'
          : `تم التسليم — الدرجة: ${match.score} / ${match.maxScore}`;
      } else {
        if (asm.available_until) {
          const untilDate = new Date(asm.available_until);
          const diffMs = untilDate.getTime() - now.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);

          if (diffMs < 0) {
            dueDateAr = 'انتهى موعد التسليم';
            canStart = false;
            statusNote = 'انتهى الوقت المحدد لهذا الكويز';
          } else if (diffHours <= 24) {
            isUrgent = true;
            const hoursLeft = Math.max(1, Math.round(diffHours));
            dueDateAr = `ينتهي خلال ${hoursLeft} ساعة`;
          } else {
            dueDateAr = `متاح حتى ${untilDate.toLocaleDateString('ar-EG')}`;
          }
        }

        if (asm.available_from) {
          const fromDate = new Date(asm.available_from);
          if (now < fromDate) {
            dueDateAr = `يبدأ: ${fromDate.toLocaleDateString('ar-EG')} ${fromDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`;
            canStart = false;
            statusNote = 'الكويز مجدول ولم يحن موعد فتحه بعد';
          }
        }
      }

      const typeLabel = (asm.assessment_type === 'COMPREHENSIVE_EXAM' || asm.category === 'FULL_EXAM')
        ? 'امتحان شامل'
        : ((asm.assessment_type === 'HOMEWORK' || asm.category === 'HOMEWORK')
          ? 'واجب منزلي'
          : 'كويز تفاعلي');

      return {
        id: asm._id,
        titleAr: asm.title_ar,
        unitTitleAr: typeLabel,
        questionsCount: asm.questions?.length || 0,
        totalPoints: asm.total_points || 20,
        xpReward: asm.xp_reward || 50,
        dueDateAr,
        isUrgent,
        canStart,
        statusNote,
        assessmentUrl: `/student/assessments/${asm._id}`,
        isCompleted: !!match,
        submissionId: match ? (match.submissionId || match.id) : undefined,
        score: match ? match.score : undefined,
        maxScore: match ? match.maxScore : undefined,
        feedbackUrl: match ? (match.feedbackUrl || `/student/submissions/${match.submissionId || match.id}/feedback`) : undefined
      };
    });

    this.dueQuizzes.set(mapped);
  }

  fetchLeaderboard(): void {
    const user = this.authService.currentUser();
    const curriculum = user?.curriculum || 'EGYPTIAN';
    const gradeLevel = user?.grade_level || 'SEC_3';
    const currentCode = user?.student_ha_code || 'HA4920';

    this.isLoadingLeaderboard.set(true);
    this.http.get<{ success: boolean; data: { leaderboard: any[] } }>(
      '/api/v1/gamification/leaderboard',
      { params: { curriculum, gradeLevel } }
    ).subscribe({
      next: (res) => {
        this.isLoadingLeaderboard.set(false);
        const apiList = res?.data?.leaderboard;
        if (apiList && apiList.length > 0) {
          const mapped: LeaderboardRankEntry[] = apiList.map((st, idx) => ({
            rank: st.rank || idx + 1,
            studentId: st.studentId || st._id,
            studentName: st.fullName,
            haCode: st.studentCode,
            totalXp: st.totalXp,
            isCurrentUser: st.studentCode === currentCode
          }));

          const userInList = mapped.find(m => m.isCurrentUser);
          if (!userInList && user) {
            mapped.push({
              rank: mapped.length + 1,
              studentId: user._id,
              studentName: user.full_name + ' (أنت)',
              haCode: currentCode,
              totalXp: user.total_xp ?? 0,
              isCurrentUser: true
            });
          }

          if (mapped.length >= 3) {
            this.leaderboard.set(mapped);
          }
        }
      },
      error: () => {
        this.isLoadingLeaderboard.set(false);
      }
    });
  }

  setTerm(term: AcademicTermCode): void {
    this.selectedTerm.set(term);
    this.fetchRealStudentData();
    this.fetchRealAssessments();
  }

  setLecturesFilter(filter: 'ALL' | 'WATCHED' | 'UNWATCHED'): void {
    this.lecturesFilter.set(filter);
  }

  toggleNotifications(): void {
    this.isNotificationsOpen.update(v => !v);
  }

  markAllNotificationsAsRead(): void {
    const list = this.notifications().map(n => ({ ...n, isRead: true }));
    this.notifications.set(list);
  }

  // =========================================================================
  // Student Profile Modal Actions
  // =========================================================================
  openProfileModal(): void {
    const user = this.authService.currentUser();
    this.editFullName.set(user?.full_name || '');
    this.editPhone.set(user?.phone || '');
    this.editParentPhone.set(user?.parent_phone || '');
    this.editCountry.set(user?.country || 'EG');
    this.editGovernorate.set(user?.governorate || 'CAIRO');
    this.editAvatarUrl.set(user?.avatar_url || this.presetAvatars[0].url);
    this.profileErrorMessage.set(null);
    this.profileSuccessMessage.set(null);
    this.isProfileModalOpen.set(true);
  }

  closeProfileModal(): void {
    this.isProfileModalOpen.set(false);
    this.profileErrorMessage.set(null);
    this.profileSuccessMessage.set(null);
  }

  selectAvatar(url: string): void {
    this.editAvatarUrl.set(url);
  }

  saveProfile(): void {
    const name = this.editFullName().trim();
    const phone = this.editPhone().trim();
    const parentPhone = this.editParentPhone().trim();
    const country = this.editCountry();

    if (!name || name.length < 3) {
      this.profileErrorMessage.set('يرجى كتابة اسم الطالب ثلاثياً بشكل صحيح');
      return;
    }

    if (phone) {
      const val = validatePhoneNumber(phone, country);
      if (!val.isValid) {
        this.profileErrorMessage.set(`رقم هاتف الطالب: ${val.messageAr}`);
        return;
      }
    }

    if (parentPhone) {
      const val = validatePhoneNumber(parentPhone, country);
      if (!val.isValid) {
        this.profileErrorMessage.set(`رقم هاتف ولي الأمر: ${val.messageAr}`);
        return;
      }
    }

    if (phone && parentPhone && arePhoneNumbersIdentical(phone, parentPhone, country)) {
      this.profileErrorMessage.set(
        'رقم هاتف ولي الأمر لا يمكن أن يكون مطابقاً لرقم هاتف الطالب نهائياً. يرجى إدخال رقم مختلف لولي الأمر.'
      );
      return;
    }

    this.isSavingProfile.set(true);
    this.profileErrorMessage.set(null);
    this.profileSuccessMessage.set(null);

    this.http.patch<{
      success: boolean;
      data: {
        user: any;
      };
    }>('/api/v1/auth/profile', {
      fullName: name,
      phone: phone || undefined,
      parentPhone: parentPhone || undefined,
      country,
      governorate: this.isEditEgypt() ? this.editGovernorate() : null,
      avatarUrl: this.editAvatarUrl() || undefined
    }).subscribe({
      next: (res) => {
        this.isSavingProfile.set(false);
        const updated = res.data?.user;
        if (updated) {
          const patch: Partial<IUserDto> = {
            full_name: updated.fullName || updated.full_name || name,
            phone: updated.phone || phone,
            parent_phone: updated.parentPhone || updated.parent_phone || parentPhone,
            country: updated.country || country,
            governorate: updated.governorate || this.editGovernorate(),
            avatar_url: updated.avatarUrl || updated.avatar_url || this.editAvatarUrl()
          };
          this.authService.updateCurrentUser(patch);
          this.profileSuccessMessage.set('تم حفظ وتحديث بيانات حسابك بنجاح');
          setTimeout(() => {
            if (this.isProfileModalOpen()) {
              this.closeProfileModal();
            }
          }, 1200);
        }
      },
      error: (err) => {
        this.isSavingProfile.set(false);
        this.profileErrorMessage.set(
          err?.error?.error?.message ||
          err?.error?.message ||
          'حدث خطأ أثناء حفظ التعديلات. يرجى التأكد من البيانات والمحاولة مجدداً.'
        );
      }
    });
  }
}
