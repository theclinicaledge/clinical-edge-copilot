import { test, expect } from '@playwright/test';
test.use({ serviceWorkers: 'block' });

for (const width of [390, 768, 1440]) {
  test(`premium navigation, legal continuity and input fit at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    let requests = 0;
    await page.route('**/api/**', async route => { requests++; await route.abort(); });
    await page.goto('/copilot');
    const started = await page.evaluate(() => performance.timeOrigin);
    const pressure = page.getByLabel('Blood pressure current');
    await pressure.fill('108/64');
    await pressure.evaluate(el => { el.style.fontSize = '24px'; });
    const fit = await pressure.evaluate(el => {
      const style = getComputedStyle(el);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      return context.measureText('108/64').width <= el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    });
    expect(fit).toBe(true);
    for (const destination of ['Support', 'Privacy']) {
      await page.getByRole('button', { name: 'More tools' }).click();
      await page.getByRole('dialog').getByRole('link', { name: destination, exact: true }).click();
      await page.locator(`.${destination.toLowerCase()}-back-link`).click();
      await page.getByRole('navigation', { name: 'Clinical Edge workspace' }).getByRole('link', { name: 'Shift Brain', exact: true }).click();
      // The dock may select Rapid Capture, but the manual form stays in memory.
      await page.getByRole('button', { name: 'Enter findings manually', exact: true }).click();
      await expect(pressure).toHaveValue('108/64');
      expect(await page.evaluate(() => performance.timeOrigin)).toBe(started);
    }
    await page.getByRole('button', { name: 'Reference and learning tools' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('link', { name: 'Rhythm Lab' })).toHaveCount(1);
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('link', { name: 'Rhythm Lab' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Reference and learning tools' })).toBeFocused();
    await page.goto('/rhythm-lab/library');
    const search = page.getByLabel('Filter rhythms');
    expect((await search.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    const rhythmNav = page.getByRole('navigation', { name: 'Rhythm Lab sections' });
    await rhythmNav.getByRole('link', { name: 'Practice', exact: true }).click();
    await expect(rhythmNav.getByRole('link', { name: 'Practice', exact: true })).toHaveAttribute('aria-current', 'page');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await rhythmNav.getByRole('link', { name: 'Pearls', exact: true }).click();
    await expect(page.locator('.pearl-item')).toHaveCount(20);
    await rhythmNav.getByRole('link', { name: 'Compare', exact: true }).click();
    await expect(page.locator('#cmp-rhythm-a')).toHaveValue('mobitz_i');
    await expect(page.locator('#cmp-rhythm-a-name')).toContainText('Second-Degree AV Block');
    await page.locator('#cmp-rhythm-a').selectOption('nsr');
    await expect(page.locator('#cmp-rhythm-a-name')).toHaveText('Normal Sinus Rhythm');
    await page.goto('/brain-sheets');
    await expect(page.locator('.bs-list-item')).toHaveCount(4);
    await page.goto('/not-a-real-route');
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await page.getByRole('link', { name: 'Return Home' }).click();
    await expect(page.locator('.ce-home-ask')).toBeVisible();
    expect(requests).toBe(0);
  });
}

test('production prerender hydrates without replacing the rendered tree', async ({ page }) => {
  const preview = process.env.PREMIUM_PREVIEW_URL;
  test.skip(!preview, 'Requires the locally built production preview.');
  await page.route('**/_vercel/**', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  await page.route('**/api/**', route => route.abort());
  // Vercel clean URLs serve each route's index, unlike Vite preview's SPA fallback.
  await page.route(preview! + '/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (request.resourceType() === 'document' && path !== '/') {
      const response = await route.fetch({ url: preview! + path + '/index.html' });
      await route.fulfill({ response });
    } else await route.fallback();
  });
  for (const path of ['/', '/landing', '/blog', '/blog/abg-interpretation-for-nurses', '/blog/ecg-basics-for-nurses', '/download', '/privacy', '/support']) {
    const errors: string[] = [];
    const handle = (error: Error) => errors.push(error.message);
    const consoleError = (message: { type(): string; text(): string }) => { if (message.type() === 'error') errors.push(message.text()); };
    page.on('pageerror', handle);
    page.on('console', consoleError);
    // A reference to the server-rendered node detects React's recovery replacement.
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        (window as Window & { originalRoot?: Element | null }).originalRoot = document.querySelector('#root h1');
      });
    });
    await page.goto(preview! + path);
    await expect(page.locator('h1')).toBeVisible();
    await page.waitForTimeout(400);
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => (window as Window & { originalRoot?: Element | null }).originalRoot?.isConnected)).toBe(true);
    page.off('pageerror', handle);
    page.off('console', consoleError);
  }
  await page.goto(preview! + '/');
  await page.locator('.ce-home-ask').click();
  await expect(page).toHaveURL(/\/ask$/);
  await expect(page.getByLabel('Nursing question')).toBeVisible();
});
