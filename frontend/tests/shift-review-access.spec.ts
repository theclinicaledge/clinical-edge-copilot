import { test, expect } from '@playwright/test';
test.use({ storageState: { cookies: [], origins: [] } });
const saved = { version: 1, stage: 6, answers: { priority: '12', cues: [], action: 'escalate', abg: 'partial', sbar: 'a' } };
for (const width of [320, 390, 1440]) {
  test(`review without replay at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/learn');
    await expect(page.getByRole('region', { name: 'Your debriefs' })).toHaveCount(0);
    await page.evaluate(value => localStorage.setItem('ce-private-shift-drowsy-r2', JSON.stringify(value)), saved);
    await page.reload();
    const reviews = page.getByRole('region', { name: 'Your debriefs' });
    await expect(reviews.getByRole('link')).toHaveCount(1);
    await reviews.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `/private/tmp/ce-shift-review-${width}.png`, animations: 'disabled' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const link = reviews.getByRole('link', { name: /The Drowsy Patient/ });
    await link.focus();
    await link.press('Enter');
    await expect(page.getByRole('region', { name: 'Your next step' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('region', { name: 'Your next step' })).toBeVisible();
    await page.getByRole('button', { name: 'Play again' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Keep my place' }).click();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ce-private-shift-drowsy-r2')!).answers)).toEqual(saved.answers);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ce-private-shift-drowsy-r2')!).stage)).toBe(6);
  });
}
