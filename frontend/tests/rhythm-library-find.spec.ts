import { test, expect } from '@playwright/test';
test.use({ storageState: { cookies: [], origins: [] } });
for (const width of [320, 390, 1440]) {
 test(`search and return at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  await page.goto('/rhythm-lab/library');
  const search = page.getByRole('searchbox', { name: 'Filter rhythms' });
  for (const [query, name] of [['a-fib', 'Atrial Fibrillation'], ['v-tach', 'Ventricular Tachycardia'], ['CHB', 'Third-Degree AV Block'], ['mobitz-2', 'Mobitz']]) {
   await search.fill(query);
   await expect(page.locator('.rhythm-list')).toContainText(name);
  }
  await search.fill('not-a-rhythm');
  await expect(page.getByRole('status')).toContainText('No matching rhythms');
  await search.fill('');
  const card = page.locator('.rhythm-list .rhythm-item').nth(12);
  await card.scrollIntoViewIfNeeded();
  await card.focus();
  const before = (await card.boundingBox())!.y;
  await card.press('Enter');
  const back = page.getByRole('button', { name: 'Back to rhythm list' });
  await expect(back).toBeFocused();
  await back.press('Enter');
  await expect(card).toBeFocused();
  await expect.poll(async () => Math.abs((await card.boundingBox())!.y - before)).toBeLessThan(5);
  await search.fill('a-fib');
  await page.locator('.rhythm-list .rhythm-item').first().click();
  await back.click();
  await expect(search).toHaveValue('a-fib');
  await search.fill('');
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `/private/tmp/ce-rhythm-find-${width}.png`, animations: 'disabled' });
 });
}
