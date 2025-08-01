/**
 * Book Import Service Tests - Just Works Book Importing
 * Testing that book import functions reliably for users
 */

import { getSupportedSources, importBook, validateUrl, getImportStats } from '../book-import';

describe('User Story: Import Web Novels Easily', () => {
  describe('Source Detection and Validation', () => {
    test('User can check which sources are supported', () => {
      // Given: User wants to know supported sources
      // When: Getting supported sources
      const sources = getSupportedSources();

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
        const result = validateUrl(url);

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
        const result = validateUrl(url);

        // Then: URL is confirmed as valid
        expect(result.valid).toBe(true);
        expect(result.source).toBe('royal-road');
        expect(result.error).toBeUndefined();
      }
    });
  });

  describe('Book Import Process', () => {
    test('User can import a book from Royal Road', async () => {
      // Given: Valid Royal Road URL (real book for testing)
      const url = 'https://www.royalroad.com/fiction/109544/the-art-of-gold-digging';

      // When: Importing the book
      const result = await importBook(url);

      // Then: Book is successfully imported
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('author');
      expect(result).toHaveProperty('chapters');
      expect(result.title).toBeTruthy();
      expect(result.title.length).toBeGreaterThan(0);
      expect(result.chapters.length).toBeGreaterThan(0);
      expect(result.sourceUrl).toBe(url);
    }, 30000);

    test('User receives progress updates during import', async () => {
      // Given: Valid URL and progress tracking
      const url = 'https://www.royalroad.com/fiction/109544/the-art-of-gold-digging';
      const progressUpdates: any[] = [];

      // When: Importing with progress callback
      await importBook(url, (progress) => {
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
    }, 30000);

    test('Import produces realistic book content', async () => {
      // Given: Royal Road URL
      const url = 'https://www.royalroad.com/fiction/109544/the-art-of-gold-digging';

      // When: Importing book
      const book = await importBook(url);

      // Then: Content is realistic and well-formatted
      expect(book.chapters.length).toBeGreaterThan(0); // Has chapters
      
      if (book.chapters.length > 0) {
        const firstChapter = book.chapters[0];
        if (firstChapter) {
          expect(firstChapter.title).toBeTruthy();
          expect(firstChapter.content.length).toBeGreaterThan(100); // Substantial content
          expect(firstChapter.wordCount).toBeGreaterThan(10);
          expect(firstChapter.chapterNumber).toBeGreaterThan(0);
        }
      }

      // Book metadata should be complete
      expect(book.title).toBeTruthy();
      expect(book.author).toBeTruthy();
      expect(book.description).toBeTruthy();
      expect(['ongoing', 'completed', 'hiatus']).toContain(book.status);
    }, 30000);
  });

  describe('Error Handling', () => {
    test('Import fails gracefully for unsupported sources', async () => {
      // Given: Unsupported source URL
      const url = 'https://unsupported-site.com/book/123';

      // When: Attempting to import
      // Then: Clear error is thrown
      await expect(importBook(url)).rejects.toThrow('Unsupported source URL');
    });

    test('Service provides helpful statistics', () => {
      // Given: Import service
      // When: Getting import statistics
      const stats = getImportStats();

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
      const url = 'https://www.royalroad.com/fiction/109544/the-art-of-gold-digging';

      // When: Importing book
      const book = await importBook(url);

      // Then: Chapter titles exist and are meaningful
      if (book.chapters.length > 0) {
        const titles = book.chapters.map(ch => ch.title);
        const uniqueTitles = new Set(titles);
        
        // Should have titles
        expect(uniqueTitles.size).toBeGreaterThan(0);
        
        // All titles should be non-empty
        titles.forEach(title => {
          expect(title).toBeTruthy();
          expect(title.length).toBeGreaterThan(0);
        });
      }
    }, 30000);

    test('Word counts are realistic for web novel chapters', async () => {
      // Given: Imported book
      const url = 'https://www.royalroad.com/fiction/109544/the-art-of-gold-digging';
      const book = await importBook(url);

      // When: Checking chapter word counts
      // Then: Word counts are in realistic range for web novels
      if (book.chapters.length > 0) {
        const firstChapter = book.chapters[0];
        if (firstChapter) {
          expect(firstChapter.wordCount).toBeGreaterThan(10); // Minimum meaningful content
          expect(firstChapter.wordCount).toBeLessThan(50000); // Not excessively long
          
          // Word count should match actual content
          const actualWords = firstChapter.content.split(/\s+/).filter(w => w.length > 0).length;
          expect(firstChapter.wordCount).toBe(actualWords);
        }
      }
    }, 30000);

    test('Import service handles the real Royal Road book correctly', async () => {
      // Given: Real Royal Road URL
      const url = 'https://www.royalroad.com/fiction/109544/the-art-of-gold-digging';

      // When: Running import
      const result = await importBook(url);

      // Then: Import completes successfully
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('chapters');
      expect(result).toHaveProperty('author');
      expect(result.title).toBeTruthy();
      expect(result.author).toBeTruthy();
    }, 30000);
  });

  describe('Integration Ready', () => {
    test('Imported books have all required fields for library integration', async () => {
      // Given: Book import service
      const url = 'https://www.royalroad.com/fiction/109544/the-art-of-gold-digging';

      // When: Importing book
      const book = await importBook(url);

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
      if (book.chapters.length > 0) {
        const firstChapter = book.chapters[0];
        if (firstChapter) {
          expect(firstChapter).toHaveProperty('title');
          expect(firstChapter).toHaveProperty('content');
          expect(firstChapter).toHaveProperty('chapterNumber');
          expect(firstChapter).toHaveProperty('wordCount');
        }
      }
    }, 30000);
  });
});