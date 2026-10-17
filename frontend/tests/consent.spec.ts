import { test, expect } from '@playwright/test';

// App Store Review Guidelines 5.1.2(i) (explicit permission before sharing with
// third-party AI) and 5.1.1(ii) (consent for usage data, easy withdrawal).
test.use({ storageState: { cookies: [], origins: [] } });

const storedConsent = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('ce_consent') || 'null'));

for (const route of ['/copilot', '/ask']) {
  test(`${route} asks for AI permission before any backend request`, async ({ page }) => {
    const apiCalls: string[] = [];
    page.on('request', (request) => { if (request.url().includes('/api/')) apiCalls.push(request.url()); });
    await page.goto(route);
    await expect(page.getByRole('heading', { name: route === '/ask' ? 'A quick note before we begin' : 'How your entries are processed' })).toBeFocused();
    if (route === '/ask') await page.getByText('Full AI and privacy information').click();
    await expect(page.getByText(/go through our server to Anthropic/)).toBeVisible();
    await expect(page.getByText(/not individualized diagnosis, treatment or emergency guidance/)).toBeVisible();
    await expect(page.getByText(/volatile server memory for up to ten minutes/)).toBeVisible();
    await expect(page.getByText(/admission, generation and safety review/)).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /pseudonymous usage analytics/ })).not.toBeChecked();
    expect(apiCalls).toEqual([]);
    expect(await storedConsent(page)).toBeNull();
  });
}

test('Not now returns home without recording consent', async ({ page }) => {
  await page.goto('/copilot');
  await page.getByRole('button', { name: 'Not now' }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(await storedConsent(page)).toBeNull();
});

test('agreeing opens the workspace with analytics off by default', async ({ page }) => {
  await page.goto('/copilot');
  await page.getByRole('button', { name: 'Agree and continue' }).click();
  await expect(page.getByRole('heading', { name: 'How your entries are processed' })).toHaveCount(0);
  expect(await storedConsent(page)).toMatchObject({ version: 4, ai: true, analytics: false });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'How your entries are processed' })).toHaveCount(0);
});

test('a stored version 3 consent shows the updated disclosure screen again', async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('ce_consent', JSON.stringify({ version: 3, ai: true, analytics: true, decidedAt: '2026-10-01T00:00:00.000Z' }));
      sessionStorage.setItem('seeded', '1');
    }
  });
  const apiCalls: string[] = [];
  page.on('request', (request) => { if (request.url().includes('/api/')) apiCalls.push(request.url()); });
  await page.goto('/copilot');
  await expect(page.getByRole('heading', { name: 'How your entries are processed' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Terms of Use' })).toHaveAttribute('href', '/terms');
  await expect(page.getByRole('checkbox', { name: /pseudonymous usage analytics/ })).not.toBeChecked();
  expect(apiCalls).toEqual([]);
  await page.getByRole('button', { name: 'Agree and continue' }).click();
  expect(await storedConsent(page)).toMatchObject({ version: 4, ai: true, analytics: false });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'How your entries are processed' })).toHaveCount(0);
});

test('analytics opt-in is recorded only when checked', async ({ page }) => {
  await page.goto('/ask');
  await page.getByRole('checkbox', { name: /pseudonymous usage analytics/ }).check();
  await page.getByRole('button', { name: 'Agree and continue' }).click();
  expect(await storedConsent(page)).toMatchObject({ ai: true, analytics: true });
});

test('no analytics events are emitted without consent', async ({ page }) => {
  const events: string[] = [];
  page.on('console', (message) => { if (message.text().startsWith('[analytics]')) events.push(message.text()); });
  await page.goto('/');
  await page.goto('/icu-drips');
  await page.goto('/rhythm-lab');
  expect(events).toEqual([]);
});

test('consent can be withdrawn from Privacy and the gate returns', async ({ page }) => {
  await page.goto('/copilot');
  await page.getByRole('checkbox', { name: /pseudonymous usage analytics/ }).check();
  await page.getByRole('button', { name: 'Agree and continue' }).click();
  await page.goto('/privacy');
  const ai = page.getByRole('checkbox', { name: /Send my Shift Brain and Ask entries to Anthropic/ });
  const analytics = page.getByRole('checkbox', { name: /pseudonymous product usage events/ });
  await expect(ai).toBeChecked();
  await expect(analytics).toBeChecked();
  await ai.uncheck();
  await analytics.uncheck();
  await expect(page.getByRole('status')).toContainText('Choice saved');
  expect(await storedConsent(page)).toMatchObject({ ai: false, analytics: false });
  await page.goto('/copilot');
  await expect(page.getByRole('heading', { name: 'How your entries are processed' })).toBeVisible();
});

test('analytics can be withdrawn through the in-WebView choices route', async ({ page }) => {
  await page.goto('/ask');
  await page.getByRole('checkbox', { name: /pseudonymous usage analytics/ }).check();
  await page.getByRole('button', { name: 'Agree and continue' }).click();
  await page.goto('/');
  await page.getByRole('link', { name: 'Choices', exact: true }).click();
  await expect(page).toHaveURL(/\/choices$/);
  const analytics = page.getByRole('checkbox', { name: /pseudonymous product usage events/ });
  await expect(analytics).toBeChecked();
  await analytics.uncheck();
  await expect(analytics).not.toBeChecked();
  expect(await storedConsent(page)).toMatchObject({ ai: true, analytics: false });
});

test('privacy policy discloses the AI provider, retention and withdrawal', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.getByText(/Anthropic automatically deletes API inputs and outputs within 30 days/)).toBeVisible();
  await expect(page.getByText(/Retention, deletion and withdrawing consent/i)).toBeVisible();
  await expect(page.getByText(/Their own privacy policies also apply/)).toBeVisible();
});
