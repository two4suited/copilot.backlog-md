/**
 * Playwright script to capture screenshots of the session ratings feature.
 * Run: node scripts/screenshot-ratings.mjs
 */
import { chromium } from '@playwright/test';
import { writeFileSync } from 'fs';

const FRONTEND = 'http://localhost:61875';
const SESSION_PATH = '/sessions/97c2b9ae-d6f8-40ce-bec4-93f0f7806f13';
const EMAIL = 'user1@test.dev';
const PASSWORD = 'Test123!';
const OUT = 'docs/screenshots';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  // ── 1. Session detail — anonymous view (shows summary, no form) ──────────
  console.log('1. Navigating to session detail (anonymous)…');
  await page.goto(`${FRONTEND}${SESSION_PATH}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/session-detail.png`, fullPage: false });
  console.log('   Saved session-detail.png');

  // Scroll to ratings section and screenshot
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/session-ratings-anonymous.png`, fullPage: false });
  console.log('   Saved session-ratings-anonymous.png');

  // ── 2. Log in ─────────────────────────────────────────────────────────────
  console.log('2. Logging in…');
  await page.goto(`${FRONTEND}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${FRONTEND}/**`, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1000);

  // ── 3. Session detail — logged in, scroll to ratings ─────────────────────
  console.log('3. Navigating to session detail (logged in)…');
  await page.goto(`${FRONTEND}${SESSION_PATH}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Scroll down to ratings section
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/session-ratings-logged-in.png`, fullPage: false });
  console.log('   Saved session-ratings-logged-in.png');

  // ── 4. Full page with ratings section visible ─────────────────────────────
  await page.goto(`${FRONTEND}${SESSION_PATH}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/session-detail-with-ratings.png`, fullPage: true });
  console.log('   Saved session-detail-with-ratings.png (full page)');

  // ── 5. Star hover state ───────────────────────────────────────────────────
  // Scroll to the rating form and hover over stars
  const stars = page.locator('[role="radiogroup"] label, [aria-label*="star"]').first();
  const starsCount = await stars.count().catch(() => 0);
  if (starsCount > 0) {
    await stars.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${OUT}/session-ratings-form.png`, fullPage: false });
    console.log('   Saved session-ratings-form.png');
  }

  await browser.close();
  console.log('\nDone! Screenshots saved to docs/screenshots/');
}

main().catch(err => { console.error(err); process.exit(1); });
