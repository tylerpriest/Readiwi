"use client";

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/core/utils/cn';
import { BookWithMetadata } from '../types/library-types';
import { BookStatus } from '@/core/types/database';
import { Heart, Clock, BookOpen, Play, MoreVertical, Check } from 'lucide-react';

interface BookCardProps {
  book: BookWithMetadata; // @description Book data with metadata
  viewMode: 'grid' | 'list' | 'compact'; // @description Display mode for the card
  isSelected?: boolean; // @description Whether the book is selected
  onSelect?: (id: number) => void; // @description Callback when book is selected
  onFavoriteToggle?: (id: number) => void; // @description Callback when favorite is toggled
  onRead?: (id: number) => void; // @description Callback when read button is clicked
  onMoreOptions?: (id: number) => void; // @description Callback when more options is clicked
  className?: string; // @description Additional CSS classes
  'data-testid'?: string; // @description Test identifier for testing
}

const BookCard: React.FC<BookCardProps> = ({
  book,
  viewMode,
  isSelected = false,
  onSelect,
  onFavoriteToggle,
  onRead,
  onMoreOptions,
  className,
  'data-testid': testId,
  ...props
}) => {
  // 3. Event handlers with useCallback for performance
  const handleSelect = useCallback((event: React.MouseEvent) => {
    try {
      // Don't trigger selection if clicking on interactive elements
      if ((event.target as HTMLElement).closest('button, a')) {
        return;
      }
      
      onSelect?.(book.id || 0);
    } catch (error) {
      console.error(`Error in BookCard.handleSelect:`, error);
    }
  }, [book.id, onSelect]);
  
  const handleFavoriteToggle = useCallback((event: React.MouseEvent) => {
    try {
      event.stopPropagation();
      onFavoriteToggle?.(book.id || 0);
    } catch (error) {
      console.error(`Error in BookCard.handleFavoriteToggle:`, error);
    }
  }, [book.id, onFavoriteToggle]);
  
  const handleRead = useCallback((event: React.MouseEvent) => {
    try {
      event.stopPropagation();
      onRead?.(book.id || 0);
    } catch (error) {
      console.error(`Error in BookCard.handleRead:`, error);
    }
  }, [book.id, onRead]);
  
  const handleMoreOptions = useCallback((event: React.MouseEvent) => {
    try {
      event.stopPropagation();
      onMoreOptions?.(book.id || 0);
    } catch (error) {
      console.error(`Error in BookCard.handleMoreOptions:`, error);
    }
  }, [book.id, onMoreOptions]);
  
  // Helper functions
  const getStatusColor = (status: BookStatus) => {
    switch (status) {
      case BookStatus.COMPLETED:
        return 'text-green-600 bg-green-50';
      case BookStatus.READING:
        return 'text-blue-600 bg-blue-50';
      case BookStatus.ON_HOLD:
        return 'text-yellow-600 bg-yellow-50';
      case BookStatus.DROPPED:
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };
  
  const getStatusText = (status: BookStatus) => {
    switch (status) {
      case BookStatus.COMPLETED:
        return 'Completed';
      case BookStatus.READING:
        return 'Reading';
      case BookStatus.ON_HOLD:
        return 'On Hold';
      case BookStatus.DROPPED:
        return 'Dropped';
      default:
        return 'Not Started';
    }
  };
  
  const formatReadingTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };
  
  // Render different layouts based on view mode
  if (viewMode === 'list') {
    return (
      <Card
        className={cn(
          'cursor-pointer transition-all duration-200 hover:shadow-md',
          isSelected && 'ring-2 ring-primary bg-primary/5',
          className
        )}
        onClick={handleSelect}
        data-testid={testId}
        {...props}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Book Cover Placeholder */}
            <div className="w-12 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-primary/60" aria-hidden="true" />
            </div>
            
            {/* Book Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate text-sm">
                    {book.title}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    by {book.author}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    {/* Status Badge */}
                    <span className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      getStatusColor(book.status)
                    )}>
                      {getStatusText(book.status)}
                    </span>
                    
                    {/* Progress */}
                    {book.currentProgress && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {Math.round(book.currentProgress.percentage)}%
                      </span>
                    )}
                    
                    {/* Reading Time */}
                    {book.estimatedReadingTime > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ~{formatReadingTime(book.estimatedReadingTime)}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFavoriteToggle}
                    className={cn(
                      'h-8 w-8 p-0',
                      book.isFavorite && 'text-red-500 hover:text-red-600'
                    )}
                    aria-label={book.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    data-testid="favorite-button"
                  >
                    <Heart 
                      className={cn('h-4 w-4', book.isFavorite && 'fill-current')} 
                      aria-hidden="true" 
                    />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRead}
                    className="h-8 px-3 text-xs"
                    data-testid="read-button"
                  >
                    {book.currentProgress ? (
                      <>
                        <Play className="w-3 h-3 mr-1" aria-hidden="true" />
                        Continue
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-3 h-3 mr-1" aria-hidden="true" />
                        Read
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMoreOptions}
                    className="h-8 w-8 p-0"
                    aria-label="More options"
                    data-testid="more-options-button"
                  >
                    <MoreVertical className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (viewMode === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-accent/50',
          isSelected && 'bg-primary/10 ring-1 ring-primary',
          className
        )}
        onClick={handleSelect}
        data-testid={testId}
        {...props}
      >
        {/* Selection Indicator */}
        <div className="w-4 flex items-center justify-center" data-testid="selection-indicator">
          {isSelected && <Check className="w-3 h-3 text-primary" aria-hidden="true" />}
        </div>
        
        {/* Book Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{book.title}</span>
            <span className="text-xs text-muted-foreground">by {book.author}</span>
            {book.isFavorite && (
              <Heart 
                className="w-3 h-3 text-red-500 fill-current flex-shrink-0" 
                aria-hidden="true" 
                data-testid="heart-icon" 
              />
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRead}
            className="h-6 px-2 text-xs"
            data-testid="read-button"
          >
            {book.currentProgress ? 'Continue' : 'Read'}
          </Button>
        </div>
      </div>
    );
  }
  
  // Default grid view
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md group',
        isSelected && 'ring-2 ring-primary bg-primary/5',
        className
      )}
      onClick={handleSelect}
      data-testid={testId || 'book-card'}
      {...props}
    >
      <CardContent className="p-4">
        {/* Book Cover Placeholder */}
        <div className="w-full aspect-[3/4] bg-gradient-to-br from-primary/20 to-primary/5 rounded-md mb-3 flex items-center justify-center relative overflow-hidden">
          <BookOpen className="w-8 h-8 text-primary/60" aria-hidden="true" />
          
          {/* Favorite Heart */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavoriteToggle}
            className={cn(
              'absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity',
              book.isFavorite && 'opacity-100 text-red-500 hover:text-red-600'
            )}
            aria-label={book.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            data-testid="favorite-button"
          >
            <Heart 
              className={cn('h-4 w-4', book.isFavorite && 'fill-current')} 
              aria-hidden="true" 
            />
          </Button>
          
          {/* Progress Bar */}
          {book.currentProgress && book.currentProgress.percentage > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${book.currentProgress.percentage}%` }}
                aria-label={`${Math.round(book.currentProgress.percentage)}% complete`}
              />
            </div>
          )}
        </div>
        
        {/* Book Info */}
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-foreground truncate text-sm leading-tight">
              {book.title}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              by {book.author}
            </p>
          </div>
          
          {/* Status and Stats */}
          <div className="flex items-center justify-between text-xs">
            <span className={cn(
              'inline-flex items-center px-2 py-1 rounded-full font-medium',
              getStatusColor(book.status)
            )}>
              {getStatusText(book.status)}
            </span>
            
            {book.currentProgress && (
              <span className="text-muted-foreground">
                {Math.round(book.currentProgress.percentage)}%
              </span>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-1 pt-1">
            <Button
              variant="default"
              size="sm"
              onClick={handleRead}
              className="flex-1 h-8 text-xs"
              data-testid="read-button"
            >
              {book.currentProgress ? (
                <>
                  <Play className="w-3 h-3 mr-1" aria-hidden="true" />
                  Continue
                </>
              ) : (
                <>
                  <BookOpen className="w-3 h-3 mr-1" aria-hidden="true" />
                  Read
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMoreOptions}
              className="h-8 w-8 p-0"
              aria-label="More options"
              data-testid="more-options-button"
            >
              <MoreVertical className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

BookCard.displayName = 'BookCard';
export default BookCard;