/**
 * Settings Service - Readiwi v4.0
 * Handles settings persistence, validation, and management
 */

import { db } from '@/core/services/database-simple';
import {
  AppSettings,
  SettingsExport,
  SettingsValidationResult,
  SettingsValidationError,
  DEFAULT_APP_SETTINGS,
  ThemeMode,
} from '../types/settings-types';

class SettingsService {
  private readonly SETTINGS_KEY = 'app-settings';
  private readonly CURRENT_VERSION = '1.0.0';

  /**
   * Load settings from IndexedDB
   */
  async loadSettings(): Promise<AppSettings> {
    try {
      const stored = await db.userSettings.where('key').equals(this.SETTINGS_KEY).first();
      
      if (!stored) {
        // First time - save default settings
        await this.saveSettings(DEFAULT_APP_SETTINGS);
        return DEFAULT_APP_SETTINGS;
      }

      // Validate and migrate if needed
      const validated = this.validateAndMigrate(stored.value);
      return validated;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return DEFAULT_APP_SETTINGS;
    }
  }

  /**
   * Save settings to IndexedDB
   */
  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const validation = this.validateSettings(settings);
      if (!validation.valid) {
        throw new Error(`Invalid settings: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      const settingsToSave = {
        ...settings,
        lastUpdated: new Date(),
        version: this.CURRENT_VERSION,
      };

      await db.userSettings.put({
        key: this.SETTINGS_KEY,
        value: settingsToSave,
        type: 'JSON' as any,
        category: 'system' as any,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  /**
   * Export settings to JSON
   */
  async exportSettings(): Promise<SettingsExport> {
    try {
      const settings = await this.loadSettings();
      
      return {
        version: this.CURRENT_VERSION,
        timestamp: new Date(),
        settings,
        metadata: {
          appVersion: this.CURRENT_VERSION,
          exportedBy: 'Readiwi Settings Service',
          deviceInfo: navigator.userAgent,
        },
      };
    } catch (error) {
      console.error('Failed to export settings:', error);
      throw error;
    }
  }

  /**
   * Import settings from exported JSON
   */
  async importSettings(exported: SettingsExport): Promise<void> {
    try {
      // Validate import format
      if (!exported.settings || !exported.version) {
        throw new Error('Invalid settings export format');
      }

      // Validate settings content
      const validation = this.validateSettings(exported.settings);
      if (!validation.valid) {
        throw new Error(`Invalid imported settings: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Save imported settings
      await this.saveSettings(exported.settings);
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw error;
    }
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(): Promise<void> {
    try {
      await this.saveSettings(DEFAULT_APP_SETTINGS);
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    }
  }

  /**
   * Validate settings object
   */
  validateSettings(settings: Partial<AppSettings>): SettingsValidationResult {
    const errors: SettingsValidationError[] = [];

    try {
      // Validate reading settings
      if (settings.reading) {
        const { reading } = settings;
        
        if (reading.theme?.fontSize !== undefined) {
          if (reading.theme.fontSize < 12 || reading.theme.fontSize > 24) {
            errors.push({
              field: 'reading.theme.fontSize',
              message: 'Font size must be between 12 and 24px',
              value: reading.theme.fontSize,
            });
          }
        }

        if (reading.theme?.lineHeight !== undefined) {
          if (reading.theme.lineHeight < 1.2 || reading.theme.lineHeight > 2.0) {
            errors.push({
              field: 'reading.theme.lineHeight',
              message: 'Line height must be between 1.2 and 2.0',
              value: reading.theme.lineHeight,
            });
          }
        }

        if (reading.pageWidth !== undefined) {
          if (reading.pageWidth < 400 || reading.pageWidth > 1200) {
            errors.push({
              field: 'reading.pageWidth',
              message: 'Page width must be between 400 and 1200px',
              value: reading.pageWidth,
            });
          }
        }

        if (reading.columnsPerPage !== undefined) {
          if (![1, 2].includes(reading.columnsPerPage)) {
            errors.push({
              field: 'reading.columnsPerPage',
              message: 'Columns per page must be 1 or 2',
              value: reading.columnsPerPage,
            });
          }
        }
      }

      // Validate audio settings
      if (settings.audio) {
        const { audio } = settings;
        
        if (audio.rate !== undefined) {
          if (audio.rate < 0.1 || audio.rate > 3.0) {
            errors.push({
              field: 'audio.rate',
              message: 'Audio rate must be between 0.1 and 3.0',
              value: audio.rate,
            });
          }
        }

        if (audio.pitch !== undefined) {
          if (audio.pitch < 0.0 || audio.pitch > 2.0) {
            errors.push({
              field: 'audio.pitch',
              message: 'Audio pitch must be between 0.0 and 2.0',
              value: audio.pitch,
            });
          }
        }

        if (audio.volume !== undefined) {
          if (audio.volume < 0.0 || audio.volume > 1.0) {
            errors.push({
              field: 'audio.volume',
              message: 'Audio volume must be between 0.0 and 1.0',
              value: audio.volume,
            });
          }
        }
      }

      // Validate import settings
      if (settings.import) {
        const { import: importSettings } = settings;
        
        if (importSettings.maxConcurrentDownloads !== undefined) {
          if (importSettings.maxConcurrentDownloads < 1 || importSettings.maxConcurrentDownloads > 5) {
            errors.push({
              field: 'import.maxConcurrentDownloads',
              message: 'Max concurrent downloads must be between 1 and 5',
              value: importSettings.maxConcurrentDownloads,
            });
          }
        }

        if (importSettings.timeoutSeconds !== undefined) {
          if (importSettings.timeoutSeconds < 10 || importSettings.timeoutSeconds > 300) {
            errors.push({
              field: 'import.timeoutSeconds',
              message: 'Timeout must be between 10 and 300 seconds',
              value: importSettings.timeoutSeconds,
            });
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [{
          field: 'general',
          message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          value: settings,
        }],
      };
    }
  }

  /**
   * Get effective theme mode (resolves 'auto' to actual theme)
   */
  getEffectiveTheme(settings: AppSettings): ThemeMode {
    if (settings.reading.theme.mode === 'auto') {
      // Check system preference
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light'; // Fallback
    }
    return settings.reading.theme.mode;
  }

  /**
   * Check if theme is effectively dark
   */
  isThemeDark(settings: AppSettings): boolean {
    const effectiveTheme = this.getEffectiveTheme(settings);
    return ['dark', 'high-contrast'].includes(effectiveTheme);
  }

  /**
   * Check if a feature is enabled
   */
  hasFeatureEnabled(settings: AppSettings, feature: string): boolean {
    switch (feature) {
      case 'audio':
        return settings.audio.enabled;
      case 'analytics':
        return settings.privacy.analytics;
      case 'crashReporting':
        return settings.privacy.crashReporting;
      case 'accessibility':
        return settings.accessibility.screenReaderSupport;
      case 'keyboardNavigation':
        return settings.accessibility.keyboardNavigation;
      case 'autoBookmark':
        return settings.reading.autoBookmark;
      case 'animations':
        return settings.reading.animatePageTurns && !settings.accessibility.reducedMotion;
      default:
        return false;
    }
  }

  /**
   * Validate and migrate settings from older versions
   */
  private validateAndMigrate(stored: any): AppSettings {
    try {
      // If it's already valid, return as-is
      const validation = this.validateSettings(stored);
      if (validation.valid) {
        return stored as AppSettings;
      }

      // Migrate from older versions or fix invalid values
      const migrated = {
        ...DEFAULT_APP_SETTINGS,
        ...stored,
      };

      // Ensure nested objects exist
      migrated.reading = { ...DEFAULT_APP_SETTINGS.reading, ...stored.reading };
      migrated.audio = { ...DEFAULT_APP_SETTINGS.audio, ...stored.audio };
      migrated.import = { ...DEFAULT_APP_SETTINGS.import, ...stored.import };
      migrated.privacy = { ...DEFAULT_APP_SETTINGS.privacy, ...stored.privacy };
      migrated.accessibility = { ...DEFAULT_APP_SETTINGS.accessibility, ...stored.accessibility };
      migrated.keyboardShortcuts = { ...DEFAULT_APP_SETTINGS.keyboardShortcuts, ...stored.keyboardShortcuts };

      // Fix theme object
      if (stored.reading?.theme) {
        migrated.reading.theme = {
          ...DEFAULT_APP_SETTINGS.reading.theme,
          ...stored.reading.theme,
        };
      }

      return migrated;
    } catch (error) {
      console.warn('Settings migration failed, using defaults:', error);
      return DEFAULT_APP_SETTINGS;
    }
  }
}

export const settingsService = new SettingsService();