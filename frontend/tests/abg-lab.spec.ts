import { test, expect, type Page } from '@playwright/test';
import { interpretABG, normalizeFio2, validateABGInput } from '../src/modules/abg-lab/abgRules.js';

const gas = (paco2 = 40, hco3 = 24, rest = {}) => ({ pH: Number((6.1 + Math.log10(hco3 / (0.03 * paco2))).toFixed(2)), paco2, hco3, ...rest });
for (const [co2, bicarb, expected] of [
  [58, 27, 'Respiratory acidosis'], [26, 12, 'Metabolic acidosis'],
  [28, 21, 'Respiratory alkalosis'], [47, 34, 'Metabolic alkalosis'],
  [50, 18, 'Mixed: respiratory + metabolic acidosis'], [30, 28, 'Mixed: respiratory + metabolic alkalosis'],
] as const) test(`coherent synthetic ${expected} example`, () => {
  const r = interpretABG(gas(co2, bicarb));
  expect(r.disorder).toBe(expected);
  expect(r.oxygenation).toBeNull();
  expect(r.steps).toHaveLength(3);
});

test('response teaching compares directions without formula estimates or confirming adequate compensation', () => {
  for (const [co2, bicarb] of [[58, 27], [26, 12], [28, 21], [47, 34], [30, 12], [16, 8], [65, 60]]) {
    const r = interpretABG(gas(co2, bicarb));
    expect(r.compensationCheck).toMatchObject({ kind: 'direction', answer: 'opposing' });
    expect(r.compensationCheck.note).toContain('cannot confirm adequate compensation');
    expect(JSON.stringify(r)).not.toMatch(/Winter|formula|acute estimate|chronic estimate|expected PaCO₂/i);
  }
  const normalOther = interpretABG(gas(40, 21)).compensationCheck;
  expect(normalOther.answer).toBe('in-range');
  expect(normalOther.summary).toContain('No out-of-range change');
  expect(normalOther.note).toContain('cannot confirm');
});
for (const [paco2, hco3, direction] of [[50, 18, 'down'], [30, 28, 'up']] as const) test(`mixed pattern teaches both values push pH ${direction}`, () => {
  const r = interpretABG(gas(paco2, hco3));
  expect(r.compensationCheck).toMatchObject({ kind: 'mixed', answer: 'same' });
  expect(r.compensation).toContain(`both push pH ${direction}`);
  expect(r.compensationCheck.note).toContain('more than one primary process');
});
test('near-normal pH with one or both abnormal values does not imply that both are abnormal or compensation is proven', () => {
  for (const values of [{ pH: 7.4, paco2: 50, hco3: 24 }, { pH: 7.38, paco2: 60, hco3: 34 }]) {
    const r = interpretABG(values);
    expect(r.disorder).toBe('Compensated or mixed pattern possible');
    expect(r.compensation).not.toContain('both');
    expect(r.compensationCheck.kind).toBe('context');
  }
});
test('reference-range boundaries, mixed and unclear patterns remain cautious', () => {
  for (const pH of [7.35, 7.45]) expect(interpretABG({ pH, paco2: 40, hco3: 24 }).phStatus).toBe('near-normal');
  expect(interpretABG({ pH: 7.349, paco2: 40, hco3: 24 }).steps[0]).toContain('7.349');
  expect(interpretABG({ pH: 7.3, paco2: 40, hco3: 24 }).disorder).toContain('unclear');
  expect(interpretABG(gas()).disorder).toBe('Values within reference ranges');
});
for (const value of ['', null, undefined]) test(`optional FiO2 ${String(value)} stays absent`, () => {
  expect(normalizeFio2(value)).toBeNull();
});
for (const [input, normalized] of [[0.21, 0.21], [21, 0.21], [0.4, 0.4], [40, 0.4], [1, 1], [100, 1]]) test(`FiO2 ${input} normalizes to ${normalized}`, () => {
  expect(normalizeFio2(input)).toBe(normalized);
});
for (const input of [0, 0.2, 1.1, 2, 20, 101, Infinity, NaN, '40junk']) test(`invalid FiO2 ${input} cannot yield a ratio`, () => {
  expect(validateABGInput(gas(40, 24, { fio2: input }))).toContain('FiO₂');
  expect(() => interpretABG(gas(40, 24, { fio2: input }))).toThrow();
});
test('oxygenation requires the right inputs, normalizes percent, and never diagnoses ARDS', () => {
  const a = interpretABG(gas(40, 24, { pao2: 80, fio2: 0.4 })).oxygenation;
  expect(a).toEqual(interpretABG(gas(40, 24, { pao2: 80, fio2: 40 })).oxygenation);
  expect(a).toMatchObject({ pf: 200, formula: '40% = 0.4. 80 ÷ 0.4 = 200' });
  expect(a.note).toContain('does not diagnose ARDS');
  expect(interpretABG(gas(40, 24, { pao2: 80 })).oxygenation).toMatchObject({ pf: null, note: expect.stringContaining('Room air is not assumed') });
  expect(interpretABG(gas(40, 24, { fio2: 40 })).oxygenation).toMatchObject({ pf: null, pao2: null });
  for (const [pao2, label] of [[120, 'P/F over 200 through 300'], [80, 'P/F over 100 through 200'], [40, 'P/F 100 or below']]) {
    expect(interpretABG(gas(40, 24, { pao2, fio2: 40 })).oxygenation.pfLabel).toBe(label);
  }
});
test('required and optional inputs reject nonfinite, missing, and out-of-bound numbers', () => {
  for (const bad of [{ pH: '' }, { paco2: Infinity }, { hco3: NaN }, { hco3: 0 }, { pao2: '72oops' }, { pao2: -1 }]) {
    expect(validateABGInput({ ...gas(), ...bad })).not.toBeNull();
  }
});

