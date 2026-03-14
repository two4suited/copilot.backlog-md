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

test.describe('Authentication', () => {
  test('can navigate to /login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('can register a new user', async ({ page }) => {
    // TODO: BUG - Requires live API; skip when API is unavailable
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    const uniqueEmail = `test-${Date.now()}@e2e.test`;
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();

    await page.getByLabel(/name/i).fill('E2E Test User');
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /create account/i }).click();

    // After successful registration, should redirect away from /register
    await expect(page).not.toHaveURL(/\/register/, { timeout: 10_000 });
  });

  test('can login with valid credentials and is redirected away from /login', async ({ page }) => {
    // TODO: BUG - Requires live API; skip when API is unavailable
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@conference.dev');
    await page.getByLabel(/password/i).fill('Admin123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('login with wrong password shows error message', async ({ page }) => {
    // TODO: BUG - Requires live API; skip when API is unavailable
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@conference.dev');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Error message should appear
    await expect(page.locator('p.text-red-600, [role="alert"]')).toBeVisible({ timeout: 10_000 });
  });

  test('protected /my-schedule redirects to /login when not authenticated', async ({ page }) => {
    await page.goto('/my-schedule');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
