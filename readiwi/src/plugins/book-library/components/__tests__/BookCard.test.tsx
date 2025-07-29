import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookCard from '../BookCard';
import { BookStatus } from '@/core/types/database';
import { BookWithMetadata } from '../../types/library-types';

const mockBook: BookWithMetadata = {
  id: 1,
  title: 'Test Book Title',
  author: 'Test Author',
  sourceUrl: 'https://example.com/book/1',
  status: BookStatus.READING,
  isFavorite: false,
  tags: ['fantasy', 'adventure'],
  totalChapters: 50,
  wordCount: 100000,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
  lastReadAt: new Date('2024-01-10'),
  currentProgress: {
    chapterId: 5,
    position: 0.5,
    percentage: 25,
    timestamp: new Date('2024-01-10'),
  },
  chaptersRead: 5,
  estimatedReadingTime: 400, // 400 minutes
  addedToLibrary: new Date('2024-01-01'),
};

describe('BookCard', () => {
  const mockOnSelect = jest.fn();
  const mockOnFavoriteToggle = jest.fn();
  const mockOnRead = jest.fn();
  const mockOnMoreOptions = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Grid View', () => {
    it('should render book information correctly', () => {
      render(
        <BookCard
          book={mockBook}
          viewMode="grid"
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('Test Book Title')).toBeInTheDocument();
      expect(screen.getByText('by Test Author')).toBeInTheDocument();
      expect(screen.getByText('Reading')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    it('should show continue button for books with progress', () => {
      render(
        <BookCard
          book={mockBook}
          viewMode="grid"
          onRead={mockOnRead}
        />
      );

      const readButton = screen.getByTestId('read-button');
      expect(readButton).toHaveTextContent('Continue');
    });

    it('should show read button for books without progress', () => {
      const bookWithoutProgress = { ...mockBook, currentProgress: undefined };
      
      render(
        <BookCard
          book={bookWithoutProgress}
          viewMode="grid"
          onRead={mockOnRead}
        />
      );

      const readButton = screen.getByTestId('read-button');
      expect(readButton).toHaveTextContent('Read');
    });

    it('should handle favorite toggle', async () => {
      const user = userEvent.setup();
      
      render(
        <BookCard
          book={mockBook}
          viewMode="grid"
          onFavoriteToggle={mockOnFavoriteToggle}
        />
      );

      const favoriteButton = screen.getByTestId('favorite-button');
      await user.click(favoriteButton);

      expect(mockOnFavoriteToggle).toHaveBeenCalledWith(1);
    });

    it('should show filled heart for favorite books', () => {
      const favoriteBook = { ...mockBook, isFavorite: true };
      
      render(
        <BookCard
          book={favoriteBook}
          viewMode="grid"
        />
      );

      const heartIcon = screen.getByTestId('favorite-button').querySelector('svg');
      expect(heartIcon).toHaveClass('fill-current');
    });

    it('should handle book selection on card click', async () => {
      const user = userEvent.setup();
      
      render(
        <BookCard
          book={mockBook}
          viewMode="grid"
          onSelect={mockOnSelect}
        />
      );

      const card = screen.getByTestId('book-card');
      await user.click(card);

      expect(mockOnSelect).toHaveBeenCalledWith(1);
    });

    it('should not trigger selection when clicking on buttons', async () => {
      const user = userEvent.setup();
      
      render(
        <BookCard
          book={mockBook}
          viewMode="grid"
          onSelect={mockOnSelect}
          onRead={mockOnRead}
        />
      );

      const readButton = screen.getByTestId('read-button');
      await user.click(readButton);

      expect(mockOnRead).toHaveBeenCalledWith(1);
      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it('should show selected state correctly', () => {
      render(
        <BookCard
          book={mockBook}
          viewMode="grid"
          isSelected={true}
        />
      );

      const card = screen.getByTestId('book-card');
      expect(card).toHaveClass('ring-2', 'ring-primary');
    });
  });

  describe('List View', () => {
    it('should render in list format', () => {
      render(
        <BookCard
          book={mockBook}
          viewMode="list"
        />
      );

      expect(screen.getByText('Test Book Title')).toBeInTheDocument();
      expect(screen.getByText('by Test Author')).toBeInTheDocument();
      expect(screen.getByText('Reading')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();
      expect(screen.getByText('~6h 40m')).toBeInTheDocument(); // 400 minutes formatted
    });

    it('should show all action buttons in list view', () => {
      render(
        <BookCard
          book={mockBook}
          viewMode="list"
        />
      );

      expect(screen.getByTestId('favorite-button')).toBeInTheDocument();
      expect(screen.getByTestId('read-button')).toBeInTheDocument();
      expect(screen.getByTestId('more-options-button')).toBeInTheDocument();
    });
  });

  describe('Compact View', () => {
    it('should render in compact format', () => {
      render(
        <BookCard
          book={mockBook}
          viewMode="compact"
        />
      );

      expect(screen.getByText('Test Book Title')).toBeInTheDocument();
      expect(screen.getByText('by Test Author')).toBeInTheDocument();
      expect(screen.getByTestId('read-button')).toBeInTheDocument();
    });

    it('should show selection indicator in compact view', () => {
      render(
        <BookCard
          book={mockBook}
          viewMode="compact"
          isSelected={true}
        />
      );

      const checkIcon = screen.getByRole('generic').querySelector('svg');
      expect(checkIcon).toBeInTheDocument();
    });

    it('should show favorite heart for favorite books in compact view', () => {
      const favoriteBook = { ...mockBook, isFavorite: true };
      
      render(
        <BookCard
          book={favoriteBook}
          viewMode="compact"
        />
      );

      const heartIcon = screen.getByRole('generic').querySelector('svg[data-testid="heart-icon"]');
      expect(heartIcon).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    it('should show correct status colors', () => {
      const statuses = [
        { status: BookStatus.COMPLETED, text: 'Completed', color: 'text-green-600' },
        { status: BookStatus.READING, text: 'Reading', color: 'text-blue-600' },
        { status: BookStatus.ON_HOLD, text: 'On Hold', color: 'text-yellow-600' },
        { status: BookStatus.DROPPED, text: 'Dropped', color: 'text-red-600' },
        { status: BookStatus.NOT_STARTED, text: 'Not Started', color: 'text-gray-600' },
      ];

      statuses.forEach(({ status, text, color }) => {
        const { rerender } = render(
          <BookCard
            book={{ ...mockBook, status }}
            viewMode="grid"
          />
        );

        const statusElement = screen.getByText(text);
        expect(statusElement).toBeInTheDocument();
        expect(statusElement).toHaveClass(color);

        rerender(<div />); // Clear for next iteration
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <BookCard
          book={mockBook}
          viewMode="grid"
        />
      );

      const favoriteButton = screen.getByTestId('favorite-button');
      expect(favoriteButton).toHaveAttribute('aria-label', 'Add to favorites');

      const moreOptionsButton = screen.getByTestId('more-options-button');
      expect(moreOptionsButton).toHaveAttribute('aria-label', 'More options');
    });

    it('should update favorite button aria-label for favorite books', () => {
      const favoriteBook = { ...mockBook, isFavorite: true };
      
      render(
        <BookCard
          book={favoriteBook}
          viewMode="grid"
        />
      );

      const favoriteButton = screen.getByTestId('favorite-button');
      expect(favoriteButton).toHaveAttribute('aria-label', 'Remove from favorites');
    });

    it('should have progress bar with proper aria-label', () => {
      render(
        <BookCard
          book={mockBook}
          viewMode="grid"
        />
      );

      const progressBar = screen.getByLabelText('25% complete');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('should prevent event bubbling on button clicks', async () => {
      const user = userEvent.setup();
      
      render(
        <BookCard
          book={mockBook}
          viewMode="grid"
          onSelect={mockOnSelect}
          onFavoriteToggle={mockOnFavoriteToggle}
          onRead={mockOnRead}
          onMoreOptions={mockOnMoreOptions}
        />
      );

      // Click favorite button - should not trigger selection
      await user.click(screen.getByTestId('favorite-button'));
      expect(mockOnFavoriteToggle).toHaveBeenCalledWith(1);
      expect(mockOnSelect).not.toHaveBeenCalled();

      // Click read button - should not trigger selection
      await user.click(screen.getByTestId('read-button'));
      expect(mockOnRead).toHaveBeenCalledWith(1);
      expect(mockOnSelect).not.toHaveBeenCalled();

      // Click more options - should not trigger selection
      await user.click(screen.getByTestId('more-options-button'));
      expect(mockOnMoreOptions).toHaveBeenCalledWith(1);
      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });
});