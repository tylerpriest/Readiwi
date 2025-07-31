# Readiwi v4.0 - Complete Data Architecture Specification

**Version**: 4.0.0  
**Created**: 2025-07-29  
**Purpose**: Complete database schema and data models for autonomous development  
**Target**: Production-ready IndexedDB implementation with Dexie

## Database Architecture Overview

Readiwi uses IndexedDB as the primary client-side database with Dexie as the wrapper library. The architecture is designed for offline-first functionality with optional cloud synchronization.

### Database Design Principles

- **Offline-First**: All data stored locally with sync capabilities
- **Performance**: Optimized queries and indexing for fast access
- **Scalability**: Efficient storage for large libraries (1000+ books)
- **Data Integrity**: Validation and constraints at application level
- **Migration Support**: Versioned schema with migration strategies

## Database Schema

### Database Configuration

```typescript
// Database version and configuration
export const DATABASE_VERSION = 4;
export const DATABASE_NAME = 'ReadiwiDatabase';

// Storage quotas and limits
export const STORAGE_LIMITS = {
  maxBooks: 1000,
  maxChaptersPerBook: 2000,
  maxBookSizeMB: 50,
  maxTotalStorageGB: 2,
  warningThresholdPercent: 80,
  cleanupThresholdPercent: 90,
} as const;
```

### Core Database Schema

```typescript
import Dexie, { Table } from 'dexie';

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
  }
}

export const db = new ReadiwiDatabase();
```

## Data Models

### Book Model

```typescript
export interface Book {
  id?: number;
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  sourceUrl?: string;
  sourceSite?: string;
  totalChapters: number;
  tags: string[];
  status: BookStatus;
  language: string;
  genre?: string[];
  rating?: number;
  wordCount?: number;
  estimatedReadingTime?: number; // in minutes
  isFavorite: boolean;
  isOfflineAvailable: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastReadAt?: Date;
  importedAt?: Date;
  
  // Sync metadata
  syncStatus: SyncStatus;
  lastSyncAt?: Date;
  version: number;
  
  // Computed fields (not stored)
  readingProgress?: number; // 0-100
  currentChapter?: number;
  isCompleted?: boolean;
}

export enum BookStatus {
  IMPORTING = 'importing',
  READY = 'ready',
  ERROR = 'error',
  UPDATING = 'updating',
  ARCHIVED = 'archived',
}

export enum SyncStatus {
  SYNCED = 'synced',
  PENDING = 'pending',
  CONFLICT = 'conflict',
  ERROR = 'error',
  LOCAL_ONLY = 'local_only',
}
```

### Chapter Model

```typescript
export interface Chapter {
  id?: number;
  bookId: number;
  index: number;
  title: string;
  content: string;
  htmlContent?: string; // Processed HTML for display
  plainTextContent?: string; // Plain text for TTS
  wordCount: number;
  estimatedReadingTime: number; // in minutes
  
  // Navigation
  previousChapterId?: number;
  nextChapterId?: number;
  
  // Source metadata
  sourceUrl?: string;
  sourceChapterId?: string;
  
  // Content metadata
  hasImages: boolean;
  imageUrls: string[];
  footnotes?: Footnote[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // Sync metadata
  syncStatus: SyncStatus;
  lastSyncAt?: Date;
  version: number;
  
  // Processing metadata
  processingStatus: ProcessingStatus;
  processingError?: string;
}

export enum ProcessingStatus {
  RAW = 'raw',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  ERROR = 'error',
}

export interface Footnote {
  id: string;
  position: number;
  content: string;
  type: 'author' | 'translator' | 'editor';
}
```

### Reading Progress Model

```typescript
export interface ReadingProgress {
  id?: number;
  bookId: number;
  chapterId: number;
  chapterIndex: number;
  
  // Position tracking
  scrollPosition: number;
  textPosition?: number; // Character position in text
  elementId?: string; // DOM element ID for precise positioning
  
  // Progress metrics
  percentage: number; // 0-100, overall book progress
  chapterPercentage: number; // 0-100, current chapter progress
  
  // Reading session data
  sessionStartTime: Date;
  totalReadingTime: number; // in seconds
  wordsRead: number;
  
  // Position restoration metadata
  restorationStrategy: RestorationStrategy;
  restorationAccuracy: number; // 0-100
  textContext?: string; // Surrounding text for fuzzy matching
  
  // Timestamps
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Sync metadata
  syncStatus: SyncStatus;
  lastSyncAt?: Date;
  version: number;
}

export enum RestorationStrategy {
  EXACT_TEXT = 'exact_text',
  FUZZY_TEXT = 'fuzzy_text',
  ELEMENT_ID = 'element_id',
  PERCENTAGE = 'percentage',
  SCROLL_POSITION = 'scroll_position',
}
```

### User Settings Model

