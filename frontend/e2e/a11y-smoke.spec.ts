import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';

async function isApiAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`).catch(() => null);
    return !!res && res.ok;
  } catch {
    return false;
  }
}

type AxeViolation = {
  id: string;
  impact: string | null;
  description: string;
  nodes: unknown[];
};

/** Run axe and return critical violations */
async function getCriticalViolations(page: import('@playwright/test').Page): Promise<AxeViolation[]> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  return (results.violations as AxeViolation[]).filter(v => v.impact === 'critical');
}

test.describe('Accessibility Smoke Tests', () => {
  test('Schedule page has zero critical a11y violations', async ({ page }) => {
    await page.goto('/schedule');
    // Wait for any content to load
    await page.waitForLoadState('networkidle');

    const criticalViolations = await getCriticalViolations(page);

    if (criticalViolations.length > 0) {
      const details = criticalViolations.map(v =>
        `[${v.id}] ${v.description} (${v.nodes.length} node(s))`
      ).join('\n');
      expect(criticalViolations, `Critical a11y violations on /schedule:\n${details}`).toHaveLength(0);
    }
  });

  test('Home page has zero critical a11y violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const criticalViolations = await getCriticalViolations(page);

    if (criticalViolations.length > 0) {
      const details = criticalViolations.map(v =>
        `[${v.id}] ${v.description} (${v.nodes.length} node(s))`
      ).join('\n');
      expect(criticalViolations, `Critical a11y violations on /:\n${details}`).toHaveLength(0);
    }
  });

  test('Conferences page has zero critical a11y violations', async ({ page }) => {
    await page.goto('/conferences');
    await page.waitForLoadState('networkidle');

    const criticalViolations = await getCriticalViolations(page);

    if (criticalViolations.length > 0) {
      const details = criticalViolations.map(v =>
        `[${v.id}] ${v.description} (${v.nodes.length} node(s))`
      ).join('\n');
      expect(criticalViolations, `Critical a11y violations on /conferences:\n${details}`).toHaveLength(0);
    }
  });

  test('Login page has zero critical a11y violations', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const criticalViolations = await getCriticalViolations(page);

    if (criticalViolations.length > 0) {
      const details = criticalViolations.map(v =>
        `[${v.id}] ${v.description} (${v.nodes.length} node(s))`
      ).join('\n');
      expect(criticalViolations, `Critical a11y violations on /login:\n${details}`).toHaveLength(0);
    }
  });

  test('Register page has zero critical a11y violations', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    const criticalViolations = await getCriticalViolations(page);

    if (criticalViolations.length > 0) {
      const details = criticalViolations.map(v =>
        `[${v.id}] ${v.description} (${v.nodes.length} node(s))`
      ).join('\n');
      expect(criticalViolations, `Critical a11y violations on /register:\n${details}`).toHaveLength(0);
    }
  });

  test('Session Detail page has zero critical a11y violations', async ({ page }) => {
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
    await page.waitForLoadState('networkidle');

    const criticalViolations = await getCriticalViolations(page);

    if (criticalViolations.length > 0) {
      const details = criticalViolations.map(v =>
        `[${v.id}] ${v.description} (${v.nodes.length} node(s))`
      ).join('\n');
      expect(criticalViolations, `Critical a11y violations on session detail:\n${details}`).toHaveLength(0);
    }
  });

  test('Speaker Detail page has zero critical a11y violations', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    await page.goto('/speakers');
    const firstSpeaker = page.locator('a[href*="/speakers/"]').first();
    await expect(firstSpeaker).toBeVisible({ timeout: 20_000 });
    await firstSpeaker.click();
    await expect(page).toHaveURL(/\/speakers\/[^/]+$/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    const criticalViolations = await getCriticalViolations(page);

    if (criticalViolations.length > 0) {
      const details = criticalViolations.map(v =>
        `[${v.id}] ${v.description} (${v.nodes.length} node(s))`
      ).join('\n');
      expect(criticalViolations, `Critical a11y violations on speaker detail:\n${details}`).toHaveLength(0);
    }
  });

  test('Admin page has zero critical a11y violations (when authenticated as admin)', async ({ page }) => {
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      test.skip();
      return;
    }

    // Log in as admin
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@conference.dev');
    await page.getByLabel(/password/i).fill('Admin123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });

    await page.goto('/admin/conferences');
    await page.waitForLoadState('networkidle');

    const criticalViolations = await getCriticalViolations(page);

    if (criticalViolations.length > 0) {
      const details = criticalViolations.map(v =>
        `[${v.id}] ${v.description} (${v.nodes.length} node(s))`
      ).join('\n');
      expect(criticalViolations, `Critical a11y violations on /admin/conferences:\n${details}`).toHaveLength(0);
    }
  });
});
