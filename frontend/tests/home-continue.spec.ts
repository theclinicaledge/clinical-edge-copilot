import { test, expect } from '@playwright/test';
import { fresh as fresh5 } from '../src/modules/the-shift/shift5/rules.js';
import { fresh as fresh7 } from '../src/modules/the-shift/shift7/rules.js';
import { fresh as fresh10, transition, savePayload } from '../src/modules/the-shift/shift10/state.js';
const records = {
  'ce-private-shift-drowsy-r2': { version: 1, stage: 1, answers: {} },
  'ce-private-shift-monitor-r2': { version: 1, stage: 1, answers: {} },
  'ce-private-shift-discharge-v02': { version: '0.2', stage: 1, answers: {} },
  ce_shift_005_v04: { ...fresh5(), stage: 1 },
};
test.use({ storageState: { cookies: [], origins: [] } });
async function seed(page, count) {
  await page.goto('/');
  await page.evaluate(async ({ records, count, ten }) => {
    const { SHIFTS } = await import('/src/modules/the-shift/integrated/registry.js');
    const seven = SHIFTS.find(item => item.id === 'missing-time');
    const transfer = SHIFTS.find(item => item.id === 'transfer-not-ready');
    const saves = [...Object.entries(records), [seven.storageKey, { version: seven.contentVersion, stage: 1, updated: Date.now() - 1000 }], [transfer.storageKey, ten]];
    saves.slice(0, count).forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
    localStorage.setItem('unrelated-module-record', 'preserve');
  }, { records, count, ten: JSON.parse(savePayload(transition(fresh10(), { type: 'start' }))) });
  await page.reload();
}
test('empty, corrupt and completed records never create Resume cards', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('.ce-home-resume-learning');
  await expect(section).toHaveCount(0);
  await page.evaluate(() => localStorage.setItem('ce-private-shift-drowsy-r2', '{broken'));
  await page.reload();
  await expect(section).toHaveCount(0);
  await page.evaluate(async saved => {
    const { SHIFTS } = await import('/src/modules/the-shift/integrated/registry.js');
    localStorage.setItem(SHIFTS.find(item => item.id === 'missing-time').storageKey, JSON.stringify(saved));
  }, { ...fresh7(), stage: 5, updated: Date.now(), answers: { opening: ['activate'] }, water: 'hold', contact: 'phone', handoff: [] });
  await page.reload();
  await expect(section).toHaveCount(0);
  await page.goto('/learn/shifts?debriefs=1');
  await expect(page.locator('.shift-library-card').filter({ hasText: 'The Missing Time' })).toContainText('Debrief reached');
});
for (const width of [375, 390, 1440]) {
  for (const count of [1, 6, 25]) test(`${count} saves, compact layout and keyboard access at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await seed(page, Math.min(count, 6));
    if (count === 25) await page.evaluate(async () => {
      const { SHIFTS } = await import('/src/modules/the-shift/integrated/registry.js');
      const sample = SHIFTS[0];
      for (let i = 0; i < 19; i++) SHIFTS.push({ ...sample, id: `scale-fixture-${i}`, title: `Saved learning experience ${i}`, progressLabel: () => 'Continue: Report' });
      dispatchEvent(new Event('focus'));
    });
    const section = page.locator('.ce-home-resume-learning');
    await expect(section.locator('.ce-home-resume-learning__featured > li')).toHaveCount(1);
    const viewAll = section.getByRole('link', { name: /^View all/ });
    await expect(viewAll).toContainText(`(${count} unfinished)`);
    const before = await page.evaluate(() => JSON.stringify(localStorage));
    const box = await section.boundingBox();
    expect(box.height).toBeLessThan(300);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const featured = section.locator('.ce-home-resume-learning__featured a');
    await expect(featured).toHaveAttribute('href', count === 1 ? '/learn/shifts/drowsy-patient' : '/learn/shifts/missing-time');
    await page.screenshot({ path: `../verification/home-continue-${count}-${width}.png` });
    await viewAll.focus();
    await expect(viewAll).toBeFocused();
    await viewAll.press('Enter');
    await expect(page).toHaveURL(/saved=1/);
    await expect(page.getByLabel('Show', { exact: true })).toHaveValue('unfinished');
    while (await page.getByRole('button', { name: 'Show more shifts' }).count()) await page.getByRole('button', { name: 'Show more shifts' }).click();
    const cards = page.locator('.shift-library-card');
    await expect(cards).toHaveCount(count);
    const links = await cards.locator('.shift-primary').evaluateAll(elements => elements.map(el => el.getAttribute('href')));
    expect(new Set(links).size).toBe(count);
    expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(before);
    await page.getByRole('navigation', { name: 'Clinical Edge workspace' }).getByRole('link', { name: 'Home', exact: true }).click();
    // Home was clicked with a pointer. Establish real keyboard navigation before
    // checking :focus-visible; programmatic focus preserves pointer modality.
    await viewAll.focus();
    await viewAll.press('Shift+Tab');
    await expect(featured).toBeFocused();
    await expect(featured).toHaveCSS('outline-style', 'solid');
    await expect(featured).toHaveCSS('outline-width', '2px');
    await expect(featured).not.toHaveCSS('outline-color', 'rgba(0, 0, 0, 0)');
    await featured.press('Enter');
    await expect(page).toHaveURL(count === 1 ? /drowsy-patient/ : /missing-time/);
    await page.reload();
    await expect(page).toHaveURL(count === 1 ? /drowsy-patient/ : /missing-time/);
    await page.getByRole('link', { name: 'Home', exact: true }).first().click();
    await expect(page.locator('.ce-home-resume-learning__featured > li')).toHaveCount(1);
  });
}
test('every saved Resume destination remains available; View all links to completed history', async ({ page }) => {
  await seed(page, 6);
  await page.getByRole('link', { name: /^View all/ }).click();
  await expect(page).toHaveURL(/saved=1/);
  await expect(page.getByLabel('Show', { exact: true })).toHaveValue('unfinished');
  const links = page.locator('.shift-library-card .shift-primary');
  // The library is lazy-loaded. evaluateAll returns immediately, even when the
  // loading fallback has no matches, so wait for every saved entry first.
  await expect(links).toHaveCount(6);
  expect(await links.evaluateAll(elements => elements.map(el => el.getAttribute('href')))).toEqual([
    '/learn/shifts/missing-time', '/learn/shifts/drowsy-patient', '/learn/shifts/monitor-alarm', '/learn/shifts/discharge-puzzle', '/learn/shifts/which-patient-first', '/learn/shifts/transfer-not-ready',
  ]);
  await page.getByLabel('Show', { exact: true }).selectOption('all');
  await expect(page).toHaveURL(/\/learn\/shifts$/);
  expect(await page.evaluate(() => localStorage.getItem('unrelated-module-record'))).toBe('preserve');
});
