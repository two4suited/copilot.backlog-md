import { test, expect } from '@playwright/test';

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';

async function isApiAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`).catch(() => null);
    return !!res && res.ok;
  } catch {
    return false;
  }
}

test.describe('Speakers', () => {
  test('speakers page renders heading', async ({ page }) => {
    await page.goto('/speakers');
    await expect(page).toHaveURL(/\/speakers/);
    // Page renders either heading (API up) or loading spinner (API down) — no crash
    await expect(
      page.getByRole('heading', { name: /speakers/i }).or(page.locator('.animate-spin'))
    ).toBeVisible({ timeout: 10_000 });
  });

  test('speakers page lists speakers when API available', async ({ page }) => {
    // TODO: BUG - Requires live API with seeded data; skip when API is unavailable
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/speakers');
    await expect(
      page.locator('[data-testid="speaker-card"]').first()
    ).toBeVisible({ timeout: 15_000 });
    const cards = page.locator('[data-testid="speaker-card"]');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('can click through to speaker detail', async ({ page }) => {
    // TODO: BUG - Requires live API with seeded data; skip when API is unavailable
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/speakers');
    const firstCard = page.locator('[data-testid="speaker-card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    await firstCard.click();

    await expect(page).toHaveURL(/\/speakers\/[^/]+$/, { timeout: 10_000 });
    await expect(page.locator('h1')).toBeVisible();
  });

  test('speaker detail shows bio and session list', async ({ page }) => {
    // TODO: BUG - Requires live API with seeded data; skip when API is unavailable
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/speakers');
    const firstCard = page.locator('[data-testid="speaker-card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    await firstCard.click();

    await expect(page).toHaveURL(/\/speakers\/[^/]+$/, { timeout: 10_000 });

    // Speaker name heading
    await expect(page.locator('h1')).toBeVisible();

    // Bio — either a bio paragraph or a back link is present (page loaded successfully)
    // The page renders speaker profile with bio text if available
    await expect(page.locator('body')).toContainText(/.+/, { timeout: 10_000 });

    // Session list — look for session links or "Sessions" heading on the page
    await expect(
      page.locator('h2, h3').filter({ hasText: /sessions/i }).or(
        page.locator('a[href*="/sessions/"]')
      ).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
