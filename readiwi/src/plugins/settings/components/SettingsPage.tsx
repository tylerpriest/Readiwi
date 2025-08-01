/**
 * Settings Page - Readiwi v4.0
 * Main settings interface with categorized sections
 */

"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/core/utils/cn';
import { useSettingsStore } from '../stores/settings-store';
import { Save, Download, Upload, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import ReadingSettings from './ReadingSettings';
import AudioSettings from './AudioSettings';
import ImportSettings from './ImportSettings';
import PrivacySettings from './PrivacySettings';
import AccessibilitySettings from './AccessibilitySettings';
import KeyboardSettings from './KeyboardSettings';
import NavigationSettings from './NavigationSettings';

interface SettingsPageProps {
  className?: string;
  'data-testid'?: string;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  className,
  'data-testid': testId,
  ...props
}) => {
  const {
    loading,
    error,
    hasUnsavedChanges,
    lastSaved,
    saveSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
    loadSettings,
    validateSettings,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState('navigation');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load settings on mount
  useEffect(() => {
    loadSettings().catch(console.error);
  }, [loadSettings]);

  // Handle save
  const handleSave = useCallback(async () => {
    try {
      setSaveStatus('saving');
      await saveSettings();
      setSaveStatus('saved');
      
      // Reset status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Failed to save settings:', error);
    }
  }, [saveSettings]);

  // Handle reset to defaults
  const handleReset = useCallback(async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      return;
    }

    try {
      resetToDefaults();
      await saveSettings();
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  }, [resetToDefaults, saveSettings]);

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      const exported = await exportSettings();
      
      // Create download link
      const blob = new Blob([JSON.stringify(exported, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `readiwi-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export settings:', error);
    }
  }, [exportSettings]);

  // Handle import
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        await importSettings(imported);
      } catch (error) {
        console.error('Failed to import settings:', error);
        alert('Failed to import settings. Please check the file format.');
      }
    };

    input.click();
  }, [importSettings]);

  // Validate current settings
  const validation = validateSettings();
  const hasValidationErrors = !validation.valid;

  return (
    <div
      className={cn(
        'w-full max-w-4xl mx-auto p-6 space-y-6',
        className
      )}
      data-testid={testId}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Customize your reading experience and app preferences
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={loading}
            data-testid="export-button"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            disabled={loading}
            data-testid="import-button"
          >
            <Upload className="w-4 h-4 mr-1" />
            Import
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={loading}
            data-testid="reset-button"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>

          <Button
            onClick={handleSave}
            disabled={loading || !hasUnsavedChanges || hasValidationErrors}
            data-testid="save-button"
          >
            {saveStatus === 'saving' ? (
              <>
                <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-b-transparent" />
                Saving...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {hasValidationErrors && (
        <Card className="border-warning bg-warning/10">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-warning">
              <AlertCircle className="w-4 h-4" />
              <div>
                <p className="font-medium">Settings validation errors:</p>
                <ul className="mt-1 text-sm list-disc list-inside">
                  {validation.errors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {hasUnsavedChanges && !hasValidationErrors && (
        <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <AlertCircle className="w-4 h-4" />
              <span>You have unsaved changes. Don&#39;t forget to save!</span>
            </div>
          </CardContent>
        </Card>
      )}

      {lastSaved && (
        <p className="text-sm text-muted-foreground">
          Last saved: {lastSaved.toLocaleString()}
        </p>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="navigation" data-testid="navigation-tab">
            Navigation
          </TabsTrigger>
          <TabsTrigger value="reading" data-testid="reading-tab">
            Reading
          </TabsTrigger>
          <TabsTrigger value="audio" data-testid="audio-tab">
            Audio
          </TabsTrigger>
          <TabsTrigger value="import" data-testid="import-tab">
            Import
          </TabsTrigger>
          <TabsTrigger value="privacy" data-testid="privacy-tab">
            Privacy
          </TabsTrigger>
          <TabsTrigger value="accessibility" data-testid="accessibility-tab">
            Access
          </TabsTrigger>
          <TabsTrigger value="keyboard" data-testid="keyboard-tab">
            Keyboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="navigation" className="space-y-4">
          <NavigationSettings />
        </TabsContent>

        <TabsContent value="reading" className="space-y-4">
          <ReadingSettings />
        </TabsContent>

        <TabsContent value="audio" className="space-y-4">
          <AudioSettings />
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <ImportSettings />
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <PrivacySettings />
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-4">
          <AccessibilitySettings />
        </TabsContent>

        <TabsContent value="keyboard" className="space-y-4">
          <KeyboardSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

SettingsPage.displayName = 'SettingsPage';
export default SettingsPage;