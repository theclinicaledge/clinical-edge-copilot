import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { readingAnswer, readingQuestion, shortAnswer } from './fixtures/ask-reading.js';

const baseline = process.env.CE_READING_BASELINE === 'true';
test.skip(process.env.CE_PUBLIC_BETA_UI_TEST !== 'true' && !baseline, 'Run against the explicit mocked public-beta preview.');
const output = `/private/tmp/ce-ask-reading/${baseline ? 'before' : 'after'}`;
mkdirSync(output, { recursive: true });

async function mockConversation(page, seconds = 600) {
  const requests: any[] = [];
  let next: any = readingAnswer, status = 200, delay = 0;
  await page.route('**/api/**', async route => {
    const request = route.request();
    requests.push({ url: request.url(), body: request.postDataJSON(), method: request.method(), headers: request.headers() });
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204 });
    if (request.url().endsWith('/consent')) return route.fulfill({ json: request.method() === 'DELETE' ? { consent: false } : { version: 4, receipt: 'a'.repeat(64), dailyQuestionAllowance: 3, expiresInSeconds: seconds } });
    if (request.url().endsWith('/reset')) return route.fulfill({ json: { reset: true } });
    if (delay) await new Promise(resolve => setTimeout(resolve, delay));
    return route.fulfill({ status, json: next }).catch(() => {});
  });
  return { requests, respond(value, code = 200, wait = 0) { next = value; status = code; delay = wait; } };
}
async function start(page) {
  await page.goto('/ask');
  await page.getByRole('button', { name: 'Enable educational conversation' }).click();
  await page.getByLabel('Nursing question').fill(readingQuestion);
  await page.getByRole('button', { name: 'Ask Clinical Edge', exact: true }).click();
  await expect(page.locator('.ce-ask-direct').first()).toContainText('Oxygen saturation describes');
}

