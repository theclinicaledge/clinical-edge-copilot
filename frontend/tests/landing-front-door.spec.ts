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

for (const width of [390, 430, 1280]) {
  test(`front door has a clear hero, one gated action and no layout errors at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/landing?utm_source=linkedin');
    await expect(page.getByRole('heading', { name: 'Understand the why behind critical-care nursing.', exact: true })).toBeVisible();
    await expect(page.getByText('For nurses transitioning into critical-care practice', { exact: true })).toBeInViewport();
    const primary = page.getByRole('button', { name: 'Try a fictional practice scenario', exact: true });
    await expect(primary).toHaveCount(2);
    await expect(primary.first()).toBeInViewport();
    await expect(primary.first()).toBeDisabled();
    await expect(primary.last()).toBeDisabled();
    await expect(page.locator('.ce-acquisition button')).toHaveCount(2);
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

test('section order follows the audience-to-practice story', async ({ page }) => {
  await page.goto('/landing');
  const sectionIds = await page.locator('.ce-acquisition main > section').evaluateAll(elements => elements.map(el => el.getAttribute('aria-labelledby')));
  expect(sectionIds).toEqual(['landing-title', 'learning-example-title', 'two-jobs-title', 'founder-title', 'boundaries-title', 'practice-cta-title']);
  await expect(page.locator('.ce-acquisition__workflow ol > li')).toHaveCount(4);
  const steps = await page.locator('.ce-acquisition__workflow h3').allTextContents();
  expect(steps).toEqual(['Reported information', 'Reasoning', 'Distinguish possibilities', 'Physiology / why']);
});

test('example is explicitly withheld and Ask is visibly upcoming without a CTA', async ({ page }) => {
  await page.goto('/landing');
  await expect(page.getByText('Example awaiting clinical-owner approval', { exact: true })).toBeVisible();
  await expect(page.getByText('The outline below is not generated output.', { exact: false })).toBeVisible();
  const ask = page.locator('.ce-acquisition__jobs article').first();
  await expect(ask.getByRole('heading', { name: 'Ask a nursing question', exact: true })).toBeVisible();
  await expect(ask.getByText('Upcoming · not publicly available', { exact: true })).toBeVisible();
  await expect(ask.locator('a,button')).toHaveCount(0);
  const hrefs = await page.locator('.ce-acquisition a').evaluateAll(elements => elements.map(el => el.getAttribute('href')));
  expect(new Set(hrefs)).toEqual(new Set(['/', '/privacy', '/support']));
  const copy = await page.locator('.ce-acquisition').innerText();
  expect(copy).not.toMatch(/catch.*deterioration|guaranteed|fast, accurate|safe clinical decision|thinks like a nurse|preceptor would|nursing school didn't|Google rabbit hole|second set of clinical eyes|Urgency:|P2|beta.ready|trusted by|\d+ (users|downloads|ratings)/i);
  await expect(page.locator('.ce-acquisition img')).toHaveCount(0);
});

test('gated practice cannot invoke the legacy scenario or QuickStart funnel', async ({ page }) => {
  let apiRequests = 0;
  const conversions: string[] = [];
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/')) apiRequests++; });
  page.on('console', message => { if (message.text().includes('landing_primary_cta_clicked')) conversions.push(message.text()); });
  await page.goto('/landing?utm_source=colleague&utm_campaign=icu');
  await page.locator('.ce-acquisition__primary').evaluateAll(buttons => buttons.forEach(button => (button as HTMLButtonElement).click()));
  await expect(page).toHaveURL(/\/landing\?utm_source=colleague&utm_campaign=icu$/);
  expect(apiRequests).toBe(0);
  expect(conversions).toEqual([]);
  await expect(page.locator('.ce-acquisition a[href="/scenario"], .ce-acquisition a[href="/quickstart"]')).toHaveCount(0);
  for (const button of await page.locator('.ce-acquisition__primary').all()) {
    const statusId = await button.getAttribute('aria-describedby');
    await expect(page.locator(`#${statusId}`)).toHaveText('Practice entry pending clinical review.');
  }
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

for (const [label, path, heading] of [['Privacy', '/privacy', 'Privacy Policy'], ['Support', '/support', 'Support']]) {
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
  await expect(page.getByRole('heading', { name: 'What do you need right now?', exact: true })).toBeVisible();
  await page.goto('/download');
  await expect(page.getByRole('heading', { name: 'Use Clinical Edge on your iPhone.', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download on the App Store' }).first()).toBeVisible();
});
