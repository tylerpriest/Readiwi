/**
 * Import View Component - Readiwi v4.0
 * UI for importing books from web sources
 */

"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/core/utils/cn';
import { importBook, getSupportedSources, validateUrl, ParserProgress } from '../services/book-import';
import { useLibraryStore } from '@/plugins/book-library/stores/library-store';
import { BookStatus, SyncStatus } from '@/core/types/database';
import { useRouter } from 'next/navigation';
import { readerService } from '@/plugins/reader/services/reader-service';
import { libraryService } from '@/plugins/book-library/services/library-service';

interface ImportViewProps {
  className?: string;
  'data-testid'?: string;
}

/**
 * Generate a URL-based slug for book identification
 */
function generateBookSlug(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // For Royal Road: /fiction/125163/just-add-mana → "just-add-mana"
    if (urlObj.hostname.includes('royalroad.com')) {
      const titleIndex = pathParts.findIndex(part => part === 'fiction') + 2;
      if (titleIndex >= 2 && pathParts[titleIndex]) {
        return pathParts[titleIndex];
      }
    }
    
    // Fallback: use last meaningful path segment
    const lastSegment = pathParts[pathParts.length - 1];
    if (lastSegment && lastSegment !== 'fiction' && !lastSegment.match(/^\d+$/)) {
      return lastSegment;
    }
    
    // Ultimate fallback: use domain + path hash
    return `${urlObj.hostname.replace(/\./g, '-')}-${Math.abs(urlObj.pathname.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0))}`;
  } catch {
    return `book-${Date.now()}`;
  }
}

/**
 * Detect source site from URL
 */
function detectSourceSite(url: string): string {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('royalroad.com')) return 'Royal Road';
    if (urlObj.hostname.includes('webnovel.com')) return 'WebNovel';
    if (urlObj.hostname.includes('novelupdates.com')) return 'Novel Updates';
    return urlObj.hostname;
  } catch {
    return 'Unknown';
  }
}

/**
 * Generate unique title by checking existing books and appending ID if needed
 */
async function generateUniqueTitle(baseTitle: string, urlSlug: string): Promise<string> {
  try {
    const existingBooks = await libraryService.searchBooks(baseTitle);
    
    // If no books with same title, use original
    if (existingBooks.length === 0) {
      return baseTitle;
    }
    
    // Check if any existing book has the same URL slug
    const sameSlugBook = existingBooks.find(book => 
      (book as any).urlSlug === urlSlug
    );
    
    if (sameSlugBook) {
      return baseTitle; // Same book, use original title
    }
    
    // Different books with same title, append URL slug for uniqueness
    return `${baseTitle} (${urlSlug})`;
  } catch (error) {
    console.warn('Error checking for duplicate titles:', error);
    // Fallback: append timestamp
    return `${baseTitle} (${Date.now()})`;
  }
}

