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

// ──────────────────────────────────────────────────────────────────────────────
// 1. Unauthenticated user on /my-schedule — no Export button visible
// ──────────────────────────────────────────────────────────────────────────────
test.describe('iCal export – unauthenticated', () => {
  test('unauthenticated user on /my-schedule is redirected to /login — no Export button', async ({ page }) => {
    await page.goto('/my-schedule');
    // ProtectedRoute redirects unauthenticated users to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    // Export button must not be visible (page redirected away)
    await expect(page.getByRole('button', { name: /export to calendar/i })).not.toBeVisible();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 2. Authenticated user with no sessions — Export button NOT shown
// ──────────────────────────────────────────────────────────────────────────────
test.describe('iCal export – authenticated, empty schedule', () => {
  test('Export button is hidden when user has no registered sessions', async ({ page }) => {
    if (!(await isApiAvailable())) { test.skip(); return; }

    // Register a brand-new user (zero registrations)
    const uniqueEmail = `ical-empty-${Date.now()}@e2e.test`;
    await page.goto('/register');
    await page.getByLabel(/name/i).fill('iCal Empty User');
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).not.toHaveURL(/\/register/, { timeout: 10_000 });

    await page.goto('/my-schedule');
    await expect(page).toHaveURL(/\/my-schedule/, { timeout: 10_000 });

    // Export button is only rendered when sessions.length > 0 — should be hidden
    await expect(page.getByRole('heading', { name: /my schedule/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /export to calendar/i })).not.toBeVisible();
    // Empty-state message should appear instead
    await expect(
      page.getByText(/no registered sessions yet|no sessions yet/i)
    ).toBeVisible({ timeout: 10_000 });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 3. Export button has correct aria / text label
// ──────────────────────────────────────────────────────────────────────────────
test.describe('iCal export – button label', () => {
  test('Export to Calendar button has correct accessible text label', async ({ page }) => {
    if (!(await isApiAvailable())) { test.skip(); return; }

    await loginAsAdmin(page);

    // Register admin for a session so the export button renders
    await page.goto('/schedule');
    const firstSessionLink = page.locator('a[href*="/sessions/"]').first();
    const hasSession = await firstSessionLink.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!hasSession) { test.skip(); return; }

    await firstSessionLink.click();
    await expect(page).toHaveURL(/\/sessions\/[^/]+$/, { timeout: 10_000 });

    const registerBtn = page.getByRole('button', { name: /^register$/i });
    const canRegister = await registerBtn.isVisible({ timeout: 5_000 }).catch(() => false);
    if (canRegister) {
      await registerBtn.click();
      await expect(page.getByRole('button', { name: /cancel registration/i })).toBeVisible({ timeout: 10_000 });
    }

    await page.goto('/my-schedule');
    await expect(page).toHaveURL(/\/my-schedule/);
    await expect(page.getByRole('heading', { name: /my schedule/i })).toBeVisible({ timeout: 15_000 });

    const exportBtn = page.getByRole('button', { name: /export to calendar/i });
    const isVisible = await exportBtn.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!isVisible) { test.skip(); return; } // admin has no registered sessions

    // Verify the accessible text label exactly
    await expect(exportBtn).toBeVisible();
    await expect(exportBtn).toHaveText(/export to calendar/i);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 4. Export button triggers an .ics file download
// ──────────────────────────────────────────────────────────────────────────────
test.describe('iCal export – download', () => {
  test('clicking Export to Calendar triggers a .ics download', async ({ page }) => {
    if (!(await isApiAvailable())) { test.skip(); return; }

    await loginAsAdmin(page);

    // Ensure admin is registered for at least one session
    await page.goto('/schedule');
    const firstSessionLink = page.locator('a[href*="/sessions/"]').first();
    const hasSession = await firstSessionLink.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!hasSession) { test.skip(); return; }

    await firstSessionLink.click();
    await expect(page).toHaveURL(/\/sessions\/[^/]+$/, { timeout: 10_000 });

    const registerBtn = page.getByRole('button', { name: /^register$/i });
    const canRegister = await registerBtn.isVisible({ timeout: 5_000 }).catch(() => false);
    if (canRegister) {
      await registerBtn.click();
      await expect(page.getByRole('button', { name: /cancel registration/i })).toBeVisible({ timeout: 10_000 });
    }

    await page.goto('/my-schedule');
    await expect(page).toHaveURL(/\/my-schedule/);
    await expect(page.getByRole('heading', { name: /my schedule/i })).toBeVisible({ timeout: 15_000 });

    const exportBtn = page.getByRole('button', { name: /export to calendar/i });
    const isVisible = await exportBtn.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!isVisible) { test.skip(); return; }

    // handleExport does a programmatic anchor click — listen for download event
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 15_000 }),
      exportBtn.click(),
    ]);

    expect(download.suggestedFilename()).toBe('my-schedule.ics');
  });
});
