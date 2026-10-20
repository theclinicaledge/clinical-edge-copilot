import { test, expect } from '@playwright/test';

const webview = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
const agents = [
  ['Safari', `${webview} Version/18.0 Safari/604.1`, false],
  ['Instagram', `${webview} Instagram 350.0.0.18.106`, false],
  ['Facebook', `${webview} [FBAN/FBIOS;FBAV/480.0]`, false],
  ['current untagged wrapper', webview, true],
  ['tagged wrapper', `${webview} ClinicalEdgeApp/1.0.4`, true],
] as const;

for (const [name, userAgent, native] of agents) {
  test.describe(name, () => {
    test.use({ userAgent, viewport: { width: 390, height: 844 } });
    test('Learn download visibility and navigation', async ({ page }) => {
      await page.goto('/learn');
      await expect(page.getByRole('heading', { name: 'The Shift Library' })).toBeVisible();
      const prompt = page.locator('.shift-library-download');
      if (native) {
        await expect(prompt).toBeHidden();
        await expect(page.getByAltText('Download on the App Store')).toHaveCount(0);
      } else {
        await expect(prompt).toBeVisible();
        const badge = prompt.getByRole('link');
        await expect(badge).toHaveAttribute('href', 'https://apps.apple.com/app/id6761643064');
        await expect(badge).toHaveAttribute('rel', 'noopener noreferrer');
        await badge.focus();
        await expect(badge).toBeFocused();
        const image = await badge.locator('img').boundingBox();
        expect(image!.height).toBe(44);
        expect(image!.width / image!.height).toBeCloseTo(119.66407 / 40, 2);
      }
      await page.getByRole('link', { name: /Begin shift/ }).first().click();
      await expect(page).toHaveURL(/drowsy-patient/);
      await expect(page.locator('.shift-library-download')).toHaveCount(0);
    });
  });
}

for (const width of [320, 390, 768, 1440]) {
  test(`download prompt fits at ${width}px without covering the first Shift`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/learn');
    const prompt = page.locator('.shift-library-download');
    await expect(prompt).toBeVisible();
    const box = await prompt.boundingBox();
    const card = await page.locator('.shift-library-card').first().boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    expect(box!.y + box!.height).toBeLessThanOrEqual(card!.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 390) await page.screenshot({ path: '/private/tmp/clinical-edge-learn-download-mobile.png' });
  });
}
