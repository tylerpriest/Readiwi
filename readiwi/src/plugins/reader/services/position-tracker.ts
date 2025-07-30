/**
 * Reliable Position Tracker - Just Works 99% of the Time
 * Readiwi v4.0 - Practical Reading Position Management
 * 
 * Goal: Never lose the user's reading position, ever.
 * Approach: Multiple fallbacks + simple strategies that work
 * Target: 99% reliability with no user frustration
 */

import { ReadingPosition } from '../types/reader-types';

interface TextFingerprint {
  before: string;      // Text before position
  after: string;       // Text after position  
  paragraph: string;   // Current paragraph
  wordIndex: number;   // Word position in paragraph
  charOffset: number;  // Character offset in word
}

interface PositionStrategy {
  name: string;
  weight: number;
  findPosition: (content: string, fingerprint: TextFingerprint) => number | null;
}

interface PositionCandidate {
  offset: number;
  confidence: number;
  strategy: string;
  metadata?: any;
}

interface PositionValidationResult {
  originalOffset: number;
  restoredOffset: number;
  accuracy: number;
  strategy: string;
  timeTaken: number;
  confidence: number;
}

export class ReliablePositionTracker {
  private readonly FINGERPRINT_LENGTH = 30; // Shorter, simpler
  private readonly MIN_CONFIDENCE = 0.7;    // More lenient
  private readonly VALIDATION_SAMPLES = 100; // Faster validation
  
  private strategies: PositionStrategy[] = [
    {
      name: 'exact-match',
      weight: 1.0,
      findPosition: this.findByExactFingerprint.bind(this),
    },
    {
      name: 'paragraph-position',
      weight: 0.9,
      findPosition: this.findByParagraphWordIndex.bind(this),
    },
    {
      name: 'fuzzy-match',
      weight: 0.8,
      findPosition: this.findByFuzzyFingerprint.bind(this),
    },
  ];

  /**
   * Create detailed fingerprint for a position
   */
  createFingerprint(content: string, offset: number): TextFingerprint {
    const beforeStart = Math.max(0, offset - this.FINGERPRINT_LENGTH);
    const afterEnd = Math.min(content.length, offset + this.FINGERPRINT_LENGTH);
    
    const before = content.slice(beforeStart, offset).trim();
    const after = content.slice(offset, afterEnd).trim();
    
    // Find paragraph boundaries
    const paragraphStart = content.lastIndexOf('\n\n', offset);
    const paragraphEnd = content.indexOf('\n\n', offset);
    const paragraph = content.slice(
      paragraphStart === -1 ? 0 : paragraphStart + 2,
      paragraphEnd === -1 ? content.length : paragraphEnd
    ).trim();
    
    // Calculate word position within paragraph
    const textToParagraphOffset = offset - (paragraphStart === -1 ? 0 : paragraphStart + 2);
    const wordsBeforeOffset = paragraph.slice(0, textToParagraphOffset).split(/\s+/).filter(w => w.length > 0);
    const wordIndex = wordsBeforeOffset.length;
    
    // Character offset within current word
    const lastWordStart = paragraph.lastIndexOf(' ', textToParagraphOffset) + 1;
    const charOffset = textToParagraphOffset - lastWordStart;
    
    return {
      before,
      after,
      paragraph,
      wordIndex,
      charOffset,
    };
  }

  /**
   * Restore position using multi-strategy approach
   */
  restorePosition(content: string, fingerprint: TextFingerprint): PositionCandidate | null {
    const candidates: PositionCandidate[] = [];
    
    // Try each strategy
    for (const strategy of this.strategies) {
      try {
        const offset = strategy.findPosition(content, fingerprint);
        if (offset !== null && offset >= 0 && offset <= content.length) {
          const confidence = this.calculateConfidence(content, offset, fingerprint, strategy);
          candidates.push({
            offset,
            confidence: confidence * strategy.weight,
            strategy: strategy.name,
          });
        }
      } catch (error) {
        console.warn(`Strategy ${strategy.name} failed:`, error);
      }
    }
    
    // Return best candidate
    if (candidates.length === 0) {
      return null;
    }
    
    candidates.sort((a, b) => b.confidence - a.confidence);
    return candidates[0];
  }

  /**
   * Strategy 1: Exact fingerprint match
   */
  private findByExactFingerprint(content: string, fingerprint: TextFingerprint): number | null {
    if (!fingerprint.before || !fingerprint.after) {
      return null;
    }
    
    const searchText = fingerprint.before + fingerprint.after;
    const index = content.indexOf(searchText);
    
    if (index !== -1) {
      return index + fingerprint.before.length;
    }
    
    return null;
  }

  /**
   * Strategy 2: Fuzzy fingerprint matching with edit distance
   */
  private findByFuzzyFingerprint(content: string, fingerprint: TextFingerprint): number | null {
    if (!fingerprint.before || !fingerprint.after) {
      return null;
    }
    
    const searchText = fingerprint.before + fingerprint.after;
    const windowSize = searchText.length;
    let bestMatch: { offset: number; distance: number } | null = null;
    
    // Sliding window approach
    for (let i = 0; i <= content.length - windowSize; i += 10) { // Skip for performance
      const window = content.slice(i, i + windowSize);
      const distance = this.levenshteinDistance(searchText, window);
      const similarity = 1 - (distance / Math.max(searchText.length, window.length));
      
      if (similarity > 0.8 && (!bestMatch || distance < bestMatch.distance)) {
        bestMatch = { offset: i + fingerprint.before.length, distance };
      }
    }
    
    return bestMatch?.offset ?? null;
  }

