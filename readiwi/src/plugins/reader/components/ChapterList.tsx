"use client";

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/core/utils/cn';
import { useReaderStore } from '../stores/reader-store';
import { Chapter } from '../types/reader-types';
import { BookOpen, Clock, Check } from 'lucide-react';

interface ChapterListProps {
  className?: string; // @description Additional CSS classes
  'data-testid'?: string; // @description Test identifier for testing
}

const ChapterList: React.FC<ChapterListProps> = ({
  className,
  'data-testid': testId,
  ...props
}) => {
  // Store subscriptions
  const {
    chapters,
    currentChapter,
    currentBook,
    loading,
    navigateToChapter,
    toggleChapterList,
  } = useReaderStore();

  // Event handlers with useCallback
  const handleChapterSelect = useCallback(async (chapterNumber: number) => {
    try {
      await navigateToChapter(chapterNumber);
      toggleChapterList(); // Close the chapter list
    } catch (error) {
      console.error('Failed to navigate to chapter:', error);
    }
  }, [navigateToChapter, toggleChapterList]);

  const handleClose = useCallback(() => {
    toggleChapterList();
  }, [toggleChapterList]);

  // Render chapter item
  const renderChapterItem = useCallback((chapter: Chapter) => {
    const isCurrentChapter = currentChapter?.id === chapter.id;
    const isCompleted = false; // TODO: Track completion status
    
    return (
      <Button
        key={chapter.id}
        variant={isCurrentChapter ? "default" : "ghost"}
        className={cn(
          "w-full justify-start h-auto p-4 text-left",
          isCurrentChapter && "bg-primary text-primary-foreground"
        )}
        onClick={() => handleChapterSelect(chapter.chapterNumber)}
        data-testid={`chapter-item-${chapter.chapterNumber}`}
      >
        <div className="flex items-start gap-3 w-full">
          <div className="flex-shrink-0 mt-1">
            {isCompleted ? (
              <Check className="w-4 h-4 text-green-500" aria-hidden="true" />
            ) : (
              <BookOpen 
                className={cn(
                  "w-4 h-4",
                  isCurrentChapter ? "text-primary-foreground" : "text-muted-foreground"
                )} 
                aria-hidden="true" 
              />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={cn(
                "font-medium text-sm truncate",
                isCurrentChapter ? "text-primary-foreground" : "text-foreground"
              )}>
                {chapter.title}
              </h3>
              <span className={cn(
                "text-xs ml-2 flex-shrink-0",
                isCurrentChapter ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                Ch. {chapter.chapterNumber}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-xs">
              <span className={cn(
                "flex items-center gap-1",
                isCurrentChapter ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                <Clock className="w-3 h-3" aria-hidden="true" />
                {chapter.estimatedReadingTime}min
              </span>
              <span className={cn(
                isCurrentChapter ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {chapter.wordCount} words
              </span>
            </div>
          </div>
        </div>
      </Button>
    );
  }, [currentChapter, handleChapterSelect]);

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-50 w-80 bg-background border-l shadow-lg",
        "transform transition-transform duration-300 ease-in-out",
        className
      )}
      data-testid={testId}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="font-semibold">Chapters</h2>
          {currentBook && (
            <p className="text-sm text-muted-foreground truncate">
              {currentBook.title}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          data-testid="close-chapter-list-button"
        >
          ×
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          // Loading state
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading chapters...</p>
            </div>
          </div>
        ) : chapters.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-32 text-center p-4">
            <BookOpen className="w-8 h-8 text-muted-foreground mb-2" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">No chapters available</p>
          </div>
        ) : (
          // Chapters list
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1" data-testid="chapters-list">
              {chapters.map(renderChapterItem)}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Footer */}
      {chapters.length > 0 && (
        <div className="p-4 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{chapters.length} chapters</span>
            <span>
              {chapters.reduce((total, chapter) => total + chapter.estimatedReadingTime, 0)} min total
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

ChapterList.displayName = 'ChapterList';
export default ChapterList;