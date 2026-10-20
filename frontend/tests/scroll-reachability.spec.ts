import { test, expect, type Page } from '@playwright/test';
import { RHYTHMS } from '../src/modules/rhythm-lab/data/rhythms';
import { STRIP_EXAMPLES } from '../src/modules/rhythm-lab/utils/waveforms';
import { REFERENCES } from '../src/modules/reference-hub/data/references.js';
import { DRIPS } from '../src/modules/icu-drips/data/drips.js';
import { scenario } from '../src/modules/the-shift/scenario.js';
import { freshProgress, STORAGE_KEY as DROWSY_KEY } from '../src/modules/the-shift/progress.js';
import { fresh as freshMonitor, KEY as MONITOR_KEY } from '../src/modules/the-shift/monitor/progress.js';
import { alarmChoices, alarmExplanations, monitorChoices, rhythmChoices, recommendations } from '../src/modules/the-shift/monitor/data.js';
import { fresh as freshDischarge, KEY as DISCHARGE_KEY } from '../src/modules/the-shift/discharge/progress.js';
import { startChoices, teachChoices, fixChoices } from '../src/modules/the-shift/discharge/data.js';
import { fresh as freshConversation, KEY as CONVERSATION_KEY } from '../src/modules/the-shift/conversation/progress.js';
import { opening, asking, confidentiality, cues, actions } from '../src/modules/the-shift/conversation/data.js';
import { fresh as freshFifth, STORAGE_KEY as FIFTH_KEY, evaluateDispatch, evaluateCoverage, evaluateReport } from '../src/modules/the-shift/shift5/rules.js';
import { readingAnswer, readingQuestion } from './fixtures/ask-reading.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { buildPriorityMapFallback, buildReassessmentPriorityMap, buildSbarFallback, assessDeterministicUrgency, buildTeachMeFallback } = require('../../backend/server.js');

const PAGES = ['/', '/copilot', '/copilot?capture=rapid', '/ask', '/learn',
  ...['drowsy-patient', 'monitor-alarm', 'discharge-puzzle', 'conversation', 'which-patient-first'].map(id => `/learn/shifts/${id}`),
  ...['drowsy-patient', 'monitor-alarm', 'discharge-puzzle', 'conversation', 'which-patient-first'].map(id => `/learn/shifts/${id}/ask`),
  '/rhythm-lab', '/rhythm-lab/library', '/rhythm-lab/practice', '/rhythm-lab/compare', '/rhythm-lab/pearls', '/rhythm-lab/sprint',
  '/icu-drips', '/reference-hub', '/abg-lab', '/brain-sheets',
  ...['medsurg-4pt', 'medsurg-6pt', 'icu-systems', 'telemetry', 'ed-rapid', 'night-shift', 'new-grad'].map(id => `/brain-sheets/${id}`),
  '/blog', '/blog/abg-interpretation-for-nurses', '/blog/ecg-basics-for-nurses', '/landing', '/scenario', '/quickstart', '/privacy', '/terms', '/support', '/download', '/missing-page'];
const SIZES = [[375, 667], [390, 420], [768, 1024], [1280, 800]];

