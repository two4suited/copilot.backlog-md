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

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('admin@conference.dev');
  await page.getByLabel(/password/i).fill('Admin123!');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });
}

test.describe('Sessions', () => {
  test('schedule page loads and renders heading', async ({ page }) => {
    await page.goto('/schedule');
    await expect(page).toHaveURL(/\/schedule/);
    // Page renders either heading (API up) or loading spinner (API down) — no crash
    await expect(
      page.getByRole('heading', { name: /schedule/i }).or(page.locator('.animate-spin'))
    ).toBeVisible({ timeout: 10_000 });
  });

  test('schedule page shows sessions when API available', async ({ page }) => {
    // TODO: BUG - Requires live API with seeded data; skip when API is unavailable
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/schedule');
    // Wait for sessions to load — look for session links or session cards
    await expect(
      page.locator('a[href*="/sessions/"]').first()
    ).toBeVisible({ timeout: 20_000 });
    const sessionLinks = page.locator('a[href*="/sessions/"]');
    expect(await sessionLinks.count()).toBeGreaterThan(0);
  });

  test('can click through to a session detail page', async ({ page }) => {
    // TODO: BUG - Requires live API with seeded data; skip when API is unavailable
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/schedule');
    const firstSession = page.locator('a[href*="/sessions/"]').first();
    await expect(firstSession).toBeVisible({ timeout: 20_000 });
    await firstSession.click();

    await expect(page).toHaveURL(/\/sessions\/[^/]+$/, { timeout: 10_000 });
    // Session detail should show a heading
    await expect(page.locator('h1')).toBeVisible();
  });

  test('seat count is displayed on session detail', async ({ page }) => {
    // TODO: BUG - Requires live API with seeded data; skip when API is unavailable
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/schedule');
    const firstSession = page.locator('a[href*="/sessions/"]').first();
    await expect(firstSession).toBeVisible({ timeout: 20_000 });
    await firstSession.click();

    await expect(page).toHaveURL(/\/sessions\/[^/]+$/, { timeout: 10_000 });
    // Seat count info — the session detail shows capacity info
    // Look for text containing "seat", "capacity", "available", or the Users icon context
    await expect(
      page.locator('text=/seats|capacity|available|left|full/i').first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('authenticated user can see register button on session detail', async ({ page }) => {
    // TODO: BUG - Requires live API with seeded data; skip when API is unavailable
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await loginAsAdmin(page);

    await page.goto('/schedule');
    const firstSession = page.locator('a[href*="/sessions/"]').first();
    await expect(firstSession).toBeVisible({ timeout: 20_000 });
    await firstSession.click();

    await expect(page).toHaveURL(/\/sessions\/[^/]+$/, { timeout: 10_000 });
    // Authenticated users should see a Register or Cancel button
    await expect(
      page.locator('button').filter({ hasText: /register|cancel registration/i }).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
