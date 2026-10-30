import { test, expect } from '@playwright/test';
for (const surface of ['web', 'ios_app', 'unknown']) test(`consented ${surface} Ask outcomes stay correlated and content-free`, async ({ page }) => {
  const events: any[] = [];
  await page.addInitScript(surface => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    if (surface !== 'web') Object.defineProperty(navigator, 'userAgent', { get: () => 'iPhone AppleWebKit' + (surface === 'ios_app' ? ' ClinicalEdgeApp/1.0' : '') });
    if (!localStorage.getItem('ce_consent')) localStorage.setItem('ce_consent', JSON.stringify({ version: 4, ai: true, analytics: true, decidedAt: '2026-10-30T00:00:00Z' }));
  }, surface);
  let outcome = 'success';
  await page.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.hostname === 'us.i.posthog.com') {
      events.push(request.postDataJSON());
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
    if (url.pathname.endsWith('/conversation/consent')) return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ version: 4, receipt: 'a'.repeat(64), dailyQuestionAllowance: 3 }) });
    if (url.pathname.endsWith('/conversation/preview')) {
      if (outcome === 'cancel') { await new Promise(resolve => setTimeout(resolve, 500)); return route.abort(); }
      return route.fulfill({ status: outcome === 'failure' ? 503 : 200, contentType: 'application/json', body: JSON.stringify(outcome === 'failure' ? { error: { code: 'provider_timeout' } } : { requestId: 'backend-must-not-be-analytics-id', contextMode: 'general', answer: 'Fictional educational answer.', details: [] }) });
    }
    if (url.hostname === '127.0.0.1') return route.continue();
    return route.abort();
  });
  await page.goto('/ask');
  await page.getByRole('button', { name: 'Enable educational conversation' }).click();
  for (outcome of ['success', 'failure', 'cancel']) {
    const before = events.filter(e => e.event === 'ask_submitted').length;
    await page.getByLabel('Nursing question').fill('Fictional confidential example, never send to analytics.');
    await page.getByRole('button', { name: /^(Ask Clinical Edge|Send question to Ask Clinical Edge)$/ }).click();
    await expect.poll(() => events.filter(e => e.event === 'ask_submitted').length).toBe(before + 1);
    if (outcome === 'cancel') await page.getByRole('button', { name: 'Cancel question' }).click();
    const expected = outcome === 'success' ? 'ask_succeeded' : outcome === 'failure' ? 'ask_failed' : 'ask_cancelled';
    await expect.poll(() => events.filter(e => e.event === expected).length).toBe(1);
    const submitted = events.filter(e => e.event === 'ask_submitted').at(-1);
    expect(events.find(e => e.event === expected).properties.request_id).toBe(submitted.properties.request_id);
    expect(submitted.properties.surface).toBe(surface);
  }
  expect(JSON.stringify(events)).not.toMatch(/confidential|Fictional educational answer|backend-must-not/);
  await page.goto('/choices');
  const off = page.getByRole('button', { name: /Turn off usage analytics/i });
  // The Privacy controls use native checkboxes rather than a separate collector UI.
  if (await off.count()) await off.click();
  else await page.getByRole('checkbox', { name: /analytics|usage/i }).uncheck();
  const count = events.length;
  await page.goto('/ask'); await page.waitForTimeout(600);
  expect(events.length).toBe(count);
  expect(await page.evaluate(() => localStorage.getItem('ce_product_analytics_id'))).toBeNull();
});

test('released newer Shift hooks emit a real start and resume, not a restored start', async ({ page }) => {
  const events: any[] = [];
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    localStorage.setItem('ce_consent', JSON.stringify({ version: 4, ai: false, analytics: true }));
  });
  await page.route('**/*', route => {
    if (new URL(route.request().url()).hostname === 'us.i.posthog.com') { events.push(route.request().postDataJSON()); return route.fulfill({ status: 200, body: '{}' }); }
    return new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort();
  });
  for (const [id, label] of [['stable-number', 'Plan your first assessment'], ['missing-time', 'Step into the ED'], ['code-blue', 'Enter room'], ['quiet-complaint', 'Start the afternoon'], ['transfer-not-ready', 'Answer Dana’s call']]) {
    await page.goto('/learn/shifts/' + id);
    await page.getByRole('button', { name: label, exact: false }).click();
    await expect.poll(() => events.filter(e => e.event === 'shift_started' && e.properties.scenario === id).length).toBe(1);
    await page.reload();
    await expect(page.locator('.shift-scenario-scroll h1').first()).toBeVisible();
    expect(events.filter(e => e.event === 'shift_started' && e.properties.scenario === id)).toHaveLength(1);
    expect(events.some(e => e.event === 'shift_step_reached' && e.properties.scenario === id)).toBe(true);
  }
});
