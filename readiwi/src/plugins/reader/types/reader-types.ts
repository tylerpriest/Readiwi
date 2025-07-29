export interface Chapter {
  id: number;
  bookId: number;
  title: string;
  content: string;
  chapterNumber: number;
  wordCount: number;
  estimatedReadingTime: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingPosition {
  chapterId: number;
  characterOffset: number;
  scrollPosition: number;
  timestamp: Date;
}

export interface ReaderSettings {
  fontSize: number; // 12-24px
  fontFamily: 'serif' | 'sans-serif' | 'monospace';
  lineHeight: number; // 1.2-2.0
  theme: 'light' | 'dark' | 'sepia';
  maxWidth: number; // 600-1200px
  textAlign: 'left' | 'justify';
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface ReaderState {
  // Current reading data
  currentBook: {
    id: number;
    title: string;
    author: string;
    totalChapters: number;
  } | null;
  currentChapter: Chapter | null;
  chapters: Chapter[];
  currentPosition: ReadingPosition | null;
  
  // UI state
  settings: ReaderSettings;
  isMenuVisible: boolean;
  isSettingsVisible: boolean;
  isChapterListVisible: boolean;
  loading: boolean;
  error: string | null;
  
  // Navigation state
  hasNextChapter: boolean;
  hasPreviousChapter: boolean;
  
  // Actions
  loadBook: (bookId: number) => Promise<void>;
  loadChapter: (chapterId: number) => Promise<void>;
  navigateToChapter: (chapterNumber: number) => Promise<void>;
  nextChapter: () => Promise<void>;
  previousChapter: () => Promise<void>;
  updatePosition: (position: ReadingPosition) => void;
  savePosition: () => Promise<void>;
  
  // Settings actions
  updateSettings: (settings: Partial<ReaderSettings>) => void;
  resetSettings: () => void;
  
  // UI actions
  toggleMenu: () => void;
  toggleSettings: () => void;
  toggleChapterList: () => void;
  closeAllPanels: () => void;
  
  // Cleanup
  clearError: () => void;
  reset: () => void;
  
  // Selectors
  get currentChapterNumber(): number;
  get progressPercentage(): number;
  get estimatedTimeRemaining(): number;
}

export interface ChapterNavigation {
  currentChapter: number;
  totalChapters: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ReaderTheme {
  name: string;
  background: string;
  text: string;
  accent: string;
  muted: string;
}

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: 16,
  fontFamily: 'serif',
  lineHeight: 1.6,
  theme: 'light',
  maxWidth: 800,
  textAlign: 'left',
  margins: {
    top: 24,
    bottom: 24,
    left: 24,
    right: 24,
  },
};

export const READER_THEMES: Record<string, ReaderTheme> = {
  light: {
    name: 'Light',
    background: '#ffffff',
    text: '#1a1a1a',
    accent: '#0066cc',
    muted: '#666666',
  },
  dark: {
    name: 'Dark',
    background: '#1a1a1a',
    text: '#e5e5e5',
    accent: '#4da6ff',
    muted: '#999999',
  },
  sepia: {
    name: 'Sepia',
    background: '#f4f1ea',
    text: '#5c4b37',
    accent: '#8b4513',
    muted: '#8b7765',
  },
};