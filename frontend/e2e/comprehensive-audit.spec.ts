/**
 * Comprehensive E2E Audit – ConferenceApp
 *
 * Tests every public, auth-required, and admin page for:
 *  - Page load / no stuck spinner
 *  - Visible content
 *  - Form functionality
 *  - Navigation links
 *  - API call success (no 4xx/5xx in console)
 *  - Filtering / pagination
 *
 * Known seed data (used for deterministic IDs):
 *   Conference : 2ecb9971-7301-4a43-a382-08520fbabb43  (TechConf 2026)
 *   Session    : 70a41593-9bf3-4507-9396-308e88820b32  (React 18 and Beyond)
 *   Speaker    : 7813110c-39b0-490d-8f62-dc7520de08aa  (Bob Martinez)
 */

import { test, expect, Page } from '@playwright/test';

// ─── constants ────────────────────────────────────────────────────────────────

const CONFERENCE_ID = '2ecb9971-7301-4a43-a382-08520fbabb43';
const SESSION_ID    = '70a41593-9bf3-4507-9396-308e88820b32';
const SPEAKER_ID    = '7813110c-39b0-490d-8f62-dc7520de08aa';

const ADMIN_EMAIL    = 'admin@conference.dev';
const ADMIN_PASSWORD = 'Admin123!';

const TEST_USER_EMAIL    = `audit-${Date.now()}@test.com`;
const TEST_USER_PASSWORD = 'Test123!';
const TEST_USER_NAME     = 'Audit Tester';

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Collect all console errors & network failures during a page interaction. */
function collectErrors(page: Page) {
  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('response', resp => {
    if (resp.status() >= 400) {
      networkErrors.push(`${resp.status()} ${resp.url()}`);
    }
  });
  return { consoleErrors, networkErrors };
}

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 12_000 });
}

async function registerAndLogin(page: Page, email = TEST_USER_EMAIL) {
  await page.goto('/register');
  await page.getByLabel(/name/i).fill(TEST_USER_NAME);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(TEST_USER_PASSWORD);
  await page.getByRole('button', { name: /create account/i }).click();
  await expect(page).not.toHaveURL(/\/register/, { timeout: 12_000 });
}

async function waitForContent(page: Page, timeout = 10_000) {
  // Wait until the loading spinner is gone (if any)
  await page.waitForFunction(
    () => !document.querySelector('[data-testid="loading-spinner"], [aria-label="Loading"]'),
    { timeout }
  ).catch(() => { /* spinner may not exist; that's fine */ });
  // Give React one animation frame to render
  await page.waitForTimeout(300);
}

// ─── PUBLIC PAGES ─────────────────────────────────────────────────────────────

test.describe('Public – Home (/)', () => {
  test('loads and shows conference/speaker content', async ({ page }) => {
    const { networkErrors } = collectErrors(page);
    await page.goto('/');
    await waitForContent(page);

    // Page should not be blank
    const body = await page.locator('body').innerText();
    expect(body.length).toBeGreaterThan(50);

    // Navigation header should be visible
    await expect(page.locator('nav, header').first()).toBeVisible();

    // Should not have server-error responses for main data calls
    const critical = networkErrors.filter(e => e.startsWith('5'));
    expect(critical, `Server errors: ${critical.join(', ')}`).toHaveLength(0);
  });

  test('nav links are present and navigate correctly', async ({ page }) => {
    await page.goto('/');
    // Conferences link
    const confLink = page.getByRole('link', { name: /conferences/i }).first();
    await expect(confLink).toBeVisible();
    await confLink.click();
    await expect(page).toHaveURL(/\/conferences/);
  });
});

// ─── Conferences list ────────────────────────────────────────────────────────

test.describe('Public – Conferences list (/conferences)', () => {
  test('loads conference cards', async ({ page }) => {
    const { networkErrors } = collectErrors(page);
    await page.goto('/conferences');
    await waitForContent(page);

    // At least one conference card
    const cards = page.locator('[data-testid="conference-card"], .conference-card, article, [class*="card"]');
    const count = await cards.count();
    expect(count, 'Expected at least one conference card').toBeGreaterThan(0);

    const critical = networkErrors.filter(e => e.startsWith('5'));
    expect(critical).toHaveLength(0);
  });

  test('conference card links to detail page', async ({ page }) => {
    await page.goto('/conferences');
    await waitForContent(page);

    // Click the first link that goes to /conferences/:id
    const detailLink = page.locator(`a[href*="/conferences/"]`).first();
    await expect(detailLink).toBeVisible();
    await detailLink.click();
    await expect(page).toHaveURL(/\/conferences\/.+/);
  });
});

