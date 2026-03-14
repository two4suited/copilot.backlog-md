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

async function registerAndLoginAsUser(page: import('@playwright/test').Page, email: string) {
  await page.goto('/register');
  await page.getByLabel(/name/i).fill('Regular User');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill('Password123!');
  await page.getByRole('button', { name: /create account/i }).click();
  await expect(page).not.toHaveURL(/\/register/, { timeout: 10_000 });
}

test.describe('Admin – route protection', () => {
  test('unauthenticated user visiting /admin is redirected away', async ({ page }) => {
    // AdminLayout redirects to "/" when not authenticated — not /login
    await page.goto('/admin');
    await expect(page).not.toHaveURL(/\/admin/, { timeout: 10_000 });
  });
});

test.describe('Admin – login and dashboard', () => {
  test('admin can log in and access admin dashboard', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await loginAsAdmin(page);
    await page.goto('/admin/conferences');
    await expect(page).toHaveURL(/\/admin\/conferences/, { timeout: 10_000 });
    // Admin sidebar should be visible
    await expect(page.getByRole('link', { name: /conferences/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /sessions/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /speakers/i }).first()).toBeVisible();
    // Page heading
    await expect(page.getByRole('heading', { name: /conferences/i })).toBeVisible();
  });
});

test.describe('Admin – conference CRUD', () => {
  test('admin can create a new conference', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await loginAsAdmin(page);
    await page.goto('/admin/conferences');
    await page.getByRole('link', { name: /new conference/i }).click();
    await expect(page).toHaveURL(/\/admin\/conferences\/new/, { timeout: 10_000 });

    const uniqueName = `E2E Conference ${Date.now()}`;
    await page.getByLabel(/name/i).fill(uniqueName);
    await page.getByLabel(/start date/i).fill('2025-09-01');
    await page.getByLabel(/end date/i).fill('2025-09-03');
    await page.getByLabel(/location/i).fill('E2E Test City');
    await page.getByRole('button', { name: /create conference/i }).click();

    // Should redirect back to list after save
    await expect(page).toHaveURL(/\/admin\/conferences$/, { timeout: 15_000 });
    // New conference should appear in the table
    await expect(page.getByRole('cell', { name: uniqueName })).toBeVisible({ timeout: 10_000 });
  });

  test('conference form validates required fields', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await loginAsAdmin(page);
    await page.goto('/admin/conferences/new');
    // Submit without filling any fields
    await page.getByRole('button', { name: /create conference/i }).click();
    // Validation errors should be shown
    await expect(page.locator('p.text-red-600').first()).toBeVisible();
  });
});

test.describe('Admin – session edit', () => {
  test('admin can edit a session title', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await loginAsAdmin(page);
    await page.goto('/admin/sessions');
    await expect(page.getByRole('heading', { name: /sessions/i })).toBeVisible();

    // Wait for sessions to load and click Edit on the first one
    const firstEditLink = page.getByRole('link', { name: /edit/i }).first();
    await expect(firstEditLink).toBeVisible({ timeout: 15_000 });
    await firstEditLink.click();

    await expect(page).toHaveURL(/\/admin\/sessions\/[^/]+$/, { timeout: 10_000 });
    await expect(page.getByRole('heading', { name: /edit session/i })).toBeVisible();

    // Change the title
    const titleInput = page.getByLabel(/title/i);
    const originalTitle = await titleInput.inputValue();
    const updatedTitle = `${originalTitle} [E2E-edited]`;
    await titleInput.fill(updatedTitle);
    await page.getByRole('button', { name: /save changes/i }).click();

    // Should redirect back to list
    await expect(page).toHaveURL(/\/admin\/sessions$/, { timeout: 15_000 });
    // Updated title should appear in the table
    await expect(page.getByRole('cell', { name: updatedTitle })).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Admin – speaker delete', () => {
  test('admin can delete a speaker via confirm dialog', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await loginAsAdmin(page);
    await page.goto('/admin/speakers');
    await expect(page.getByRole('heading', { name: /speakers/i })).toBeVisible();

    // Wait for speakers to load
    const firstDeleteButton = page.getByRole('button', { name: /delete/i }).first();
    await expect(firstDeleteButton).toBeVisible({ timeout: 15_000 });

    // Get the speaker name from the row before deleting
    const firstRow = page.locator('tbody tr').first();
    const speakerName = await firstRow.locator('td').first().textContent();

    await firstDeleteButton.click();

    // Confirm dialog should appear
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(/are you sure/i)).toBeVisible();

    // Confirm the deletion
    await page.getByRole('button', { name: /confirm|yes|delete/i }).last().click();

    // Speaker should be removed — toast appears and row disappears
    await expect(page.getByText(/deleted successfully/i)).toBeVisible({ timeout: 10_000 });
    if (speakerName) {
      await expect(page.getByRole('cell', { name: speakerName })).not.toBeVisible({ timeout: 10_000 });
    }
  });

  test('admin can cancel the delete dialog without removing speaker', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await loginAsAdmin(page);
    await page.goto('/admin/speakers');

    const firstDeleteButton = page.getByRole('button', { name: /delete/i }).first();
    await expect(firstDeleteButton).toBeVisible({ timeout: 15_000 });

    const firstRow = page.locator('tbody tr').first();
    const speakerName = await firstRow.locator('td').first().textContent();

    await firstDeleteButton.click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 });

    // Cancel the dialog
    await page.getByRole('button', { name: /cancel/i }).click();

    // Dialog should close and speaker should still be in the list
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5_000 });
    if (speakerName) {
      await expect(page.getByRole('cell', { name: speakerName })).toBeVisible();
    }
  });
});

test.describe('Admin – non-admin access', () => {
  test('regular user navigating to /admin is redirected away', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    const uniqueEmail = `regular-${Date.now()}@e2e.test`;
    await registerAndLoginAsUser(page, uniqueEmail);

    // Try to access admin area — AdminLayout redirects role !== Admin to "/"
    await page.goto('/admin/conferences');
    await expect(page).not.toHaveURL(/\/admin/, { timeout: 10_000 });
  });
});