```typescript
export interface UserSetting {
  id?: number;
  key: string;
  value: any;
  type: SettingType;
  category: SettingCategory;
  
  // Metadata
  description?: string;
  defaultValue?: any;
  validationSchema?: any;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Sync metadata
  syncStatus: SyncStatus;
  lastSyncAt?: Date;
  version: number;
}

export enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
}

export enum SettingCategory {
  READING = 'reading',
  AUDIO = 'audio',
  INTERFACE = 'interface',
  SYNC = 'sync',
  PRIVACY = 'privacy',
  ADVANCED = 'advanced',
}
```

## Data Access Layer

### Repository Pattern Implementation

```typescript
// Base repository interface
export interface Repository<T> {
  create(entity: Omit<T, 'id'>): Promise<number>;
  findById(id: number): Promise<T | undefined>;
  findAll(): Promise<T[]>;
  update(id: number, updates: Partial<T>): Promise<void>;
  delete(id: number): Promise<void>;
  count(): Promise<number>;
}

// Book repository implementation
export class BookRepository implements Repository<Book> {
  constructor(private db: ReadiwiDatabase) {}
  
  async create(book: Omit<Book, 'id'>): Promise<number> {
    const now = new Date();
    const bookWithTimestamps = {
      ...book,
      createdAt: now,
      updatedAt: now,
      syncStatus: SyncStatus.LOCAL_ONLY,
      version: 1,
    };
    
    return await this.db.books.add(bookWithTimestamps);
  }
  
  async findById(id: number): Promise<Book | undefined> {
    return await this.db.books.get(id);
  }
  
  async findAll(): Promise<Book[]> {
    return await this.db.books.orderBy('updatedAt').reverse().toArray();
  }
  
  async findByStatus(status: BookStatus): Promise<Book[]> {
    return await this.db.books.where('status').equals(status).toArray();
  }
  
  async findFavorites(): Promise<Book[]> {
    return await this.db.books.where('isFavorite').equals(true).toArray();
  }
  
  async search(query: string): Promise<Book[]> {
    const lowerQuery = query.toLowerCase();
    return await this.db.books
      .filter(book => 
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
      .toArray();
  }
  
  async update(id: number, updates: Partial<Book>): Promise<void> {
    const updateWithTimestamp = {
      ...updates,
      updatedAt: new Date(),
      version: (await this.findById(id))?.version + 1 || 1,
    };
    
    await this.db.books.update(id, updateWithTimestamp);
  }
  
  async delete(id: number): Promise<void> {
    await this.db.transaction('rw', [this.db.books, this.db.chapters, this.db.readingProgress, this.db.bookmarks], async () => {
      // Delete related data
      await this.db.chapters.where('bookId').equals(id).delete();
      await this.db.readingProgress.where('bookId').equals(id).delete();
      await this.db.bookmarks.where('bookId').equals(id).delete();
      
      // Delete the book
      await this.db.books.delete(id);
    });
  }
  
  async count(): Promise<number> {
    return await this.db.books.count();
  }
}
```

## Performance Optimization

### Query Optimization

```typescript
export class QueryOptimizer {
  // Optimized queries for common operations
  static async getBookWithLatestProgress(db: ReadiwiDatabase, bookId: number): Promise<BookWithProgress | null> {
    const [book, latestProgress] = await Promise.all([
      db.books.get(bookId),
      db.readingProgress
        .where('bookId')
        .equals(bookId)
        .reverse()
        .sortBy('timestamp')
        .then(progress => progress[0]),
    ]);
    
    if (!book) return null;
    
    return {
      ...book,
      currentProgress: latestProgress,
    };
  }
  
  static async getLibraryWithProgress(db: ReadiwiDatabase): Promise<BookWithProgress[]> {
    const books = await db.books.orderBy('updatedAt').reverse().toArray();
    
    // Batch fetch latest progress for all books
    const progressMap = new Map<number, ReadingProgress>();
    const allProgress = await db.readingProgress.toArray();
    
    // Group progress by book and get latest for each
    const progressByBook = new Map<number, ReadingProgress[]>();
    for (const progress of allProgress) {
      if (!progressByBook.has(progress.bookId)) {
        progressByBook.set(progress.bookId, []);
      }
      progressByBook.get(progress.bookId)!.push(progress);
    }
    
    // Get latest progress for each book
    for (const [bookId, progressList] of progressByBook) {
      const latest = progressList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
      progressMap.set(bookId, latest);
    }
    
    return books.map(book => ({
      ...book,
      currentProgress: progressMap.get(book.id!),
    }));
  }
}

export interface BookWithProgress extends Book {
  currentProgress?: ReadingProgress;
}
```

---

**Next Steps**: Use this data architecture as the foundation for all data operations. Refer to the repository implementations for consistent data access patterns.