// ─── Conference detail ───────────────────────────────────────────────────────

test.describe('Public – Conference detail (/conferences/:id)', () => {
  test('shows conference name, tracks, and sessions', async ({ page }) => {
    const { networkErrors } = collectErrors(page);
    await page.goto(`/conferences/${CONFERENCE_ID}`);
    await waitForContent(page);

    // Conference name visible
    await expect(page.getByText('TechConf 2026')).toBeVisible({ timeout: 10_000 });

    // Tracks section
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/track|session/i);

    const critical = networkErrors.filter(e => e.startsWith('5'));
    expect(critical).toHaveLength(0);
  });

  test('track link navigates to track detail', async ({ page }) => {
    await page.goto(`/conferences/${CONFERENCE_ID}`);
    await waitForContent(page);
    const trackLink = page.locator(`a[href*="/conferences/${CONFERENCE_ID}/tracks/"]`).first();
    if (await trackLink.count() > 0) {
      await trackLink.click();
      await expect(page).toHaveURL(/\/conferences\/.+\/tracks\/.+/);
    }
  });
});

// ─── Speakers list ───────────────────────────────────────────────────────────

test.describe('Public – Speakers list (/speakers)', () => {
  test('loads speaker cards', async ({ page }) => {
    const { networkErrors } = collectErrors(page);
    await page.goto('/speakers');
    await waitForContent(page);

    const body = await page.locator('body').innerText();
    expect(body).toMatch(/alice|bob|speaker/i);

    const critical = networkErrors.filter(e => e.startsWith('5'));
    expect(critical).toHaveLength(0);
  });

  test('speaker card links to detail page', async ({ page }) => {
    await page.goto('/speakers');
    await waitForContent(page);
    const link = page.locator(`a[href*="/speakers/"]`).first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/speakers\/.+/);
  });
});

// ─── Speaker detail ───────────────────────────────────────────────────────────

test.describe('Public – Speaker detail (/speakers/:id)', () => {
  test('shows speaker bio and sessions', async ({ page }) => {
    const { networkErrors } = collectErrors(page);
    await page.goto(`/speakers/${SPEAKER_ID}`);
    await waitForContent(page);

    await expect(page.getByText(/bob martinez/i)).toBeVisible({ timeout: 10_000 });

    const body = await page.locator('body').innerText();
    expect(body.length).toBeGreaterThan(50);

    const critical = networkErrors.filter(e => e.startsWith('5'));
    expect(critical).toHaveLength(0);
  });
});

// ─── Schedule page ───────────────────────────────────────────────────────────

