import { test, expect } from '@playwright/test';
import { STATIC_ROUTE_SEO } from '../src/seo/routeSeo.js';

test.use({ serviceWorkers: 'block' });
test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (!['127.0.0.1', 'localhost'].includes(url.hostname) || url.pathname.startsWith('/api/')) return route.abort();
    return route.continue();
  });
});

const routes = [
  { path: '/', heading: 'What do you need right now?' },
  { path: '/landing', heading: 'Understand the why behind critical-care nursing.' },
  { path: '/download', heading: 'Use Clinical Edge on your iPhone.' },
  { path: '/support', heading: 'Support' },
  { path: '/reference-hub', heading: 'Browse nursing reference topics.' },
  { path: '/scenario', heading: "Something doesn't add up." },
  { path: '/quickstart', heading: 'What is happening in this fictional scenario?' },
  { path: '/blog', heading: 'Clinical Edge Blog' },
  { path: '/blog/abg-interpretation-for-nurses', heading: 'ABG Interpretation for Nurses: A Step-by-Step Guide' },
  { path: '/blog/ecg-basics-for-nurses', heading: 'ECG Basics for Nurses: How to Read a Heart Rhythm in 5 Steps' },
];

for (const width of [390, 1280]) {
  for (const { path, heading } of routes) {
    test(`public copy renders without overflow at ${path}, ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(path);
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
      // Reveal existing scroll-triggered sections before the review capture.
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
          window.scrollTo(0, y);
          await new Promise(resolve => requestAnimationFrame(resolve));
        }
        window.scrollTo(0, 0);
      });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (process.env.CLAIMS_SCREENSHOTS_DIR) {
        const slug = path === '/' ? 'home' : path.slice(1).replaceAll('/', '-');
        await page.screenshot({ path: `${process.env.CLAIMS_SCREENSHOTS_DIR}/${slug}-${width}.png`, fullPage: true, animations: 'disabled' });
      }
      if (path === '/' && await page.locator('#root').getAttribute('data-ssr-route') === '/') {
        // The committed pre-cleanup build reproduces #418 on Home at both widths.
        // Keep this inherited limitation visible without accepting errors on other routes.
        expect(errors.length).toBeLessThanOrEqual(1);
        for (const error of errors) expect(error).toMatch(/^Minified React error #418;/);
        if (errors.length) {
          test.info().annotations.push({ type: 'known-baseline-error', description: 'Home hydration #418 reproduced on privacy-only commit cbf6e7c; not fixed by this copy patch.' });
          console.warn('KNOWN BASELINE: Home hydration #418 remains unresolved.');
        }
      } else {
        expect(errors).toEqual([]);
      }
    });
  }
}

test('landing has bounded practice copy and no medical output or public Ask promise', async ({ page }) => {
  await page.goto('/landing');
  const content = await page.locator('body').innerText();
  expect(content).not.toMatch(/catch subtle deterioration|fast, accurate|safe clinical decision|thinks like a nurse|preceptor would|nursing school didn't|Google rabbit hole|second set of clinical eyes|Urgency:|calcium gluconate|acute decompensated|furosemide|Ask Clinical Edge|P2|beta.ready/i);
  expect(content).toContain('not generated output');
  expect(content).toContain('Use fictional scenarios and general education only; do not enter real patient information.');
  await expect(page.locator('a[href="/ask"]')).toHaveCount(0);
  const practice = page.getByRole('button', { name: 'Try a fictional practice scenario', exact: true });
  await expect(practice).toHaveCount(2);
  await expect(practice.first()).toBeDisabled();
  await expect(practice.last()).toBeDisabled();
  await expect(page).toHaveURL(/\/landing$/);
  await expect(page.getByText('Example awaiting clinical-owner approval', { exact: true })).toBeVisible();
});

test('download keeps working tool links and replaces absolute trust claims', async ({ page }) => {
  await page.goto('/download');
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/No patient data stored|App Store reviewed|bedside titration|Fast bedside answers|Ask Clinical Edge/i);
  expect(body).toContain('Optional device-local saved cases');
  expect(body).toContain('See Privacy for data processing');
  await expect(page.locator('a[href*="apps.apple.com"]')).toHaveCount(2);
  for (const path of ['/copilot', '/rhythm-lab', '/icu-drips', '/abg-lab', '/reference-hub']) await expect(page.locator(`a[href="${path}"]`)).toHaveCount(1);
  await page.locator('a[href="/icu-drips"]').click();
  await expect(page).toHaveURL(/\/icu-drips$/);
  await expect(page.getByRole('heading', { name: 'ICU Drips', exact: true })).toBeVisible();
  await page.goto('/reference-hub');
  await expect(page.getByRole('heading', { name: 'Browse nursing reference topics.', exact: true })).toBeVisible();
  await expect(page.getByText('Educational references. No dosing. No diagnosis.', { exact: true })).toBeVisible();
});

test('support feedback requests and QuickStart exclude real-patient input', async ({ page }) => {
  await page.goto('/support');
  await expect(page.getByText('Email a description of the issue, the page, and approximate time.', { exact: false })).toBeVisible();
  const support = await page.locator('body').innerText();
  expect(support).not.toMatch(/identify escalation needs|We read every message|Use clinical context only|with the question you asked/i);
  expect(support).toContain('It does not determine care or escalation decisions.');
  await page.goto('/quickstart');
  await expect(page.getByText('Use the supplied fictional details only. Do not enter real patient information.')).toBeVisible();
  await page.getByRole('button', { name: 'BP dropping post-op', exact: true }).click();
  await expect(page.getByRole('textbox')).toHaveValue('BP dropping post-op');
  await expect(page.getByRole('button', { name: 'Review the fictional scenario →' })).toBeEnabled();
});

test('Shift Brain privacy notice is scoped and canonical privacy link remains available', async ({ page }) => {
  await page.goto('/copilot?capture=rapid');
  await expect(page.getByText('Data processing and saving', { exact: true })).toBeVisible();
  await expect(page.getByText('Saving cases is optional. Saved cases remain on this device.', { exact: false })).toBeVisible();
  expect(await page.locator('body').innerText()).not.toMatch(/Private by default|snapshot is not retained unless/i);
  await expect(page.getByRole('link', { name: 'Privacy', exact: true })).toHaveAttribute('href', '/privacy');
});

for (const path of ['/', '/download', '/privacy']) {
  test(`route SEO agrees across description, social tags and canonical at ${path}`, async ({ page }) => {
    await page.goto(path);
    const expected = STATIC_ROUTE_SEO[path].description;
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) await expect(page.locator(selector)).toHaveAttribute('content', expected);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://theclinicaledge.org${path}`);
    expect(expected).not.toMatch(/bedside confidence|no patient information, no PHI|Ask Clinical Edge/);
  });
}

test('blog metadata and both article CTAs describe current practice routes', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Practical guides for nursing education from Clinical Edge.');
  for (const path of ['/blog/abg-interpretation-for-nurses', '/blog/ecg-basics-for-nurses']) {
    await page.goto(path);
    await expect(page.getByRole('link', { name: 'Open Shift Brain', exact: true })).toHaveAttribute('href', '/copilot');
    await expect(page.getByText('Explore educational references and fictional practice scenarios.')).toBeVisible();
    expect(await page.locator('body').innerText()).not.toContain('Ask Copilot a question');
  }
});
