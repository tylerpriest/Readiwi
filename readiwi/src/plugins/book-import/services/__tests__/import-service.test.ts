/**
 * Book Import Service Tests - Just Works Book Importing
 * Testing that book import functions reliably for users
 */

import { bookImportService } from '../import-service';

describe('User Story: Import Web Novels Easily', () => {
  describe('Source Detection and Validation', () => {
    test('User can check which sources are supported', () => {
      // Given: User wants to know supported sources
      // When: Getting supported sources
      const sources = bookImportService.getSupportedSources();

      // Then: List of sources is returned
      expect(Array.isArray(sources)).toBe(true);
      expect(sources.length).toBeGreaterThan(0);
      
      const royalRoad = sources.find(s => s.id === 'royal-road');
      expect(royalRoad).toBeDefined();
      expect(royalRoad?.supported).toBe(true);
    });

    test('User gets clear feedback for invalid URLs', () => {
      // Given: Invalid URL formats
      const invalidUrls = [
        'not-a-url',
        'http://',
        'https://unsupported-site.com/book/123',
        '',
      ];

      for (const url of invalidUrls) {
        // When: Validating invalid URL
        const result = bookImportService.validateUrl(url);

        // Then: Clear error message is provided
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe('string');
      }
    });

    test('User gets confirmation for valid supported URLs', () => {
      // Given: Valid Royal Road URLs
      const validUrls = [
        'https://www.royalroad.com/fiction/12345/book-title',
        'https://royalroad.com/fiction/67890/another-book',
      ];

      for (const url of validUrls) {
        // When: Validating valid URL
        const result = bookImportService.validateUrl(url);

        // Then: URL is confirmed as valid
        expect(result.valid).toBe(true);
        expect(result.source).toBe('royal-road');
        expect(result.error).toBeUndefined();
      }
    });
  });

  describe('Book Import Process', () => {
    test('User can import a book from Royal Road', async () => {
      // Given: Valid Royal Road URL
      const url = 'https://www.royalroad.com/fiction/12345/test-book';

      // When: Importing the book
      const result = await bookImportService.importBook(url);

      // Then: Book is successfully imported
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('author');
      expect(result).toHaveProperty('chapters');
      expect(result.title).toContain('Book 12345');
      expect(result.chapters.length).toBeGreaterThan(0);
      expect(result.sourceUrl).toBe(url);
    });

    test('User receives progress updates during import', async () => {
      // Given: Valid URL and progress tracking
      const url = 'https://www.royalroad.com/fiction/99999/progress-test';
      const progressUpdates: any[] = [];

      // When: Importing with progress callback
      await bookImportService.importBook(url, (progress) => {
        progressUpdates.push({ ...progress });
      });

      // Then: Progress updates are received
      expect(progressUpdates.length).toBeGreaterThan(0);
      
      // Check for expected progress states
      const statuses = progressUpdates.map(p => p.status);
      expect(statuses).toContain('fetching');
      expect(statuses).toContain('parsing');
      expect(statuses).toContain('completed');

      // Final update should show completion
      const finalUpdate = progressUpdates[progressUpdates.length - 1];
      expect(finalUpdate.status).toBe('completed');
      expect(finalUpdate.completedChapters).toBe(finalUpdate.totalChapters);
    });

    test('Import produces realistic book content', async () => {
      // Given: Royal Road URL
      const url = 'https://www.royalroad.com/fiction/123/content-test';

      // When: Importing book
      const book = await bookImportService.importBook(url);

      // Then: Content is realistic and well-formatted
      expect(book.chapters.length).toBeGreaterThan(3); // Has multiple chapters
      
      for (const chapter of book.chapters.slice(0, 3)) { // Test first 3 chapters
        expect(chapter.title).toContain('Chapter');
        expect(chapter.content.length).toBeGreaterThan(100); // Substantial content
        expect(chapter.wordCount).toBeGreaterThan(10);
        expect(chapter.chapterNumber).toBeGreaterThan(0);
        
        // Content should have paragraph structure
        expect(chapter.content).toContain('\n\n');
      }

      // Book metadata should be complete
      expect(book.description.length).toBeGreaterThan(50);
      expect(book.tags.length).toBeGreaterThan(0);
      expect(['ongoing', 'completed', 'hiatus']).toContain(book.status);
    });
  });

  describe('Error Handling', () => {
    test('Import fails gracefully for unsupported sources', async () => {
      // Given: Unsupported source URL
      const url = 'https://unsupported-site.com/book/123';

      // When: Attempting to import
      // Then: Clear error is thrown
      await expect(bookImportService.importBook(url)).rejects.toThrow('Unsupported source URL');
    });

    test('Service provides helpful statistics', () => {
      // Given: Import service
      // When: Getting import statistics
      const stats = bookImportService.getImportStats();

      // Then: Useful statistics are provided
      expect(stats).toHaveProperty('supportedSources');
      expect(stats).toHaveProperty('totalSources');
      expect(stats).toHaveProperty('features');
      
      expect(typeof stats.supportedSources).toBe('number');
      expect(typeof stats.totalSources).toBe('number');
      expect(Array.isArray(stats.features)).toBe(true);
      
      expect(stats.supportedSources).toBeGreaterThan(0);
      expect(stats.totalSources).toBeGreaterThanOrEqual(stats.supportedSources);
      expect(stats.features.length).toBeGreaterThan(0);
    });
  });

  describe('User Experience Features', () => {
    test('Chapter titles are varied and engaging', async () => {
      // Given: Book import that generates multiple chapters
      const url = 'https://www.royalroad.com/fiction/555/title-variety-test';

      // When: Importing book
      const book = await bookImportService.importBook(url);

      // Then: Chapter titles are varied
      const titles = book.chapters.map(ch => ch.title);
      const uniqueTitles = new Set(titles);
      
      // Should have some variety in titles (not all identical)
      expect(uniqueTitles.size).toBeGreaterThan(Math.min(5, book.chapters.length / 2));
      
      // All titles should include chapter numbers
      titles.forEach(title => {
        expect(title).toMatch(/Chapter \d+/);
      });
    });

    test('Word counts are realistic for web novel chapters', async () => {
      // Given: Imported book
      const url = 'https://www.royalroad.com/fiction/777/word-count-test';
      const book = await bookImportService.importBook(url);

      // When: Checking chapter word counts
      // Then: Word counts are in realistic range for web novels
      book.chapters.forEach(chapter => {
        expect(chapter.wordCount).toBeGreaterThan(10); // Minimum meaningful content
        expect(chapter.wordCount).toBeLessThan(10000); // Not excessively long
        
        // Word count should match actual content
        const actualWords = chapter.content.split(/\s+/).filter(w => w.length > 0).length;
        expect(chapter.wordCount).toBe(actualWords);
      });
    });

    test('Import service handles concurrent operations safely', async () => {
      // Given: Multiple import requests
      const urls = [
        'https://www.royalroad.com/fiction/111/concurrent-test-1',
        'https://www.royalroad.com/fiction/222/concurrent-test-2',
      ];

      // When: Running concurrent imports
      const results = await Promise.all(
        urls.map(url => bookImportService.importBook(url))
      );

      // Then: All imports complete successfully
      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('chapters');
        expect(result.chapters.length).toBeGreaterThan(0);
      });

      // Results should be different (not sharing state)
      expect(results[0].title).not.toBe(results[1].title);
    });
  });

  describe('Integration Ready', () => {
    test('Imported books have all required fields for library integration', async () => {
      // Given: Book import service
      const url = 'https://www.royalroad.com/fiction/999/integration-test';

      // When: Importing book
      const book = await bookImportService.importBook(url);

      // Then: All library-required fields are present
      const requiredFields = [
        'title', 'author', 'description', 'tags', 'status', 
        'chapters', 'sourceUrl', 'language'
      ];

      requiredFields.forEach(field => {
        expect(book).toHaveProperty(field);
        expect(book[field as keyof typeof book]).toBeDefined();
      });

      // Chapters have required structure
      book.chapters.forEach(chapter => {
        expect(chapter).toHaveProperty('title');
        expect(chapter).toHaveProperty('content');
        expect(chapter).toHaveProperty('chapterNumber');
        expect(chapter).toHaveProperty('wordCount');
      });
    });
  });
});