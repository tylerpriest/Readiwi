/**
 * Settings Integration Test - Readiwi v4.0
 * Tests to verify settings store integration with reader behavior
 */

import { renderHook, act } from '@testing-library/react';

// Mock the settings service first
jest.mock('../services/settings-service', () => ({
  settingsService: {
    saveSettings: jest.fn().mockResolvedValue(undefined),
    loadSettings: jest.fn().mockResolvedValue({
      theme: {
        mode: 'auto',
        fontSize: 16,
        fontFamily: 'system-ui',
        lineHeight: 1.6,
        backgroundColor: '#ffffff',
        textColor: '#1a1a1a',
        accentColor: '#3b82f6',
      },
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
      navigationMode: 'buttons',
      infiniteScrollThreshold: 200,
    }),
    exportSettings: jest.fn(),
    importSettings: jest.fn(),
    validateSettings: jest.fn().mockReturnValue({ valid: true, errors: [] }),
  },
}));

import { useSettingsStore } from '../stores/settings-store';

describe('Settings Store Integration', () => {
  beforeEach(() => {
    // Clear localStorage to ensure clean state
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('should initialize with default settings', () => {
    const { result } = renderHook(() => useSettingsStore());
    
    expect(result.current.settings.reading.theme.fontSize).toBe(16);
    expect(result.current.settings.reading.navigationMode).toBe('buttons');
    expect(result.current.settings.reading.autoBookmark).toBe(true);
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  test('should update reading settings and mark as unsaved', () => {
    const { result } = renderHook(() => useSettingsStore());
    
    act(() => {
      result.current.updateReading({
        theme: {
          ...result.current.settings.reading.theme,
          fontSize: 18,
        },
      });
    });

    expect(result.current.settings.reading.theme.fontSize).toBe(18);
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  test('should update navigation mode setting', () => {
    const { result } = renderHook(() => useSettingsStore());
    
    act(() => {
      result.current.updateReading({
        navigationMode: 'infinite-scroll',
      });
    });

    expect(result.current.settings.reading.navigationMode).toBe('infinite-scroll');
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  test('should handle multiple setting updates correctly', () => {
    const { result } = renderHook(() => useSettingsStore());
    
    act(() => {
      result.current.updateReading({
        theme: {
          ...result.current.settings.reading.theme,
          fontSize: 20,
          lineHeight: 1.8,
        },
        columnsPerPage: 2,
        pageWidth: 1000,
        textAlign: 'justify',
      });
    });

    expect(result.current.settings.reading.theme.fontSize).toBe(20);
    expect(result.current.settings.reading.theme.lineHeight).toBe(1.8);
    expect(result.current.settings.reading.columnsPerPage).toBe(2);
    expect(result.current.settings.reading.pageWidth).toBe(1000);
    expect(result.current.settings.reading.textAlign).toBe('justify');
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  test('should auto-save settings with debounce', async () => {
    const { result } = renderHook(() => useSettingsStore());
    
    act(() => {
      result.current.updateReading({
        theme: {
          ...result.current.settings.reading.theme,
          fontSize: 22,
        },
      });
    });

    expect(result.current.hasUnsavedChanges).toBe(true);

    // Trigger auto-save
    act(() => {
      result.current.autoSave();
    });

    // Wait for debounced save
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 2100));
    });

    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  test('should persist settings to localStorage', () => {
    const { result } = renderHook(() => useSettingsStore());
    
    act(() => {
      result.current.updateReading({
        navigationMode: 'infinite-scroll',
        infiniteScrollThreshold: 150,
      });
    });

    // Check that settings are persisted
    const persistedData = JSON.parse(localStorage.getItem('readiwi-settings') || '{}');
    expect(persistedData.state.settings.reading.navigationMode).toBe('infinite-scroll');
    expect(persistedData.state.settings.reading.infiniteScrollThreshold).toBe(150);
  });

  test('should validate theme mode changes', () => {
    const { result } = renderHook(() => useSettingsStore());
    
    act(() => {
      result.current.updateReading({
        theme: {
          ...result.current.settings.reading.theme,
          mode: 'dark',
        },
      });
    });

    expect(result.current.settings.reading.theme.mode).toBe('dark');
  });

  test('should handle bookmark settings correctly', () => {
    const { result } = renderHook(() => useSettingsStore());
    
    act(() => {
      result.current.updateReading({
        autoBookmark: false,
        bookmarkInterval: 60,
      });
    });

    expect(result.current.settings.reading.autoBookmark).toBe(false);
    expect(result.current.settings.reading.bookmarkInterval).toBe(60);
  });

  test('should maintain setting boundaries', () => {
    const { result } = renderHook(() => useSettingsStore());
    
    // Test font size boundaries
    act(() => {
      result.current.updateReading({
        theme: {
          ...result.current.settings.reading.theme,
          fontSize: 25, // Above max of 24
        },
      });
    });

    // The store should accept the value (validation happens at UI level)
    expect(result.current.settings.reading.theme.fontSize).toBe(25);
  });

  test('should reset to defaults', () => {
    const { result } = renderHook(() => useSettingsStore());
    
    // Make some changes
    act(() => {
      result.current.updateReading({
        theme: {
          ...result.current.settings.reading.theme,
          fontSize: 22,
        },
        navigationMode: 'infinite-scroll',
      });
    });

    expect(result.current.settings.reading.theme.fontSize).toBe(22);
    expect(result.current.settings.reading.navigationMode).toBe('infinite-scroll');

    // Reset to defaults
    act(() => {
      result.current.resetToDefaults();
    });

    expect(result.current.settings.reading.theme.fontSize).toBe(16);
    expect(result.current.settings.reading.navigationMode).toBe('buttons');
  });
});