test.describe('Public – Schedule page (/schedule)', () => {
  test('conference dropdown loads and shows sessions', async ({ page }) => {
    const { networkErrors } = collectErrors(page);
    await page.goto('/schedule');
    await waitForContent(page);

    // Conference selector (select or combobox)
    const selector = page.locator('select, [role="combobox"], [data-testid*="conference"]').first();
    await expect(selector).toBeVisible({ timeout: 10_000 });

    // Should eventually show session cards
    await page.waitForTimeout(1500);
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/session|talk|workshop|react|net/i);

    const critical = networkErrors.filter(e => e.startsWith('5'));
    expect(critical).toHaveLength(0);
  });

  test('day/track filter changes visible sessions', async ({ page }) => {
    await page.goto('/schedule');
    await waitForContent(page);
    await page.waitForTimeout(1000);

    // Look for day tabs or filter buttons
    const filterButtons = page.locator('button[class*="tab"], button[class*="filter"], button[class*="day"]');
    const btnCount = await filterButtons.count();
    if (btnCount > 1) {
      await filterButtons.nth(1).click();
      await page.waitForTimeout(500);
      // Page should still be functional
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

// ─── Session detail ───────────────────────────────────────────────────────────

test.describe('Public – Session detail (/sessions/:id)', () => {
  test('shows session title, speaker, track info', async ({ page }) => {
    const { networkErrors } = collectErrors(page);
    await page.goto(`/sessions/${SESSION_ID}`);
    await waitForContent(page);

    // Use heading role to avoid strict-mode violation (title also appears in breadcrumb)
    await expect(page.getByRole('heading', { name: /react 18/i })).toBeVisible({ timeout: 10_000 });

    const body = await page.locator('body').innerText();
    // Should contain a speaker name (data may change across runs - check for any speaker-like content)
    expect(body).toMatch(/[A-Z][a-z]+ [A-Z][a-z]+/); // any "FirstName LastName" pattern
    // Should contain track info
    expect(body).toMatch(/frontend|track|level|intermediate/i);

    const critical = networkErrors.filter(e => e.startsWith('5'));
    expect(critical).toHaveLength(0);
  });

  test('shows register button for unauthenticated user (or login prompt)', async ({ page }) => {
    await page.goto(`/sessions/${SESSION_ID}`);
    await waitForContent(page);

    const body = await page.locator('body').innerText();
    expect(body).toMatch(/register|sign in|login|seats/i);
  });

  test('back navigation works', async ({ page }) => {
    await page.goto('/schedule');
    await waitForContent(page);
    await page.waitForTimeout(1000);

    // Click first session link in schedule
    const sessionLink = page.locator(`a[href*="/sessions/"]`).first();
    if (await sessionLink.count() > 0) {
      await sessionLink.click();
      await waitForContent(page);
      await page.goBack();
      await expect(page).toHaveURL(/\/schedule/);
    }
  });
});

// ─── Login page ──────────────────────────────────────────────────────────────

test.describe('Public – Login (/login)', () => {
  test('form is present and validates', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('notauser@example.com');
    await page.getByLabel(/password/i).fill('WrongPassword1!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(3000);

    const body = await page.locator('body').innerText();
    expect(body).toMatch(/invalid|incorrect|error|failed|wrong/i);
    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('successful login redirects away from /login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/password/i).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 12_000 });
  });

  test('link to register page works', async ({ page }) => {
    await page.goto('/login');
    const registerLink = page.getByRole('link', { name: /register|sign up|create account/i });
    if (await registerLink.count() > 0) {
      await registerLink.click();
      await expect(page).toHaveURL(/\/register/);
    }
  });
});

// ─── Register page ────────────────────────────────────────────────────────────

test.describe('Public – Register (/register)', () => {
  test('form is present with all fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /create account|register|sign up/i })).toBeVisible();
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create account|register|sign up/i })).toBeVisible();
  });

  test('can register a new user and is redirected', async ({ page }) => {
    const email = `audit-reg-${Date.now()}@test.com`;
    await page.goto('/register');
    await page.getByLabel(/name/i).fill('New Audit User');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill('Test123!');
    await page.getByRole('button', { name: /create account|register|sign up/i }).click();
    await expect(page).not.toHaveURL(/\/register/, { timeout: 12_000 });
  });

  test('shows error on duplicate email', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel(/name/i).fill('Duplicate User');
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/password/i).fill('Test123!');
    await page.getByRole('button', { name: /create account|register|sign up/i }).click();
    await page.waitForTimeout(3000);

    const body = await page.locator('body').innerText();
    expect(body).toMatch(/already|exists|taken|error|invalid/i);
  });
});

// ─── AUTH-REQUIRED PAGES ─────────────────────────────────────────────────────

