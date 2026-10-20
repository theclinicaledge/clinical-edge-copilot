import { test, expect } from '@playwright/test';
import { alarmChoices, alarmExplanations, monitorChoices, rhythmChoices, recommendations } from '../src/modules/the-shift/monitor/data.js';
const origin = process.env.CE_TEST_BASE_URL || 'http://127.0.0.1:5211';
const saved = JSON.stringify({ version: 1, stage: 7, answers: { alarm: alarmChoices[0].id, explanation: alarmExplanations[0].id, monitor: monitorChoices[0].id, rhythm: rhythmChoices[0].id, cues: [], actions: ['notify', 'stay', 'ecg'], chips: [], recommendation: recommendations[0].id } });
test.use({ storageState: { cookies: [], origins: [{ origin, localStorage: [{ name: 'ce-private-shift-monitor-r2', value: saved }] }] } });
for (const width of [320, 390, 1440]) {
 test(`comparison and saved return at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  const api: string[] = [];
  page.on('request', req => { if (new URL(req.url()).pathname.startsWith('/api/')) api.push(req.url()); });
  await page.goto('/learn/shifts/monitor-alarm');
  const next = page.getByRole('region', { name: 'Your next step' });
  const link = next.getByRole('link', { name: 'Open rhythm comparison' });
  await link.focus();
  await link.press('Enter');
  await expect(page).toHaveURL(/rhythm-lab\/compare\?pair=sinus-af&shift=monitor-alarm/);
  await expect(page.getByLabel('Rhythm A', { exact: true })).toHaveValue('nsr');
  await expect(page.getByLabel('Rhythm B', { exact: true })).toHaveValue('afib');
  await page.reload();
  await expect(page.getByLabel('Rhythm B', { exact: true })).toHaveValue('afib');
  await expect(page.getByRole('link', { name: /Return to The Monitor Alarm/ }).first()).toBeVisible();
  await page.screenshot({ path: `/private/tmp/ce-monitor-rhythm-${width}.png` });
  await page.locator('.compare-strip-card').first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: `/private/tmp/ce-monitor-rhythm-strips-${width}.png` });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('navigation', { name: 'Rhythm Lab sections' }).getByRole('link', { name: 'Library', exact: true }).click();
  await expect(page).toHaveURL(/library\?shift=monitor-alarm/);
  await page.getByRole('link', { name: /Return to The Monitor Alarm/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Your shift review' })).toBeVisible();
  expect(api).toEqual([]);
 });
}
test('ordinary comparison keeps its existing defaults', async ({ page }) => {
 await page.goto('/rhythm-lab/compare?pair=invalid&shift=unknown');
 await expect(page.getByLabel('Rhythm A', { exact: true })).toHaveValue('mobitz_i');
 await expect(page.getByLabel('Rhythm B', { exact: true })).toHaveValue('mobitz_ii');
 await expect(page.getByRole('link', { name: /Return to The Monitor Alarm/ })).toHaveCount(0);
});
