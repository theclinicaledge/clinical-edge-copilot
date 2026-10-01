import { test, expect } from '@playwright/test';
import { extractReassessment, confirmReassessment } from '../src/components/reassessmentModel.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { buildPriorityMapFallback, buildReassessmentPriorityMap, buildSbarFallback, assessDeterministicUrgency, buildTeachMeFallback } = require('../../backend/server.js');

const previous = { signals: ['off', 'perfusion'], setting: 'ICU', contexts: [], values: { bpEarlier: '108/64', bpNow: '86/48', hrNow: '118', loc: 'More drowsy', oxygenNow: '4 L NC', urineAmount: '20', urineIntervalValue: '1', urineIntervalUnit: 'hour', lactateNow: '4.1' }, optional: { drips: { items: [{ medication: 'Norepinephrine' }] }, drains: { items: [{ type: 'Chest tube', currentOutput: '35 mL', outputTimeframe: 'most recent hour' }] } }, units: {}, notes: '' };
const update = 'BP now 94/56, HR 106. Still drowsy. Urine 15 mL this hour.';
const confirmed = (text: string, after = true) => confirmReassessment(previous, extractReassessment(text, previous), after);

test('reassessment preserves source, replaces current values and excludes unreassessed facts', () => {
  const source = JSON.stringify(previous);
  const assessment = confirmed(update);
  expect(assessment.delta.map((row) => row.kind)).toEqual(['changed', 'changed', 'unchanged', 'interval']);
  expect(assessment.snapshot.values.bpEarlier).toBe('86/48');
  expect(assessment.snapshot.values.bpNow).toBe('94/56');
  expect(assessment.serializedSnapshot).not.toContain('108/64');
  expect(assessment.serializedSnapshot).not.toContain('4.1');
  expect(assessment.serializedSnapshot).not.toContain('35 mL');
  expect(assessment.snapshot.values.urineAmount).toBe('15');
  expect(assessment.snapshot.values.urineIntervalValue).toBe('1');
  expect(assessment.previous).toEqual(previous);
  expect(JSON.stringify(previous)).toBe(source);
});

for (const text of ['BP 94/56 yesterday.', 'BP 94/56, actually 96/58.', 'BP now 94/56 after fluids improved perfusion.', 'Not more drowsy.', 'Weakness noticed at 14:00.', 'Maybe BP is 94/56.']) {
  test('ambiguous/unsupported reassessment remains reviewable: ' + text, () => {
    const extraction = extractReassessment(text, previous);
    expect(extraction.needsReview.length).toBeGreaterThan(0);
    expect(extraction.rows).toHaveLength(0);
  });
}

test('current-only, explicit comparison and unchanged evidence remain distinct', () => {
  expect(confirmed('BP 94/56.', false).snapshot.values.bpEarlier).toBeUndefined();
  expect(confirmed('BP went from 86/48 to 94/56.', false).snapshot.values.bpEarlier).toBe('86/48');
  expect(confirmed('Oxygen unchanged at 4 L NC.').delta[0].kind).toBe('unchanged');
  expect(extractReassessment('Oxygen unchanged at 2 L NC.', previous).needsReview).toHaveLength(1);
  expect(extractReassessment('BP 94/56. BP 96/58.', previous).rows).toHaveLength(0);
  expect(confirmed('BP unknown.').snapshot.values.bpNow).toBeUndefined();
  expect(confirmed('BP unknown.').delta[0].kind).toBe('unknown');
  expect(confirmed('BP 86/48.').delta[0].kind).toBe('same');
});

test('new interval outputs and medication dose have no invented trend or dose', () => {
  const assessment = confirmed('Chest tube 20 mL this hour. Norepinephrine increased to 0.05 mcg/kg/min.');
  expect(assessment.delta[0].kind).toBe('interval');
  expect(assessment.snapshot.optional.drains.items[0].previousOutput).toBeUndefined();
  expect(assessment.snapshot.optional.drips.items[0].currentDose).toBe('0.05');
  expect(assessment.snapshot.optional.drips.items[0].previousDose).toBeUndefined();
  expect(confirmed('Norepinephrine running dose unknown.').snapshot.optional.drips.items[0].currentDose).toBeUndefined();
});

