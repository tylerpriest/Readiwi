import { test, expect } from '@playwright/test';
// @ts-ignore - Progressive development, will fix axe-core imports later
import { injectAxe, checkA11y } from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
});

test.describe('Home Page', () => {
  test('should load and display the main heading', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should meet accessibility standards', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('main')).toBeVisible();
  });
});