async function bottomClearance(page: Page, selector: string) {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(async () => page.locator(selector).evaluate(el => {
    const r = el.getBoundingClientRect();
    const dock = document.querySelector('.ce-tool-dock')!.getBoundingClientRect();
    return r.bottom <= dock.top - 16 && r.top >= 0;
  })).toBe(true);
  const r = await page.locator(selector).boundingBox();
  expect(r).not.toBeNull();
  expect(await page.locator(selector).evaluate(el => {
    const r = el.getBoundingClientRect();
    return el.contains(document.elementFromPoint(r.left + r.width / 2, r.bottom - 2));
  })).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
for (const [width, height] of [[375, 667], [390, 844], [768, 1024], [1280, 800], [390, 420]]) test(`entry, examples and manually entered results clear dock at ${width}x${height}`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => document.documentElement.style.setProperty('--ce-safe-bottom', '34px')));
  await page.goto('/abg-lab');
  await bottomClearance(page, '.abg-btn-primary');
  if (width === 390 && height === 844) await page.screenshot({ path: testInfo.outputPath('entry-scroll.png') });
  await page.getByRole('button', { name: 'Metabolic acidosis', exact: true }).click();
  await expect(page.getByRole('region', { name: 'ABG interpretation' })).toBeFocused();
  await bottomClearance(page, '.abg-safety');
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  for (const [id, value] of [['abg-ph', '7.28'], ['abg-paco2', '26'], ['abg-hco3', '12'], ['abg-pao2', '80'], ['abg-fio2', '40']]) await page.locator(`#${id}`).fill(value);
  await page.locator('#abg-fio2').press('Enter');
  await expect(page.getByRole('heading', { name: 'Pattern Summary' })).toBeVisible();
  await bottomClearance(page, '.abg-safety');
  if (width === 390 && height === 844) await page.screenshot({ path: testInfo.outputPath('results-scroll.png') });
});
for (const width of [390, 1280]) test(`predict-and-reveal walkthrough explains numbers and resets at ${width}px`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/abg-lab');
  await page.getByRole('button', { name: 'Metabolic acidosis', exact: true }).click();
  const walk = page.locator('.abg-walkthrough');
  await walk.locator('summary').first().click();
  await walk.getByRole('button', { name: 'Alkaline side', exact: true }).click();
  await expect(walk.getByRole('status')).toContainText('Follow this clue · Acid side');
  await expect(walk.getByRole('status')).not.toContainText('You spotted it');
  await walk.getByRole('button', { name: 'Acid side', exact: true }).click();
  await expect(walk.getByRole('status')).toContainText('You spotted it');
  await walk.getByRole('button', { name: 'Next clue →' }).click();
  await walk.getByRole('button', { name: 'HCO₃', exact: true }).click();
  await expect(walk.getByRole('status')).toContainText('HCO₃ 12');
  await walk.getByRole('button', { name: 'Next clue →' }).click();
  await expect(walk).toContainText('PaCO₂ 26 mmHg');
  await walk.getByRole('button', { name: 'Same pH effect', exact: true }).click();
  await expect(walk.getByRole('status')).toContainText('Follow this clue · Opposing pH effects');
  await walk.getByRole('button', { name: 'Opposing pH effects', exact: true }).click();
  await expect(walk.getByRole('status')).toContainText('You spotted it');
  await expect(walk.getByRole('status')).toContainText('pushes pH up');
  await expect(walk.getByRole('status')).toContainText('cannot confirm adequate compensation');
  await expect(page.locator('.abg-result')).not.toContainText(/Winter|formula|acute estimate|chronic estimate/i);
  await walk.evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 80));
  await page.screenshot({ path: testInfo.outputPath('walkthrough-compensation.png') });
  await walk.getByRole('button', { name: 'Next clue →' }).click();
  await expect(walk).toContainText('Room air is not assumed');
  await page.getByRole('button', { name: 'Respiratory acidosis', exact: true }).click();
  await expect(walk).not.toHaveAttribute('open');
  await walk.locator('summary').first().press('Enter');
  await expect(walk.getByRole('button', { name: '1. Check pH' })).toHaveAttribute('aria-pressed', 'true');
  await expect(walk.getByRole('status')).toHaveCount(0);
});
test('invalid FiO2 is explained and correction removes stale results', async ({ page }) => {
  await page.goto('/abg-lab');
  await page.getByRole('button', { name: 'Metabolic acidosis', exact: true }).click();
  await page.locator('#abg-fio2').fill('2');
  await expect(page.locator('.abg-result')).toHaveCount(0);
  await page.getByRole('button', { name: 'Interpret ABG' }).click();
  await expect(page.getByRole('alert')).toContainText('0.21–1.0');
  await page.locator('#abg-fio2').fill('0.40');
  await page.getByRole('button', { name: 'Interpret ABG' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.locator('.abg-oxy-cell-value').last()).toHaveText('220');
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await page.waitForTimeout(150);
  await expect(page.locator('.abg-result')).toHaveCount(0);
});

test('near-normal pH walkthrough asks for context rather than declaring a primary process', async ({ page }) => {
  await page.goto('/abg-lab');
  for (const [id, value] of [['abg-ph', '7.4'], ['abg-paco2', '50'], ['abg-hco3', '30']]) await page.locator(`#${id}`).fill(value);
  await page.getByRole('button', { name: 'Interpret ABG' }).click();
  const walk = page.locator('.abg-walkthrough');
  await walk.locator('summary').first().click();
  await walk.getByRole('button', { name: '2. Find the clue', exact: true }).click();
  await expect(walk.getByRole('heading')).toHaveText('Can pH alone identify the primary process?');
  await walk.getByRole('button', { name: 'Need more context', exact: true }).click();
  await expect(walk.getByRole('status')).toContainText('You spotted it');
  await expect(walk.getByRole('status')).toContainText('does not establish a primary process');
  await walk.getByRole('button', { name: 'Next clue →' }).click();
  await walk.getByRole('button', { name: 'Need more context', exact: true }).click();
  await expect(walk.getByRole('status')).toContainText('pH alone cannot tell them apart');
});
test('oxygenation step explains FiO2 conversion and keeps P/F calculation separate', async ({ page }) => {
  await page.goto('/abg-lab');
  for (const [id, value] of [['abg-ph', '7.4'], ['abg-paco2', '40'], ['abg-hco3', '24'], ['abg-pao2', '80'], ['abg-fio2', '40']]) await page.locator(`#${id}`).fill(value);
  await page.getByRole('button', { name: 'Interpret ABG' }).click();
  const walk = page.locator('.abg-walkthrough');
  await walk.locator('summary').first().click();
  await walk.getByRole('button', { name: '4. Oxygenation', exact: true }).click();
  await expect(walk).toContainText('answers a different question');
  await walk.getByText('Reveal the P/F calculation', { exact: true }).click();
  await expect(walk).toContainText('40% = 0.4');
  await expect(walk).toContainText('80 ÷ 0.4 = 200');
});
