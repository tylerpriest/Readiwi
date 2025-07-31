"use client";

import React, { useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/core/utils/cn';
import { useReaderStore } from '../stores/reader-store';
// import { reliablePositionTracker } from '../services/position-tracker'; // TODO: Use for position tracking
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
  className?: string; // @description Additional CSS classes
  'data-testid'?: string; // @description Test identifier for testing
}

const ReaderView: React.FC<ReaderViewProps> = ({
  bookId, // TODO: Use to load specific book
  className,
  'data-testid': testId,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // TODO: Use bookId to load specific book data
  console.log('Reader loading for book:', bookId);
  
  // Store subscriptions
  const {
    currentBook,
    currentChapter,
    currentPosition,
    loading,
    error,
    isSettingsVisible,
    nextChapter,
    previousChapter,
    updatePosition,
    toggleSettings,
    clearError,
    reset,
  } = useReaderStore();

  // Handle position tracking on content interaction
  const handleContentInteraction = useCallback(async () => {
    if (!currentChapter || !contentRef.current) return;
    
    try {
      const element = contentRef.current;
      const scrollPosition = element.scrollTop;
      const characterOffset = 0; // Would calculate based on visible text in real implementation
      
      const newPosition = {
        chapterId: currentChapter.id,
        characterOffset,
        scrollPosition,
        timestamp: new Date(),
      };
      
      updatePosition(newPosition);
    } catch (error) {
      console.warn('Position tracking error:', error);
    }
  }, [currentChapter, updatePosition]);

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
          className="sticky top-[110px] z-10 bg-muted/50 border-b"
          data-testid="reading-settings-panel"
        >
          <div className="container mx-auto px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Reading settings panel (font size, theme, etc.)
            </p>
          </div>
        </div>
      )}

      {/* Chapter Navigation */}
      <div 
        className="sticky top-[147px] z-10 bg-background/80 backdrop-blur border-b"
        data-testid="chapter-navigation"
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={previousChapter}
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
              onClick={nextChapter}
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
      <main className="container mx-auto px-4 py-8">
        {currentChapter ? (
          <article 
            ref={contentRef}
            className="responsive-layout max-w-4xl mx-auto prose prose-lg dark:prose-invert"
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
              onClick={previousChapter}
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
              onClick={nextChapter}
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