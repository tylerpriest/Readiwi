"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/core/utils/cn';
import { useSettingsStore } from '../stores/settings-store';
import { ttsService, TTSVoice } from '@/plugins/audio/services/tts-service';

interface AudioSettingsProps {
  className?: string;
  'data-testid'?: string;
}

const AudioSettings: React.FC<AudioSettingsProps> = ({
  className,
  'data-testid': testId,
}) => {
  const { settings, updateAudio, autoSave } = useSettingsStore();
  const { audio } = settings;
  
  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const [testing, setTesting] = useState(false);
  const [supported, setSupported] = useState(false);

  // Load available voices on component mount
  useEffect(() => {
    const isSupported = ttsService.isSupported();
    setSupported(isSupported);
    
    if (isSupported) {
      const availableVoices = ttsService.getVoices();
      setVoices(availableVoices);
      
      // If no voice selected and we have voices, select default
      if (!audio.voice && availableVoices.length > 0) {
        const defaultVoice = availableVoices.find(v => v.default) || availableVoices[0];
        if (defaultVoice) {
          updateAudio({ voice: defaultVoice.id });
          autoSave();
        }
      }
    }
  }, [audio.voice, updateAudio, autoSave]);

  // Handle setting changes
  const handleSettingChange = useCallback((field: string, value: any) => {
    updateAudio({ [field]: value });
    autoSave();
  }, [updateAudio, autoSave]);

  // Test TTS functionality
  const handleTestSpeech = useCallback(async () => {
    if (!supported || testing) return;
    
    setTesting(true);
    try {
      await ttsService.testSpeech({
        enabled: true,
        voice: audio.voice,
        rate: audio.rate,
        pitch: audio.pitch,
        volume: audio.volume,
      });
    } catch (error) {
      console.error('TTS test failed:', error);
    } finally {
      setTesting(false);
    }
  }, [supported, testing, audio]);

  if (!supported) {
    return (
      <Card className={className} data-testid={testId}>
        <CardHeader>
          <CardTitle>Text-to-Speech Settings</CardTitle>
          <CardDescription>Configure audio playback and voice settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Text-to-Speech is not supported in your browser.
            </p>
            <p className="text-sm text-muted-foreground">
              Please use a modern browser with Web Speech API support.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)} data-testid={testId}>
      {/* Main TTS Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Text-to-Speech Settings</CardTitle>
          <CardDescription>Configure audio playback and voice settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable TTS */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="tts-enabled">Enable Text-to-Speech</Label>
              <p className="text-sm text-muted-foreground">
                Allow the app to read text aloud using browser speech synthesis
              </p>
            </div>
            <Switch
              id="tts-enabled"
              checked={audio.enabled}
              onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
              data-testid="tts-enabled-switch"
            />
          </div>

          {audio.enabled && (
            <>
              {/* Voice Selection */}
              <div className="space-y-2">
                <Label htmlFor="voice-select">Voice</Label>
                <Select
                  value={audio.voice}
                  onValueChange={(value) => handleSettingChange('voice', value)}
                >
                  <SelectTrigger data-testid="voice-select">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name} ({voice.lang})
                        {voice.default && ' - Default'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Available voices depend on your operating system and browser
                </p>
              </div>

              {/* Speech Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="speech-rate">Speech Rate</Label>
                  <span className="text-sm text-muted-foreground">{audio.rate.toFixed(1)}x</span>
                </div>
                <Slider
                  id="speech-rate"
                  min={0.1}
                  max={3.0}
                  step={0.1}
                  value={[audio.rate]}
                  onValueChange={([value]) => handleSettingChange('rate', value)}
                  className="w-full"
                  data-testid="speech-rate-slider"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Slow (0.1x)</span>
                  <span>Normal (1.0x)</span>
                  <span>Fast (3.0x)</span>
                </div>
              </div>

              {/* Speech Pitch */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="speech-pitch">Speech Pitch</Label>
                  <span className="text-sm text-muted-foreground">{audio.pitch.toFixed(1)}</span>
                </div>
                <Slider
                  id="speech-pitch"
                  min={0.0}
                  max={2.0}
                  step={0.1}
                  value={[audio.pitch]}
                  onValueChange={([value]) => handleSettingChange('pitch', value)}
                  className="w-full"
                  data-testid="speech-pitch-slider"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low (0.0)</span>
                  <span>Normal (1.0)</span>
                  <span>High (2.0)</span>
                </div>
              </div>

              {/* Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="speech-volume">Volume</Label>
                  <span className="text-sm text-muted-foreground">{Math.round(audio.volume * 100)}%</span>
                </div>
                <Slider
                  id="speech-volume"
                  min={0.0}
                  max={1.0}
                  step={0.1}
                  value={[audio.volume]}
                  onValueChange={([value]) => handleSettingChange('volume', value)}
                  className="w-full"
                  data-testid="speech-volume-slider"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Mute (0%)</span>
                  <span>Half (50%)</span>
                  <span>Full (100%)</span>
                </div>
              </div>

              {/* Test Speech */}
              <div className="pt-4 border-t">
                <Button
                  onClick={handleTestSpeech}
                  disabled={testing}
                  variant="outline"
                  className="w-full"
                  data-testid="test-speech-button"
                >
                  {testing ? 'Testing Speech...' : 'Test Speech Settings'}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Click to hear how your current settings sound
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Advanced Audio Settings */}
      {audio.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Audio Settings</CardTitle>
            <CardDescription>Fine-tune your audio reading experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-pause on scroll</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically pause speech when user scrolls
                </p>
              </div>
              <Switch
                checked={false} // Placeholder - will implement later
                onCheckedChange={() => {}} // Placeholder
                disabled
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Highlight current sentence</Label>
                <p className="text-sm text-muted-foreground">
                  Visually highlight the sentence being read
                </p>
              </div>
              <Switch
                checked={false} // Placeholder - will implement later
                onCheckedChange={() => {}} // Placeholder
                disabled
              />
            </div>

            <p className="text-xs text-muted-foreground italic">
              Advanced features coming soon
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AudioSettings;