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
  SyncStatus,
} from '@/core/types/database';

export const DATABASE_VERSION = 4;
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
    this.version(1).stores({
      books: '++id, title, author, sourceUrl, status, createdAt, updatedAt, lastReadAt',
      chapters: '++id, bookId, index, title, wordCount, createdAt',
      readingProgress: '++id, bookId, chapterId, position, percentage, timestamp',
      userSettings: '++id, key, value, updatedAt',
    });
    
    // Version 2: Add bookmarks and sync metadata
    this.version(2).stores({
      bookmarks: '++id, bookId, chapterId, position, title, note, createdAt',
      syncMetadata: '++id, entityType, entityId, lastSyncAt, syncStatus, version',
    });
    
    // Version 3: Add import jobs and error logging
    this.version(3).stores({
      importJobs: '++id, url, status, progress, bookId, error, createdAt, updatedAt',
      errorLogs: '++id, level, message, context, timestamp, userId',
    });
    
    // Version 4: Add caching tables
    this.version(4).stores({
      parserCache: '++id, url, data, expiresAt, createdAt',
      imageCache: '++id, url, blob, size, expiresAt, createdAt',
    });

    // Database hooks
    this.books.hook('creating', (primKey, obj, trans) => {
      const now = new Date();
      obj.createdAt = now;
      obj.updatedAt = now;
      obj.syncStatus = SyncStatus.LOCAL_ONLY;
      obj.version = 1;
    });

    this.books.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date();
      if (obj.version) {
        modifications.version = obj.version + 1;
      }
    });

    this.chapters.hook('creating', (primKey, obj, trans) => {
      const now = new Date();
      obj.createdAt = now;
      obj.updatedAt = now;
      obj.syncStatus = SyncStatus.LOCAL_ONLY;
      obj.version = 1;
    });

    this.chapters.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date();
      if (obj.version) {
        modifications.version = obj.version + 1;
      }
    });

    this.readingProgress.hook('creating', (primKey, obj, trans) => {
      const now = new Date();
      obj.createdAt = now;
      obj.updatedAt = now;
      obj.timestamp = now;
      obj.syncStatus = SyncStatus.LOCAL_ONLY;
      obj.version = 1;
    });

    this.userSettings.hook('creating', (primKey, obj, trans) => {
      const now = new Date();
      obj.createdAt = now;
      obj.updatedAt = now;
      obj.syncStatus = SyncStatus.LOCAL_ONLY;
      obj.version = 1;
    });

    this.userSettings.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date();
      if (obj.version) {
        modifications.version = obj.version + 1;
      }
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
    
    await this.transaction('rw', [this.parserCache, this.imageCache], async () => {
      await this.parserCache.where('expiresAt').below(now).delete();
      await this.imageCache.where('expiresAt').below(now).delete();
    });
  }

  async clearAllData(): Promise<void> {
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