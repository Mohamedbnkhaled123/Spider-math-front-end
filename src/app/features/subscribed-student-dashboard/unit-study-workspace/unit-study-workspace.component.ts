import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { ProtectedYoutubePlayerComponent } from '../../../shared/components/protected-youtube-player/protected-youtube-player.component';
import { ProtectedPdfCanvasComponent } from '../../../shared/components/protected-pdf-canvas/protected-pdf-canvas.component';
import { AuthService } from '../../../core/auth/auth.service';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { LessonLectureItem, UnitWorkspaceData } from './unit-study-workspace.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 13: Unit Study Workspace Component
 * 
 * Mounts:
 * - ProtectedYoutubePlayerComponent with anti-tamper watermark & 85% XP celebration
 * - ProtectedPdfCanvasComponent with Google Drive stream & conditional print blocking
 * - Interactive Lecture Selector Playlist & Quiz Launchers
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
export class UnitStudyWorkspaceComponent {
  private readonly route = inject(ActivatedRoute);
  readonly authService = inject(AuthService);
  readonly langService = inject(LangService);

  // Active view tab: video lecture or PDF handout
  readonly activeTab = signal<'video' | 'pdf'>('video');

  // Workspace Data
  readonly workspaceData = signal<UnitWorkspaceData>({
    unitId: 'unit_calc_diff',
    titleAr: 'الوحدة الأولى: التفاضل والاشتقاق وتطبيقاته الهندسية',
    titleEn: 'Unit 1: Differential Calculus & Geometric Applications',
    curriculum: 'EGYPTIAN',
    gradeLevel: 'SEC_3',
    term: 'TERM_1',
    lectures: [
      {
        _id: 'lec_diff_1',
        order: 1,
        titleAr: 'المحاضرة 1: اشتقاق الدوال المثلثية وتطبيقات السلسلة',
        titleEn: 'Lecture 1: Trigonometric Derivatives & Chain Rule',
        durationMinutes: 45,
        encryptedVideoId: 'U2FsdGVkX19mock_encrypted_yt_id_1',
        googleDrivePdfFileId: '1mock_gdrive_file_id_calc_diff_1',
        isPrintAllowed: true,
        watchPercentage: 100,
        isCompleted: true,
        hasAssessment: true,
        assessmentId: 'asm_diff_1'
      },
      {
        _id: 'lec_diff_2',
        order: 2,
        titleAr: 'المحاضرة 2: الاشتقاق الضمني والبارامتري والمشتقات العليا',
        titleEn: 'Lecture 2: Implicit & Parametric Differentiation',
        durationMinutes: 52,
        encryptedVideoId: 'U2FsdGVkX19mock_encrypted_yt_id_2',
        googleDrivePdfFileId: '1mock_gdrive_file_id_calc_diff_2',
        isPrintAllowed: false, // Strictly print-suppressed
        watchPercentage: 86,
        isCompleted: true,
        hasAssessment: true,
        assessmentId: 'asm_diff_2'
      },
      {
        _id: 'lec_diff_3',
        order: 3,
        titleAr: 'المحاضرة 3: معادلتا المماس والعمودي وتطبيقات هندسية متقدمة',
        titleEn: 'Lecture 3: Tangent & Normal Lines with Advanced Geometry',
        durationMinutes: 60,
        encryptedVideoId: 'U2FsdGVkX19mock_encrypted_yt_id_3',
        googleDrivePdfFileId: '1mock_gdrive_file_id_calc_diff_3',
        isPrintAllowed: true,
        watchPercentage: 20,
        isCompleted: false,
        hasAssessment: true,
        assessmentId: 'asm_diff_3'
      }
    ]
  });

  // Selected lecture ID signal
  readonly selectedLectureId = signal<string>('lec_diff_2');

  // Currently active lecture
  readonly activeLecture = computed(() => {
    const list = this.workspaceData().lectures;
    const currentId = this.selectedLectureId();
    return list.find(l => l._id === currentId) ?? list[0];
  });

  selectLecture(lectureId: string): void {
    this.selectedLectureId.set(lectureId);
  }

  setTab(tab: 'video' | 'pdf'): void {
    this.activeTab.set(tab);
  }

  onChunkWatched(chunkIndex: number): void {
    // Progress emitted from ProtectedYoutubePlayerComponent
  }
}
