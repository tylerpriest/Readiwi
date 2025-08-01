// @ts-ignore - Progressive development, Dexie Table import
import Dexie, { Table } from 'dexie';
import {
  Book,
  Chapter,
  ReadingProgress,
  UserSetting,
  Bookmark,
  SyncMetadata,
  ImportJob,
  ErrorLog,
  ParserCacheEntry,
  ImageCacheEntry,
} from '@/core/types/database';

export const DATABASE_VERSION = 7;
export const DATABASE_NAME = 'ReadiwiDatabase';

export const STORAGE_LIMITS = {
  maxBooks: 1000,
  maxChaptersPerBook: 2000,
  maxBookSizeMB: 50,
  maxTotalStorageGB: 2,
  warningThresholdPercent: 80,
  cleanupThresholdPercent: 90,
} as const;

export class ReadiwiDatabase extends Dexie {
  // Core content tables
  // @ts-ignore - Progressive development, Dexie Table types
  books!: Table<Book>;
  chapters!: Table<Chapter>;
  
  // User data tables
  readingProgress!: Table<ReadingProgress>;
  bookmarks!: Table<Bookmark>;
  userSettings!: Table<UserSetting>;
  
  // System tables
  syncMetadata!: Table<SyncMetadata>;
  importJobs!: Table<ImportJob>;
  errorLogs!: Table<ErrorLog>;
  
  // Cache tables
  parserCache!: Table<ParserCacheEntry>;
  imageCache!: Table<ImageCacheEntry>;

  constructor() {
    super(DATABASE_NAME);
    
    // Version 1: Initial schema
    // @ts-ignore - Progressive development, Dexie version method
    this.version(1).stores({
      books: '++id, title, author, sourceUrl, status, createdAt, updatedAt, lastReadAt',
      chapters: '++id, bookId, index, title, content, chapterNumber, wordCount, estimatedReadingTime, createdAt, updatedAt, [bookId+index]',
      readingProgress: '++id, bookId, chapterId, textPosition, scrollPosition, timestamp, createdAt, updatedAt',
      userSettings: '++id, key, value, updatedAt',
    });
    
    // Version 2: Add bookmarks and sync metadata
    // @ts-ignore - Progressive development, Dexie version method
    this.version(2).stores({
      bookmarks: '++id, bookId, chapterId, position, title, note, createdAt',
      syncMetadata: '++id, entityType, entityId, lastSyncAt, syncStatus, version',
    });
    
    // Version 3: Add import jobs and error logging
    // @ts-ignore - Progressive development, Dexie version method
    this.version(3).stores({
      importJobs: '++id, url, status, progress, bookId, error, createdAt, updatedAt',
      errorLogs: '++id, level, message, context, timestamp, userId',
    });
    
    // Version 4: Add caching tables
    // @ts-ignore - Progressive development, Dexie version method
    this.version(4).stores({
      parserCache: '++id, url, data, expiresAt, createdAt',
      imageCache: '++id, url, blob, size, expiresAt, createdAt',
    });
    
    // Version 5: Add urlSlug field to books for better duplicate detection
    // @ts-ignore - Progressive development, Dexie version method
    this.version(5).stores({
      books: '++id, title, author, sourceUrl, urlSlug, status, createdAt, updatedAt, lastReadAt',
    });
    
    // Version 6: Fix chapters table with proper compound index for bookId+index queries
    // @ts-ignore - Progressive development, Dexie version method
    this.version(6).stores({
      chapters: '++id, bookId, index, title, content, chapterNumber, wordCount, estimatedReadingTime, createdAt, updatedAt, [bookId+index]',
    });
  }

  async getStorageInfo(): Promise<{
    usage: number;
    quota: number;
    usagePercentage: number;
    isNearLimit: boolean;
  }> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const usagePercentage = quota > 0 ? (usage / quota) * 100 : 0;
        
        return {
          usage,
          quota,
          usagePercentage,
          isNearLimit: usagePercentage > STORAGE_LIMITS.warningThresholdPercent,
        };
      }
    } catch (error) {
      console.error('Failed to get storage estimate:', error);
    }

    return {
      usage: 0,
      quota: 0,
      usagePercentage: 0,
      isNearLimit: false,
    };
  }

  async cleanupExpiredCache(): Promise<void> {
    const now = new Date();
    
    // @ts-ignore - Progressive development, Dexie transaction method
    await this.transaction('rw', [this.parserCache, this.imageCache], async () => {
      await this.parserCache.where('expiresAt').below(now).delete();
      await this.imageCache.where('expiresAt').below(now).delete();
    });
  }

  async clearAllData(): Promise<void> {
    // @ts-ignore - Progressive development, Dexie transaction method
    await this.transaction('rw', [
      this.books,
      this.chapters,
      this.readingProgress,
      this.bookmarks,
      this.userSettings,
      this.syncMetadata,
      this.importJobs,
      this.errorLogs,
      this.parserCache,
      this.imageCache,
    ], async () => {
      await Promise.all([
        this.books.clear(),
        this.chapters.clear(),
        this.readingProgress.clear(),
        this.bookmarks.clear(),
        this.userSettings.clear(),
        this.syncMetadata.clear(),
        this.importJobs.clear(),
        this.errorLogs.clear(),
        this.parserCache.clear(),
        this.imageCache.clear(),
      ]);
    });
  }
}

export const db = new ReadiwiDatabase();