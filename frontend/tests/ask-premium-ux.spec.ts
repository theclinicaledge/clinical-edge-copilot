import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

test.skip(process.env.CE_PUBLIC_BETA_UI_TEST !== 'true', 'Run against the explicit mocked public-beta preview.');

const baseline = process.env.CE_ASK_UX_BASELINE === 'true';
const output = `/private/tmp/ce-ask-premium-ux/${baseline ? 'before' : 'after'}`;
mkdirSync(output, { recursive: true });
const answer = 'Oxygenation and ventilation describe different physiological processes. This is a synthetic presentation fixture, not a clinical evaluation.';

async function mocks(page) {
  const requests: any[] = [];
  let count = 0;
  let outcome = 'answer';
  await page.route('**/api/**', async route => {
    const request = route.request();
    requests.push({ method: request.method(), url: request.url(), body: request.postDataJSON(), headers: request.headers() });
    if (request.url().endsWith('/consent')) return route.fulfill({ json: request.method() === 'DELETE' ? { consent: false } : { consent: true, version: 4, receipt: 'a'.repeat(64), dailyQuestionAllowance: 3 } });
    if (request.url().endsWith('/reset')) return route.fulfill({ json: { reset: true } });
    if (outcome === 'delay') await new Promise(resolve => setTimeout(resolve, 1200));
    if (outcome === 'refusal') return route.fulfill({ status: 422, json: { error: { code: 'output_safety_withheld' } } });
    if (outcome === 'disabled') return route.fulfill({ status: 403, json: { error: { code: 'consent_required' } } });
    count++;
    return route.fulfill({ json: { requestId: `synthetic-${count}`, contextMode: 'general', answer: count === 1 ? answer : 'The follow-up uses the preceding educational explanation.', details: [{ heading: 'Why it matters', text: 'This mocked explanation checks readable presentation without changing the clinical content.' }], evidence: { status: 'not_independently_source_verified', sources: [], requiresVerification: true }, historyTurns: count } });
  });
  return { requests, setOutcome(value: string) { outcome = value; } };
}

