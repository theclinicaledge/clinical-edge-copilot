import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { routeABG } = require('../../backend/ask-abg-engine');
const { prepareSnapshotAnswer, snapshotPresentation } = require('../../backend/ask-snapshot-reasoning');
const { retrieveEvidence, sourceMetadata } = require('../../backend/ask-evidence');
const baseline = process.env.CE_VISUAL_BASELINE === '1';
const output = process.env.CE_VISUAL_OUTPUT || '/private/tmp/ce-ask-ux-20261007/after';
mkdirSync(output, { recursive: true });

// Synthetic presentation fixtures, not model output or clinical evaluation.
// The Foley excerpt is supplied in the UX brief; the full original was unavailable.
const foleyQuestion = 'The foley isn’t draining and I tried flushing/irrigating it';
const foley = { contextMode: 'general', answer: 'A full bladder supports a drainage problem rather than simply low urine production.', details: [
  { heading: 'Why it matters', text: 'A full bladder supports a drainage problem rather than simply low urine production.' },
  { heading: 'What changes interpretation', text: 'A full bladder supports a drainage problem rather than simply low urine production.' },
  { heading: 'At the bedside', text: '- Check bladder distention / bladder scan. A full bladder supports a drainage problem rather than simply low urine production.' },
], evidence: { status: 'not_source_grounded', requiresVerification: false } };
const respiratory = 'Oxygen saturation describes hemoglobin oxygenation, not carbon dioxide clearance. Supplemental oxygen can preserve saturation despite inadequate ventilation.\n\nAssess respiratory effort and mental status alongside available carbon dioxide measurements; no single oxygen saturation establishes adequate ventilation.';
const long = { contextMode: 'general', answer: respiratory, details: [
  { heading: 'Why it matters', text: respiratory },
  { heading: 'What changes interpretation', text: 'Recognition time may differ from onset. Missing history, exposures, examinations, comparisons and measurements remain unknown, never normal or absent.' },
  { heading: 'At the bedside', text: '- Assess respiratory effort and mental status alongside available carbon dioxide measurements; no single oxygen saturation establishes adequate ventilation.\n- Clarify baseline and recognition timing; focused neurologic findings, available glucose and medication/ventilation context can separate possibilities. Several contributors may coexist.' },
], evidence: { status: 'not_source_grounded', requiresVerification: false } };

