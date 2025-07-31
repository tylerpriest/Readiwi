import { db } from '@/core/services/database-simple';
import { Chapter, ReadingPosition } from '../types/reader-types';

export class ReaderService {
  /**
   * Load all chapters for a book
   */
  async getBookChapters(bookId: number): Promise<Chapter[]> {
    try {
      // @ts-ignore - Progressive development approach  
      const chapters = await db.chapters
        .where('bookId')
        .equals(bookId)
        .sortBy('index');
      
      return chapters.map(this.mapChapterFromDatabase);
    } catch (error) {
      console.error('Failed to load book chapters:', error);
      throw new Error(`Failed to load chapters for book ${bookId}`);
    }
  }

  /**
   * Load a specific chapter
   */
  async getChapter(chapterId: number): Promise<Chapter | null> {
    try {
      // @ts-ignore - Progressive development approach
      const chapter = await db.chapters.get(chapterId);
      
      if (!chapter) {
        return null;
      }
      
      return this.mapChapterFromDatabase(chapter);
    } catch (error) {
      console.error('Failed to load chapter:', error);
      throw new Error(`Failed to load chapter ${chapterId}`);
    }
  }

  /**
   * Get chapter by book and chapter number
   */
  async getChapterByNumber(bookId: number, chapterNumber: number): Promise<Chapter | null> {
    try {
      // @ts-ignore - Progressive development approach
      const chapter = await db.chapters
        .where(['bookId', 'index'])
        .equals([bookId, chapterNumber])
        .first();
      
      if (!chapter) {
        return null;
      }
      
      return this.mapChapterFromDatabase(chapter);
    } catch (error) {
      console.error('Failed to load chapter by number:', error);
      throw new Error(`Failed to load chapter ${chapterNumber} for book ${bookId}`);
    }
  }

  /**
   * Save reading position
   */
  async saveReadingPosition(bookId: number, position: ReadingPosition): Promise<void> {
    try {
      // @ts-ignore - Progressive development approach
      await db.readingProgress.put({
        bookId,
        chapterId: position.chapterId,
        textPosition: position.characterOffset, // Map to database textPosition field
        scrollPosition: position.scrollPosition,
        timestamp: position.timestamp,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to save reading position:', error);
      throw new Error(`Failed to save reading position for book ${bookId}`);
    }
  }

  /**
   * Load reading position for a book
   */
  async getReadingPosition(bookId: number): Promise<ReadingPosition | null> {
    try {
      // @ts-ignore - Progressive development approach
      const position = await db.readingProgress
        .where('bookId')
        .equals(bookId)
        .reverse()
        .sortBy('timestamp')
        .then((positions: any[]) => positions[0] || null);
      
      if (!position) {
        return null;
      }
      
      return {
        chapterId: position.chapterId,
        characterOffset: position.textPosition || 0,
        scrollPosition: position.scrollPosition,
        timestamp: position.timestamp,
      };
    } catch (error) {
      console.error('Failed to load reading position:', error);
      throw new Error(`Failed to load reading position for book ${bookId}`);
    }
  }

  /**
   * Calculate estimated reading time for content
   */
  calculateReadingTime(wordCount: number, wordsPerMinute: number = 200): number {
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Count words in text content
   */
  countWords(content: string): number {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Parse chapter content and extract reading metadata
   */
  parseChapterContent(content: string): { wordCount: number; estimatedReadingTime: number } {
    const wordCount = this.countWords(content);
    const estimatedReadingTime = this.calculateReadingTime(wordCount);
    
    return { wordCount, estimatedReadingTime };
  }

  /**
   * Map database chapter to Chapter interface
   */
  private mapChapterFromDatabase(dbChapter: any): Chapter {
    const { wordCount, estimatedReadingTime } = this.parseChapterContent(dbChapter.content);
    
    return {
      id: dbChapter.id,
      bookId: dbChapter.bookId,
      title: dbChapter.title,
      content: dbChapter.content,
      chapterNumber: dbChapter.chapterNumber,
      wordCount,
      estimatedReadingTime,
      createdAt: dbChapter.createdAt,
      updatedAt: dbChapter.updatedAt,
    };
  }

  /**
   * Create mock chapters for development/testing
   */
  async createMockChapters(bookId: number, count: number = 5): Promise<void> {
    const mockChapters = Array.from({ length: count }, (_, index) => {
      const chapterNumber = index + 1;
      const content = this.generateMockChapterContent(chapterNumber);
      const { wordCount, estimatedReadingTime } = this.parseChapterContent(content);
      
      return {
        bookId,
        title: `Chapter ${chapterNumber}: The Beginning`,
        content,
        chapterNumber,
        wordCount,
        estimatedReadingTime,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    try {
      // @ts-ignore - Progressive development approach
      await db.chapters.bulkAdd(mockChapters);
      console.log(`Created ${count} mock chapters for book ${bookId}`);
    } catch (error) {
      console.error('Failed to create mock chapters:', error);
      throw new Error(`Failed to create mock chapters for book ${bookId}`);
    }
  }

  /**
   * Generate mock chapter content for development
   */
  private generateMockChapterContent(chapterNumber: number): string {
    const paragraphs = [
      `This is the beginning of Chapter ${chapterNumber}. In this chapter, our protagonist continues their journey through the fantastical world they've discovered. The story unfolds with new challenges and mysteries that keep readers engaged.`,
      
      `The morning sun cast long shadows across the cobblestone streets as the main character walked through the bustling marketplace. Vendors called out their wares, children played between the stalls, and the aroma of fresh bread filled the air.`,
      
      `Something extraordinary was about to happen. The character could feel it in their bones - that familiar tingling sensation that preceded every major turning point in their adventure. They paused, looking around carefully.`,
      
      `In the distance, a figure emerged from the morning mist. Tall and mysterious, cloaked in deep blue fabric that seemed to shimmer with its own inner light. This was clearly someone of importance, someone who would change everything.`,
      
      `The conversation that followed would reshape the protagonist's understanding of their quest. Ancient secrets were revealed, long-held beliefs were challenged, and new alliances were formed that would prove crucial in the trials ahead.`,
      
      `As the chapter draws to a close, readers are left with more questions than answers. What will happen next? How will these revelations change the course of the story? The next chapter promises even more excitement and adventure.`,
    ];
    
    return paragraphs.join('\n\n');
  }
}

export const readerService = new ReaderService();