"use client";

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/core/utils/cn';
import { Volume2, VolumeX, Settings } from 'lucide-react';
import { useSettingsStore } from '@/plugins/settings/stores/settings-store';
import TTSControls from './TTSControls';

interface AudioControlsProps {
  text?: string; // @description Text content for TTS
  showSettings?: boolean; // @description Show settings button
  onSettingsClick?: () => void; // @description Callback for settings button
  className?: string;
  'data-testid'?: string;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  text = '',
  showSettings = true,
  onSettingsClick,
  className,
  'data-testid': testId,
}) => {
  // Store subscriptions
  const { settings, updateAudio, autoSave } = useSettingsStore();
  const { audio } = settings;
  
  // Event handlers
  const handleToggleAudio = useCallback(() => {
    updateAudio({ enabled: !audio.enabled });
    autoSave();
  }, [audio.enabled, updateAudio, autoSave]);
  
  const handleSettingsClick = useCallback(() => {
    onSettingsClick?.();
  }, [onSettingsClick]);
  
  return (
    <div
      className={cn('flex flex-col gap-2', className)}
      data-testid={testId}
    >
      {/* Audio Toggle & Settings */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleAudio}
            className="flex items-center gap-2"
            data-testid="audio-toggle-button"
            aria-label={audio.enabled ? 'Disable audio' : 'Enable audio'}
          >
            {audio.enabled ? (
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <VolumeX className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="text-sm">
              {audio.enabled ? 'Audio On' : 'Audio Off'}
            </span>
          </Button>
          
          {showSettings && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSettingsClick}
              data-testid="audio-settings-button"
              aria-label="Open audio settings"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
      
      {/* TTS Controls */}
      {audio.enabled && text && (
        <TTSControls
          text={text}
          data-testid="audio-tts-controls"
        />
      )}
    </div>
  );
};

AudioControls.displayName = 'AudioControls';
export default AudioControls;