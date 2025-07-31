import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ReaderState, DEFAULT_READER_SETTINGS } from '../types/reader-types';
import { readerService } from '../services/reader-service';
import { libraryService } from '@/plugins/book-library/services/library-service';

const initialState = {
  currentBook: null,
  currentChapter: null,
  chapters: [],
  currentPosition: null,
  settings: DEFAULT_READER_SETTINGS,
  isMenuVisible: false,
  isSettingsVisible: false,
  isChapterListVisible: false,
  loading: false,
  error: null,
  hasNextChapter: false,
  hasPreviousChapter: false,
};

export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      loadBook: async (bookId) => {
        set({ loading: true, error: null });
        
        try {
          // Load book details
          const book = await libraryService.getBook(bookId);
          if (!book) {
            throw new Error('Book not found');
          }
          
          // Load chapters
          const chapters = await readerService.getBookChapters(bookId);
          if (chapters.length === 0) {
            // Create mock chapters for development
            await readerService.createMockChapters(bookId, 5);
            const newChapters = await readerService.getBookChapters(bookId);
            set({ chapters: newChapters });
          } else {
            set({ chapters });
          }
          
          // Load saved reading position
          const savedPosition = await readerService.getReadingPosition(bookId);
          
          const currentBook = {
            id: book.id!,
            title: book.title,
            author: book.author,
            totalChapters: chapters.length || 5,
          };
          
          set({
            currentBook,
            loading: false,
            error: null,
            currentPosition: savedPosition,
          });
          
          // Load the appropriate chapter
          if (savedPosition) {
            await get().loadChapter(savedPosition.chapterId);
          } else {
            // Load first chapter
            await get().navigateToChapter(1);
          }
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to load book',
          });
          throw error;
        }
      },
      
      loadChapter: async (chapterId) => {
        set({ loading: true, error: null });
        
        try {
          const chapter = await readerService.getChapter(chapterId);
          if (!chapter) {
            throw new Error('Chapter not found');
          }
          
          const { chapters } = get();
          const currentIndex = chapters.findIndex(c => c.id === chapterId);
          
          set({
            currentChapter: chapter,
            hasNextChapter: currentIndex < chapters.length - 1,
            hasPreviousChapter: currentIndex > 0,
            loading: false,
            error: null,
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to load chapter',
          });
          throw error;
        }
      },
      
      navigateToChapter: async (chapterNumber) => {
        const { currentBook } = get();
        if (!currentBook) return;
        
        try {
          const chapter = await readerService.getChapterByNumber(currentBook.id, chapterNumber);
          if (!chapter) {
            throw new Error(`Chapter ${chapterNumber} not found`);
          }
          
          await get().loadChapter(chapter.id);
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to navigate to chapter',
          });
          throw error;
        }
      },
      
      nextChapter: async () => {
        const { currentChapter, chapters } = get();
        if (!currentChapter) return;
        
        const currentIndex = chapters.findIndex(c => c.id === currentChapter.id);
        if (currentIndex < chapters.length - 1) {
          const nextChapter = chapters[currentIndex + 1];
          await get().loadChapter(nextChapter.id);
        }
      },
      
      previousChapter: async () => {
        const { currentChapter, chapters } = get();
        if (!currentChapter) return;
        
        const currentIndex = chapters.findIndex(c => c.id === currentChapter.id);
        if (currentIndex > 0) {
          const prevChapter = chapters[currentIndex - 1];
          await get().loadChapter(prevChapter.id);
        }
      },
      
      updatePosition: (position) => {
        set({ currentPosition: position });
      },
      
      savePosition: async () => {
        const { currentBook, currentPosition } = get();
        if (!currentBook || !currentPosition) return;
        
        try {
          await readerService.saveReadingPosition(currentBook.id, currentPosition);
        } catch (error) {
          console.warn('Failed to save reading position:', error);
          // Don't throw - position saving shouldn't block reading
        }
      },
      
      updateSettings: (newSettings) => {
        const { settings } = get();
        set({
          settings: { ...settings, ...newSettings },
        });
      },
      
      resetSettings: () => {
        set({ settings: DEFAULT_READER_SETTINGS });
      },
      
      toggleMenu: () => {
        const { isMenuVisible } = get();
        set({
          isMenuVisible: !isMenuVisible,
          isSettingsVisible: false,
          isChapterListVisible: false,
        });
      },
      
      toggleSettings: () => {
        const { isSettingsVisible } = get();
        set({
          isSettingsVisible: !isSettingsVisible,
          isMenuVisible: false,
          isChapterListVisible: false,
        });
      },
      
      toggleChapterList: () => {
        const { isChapterListVisible } = get();
        set({
          isChapterListVisible: !isChapterListVisible,
          isMenuVisible: false,
          isSettingsVisible: false,
        });
      },
      
      closeAllPanels: () => {
        set({
          isMenuVisible: false,
          isSettingsVisible: false,
          isChapterListVisible: false,
        });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      reset: () => {
        set({
          ...initialState,
          settings: get().settings, // Preserve settings
        });
      },
      
      // Selectors
      get currentChapterNumber(): number {
        const { currentChapter } = get();
        return currentChapter?.chapterNumber || 1;
      },
      
      get progressPercentage(): number {
        const { currentBook, currentChapter } = get();
        if (!currentBook || !currentChapter) return 0;
        
        return Math.round((currentChapter.chapterNumber / currentBook.totalChapters) * 100);
      },
      
      get estimatedTimeRemaining(): number {
        const { currentBook, currentChapter, chapters } = get();
        if (!currentBook || !currentChapter) return 0;
        
        const currentIndex = chapters.findIndex(c => c.id === currentChapter.id);
        if (currentIndex === -1) return 0;
        
        const remainingChapters = chapters.slice(currentIndex);
        return remainingChapters.reduce((total, chapter) => total + chapter.estimatedReadingTime, 0);
      },
    }),
    {
      name: 'readiwi-reader',
      partialize: (state) => ({
        settings: state.settings,
        currentPosition: state.currentPosition,
        currentBook: state.currentBook,
      }),
    }
  )
);