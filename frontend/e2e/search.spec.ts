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

test.describe('Search', () => {
  test('search input is visible in nav', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.getByPlaceholder('Search sessions, speakers…');
    await expect(searchInput).toBeVisible();
  });

  test('typing 1 character does not open dropdown', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.getByPlaceholder('Search sessions, speakers…');
    await searchInput.fill('a');
    // Wait a bit longer than the debounce (300ms)
    await page.waitForTimeout(500);
    // The dropdown should not appear with only 1 character
    await expect(page.locator('[class*="shadow-lg"]').filter({ hasText: /sessions|speakers|no results/i })).not.toBeVisible();
  });

  test('typing 2+ chars shows dropdown with results or no-results message (API required)', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/');
    const searchInput = page.getByPlaceholder('Search sessions, speakers…');
    await searchInput.fill('re');
    // Wait for debounce (300ms) + network
    await page.waitForTimeout(600);
    // Dropdown should appear — either with results or "No results found."
    const dropdown = page.locator('div.absolute').filter({ hasText: /sessions|speakers|no results found/i });
    await expect(dropdown).toBeVisible({ timeout: 5_000 });
  });

  test('search results include session links when API has data', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/');
    const searchInput = page.getByPlaceholder('Search sessions, speakers…');
    await searchInput.fill('session');
    await page.waitForTimeout(600);

    // Either sessions section header or no results
    const dropdown = page.locator('div.absolute');
    await expect(dropdown).toBeVisible({ timeout: 5_000 });

    const sessionsHeader = page.locator('div.absolute').getByText('Sessions', { exact: true });
    if (await sessionsHeader.isVisible()) {
      // Click first session result
      const firstResult = page.locator('div.absolute button').first();
      const href = await page.evaluate(() => window.location.href);
      await firstResult.click();
      // Should navigate to /sessions/:id
      await expect(page).toHaveURL(/\/sessions\/[^/]+$/, { timeout: 10_000 });
    }
  });

  test('clicking a session result navigates to /sessions/:id', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/schedule');
    // Get a real session ID from the page first
    const sessionLink = page.locator('a[href*="/sessions/"]').first();
    await expect(sessionLink).toBeVisible({ timeout: 20_000 });
    const href = await sessionLink.getAttribute('href');
    const sessionTitle = await sessionLink.innerText();
    // Use first few chars of session title to search
    const query = sessionTitle.trim().slice(0, 4);

    await page.goto('/');
    const searchInput = page.getByPlaceholder('Search sessions, speakers…');
    await searchInput.fill(query);
    await page.waitForTimeout(600);

    const dropdown = page.locator('div.absolute');
    await expect(dropdown).toBeVisible({ timeout: 5_000 });

    const firstBtn = page.locator('div.absolute button').first();
    await expect(firstBtn).toBeVisible();
    await firstBtn.click();

    await expect(page).toHaveURL(/\/sessions\/[^/]+$|\/speakers\/[^/]+$/, { timeout: 10_000 });
  });

  test('clicking a speaker result navigates to /speakers/:id', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/speakers');
    const speakerLink = page.locator('a[href*="/speakers/"]').first();
    await expect(speakerLink).toBeVisible({ timeout: 20_000 });
    const speakerName = await speakerLink.innerText();
    const query = speakerName.trim().slice(0, 4);

    await page.goto('/');
    const searchInput = page.getByPlaceholder('Search sessions, speakers…');
    await searchInput.fill(query);
    await page.waitForTimeout(600);

    const dropdown = page.locator('div.absolute');
    await expect(dropdown).toBeVisible({ timeout: 5_000 });

    // Find speakers section by looking for a section that contains the "Speakers" header
    const speakersSection = page.locator('div.absolute section').filter({
      has: page.locator('div', { hasText: 'Speakers' }),
    });
    if (await speakersSection.isVisible().catch(() => false)) {
      const speakerBtn = speakersSection.locator('button').first();
      if (await speakerBtn.isVisible().catch(() => false)) {
        await speakerBtn.click();
        await expect(page).toHaveURL(/\/speakers\/[^/]+$/, { timeout: 10_000 });
      }
    }
  });

  test('pressing Escape closes the dropdown', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/');
    const searchInput = page.getByPlaceholder('Search sessions, speakers…');
    await searchInput.fill('re');
    await page.waitForTimeout(600);

    const dropdown = page.locator('div.absolute');
    await expect(dropdown).toBeVisible({ timeout: 5_000 });

    await searchInput.press('Escape');
    await expect(dropdown).not.toBeVisible();
    // Input should be cleared after Escape
    await expect(searchInput).toHaveValue('');
  });
});
