import { test } from '@playwright/test';
test('final bug verification', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(`[${m.type()}] ${m.text()}`); });
  page.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`); });
  
  // 1. Check schedule for times and console errors
  await page.goto('/schedule');
  await page.waitForTimeout(2000);
  const schedBody = await page.locator('body').innerText();
  const times = schedBody.match(/\d{1,2}:\d{2} [AP]M/g);
  console.log('Schedule times found:', JSON.stringify(times));
  
  // 2. Check session detail
  await page.goto('/sessions/70a41593-9bf3-4507-9396-308e88820b32');
  await page.waitForTimeout(1500);
  const sessionBody = await page.locator('body').innerText();
  console.log('Session detail - time shown:', sessionBody.match(/\d{1,2}:\d{2}/g));
  
  // 3. Verify my-schedule redirects without login
  await page.goto('/my-schedule');
  await page.waitForTimeout(500);
  console.log('MySchedule url (unauthed):', page.url());
  
  // 4. Check /admin/sessions/new form
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@conference.dev');
  await page.fill('input[type="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  await page.goto('/admin/sessions/new');
  await page.waitForTimeout(1500);
  const sessBody = await page.locator('body').innerText();
  console.log('Session new form body (first 300):', sessBody.substring(0, 300));
  const sessLabels = await page.$$eval('label', els => els.map(e => ({text: e.textContent?.trim(), for: e.htmlFor})));
  console.log('Session new labels:', JSON.stringify(sessLabels));
  
  // 5. Check speaker detail page  
  await page.goto('/speakers/b7e59d93-a120-4e7d-b57b-dd944cc6bfc2');
  await page.waitForTimeout(1500);
  const spkBody = await page.locator('body').innerText();
  console.log('Speaker detail body (first 300):', spkBody.substring(0, 300));
  
  console.log('ALL_ERRORS:', JSON.stringify(errors));
});
