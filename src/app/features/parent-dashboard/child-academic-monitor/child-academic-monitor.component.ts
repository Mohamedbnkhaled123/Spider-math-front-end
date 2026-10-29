import { Component, ChangeDetectionStrategy, input, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { ChildAcademicReport } from './child-academic-monitor.models';

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
  readonly langService = inject(LangService);

  readonly isLoading = signal<boolean>(false);
  readonly report = signal<ChildAcademicReport | null>(null);

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
    this.isLoading.set(true);

    this.http.get<{ success?: boolean; data?: any } | any>(`/api/v1/parent/child/${studentId}/full-report`).subscribe({
      next: (res) => {
        const data = res?.data || res;
        if (!data) {
          this.report.set(null);
          this.isLoading.set(false);
          return;
        }

        const rawSubmissions = data.submissions || data.gradedAssessments || [];
        const mappedSubmissions = rawSubmissions.map((s: any) => ({
          submissionId: s.submissionId || s._id,
          assessmentTitleAr: s.titleAr || s.assessmentTitleAr || 'تقييم دراسي',
          assessmentTitleEn: s.titleEn || s.assessmentTitleEn || 'Assessment',
          unitTitleAr: s.unitTitleAr || 'الوحدة الدراسية',
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
        }));

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
        this.isLoading.set(false);
      },
      error: () => {
        this.report.set(null);
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

  openYoutubeSolution(url?: string | null): void {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
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
