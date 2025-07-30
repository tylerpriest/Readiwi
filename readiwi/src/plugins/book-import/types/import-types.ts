/**
 * Book Import Types - Readiwi v4.0
 */

export interface ImportJob {
  id: string;
  url: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
  progress: ImportProgress;
  result?: ImportResult;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImportProgress {
  bookId?: number;
  title: string;
  author: string;
  status: 'pending' | 'fetching' | 'parsing' | 'saving' | 'completed' | 'error';
  totalChapters: number;
  completedChapters: number;
  currentChapter?: string;
  error?: string;
  startTime: Date;
  estimatedTimeRemaining?: number;
}

export interface ImportResult {
  bookId: number;
  title: string;
  author: string;
  totalChapters: number;
  totalWords: number;
  importDuration: number;
  sourceUrl: string;
}

export interface ImportSettings {
  maxConcurrentImports: number;
  maxRetries: number;
  requestDelay: number;
  enableRateLimiting: boolean;
  skipExistingBooks: boolean;
  autoAddToLibrary: boolean;
}

export interface ImportSource {
  id: string;
  name: string;
  baseUrl: string;
  supported: boolean;
  features: string[];
}

// Re-export from service for convenience
export type { ParsedBook, ParsedChapter } from '../services/import-service';