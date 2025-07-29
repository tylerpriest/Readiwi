// Book Library plugin exports
export { bookLibraryPlugin } from './plugin';
export { useLibraryStore } from './stores/library-store';
export { libraryService } from './services/library-service';

// Components
export { default as BookCard } from './components/BookCard';

// Types
export type {
  LibraryViewSettings,
  LibraryStats,
  BookWithMetadata,
  LibraryState,
} from './types/library-types';