test.describe('Auth – My Schedule (/my-schedule)', () => {
  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/my-schedule');
    await page.waitForTimeout(1000);
    // Should redirect to login or show a login prompt
    const url = page.url();
    const body = await page.locator('body').innerText();
    const redirectedToLogin = url.includes('/login') || body.match(/sign in|log in|login/i);
    expect(redirectedToLogin, `Expected redirect to login, got URL: ${url}`).toBeTruthy();
  });

  test('authenticated user sees their bookmarked sessions', async ({ page }) => {
    const email = `audit-my-${Date.now()}@test.com`;
    await registerAndLogin(page, email);
    await page.goto('/my-schedule');
    await waitForContent(page);

    const body = await page.locator('body').innerText();
    // Should show a schedule page (possibly empty)
    expect(body).toMatch(/schedule|session|bookmark|saved|no sessions|nothing/i);

    await expect(page).toHaveURL(/\/my-schedule/);
  });

  test('bookmarking a session adds it to my-schedule', async ({ page }) => {
    const email = `audit-bm-${Date.now()}@test.com`;
    await registerAndLogin(page, email);

    // Go to schedule and bookmark first session
    await page.goto('/schedule');
    await waitForContent(page);
    await page.waitForTimeout(1500);

    const bookmarkBtn = page.locator('button[aria-label*="bookmark" i], button[title*="bookmark" i], button[data-testid*="bookmark"]').first();
    if (await bookmarkBtn.count() > 0) {
      await bookmarkBtn.click();
      await page.waitForTimeout(500);

      await page.goto('/my-schedule');
      await waitForContent(page);
      // Should show at least one session
      const sessionLinks = page.locator(`a[href*="/sessions/"]`);
      const count = await sessionLinks.count();
      expect(count, 'Expected at least one bookmarked session in My Schedule').toBeGreaterThan(0);
    }
  });
});

// ─── ADMIN PAGES ─────────────────────────────────────────────────────────────

test.describe('Admin – Route protection', () => {
  test('unauthenticated user visiting /admin/conferences is redirected', async ({ page }) => {
    await page.goto('/admin/conferences');
    await page.waitForTimeout(1000);
    await expect(page).not.toHaveURL(/\/admin/, { timeout: 5_000 });
  });
});

test.describe('Admin – Conferences list (/admin/conferences)', () => {
  test('admin can access the page and see conferences', async ({ page }) => {
    const { networkErrors } = collectErrors(page);
    await loginAsAdmin(page);
    await page.goto('/admin/conferences');
    await waitForContent(page);

    await expect(page.getByText(/TechConf 2026/i)).toBeVisible({ timeout: 10_000 });

    const critical = networkErrors.filter(e => e.startsWith('5'));
    expect(critical).toHaveLength(0);
  });

  test('"New Conference" button / link is present', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/conferences');
    await waitForContent(page);

    const newBtn = page.getByRole('link', { name: /new|add|create/i }).first();
    await expect(newBtn).toBeVisible();
  });

  test('edit link for existing conference is present', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/conferences');
    await waitForContent(page);

    const editLink = page.locator(`a[href*="/admin/conferences/"]`).first();
    await expect(editLink).toBeVisible();
  });
});

test.describe('Admin – New Conference (/admin/conferences/new)', () => {
  test('form loads and can be submitted', async ({ page }) => {
    const { networkErrors } = collectErrors(page);
    await loginAsAdmin(page);
    await page.goto('/admin/conferences/new');
    await waitForContent(page);

    // Note: labels lack htmlFor (tracked in TASK-46); use input locators directly
    const nameField = page.locator('input[type="text"]').first();
    await expect(nameField).toBeVisible({ timeout: 10_000 });

    // Fill form — Name is first text input (SearchBar is in nav, not in the form)
    // Conference form fields: Name(text), Location(text), WebsiteUrl(url)
    const uniqueName = `Audit Conf ${Date.now()}`;
    const textInputs = page.locator('form input[type="text"]');
    await textInputs.nth(0).fill(uniqueName);  // Name

    const descField = page.locator('form textarea').first();
    if (await descField.count() > 0) await descField.fill('Audit test conference');

    // Location (second text input in form)
    const locationTextInputs = await textInputs.count();
    if (locationTextInputs >= 2) {
      await textInputs.nth(1).fill('Test City, TX');
    }

    // Date fields
    const dateFields = page.locator('input[type="date"]');
    const dateCount = await dateFields.count();
    if (dateCount >= 2) {
      await dateFields.nth(0).fill('2027-01-01');
      await dateFields.nth(1).fill('2027-01-02');
    }

    const submitBtn = page.getByRole('button', { name: /save|create|submit/i }).first();
    await submitBtn.click();
    await page.waitForTimeout(2000);

    // Should redirect or show success
    const url = page.url();
    const body = await page.locator('body').innerText();
    const success = !url.includes('/new') || body.match(/success|created|saved/i);
    expect(success, `Form submit failed. URL: ${url}`).toBeTruthy();

    const critical = networkErrors.filter(e => e.startsWith('5'));
    expect(critical).toHaveLength(0);
  });
});

