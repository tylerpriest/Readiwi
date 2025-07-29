"use client";

import React, { useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/core/utils/cn';
import { useReaderStore } from '../stores/reader-store';
import { READER_THEMES } from '../types/reader-types';
import { 
  Menu, 
  Settings, 
  List, 
  ArrowLeft, 
  ArrowRight, 
  ChevronLeft,
  BookOpen,
  Clock
} from 'lucide-react';

interface ReaderViewProps {
  bookId: number; // @description ID of the book to read
  className?: string; // @description Additional CSS classes
  'data-testid'?: string; // @description Test identifier for testing
}

const ReaderView: React.FC<ReaderViewProps> = ({
  bookId,
  className,
  'data-testid': testId,
  ...props
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Store subscriptions
  const {
    currentBook,
    currentChapter,
    loading,
    error,
    settings,
    isMenuVisible,
    hasNextChapter,
    hasPreviousChapter,
    currentChapterNumber,
    progressPercentage,
    estimatedTimeRemaining,
    loadBook,
    nextChapter,
    previousChapter,
    toggleMenu,
    toggleSettings,
    toggleChapterList,
    closeAllPanels,
    updatePosition,
    savePosition,
    clearError,
  } = useReaderStore();

  // Event handlers with useCallback
  const handleLoadBook = useCallback(async () => {
    try {
      await loadBook(bookId);
    } catch (error) {
      console.error('Failed to load book:', error);
    }
  }, [bookId, loadBook]);

  const handleNextChapter = useCallback(async () => {
    try {
      await nextChapter();
      scrollToTop();
    } catch (error) {
      console.error('Failed to navigate to next chapter:', error);
    }
  }, [nextChapter]);

  const handlePreviousChapter = useCallback(async () => {
    try {
      await previousChapter();
      scrollToTop();
    } catch (error) {
      console.error('Failed to navigate to previous chapter:', error);
    }
  }, [previousChapter]);

  const handleScroll = useCallback(() => {
    if (!currentChapter || !contentRef.current) return;
    
    const scrollPosition = contentRef.current.scrollTop;
    const characterOffset = Math.floor(scrollPosition / 20); // Rough estimate
    
    updatePosition({
      chapterId: currentChapter.id,
      characterOffset,
      scrollPosition,
      timestamp: new Date(),
    });
  }, [currentChapter, updatePosition]);

  const handleSavePosition = useCallback(async () => {
    try {
      await savePosition();
    } catch (error) {
      console.warn('Failed to save position:', error);
    }
  }, [savePosition]);

  const handleBackToLibrary = useCallback(() => {
    // TODO: Navigate back to library
    window.history.back();
  }, []);

  const scrollToTop = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft' && hasPreviousChapter) {
      handlePreviousChapter();
    } else if (event.key === 'ArrowRight' && hasNextChapter) {
      handleNextChapter();
    } else if (event.key === 'Escape') {
      closeAllPanels();
    }
  }, [hasNextChapter, hasPreviousChapter, handleNextChapter, handlePreviousChapter, closeAllPanels]);

  // Effects
  useEffect(() => {
    if (bookId && !currentBook) {
      handleLoadBook();
    }
  }, [bookId, currentBook, handleLoadBook]);

  useEffect(() => {
    // Save position periodically
    const interval = setInterval(handleSavePosition, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [handleSavePosition]);

  useEffect(() => {
    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Get current theme
  const currentTheme = READER_THEMES[settings.theme];

  // Dynamic styles based on settings
  const readerStyles = {
    fontSize: `${settings.fontSize}px`,
    fontFamily: settings.fontFamily === 'serif' ? 'Georgia, serif' : 
                settings.fontFamily === 'sans-serif' ? 'system-ui, sans-serif' : 
                'Consolas, monospace',
    lineHeight: settings.lineHeight,
    maxWidth: `${settings.maxWidth}px`,
    textAlign: settings.textAlign as 'left' | 'justify',
    padding: `${settings.margins.top}px ${settings.margins.right}px ${settings.margins.bottom}px ${settings.margins.left}px`,
    backgroundColor: currentTheme.background,
    color: currentTheme.text,
  };

  // Render loading state
  if (loading && !currentChapter) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading book...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !currentChapter) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <div className="text-destructive mb-4">
            <BookOpen className="w-16 h-16 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Failed to Load Book</h2>
          </div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="space-x-2">
            <Button onClick={handleLoadBook} variant="outline">
              Try Again
            </Button>
            <Button onClick={handleBackToLibrary}>
              Back to Library
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn('relative h-screen overflow-hidden', className)}
      style={{ backgroundColor: currentTheme.background }}
      data-testid={testId}
      {...props}
    >
      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToLibrary}
              data-testid="back-button"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Library
            </Button>
            
            {currentBook && (
              <div className="hidden sm:block">
                <h1 className="font-semibold text-sm truncate max-w-md">
                  {currentBook.title}
                </h1>
                <p className="text-xs text-muted-foreground">
                  by {currentBook.author}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentChapter && (
              <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                <span>Chapter {currentChapterNumber}</span>
                <span>{progressPercentage}%</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{estimatedTimeRemaining}min</span>
                </div>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleChapterList}
              data-testid="chapter-list-button"
            >
              <List className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSettings}
              data-testid="settings-button"
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              data-testid="menu-button"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div 
        ref={contentRef}
        className="h-full pt-20 pb-20 overflow-y-auto"
        onScroll={handleScroll}
        data-testid="reader-content"
      >
        {currentChapter ? (
          <div className="mx-auto" style={readerStyles}>
            <article>
              <header className="mb-8">
                <h1 className="text-2xl font-bold mb-2" style={{ color: currentTheme.text }}>
                  {currentChapter.title}
                </h1>
                <div className="flex items-center gap-4 text-sm" style={{ color: currentTheme.muted }}>
                  <span>Chapter {currentChapter.chapterNumber}</span>
                  <span>{currentChapter.wordCount} words</span>
                  <span>{currentChapter.estimatedReadingTime} min read</span>
                </div>
              </header>
              
              <div 
                className="prose prose-lg max-w-none"
                style={{ 
                  color: currentTheme.text,
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  lineHeight: 'inherit',
                }}
              >
                {currentChapter.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No chapter selected</p>
          </div>
        )}
      </div>

      {/* Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            onClick={handlePreviousChapter}
            disabled={!hasPreviousChapter}
            data-testid="previous-chapter-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentChapter && (
            <div className="text-center">
              <div className="text-sm font-medium">
                Chapter {currentChapterNumber}
              </div>
              <div className="text-xs text-muted-foreground">
                {progressPercentage}% complete
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            onClick={handleNextChapter}
            disabled={!hasNextChapter}
            data-testid="next-chapter-button"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="absolute top-20 left-4 right-4 z-50">
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="text-destructive hover:text-destructive"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ReaderView.displayName = 'ReaderView';
export default ReaderView;