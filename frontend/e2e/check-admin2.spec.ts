import { test } from '@playwright/test';
test('manual admin form detailed check', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`); });

  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@conference.dev');
  await page.fill('input[type="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('AFTER_LOGIN url:', page.url());
  
  // Wait longer for edit page
  await page.goto('/admin/conferences/2ecb9971-7301-4a43-a382-08520fbabb43');
  await page.waitForTimeout(5000);
  const body = await page.locator('body').innerText();
  console.log('CONF_EDIT_BODY (first 500):', body.substring(0, 500));
  const allLabels = await page.$$eval('label', els => els.map(el => el.textContent?.trim()));
  console.log('CONF_EDIT_LABELS:', JSON.stringify(allLabels));
  const textInputs = await page.$$eval('input', els => els.map(el => ({ id: el.id, type: el.type, value: (el as HTMLInputElement).value })));
  console.log('CONF_EDIT_INPUTS:', JSON.stringify(textInputs));
  
  // Session schedule check  
  await page.goto('/schedule');
  await page.waitForTimeout(2000);
  const schedBody = await page.locator('body').innerText();
  console.log('SCHEDULE_BODY (first 300):', schedBody.substring(0, 300));
  const timeDisplayed = schedBody.match(/\d{1,2}:\d{2} [AP]M/g);
  console.log('SCHEDULE_TIMES:', timeDisplayed);
  
  console.log('ALL_ERRORS:', JSON.stringify(errors));
});