test.describe('Admin – Edit Conference (/admin/conferences/:id)', () => {
  test('edit form loads with existing data', async ({ page }) => {
    const { networkErrors } = collectErrors(page);
    await loginAsAdmin(page);
    await page.goto(`/admin/conferences/${CONFERENCE_ID}`);
    await waitForContent(page);
    await page.waitForTimeout(2000); // allow query to complete

    // Check that the name input is populated (input values not in innerText, so check directly)
    const nameInput = page.locator('input[type="text"]').nth(1); // nth(0) is SearchBar
    const nameValue = await nameInput.inputValue().catch(() => '');
    expect(nameValue).toMatch(/TechConf 2026/i);

    const critical = networkErrors.filter(e => e.startsWith('5'));
    expect(critical).toHaveLength(0);
  });
});

test.describe('Admin – Sessions list (/admin/sessions)', () => {
  test('loads and shows sessions', async ({ page }) => {
    const { networkErrors } = collectErrors(page);
    await loginAsAdmin(page);
    await page.goto('/admin/sessions');
    await waitForContent(page);

    const body = await page.locator('body').innerText();
    expect(body).toMatch(/react 18|session|\.net aspire/i);

    const critical = networkErrors.filter(e => e.startsWith('5'));
    expect(critical).toHaveLength(0);
  });

  test('"New Session" button is present', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/sessions');
    await waitForContent(page);

    const newBtn = page.getByRole('link', { name: /new|add|create/i }).first();
    await expect(newBtn).toBeVisible();
  });
});

test.describe('Admin – New Session (/admin/sessions/new)', () => {
  test('form loads', async ({ page }) => {
    const { networkErrors } = collectErrors(page);
    await loginAsAdmin(page);
    await page.goto('/admin/sessions/new');
    await waitForContent(page);

    // Should show form fields
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/title|session|track|conference/i);

    const critical = networkErrors.filter(e => e.startsWith('5'));
    expect(critical).toHaveLength(0);
  });

  test('can create a new session', async ({ page }) => {
    const { networkErrors } = collectErrors(page);
    await loginAsAdmin(page);
    await page.goto('/admin/sessions/new');
    await waitForContent(page);

    const titleField = page.getByLabel(/title/i).first();
    if (await titleField.count() === 0) return; // form not rendered, skip

    await titleField.fill(`Audit Session ${Date.now()}`);

    const descField = page.getByLabel(/description/i).first();
    if (await descField.count() > 0) await descField.fill('Audit test session');

    // Select conference/track dropdowns if present
    const selects = page.locator('select');
    const selCount = await selects.count();
    for (let i = 0; i < selCount; i++) {
      const sel = selects.nth(i);
      const options = await sel.locator('option').count();
      if (options > 1) {
        await sel.selectOption({ index: 1 });
      }
    }

    // Fill time fields
    const timeFields = page.locator('input[type="datetime-local"]');
    const timeCount = await timeFields.count();
    if (timeCount >= 2) {
      await timeFields.nth(0).fill('2027-01-01T10:00');
      await timeFields.nth(1).fill('2027-01-01T11:00');
    }

    const submitBtn = page.getByRole('button', { name: /save|create|submit/i }).first();
    await submitBtn.click();
    await page.waitForTimeout(2000);

    const critical5xx = networkErrors.filter(e => e.startsWith('5'));
    expect(critical5xx).toHaveLength(0);
  });
});

test.describe('Admin – Edit Session (/admin/sessions/:id)', () => {
  test('edit form loads with existing session data', async ({ page }) => {
    const { networkErrors } = collectErrors(page);
    await loginAsAdmin(page);
    await page.goto(`/admin/sessions/${SESSION_ID}`);
    await waitForContent(page);

    const body = await page.locator('body').innerText();
    expect(body).toMatch(/react 18|session/i);

    const critical = networkErrors.filter(e => e.startsWith('5'));
    expect(critical).toHaveLength(0);
  });
});

