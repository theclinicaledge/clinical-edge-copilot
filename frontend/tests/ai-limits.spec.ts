import { test, expect } from '@playwright/test';

const FREE_LIMIT = "You've used today's 3 free AI questions. They reset at midnight Pacific. Reference tools, Rhythm Lab and ABG interpretation still work.";
const ASK_RESTING = "Ask is resting until tomorrow. Today's AI capacity is used up and resets at midnight Pacific. Reference tools, Rhythm Lab and ABG interpretation still work.";
const SHIFT_BRAIN_RESTING = "Shift Brain is resting until tomorrow. Today's AI capacity is used up and resets at midnight Pacific. Reference tools, Rhythm Lab and ABG interpretation still work.";

async function ask(page, question: string) {
  await page.goto('/ask');
  await page.getByLabel('Nursing question').fill(question);
  await page.getByRole('button', { name: 'Ask Clinical Edge' }).click();
}

test('Ask shows the free daily limit message from the server', async ({ page }) => {
  await page.route('**/api/ask', route => route.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ error: { code: 'free_daily_limit_reached', message: FREE_LIMIT }, requestId: 'mock' }) }));
  await ask(page, 'How does preload affect stroke volume?');
  await expect(page.getByRole('alert')).toHaveText(FREE_LIMIT);
  await expect(page.getByLabel('Nursing question')).toHaveValue('How does preload affect stroke volume?');
});

test('Ask shows the resting message when the daily AI budget is used up', async ({ page }) => {
  await page.route('**/api/ask', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: { code: 'ai_daily_budget_reached', message: ASK_RESTING }, requestId: 'mock' }) }));
  await ask(page, 'How does preload affect stroke volume?');
  await expect(page.getByRole('alert')).toHaveText(ASK_RESTING);
});

test('Ask falls back to its own limit copy if the server message is missing', async ({ page }) => {
  await page.route('**/api/ask', route => route.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ error: { code: 'free_daily_limit_reached' } }) }));
  await ask(page, 'How does preload affect stroke volume?');
  await expect(page.getByRole('alert')).toContainText("You've used today's free AI questions. They reset at midnight Pacific.");
});

test('Shift Brain shows the limit and resting messages instead of a generic error', async ({ page }) => {
  let status = 429;
  await page.route('**/api/copilot', route => route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(status === 429
      ? { error: true, code: 'free_daily_limit_reached', message: FREE_LIMIT }
      : { error: true, code: 'ai_daily_budget_reached', message: SHIFT_BRAIN_RESTING }),
  }));
  await page.goto('/copilot');
  await page.getByRole('button', { name: 'Enter findings manually', exact: true }).click();
  await page.getByLabel('Other symptom').fill('Fictional symptom');
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect(page.getByText(FREE_LIMIT)).toBeVisible();
  await expect(page.getByText(/Too many requests/)).toHaveCount(0);
  status = 503;
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect(page.getByText(SHIFT_BRAIN_RESTING)).toBeVisible();
});

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test('an anonymous device ID is created on the first AI request, kept, and sent only to AI routes', async ({ page }) => {
  const ids: (string | undefined)[] = [];
  const analyticsHeaders: (string | undefined)[] = [];
  page.on('request', request => { if (!request.url().includes('/api/')) analyticsHeaders.push(request.headers()['x-ce-device-id']); });
  await page.route('**/api/ask', route => { ids.push(route.request().headers()['x-ce-device-id']); return route.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ error: { code: 'free_daily_limit_reached', message: FREE_LIMIT } }) }); });
  await page.goto('/ask');
  expect(await page.evaluate(() => localStorage.getItem('ce_device_id'))).toBeNull();
  await page.getByLabel('Nursing question').fill('How does preload affect stroke volume?');
  await page.getByRole('button', { name: 'Ask Clinical Edge' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  const stored = await page.evaluate(() => localStorage.getItem('ce_device_id'));
  expect(stored).toMatch(UUID_V4);
  expect(ids).toEqual([stored]);
  await page.reload();
  await page.getByLabel('Nursing question').fill('How does afterload affect stroke volume?');
  await page.getByRole('button', { name: 'Ask Clinical Edge' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  expect(ids).toEqual([stored, stored]);
  expect(analyticsHeaders.filter(Boolean)).toEqual([]);
});

test('Shift Brain sends the same device ID with Priority Map requests', async ({ page }) => {
  let header: string | undefined;
  await page.route('**/api/copilot', route => { header = route.request().headers()['x-ce-device-id']; return route.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ error: true, code: 'free_daily_limit_reached', message: FREE_LIMIT }) }); });
  await page.goto('/copilot');
  await page.evaluate(() => localStorage.setItem('ce_device_id', '3f1c2b4a-8d6e-4f7a-9b2c-1d3e5f7a9b0c'));
  await page.getByRole('button', { name: 'Enter findings manually', exact: true }).click();
  await page.getByLabel('Other symptom').fill('Fictional symptom');
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect(page.getByText(FREE_LIMIT)).toBeVisible();
  expect(header).toBe('3f1c2b4a-8d6e-4f7a-9b2c-1d3e5f7a9b0c');
});

test('Privacy discloses the device identifier and its limits', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.getByText('Effective date: October 12, 2026')).toBeVisible();
  await expect(page.getByText(/random device identifier, created on your device, which is used only to apply daily usage limits; it is not linked to your identity, and our server does not keep it beyond the day\./)).toBeVisible();
});
