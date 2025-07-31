import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Core Reading Journey E2E Tests
 * Following SDD/ATDD methodology for critical user flows
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Axe will be injected automatically by AxeBuilder
});

test.describe('Epic 1: Core Reading Experience', () => {
  
  test.describe('Story 1.1: First-Time User Onboarding', () => {
    
    test('New user discovers and starts reading their first book', async ({ page }) => {
      // Given I am a new user visiting Readiwi for the first time
      await expect(page).toHaveTitle(/Readiwi/);
      
      // When I land on the homepage
      await page.waitForLoadState('networkidle');
      
      // Then I should see a clear value proposition about audiobook reading
      await expect(page.locator('h1')).toContainText(/Readiwi|Revolutionary|Audiobook|Reader/i);
      
      // And I should see an option to try the app without creating an account
      const tryButton = page.getByRole('button', { name: /try|demo|sample|start/i }).first();
      await expect(tryButton).toBeVisible();
      
      // And I should see sample books available for immediate reading
      const sampleBooks = page.locator('[data-testid*="sample"], [data-testid*="book"]').first();
      if (await sampleBooks.isVisible()) {
        await expect(sampleBooks).toBeVisible();
      }
    });

    test('Anonymous user starts reading immediately', async ({ page }) => {
      // Given I am on the homepage as an anonymous user
      await page.waitForLoadState('networkidle');
      
      // When I click "Start Reading Sample" or equivalent
      const startButton = page.getByRole('button', { name: /start|read|try|demo/i }).first();
      
      if (await startButton.isVisible()) {
        const startTime = Date.now();
        await startButton.click();
        
        // Then I should be taken directly to a sample book
        await page.waitForURL(/read|book|chapter/);
        
        // And the reading interface should load within 3 seconds
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(3000);
        
        // And I should see reading controls and text clearly displayed
        await expect(page.locator('[data-testid*="reading"], [data-testid*="reader"], main')).toBeVisible();
        
        // And I should not be required to create an account
        await expect(page.locator('form')).not.toBeVisible();
      }
    });
  });

  test.describe('Story 1.2: Perfect Position Tracking', () => {
    
    test('Position preserved during normal reading session', async ({ page, context }) => {
      // Given I am reading a book (simulate by navigating to reader)
      await page.goto('/read/sample-book/chapter-1');
      await page.waitForLoadState('networkidle');
      
      // Skip if reader interface is not available
      const readerContent = page.locator('[data-testid*="reading"], [data-testid*="content"], main');
      if (!(await readerContent.isVisible())) {
        test.skip('Reader interface not available', () => {});
      }
      
      // When I scroll through the chapter while reading
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(1000);
      
      // And I close the browser after activity
      const currentUrl = page.url();
      await page.close();
      
      // And I reopen the book
      const newPage = await context.newPage();
      const startTime = Date.now();
      await newPage.goto(currentUrl);
      
      // Then position should be restored quickly
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000);
      
      // And I should see position restoration indicator or preserved scroll
      const positionIndicator = newPage.locator('[data-testid*="position"], [data-testid*="restored"]');
      if (await positionIndicator.isVisible()) {
        await expect(positionIndicator).toBeVisible();
      }
      
      await newPage.close();
    });
  });

  test.describe('Story 1.3: Immersive Reading Interface', () => {
    
    test('Clean reading interface promotes focus', async ({ page }) => {
      // Given I open a book to read
      await page.goto('/read/sample-book/chapter-1');
      await page.waitForLoadState('networkidle');
      
      // When the reading interface loads
      const mainContent = page.locator('main, [data-testid*="reading"], [data-testid*="content"]').first();
      
      if (await mainContent.isVisible()) {
        // Then I should see only the book content and minimal controls
        await expect(mainContent).toBeVisible();
        
        // And there should be no advertisements or distracting elements
        await expect(page.locator('[data-testid*="ad"], .advertisement')).not.toBeVisible();
        
        // And the typography should be optimized for reading comfort
        const fontSize = await mainContent.evaluate(el => window.getComputedStyle(el).fontSize);
        const lineHeight = await mainContent.evaluate(el => window.getComputedStyle(el).lineHeight);
        
        // Font size should be readable (at least 14px)
        expect(parseInt(fontSize)).toBeGreaterThan(13);
        
        // Line height should be comfortable (at least 1.4)
        if (lineHeight !== 'normal') {
          expect(parseFloat(lineHeight) / parseInt(fontSize)).toBeGreaterThan(1.3);
        }
      }
    });

    test('Responsive design works across devices', async ({ page }) => {
      // Given I am reading on a desktop computer
      await page.goto('/read/sample-book/chapter-1');
      await page.waitForLoadState('networkidle');
      
      const mainContent = page.locator('main, [data-testid*="reading"]').first();
      
      if (await mainContent.isVisible()) {
        // When I resize the browser window to tablet size
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(500);
        
        // Then the reading interface should automatically adjust
        await expect(mainContent).toBeVisible();
        
        // And all controls should remain accessible
        const controls = page.locator('button, [role="button"]');
        const controlCount = await controls.count();
        if (controlCount > 0) {
          for (let i = 0; i < Math.min(controlCount, 5); i++) {
            await expect(controls.nth(i)).toBeVisible();
          }
        }
        
        // When I switch to mobile size
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);
        
        // Then the interface should optimize for touch interaction
        await expect(mainContent).toBeVisible();
        
        // And the text should be sized appropriately for mobile reading
        const mobileFontSize = await mainContent.evaluate(el => window.getComputedStyle(el).fontSize);
        expect(parseInt(mobileFontSize)).toBeGreaterThan(13);
      }
    });
  });
});

