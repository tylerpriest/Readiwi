import { Plugin, ComponentRegistry, RouteRegistry, StoreRegistry, ServiceRegistry } from '@/core/types/plugin';
import { libraryService } from './services/library-service';
import { useLibraryStore } from './stores/library-store';
import BookCard from './components/BookCard';
import LibraryView from './components/LibraryView';

export class BookLibraryPlugin implements Plugin {
  readonly id = 'book-library';
  readonly name = 'Book Library Management';
  readonly version = '1.0.0';
  readonly dependencies: string[] = ['settings-system']; // Depends on settings for view preferences
  readonly enabled = true;

  async initialize(): Promise<void> {
    console.log(`[${this.name}] Initializing book library plugin...`);
    
    // Initialize library state
    const { loadBooks } = useLibraryStore.getState();
    
    try {
      // Load books on initialization
      await loadBooks();
    } catch (error) {
      console.warn(`[${this.name}] Failed to load books during initialization:`, error);
      // Don't throw - allow app to continue with empty library
    }
  }

  async activate(): Promise<void> {
    console.log(`[${this.name}] Activating book library plugin...`);
    
    // Set up periodic refresh (every 5 minutes)
    this.startPeriodicRefresh();
  }

  async deactivate(): Promise<void> {
    console.log(`[${this.name}] Deactivating book library plugin...`);
    
    // Clean up periodic refresh
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  async cleanup(): Promise<void> {
    console.log(`[${this.name}] Cleaning up book library plugin...`);
    
    // Reset library state
    const { reset } = useLibraryStore.getState();
    reset();
  }

  registerComponents(): ComponentRegistry {
    return {
      'library.BookCard': BookCard,
      'library.LibraryView': LibraryView,
    };
  }

  registerRoutes(): RouteRegistry {
    return {
      '/': {
        component: 'library.LibraryView',
        title: 'Library - Readiwi',
        description: 'Your personal book library',
        requiresAuth: false,
      },
      '/library': {
        component: 'library.LibraryView',
        title: 'Library - Readiwi',
        description: 'Your personal book library',
        requiresAuth: false,
      },
    };
  }

  registerStores(): StoreRegistry {
    return {
      library: useLibraryStore,
    };
  }

  registerServices(): ServiceRegistry {
    return {
      libraryService,
    };
  }

  // Private periodic refresh
  private refreshInterval: NodeJS.Timeout | null = null;

  private startPeriodicRefresh(): void {
    // Refresh library every 5 minutes to catch external changes
    this.refreshInterval = setInterval(() => {
      const { refreshLibrary, loading } = useLibraryStore.getState();
      
      // Don't refresh if already loading
      if (!loading) {
        refreshLibrary().catch(error => {
          console.warn(`[${this.name}] Periodic refresh failed:`, error);
        });
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
}

export const bookLibraryPlugin = new BookLibraryPlugin();