import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { ProtectedYoutubePlayerComponent } from '../../../shared/components/protected-youtube-player/protected-youtube-player.component';
import { ProtectedPdfCanvasComponent } from '../../../shared/components/protected-pdf-canvas/protected-pdf-canvas.component';
import { AuthService } from '../../../core/auth/auth.service';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { LessonLectureItem, UnitWorkspaceData, UnitAssessmentItem } from './unit-study-workspace.models';

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
export class UnitStudyWorkspaceComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  readonly authService = inject(AuthService);
  readonly langService = inject(LangService);

  // Active view tab: video lecture or PDF handout
  readonly activeTab = signal<'video' | 'pdf'>('video');
  readonly isLoading = signal<boolean>(true);
  readonly playbackToken = signal<string>('');

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

  ngOnInit(): void {
    const unitId = this.route.snapshot.paramMap.get('id');
    if (unitId) {
      this.loadUnitCurriculum(unitId);
    }
  }

  loadUnitCurriculum(unitId: string): void {
    this.isLoading.set(true);
    this.http.get<{ success: boolean; data: any }>(`/api/v1/units/${unitId}/curriculum-contents`).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const unit = res?.data?.unit;
        const rawLectures = res?.data?.lectures || [];
        const rawAssessments = res?.data?.assessments || [];

        const mappedLectures: LessonLectureItem[] = rawLectures.map((l: any, idx: number) => ({
          _id: l._id,
          order: l.order_index ?? idx + 1,
          titleAr: l.lecture_title_ar || l.title_ar,
          titleEn: l.lecture_title_en || l.title_en || '',
          durationMinutes: Math.round((l.video_duration_sec || 2700) / 60),
          encryptedVideoId: l.youtube_encrypted_id || '',
          googleDrivePdfFileId: l.google_drive_pdf_id,
          isPrintAllowed: !!l.is_print_allowed,
          watchPercentage: l.watchPercentage || 0,
          isCompleted: !!l.isCompleted,
          hasAssessment: !!l.linked_assessment_id,
          assessmentId: l.linked_assessment_id
        }));

        const mappedAssessments: UnitAssessmentItem[] = rawAssessments.map((a: any) => ({
          _id: a._id,
          titleAr: a.title_ar,
          titleEn: a.title_en || '',
          assessmentType: a.assessment_type || 'QUIZ',
          totalPoints: a.total_points || 0,
          timeLimitMinutes: a.time_limit_minutes || 30,
          maxAttempts: a.max_attempts || 1,
          availableFrom: a.available_from,
          availableUntil: a.available_until,
          studentAttemptStatus: a.studentAttemptStatus
        }));

        this.workspaceData.set({
          unitId: unit?._id || unitId,
          titleAr: unit?.title_ar || '',
          titleEn: unit?.title_en || '',
          curriculum: unit?.curriculum || 'EGYPTIAN',
          gradeLevel: unit?.grade_level || 'SEC_3',
          term: unit?.academic_term || 'TERM_1',
          lectures: mappedLectures,
          assessments: mappedAssessments
        });

        if (mappedLectures.length > 0) {
          const firstId = mappedLectures[0]._id;
          this.selectedLectureId.set(firstId);
          this.fetchPlaybackToken(firstId);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  selectLecture(lectureId: string): void {
    this.selectedLectureId.set(lectureId);
    this.fetchPlaybackToken(lectureId);
  }

  fetchPlaybackToken(lectureId: string): void {
    this.http.get<{ success: boolean; data: any }>(`/api/v1/lectures/${lectureId}/secure-playback`).subscribe({
      next: (res) => {
        if (res?.data?.videoId) {
          this.playbackToken.set(res.data.videoId);
        } else if (res?.data?.sessionVideoToken) {
          this.playbackToken.set(res.data.sessionVideoToken);
        }
      },
      error: () => {
        this.playbackToken.set('');
      }
    });
  }

  setTab(tab: 'video' | 'pdf'): void {
    this.activeTab.set(tab);
  }

  onChunkWatched(chunkIndex: number): void {
    // Progress emitted from ProtectedYoutubePlayerComponent
  }

  getAssessmentForLecture(assessmentId?: string): UnitAssessmentItem | undefined {
    if (!assessmentId) return undefined;
    return this.workspaceData().assessments.find(a => a._id === assessmentId);
  }
}
