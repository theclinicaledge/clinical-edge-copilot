import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { routeABG, teachingCatalog } = require('../../backend/ask-abg-engine');
const registry = require('../../backend/ask-source-registry.json');
const q = 'Arterial ABG: pH 7.22, PaCO2 30 mmHg, HCO3 12 mmol/L. What does it mean?';
const result = routeABG(q);
const catalog = teachingCatalog(result);
const response = { answer: result.summary, details: [], contextMode: 'general', questionKind: 'reported_context', abg: result,
  abgTeaching: catalog.slice(0, 2), abgExplanationOptions: catalog,
  evidence: { status: 'deterministic_rules', sources: registry.sources.filter((s: { id: string }) => [...result.sourceIds, ...catalog.flatMap((p: { sourceIds: string[] }) => p.sourceIds)].includes(s.id)) } };

for (const width of [320, 390, 430, 1280]) test(`direct rule-based ABG and safe explanation selection at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 }); const bodies: unknown[] = [], errors: string[] = [];
  page.on('pageerror', e => errors.push(e.name));
  await page.route('**/api/**', route => {
    const body = route.request().postDataJSON(); bodies.push(body);
    return route.fulfill({ json: body.abgExplanation ? { contextMode: 'general', abgExplanation: { status: 'selected', pointIds: ['metabolic_response', 'comparison'] },
      abg: { ...result, summary: 'Septic shock', calculated: [{ expectedRange: [26, 30] }] }, answer: 'Wrong generated range 26-30' } : response });
  });
  await page.goto('/ask'); await page.getByLabel('Nursing question').fill(q); await page.getByRole('button', { name: 'Ask Clinical Edge' }).click();
  const verified = page.getByLabel('Rule-based ABG interpretation');
  await expect(verified).toContainText('24–28 mmHg'); await expect(verified).toContainText('above the approximate expected interval');
  await expect(verified).toContainText('additional respiratory acidifying');
  await expect(page.getByRole('link', { name: 'Acid-Base Disorders', exact: true })).toBeVisible();
  await expect(page.getByLabel('Evidence boundary')).toContainText('not generated or independently verified by the AI');
  const before = await verified.innerText();
  await page.getByRole('button', { name: 'Explain this pattern' }).click();
  await expect(page.getByLabel('ABG physiology explanation')).toContainText('low CO2 automatically');
  expect(await verified.innerText()).toBe(before);
  await expect(page.locator('.ce-ask-answer')).not.toContainText('Septic shock');
  await expect(page.locator('.ce-ask-answer')).not.toContainText('26-30');
  expect(bodies).toEqual([{ question: q, contextMode: 'general' }, { question: q, contextMode: 'general', abgExplanation: true }]);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const box = await page.locator('.ce-ask-answer').boundingBox(), dock = await page.getByRole('navigation', { name: 'Clinical Edge workspace' }).boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(dock!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); expect(errors).toEqual([]);
  const storage = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage }, url: location.href, history: history.state }));
  expect(storage).not.toContain(q); expect(storage).not.toContain('expectedRange');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: `/private/tmp/clinical-edge-abg-engine-${width}.png`, fullPage: true });
});

for (const failure of ['unavailable', 'wrong_ids', 'network']) test(`explanation ${failure} cannot replace the verified result`, async ({ page }) => {
  let calls = 0;
  await page.route('**/api/**', route => {
    calls++;
    if (!route.request().postDataJSON().abgExplanation) return route.fulfill({ json: response });
    if (failure === 'network') return route.abort();
    return route.fulfill({ json: { contextMode: 'general', abgExplanation: { status: failure === 'wrong_ids' ? 'selected' : 'unavailable',
      pointIds: ['invented range 26-30'], points: [{ id: 'comparison', text: 'Septic shock' }] } } });
  });
  await page.goto('/ask'); await page.getByLabel('Nursing question').fill(q); await page.getByRole('button', { name: 'Ask Clinical Edge' }).click();
  const verified = page.getByLabel('Rule-based ABG interpretation'); await expect(verified).toBeVisible(); const before = await verified.innerText();
  await page.getByRole('button', { name: 'Explain this pattern' }).click();
  await expect(page.getByRole('status')).toContainText('interpretation is unchanged');
  expect(await verified.innerText()).toBe(before); expect(calls).toBe(2);
  await expect(page.getByLabel('ABG physiology explanation')).not.toContainText('Septic shock');
});

test('duplicate explanation is blocked and edited question is not substituted for the verified sample', async ({ page }) => {
  const bodies: unknown[] = [];
  await page.route('**/api/**', async route => {
    const body = route.request().postDataJSON(); bodies.push(body);
    if (body.abgExplanation) { await new Promise(resolve => setTimeout(resolve, 400)); return route.fulfill({ json: { contextMode: 'general', abgExplanation: { status: 'selected', pointIds: ['comparison'] } } }); }
    return route.fulfill({ json: response });
  });
  await page.goto('/ask'); await page.getByLabel('Nursing question').fill(q); await page.getByRole('button', { name: 'Ask Clinical Edge' }).click();
  await page.getByLabel('Nursing question').fill('A different unsubmitted question');
  const button = page.getByRole('button', { name: 'Explain this pattern' });
  await button.evaluate((b: HTMLButtonElement) => { b.click(); b.click(); }); await expect(button).toBeDisabled();
  await expect(button).toBeEnabled(); expect(bodies).toEqual([{ question: q, contextMode: 'general' }, { question: q, contextMode: 'general', abgExplanation: true }]);
});

test('missing units prompt clarification without a fake interpretation or explanation action', async ({ page }) => {
  const text = 'ABG pH 7.28, PaCO2 55, HCO3 25: what does that pattern support, and what can it not tell me?';
  const clarification = routeABG(text);
  await page.route('**/api/**', route => route.fulfill({ json: { answer: clarification.summary, details: [], contextMode: 'general', abg: clarification } }));
  await page.goto('/ask'); await page.getByLabel('Nursing question').fill(text); await page.getByRole('button', { name: 'Ask Clinical Edge' }).click();
  await expect(page.getByLabel('ABG clarification')).toContainText('mmHg');
  await expect(page.getByLabel('Rule-based ABG interpretation')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Explain this pattern' })).toHaveCount(0);
  await expect(page.getByLabel('Nursing question')).toHaveValue(text);
});

test('ABG survives resource navigation, clears on New question and refresh, and never reruns automatically', async ({ page }) => {
  let calls = 0; await page.route('**/api/**', route => { calls++; return route.fulfill({ json: response }); });
  await page.goto('/ask'); await page.getByLabel('Nursing question').fill(q); await page.getByRole('button', { name: 'Ask Clinical Edge' }).click();
  await expect(page.getByLabel('Rule-based ABG interpretation')).toBeVisible();
  const dock = page.getByRole('navigation', { name: 'Clinical Edge workspace' });
  await dock.getByRole('link', { name: 'Home', exact: true }).click(); await dock.getByRole('link', { name: 'Ask', exact: true }).click();
  await expect(page.getByLabel('Rule-based ABG interpretation')).toContainText('24–28'); expect(calls).toBe(1);
  await page.reload(); await expect(page.getByLabel('Rule-based ABG interpretation')).toHaveCount(0);
  await page.getByLabel('Nursing question').fill(q); await page.getByRole('button', { name: 'Ask Clinical Edge' }).click();
  await expect(page.getByLabel('Rule-based ABG interpretation')).toBeVisible(); await page.getByRole('button', { name: 'New question' }).click();
  await expect(page.getByLabel('Rule-based ABG interpretation')).toHaveCount(0); await expect(page.getByLabel('ABG physiology explanation')).toHaveCount(0); expect(calls).toBe(2);
});