async function scrollEnd(page: Page) {
  await page.evaluate(() => {
    for (const e of document.querySelectorAll<HTMLElement>('#root *')) {
      if (e.getClientRects().length && /auto|scroll/.test(getComputedStyle(e).overflowY)) e.scrollTop = e.scrollHeight;
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
}
async function contentClearance(page: Page) {
  return page.evaluate(() => {
    const dock = document.querySelector('.ce-tool-dock');
    const visible = (e: Element) => {
      if (!e.getClientRects().length || getComputedStyle(e).visibility === 'hidden' || e.closest('[hidden],[inert]')) return false;
      const closed = e.closest('details:not([open])');
      if (closed && !closed.querySelector('summary')?.contains(e)) return false;
      const r = e.getBoundingClientRect();
      for (let parent = e.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        const style = getComputedStyle(parent), box = parent.getBoundingClientRect();
        if (/auto|scroll|hidden|clip/.test(style.overflowY) && (r.bottom <= box.top || r.top >= box.bottom)) return false;
      }
      return true;
    };
    const limit = dock && visible(dock) ? dock.getBoundingClientRect().top : innerHeight;
    const candidates = [...document.querySelectorAll<HTMLElement>('#root *')].filter(e => {
      if (!visible(e) || e.closest('.ce-tool-dock, svg, canvas, dialog, [class*="sr-only"]')) return false;
      const r = e.getBoundingClientRect(), css = getComputedStyle(e);
      if (r.width <= 1 || r.height <= 1 || css.clipPath !== 'none' || css.clip !== 'auto') return false;
      return e.matches('button, a, input, textarea, summary') || !e.children.length && !!e.textContent?.trim();
    });
    const last = candidates.sort((a,b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom)[0];
    return { gap: limit - (last?.getBoundingClientRect().bottom ?? 0), last: last?.textContent?.trim().slice(0,100), horizontal: document.documentElement.scrollWidth > innerWidth };
  });
}
async function assertReachableEnd(page: Page) {
  await expect.poll(async () => { await scrollEnd(page); return (await contentClearance(page)).gap; }, { message: 'All final content and controls must scroll above the dock', timeout: 5000 }).toBeGreaterThanOrEqual(8);
  expect((await contentClearance(page)).horizontal).toBe(false);
}
async function open(page: Page, route: string) {
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  if (route.startsWith('/learn')) await expect(page.locator('.ce-shift-feature:not([hidden])')).toBeVisible({ timeout: 15000 });
}
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => document.documentElement.style.setProperty('--ce-safe-bottom', '34px')));
  // This suite audits layout with synthetic fixtures; no real AI requests.
  await page.route('**/api/**', route => route.abort());
});
for (const [width,height] of SIZES) test.describe(`${width}x${height} with iPhone safe area`, () => {
  test.use({ viewport: { width, height }, serviceWorkers: 'block' });
  for (const route of PAGES) test(`final content reachable on ${route}`, async ({ page }) => {
    await open(page, route);
    await assertReachableEnd(page);
  });
  test('Learn to Reference Hub keeps the entire last card reachable', async ({ page }, testInfo) => {
    await open(page, '/learn');
    await page.locator('.shift-library-tools a[href="/reference-hub"]').click();
    await expect(page.locator('.rh-page')).toBeVisible();
    await assertReachableEnd(page);
    const last = page.getByRole('button', { name: 'Serum Ammonia', exact: true });
    await expect(last).toBeInViewport({ ratio: 1 });
    if (width === 375) await page.screenshot({ path: testInfo.outputPath('reference-after-learn.png') });
  });
  test('Learn to ICU Drips keeps the final tools reachable', async ({ page }, testInfo) => {
    await open(page, '/learn');
    await page.locator('.shift-library-tools a[href="/icu-drips"]').click();
    await expect(page.locator('.icu-drips-root')).toBeVisible();
    await assertReachableEnd(page);
    if (width === 375) await page.screenshot({ path: testInfo.outputPath('drips-after-learn.png') });
  });
});


