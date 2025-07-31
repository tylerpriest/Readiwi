"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/core/utils/cn';
import { Play, Pause, Square, Volume2, VolumeX } from 'lucide-react';
import useAudioStore from '../stores/audio-store';
import { useSettingsStore } from '@/plugins/settings/stores/settings-store';
import { ttsService } from '../services/tts-service';

interface TTSControlsProps {
  text?: string; // @description Text to read aloud
  className?: string;
  'data-testid'?: string;
}

const TTSControls: React.FC<TTSControlsProps> = ({
  text = '',
  className,
  'data-testid': testId,
}) => {
  // Store subscriptions
  const { 
    isSpeaking, 
    isPaused, 
    progress,
    startReading, 
    pauseReading, 
    resumeReading, 
    stopReading,
    updateTTSState 
  } = useAudioStore();
  
  const { settings } = useSettingsStore();
  const { audio } = settings;
  
  // Local state
  const [isSupported, setIsSupported] = useState(false);
  
  // Check TTS support on mount
  useEffect(() => {
    setIsSupported(ttsService.isSupported());
  }, []);
  
  // Subscribe to TTS state updates
  useEffect(() => {
    const unsubscribe = ttsService.subscribe((state) => {
      updateTTSState(state);
    });
    
    return unsubscribe;
  }, [updateTTSState]);
  
  // Event handlers
  const handlePlay = useCallback(async () => {
    if (!text.trim() || !audio.enabled) return;
    
    try {
      if (isPaused) {
        resumeReading();
      } else {
        await startReading(text, {
          enabled: audio.enabled,
          voice: audio.voice,
          rate: audio.rate,
          pitch: audio.pitch,
          volume: audio.volume,
        });
      }
    } catch (error) {
      console.error('Failed to start/resume reading:', error);
    }
  }, [text, audio, isPaused, startReading, resumeReading]);
  
  const handlePause = useCallback(() => {
    pauseReading();
  }, [pauseReading]);
  
  const handleStop = useCallback(() => {
    stopReading();
  }, [stopReading]);
  
  // Don't render if not supported or disabled
  if (!isSupported || !audio.enabled || !text.trim()) {
    return null;
  }
  
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2 rounded-lg bg-background/50 backdrop-blur border',
        className
      )}
      data-testid={testId}
      role="toolbar"
      aria-label="Text-to-Speech Controls"
    >
      {/* Play/Pause Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={isSpeaking && !isPaused ? handlePause : handlePlay}
        disabled={!text.trim()}
        className="flex-shrink-0"
        data-testid="tts-play-pause-button"
        aria-label={
          isSpeaking && !isPaused ? 'Pause reading' : 'Start reading'
        }
      >
        {isSpeaking && !isPaused ? (
          <Pause className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Play className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>
      
      {/* Stop Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleStop}
        disabled={!isSpeaking}
        className="flex-shrink-0"
        data-testid="tts-stop-button"
        aria-label="Stop reading"
      >
        <Square className="h-4 w-4" aria-hidden="true" />
      </Button>
      
      {/* Progress Bar */}
      {isSpeaking && (
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <Volume2 className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
          <Progress 
            value={progress} 
            className="flex-1"
            data-testid="tts-progress"
            aria-label={`Reading progress: ${Math.round(progress)}%`}
          />
          <span className="text-xs text-muted-foreground flex-shrink-0 tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      
      {/* Status Indicator */}
      {!isSpeaking && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <VolumeX className="h-3 w-3" aria-hidden="true" />
          <span>Ready</span>
        </div>
      )}
    </div>
  );
};

TTSControls.displayName = 'TTSControls';
export default TTSControls;