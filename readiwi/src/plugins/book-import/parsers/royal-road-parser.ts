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
    corsProxy: 'https://corsproxy.io/?',
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
      'table#chapters td a[href*="/chapter/"]',
      '#chapters td a[href*="/chapter/"]',
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
      '.chapter-inner',
      '.portlet-body .chapter-inner',
      '.portlet-body',
      '.page-content-wrapper',
      '.chapter-content'
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
    
    // Clean up the document first (WebToEpub approach)
    this.preprocessRawDom(doc as any);
    
    // Extract title - WebToEpub uses div.fic-header div.col h1
    const title = this.extractTextBySelectors(doc, [
      'div.fic-header div.col h1',
      ...this.selectors.title
    ]) || 'Unknown Title';
    
    // Extract author - WebToEpub uses div.fic-header h4 span a
    const author = this.extractTextBySelectors(doc, [
      'div.fic-header h4 span a',
      ...this.selectors.author
    ]) || 'Unknown Author';
    
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
    // First try to extract from JavaScript window.chapters array (modern Royal Road)
    const jsChapters = this.extractChaptersFromJavaScript(html);
    if (jsChapters.length > 0) {
      console.log(`Found ${jsChapters.length} chapters from JavaScript`);
      return jsChapters;
    }
    
    // Fallback to HTML parsing (older approach)
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
      // Always use getAttribute to avoid CORS proxy URL resolution issues
      const href = (link as HTMLAnchorElement).getAttribute('href');
      if (!href) return null;
      
      // Ensure we build the correct Royal Road URL
      if (href.startsWith('http')) {
        return href;
      } else if (href.startsWith('/')) {
        return `https://www.royalroad.com${href}`;
      } else {
        return `https://www.royalroad.com/${href}`;
      }
    }).filter(Boolean) as string[];
    
    console.log(`Found ${chapterUrls.length} chapters from HTML parsing`);
    return chapterUrls;
  }
  
  /**
   * Extract chapter URLs from JavaScript window.chapters array
   */
  private extractChaptersFromJavaScript(html: string): string[] {
    try {
      // Look for window.chapters = [...] in the HTML
      const chaptersMatch = html.match(/window\.chapters\s*=\s*(\[.*?\]);/s);
      if (!chaptersMatch) {
        console.log('No window.chapters found in JavaScript');
        return [];
      }
      
      // Parse the JavaScript array safely
      const chaptersJson = chaptersMatch[1];
      if (!chaptersJson) {
        console.warn('Empty chapters JSON');
        return [];
      }
      const chapters = JSON.parse(chaptersJson);
      
      if (!Array.isArray(chapters)) {
        console.warn('window.chapters is not an array');
        return [];
      }
      
      // Extract URLs from chapter objects
      const chapterUrls = chapters
        .filter(chapter => chapter && chapter.url) // Only chapters with URLs
        .map(chapter => {
          const url = chapter.url;
          return url.startsWith('http') ? url : `https://www.royalroad.com${url}`;
        });
      
      return chapterUrls;
    } catch (error) {
      console.warn('Failed to parse window.chapters:', error);
      return [];
    }
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
  
  /**
   * Preprocess DOM to clean up Royal Road specific issues (WebToEpub approach)
   */
  private preprocessRawDom(doc: Document): void {
    // Remove watermarks (hidden paragraphs)
    this.removeWatermarks(doc);
    
    // Remove images with no src
    this.removeImgTagsWithNoSrc(doc);
    
    // Remove random CSS classes that Royal Road generates
    this.removeRandomCssClasses(doc);
    
    // Make hidden elements visible
    this.makeHiddenElementsVisible(doc);
  }
  
  private removeWatermarks(doc: Document): void {
    // Remove hidden paragraphs that are often watermarks
    const hiddenPs = doc.querySelectorAll('p[style*="display: none"], p[style*="display:none"]');
    hiddenPs.forEach(p => p.remove());
  }
  
  private removeImgTagsWithNoSrc(doc: Document): void {
    const imgsWithoutSrc = doc.querySelectorAll('img:not([src]), img[src=""]');
    imgsWithoutSrc.forEach(img => img.remove());
  }
  
  private removeRandomCssClasses(doc: Document): void {
    // Royal Road generates random CSS class names like "cnA1B2C3..."
    const randomClassRegex = /^cn[A-Z][a-zA-Z0-9]{41}$/;
    
    doc.querySelectorAll('p').forEach(element => {
      const classList = Array.from(element.classList);
      const randomClasses = classList.filter(className => randomClassRegex.test(className));
      
      randomClasses.forEach(className => {
        element.classList.remove(className);
      });
    });
  }
  
  private makeHiddenElementsVisible(doc: Document): void {
    // Remove display:none that might hide content
    const hiddenElements = doc.querySelectorAll('[style*="display: none"], [style*="display:none"]');
    hiddenElements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.display = '';
      }
    });
  }
}