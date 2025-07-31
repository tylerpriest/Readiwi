import { Book, BookStatus, BookWithProgress } from '@/core/types/database';
import { BaseRepository } from './base-repository';
import { db } from './database-simple';

export class BookRepository extends BaseRepository<Book> {
  constructor() {
    super(db, 'books');
  }

  async findByStatus(status: BookStatus): Promise<Book[]> {
    try {
      return await this.db.books.where('status').equals(status).toArray();
    } catch (error) {
      throw new Error(`Failed to find books by status ${status}: ${error}`);
    }
  }

  async findFavorites(): Promise<Book[]> {
    try {
      return await this.db.books.where('isFavorite').equals(1).toArray();
    } catch (error) {
      throw new Error(`Failed to find favorite books: ${error}`);
    }
  }

  async search(query: string): Promise<Book[]> {
    try {
      const lowerQuery = query.toLowerCase();
      return await this.db.books
        .filter((book: Book) => 
          book.title.toLowerCase().includes(lowerQuery) ||
          book.author.toLowerCase().includes(lowerQuery) ||
          book.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
        )
        .toArray();
    } catch (error) {
      throw new Error(`Failed to search books with query "${query}": ${error}`);
    }
  }

  async findWithProgress(): Promise<BookWithProgress[]> {
    try {
      const books = await this.db.books.orderBy('updatedAt').reverse().toArray();
      
      // Get latest progress for each book
      const progressPromises = books.map(async (book: Book) => {
        if (book.id) {
          const latestProgress = await this.db.readingProgress
            .where('bookId')
            .equals(book.id)
            .reverse()
            .sortBy('timestamp');
          
          return {
            ...book,
            currentProgress: latestProgress[0],
          };
        }
        return { 
          ...book,
        };
      });

      return await Promise.all(progressPromises) as BookWithProgress[];
    } catch (error) {
      throw new Error(`Failed to find books with progress: ${error}`);
    }
  }

  async updateReadingProgress(bookId: number): Promise<void> {
    try {
      await this.update(bookId, {
        lastReadAt: new Date(),
      });
    } catch (error) {
      throw new Error(`Failed to update reading progress for book ${bookId}: ${error}`);
    }
  }

  async toggleFavorite(bookId: number): Promise<void> {
    try {
      const book = await this.findById(bookId);
      if (!book) {
        throw new Error(`Book ${bookId} not found`);
      }

      await this.update(bookId, {
        isFavorite: !book.isFavorite,
      });
    } catch (error) {
      throw new Error(`Failed to toggle favorite for book ${bookId}: ${error}`);
    }
  }

  async findBySourceUrl(sourceUrl: string): Promise<Book | undefined> {
    try {
      return await this.db.books.where('sourceUrl').equals(sourceUrl).first();
    } catch (error) {
      throw new Error(`Failed to find book by source URL: ${error}`);
    }
  }

  async findByTags(tags: string[]): Promise<Book[]> {
    try {
      return await this.db.books
        .filter((book: Book) => 
          tags.some((tag: string) => 
            book.tags.some((bookTag: string) => 
              bookTag.toLowerCase().includes(tag.toLowerCase())
            )
          )
        )
        .toArray();
    } catch (error) {
      throw new Error(`Failed to find books by tags: ${error}`);
    }
  }

  async findRecentlyRead(limit = 10): Promise<Book[]> {
    try {
      return await this.db.books
        .where('lastReadAt')
        .above(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
        .reverse()
        .sortBy('lastReadAt')
        .then((books: Book[]) => books.slice(0, limit));
    } catch (error) {
      throw new Error(`Failed to find recently read books: ${error}`);
    }
  }

  async getLibraryStats(): Promise<{
    totalBooks: number;
    favoriteBooks: number;
    completedBooks: number;
    inProgressBooks: number;
    totalChapters: number;
  }> {
    try {
      const [books, allProgress] = await Promise.all([
        this.findAll(),
        this.db.readingProgress.toArray(),
      ]);

      const progressByBook = new Map<number, number>();
      allProgress.forEach((progress: any) => {
        const current = progressByBook.get(progress.bookId) || 0;
        progressByBook.set(progress.bookId, Math.max(current, progress.percentage));
      });

      const completedBooks = books.filter((book: Book) => {
        const progress = progressByBook.get(book.id || 0) || 0;
        return progress >= 100;
      }).length;

      const inProgressBooks = books.filter((book: Book) => {
        const progress = progressByBook.get(book.id || 0) || 0;
        return progress > 0 && progress < 100;
      }).length;

      return {
        totalBooks: books.length,
        favoriteBooks: books.filter((book: Book) => book.isFavorite).length,
        completedBooks,
        inProgressBooks,
        totalChapters: books.reduce((sum: number, book: Book) => sum + book.totalChapters, 0),
      };
    } catch (error) {
      throw new Error(`Failed to get library stats: ${error}`);
    }
  }

  override async delete(id: number): Promise<void> {
    try {
      // @ts-ignore - Progressive development, Dexie transaction method
      await this.db.transaction('rw', [
        this.db.books,
        this.db.chapters,
        this.db.readingProgress,
        this.db.bookmarks,
      ], async () => {
        // Delete related data
        await this.db.chapters.where('bookId').equals(id).delete();
        await this.db.readingProgress.where('bookId').equals(id).delete();
        await this.db.bookmarks.where('bookId').equals(id).delete();
        
        // Delete the book
        await this.db.books.delete(id);
      });
    } catch (error) {
      throw new Error(`Failed to delete book ${id} and related data: ${error}`);
    }
  }
}