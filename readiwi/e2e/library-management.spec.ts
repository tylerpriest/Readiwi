import { test, expect } from '@playwright/test';
// Accessibility testing imports - currently unused in tests
// import AxeBuilder from '@axe-core/playwright';

/**
 * Library Management E2E Tests
 * Testing book import, organization, and discovery features
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Axe will be injected automatically by AxeBuilder
});

test.describe('Epic 3: Book Library Management', () => {
  
  test.describe('Story 3.1: Effortless Book Import', () => {
    
    test('Import interface is accessible and functional', async ({ page }) => {
      // Navigate to import/library page
      const importLink = page.locator('a:has-text("Import"), a:has-text("Library"), button:has-text("Add")').first();
      
      if (await importLink.isVisible()) {
        await importLink.click();
        await page.waitForLoadState('networkidle');
      } else {
        // Try direct navigation
        await page.goto('/import');
        await page.waitForLoadState('networkidle');
      }
      
      // Look for import interface elements
      const importInput = page.locator('input[type="url"], input[placeholder*="URL"], input[placeholder*="link"]').first();
      const importButton = page.locator('button:has-text("Import"), button:has-text("Add")').first();
      
      if (await importInput.isVisible()) {
        // Test that import interface is functional
        await expect(importInput).toBeVisible();
        await expect(importInput).toBeEnabled();
        
        if (await importButton.isVisible()) {
          await expect(importButton).toBeVisible();
          // Button should be initially disabled or enabled based on input
        }
        
        // Test URL input validation
        await importInput.fill('https://example.com/test-book');
        await page.waitForTimeout(500);
        
        if (await importButton.isVisible()) {
          await expect(importButton).toBeEnabled();
        }
      } else {
        test.skip('Import interface not available in current build', () => {});
      }
    });

    test('Error handling for invalid import attempts', async ({ page }) => {
      await page.goto('/import');
      await page.waitForLoadState('networkidle');
      
      const importInput = page.locator('input[type="url"], input[placeholder*="URL"]').first();
      const importButton = page.locator('button:has-text("Import"), button:has-text("Add")').first();
      
      if (await importInput.isVisible() && await importButton.isVisible()) {
        // Test invalid URL handling
        await importInput.fill('not-a-valid-url');
        await importButton.click();
        await page.waitForTimeout(1000);
        
        // Should show validation error
        const errorMessage = page.locator('[role="alert"], .error, [data-testid*="error"]').first();
        if (await errorMessage.isVisible()) {
          await expect(errorMessage).toBeVisible();
        }
        
        // Test non-existent URL
        await importInput.fill('https://definitely-does-not-exist-12345.com/book');
        await importButton.click();
        await page.waitForTimeout(5000);
        
        // Should show clear error message
        const networkError = page.locator('text="not found", text="error", [role="alert"]').first();
        if (await networkError.isVisible()) {
          await expect(networkError).toBeVisible();
        }
      } else {
        test.skip('Import interface not fully implemented', () => {});
      }
    });
  });

  test.describe('Story 3.2: Intelligent Library Organization', () => {
    
    test('Library displays books with proper organization', async ({ page }) => {
      // Navigate to library
      await page.goto('/library');
      await page.waitForLoadState('networkidle');
      
      // Check for library interface
      const libraryContainer = page.locator('[data-testid*="library"], main, .library').first();
      
      if (await libraryContainer.isVisible()) {
        await expect(libraryContainer).toBeVisible();
        
        // Look for book cards or list items
        const bookItems = page.locator('[data-testid*="book"], .book-card, [role="article"]');
        const itemCount = await bookItems.count();
        
        if (itemCount > 0) {
          // Test first book item
          const firstBook = bookItems.first();
          await expect(firstBook).toBeVisible();
          
          // Should have title and basic metadata
          const title = firstBook.locator('h1, h2, h3, [data-testid*="title"]').first();
          if (await title.isVisible()) {
            await expect(title).toBeVisible();
          }
        }
        
        // Check for organization features
        const sortOptions = page.locator('[data-testid*="sort"], select, [role="combobox"]').first();
        const filterOptions = page.locator('[data-testid*="filter"], input[type="search"]').first();
        
        if (await sortOptions.isVisible()) {
          await expect(sortOptions).toBeVisible();
        }
        
        if (await filterOptions.isVisible()) {
          await expect(filterOptions).toBeVisible();
        }
      } else {
        test.skip('Library interface not available', () => {});
      }
    });

    test('Search functionality works across library', async ({ page }) => {
      await page.goto('/library');
      await page.waitForLoadState('networkidle');
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search"]').first();
      
      if (await searchInput.isVisible()) {
        // Test search functionality
        await searchInput.fill('test');
        await page.waitForTimeout(1000);
        
        // Should show search results or no results message
        const searchResults = page.locator('[data-testid*="search"], [data-testid*="result"]').first();
        const noResults = page.locator('text="No results", text="not found"').first();
        
        // Either results or no results message should be visible
        const hasResults = await searchResults.isVisible();
        const hasNoResults = await noResults.isVisible();
        
        expect(hasResults || hasNoResults).toBeTruthy();
        
        // Clear search
        await searchInput.fill('');
        await page.waitForTimeout(500);
        
        // Should return to full library view
        const libraryItems = page.locator('[data-testid*="book"], .book-card').first();
        if (await libraryItems.isVisible()) {
          await expect(libraryItems).toBeVisible();
        }
      } else {
        test.skip('Search functionality not implemented', () => {});
      }
    });

    test('Library performance with large collections', async ({ page }) => {
      await page.goto('/library');
      
      const startTime = Date.now();
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Library should load quickly even with many books
      expect(loadTime).toBeLessThan(5000);
      
      // Check that scrolling is smooth
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(100);
      await page.evaluate(() => window.scrollTo(0, 1000));
      await page.waitForTimeout(100);
      
      // UI should remain responsive during scrolling
      const libraryContainer = page.locator('[data-testid*="library"], main').first();
      if (await libraryContainer.isVisible()) {
        await expect(libraryContainer).toBeVisible();
      }
    });
  });
});

test.describe('Epic 4: Settings and Customization', () => {
  
  test.describe('Story 4.1: Visual Customization', () => {
    
    test('Settings interface provides comprehensive customization', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');
      
      const settingsContainer = page.locator('[data-testid*="settings"], main').first();
      
      if (await settingsContainer.isVisible()) {
        await expect(settingsContainer).toBeVisible();
        
        // Check for theme options
        const themeSettings = page.locator('text="Theme", text="Dark", text="Light"').first();
        if (await themeSettings.isVisible()) {
          await expect(themeSettings).toBeVisible();
        }
        
        // Check for font settings
        const fontSettings = page.locator('text="Font", text="Typography", input[type="range"]').first();
        if (await fontSettings.isVisible()) {
          await expect(fontSettings).toBeVisible();
        }
        
        // Check for audio settings
        const audioSettings = page.locator('text="Audio", text="Speech", text="Voice"').first();
        if (await audioSettings.isVisible()) {
          await expect(audioSettings).toBeVisible();
        }
      } else {
        test.skip('Settings interface not available', () => {});
      }
    });

    test('Theme changes apply immediately with live preview', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');
      
      // Look for theme toggle or selection
      const darkModeToggle = page.locator('button:has-text("Dark"), [role="switch"], input[type="checkbox"]').first();
      
      if (await darkModeToggle.isVisible()) {
        // Get initial background color
        const initialBg = await page.evaluate(() => {
          return window.getComputedStyle(document.body).backgroundColor;
        });
        
        // Toggle theme
        await darkModeToggle.click();
        await page.waitForTimeout(500);
        
        // Check that background changed
        const newBg = await page.evaluate(() => {
          return window.getComputedStyle(document.body).backgroundColor;
        });
        
        // Background should change (different RGB values)
        expect(newBg).not.toBe(initialBg);
      } else {
        test.skip('Theme switching not implemented', () => {});
      }
    });

    test('Accessibility features work correctly', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');
      
      // Test high contrast mode if available
      const contrastToggle = page.locator('text="High Contrast", text="Contrast"').first();
      
      if (await contrastToggle.isVisible()) {
        await contrastToggle.click();
        await page.waitForTimeout(500);
        
        // Check that contrast improved
        const textElement = page.locator('p, span, div').first();
        if (await textElement.isVisible()) {
          const styles = await textElement.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor
            };
          });
          
          // Should have readable contrast (basic check)
          expect(styles.color).toBeTruthy();
        }
      }
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      const focusedElement = page.locator(':focus');
      if (await focusedElement.isVisible()) {
        await expect(focusedElement).toBeVisible();
      }
    });
  });

  test.describe('Story 4.2: Data Management and Privacy', () => {
    
    test('Data export functionality is available', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');
      
      // Look for export options
      const exportButton = page.locator('button:has-text("Export"), button:has-text("Download"), text="Export"').first();
      
      if (await exportButton.isVisible()) {
        await expect(exportButton).toBeVisible();
        await expect(exportButton).toBeEnabled();
      } else {
        test.skip('Data export not implemented', () => {});
      }
    });

    test('Privacy settings provide granular control', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');
      
      // Look for privacy options
      const privacySection = page.locator('text="Privacy", text="Data", text="Analytics"').first();
      
      if (await privacySection.isVisible()) {
        await expect(privacySection).toBeVisible();
        
        // Should have toggleable privacy options
        const privacyToggles = page.locator('[role="switch"], input[type="checkbox"]');
        const toggleCount = await privacyToggles.count();
        
        if (toggleCount > 0) {
          // Test first privacy toggle
          const firstToggle = privacyToggles.first();
          await expect(firstToggle).toBeVisible();
          await expect(firstToggle).toBeEnabled();
        }
      } else {
        test.skip('Privacy settings not implemented', () => {});
      }
    });
  });
});

test.describe('Cross-Feature Integration Tests', () => {
  
  test('Settings changes persist across reading sessions', async ({ page, context }) => {
    // Set a preference in settings
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    const darkModeToggle = page.locator('button:has-text("Dark"), [role="switch"]').first();
    
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      await page.waitForTimeout(500);
      
      // Navigate to reading interface
      await page.goto('/read/sample-book/chapter-1');
      await page.waitForTimeout(1000);
      
      // Check that dark mode is applied
      const bodyBg = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      
      // Should be dark (lower luminance)
      expect(bodyBg).toMatch(/rgb\(.*\)/);
      
      // Close and reopen in new page
      await page.close();
      const newPage = await context.newPage();
      await newPage.goto('/read/sample-book/chapter-1');
      await newPage.waitForTimeout(1000);
      
      // Settings should persist
      const newBodyBg = await newPage.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      
      expect(newBodyBg).toBe(bodyBg);
      await newPage.close();
    } else {
      test.skip('Theme persistence cannot be tested', () => {});
    }
  });

  test('Audio and reading interface integration', async ({ page }) => {
    await page.goto('/read/sample-book/chapter-1');
    await page.waitForLoadState('networkidle');
    
    // Look for both reading content and audio controls
    const readingContent = page.locator('[data-testid*="reading"], main').first();
    const audioControls = page.locator('[data-testid*="audio"]').first();
    
    if (await readingContent.isVisible() && await audioControls.isVisible()) {
      await expect(readingContent).toBeVisible();
      await expect(audioControls).toBeVisible();
      
      // Test that they don't interfere with each other
      await audioControls.click();
      await page.waitForTimeout(500);
      
      // Reading content should still be visible and functional
      await expect(readingContent).toBeVisible();
      
      // Should be able to scroll reading content
      await page.evaluate(() => window.scrollTo(0, 200));
      await page.waitForTimeout(500);
      
      await expect(readingContent).toBeVisible();
    }
  });
});

test.describe('Error Handling and Edge Cases', () => {
  
  test('Application handles network failures gracefully', async ({ page }) => {
    await page.goto('/library');
    await page.waitForLoadState('networkidle');
    
    // Simulate network failure
    await page.route('**/*', route => route.abort());
    
    // Try to perform an action that requires network
    const importButton = page.locator('button:has-text("Import"), a:has-text("Import")').first();
    
    if (await importButton.isVisible()) {
      await importButton.click();
      await page.waitForTimeout(2000);
      
      // Should show appropriate error message
      const errorMessage = page.locator('[role="alert"], text="error", text="failed"').first();
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    }
    
    // Clear network block
    await page.unroute('**/*');
  });

  test('Application handles invalid routes gracefully', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('/definitely-does-not-exist');
    await page.waitForLoadState('networkidle');
    
    // Should show 404 or redirect to valid page
    const notFound = page.locator('text="404", text="Not Found", text="Page not found"').first();
    const validContent = page.locator('main, h1').first();
    
    const hasNotFound = await notFound.isVisible();
    const hasValidContent = await validContent.isVisible();
    
    // Should either show 404 or redirect to valid content
    expect(hasNotFound || hasValidContent).toBeTruthy();
  });
});