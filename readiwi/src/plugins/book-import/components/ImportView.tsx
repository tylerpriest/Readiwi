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
import { bookImportService, ImportProgress } from '../services/import-service';

interface ImportViewProps {
  className?: string;
  'data-testid'?: string;
}

const ImportView: React.FC<ImportViewProps> = ({
  className,
  'data-testid': testId,
}) => {
  const [url, setUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleImport = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    // Validate URL
    const validation = bookImportService.validateUrl(url.trim());
    if (!validation.valid) {
      setError(validation.error || 'Invalid URL');
      return;
    }

    setImporting(true);
    setError(null);
    setSuccess(null);
    setProgress(null);

    try {
      const result = await bookImportService.importBook(url.trim(), (progressUpdate) => {
        setProgress(progressUpdate);
      });

      setSuccess(`Successfully imported "${result.title}" by ${result.author} with ${result.chapters.length} chapters!`);
      setUrl(''); // Clear form on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Import failed';
      setError(errorMessage);
    } finally {
      setImporting(false);
      setProgress(null);
    }
  }, [url]);

  const handleCancel = useCallback(() => {
    // In a real implementation, this would cancel the import
    setImporting(false);
    setProgress(null);
    setError('Import cancelled');
  }, []);

  const supportedSources = bookImportService.getSupportedSources();
  const stats = bookImportService.getImportStats();

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
            Currently supporting {stats.supportedSources} out of {stats.totalSources} sources
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
            {stats.features.map((feature, index) => (
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