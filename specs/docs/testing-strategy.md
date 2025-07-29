# Narrato v4.0 - Complete Testing Strategy

**Version**: 4.0.0  
**Created**: 2025-07-29  
**Purpose**: Comprehensive testing approach for autonomous development  
**Target**: 85%+ test coverage with automated quality gates

## Testing Philosophy

### Core Principles
- **Test-Driven Development**: Write tests before implementation
- **Comprehensive Coverage**: Unit, integration, E2E, and accessibility testing
- **Automated Quality Gates**: Continuous validation throughout development
- **Performance Testing**: Core Web Vitals and benchmark validation
- **Accessibility Testing**: WCAG 2.1 AA compliance verification

### Testing Pyramid

```
    /\
   /  \     E2E Tests (10%)
  /____\    - Critical user journeys
 /      \   - Cross-browser compatibility
/__________\ Integration Tests (30%)
            - Component interactions
            - Store integrations
            
            Unit Tests (60%)
            - Pure functions
            - Component logic
            - Store actions
```

## Test Framework Configuration

### Jest Configuration

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/mock-*.{js,ts}',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  testTimeout: 10000,
};

module.exports = createJestConfig(customJestConfig);
```
#
## Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
    toHaveScreenshot: { threshold: 0.2 },
  },
  use: {
    baseURL: 'http://127.0.0.1:3000',
    headless: true,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Unit Testing Patterns

### Component Testing Template

```typescript
// components/__tests__/BookCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import BookCard from '../BookCard';
import { mockBook } from '@/lib/test-utils';

expect.extend(toHaveNoViolations);

describe('BookCard', () => {
  const defaultProps = {
    book: mockBook,
    onSelect: jest.fn(),
    onDelete: jest.fn(),
    onToggleFavorite: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders book information correctly', () => {
      render(<BookCard {...defaultProps} />);
      
      expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      expect(screen.getByText(mockBook.author)).toBeInTheDocument();
      expect(screen.getByAltText(`Cover of ${mockBook.title}`)).toBeInTheDocument();
    });

    it('shows reading progress when available', () => {
      const bookWithProgress = {
        ...mockBook,
        readingProgress: 45,
      };
      
      render(<BookCard {...defaultProps} book={bookWithProgress} />);
      
      expect(screen.getByText('45% complete')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '45');
    });
  });

  describe('Interactions', () => {
    it('calls onSelect when card is clicked', async () => {
      const user = userEvent.setup();
      render(<BookCard {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: /open book/i }));
      
      expect(defaultProps.onSelect).toHaveBeenCalledWith(mockBook);
    });
  });

  describe('Accessibility', () => {
    it('meets WCAG accessibility standards', async () => {
      const { container } = render(<BookCard {...defaultProps} />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<BookCard {...defaultProps} />);
      
      const card = screen.getByRole('button', { name: /open book/i });
      
      // Focus the card
      await user.tab();
      expect(card).toHaveFocus();
      
      // Activate with Enter
      await user.keyboard('{Enter}');
      expect(defaultProps.onSelect).toHaveBeenCalledWith(mockBook);
    });
  });
});
```### 
Store Testing Template

```typescript
// lib/__tests__/books-store.test.ts
import { renderHook, act } from '@testing-library/react';
import { useBooksStore } from '../books-store';
import { mockBook, mockChapter } from '@/lib/test-utils';
import * as database from '../database';

// Mock database functions
jest.mock('../database');
const mockDatabase = database as jest.Mocked<typeof database>;