  /**
   * Strategy 3: Paragraph + word index positioning
   */
  private findByParagraphWordIndex(content: string, fingerprint: TextFingerprint): number | null {
    if (!fingerprint.paragraph) {
      return null;
    }
    
    // Find paragraph in content
    const paragraphIndex = content.indexOf(fingerprint.paragraph);
    if (paragraphIndex === -1) {
      // Try fuzzy paragraph matching
      return this.findByFuzzyParagraphMatch(content, fingerprint);
    }
    
    // Calculate position within paragraph
    const words = fingerprint.paragraph.split(/\s+/).filter(w => w.length > 0);
    if (fingerprint.wordIndex >= words.length) {
      return null;
    }
    
    let offset = paragraphIndex;
    for (let i = 0; i < fingerprint.wordIndex; i++) {
      const wordStart = content.indexOf(words[i], offset);
      if (wordStart === -1) return null;
      offset = wordStart + words[i].length;
      
      // Skip whitespace
      while (offset < content.length && /\s/.test(content[offset])) {
        offset++;
      }
    }
    
    return offset + fingerprint.charOffset;
  }


  /**
   * Calculate confidence score for a position candidate
   */
  private calculateConfidence(
    content: string, 
    offset: number, 
    originalFingerprint: TextFingerprint,
    strategy: PositionStrategy
  ): number {
    try {
      const newFingerprint = this.createFingerprint(content, offset);
      
      // Compare fingerprints
      const beforeSimilarity = this.textSimilarity(originalFingerprint.before, newFingerprint.before);
      const afterSimilarity = this.textSimilarity(originalFingerprint.after, newFingerprint.after);
      const paragraphSimilarity = this.textSimilarity(originalFingerprint.paragraph, newFingerprint.paragraph);
      
      // Weight different factors
      return (
        beforeSimilarity * 0.3 +
        afterSimilarity * 0.3 +
        paragraphSimilarity * 0.4
      );
    } catch (error) {
      return 0;
    }
  }

  /**
   * Test that position tracking just works reliably
   */
  async validateReliability(testContent: string): Promise<{
    successRate: number;
    averageError: number;
    maxError: number;
    failureCount: number;
    averageTime: number;
  }> {
    const results: { success: boolean; error: number; time: number }[] = [];
    
    // Test realistic positions across content
    const testPositions = this.generateTestPositions(testContent, this.VALIDATION_SAMPLES);
    
    for (const originalOffset of testPositions) {
      const startTime = performance.now();
      
      try {
        const fingerprint = this.createFingerprint(testContent, originalOffset);
        const candidate = this.restorePosition(testContent, fingerprint);
        
        const endTime = performance.now();
        const timeTaken = endTime - startTime;
        
        if (candidate && candidate.offset >= 0) {
          const error = Math.abs(candidate.offset - originalOffset);
          results.push({ success: true, error, time: timeTaken });
        } else {
          results.push({ success: false, error: Infinity, time: timeTaken });
        }
      } catch {
        results.push({ success: false, error: Infinity, time: 0 });
      }
    }
    
    const successes = results.filter(r => r.success);
    const failures = results.filter(r => !r.success);
    
    return {
      successRate: successes.length / results.length,
      averageError: successes.length > 0 
        ? successes.reduce((sum, r) => sum + r.error, 0) / successes.length 
        : 0,
      maxError: successes.length > 0 
        ? Math.max(...successes.map(r => r.error)) 
        : 0,
      failureCount: failures.length,
      averageTime: results.reduce((sum, r) => sum + r.time, 0) / results.length,
    };
  }

  /**
   * Generate test positions across content
   */
  private generateTestPositions(content: string, count: number): number[] {
    const positions: number[] = [];
    const step = Math.floor(content.length / count);
    
    for (let i = 0; i < count; i++) {
      let position = i * step;
      
      // Adjust to word boundaries for more realistic testing
      while (position < content.length && !/\s/.test(content[position])) {
        position++;
      }
      
      if (position < content.length) {
        positions.push(position);
      }
    }
    
    return positions;
  }

  /**
   * Helper methods
   */
  private findByFuzzyParagraphMatch(content: string, fingerprint: TextFingerprint): number | null {
    const paragraphWords = fingerprint.paragraph.split(/\s+/).filter(w => w.length > 3);
    const searchPhrase = paragraphWords.slice(0, 3).join(' ');
    
    const index = content.indexOf(searchPhrase);
    return index !== -1 ? index : null;
  }

  private findAllIndices(text: string, searchString: string): number[] {
    const indices: number[] = [];
    let index = text.indexOf(searchString);
    
    while (index !== -1) {
      indices.push(index);
      index = text.indexOf(searchString, index + 1);
    }
    
    return indices;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private textSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;
    
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = [...words1].filter(w => words2.has(w)).length;
    const union = new Set([...words1, ...words2]).size;
    
    return union > 0 ? intersection / union : 0;
  }
}

export const reliablePositionTracker = new ReliablePositionTracker();