// Complete synthetic progress records let every authored stage and its feedback render.
const drowsy = { ...freshProgress(), viewed: ['12','14','9'], revealed: scenario.cues.map(c => c.id), answers: { priority: '12', cues: scenario.cues.map(c => c.id), action: scenario.actions[0].id, abg: scenario.interpretations[0].id, sbar: scenario.sbars[0].id } };
const monitor = { ...freshMonitor(), answers: { alarm: alarmChoices[0].id, explanation: alarmExplanations[0].id, monitor: monitorChoices[0].id, rhythm: rhythmChoices[0].id, cues: [], actions: ['notify','stay','ecg'], chips: [], recommendation: recommendations[0].id } };
const discharge = { ...freshDischarge(), inspected: ['lasix','furosemide'], answers: { start: startChoices[0].id, flags: ['stop-apixaban','continue-thinner','resume-all'], actions: ['provider','charge'], teach: teachChoices[0].id, fix: fixChoices[0].id } };
const placements = Object.fromEntries(actions.map(a => [a.id, a.placements[0].groups[0]]));
const conversation = { ...freshConversation(), notice: true, revealed: cues.length, placements, answers: { opening: opening[0].id, asking: asking[0].id, confidentiality: confidentiality[0].id, cues: cues.map(c => c.id), actions: placements } };
const dispatch = { assignments: { '410': 'jordan', '412': 'you', '416': 'hold' }, jordanDirection: 'A', hold416: 'A' };
const fifth = { ...freshFifth(), d1: { order: ['414','412','410','416'], reason: 'change' }, d2Draft: dispatch, d2: evaluateDispatch(dispatch), d3: evaluateCoverage('A'), d4: { phase: 3, revealed: ['vitals','dressing'], helpDraft: ['provider'], help: { submitted: ['provider'], reasons: ['Accepted'], bridges: [] }, reportDraft: ['trend','dressing'], report: evaluateReport(['trend','dressing'], ['vitals','dressing']), checkback: { submitted: 'repeat', reasons: ['Accepted'], bridges: [] } }, d5: Object.fromEntries(['410','412','414','416','coverage','jordan'].map(id => [id, { submitted: 'accepted', reasons: ['Accepted'], bridges: [] }])), coverageAcknowledged: true };
const SCENES = [
  { id: 'drowsy-patient', key: DROWSY_KEY, state: drowsy, stages: 7 },
  { id: 'monitor-alarm', key: MONITOR_KEY, state: monitor, stages: 8 },
  { id: 'discharge-puzzle', key: DISCHARGE_KEY, state: discharge, stages: 7 },
  { id: 'conversation', key: CONVERSATION_KEY, state: conversation, stages: 7 },
  { id: 'which-patient-first', key: FIFTH_KEY, state: fifth, stages: 8 },
];
for (const [width,height] of SIZES) test.describe(`revealed content at ${width}x${height}`, () => {
  test.use({ viewport: { width, height }, serviceWorkers: 'block' });
  for (const scene of SCENES) test(`${scene.id}: every stage and debrief remains reachable`, async ({ page }) => {
    test.setTimeout(180000);
    await open(page, '/learn');
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    for (let stage = 0; stage < scene.stages; stage++) await test.step(`stage ${stage}`, async () => {
      await page.evaluate(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), { key: scene.key, state: { ...scene.state, stage } });
      await open(page, `/learn/shifts/${scene.id}`);
      await expect(page.locator('.ce-shift-feature h1')).toBeVisible();
      await assertReachableEnd(page);
    });
    expect(errors).toEqual([]);
  });
  test('Ask long answer, follow-up composer and error remain reachable', async ({ page }, testInfo) => {
    await page.route('**/api/**', route => route.fulfill({ json: route.request().url().endsWith('/consent') ? { version: 4, receipt: 'a'.repeat(64), dailyQuestionAllowance: 3, expiresInSeconds: 600 } : readingAnswer }));
    await open(page, '/ask');
    await page.getByRole('button', { name: 'Enable educational conversation' }).click();
    await page.getByLabel('Nursing question').fill(readingQuestion);
    await page.getByRole('button', { name: /^(Ask Clinical Edge|Send question to Ask Clinical Edge)$/ }).click();
    await expect(page.locator('.ce-ask-answer')).toBeVisible();
    await assertReachableEnd(page);
    await expect(page.locator('.ce-ask-submit')).toBeInViewport({ ratio: 1 });
    if (width === 375) await page.screenshot({ path: testInfo.outputPath('ask-result-end.png') });
    await page.route('**/api/**', route => route.fulfill({ status: 504, json: { error: { code: 'provider_timeout' } } }));
    await page.getByLabel('Nursing question').fill('Explain the same educational concept more simply.');
    await page.getByRole('button', { name: /^(Ask Clinical Edge|Send question to Ask Clinical Edge)$/ }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await assertReachableEnd(page);
  });
});

for (const width of [375,1280]) test.describe(`reference details at ${width}`, () => {
  test.use({ viewport: { width, height: 800 }, serviceWorkers: 'block' });
  test('all reference topics and expanded sources remain reachable after Learn', async ({ page }) => {
    test.setTimeout(180000);
    await open(page, '/learn');
    await page.locator('.shift-library-tools a[href="/reference-hub"]').click();
    for (const reference of REFERENCES) await test.step(reference.title, async () => {
      await page.locator('.rh-ref-card').getByText(reference.title, { exact: true }).click();
      await expect(page.locator('.rh-detail-page')).toBeVisible();
      for (const summary of await page.locator('.rh-detail-page details:not([open]) > summary').all()) await summary.click();
      await assertReachableEnd(page);
      await page.getByRole('button', { name: /All references/ }).click();
    });
  });
  test('all ICU drip details and expanded sections remain reachable after Learn', async ({ page }) => {
    test.setTimeout(180000);
    await open(page, '/learn');
    await page.locator('.shift-library-tools a[href="/icu-drips"]').click();
    for (const drip of DRIPS) await test.step(drip.name, async () => {
      await page.getByLabel('Search drips').fill(drip.name);
      await page.locator('.id-drip-row').filter({ hasText: drip.name }).first().click();
      await expect(page.locator('.id-detail')).toBeVisible();
      for (const button of await page.locator('.id-ref-row__header').all()) await button.click();
      await assertReachableEnd(page);
      await page.locator('.id-detail__back').click();
    });
  });
});

