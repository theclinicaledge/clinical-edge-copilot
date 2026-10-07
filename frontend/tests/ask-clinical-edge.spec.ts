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

for (const width of [390, 430, 1280]) test(`adaptive Ask sections, evidence boundary and manual handoff at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  const bodies: unknown[] = [];
  await page.route('**/api/**', route => {
    bodies.push(route.request().postDataJSON());
    return route.fulfill({ json: { answer: 'LVEDP is pressure at the end of ventricular filling, not a direct fluid-volume measurement.',
      details: [{ heading: 'What changes interpretation', text: 'Compliance and measurement conditions change how pressure relates to volume.' },
        { heading: 'At the bedside', text: 'Relate the reported pressure to available respiratory and perfusion findings; the cause remains unresolved.' }],
      contextMode: 'general', questionKind: 'reported_context', offerSnapshot: true,
      evidence: { status: 'not_source_grounded', requiresVerification: true, categories: ['interpretation'] } } });
  });
  await page.goto('/ask');
  const q = 'My fictional patient has LVEDP 24. What does that mean?';
  await page.getByLabel('Nursing question').fill(q);
  await page.getByRole('button', { name: 'Ask Clinical Edge' }).click();
  await expect(page.locator('.ce-ask-direct')).toContainText('not a direct fluid-volume measurement');
  await expect(page.getByRole('heading', { name: 'What changes interpretation' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'At the bedside' })).toBeVisible();
  await expect(page.getByLabel('Evidence boundary')).toContainText('not verified');
  await expect(page.locator('.ce-ask-answer')).toContainText('Reported context');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const output = await page.locator('.ce-ask-answer').boundingBox();
  const dock = await page.getByRole('navigation', { name: 'Clinical Edge workspace' }).boundingBox();
  expect(output!.y + output!.height).toBeLessThanOrEqual(dock!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: `/private/tmp/clinical-edge-ask-improved-${width}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Open Shift Brain' }).click();
  await expect(page.getByLabel('Nurse narrative')).toHaveValue('');
  expect(bodies).toEqual([{ question: q, contextMode: 'general' }]);
  await page.getByRole('navigation', { name: 'Clinical Edge workspace' }).getByRole('link', { name: 'Ask', exact: true }).click();
  await expect(page.locator('.ce-ask-answer')).toContainText('Compliance');
  const storage = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage }, url: location.href, history: history.state }));
  expect(storage).not.toContain(q);
});

test('medication reference link is a trusted directory, not a generated citation', async ({ page }) => {
  await page.route('**/api/ask', route => route.fulfill({ json: { answer: 'Insulin promotes cellular potassium uptake; this does not prove total body depletion.',
    details: [], contextMode: 'general', questionKind: 'education', offerSnapshot: false,
    evidence: { status: 'not_source_grounded', requiresVerification: true, categories: ['medication'] } } }));
  await page.goto('/ask'); await page.getByLabel('Nursing question').fill('Why can potassium change with insulin?');
  await page.getByRole('button', { name: 'Ask Clinical Edge' }).click();
  await expect(page.getByRole('link', { name: 'Check official medication labeling' })).toHaveAttribute('href', 'https://dailymed.nlm.nih.gov/dailymed/');
  await expect(page.getByRole('button', { name: 'Open Shift Brain' })).toHaveCount(0);
  await expect(page.locator('.ce-ask-detail')).toHaveCount(0);
});

for (const width of [390, 1280]) {
  for (const domain of ['ABG', 'LVEDP', 'SvO2', 'CRRT']) test(`supplied ${domain} sources render honestly at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    let calls = 0;
    await page.route('**/api/**', route => {
      calls++;
      return route.fulfill({ json: { answer: 'A mocked reference explanation, not live-model validation.', details: [], contextMode: 'general',
        evidence: { status: 'curated_evidence', requiresVerification: true,
          deviceScope: domain === 'CRRT' ? 'PrisMax concepts only; no settings or procedures.' : null,
          sources: [{ id: 'fixture-reference', title: `${domain} source fixture`, publisher: 'Professional source fixture', url: 'https://example.org/reference', updated: '2025-01-01' }] } } });
    });
    await page.goto('/ask');
    await page.getByLabel('Nursing question').fill(`Explain ${domain} concepts`);
    await page.getByRole('button', { name: 'Ask Clinical Edge' }).click();
    const boundary = page.getByLabel('Evidence boundary');
    await expect(boundary).toContainText('provided before generation');
    await expect(boundary).toContainText('not additional patient findings');
    await expect(boundary).toContainText('Professional source fixture');
    await expect(boundary).toContainText('Updated 2025-01-01');
    await expect(boundary.getByRole('link')).toHaveAttribute('href', 'https://example.org/reference');
    await expect(boundary.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer');
    if (domain === 'CRRT') await expect(boundary).toContainText('PrisMax');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const output = await page.locator('.ce-ask-answer').boundingBox();
    const dock = await page.getByRole('navigation', { name: 'Clinical Edge workspace' }).boundingBox();
    expect(output!.y + output!.height).toBeLessThanOrEqual(dock!.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(calls).toBe(1);
    const storage = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage }, history: history.state }));
    expect(storage).not.toContain('mocked reference explanation');
  });
}

test('limited source coverage is not presented as a complete grounded model answer', async ({ page }) => {
  await page.route('**/api/**', route => route.fulfill({ json: { answer: 'This source set does not cover the requested formula.', details: [], contextMode: 'general',
    evidence: { status: 'scope_limited', sources: [{ id: 'safe', title: 'Safe reference', publisher: 'Reference publisher', url: 'https://example.org/reference' },
      { id: 'unsafe', title: 'Unsafe link', publisher: 'Reference publisher', url: 'javascript:alert(1)' }] } } }));
  await page.goto('/ask'); await page.getByLabel('Nursing question').fill('Explain the acid-base anion gap');
  await page.getByRole('button', { name: 'Ask Clinical Edge' }).click();
  await expect(page.getByLabel('Evidence boundary')).toContainText('Limited evidence coverage');
  await expect(page.getByLabel('Evidence boundary')).toContainText('not a complete model-generated answer');
  await expect(page.getByRole('link', { name: 'Safe reference' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Unsafe link' })).toHaveCount(0);
});
