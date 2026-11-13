import { Component, ChangeDetectionStrategy, input, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { SwrCacheService } from '../../../core/services/swr-cache.service';
import { ChildAcademicReport, AssessmentCategoryType, ChildSubmissionSummary } from './child-academic-monitor.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 13: Child Academic Monitor Component
 * Real-Time Presence Sonar Radar, Lecture Watch %, Subscription Expiry & Mistake Review
 */
@Component({
  selector: 'app-child-academic-monitor',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  templateUrl: './child-academic-monitor.component.html',
  styleUrl: './child-academic-monitor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildAcademicMonitorComponent {
  readonly childId = input.required<string>();

  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly swrCache = inject(SwrCacheService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly langService = inject(LangService);

  readonly isLoading = signal<boolean>(false);
  readonly report = signal<ChildAcademicReport | null>(null);

  // Submissions Categories & Unit Filtering
  readonly selectedCategoryFilter = signal<AssessmentCategoryType>('ALL');
  readonly selectedUnitFilter = signal<string>('ALL');
  readonly isGroupedByUnit = signal<boolean>(false);

  // Interactive submission details collapse & dedicated review modal
  readonly expandedSubmissionIds = signal<Set<string>>(new Set<string>());
  readonly selectedReviewSubmission = signal<ChildSubmissionSummary | null>(null);

  toggleSubmissionDetails(submissionId: string): void {
    this.expandedSubmissionIds.update(set => {
      const next = new Set(set);
      if (next.has(submissionId)) {
        next.delete(submissionId);
      } else {
        next.add(submissionId);
      }
      return next;
    });
  }

  isSubmissionExpanded(submissionId: string): boolean {
    return this.expandedSubmissionIds().has(submissionId);
  }

  openSubmissionReviewModal(sub: ChildSubmissionSummary): void {
    this.selectedReviewSubmission.set(sub);
  }

  closeSubmissionReviewModal(): void {
    this.selectedReviewSubmission.set(null);
  }

  setCategoryFilter(category: AssessmentCategoryType): void {
    this.selectedCategoryFilter.set(category);
  }

  setUnitFilter(unit: string): void {
    this.selectedUnitFilter.set(unit);
  }

  toggleGroupByUnit(): void {
    this.isGroupedByUnit.update(v => !v);
  }

  readonly availableUnits = computed<string[]>(() => {
    const rep = this.report();
    if (!rep) return [];
    const unitsSet = new Set<string>();
    for (const sub of rep.submissions) {
      if (sub.unitTitleAr) {
        unitsSet.add(sub.unitTitleAr);
      }
    }
    for (const u of rep.units) {
      if (u.unitTitleAr) {
        unitsSet.add(u.unitTitleAr);
      }
    }
    return Array.from(unitsSet);
  });

  readonly filteredSubmissions = computed<ChildSubmissionSummary[]>(() => {
    const rep = this.report();
    if (!rep) return [];
    const cat = this.selectedCategoryFilter();
    const unit = this.selectedUnitFilter();

    return rep.submissions.filter(s => {
      const matchCat = cat === 'ALL' || s.category === cat;
      const matchUnit = unit === 'ALL' || s.unitTitleAr === unit;
      return matchCat && matchUnit;
    });
  });

  readonly groupedSubmissionsByUnit = computed<{ unitTitle: string; submissions: ChildSubmissionSummary[] }[]>(() => {
    const subs = this.filteredSubmissions();
    const groupMap = new Map<string, ChildSubmissionSummary[]>();

    for (const s of subs) {
      const unitKey = s.unitTitleAr || 'الوحدة الدراسية';
      if (!groupMap.has(unitKey)) {
        groupMap.set(unitKey, []);
      }
      groupMap.get(unitKey)!.push(s);
    }

    return Array.from(groupMap.entries()).map(([unitTitle, submissions]) => ({
      unitTitle,
      submissions
    }));
  });

  readonly submissionsStats = computed(() => {
    const rep = this.report();
    if (!rep || rep.submissions.length === 0) {
      return {
        totalCount: 0,
        quizzesCount: 0,
        quizzesAvg: 0,
        homeworkCount: 0,
        homeworkAvg: 0,
        examsCount: 0,
        examsAvg: 0
      };
    }

    const subs = rep.submissions;
    const quizzes = subs.filter(s => s.category === 'QUIZ');
    const homework = subs.filter(s => s.category === 'HOMEWORK');
    const exams = subs.filter(s => s.category === 'EXAM');

    const calcAvg = (items: ChildSubmissionSummary[]) => {
      const completed = items.filter(i => !i.isPendingReview && !i.isInProgress);
      if (completed.length === 0) return 0;
      const sum = completed.reduce((acc, curr) => acc + curr.scorePercentage, 0);
      return Math.round(sum / completed.length);
    };

    return {
      totalCount: subs.length,
      quizzesCount: quizzes.length,
      quizzesAvg: calcAvg(quizzes),
      homeworkCount: homework.length,
      homeworkAvg: calcAvg(homework),
      examsCount: exams.length,
      examsAvg: calcAvg(exams)
    };
  });

  constructor() {
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      const id = this.childId();
      if (id) {
        this.fetchAcademicReport(id);
      }
    });
  }

  fetchAcademicReport(studentId: string): void {
    const cacheKey = `child_report_${studentId}`;
    const cached = this.swrCache.get<ChildAcademicReport>(cacheKey);
    if (cached) {
      this.report.set(cached);
      this.isLoading.set(false);
    } else {
      this.isLoading.set(true);
    }

    this.http.get<{ success?: boolean; data?: any } | any>(`/api/v1/parent/child/${studentId}/full-report`).subscribe({
      next: (res) => {
        const data = res?.data || res;
        if (!data) {
          if (!this.swrCache.has(cacheKey)) {
            this.report.set(null);
          }
          this.isLoading.set(false);
          return;
        }

        const rawSubmissions = data.submissions || data.gradedAssessments || [];
        const mappedSubmissions: ChildSubmissionSummary[] = rawSubmissions.map((s: any) => {
          let category: 'QUIZ' | 'HOMEWORK' | 'EXAM' = 'QUIZ';
          const typeStr = (s.assessmentType || s.type || '').toUpperCase();
          const titleAr = (s.titleAr || s.assessmentTitleAr || '').toLowerCase();
          const titleEn = (s.titleEn || s.assessmentTitleEn || '').toLowerCase();

          if (
            typeStr === 'HOMEWORK' ||
            typeStr === 'ASSIGNMENT' ||
            s.isHomework ||
            titleAr.includes('واجب') ||
            titleAr.includes('تطبيق') ||
            titleEn.includes('homework') ||
            titleEn.includes('assignment')
          ) {
            category = 'HOMEWORK';
          } else if (
            typeStr === 'EXAM' ||
            typeStr === 'COMPREHENSIVE' ||
            typeStr === 'FINAL' ||
            titleAr.includes('شامل') ||
            titleAr.includes('نهائي') ||
            titleAr.includes('امتحان') ||
            titleEn.includes('exam') ||
            titleEn.includes('comprehensive') ||
            titleEn.includes('final')
          ) {
            category = 'EXAM';
          } else {
            category = 'QUIZ';
          }

          return {
            submissionId: s.submissionId || s._id,
            assessmentTitleAr: s.titleAr || s.assessmentTitleAr || 'تقييم دراسي',
            assessmentTitleEn: s.titleEn || s.assessmentTitleEn || 'Assessment',
            unitTitleAr: s.unitTitleAr || 'الوحدة الدراسية',
            unitTitleEn: s.unitTitleEn,
            unitId: s.unitPackageId || s.unitId,
            category,
            scorePercentage: s.percentage ?? s.scorePercentage ?? 0,
            finalTotalScore: s.finalTotalScore ?? s.final_total_score ?? 0,
            maxScore: s.totalPoints ?? s.maxScore ?? 10,
            gradedAt: s.gradedAt || s.submittedAt || '',
            status: s.status || (s.result_visibility === 'HIDDEN_PENDING_TEACHER' ? 'PENDING_REVIEW' : 'PUBLISHED'),
            isPendingReview: s.isPendingReview ?? (s.result_visibility === 'HIDDEN_PENDING_TEACHER'),
            isInProgress: s.isInProgress ?? (s.sync_queue_status === 'IN_PROGRESS'),
            teacherNote: s.teacherFeedbackNotes || s.teacherNote,
            mistakeCases: (s.customMistakeCases || s.mistakeCases || []).map((m: any, idx: number) => ({
              questionOrder: m.questionOrder ?? idx + 1,
              errorNote: m.errorNote || m.error_note || '',
              youtubeSolutionUrl: m.youtubeSolutionUrl || m.youtube_solution_url
            }))
          };
        });

        const rawUnits = data.activeSubscriptions || data.units || [];
        const mappedUnits = rawUnits.map((u: any) => ({
          unitId: u.unitPackageId || u.unitId || '',
          unitTitleAr: u.unitTitleAr || 'الوحدة الدراسية',
          unitTitleEn: u.unitTitleEn || '',
          watchPercentage: u.watchPercentage ?? 0,
          completedLectures: u.completedLectures ?? 0,
          totalLectures: u.totalLectures ?? 0,
          subscriptionExpiresAt: u.expiresAt ? new Date(u.expiresAt).toLocaleDateString('ar-EG') : (u.subscriptionExpiresAt || 'ساري'),
          isExpired: u.isExpired ?? (u.daysRemaining !== undefined ? u.daysRemaining <= 0 : false),
          lectures: Array.isArray(u.lectures) ? u.lectures.map((lec: any) => ({
            lectureId: lec.lectureId || lec._id,
            order: lec.order || 1,
            titleAr: lec.titleAr || lec.lecture_title_ar || 'محاضرة',
            titleEn: lec.titleEn || lec.lecture_title_en || '',
            durationMinutes: lec.video_duration_sec ? Math.max(1, Math.round(lec.video_duration_sec / 60)) : (lec.durationMinutes || 5),
            videoDurationSec: lec.video_duration_sec || (lec.durationMinutes ? lec.durationMinutes * 60 : 105),
            isCompleted: !!lec.isCompleted,
            watchPercentage: lec.watchPercentage ?? 0
          })) : []
        }));

        const mappedReport: ChildAcademicReport = {
          studentId: data.student?.studentId || studentId,
          studentName: data.student?.fullName || data.studentName || 'الطالب',
          haCode: data.student?.studentCode || data.haCode || '',
          presence: {
            isOnline: !!data.presence?.isOnline,
            activityTextAr: data.presence?.activityTextAr || (data.presence?.isOnline ? 'نشاط حي مباشر الآن' : 'غير متصل حالياً'),
            activityTextEn: data.presence?.activityTextEn || (data.presence?.isOnline ? 'Online' : 'Offline'),
            lastActiveTextAr: data.presence?.lastActiveTextAr || 'اليوم',
            lastActiveTextEn: data.presence?.lastActiveTextEn || 'Today'
          },
          overallWatchPercentage: data.attendanceMetrics?.overallWatchPercentage ?? data.overallWatchPercentage ?? 0,
          totalXp: data.student?.totalXp ?? data.totalXp ?? 0,
          units: mappedUnits,
          submissions: mappedSubmissions
        };

        this.report.set(mappedReport);
        this.swrCache.set(cacheKey, mappedReport);
        this.isLoading.set(false);
      },
      error: () => {
        if (!this.swrCache.has(cacheKey)) {
          this.report.set(null);
        }
        this.isLoading.set(false);
      }
    });
  }

  readonly expandedUnitId = signal<string | null>(null);

  toggleUnitLectures(unitId: string): void {
    if (this.expandedUnitId() === unitId) {
      this.expandedUnitId.set(null);
    } else {
      this.expandedUnitId.set(unitId);
    }
  }

  readonly activeInPlatformSolution = signal<{
    rawUrl: string;
    embedUrl?: SafeResourceUrl | null;
    type: 'VIDEO' | 'POST';
    title: string;
  } | null>(null);

  openYoutubeSolution(url?: string | null): void {
    if (!url) return;
    const trimmed = url.trim();
    const videoId = this.extractYoutubeId(trimmed);

    if (videoId) {
      const embed = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
      );
      this.activeInPlatformSolution.set({
        rawUrl: trimmed,
        embedUrl: embed,
        type: 'VIDEO',
        title: this.langService.isArabic() ? 'فيديو الحل وشرح الخطأ' : 'Video Solution & Error Analysis'
      });
    } else {
      const safePostUrl = this.sanitizer.bypassSecurityTrustResourceUrl(trimmed);
      this.activeInPlatformSolution.set({
        rawUrl: trimmed,
        embedUrl: safePostUrl,
        type: 'POST',
        title: this.langService.isArabic() ? 'منشور الحل النموذجي' : 'Community Post Solution'
      });
    }
  }

  closeInPlatformSolution(): void {
    this.activeInPlatformSolution.set(null);
  }

  private extractYoutubeId(url: string): string | null {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    return match ? match[1] : null;
  }

  isYoutubePost(url?: string | null): boolean {
    if (!url) return false;
    return !this.extractYoutubeId(url) && (url.includes('/post/') || url.includes('/community'));
  }

  formatDuration(seconds?: number): string {
    const totalSec = Math.max(0, Math.round(seconds || 0));
    if (totalSec <= 0) return '00:00';
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins === 0) return `${secs} ثانية`;
    if (secs === 0) return `${mins} دقيقة`;
    return `${mins} د و ${secs} ث`;
  }
}
