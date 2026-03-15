import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE = process.env.APP_URL || 'http://localhost:61367';
const OUT = process.env.OUT_DIR || '/Users/brian/Source/copilot.backlog-md/docs/screenshots';

fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });

  // 1. Home page
  await page.goto(BASE + '/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUT}/home.png`, fullPage: false });
  console.log('✓ home.png');

  // 2. Conferences page
  await page.goto(BASE + '/conferences');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUT}/conferences.png` });
  console.log('✓ conferences.png');

  // 3. Conference detail — click first card
  const confHref = await page.$eval('a[href*="/conferences/"]', el => el.href);
  await page.goto(confHref);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUT}/conference-detail.png` });
  console.log('✓ conference-detail.png');

  // 4. Schedule page (from conference detail if available, else root /schedule)
  const schedLink = await page.$('a[href*="/schedule"]');
  if (schedLink) {
    await schedLink.click();
    await page.waitForLoadState('networkidle');
  } else {
    await page.goto(BASE + '/schedule');
    await page.waitForLoadState('networkidle');
  }
  await page.screenshot({ path: `${OUT}/schedule.png` });
  console.log('✓ schedule.png');

  // 5. Session detail — find first session link on schedule
  const sessionLink = await page.$('a[href*="/sessions/"]');
  if (sessionLink) {
    await sessionLink.click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUT}/session-detail.png` });
    console.log('✓ session-detail.png');
  } else {
    console.log('⚠ No session link found on schedule, trying conference detail');
    await page.goto(confHref);
    await page.waitForLoadState('networkidle');
    const sl = await page.$('a[href*="/sessions/"]');
    if (sl) {
      await sl.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `${OUT}/session-detail.png` });
      console.log('✓ session-detail.png');
    }
  }

  // 6. Speakers page
  await page.goto(BASE + '/speakers');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUT}/speakers.png` });
  console.log('✓ speakers.png');

  // 7. Admin dashboard
  await page.goto(BASE + '/admin');
  await page.waitForLoadState('networkidle');
  // If login redirect, log in
  if (page.url().includes('/login') || page.url().includes('/signin')) {
    await page.fill('input[type="email"], input[name="email"]', 'admin@conference.dev');
    await page.fill('input[type="password"], input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
  }
  await page.screenshot({ path: `${OUT}/admin.png` });
  console.log('✓ admin.png');

  await browser.close();
  console.log('\nAll screenshots saved to', OUT);
})();
