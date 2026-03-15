const { chromium } = require('playwright');
const path = require('path');
const BASE = process.env.APP_URL || 'http://localhost:54690';
const OUT = process.env.OUT_DIR || path.join(__dirname, '../docs/screenshots');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  // Home page
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUT}/home.png`, fullPage: false });
  console.log('home.png captured');

  // Conferences page
  await page.goto(BASE + '/conferences');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUT}/conferences.png` });
  console.log('conferences.png captured');

  // Schedule page
  await page.goto(BASE + '/schedule');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUT}/schedule.png` });
  console.log('schedule.png captured');

  // Speakers page
  await page.goto(BASE + '/speakers');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUT}/speakers.png` });
  console.log('speakers.png captured');

  // Session detail — grab first session link from schedule or conferences
  await page.goto(BASE + '/conferences');
  await page.waitForLoadState('networkidle');
  const confLink = await page.$('a[href*="/conferences/"]');
  if (confLink) {
    await confLink.click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUT}/conference-detail.png` });
    console.log('conference-detail.png captured');
    // Try to find a session link
    const sessionLink = await page.$('a[href*="/sessions/"]');
    if (sessionLink) {
      await sessionLink.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `${OUT}/session-detail.png` });
      console.log('session-detail.png captured');
    }
  }

  // Login then admin dashboard
  await page.goto(BASE + '/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'admin@conference.dev');
  await page.fill('input[type="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  await page.goto(BASE + '/admin/conferences');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUT}/admin.png` });
  console.log('admin.png captured');

  await browser.close();
  console.log('All screenshots saved to docs/screenshots/');
})();
