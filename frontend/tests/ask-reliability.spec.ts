import { test, expect } from '@playwright/test';

test.skip(process.env.CE_PUBLIC_BETA_UI_TEST !== 'true', 'Requires the isolated mocked conversational preview.');
const cases = [
  ['educational_clarification_required', 422, /Please clarify the nursing concept/],
  ['admission_response_invalid', 502, /could not read its question check/],
  ['admission_response_incomplete', 502, /did not finish its question check/],
  ['admission_source_invalid', 502, /invalid reference selection/],
  ['provider_rate_limit', 503, /service is busy/],
  ['answer_generation_incomplete', 502, /did not finish the explanation/],
  ['answer_review_unavailable', 503, /review is temporarily unavailable/],
  ['answer_review_invalid', 502, /unusable explanation review/],
  ['output_safety_withheld', 422, /care-advice or evidence boundary/],
  ['educational_scope_unavailable', 403, /not individual diagnoses/],
] as const;
for (const width of [390, 1280]) for (const [code, status, message] of cases) {
  test(`${code} is truthful and preserves reading, draft and consent at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    let questions = 0;
    await page.route('**/api/**', async route => {
      const url = route.request().url();
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204 });
      if (url.endsWith('/consent')) return route.fulfill({ json: route.request().method() === 'DELETE' ? { consent: false } : { version: 4, receipt: 'a'.repeat(64), expiresInSeconds: 600, dailyQuestionAllowance: 3 } });
      if (url.endsWith('/preview')) {
        questions++;
        return route.fulfill(questions === 1 ? { json: { requestId: 'fictional-reliability', contextMode: 'general', answer: 'Pressure and volume are distinct concepts. Compliance changes their relationship.', details: [], evidence: { status: 'not_independently_source_verified', sources: [] } } } :
          { status, json: { error: { code, ...(code === 'educational_scope_unavailable' ? { message: 'This pathway explains nursing concepts, not individual diagnoses or treatment decisions.' } : { message: 'RAW PROVIDER CONTENT MUST NOT APPEAR' }) } } });
      }
      return route.abort();
    });
    await page.goto('/ask');
    await expect(page.getByRole('button', { name: 'Enable educational conversation' })).toBeVisible();
    expect(questions).toBe(0);
    await page.getByRole('button', { name: 'Enable educational conversation' }).click();
    await page.getByLabel('Nursing question').fill('Explain pressure and volume.');
    await page.getByRole('button', { name: /^(Ask Clinical Edge|Send question to Ask Clinical Edge)$/ }).click();
    await expect(page.getByText('Pressure and volume are distinct concepts. Compliance changes their relationship.', { exact: true })).toBeVisible();
    const draft = 'Explain ventricular compliance.';
    await page.getByLabel('Nursing question').fill(draft);
    await page.getByRole('button', { name: /^(Ask Clinical Edge|Send question to Ask Clinical Edge)$/ }).click();
    await expect(page.getByRole('alert')).toContainText(message);
    await expect(page.getByText('RAW PROVIDER CONTENT MUST NOT APPEAR')).toHaveCount(0);
    await expect(page.getByLabel('Nursing question')).toHaveValue(draft);
    await expect(page.getByText('Pressure and volume are distinct concepts. Compliance changes their relationship.', { exact: true })).toBeVisible();
    expect(questions).toBe(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (code === 'educational_clarification_required' && width === 390) await page.screenshot({ path: '/private/tmp/ce-ask-reliability-clarification-390.png', fullPage: true });
    await page.getByRole('button', { name: 'Withdraw AI consent' }).click();
    await expect(page.getByRole('button', { name: 'Enable educational conversation' })).toBeVisible();
    await expect(page.getByText('Pressure and volume are distinct concepts. Compliance changes their relationship.', { exact: true })).toHaveCount(0);
    expect(questions).toBe(2);
    expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(draft);
  });
}
