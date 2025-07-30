/**
 * Settings Store - Readiwi v4.0
 * Zustand store for managing application settings state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AppSettings,
  SettingsState,
  ReadingSettings,
  AudioSettings,
  ImportSettings,
  PrivacySettings,
  AccessibilitySettings,
  KeyboardShortcuts,
  SettingsExport,
  SettingsValidationResult,
  ThemeMode,
  DEFAULT_APP_SETTINGS,
} from '../types/settings-types';
import { settingsService } from '../services/settings-service';

const initialState = {
  settings: DEFAULT_APP_SETTINGS,
  loading: false,
  error: null,
  lastSaved: null,
  hasUnsavedChanges: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Update entire settings object
      updateSettings: (updates) => {
        const currentSettings = get().settings;
        const newSettings = { ...currentSettings, ...updates };
        
        set({
          settings: newSettings,
          hasUnsavedChanges: true,
          error: null,
        });
      },

      // Update reading settings
      updateReading: (updates) => {
        const currentSettings = get().settings;
        const newSettings = {
          ...currentSettings,
          reading: { ...currentSettings.reading, ...updates },
        };

        set({
          settings: newSettings,
          hasUnsavedChanges: true,
          error: null,
        });
      },

      // Update audio settings
      updateAudio: (updates) => {
        const currentSettings = get().settings;
        const newSettings = {
          ...currentSettings,
          audio: { ...currentSettings.audio, ...updates },
        };

        set({
          settings: newSettings,
          hasUnsavedChanges: true,
          error: null,
        });
      },

      // Update import settings
      updateImport: (updates) => {
        const currentSettings = get().settings;
        const newSettings = {
          ...currentSettings,
          import: { ...currentSettings.import, ...updates },
        };

        set({
          settings: newSettings,
          hasUnsavedChanges: true,
          error: null,
        });
      },

      // Update privacy settings
      updatePrivacy: (updates) => {
        const currentSettings = get().settings;
        const newSettings = {
          ...currentSettings,
          privacy: { ...currentSettings.privacy, ...updates },
        };

        set({
          settings: newSettings,
          hasUnsavedChanges: true,
          error: null,
        });
      },

      // Update accessibility settings
      updateAccessibility: (updates) => {
        const currentSettings = get().settings;
        const newSettings = {
          ...currentSettings,
          accessibility: { ...currentSettings.accessibility, ...updates },
        };

        set({
          settings: newSettings,
          hasUnsavedChanges: true,
          error: null,
        });
      },

      // Update keyboard shortcuts
      updateKeyboardShortcuts: (updates) => {
        const currentSettings = get().settings;
        const newSettings = {
          ...currentSettings,
          keyboardShortcuts: { ...currentSettings.keyboardShortcuts, ...updates },
        };

        set({
          settings: newSettings,
          hasUnsavedChanges: true,
          error: null,
        });
      },

      // Reset to defaults
      resetToDefaults: () => {
        set({
          settings: DEFAULT_APP_SETTINGS,
          hasUnsavedChanges: true,
          error: null,
        });
      },

      // Export settings
      exportSettings: async () => {
        set({ loading: true, error: null });

        try {
          const exported = await settingsService.exportSettings();
          set({ loading: false });
          return exported;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Export failed';
          set({
            loading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Import settings
      importSettings: async (exported: SettingsExport) => {
        set({ loading: true, error: null });

        try {
          await settingsService.importSettings(exported);
          
          // Reload settings from storage
          const newSettings = await settingsService.loadSettings();
          
          set({
            settings: newSettings,
            loading: false,
            hasUnsavedChanges: false,
            lastSaved: new Date(),
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Import failed';
          set({
            loading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Save settings
      saveSettings: async () => {
        const { settings } = get();
        set({ loading: true, error: null });

        try {
          await settingsService.saveSettings(settings);
          
          set({
            loading: false,
            hasUnsavedChanges: false,
            lastSaved: new Date(),
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Save failed';
          set({
            loading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Validate settings
      validateSettings: (settings?: Partial<AppSettings>) => {
        const settingsToValidate = settings || get().settings;
        return settingsService.validateSettings(settingsToValidate);
      },

      // Check if theme is dark
      isThemeDark: () => {
        const { settings } = get();
        return settingsService.isThemeDark(settings);
      },

      // Get effective theme (resolve 'auto')
      getEffectiveTheme: () => {
        const { settings } = get();
        return settingsService.getEffectiveTheme(settings);
      },

      // Check if feature is enabled
      hasFeatureEnabled: (feature: string) => {
        const { settings } = get();
        return settingsService.hasFeatureEnabled(settings, feature);
      },

      // Load settings from storage (initialization)
      loadSettings: async () => {
        set({ loading: true, error: null });

        try {
          const loadedSettings = await settingsService.loadSettings();
          
          set({
            settings: loadedSettings,
            loading: false,
            hasUnsavedChanges: false,
            lastSaved: new Date(),
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Load failed';
          set({
            loading: false,
            error: errorMessage,
            settings: DEFAULT_APP_SETTINGS, // Fallback to defaults
          });
          throw error;
        }
      },

      // Auto-save settings (debounced)
      autoSave: (() => {
        let timeoutId: NodeJS.Timeout;
        
        return () => {
          const { hasUnsavedChanges } = get();
          
          if (!hasUnsavedChanges) return;

          // Clear existing timeout
          if (timeoutId) {
            clearTimeout(timeoutId);
          }

          // Set new timeout for auto-save
          timeoutId = setTimeout(async () => {
            try {
              await get().saveSettings();
            } catch (error) {
              console.error('Auto-save failed:', error);
            }
          }, 2000); // 2 second delay
        };
      })(),
    }),
    {
      name: 'readiwi-settings',
      partialize: (state) => ({
        settings: state.settings,
        lastSaved: state.lastSaved,
      }),
    }
  )
);

export default useSettingsStore;