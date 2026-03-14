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

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('admin@conference.dev');
  await page.getByLabel(/password/i).fill('Admin123!');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });
}

test.describe('Bookmarks', () => {
  test('bookmark button is visible on schedule page when API available', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/schedule');
    // Wait for sessions to load
    await expect(page.locator('a[href*="/sessions/"]').first()).toBeVisible({ timeout: 20_000 });

    // Bookmark button has aria-label "Add to schedule" when not bookmarked
    const bookmarkBtn = page.getByRole('button', { name: /add to schedule/i }).first();
    await expect(bookmarkBtn).toBeVisible();
  });

  test('clicking bookmark button toggles bookmarked state (unauthenticated)', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/schedule');
    await expect(page.locator('a[href*="/sessions/"]').first()).toBeVisible({ timeout: 20_000 });

    const bookmarkBtn = page.getByRole('button', { name: /add to schedule/i }).first();
    await expect(bookmarkBtn).toBeVisible();
    await bookmarkBtn.click();

    // After clicking, should show bookmarked state (aria-label changes to "Remove from schedule")
    await expect(
      page.getByRole('button', { name: /remove from schedule/i }).first()
    ).toBeVisible({ timeout: 3_000 });
  });

  test('unauthenticated bookmark is stored in localStorage under offline_bookmarks', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    // Clear existing offline bookmarks
    await page.goto('/schedule');
    await page.evaluate(() => localStorage.removeItem('offline_bookmarks'));

    await expect(page.locator('a[href*="/sessions/"]').first()).toBeVisible({ timeout: 20_000 });

    const bookmarkBtn = page.getByRole('button', { name: /add to schedule/i }).first();
    await bookmarkBtn.click();

    // Check localStorage
    const offlineBookmarks = await page.evaluate(() => {
      const raw = localStorage.getItem('offline_bookmarks');
      return raw ? JSON.parse(raw) as string[] : [];
    });
    expect(offlineBookmarks.length).toBeGreaterThan(0);
  });

  test('bookmark persists after page reload (unauthenticated, localStorage)', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/schedule');
    await page.evaluate(() => localStorage.removeItem('offline_bookmarks'));

    await expect(page.locator('a[href*="/sessions/"]').first()).toBeVisible({ timeout: 20_000 });

    // Capture the session ID from the first bookmark button's closest session link
    const bookmarkBtn = page.getByRole('button', { name: /add to schedule/i }).first();
    await bookmarkBtn.click();

    // Confirm it shows bookmarked
    await expect(
      page.getByRole('button', { name: /remove from schedule/i }).first()
    ).toBeVisible({ timeout: 3_000 });

    // Reload and check localStorage persisted the bookmark
    await page.reload();
    await expect(page.locator('a[href*="/sessions/"]').first()).toBeVisible({ timeout: 20_000 });

    const offlineBookmarks = await page.evaluate(() => {
      const raw = localStorage.getItem('offline_bookmarks');
      return raw ? JSON.parse(raw) as string[] : [];
    });
    expect(offlineBookmarks.length).toBeGreaterThan(0);

    // At least one bookmark button should show "Remove from schedule"
    await expect(
      page.getByRole('button', { name: /remove from schedule/i }).first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('authenticated user bookmark uses API (registration)', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await loginAsAdmin(page);

    await page.goto('/schedule');
    await expect(page.locator('a[href*="/sessions/"]').first()).toBeVisible({ timeout: 20_000 });

    // Look for a session not yet bookmarked
    const addBtn = page.getByRole('button', { name: /add to schedule/i }).first();
    if (!(await addBtn.isVisible())) {
      // All might already be bookmarked; cancel one first
      const removeBtn = page.getByRole('button', { name: /remove from schedule/i }).first();
      await removeBtn.click();
      await page.waitForTimeout(500);
    }

    const bookmarkBtn = page.getByRole('button', { name: /add to schedule/i }).first();
    await expect(bookmarkBtn).toBeVisible();
    await bookmarkBtn.click();

    // Should transition to bookmarked state via API
    await expect(
      page.getByRole('button', { name: /remove from schedule/i }).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('toggling bookmark off removes bookmarked state', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/schedule');
    await page.evaluate(() => localStorage.removeItem('offline_bookmarks'));

    await expect(page.locator('a[href*="/sessions/"]').first()).toBeVisible({ timeout: 20_000 });

    // Bookmark a session
    const addBtn = page.getByRole('button', { name: /add to schedule/i }).first();
    await addBtn.click();

    const removeBtn = page.getByRole('button', { name: /remove from schedule/i }).first();
    await expect(removeBtn).toBeVisible({ timeout: 3_000 });

    // Toggle off
    await removeBtn.click();

    await expect(
      page.getByRole('button', { name: /add to schedule/i }).first()
    ).toBeVisible({ timeout: 3_000 });
  });
});