describe('useBooksStore', () => {
  beforeEach(() => {
    // Reset store state
    useBooksStore.getState().reset();
    jest.clearAllMocks();
  });

  describe('fetchBooks', () => {
    it('loads books from database successfully', async () => {
      const mockBooks = [mockBook];
      mockDatabase.getAllBooks.mockResolvedValue(mockBooks);

      const { result } = renderHook(() => useBooksStore());

      await act(async () => {
        await result.current.fetchBooks();
      });

      expect(result.current.books).toEqual(mockBooks);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('handles database errors gracefully', async () => {
      const error = new Error('Database error');
      mockDatabase.getAllBooks.mockRejectedValue(error);

      const { result } = renderHook(() => useBooksStore());

      await act(async () => {
        await result.current.fetchBooks();
      });

      expect(result.current.books).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Database error');
    });
  });

  describe('addBook', () => {
    it('adds book and chapters successfully', async () => {
      const mockChapters = [mockChapter];
      mockDatabase.addBookWithChapters.mockResolvedValue(1);

      const { result } = renderHook(() => useBooksStore());

      await act(async () => {
        await result.current.addBook(mockBook, mockChapters);
      });

      expect(mockDatabase.addBookWithChapters).toHaveBeenCalledWith(mockBook, mockChapters);
      expect(result.current.books).toContainEqual(expect.objectContaining({
        ...mockBook,
        id: 1,
      }));
    });
  });

  describe('deleteBook', () => {
    it('removes book from store and database', async () => {
      mockDatabase.deleteBookAndChapters.mockResolvedValue();

      const { result } = renderHook(() => useBooksStore());
      
      // Add book first
      act(() => {
        result.current.books = [{ ...mockBook, id: 1 }];
      });

      await act(async () => {
        await result.current.deleteBook(1);
      });

      expect(mockDatabase.deleteBookAndChapters).toHaveBeenCalledWith(1);
      expect(result.current.books).toHaveLength(0);
    });
  });
});
```

## Integration Testing

### Component Integration Tests

```typescript
// tests/integration/library-management.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LibraryPage } from '@/app/page';
import { TestProviders } from '@/lib/test-utils';

describe('Library Management Integration', () => {
  it('completes full book management workflow', async () => {
    const user = userEvent.setup();
    
    render(
      <TestProviders>
        <LibraryPage />
      </TestProviders>
    );

    // Step 1: Import a book
    await user.click(screen.getByText('Add Story'));
    await user.type(screen.getByLabelText('Book URL'), 'https://example.com/book');
    await user.click(screen.getByText('Import'));

    // Step 2: Wait for import to complete
    await waitFor(() => {
      expect(screen.getByText('Import completed')).toBeInTheDocument();
    }, { timeout: 10000 });

    // Step 3: Verify book appears in library
    expect(screen.getByText('Test Book Title')).toBeInTheDocument();

    // Step 4: Open book for reading
    await user.click(screen.getByText('Test Book Title'));

    // Step 5: Verify reader opens
    await waitFor(() => {
      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
    });

    // Step 6: Navigate to next chapter
    await user.click(screen.getByLabelText('Next chapter'));

    // Step 7: Verify chapter navigation
    expect(screen.getByText('Chapter 2')).toBeInTheDocument();
  });
});
```

## End-to-End Testing

### Critical User Journey Tests

```typescript
// tests/e2e/reading-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Reading Workflow', () => {
  test('user can import book and read with position tracking', async ({ page }) => {
    // Navigate to application
    await page.goto('/');

    // Import a book
    await page.click('[data-testid="add-story-button"]');
    await page.fill('[data-testid="url-input"]', 'https://royalroad.com/fiction/test');
    await page.click('[data-testid="import-button"]');

    // Wait for import to complete
    await expect(page.locator('[data-testid="import-success"]')).toBeVisible({ timeout: 30000 });

    // Open the book
    await page.click('[data-testid="book-card"]');

    // Verify reader opens
    await expect(page.locator('[data-testid="reader-content"]')).toBeVisible();

    // Scroll down to simulate reading
    await page.evaluate(() => window.scrollBy(0, 1000));

    // Wait for position to be saved
    await page.waitForTimeout(3000);

    // Navigate away and back
    await page.click('[data-testid="home-link"]');
    await page.click('[data-testid="book-card"]');

    // Verify position is restored
    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBeGreaterThan(900);
  });

  test('user can use audio features', async ({ page }) => {
    // Navigate to book
    await page.goto('/read/1');

    // Start audio
    await page.click('[data-testid="play-audio-button"]');

    // Verify audio controls appear
    await expect(page.locator('[data-testid="audio-controls"]')).toBeVisible();

    // Verify audio is playing
    await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

    // Adjust audio settings
    await page.click('[data-testid="audio-settings-button"]');
    await page.fill('[data-testid="speech-rate-input"]', '1.5');
    await page.click('[data-testid="apply-settings-button"]');

    // Verify settings are applied
    const speechRate = await page.locator('[data-testid="speech-rate-display"]').textContent();
    expect(speechRate).toBe('1.5x');
  });
});
```

## Accessibility Testing

### Automated Accessibility Tests

```typescript
// tests/accessibility/wcag-compliance.test.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('WCAG 2.1 AA Compliance', () => {
  test('homepage meets accessibility standards', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('reader interface meets accessibility standards', async ({ page }) => {
    await page.goto('/read/1');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('supports keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Test skip links
    await page.keyboard.press('Tab');
    const skipLink = page.locator('[data-testid="skip-to-content"]');
    if (await skipLink.isVisible()) {
      await page.keyboard.press('Enter');
      await expect(page.locator('#main-content')).toBeFocused();
    }
  });
});
```

## Performance Testing

### Core Web Vitals Testing

```typescript
// tests/performance/core-web-vitals.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Core Web Vitals', () => {
  test('homepage meets performance benchmarks', async ({ page }) => {
    await page.goto('/');

    // Measure LCP (Largest Contentful Paint)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });

    expect(lcp).toBeLessThan(2500); // 2.5 seconds

    // Measure CLS (Cumulative Layout Shift)
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          resolve(clsValue);
        }).observe({ entryTypes: ['layout-shift'] });

        // Resolve after a delay to capture layout shifts
        setTimeout(() => resolve(clsValue), 5000);
      });
    });

    expect(cls).toBeLessThan(0.1);
  });

  test('reader loads quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/read/1');
    await page.waitForSelector('[data-testid="reader-content"]');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000); // 2 seconds
  });
});
```

## Quality Gates

### Pre-commit Hooks

```bash
#!/bin/sh
# .husky/pre-commit

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run unit tests
npm run test:unit