for (const width of [390, 768, 1440]) {
  test(`first-use consent remains informed and network-free at ${width}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 900 }, storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    const mock = await mocks(page);
    await page.goto('/ask');
    if (!baseline) {
      await expect(page.getByRole('heading', { name: 'Ask Clinical Edge', exact: true })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'A quick note before we begin' })).toBeFocused();
      await expect(page.getByText('Your AI nursing learning companion.')).toBeVisible();
      await page.getByText('Full AI and privacy information').click();
    }
    await expect(page.getByText(/admission, generation and safety review/)).toBeVisible();
    await expect(page.getByText(/Anthropic keeps API content up to 30 days/)).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /anonymous usage analytics/ })).not.toBeChecked();
    expect(mock.requests).toHaveLength(0);
    if (!baseline) await page.getByText('Full AI and privacy information').click();
    await page.screenshot({ path: `${output}/consent-${width}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Agree and continue' }).click();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ce_consent')!))).toMatchObject({ version: 3, ai: true, analytics: false });
    await expect(page.getByRole('button', { name: 'Enable educational conversation' })).toBeVisible();
    expect(mock.requests).toHaveLength(0);
    if (!baseline) {
      await page.getByRole('button', { name: /Explain RAAS simply/ }).click();
      await expect(page.getByLabel('Nursing question')).toHaveValue('Explain RAAS simply');
      await expect(page.getByLabel('Nursing question')).toBeFocused();
      await page.getByLabel('Nursing question').press('Enter');
      await expect(page.getByRole('button', { name: 'Ask Clinical Edge', exact: true })).toBeDisabled();
      expect(mock.requests).toHaveLength(0);
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `${output}/ready-${width}.png`, fullPage: true });
    await context.close();
  });

  test(`chat, follow-up, withholding and revocation at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const mock = await mocks(page);
    await page.goto('/ask');
    await page.getByRole('button', { name: 'Enable educational conversation' }).click();
    if (!baseline) {
      await expect(page.getByText('3 questions per day', { exact: true })).toBeVisible();
      await page.getByText('3 questions per day', { exact: true }).click();
      await expect(page.getByText(/Each submitted conversational question, including follow-ups/)).toBeVisible();
      await page.getByText('3 questions per day', { exact: true }).click();
      await page.getByRole('button', { name: /SSRIs vs. SNRIs/ }).click();
      expect(mock.requests.filter(r => r.url.endsWith('/preview'))).toHaveLength(0);
    }
    await page.getByLabel('Nursing question').fill('Explain oxygenation and ventilation.');
    mock.setOutcome('delay');
    await page.getByRole('button', { name: 'Ask Clinical Edge', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Cancel question' })).toBeVisible();
    await page.screenshot({ path: `${output}/loading-${width}.png`, fullPage: true });
    await expect(page.getByText(answer)).toBeVisible();
    await page.screenshot({ path: `${output}/answer-${width}.png`, fullPage: true });
    mock.setOutcome('answer');
    await page.getByLabel('Nursing question').fill('Why are these different?');
    await page.getByRole('button', { name: 'Ask Clinical Edge', exact: true }).click();
    await expect(page.getByText('The follow-up uses the preceding educational explanation.')).toBeVisible();
    await expect(page.getByLabel('Earlier educational explanation')).toContainText(answer);
    const submissions = mock.requests.filter(r => r.url.endsWith('/preview'));
    expect(submissions.map(r => r.body)).toEqual([{ question: 'Explain oxygenation and ventilation.' }, { question: 'Why are these different?' }]);
    expect(submissions.every(r => r.headers.authorization === `Bearer ${'a'.repeat(64)}`)).toBe(true);
    expect(submissions.every(r => /^[a-f0-9-]{36}$/.test(r.headers['x-ce-device']))).toBe(true);
    const report = await page.getByRole('link', { name: 'Report a concern' }).getAttribute('href');
    expect(report).toContain('synthetic-2');
    expect(decodeURIComponent(report!)).not.toContain('ventilation');
    await page.screenshot({ path: `${output}/followup-${width}.png`, fullPage: true });
    mock.setOutcome('refusal');
    await page.getByLabel('Nursing question').fill('Synthetic refused example.');
    await page.getByRole('button', { name: 'Ask Clinical Edge', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('withheld');
    await expect(page.getByLabel('Nursing question')).toHaveValue('Synthetic refused example.');
    await expect(page.getByText('The follow-up uses the preceding educational explanation.')).toBeVisible();
    await page.screenshot({ path: `${output}/error-${width}.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('oxygenation');
    await page.getByRole('button', { name: baseline ? 'Withdraw educational AI consent' : 'Withdraw AI consent' }).click();
    await expect(page.getByText(answer)).toHaveCount(0);
    expect(mock.requests.at(-1).method).toBe('DELETE');
    await expect(page.getByRole('button', { name: 'Ask Clinical Edge', exact: true })).toBeDisabled();
  });
}

test('disabled beta preserves the draft and requires renewed consent', async ({ page }) => {
  test.skip(baseline);
  const mock = await mocks(page);
  await page.goto('/ask');
  await page.getByRole('button', { name: 'Enable educational conversation' }).click();
  mock.setOutcome('disabled');
  await page.getByLabel('Nursing question').fill('Explain a nursing concept.');
  await page.getByRole('button', { name: 'Ask Clinical Edge', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('expired or was withdrawn');
  await expect(page.getByLabel('Nursing question')).toHaveValue('Explain a nursing concept.');
  await expect(page.getByRole('button', { name: 'Enable educational conversation' })).toBeVisible();
  expect(mock.requests.filter(r=>r.url.endsWith('/preview'))).toHaveLength(1);
});

test('short mobile viewport retains reachable controls above the navigation dock', async ({ page }) => {
  test.skip(baseline);
  await page.setViewportSize({ width: 390, height: 500 });
  await mocks(page);
  await page.goto('/ask');
  await page.getByRole('button', { name: 'Enable educational conversation' }).click();
  await page.getByLabel('Nursing question').fill('Explain RAAS simply');
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  const button = await page.getByRole('button', { name: 'Ask Clinical Edge', exact: true }).boundingBox();
  const dock = await page.getByRole('navigation', { name: 'Clinical Edge workspace' }).boundingBox();
  expect(button!.height).toBeGreaterThanOrEqual(44);
  expect(button!.y + button!.height).toBeLessThan(dock!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `${output}/short-mobile.png` });
});
