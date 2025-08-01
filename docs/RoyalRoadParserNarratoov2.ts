import { Parser, ParsedBook, ParsedChapter } from '../types';
import * as cheerio from 'cheerio';
import { info, warn, error as logError } from '@/lib/logger';

// Types for Royal Road specific data
interface ChapterData {
  id: number;
  volumeId: number;
  title: string;
  date: string;
  order: number;
  url: string;
}

interface VolumeData {
  id: number;
  title: string;
  cover: string;
  order: number;
}

enum NovelStatus {
  Ongoing = 'ONGOING',
  Completed = 'COMPLETED',
  Hiatus = 'HIATUS',
  Dropped = 'DROPPED',
  Stub = 'STUB',
  Unknown = 'UNKNOWN',
}

// Rate limiting configuration
const RATE_LIMIT_MS = 1500; // 1.5 seconds between requests
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// User agents for rotation
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
];

class RateLimiter {
  private lastRequestTime = 0;

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < RATE_LIMIT_MS) {
      const waitTime = RATE_LIMIT_MS - timeSinceLastRequest;
      info('api', `[RateLimiter] Waiting ${waitTime}ms before next request`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }
}

const rateLimiter = new RateLimiter();

async function fetchWithRetry(
  url: string,
  retries = MAX_RETRIES
): Promise<string> {
  // Wait for rate limit
  await rateLimiter.waitIfNeeded();

  // Select random user agent
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

  const headers = {
    'User-Agent': userAgent,
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    DNT: '1',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0',
  };

  info(
    'api',
    `[fetchWithRetry] Fetching: ${url} (attempt ${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`
  );

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      // Check for rate limiting
      if (response.status === 429 || response.status === 403) {
        logError(
          'api',
          `[fetchWithRetry] Rate limited or blocked: ${response.status}`
        );
        if (retries > 0) {
          // Exponential backoff
          const backoffTime =
            RETRY_DELAY_MS * Math.pow(2, MAX_RETRIES - retries);
          info('api', `[fetchWithRetry] Backing off for ${backoffTime}ms`);
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
          return fetchWithRetry(url, retries - 1);
        }
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Check for Cloudflare challenge
    if (
      html.includes('Checking your browser') ||
      html.includes('cf-browser-verification')
    ) {
      warn('api', '[fetchWithRetry] Cloudflare challenge detected');
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
        return fetchWithRetry(url, retries - 1);
      }
      throw new Error('Cloudflare challenge page detected');
    }

    return html;
  } catch (error) {
    logError('api', `[fetchWithRetry] Error fetching ${url}: ${error}`);
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

function extractChapterData(html: string): {
  chapters: ChapterData[];
  volumes: VolumeData[];
} {
  // Extract chapter data from window.chapters JavaScript variable
  const chapterMatch = html.match(/window\.chapters\s*=\s*(\[[\s\S]*?\]);/);
  const volumeMatch = html.match(/window\.volumes\s*=\s*(\[[\s\S]*?\]);/);

  let chapters: ChapterData[] = [];
  let volumes: VolumeData[] = [];

  if (chapterMatch?.[1]) {
    try {
      chapters = JSON.parse(chapterMatch[1]);
      info(
        'api',
        `[extractChapterData] Found ${chapters.length} chapters in window.chapters`
      );
    } catch (error) {
      logError(
        'api',
        '[extractChapterData] Failed to parse window.chapters: ' + error
      );
    }
  }

  if (volumeMatch?.[1]) {
    try {
      volumes = JSON.parse(volumeMatch[1]);
      info(
        'api',
        `[extractChapterData] Found ${volumes.length} volumes in window.volumes`
      );
    } catch (error) {
      logError(
        'api',
        '[extractChapterData] Failed to parse window.volumes: ' + error
      );
    }
  }

  return { chapters, volumes };
}

function parseNovelStatus(statusText: string): NovelStatus {
  const normalized = statusText.toUpperCase().trim();
  switch (normalized) {
    case 'ONGOING':
      return NovelStatus.Ongoing;
    case 'COMPLETED':
      return NovelStatus.Completed;
    case 'HIATUS':
      return NovelStatus.Hiatus;
    case 'DROPPED':
      return NovelStatus.Dropped;
    case 'STUB':
      return NovelStatus.Stub;
    default:
      return NovelStatus.Unknown;
  }
}

function removeHiddenElements($: cheerio.Root): void {
  // Remove elements with display: none (watermarks)
  $('*').each((_, elem) => {
    const $elem = $(elem);
    const style = $elem.attr('style');
    if (
      (style && style.includes('display: none')) ||
      (style && style.includes('display:none'))
    ) {
      $elem.remove();
    }
  });

  // Remove elements with hidden classes (from style tags)
  $('style').each((_, styleElem) => {
    const styleContent = $(styleElem).html() || '';
    const hiddenClassMatch = styleContent.match(
      /\.([a-zA-Z0-9_-]+)\s*{\s*display:\s*none/
    );
    if (hiddenClassMatch) {
      const hiddenClass = hiddenClassMatch[1];
      $(`.${hiddenClass}`).remove();
    }
  });
}

// This is the advanced fetch implementation for the V2 parser.
// It includes retries, backoff, and user-agent rotation.
async function fetchHtmlV2(
  url: string,
  retries = 3,
  backoff = 300
): Promise<string> {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
  ];
  const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': userAgent },
      });
      if (response.status === 429) {
        // Rate limited, wait and retry
        warn('api', `[V2] Rate limited. Retrying in ${backoff}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        backoff *= 2; // Exponential backoff
        continue;
      }
      if (!response.ok) {
        throw new Error(`[V2] Fetch failed: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      if (i === retries - 1)
        throw new Error(`[V2] All retries failed. Last error: ${error}`);
    }
  }
  throw new Error('[V2] All retries failed.');
}

