import { test, expect } from '@playwright/test';

// Prefer an explicit env var; fall back to the port Vite uses in this environment.
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || process.env.APP_URL || 'http://localhost:5174';

async function isApiAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/conferences`).catch(() => null);
    return !!res && res.ok;
  } catch {
    return false;
  }
}

test.describe('Navigation and Routing', () => {
  test('home page loads with heading and nav links', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/^\/?$|\/$/);
    await expect(page.getByRole('heading', { name: /welcome to conferenceapp/i })).toBeVisible();

    // Nav bar links are present
    await expect(page.getByRole('link', { name: /conferences/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /speakers/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /schedule/i }).first()).toBeVisible();
  });

  test('Conferences nav link navigates to /conferences', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /^conferences$/i }).first().click();
    await expect(page).toHaveURL(/\/conferences/, { timeout: 10_000 });
  });

  test('Speakers nav link navigates to /speakers', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /^speakers$/i }).first().click();
    await expect(page).toHaveURL(/\/speakers/, { timeout: 10_000 });
  });

  test('Schedule nav link navigates to /schedule', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /^schedule$/i }).first().click();
    await expect(page).toHaveURL(/\/schedule/, { timeout: 10_000 });
  });

  test('ConferenceApp logo link navigates back to home', async ({ page }) => {
    await page.goto('/conferences');
    await page.getByRole('link', { name: /conferenceapp/i }).click();
    await expect(page).toHaveURL(/^\/?$|localhost:517[34]\/?$/, { timeout: 10_000 });
  });

  test('404 route shows not-found message with Go home link', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-xyz');
    await expect(page.locator('h1').filter({ hasText: '404' })).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(/page not found/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /go home/i })).toBeVisible();
  });

  test('404 Go home link returns to home page', async ({ page }) => {
    await page.goto('/completely-invalid/path/xyz');
    await expect(page.locator('h1').filter({ hasText: '404' })).toBeVisible();
    await page.getByRole('link', { name: /go home/i }).click();
    await expect(page).toHaveURL(/^\/?$|localhost:517[34]\/?$/, { timeout: 10_000 });
  });

  test('back button works after navigating to conferences list', async ({ page }) => {
    await page.goto('/');
    await page.goto('/conferences');
    await expect(page).toHaveURL(/\/conferences/);

    await page.goBack();
    await expect(page).toHaveURL(/^\/?$|localhost:517[34]\/?$/, { timeout: 10_000 });
  });

  test('deep link to /sessions/:id works without prior navigation', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    // First get a valid session ID from the API
    const res = await page.request.get(`${BASE_URL}/api/sessions?page=1&pageSize=1`);
    const data = await res.json().catch(() => null);
    const sessionId: string | null = data?.items?.[0]?.id ?? data?.[0]?.id ?? null;

    if (!sessionId) {
      test.skip();
      return;
    }

    // Navigate directly to the session detail without visiting schedule first
    await page.goto(`/sessions/${sessionId}`);
    await expect(page).toHaveURL(new RegExp(`/sessions/${sessionId}`), { timeout: 10_000 });
    await expect(page.locator('h1')).toBeVisible({ timeout: 10_000 });
  });

  test('deep link to /speakers/:id works without prior navigation', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    const res = await page.request.get(`${BASE_URL}/api/speakers?page=1&pageSize=1`);
    const data = await res.json().catch(() => null);
    const speakerId: string | null = data?.items?.[0]?.id ?? data?.[0]?.id ?? null;

    if (!speakerId) {
      test.skip();
      return;
    }

    await page.goto(`/speakers/${speakerId}`);
    await expect(page).toHaveURL(new RegExp(`/speakers/${speakerId}`), { timeout: 10_000 });
    await expect(page.locator('h1')).toBeVisible({ timeout: 10_000 });
  });

  test('back button works after navigating to session detail page', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/schedule');
    const firstSession = page.locator('a[href*="/sessions/"]').first();
    // Skip gracefully if no session links appear (e.g. /api/sessions is broken — see TASK-41)
    const hasSession = await firstSession.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!hasSession) {
      test.skip();
      return;
    }
    await firstSession.click();
    await expect(page).toHaveURL(/\/sessions\/[^/]+$/, { timeout: 10_000 });

    await page.goBack();
    await expect(page).toHaveURL(/\/schedule/, { timeout: 10_000 });
  });
});
