import { Book, BookStatus } from '@/core/types/database';

export interface LibraryViewSettings {
  viewMode: 'grid' | 'list' | 'compact';
  sortBy: 'title' | 'author' | 'dateAdded' | 'lastRead' | 'progress';
  sortOrder: 'asc' | 'desc';
  filterBy: {
    status: BookStatus | 'all';
    isFavorite: boolean | null;
    dateRange: {
      start: Date | null;
      end: Date | null;
    };
    tags: string[];
  };
  searchQuery: string;
  itemsPerPage: number;
}

export interface LibraryStats {
  totalBooks: number;
  favoriteBooks: number;
  completedBooks: number;
  inProgressBooks: number;
  totalChapters: number;
  averageProgress: number;
}

export interface BookWithMetadata extends Book {
  currentProgress?: {
    chapterId: number;
    position: number;
    percentage: number;
    timestamp: Date;
  };
  chaptersRead: number;
  estimatedReadingTime: number;
  addedToLibrary: Date;
}

export interface LibraryState {
  // Data fields
  books: BookWithMetadata[];
  filteredBooks: BookWithMetadata[];
  selectedBooks: Set<number>;
  viewSettings: LibraryViewSettings;
  stats: LibraryStats;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  // Actions
  loadBooks: () => Promise<void>;
  refreshLibrary: () => Promise<void>;
  addBook: (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => Promise<number>;
  updateBook: (id: number, updates: Partial<Book>) => Promise<void>;
  deleteBook: (id: number) => Promise<void>;
  deleteSelectedBooks: () => Promise<void>;
  toggleBookSelection: (id: number) => void;
  selectAllBooks: () => void;
  clearSelection: () => void;
  
  // View and filtering
  setViewMode: (mode: LibraryViewSettings['viewMode']) => void;
  setSortBy: (field: LibraryViewSettings['sortBy'], order?: LibraryViewSettings['sortOrder']) => void;
  setFilter: (filter: Partial<LibraryViewSettings['filterBy']>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // Pagination
  setPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  
  // Favorites and status
  toggleFavorite: (id: number) => Promise<void>;
  updateBookStatus: (id: number, status: BookStatus) => Promise<void>;
  
  // Utility
  clearError: () => void;
  reset: () => void;
  
  // Selectors
  get hasBooks(): boolean;
  get hasSelection(): boolean;
  get selectedCount(): number;
  get isFiltered(): boolean;
}