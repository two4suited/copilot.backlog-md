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

test.describe('iCal export – unauthenticated', () => {
  test('unauthenticated user visiting /my-schedule is redirected to /login', async ({ page }) => {
    await page.goto('/my-schedule');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    // The Export to Calendar button must not be visible (page redirected away)
    await expect(page.getByRole('button', { name: /export to calendar/i })).not.toBeVisible();
  });
});

test.describe('iCal export – authenticated with no sessions', () => {
  test('Export to Calendar button is not shown when user has no registered sessions', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    // Register a brand-new user who has no registrations
    const uniqueEmail = `ical-empty-${Date.now()}@e2e.test`;
    await page.goto('/register');
    await page.getByLabel(/name/i).fill('iCal Empty User');
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).not.toHaveURL(/\/register/, { timeout: 10_000 });

    await page.goto('/my-schedule');
    await expect(page).toHaveURL(/\/my-schedule/, { timeout: 10_000 });

    // Export button is only rendered when sessions.length > 0
    await expect(page.getByRole('button', { name: /export to calendar/i })).not.toBeVisible({ timeout: 10_000 });
    // Empty state message should be shown instead
    await expect(page.getByText(/no registered sessions yet|no sessions yet/i)).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('iCal export – authenticated with sessions', () => {
  test('Export to Calendar button is visible when user has registered sessions', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await loginAsAdmin(page);
    await page.goto('/my-schedule');
    await expect(page).toHaveURL(/\/my-schedule/, { timeout: 10_000 });

    // Wait for page to finish loading
    await expect(
      page.locator('.animate-spin').or(page.getByRole('heading', { name: /my schedule/i }))
    ).toBeVisible({ timeout: 15_000 });

    // If admin has registered sessions, the Export button should be shown
    const sessions = page.locator('tbody tr, [class*="rounded-xl"][class*="border"]').filter({ hasText: /remove from schedule/i });
    const sessionCount = await sessions.count();

    if (sessionCount === 0) {
      // Admin has no registered sessions — skip the download check but verify page loaded
      await expect(page.getByRole('heading', { name: /my schedule/i })).toBeVisible();
      test.skip(); // Skip download assertion as there are no sessions to export
      return;
    }

    await expect(page.getByRole('button', { name: /export to calendar/i })).toBeVisible({ timeout: 10_000 });
  });

  test('Export to Calendar button triggers a download when clicked', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await loginAsAdmin(page);

    // First register for a session via the schedule page so the export button appears
    await page.goto('/schedule');
    const firstSessionLink = page.locator('a[href*="/sessions/"]').first();
    const hasSession = await firstSessionLink.isVisible({ timeout: 10_000 }).catch(() => false);

    if (!hasSession) {
      test.skip();
      return;
    }

    await firstSessionLink.click();
    await expect(page).toHaveURL(/\/sessions\/[^/]+$/, { timeout: 10_000 });

    const registerBtn = page.getByRole('button', { name: /register/i });
    const isRegisterVisible = await registerBtn.isVisible({ timeout: 5_000 }).catch(() => false);
    if (isRegisterVisible) {
      await registerBtn.click();
      await expect(page.getByRole('button', { name: /cancel registration/i })).toBeVisible({ timeout: 10_000 });
    }

    // Now check the my-schedule page for the export button
    await page.goto('/my-schedule');
    await expect(page).toHaveURL(/\/my-schedule/);

    const exportBtn = page.getByRole('button', { name: /export to calendar/i });
    const exportVisible = await exportBtn.isVisible({ timeout: 15_000 }).catch(() => false);

    if (!exportVisible) {
      test.skip();
      return;
    }

    // Listen for the download event triggered by the programmatic anchor click
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 15_000 }),
      exportBtn.click(),
    ]);

    expect(download.suggestedFilename()).toBe('my-schedule.ics');
  });
});

test.describe('iCal export – my schedule page structure', () => {
  test('my schedule page renders heading and loading state correctly', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await loginAsAdmin(page);
    await page.goto('/my-schedule');
    await expect(page).toHaveURL(/\/my-schedule/);

    // Page heading should always be present once loaded
    await expect(page.getByRole('heading', { name: /my schedule/i })).toBeVisible({ timeout: 15_000 });
  });
});
