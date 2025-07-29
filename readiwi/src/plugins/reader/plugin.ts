import { Plugin, ComponentRegistry, RouteRegistry, StoreRegistry, ServiceRegistry } from '@/core/types/plugin';
import { readerService } from './services/reader-service';
import { useReaderStore } from './stores/reader-store';
import ReaderView from './components/ReaderView';
import ChapterList from './components/ChapterList';

export class ReaderPlugin implements Plugin {
  readonly id = 'reader';
  readonly name = 'Basic Reader Interface';
  readonly version = '1.0.0';
  readonly dependencies: string[] = ['book-library']; // Depends on library for book data
  readonly enabled = true;

  async initialize(): Promise<void> {
    console.log(`[${this.name}] Initializing reader plugin...`);
    
    // Initialize reader state if needed
    const { reset } = useReaderStore.getState();
    
    // Clean state on initialization
    reset();
  }

  async activate(): Promise<void> {
    console.log(`[${this.name}] Activating reader plugin...`);
    
    // Set up auto-save for reading positions
    this.startAutoSave();
  }

  async deactivate(): Promise<void> {
    console.log(`[${this.name}] Deactivating reader plugin...`);
    
    // Clean up auto-save
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  async cleanup(): Promise<void> {
    console.log(`[${this.name}] Cleaning up reader plugin...`);
    
    // Reset reader state
    const { reset } = useReaderStore.getState();
    reset();
  }

  registerComponents(): ComponentRegistry {
    return {
      'reader.ReaderView': ReaderView,
      'reader.ChapterList': ChapterList,
    };
  }

  registerRoutes(): RouteRegistry {
    return {
      '/read/[bookId]': {
        component: 'reader.ReaderView',
        title: 'Reading - Readiwi',
        description: 'Reading interface for books',
        requiresAuth: false,
      },
    };
  }

  registerStores(): StoreRegistry {
    return {
      reader: useReaderStore,
    };
  }

  registerServices(): ServiceRegistry {
    return {
      readerService,
    };
  }

  // Private auto-save functionality
  private autoSaveInterval: NodeJS.Timeout | null = null;

  private startAutoSave(): void {
    // Auto-save reading position every 30 seconds
    this.autoSaveInterval = setInterval(() => {
      const { savePosition, currentBook, currentPosition } = useReaderStore.getState();
      
      // Only save if we have an active reading session
      if (currentBook && currentPosition) {
        savePosition().catch(error => {
          console.warn(`[${this.name}] Auto-save failed:`, error);
        });
      }
    }, 30 * 1000); // 30 seconds
  }
}

export const readerPlugin = new ReaderPlugin();