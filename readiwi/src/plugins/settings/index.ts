/**
 * Settings Plugin Exports - Readiwi v4.0
 */

export { default as SettingsPlugin } from './plugin';
export { default as SettingsPage } from './components/SettingsPage';
export { default as ReadingSettings } from './components/ReadingSettings';
export { default as useSettingsStore } from './stores/settings-store';
export { settingsService } from './services/settings-service';

// Types
export type {
  AppSettings,
  ReadingSettings as ReadingSettingsType,
  AudioSettings,
  ImportSettings,
  PrivacySettings,
  AccessibilitySettings,
  KeyboardShortcuts,
  ThemeSettings,
  ThemeMode,
  SettingsExport,
  SettingsState,
} from './types/settings-types';

// Constants
export {
  DEFAULT_APP_SETTINGS,
  DEFAULT_READING_SETTINGS,
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_IMPORT_SETTINGS,
  DEFAULT_PRIVACY_SETTINGS,
  DEFAULT_ACCESSIBILITY_SETTINGS,
  DEFAULT_KEYBOARD_SHORTCUTS,
  DEFAULT_THEME_SETTINGS,
} from './types/settings-types';