test.describe('consent disclosures', () => {
  test.use({ viewport: { width: 375, height: 667 }, storageState: { cookies: [], origins: [] } });
  for (const route of ['/ask','/copilot']) test(`${route}: consent actions and expanded disclosure remain reachable`, async ({ page }) => {
    await open(page, route);
    for (const summary of await page.locator('.ce-consent details:not([open]) > summary').all()) await summary.click();
    await assertReachableEnd(page);
  });
});

for (const [width,height] of SIZES) test.describe(`retained containers at ${width}x${height}`, () => {
  test.use({ viewport: { width, height }, serviceWorkers: 'block' });
  test('all learning links and Brain Sheets keep clearance after Learn', async ({ page }) => {
    for (const route of ['/rhythm-lab','/abg-lab','/reference-hub','/icu-drips']) {
      await open(page, '/learn');
      const before = await page.locator('.ce-tool-dock').boundingBox();
      await page.locator(`.shift-library-tools a[href="${route}"]`).click();
      await assertReachableEnd(page);
      expect(await page.locator('.ce-tool-dock').boundingBox()).toEqual(before);
    }
    await page.getByRole('button', { name: 'More tools' }).click();
    await page.getByRole('dialog').getByRole('link', { name: /Brain Sheets/ }).click();
    await assertReachableEnd(page);
    await page.locator('.bs-list a[href="/brain-sheets/icu-systems"]').click();
    await assertReachableEnd(page);
  });
});
for (const width of [375,1280]) test.describe(`practice and concept views at ${width}`, () => {
  test.use({ viewport: { width, height: 800 }, serviceWorkers: 'block' });
  test('pathways and clinical concepts keep their final references reachable', async ({ page }) => {
    test.setTimeout(180000);
    await open(page, '/learn');
    await page.locator('.shift-library-tools a[href="/reference-hub"]').click();
    for (const [selector,back] of [['.rh-pathway-card','All pathways'],['.rh-concept-card','All concepts']]) {
      await page.getByText('Pathways & clinical concepts', { exact: true }).click();
      const count = await page.locator(selector).count();
      expect(count).toBeGreaterThan(0);
      for (let i=0; i<count; i++) {
        const summary = page.locator('details.ce-lookup-extras:not([open]) > summary');
        if (await summary.count()) await summary.click();
        await page.locator(selector).nth(i).click();
        await assertReachableEnd(page);
        await page.getByRole('button', { name: back, exact: true }).click();
      }
    }
  });
  test('ICU practice, challenge, comparisons and pearl controls stay reachable', async ({ page }) => {
    test.setTimeout(120000);
    for (const mode of ['practice','challenge','compare','pearl']) {
      await open(page, '/learn');
      await page.locator('.shift-library-tools a[href="/icu-drips"]').click();
      await page.getByText('Practice, compare & clinical pearls', { exact: true }).click();
      await page.locator(mode === 'pearl' ? '.id-pearl-home-card' : `.id-home-action--${mode}`).click();
      await assertReachableEnd(page);
      if (mode === 'practice' || mode === 'challenge') {
        for (let i=0; i<30 && await page.locator(`.id-${mode}-option`).count(); i++) {
          await page.locator(`.id-${mode}-option`).first().click();
          await assertReachableEnd(page);
          await page.locator(`.id-${mode}-btn--primary`).click();
        }
        await expect(page.locator(`.id-${mode}-option`)).toHaveCount(0);
        await assertReachableEnd(page);
      } else if (mode === 'compare') {
        const count = await page.locator('.id-compare-pair-row').count();
        for (let i=0; i<count; i++) {
          await page.locator('.id-compare-pair-row').nth(i).click();
          await assertReachableEnd(page);
          await page.getByRole('button', { name: /All comparisons/ }).click();
        }
      }
    }
  });
});

