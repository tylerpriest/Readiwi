/**
 * Audio Types - Readiwi v4.0
 * Type definitions for the audio system
 */

export interface AudioSettings {
  enabled: boolean;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
}

export interface AudioState {
  isPlaying: boolean;
  isPaused: boolean;
  currentPosition: number;
  duration: number;
  currentText: string;
}

export interface AudioControlsConfig {
  showPlayButton: boolean;
  showPauseButton: boolean;
  showStopButton: boolean;
  showProgress: boolean;
  showVolumeControl: boolean;
  showSpeedControl: boolean;
}

export interface AudioPreferences {
  autoPlay: boolean;
  pauseOnScroll: boolean;
  highlightCurrentSentence: boolean;
  resumeOnReturn: boolean;
}

export type AudioEventType = 
  | 'play'
  | 'pause' 
  | 'stop'
  | 'end'
  | 'error'
  | 'progress';

export interface AudioEvent {
  type: AudioEventType;
  timestamp: number;
  position?: number;
  error?: string;
}

export type AudioEventCallback = (event: AudioEvent) => void;