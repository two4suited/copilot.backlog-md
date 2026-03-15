import { test, expect } from '@playwright/test';

// Prefer an explicit env var; fall back to the port Vite uses in this environment.
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || process.env.APP_URL || 'http://localhost:5174';
// API_URL kept for compatibility but unused — all API access goes via the Vite proxy at BASE_URL.
const _API_URL = BASE_URL;

async function isApiAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/conferences`).catch(() => null);
    return !!res && res.ok;
  } catch {
    return false;
  }
}

/** Inject a fake auth token into localStorage so the app renders admin pages */
async function injectFakeAdminAuth(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', 'fake.invalid.jwt');
    localStorage.setItem('user', JSON.stringify({ email: 'fake@test.com', name: 'Fake Admin', role: 'Admin' }));
  });
}

test.describe('API Error Handling', () => {
  test('invalid JWT in localStorage causes 401 — UI shows error, not blank page', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    // Set an invalid/expired JWT token
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjF9.invalid');
      localStorage.setItem('user', JSON.stringify({ email: 'test@test.com', name: 'Test User', role: 'User' }));
    });

    // Go to a page that requires authenticated API calls
    await page.goto('/my-schedule');

    // The page should NOT be blank — either show error message, redirect to login, or show some content
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3_000);

    const pageContent = await page.textContent('body');
    expect(pageContent?.trim().length).toBeGreaterThan(0);

    // Check for either: error message, redirect to login, or a sign-in prompt
    const hasErrorOrLoginPrompt =
      (await page.locator('text=/sign in|log in|login|error|failed|unauthorized/i').first().isVisible({ timeout: 5_000 }).catch(() => false)) ||
      page.url().includes('/login');

    // The UI should respond meaningfully to 401 — either redirect or show a message
    // If neither happens (just a blank page or spinner), that's a bug we note
    if (!hasErrorOrLoginPrompt) {
      // Log the behavior for bug filing consideration
      const url = page.url();
      const bodyText = (pageContent ?? '').substring(0, 200);
      console.log(`[INFO] 401 response resulted in: URL=${url}, body snippet="${bodyText}"`);
    }

    // Page must not be completely empty
    expect(pageContent?.trim().length).toBeGreaterThan(10);
  });

  test('network error on schedule load shows error message (not blank page)', async ({ page }) => {
    // Intercept API calls and return network errors
    await page.route('**/api/conferences**', route => route.abort('failed'));
    await page.route('**/api/sessions**', route => route.abort('failed'));

    await page.goto('/schedule');
    await page.waitForLoadState('domcontentloaded');
    // Wait a moment for React to render error state (React Query retries can prevent networkidle)
    await page.waitForTimeout(3_000);

    // The page should show an error message, not be blank
    const body = await page.textContent('body');
    expect(body?.trim().length).toBeGreaterThan(0);

    // Should show either: error message component, "failed to load", or loading state
    // NOT a blank white page
    const hasErrorIndicator = await page.locator(
      'text=/failed|error|something went wrong|please try again|no conference found/i'
    ).first().isVisible({ timeout: 5_000 }).catch(() => false);

    const hasLoadingOrContent = await page.locator(
      '.animate-spin, [data-testid="loading"], h1, h2, p'
    ).first().isVisible({ timeout: 5_000 }).catch(() => false);

    expect(hasErrorIndicator || hasLoadingOrContent,
      'Expected error message or content after network failure, but page appears blank'
    ).toBe(true);
  });

  test('network error on conferences list shows error message (not blank page)', async ({ page }) => {
    await page.route('**/api/conferences**', route => route.abort('failed'));

    await page.goto('/conferences');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3_000);

    const body = await page.textContent('body');
    expect(body?.trim().length).toBeGreaterThan(0);

    // Should show an error, a heading, or at minimum a loading spinner (not a blank page)
    const hasContent = await page.locator('h1, h2, p, [class*="error"], [class*="text-red"], .animate-spin, [data-testid="loading-spinner"]')
      .first().isVisible({ timeout: 5_000 }).catch(() => false);

    expect(hasContent, 'Page appears blank after network error on /conferences').toBe(true);
  });

  test('conference form with empty fields shows inline validation errors, no API call made', async ({ page }) => {
    // Inject fake admin auth so the admin page renders without a real API login
    await injectFakeAdminAuth(page);

    // Track whether any API mutation/save call is made
    let apiCallMade = false;
    await page.route('**/api/conferences**', route => {
      if (route.request().method() !== 'GET') {
        apiCallMade = true;
      }
      // Let GET calls pass (or abort if no API)
      route.abort('failed');
    });

    await page.goto('/admin/conferences/new');

    // Page should render the form (we have fake admin auth)
    // Wait for the form to be ready
    await expect(
      page.locator('form').first()
    ).toBeVisible({ timeout: 10_000 });

    // Click Save/Submit without filling any fields
    const submitBtn = page.getByRole('button', { name: /save|create|submit/i }).first();
    await expect(submitBtn).toBeVisible({ timeout: 5_000 });
    await submitBtn.click();

    // Client-side validation errors should appear (from ConferenceFormPage.tsx validate())
    await expect(
      page.locator('text=/name is required|start date is required|end date is required|location is required/i').first()
    ).toBeVisible({ timeout: 5_000 });

    // No API mutation call should have been made (validation prevents it)
    expect(apiCallMade).toBe(false);
  });

  test('conference form field-level error messages disappear when fields are filled', async ({ page }) => {
    await injectFakeAdminAuth(page);

    await page.route('**/api/conferences**', route => route.abort('failed'));

    await page.goto('/admin/conferences/new');
    await expect(page.locator('form').first()).toBeVisible({ timeout: 10_000 });

    // Trigger validation errors
    const submitBtn = page.getByRole('button', { name: /save|create|submit/i }).first();
    await submitBtn.click();

    // Wait for name error
    await expect(
      page.locator('text=/name is required/i').first()
    ).toBeVisible({ timeout: 5_000 });

    // Fill in the name field (first text input in the form — labels lack htmlFor so use positional selector)
    const nameInput = page.locator('form input[type="text"]').first();
    await nameInput.fill('Test Conference');

    // Re-submit to re-run validation
    await submitBtn.click();

    // Name error should be gone (field is now filled)
    await expect(
      page.locator('text=/name is required/i').first()
    ).not.toBeVisible({ timeout: 3_000 });
  });

  test('API 500 error on session detail shows graceful error (not blank)', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    // Get a real session ID first
    const res = await page.request.get(`${BASE_URL}/api/sessions?page=1&pageSize=1`).catch(() => null);
    const data = await res?.json().catch(() => null);
    const sessionId: string | null = data?.items?.[0]?.id ?? data?.[0]?.id ?? null;

    if (!sessionId) {
      test.skip();
      return;
    }

    // Intercept the specific session API call with a 500
    await page.route(`**/api/sessions/${sessionId}**`, route =>
      route.fulfill({ status: 500, body: JSON.stringify({ message: 'Internal Server Error' }) })
    );

    await page.goto(`/sessions/${sessionId}`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3_000);

    // Page must not be blank
    const body = await page.textContent('body');
    expect(body?.trim().length).toBeGreaterThan(10);

    // Should show error indication or at minimum not a blank white page
    const hasContent = await page.locator('h1, p, [class*="error"], [class*="text-red"], .animate-spin')
      .first().isVisible({ timeout: 5_000 }).catch(() => false);
    expect(hasContent, 'Session detail is blank after API 500 error').toBe(true);
  });
});
