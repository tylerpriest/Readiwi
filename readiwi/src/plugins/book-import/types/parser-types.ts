/**
 * Parser Types - Readiwi v4.0
 * Type definitions for modular book import parsers
 */

export interface ParsedBookMetadata {
  title: string;
  author: string;
  description: string;
  coverUrl?: string;
  tags: string[];
  status: 'ongoing' | 'completed' | 'hiatus';
  language: string;
  rating?: number;
  wordCount?: number;
  chapterCount?: number;
}

export interface ParsedChapter {
  title: string;
  content: string;
  chapterNumber: number;
  wordCount: number;
  url?: string;
  publishedAt?: Date;
}

export interface ParsedBook extends ParsedBookMetadata {
  chapters: ParsedChapter[];
  sourceUrl: string;
}

export interface ParserProgress {
  status: 'pending' | 'fetching' | 'parsing' | 'saving' | 'completed' | 'error';
  currentChapter?: string;
  completedChapters: number;
  totalChapters: number;
  title?: string;
  author?: string;
  error?: string;
  estimatedTimeRemaining?: number;
}

export interface ParserConfig {
  enabled: boolean;
  name: string;
  description: string;
  supportedDomains: string[];
  rateLimit: {
    requestsPerMinute: number;
    delayBetweenRequests: number; // milliseconds
  };
  corsProxy?: string;
  userAgent?: string;
}

export interface ParserSelectors {
  // Book metadata selectors
  title: string[];
  author: string[];
  description: string[];
  coverImage: string[];
  tags: string[];
  status: string[];
  chapterLinks: string[];
  
  // Chapter content selectors
  chapterTitle: string[];
  chapterContent: string[];
  
  // Elements to remove
  removeSelectors: string[];
}

export abstract class BaseParser {
  abstract id: string;
  abstract config: ParserConfig;
  abstract selectors: ParserSelectors;
  
  protected progressCallback?: (progress: ParserProgress) => void;
  private lastRequestTime: number = 0;
  
  private _validated = false;
  
  constructor() {
    // Config validation will happen on first use
  }
  
  abstract canParse(url: string): boolean;
  abstract extractBookId(url: string): string | null;
  
  async parseBook(url: string, progressCallback?: (progress: ParserProgress) => void): Promise<ParsedBook> {
    this.ensureValidated();
    
    if (progressCallback) {
      this.progressCallback = progressCallback;
    }
    
    if (!this.canParse(url)) {
      throw new Error(`Parser ${this.id} cannot parse URL: ${url}`);
    }
    
    if (!this.config.enabled) {
      throw new Error(`Parser ${this.id} is disabled`);
    }
    
    this.notifyProgress({
      status: 'fetching',
      completedChapters: 0,
      totalChapters: 0,
      currentChapter: 'Fetching book metadata'
    });
    
    // Get book metadata and chapter list
    const bookHtml = await this.fetchWithRateLimit(url);
    const metadata = this.parseBookMetadata(bookHtml);
    const chapterUrls = this.parseChapterUrls(bookHtml);
    
    this.notifyProgress({
      status: 'parsing',
      completedChapters: 0,
      totalChapters: chapterUrls.length,
      title: metadata.title,
      author: metadata.author
    });
    
    // Fetch all chapters
    const chapters: ParsedChapter[] = [];
    for (let i = 0; i < chapterUrls.length; i++) {
      const chapterUrl = chapterUrls[i];
      if (!chapterUrl) continue;
      
      this.notifyProgress({
        status: 'parsing',
        completedChapters: i,
        totalChapters: chapterUrls.length,
        currentChapter: `Chapter ${i + 1}`,
        title: metadata.title,
        author: metadata.author
      });
      
      try {
        const chapterHtml = await this.fetchWithRateLimit(chapterUrl);
        const chapter = this.parseChapter(chapterHtml, i + 1, chapterUrl);
        chapters.push(chapter);
      } catch (error) {
        console.warn(`Failed to parse chapter ${i + 1}:`, error);
        // Continue with other chapters
      }
    }
    
    this.notifyProgress({
      status: 'completed',
      completedChapters: chapters.length,
      totalChapters: chapterUrls.length,
      title: metadata.title,
      author: metadata.author
    });
    
    return {
      ...metadata,
      chapters,
      sourceUrl: url
    };
  }
  