# Run accessibility tests
npm run test:a11y
```

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Unit tests
        run: npm run test:unit -- --coverage
      
      - name: Integration tests
        run: npm run test:integration
      
      - name: Build application
        run: npm run build
      
      - name: E2E tests
        run: npm run test:e2e
      
      - name: Performance tests
        run: npm run test:performance
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Test Data Management

### Mock Data Factory

```typescript
// lib/test-utils/mock-factory.ts
export const createMockBook = (overrides: Partial<Book> = {}): Book => ({
  id: 1,
  title: 'Test Book Title',
  author: 'Test Author',
  description: 'Test book description',
  coverUrl: 'https://example.com/cover.jpg',
  sourceUrl: 'https://example.com/book',
  sourceSite: 'example.com',
  totalChapters: 10,
  tags: ['fantasy', 'adventure'],
  status: BookStatus.READY,
  language: 'en',
  isFavorite: false,
  isOfflineAvailable: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  syncStatus: SyncStatus.LOCAL_ONLY,
  version: 1,
  ...overrides,
});

export const createMockChapter = (overrides: Partial<Chapter> = {}): Chapter => ({
  id: 1,
  bookId: 1,
  index: 0,
  title: 'Chapter 1: The Beginning',
  content: '<p>This is the chapter content.</p>',
  wordCount: 1000,
  estimatedReadingTime: 4,
  hasImages: false,
  imageUrls: [],
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  syncStatus: SyncStatus.LOCAL_ONLY,
  version: 1,
  processingStatus: ProcessingStatus.PROCESSED,
  ...overrides,
});
```

### Test Providers

```typescript
// lib/test-utils/test-providers.tsx
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/providers/theme-provider';

interface TestProvidersProps {
  children: ReactNode;
}

export const TestProviders = ({ children }: TestProvidersProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};
```

## Coverage Requirements

### Minimum Coverage Thresholds

- **Statements**: 85%
- **Branches**: 85%
- **Functions**: 85%
- **Lines**: 85%

### Coverage Exclusions

- Type definition files (*.d.ts)
- Mock files (mock-*.ts)
- Test utilities
- Build configuration files
- Development-only code

### Coverage Reporting

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
npm run coverage:open

# Upload coverage to external service
npm run coverage:upload
```

---

**Implementation Guidelines**: Follow these testing patterns for all new code. Ensure tests are written before implementation and all quality gates pass before deployment.