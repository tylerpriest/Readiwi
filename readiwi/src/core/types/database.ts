export interface Book {
  id?: number;
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  sourceUrl?: string;
  sourceSite?: string;
  urlSlug?: string; // URL-based identifier (e.g., "just-add-mana")
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

export interface Bookmark {
  id?: number;
  bookId: number;
  chapterId: number;
  position: number;
  title: string;
  note?: string;
  createdAt: Date;
}

export interface SyncMetadata {
  id?: number;
  entityType: string;
  entityId: number;
  lastSyncAt: Date;
  syncStatus: SyncStatus;
  version: number;
}

export interface ImportJob {
  id?: number;
  url: string;
  status: ImportStatus;
  progress: number; // 0-100
  totalChapters?: number;
  processedChapters: number;
  bookId?: number;
  bookTitle?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ErrorLog {
  id?: number;
  level: ErrorLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
}

export interface ParserCacheEntry {
  id?: number;
  url: string;
  data: any;
  expiresAt: Date;
  createdAt: Date;
}

export interface ImageCacheEntry {
  id?: number;
  url: string;
  blob: Blob;
  size: number;
  expiresAt: Date;
  createdAt: Date;
}

export interface Footnote {
  id: string;
  position: number;
  content: string;
  type: 'author' | 'translator' | 'editor';
}

// Enums
export enum BookStatus {
  IMPORTING = 'importing',
  READY = 'ready',
  READING = 'reading',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  DROPPED = 'dropped',
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

export enum ProcessingStatus {
  RAW = 'raw',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  ERROR = 'error',
}

export enum RestorationStrategy {
  EXACT_TEXT = 'exact_text',
  FUZZY_TEXT = 'fuzzy_text',
  ELEMENT_ID = 'element_id',
  PERCENTAGE = 'percentage',
  SCROLL_POSITION = 'scroll_position',
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

export enum ImportStatus {
  PENDING = 'pending',
  ANALYZING = 'analyzing',
  IMPORTING = 'importing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ErrorLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

// Utility types
export interface BookWithProgress extends Book {
  currentProgress?: ReadingProgress;
}

export interface Repository<T> {
  create(entity: Omit<T, 'id'>): Promise<number>;
  findById(id: number): Promise<T | undefined>;
  findAll(): Promise<T[]>;
  update(id: number, updates: Partial<T>): Promise<void>;
  delete(id: number): Promise<void>;
  count(): Promise<number>;
}