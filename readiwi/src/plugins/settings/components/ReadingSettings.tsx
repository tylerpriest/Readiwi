/**
 * Reading Settings Component - Readiwi v4.0
 * Settings for reading experience customization
 */

"use client";

import React, { useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/core/utils/cn';
import { useSettingsStore } from '../stores/settings-store';

interface ReadingSettingsProps {
  className?: string;
  'data-testid'?: string;
}

const ReadingSettings: React.FC<ReadingSettingsProps> = ({
  className,
  'data-testid': testId,
  ...props
}) => {
  const { settings, updateReading, autoSave } = useSettingsStore();
  const { reading } = settings;

  // Handle theme changes
  const handleThemeChange = useCallback((field: string, value: any) => {
    updateReading({
      theme: {
        ...reading.theme,
        [field]: value,
      },
    });
    autoSave();
  }, [reading.theme, updateReading, autoSave]);

  // Handle reading setting changes
  const handleSettingChange = useCallback((field: string, value: any) => {
    updateReading({
      [field]: value,
    });
    autoSave();
  }, [updateReading, autoSave]);

  return (
    <div
      className={cn('space-y-6', className)}
      data-testid={testId}
      {...props}
    >
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Theme & Appearance</CardTitle>
          <CardDescription>
            Customize colors, fonts, and visual appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Theme Mode */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Theme Mode</label>
            <div className="flex gap-2">
              {(['light', 'dark', 'sepia', 'high-contrast', 'auto'] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={reading.theme.mode === mode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleThemeChange('mode', mode)}
                  data-testid={`theme-${mode}`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <label htmlFor="font-size" className="text-sm font-medium">
              Font Size: {reading.theme.fontSize}px
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">12</span>
              <input
                id="font-size"
                type="range"
                min="12"
                max="24"
                value={reading.theme.fontSize}
                onChange={(e) => handleThemeChange('fontSize', parseInt(e.target.value))}
                className="flex-1"
                data-testid="font-size-slider"
              />
              <span className="text-sm text-muted-foreground">24</span>
            </div>
          </div>

          {/* Line Height */}
          <div className="space-y-2">
            <label htmlFor="line-height" className="text-sm font-medium">
              Line Height: {reading.theme.lineHeight}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">1.2</span>
              <input
                id="line-height"
                type="range"
                min="1.2"
                max="2.0"
                step="0.1"
                value={reading.theme.lineHeight}
                onChange={(e) => handleThemeChange('lineHeight', parseFloat(e.target.value))}
                className="flex-1"
                data-testid="line-height-slider"
              />
              <span className="text-sm text-muted-foreground">2.0</span>
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <label htmlFor="font-family" className="text-sm font-medium">Font Family</label>
            <select
              id="font-family"
              value={reading.theme.fontFamily}
              onChange={(e) => handleThemeChange('fontFamily', e.target.value)}
              className="w-full p-2 border rounded-md"
              data-testid="font-family-select"
            >
              <option value="system-ui">System Default</option>
              <option value="serif">Serif</option>
              <option value="sans-serif">Sans Serif</option>
              <option value="monospace">Monospace</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Times New Roman, serif">Times New Roman</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="Helvetica, sans-serif">Helvetica</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Layout Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Layout & Spacing</CardTitle>
          <CardDescription>
            Control page layout, columns, and spacing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Columns */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Columns per Page</label>
            <div className="flex gap-2">
              <Button
                variant={reading.columnsPerPage === 1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSettingChange('columnsPerPage', 1)}
                data-testid="columns-1"
              >
                Single Column
              </Button>
              <Button
                variant={reading.columnsPerPage === 2 ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSettingChange('columnsPerPage', 2)}
                data-testid="columns-2"
              >
                Two Columns
              </Button>
            </div>
          </div>

          {/* Page Width */}
          <div className="space-y-2">
            <label htmlFor="page-width" className="text-sm font-medium">
              Page Width: {reading.pageWidth}px
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">400</span>
              <input
                id="page-width"
                type="range"
                min="400"
                max="1200"
                step="50"
                value={reading.pageWidth}
                onChange={(e) => handleSettingChange('pageWidth', parseInt(e.target.value))}
                className="flex-1"
                data-testid="page-width-slider"
              />
              <span className="text-sm text-muted-foreground">1200</span>
            </div>
          </div>

          {/* Text Alignment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Text Alignment</label>
            <div className="flex gap-2">
              {(['left', 'center', 'justify'] as const).map((align) => (
                <Button
                  key={align}
                  variant={reading.textAlign === align ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSettingChange('textAlign', align)}
                  data-testid={`align-${align}`}
                >
                  {align.charAt(0).toUpperCase() + align.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Behavior Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Reading Behavior</CardTitle>
          <CardDescription>
            Configure navigation, animations, bookmarking, and interactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Navigation Mode */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Chapter Navigation</label>
            <div className="flex gap-2">
              <Button
                variant={reading.navigationMode === 'buttons' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSettingChange('navigationMode', 'buttons')}
                data-testid="nav-buttons"
              >
                Previous/Next Buttons
              </Button>
              <Button
                variant={reading.navigationMode === 'infinite-scroll' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSettingChange('navigationMode', 'infinite-scroll')}
                data-testid="nav-infinite-scroll"
              >
                Infinite Scroll
              </Button>
            </div>
            {reading.navigationMode === 'infinite-scroll' && (
              <p className="text-xs text-muted-foreground">
                Automatically loads next chapter when you scroll near the bottom
              </p>
            )}
          </div>
          {/* Animations */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Animate Page Turns</label>
              <p className="text-xs text-muted-foreground">
                Smooth animations when changing pages
              </p>
            </div>
            <input
              type="checkbox"
              checked={reading.animatePageTurns}
              onChange={(e) => handleSettingChange('animatePageTurns', e.target.checked)}
              className="h-4 w-4"
              data-testid="animate-checkbox"
            />
          </div>

          {/* Auto Bookmark */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Auto Bookmark</label>
              <p className="text-xs text-muted-foreground">
                Automatically save reading position
              </p>
            </div>
            <input
              type="checkbox"
              checked={reading.autoBookmark}
              onChange={(e) => handleSettingChange('autoBookmark', e.target.checked)}
              className="h-4 w-4"
              data-testid="auto-bookmark-checkbox"
            />
          </div>

          {reading.autoBookmark && (
            <div className="space-y-2 ml-4">
              <label htmlFor="bookmark-interval" className="text-sm font-medium">
                Bookmark Interval: {reading.bookmarkInterval}s
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">10</span>
                <input
                  id="bookmark-interval"
                  type="range"
                  min="10"
                  max="300"
                  step="10"
                  value={reading.bookmarkInterval}
                  onChange={(e) => handleSettingChange('bookmarkInterval', parseInt(e.target.value))}
                  className="flex-1"
                  data-testid="bookmark-interval-slider"
                />
                <span className="text-sm text-muted-foreground">300</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

ReadingSettings.displayName = 'ReadingSettings';
export default ReadingSettings;