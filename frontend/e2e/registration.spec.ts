import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'https://localhost:7133';

async function isApiAvailable(): Promise<boolean> {
  const proxyUrl = process.env.APP_URL || 'http://localhost:51127';
  try {
    const res = await fetch(`${proxyUrl}/api/conferences`).catch(() => null);
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

/** Navigate to the first session detail that has an available Register button, return the URL or null */
async function findRegisterableSession(page: import('@playwright/test').Page): Promise<string | null> {
  await page.goto('/schedule');
  const sessionLinks = page.locator('a[href*="/sessions/"]');
  await expect(sessionLinks.first()).toBeVisible({ timeout: 20_000 });

  const count = await sessionLinks.count();
  for (let i = 0; i < Math.min(count, 20); i++) {
    await page.goto('/schedule');
    // Skip hidden links — the schedule renders both desktop-grid and mobile-stacked
    // session links in the DOM; only one set is visible at the current viewport width.
    const isVisible = await sessionLinks.nth(i).isVisible().catch(() => false);
    if (!isVisible) continue;
    await sessionLinks.nth(i).click();
    await expect(page).toHaveURL(/\/sessions\/[^/]+$/, { timeout: 10_000 });

    const registerBtn = page.getByRole('button', { name: /^register for this session$/i });
    if (await registerBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      const isDisabled = await registerBtn.isDisabled().catch(() => true);
      if (!isDisabled) {
        return page.url();
      }
    }
  }
  return null;
}

test.describe('Session Registration', () => {
  test('register for a session', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await loginAsAdmin(page);

    const sessionUrl = await findRegisterableSession(page);
    if (!sessionUrl) {
      test.skip();
      return;
    }

    const registerBtn = page.getByRole('button', { name: /^register for this session$/i });
    await expect(registerBtn).toBeVisible();
    await registerBtn.click();

    // After registration: button should change to "Cancel Registration"
    await expect(
      page.getByRole('button', { name: /cancel registration/i })
    ).toBeVisible({ timeout: 10_000 });

    // Clean up
    await page.getByRole('button', { name: /cancel registration/i }).click();
  });

  test('cancel a registration', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await loginAsAdmin(page);

    // First register for a session
    const sessionUrl = await findRegisterableSession(page);
    if (!sessionUrl) {
      test.skip();
      return;
    }

    const registerBtn = page.getByRole('button', { name: /^register for this session$/i });
    await registerBtn.click();
    await expect(
      page.getByRole('button', { name: /cancel registration/i })
    ).toBeVisible({ timeout: 10_000 });

    // Now cancel
    await page.getByRole('button', { name: /cancel registration/i }).click();

    // After cancellation: should revert to "Register" button
    await expect(
      page.getByRole('button', { name: /^register for this session$/i })
    ).toBeVisible({ timeout: 10_000 });
  });

  test('cannot register twice for same session (duplicate registration handled gracefully)', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await loginAsAdmin(page);

    const sessionUrl = await findRegisterableSession(page);
    if (!sessionUrl) {
      test.skip();
      return;
    }

    // Register once
    const registerBtn = page.getByRole('button', { name: /^register for this session$/i });
    await registerBtn.click();
    await expect(
      page.getByRole('button', { name: /cancel registration/i })
    ).toBeVisible({ timeout: 10_000 });

    // Navigate away and back to same session
    await page.goto('/schedule');
    await page.goto(sessionUrl);
    await expect(page).toHaveURL(/\/sessions\/[^/]+$/, { timeout: 10_000 });

    // Should still show "Cancel Registration", not "Register" — cannot double-register
    await expect(
      page.getByRole('button', { name: /cancel registration/i })
    ).toBeVisible({ timeout: 10_000 });

    // The register button should NOT be present (already registered)
    await expect(
      page.getByRole('button', { name: /^register for this session$/i })
    ).not.toBeVisible();

    // Clean up
    await page.getByRole('button', { name: /cancel registration/i }).click();
  });

  test('register button is disabled or absent for full sessions', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await loginAsAdmin(page);

    await page.goto('/schedule');
    const sessionLinks = page.locator('a[href*="/sessions/"]');
    await expect(sessionLinks.first()).toBeVisible({ timeout: 20_000 });

    let foundFull = false;
    const count = await sessionLinks.count();
    for (let i = 0; i < Math.min(count, 15); i++) {
      await page.goto('/schedule');
      await expect(sessionLinks.nth(i)).toBeVisible({ timeout: 10_000 });
      await sessionLinks.nth(i).click();
      await expect(page).toHaveURL(/\/sessions\/[^/]+$/, { timeout: 10_000 });

      const fullText = page.locator('text=/full|session full/i').first();
      if (await fullText.isVisible({ timeout: 3_000 }).catch(() => false)) {
        foundFull = true;
        // When session is full, register button should be disabled or absent
        const registerBtn = page.locator('button').filter({ hasText: /register/i }).first();
        if (await registerBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await expect(registerBtn).toBeDisabled();
        }
        // Otherwise: no register button at all — also acceptable
        break;
      }
    }

    if (!foundFull) {
      // No full sessions in seed data; skip rather than fail
      test.skip();
    }
  });

  test('My Schedule page shows registered sessions', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await loginAsAdmin(page);

    // Register for a session first
    const sessionUrl = await findRegisterableSession(page);
    if (!sessionUrl) {
      test.skip();
      return;
    }

    const registerBtn = page.getByRole('button', { name: /^register for this session$/i });
    await registerBtn.click();
    await expect(
      page.getByRole('button', { name: /cancel registration/i })
    ).toBeVisible({ timeout: 10_000 });

    // Navigate to My Schedule
    await page.goto('/my-schedule');
    await expect(page).toHaveURL(/\/my-schedule/, { timeout: 10_000 });

    // My Schedule should show at least one session
    await expect(
      page.locator('a[href*="/sessions/"]').first()
    ).toBeVisible({ timeout: 10_000 });

    // Clean up: go back and cancel
    await page.goto(sessionUrl);
    const cancelBtn = page.getByRole('button', { name: /cancel registration/i });
    if (await cancelBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await cancelBtn.click();
    }
  });
});
