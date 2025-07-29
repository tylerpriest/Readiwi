import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BookStatus } from '@/core/types/database';
import { LibraryState, LibraryViewSettings, BookWithMetadata, LibraryStats } from '../types/library-types';
import { libraryService } from '../services/library-service';

const defaultViewSettings: LibraryViewSettings = {
  viewMode: 'grid',
  sortBy: 'dateAdded',
  sortOrder: 'desc',
  filterBy: {
    status: 'all',
    isFavorite: null,
    dateRange: { start: null, end: null },
    tags: [],
  },
  searchQuery: '',
  itemsPerPage: 24,
};

const initialState = {
  books: [],
  filteredBooks: [],
  selectedBooks: new Set<number>(),
  viewSettings: defaultViewSettings,
  stats: {
    totalBooks: 0,
    favoriteBooks: 0,
    completedBooks: 0,
    inProgressBooks: 0,
    totalChapters: 0,
    averageProgress: 0,
  },
  loading: false,
  error: null,
  lastUpdated: 0,
  currentPage: 1,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      loadBooks: async () => {
        set({ loading: true, error: null });
        
        try {
          const books = await libraryService.getAllBooksWithMetadata();
          const stats = await libraryService.getLibraryStats();
          
          set({
            books,
            stats,
            loading: false,
            lastUpdated: Date.now(),
            error: null,
          });
          
          // Apply current filters and pagination
          get().applyFiltersAndPagination();
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to load books',
          });
          throw error;
        }
      },
      
      refreshLibrary: async () => {
        await get().loadBooks();
      },
      
      addBook: async (bookData) => {
        set({ loading: true, error: null });
        
        try {
          const bookId = await libraryService.addBook(bookData);
          
          // Reload library to get updated data
          await get().loadBooks();
          
          return bookId;
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to add book',
          });
          throw error;
        }
      },
      
      updateBook: async (id, updates) => {
        set({ loading: true, error: null });
        
        try {
          await libraryService.updateBook(id, updates);
          
          // Update local state
          const { books } = get();
          const updatedBooks = books.map(book => 
            book.id === id ? { ...book, ...updates, updatedAt: new Date() } : book
          );
          
          set({
            books: updatedBooks,
            loading: false,
            lastUpdated: Date.now(),
          });
          
          // Reapply filters
          get().applyFiltersAndPagination();
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to update book',
          });
          throw error;
        }
      },
      
      deleteBook: async (id) => {
        set({ loading: true, error: null });
        
        try {
          await libraryService.deleteBook(id);
          
          // Remove from local state
          const { books, selectedBooks } = get();
          const updatedBooks = books.filter(book => book.id !== id);
          const updatedSelection = new Set(selectedBooks);
          updatedSelection.delete(id);
          
          set({
            books: updatedBooks,
            selectedBooks: updatedSelection,
            loading: false,
            lastUpdated: Date.now(),
          });
          
          // Reapply filters and update stats
          get().applyFiltersAndPagination();
          get().updateStats();
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to delete book',
          });
          throw error;
        }
      },
      
      deleteSelectedBooks: async () => {
        const { selectedBooks } = get();
        if (selectedBooks.size === 0) return;
        
        set({ loading: true, error: null });
        
        try {
          await Promise.all(
            Array.from(selectedBooks).map(id => libraryService.deleteBook(id))
          );
          
          // Remove from local state
          const { books } = get();
          const updatedBooks = books.filter(book => !selectedBooks.has(book.id || 0));
          
          set({
            books: updatedBooks,
            selectedBooks: new Set(),
            loading: false,
            lastUpdated: Date.now(),
          });
          
          // Reapply filters and update stats
          get().applyFiltersAndPagination();
          get().updateStats();
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to delete selected books',
          });
          throw error;
        }
      },
      
      toggleBookSelection: (id) => {
        const { selectedBooks } = get();
        const newSelection = new Set(selectedBooks);
        
        if (newSelection.has(id)) {
          newSelection.delete(id);
        } else {
          newSelection.add(id);
        }
        
        set({ selectedBooks: newSelection });
      },
      
      selectAllBooks: () => {
        const { filteredBooks } = get();
        const allIds = new Set(filteredBooks.map(book => book.id || 0).filter(id => id > 0));
        set({ selectedBooks: allIds });
      },
      
      clearSelection: () => {
        set({ selectedBooks: new Set() });
      },
      
      setViewMode: (mode) => {
        const { viewSettings } = get();
        set({
          viewSettings: { ...viewSettings, viewMode: mode },
        });
        get().applyFiltersAndPagination();
      },
      
      setSortBy: (field, order) => {
        const { viewSettings } = get();
        const newOrder = order || (viewSettings.sortBy === field && viewSettings.sortOrder === 'asc' ? 'desc' : 'asc');
        
        set({
          viewSettings: {
            ...viewSettings,
            sortBy: field,
            sortOrder: newOrder,
          },
        });
        get().applyFiltersAndPagination();
      },
      
      setFilter: (filter) => {
        const { viewSettings } = get();
        set({
          viewSettings: {
            ...viewSettings,
            filterBy: { ...viewSettings.filterBy, ...filter },
          },
          currentPage: 1, // Reset to first page when filtering
        });
        get().applyFiltersAndPagination();
      },
      
      setSearchQuery: (query) => {
        const { viewSettings } = get();
        set({
          viewSettings: { ...viewSettings, searchQuery: query },
          currentPage: 1, // Reset to first page when searching
        });
        
        // Debounce the filter application for search
        get().debounceApplyFilters();
      },
      
      clearFilters: () => {
        set({
          viewSettings: {
            ...get().viewSettings,
            filterBy: defaultViewSettings.filterBy,
            searchQuery: '',
          },
          currentPage: 1,
        });
        get().applyFiltersAndPagination();
      },
      
      setPage: (page) => {
        set({ currentPage: Math.max(1, page) });
        get().applyFiltersAndPagination();
      },
      
      setItemsPerPage: (items) => {
        const { viewSettings } = get();
        set({
          viewSettings: { ...viewSettings, itemsPerPage: items },
          currentPage: 1,
        });
        get().applyFiltersAndPagination();
      },
      
      toggleFavorite: async (id) => {
        const { books } = get();
        const book = books.find(b => b.id === id);
        if (!book) return;
        
        try {
          await get().updateBook(id, { isFavorite: !book.isFavorite });
        } catch (error) {
          console.error('Failed to toggle favorite:', error);
          throw error;
        }
      },
      
      updateBookStatus: async (id, status) => {
        try {
          await get().updateBook(id, { status });
        } catch (error) {
          console.error('Failed to update book status:', error);
          throw error;
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      reset: () => {
        set({
          ...initialState,
          selectedBooks: new Set(),
          lastUpdated: Date.now(),
        });
      },
      
      // Internal helper methods
      applyFiltersAndPagination: () => {
        const { books, viewSettings, currentPage } = get();
        
        // Apply filters
        const filtered = books.filter(book => {
          const { filterBy, searchQuery } = viewSettings;
          
          // Search filter
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesSearch = 
              book.title.toLowerCase().includes(query) ||
              book.author.toLowerCase().includes(query) ||
              book.tags.some(tag => tag.toLowerCase().includes(query));
            
            if (!matchesSearch) return false;
          }
          
          // Status filter
          if (filterBy.status !== 'all' && book.status !== filterBy.status) {
            return false;
          }
          
          // Favorite filter
          if (filterBy.isFavorite !== null && book.isFavorite !== filterBy.isFavorite) {
            return false;
          }
          
          // Date range filter
          if (filterBy.dateRange.start && book.createdAt < filterBy.dateRange.start) {
            return false;
          }
          if (filterBy.dateRange.end && book.createdAt > filterBy.dateRange.end) {
            return false;
          }
          
          // Tags filter
          if (filterBy.tags.length > 0) {
            const hasMatchingTag = filterBy.tags.some(tag => 
              book.tags.some(bookTag => bookTag.toLowerCase().includes(tag.toLowerCase()))
            );
            if (!hasMatchingTag) return false;
          }
          
          return true;
        });
        
        // Apply sorting
        filtered.sort((a, b) => {
          const { sortBy, sortOrder } = viewSettings;
          let comparison = 0;
          
          switch (sortBy) {
            case 'title':
              comparison = a.title.localeCompare(b.title);
              break;
            case 'author':
              comparison = a.author.localeCompare(b.author);
              break;
            case 'dateAdded':
              comparison = a.createdAt.getTime() - b.createdAt.getTime();
              break;
            case 'lastRead':
              const aLastRead = a.lastReadAt?.getTime() || 0;
              const bLastRead = b.lastReadAt?.getTime() || 0;
              comparison = aLastRead - bLastRead;
              break;
            case 'progress':
              const aProgress = a.currentProgress?.percentage || 0;
              const bProgress = b.currentProgress?.percentage || 0;
              comparison = aProgress - bProgress;
              break;
            default:
              comparison = 0;
          }
          
          return sortOrder === 'desc' ? -comparison : comparison;
        });
        
        // Apply pagination
        const { itemsPerPage } = viewSettings;
        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        const validPage = Math.min(currentPage, Math.max(1, totalPages));
        const startIndex = (validPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedBooks = filtered.slice(startIndex, endIndex);
        
        set({
          filteredBooks: paginatedBooks,
          currentPage: validPage,
          totalPages,
          hasNextPage: validPage < totalPages,
          hasPreviousPage: validPage > 1,
        });
      },
      
      updateStats: () => {
        const { books } = get();
        const stats: LibraryStats = {
          totalBooks: books.length,
          favoriteBooks: books.filter(book => book.isFavorite).length,
          completedBooks: books.filter(book => book.status === BookStatus.COMPLETED).length,
          inProgressBooks: books.filter(book => book.status === BookStatus.READING).length,
          totalChapters: books.reduce((sum, book) => sum + book.totalChapters, 0),
          averageProgress: books.length > 0 
            ? books.reduce((sum, book) => sum + (book.currentProgress?.percentage || 0), 0) / books.length
            : 0,
        };
        
        set({ stats });
      },
      
      // Debounced filter application for search
      debounceApplyFilters: (() => {
        let timeoutId: NodeJS.Timeout;
        return () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            get().applyFiltersAndPagination();
          }, 300);
        };
      })(),
      
      // Selectors
      get hasBooks(): boolean {
        return get().books.length > 0;
      },
      
      get hasSelection(): boolean {
        return get().selectedBooks.size > 0;
      },
      
      get selectedCount(): number {
        return get().selectedBooks.size;
      },
      
      get isFiltered(): boolean {
        const { viewSettings } = get();
        const { filterBy, searchQuery } = viewSettings;
        
        return (
          searchQuery !== '' ||
          filterBy.status !== 'all' ||
          filterBy.isFavorite !== null ||
          filterBy.dateRange.start !== null ||
          filterBy.dateRange.end !== null ||
          filterBy.tags.length > 0
        );
      },
    }),
    {
      name: 'readiwi-library',
      partialize: (state) => ({
        viewSettings: state.viewSettings,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);