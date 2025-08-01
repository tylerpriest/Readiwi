"use client";

import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/core/utils/cn';
import { useLibraryStore } from '../stores/library-store';
import BookCard from './BookCard';
import { Grid, List, Search, Plus, Settings, Rows3 } from 'lucide-react';

interface LibraryViewProps {
  className?: string; // @description Additional CSS classes
  'data-testid'?: string; // @description Test identifier for testing
}

const LibraryView: React.FC<LibraryViewProps> = ({
  className,
  'data-testid': testId,
  ...props
}) => {
  // 1. Router hook
  const router = useRouter();

  // 2. Store subscriptions
  const {
    books,
    filteredBooks,
    loading,
    error,
    hasBooks,
    viewSettings,
    loadBooks,
    setViewMode,
    setSearchQuery,
    toggleBookSelection,
    clearError,
  } = useLibraryStore();

  // 3. Event handlers with useCallback for performance
  const handleLoadBooks = useCallback(async () => {
    try {
      await loadBooks();
    } catch (error) {
      console.error('Failed to load books:', error);
    }
  }, [loadBooks]);

  const handleViewModeChange = useCallback((mode: 'grid' | 'list' | 'compact') => {
    try {
      setViewMode(mode);
    } catch (error) {
      console.error('Failed to change view mode:', error);
    }
  }, [setViewMode]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setSearchQuery(event.target.value);
    } catch (error) {
      console.error('Failed to update search query:', error);
    }
  }, [setSearchQuery]);

  const handleBookSelect = useCallback((id: number) => {
    try {
      toggleBookSelection(id);
    } catch (error) {
      console.error('Failed to select book:', error);
    }
  }, [toggleBookSelection]);

  const handleBookRead = useCallback((id: number) => {
    try {
      // Find the book to get its slug
      const book = books.find((b: any) => b.id === id);
      if (!book) {
        console.error(`Book with ID ${id} not found`);
        return;
      }
      
      // Use slug if available, otherwise fallback to a generated slug
      const slug = book.urlSlug || book.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      // Navigate to reader with slug format: /read/[bookId]/[slug]
      router.push(`/read/${id}/${slug}`);
    } catch (error) {
      console.error('Failed to open book for reading:', error);
    }
  }, [router, books]);

  const handleBookFavorite = useCallback((id: number) => {
    try {
      // TODO: Toggle favorite status
      console.log('Toggle favorite for book:', id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }, []);

  const handleBookOptions = useCallback((id: number) => {
    try {
      // TODO: Show book options menu
      console.log('Show options for book:', id);
    } catch (error) {
      console.error('Failed to show book options:', error);
    }
  }, []);

  const handleAddBook = useCallback(() => {
    try {
      router.push('/import');
    } catch (error) {
      console.error('Failed to navigate to import page:', error);
    }
  }, [router]);

  const handleClearError = useCallback(() => {
    try {
      clearError();
    } catch (error) {
      console.error('Failed to clear error:', error);
    }
  }, [clearError]);

  // 4. Effects
  useEffect(() => {
    // Always load books on component mount to ensure fresh data
    handleLoadBooks();
  }, [handleLoadBooks]);

  // 5. Render with accessibility and performance optimization
  return (
    <div
      className={cn('flex flex-col h-full', className)}
      data-testid={testId}
      {...props}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 p-6 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Library</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/settings')}
              className="flex items-center gap-2"
              data-testid="settings-button"
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
              Settings
            </Button>
            <Button
              onClick={handleAddBook}
              className="flex items-center gap-2"
              data-testid="add-book-button"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add Book
            </Button>
          </div>
        </div>

        {/* Search and View Controls */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search books, authors, tags..."
              value={viewSettings.searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
              data-testid="search-input"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewSettings.viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('grid')}
              className="rounded-r-none border-r-0"
              aria-label="Grid view"
              data-testid="grid-view-button"
            >
              <Grid className="w-4 h-4" aria-hidden="true" />
            </Button>
            <Button
              variant={viewSettings.viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
              className="rounded-none border-r-0"
              aria-label="List view"
              data-testid="list-view-button"
            >
              <List className="w-4 h-4" aria-hidden="true" />
            </Button>
            <Button
              variant={viewSettings.viewMode === 'compact' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('compact')}
              className="rounded-l-none"
              aria-label="Compact view"
              data-testid="compact-view-button"
            >
              <Rows3 className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearError}
              className="text-destructive hover:text-destructive"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-6">
        {loading && !hasBooks ? (
          // Loading state
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your library...</p>
            </div>
          </div>
        ) : !hasBooks && !loading ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Your library is empty</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Start building your collection by adding your first book. You can import books from web novel sites or add them manually.
            </p>
            <Button onClick={handleAddBook} className="flex items-center gap-2">
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add Your First Book
            </Button>
          </div>
        ) : (
          // Books display
          <div
            className={cn(
              'w-full',
              viewSettings.viewMode === 'grid' && 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4',
              viewSettings.viewMode === 'list' && 'space-y-3',
              viewSettings.viewMode === 'compact' && 'space-y-1'
            )}
            data-testid="books-container"
          >
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                viewMode={viewSettings.viewMode}
                onSelect={handleBookSelect}
                onRead={handleBookRead}
                onFavoriteToggle={handleBookFavorite}
                onMoreOptions={handleBookOptions}
                data-testid={`book-card-${book.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

LibraryView.displayName = 'LibraryView';
export default LibraryView;