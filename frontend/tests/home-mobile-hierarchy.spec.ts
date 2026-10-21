import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

for (const width of [320, 390, 768, 1440]) {
  test(`Home hierarchy and readable controls at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    const shift = page.getByRole('link', { name: 'Choose your shift' });
    const ask = page.getByRole('link', { name: 'Ask a question', exact: true });
    await expect(shift).toBeVisible();
    await expect(ask).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const link of [shift, ask]) {
      expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await link.focus();
      await expect(link).toBeFocused();
    }
    await page.evaluate(() => scrollTo(0, 0));
    if (width === 390 || width === 1440) {
      await page.screenshot({ path: `/private/tmp/ce-home-refined-new-${width}.png`, fullPage: true });
    }
    await page.evaluate(() => localStorage.setItem('ce-private-shift-drowsy-r2', JSON.stringify({ version: 1, stage: 1, answers: {} })));
    await page.reload();
    await expect(page.getByRole('link', { name: /Continue The Drowsy Patient/ })).toBeVisible();
    if (width === 390) {
      const action = (await ask.boundingBox())!;
      const dock = (await page.locator('.ce-tool-dock').boundingBox())!;
      expect(action.y + action.height).toBeLessThan(dock.y);
      await page.screenshot({ path: '/private/tmp/ce-home-refined-mobile.png' });
    }
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