const ImportView: React.FC<ImportViewProps> = ({
  className,
  'data-testid': testId,
}) => {
  const router = useRouter();
  const { addBook } = useLibraryStore();
  
  const [url, setUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ParserProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleImport = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    // Validate URL
    const validation = validateUrl(url.trim());
    if (!validation.valid) {
      setError(validation.error || 'Invalid URL');
      return;
    }

    setImporting(true);
    setError(null);
    setSuccess(null);
    setProgress(null);

    try {
      const result = await importBook(url.trim(), (progressUpdate) => {
        setProgress(progressUpdate);
      });

      // Generate URL-based slug for the book
      const urlSlug = generateBookSlug(url.trim());
      
      // Check for existing books with same title and generate unique identifier if needed
      const uniqueTitle = await generateUniqueTitle(result.title, urlSlug);
      
      // Convert imported book to library format
      const bookData = {
        title: uniqueTitle,
        author: result.author,
        description: result.description,
        ...(result.coverUrl && { coverUrl: result.coverUrl }),
        sourceUrl: result.sourceUrl || url.trim(),
        sourceSite: detectSourceSite(url.trim()),
        totalChapters: result.chapters.length,
        tags: result.tags || [],
        status: result.status === 'completed' ? BookStatus.READY : 
                result.status === 'ongoing' ? BookStatus.UPDATING :
                BookStatus.READY,
        language: result.language || 'en',
        genre: result.tags || [],
        ...(result.rating && { rating: result.rating }),
        wordCount: result.chapters.reduce((total, ch) => total + ch.wordCount, 0),
        estimatedReadingTime: Math.ceil(result.chapters.reduce((total, ch) => total + ch.wordCount, 0) / 200), // 200 WPM
        isFavorite: false,
        isOfflineAvailable: true, // Since we imported it
        syncStatus: SyncStatus.LOCAL_ONLY,
        version: 1,
        urlSlug // Store the URL slug for reference
      };

      // Save to library
      const bookId = await addBook(bookData);

      // Save chapters to database  
      const chaptersForDb = result.chapters.map(chapter => ({
        title: chapter.title,
        content: chapter.content,
        chapterNumber: chapter.chapterNumber
      }));
      
      await readerService.saveChapters(bookId, chaptersForDb);
      
      setSuccess(`Successfully imported "${result.title}" by ${result.author} with ${result.chapters.length} chapters! Added to your library.`);
      setUrl(''); // Clear form on success
      
      // Navigate back to library after a delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Import failed';
      setError(errorMessage);
    } finally {
      setImporting(false);
      setProgress(null);
    }
  }, [url, addBook, router]);

  const handleCancel = useCallback(() => {
    // In a real implementation, this would cancel the import
    setImporting(false);
    setProgress(null);
    setError('Import cancelled');
  }, []);

  const supportedSources = getSupportedSources();

  return (
    <div className={cn('space-y-6', className)} data-testid={testId}>
      {/* Import Form */}
      <Card>
        <CardHeader>
          <CardTitle>Import Web Novel</CardTitle>
          <CardDescription>
            Import books from supported web novel platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="import-url">Book URL</Label>
            <Input
              id="import-url"
              type="url"
              placeholder="https://www.royalroad.com/fiction/12345/book-title"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={importing}
              data-testid="import-url-input"
            />
            <p className="text-xs text-muted-foreground">
              Paste the URL of the book you want to import
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              disabled={importing || !url.trim()}
              className="flex-1"
              data-testid="import-button"
            >
              {importing ? 'Importing...' : 'Import Book'}
            </Button>
            {importing && (
              <Button
                onClick={handleCancel}
                variant="outline"
                data-testid="cancel-button"
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Display */}
      {progress && (
        <Card>
          <CardHeader>
            <CardTitle>Import Progress</CardTitle>
            <CardDescription>
              Importing: {progress.title} by {progress.author}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Status: {progress.status}</span>
                <span>
                  {progress.completedChapters} / {progress.totalChapters} chapters
                </span>
              </div>
              
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(progress.completedChapters / Math.max(progress.totalChapters, 1)) * 100}%`,
                  }}
                />
              </div>

              {progress.currentChapter && (
                <p className="text-sm text-muted-foreground">
                  Current: {progress.currentChapter}
                </p>
              )}

              {progress.estimatedTimeRemaining && progress.estimatedTimeRemaining > 0 && (
                <p className="text-sm text-muted-foreground">
                  Estimated time remaining: {Math.ceil(progress.estimatedTimeRemaining / 1000)}s
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {success && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl mb-2">✅</div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                {success}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl mb-2">❌</div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supported Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Sources</CardTitle>
          <CardDescription>
            Available import sources for web novels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {supportedSources.map((source) => (
              <div
                key={source.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border',
                  source.supported
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
                )}
              >
                <div>
                  <p className="font-medium">{source.name}</p>
                  <p className="text-sm text-muted-foreground">{source.baseUrl}</p>
                </div>
                <div className={cn(
                  'px-2 py-1 rounded text-xs font-medium',
                  source.supported
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                )}>
                  {source.supported ? 'Supported' : 'Coming Soon'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Import Features</CardTitle>
          <CardDescription>What our import system provides</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2">
            {['Real-time progress tracking', 'Chapter-by-chapter parsing', 'Metadata extraction', 'Rate-limited requests', 'Error recovery'].map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportView;