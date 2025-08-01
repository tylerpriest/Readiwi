/**
 * Reader Settings Integration Test - Readiwi v4.0
 * Tests to verify ReaderView properly applies settings from the settings store
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ReaderView from '../components/ReaderView';
import { useSettingsStore } from '../../settings/stores/settings-store';
import { useReaderStore } from '../stores/reader-store';

// Mock the settings service
jest.mock('../../settings/services/settings-service', () => ({
  settingsService: {
    saveSettings: jest.fn().mockResolvedValue(undefined),
    loadSettings: jest.fn().mockResolvedValue({}),
    exportSettings: jest.fn(),
    importSettings: jest.fn(),
    validateSettings: jest.fn().mockReturnValue({ valid: true, errors: [] }),
  },
}));

// Mock the reader service
jest.mock('../services/reader-service', () => ({
  readerService: {
    loadBook: jest.fn(),
    saveReadingPosition: jest.fn(),
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock audio controls
jest.mock('../../audio/components/AudioControls', () => {
  return function MockAudioControls() {
    return <div data-testid="audio-controls">Audio Controls</div>;
  };
});

// Mock reading settings
jest.mock('../../settings/components/ReadingSettings', () => {
  return function MockReadingSettings() {
    return <div data-testid="reading-settings">Reading Settings</div>;
  };
});

describe('ReaderView Settings Integration', () => {
  const mockBook = {
    id: 1,
    title: 'Test Book',
    author: 'Test Author',
    totalChapters: 5,
  };

  const mockChapter = {
    id: 1,
    bookId: 1,
    title: 'Chapter 1',
    content: 'This is test chapter content.',
    chapterNumber: 1,
    wordCount: 100,
    estimatedReadingTime: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Set up reader store state
    useReaderStore.setState({
      currentBook: mockBook,
      currentChapter: mockChapter,
      chapters: [mockChapter],
      loading: false,
      error: null,
      isSettingsVisible: false,
      currentPosition: null,
      loadBook: jest.fn(),
      updatePosition: jest.fn(),
      toggleSettings: jest.fn(),
      clearError: jest.fn(),
      reset: jest.fn(),
    });

    // Set up settings store with button navigation mode
    useSettingsStore.setState({
      settings: {
        reading: {
          theme: {
            mode: 'light',
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
        },
        audio: {},
        import: {},
        privacy: {},
        accessibility: {},
        keyboardShortcuts: {},
        version: '1.0.0',
        lastUpdated: new Date(),
        exportable: true,
      },
      loading: false,
      error: null,
      lastSaved: null,
      hasUnsavedChanges: false,
      updateSettings: jest.fn(),
      updateReading: jest.fn(),
      updateAudio: jest.fn(),
      updateImport: jest.fn(),
      updatePrivacy: jest.fn(),
      updateAccessibility: jest.fn(),
      updateKeyboardShortcuts: jest.fn(),
      resetToDefaults: jest.fn(),
      exportSettings: jest.fn(),
      importSettings: jest.fn(),
      saveSettings: jest.fn(),
      loadSettings: jest.fn(),
      validateSettings: jest.fn(),
      autoSave: jest.fn(),
      isThemeDark: jest.fn(),
      getEffectiveTheme: jest.fn(),
      hasFeatureEnabled: jest.fn(),
    });
  });

  test('should render chapter navigation buttons when navigationMode is buttons', () => {
    render(<ReaderView bookId={1} slug="test-book" />);
    
    expect(screen.getByTestId('chapter-navigation')).toBeInTheDocument();
    expect(screen.getAllByText('Previous')).toHaveLength(2); // Top and bottom navigation
    expect(screen.getAllByText(/Next Chapter/)).toHaveLength(2); // Top and bottom navigation
  });

  test('should render infinite scroll indicator when navigationMode is infinite-scroll', () => {
    // Update settings to use infinite scroll
    useSettingsStore.setState({
      settings: {
        ...useSettingsStore.getState().settings,
        reading: {
          ...useSettingsStore.getState().settings.reading,
          navigationMode: 'infinite-scroll',
        },
      },
    });

    render(<ReaderView bookId={1} slug="test-book" />);
    
    expect(screen.getByTestId('infinite-scroll-indicator')).toBeInTheDocument();
    expect(screen.getByText('Scroll for next chapter')).toBeInTheDocument();
    expect(screen.queryByTestId('chapter-navigation')).not.toBeInTheDocument();
  });

  test('should apply theme settings to reading content', () => {
    render(<ReaderView bookId={1} slug="test-book" />);
    
    const readingContent = screen.getByTestId('reading-content');
    
    // Check that style attributes are applied
    expect(readingContent).toHaveStyle({
      fontSize: '16px',
      fontFamily: 'system-ui',
      lineHeight: '1.6',
      textAlign: 'left',
      maxWidth: '800px',
      backgroundColor: '#ffffff',
      color: '#1a1a1a',
      columnCount: '1',
    });
  });

  test('should apply two-column layout when columnsPerPage is 2', () => {
    // Update settings to use two columns
    useSettingsStore.setState({
      settings: {
        ...useSettingsStore.getState().settings,
        reading: {
          ...useSettingsStore.getState().settings.reading,
          columnsPerPage: 2,
        },
      },
    });

    render(<ReaderView bookId={1} slug="test-book" />);
    
    const readingContent = screen.getByTestId('reading-content');
    expect(readingContent).toHaveStyle({
      columnCount: '2',
      columnGap: '2rem',
    });
  });

  test('should show settings panel when isSettingsVisible is true', () => {
    // Set settings visible
    useReaderStore.setState({
      ...useReaderStore.getState(),
      isSettingsVisible: true,
    });

    render(<ReaderView bookId={1} slug="test-book" />);
    
    expect(screen.getByTestId('reading-settings-panel')).toBeInTheDocument();
    expect(screen.getByTestId('reading-settings')).toBeInTheDocument();
  });

  test('should not show settings panel when isSettingsVisible is false', () => {
    render(<ReaderView bookId={1} slug="test-book" />);
    
    expect(screen.queryByTestId('reading-settings-panel')).not.toBeInTheDocument();
  });

  test('should apply animation class when animatePageTurns is true', () => {
    render(<ReaderView bookId={1} slug="test-book" />);
    
    const readingContent = screen.getByTestId('reading-content');
    expect(readingContent).toHaveClass('transition-all', 'duration-300', 'ease-in-out');
  });

  test('should not apply animation class when animatePageTurns is false', () => {
    // Update settings to disable animations
    useSettingsStore.setState({
      settings: {
        ...useSettingsStore.getState().settings,
        reading: {
          ...useSettingsStore.getState().settings.reading,
          animatePageTurns: false,
        },
      },
    });

    render(<ReaderView bookId={1} slug="test-book" />);
    
    const readingContent = screen.getByTestId('reading-content');
    expect(readingContent).not.toHaveClass('transition-all');
  });

  test('should display book and chapter information correctly', () => {
    render(<ReaderView bookId={1} slug="test-book" />);
    
    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('by Test Author')).toBeInTheDocument();
    expect(screen.getAllByText('Chapter 1')).toHaveLength(2); // Header and content
    expect(screen.getByText('100 words')).toBeInTheDocument();
    expect(screen.getByText('5 min read')).toBeInTheDocument();
  });
});