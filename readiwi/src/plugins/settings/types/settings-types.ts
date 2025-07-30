/**
 * Settings Types - Readiwi v4.0
 * Comprehensive type definitions for application settings
 */

// Theme Types
export type ThemeMode = 'light' | 'dark' | 'sepia' | 'high-contrast' | 'auto';

export interface ThemeSettings {
  mode: ThemeMode;
  fontSize: number; // 12-24px
  fontFamily: string; // System font names
  lineHeight: number; // 1.2-2.0
  backgroundColor: string; // Hex color
  textColor: string; // Hex color
  accentColor: string; // Hex color
}

// Reading Settings
export interface ReadingSettings {
  theme: ThemeSettings;
  columnsPerPage: 1 | 2; // Single or dual column
  pageWidth: number; // 400-1200px
  marginSize: number; // 16-64px
  paragraphSpacing: number; // 8-32px
  textAlign: 'left' | 'center' | 'justify';
  animatePageTurns: boolean;
  enablePageFlipping: boolean;
  scrollBehavior: 'smooth' | 'instant';
  autoBookmark: boolean;
  bookmarkInterval: number; // seconds
}

// Audio Settings
export interface AudioSettings {
  enabled: boolean;
  voice: string; // Speech synthesis voice ID
  rate: number; // 0.1-3.0
  pitch: number; // 0.0-2.0
  volume: number; // 0.0-1.0
  highlightText: boolean;
  autoAdvance: boolean;
  pauseOnInteraction: boolean;
}

// Import Settings
export interface ImportSettings {
  defaultSource: string; // Default import URL base
  autoDetectChapters: boolean;
  preserveFormatting: boolean;
  downloadImages: boolean;
  maxConcurrentDownloads: number; // 1-5
  retryAttempts: number; // 1-5
  timeoutSeconds: number; // 10-300
}

// Privacy Settings
export interface PrivacySettings {
  analytics: boolean;
  crashReporting: boolean;
  usageStatistics: boolean;
  shareReadingProgress: boolean;
  allowDataExport: boolean;
}

// Accessibility Settings
export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderSupport: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  skipToContent: boolean;
  announcePageChanges: boolean;
}

// Keyboard Shortcuts
export interface KeyboardShortcuts {
  nextPage: string[];
  previousPage: string[];
  toggleBookmarks: string[];
  openSearch: string[];
  toggleTTS: string[];
  increaseFontSize: string[];
  decreaseFontSize: string[];
  toggleFullscreen: string[];
  openSettings: string[];
  goHome: string[];
}

// Complete Settings Interface
export interface AppSettings {
  reading: ReadingSettings;
  audio: AudioSettings;
  import: ImportSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
  keyboardShortcuts: KeyboardShortcuts;
  
  // Metadata
  version: string;
  lastUpdated: Date;
  exportable: boolean;
}

// Settings Validation
export interface SettingsValidationError {
  field: string;
  message: string;
  value: unknown;
}

export interface SettingsValidationResult {
  valid: boolean;
  errors: SettingsValidationError[];
}

// Settings Import/Export
export interface SettingsExport {
  version: string;
  timestamp: Date;
  settings: AppSettings;
  metadata: {
    appVersion: string;
    exportedBy: string;
    deviceInfo?: string;
  };
}

// Settings Store State
export interface SettingsState {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  
  // Actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateReading: (updates: Partial<ReadingSettings>) => void;
  updateAudio: (updates: Partial<AudioSettings>) => void;
  updateImport: (updates: Partial<ImportSettings>) => void;
  updatePrivacy: (updates: Partial<PrivacySettings>) => void;
  updateAccessibility: (updates: Partial<AccessibilitySettings>) => void;
  updateKeyboardShortcuts: (updates: Partial<KeyboardShortcuts>) => void;
  
  resetToDefaults: () => void;
  exportSettings: () => Promise<SettingsExport>;
  importSettings: (exported: SettingsExport) => Promise<void>;
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
  validateSettings: (settings?: Partial<AppSettings>) => SettingsValidationResult;
  autoSave: () => void;
  
  // Selectors
  isThemeDark: () => boolean;
  getEffectiveTheme: () => ThemeMode;
  hasFeatureEnabled: (feature: string) => boolean;
}

// Default Settings Values
export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  mode: 'auto',
  fontSize: 16,
  fontFamily: 'system-ui',
  lineHeight: 1.6,
  backgroundColor: '#ffffff',
  textColor: '#1a1a1a',
  accentColor: '#3b82f6',
};

export const DEFAULT_READING_SETTINGS: ReadingSettings = {
  theme: DEFAULT_THEME_SETTINGS,
  columnsPerPage: 1,
  pageWidth: 800,
  marginSize: 32,
  paragraphSpacing: 16,
  textAlign: 'left',
  animatePageTurns: true,
  enablePageFlipping: true,
  scrollBehavior: 'smooth',
  autoBookmark: true,
  bookmarkInterval: 30,
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  enabled: false,
  voice: '',
  rate: 1.0,
  pitch: 1.0,
  volume: 0.8,
  highlightText: true,
  autoAdvance: false,
  pauseOnInteraction: true,
};

export const DEFAULT_IMPORT_SETTINGS: ImportSettings = {
  defaultSource: 'https://www.royalroad.com',
  autoDetectChapters: true,
  preserveFormatting: true,
  downloadImages: false,
  maxConcurrentDownloads: 3,
  retryAttempts: 3,
  timeoutSeconds: 60,
};

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  analytics: false,
  crashReporting: true,
  usageStatistics: false,
  shareReadingProgress: false,
  allowDataExport: true,
};

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  screenReaderSupport: true,
  keyboardNavigation: true,
  focusIndicators: true,
  skipToContent: true,
  announcePageChanges: true,
};

export const DEFAULT_KEYBOARD_SHORTCUTS: KeyboardShortcuts = {
  nextPage: ['ArrowRight', 'Space', 'd'],
  previousPage: ['ArrowLeft', 'Shift+Space', 'a'],
  toggleBookmarks: ['b'],
  openSearch: ['/', 'Ctrl+f'],
  toggleTTS: ['t'],
  increaseFontSize: ['=', 'Ctrl+='],
  decreaseFontSize: ['-', 'Ctrl+-'],
  toggleFullscreen: ['f', 'F11'],
  openSettings: ['s', 'Ctrl+,'],
  goHome: ['h', 'Ctrl+Home'],
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  reading: DEFAULT_READING_SETTINGS,
  audio: DEFAULT_AUDIO_SETTINGS,
  import: DEFAULT_IMPORT_SETTINGS,
  privacy: DEFAULT_PRIVACY_SETTINGS,
  accessibility: DEFAULT_ACCESSIBILITY_SETTINGS,
  keyboardShortcuts: DEFAULT_KEYBOARD_SHORTCUTS,
  version: '1.0.0',
  lastUpdated: new Date(),
  exportable: true,
};