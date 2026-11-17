import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  signal,
  computed,
  inject,
  viewChild,
  OnInit,
  OnDestroy,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { ProtectedYoutubePlayerComponent } from '../../../shared/components/protected-youtube-player/protected-youtube-player.component';
import { ProtectedPdfCanvasComponent } from '../../../shared/components/protected-pdf-canvas/protected-pdf-canvas.component';
import { AuthService } from '../../../core/auth/auth.service';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { LessonLectureItem, UnitWorkspaceData, UnitAssessmentItem } from './unit-study-workspace.models';
import { IPlaybackProgress } from '../../../shared/components/protected-youtube-player/protected-youtube-player.models';
import { getUnitMathTheme } from '../../../core/utils/unit-math-art.util';
import { SwrCacheService } from '../../../core/services/swr-cache.service';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 13: Unit Study Workspace Component
 * 
 * Mounts:
 * - ProtectedYoutubePlayerComponent with anti-tamper watermark & 85% XP celebration
 * - ProtectedPdfCanvasComponent with Google Drive stream & conditional print blocking
 * - Interactive Lecture Selector Playlist & Quiz Launchers
 * - Connected directly to MongoDB Atlas with Zero Mock Data
 */
@Component({
  selector: 'app-unit-study-workspace',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AppIconComponent,
    ProtectedYoutubePlayerComponent,
    ProtectedPdfCanvasComponent
  ],
  templateUrl: './unit-study-workspace.component.html',
  styleUrls: ['./unit-study-workspace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitStudyWorkspaceComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  readonly authService = inject(AuthService);
  readonly langService = inject(LangService);
  readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly swrCache = inject(SwrCacheService);
  private querySub?: Subscription;
  fallbackLectureId: string | null = null;
  readonly lectureViewport = viewChild<ElementRef<HTMLElement>>('lectureViewport');

  // Active view tab: video lecture or PDF handout
  readonly activeTab = signal<'video' | 'pdf'>('video');
  readonly isLoading = signal<boolean>(true);
  readonly playbackToken = signal<string>('');
  readonly isLectureLocked = signal<boolean>(false);
  readonly returnToHome = computed<boolean>(() => this.route.snapshot.queryParamMap.get('returnToHome') === 'true');

  readonly mathTheme = computed(() => {
    return getUnitMathTheme(this.workspaceData());
  });
  readonly isAssessmentsOnly = computed(() => this.workspaceData().accessScope === 'ASSESSMENTS_ONLY');

  // Workspace Data
  readonly workspaceData = signal<UnitWorkspaceData>({
    unitId: '',
    titleAr: '',
    titleEn: '',
    curriculum: 'EGYPTIAN',
    gradeLevel: 'SEC_3',
    term: 'TERM_1',
    lectures: [],
    assessments: []
  });

  // Selected lecture ID signal
  readonly selectedLectureId = signal<string>('');

  // Currently active lecture
  readonly activeLecture = computed<LessonLectureItem | null>(() => {
    const list = this.workspaceData().lectures;
    const currentId = this.selectedLectureId();
    return list.find(l => l._id === currentId) ?? (list.length > 0 ? list[0] : null);
  });

  sanitizeUnitIdAndExtractFallback(rawId: string | null): { unitId: string; fallbackLectureId: string | null } {
    if (!rawId) {
      return { unitId: '', fallbackLectureId: null };
    }

    let unitId = rawId;
    let fallbackLectureId: string | null = null;

    if (rawId.includes('?') || /%3f/i.test(rawId)) {
      const matchIndex = rawId.includes('?') ? rawId.indexOf('?') : rawId.search(/%3f/i);
      unitId = rawId.substring(0, matchIndex);
      const rest = rawId.substring(matchIndex + (rawId[matchIndex] === '?' ? 1 : 3));

      try {
        const decoded = decodeURIComponent(rest);
        const match = decoded.match(/(?:^|[&?])lectureId=([^&]+)/);
        if (match && match[1]) {
          fallbackLectureId = match[1];
        }
      } catch {
        const match = rest.match(/lectureId(?:=|%3D)([^&%]+)/i);
        if (match && match[1]) {
          fallbackLectureId = match[1];
        }
      }
    }

    return { unitId, fallbackLectureId };
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const rawId = this.route.snapshot.paramMap.get('id');
    const { unitId, fallbackLectureId } = this.sanitizeUnitIdAndExtractFallback(rawId);
    if (fallbackLectureId && !this.route.snapshot.queryParams['lectureId']) {
      this.fallbackLectureId = fallbackLectureId;
    }

    // Subscribe to query parameters to handle navigation to a specific lecture
    this.querySub = this.route.queryParams.subscribe((params) => {
      const targetLecId = params['lectureId'] || this.fallbackLectureId;
      if (targetLecId) {
        const lectures = this.workspaceData().lectures;
        if (lectures && lectures.length > 0) {
          const found = lectures.find((l) => l._id === targetLecId);
          if (found && this.selectedLectureId() !== found._id) {
            this.selectLecture(found._id, true);
          }
        }
      }
    });

    if (unitId) {
      this.loadUnitCurriculum(unitId);
    }
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
  }

  loadUnitCurriculum(unitId: string): void {
    const { unitId: cleanUnitId, fallbackLectureId } = this.sanitizeUnitIdAndExtractFallback(unitId);
    if (fallbackLectureId && !this.route.snapshot.queryParams['lectureId'] && !this.fallbackLectureId) {
      this.fallbackLectureId = fallbackLectureId;
    }
    const targetUnitId = cleanUnitId || unitId;

    const cacheKey = `unit_contents_${targetUnitId}`;
    const cached = this.swrCache.get<UnitWorkspaceData>(cacheKey);
    if (cached) {
      this.workspaceData.set(cached);
      this.isLoading.set(false);
      if (cached.lectures?.length > 0) {
        const queryLecId = this.route.snapshot.queryParams['lectureId'] || this.fallbackLectureId;
        const target = (queryLecId ? cached.lectures.find(l => l._id === queryLecId) : null) || cached.lectures[0];
        this.selectLecture(target._id, !!queryLecId);
      }
    } else {
      this.isLoading.set(true);
    }

    this.http.get<{ success: boolean; data: any }>(`/api/v1/units/${targetUnitId}/curriculum-contents`).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const unit = res?.data?.unit;
        const isSubscribed = !!res?.data?.isSubscribed;
        const accessScope = res?.data?.accessScope as ('FULL' | 'ASSESSMENTS_ONLY' | undefined);
        const rawLectures = res?.data?.lectures || [];
        const rawAssessments = res?.data?.assessments || [];

        const mappedLectures: LessonLectureItem[] = rawLectures.map((l: any, idx: number) => {
          const linkedAsm = rawAssessments.find((a: any) =>
            (a.lecture_id && (a.lecture_id._id || a.lecture_id).toString() === l._id?.toString()) ||
            (a.lectureId && a.lectureId.toString() === l._id?.toString())
          );
          const assessmentId = l.linked_assessment_id || l.assessmentId || (linkedAsm ? (linkedAsm._id || linkedAsm.id) : undefined);
          const hasVideo = !!(l.youtube_video_id || l.youtube_encrypted_id || l.youtube_url || l.encryptedVideoId || l.youtubeUrl);
          const durMinutes = hasVideo ? (l.video_duration_sec ? Math.max(1, Math.round(l.video_duration_sec / 60)) : (l.duration_minutes || 0)) : 0;
          const durSec = hasVideo ? (l.video_duration_sec || (durMinutes ? durMinutes * 60 : 0)) : 0;
          return {
            _id: l._id,
            order: l.order_index ?? idx + 1,
            titleAr: l.lecture_title_ar || l.title_ar,
            titleEn: l.lecture_title_en || l.title_en || '',
            durationMinutes: durMinutes,
            videoDurationSec: durSec,
            encryptedVideoId: hasVideo ? (l.youtube_video_id || l.youtube_encrypted_id || l.encryptedVideoId || '') : '',
            googleDrivePdfFileId: l.google_drive_pdf_id || l.pdf_materials?.[0]?.storage_file_id || l.pdf_materials?.[0]?._id?.toString() || '',
            isPrintAllowed: l.is_print_allowed !== undefined ? !!l.is_print_allowed : !!l.pdf_materials?.[0]?.is_print_allowed,
            watchPercentage: hasVideo ? (l.watchPercentage || 0) : 0,
            isCompleted: !!l.isCompleted,
            hasAssessment: !!assessmentId,
            assessmentId,
            isAccessible: l.isAccessible !== undefined ? !!l.isAccessible : (isSubscribed || !!l.is_free_trial || !!l.is_free || !!l.isFreeTrial || !!l.isFree),
            isFreeTrial: !!(l.is_free_trial || l.is_free || l.isFreeTrial || l.isFree)
          };
        });

        const mappedAssessments: UnitAssessmentItem[] = rawAssessments.map((a: any) => {
          const matchedLec = rawLectures.find((l: any) =>
            (a.lecture_id && (a.lecture_id._id || a.lecture_id).toString() === l._id?.toString()) ||
            (a.lectureId && a.lectureId.toString() === l._id?.toString())
          );
          return {
            _id: a._id,
            lectureId: a.lecture_id ? (a.lecture_id._id || a.lecture_id).toString() : (a.lectureId || null),
            lectureTitle: matchedLec ? (matchedLec.lecture_title_ar || matchedLec.title_ar || matchedLec.title) : (a.lecture_id?.lecture_title_ar || null),
            titleAr: a.title_ar,
            titleEn: a.title_en || '',
            assessmentType: a.assessment_type || 'QUIZ',
            totalPoints: a.total_points || 0,
            timeLimitMinutes: a.time_limit_minutes || 30,
            maxAttempts: a.max_attempts || 1,
            availableFrom: a.available_from,
            availableUntil: a.available_until,
            studentAttemptStatus: a.studentAttemptStatus
          };
        });

        const freshWorkspace: UnitWorkspaceData = {
          unitId: unit?._id || targetUnitId,
          titleAr: unit?.title_ar || '',
          titleEn: unit?.title_en || '',
          curriculum: unit?.curriculum || 'EGYPTIAN',
          gradeLevel: unit?.grade_level || 'SEC_3',
          term: unit?.academic_term || 'TERM_1',
          isSubscribed,
          accessScope,
          lectures: mappedLectures,
          assessments: mappedAssessments
        };
        this.workspaceData.set(freshWorkspace);
        this.swrCache.set(cacheKey, freshWorkspace);

        if (mappedLectures.length > 0) {
          const queryLecId = this.route.snapshot.queryParams['lectureId'] || this.fallbackLectureId;
          const currentId = this.selectedLectureId();
          const target = (queryLecId ? mappedLectures.find(l => l._id === queryLecId) : null)
            || (currentId ? mappedLectures.find(l => l._id === currentId) : null)
            || mappedLectures[0];

          this.selectLecture(target._id, !!queryLecId);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  selectLecture(lectureId: string, scrollIntoView: boolean = false): void {
    this.selectedLectureId.set(lectureId);
    const targetLecture = this.workspaceData().lectures.find(l => l._id === lectureId);
    if (targetLecture && targetLecture.isAccessible === false) {
      this.isLectureLocked.set(true);
      this.playbackToken.set('');
      if (scrollIntoView) {
        this.scrollPlayerIntoView();
      }
      return;
    }
    this.isLectureLocked.set(false);
    if (!targetLecture?.encryptedVideoId && targetLecture?.googleDrivePdfFileId) {
      this.activeTab.set('pdf');
      this.playbackToken.set('');
    } else {
      this.activeTab.set('video');
      if (targetLecture?.encryptedVideoId) {
        this.playbackToken.set(targetLecture.encryptedVideoId);
      }
      this.fetchPlaybackToken(lectureId);
    }
    if (scrollIntoView) {
      this.scrollPlayerIntoView();
    }
  }

  private scrollPlayerIntoView(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const scrollFn = () => {
      const target = this.lectureViewport()?.nativeElement || document.getElementById('lecture-viewport');
      if (target && typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => scrollFn());
    } else {
      setTimeout(scrollFn, 0);
    }
  }

  fetchPlaybackToken(lectureId: string): void {
    this.http.get<{ success: boolean; data: any }>(`/api/v1/lectures/${lectureId}/secure-playback`).subscribe({
      next: (res) => {
        this.isLectureLocked.set(false);
        if (res?.data?.videoId) {
          this.playbackToken.set(res.data.videoId);
        } else if (res?.data?.sessionVideoToken) {
          this.playbackToken.set(res.data.sessionVideoToken);
        }
      },
      error: (err) => {
        this.playbackToken.set('');
        if (err?.status === 403) {
          this.isLectureLocked.set(true);
        }
      }
    });
  }

  setTab(tab: 'video' | 'pdf'): void {
    this.activeTab.set(tab);
  }

  onChunkWatched(chunkIndex: number): void {
    // Progress emitted from ProtectedYoutubePlayerComponent
  }

  onProgressUpdated(progress: IPlaybackProgress): void {
    const activeId = this.selectedLectureId();
    if (!activeId) return;

    this.workspaceData.update(data => {
      const updatedLectures = data.lectures.map(lec => {
        if (lec._id === activeId) {
          return {
            ...lec,
            watchPercentage: progress.watchPercentage,
            isCompleted: progress.isCompleted || lec.isCompleted
          };
        }
        return lec;
      });
      return {
        ...data,
        lectures: updatedLectures
      };
    });
  }

  formatDuration(seconds?: number): string {
    const totalSec = Math.max(0, Math.round(seconds || 0));
    if (totalSec <= 0) return '00:00';
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins === 0) {
      return `${secs} ثانية`;
    }
    if (secs === 0) {
      return `${mins} دقيقة`;
    }
    return `${mins} د و ${secs} ث`;
  }

  getAssessmentForLecture(assessmentId?: string): UnitAssessmentItem | undefined {
    if (!assessmentId) return undefined;
    return this.workspaceData().assessments.find(a => a._id === assessmentId);
  }

  async startAssessment(assessmentId: string, title?: string, returnHome?: boolean): Promise<void> {
    const asm = this.getAssessmentForLecture(assessmentId) || this.workspaceData().assessments.find(a => a._id === assessmentId);
    const displayTitle = title || asm?.titleAr || asm?.titleEn || '';

    const confirmed = await this.confirmDialogService.confirm({
      title: this.langService.isArabic() ? 'بدء الاختبار' : 'Start Exam',
      message: this.langService.isArabic()
        ? `بدء الاختبار${displayTitle ? ` "${displayTitle}"` : ''} الآن؟ يبدأ الوقت فور الدخول.`
        : `Start ${displayTitle ? `"${displayTitle}"` : 'exam'} now? Timer begins immediately.`,
      confirmLabel: this.langService.isArabic() ? 'ابدأ الآن' : 'Start Now',
      cancelLabel: this.langService.isArabic() ? 'إلغاء' : 'Cancel',
      icon: 'play-circle',
      isDestructive: false
    });

    if (confirmed) {
      const qp = returnHome ? { returnToHome: 'true' } : undefined;
      this.router.navigate(['/student/assessments', assessmentId], { queryParams: qp });
    }
  }
}