  protected abstract parseBookMetadata(html: string): ParsedBookMetadata;
  protected abstract parseChapterUrls(html: string): string[];
  protected abstract parseChapter(html: string, chapterNumber: number, url: string): ParsedChapter;
  
  protected async fetchWithRateLimit(url: string): Promise<string> {
    // Environment check
    if (typeof window === 'undefined' || typeof fetch === 'undefined') {
      throw new Error(`Parser ${this.id} requires browser environment with fetch API`);
    }
    
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minDelay = this.config.rateLimit.delayBetweenRequests;
    
    if (timeSinceLastRequest < minDelay) {
      const waitTime = minDelay - timeSinceLastRequest;
      await this.delay(waitTime);
    }
    
    // CORS proxy fallbacks
    const corsProxies = [
      'https://corsproxy.io/?',
      'https://cors-anywhere.herokuapp.com/',
      'https://api.allorigins.win/raw?url=',
      'https://cors.bridged.cc/',
    ];
    
    let lastError: Error | null = null;
    
    // Try direct fetch first (might work in some environments)
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.config.userAgent || 'Readiwi/4.0'
        }
      });
      
      if (response.ok) {
        this.lastRequestTime = Date.now();
        return await response.text();
      }
    } catch (error) {
      // Direct fetch failed, try proxies
      console.log(`Direct fetch failed for ${url}, trying CORS proxies...`);
    }
    
    // Try each CORS proxy
    for (const proxy of corsProxies) {
      try {
        const fetchUrl = `${proxy}${encodeURIComponent(url)}`;
        console.log(`Trying CORS proxy: ${proxy}`);
        
        const response = await fetch(fetchUrl, {
          headers: {
            'User-Agent': this.config.userAgent || 'Readiwi/4.0'
          }
        });
        
        if (response.ok) {
          console.log(`Success with proxy: ${proxy}`);
          this.lastRequestTime = Date.now();
          return await response.text();
        } else {
          console.warn(`Proxy ${proxy} returned ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn(`Proxy ${proxy} failed:`, error);
        lastError = error as Error;
      }
    }
    
    throw new Error(`All CORS proxies failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }
  
  protected parseHtml(html: string): Document {
    if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
      throw new Error(`Parser ${this.id} requires browser environment with DOMParser`);
    }
    
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
  }
  
  protected extractTextBySelectors(doc: Document, selectors: string[]): string | null {
    for (const selector of selectors) {
      const element = doc.querySelector(selector);
      if (element?.textContent?.trim()) {
        return element.textContent.trim();
      }
    }
    return null;
  }
  
  protected extractAllTextBySelectors(doc: Document, selectors: string[]): string[] {
    const results: string[] = [];
    for (const selector of selectors) {
      const elements = doc.querySelectorAll(selector);
      for (const element of elements) {
        const text = element.textContent?.trim();
        if (text) results.push(text);
      }
    }
    return results;
  }
  
  protected cleanContent(element: Element): string {
    const clone = element.cloneNode(true) as Element;
    
    // Remove unwanted elements
    this.selectors.removeSelectors.forEach(selector => {
      clone.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    // Get text content and clean it up
    let content = clone.textContent || '';
    content = content
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    return content;
  }
  
  protected notifyProgress(progress: ParserProgress): void {
    this.progressCallback?.(progress);
  }
  
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private ensureValidated(): void {
    if (!this._validated) {
      this.validateConfig();
      this._validated = true;
    }
  }
  
  private validateConfig(): void {
    if (!this.config.name || !this.config.supportedDomains.length) {
      throw new Error(`Invalid parser config for ${this.id}`);
    }
    
    if (this.config.rateLimit.requestsPerMinute < 1) {
      throw new Error(`Invalid rate limit for parser ${this.id}`);
    }
  }
}

export interface ParserRegistry {
  [parserId: string]: BaseParser;
}