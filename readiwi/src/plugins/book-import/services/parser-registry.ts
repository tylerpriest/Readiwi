/**
 * Parser Registry - Readiwi v4.0
 * Central registry for managing book import parsers
 */

import { BaseParser, ParserRegistry, ParsedBook, ParserProgress } from '../types/parser-types';
import { RoyalRoadParser } from '../parsers/royal-road-parser';

export class ParserRegistryService {
  private parsers: ParserRegistry = {};
  private settings: { [parserId: string]: boolean } = {};
  
  constructor() {
    this.initializeParsers();
    this.loadSettings();
  }
  
  /**
   * Initialize all available parsers
   */
  private initializeParsers(): void {
    // Register built-in parsers
    this.registerParser(new RoyalRoadParser());
    
    // TODO: Add more parsers
    // this.registerParser(new WebNovelParser());
    // this.registerParser(new NovelUpdatesParser());
    // this.registerParser(new GenericParser());
  }
  
  /**
   * Register a new parser
   */
  registerParser(parser: BaseParser): void {
    if (this.parsers[parser.id]) {
      console.warn(`Parser ${parser.id} is already registered, overwriting`);
    }
    
    this.parsers[parser.id] = parser;
    
    // Enable by default unless explicitly disabled
    if (!(parser.id in this.settings)) {
      this.settings[parser.id] = parser.config.enabled;
    }
    
    console.log(`Registered parser: ${parser.config.name} (${parser.id})`);
  }
  
  /**
   * Get all registered parsers
   */
  getAllParsers(): BaseParser[] {
    return Object.values(this.parsers);
  }
  
  /**
   * Get all enabled parsers
   */
  getEnabledParsers(): BaseParser[] {
    return Object.values(this.parsers).filter(parser => 
      this.settings[parser.id] && parser.config.enabled
    );
  }
  
  /**
   * Get parser by ID
   */
  getParser(parserId: string): BaseParser | null {
    return this.parsers[parserId] || null;
  }
  
  /**
   * Find appropriate parser for a URL
   */
  findParserForUrl(url: string): BaseParser | null {
    const enabledParsers = this.getEnabledParsers();
    
    for (const parser of enabledParsers) {
      if (parser.canParse(url)) {
        return parser;
      }
    }
    
    return null;
  }
  
  /**
   * Get supported domains across all enabled parsers
   */
  getSupportedDomains(): string[] {
    const domains = new Set<string>();
    
    this.getEnabledParsers().forEach(parser => {
      parser.config.supportedDomains.forEach(domain => domains.add(domain));
    });
    
    return Array.from(domains).sort();
  }
  
  /**
   * Check if a URL is supported
   */
  isUrlSupported(url: string): boolean {
    return this.findParserForUrl(url) !== null;
  }
  
  /**
   * Parse a book using the appropriate parser
   */
  async parseBook(url: string, progressCallback?: (progress: ParserProgress) => void): Promise<ParsedBook> {
    const parser = this.findParserForUrl(url);
    
    if (!parser) {
      throw new Error(`Unsupported source URL: ${url}`);
    }
    
    console.log(`Using parser: ${parser.config.name} for ${url}`);
    
    try {
      return await parser.parseBook(url, progressCallback);
    } catch (error) {
      console.error(`Parser ${parser.id} failed:`, error);
      throw new Error(`Failed to parse book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Enable/disable a parser
   */
  setParserEnabled(parserId: string, enabled: boolean): void {
    if (!this.parsers[parserId]) {
      throw new Error(`Parser ${parserId} not found`);
    }
    
    this.settings[parserId] = enabled;
    this.saveSettings();
    
    console.log(`Parser ${parserId} ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Get parser settings
   */
  getParserSettings(): { [parserId: string]: boolean } {
    return { ...this.settings };
  }
  
  /**
   * Update parser settings
   */
  updateParserSettings(settings: { [parserId: string]: boolean }): void {
    // Only update settings for registered parsers
    Object.keys(settings).forEach(parserId => {
      if (this.parsers[parserId] && typeof settings[parserId] === 'boolean') {
        this.settings[parserId] = settings[parserId];
      }
    });
    
    this.saveSettings();
  }
  
  /**
   * Get parser statistics
   */
  getParserStats(): Array<{
    id: string;
    name: string;
    enabled: boolean;
    supportedDomains: string[];
    description: string;
  }> {
    return Object.values(this.parsers).map(parser => ({
      id: parser.id,
      name: parser.config.name,
      enabled: Boolean(this.settings[parser.id] && parser.config.enabled),
      supportedDomains: parser.config.supportedDomains,
      description: parser.config.description
    }));
  }
  
  /**
   * Test parser functionality
   */
  async testParser(parserId: string, testUrl: string): Promise<{
    success: boolean;
    error?: string;
    metadata?: {
      title: string;
      author: string;
      chapterCount: number;
    };
  }> {
    const parser = this.getParser(parserId);
    
    if (!parser) {
      return { success: false, error: `Parser ${parserId} not found` };
    }
    
    if (!parser.canParse(testUrl)) {
      return { success: false, error: `Parser cannot handle URL: ${testUrl}` };
    }
    
    try {
      const result = await parser.parseBook(testUrl);
      return {
        success: true,
        metadata: {
          title: result.title,
          author: result.author,
          chapterCount: result.chapters.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('readiwi-parser-settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load parser settings:', error);
    }
  }
  
  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('readiwi-parser-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save parser settings:', error);
    }
  }
}

// Export singleton instance
export const parserRegistry = new ParserRegistryService();