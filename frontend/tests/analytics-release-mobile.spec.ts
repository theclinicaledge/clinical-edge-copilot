import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });

test('Shift card matches Ask radius and privacy choices remain usable on mobile', async ({ page }) => {
  await page.goto('/');
  const shift = page.locator('.ce-home-shift');
  const ask = page.locator('.ce-home-feature');
  await expect(shift).toBeVisible();
  await expect(ask).toBeVisible();
  expect(await shift.evaluate(element => getComputedStyle(element).borderRadius))
    .toBe(await ask.evaluate(element => getComputedStyle(element).borderRadius));
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  await page.getByRole('link', { name: 'Choices', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Privacy Policy', exact: true })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: /pseudonymous product usage events/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
