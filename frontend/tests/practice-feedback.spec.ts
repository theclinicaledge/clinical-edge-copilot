import { test, expect } from '@playwright/test';
import { RHYTHMS } from '../src/modules/rhythm-lab/data/rhythms';
test.use({ storageState: { cookies: [], origins: [] } });
for (const width of [320, 390, 1440]) {
 test(`practice reveal and manual next at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  await page.goto('/rhythm-lab/practice?shift=monitor-alarm');
  await page.getByLabel('Practice category').selectOption('beginner');
  const strip = page.locator('.practice-reading-strip svg').first();
  const before = await strip.innerHTML();
  await page.getByRole('button', { name: 'Show first clue' }).click();
  await page.getByRole('button', { name: 'Show another clue' }).click();
  const reveal = page.getByRole('button', { name: 'Reveal rhythm' });
  await reveal.focus();
  await reveal.press('Enter');
  const answer = page.getByLabel('Revealed rhythm');
  await expect(answer).toBeFocused();
  await expect(answer).toContainText('Normal Sinus Rhythm');
  expect(await strip.innerHTML()).toBe(before);
  for (const cue of RHYTHMS.find(r => r.id === 'nsr')!.recognitionCues.slice(0, 3)) await expect(page.locator('.practice-cues')).toContainText(cue);
  const box = await answer.boundingBox();
  const dock = await page.locator('.ce-tool-dock').boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThan(dock!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `/private/tmp/ce-practice-feedback-${width}.png`, animations: 'disabled' });
  await page.locator('.practice-next-top').click();
  await expect(page.locator('.practice-answer')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Show first clue' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Return to The Monitor Alarm/ })).toBeVisible();
 });
}
