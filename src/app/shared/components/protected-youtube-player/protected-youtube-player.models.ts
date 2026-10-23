export interface IPlaybackProgress {
  currentPositionSec: number;
  videoDurationSec: number;
  watchPercentage: number;
  watchedChunksCount: number;
  isCompleted: boolean;
}

export interface IPlaybackHeartbeatPayload {
  currentPlaybackSec: number;
  chunkIndex: number;
}

export interface IPlaybackHeartbeatResponse {
  watchPercentage: number;
  isCompleted: boolean;
  xpAwarded: boolean;
  totalXp?: number;
}

export type PlaybackRate = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;
export type VideoQuality = 'auto' | 'hd1080' | 'hd720' | 'large' | 'medium';
