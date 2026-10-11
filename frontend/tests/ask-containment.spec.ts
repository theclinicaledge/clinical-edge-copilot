import { test, expect } from '@playwright/test';

for (const width of [390, 768, 1440]) test(`Ask restricted state is accessible and preserves question at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  let count = 0;
  await page.route('**/api/ask', route => {
    count++;
    return route.fulfill({ status: 503, json: { error: { code: 'ask_temporarily_restricted' }, requestId: 'synthetic' } });
  });
  await page.goto('/ask');
  const field = page.getByLabel('Nursing question');
  await field.fill('Explain how insulin works.');
  await page.getByRole('button', { name: 'Ask Clinical Edge', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('temporarily paused for safety review');
  await expect(page.getByRole('alert')).toContainText('Deterministic ABG interpretation');
  await expect(field).toHaveValue('Explain how insulin works.');
  await expect(page.locator('.ce-ask-answer')).toHaveCount(0);
  expect(count).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const stored = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage }, history: history.state, url: location.href }));
  expect(stored).not.toContain('Explain how insulin works.');
});

const restricted = { error: true, code: 'clinical_generation_restricted', message: 'This generated workspace feature is temporarily paused for safety review. Your entered information remains available.' };
const narrative = 'BP dropped from 108/64 to 86/48. HR went from 92 to 118. More drowsy.';
test('restricted Priority Map preserves captured inputs and does not automatically retry', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let calls = 0;
  await page.route('**/api/copilot', route => { calls++; return route.fulfill({ status: 503, json: restricted }); });
  await page.goto('/copilot?capture=rapid');
  await page.getByLabel('Nurse narrative').fill(narrative);
  await page.getByRole('button', { name: 'Structure my Snapshot' }).click();
  await page.getByRole('button', { name: 'Confirm Snapshot' }).click();
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect(page.getByRole('alert')).toContainText('paused for safety review');
  await expect(page.getByRole('heading', { name: 'Ready for Priority Map' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Ready for Priority Map' })).toContainText('86/48');
  expect(calls).toBe(1);
  const stored = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage }, history: history.state, url: location.href }));
  expect(stored).not.toContain('86/48');
});

test('Teach Me and SBAR expose accessible restricted states without losing an existing map', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = `Urgency Level: HIGH
**Priorities**
### 1 · Reported perfusion change
Relevance: Important
Observed:
- Blood pressure fell from 108/64 to 86/48
Interpretation: The cause remains unresolved.
Assess now:
- Focused reassessment
**Teach me why**
Trends provide context.`;
  let map = 0, teach = 0, sbar = 0;
  await page.route('**/api/**', route => {
    const body = route.request().postDataJSON();
    if (route.request().url().includes('/sbar')) { sbar++; return route.fulfill({ status: 503, json: restricted }); }
    if (body.learningRequest) { teach++; return route.fulfill({ status: 503, json: restricted }); }
    map++;
    return route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: response })}\n\ndata: ${JSON.stringify({ done: true })}\n\n` });
  });
  await page.goto('/copilot?capture=rapid');
  await page.getByLabel('Nurse narrative').fill(narrative);
  await page.getByRole('button', { name: 'Structure my Snapshot' }).click();
  await page.getByRole('button', { name: 'Confirm Snapshot' }).click();
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await page.getByRole('button', { name: /Teach me why/ }).click();
  await expect(page.getByRole('alert')).toContainText('paused for safety review');
  await page.getByRole('button', { name: 'Return to Priority Map', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Reported perfusion change' })).toBeVisible();
  await page.getByRole('button', { name: 'Prepare SBAR' }).click();
  await expect(page.getByRole('alert')).toContainText('paused for safety review');
  await expect(page.getByRole('heading', { name: 'Reported perfusion change' })).toBeVisible();
  expect({ map, teach, sbar }).toEqual({ map: 1, teach: 1, sbar: 1 });
});
