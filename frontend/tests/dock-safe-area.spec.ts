import { test, expect, type Page } from '@playwright/test';

// iPhone Safari reports env(safe-area-inset-bottom) = 34px for the home indicator; Chromium
// reports 0. The app reads that value through one token, --ce-safe-bottom, so overriding the
// token reproduces the iPhone layout with the production formulas for the dock position and
// --ce-dock-clearance.
const IPHONE_SAFE_BOTTOM = 34;

const DOCK_PAGES = ['/', '/copilot', '/ask', '/icu-drips', '/reference-hub', '/abg-lab', '/brain-sheets',
  '/rhythm-lab', '/rhythm-lab/library', '/rhythm-lab/practice', '/rhythm-lab/compare', '/rhythm-lab/pearls', '/rhythm-lab/sprint'];

test.use({ viewport: { width: 375, height: 667 } });

async function simulateIphoneSafeArea(page: Page) {
  await page.addInitScript(px => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.textContent = `:root { --ce-safe-bottom: ${px}px; }`;
      document.head.appendChild(style);
    });
  }, IPHONE_SAFE_BOTTOM);
}

async function lowestContentAndDock(page: Page) {
  return page.evaluate(() => {
    const dock = document.querySelector('.ce-tool-dock')!;
    const box = dock.getBoundingClientRect();
    let lowest = -Infinity;
    for (const element of document.querySelectorAll('#root *')) {
      const el = element as HTMLElement;
      if (dock.contains(el) || el.offsetParent === null || el.children.length || !(el.textContent?.trim() || el.tagName === 'IMG')) continue;
      if (getComputedStyle(el).visibility === 'hidden') continue;
      const rect = el.getBoundingClientRect();
      if (rect.height > 0) lowest = Math.max(lowest, rect.bottom);
    }
    return { dockTop: box.top, dockGap: innerHeight - box.bottom, lowest };
  });
}

test.describe('iPhone bottom safe area (34px simulated)', () => {
  test.beforeEach(async ({ page }) => { await simulateIphoneSafeArea(page); });

  for (const path of DOCK_PAGES) {
    test(`the last content on ${path} clears the dock when scrolled to the end`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('.ce-tool-dock')).toBeVisible();
      await page.waitForTimeout(300);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(200);
      const { dockTop, dockGap, lowest } = await lowestContentAndDock(page);
      expect(Math.round(dockGap)).toBe(IPHONE_SAFE_BOTTOM); // the dock sits above the home indicator
      expect(lowest).toBeLessThanOrEqual(dockTop);
    });
  }

  test('the Home footer App Store badge and its clear space sit above the dock', async ({ page }) => {
    await page.goto('/');
    const badge = page.locator('.ce-app-store-badge[data-placement="footer"]');
    await expect(badge).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(200);
    const dock = (await page.locator('.ce-tool-dock').boundingBox())!;
    const link = (await badge.boundingBox())!;
    expect(link.y + link.height).toBeLessThanOrEqual(dock.y);
    await expect(badge.locator('img')).toBeInViewport({ ratio: 1 });
  });

  test('dock clearance is applied once on Home and Shift Brain (no double padding)', async ({ page }) => {
    await page.goto('/');
    const home = await page.evaluate(() => ({
      root: getComputedStyle(document.querySelector('.ce-command-home')!).paddingBottom,
      footer: getComputedStyle(document.querySelector('.ce-command-home__footer')!).paddingBottom,
    }));
    expect(home).toEqual({ root: '0px', footer: `${88 + IPHONE_SAFE_BOTTOM + 16}px` });
    await page.goto('/copilot');
    await expect(page.locator('.ce-shift-workspace')).toBeVisible();
    const shift = await page.evaluate(() => {
      const workspace = document.querySelector('.ce-shift-workspace') as HTMLElement;
      return { workspace: getComputedStyle(workspace).paddingBottom, inner: getComputedStyle(workspace.firstElementChild as HTMLElement).paddingBottom };
    });
    expect(shift).toEqual({ workspace: `${88 + IPHONE_SAFE_BOTTOM}px`, inner: '0px' });
  });

  test('Shift Brain keeps its dock clearance after Ask was opened first (hidden Ask stays mounted)', async ({ page }) => {
    await page.goto('/ask');
    await expect(page.locator('.ce-ask-workspace')).toBeVisible();
    await page.getByRole('navigation', { name: 'Clinical Edge workspace' }).getByRole('link', { name: 'Shift Brain', exact: true }).click();
    await expect(page.locator('.ce-shift-workspace')).toBeVisible();
    await expect(page.locator('.ce-ask-workspace')).toBeHidden();
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('.ce-shift-workspace')!).paddingBottom)).toBe(`${88 + IPHONE_SAFE_BOTTOM}px`);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(200);
    const { dockTop, lowest } = await lowestContentAndDock(page);
    expect(lowest).toBeLessThanOrEqual(dockTop);
  });
});

// The dark module header must stay flush with the top while the page scrolls: nothing from the
// page may show above it (iPhone report: "HOW TO USE THIS MODULE" scrolled above the Rhythm Lab
// header). Overflow on a sticky header's ancestors breaks this, so none may have one.
for (const path of ['/copilot', '/rhythm-lab', '/rhythm-lab/library', '/rhythm-lab/practice', '/abg-lab', '/icu-drips', '/reference-hub', '/brain-sheets']) {
  test(`the module header on ${path} sticks flush to the top while scrolling`, async ({ page }) => {
    await page.goto(path);
    const header = page.locator('.ce-module-header').first();
    await expect(header).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, Math.min(700, document.documentElement.scrollHeight - innerHeight)));
    await page.waitForTimeout(200);
    const result = await header.evaluate(el => {
      const box = el.getBoundingClientRect();
      const atTop = document.elementFromPoint(innerWidth / 2, 1);
      let overflowAncestor: string | null = null;
      for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (style.overflowX !== 'visible' || style.overflowY !== 'visible') { overflowAncestor = node.className || node.tagName; break; }
      }
      return { top: box.top, topIsHeader: !!atTop && el.contains(atTop), overflowAncestor, scrolled: window.scrollY };
    });
    expect(result.scrolled).toBeGreaterThan(0);
    expect(result.top).toBe(0);
    expect(result.topIsHeader).toBe(true);
    expect(result.overflowAncestor).toBeNull();
  });
}

test('Rhythm Lab: "How to use this module" never shows above the sticky header', async ({ page }) => {
  await page.goto('/rhythm-lab');
  const eyebrow = page.getByText('How to use this module', { exact: true });
  await expect(eyebrow).toBeVisible();
  const header = page.locator('.ce-module-header').first();
  // Scroll so the eyebrow passes underneath the header.
  const eyebrowTop = await eyebrow.evaluate(el => el.getBoundingClientRect().top + window.scrollY);
  await page.evaluate(y => window.scrollTo(0, y - 30), eyebrowTop);
  await page.waitForTimeout(200);
  const headerBox = (await header.boundingBox())!;
  const eyebrowBox = (await eyebrow.boundingBox())!;
  expect(headerBox.y).toBe(0);
  // Any part of the eyebrow above the header's bottom edge must be covered by the header.
  if (eyebrowBox.y < headerBox.y + headerBox.height) {
    const covering = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('.ce-module-header') !== null, [eyebrowBox.x + 4, Math.max(1, eyebrowBox.y + 2)]);
    expect(covering).toBe(true);
  }
});
