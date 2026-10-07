import { test, expect, type Page } from '@playwright/test';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { prepareSnapshotAnswer, snapshotPresentation } = require('../../backend/ask-snapshot-reasoning.js');
const target = 'Patient is on epi, vaso, and levo, the CI is 1.5. What’s going on?';

async function enterSnapshot(page: Page, complete = false) {
  await page.goto('/copilot');
  await page.getByRole('button', { name: 'Add finding', exact: false }).click();
  await page.getByRole('dialog').getByRole('button', { name: /Hemodynamics/ }).click();
  await page.getByLabel('CI current', { exact: true }).fill('1.5');
  if (complete) {
    await page.getByLabel('CVP current', { exact: true }).fill('10');
    await page.getByLabel('MAP current', { exact: true }).fill('66');
    await page.getByLabel('Urine output amount', { exact: true }).fill('20');
    await page.getByLabel('Urine output interval', { exact: true }).fill('1');
    await page.getByLabel('Other relevant context', { exact: false }).fill('Post-CABG. Unrelated content stays local.');
  }
  await page.getByRole('button', { name: 'Add finding', exact: false }).click();
  await page.getByRole('dialog').getByRole('button', { name: /^Drips/ }).click();
  for (const [i, medication] of ['epinephrine', 'vasopressin', 'norepinephrine'].entries()) {
    await page.getByRole('button', { name: 'Add drip', exact: false }).click();
    await page.locator('.snapshot-repeatable fieldset').nth(i).getByLabel('Medication', { exact: true }).fill(medication);
  }
  await page.getByRole('button', { name: 'Confirm Snapshot for Ask', exact: false }).click();
  await expect(page.getByLabel('Use confirmed Patient Snapshot')).toBeEnabled();
  await expect(page.getByLabel('Use confirmed Patient Snapshot')).not.toBeChecked();
}
async function mockAsk(page: Page, bodies: any[]) {
  await page.route('**/api/**', async route => {
    if (!route.request().url().endsWith('/api/ask')) throw new Error('Unexpected clinical operation');
    const body = route.request().postDataJSON(); bodies.push(body);
    if (body.contextMode === 'snapshot') {
      const p = await prepareSnapshotAnswer(body.question, body.snapshotContext);
      return route.fulfill({ json: snapshotPresentation(p, p.eligible.slice(0, 2), 'model_selected') });
    }
    return route.fulfill({ json: { contextMode: 'general', answer: 'This is general nursing education without any Patient Snapshot context.', details: [] } });
  });
}
for (const width of [320, 390, 430, 1280]) test(`confirmed Snapshot → Ask is explicit, bounded and memory-only at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  const bodies: any[] = [], errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await mockAsk(page, bodies); await enterSnapshot(page, true);
  await page.getByLabel('Nursing question').fill(target);
  await page.getByLabel('Use confirmed Patient Snapshot').check();
  await expect(page.locator('.ce-ask-context').first()).toContainText('Using Patient Snapshot');
  await page.getByRole('button', { name: 'Ask Clinical Edge', exact: false }).click();
  await expect(page.locator('.ce-ask-direct')).toContainText('low forward flow');
  await expect(page.locator('.ce-ask-answer-mode')).toHaveText('Using Patient Snapshot');
  const packet = bodies[0].snapshotContext;
  expect(packet.facts.find((f: any) => f.key === 'ci').current).toBe('1.5');
  for (const name of ['epinephrine', 'vasopressin', 'norepinephrine']) expect(JSON.stringify(packet)).toContain(name);
  expect(JSON.stringify(packet)).not.toContain('Unrelated content'); expect(bodies).toHaveLength(1);
  await page.getByText('REPORTED · Information used', { exact: true }).click();
  await expect(page.locator('.ce-ask-answer')).toContainText('20 mL');
  await expect(page.locator('.ce-ask-answer')).not.toContainText('cardiogenic shock');
  const toggle = await page.getByLabel('Use confirmed Patient Snapshot').locator('..').boundingBox(); expect(toggle!.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  const output = await page.locator('.ce-ask-answer').boundingBox(), dock = await page.getByRole('navigation', { name: 'Clinical Edge workspace' }).boundingBox();
  expect(output!.y + output!.height).toBeLessThanOrEqual(dock!.y);
  const persisted = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage }, url: location.href, history: history.state }));
  for (const text of ['epinephrine', 'Post-CABG', target, 'low forward flow']) expect(persisted).not.toContain(text);
  expect(errors).toEqual([]);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: `/private/tmp/clinical-edge-snapshot-ask-${width}.png`, fullPage: true });
  await page.screenshot({ path: `/private/tmp/clinical-edge-snapshot-ask-${width}-input.png` });
  await page.locator('.ce-ask-answer').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `/private/tmp/clinical-edge-snapshot-ask-${width}-answer.png` });
  await page.reload(); await expect(page.getByLabel('Use confirmed Patient Snapshot')).toBeDisabled(); await expect(page.locator('.ce-ask-answer')).toHaveCount(0);
});
test('disabled context and irrelevant questions omit the packet entirely', async ({ page }) => {
  const bodies: any[] = []; await mockAsk(page, bodies); await enterSnapshot(page);
  await page.getByLabel('Nursing question').fill(target); await page.getByRole('button', { name: 'Ask Clinical Edge', exact: false }).click();
  await expect(page.locator('.ce-ask-answer')).toBeVisible(); expect(bodies[0]).toEqual({ question: target, contextMode: 'general' });
  await page.getByLabel('Use confirmed Patient Snapshot').check(); await page.getByLabel('Nursing question').fill('What is a sterile field?');
  await expect(page.locator('.ce-ask-context').first()).toContainText('No relevant Snapshot facts');
  await page.getByRole('button', { name: 'Ask Clinical Edge', exact: false }).click();
  await expect(page.locator('.ce-ask-answer-mode')).toHaveText('General Ask'); expect(bodies[1]).toEqual({ question: 'What is a sterile field?', contextMode: 'general' });
});
test('editing confirmed form invalidates old context and hides stale patient answer', async ({ page }) => {
  const bodies: any[] = []; await mockAsk(page, bodies); await enterSnapshot(page);
  await page.getByLabel('Use confirmed Patient Snapshot').check(); await page.getByLabel('Nursing question').fill(target);
  await page.getByRole('button', { name: 'Ask Clinical Edge', exact: false }).click(); await expect(page.locator('.ce-ask-answer')).toBeVisible();
  const dock = page.getByRole('navigation', { name: 'Clinical Edge workspace' });
  await dock.getByRole('link', { name: 'Shift Brain', exact: true }).click(); await page.getByLabel('CI current', { exact: true }).fill('3.5');
  await dock.getByRole('link', { name: 'Ask', exact: true }).click();
  await expect(page.getByLabel('Use confirmed Patient Snapshot')).toBeDisabled(); await expect(page.locator('.ce-ask-answer')).toHaveCount(0); expect(bodies).toHaveLength(1);
});
test('Snapshot gas uses authoritative ABG calculation through the actual form and Ask UI', async ({ page }) => {
  const bodies: any[] = []; await mockAsk(page, bodies);
  await page.goto('/copilot');
  await page.getByLabel('Other relevant context', { exact: false }).fill('Arterial ABG: pH 7.29, PaCO2 55 mmHg, HCO3 26 mmol/L.\nUnrelated narrative remains local.');
  await page.getByRole('button', { name: 'Confirm Snapshot for Ask', exact: false }).click();
  await page.getByLabel('Use confirmed Patient Snapshot').check(); await page.getByLabel('Nursing question').fill('Explain this ABG');
  await page.getByRole('button', { name: 'Ask Clinical Edge', exact: false }).click();
  await expect(page.getByRole('heading', { name: 'CALCULATED · ABG rule check', exact: true })).toBeVisible();
  await expect(page.locator('.ce-ask-answer')).toContainText('7.29');
  expect(JSON.stringify(bodies[0].snapshotContext)).not.toContain('Unrelated narrative'); expect(bodies).toHaveLength(1);
});
test('rich synthesis stays focused while exact ABG calculations remain available on disclosure', async ({ page }) => {
  const bodies: any[] = []; await mockAsk(page, bodies); await enterSnapshot(page, true);
  const dock = page.getByRole('navigation', { name: 'Clinical Edge workspace' });
  await dock.getByRole('link', { name: 'Shift Brain', exact: true }).click();
  await page.getByLabel('Other relevant context', { exact: false }).fill('Post-CABG.\nArterial ABG: pH 7.29, PaCO2 55 mmHg, HCO3 26 mmol/L.');
  await page.getByRole('button', { name: 'Confirm Snapshot for Ask', exact: false }).click();
  await page.getByLabel('Use confirmed Patient Snapshot').check(); await page.getByLabel('Nursing question').fill(target);
  await page.getByRole('button', { name: 'Ask Clinical Edge', exact: false }).click();
  await expect(page.locator('.ce-ask-direct')).toContainText('CI 1.5');
  await expect(page.locator('.ce-ask-direct')).toContainText('MAP 66');
  await expect(page.locator('.ce-ask-detail')).toContainText(['Filling versus pump performance', 'Pressure support versus forward flow']);
  await expect(page.getByRole('heading', { name: 'ABG interpretation', exact: true })).not.toBeVisible();
  await page.getByText('CALCULATED · ABG rule check', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'ABG interpretation', exact: true })).toBeVisible();
  await expect(page.locator('.ce-ask-abg')).toContainText('7.29'); expect(bodies).toHaveLength(1);
});
