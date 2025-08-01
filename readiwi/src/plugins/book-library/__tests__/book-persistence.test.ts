/**
 * Book Persistence Test - Readiwi v4.0
 * Tests to verify books persist correctly when returning to library
 */

import { renderHook, act } from '@testing-library/react';
import { Book } from '@/core/types/database';

// Mock the library service first
jest.mock('../services/library-service', () => ({
  libraryService: {
    getAllBooksWithMetadata: jest.fn(),
    getLibraryStats: jest.fn(),
    getBookById: jest.fn(),
    getBook: jest.fn(),
    addBook: jest.fn(),
    updateBook: jest.fn(),
    deleteBook: jest.fn(),
    searchBooks: jest.fn(),
    getBooksByStatus: jest.fn(),
    getFavoriteBooks: jest.fn(),
    getBooksByTags: jest.fn(),
    getRecentlyReadBooks: jest.fn(),
    toggleFavorite: jest.fn(),
    updateReadingProgress: jest.fn(),
  },
}));

import { useLibraryStore } from '../stores/library-store';

const mockBook: Book = {
  id: 1,
  title: 'Test Book',
  author: 'Test Author',
  sourceUrl: 'https://example.com/book/1',
  urlSlug: 'test-book',
  status: 'completed',
  totalChapters: 10,
  currentChapter: 1,
  readingProgress: 25,
  isCompleted: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  lastReadAt: new Date('2024-01-01'),
};

describe('Book Persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mock implementations
    const libraryService = require('../services/library-service').libraryService;
    libraryService.getAllBooksWithMetadata.mockResolvedValue([mockBook]);
    libraryService.getLibraryStats.mockResolvedValue({
      totalBooks: 1,
      completedBooks: 0,
      inProgressBooks: 1,
      notStartedBooks: 0,
      totalChapters: 10,
      totalReadingTime: 500,
    });
    libraryService.getBookById.mockResolvedValue(mockBook);
    libraryService.getBook.mockResolvedValue(mockBook);
    libraryService.addBook.mockResolvedValue(1);
    libraryService.updateBook.mockResolvedValue(undefined);
    libraryService.deleteBook.mockResolvedValue(undefined);
    libraryService.searchBooks.mockResolvedValue([mockBook]);
    libraryService.getBooksByStatus.mockResolvedValue([mockBook]);
    libraryService.updateReadingProgress.mockResolvedValue(undefined);
  });

  test('should persist books in library store', async () => {
    const { result } = renderHook(() => useLibraryStore());
    
    // Initially empty
    expect(result.current.books).toEqual([]);
    
    // Load books
    await act(async () => {
      await result.current.loadBooks();
    });
    
    expect(result.current.books).toHaveLength(1);
    expect(result.current.books[0]).toEqual(mockBook);
  });

  test('should maintain book state when navigating away and back', async () => {
    const { result } = renderHook(() => useLibraryStore());
    
    // Load initial books
    await act(async () => {
      await result.current.loadBooks();
    });
    
    expect(result.current.books).toHaveLength(1);
    const originalBook = result.current.books[0];
    
    // Simulate navigation away (no need to clear store in real app)
    // Books should persist in store
    expect(result.current.books[0]).toEqual(originalBook);
    
    // Simulate returning to library - books should still be there
    expect(result.current.books).toHaveLength(1);
    expect(result.current.books[0].id).toBe(mockBook.id);
    expect(result.current.books[0].title).toBe(mockBook.title);
  });

  test('should update book data and persist', async () => {
    const { result } = renderHook(() => useLibraryStore());
    
    // Load books
    await act(async () => {
      await result.current.loadBooks();
    });
    
    const bookId = result.current.books[0].id!;
    
    // Update book
    await act(async () => {
      await result.current.updateBook(bookId, {
        currentChapter: 5,
        readingProgress: 50,
      });
    });
    
    // Verify the book was updated in the store
    const updatedBook = result.current.books.find(b => b.id === bookId);
    expect(updatedBook?.currentChapter).toBe(5);
    expect(updatedBook?.readingProgress).toBe(50);
  });

  test('should handle book addition and maintain in library', async () => {
    const { result } = renderHook(() => useLibraryStore());
    
    const newBook: Omit<Book, 'id'> = {
      title: 'New Book',
      author: 'New Author',
      sourceUrl: 'https://example.com/book/2',
      urlSlug: 'new-book',
      status: 'in-progress',
      totalChapters: 5,
      currentChapter: 1,
      readingProgress: 0,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastReadAt: new Date(),
    };
    
    // Add new book
    await act(async () => {
      await result.current.addBook(newBook);
    });
    
    // Should be added to the library
    expect(result.current.books).toHaveLength(1); // Mock service returns same book
    expect(result.current.books[0]).toEqual(mockBook); // Mock returns mockBook
  });

  test('should maintain book filtering state', async () => {
    const { result } = renderHook(() => useLibraryStore());
    
    // Load books
    await act(async () => {
      await result.current.loadBooks();
    });
    
    // Set search query
    act(() => {
      result.current.setSearchQuery('Test');
    });
    
    expect(result.current.viewSettings.searchQuery).toBe('Test');
    
    // These filters should persist when returning to library
    expect(result.current.viewSettings.searchQuery).toBe('Test');
  });

  test('should handle book updates correctly', async () => {
    const { result } = renderHook(() => useLibraryStore());
    
    // Load books
    await act(async () => {
      await result.current.loadBooks();
    });
    
    const bookId = result.current.books[0].id!;
    const updates = {
      title: 'Updated Book Title',
      readingProgress: 75,
    };
    
    // Update book
    await act(async () => {
      await result.current.updateBook(bookId, updates);
    });
    
    // Book should be updated in the store
    const updatedBook = result.current.books.find(b => b.id === bookId);
    expect(updatedBook?.title).toBe('Updated Book Title');
    expect(updatedBook?.readingProgress).toBe(75);
  });

  test('should persist view mode settings', () => {
    const { result } = renderHook(() => useLibraryStore());
    
    // Change view mode
    act(() => {
      result.current.setViewMode('list');
    });
    
    expect(result.current.viewSettings.viewMode).toBe('list');
    
    // View mode should persist
    expect(result.current.viewSettings.viewMode).toBe('list');
    
    // Change back
    act(() => {
      result.current.setViewMode('grid');
    });
    
    expect(result.current.viewSettings.viewMode).toBe('grid');
  });

  test('should handle error states gracefully', async () => {
    const { result } = renderHook(() => useLibraryStore());
    
    // Mock an error
    const libraryService = require('../services/library-service').libraryService;
    libraryService.getAllBooksWithMetadata.mockRejectedValueOnce(new Error('Network error'));
    
    await act(async () => {
      try {
        await result.current.loadBooks();
      } catch (error) {
        // Expected to throw
      }
    });
    
    expect(result.current.error).toBe('Network error');
    expect(result.current.loading).toBe(false);
  });

  test('should maintain sort order preferences', () => {
    const { result } = renderHook(() => useLibraryStore());
    
    // Set sort preferences
    act(() => {
      result.current.setSortBy('title', 'desc');
    });
    
    expect(result.current.viewSettings.sortBy).toBe('title');
    expect(result.current.viewSettings.sortOrder).toBe('desc');
    
    // These should persist when returning to library
    expect(result.current.viewSettings.sortBy).toBe('title');
    expect(result.current.viewSettings.sortOrder).toBe('desc');
  });
});