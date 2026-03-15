import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'https://localhost:7133';

async function isApiAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`).catch(() => null);
    return !!res && res.ok;
  } catch {
    return false;
  }
}

test.describe('Conferences', () => {
  test('home page loads without errors', async ({ page }) => {
    await page.goto('/');
    // No uncaught errors — page should render the main layout
    await expect(page).toHaveTitle(/.+/);
    // The layout header should be visible
    await expect(page.locator('header').first()).toBeVisible();
  });

  test('conferences list page renders', async ({ page }) => {
    await page.goto('/conferences');
    await expect(page).toHaveURL(/\/conferences/);
    // Page renders either heading (API up) or loading spinner (API down) — no crash
    await expect(
      page.getByRole('heading', { name: /conferences/i }).or(page.locator('.animate-spin'))
    ).toBeVisible({ timeout: 10_000 });
  });

  test('conferences list page shows at least one conference (seeded data)', async ({ page }) => {
    // TODO: BUG - Requires live API with seeded data; skip when API is unavailable
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/conferences');
    // Wait for loading to finish
    await expect(page.locator('[data-testid="conference-card"]').first()).toBeVisible({ timeout: 15_000 });
    const cards = page.locator('[data-testid="conference-card"]');
    await expect(cards).toHaveCount(await cards.count());
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('can navigate to a conference detail', async ({ page }) => {
    // TODO: BUG - Requires live API with seeded data; skip when API is unavailable
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/conferences');
    const firstCard = page.locator('[data-testid="conference-card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    await firstCard.click();

    // Should navigate to /conferences/:id
    await expect(page).toHaveURL(/\/conferences\/[^/]+$/, { timeout: 10_000 });
    // Conference detail should show some content
    await expect(page.locator('h1, h2')).toBeVisible();
  });
});
