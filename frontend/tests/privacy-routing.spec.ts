import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

test.beforeEach(async ({ page }) => {
  // Routing checks must not invoke clinical services or external telemetry.
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname) || url.pathname.startsWith('/api/')) {
      return route.abort();
    }
    return route.continue();
  });
});

test('canonical Privacy renders and survives direct reload', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { name: 'Privacy Policy', exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/privacy$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Privacy Policy', exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/privacy$/);
});

test('root legacy Privacy canonicalizes before rendering or hydration', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && /hydrat|did not match/i.test(message.text())) errors.push(message.text());
  });
  await page.addInitScript(() => history.replaceState({ marker: 'preserve-me' }, '', location.href));
  await page.goto('/#/privacy');
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole('heading', { name: 'Privacy Policy', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What do you need right now?', exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => history.state)).toEqual({ marker: 'preserve-me' });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Privacy Policy', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('legacy Privacy preserves the original query string exactly', async ({ page }) => {
  const query = '?utm_source=app-store&utm_campaign=privacy%20link&tag=one&tag=two&empty=';
  await page.goto(`/${query}#/privacy`);
  await expect(page).toHaveURL(url => url.pathname === '/privacy' && url.search === query && url.hash === '');
  await expect(page.getByRole('heading', { name: 'Privacy Policy', exact: true })).toBeVisible();
});

for (const suffix of ['', '#section', '#/support', '#privacy', '#/privacy/', '#/privacy?extra=1', '#%2Fprivacy']) {
  test(`root remains Home and preserves unrelated URL ${suffix || '(no hash)'}`, async ({ page }) => {
    await page.goto(`/?utm_source=test${suffix}`);
    await expect(page.getByRole('heading', { name: 'What do you need right now?', exact: true })).toBeVisible();
    await expect(page).toHaveURL(url => url.pathname === '/' && url.search === '?utm_source=test' && url.hash === suffix);
  });
}

for (const route of [
  { path: '/home', heading: 'What do you need right now?' },
  { path: '/support', heading: 'Support' },
  { path: '/privacy', heading: 'Privacy Policy' },
]) {
  test(`non-root ${route.path} does not reinterpret #/privacy`, async ({ page }) => {
    await page.goto(`${route.path}?utm_source=test#/privacy`);
    await expect(page.getByRole('heading', { name: route.heading, exact: true })).toBeVisible();
    await expect(page).toHaveURL(url => url.pathname === route.path && url.search === '?utm_source=test' && url.hash === '#/privacy');
  });
}

test('canonicalization replaces the entry and Back/Forward has no redirect loop', async ({ page }) => {
  await page.goto('/support');
  await expect(page.getByRole('heading', { name: 'Support', exact: true })).toBeVisible();
  const initialLength = await page.evaluate(() => history.length);
  await page.goto('/?utm_source=app-store#/privacy');
  await expect(page).toHaveURL(/\/privacy\?utm_source=app-store$/);
  await expect(page.getByRole('heading', { name: 'Privacy Policy', exact: true })).toBeVisible();
  expect(await page.evaluate(() => history.length)).toBe(initialLength + 1);
  for (let cycle = 0; cycle < 2; cycle++) {
    await page.goBack();
    await expect(page).toHaveURL(/\/support$/);
    await expect(page.getByRole('heading', { name: 'Support', exact: true })).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(/\/privacy\?utm_source=app-store$/);
    await expect(page.getByRole('heading', { name: 'Privacy Policy', exact: true })).toBeVisible();
  }
  expect(await page.evaluate(() => history.length)).toBe(initialLength + 1);
});

test('a legacy history entry reached by SPA Back canonicalizes without adding history', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'What do you need right now?', exact: true })).toBeVisible();
  // Simulate an older entry while the app is already running, then use normal SPA navigation.
  await page.evaluate(() => history.replaceState({ marker: 'legacy-entry' }, '', '/?utm_source=old#/privacy'));
  await page.getByRole('link', { name: 'Support', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Support', exact: true })).toBeVisible();
  const length = await page.evaluate(() => history.length);
  await page.goBack();
  await expect(page).toHaveURL(/\/privacy\?utm_source=old$/);
  await expect(page.getByRole('heading', { name: 'Privacy Policy', exact: true })).toBeVisible();
  expect(await page.evaluate(() => history.state.marker)).toBe('legacy-entry');
  await page.goForward();
  await expect(page.getByRole('heading', { name: 'Support', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Privacy Policy', exact: true })).toBeVisible();
  expect(await page.evaluate(() => history.length)).toBe(length);
});
