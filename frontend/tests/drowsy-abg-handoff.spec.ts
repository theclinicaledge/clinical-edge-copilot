import { test, expect } from '@playwright/test';
test.use({ storageState: { cookies: [], origins: [] } });
for (const width of [320, 390, 1440]) {
  test(`existing ABG example and saved return at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const api: string[] = [];
    page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/')) api.push(request.url()); });
    await page.goto('/learn/shifts/drowsy-patient');
    const saved = JSON.stringify({ version: 1, stage: 6, answers: { priority: '12', cues: [], action: 'escalate', abg: 'partial', sbar: 'a' } });
    await page.evaluate(value => localStorage.setItem('ce-private-shift-drowsy-r2', value), saved);
    await page.reload();
    await page.getByRole('region', { name: 'Your next step' }).getByRole('link', { name: 'Open ABG example' }).click();
    await page.reload();
    await expect(page.getByRole('region', { name: 'Practice after The Drowsy Patient' })).toContainText('not Room 12');
    await expect(page.locator('#abg-ph')).toHaveValue('7.29');
    await expect(page.getByRole('region', { name: 'ABG interpretation', exact: true })).toHaveCount(0);
    await page.screenshot({ path: `/private/tmp/ce-drowsy-abg-${width}.png`, animations: 'disabled' });
    const explore = page.getByRole('button', { name: 'Explore this example' });
    await explore.focus();
    await explore.press('Enter');
    await expect(page.getByRole('region', { name: 'ABG interpretation', exact: true })).toContainText('Respiratory acidosis');
    await page.getByText('Try another example', { exact: true }).click();
    await page.getByRole('button', { name: 'Metabolic acidosis', exact: true }).click();
    await expect(page.locator('#abg-ph')).toHaveValue('7.28');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('link', { name: /Return to The Drowsy Patient/ }).first().click();
    await expect(page.getByRole('region', { name: 'Your next step' })).toBeVisible();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ce-private-shift-drowsy-r2')!).answers)).toEqual(JSON.parse(saved).answers);
    expect(api).toEqual([]);
  });
}
test('ordinary ABG entry remains unchanged', async ({ page }) => {
  await page.goto('/abg-lab');
  await expect(page.getByRole('region', { name: 'Practice after The Drowsy Patient' })).toHaveCount(0);
  await expect(page.locator('#abg-ph')).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Respiratory acidosis', exact: true })).toBeVisible();
});
