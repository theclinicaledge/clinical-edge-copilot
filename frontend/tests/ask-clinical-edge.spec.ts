import { test, expect } from '@playwright/test';

const question = 'Why can oxygen saturation look normal while ventilation is inadequate?';
const answer = 'Oxygen saturation describes hemoglobin oxygenation, not carbon dioxide clearance. Supplemental oxygen can preserve saturation despite inadequate ventilation.\n\nAssess respiratory effort and mental status alongside available carbon dioxide measurements; no single oxygen saturation establishes adequate ventilation.';

for (const width of [390, 430, 1280]) test(`Ask general education works without Snapshot at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  const bodies: unknown[] = [], errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/api/**', route => {
    bodies.push(route.request().postDataJSON());
    return route.fulfill({ json: { answer, contextMode: 'general', requestId: 'mock' } });
  });
  await page.goto('/');
  await page.locator('main a[href="/ask"]').click();
  await expect(page.getByRole('heading', { name: 'Ask Clinical Edge', exact: true })).toBeVisible();
  await page.getByLabel('Nursing question').fill(question);
  await page.getByRole('button', { name: 'Ask Clinical Edge' }).click();
  await expect(page.locator('.ce-ask-answer')).toContainText('not carbon dioxide clearance');
  expect(bodies).toEqual([{ question, contextMode: 'general' }]);
  const dock = page.getByRole('navigation', { name: 'Clinical Edge workspace' });
  await expect(dock.getByRole('link', { name: 'Ask', exact: true })).toHaveAttribute('aria-current', 'page');
  for (const item of await dock.locator('a,button').all()) {
    const box = await item.boundingBox(); expect(box!.height).toBeGreaterThanOrEqual(44); expect(box!.width).toBeGreaterThanOrEqual(44);
  }
  await page.locator('.ce-ask-answer').scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const output = await page.locator('.ce-ask-answer').boundingBox(), dockBox = await dock.boundingBox();
  expect(output!.y + output!.height).toBeLessThanOrEqual(dockBox!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  const state = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage }, url: location.href, history: history.state }));
  expect(state).not.toContain(question); expect(state).not.toContain(answer);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.screenshot({ path: `/private/tmp/clinical-edge-ask-${width}.png` });
  await page.reload(); await expect(page.getByLabel('Nursing question')).toHaveValue(''); await expect(page.locator('.ce-ask-answer')).toHaveCount(0);
});

test('Ask excludes active Shift Brain context and preserves both memory workspaces', async ({ page }) => {
  const narrative = 'Fictional person is drowsy. BP is 85/55. Baseline is unknown.';
  const bodies: unknown[] = [];
  await page.route('**/api/**', route => { bodies.push(route.request().postDataJSON()); return route.fulfill({ json: { answer, contextMode: 'general' } }); });
  await page.goto('/copilot?capture=rapid');
  await page.getByLabel('Nurse narrative').fill(narrative);
  const dock = page.getByRole('navigation', { name: 'Clinical Edge workspace' });
  await dock.getByRole('link', { name: 'Ask', exact: true }).click();
  await page.getByLabel('Nursing question').fill(question);
  await page.getByRole('button', { name: 'Ask Clinical Edge' }).click();
  await expect(page.locator('.ce-ask-answer')).toBeVisible();
  expect(bodies).toEqual([{ question, contextMode: 'general' }]);
  await dock.getByRole('link', { name: 'Shift Brain', exact: true }).click();
  await expect(page.getByLabel('Nurse narrative')).toHaveValue(narrative);
  await dock.getByRole('link', { name: 'Ask', exact: true }).click();
  await expect(page.locator('.ce-ask-answer')).toBeVisible(); expect(bodies).toHaveLength(1);
  await page.getByRole('button', { name: 'New question' }).click();
  await expect(page.getByLabel('Nursing question')).toHaveValue(''); await expect(page.locator('.ce-ask-answer')).toHaveCount(0);
});

test('duplicate submission is blocked and timeout preserves question without exposing provider error', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/ask', async route => { calls++; await new Promise(resolve => setTimeout(resolve, 500)); await route.fulfill({ status: 504, json: { error: { code: 'provider_timeout', message: 'internal secret detail' } } }); });
  await page.goto('/ask'); await page.getByLabel('Nursing question').fill(question);
  const submit = page.getByRole('button', { name: 'Ask Clinical Edge' }); await submit.click();
  await expect(submit).toBeDisabled(); await expect(page.getByRole('status')).toContainText('Preparing');
  await expect(page.getByRole('alert')).toContainText('question is unchanged');
  await expect(page.getByLabel('Nursing question')).toHaveValue(question);
  await expect(page.getByRole('alert')).not.toContainText('internal secret'); expect(calls).toBe(1);
});

test('answer is rendered as text, never executable markup', async ({ page }) => {
  await page.route('**/api/ask', route => route.fulfill({ json: { answer: '<img src=x onerror="window.unsafe=true"> is example text, not markup.', contextMode: 'general' } }));
  await page.goto('/ask'); await page.getByLabel('Nursing question').fill(question); await page.getByRole('button', { name: 'Ask Clinical Edge' }).click();
  await expect(page.locator('.ce-ask-answer')).toContainText('<img'); await expect(page.locator('.ce-ask-answer img')).toHaveCount(0);
});