for (const width of [320, 390, 430, 1280]) test(`Home Ask CTA is full width, keyboard accessible and preserves Shift Brain at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  await page.route('**/api/**', () => { throw new Error('Home navigation must not submit clinical data'); });
  await page.goto('/');
  const cta = page.locator('.ce-home-ask');
  await expect(cta).toHaveAttribute('href', '/ask');
  await expect(cta).toContainText('Get answers to your nursing questions.');
  const box = await cta.boundingBox(), main = await page.locator('.ce-command-home__main').evaluate(el => ({ width: el.clientWidth, padding: parseFloat(getComputedStyle(el).paddingLeft) + parseFloat(getComputedStyle(el).paddingRight) }));
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(Math.abs(box!.width - (main.width - main.padding))).toBeLessThan(2);
  expect(await cta.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(10, 191, 188)');
  const shift = await page.locator('.ce-command-home__work').boundingBox(); expect(shift!.y).toBeGreaterThan(box!.y + box!.height);
  await expect(page.getByRole('heading', { name: 'Something changed.' })).toBeVisible();
  await page.screenshot({ path: `${output}/home-cta-${width}.png` });
  await cta.focus(); await cta.press('Enter');
  await expect(page).toHaveURL(/\/ask$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const width of [320, 390, 430, 1280]) test(`Ask presentation, text fidelity and dock lane at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  let response: any = foley;
  const bodies: any[] = [];
  await page.route('**/api/**', route => { expect(route.request().url()).toContain('/api/ask'); bodies.push(route.request().postDataJSON()); return route.fulfill({ json: response }); });
  await page.goto('/ask');
  await page.screenshot({ path: `${output}/input-empty-${width}.png` });
  if (!baseline) {
    await expect(page.getByText('No Snapshot selected', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Use confirmed Patient Snapshot')).toHaveCount(0);
    const create = await page.getByRole('button', { name: /Create Snapshot/ }).boundingBox(); expect(create!.height).toBeGreaterThanOrEqual(44);
  }
  await page.getByLabel('Nursing question').fill(foleyQuestion);
  await page.getByRole('button', { name: 'Ask Clinical Edge' }).click();
  await expect(page.locator('.ce-ask-answer')).toBeVisible();
  if (!baseline) expect(await page.locator('.ce-ask-detail h3').allTextContents()).toEqual(['At the bedside', 'What changes interpretation', 'Why it matters']);
  for (const detail of foley.details) await expect(page.locator('.ce-ask-detail').filter({ has: page.getByRole('heading', { name: detail.heading, exact: true }) })).toContainText(detail.text.replace(/^- /, ''));
  await page.locator('.ce-ask-answer').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${output}/foley-excerpt-${width}.png` });
  response = { contextMode: 'general', answer: 'Oxygen saturation describes hemoglobin oxygenation, not carbon dioxide clearance.', details: [], evidence: { status: 'not_source_grounded', requiresVerification: false } };
  await page.getByLabel('Nursing question').fill('What does oxygen saturation tell me?');
  await page.getByRole('button', { name: 'Ask Clinical Edge' }).click();
  await expect(page.locator('.ce-ask-direct')).toContainText('hemoglobin');
  await page.locator('.ce-ask-answer').scrollIntoViewIfNeeded(); await page.screenshot({ path: `${output}/general-short-${width}.png` });
  response = long;
  await page.getByLabel('Nursing question').fill('Why can oxygen saturation look normal while ventilation is inadequate?');
  await page.getByRole('button', { name: 'Ask Clinical Edge' }).click(); await expect(page.locator('.ce-ask-detail')).toHaveCount(3);
  await page.locator('.ce-ask-answer').scrollIntoViewIfNeeded(); await page.screenshot({ path: `${output}/general-long-${width}.png` });
  const height = await page.locator('.ce-ask-answer').evaluate(el => el.getBoundingClientRect().height);
  writeFileSync(`${output}/metrics-${width}.json`, JSON.stringify({ width, height }));
  await test.info().attach('answer-height', { body: JSON.stringify({ width, height }), contentType: 'application/json' });
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  const answer = await page.locator('.ce-ask-answer').boundingBox(), dock = await page.getByRole('navigation', { name: 'Clinical Edge workspace' }).boundingBox();
  expect(answer!.y + answer!.height).toBeLessThan(dock!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (!baseline) {
    const readingBoundary = await page.locator('.ce-ask-page').evaluate(el => innerHeight - parseFloat(getComputedStyle(el, '::after').height));
    expect(answer!.y + answer!.height).toBeLessThan(readingBoundary);
    expect(await page.locator('.ce-ask-direct p').first().evaluate(el => getComputedStyle(el).fontSize)).toBe(width <= 720 ? '14px' : '16px');
  }
  await page.screenshot({ path: `${output}/long-footer-clearance-${width}.png` });
  expect(bodies.every(body => body.contextMode === 'general' && !('snapshotContext' in body))).toBe(true);
  response = { contextMode: 'general', answer: 'LVEDP is pressure at the end of ventricular filling, not a direct fluid-volume measurement.', details: [], evidence: sourceMetadata(retrieveEvidence('Explain LVEDP')) };
  await page.getByLabel('Nursing question').fill('Explain LVEDP'); await page.getByRole('button', { name: 'Ask Clinical Edge' }).click();
  await expect(page.getByLabel('Evidence boundary')).toContainText('provided before generation');
  await expect(page.getByLabel('Evidence boundary').getByRole('link').first()).toBeVisible();
  await page.locator('.ce-ask-answer').scrollIntoViewIfNeeded(); await page.screenshot({ path: `${output}/grounded-${width}.png` });
  const gas = 'Arterial ABG: pH 7.22, PaCO2 30 mmHg, HCO3 12 mmol/L. What does it mean?';
  response = { contextMode: 'general', answer: routeABG(gas).summary, abg: routeABG(gas), details: [], evidence: { status: 'deterministic_rules', sources: [] } };
  await page.getByLabel('Nursing question').fill(gas); await page.getByRole('button', { name: 'Ask Clinical Edge' }).click();
  await expect(page.locator('.ce-ask-abg')).toContainText(/24\s*–\s*28 mmHg/);
  await expect(page.getByLabel('Evidence boundary')).toContainText('not generated or independently verified by the AI');
  await page.locator('.ce-ask-answer').scrollIntoViewIfNeeded(); await page.screenshot({ path: `${output}/abg-${width}.png` });
  await page.goto('/');
  await page.mouse.move(0, 0);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(document.getAnimations().filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {})));
  });
  await page.screenshot({ path: `${output}/home-${width}.png` });
});

test('loading and cancellation remain one accessible interaction', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let calls = 0, release: (() => void) | undefined;
  await page.route('**/api/**', async route => { calls++; await new Promise<void>(resolve => { release = resolve; }); await route.fulfill({ json: long }).catch(() => {}); });
  await page.goto('/ask'); await page.getByLabel('Nursing question').fill('Why can oxygen saturation be misleading?');
  await page.getByRole('button', { name: 'Ask Clinical Edge' }).click();
  await expect(page.getByRole('status')).toContainText('Preparing');
  await expect(page.getByRole('button', { name: 'Ask Clinical Edge' })).toBeDisabled();
  await page.screenshot({ path: `${output}/loading-390.png` });
  const cancel = page.getByRole('button', { name: 'Cancel question' });
  if (!baseline) { await expect(cancel).toHaveText('Cancel'); const box = await cancel.boundingBox(); expect(box!.height).toBeGreaterThanOrEqual(44); }
  await cancel.click(); release?.();
  await expect(page.getByRole('alert')).toContainText('Request cancelled');
  await expect(page.getByLabel('Nursing question')).toHaveValue('Why can oxygen saturation be misleading?');
  expect(calls).toBe(1);
});

test('confirmed Snapshot stays opt-in with unchanged code-owned provenance', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const bodies: any[] = [];
  await page.route('**/api/**', async route => {
    const body = route.request().postDataJSON(); bodies.push(body);
    expect(route.request().url()).toContain('/api/ask');
    const prepared = await prepareSnapshotAnswer(body.question, body.snapshotContext);
    return route.fulfill({ json: snapshotPresentation(prepared, prepared.eligible.slice(0, 2), 'model_selected') });
  });
  await page.goto('/copilot');
  await page.getByLabel('MAP current', { exact: true }).fill('66'); await page.getByLabel('Heart rate current', { exact: true }).fill('96');
  await page.getByLabel('Other relevant context', { exact: false }).fill('Post-CABG.\nArterial ABG: pH 7.29, PaCO2 55 mmHg, HCO3 26 mmol/L.');
  await page.getByRole('button', { name: /Add finding/ }).click(); await page.getByRole('dialog').getByRole('button', { name: /Hemodynamics/ }).click();
  await page.getByLabel('CI current', { exact: true }).fill('1.5'); await page.getByLabel('CVP current', { exact: true }).fill('10');
  await page.getByRole('button', { name: /Confirm Snapshot for Ask/ }).click();
  await expect(page.getByLabel('Use confirmed Patient Snapshot')).not.toBeChecked();
  await page.screenshot({ path: `${output}/input-available-390.png` });
  await page.getByLabel('Use confirmed Patient Snapshot').check(); await page.getByLabel('Nursing question').fill('CI is 1.5. What should I understand about forward flow?');
  await page.getByRole('button', { name: 'Ask Clinical Edge' }).click(); await expect(page.locator('.ce-ask-answer')).toBeVisible();
  await expect(page.locator('.ce-ask-answer')).toContainText('Possibilities, not a diagnosis');
  await expect(page.locator('.ce-ask-answer')).toContainText('AI-selected reference explanation');
  await page.locator('.ce-ask-answer').scrollIntoViewIfNeeded(); await page.screenshot({ path: `${output}/snapshot-390.png` });
  expect(bodies).toHaveLength(1);
  // Simulate the larger bottom inset while keeping the shared clearance relationship.
  await page.addStyleTag({ content: '#root { --ce-dock-clearance: 152px; } .ce-tool-dock { bottom: 34px; }' });
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  const answer = await page.locator('.ce-ask-answer').boundingBox(), dock = await page.getByRole('navigation', { name: 'Clinical Edge workspace' }).boundingBox();
  expect(answer!.y + answer!.height).toBeLessThan(dock!.y);
  if (!baseline) expect(answer!.y + answer!.height).toBeLessThan(await page.locator('.ce-ask-page').evaluate(el => innerHeight - parseFloat(getComputedStyle(el, '::after').height)));
  await page.screenshot({ path: `${output}/snapshot-safe-area-390.png` });
});
