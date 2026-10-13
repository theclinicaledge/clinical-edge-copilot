import { test, expect } from '@playwright/test';
import { STATIC_ROUTE_SEO } from '../src/seo/routeSeo.js';

test('/terms loads with its key sections and metadata', async ({ page }) => {
  await page.goto('/terms');
  await expect(page.getByRole('heading', { level: 1, name: 'Terms of Use' })).toBeVisible();
  await expect(page.getByText(/^Effective date: \w+ \d{1,2}, \d{4}$/)).toBeVisible();
  for (const section of ['1. Agreement', '4. Not medical advice', '5. No patient identifiers', '6. Not for emergencies', '8. AI features', '11. Apple App Store', '15. Disclaimers', '21. Contact']) {
    await expect(page.getByRole('heading', { level: 2, name: section, exact: true })).toBeVisible();
  }
  await expect(page.getByText(/AI output is generated automatically, is not reviewed by a clinician/)).toBeVisible();
  await expect(page).toHaveTitle(STATIC_ROUTE_SEO['/terms'].title);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://theclinicaledge.org/terms');
  expect(await page.locator('main').innerText()).not.toContain('—');
  await expect(page.locator('main').getByRole('link', { name: 'Privacy', exact: true })).toHaveAttribute('href', '/privacy');
});

test.describe('AI consent screen', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('footnote links to the Terms of Use and Privacy', async ({ page }) => {
    await page.goto('/copilot');
    const footnote = page.locator('.ce-consent__footnote');
    await expect(footnote).toHaveText('By continuing you agree to the Terms of Use. Change choices anytime in Privacy.');
    await expect(footnote.getByRole('link', { name: 'Terms of Use' })).toHaveAttribute('href', '/terms');
    await expect(footnote.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
    await footnote.getByRole('link', { name: 'Terms of Use' }).click();
    await expect(page).toHaveURL(/\/terms$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Terms of Use' })).toBeVisible();
  });

  test('Agree is reachable without scrolling at 375x667', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/ask');
    await expect(page.getByRole('heading', { name: 'A quick note before we begin' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Agree and continue' })).toBeInViewport({ ratio: 1 });
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
});

// Every page that links Privacy must also link Terms.
for (const path of ['/', '/landing', '/download', '/support', '/privacy', '/terms', '/copilot', '/blog', '/blog/abg-interpretation-for-nurses']) {
  test(`Privacy and Terms links appear together on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('h1').first()).toBeVisible();
    const hrefs = await page.locator('a[href]').evaluateAll(elements => elements.map(el => el.getAttribute('href')));
    const privacy = hrefs.filter(href => href === '/privacy').length;
    const terms = hrefs.filter(href => href === '/terms').length;
    if (path === '/privacy') expect(terms).toBeGreaterThan(0);
    else if (path === '/terms') expect(privacy).toBeGreaterThan(0);
    else {
      expect(privacy).toBeGreaterThan(0);
      expect(terms).toBeGreaterThan(0);
    }
  });
}

test('workspace navigation sheet lists Terms next to Privacy', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Clinical Edge workspace' }).getByRole('button', { name: 'More tools' }).click();
  const dialog = page.getByRole('dialog', { name: 'Workspace & support' });
  await expect(dialog.getByRole('link', { name: /^Privacy/ })).toHaveAttribute('href', '/privacy');
  await expect(dialog.getByRole('link', { name: /^Terms/ })).toHaveAttribute('href', '/terms');
});
