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

test.describe('Seat Availability', () => {
  test('session detail page shows seat count or full indicator', async ({ page }) => {
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

    // Session detail shows seats remaining or "Full"
    await expect(
      page.locator('text=/seats? remaining|full/i').first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('seat count shows a non-negative number or "Full"', async ({ page }) => {
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

    // Either "N seat(s) remaining" or "Full"
    const seatsText = page.locator('text=/\\d+ seats? remaining|full/i').first();
    await expect(seatsText).toBeVisible({ timeout: 10_000 });
    const text = await seatsText.innerText();
    // Verify it's either "Full" or contains a valid number
    const match = text.match(/(\d+)/);
    if (match) {
      expect(parseInt(match[1], 10)).toBeGreaterThanOrEqual(0);
    } else {
      expect(text.toLowerCase()).toContain('full');
    }
  });

  test('register button decrements seat count', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await loginAsAdmin(page);

    await page.goto('/schedule');
    const sessionLinks = page.locator('a[href*="/sessions/"]');
    await expect(sessionLinks.first()).toBeVisible({ timeout: 20_000 });

    // Find a session detail that is not full and not already registered
    let sessionUrl: string | null = null;
    let initialSeats: number | null = null;

    const count = await sessionLinks.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      await page.goto('/schedule');
      await expect(sessionLinks.nth(i)).toBeVisible({ timeout: 20_000 });
      await sessionLinks.nth(i).click();
      await expect(page).toHaveURL(/\/sessions\/[^/]+$/, { timeout: 10_000 });

      const registerBtn = page.getByRole('button', { name: /^register for this session$/i });
      const isDisabled = await registerBtn.isDisabled().catch(() => true);
      if (!isDisabled && await registerBtn.isVisible()) {
        const seatsLocator = page.locator('text=/\\d+ seats? remaining/i').first();
        if (await seatsLocator.isVisible()) {
          const txt = await seatsLocator.innerText();
          const m = txt.match(/(\d+)/);
          if (m) {
            initialSeats = parseInt(m[1], 10);
            sessionUrl = page.url();
            break;
          }
        }
      }
    }

    if (!sessionUrl || initialSeats === null) {
      test.skip();
      return;
    }

    // Register for the session
    const registerBtn = page.getByRole('button', { name: /^register for this session$/i });
    await registerBtn.click();

    // After registration, seat count should decrement by 1 or show "Full"
    await expect(
      page.locator('text=/seats? remaining|full/i').first()
    ).toBeVisible({ timeout: 10_000 });

    const updatedSeatsLocator = page.locator('text=/\\d+ seats? remaining|full/i').first();
    const updatedText = await updatedSeatsLocator.innerText({ timeout: 10_000 });
    const updatedMatch = updatedText.match(/(\d+)/);
    if (updatedMatch) {
      const updatedSeats = parseInt(updatedMatch[1], 10);
      expect(updatedSeats).toBe(initialSeats - 1);
    } else {
      // Session became full
      expect(updatedText.toLowerCase()).toContain('full');
    }

    // Clean up: cancel registration
    const cancelBtn = page.getByRole('button', { name: /cancel registration/i });
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
    }
  });

  test('LIVE badge appears on session detail when SignalR connects', async ({ page }) => {
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

    // "LIVE" badge is shown when SignalR is connected (may take a moment to connect)
    // It appears as a span with text "LIVE" alongside a pulsing dot
    const liveBadge = page.locator('text=LIVE').first();
    await expect(liveBadge).toBeVisible({ timeout: 15_000 });
  });

  test('session shows full state when seats are 0', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/schedule');
    const sessionLinks = page.locator('a[href*="/sessions/"]');
    await expect(sessionLinks.first()).toBeVisible({ timeout: 20_000 });

    // Look for a session that shows "Full"
    let foundFull = false;
    const count = await sessionLinks.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      await page.goto('/schedule');
      await expect(sessionLinks.nth(i)).toBeVisible({ timeout: 10_000 });
      await sessionLinks.nth(i).click();
      await expect(page).toHaveURL(/\/sessions\/[^/]+$/, { timeout: 10_000 });

      const fullText = page.locator('text=/full/i').first();
      if (await fullText.isVisible({ timeout: 3_000 }).catch(() => false)) {
        foundFull = true;
        // When full, the register button should be disabled or say "Session Full"
        const registerBtn = page.locator('button').filter({ hasText: /session full|register/i }).first();
        if (await registerBtn.isVisible()) {
          await expect(registerBtn).toBeDisabled();
        }
        break;
      }
    }

    // This test is informational — skip if no full sessions exist in test data
    if (!foundFull) {
      test.skip();
    }
  });
});
