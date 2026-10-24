import { test, expect } from '@playwright/test';
import { alarmChoices, alarmExplanations, monitorChoices, rhythmChoices, recommendations } from '../src/modules/the-shift/monitor/data.js';
const origin = process.env.CE_TEST_BASE_URL || 'http://127.0.0.1:5210';
const records = [
  { name: 'ce-private-shift-drowsy-r2', value: JSON.stringify({ version: 1, stage: 1, answers: {} }) },
  { name: 'ce-private-shift-monitor-r2', value: JSON.stringify({ version: 1, stage: 7, answers: { alarm: alarmChoices[0].id, explanation: alarmExplanations[0].id, monitor: monitorChoices[0].id, rhythm: rhythmChoices[0].id, cues: [], actions: ['notify', 'stay', 'ecg'], chips: [], recommendation: recommendations[0].id } }) },
];
test.use({ storageState: { cookies: [], origins: [] } });
test('new and invalid saved progress remain not started', async ({ page }) => {
  await page.goto('/learn');
  await expect(page.locator('.shift-library-status--new')).toHaveCount(6);
  await page.evaluate(() => localStorage.setItem('ce-private-shift-drowsy-r2', '{invalid'));
  await page.reload();
  await expect(page.locator('.shift-library-status--new')).toHaveCount(6);
});
for (const width of [320, 390, 1440]) {
  test(`mixed progress, navigation and layout at ${width}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 844 }, storageState: { cookies: [], origins: [{ origin, localStorage: records }] }, serviceWorkers: 'block' });
    const page = await context.newPage();
    await page.goto(`${origin}/learn`);
    const cards = page.locator('.shift-library-card');
    await expect(cards).toHaveCount(6);
    await expect(cards.nth(0).locator('.shift-library-status')).toHaveText('◐In progress');
    await expect(cards.nth(1).locator('.shift-library-status')).toHaveText('✓Finished');
    await expect(cards.nth(1)).toContainText('Debrief reached');
    await expect(page.locator('.shift-library-status--new')).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await cards.nth(0).scrollIntoViewIfNeeded();
    await page.screenshot({ path: `/private/tmp/ce-library-status-${width}.png` });
    const resume = cards.nth(0).getByRole('link', { name: 'Continue shift' });
    await resume.focus();
    await resume.press('Enter');
    await expect(page.getByRole('heading', { name: 'Who do you see first?' })).toBeVisible();
    await page.getByRole('link', { name: 'Shift Library', exact: false }).first().click();
    await expect(cards.nth(0).locator('.shift-library-status')).toContainText('In progress');
    await cards.nth(1).getByRole('link', { name: 'Review debrief' }).click();
    await expect(page.getByRole('heading', { name: 'Your shift review' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Your shift review' })).toBeVisible();
    await context.close();
  });
}
