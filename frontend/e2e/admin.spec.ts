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

async function registerAndLoginAsUser(page: import('@playwright/test').Page, email: string) {
  await page.goto('/register');
  await page.getByLabel(/name/i).fill('Regular User');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill('Password123!');
  await page.getByRole('button', { name: /create account/i }).click();
  await expect(page).not.toHaveURL(/\/register/, { timeout: 10_000 });
}

// ──────────────────────────────────────────────────────────────────────────────
// 1. Route protection (no API needed — client-side guard in AdminLayout)
// ──────────────────────────────────────────────────────────────────────────────
test.describe('Admin – route protection', () => {
  test('unauthenticated user visiting /admin is redirected away from /admin', async ({ page }) => {
    // AdminLayout checks isAuthenticated; redirects to "/" when false
    await page.goto('/admin');
    await expect(page).not.toHaveURL(/\/admin/, { timeout: 10_000 });
  });

  test('unauthenticated user visiting /admin/conferences is redirected away', async ({ page }) => {
    await page.goto('/admin/conferences');
    await expect(page).not.toHaveURL(/\/admin/, { timeout: 10_000 });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 2. Admin can reach /admin/conferences
// ──────────────────────────────────────────────────────────────────────────────
test.describe('Admin – login and dashboard', () => {
  test('admin user can reach /admin/conferences', async ({ page }) => {
    if (!(await isApiAvailable())) { test.skip(); return; }

    await loginAsAdmin(page);
    await page.goto('/admin/conferences');
    await expect(page).toHaveURL(/\/admin\/conferences/, { timeout: 10_000 });
    // Sidebar nav links confirm admin layout rendered
    await expect(page.getByRole('link', { name: /conferences/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /sessions/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /speakers/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /conferences/i })).toBeVisible();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 3. Conference list renders a table
// ──────────────────────────────────────────────────────────────────────────────
test.describe('Admin – conference list', () => {
  test('conferences list page renders a table/list element', async ({ page }) => {
    if (!(await isApiAvailable())) { test.skip(); return; }

    await loginAsAdmin(page);
    await page.goto('/admin/conferences');
    await expect(page.locator('table')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('th', { hasText: /name/i }).first()).toBeVisible();
    await expect(page.locator('th', { hasText: /location/i }).first()).toBeVisible();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 4. Create conference
// ──────────────────────────────────────────────────────────────────────────────
test.describe('Admin – create conference', () => {
  test('fill form at /admin/conferences/new, submit, assert success toast or redirect', async ({ page }) => {
    if (!(await isApiAvailable())) { test.skip(); return; }

    await loginAsAdmin(page);
    await page.goto('/admin/conferences/new');
    await expect(page.getByRole('heading', { name: /new conference/i })).toBeVisible({ timeout: 10_000 });

    const uniqueName = `E2E Conference ${Date.now()}`;
    await page.getByLabel(/name/i).fill(uniqueName);
    await page.getByLabel(/start date/i).fill('2025-09-01');
    await page.getByLabel(/end date/i).fill('2025-09-03');
    await page.getByLabel(/location/i).fill('E2E Test City');
    await page.getByRole('button', { name: /create conference/i }).click();

    // Either a success toast appears or the page redirects back to the list
    await expect(page).toHaveURL(/\/admin\/conferences$/, { timeout: 15_000 });
    await expect(page.getByRole('cell', { name: uniqueName })).toBeVisible({ timeout: 10_000 });
  });

  test('conference form shows validation errors when required fields are empty', async ({ page }) => {
    if (!(await isApiAvailable())) { test.skip(); return; }

    await loginAsAdmin(page);
    await page.goto('/admin/conferences/new');
    await page.getByRole('button', { name: /create conference/i }).click();
    await expect(page.locator('p.text-red-600').first()).toBeVisible();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 5. Edit conference
// ──────────────────────────────────────────────────────────────────────────────
test.describe('Admin – edit conference', () => {
  test('navigate to edit form, change name, save, assert toast', async ({ page }) => {
    if (!(await isApiAvailable())) { test.skip(); return; }

    await loginAsAdmin(page);

    // Create a disposable conference to rename so we don't pollute shared seed data
    await page.goto('/admin/conferences/new');
    const originalName = `E2E Edit Base ${Date.now()}`;
    await page.getByLabel(/name/i).fill(originalName);
    await page.getByLabel(/start date/i).fill('2025-11-01');
    await page.getByLabel(/end date/i).fill('2025-11-02');
    await page.getByLabel(/location/i).fill('Edit City');
    await page.getByRole('button', { name: /create conference/i }).click();
    await page.waitForURL(/\/admin\/conferences$/, { timeout: 15_000 });

    // Find and click the edit link for our newly created conference
    const confRow = page.locator('tr', { hasText: originalName });
    const editLink = confRow.locator('a', { hasText: /edit/i });
    await expect(editLink).toBeVisible({ timeout: 10_000 });
    await editLink.click();

    await expect(page).toHaveURL(/\/admin\/conferences\/[^/]+$/, { timeout: 10_000 });
    await expect(page.getByRole('heading', { name: /edit conference/i })).toBeVisible();

    const nameInput = page.getByLabel(/name/i);
    await nameInput.clear();
    const renamedName = `E2E Renamed ${Date.now()}`;
    await nameInput.fill(renamedName);
    await page.getByRole('button', { name: /save changes/i }).click();

    // Success toast: "Conference updated"
    await expect(page.locator('text=Conference updated')).toBeVisible({ timeout: 10_000 });

    // Clean up: delete the test conference
    await page.goto('/admin/conferences');
    const renamedRow = page.locator('tr', { hasText: renamedName });
    const deleteBtn = renamedRow.locator('button', { hasText: /delete/i });
    if (await deleteBtn.count() > 0) {
      await deleteBtn.click();
      page.once('dialog', d => d.accept());
      await page.waitForTimeout(2000);
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 6. Delete conference
// ──────────────────────────────────────────────────────────────────────────────
test.describe('Admin – delete conference', () => {
  test('click delete, confirm dialog appears, confirm, assert item removed', async ({ page }) => {
    if (!(await isApiAvailable())) { test.skip(); return; }

    await loginAsAdmin(page);

    // Create a disposable conference to delete
    await page.goto('/admin/conferences/new');
    const uniqueName = `E2E Delete Me ${Date.now()}`;
    await page.getByLabel(/name/i).fill(uniqueName);
    await page.getByLabel(/start date/i).fill('2025-10-01');
    await page.getByLabel(/end date/i).fill('2025-10-02');
    await page.getByLabel(/location/i).fill('Deleteville');
    await page.getByRole('button', { name: /create conference/i }).click();
    await page.waitForURL(/\/admin\/conferences$/, { timeout: 15_000 });

    // Locate the row for the newly-created conference
    await expect(page.locator('table')).toBeVisible({ timeout: 10_000 });
    const row = page.locator('tr', { hasText: uniqueName });
    await expect(row).toBeVisible({ timeout: 10_000 });

    // Click its Delete button
    await row.locator('button', { hasText: /delete/i }).click();

    // ConfirmDialog renders as a fixed overlay — check for its heading and message
    // (ConfirmDialog does NOT use role="dialog"; detect by the dialog heading instead)
    await expect(page.getByRole('heading', { name: /delete conference/i })).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(/cannot be undone/i)).toBeVisible();

    // Confirm by clicking the red "Delete" button at the bottom of the overlay
    // Use the last "Delete" button on the page to target the confirm button (not the row button)
    await page.getByRole('button', { name: /^delete$/i }).last().click();

    // Toast confirms deletion
    await expect(page.locator('text=Conference deleted successfully')).toBeVisible({ timeout: 10_000 });
    // Row should vanish from the table
    await expect(row).not.toBeVisible({ timeout: 10_000 });
  });

  test('cancelling the delete dialog keeps the conference in the list', async ({ page }) => {
    if (!(await isApiAvailable())) { test.skip(); return; }

    await loginAsAdmin(page);
    await page.goto('/admin/conferences');
    await expect(page.locator('table')).toBeVisible({ timeout: 10_000 });

    const firstRow = page.locator('tbody tr').first();
    const conferenceName = await firstRow.locator('td').first().textContent();

    await firstRow.locator('button', { hasText: /delete/i }).click();
    await expect(page.getByRole('heading', { name: /delete conference/i })).toBeVisible({ timeout: 5_000 });

    // Cancel — dialog should close without deleting
    await page.getByRole('button', { name: /cancel/i }).click();

    await expect(page.getByRole('heading', { name: /delete conference/i })).not.toBeVisible({ timeout: 5_000 });
    if (conferenceName) {
      await expect(page.locator('td', { hasText: conferenceName }).first()).toBeVisible();
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 7. Non-admin user cannot access /admin
// ──────────────────────────────────────────────────────────────────────────────
test.describe('Admin – non-admin access', () => {
  test('regular user navigating to /admin/conferences is redirected away', async ({ page }) => {
    if (!(await isApiAvailable())) { test.skip(); return; }

    const uniqueEmail = `regular-${Date.now()}@e2e.test`;
    await registerAndLoginAsUser(page, uniqueEmail);

    // AdminLayout checks user.role !== 'Admin' and redirects to "/"
    await page.goto('/admin/conferences');
    await expect(page).not.toHaveURL(/\/admin/, { timeout: 10_000 });
  });
});
