import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test('new and corrupt progress do not create a false resume', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Continue learning' })).toHaveCount(0);
  await page.evaluate(() => localStorage.setItem('ce-private-shift-drowsy-r2', '{broken'));
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Continue learning' })).toHaveCount(0);
});

test('all live adapters distinguish unfinished from debrief without modifying storage', async ({ page }) => {
  await page.goto('/');
  const results = await page.evaluate(async () => {
    const { SHIFTS, progressLabel } = await import('/src/modules/the-shift/integrated/registry.js');
    return SHIFTS.map(item => {
      const original = item.readProgress;
      item.readProgress = () => ({ stage: 1, answers: {} });
      const unfinished = progressLabel(item);
      item.readProgress = () => ({ stage: item.finalStage, answers: {} });
      const final = progressLabel(item);
      item.readProgress = original;
      return { unfinished, final };
    });
  });
  expect(results).toHaveLength(5);
  for (const item of results) {
    expect(item.unfinished).toMatch(/^Continue: /);
    expect(item.final).toBe('Debrief reached');
  }
});

for (const width of [320, 390, 768, 1440]) {
  test(`resume, keyboard and Home refresh at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('ce-private-shift-drowsy-r2', JSON.stringify({ version: 1, stage: 1, answers: {} })));
    await page.reload();
    const resume = page.getByRole('link', { name: /Continue The Drowsy Patient/ });
    await expect(resume).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await resume.focus();
    await expect(resume).toBeFocused();
    if (width === 390 || width === 1440) await page.screenshot({ path: `/private/tmp/ce-home-continue-${width}.png` });
    await resume.press('Enter');
    await expect(page).toHaveURL(/drowsy-patient/);
    await expect(page.getByRole('heading', { name: 'Who do you see first?' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Who do you see first?' })).toBeVisible();
    await page.getByRole('link', { name: 'Home', exact: true }).click();
    await expect(resume).toBeVisible();
  });
}
