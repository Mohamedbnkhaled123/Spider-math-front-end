import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { AuthService } from '../../../core/auth/auth.service';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { AcademicTermCode } from '../../../core/constants/curriculum-tree.constant';
import {
  EnrolledUnitSummary,
  LeaderboardRankEntry,
  StudentNotificationItem
} from './student-overview.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 13: Subscribed Student Overview Component
 * 
 * - Academic Term Switcher (TERM_1 / TERM_2)
 * - Enrolled units & final revisions grid with watch progress
 * - Animation 4.5: Leaderboard Podiums (Ranks 1, 2, 3 + student rank)
 * - Notification bell with unread indicator
 */
@Component({
  selector: 'app-student-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, AppIconComponent],
  templateUrl: './student-overview.component.html',
  styleUrls: ['./student-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentOverviewComponent {
  readonly authService = inject(AuthService);
  readonly langService = inject(LangService);

  // Term Switcher Signal
  readonly selectedTerm = signal<AcademicTermCode>('TERM_1');
  readonly isNotificationsOpen = signal<boolean>(false);

  // Active units catalog
  readonly units = signal<EnrolledUnitSummary[]>([
    {
      _id: 'unit_calc_diff',
      titleAr: 'الوحدة الأولى: التفاضل والاشتقاق وتطبيقاته الهندسية',
      titleEn: 'Unit 1: Differential Calculus & Geometric Applications',
      descriptionAr: 'قواعد الاشتقاق البارامتري، والمماسات، والمعدلات الزمنية المرتبطة.',
      descriptionEn: 'Parametric differentiation, tangent lines, and related rates.',
      type: 'STUDY_UNIT',
      curriculum: 'EGYPTIAN',
      gradeLevel: 'SEC_3',
      term: 'TERM_1',
      totalLectures: 8,
      completedLectures: 7,
      completionPercentage: 88,
      totalQuizzes: 4,
      completedQuizzes: 4,
      isActive: true
    },
    {
      _id: 'unit_calc_integ',
      titleAr: 'الوحدة الثانية: التكامل وتطبيقات المساحات والحجوم',
      titleEn: 'Unit 2: Integral Calculus & Volume Applications',
      descriptionAr: 'التكامل بالتعويض والتجزيء، ومساحات المناطق المستوية، وحجوم الأجسام الدورانية.',
      descriptionEn: 'Integration by substitution and parts, area, and solids of revolution.',
      type: 'STUDY_UNIT',
      curriculum: 'EGYPTIAN',
      gradeLevel: 'SEC_3',
      term: 'TERM_1',
      totalLectures: 6,
      completedLectures: 3,
      completionPercentage: 50,
      totalQuizzes: 3,
      completedQuizzes: 1,
      isActive: true
    },
    {
      _id: 'unit_final_rev_1',
      titleAr: 'المراجعة النهائية المكثفة: ليلة الامتحان وبنك الأسئلة المتوقعة',
      titleEn: 'Intensive Final Revision: High-Yield Exam Bank & Speed Tactics',
      descriptionAr: 'حل نماذج الامتحانات الرسمية السابقة، واستراتيجيات حل مسائل ديسموس السريعة.',
      descriptionEn: 'Past paper walkthroughs, common trap analysis, and Desmos speed tactics.',
      type: 'FINAL_REVISION',
      curriculum: 'EGYPTIAN',
      gradeLevel: 'SEC_3',
      term: 'TERM_1',
      totalLectures: 4,
      completedLectures: 1,
      completionPercentage: 25,
      totalQuizzes: 2,
      completedQuizzes: 0,
      isActive: true
    },
    {
      _id: 'unit_vectors_term2',
      titleAr: 'الوحدة الثالثة: الهندسة الفراغية والمتجهات في الفضاء ثلاثي الأبعاد',
      titleEn: 'Unit 3: 3D Analytic Geometry & Vector Analysis',
      descriptionAr: 'معادلة الخط المستقيم والمستوى في الفضاء والضرب القياسي والاتجاهي.',
      descriptionEn: 'Lines and planes in 3D space, scalar and cross products.',
      type: 'STUDY_UNIT',
      curriculum: 'EGYPTIAN',
      gradeLevel: 'SEC_3',
      term: 'TERM_2',
      totalLectures: 7,
      completedLectures: 0,
      completionPercentage: 0,
      totalQuizzes: 3,
      completedQuizzes: 0,
      isActive: true
    }
  ]);

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

  // Animation 4.5 Leaderboard Podiums
  readonly leaderboard = signal<LeaderboardRankEntry[]>([
    {
      rank: 1,
      studentId: 'st_1',
      studentName: 'عمر خالد المنشاوي',
      haCode: 'HA1082',
      totalXp: 1850,
      isCurrentUser: false
    },
    {
      rank: 2,
      studentId: 'st_2',
      studentName: 'مريم أحمد عبدالفتاح',
      haCode: 'HA2391',
      totalXp: 1620,
      isCurrentUser: false
    },
    {
      rank: 3,
      studentId: 'st_3',
      studentName: 'ياسين محمود الشناوي',
      haCode: 'HA3144',
      totalXp: 1480,
      isCurrentUser: false
    },
    {
      rank: 7,
      studentId: 'st_me',
      studentName: 'أنت (طالب سبايدر ماث)',
      haCode: 'HA4920',
      totalXp: 1150,
      isCurrentUser: true
    }
  ]);

  readonly topThreePodium = computed(() => this.leaderboard().filter(e => e.rank <= 3));
  readonly currentUserRank = computed(() => this.leaderboard().find(e => e.isCurrentUser));

  // Notifications List
  readonly notifications = signal<StudentNotificationItem[]>([
    {
      id: 'notif_1',
      titleAr: 'تم تصحيح واجب التفاضل من م/ هبة',
      titleEn: 'Calculus Homework Graded by Eng. Heba',
      messageAr: 'تم اعتماد درجة الواجب (18/20) وإضافة ملاحظات توجيهية لحل السؤال الثالث.',
      messageEn: 'Homework score 18/20 published with specific video feedback for question 3.',
      type: 'HOMEWORK_GRADED',
      timestamp: 'منذ ساعتين',
      isRead: false,
      actionUrl: '/student/submissions/sub_calc_1/feedback'
    },
    {
      id: 'notif_2',
      titleAr: 'محاضرة جديدة متاحة الآن!',
      titleEn: 'New Lecture Released!',
      messageAr: 'تم رفع محاضرة "المساحات في المستوى وحاسبة ديسموس" في وحدة التكامل.',
      messageEn: 'Lecture "Areas in Plane with Desmos Calculator" is now unlocked.',
      type: 'NEW_LECTURE',
      timestamp: 'أمس',
      isRead: true,
      actionUrl: '/student/units/unit_calc_integ'
    }
  ]);

  readonly unreadNotificationsCount = computed(
    () => this.notifications().filter(n => !n.isRead).length
  );

  setTerm(term: AcademicTermCode): void {
    this.selectedTerm.set(term);
  }

  toggleNotifications(): void {
    this.isNotificationsOpen.update(v => !v);
  }

  markAllNotificationsAsRead(): void {
    const list = this.notifications().map(n => ({ ...n, isRead: true }));
    this.notifications.set(list);
  }
}