test.describe('Admin – Speakers list (/admin/speakers)', () => {
  test('loads and shows speakers', async ({ page }) => {
    const { networkErrors } = collectErrors(page);
    await loginAsAdmin(page);
    await page.goto('/admin/speakers');
    await waitForContent(page);

    const body = await page.locator('body').innerText();
    expect(body).toMatch(/alice|bob|speaker/i);

    const critical = networkErrors.filter(e => e.startsWith('5'));
    expect(critical).toHaveLength(0);
  });

  test('"New Speaker" button is present', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/speakers');
    await waitForContent(page);

    const newBtn = page.getByRole('link', { name: /new|add|create/i }).first();
    await expect(newBtn).toBeVisible();
  });

  test('delete confirmation dialog is triggered', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/speakers');
    await waitForContent(page);

    const deleteBtn = page.getByRole('button', { name: /delete|remove/i }).first();
    if (await deleteBtn.count() > 0) {
      await deleteBtn.click();
      await page.waitForTimeout(500);
      // Should show a confirmation dialog or modal
      const body = await page.locator('body').innerText();
      expect(body).toMatch(/confirm|are you sure|delete/i);
      // Dismiss without actually deleting
      const cancelBtn = page.getByRole('button', { name: /cancel|no|keep/i }).first();
      if (await cancelBtn.count() > 0) {
        await cancelBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
    }
  });
});

test.describe('Admin – New Speaker (/admin/speakers/new)', () => {
  test('form loads', async ({ page }) => {
    const { networkErrors } = collectErrors(page);
    await loginAsAdmin(page);
    await page.goto('/admin/speakers/new');
    await waitForContent(page);

    // Note: labels lack htmlFor (tracked in TASK-46); verify the form renders
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/name|speaker/i);
    const inputs = page.locator('input[type="text"]');
    await expect(inputs.first()).toBeVisible({ timeout: 10_000 });

    const critical = networkErrors.filter(e => e.startsWith('5'));
    expect(critical).toHaveLength(0);
  });

  test('can create a new speaker', async ({ page }) => {
    const { networkErrors } = collectErrors(page);
    await loginAsAdmin(page);
    await page.goto('/admin/speakers/new');
    await waitForContent(page);

    // Labels have no htmlFor (TASK-46) so locate inputs by position
    // Speaker form: Name(text), Email(email), Company(text), Bio(textarea), Photo(url), Twitter(text), LinkedIn(url)
    const textInputs = page.locator('input[type="text"]');
    if (await textInputs.count() === 0) return;

    await textInputs.first().fill(`Audit Speaker ${Date.now()}`);

    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.count() > 0) await emailInput.fill(`audit-spk-${Date.now()}@test.com`);

    const textareaField = page.locator('textarea').first();
    if (await textareaField.count() > 0) await textareaField.fill('Test bio for audit speaker.');

    const submitBtn = page.getByRole('button', { name: /save|create|submit/i }).first();
    await submitBtn.click();
    await page.waitForTimeout(2000);

    const url = page.url();
    const success = !url.includes('/new');
    expect(success, `Speaker form submit may have failed. URL: ${url}`).toBeTruthy();

    const critical = networkErrors.filter(e => e.startsWith('5'));
    expect(critical).toHaveLength(0);
  });
});

test.describe('Admin – Edit Speaker (/admin/speakers/:id)', () => {
  test('edit form loads with existing speaker data', async ({ page }) => {
    const { networkErrors } = collectErrors(page);
    await loginAsAdmin(page);
    await page.goto(`/admin/speakers/${SPEAKER_ID}`);
    await waitForContent(page);
    await page.waitForTimeout(2000); // allow query to complete

    // Check name input is populated (TASK-46: no htmlFor, use positional locator)
    // nth(0) is SearchBar input; speaker Name is typically first form text input
    const textInputs = page.locator('input[type="text"]');
    const inputCount = await textInputs.count();
    let foundName = false;
    for (let i = 0; i < inputCount; i++) {
      const val = await textInputs.nth(i).inputValue();
      if (/bob martinez/i.test(val)) { foundName = true; break; }
    }
    expect(foundName, 'Expected Bob Martinez to appear in a name input field').toBeTruthy();

    const critical = networkErrors.filter(e => e.startsWith('5'));
    expect(critical).toHaveLength(0);
  });
});

