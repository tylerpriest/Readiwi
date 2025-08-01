"use client";

import React, { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/core/utils/cn';
import { useReaderStore } from '../stores/reader-store';
// import { reliablePositionTracker } from '../services/position-tracker'; // TODO: Implement full position tracking
import { readerService } from '../services/reader-service';
import { useSettingsStore } from '@/plugins/settings/stores/settings-store';
import ReadingSettings from '@/plugins/settings/components/ReadingSettings';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  BookOpen, 
  Loader2
  // Clock // TODO: Use for reading time display
} from 'lucide-react';
import AudioControls from '@/plugins/audio/components/AudioControls';

interface ReaderViewProps {
  bookId: number; // @description ID of the book to read
  slug?: string; // @description URL slug of the book (optional, for URL validation)
  chapterId?: number; // @description ID of the specific chapter to read (optional)
  chapterSlug?: string; // @description URL slug of the chapter (optional, for URL validation)
  className?: string; // @description Additional CSS classes
  'data-testid'?: string; // @description Test identifier for testing
}

const ReaderView: React.FC<ReaderViewProps> = ({
  bookId, // TODO: Use to load specific book
  slug, // TODO: Use for URL validation
  chapterId, // TODO: Use to load specific chapter
  chapterSlug, // TODO: Use for chapter URL validation
  className,
  'data-testid': testId,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Log URL parameters for debugging (TODO: Use for URL validation and chapter loading)
  React.useEffect(() => {
    console.log(`Reader loaded for book ${bookId}${slug ? ` (${slug})` : ''}${chapterId ? `, chapter ${chapterId}` : ''}${chapterSlug ? ` (${chapterSlug})` : ''}`);
  }, [bookId, slug, chapterId, chapterSlug]);
  
  // Store subscriptions
  const {
    currentBook,
    currentChapter,
    chapters,
    currentPosition,
    loading,
    error,
    isSettingsVisible,
    // nextChapter, // Using custom handleNextChapter instead
    // previousChapter, // Using custom handlePreviousChapter instead
    loadBook,
    updatePosition,
    toggleSettings,
    clearError,
    reset,
  } = useReaderStore();
  
  // Router for URL navigation
  const router = useRouter();
  
  // Load book when component mounts or bookId changes
  useEffect(() => {
    if (bookId) {
      console.log('Loading book:', bookId);
      loadBook(bookId);
    }
  }, [bookId, loadBook]);
  
  // Get reading settings
  const { settings } = useSettingsStore();

  // Custom chapter navigation functions that update URLs
  const navigateToChapter = useCallback((targetChapterId: number, targetChapterSlug?: string) => {
    if (!slug) return; // Need book slug for navigation
    
    // Generate chapter slug if not provided
    const chapterSlugToUse = targetChapterSlug || `chapter-${targetChapterId}`;
    
    // Navigate to chapter URL
    const chapterUrl = `/read/${bookId}/${slug}/${targetChapterId}/${chapterSlugToUse}`;
    console.log(`Navigating to chapter: ${chapterUrl}`);
    router.push(chapterUrl);
  }, [bookId, slug, router]);

  const handleNextChapter = useCallback(async () => {
    if (!currentChapter || !chapters) return;
    
    // Find current chapter index  
    const currentIndex = chapters.findIndex((c: any) => c.id === currentChapter.id);
    
    if (currentIndex < chapters.length - 1) {
      const nextChapterData = chapters[currentIndex + 1];
      if (nextChapterData) {
        // Generate chapter slug from title
        const nextChapterSlug = nextChapterData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || `chapter-${nextChapterData.id}`;
          
        navigateToChapter(nextChapterData.id, nextChapterSlug);
      }
    }
  }, [currentChapter, chapters, navigateToChapter]);

  const handlePreviousChapter = useCallback(async () => {
    if (!currentChapter || !chapters) return;
    
    // Find current chapter index  
    const currentIndex = chapters.findIndex((c: any) => c.id === currentChapter.id);
    
    if (currentIndex > 0) {
      const prevChapterData = chapters[currentIndex - 1];
      if (prevChapterData) {
        // Generate chapter slug from title
        const prevChapterSlug = prevChapterData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || `chapter-${prevChapterData.id}`;
          
        navigateToChapter(prevChapterData.id, prevChapterSlug);
      }
    }
  }, [currentChapter, chapters, navigateToChapter]);

  // Handle position tracking on content interaction
  const handleContentInteraction = useCallback(async () => {
    if (!currentChapter || !contentRef.current || !currentBook) return;
    
    try {
      const element = contentRef.current;
      const scrollPosition = element.scrollTop;
      
      // Use scroll position as character offset for now (simplified approach)
      const characterOffset = Math.floor(scrollPosition);
      
      const newPosition = {
        chapterId: currentChapter.id,
        characterOffset,
        scrollPosition,
        timestamp: new Date(),
      };
      
      updatePosition(newPosition);
      
      // Also save to database via reader service
      await readerService.saveReadingPosition(currentBook.id!, newPosition);
    } catch (error) {
      console.warn('Position tracking error:', error);
    }
  }, [currentChapter, currentBook, updatePosition]);

  // Auto-bookmark functionality
  useEffect(() => {
    if (!settings.reading.autoBookmark || !currentChapter || !currentBook) return;
    
    const interval = setInterval(() => {
      handleContentInteraction(); // This saves position, acting as auto-bookmark
    }, settings.reading.bookmarkInterval * 1000);

    return () => clearInterval(interval);
  }, [settings.reading.autoBookmark, settings.reading.bookmarkInterval, currentChapter, currentBook, handleContentInteraction]);

  // Infinite scroll functionality
  useEffect(() => {
    if (settings.reading.navigationMode !== 'infinite-scroll' || !contentRef.current) return;

    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      // Check if we're near the bottom
      if (distanceFromBottom <= settings.reading.infiniteScrollThreshold) {
        // Trigger next chapter load
        handleNextChapter();
      }
    };

    const contentElement = contentRef.current;
    contentElement.addEventListener('scroll', handleScroll);
    
    return () => {
      contentElement.removeEventListener('scroll', handleScroll);
    };
  }, [settings.reading.navigationMode, settings.reading.infiniteScrollThreshold, handleNextChapter]);

  // Restore position when chapter changes
  useEffect(() => {
    if (!currentPosition || !contentRef.current) return;
    
    const restorePosition = async () => {
      try {
        if (contentRef.current && currentPosition.scrollPosition > 0) {
          contentRef.current.scrollTop = currentPosition.scrollPosition;
        }
      } catch (error) {
        console.warn('Position restoration error:', error);
      }
    };
    
    restorePosition();
  }, [currentChapter, currentPosition]);

  // Add scroll listener for position tracking
  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      // Debounce scroll events to avoid excessive position updates
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        handleContentInteraction();
      }, 500);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [handleContentInteraction]);

  // Handle retry action
  const handleRetry = useCallback(() => {
    clearError();
    reset();
  }, [clearError, reset]);

  // Loading state
  if (loading) {
    return (
      <div 
        className={cn('flex items-center justify-center min-h-screen', className)}
        data-testid={testId || 'reader-view'}
      >
        <div 
          className="flex flex-col items-center space-y-4"
          data-testid="loading-indicator"
        >
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading book content...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        className={cn('flex items-center justify-center min-h-screen', className)}
        data-testid={testId || 'reader-view'}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Reading Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              {error}
            </p>
            <Button 
              onClick={handleRetry}
              className="w-full"
              variant="outline"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No book state
  if (!currentBook) {
    return (
      <div 
        className={cn('flex items-center justify-center min-h-screen', className)}
        data-testid={testId || 'reader-view'}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              No Book Selected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Please select a book from your library to start reading.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className={cn('min-h-screen bg-background', className)}
      data-testid={testId || 'reader-view'}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{currentBook.title}</h1>
              <p className="text-sm text-muted-foreground">by {currentBook.author}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSettings}
                data-testid="reading-settings-toggle"
                aria-label="Reading settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Audio Controls */}
      <div className="sticky top-[73px] z-10 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-2">
          <AudioControls
            text={currentChapter?.content || ''}
            showSettings={true}
            onSettingsClick={toggleSettings}
            data-testid="reader-audio-controls"
          />
        </div>
      </div>

      {/* Settings Panel */}
      {isSettingsVisible && (
        <div 
          className="sticky top-[110px] z-10 bg-background/95 backdrop-blur-sm border-b shadow-sm"
          data-testid="reading-settings-panel"
        >
          <div className="container mx-auto px-4 py-3">
            <ReadingSettings />
          </div>
        </div>
      )}

      {/* Chapter Navigation */}
      {settings.reading.navigationMode === 'buttons' && (
        <div 
          className="sticky top-[147px] z-10 bg-background/80 backdrop-blur border-b"
          data-testid="chapter-navigation"
        >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousChapter}
              disabled={!currentBook || currentBook.totalChapters === 0}
              className="flex items-center space-x-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            <div 
              className="flex items-center space-x-2"
              data-testid="reading-progress"
            >
              {currentChapter && (
                <>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Chapter {currentChapter.chapterNumber}
                  </span>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextChapter}
              disabled={!currentBook || currentBook.totalChapters === 0}
              className="flex items-center space-x-1"
              aria-label="Next chapter"
              data-testid="next-chapter-button"
            >
              <span>Next Chapter</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        </div>
      )}

      {/* Infinite Scroll Indicator */}
      {settings.reading.navigationMode === 'infinite-scroll' && (
        <div 
          className="fixed bottom-4 right-4 z-20 bg-primary/10 text-primary px-2 py-1 rounded text-xs"
          data-testid="infinite-scroll-indicator"
        >
          Scroll for next chapter
        </div>
      )}

      {/* Position Indicator */}
      {currentPosition && (
        <div 
          className="fixed top-4 right-4 z-20 bg-primary/10 text-primary px-2 py-1 rounded text-xs"
          data-testid="position-indicator"
        >
          Position restored
        </div>
      )}

      {/* Reading Content */}
      <main 
        className={cn(
          "container mx-auto px-4 py-8 transition-colors duration-200",
          // Apply theme-specific classes
          settings.reading.theme.mode === 'dark' && 'dark',
          settings.reading.theme.mode === 'sepia' && 'sepia',
          settings.reading.theme.mode === 'high-contrast' && 'high-contrast'
        )}
        style={{
          backgroundColor: settings.reading.theme.backgroundColor,
        }}
      >
        {currentChapter ? (
          <article 
            ref={contentRef}
            className={cn(
              "responsive-layout max-w-4xl mx-auto prose prose-lg dark:prose-invert",
              settings.reading.animatePageTurns && "transition-all duration-300 ease-in-out"
            )}
            style={{
              fontSize: `${settings.reading.theme.fontSize}px`,
              fontFamily: settings.reading.theme.fontFamily,
              lineHeight: settings.reading.theme.lineHeight,
              textAlign: settings.reading.textAlign,
              maxWidth: `${settings.reading.pageWidth}px`,
              padding: `0 ${settings.reading.marginSize}px`,
              backgroundColor: settings.reading.theme.backgroundColor,
              color: settings.reading.theme.textColor,
              columnCount: settings.reading.columnsPerPage,
              columnGap: settings.reading.columnsPerPage > 1 ? '2rem' : 'normal',
              scrollBehavior: settings.reading.scrollBehavior,
              // Apply paragraph spacing via CSS custom properties
              '--paragraph-spacing': `${settings.reading.paragraphSpacing}px`,
            } as React.CSSProperties}
            onClick={handleContentInteraction}
            onScroll={handleContentInteraction}
            data-testid="reading-content"
          >
            <header className="mb-8">
              <h1 className="text-3xl font-bold mb-2">
                {currentChapter.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>{currentChapter.wordCount} words</span>
                <span>{currentChapter.estimatedReadingTime} min read</span>
              </div>
            </header>
            
            <div 
              className="whitespace-pre-line leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: currentChapter.content.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>')
              }}
            />
          </article>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Chapter content is loading...
            </p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <footer className="sticky bottom-0 bg-background/80 backdrop-blur border-t">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePreviousChapter}
              disabled={!currentBook || currentBook.totalChapters === 0}
              className="flex items-center space-x-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="text-center flex-1 mx-4">
              <p className="text-sm text-muted-foreground">
                {currentChapter && currentBook && `${currentChapter.chapterNumber} of ${currentBook.totalChapters}`}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={handleNextChapter}
              disabled={!currentBook || currentBook.totalChapters === 0}
              className="flex items-center space-x-1"
              aria-label="Next chapter bottom"
            >
              <span className="hidden sm:inline">Next Chapter</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

ReaderView.displayName = 'ReaderView';
export default ReaderView;