import { useLibraryStore } from '../library-store';
import { BookStatus } from '@/core/types/database';

// Mock the library service
jest.mock('../../services/library-service', () => ({
  libraryService: {
    getAllBooksWithMetadata: jest.fn().mockResolvedValue([]),
    getLibraryStats: jest.fn().mockResolvedValue({
      totalBooks: 0,
      favoriteBooks: 0,
      completedBooks: 0,
      inProgressBooks: 0,
      totalChapters: 0,
      averageProgress: 0,
    }),
    addBook: jest.fn().mockResolvedValue(1),
    updateBook: jest.fn().mockResolvedValue(undefined),
    deleteBook: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('useLibraryStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useLibraryStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useLibraryStore.getState();
      
      expect(state.books).toEqual([]);
      expect(state.filteredBooks).toEqual([]);
      expect(state.selectedBooks.size).toBe(0);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.currentPage).toBe(1);
      expect(state.viewSettings.viewMode).toBe('grid');
      expect(state.viewSettings.sortBy).toBe('dateAdded');
      expect(state.viewSettings.sortOrder).toBe('desc');
    });

    it('should have correct computed properties', () => {
      const state = useLibraryStore.getState();
      
      expect(state.hasBooks).toBe(false);
      expect(state.hasSelection).toBe(false);
      expect(state.selectedCount).toBe(0);
      expect(state.isFiltered).toBe(false);
    });
  });

  describe('View Settings', () => {
    it('should update view mode', () => {
      const { setViewMode } = useLibraryStore.getState();
      
      setViewMode('list');
      
      expect(useLibraryStore.getState().viewSettings.viewMode).toBe('list');
    });

    it('should update sort settings', () => {
      const { setSortBy } = useLibraryStore.getState();
      
      setSortBy('title', 'asc');
      
      const state = useLibraryStore.getState();
      expect(state.viewSettings.sortBy).toBe('title');
      expect(state.viewSettings.sortOrder).toBe('asc');
    });

    it('should toggle sort order when clicking same field', () => {
      const { setSortBy } = useLibraryStore.getState();
      
      // Set initial sort
      setSortBy('title', 'asc');
      expect(useLibraryStore.getState().viewSettings.sortOrder).toBe('asc');
      
      // Click same field again
      setSortBy('title');
      expect(useLibraryStore.getState().viewSettings.sortOrder).toBe('desc');
    });

    it('should update search query', () => {
      const { setSearchQuery } = useLibraryStore.getState();
      
      setSearchQuery('test query');
      
      expect(useLibraryStore.getState().viewSettings.searchQuery).toBe('test query');
      expect(useLibraryStore.getState().currentPage).toBe(1); // Should reset page
    });

    it('should update filters', () => {
      const { setFilter } = useLibraryStore.getState();
      
      setFilter({ status: BookStatus.READING, isFavorite: true });
      
      const state = useLibraryStore.getState();
      expect(state.viewSettings.filterBy.status).toBe(BookStatus.READING);
      expect(state.viewSettings.filterBy.isFavorite).toBe(true);
      expect(state.currentPage).toBe(1); // Should reset page
    });

    it('should clear filters', () => {
      const { setFilter, clearFilters, setSearchQuery } = useLibraryStore.getState();
      
      // Set some filters
      setFilter({ status: BookStatus.READING, isFavorite: true });
      setSearchQuery('test');
      
      // Clear filters
      clearFilters();
      
      const state = useLibraryStore.getState();
      expect(state.viewSettings.filterBy.status).toBe('all');
      expect(state.viewSettings.filterBy.isFavorite).toBeNull();
      expect(state.viewSettings.searchQuery).toBe('');
    });
  });

  describe('Book Selection', () => {
    it('should toggle book selection', () => {
      const { toggleBookSelection } = useLibraryStore.getState();
      
      toggleBookSelection(1);
      expect(useLibraryStore.getState().selectedBooks.has(1)).toBe(true);
      expect(useLibraryStore.getState().hasSelection).toBe(true);
      expect(useLibraryStore.getState().selectedCount).toBe(1);
      
      toggleBookSelection(1);
      expect(useLibraryStore.getState().selectedBooks.has(1)).toBe(false);
      expect(useLibraryStore.getState().hasSelection).toBe(false);
      expect(useLibraryStore.getState().selectedCount).toBe(0);
    });

    it('should clear selection', () => {
      const { toggleBookSelection, clearSelection } = useLibraryStore.getState();
      
      // Select some books
      toggleBookSelection(1);
      toggleBookSelection(2);
      expect(useLibraryStore.getState().selectedCount).toBe(2);
      
      // Clear selection
      clearSelection();
      expect(useLibraryStore.getState().selectedCount).toBe(0);
      expect(useLibraryStore.getState().hasSelection).toBe(false);
    });
  });

  describe('Pagination', () => {
    it('should update current page', () => {
      const { setPage } = useLibraryStore.getState();
      
      setPage(3);
      
      expect(useLibraryStore.getState().currentPage).toBe(3);
    });

    it('should not allow page less than 1', () => {
      const { setPage } = useLibraryStore.getState();
      
      setPage(-1);
      
      expect(useLibraryStore.getState().currentPage).toBe(1);
    });

    it('should update items per page and reset page', () => {
      const { setItemsPerPage, setPage } = useLibraryStore.getState();
      
      // Set page to something other than 1
      setPage(3);
      expect(useLibraryStore.getState().currentPage).toBe(3);
      
      // Change items per page should reset to page 1
      setItemsPerPage(12);
      
      const state = useLibraryStore.getState();
      expect(state.viewSettings.itemsPerPage).toBe(12);
      expect(state.currentPage).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should clear error', () => {
      const { clearError } = useLibraryStore.getState();
      
      // Set an error state
      useLibraryStore.setState({ error: 'Test error' });
      expect(useLibraryStore.getState().error).toBe('Test error');
      
      // Clear error
      clearError();
      expect(useLibraryStore.getState().error).toBeNull();
    });
  });

  describe('Filtering Logic', () => {
    it('should detect filtered state correctly', () => {
      const { setSearchQuery, setFilter, clearFilters } = useLibraryStore.getState();
      
      // Initially not filtered
      expect(useLibraryStore.getState().isFiltered).toBe(false);
      
      // Add search query
      setSearchQuery('test');
      expect(useLibraryStore.getState().isFiltered).toBe(true);
      
      // Clear and add status filter
      clearFilters();
      setFilter({ status: BookStatus.READING });
      expect(useLibraryStore.getState().isFiltered).toBe(true);
      
      // Clear and add favorite filter
      clearFilters();
      setFilter({ isFavorite: true });
      expect(useLibraryStore.getState().isFiltered).toBe(true);
      
      // Clear all
      clearFilters();
      expect(useLibraryStore.getState().isFiltered).toBe(false);
    });
  });
});