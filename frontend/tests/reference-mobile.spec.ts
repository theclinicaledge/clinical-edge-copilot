import { test, expect } from '@playwright/test';
test.use({ storageState: { cookies: [], origins: [] } });
for (const width of [320, 390, 1440]) {
 test(`reference search and return at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  await page.goto('/reference-hub');
  const search = page.locator('.rh-search');
  await search.fill('potassium');
  const card = page.locator('.rh-ref-card').filter({ hasText: 'Serum Potassium' });
  await expect(card).toBeVisible();
  await card.focus();
  const top = (await card.boundingBox())!.y;
  await card.press('Enter');
  await expect(page.locator('.rh-detail-page')).toContainText('Clinical decisions belong with the treating team, active orders, and local protocol.');
  await page.getByRole('button', { name: /All references/ }).click();
  await expect(search).toHaveValue('potassium');
  await expect(card).toBeFocused();
  await expect.poll(async () => Math.abs((await card.boundingBox())!.y - top)).toBeLessThan(5);
  await search.fill('no-match-xyz');
  await expect(page.locator('.rh-empty')).toBeVisible();
  await search.fill('');
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `/private/tmp/ce-reference-mobile-${width}.png`, animations: 'disabled' });
 });
}
test('Shift deep link and return remain intact', async ({ page }) => {
 await page.goto('/reference-hub?reference=potassium&shift=monitor-alarm');
 await expect(page.locator('.rh-detail-page')).toContainText('Serum Potassium');
 await expect(page.getByRole('link', { name: /Return to The Monitor Alarm/ })).toBeVisible();
 await page.getByRole('button', { name: /All references/ }).click();
 await page.getByRole('link', { name: /Return to The Monitor Alarm/ }).click();
 await expect(page).toHaveURL(/learn\/shifts\/monitor-alarm/);
});