export async function fetchChapterContent(
  url: string
): Promise<{ content: string; wordCount: number }> {
  const html = await fetchHtmlV2(url);
  const $ = cheerio.load(html);
  const content = $('.chapter-content').html() || '';
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return { content, wordCount };
}

export const royalRoadParserV2: Parser = {
  hostname: 'royalroad.com-v2', // Unique hostname for the manager
  sourceName: 'Royal Road (V2)',

  canParse: (url: URL): boolean => {
    return (
      url.hostname.includes('royalroad.com') &&
      url.pathname.startsWith('/fiction/')
    );
  },

  parse: async (
    url: URL
  ): Promise<{ book: ParsedBook; chapters: ParsedChapter[] }> => {
    info('api', `[RoyalRoadV2] Starting parse for: ${url.toString()}`);
    const startTime = Date.now();

    // Fetch the fiction page
    const html = await fetchHtmlV2(url.toString());
    const $ = cheerio.load(html);

    // Remove hidden elements
    removeHiddenElements($);

    // Extract JavaScript data
    const { chapters: chapterData, volumes: volumeData } =
      extractChapterData(html);

    // --- Extract Book Metadata ---
    const title = $('.fic-title h1').text().trim();

    if (!title) {
      throw new Error('Could not find book title');
    }

    // Author
    const authorName =
      $('h4 a[href*="/profile/"]').text().trim() || 'Unknown Author';

    // Description
    const description =
      $('.description').text().trim() || 'No description available.';

    // Cover Image
    let coverImageUrl = $('.fic-header img').attr('src') || '';

    if (coverImageUrl && !coverImageUrl.startsWith('http')) {
      coverImageUrl = new URL(coverImageUrl, url.origin).toString();
    }

    // Status
    let status = NovelStatus.Unknown;
    $('.label-sm').each((_, elem) => {
      const text = $(elem).text().trim();
      const parsedStatus = parseNovelStatus(text);
      if (parsedStatus !== NovelStatus.Unknown) {
        status = parsedStatus;
        return false; // break
      }
    });

    // Genres and Tags
    const genres: string[] = $('.tags a.label')
      .map((_, el) => $(el).text().trim())
      .get();

    // Statistics
    const stats = {
      followers: $('.stats-content li:contains("Followers") .stat-value')
        .text()
        .trim(),
      pages: $('.stats-content li:contains("Pages") .stat-value').text().trim(),
      views: $('.stats-content li:contains("Views") .stat-value').text().trim(),
      rating: $('.stats-content li:contains("Rating") .stat-value')
        .text()
        .trim(),
    };

    info(
      'api',
      `[RoyalRoadV2] Book metadata extracted: ${title} by ${authorName}`
    );
    info(
      'api',
      `[RoyalRoadV2] Status: ${status}, Genres: ${genres.length}, Stats: ${JSON.stringify(stats)}`
    );

    const book: ParsedBook = {
      title,
      author: {
        id: authorName,
        name: authorName,
      },
      description,
      coverImageUrl,
      tags: genres,
      genre: genres[0] || 'Web Novel',
      sourceUrl: url,
    };

    // --- Process Chapters ---
    const chapters: ParsedChapter[] = chapterData.map(
      (chap: any, index: number) => ({
        title: chap.title,
        chapterNumber: index,
        url: new URL(chap.url, url.origin).toString(),
        content: '', // Content is fetched on demand
        order: index,
      })
    );

    const elapsed = Date.now() - startTime;
    info(
      'api',
      `[RoyalRoadV2] Parse complete in ${elapsed}ms. Found ${chapters.length} chapters`
    );

    return { book, chapters };
  },

  parseChapter: fetchChapterContent,
};
