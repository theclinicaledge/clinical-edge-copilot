import { test, expect } from '@playwright/test';
import { alarmChoices, alarmExplanations, monitorChoices, rhythmChoices, recommendations } from '../src/modules/the-shift/monitor/data.js';
import { startChoices, teachChoices, fixChoices } from '../src/modules/the-shift/discharge/data.js';
test.use({ storageState: { cookies: [], origins: [] } });
for (const width of [320, 390, 1440]) {
  test(`debrief next step and return at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/learn/shifts/drowsy-patient');
    await expect(page.getByRole('region', { name: 'Your next step' })).toHaveCount(0);
    await page.evaluate(() => localStorage.setItem('ce-private-shift-drowsy-r2', JSON.stringify({ version: 1, stage: 6, answers: { priority: '12', cues: [], action: 'escalate', abg: 'partial', sbar: 'a' } })));
    await page.reload();
    const next = page.getByRole('region', { name: 'Your next step' });
    await expect(next).toBeVisible();
    await next.scrollIntoViewIfNeeded();
    const link = next.getByRole('link', { name: 'Open ABG example' });
    await link.focus();
    await expect(link).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `/private/tmp/ce-shift-next-${width}.png` });
    await link.press('Enter');
    await expect(page).toHaveURL(/abg-lab\?example=resp-acidosis&shift=drowsy-patient/);
    await page.getByRole('link', { name: /Return to The Drowsy Patient/ }).first().click();
    await expect(next).toBeVisible();
    await next.getByRole('link', { name: 'Ask why' }).click();
    await expect(page).toHaveURL(/drowsy-patient\/ask/);
    await expect(page.locator('.shift-handoff').getByText('Nothing is submitted automatically.', { exact: false })).toBeVisible();
  });
}

for (const [id, key, saved, button, destination] of [
  ['monitor-alarm', 'ce-private-shift-monitor-r2', { version: 1, stage: 7, answers: { alarm: alarmChoices[0].id, explanation: alarmExplanations[0].id, monitor: monitorChoices[0].id, rhythm: rhythmChoices[0].id, cues: [], actions: ['notify', 'stay', 'ecg'], chips: [], recommendation: recommendations[0].id } }, 'Potassium reference', /reference-hub\?reference=potassium&shift=monitor-alarm/],
  ['discharge-puzzle', 'ce-private-shift-discharge-v02', { version: '0.2', stage: 6, inspected: ['lasix', 'furosemide'], answers: { start: startChoices[0].id, flags: [], actions: ['provider', 'charge'], teach: teachChoices[0].id, fix: fixChoices[0].id } }, 'Prepare a question', /discharge-puzzle\/ask/],
] as const) {
  test(`${id} uses its existing destination`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.evaluate(([key, saved]) => localStorage.setItem(key, JSON.stringify(saved)), [key, saved]);
    await page.goto(`/learn/shifts/${id}`);
    const next = page.getByRole('region', { name: 'Your next step' });
    await expect(next).toBeVisible();
    await next.getByRole('link', { name: button, exact: true }).click();
    await expect(page).toHaveURL(destination);
  });
}
