import { test } from '@playwright/test';
test('manual admin form check', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@conference.dev');
  await page.fill('input[type="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/(?!.*login)/, { timeout: 10000 });
  
  await page.goto('/admin/conferences/2ecb9971-7301-4a43-a382-08520fbabb43');
  await page.waitForTimeout(2000);
  const confNameValue = await page.$eval('input[type="text"]', el => (el as HTMLInputElement).value).catch(() => 'NOT FOUND');
  console.log('CONF_EDIT name input value:', confNameValue);
  
  const labels = await page.$$eval('label', els => els.map(el => ({text: el.textContent?.trim(), htmlFor: (el as HTMLLabelElement).htmlFor})));
  console.log('CONF_EDIT labels:', JSON.stringify(labels));
  
  await page.goto('/admin/speakers/7813110c-39b0-490d-8f62-dc7520de08aa');
  await page.waitForTimeout(2000);
  const speakerName = await page.$eval('input[type="text"]', el => (el as HTMLInputElement).value).catch(() => 'NOT FOUND');
  console.log('SPEAKER_EDIT name input value:', speakerName);

  await page.goto('/admin/conferences/new');
  await page.waitForTimeout(1000);
  const inputs = await page.$$eval('input', els => els.map(el => ({ id: el.id, name: el.name, type: el.type })));
  console.log('CONF_NEW inputs:', JSON.stringify(inputs));
  
  // Check schedule page
  await page.goto('/schedule');
  await page.waitForTimeout(2000);
  const selectCount = await page.locator('select').count();
  const comboCount = await page.locator('[role="combobox"]').count();
  console.log('SCHEDULE selects:', selectCount, 'combos:', comboCount);
  const pageContent = await page.locator('body').innerText();
  console.log('SCHEDULE body snippet:', pageContent.substring(0, 400));
});
