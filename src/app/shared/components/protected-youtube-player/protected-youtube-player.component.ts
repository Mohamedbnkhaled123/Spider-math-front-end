import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  input,
  output,
  inject,
  ElementRef,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  viewChild,
  effect
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { AppIconComponent } from '../app-icon/app-icon.component';
import { AntiTamperWatermarkComponent } from '../anti-tamper-watermark/anti-tamper-watermark.component';
import { PreventContextCopyDirective } from '../../directives/prevent-context-copy.directive';
import {
  IPlaybackProgress,
  IPlaybackHeartbeatResponse,
  PlaybackRate
} from './protected-youtube-player.models';
import { ITamperEvent } from '../anti-tamper-watermark/anti-tamper-watermark.models';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

@Component({
  selector: 'app-protected-youtube-player',
  standalone: true,
  imports: [
    CommonModule,
    AppIconComponent,
    AntiTamperWatermarkComponent,
    PreventContextCopyDirective
  ],
  templateUrl: './protected-youtube-player.component.html',
  styleUrl: './protected-youtube-player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtectedYoutubePlayerComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);

  // Inputs
  readonly lectureId = input.required<string>();
  readonly encryptedVideoId = input<string>(''); // Session video token or direct ID
  readonly videoDurationSec = input<number>(1800); // 30 minutes default
  readonly resumePositionSec = input<number>(0);
  readonly completionThresholdPct = input<number>(85);
  readonly watermarkText = input<string>('Spider Math | HA1001');

  // Outputs
  readonly progressUpdated = output<IPlaybackProgress>();
  readonly chunkCompleted = output<number>();
  readonly thresholdReached = output<number>();
  readonly tamperAlert = output<string>();

  readonly availableSpeeds: PlaybackRate[] = [1, 1.25, 1.5, 2];

  // View Containers
  readonly playerContainer = viewChild<ElementRef<HTMLElement>>('playerContainer');
  readonly iframeMount = viewChild<ElementRef<HTMLElement>>('iframeMount');

  // Playback Signals
  readonly isPlaying = signal<boolean>(false);
  readonly currentTimeSec = signal<number>(0);
  readonly duration = signal<number>(1800);
  readonly volume = signal<number>(100);
  readonly isMuted = signal<boolean>(false);
  readonly playbackRate = signal<PlaybackRate>(1);
  readonly isFullscreen = signal<boolean>(false);
  readonly showControls = signal<boolean>(true);

  // 85% Gamification Celebration Signals (Animation 4.4)
  readonly isCelebrationVisible = signal<boolean>(false);
  readonly xpAwarded = signal<boolean>(false);

  // 5-second chunk tracking
  private readonly watchedChunks = new Set<number>();
  private ytPlayer: any = null;
  private trackingInterval: ReturnType<typeof setInterval> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private hideControlsTimeout: ReturnType<typeof setTimeout> | null = null;

  // Computed Properties
  readonly watchPercentage = computed<number>(() => {
    const total = this.duration();
    if (total <= 0) return 0;
    const watchedSec = this.watchedChunks.size * 5;
    return Math.min(100, Math.round((watchedSec / total) * 100));
  });

  readonly progressPercentage = computed<number>(() => {
    const dur = this.duration();
    if (dur <= 0) return 0;
    return Math.min(100, (this.currentTimeSec() / dur) * 100);
  });

  readonly formattedCurrentTime = computed<string>(() => {
    return this.formatTime(this.currentTimeSec());
  });

  readonly formattedDuration = computed<string>(() => {
    return this.formatTime(this.duration());
  });

  constructor() {
    effect(() => {
      const token = this.encryptedVideoId();
      if (!isPlatformBrowser(this.platformId) || !this.ytPlayer) return;
      const newVideoId = this.resolveVideoId(token);
      if (newVideoId && this.ytPlayer.cueVideoById) {
        this.ytPlayer.cueVideoById(newVideoId);
      }
    });
  }

  ngOnInit(): void {
    this.duration.set(this.videoDurationSec());
    this.currentTimeSec.set(this.resumePositionSec());

    if (isPlatformBrowser(this.platformId)) {
      this.initYouTubeIframe();
      this.startHeartbeatCycle();
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  // =========================================================================
  // Playback Controls
  // =========================================================================
  togglePlay(): void {
    if (!this.ytPlayer) return;
    if (this.isPlaying()) {
      this.ytPlayer.pauseVideo?.();
    } else {
      this.ytPlayer.playVideo?.();
    }
  }

  seek(event: MouseEvent): void {
    if (!this.ytPlayer) return;
    const bar = event.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSec = Math.round(ratio * this.duration());

    this.ytPlayer.seekTo?.(targetSec, true);
    this.currentTimeSec.set(targetSec);
  }

  setSpeed(speed: PlaybackRate | number): void {
    this.playbackRate.set(speed as PlaybackRate);
    if (this.ytPlayer && this.ytPlayer.setPlaybackRate) {
      this.ytPlayer.setPlaybackRate(speed);
    }
  }

  toggleMute(): void {
    if (!this.ytPlayer) return;
    if (this.isMuted()) {
      this.ytPlayer.unMute?.();
      this.isMuted.set(false);
    } else {
      this.ytPlayer.mute?.();
      this.isMuted.set(true);
    }
  }

  onVolumeChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.volume.set(val);
    if (this.ytPlayer && this.ytPlayer.setVolume) {
      this.ytPlayer.setVolume(val);
      if (val === 0) {
        this.isMuted.set(true);
      } else if (this.isMuted()) {
        this.isMuted.set(false);
      }
    }
  }

  toggleFullscreen(): void {
    const container = this.playerContainer()?.nativeElement;
    if (!container || !isPlatformBrowser(this.platformId)) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().then(() => {
        this.isFullscreen.set(true);
      });
    } else {
      document.exitFullscreen?.().then(() => {
        this.isFullscreen.set(false);
      });
    }
  }

  onMouseMove(): void {
    this.showControls.set(true);
    if (this.hideControlsTimeout) {
      clearTimeout(this.hideControlsTimeout);
    }
    if (this.isPlaying()) {
      this.hideControlsTimeout = setTimeout(() => {
        this.showControls.set(false);
      }, 3500);
    }
  }

  onTamperDetected(event: ITamperEvent): void {
    // Defense in depth: Immediately pause video playback and signal security violation
    if (this.ytPlayer) {
      this.ytPlayer.pauseVideo?.();
      this.isPlaying.set(false);
    }
    this.tamperAlert.emit(event.reason);
  }

  // =========================================================================
  // YouTube IFrame API Initialization
  // =========================================================================
  private initYouTubeIframe(): void {
    const mountEl = this.iframeMount()?.nativeElement;
    if (!mountEl) return;

    const onReady = () => {
      this.mountPlayer(mountEl);
    };

    if (window.YT && window.YT.Player) {
      onReady();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        onReady();
      };
    }
  }

  private mountPlayer(mountEl: HTMLElement): void {
    const videoId = this.resolveVideoId(this.encryptedVideoId());
    if (!videoId) {
      // Do not mount any dummy videos. The constructor effect will mount once the real videoId arrives.
      return;
    }

    this.ytPlayer = new window.YT.Player(mountEl, {
      videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
        playsinline: 1,
        enablejsapi: 1,
        origin: window.location.origin
      },
      events: {
        onReady: (e: any) => {
          const currentVideo = this.resolveVideoId(this.encryptedVideoId());
          if (currentVideo && currentVideo !== videoId) {
            e.target.cueVideoById(currentVideo);
          }
          if (this.resumePositionSec() > 0) {
            e.target.seekTo(this.resumePositionSec(), true);
          }
          const dur = e.target.getDuration();
          if (dur > 0) {
            this.duration.set(Math.round(dur));
          }
        },
        onStateChange: (e: any) => {
          // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
          if (e.data === 1) {
            this.isPlaying.set(true);
            this.startTracking();
          } else {
            this.isPlaying.set(false);
            this.stopTracking();
          }
        }
      }
    });
  }

  private resolveVideoId(token: string): string {
    if (!token) return '';
    const clean = token.trim();
    if (clean.length === 11 && !clean.includes('/') && !clean.includes('?') && !clean.includes('.') && !clean.includes(':')) {
      return clean;
    }
    const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      return match[1];
    }
    return '';
  }

  // =========================================================================
  // 5-Second Chunk Tracking & 85% XP Celebration (Animation 4.4)
  // =========================================================================
  private startTracking(): void {
    this.stopTracking();
    this.trackingInterval = setInterval(() => {
      if (!this.ytPlayer || !this.isPlaying()) return;

      const currentSec = Math.round(this.ytPlayer.getCurrentTime?.() || 0);
      this.currentTimeSec.set(currentSec);

      // Record 5-second chunk index
      const chunkIdx = Math.floor(currentSec / 5);
      if (!this.watchedChunks.has(chunkIdx)) {
        this.watchedChunks.add(chunkIdx);
        this.chunkCompleted.emit(chunkIdx);
      }

      const pct = this.watchPercentage();
      this.progressUpdated.emit({
        currentPositionSec: currentSec,
        videoDurationSec: this.duration(),
        watchPercentage: pct,
        watchedChunksCount: this.watchedChunks.size,
        isCompleted: pct >= this.completionThresholdPct()
      });

      // Animation 4.4: 85% Completion Celebration Trigger
      if (pct >= this.completionThresholdPct() && !this.xpAwarded()) {
        this.triggerXpCelebration();
      }
    }, 1000);
  }

  private stopTracking(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  private startHeartbeatCycle(): void {
    // Dispatch genuine watch progress heartbeat to backend every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      if (!this.isPlaying()) return;

      const currentPlaybackSec = this.currentTimeSec();
      const chunkIndex = Math.floor(currentPlaybackSec / 5);

      this.http.post<{ success: boolean; data: IPlaybackHeartbeatResponse }>(
        `/api/v1/lectures/${this.lectureId()}/watch-heartbeat`,
        { currentPlaybackSec, chunkIndex }
      ).subscribe({
        next: res => {
          if (res.data?.xpAwarded && !this.xpAwarded()) {
            this.triggerXpCelebration();
          }
        },
        error: () => {
          // Gracefully continue offline tracking
        }
      });
    }, 30000);
  }

  private triggerXpCelebration(): void {
    this.xpAwarded.set(true);
    this.isCelebrationVisible.set(true);
    this.thresholdReached.emit(50); // 50 XP awarded

    // Dismiss floating pop badge after 5 seconds
    setTimeout(() => {
      this.isCelebrationVisible.set(false);
    }, 5000);
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private cleanup(): void {
    this.stopTracking();
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.hideControlsTimeout) {
      clearTimeout(this.hideControlsTimeout);
    }
    if (this.ytPlayer && this.ytPlayer.destroy) {
      this.ytPlayer.destroy();
      this.ytPlayer = null;
    }
  }
}
