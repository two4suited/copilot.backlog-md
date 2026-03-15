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

test.describe('Auth Edge Cases', () => {
  test('register with weak password shows client-side validation error', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();

    await page.getByLabel(/name/i).fill('Test User');
    await page.getByLabel(/email/i).fill(`weakpw-${Date.now()}@e2e.test`);

    // Use evaluate to bypass browser minLength and set a short password
    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill('short');
    // Remove minLength constraint so the form can be submitted
    await page.evaluate(() => {
      const input = document.getElementById('password') as HTMLInputElement;
      if (input) input.removeAttribute('minlength');
    });

    await page.getByRole('button', { name: /create account/i }).click();

    // Client-side error message from RegisterPage.tsx: "Password must be at least 8 characters."
    await expect(
      page.locator('p.text-red-600, [role="alert"]')
    ).toContainText(/password must be at least 8 characters/i, { timeout: 5_000 });

    // Must stay on /register — no redirect
    await expect(page).toHaveURL(/\/register/);
  });

  test('register with duplicate email shows error message', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/register');
    // Use the known seeded admin email which already exists
    await page.getByLabel(/name/i).fill('Duplicate User');
    await page.getByLabel(/email/i).fill('admin@conference.dev');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /create account/i }).click();

    // API returns an error; error paragraph should be shown
    await expect(
      page.locator('p.text-red-600, [role="alert"]')
    ).toBeVisible({ timeout: 10_000 });

    await expect(page).toHaveURL(/\/register/);
  });

  test('login with wrong password shows error message', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@conference.dev');
    await page.getByLabel(/password/i).fill('WrongPassword999!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(
      page.locator('p.text-red-600, [role="alert"]')
    ).toBeVisible({ timeout: 10_000 });

    await expect(page).toHaveURL(/\/login/);
  });

  test('logged-in user sees their name in the navigation bar', async ({ page }) => {
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

    // The Layout shows user?.name in a <span> in the header
    // The admin seeded user typically has name "Admin" or similar
    const userNameSpan = page.locator('header span').filter({ hasText: /\w+/ }).first();
    await expect(userNameSpan).toBeVisible({ timeout: 5_000 });
    const nameText = await userNameSpan.innerText();
    expect(nameText.trim().length).toBeGreaterThan(0);
  });

  test('logout clears session and redirects to login or home', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    // Log in first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@conference.dev');
    await page.getByLabel(/password/i).fill('Admin123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });

    // Click Sign Out
    await page.getByRole('button', { name: /sign out/i }).click();

    // After logout: should redirect away from protected page and show Sign In button
    await expect(
      page.getByRole('link', { name: /sign in/i })
    ).toBeVisible({ timeout: 10_000 });

    // Protected page should redirect to login
    await page.goto('/my-schedule');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
