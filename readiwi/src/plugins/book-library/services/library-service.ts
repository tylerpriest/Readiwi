import { Book, BookStatus } from '@/core/types/database';
import { BookRepository } from '@/core/services/book-repository';
import { db } from '@/core/services/database-simple';
import { BookWithMetadata, LibraryStats } from '../types/library-types';

class LibraryService {
  private bookRepository: BookRepository;
  
  constructor() {
    this.bookRepository = new BookRepository();
  }
  
  async getAllBooksWithMetadata(): Promise<BookWithMetadata[]> {
    try {
      const books = await this.bookRepository.findAll();
      
      // Enrich books with metadata
      const booksWithMetadata = await Promise.all(
        books.map(async (book) => await this.enrichBookWithMetadata(book))
      );
      
      return booksWithMetadata;
    } catch (error) {
      throw new Error(`Failed to load books: ${error}`);
    }
  }
  
  async getBookById(id: number): Promise<BookWithMetadata | null> {
    try {
      const book = await this.bookRepository.findById(id);
      if (!book) return null;
      
      return await this.enrichBookWithMetadata(book);
    } catch (error) {
      throw new Error(`Failed to get book ${id}: ${error}`);
    }
  }
  
  async addBook(bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    try {
      // Check if book already exists by source URL
      if (bookData.sourceUrl) {
        const existing = await this.bookRepository.findBySourceUrl(bookData.sourceUrl);
        if (existing) {
          throw new Error('Book already exists in library');
        }
      }
      
      // Add timestamps and default values
      const bookToCreate = {
        ...bookData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: bookData.status || BookStatus.READY,
        isFavorite: bookData.isFavorite || false,
        tags: bookData.tags || [],
        totalChapters: bookData.totalChapters || 0,
      };
      
      return await this.bookRepository.create(bookToCreate);
    } catch (error) {
      throw new Error(`Failed to add book: ${error}`);
    }
  }
  
  async updateBook(id: number, updates: Partial<Book>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      
      await this.bookRepository.update(id, updateData);
    } catch (error) {
      throw new Error(`Failed to update book ${id}: ${error}`);
    }
  }
  
  async deleteBook(id: number): Promise<void> {
    try {
      // This will also delete related chapters, progress, and bookmarks
      await this.bookRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete book ${id}: ${error}`);
    }
  }
  
  async getLibraryStats(): Promise<LibraryStats> {
    try {
      return await this.bookRepository.getLibraryStats();
    } catch (error) {
      throw new Error(`Failed to get library stats: ${error}`);
    }
  }
  
  async searchBooks(query: string): Promise<BookWithMetadata[]> {
    try {
      const books = await this.bookRepository.search(query);
      
      const booksWithMetadata = await Promise.all(
        books.map(async (book) => await this.enrichBookWithMetadata(book))
      );
      
      return booksWithMetadata;
    } catch (error) {
      throw new Error(`Failed to search books: ${error}`);
    }
  }
  
  async getBooksByStatus(status: BookStatus): Promise<BookWithMetadata[]> {
    try {
      const books = await this.bookRepository.findByStatus(status);
      
      const booksWithMetadata = await Promise.all(
        books.map(async (book) => await this.enrichBookWithMetadata(book))
      );
      
      return booksWithMetadata;
    } catch (error) {
      throw new Error(`Failed to get books by status ${status}: ${error}`);
    }
  }
  
  async getFavoriteBooks(): Promise<BookWithMetadata[]> {
    try {
      const books = await this.bookRepository.findFavorites();
      
      const booksWithMetadata = await Promise.all(
        books.map(async (book) => await this.enrichBookWithMetadata(book))
      );
      
      return booksWithMetadata;
    } catch (error) {
      throw new Error(`Failed to get favorite books: ${error}`);
    }
  }
  
  async getBooksByTags(tags: string[]): Promise<BookWithMetadata[]> {
    try {
      const books = await this.bookRepository.findByTags(tags);
      
      const booksWithMetadata = await Promise.all(
        books.map(async (book) => await this.enrichBookWithMetadata(book))
      );
      
      return booksWithMetadata;
    } catch (error) {
      throw new Error(`Failed to get books by tags: ${error}`);
    }
  }
  
  async getRecentlyReadBooks(limit = 10): Promise<BookWithMetadata[]> {
    try {
      const books = await this.bookRepository.findRecentlyRead(limit);
      
      const booksWithMetadata = await Promise.all(
        books.map(async (book) => await this.enrichBookWithMetadata(book))
      );
      
      return booksWithMetadata;
    } catch (error) {
      throw new Error(`Failed to get recently read books: ${error}`);
    }
  }
  
  async toggleFavorite(id: number): Promise<void> {
    try {
      await this.bookRepository.toggleFavorite(id);
    } catch (error) {
      throw new Error(`Failed to toggle favorite for book ${id}: ${error}`);
    }
  }
  
  async updateReadingProgress(bookId: number): Promise<void> {
    try {
      await this.bookRepository.updateReadingProgress(bookId);
    } catch (error) {
      throw new Error(`Failed to update reading progress for book ${bookId}: ${error}`);
    }
  }
  
  // Private helper methods
  private async enrichBookWithMetadata(book: Book): Promise<BookWithMetadata> {
    try {
      // Get current reading progress
      let currentProgress;
      if (book.id) {
        const latestProgress = await db.readingProgress
          .where('bookId')
          .equals(book.id)
          .reverse()
          .sortBy('timestamp');
        
        currentProgress = latestProgress[0] ? {
          chapterId: latestProgress[0].chapterId,
          position: latestProgress[0].scrollPosition, // Use scrollPosition as the main position
          percentage: latestProgress[0].percentage,
          timestamp: new Date(latestProgress[0].timestamp),
        } : undefined;
      }
      
      // Calculate chapters read
      const chaptersRead = currentProgress ? 
        await this.getChaptersReadCount(book.id!, currentProgress.chapterId) : 0;
      
      // Estimate reading time (assuming 250 words per minute average reading speed)
      const estimatedReadingTime = this.calculateEstimatedReadingTime(book.wordCount || 0);
      
      const result: BookWithMetadata = {
        ...book,
        chaptersRead,
        estimatedReadingTime,
        addedToLibrary: book.createdAt,
      };
      
      if (currentProgress) {
        result.currentProgress = currentProgress;
      }
      
      return result;
    } catch (error) {
      console.error(`Failed to enrich book metadata for book ${book.id}:`, error);
      
      // Return book with minimal metadata if enrichment fails
      const fallbackResult: BookWithMetadata = {
        ...book,
        chaptersRead: 0,
        estimatedReadingTime: 0,
        addedToLibrary: book.createdAt,
      };
      
      return fallbackResult;
    }
  }
  
  private async getChaptersReadCount(bookId: number, currentChapterId: number): Promise<number> {
    try {
      // Count chapters with index less than or equal to current chapter
      const chapters = await db.chapters
        .where('bookId')
        .equals(bookId)
        .and((chapter: any) => chapter.index <= currentChapterId)
        .count();
      
      return chapters;
    } catch (error) {
      console.error(`Failed to get chapters read count for book ${bookId}:`, error);
      return 0;
    }
  }
  
  private calculateEstimatedReadingTime(wordCount: number): number {
    // Average reading speed is about 250 words per minute
    const wordsPerMinute = 250;
    return Math.ceil(wordCount / wordsPerMinute);
  }
}

export const libraryService = new LibraryService();