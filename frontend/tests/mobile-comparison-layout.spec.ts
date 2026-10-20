import { test, expect } from '@playwright/test';
test.use({ storageState: { cookies: [], origins: [] } });
for (const width of [320, 390, 1440]) {
 test(`comparison controls and strips at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  await page.goto('/rhythm-lab/compare?pair=sinus-af&shift=monitor-alarm');
  const a = page.getByLabel('Rhythm A', { exact: true });
  const b = page.getByLabel('Rhythm B', { exact: true });
  await expect(a).toHaveValue('nsr');
  await expect(b).toHaveValue('afib');
  if (width < 641) {
   await expect.poll(async () => Math.abs((await a.boundingBox())!.y - (await b.boundingBox())!.y)).toBeLessThan(2);
   const boxA = await a.boundingBox();
   expect(boxA!.height).toBeGreaterThanOrEqual(44);
   const strips = await page.locator('.compare-strips').boundingBox();
   expect(strips!.y).toBeLessThan(width === 320 ? 600 : 550);
  }
  await a.focus();
  await expect(a).toBeFocused();
  await a.selectOption('sinus_bradycardia');
  await expect(page.locator('.compare-strip-card').first()).toContainText('Sinus Bradycardia');
  await a.selectOption('nsr');
  await page.getByRole('tab', { name: 'Confusables', exact: true }).click();
  await expect(page.getByRole('tabpanel', { name: 'Confusables', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Compare', exact: true }).click();
  await expect(a).toHaveValue('nsr');
  await expect(b).toHaveValue('afib');
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `/private/tmp/ce-compact-compare-${width}.png`, animations: 'disabled' });
 });
}