for (const [width,height] of SIZES) test.describe(`workspace output at ${width}x${height}`, () => {
  test.use({ viewport: { width, height }, serviceWorkers: 'block' });
  test('mocked Priority Map, teaching, SBAR and return banner keep content reachable', async ({ page }, testInfo) => {
    test.setTimeout(60000);
    await page.route('**/api/**', async route => {
      const body = route.request().postDataJSON();
      if (route.request().url().endsWith('/sbar')) return route.fulfill({ json: { sbar: buildSbarFallback(body.question, assessDeterministicUrgency(body.question).urgency) } });
      if (body.learningRequest) return route.fulfill({ json: { lesson: buildTeachMeFallback('', body.question, 'synthetic_layout_review') } });
      const output = body.reassessmentRequest ? buildReassessmentPriorityMap(body.question) : buildPriorityMapFallback(body.question);
      return route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: output })}\n\ndata: ${JSON.stringify({ done: true })}\n\n` });
    });
    await open(page, '/copilot?capture=rapid');
    await page.getByLabel('Nurse narrative').fill('BP dropped from 108/64 to 86/48. HR went from 92 to 118. More drowsy. Norepinephrine running.');
    await page.getByRole('button', { name: 'Structure my Snapshot' }).click();
    await page.getByRole('button', { name: 'Confirm Snapshot' }).click();
    await assertReachableEnd(page);
    await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
    await expect(page.getByRole('button', { name: 'Reassess', exact: true })).toBeVisible();
    await assertReachableEnd(page);
    await page.getByRole('button', { name: 'Reassess', exact: true }).click();
    await page.getByLabel('New bedside findings').fill('BP now 94/56, HR 106. Still drowsy. Urine 15 mL this hour.');
    await assertReachableEnd(page);
    await page.getByRole('button', { name: 'Review reassessment' }).click();
    await page.getByRole('checkbox').check();
    await assertReachableEnd(page);
    await page.getByRole('button', { name: 'Confirm reassessment' }).click();
    await expect(page.getByRole('region', { name: 'Reassessment evidence' })).toBeVisible();
    await assertReachableEnd(page);
    await page.getByRole('button', { name: /Teach me why/ }).click();
    await expect(page.locator('.teach-panel:not(.teach-loading)')).toBeVisible();
    await assertReachableEnd(page);
    await page.getByRole('button', { name: 'Prepare SBAR' }).click();
    await expect(page.locator('.sbar-panel__sections')).toBeVisible();
    await assertReachableEnd(page);
    if (width === 375) await page.screenshot({ path: testInfo.outputPath('sbar-end.png') });
    await page.getByRole('link', { name: 'Check medication' }).click();
    await expect(page.locator('.has-active-scenario')).toBeVisible();
    await assertReachableEnd(page);
    await page.getByRole('link', { name: 'Return', exact: false }).click();
    await expect(page.locator('.sbar-panel__sections')).toBeVisible();
    await assertReachableEnd(page);
    await page.getByRole('button', { name: 'Sources', exact: true }).click();
    await assertReachableEnd(page);
    await page.getByRole('button', { name: 'Save case locally' }).click();
    await page.getByRole('button', { name: 'New Snapshot', exact: true }).click();
    await page.getByTitle('Expand', { exact: true }).click();
    await assertReachableEnd(page);
    await page.getByRole('button', { name: 'Add or edit note' }).click();
    await assertReachableEnd(page);
  });
});

for (const width of [375,1280]) test.describe(`Rhythm revealed views at ${width}`, () => {
  test.use({ viewport: { width, height: 800 }, serviceWorkers: 'block' });
  test('all rhythm details, practice explanations and Sprint results remain reachable', async ({ page }) => {
    test.setTimeout(120000);
    await open(page, '/rhythm-lab/library');
    for (const rhythm of RHYTHMS) {
      await page.getByLabel('Filter rhythms').fill(rhythm.name);
      await page.getByRole('button', { name: `Open ${rhythm.name}`, exact: true }).click();
      await page.getByRole('button', { name: 'Bedside perspective' }).click();
      await assertReachableEnd(page);
      await page.getByRole('button', { name: 'Back to rhythm list' }).click();
    }
    await page.locator('.rhythm-feature-nav a[href="/rhythm-lab/practice"]').click();
    for (let i=0; i<3; i++) {
      await page.getByRole('button', { name: 'Show first clue', exact: true }).click();
      await page.getByRole('button', { name: 'Show another clue', exact: true }).click();
      await page.getByRole('button', { name: 'Reveal rhythm', exact: true }).click();
      await assertReachableEnd(page);
      await page.getByRole('button', { name: 'Next strip →', exact: true }).click();
    }
    await page.locator('.rhythm-feature-nav a[href="/rhythm-lab/sprint"]').click();
    for (let i=0; i<5; i++) {
      const id = await page.locator('.rhythm-strip-svg').getAttribute('data-rhythm-id');
      const example = STRIP_EXAMPLES[id!];
      await page.getByRole('button', { name: new RegExp(`^${example.rateCategory}$`, 'i') }).click();
      await page.getByRole('button', { name: new RegExp(`^${example.regularityCategory}$`, 'i') }).click();
      await page.getByRole('button', { name: 'Reveal →', exact: true }).click();
      await assertReachableEnd(page);
      await page.getByRole('button', { name: i<4 ? 'Next strip →' : 'Finish sprint →', exact: true }).click();
    }
    await expect(page.getByText('5 strips reviewed')).toBeVisible();
    await assertReachableEnd(page);
  });
});
