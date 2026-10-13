import { test, expect } from '@playwright/test';
import { STATIC_ROUTE_SEO } from '../src/seo/routeSeo.js';

test.use({ serviceWorkers: 'block' });
test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname) || url.pathname.startsWith('/api/')) return route.abort();
    return route.continue();
  });
});

for (const width of [390, 768, 1440]) {
  test(`front door leads to educational Ask with no layout errors at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/landing?utm_source=linkedin');
    await expect(page.getByRole('heading', { name: 'Understand the why behind critical-care nursing.', exact: true })).toBeVisible();
    await expect(page.getByText('For nurses transitioning into critical-care practice', { exact: true })).toBeInViewport();
    const primary = page.locator('.ce-acquisition__primary');
    await expect(primary).toHaveCount(2);
    await expect(primary.first()).toBeInViewport();
    await expect(primary.first()).toHaveAttribute('href', '/ask');
    await expect(primary.last()).toHaveAttribute('href', '/ask');
    await expect(page.locator('.ce-acquisition button[disabled]')).toHaveCount(0);
    await expect(page.getByText('Nurses from other settings are welcome.', { exact: false })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 390) expect(await page.locator('.ce-acquisition').evaluate(el => el.scrollHeight)).toBeLessThan(5000);
    if (process.env.FRONT_DOOR_SCREENSHOTS_DIR) {
      await page.screenshot({ path: `${process.env.FRONT_DOOR_SCREENSHOTS_DIR}/hero-${width}.png`, animations: 'disabled' });
      await page.screenshot({ path: `${process.env.FRONT_DOOR_SCREENSHOTS_DIR}/full-${width}.png`, fullPage: true, animations: 'disabled' });
    }
    expect(errors).toEqual([]);
  });
}

test('front door promotes working learning tools rather than an unfinished scenario', async ({ page }) => {
  await page.goto('/landing');
  const sectionIds = await page.locator('.ce-acquisition main > section').evaluateAll(elements => elements.map(el => el.getAttribute('aria-labelledby')));
  expect(sectionIds).toEqual(['landing-title', 'two-jobs-title', 'founder-title', 'boundaries-title', 'practice-cta-title']);
  await expect(page.getByRole('link', { name: 'Rhythm Lab', exact: true })).toHaveAttribute('href', '/rhythm-lab');
  await expect(page.getByRole('link', { name: 'ABG Lab', exact: true })).toHaveAttribute('href', '/abg-lab');
});

test('Ask availability is accurate without claims of clinical validation', async ({ page }) => {
  await page.goto('/landing');
  const ask = page.locator('.ce-acquisition__jobs article').first();
  await expect(ask.getByRole('heading', { name: 'Ask a nursing question', exact: true })).toBeVisible();
  await expect(ask.getByText('Ask Clinical Edge · Public Beta', { exact: true })).toBeVisible();
  await expect(ask.getByRole('link', { name: /Open Ask/ })).toHaveAttribute('href', '/ask');
  const hrefs = await page.locator('.ce-acquisition a').evaluateAll(elements => elements.map(el => el.getAttribute('href')));
  expect(new Set(hrefs)).toEqual(new Set(['/', '/ask', '/rhythm-lab', '/abg-lab', '/privacy', '/terms', '/support', 'https://apps.apple.com/app/id6761643064']));
  const copy = await page.locator('.ce-acquisition').innerText();
  expect(copy).not.toMatch(/not publicly available|upcoming|clinically validated|guaranteed|fast, accurate|safe clinical decision|trusted by|\d+ (users|downloads|ratings)/i);
  // The only image allowed on the front door is Apple's official App Store badge.
  await expect(page.locator('.ce-acquisition img:not(.ce-app-store-badge img)')).toHaveCount(0);
});

test('Ask action respects first-use consent and never submits a question', async ({ page }) => {
  let apiRequests = 0;
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/')) apiRequests++; });
  await page.addInitScript(() => localStorage.removeItem('ce_consent'));
  await page.goto('/landing?utm_source=colleague&utm_campaign=icu');
  await expect(page.locator('.ce-acquisition a[href="/scenario"], .ce-acquisition a[href="/quickstart"]')).toHaveCount(0);
  const started = await page.evaluate(() => performance.timeOrigin);
  await page.locator('.ce-acquisition__primary').first().click();
  await expect(page).toHaveURL(/\/ask$/);
  await expect(page.getByRole('button', { name: 'Agree and continue' })).toBeVisible();
  expect(apiRequests).toBe(0);
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(started);
});

test('founder story uses only the supplied nursing path without employer endorsement', async ({ page }) => {
  await page.goto('/landing');
  const story = await page.locator('.ce-acquisition__founder').innerText();
  expect(story).toContain('Mohamed · practicing CTICU RN');
  expect(story).toContain('Med-Surg/telemetry');
  expect(story).toContain('PCU');
  expect(story).toContain('ICU');
  expect(story).not.toMatch(/endorsed|hospital|health system|patient story/i);
});

for (const [label, path, heading] of [['Privacy', '/privacy', 'Privacy Policy'], ['Terms', '/terms', 'Terms of Use'], ['Support', '/support', 'Support']]) {
  test(`canonical ${label} links work and Back returns to the front door`, async ({ page }) => {
    await page.goto('/landing');
    const links = page.locator('.ce-acquisition').getByRole('link', { name: label, exact: true });
    await expect(links).toHaveCount(2);
    for (const link of await links.all()) await expect(link).toHaveAttribute('href', path);
    await links.first().click();
    await expect(page).toHaveURL(new RegExp(path + '$'));
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/\/landing$/);
    await expect(page.locator('#landing-title')).toHaveText('Understand the why behind critical-care nursing.');
  });
}

test('landing SEO is canonical, bounded and withheld from indexing while incomplete', async ({ page }) => {
  await page.goto('/landing');
  await expect(page).toHaveTitle(STATIC_ROUTE_SEO['/landing'].title);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://theclinicaledge.org/landing');
  for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) await expect(page.locator(selector)).toHaveAttribute('content', STATIC_ROUTE_SEO['/landing'].description);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  await page.reload();
  await expect(page.locator('#landing-title')).toHaveText('Understand the why behind critical-care nursing.');
});

test('workspace and installation routes retain their separate roles', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Understand the why.', exact: true })).toBeVisible();
  await page.goto('/download');
  await expect(page.getByRole('heading', { name: 'Use Clinical Edge on your iPhone.', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download on the App Store' }).first()).toBeVisible();
});
