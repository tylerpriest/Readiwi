/**
 * Royal Road Parser - Readiwi v4.0
 * Specialized parser for Royal Road web novels
 */

import { BaseParser, ParsedBookMetadata, ParsedChapter, ParserConfig, ParserSelectors } from '../types/parser-types';

export class RoyalRoadParser extends BaseParser {
  id = 'royal-road';
  
  config: ParserConfig = {
    enabled: true,
    name: 'Royal Road',
    description: 'Parser for Royal Road web novels and light novels',
    supportedDomains: ['royalroad.com', 'www.royalroad.com'],
    rateLimit: {
      requestsPerMinute: 30,
      delayBetweenRequests: 2000 // 2 seconds between requests
    },
    corsProxy: 'https://api.allorigins.win/raw?url=',
    userAgent: 'Readiwi/4.0 Book Reader'
  };
  
  selectors: ParserSelectors = {
    // Book metadata selectors (multiple fallbacks for robustness)
    title: [
      'h1[property="name"]',
      '.fic-header h1',
      '.fiction-title h1',
      'h1'
    ],
    author: [
      'h4[property="author"] a',
      '.fic-header h4 span a',
      '.author-link a',
      '[property="author"]'
    ],
    description: [
      '.description [property="description"]',
      '.fiction-info .description',
      '.description',
      '[property="description"]'
    ],
    coverImage: [
      '.cover-art-container img',
      '.fiction-cover img',
      '.cover img'
    ],
    tags: [
      '.tags .label',
      '.fiction-info .tags .label',
      '.genre-list .label'
    ],
    status: [
      '.status-container .label',
      '.fiction-status .label',
      '.status .label'
    ],
    chapterLinks: [
      '#chapters a[href*="/chapter/"]',
      '.chapter-row a[href*="/chapter/"]',
      'a[href*="/chapter/"]'
    ],
    
    // Chapter content selectors
    chapterTitle: [
      'h1.font-white',
      '.chapter-title h1',
      '.chapter-title',
      'h1'
    ],
    chapterContent: [
      '.chapter-content',
      '.portlet-body',
      '.page-content-wrapper',
      '.chapter-inner'
    ],
    
    // Elements to remove (WebToEpub inspired)
    removeSelectors: [
      'script',
      'style',
      'noscript',
      '.ad',
      '.advertisement',
      '.author-note-portlet',
      '.hidden',
      '.watermark',
      '.chapter-nav',
      '.portlet-title',
      'a[href*="next"]',
      'a[href*="previous"]',
      '.donation',
      '.support',
      '[class*="nav"]',
      '[id*="nav"]',
      '.comments',
      '.rating',
      '.vote'
    ]
  };
  
  canParse(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return this.config.supportedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  }
  
  extractBookId(url: string): string | null {
    const match = url.match(/fiction\/(\d+)/);
    return match?.[1] ?? null;
  }
  
  protected parseBookMetadata(html: string): ParsedBookMetadata {
    const doc = this.parseHtml(html);
    
    // Extract title
    const title = this.extractTextBySelectors(doc, this.selectors.title) || 'Unknown Title';
    
    // Extract author
    const author = this.extractTextBySelectors(doc, this.selectors.author) || 'Unknown Author';
    
    // Extract description
    const description = this.extractTextBySelectors(doc, this.selectors.description) || 'No description available.';
    
    // Extract cover image
    const coverSelector = this.selectors.coverImage[0];
    const coverElement = coverSelector ? doc.querySelector(coverSelector) as HTMLImageElement : null;
    const coverUrl = coverElement?.src;
    
    // Extract tags
    const tags = this.extractAllTextBySelectors(doc, this.selectors.tags);
    
    // Extract status
    const statusText = this.extractTextBySelectors(doc, this.selectors.status)?.toLowerCase();
    const status: 'ongoing' | 'completed' | 'hiatus' = 
      statusText?.includes('completed') ? 'completed' :
      statusText?.includes('hiatus') ? 'hiatus' : 'ongoing';
    
    // Extract additional metadata
    const ratingElement = doc.querySelector('.rating [property="ratingValue"]');
    const rating = ratingElement ? parseFloat(ratingElement.textContent || '0') : undefined;
    
    const wordCountElement = doc.querySelector('.stats .stat-value');
    const wordCountText = wordCountElement?.textContent?.trim();
    const wordCount = wordCountText ? this.parseWordCount(wordCountText) : undefined;
    
    return {
      title,
      author,
      description,
      ...(coverUrl && { coverUrl }),
      tags,
      status,
      language: 'en', // Royal Road is primarily English
      ...(rating && { rating }),
      ...(wordCount && { wordCount })
    };
  }
  
  protected parseChapterUrls(html: string): string[] {
    const doc = this.parseHtml(html);
    
    // Try different selectors for chapter links
    let chapterLinks: NodeListOf<Element> | null = null;
    for (const selector of this.selectors.chapterLinks) {
      chapterLinks = doc.querySelectorAll(selector);
      if (chapterLinks.length > 0) break;
    }
    
    if (!chapterLinks || chapterLinks.length === 0) {
      console.warn('No chapter links found');
      return [];
    }
    
    const chapterUrls = Array.from(chapterLinks).map(link => {
      const href = (link as HTMLAnchorElement).href || (link as HTMLAnchorElement).getAttribute('href');
      if (!href) return null;
      return href.startsWith('http') ? href : `https://www.royalroad.com${href}`;
    }).filter(Boolean) as string[];
    
    return chapterUrls;
  }
  
  protected parseChapter(html: string, chapterNumber: number, url: string): ParsedChapter {
    const doc = this.parseHtml(html);
    
    // Extract chapter title
    const title = this.extractTextBySelectors(doc, this.selectors.chapterTitle) || `Chapter ${chapterNumber}`;
    
    // Extract chapter content
    let contentElement: Element | null = null;
    for (const selector of this.selectors.chapterContent) {
      contentElement = doc.querySelector(selector);
      if (contentElement) break;
    }
    
    if (!contentElement) {
      throw new Error(`Chapter content not found in ${url}`);
    }
    
    // Clean and extract content
    const content = this.cleanContent(contentElement);
    const wordCount = this.calculateWordCount(content);
    
    // Try to extract publish date
    const dateElement = doc.querySelector('[property="datePublished"]') || 
                       doc.querySelector('.chapter-date') ||
                       doc.querySelector('.published-date');
    const publishedAt = dateElement ? new Date(dateElement.textContent?.trim() || '') : undefined;
    
    return {
      title,
      content,
      chapterNumber,
      wordCount,
      url,
      ...(publishedAt && !isNaN(publishedAt.getTime()) && { publishedAt })
    };
  }
  
  private parseWordCount(text: string): number | undefined {
    // Handle formats like "123,456 words" or "1.2M words" or "456k words"
    const match = text.match(/([\d,\.]+)\s*([kmKM])?\s*words?/i);
    if (!match) return undefined;
    
    const [, numberStr, unit] = match;
    if (!numberStr) return undefined;
    let number = parseFloat(numberStr.replace(/,/g, ''));
    
    if (unit) {
      const multiplier = unit.toLowerCase() === 'k' ? 1000 : 1000000;
      number *= multiplier;
    }
    
    return Math.round(number);
  }
  
  private calculateWordCount(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }
}