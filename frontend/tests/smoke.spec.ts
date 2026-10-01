import { test, expect } from '@playwright/test';
import { extractRapidCapture, validateExtractionContract } from '../src/components/rapidCaptureExtractor.js';
import { serializePatientSnapshot } from '../src/components/patientSnapshotModel.js';

const GROUNDED_TEST_PRIORITY_MAP = `Urgency Level: MODERATE

**Priorities**
### 1 · Reported perfusion change
Relevance: Important
Observed:
- A blood-pressure value was reported
Interpretation: The cause is not established.
Assess now:
- Focused reassessment

**Assess first**
- Focused reassessment

**Possible patterns**
- Several contributors remain possible

**Missing information**
- Additional trend context

**Monitor and trend**
- Direction of change

**Escalation triggers**
- Worsening clinical status

**SBAR-ready summary**
A perfusion change was reported.

**Teach me why**
Trends add context without establishing a diagnosis.`;

test.beforeEach(async ({ page }) => {
  // Fresh browser storage so saved-case/prefill state cannot leak between tests.
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

async function addFinding(page, name: RegExp | string) {
  await page.getByRole('button', { name: 'Add finding' }).click();
  await page.getByRole('dialog', { name: 'Add a finding' }).getByRole('button', { name }).click();
}

async function addEarlierValue(page, label: string) {
  const field = page.getByRole('group', { name: new RegExp(`^${label}`) });
  await field.getByRole('button', { name: '+ Earlier' }).click();
}

const RAPID_BENCHMARK = "BP dropped from 108/64 to 86/48, MAP 61. HR went from 92 to 118. RR is 27. SpO2 dropped from 95% to 92% and oxygen increased from 2 L nasal cannula to 4 L nasal cannula. Patient is more drowsy, extremities are cool and cap refill is delayed. Urine output was 20 mL over the last hour. Lactate went from 2.0 to 4.1 and creatinine 1.1 to 1.6. Norepinephrine is running but I don't have the dose. CVP went from 8 to 5 and cardiac index from 2.3 to 1.8. Chest tube output was 35 mL during the most recent hour.";

test('Rapid Capture deterministically extracts the ICU benchmark without inventing units, timing, dose, or trends', () => {
  const result = extractRapidCapture(RAPID_BENCHMARK);
  expect(validateExtractionContract(result)).toEqual([]);
  expect(result.status).toBe('ready');
  expect(result.needsReview).toEqual([]);
  expect(result.snapshot.values).toMatchObject({
    bpEarlier: '108/64', bpNow: '86/48', mapNow: '61', hrEarlier: '92', hrNow: '118', rrNow: '27',
    spo2Earlier: '95', spo2Now: '92', oxygenEarlier: '2 L nasal cannula', oxygenNow: '4 L nasal cannula',
    loc: 'More drowsy', perfusionFindings: ['Cool / clammy', 'Delayed capillary refill'],
    urineAmount: '20', urineIntervalValue: '1', urineIntervalUnit: 'hour',
    lactateEarlier: '2.0', lactateNow: '4.1', creatinineEarlier: '1.1', creatinineNow: '1.6',
    cvpEarlier: '8', cvpNow: '5', ciEarlier: '2.3', ciNow: '1.8',
  });
  expect(result.snapshot.units).toMatchObject({ lactate: '', creatinine: '', cvp: '', ci: '' });
  expect(result.snapshot.optional.drips.items[0]).toEqual({ medication: 'Norepinephrine' });
  expect(result.snapshot.optional.drains.items[0]).toEqual({ type: 'Chest tube', currentOutput: '35 mL', outputTimeframe: 'most recent hour' });
  expect(result.snapshot.optional.drains.items[0].previousOutput).toBeUndefined();
  const serialized = serializePatientSnapshot(result.snapshot);
  expect(serialized).toContain('Lactate: previous 2.0 -> current 4.1 (unit not supplied)');
  expect(serialized).toContain('Perfusion: Cool / clammy, Delayed capillary refill');
  expect(serialized).not.toMatch(/diagnos|because|caused by|chest tube[^\n]*(?:increas|decreas)/i);
});

test('Rapid Capture routes ambiguous narrative to Needs review', () => {
  const result = extractRapidCapture('Pressure seems low and the patient looks different somehow.');
  expect(result.status).toBe('needs_review');
  expect(result.items).toHaveLength(0);
  expect(result.needsReview).toHaveLength(1);
  expect(result.snapshot.notes).toBe('');
});

test('Rapid Capture preserves unit and timing uncertainty in the extraction contract', () => {
  const result = extractRapidCapture('Lactate went from 2 to 4.1. Chest tube output was 35 mL. Norepinephrine is running.');
  expect(result.snapshot.units.lactate).toBe('');
  expect(result.snapshot.optional.drips.items[0].currentDose).toBeUndefined();
  expect(result.snapshot.optional.drains).toBeUndefined();
  expect(result.needsReview.some((entry) => entry.text.includes('Chest tube output'))).toBe(true);
});

test('confirmed extraction uses the same canonical serialization as manual structured entry', () => {
  const extracted = extractRapidCapture('BP dropped from 108/64 to 86/48. RR is 27. Urine output was 20 mL over the last hour.');
  const manual = {
    signals: ['off', 'perfusion', 'breathing', 'urine'], setting: '', contexts: [], notes: '', optional: {}, units: { bp: 'mmHg', rr: '/min' },
    values: { bpEarlier: '108/64', bpNow: '86/48', rrNow: '27', urineAmount: '20', urineIntervalValue: '1', urineIntervalUnit: 'hour' },
  };
  expect(serializePatientSnapshot(extracted.snapshot)).toBe(serializePatientSnapshot(manual));
});

test('Rapid Capture confirms an editable canonical Snapshot at 390px without a reasoning request', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let requests = 0;
  await page.route('**/api/copilot', async (route) => { requests += 1; await route.abort(); });
  await page.goto('/copilot');
  await page.getByRole('button', { name: "Describe what's happening" }).click();
  await page.getByLabel('Nurse narrative').fill(RAPID_BENCHMARK);
  await page.getByRole('button', { name: 'Structure my Snapshot' }).click();
  await expect(page.getByRole('heading', { name: 'I captured' })).toBeVisible();
  await expect(page.getByText('Cool / clammy · Delayed capillary refill')).toBeVisible();
  await expect(page.getByText('35 mL during most recent hour · single measurement')).toBeVisible();
  await expect(page.getByText('Norepinephrine · dose not provided')).toBeVisible();
  await expect(page.getByText('2.0 → 4.1 · unit not supplied')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Build my Priority Map →' })).toHaveCount(0);
  const mapRow = page.locator('.rapid-confirmation__list article').filter({ hasText: 'MAP' });
  await mapRow.getByRole('button', { name: 'Edit' }).click();
  await mapRow.getByLabel('Current').fill('62');
  await mapRow.getByRole('button', { name: 'Done' }).click();
  await expect(mapRow).toContainText('62 mmHg');
  await page.getByRole('button', { name: 'Confirm Snapshot' }).click();
  await expect(page.getByRole('heading', { name: 'Ready for Priority Map' })).toBeVisible();
  await expect(page.getByText('Now 62 mmHg')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Build my Priority Map →' })).toBeEnabled();
  expect(requests).toBe(0);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('Rapid Capture requires resolution of ambiguous text and preserves the narrative', async ({ page }) => {
  await page.goto('/copilot');
  await page.getByRole('button', { name: "Describe what's happening" }).click();
  const narrative = 'Pressure seems low and the patient looks different somehow.';
  await page.getByLabel('Nurse narrative').fill(narrative);
  await page.getByRole('button', { name: 'Structure my Snapshot' }).click();
  await expect(page.getByRole('heading', { name: 'Needs review' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirm Snapshot' })).toBeDisabled();
  await page.getByRole('button', { name: 'Back to narrative' }).click();
  await expect(page.getByLabel('Nurse narrative')).toHaveValue(narrative);
  await page.getByRole('button', { name: 'Structure my Snapshot' }).click();
  await page.getByRole('button', { name: 'Keep as context' }).click();
  await expect(page.getByRole('button', { name: 'Confirm Snapshot' })).toBeEnabled();
  await page.getByRole('button', { name: 'Confirm Snapshot' }).click();
  await expect(page.getByText(narrative)).toBeVisible();
});

test('Rapid Capture preserves narrative after a deterministic extraction failure', async ({ page }) => {
  await page.goto('/copilot');
  await page.getByRole('button', { name: "Describe what's happening" }).click();
  const narrative = `Reported detail ${'x'.repeat(6000)}`;
  await page.getByLabel('Nurse narrative').fill(narrative);
  await page.getByRole('button', { name: 'Structure my Snapshot' }).click();
  await expect(page.getByRole('alert')).toContainText('Your text is still here');
  await expect(page.getByLabel('Nurse narrative')).toHaveValue(narrative);
});

test('Rapid Capture supports delete, structured add-missing editing, and blocks duplicate extraction', async ({ page }) => {
  await page.addInitScript(() => {
    (window as typeof window & { __analyticsDebug: unknown[] }).__analyticsDebug = [];
    const original = console.debug;
    console.debug = (...args) => {
      (window as typeof window & { __analyticsDebug: unknown[] }).__analyticsDebug.push(args);
      original(...args);
    };
  });
  await page.goto('/copilot');
  await page.getByRole('button', { name: "Describe what's happening" }).click();
  await page.getByLabel('Nurse narrative').fill(RAPID_BENCHMARK);
  const extract = page.getByRole('button', { name: 'Structure my Snapshot' });
  await extract.evaluate((button) => { button.click(); button.click(); });
  await expect(page.getByRole('heading', { name: 'I captured' })).toBeVisible();
  const chestTube = page.locator('.rapid-confirmation__list article').filter({ hasText: 'Chest tube' });
  await chestTube.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('35 mL during most recent hour · single measurement')).toHaveCount(0);
  await page.getByRole('button', { name: 'Add missing finding' }).click();
  await expect(page.getByLabel('MAP current')).toHaveValue('61');
  await page.getByLabel('MAP current').fill('62');
  await page.getByRole('button', { name: 'Return to confirmation' }).click();
  await expect(page.locator('.rapid-confirmation__list article').filter({ hasText: 'MAP' })).toContainText('62 mmHg');
  const analytics = await page.evaluate(() => JSON.stringify((window as typeof window & { __analyticsDebug: unknown[] }).__analyticsDebug));
  expect((analytics.match(/shift_brain_rapid_capture_extracted/g) || [])).toHaveLength(1);
  expect(analytics).not.toContain('108/64');
  expect(analytics).not.toContain('Norepinephrine');
});

test('searchable finding picker discovers supported modules and collapsed summaries retain values', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/copilot');
  await page.getByRole('button', { name: 'Add finding' }).click();
  await page.getByLabel('Find a field').fill('hemo');
  await expect(page.getByRole('dialog', { name: 'Add a finding' }).getByRole('button', { name: /^Hemodynamics/ })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Add a finding' }).getByRole('button', { name: /^Labs/ })).toHaveCount(0);
  await page.getByRole('dialog', { name: 'Add a finding' }).getByRole('button', { name: /^Hemodynamics/ }).click();
  await page.getByLabel('CVP previous').fill('8');
  await page.getByLabel('CVP current').fill('5');
  const module = page.getByRole('button', { name: /^Hemodynamics/ });
  await module.click();
  await expect(module).toContainText('CVP 8 → 5');
  await module.click();
  await expect(page.getByLabel('CVP previous')).toHaveValue('8');
  await expect(page.getByLabel('CVP current')).toHaveValue('5');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('confirmed Rapid Capture interoperates with Edit Snapshot and New Snapshot clearing', async ({ page }) => {
  await page.route('**/api/copilot', async (route) => {
    await route.fulfill({ status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: GROUNDED_TEST_PRIORITY_MAP })}\n\ndata: ${JSON.stringify({ done: true })}\n\n` });
  });
  await page.goto('/copilot');
  await page.getByRole('button', { name: "Describe what's happening" }).click();
  await page.getByLabel('Nurse narrative').fill(RAPID_BENCHMARK);
  await page.getByRole('button', { name: 'Structure my Snapshot' }).click();
  await page.getByRole('button', { name: 'Confirm Snapshot' }).click();
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect(page.getByRole('heading', { name: 'What matters first' })).toBeVisible();
  await page.getByRole('button', { name: 'Edit Snapshot' }).click();
  await expect(page.getByLabel('MAP current')).toHaveValue('61');
  await expect(page.getByRole('button', { name: 'Cool / clammy' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Delayed capillary refill' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect(page.getByRole('button', { name: 'New Snapshot' })).toBeVisible();
  await page.getByRole('button', { name: 'New Snapshot' }).click();
  await page.getByRole('button', { name: "Describe what's happening" }).click();
  await expect(page.getByLabel('Nurse narrative')).toHaveValue('');
  expect(await page.evaluate(() => ({ saved: localStorage.getItem('clinical_edge_saved_cases'), draft: sessionStorage.getItem('cec_draft') }))).toEqual({ saved: null, draft: null });
});

test('manual capture preserves simultaneous perfusion findings and first-class MAP/RR semantics', async ({ page }) => {
  await page.goto('/copilot');
  await page.getByRole('button', { name: 'Enter findings manually' }).click();
  await page.getByLabel('MAP current').fill('61');
  await addEarlierValue(page, 'MAP');
  await page.getByLabel('MAP previous').fill('78');
  await page.getByLabel('Respiratory rate current').fill('27');
  await addEarlierValue(page, 'RR');
  await page.getByLabel('Respiratory rate previous').fill('20');
  await page.getByRole('button', { name: 'Cool / clammy' }).click();
  await page.getByRole('button', { name: 'Delayed capillary refill' }).click();
  await expect(page.getByRole('button', { name: 'Cool / clammy' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Delayed capillary refill' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByText('Review Snapshot before building').click();
  await expect(page.locator('.snapshot-review')).toContainText('Earlier 78 mmHg → Now 61 mmHg');
  await expect(page.locator('.snapshot-review')).toContainText('Earlier 20 /min → Now 27 /min');
  await expect(page.locator('.snapshot-review')).toContainText('Cool / clammy,Delayed capillary refill');
});

test('command home prioritizes patient change and preserves focused tools', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'What do you need right now?' })).toBeVisible();
  await expect(page.getByRole('link', { name: "Describe what's happening" })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Check something' })).toBeVisible();
  await expect(page.getByText('Rhythm Lab', { exact: true })).toBeVisible();
  await expect(page.getByText('ICU Drips', { exact: true })).toBeVisible();
  await expect(page.getByText('Reference Hub', { exact: true })).toBeVisible();
  await expect(page.getByText('Acid-base & oxygenation', { exact: true })).toBeVisible();
  await expect(page.getByText('Brain Sheets', { exact: true })).toBeVisible();
});

test('copilot starts with immediately usable mobile quick capture', async ({ page }) => {
  await page.goto('/copilot');
  await expect(page.getByRole('heading', { name: 'What do you know right now?' })).toBeVisible();
  await expect(page.getByLabel('Blood pressure current')).toBeVisible();
  await expect(page.getByLabel('Heart rate current')).toBeVisible();
  await expect(page.getByLabel('Urine output amount')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add finding' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Build my Priority Map →' })).toBeDisabled();
});

test('common findings work in arbitrary order and Add finding preserves entered values', async ({ page }) => {
  await page.goto('/copilot');
  await page.getByLabel('Heart rate current').fill('104');
  await page.getByLabel('Blood pressure current').fill('88/50');
  await page.getByRole('button', { name: 'More drowsy' }).click();
  await addFinding(page, /^Labs/);
  await expect(page.getByLabel('Lactate current')).toBeVisible();
  await expect(page.getByLabel('Heart rate current')).toHaveValue('104');
  await expect(page.getByLabel('Blood pressure current')).toHaveValue('88/50');
});

test('BP perfusion builder reveals contextual modules and preserves structured trends', async ({ page }) => {
  let submittedQuestion = '';
  await page.route('**/api/copilot', async (route) => {
    submittedQuestion = (await route.request().postDataJSON()).question;
    await route.fulfill({ status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: 'Urgency Level: MODERATE\n\n**Priorities**\n### 1 · Perfusion trend\nRelevance: Important\nObserved:\n- A perfusion change was reported\nInterpretation: The cause is not established.\nAssess now:\n- Focused reassessment\n\n**Assess first**\n- Focused reassessment\n\n**Possible patterns**\n- Several contributors remain possible\n\n**Missing information**\n- Current trend\n\n**Monitor and trend**\n- Direction of change\n\n**Escalation triggers**\n- Worsening status\n\n**SBAR-ready summary**\nA change was reported.\n\n**Teach me why**\nTrends add context.' })}\n\ndata: ${JSON.stringify({ done: true })}\n\n` });
  });
  await page.goto('/copilot');
  await addEarlierValue(page, 'BP');
  await expect(page.getByLabel('Blood pressure previous')).toBeVisible();
  await expect(page.getByLabel('Urine output amount')).toBeVisible();
  await page.getByLabel('Blood pressure previous').fill('118/72');
  await page.getByLabel('Blood pressure current').fill('86/48');
  await expect(page.getByRole('alert')).toContainText('Do not wait to finish this Snapshot');
  await addFinding(page, /^Hemodynamics/);
  await page.getByLabel('CI previous').fill('2.4');
  await page.getByLabel('CI current').fill('1.8');
  await addFinding(page, /^Drips/);
  await page.getByRole('button', { name: '+ Add drip' }).click();
  await page.getByLabel('Medication').fill('Norepinephrine');
  await page.getByLabel('Current dose').fill('0.08');
  await page.getByLabel('Unit', { exact: true }).fill('mcg/kg/min');
  await page.getByText('Review Snapshot before building').click();
  await expect(page.locator('.snapshot-review')).toContainText('Earlier 2.4 L/min/m2 → Now 1.8 L/min/m2');
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect.poll(() => submittedQuestion).toContain('BP: previous 118/72 -> current 86/48 mmHg');
  expect(submittedQuestion).toContain('BP: previous 118/72 -> current 86/48 mmHg');
  expect(submittedQuestion).toContain('CI: previous 2.4 -> current 1.8 L/min/m2');
  expect(submittedQuestion).toContain('medication=Norepinephrine');
  expect(submittedQuestion).toContain('currentDose=0.08');
  expect(submittedQuestion).toContain('unit=mcg/kg/min');
});

test('BP perfusion builder supports explicit unknown and not-assessed states', async ({ page }) => {
  await page.goto('/copilot');
  await page.getByLabel('SpO₂ state').selectOption('Unknown');
  await page.getByRole('button', { name: 'More drowsy' }).click();
  await page.getByText('Review Snapshot before building').click();
  await expect(page.locator('.snapshot-review')).toContainText('Explicit states');
  await expect(page.locator('.snapshot-review')).toContainText('SpO₂');
  await expect(page.locator('.snapshot-review')).toContainText('More drowsy');
});

test('semantic Snapshot review preserves temporal and explicit-state evidence boundaries', async ({ page }) => {
  let submittedQuestion = '';
  await page.route('**/api/copilot', async (route) => {
    submittedQuestion = (await route.request().postDataJSON()).question;
    await route.fulfill({ status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: GROUNDED_TEST_PRIORITY_MAP })}\n\ndata: ${JSON.stringify({ done: true })}\n\n` });
  });
  await page.goto('/copilot');
  await addEarlierValue(page, 'BP');
  await addEarlierValue(page, 'HR');
  await page.getByLabel('Blood pressure previous').fill('118/70');
  await page.getByLabel('Blood pressure current').fill('92/58');
  await page.getByLabel('Heart rate previous').fill('80');
  await page.getByLabel('Heart rate current').fill('80');
  await page.getByLabel('Urine output amount').fill('20');
  await page.getByLabel('Urine output interval', { exact: true }).fill('1');
  await addFinding(page, /^Hemodynamics/);
  const ciField = page.locator('fieldset.snapshot-trend').filter({ has: page.locator('legend', { hasText: /^CI/ }) });
  const cvpField = page.locator('fieldset.snapshot-trend').filter({ has: page.locator('legend', { hasText: /^CVP/ }) });
  await ciField.getByLabel('CI state').selectOption('Unknown');
  await cvpField.getByLabel('CVP state').selectOption('Not assessed');
  await page.getByPlaceholder('Add a brief relevant detail').fill('Fictional review-only context');
  await page.getByText('Review Snapshot before building').click();

  const review = page.locator('.snapshot-review-content');
  await expect(review).toContainText('Earlier 118/70 mmHg → Now 92/58 mmHg');
  await expect(review).toContainText('Unchanged');
  await expect(review).toContainText('80 bpm');
  await expect(review).not.toContainText(/worsen|improv|deteriorat/i);
  await expect(review).toContainText('20 mL over 1 hour');
  await expect(review).toContainText('CI');
  await expect(review).toContainText('Unknown');
  await expect(review).toContainText('CVP');
  await expect(review).toContainText('Not assessed');
  await expect(review).not.toContainText('Potassium');
  await expect(review).toContainText('Fictional review-only context');

  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect.poll(() => submittedQuestion).toContain('BP: previous 118/70 -> current 92/58 mmHg');
  expect(submittedQuestion).toContain('Heart rate: previous 80 -> current 80 bpm');
  expect(submittedQuestion).toContain('Urine output: amount 20 mL over 1 hour');
  expect(submittedQuestion).toContain('CI: Unknown');
  expect(submittedQuestion).toContain('CVP: Not assessed');
  expect(submittedQuestion).not.toContain('Potassium:');
});

test('urine output preserves amount with interval and never exposes internal keys in Review', async ({ page }) => {
  let submittedQuestion = '';
  await page.route('**/api/copilot', async (route) => {
    submittedQuestion = (await route.request().postDataJSON()).question;
    await route.fulfill({ status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: GROUNDED_TEST_PRIORITY_MAP })}\n\ndata: ${JSON.stringify({ done: true })}\n\n` });
  });
  await page.goto('/copilot');
  await page.getByLabel('Urine output amount').fill('20');
  await page.getByLabel('Urine output interval', { exact: true }).fill('1');
  await page.getByText('Review Snapshot before building').click();
  const review = page.locator('.snapshot-review-content');
  await expect(review).toContainText('Urine output');
  await expect(review).toContainText('20 mL over 1 hour');
  await expect(review).not.toContainText(/urineAmount|urineInterval|tempNow|spo2Now/);
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect.poll(() => submittedQuestion).toContain('Urine output: amount 20 mL over 1 hour');
});

test('urine output keeps documented rate distinct from qualitative status', async ({ page }) => {
  let submittedQuestion = '';
  await page.route('**/api/copilot', async (route) => {
    submittedQuestion = (await route.request().postDataJSON()).question;
    await route.fulfill({ status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: GROUNDED_TEST_PRIORITY_MAP })}\n\ndata: ${JSON.stringify({ done: true })}\n\n` });
  });
  await page.goto('/copilot');
  await page.getByRole('button', { name: 'Rate', exact: true }).click();
  await page.getByLabel('Urine output documented rate').fill('20');
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect.poll(() => submittedQuestion).toContain('Urine output: documented rate 20 mL/hr');

  submittedQuestion = '';
  await page.goto('/copilot');
  await page.getByRole('button', { name: 'Status', exact: true }).click();
  await page.getByRole('button', { name: 'Minimal', exact: true }).click();
  await page.getByText('Review Snapshot before building').click();
  await expect(page.locator('.snapshot-review-content')).toContainText('Minimal');
  await expect(page.locator('.snapshot-review-content')).not.toContainText('Unknown');
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect.poll(() => submittedQuestion).toContain('Urine output: qualitative Minimal');
});

test('urine output distinguishes unknown, not assessed, and omitted', async ({ page }) => {
  await page.goto('/copilot');
  await page.getByLabel('Urine output state').selectOption('Unknown');
  await page.getByText('Review Snapshot before building').click();
  await expect(page.locator('.snapshot-review-content')).toContainText('Urine output');
  await expect(page.locator('.snapshot-review-content')).toContainText('Unknown');

  await page.getByLabel('Urine output state').selectOption('Not assessed');
  await expect(page.locator('.snapshot-review-content')).toContainText('Not assessed');

  await page.goto('/copilot');
  await page.getByLabel('Heart rate current').fill('80');
  await page.getByText('Review Snapshot before building').click();
  await expect(page.locator('.snapshot-review-content')).not.toContainText('Urine output');
});

test('mobile quick capture uses numeric keyboards and keeps Add finding reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/copilot');
  await expect(page.getByLabel('Heart rate current')).toHaveAttribute('inputmode', 'numeric');
  await expect(page.getByLabel('Temperature current')).toHaveAttribute('inputmode', 'decimal');
  await expect(page.getByLabel('Urine output amount')).toHaveAttribute('inputmode', 'numeric');
  const add = page.getByRole('button', { name: 'Add finding' });
  await expect(add).toBeVisible();
  await page.waitForTimeout(300);
  const beforeScroll = await add.boundingBox();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(add).toBeInViewport();
  const afterScroll = await add.boundingBox();
  expect(Math.abs((beforeScroll?.y || 0) - (afterScroll?.y || 0))).toBeLessThan(2);
  await addFinding(page, /^Bleeding \/ drains/);
  await expect(page.getByRole('button', { name: '+ Add drain' })).toBeVisible();
});

test('bedside workflow preserves amount over time and supports Edit and New Snapshot', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let requestCount = 0;
  let submittedQuestion = '';
  await page.route('**/api/copilot', async (route) => {
    requestCount += 1;
    submittedQuestion = (await route.request().postDataJSON()).question;
    await route.fulfill({ status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: GROUNDED_TEST_PRIORITY_MAP })}\n\ndata: ${JSON.stringify({ done: true })}\n\n` });
  });

  await page.goto('/copilot');
  await page.getByLabel('Blood pressure current').fill('88/50');
  await page.getByLabel('Heart rate current').fill('112');
  await page.getByLabel('Temperature current').fill('38.2');
  await page.getByLabel('SpO₂ current').fill('94');
  await page.getByLabel('Oxygen support current').fill('2 L');
  await page.getByRole('button', { name: 'More drowsy' }).click();
  await page.getByRole('button', { name: 'Present', exact: true }).click();
  await page.getByRole('button', { name: 'Cool / clammy' }).click();
  await page.getByLabel('Urine output amount').fill('20');
  await expect(page.getByText('Add the collection period, for example 1 hour.')).toBeVisible();
  await page.getByLabel('Urine output interval', { exact: true }).fill('1');
  await expect(page.getByText('Add the collection period, for example 1 hour.')).toBeHidden();

  await page.getByText('Review Snapshot before building').click();
  const review = page.locator('.snapshot-review-content');
  for (const expected of ['88/50 mmHg', '112 bpm', '38.2 °C', '94 %', '2 L', 'More drowsy', 'Present', 'Cool / clammy', '20 mL over 1 hour']) {
    await expect(review).toContainText(expected);
  }

  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect(page.getByRole('heading', { name: 'What matters first' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Edit Snapshot' })).toBeInViewport();
  await expect(page.getByRole('button', { name: 'New Snapshot' })).toBeInViewport();
  expect(requestCount).toBe(1);
  expect(submittedQuestion).toContain('Urine output: amount 20 mL over 1 hour');
  expect(submittedQuestion).toContain('Perfusion: Cool / clammy');

  await page.getByRole('button', { name: 'Edit Snapshot' }).click();
  await expect(page.getByRole('heading', { name: 'What do you know right now?' })).toBeVisible();
  await expect(page.getByLabel('Blood pressure current')).toHaveValue('88/50');
  await expect(page.getByLabel('Heart rate current')).toHaveValue('112');
  await expect(page.getByLabel('Urine output amount')).toHaveValue('20');
  await expect(page.getByLabel('Urine output interval', { exact: true })).toHaveValue('1');
  await expect(page.getByRole('button', { name: 'More drowsy' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Build my Priority Map →' })).toBeEnabled();
  expect(requestCount).toBe(1);

  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect(page.getByRole('button', { name: 'New Snapshot' })).toBeVisible();
  expect(requestCount).toBe(2);
  await page.getByRole('button', { name: 'New Snapshot' }).click();
  await expect(page.getByLabel('Blood pressure current')).toHaveValue('');
  await expect(page.getByLabel('Heart rate current')).toHaveValue('');
  await expect(page.getByLabel('Urine output amount')).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Build my Priority Map →' })).toBeDisabled();
  expect(await page.evaluate(() => ({ saved: localStorage.getItem('clinical_edge_saved_cases'), draft: sessionStorage.getItem('cec_draft') }))).toEqual({ saved: null, draft: null });
  expect(requestCount).toBe(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('guided BP perfusion modules preserve structured values through collapse and serialization', async ({ page }) => {
  let submittedQuestion = '';
  await page.route('**/api/copilot', async (route) => {
    submittedQuestion = (await route.request().postDataJSON()).question;
    await route.fulfill({ status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: '**What stands out**\n- Reported perfusion change' })}\n\ndata: ${JSON.stringify({ done: true })}\n\n` });
  });
  await page.goto('/copilot');
  await addEarlierValue(page, 'BP');
  await expect(page.getByLabel('Blood pressure previous')).toBeVisible();
  await expect(page.getByLabel('Heart rate current')).toBeVisible();
  await addFinding(page, /^Hemodynamics/);
  const hemodynamics = page.getByRole('button', { name: /Hemodynamics/ });
  for (const label of ['CVP previous', 'CO current', 'CI current', 'SVR current', 'PA systolic current', 'PA diastolic current', 'PA mean current', 'SvO2 / ScvO2 current']) {
    await expect(page.getByLabel(label)).toBeVisible();
  }
  await page.getByLabel('CI previous').fill('2.4');
  await page.getByLabel('CI current').fill('1.8');

  await addFinding(page, /^Labs/);
  const labs = page.locator('.snapshot-disclosure').filter({ has: page.getByText('Labs', { exact: true }) });
  await expect(page.getByLabel('CI current')).toBeVisible();
  await page.getByLabel('Lactate previous').fill('1.8');
  await page.getByLabel('Lactate current').fill('3.1');
  await page.getByLabel('Hemoglobin current').fill('9.4');
  await page.getByRole('button', { name: '+ Add lab' }).click();
  const otherLab = page.locator('.snapshot-repeatable fieldset').filter({ has: page.getByText('Lab 1', { exact: true }) });
  await otherLab.getByLabel('Lab name').fill('Troponin');
  await otherLab.getByLabel('Current').fill('18');
  await otherLab.getByLabel('Unit').fill('ng/L');
  await otherLab.getByLabel('Timeframe').fill('Current');
  await labs.click();
  await expect(labs).toContainText('Lactate 1.8 → 3.1');

  await addFinding(page, /^Drips/);
  const drips = page.getByRole('button', { name: /^Drips/ });
  await page.getByRole('button', { name: '+ Add drip' }).click();
  await page.getByRole('button', { name: '+ Add drip' }).click();
  const dripRows = page.locator('.snapshot-repeatable fieldset').filter({ has: page.getByLabel('Medication') });
  await dripRows.nth(0).getByLabel('Medication').fill('Norepinephrine');
  await dripRows.nth(0).getByLabel('Current dose').fill('0.08');
  await dripRows.nth(0).getByLabel('Unit').fill('mcg/kg/min');
  await dripRows.nth(1).getByLabel('Medication').fill('Vasopressin');

  await addFinding(page, /^Interventions/);
  const interventions = page.getByRole('button', { name: /Fluids \/ interventions/ });
  await page.getByRole('button', { name: '+ Add intervention' }).click();
  const intervention = page.locator('.snapshot-repeatable fieldset').filter({ has: page.getByText('Intervention 1', { exact: true }) });
  await intervention.getByLabel('Intervention').fill('Fluid bolus');
  await intervention.getByLabel('Amount').fill('250');
  await intervention.getByLabel('Unit').fill('mL');
  await intervention.getByLabel('Observed response').fill('No sustained pressure change');

  await addFinding(page, /^Bleeding \/ drains/);
  const drains = page.getByRole('button', { name: /Drains \/ bleeding/ });
  await page.getByRole('button', { name: '+ Add drain' }).click();
  await page.getByRole('button', { name: '+ Add drain' }).click();
  const drainRows = page.locator('.snapshot-repeatable fieldset').filter({ has: page.getByLabel('Drain / device type') });
  await drainRows.nth(0).getByLabel('Drain / device type').fill('Mediastinal drain');
  await drainRows.nth(0).getByLabel('Current output').fill('40');
  await drainRows.nth(0).getByLabel('Output timeframe').fill('mL over 1 hour');
  await drainRows.nth(1).getByLabel('Drain / device type').fill('Pleural drain');

  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect.poll(() => submittedQuestion).toContain('CI: previous 2.4 -> current 1.8 L/min/m2');
  expect(submittedQuestion).toContain('Lactate: previous 1.8 -> current 3.1 mmol/L');
  expect(submittedQuestion).toContain('name=Troponin');
  expect(submittedQuestion).toContain('medication=Norepinephrine');
  expect(submittedQuestion).toContain('medication=Vasopressin');
  expect(submittedQuestion).toContain('type=Fluid bolus');
  expect(submittedQuestion).toContain('response=No sustained pressure change');
  expect(submittedQuestion).toContain('type=Mediastinal drain');
  expect(submittedQuestion).toContain('type=Pleural drain');
  expect(submittedQuestion).not.toContain('otherHemodynamic=');
});

test('Priority Map submission blocks duplicate work while a request is active', async ({ page }) => {
  let requestCount = 0;
  await page.route('**/api/copilot', async (route) => {
    requestCount += 1;
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: `data: ${JSON.stringify({ progress: 'checking' })}\n\ndata: ${JSON.stringify({ text: GROUNDED_TEST_PRIORITY_MAP })}\n\ndata: ${JSON.stringify({ done: true })}\n\n`,
    });
  });
  await page.goto('/copilot');
  await page.getByLabel('Blood pressure current').fill('92/58');
  const submit = page.getByRole('button', { name: 'Build my Priority Map →' });
  await submit.evaluate((button) => { button.click(); button.click(); });
  await expect(page.getByText('Organizing your snapshot')).toBeVisible();
  await expect.poll(() => requestCount).toBe(1);
  await expect(page.locator('.main-container')).toHaveAttribute('data-workspace-state', 'process');
  await expect(page.getByText('Snapshot submitted')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Build my Priority Map →' })).toBeHidden();
  await expect(page.getByText('Priority Map', { exact: true })).toBeVisible();
  expect(requestCount).toBe(1);
});

for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
  test(`Snapshot transitions through capture, process, and Priority Map at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    let releaseResponse;
    const responseReady = new Promise((resolve) => { releaseResponse = resolve; });
    await page.route('**/api/copilot', async (route) => {
      await responseReady;
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: `data: ${JSON.stringify({ text: GROUNDED_TEST_PRIORITY_MAP })}\n\ndata: ${JSON.stringify({ done: true })}\n\n`,
      });
    });

    await page.goto('/copilot');
    await expect(page.locator('.main-container')).toHaveAttribute('data-workspace-state', 'capture');
    await page.getByLabel('Heart rate current').fill('104');
    await page.getByRole('button', { name: 'Build my Priority Map →' }).click();

    await expect(page.locator('.main-container')).toHaveAttribute('data-workspace-state', 'process');
    await expect(page.getByText('Snapshot submitted')).toBeVisible();
    await expect(page.getByLabel('Submitted Snapshot').locator('.submitted-snapshot__status strong')).toContainText('Heart / rhythm');
    await expect(page.getByRole('heading', { name: 'What do you know right now?' })).toBeHidden();
    await expect(page.getByText('Organizing your snapshot')).toBeVisible();
    await page.getByText('View submitted Snapshot').click();
    await expect(page.locator('.submitted-snapshot__details .snapshot-review-content')).toContainText('Now 104 bpm');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    releaseResponse();
    await expect(page.locator('.main-container')).toHaveAttribute('data-workspace-state', 'priority-map');
    await expect(page.getByRole('heading', { name: 'What matters first' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Reported perfusion change' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Prepare SBAR' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save case locally' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'What do you know right now?' })).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test('result actions keep SBAR primary and follow-up deliberate, contextual, and private', async ({ page }) => {
  await page.addInitScript(() => {
    (window as typeof window & { __analyticsDebug: unknown[]; __copiedText: string }).__analyticsDebug = [];
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (text: string) => { (window as typeof window & { __copiedText: string }).__copiedText = text; } }, configurable: true });
    const original = console.debug;
    console.debug = (...args) => {
      (window as typeof window & { __analyticsDebug: unknown[] }).__analyticsDebug.push(args);
      original(...args);
    };
  });
  let copilotRequests = 0;
  let followUpBody;
  await page.route('**/api/sbar', async (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ sbar: { situation: 'Situation exact.', background: 'Background exact.', assessment: 'Assessment exact.', recommendation: 'Recommendation exact.' } }),
  }));
  await page.route('**/api/copilot', async (route) => {
    copilotRequests += 1;
    followUpBody = await route.request().postDataJSON();
    await new Promise((resolve) => setTimeout(resolve, 100));
    await route.fulfill({ status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: GROUNDED_TEST_PRIORITY_MAP })}\n\ndata: ${JSON.stringify({ done: true })}\n\n` });
  });

  await page.goto('/copilot?screenshot=response');
  await expect(page.getByRole('heading', { name: 'What matters first' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Evolving postoperative change' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Prepare SBAR' })).toBeVisible();
  await expect(page.getByLabel('Your focused question or update')).toHaveCount(0);

  await page.getByRole('button', { name: /Ask about this Priority Map/ }).click();
  await page.getByRole('button', { name: 'What should I reassess first?' }).click();
  const followUpInput = page.getByLabel('Your focused question or update');
  await expect(followUpInput).toHaveValue('What should I reassess first?');
  const submit = page.getByRole('button', { name: 'Ask about this map' });
  await submit.evaluate((button) => { button.click(); button.click(); });
  await expect.poll(() => copilotRequests).toBe(1);
  expect(followUpBody.isFollowUp).toBe(true);
  expect(followUpBody.question).toContain('What should I reassess first?');
  await expect(page.getByRole('heading', { name: 'Clarification' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Reported perfusion change' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Evolving postoperative change' })).toBeVisible();

  await page.getByRole('button', { name: 'Prepare SBAR' }).click();
  for (const heading of ['Situation', 'Background', 'Assessment', 'Recommendation']) await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Copy SBAR' }).click();
  expect(await page.evaluate(() => (window as typeof window & { __copiedText: string }).__copiedText)).toBe('SITUATION:\nSituation exact.\n\nBACKGROUND:\nBackground exact.\n\nASSESSMENT:\nAssessment exact.\n\nRECOMMENDATION:\nRecommendation exact.');
  const analytics = await page.evaluate(() => JSON.stringify((window as typeof window & { __analyticsDebug: unknown[] }).__analyticsDebug));
  expect(analytics).not.toContain('What should I reassess first?');
  expect(analytics).not.toContain('Situation exact.');
});

test('timeout-style failure keeps Snapshot values and exposes an accessible mobile error', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/api/copilot', async (route) => {
    await route.fulfill({ status: 504, contentType: 'application/json', body: JSON.stringify({ code: 'request_timeout' }) });
  });
  await page.goto('/copilot');
  await addEarlierValue(page, 'BP');
  await page.getByLabel('Blood pressure previous').fill('118/72');
  await page.getByLabel('Blood pressure current').fill('92/58');
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect(page.getByRole('alert')).toContainText('clinical reasoning service timed out');
  await expect(page.getByLabel('Blood pressure previous')).toHaveValue('118/72');
  await expect(page.getByLabel('Blood pressure current')).toHaveValue('92/58');
  await expect(page.getByRole('button', { name: 'Build my Priority Map →' })).toBeEnabled();
});

test('Add finding remains reachable on mobile and preserves quick-capture values', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/copilot');
  await page.getByLabel('Heart rate current').fill('104');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.getByRole('button', { name: 'Add finding' })).toBeVisible();
  await addFinding(page, /^Rhythm/);
  await page.getByLabel('Rhythm').fill('New irregular monitor rhythm');
  await expect(page.getByLabel('Heart rate current')).toHaveValue('104');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('quick capture accepts single measurements without creating a trend', async ({ page }) => {
  await page.goto('/copilot');
  await expect(page.getByLabel('Blood pressure current')).toBeVisible();
  await expect(page.getByLabel('Heart rate current')).toBeVisible();
  await page.getByLabel('Heart rate current').fill('104');
  await page.getByText('Review Snapshot before building').click();
  await expect(page.locator('.snapshot-review')).toContainText('Now 104 bpm');
  await expect(page.locator('.snapshot-review')).not.toContainText('Earlier → Now');
  await expect(page.getByRole('button', { name: 'Build my Priority Map →' })).toBeEnabled();
  await expect(page.getByText(/Automated checks are limited/)).toBeVisible();
});

test('mobile measurement fields expose appropriate input modes', async ({ page }) => {
  await page.goto('/copilot');
  await expect(page.getByLabel('Heart rate current')).toHaveAttribute('inputmode', 'numeric');
  await expect(page.getByLabel('Temperature current')).toHaveAttribute('inputmode', 'decimal');
  await expect(page.getByLabel('SpO₂ current')).toHaveAttribute('inputmode', 'numeric');
  await expect(page.getByLabel('Urine output amount')).toHaveAttribute('inputmode', 'numeric');
});

test('Copilot distinguishes provider configuration failure from a network error', async ({ page }) => {
  await page.route('**/api/copilot', async (route) => route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({ error: true, code: 'provider_not_configured', message: 'The AI service is not configured for this local environment. Add the required backend API key and restart the server.' }),
  }));
  await page.goto('/copilot');
  await page.getByLabel('Other symptom').fill('Fictional symptom');
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect(page.getByText(/AI service is not configured for this local environment/)).toBeVisible();
  await expect(page.getByText(/Connection issue/)).toHaveCount(0);
});

test('reasoning workspace renders the contract and retains only explicitly saved cases', async ({ page }) => {
  const response = `Urgency Level: MODERATE

**Priorities**
### 1 · Perfusion concern
Relevance: High priority
Observed:
- Blood pressure fell from 118/72 to 88/50
- Heart rate is 122
Interpretation: This pattern may reflect impaired perfusion; the cause is not established.
Assess now:
- Current appearance, perfusion, mentation, and full vital-sign trend

### 2 · Possible volume loss
Relevance: Needs clarification
Observed:
- The patient is postoperative
Interpretation: Volume loss could contribute, but bleeding and intake/output context are missing.
Assess now:
- Bleeding findings and urine-output trend

**Assess first**
- Current appearance, perfusion, mentation, and full vital-sign trend

**Possible patterns**
- This may fit evolving volume loss or another low-preload pattern

**Missing information**
- Urine output, bleeding assessment, hemoglobin trend, and recent intake

**Monitor and trend**
- Further pressure decline or worsening perfusion would increase concern

**Escalation triggers**
- Worsening hemodynamics or mentation commonly prompt earlier team awareness

**SBAR-ready summary**
The patient has a reported blood-pressure decline with a rising heart rate. The cause remains uncertain from the available information.

**Teach me why**
Lower circulating volume can reduce preload and cardiac output while sympathetic compensation raises heart rate.`;

  const lesson = {
    active: true,
    domain: 'hemodynamics-perfusion',
    conceptId: 'perfusion-trend',
    conceptLabel: 'Reading a perfusion trend',
    questionType: 'trend-interpretation',
    question: {
      stem: 'Which change carries the most weight in this situation?',
      choices: [{ id: 'a', label: 'The falling blood-pressure trend' }, { id: 'b', label: 'The postoperative label alone' }, { id: 'c', label: 'A single temperature value' }],
      correctChoiceId: 'a',
      explanation: 'A falling pressure paired with a rising heart rate can increase concern for impaired perfusion. The trend does not establish the cause.',
    },
    scenarioConnection: 'Here, the reported pressure decline and rising heart rate make the direction of change more useful than either value alone.',
    application: {
      stem: 'Which information would best help clarify the contributor?',
      choices: [{ id: 'a', label: 'Bleeding and intake/output context' }, { id: 'b', label: 'Room number' }, { id: 'c', label: 'The date alone' }],
      correctChoiceId: 'a',
      explanation: 'Bleeding findings and intake/output add clinically relevant context without proving a diagnosis.',
    },
    tags: ['Hemodynamics', 'Perfusion', 'Trend interpretation'],
  };
  await page.route('**/api/copilot', async (route) => {
    const body = await route.request().postDataJSON();
    if (body.learningRequest) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ lesson }) });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: `data: ${JSON.stringify({ text: response })}\n\ndata: ${JSON.stringify({ done: true })}\n\n`,
    });
  });

  await page.goto('/copilot');
  await addEarlierValue(page, 'BP');
  await page.getByText('Care setting and clinical context').click();
  await page.getByRole('button', { name: 'Post-op' }).click();
  await page.getByLabel('Blood pressure previous').fill('118/72');
  await page.getByLabel('Blood pressure current').fill('88/50');
  await page.getByLabel('Heart rate current').fill('122');
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();

  await expect(page.getByRole('heading', { name: 'What matters first' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Perfusion concern' })).toBeVisible();
  await expect(page.locator('.priority-primary h3')).toHaveText('Perfusion concern');
  await expect(page.locator('.priority-secondary summary strong')).toHaveText('2 · Possible volume loss');
  await expect(page.locator('.priority-secondary details')).not.toHaveAttribute('open', '');
  await expect(page.locator('.priority-primary').getByText('Reported / observed', { exact: true })).toBeVisible();
  await expect(page.locator('.priority-primary').getByText('Clinical Edge interpretation', { exact: true })).toBeVisible();
  await expect(page.getByText('Blood pressure fell from 118/72 to 88/50')).toBeVisible();
  await expect(page.getByText('Heart rate is 122')).toBeVisible();
  await expect(page.getByText('This pattern may reflect impaired perfusion; the cause is not established.')).toBeVisible();
  await expect(page.getByText('Assess now', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Possible contributors/ })).toBeVisible();
  await expect(page.getByText('This may fit evolving volume loss or another low-preload pattern')).toHaveCount(0);
  await page.getByRole('button', { name: /Possible contributors/ }).click();
  await expect(page.getByText('This may fit evolving volume loss or another low-preload pattern')).toBeVisible();
  await expect(page.getByRole('button', { name: /Teach me why/ })).toBeVisible();
  await expect(page.getByText(/Lower circulating volume can reduce preload/)).toHaveCount(0);
  await page.getByRole('button', { name: /Teach me why/ }).click();
  await expect(page.getByText('Which change carries the most weight in this situation?')).toBeVisible();
  await expect(page.getByText(/A falling pressure paired/)).toHaveCount(0);
  await page.getByRole('radio', { name: /The falling blood-pressure trend/ }).click();
  await page.getByRole('button', { name: 'Commit answer' }).click();
  await expect(page.getByText('Correct', { exact: true })).toBeVisible();
  await expect(page.getByText(/A falling pressure paired/)).toBeVisible();
  await expect(page.getByText('In this situation', { exact: true })).toBeVisible();
  await expect(page.getByText('Which information would best help clarify the contributor?')).toBeVisible();
  await page.getByRole('radio', { name: /Bleeding and intake\/output context/ }).click();
  await page.getByRole('button', { name: 'Commit answer' }).click();
  await expect(page.getByText('Concept reviewed', { exact: true })).toBeVisible();
  await expect(page.getByText('Hemodynamics', { exact: true })).toBeVisible();

  const beforeSave = await page.evaluate(() => ({
    recent: localStorage.getItem('clinical_edge_history'),
    saved: localStorage.getItem('clinical_edge_saved_cases'),
    draft: sessionStorage.getItem('cec_draft'),
  }));
  expect(beforeSave).toEqual({ recent: null, saved: null, draft: null });

  await page.getByRole('button', { name: 'Save case locally' }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('clinical_edge_saved_cases') || '[]'));
  expect(saved).toHaveLength(1);
  expect(saved[0].question).toContain('PATIENT SNAPSHOT');
  expect(saved[0].question).toContain('BP: previous 118/72 -> current 88/50');
  expect(saved[0].rawText).toContain('Priorities');
});

test('Priority Map allows one priority and never renders more than three', async ({ page }) => {
  const responseWith = (count: number) => `Urgency Level: LOW\n\n**Priorities**\n${Array.from({ length: count }, (_, index) => `### ${index + 1} · Priority ${index + 1}\nRelevance: ${index ? 'Needs clarification' : 'Important'}\nObserved:\n- Reported signal ${index + 1}\nInterpretation: This may represent a clinically relevant change.\nAssess now:\n- Focused reassessment ${index + 1}`).join('\n\n')}\n\n**Assess first**\n- Focused reassessment\n\n**Possible patterns**\n- This pattern may have several contributors\n\n**Missing information**\n- Current focused assessment\n\n**Monitor and trend**\n- Watch the reported signal direction\n\n**Escalation triggers**\n- Worsening clinical status may prompt team awareness\n\n**SBAR-ready summary**\nA reported change is present.\n\n**Teach me why**\nTrends can add context.`;
  let count = 1;
  await page.route('**/api/copilot', async (route) => route.fulfill({ status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: responseWith(count) })}\n\ndata: ${JSON.stringify({ done: true })}\n\n` }));

  const submit = async () => {
    await page.goto('/copilot');
    await page.getByLabel('Other symptom').fill('Fictional symptom');
    await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  };
  await submit();
  await expect(page.getByRole('heading', { name: 'Priority 1' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Priority 2' })).toHaveCount(0);

  count = 4;
  await submit();
  await expect(page.getByText('3 · Priority 3', { exact: true })).toBeVisible();
  await expect(page.getByText('4 · Priority 4', { exact: true })).toHaveCount(0);
});

test('Teach Me locks an incorrect answer and keeps clinical content out of analytics', async ({ page }) => {
  await page.addInitScript(() => {
    (window as typeof window & { __analyticsDebug: unknown[] }).__analyticsDebug = [];
    const original = console.debug;
    console.debug = (...args) => { (window as typeof window & { __analyticsDebug: unknown[] }).__analyticsDebug.push(args); original(...args); };
  });
  const response = `Urgency Level: MODERATE\n\n**Priorities**\n### 1 · Perfusion trend\nRelevance: Important\nObserved:\n- MAP fell to 61\nInterpretation: This may reflect worsening perfusion.\nAssess now:\n- Reassess perfusion\n\n**Assess first**\n- Reassess perfusion\n\n**Possible patterns**\n- This may fit a low-flow pattern\n\n**Missing information**\n- Mental status\n\n**Monitor and trend**\n- Watch MAP direction\n\n**Escalation triggers**\n- Worsening perfusion may prompt team awareness\n\n**SBAR-ready summary**\nA perfusion change is reported.\n\n**Teach me why**\nTrends can reveal deterioration.`;
  const lesson = { active: true, domain: 'hemodynamics-perfusion', conceptId: 'map-trend', conceptLabel: 'Reading MAP trends', questionType: 'trend-interpretation', question: { stem: 'What matters most about MAP 61?', choices: [{ id: 'a', label: 'Its direction over time' }, { id: 'b', label: 'The number in isolation' }, { id: 'c', label: 'The room location' }], correctChoiceId: 'a', explanation: 'Direction over time adds context. One value does not establish a diagnosis.' }, scenarioConnection: 'The reported MAP of 61 is more useful when compared with the earlier trend.', application: null, tags: ['Hemodynamics', 'Trend interpretation'] };
  await page.route('**/api/copilot', async (route) => {
    const body = await route.request().postDataJSON();
    if (body.learningRequest) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ lesson }) });
    return route.fulfill({ status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: response })}\n\ndata: ${JSON.stringify({ done: true })}\n\n` });
  });
  await page.goto('/copilot');
  await page.getByLabel('Blood pressure current').fill('88/50');
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await page.getByRole('button', { name: /Teach me why/ }).click();
  const wrong = page.getByRole('radio', { name: /The number in isolation/ });
  await wrong.click();
  await page.getByRole('button', { name: 'Commit answer' }).click();
  await expect(page.getByText('Not quite', { exact: true })).toBeVisible();
  await expect(wrong).toBeDisabled();
  await expect(page.getByText('Concept reviewed', { exact: true })).toBeVisible();
  const analytics = await page.evaluate(() => JSON.stringify((window as typeof window & { __analyticsDebug: unknown[] }).__analyticsDebug));
  expect(analytics).not.toContain('MAP 61');
  expect(analytics).not.toContain('The number in isolation');
  expect(analytics).not.toContain('Direction over time adds context');
  await page.getByText('Return to Priority Map', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'What matters first' })).toBeVisible();
});

test('Teach Me gracefully renders the structured explanation fallback', async ({ page }) => {
  await page.route('**/api/copilot', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ lesson: { active: false, domain: 'postoperative-assessment', conceptId: 'postoperative-trends', conceptLabel: 'Postoperative trends', keyIdea: 'A developing trend can matter before one value becomes severely abnormal.', whyItMatters: 'Trend context supports focused reassessment without establishing a diagnosis.', scenarioConnection: 'The reported heart-rate rise and new fatigue are changes to compare with the earlier baseline.', tags: ['Postoperative assessment', 'Trend interpretation'] } }) }));
  await page.goto('/copilot?screenshot=response');
  await page.getByRole('button', { name: /Teach me why/ }).click();
  await expect(page.getByText('Key idea', { exact: true })).toBeVisible();
  await expect(page.getByText(/developing trend can matter/)).toBeVisible();
  await expect(page.getByRole('button', { name: /Concept reviewed/ })).toBeVisible();
});

test('one Teach Me action creates one request and a later completed action can create another', async ({ page }) => {
  await page.addInitScript(() => {
    (window as typeof window & { __analyticsDebug: unknown[] }).__analyticsDebug = [];
    const original = console.debug;
    console.debug = (...args) => {
      (window as typeof window & { __analyticsDebug: unknown[] }).__analyticsDebug.push(args);
      original(...args);
    };
  });
  let learningRequests = 0;
  const lesson = {
    active: false,
    domain: 'rhythm-recognition',
    conceptId: 'rhythm-hemodynamic-tolerance',
    conceptLabel: 'Rhythm change and hemodynamic tolerance',
    keyIdea: 'Interpret the rhythm alongside symptoms, blood pressure, mentation, and perfusion.',
    whyItMatters: 'A monitor observation does not establish the exact rhythm diagnosis.',
    scenarioConnection: 'The reported pattern includes a rhythm change with hemodynamic deterioration.',
    tags: ['Rhythm recognition', 'Hemodynamic tolerance'],
  };
  await page.route('**/api/copilot', async (route) => {
    const body = await route.request().postDataJSON();
    if (body.learningRequest) {
      learningRequests += 1;
      await new Promise((resolve) => setTimeout(resolve, 75));
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ lesson }) });
    }
    return route.continue();
  });

  await page.goto('/copilot?screenshot=response');
  await page.getByRole('button', { name: /Teach me why/ }).click();
  await expect(page.getByText('Rhythm change and hemodynamic tolerance')).toBeVisible();
  expect(learningRequests).toBe(1);
  let analytics = await page.evaluate(() => (window as typeof window & { __analyticsDebug: unknown[][] }).__analyticsDebug);
  expect(analytics.filter((entry) => entry[1] === 'teach_me_opened')).toHaveLength(1);

  await page.getByRole('button', { name: /Concept reviewed/ }).click();
  await page.getByRole('button', { name: /Teach me why/ }).click();
  await expect(page.getByText('Rhythm change and hemodynamic tolerance')).toBeVisible();
  expect(learningRequests).toBe(2);
  analytics = await page.evaluate(() => (window as typeof window & { __analyticsDebug: unknown[][] }).__analyticsDebug);
  expect(analytics.filter((entry) => entry[1] === 'teach_me_opened')).toHaveLength(2);
});

test('snapshot values stay out of analytics and the structured handoff preserves unknowns', async ({ page }) => {
  await page.addInitScript(() => {
    (window as typeof window & { __analyticsDebug: unknown[] }).__analyticsDebug = [];
    const original = console.debug;
    console.debug = (...args) => {
      (window as typeof window & { __analyticsDebug: unknown[] }).__analyticsDebug.push(args);
      original(...args);
    };
  });
  let submittedQuestion = '';
  await page.route('**/api/copilot', async (route) => {
    submittedQuestion = (await route.request().postDataJSON()).question;
    await route.fulfill({ status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: '**What stands out**\n- Reported change' })}\n\ndata: ${JSON.stringify({ done: true })}\n\n` });
  });
  await page.goto('/copilot');
  await page.getByLabel('Blood pressure current').fill('88/50');
  await page.getByPlaceholder('Add a brief relevant detail').fill('looks pale');
  await page.getByText('Review Snapshot before building').click();
  await expect(page.locator('.snapshot-review-content')).toContainText('looks pale');
  expect(await page.evaluate(() => ({ recent: localStorage.getItem('clinical_edge_history'), saved: localStorage.getItem('clinical_edge_saved_cases'), draft: sessionStorage.getItem('cec_draft') }))).toEqual({ recent: null, saved: null, draft: null });
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect.poll(() => submittedQuestion).toContain('BP: previous unknown -> current 88/50');
  expect(submittedQuestion).toContain('Additional user-reported context: looks pale');
  const analytics = await page.evaluate(() => JSON.stringify((window as typeof window & { __analyticsDebug: unknown[] }).__analyticsDebug));
  expect(analytics).not.toContain('88/50');
  expect(analytics).not.toContain('looks pale');
});