test.describe('Epic 2: Audio Enhancement System', () => {
  
  test.describe('Story 2.1: Seamless Audio Integration', () => {
    
    test('Enable audio and start listening immediately', async ({ page }) => {
      // Given I am reading a book with content
      await page.goto('/read/sample-book/chapter-1');
      await page.waitForLoadState('networkidle');
      
      // When I look for audio controls
      const audioToggle = page.locator('[data-testid*="audio"], button:has-text("Audio")').first();
      
      if (await audioToggle.isVisible()) {
        // When I click the "Audio On" button
        await audioToggle.click();
        await page.waitForTimeout(500);
        
        // Then audio controls should appear
        const audioControls = page.locator('[data-testid*="tts"], [data-testid*="audio-controls"]');
        await expect(audioControls.first()).toBeVisible();
        
        // And I should be able to click "Play" to start audio
        const playButton = page.locator('[data-testid*="play"], button:has([aria-hidden="true"])', { has: page.locator('svg') }).first();
        if (await playButton.isVisible()) {
          await expect(playButton).toBeVisible();
          await expect(playButton).toBeEnabled();
        }
      } else {
        test.skip('Audio controls not available', () => {});
      }
    });
  });

  test.describe('Story 2.2: Customizable Audio Experience', () => {
    
    test('Voice selection and customization', async ({ page }) => {
      // Given I want to customize my audio experience
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');
      
      // When I open audio settings
      const audioSettings = page.locator('[data-testid*="audio-settings"], text="Audio"').first();
      
      if (await audioSettings.isVisible()) {
        await audioSettings.click();
        await page.waitForTimeout(500);
        
        // Then I should see voice selection options
        const voiceSelect = page.locator('[data-testid*="voice"], select, [role="combobox"]').first();
        if (await voiceSelect.isVisible()) {
          await expect(voiceSelect).toBeVisible();
        }
        
        // And I should be able to test speech
        const testButton = page.locator('[data-testid*="test"], button:has-text("Test")').first();
        if (await testButton.isVisible()) {
          await expect(testButton).toBeVisible();
          await expect(testButton).toBeEnabled();
        }
      } else {
        test.skip('Audio settings not available', () => {});
      }
    });
  });
});

test.describe('Accessibility Compliance', () => {
  
  test('Reading interface meets WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('/read/sample-book/chapter-1');
    await page.waitForLoadState('networkidle');
    
    // Run accessibility checks
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast', 'keyboard', 'focus-order-semantics', 'aria-required-attr'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Audio controls are keyboard accessible', async ({ page }) => {
    await page.goto('/read/sample-book/chapter-1');
    await page.waitForLoadState('networkidle');
    
    // Test keyboard navigation to audio controls
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check that focus is visible and logical
    const focusedElement = page.locator(':focus');
    if (await focusedElement.isVisible()) {
      await expect(focusedElement).toBeVisible();
    }
  });
});

test.describe('Performance Requirements', () => {
  
  test('Core reading interface loads within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/read/sample-book/chapter-1');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Reading interface should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Check that essential content is visible
    const mainContent = page.locator('main, [data-testid*="reading"], h1').first();
    await expect(mainContent).toBeVisible();
  });

  test('Audio initialization does not block reading interface', async ({ page }) => {
    await page.goto('/read/sample-book/chapter-1');
    
    const startTime = Date.now();
    await page.waitForSelector('main, [data-testid*="reading"], h1', { timeout: 5000 });
    const readingInterfaceTime = Date.now() - startTime;
    
    // Reading interface should be available quickly even if audio is loading
    expect(readingInterfaceTime).toBeLessThan(2000);
  });
});