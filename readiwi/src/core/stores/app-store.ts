import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Theme management
  theme: 'light' | 'dark' | 'sepia';
  
  // UI state
  sidebarOpen: boolean;
  isLoading: boolean;
  error: string | null;
  
  // User preferences
  readingSettings: {
    fontFamily: 'serif' | 'sans' | 'mono';
    fontSize: number;
    lineHeight: number;
    textAlign: 'left' | 'center' | 'justify';
    maxWidth: 'narrow' | 'medium' | 'wide';
    margin: 'small' | 'medium' | 'large';
  };
  
  // Audio settings
  audioSettings: {
    enabled: boolean;
    voice: string;
    rate: number;
    volume: number;
    highlightCurrentSentence: boolean;
  };
  
  // Sync settings
  syncSettings: {
    enabled: boolean;
    autoSync: boolean;
    lastSyncAt?: Date;
  };
  
  // Last updated timestamp
  lastUpdated: number;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'sepia') => void;
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateReadingSettings: (settings: Partial<AppState['readingSettings']>) => void;
  updateAudioSettings: (settings: Partial<AppState['audioSettings']>) => void;
  updateSyncSettings: (settings: Partial<AppState['syncSettings']>) => void;
  reset: () => void;
  
  // Selectors
  get isDarkMode(): boolean;
  get isAudioEnabled(): boolean;
  get currentReadingWidth(): string;
}

const initialReadingSettings: AppState['readingSettings'] = {
  fontFamily: 'serif',
  fontSize: 16,
  lineHeight: 1.6,
  textAlign: 'left',
  maxWidth: 'medium',
  margin: 'medium',
};

const initialAudioSettings: AppState['audioSettings'] = {
  enabled: false,
  voice: '',
  rate: 1.0,
  volume: 1.0,
  highlightCurrentSentence: true,
};

const initialSyncSettings: AppState['syncSettings'] = {
  enabled: false,
  autoSync: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'light',
      sidebarOpen: false,
      isLoading: false,
      error: null,
      readingSettings: initialReadingSettings,
      audioSettings: initialAudioSettings,
      syncSettings: initialSyncSettings,
      lastUpdated: Date.now(),
      
      // Computed selectors
      get isDarkMode() {
        return get().theme === 'dark';
      },
      
      get isAudioEnabled() {
        return get().audioSettings.enabled;
      },
      
      get currentReadingWidth() {
        const width = get().readingSettings.maxWidth;
        switch (width) {
          case 'narrow':
            return '45rem';
          case 'medium':
            return '55rem';
          case 'wide':
            return '65rem';
          default:
            return '55rem';
        }
      },
      
      // Actions
      setTheme: (theme) => {
        set((state) => ({
          ...state,
          theme,
          lastUpdated: Date.now(),
        }));
        
        // Apply theme to document
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('light', 'dark', 'sepia');
          document.documentElement.classList.add(theme);
        }
      },
      
      setSidebarOpen: (sidebarOpen) => {
        set((state) => ({
          ...state,
          sidebarOpen,
          lastUpdated: Date.now(),
        }));
      },
      
      setLoading: (isLoading) => {
        set((state) => ({
          ...state,
          isLoading,
          lastUpdated: Date.now(),
        }));
      },
      
      setError: (error) => {
        set((state) => ({
          ...state,
          error,
          lastUpdated: Date.now(),
        }));
      },
      
      updateReadingSettings: (settings) => {
        set((state) => ({
          ...state,
          readingSettings: {
            ...state.readingSettings,
            ...settings,
          },
          lastUpdated: Date.now(),
        }));
      },
      
      updateAudioSettings: (settings) => {
        set((state) => ({
          ...state,
          audioSettings: {
            ...state.audioSettings,
            ...settings,
          },
          lastUpdated: Date.now(),
        }));
      },
      
      updateSyncSettings: (settings) => {
        set((state) => ({
          ...state,
          syncSettings: {
            ...state.syncSettings,
            ...settings,
          },
          lastUpdated: Date.now(),
        }));
      },
      
      reset: () => {
        set({
          theme: 'light',
          sidebarOpen: false,
          isLoading: false,
          error: null,
          readingSettings: initialReadingSettings,
          audioSettings: initialAudioSettings,
          syncSettings: initialSyncSettings,
          lastUpdated: Date.now(),
        });
      },
    }),
    {
      name: 'readiwi-app-store',
      partialize: (state) => ({
        theme: state.theme,
        readingSettings: state.readingSettings,
        audioSettings: state.audioSettings,
        syncSettings: state.syncSettings,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);