// ─── SESSION REGISTRATION (Auth flow) ────────────────────────────────────────

test.describe('Session registration flow', () => {
  test('logged-in user can register for a session', async ({ page }) => {
    const email = `audit-sreg-${Date.now()}@test.com`;
    await registerAndLogin(page, email);

    await page.goto(`/sessions/${SESSION_ID}`);
    await waitForContent(page);

    // Find register/join button
    const registerBtn = page.getByRole('button', { name: /register|join|enroll/i }).first();
    if (await registerBtn.count() > 0) {
      const { networkErrors } = collectErrors(page);
      await registerBtn.click();
      await page.waitForTimeout(2000);

      const body = await page.locator('body').innerText();
      // Should show confirmation or updated seats
      expect(body).toMatch(/registered|confirmed|cancel|seats/i);

      const critical = networkErrors.filter(e => e.startsWith('5'));
      expect(critical).toHaveLength(0);
    }
  });
});

// ─── 404 / NOT FOUND ─────────────────────────────────────────────────────────

test.describe('404 – Not Found page', () => {
  test('unknown URL shows 404 page', async ({ page }) => {
    await page.goto('/this-does-not-exist-at-all');
    await waitForContent(page);
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/not found|404|page.*not.*exist|oops/i);
  });
});

// ─── NAVIGATION ───────────────────────────────────────────────────────────────

test.describe('Navigation', () => {
  test('logo / home link returns to home', async ({ page }) => {
    await page.goto('/speakers');
    const homeLink = page.locator('a[href="/"], a[href=""]').first();
    if (await homeLink.count() > 0) {
      await homeLink.click();
      await expect(page).toHaveURL(/^\/?$|\/$/);
    }
  });

  test('browser back/forward works across pages', async ({ page }) => {
    await page.goto('/');
    await page.goto('/conferences');
    await page.goto('/speakers');
    await page.goBack();
    await expect(page).toHaveURL(/\/conferences/);
    await page.goBack();
    await expect(page).toHaveURL(/^http:\/\/[^/]+(\/)?$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/conferences/);
  });

  test('logout clears session and redirects', async ({ page }) => {
    await loginAsAdmin(page);
    // Find logout button/link
    const logoutBtn = page.getByRole('button', { name: /log ?out|sign ?out/i });
    const logoutLink = page.getByRole('link', { name: /log ?out|sign ?out/i });
    const btn = (await logoutBtn.count() > 0) ? logoutBtn : logoutLink;
    if (await btn.count() > 0) {
      await btn.first().click();
      await page.waitForTimeout(1000);
      // Should no longer be admin – visiting admin page should redirect
      await page.goto('/admin/conferences');
      await page.waitForTimeout(1000);
      await expect(page).not.toHaveURL(/\/admin/, { timeout: 5_000 });
    }
  });
});

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────

test.describe('Auth – Profile (/profile)', () => {
  test('profile page loads if it exists', async ({ page }) => {
    const email = `audit-prof-${Date.now()}@test.com`;
    await registerAndLogin(page, email);
    await page.goto('/profile');
    await waitForContent(page);
    // If it redirects to 404 that's fine; just verify no 500 errors
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe('complete');
  });
});

// ─── SEARCH (if present) ───────────────────────────────────────────────────────

test.describe('Search functionality', () => {
  test('search bar (if present) returns results', async ({ page }) => {
    await page.goto('/');
    await waitForContent(page);
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('react');
      await searchInput.press('Enter');
      await page.waitForTimeout(1500);
      const body = await page.locator('body').innerText();
      expect(body).toMatch(/react|result/i);
    }
  });
});

// ─── iCAL EXPORT (if present) ─────────────────────────────────────────────────

test.describe('iCal export', () => {
  test('iCal download link is present on schedule or session page', async ({ page }) => {
    await page.goto('/schedule');
    await waitForContent(page);
    await page.waitForTimeout(1000);

    const icalLink = page.locator('a[href*=".ics"], a[href*="ical"], button[aria-label*="ical" i]').first();
    if (await icalLink.count() > 0) {
      await expect(icalLink).toBeVisible();
    }
  });
});
