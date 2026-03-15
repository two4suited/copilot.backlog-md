import { chromium } from '@playwright/test';

const BASE = process.env.APP_URL || 'http://localhost:61367';
const OUT = process.env.OUT_DIR || '/Users/brian/Source/copilot.backlog-md/docs/screenshots';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });

  // Go to conferences
  await page.goto(BASE + '/conferences');
  await page.waitForLoadState('networkidle');
  
  // Get all conference links
  const links = await page.$$eval('a[href*="/conferences/"]', els => els.map(e => e.href));
  console.log('Conference links found:', links.slice(0, 5));
  
  for (const link of links.slice(0, 3)) {
    await page.goto(link);
    await page.waitForLoadState('networkidle');
    
    // Try to go to schedule from here
    const schedHref = await page.$eval('a[href*="/schedule"]', el => el.href).catch(() => null);
    console.log('Schedule link:', schedHref);
    
    if (schedHref) {
      await page.goto(schedHref);
      await page.waitForLoadState('networkidle');
      
      // Dump all links
      const allLinks = await page.$$eval('a', els => els.map(e => e.href));
      const sessionLinks = allLinks.filter(h => h.includes('/session'));
      console.log('Session links on schedule:', sessionLinks.slice(0, 5));
      
      if (sessionLinks.length > 0) {
        await page.goto(sessionLinks[0]);
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: `${OUT}/session-detail.png` });
        console.log('✓ session-detail.png captured from', sessionLinks[0]);
        break;
      }
    }
    
    // Try sessions directly on conference detail
    const confAllLinks = await page.$$eval('a', els => els.map(e => e.href));
    const confSessionLinks = confAllLinks.filter(h => h.includes('/session'));
    console.log('Session links on conf detail:', confSessionLinks.slice(0, 5));
    
    if (confSessionLinks.length > 0) {
      await page.goto(confSessionLinks[0]);
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `${OUT}/session-detail.png` });
      console.log('✓ session-detail.png captured from', confSessionLinks[0]);
      break;
    }
  }

  await browser.close();
})();