for (const width of [390, 430, 1280]) {
  test('reassessment UI, continuity, SBAR and privacy at ' + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const errors: string[] = [], analytics: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'debug') analytics.push(m.text()); });
    const bodies: any[] = [];
    await page.route('**/api/**', async (route) => {
      const body = route.request().postDataJSON(); bodies.push(body);
      if (route.request().url().includes('/sbar')) return route.fulfill({ json: { sbar: buildSbarFallback(body.question, assessDeterministicUrgency(body.question).urgency) } });
      if (body.learningRequest) return route.fulfill({ json: { lesson: buildTeachMeFallback('', body.question, 'deterministic_reassessment') } });
      const output = body.reassessmentRequest ? buildReassessmentPriorityMap(body.question) : buildPriorityMapFallback(body.question);
      return route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: output })}\n\ndata: ${JSON.stringify({ done: true })}\n\n` });
    });
    await page.goto('/copilot?capture=rapid');
    await page.getByLabel('Nurse narrative').fill('BP dropped from 108/64 to 86/48. HR went from 92 to 118. More drowsy. Norepinephrine running.');
    await page.getByRole('button', { name: 'Structure my Snapshot' }).click();
    await page.getByRole('button', { name: 'Confirm Snapshot' }).click();
    await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
    await expect(page.getByRole('button', { name: 'Reassess', exact: true })).toBeVisible();
    const started = Date.now();
    await page.getByRole('button', { name: 'Reassess', exact: true }).click();
    await page.getByLabel('New bedside findings').fill(update);
    const interrupt = async () => {
      await page.getByRole('navigation', { name: 'Clinical Edge workspace' }).getByRole('button', { name: 'Check something' }).click();
      await page.getByRole('dialog').getByRole('link', { name: 'Medication' }).click();
      await page.getByRole('link', { name: /Return/ }).click();
    };
    await interrupt();
    await expect(page.getByLabel('New bedside findings')).toHaveValue(update);
    await page.getByRole('button', { name: 'Review reassessment' }).click();
    await page.getByRole('checkbox').check();
    await interrupt();
    await expect(page.getByRole('checkbox')).toBeChecked();
    await page.screenshot({ path: `/private/tmp/clinical-edge-slice3-review-${width}.png`, animations: 'disabled' });
    await page.getByRole('button', { name: 'Confirm reassessment' }).click();
    const evidence = page.getByRole('region', { name: 'Reassessment evidence' });
    await expect(evidence).toContainText('86/48 → 94/56');
    await expect(evidence).toContainText('118 → 106');
    await expect(evidence).toContainText('15 mL over 1 hour');
    await expect(page.getByRole('button', { name: 'Prepare SBAR' })).toBeVisible();
    const elapsed = Date.now() - started;
    console.log(JSON.stringify({ benchmark: 'reassessment-ui', width, durationMs: elapsed, includesExtraContinuityInterruptions: true, realProviderCalls: 0 }));
    test.info().annotations.push({ type: 'automated_reassessment_ui_ms', description: String(elapsed) });
    await evidence.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `/private/tmp/clinical-edge-slice3-evidence-${width}.png`, animations: 'disabled' });
    await page.getByRole('link', { name: 'Check medication' }).click();
    await expect(page.getByText('Shift Brain active')).toBeVisible();
    await page.getByRole('link', { name: /Return/ }).click();
    await expect(evidence).toContainText('86/48 → 94/56');
    await page.getByRole('button', { name: 'Prepare SBAR' }).click();
    await expect(page.getByRole('heading', { name: 'Situation', exact: true })).toBeVisible();
    expect(bodies).toHaveLength(3);
    expect(bodies[1].reassessmentRequest).toBe(true);
    expect(bodies[1].question).not.toContain('108/64');
    expect(bodies[2].reassessmentRequest).toBe(true);
    expect(bodies[2].previousAssessment).toContain('86/48');
    expect(bodies[2].question).toContain('amount 15 mL over 1 hour');
    const storage = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage }, history: history.state, url: location.href }));
    expect(storage).not.toContain('94/56');
    expect(analytics.join(' ')).not.toContain('94/56');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'New Snapshot', exact: true }).click();
    await expect(evidence).toHaveCount(0);
    await page.getByLabel('Nurse narrative').fill(update);
    await page.reload();
    await page.getByRole('button', { name: "Describe what's happening", exact: true }).click();
    await expect(page.getByLabel('Nurse narrative')).toHaveValue('');
    expect(errors).toEqual([]);
  });
}