test('snapshot serialization preserves string selections and nested structured values', async ({ page }) => {
  let submittedQuestion = '';
  await page.route('**/api/copilot', async (route) => {
    submittedQuestion = (await route.request().postDataJSON()).question;
    await route.fulfill({ status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: '**What stands out**\n- Reported change' })}\n\ndata: ${JSON.stringify({ done: true })}\n\n` });
  });
  await page.goto('/copilot');
  await addFinding(page, /^Labs/);
  await page.getByRole('button', { name: '+ Add lab' }).click();
  const lab = page.locator('.snapshot-repeatable fieldset').filter({ has: page.getByText('Lab 1', { exact: true }) });
  await lab.getByLabel('Lab name').fill('ABG / VBG');
  await lab.getByLabel('Current').fill('pH 7.29, PaCO2 60');
  await lab.getByLabel('Timeframe').fill('Current');
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect.poll(() => submittedQuestion).toContain('name=ABG / VBG');
  expect(submittedQuestion).not.toContain('0=A');
});

test('rhythm lab route loads', async ({ page }) => {
  await page.goto('/rhythm-lab');
  await expect(page.getByRole('heading', { name: 'Rhythm Lab' })).toBeVisible();
});

test('icu drips route loads', async ({ page }) => {
  await page.goto('/icu-drips');
  await expect(page.getByRole('heading', { name: 'ICU Drips' })).toBeVisible();
});

test('reference hub search accepts input and displays matching content', async ({ page }) => {
  await page.goto('/reference-hub');
  const search = page.getByPlaceholder('Search references…');
  await search.fill('lactate');
  await expect(page.getByText('Serum Lactate')).toBeVisible();
});

test('reference hub aliases match new entries', async ({ page }) => {
  await page.goto('/reference-hub');
  const search = page.getByPlaceholder('Search references…');

  await search.fill('iCa');
  await expect(page.getByText('Serum Calcium', { exact: true })).toBeVisible();

  await search.fill('Mg');
  await expect(page.getByText('Serum Magnesium', { exact: true })).toBeVisible();

  await search.fill('PERRLA');
  await expect(page.getByText('Pupil Assessment (PERRLA)', { exact: true })).toBeVisible();

  await search.fill('Glasgow');
  await expect(page.getByText('Glasgow Coma Scale (GCS)', { exact: true })).toBeVisible();

  await search.fill('pleur-evac');
  await expect(page.getByText('Chest Tube / Pleural Drainage System', { exact: true })).toBeVisible();

  await search.fill('PICC');
  await expect(page.getByText('PICC Line / Midline Catheter', { exact: true })).toBeVisible();

  await search.fill('JP drain');
  await expect(page.getByText('Wound Drains (JP / Hemovac)', { exact: true })).toBeVisible();

  await search.fill('trach');
  await expect(page.getByText('Tracheostomy Care Basics', { exact: true })).toBeVisible();

  await search.fill('CAM-ICU');
  await expect(page.getByText('CAM-ICU (Delirium Screening)', { exact: true })).toBeVisible();

  await search.fill('NH3');
  await expect(page.getByText('Serum Ammonia', { exact: true })).toBeVisible();
});

test('opening a second-batch reference detail view works', async ({ page }) => {
  await page.goto('/reference-hub');
  await page.getByPlaceholder('Search references…').fill('trach');
  await page.getByRole('button', { name: 'Tracheostomy Care Basics' }).click();
  await expect(page.getByRole('heading', { name: 'Tracheostomy Care Basics' })).toBeVisible();
  await expect(page.getByText('A patient-specific airway plan is most useful when the team knows where it is and what equipment is available before an emergency occurs.')).toBeVisible();
});

test('neuro assessment category appears and filters to the new entries', async ({ page }) => {
  await page.goto('/reference-hub');
  await page.getByRole('button', { name: 'Neuro Assessment' }).click();
  await expect(page.getByText('Glasgow Coma Scale (GCS)', { exact: true })).toBeVisible();
  await expect(page.getByText('Pupil Assessment (PERRLA)', { exact: true })).toBeVisible();
});

test('opening a new reference detail view works', async ({ page }) => {
  await page.goto('/reference-hub');
  await page.getByPlaceholder('Search references…').fill('Serum Calcium');
  await page.getByRole('button', { name: 'Serum Calcium' }).click();
  await expect(page.getByRole('heading', { name: 'Serum Calcium' })).toBeVisible();
  await expect(page.getByText('When albumin or acid-base status is abnormal, total and ionized calcium may tell different stories.')).toBeVisible();
});

test('abg lab example can be selected and interpreted', async ({ page }) => {
  await page.goto('/abg-lab');
  await page.getByRole('button', { name: 'Respiratory acidosis' }).click();
  await expect(page.getByText('Pattern Summary')).toBeVisible();
  await expect(page.getByText('How I Read It')).toBeVisible();
});

test('brain sheets library and production detail route load', async ({ page }) => {
  await page.goto('/brain-sheets');
  await expect(page.getByRole('heading', { name: 'Blank, printable shift-organization sheets.' })).toBeVisible();
  await expect(page.getByText('Med-Surg · 4 Patient')).toBeVisible();

  await page.goto('/brain-sheets/medsurg-4pt');
  await expect(page.getByRole('heading', { name: 'Med-Surg · 4 Patient' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download PDF' })).toBeVisible();
  await expect(page.getByLabel('View a larger preview of Med-Surg · 4 Patient')).toBeVisible();

  await page.goto('/brain-sheets/telemetry');
  await expect(page.getByRole('heading', { name: 'Telemetry / Stepdown' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download PDF' })).toBeVisible();
  await expect(page.getByLabel('View a larger preview of Telemetry / Stepdown')).toBeVisible();
});

test('quickstart option can be selected and completed', async ({ page }) => {
  await page.goto('/quickstart');
  const textarea = page.getByPlaceholder('e.g. BP dropping post-op and patient looks pale, HR climbing...');
  await page.getByRole('button', { name: 'BP dropping post-op' }).click();
  await expect(textarea).toHaveValue('BP dropping post-op');

  await page.getByRole('button', { name: 'Start thinking it through →' }).click();
  await page.waitForURL('**/copilot');
  await expect(page.getByPlaceholder('Add a brief relevant detail')).toHaveValue('BP dropping post-op');
});

test('scenario advances from the first step to the next step', async ({ page }) => {
  await page.goto('/scenario');
  await page.getByRole('button', { name: 'Think it through →' }).click();
  await expect(page.getByRole('heading', { name: 'What are you thinking?' })).toBeVisible();
});

test('privacy page loads', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
});

test('support page loads', async ({ page }) => {
  await page.goto('/support');
  await expect(page.getByRole('heading', { name: 'Support' })).toBeVisible();
});

test('download page loads', async ({ page }) => {
  await page.goto('/download');
  await expect(page.getByRole('heading', { name: 'Clinical tools built for real nursing workflows.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download on the App Store' }).first()).toBeVisible();
});
