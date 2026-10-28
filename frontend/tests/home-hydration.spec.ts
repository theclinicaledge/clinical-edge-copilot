import { test, expect } from '@playwright/test';
import { scenario } from '../src/modules/the-shift/scenario.js';

const key = 'ce-private-shift-drowsy-r2';
const monitor = 'ce-private-shift-monitor-r2';
const active = JSON.stringify({ version: 1, stage: 1, answers: {} });
for (const [name, saves, count] of [
  ['none', {}, 0],
  ['one', { [key]: active }, 1],
  ['multiple', { [key]: active, [monitor]: active }, 2],
  ['completed', { [key]: JSON.stringify({ version: 1, stage: 6, answers: { priority: '12', cues: [], action: scenario.actions[0].id, abg: scenario.interpretations[0].id, sbar: scenario.sbars[0].id } }) }, 0],
  ['corrupt', { [key]: '{broken' }, 0],
] as const) test(`hydrated Home preserves server DOM and saves: ${name}`, async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' && route.request().method() === 'GET' ? route.continue() : route.abort());
  await page.addInitScript(records => {
    localStorage.setItem('ce_consent', JSON.stringify({ version: 4, ai: false, analytics: false, decidedAt: '2026-10-27T00:00:00Z' }));
    localStorage.setItem('ce_product_analytics_exclude', '1');
    for (const [key, value] of Object.entries(records)) localStorage.setItem(key, value);
    localStorage.setItem('unrelated-hydration-record', 'preserve');
    // Observe the actual parser-created hero before the deferred app script runs.
    const probe = { hero: null as Element | null, removed: false, cards: [] as string[], shifts: [] as number[] };
    (window as any).__hydrationProbe = probe;
    new MutationObserver(() => {
      const hero = document.querySelector('.ce-home-shift');
      if (!probe.hero && hero) probe.hero = hero;
      if (probe.hero && !probe.hero.isConnected) probe.removed = true;
      const titles = Array.from(document.querySelectorAll('.ce-home-resume-learning__copy strong')).map(el => el.textContent).join('|');
      if (titles && probe.cards.at(-1) !== titles) probe.cards.push(titles);
    }).observe(document, { childList: true, subtree: true });
    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries() as any) if (!entry.hadRecentInput) probe.shifts.push(entry.value);
      }).observe({ type: 'layout-shift', buffered: true });
    } catch { /* Layout-shift observation is not supported by every browser. */ }
  }, saves);
  const response = await page.goto('/');
  expect(await response!.text()).not.toContain('id="continue-learning-title"');
  await expect(page.locator('.ce-command-home')).toBeVisible();
  const featured = page.locator('.ce-home-resume-learning__featured > li');
  if (count) {
    await expect(featured).toHaveCount(1);
    await expect(page.getByRole('link', { name: /^View all/ })).toContainText(`(${count} unfinished)`);
    await expect(featured.locator('a')).toHaveAttribute('href', '/learn/shifts/drowsy-patient');
  } else await expect(featured).toHaveCount(0);
  // Wait for hydration even when the correct result is no resume card.
  await page.getByRole('navigation', { name: 'Clinical Edge workspace' }).getByRole('link', { name: 'Home', exact: true }).focus();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await page.evaluate(() => (window as any).__hydrationProbe.hero?.isConnected)).toBe(true);
  expect(await page.evaluate(() => (window as any).__hydrationProbe.removed)).toBe(false);
  expect(await page.evaluate(() => (window as any).__hydrationProbe.cards)).toEqual(count ? ['The Drowsy Patient'] : []);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const [key, value] of Object.entries(saves)) expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(value);
  await page.reload(); await expect(page.locator('.ce-command-home')).toBeVisible();
  if (count) {
    await expect(featured).toHaveCount(1);
    await page.getByRole('link', { name: /^View all/ }).click();
    await expect(page.getByLabel('Show', { exact: true })).toHaveValue('unfinished');
    await expect(page.locator('.shift-library-card')).toHaveCount(count);
    await page.getByRole('navigation', { name: 'Clinical Edge workspace' }).getByRole('link', { name: 'Home', exact: true }).click();
    await expect(featured).toHaveCount(1);
    await featured.locator('a').click();
    await expect(page.getByRole('heading', { name: 'Who do you see first?' })).toBeVisible();
    await page.getByRole('navigation', { name: 'Clinical Edge workspace' }).getByRole('link', { name: 'Home', exact: true }).click();
    await expect(featured).toHaveCount(1);
  }
  expect(await page.evaluate(() => localStorage.getItem('unrelated-hydration-record'))).toBe('preserve');
  expect(errors).toEqual([]);
  console.log(JSON.stringify({ fixture: name, layoutShifts: await page.evaluate(() => (window as any).__hydrationProbe.shifts) }));
});