for (const width of [390, 430, 768, 1440]) test(`reading screenshots and chronological follow-up at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  const mock = await mockConversation(page);
  await start(page);
  await page.locator('.ce-ask-answer').first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${output}/first-answer-${width}.png` });
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.screenshot({ path: `${output}/answer-end-${width}.png` });
  if (!baseline) {
    expect(await page.locator('.ce-ask-detail h3').allTextContents()).toEqual(readingAnswer.details.map(d => d.heading));
    await expect(page.getByText(readingQuestion, { exact: true })).toHaveCount(1);
    await expect(page.getByLabel('Nursing question')).toHaveValue('');
    const last = await page.locator('.ce-ask-answer').last().boundingBox(), composer = await page.locator('.ce-ask-composer').boundingBox();
    expect(composer!.y).toBeGreaterThan(last!.y + last!.height);
    const calls = mock.requests.length;
    await page.getByRole('button', { name: 'Explain more simply', exact: true }).click();
    await expect(page.getByLabel('Nursing question')).toHaveValue('Explain the previous answer more simply.');
    expect(mock.requests).toHaveLength(calls);
  }
  mock.respond(shortAnswer);
  await page.getByLabel('Nursing question').fill('Why are these different?');
  await page.getByRole('button', { name: 'Ask Clinical Edge', exact: true }).click();
  await expect(page.getByText(shortAnswer.answer, { exact: true })).toBeVisible();
  if (!baseline) await page.locator('.ce-ask-user-message').last().evaluate(el => scrollTo(0, scrollY + el.getBoundingClientRect().top - 260));
  else await page.locator('.ce-ask-answer').last().scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${output}/two-turn-${width}.png` });
  await page.screenshot({ path: `${output}/two-turn-full-${width}.png`, fullPage: true });
  if (!baseline) {
    await expect(page.locator('.ce-ask-answer')).toHaveCount(2);
    await expect(page.locator('.ce-ask-evidence-status')).toHaveCount(2);
    expect(mock.requests.filter(r => r.url.endsWith('/preview')).map(r => r.body)).toEqual([{ question: readingQuestion }, { question: 'Why are these different?' }]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 500 });
  await page.getByLabel('Nursing question').focus();
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.screenshot({ path: `${output}/small-mobile-${width}.png` });
  if (!baseline) {
    const send = await page.getByRole('button', { name: 'Ask Clinical Edge', exact: true }).boundingBox();
    const dock = await page.getByRole('navigation', { name: 'Clinical Edge workspace' }).boundingBox();
    expect(send!.y + send!.height).toBeLessThan(dock!.y);
    expect(send!.height).toBeGreaterThanOrEqual(44);
  }
});

test('pending edits survive delivery, failure and in-memory navigation', async ({ page }) => {
  test.skip(baseline);
  const mock = await mockConversation(page);
  await start(page);
  mock.respond(shortAnswer, 200, 700);
  await page.getByLabel('Nursing question').fill('Explain more simply.');
  await page.getByRole('button', { name: 'Ask Clinical Edge', exact: true }).click();
  await page.getByLabel('Nursing question').fill('This new draft must survive.');
  await expect(page.locator('.ce-ask-delivery-status')).toContainText('Answer ready.');
  await expect(page.getByText(shortAnswer.answer, { exact: true })).toBeVisible();
  await expect(page.getByLabel('Nursing question')).toHaveValue('This new draft must survive.');
  await expect(page.getByLabel('Nursing question')).toBeFocused();
  await expect(page.getByText('Explain more simply.', { exact: true })).toHaveCount(1);
  const dock = page.getByRole('navigation', { name: 'Clinical Edge workspace' });
  await dock.getByRole('link', { name: 'Home', exact: true }).click();
  await dock.getByRole('link', { name: 'Ask', exact: true }).click();
  await expect(page.getByLabel('Nursing question')).toHaveValue('This new draft must survive.');
  await expect(page.locator('.ce-ask-answer')).toHaveCount(2);
  expect(mock.requests.filter(r => r.url.endsWith('/preview'))).toHaveLength(2);
  await page.evaluate(() => {
    (window as any).deliveryAnnouncements = [];
    new MutationObserver(() => (window as any).deliveryAnnouncements.push(document.querySelector('.ce-ask-delivery-status')?.textContent))
      .observe(document.querySelector('.ce-ask-delivery-status')!, { childList: true, subtree: true, characterData: true });
  });
  for (const [code, status] of [['output_safety_withheld', 422], ['provider_timeout', 504], ['free_daily_limit_reached', 429]]) {
    mock.respond({ error: { code } }, status);
    await page.getByRole('button', { name: 'Ask Clinical Edge', exact: true }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByLabel('Nursing question')).toHaveValue('This new draft must survive.');
    await expect(page.locator('.ce-ask-answer')).toHaveCount(2);
  }
  expect(await page.evaluate(() => (window as any).deliveryAnnouncements)).toEqual([]);
  const state = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage }, history: history.state }));
  expect(state).not.toContain(readingQuestion); expect(state).not.toContain('new draft');
});

test('expiry disables context shortcuts, preserves draft and does not restore old history on renewal', async ({ page }) => {
  test.skip(baseline);
  const mock = await mockConversation(page, 2);
  await start(page);
  await page.getByLabel('Nursing question').fill('A draft after expiry.');
  await expect(page.getByText(/This conversation has expired/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Go deeper', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Ask Clinical Edge', exact: true })).toBeDisabled();
  await expect(page.getByLabel('Nursing question')).toHaveValue('A draft after expiry.');
  const calls = mock.requests.length;
  await page.getByRole('button', { name: 'Enable educational conversation' }).click();
  await expect(page.getByText(/not included in this new conversation/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Go deeper', exact: true })).toBeDisabled();
  expect(mock.requests).toHaveLength(calls + 1);
  await page.getByRole('button', { name: 'Withdraw AI consent' }).click();
  await expect(page.locator('.ce-ask-answer')).toHaveCount(0);
  await expect(page.getByLabel('Nursing question')).toHaveValue('A draft after expiry.');
  await expect(page.getByRole('button', { name: 'Ask Clinical Edge', exact: true })).toBeDisabled();
});

test('delivery does not interrupt reading an earlier answer', async ({ page }) => {
  test.skip(baseline);
  const mock = await mockConversation(page);
  await start(page);
  mock.respond(shortAnswer, 200, 800);
  await page.getByLabel('Nursing question').fill('Why are these different?');
  await page.getByRole('button', { name: 'Ask Clinical Edge', exact: true }).click();
  await page.evaluate(() => scrollTo(0, 200));
  const readingPosition = await page.evaluate(() => scrollY);
  await expect(page.locator('.ce-ask-answer')).toHaveCount(2);
  expect(await page.evaluate(() => scrollY)).toBe(readingPosition);
  await expect(page.locator('.ce-ask-answer').last()).not.toBeFocused();
  await expect(page.getByLabel('Nursing question')).toHaveValue('');
});

test('server expiry and pending withdrawal cannot deliver a late answer', async ({ page }) => {
  test.skip(baseline);
  const mock = await mockConversation(page);
  await start(page);
  mock.respond({ error: { code: 'consent_required' } }, 403);
  await page.getByLabel('Nursing question').fill('A follow-up question.');
  await page.getByRole('button', { name: 'Ask Clinical Edge', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('expired or was withdrawn');
  await expect(page.getByRole('button', { name: 'Give an example', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Enable educational conversation' }).click();
  mock.respond(shortAnswer, 200, 600);
  await page.getByRole('button', { name: 'Ask Clinical Edge', exact: true }).click();
  await page.getByRole('button', { name: 'Withdraw AI consent' }).click();
  await expect(page.getByRole('button', { name: 'Enable educational conversation' })).toBeVisible();
  await page.waitForTimeout(700);
  await expect(page.locator('.ce-ask-answer')).toHaveCount(0);
  await expect(page.getByLabel('Nursing question')).toHaveValue('A follow-up question.');
});

test('safe semantic text, original order, full copy and request-only feedback', async ({ page }) => {
  test.skip(baseline);
  const mock = await mockConversation(page);
  const text = '**Important:** no single oxygen saturation establishes adequate ventilation.\n\n1. Reported value: 28 mmHg.\n2. Missing findings remain *unknown*.\n\n<img src=x onerror="window.unsafe=true"> [not a link](javascript:alert(1))';
  mock.respond({ ...readingAnswer, answer: text });
  await page.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: async value => { (window as any).copiedAnswer = value; } } }); });
  await page.goto('/ask'); await page.getByRole('button', { name: 'Enable educational conversation' }).click();
  await page.getByLabel('Nursing question').fill(readingQuestion); await page.getByRole('button', { name: 'Ask Clinical Edge', exact: true }).click();
  await expect(page.locator('.ce-ask-direct strong')).toHaveText('Important:');
  await expect(page.locator('.ce-ask-direct em')).toHaveText('unknown');
  await expect(page.locator('.ce-ask-direct ol li')).toHaveCount(2);
  await expect(page.locator('.ce-ask-answer img, .ce-ask-direct a')).toHaveCount(0);
  await expect(page.locator('.ce-ask-direct')).toContainText('<img src=x');
  await expect(page.locator('.ce-ask-direct')).toContainText('28 mmHg');
  for (const detail of readingAnswer.details) {
    const content = await page.locator('.ce-ask-detail').filter({ has: page.getByRole('heading', { name: detail.heading, exact: true }) }).locator('p, li').allTextContents();
    expect(content.join(' ').replace(/\s+/g, ' ')).toBe(detail.text.replace(/^- /gm, '').replace(/\s+/g, ' '));
  }
  await page.getByRole('button', { name: 'Copy answer', exact: true }).click();
  const copied = await page.evaluate(() => (window as any).copiedAnswer);
  expect(copied).toContain('no single oxygen saturation establishes adequate ventilation');
  expect(copied).toContain('Reference check required.');
  expect(copied).toContain('not independently source-verified');
  expect(copied).toContain('28 mmHg');
  expect(copied).toContain('1. Reported value: 28 mmHg.');
  expect(copied).toContain('2. Missing findings remain unknown.');
  const report = await page.getByRole('link', { name: 'Report a concern' }).getAttribute('href');
  expect(decodeURIComponent(report!)).toContain('synthetic-reading-1');
  expect(decodeURIComponent(report!)).not.toContain('oxygen saturation');
  const calls = mock.requests.length;
  await page.getByText('In this answer', { exact: true }).click();
  await page.getByRole('link', { name: 'At the bedside', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'At the bedside', exact: true })).toBeFocused();
  expect(mock.requests).toHaveLength(calls);
});

test('enlarged mobile text, simulated keyboard and reduced motion retain reachable content', async ({ page }) => {
  test.skip(baseline);
  await page.setViewportSize({ width: 390, height: 500 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockConversation(page); await start(page);
  await page.locator('.ce-ask-main').evaluate(main => {
    const elements = [...main.querySelectorAll('*')];
    const sizes = elements.map(el => parseFloat(getComputedStyle(el).fontSize));
    elements.forEach((el, i) => (el as HTMLElement).style.fontSize = `${sizes[i] * 2}px`);
  });
  await page.addStyleTag({ content: '#root { --ce-dock-clearance: 152px; } .ce-tool-dock { bottom: 34px; }' });
  await page.getByLabel('Nursing question').fill('A longer draft\nwith another line\nand a third line\nand a fourth line.');
  await page.getByLabel('Nursing question').focus();
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const send = await page.getByRole('button', { name: 'Ask Clinical Edge', exact: true }).boundingBox(), dock = await page.locator('.ce-tool-dock').boundingBox();
  expect(send!.y + send!.height).toBeLessThan(dock!.y);
  await expect(page.getByRole('heading', { name: 'At the bedside', exact: true })).toBeAttached();
  expect(await page.locator('.ce-ask-answer').evaluate(el => el.scrollHeight <= el.clientHeight + 2)).toBe(true);
  await page.screenshot({ path: `${output}/enlarged-mobile.png` });
});
