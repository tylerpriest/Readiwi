/**
 * Book Import - Readiwi v4.0
 * Direct interface to parser registry - no unnecessary wrapper
 */

import { parserRegistry } from './parser-registry';
import { ParsedBook, ParserProgress } from '../types/parser-types';

export interface ImportSource {
  id: string;
  name: string;
  baseUrl: string;
  supported: boolean;
  description: string;
}

/**
 * Get list of supported import sources
 */
export function getSupportedSources(): ImportSource[] {
  const parserStats = parserRegistry.getParserStats();
  
  return parserStats.map(parser => ({
    id: parser.id,
    name: parser.name,
    baseUrl: `https://${parser.supportedDomains[0]}`,
    supported: parser.enabled,
    description: parser.description
  }));
}

/**
 * Import a book from any supported source
 */
export async function importBook(
  url: string, 
  onProgress?: (progress: ParserProgress) => void
): Promise<ParsedBook> {
  return await parserRegistry.parseBook(url, onProgress);
}

/**
 * Check if a URL is supported
 */
export function isUrlSupported(url: string): boolean {
  return parserRegistry.isUrlSupported(url);
}

/**
 * Validate a URL format and detect source
 */
export function validateUrl(url: string): { valid: boolean; error?: string; source?: string } {
  try {
    new URL(url);
    
    // Check if URL is supported and get source
    if (parserRegistry.isUrlSupported(url)) {
      const parser = parserRegistry.findParserForUrl(url);
      if (parser?.id) {
        return { valid: true, source: parser.id };
      }
      return { valid: true };
    }
    
    return { valid: false, error: 'Unsupported source URL' };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Get supported domains
 */
export function getSupportedDomains(): string[] {
  return parserRegistry.getSupportedDomains();
}

/**
 * Get parser settings for UI configuration
 */
export function getParserSettings(): { [parserId: string]: boolean } {
  return parserRegistry.getParserSettings();
}

/**
 * Update parser settings
 */
export function updateParserSettings(settings: { [parserId: string]: boolean }): void {
  parserRegistry.updateParserSettings(settings);
}

/**
 * Test a parser with a URL
 */
export async function testParser(parserId: string, testUrl: string) {
  return await parserRegistry.testParser(parserId, testUrl);
}

/**
 * Get import statistics for UI display
 */
export function getImportStats() {
  const parserStats = parserRegistry.getParserStats();
  const supportedSources = parserStats.filter(p => p.enabled).length;
  
  return {
    supportedSources,
    totalSources: parserStats.length,
    features: [
      'Real-time progress tracking',
      'Chapter-by-chapter parsing', 
      'Metadata extraction',
      'Rate-limited requests',
      'Error recovery',
      'Multiple parser support',
      'CORS proxy handling'
    ]
  };
}

// Export the registry for advanced usage
export { parserRegistry };
export type { ParsedBook, ParserProgress };