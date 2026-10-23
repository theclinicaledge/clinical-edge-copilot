import { test, expect } from '@playwright/test';
import { pathFor, measurements } from '../src/modules/the-shift/monitor/ecg/waveforms.js';

test.beforeEach(async ({ page }) => {
  page.on('pageerror', error => { throw error; });
  await page.route('**/*', route => {
    const request = route.request(), url = new URL(request.url());
    if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) return route.fulfill({ body: '', contentType: 'text/css' });
    if (url.hostname === 'va.vercel-scripts.com') return route.fulfill({ body: '', contentType: 'application/javascript' });
    expect(url.hostname).toBe('127.0.0.1');
    expect(request.method()).toBe('GET');
    expect(url.pathname).not.toMatch(/^\/api\//);
    return route.continue();
  });
});

for (const width of [390, 768, 1440]) test(`Library visual scope and navigation at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 960 });
  await page.goto('/');
  const home = await page.locator('.ce-command-home').evaluate(el => getComputedStyle(el).backgroundColor);
  await page.getByRole('link', { name: 'Choose your shift' }).click();
  const root = page.locator('.ce-shift-feature--library');
  await expect(root).toBeVisible();
  expect(await root.evaluate(el => getComputedStyle(el).backgroundColor)).toBe(home);
  expect(await root.evaluate(el => getComputedStyle(el).borderBottomColor)).toBe(home);
  const cards = page.locator('.shift-library-card');
  await expect(cards).toHaveCount(6);
  const positions = await cards.locator('.shift-primary').evaluateAll(nodes => nodes.map(el => ({ top: el.getBoundingClientRect().top, height: el.getBoundingClientRect().height })));
  if (width === 1440) expect(Math.max(...positions.slice(0, 3).map(p => p.top)) - Math.min(...positions.slice(0, 3).map(p => p.top))).toBeLessThan(1);
  if (width === 768) expect(Math.abs(positions[0].top - positions[1].top)).toBeLessThan(1);
  expect(positions.every(p => p.height >= 44)).toBe(true);
  const heights = await cards.locator('.shift-library-image').evaluateAll(nodes => nodes.map(el => el.getBoundingClientRect().height));
  expect(heights).toEqual(Array(5).fill(width === 390 ? 164 : 180));
  const wave = page.locator('[data-library-waveform="B"]');
  await expect(wave).toHaveAttribute('d', pathFor('B', 0, 3));
  expect(measurements('B').measuredRate).toBe(80);
  const geometry = await wave.evaluate(el => {
    const matrix = (el as SVGGraphicsElement).getScreenCTM()!;
    const bounds = (el as SVGGraphicsElement).getBBox();
    return { xScale: Math.hypot(matrix.a, matrix.b), yScale: Math.hypot(matrix.c, matrix.d), height: bounds.height * Math.hypot(matrix.c, matrix.d), width: bounds.width * Math.hypot(matrix.a, matrix.b) };
  });
  expect(geometry.xScale).toBeCloseTo(geometry.yScale, 5);
  expect(geometry.height).toBeGreaterThan(40);
  expect(geometry.width).toBeGreaterThan(250);
  await page.screenshot({ path: `../artifacts/library-visuals/${width}-library.png` });
  await cards.nth(1).scrollIntoViewIfNeeded();
  await cards.nth(1).screenshot({ path: `../artifacts/library-visuals/${width}-monitor-card.png` });
  await page.screenshot({ path: `../artifacts/library-visuals/${width}-monitor-viewport.png` });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (let i = 0; i < 3; i++) {
    await cards.nth(i).locator('.shift-primary').click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.locator('.ce-shift-feature').evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(home);
    await page.getByRole('link', { name: 'Shift Library', exact: false }).first().click();
    await expect(page.getByRole('heading', { name: 'The Shift Library' })).toBeVisible();
  }
  await page.getByRole('navigation', { name: 'Clinical Edge workspace' }).getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Choose your shift' })).toBeVisible();
});

test('Library retains progress and keyboard access without changing gameplay', async ({ page }) => {
  await page.goto('/learn/shifts/drowsy-patient');
  await page.getByRole('button', { name: 'Plan your first assessment' }).click();
  const saved = await page.evaluate(() => localStorage.getItem('ce-private-shift-drowsy-r2'));
  await page.getByRole('link', { name: 'Shift Library', exact: false }).first().click();
  const resume = page.locator('.shift-library-card').first().getByRole('link', { name: /Continue shift/ });
  await resume.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(resume).toBeFocused();
  expect(await resume.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Who do you see first?' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('ce-private-shift-drowsy-r2'))).toBe(saved);
});

test('enlarged mobile text stays readable and the dock does not cover the last card action', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 667 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/learn');
  await page.addStyleTag({ content: '.shift-library-copy p { font-size: 24px !important; } .shift-library-copy h2 { font-size: 32px !important; } .shift-library-copy small, .shift-library-copy a.shift-primary { font-size: 20px !important; }' });
  const button = page.locator('.shift-library-card').last().locator('.shift-primary');
  await button.focus();
  await button.scrollIntoViewIfNeeded();
  const bounds = await button.boundingBox();
  const nav = await page.getByRole('navigation', { name: 'Clinical Edge workspace' }).boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThan(nav!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
