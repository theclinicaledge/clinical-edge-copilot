import { test, expect } from '@playwright/test';
import { seedTrack } from './med-surg-fixtures.mjs';
import { fileURLToPath } from 'node:url';
import { REWINDS } from '../src/modules/med-surg-track/content.js';
const artifact = (name: string) => fileURLToPath(new URL('../../artifacts/med-surg/' + name, import.meta.url));
const key = 'ce-med-surg-track-private', path = '/learn/med-surg';
async function setup(page, seed = null, route = path) {
  const requests: string[] = [];
  page.on('pageerror', error => { throw error; });
  await page.route('**/*', request => {
    const url = new URL(request.request().url());
    if (url.hostname === '127.0.0.1' && request.request().method() === 'GET' && !url.pathname.startsWith('/api/')) return request.continue();
    if (url.hostname === '127.0.0.1' || request.request().method() !== 'GET') requests.push(request.request().method() + ' ' + url.href);
    return request.fulfill({ body: '', contentType: 'text/css' });
  });
  if (seed) await page.addInitScript(({ key, seed }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(seed)); }, { key, seed });
  await page.goto(route);
  await expect(page.locator('.mst-root')).toBeVisible();
  return requests;
}
async function respond3(page, call = 'Escalate now', concern = 'An acute cause, not sure which yet', findings = ['Orientation and behaviour', 'Respiratory rate']) {
  await page.getByRole('radio', { name: new RegExp('^' + call) }).check();
  await page.getByRole('button', { name: 'Commit my action' }).click();
  await expect(page.getByText('Action committed', { exact: true })).toBeVisible();
  await page.getByRole('radio', { name: concern, exact: true }).check();
  for (const label of findings) await page.getByRole('checkbox', { name: label, exact: true }).check();
  await page.getByRole('button', { name: 'Submit my response' }).click();
  await expect(page.getByText('Response saved', { exact: true })).toBeVisible();
  await page.getByText('Explore the assessments and bedside checks', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Look at the two assessments.' })).toBeVisible();
}
test('path sequence is fixed and later assignment access is gated', async ({ page }) => {
  await setup(page);
  await expect(page.locator('.mst-path-list > li')).toHaveCount(3);
  await expect(page.getByRole('link', { name: 'Start assignment' })).toHaveCount(1);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.screenshot({ path: artifact(`${width}-track.png`), fullPage: true });
  }
  await page.goto(path + '/a3');
  await expect(page.getByRole('heading', { name: 'This assignment comes later.' })).toBeVisible();
});
for (const width of [390, 768, 1440]) test(`neutral handoff, action-first response, teaching and comparison at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  const requests = await setup(page, seedTrack({ help: 'rounds' }), path + '/a3');
  await expect(page.getByRole('heading', { name: 'Afternoon Handoff', exact: true })).toBeVisible();
  await expect(page.getByText('Possible worsening infection or sepsis', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Your main concern' })).toHaveCount(0);
  await expect(page.getByText(/Worth practicing|One decision to look at|C1 Notice/)).toHaveCount(0);
  await page.getByRole('button', { name: /^Flowsheet/ }).click();
  await expect(page.getByRole('cell', { name: '106/62', exact: true })).toBeVisible();
  expect(await page.locator('.mst-vitals--teaching').count()).toBe(0);
  await page.getByRole('button', { name: /^Admission history/ }).click();
  await page.getByRole('button', { name: /^0800 nursing note/ }).click();
  await page.getByRole('button', { name: /^Bedside/ }).click();
  await page.screenshot({ path: artifact(`${width}-handoff.png`), fullPage: true });
  await respond3(page);
  await expect(page.getByRole('region', { name: 'Your decision comparison' })).toContainText('improvement in these recorded choices');
  await page.getByRole('button', { name: '1400', exact: true }).click();
  await expect(page.locator('.mst-vitals--teaching')).toBeVisible();
  await page.getByRole('button', { name: 'Bedside glucose', exact: true }).click();
  await expect(page.getByText(/Glucose 108 mg\/dL/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole('region', { name: 'Your decision comparison' })).toBeVisible();
  await page.screenshot({ path: artifact(`${width}-debrief.png`), fullPage: true });
  const snapshot = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key);
  expect(snapshot.assignments.a3.runs[0].decisions.call.value.call).toBe('escalate');
  expect(snapshot.assignments.a3.runs[0].decisions.call.independent).toBe(true);
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('A3 action remains locked across refresh before concern choices; non-accepted action cannot earn automatic improvement', async ({ page }) => {
  await setup(page, seedTrack({ help: 'rounds' }), path + '/a3');
  await page.getByRole('radio', { name: /^Continue and reassess/ }).check();
  await page.getByRole('button', { name: 'Commit my action' }).click(); await page.reload();
  await expect(page.getByText('Action committed', { exact: true })).toBeVisible();
  await expect(page.getByRole('radio', { name: /^Escalate now/ })).toHaveCount(0);
  await page.getByRole('radio', { name: 'Tired or sundowning', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Pillow request', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Menu slip', exact: true }).check();
  await page.getByRole('button', { name: 'Submit my response' }).click();
  await expect(page.getByRole('region', { name: 'Your decision comparison' })).toContainText('needs review in both first responses');
  await expect(page.getByRole('region', { name: 'One decision from your shift' })).toContainText('Worth practicing');
});
for (const id of ['a1', 'a2', 'a3']) test(`Rewind ${id} coherent branches, specific information and return preserve originals`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page, seedTrack(), path + '/' + id);
  if (id === 'a3') await respond3(page);
  await expect(page.locator(`[data-track-debrief="${id}"]`)).toBeVisible();
  const before = await page.evaluate(({ key, id }) => JSON.parse(localStorage.getItem(key)!).assignments[id].runs[0].decisions, { key, id });
  const button = page.locator(`[data-track-debrief="${id}"]`).getByRole('button', { name: /Rewind/ }).first();
  await button.click();
  const dialog = page.getByRole('dialog', { name: 'Same moment. Different situation.' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Start Rewind' }).click();
  for (const [index, variation] of REWINDS[id].entries()) {
    await dialog.getByRole('button', { name: 'Choose my response' }).click();
    const title = { reassess: 'Continue and reassess', information: 'Get specific information', notify: 'Notify the provider', escalate: 'Escalate now' }[variation.preferred];
    await dialog.getByRole('radio', { name: new RegExp('^' + title) }).check();
    if (variation.preferred === 'information') await dialog.getByRole('combobox').selectOption(variation.info[0]);
    await dialog.getByRole('button', { name: 'Check my response' }).click();
    await expect(dialog.getByText('Accepted', { exact: true })).toBeVisible();
    if (index < 2) await dialog.getByRole('button', { name: `Try situation ${index + 2}` }).click();
  }
  await dialog.screenshot({ path: artifact(`${id}-rewind-phone.png`) });
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(button).toBeFocused();
  expect(await page.evaluate(({ key, id }) => JSON.parse(localStorage.getItem(key)!).assignments[id].runs[0].decisions, { key, id })).toEqual(before);
  await page.reload();
  await expect(page.locator(`[data-track-debrief="${id}"]`)).toBeVisible();
});
test('content version mismatch preserves raw record for deliberate export, no silently fresh path', async ({ page }) => {
  const seed = { ...seedTrack(), contentVersion: 'future-version' };
  await setup(page, seed);
  await expect(page.getByRole('heading', { name: 'Keep the saved record intact.' })).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).contentVersion, key)).toBe('future-version');
  await page.getByText('Local record and privacy', { exact: true }).click();
  await expect(page.getByRole('button', { name: 'Export preserved record' })).toBeVisible();
});
test('storage failure is visible and in-memory original survives track navigation', async ({ page }) => {
  await setup(page, seedTrack(), path + '/a3');
  await page.evaluate(() => { Storage.prototype.setItem = function () { throw new DOMException('quota', 'QuotaExceededError'); }; });
  await respond3(page);
  await expect(page.getByText(/Device storage unavailable/)).toBeVisible();
  await page.getByRole('link', { name: 'Return to track', exact: false }).click();
  await page.getByRole('link', { name: 'Return to debrief', exact: false }).last().click();
  await expect(page.getByText('Response saved', { exact: true })).toBeVisible();
  await page.getByText('Explore the assessments and bedside checks', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Look at the two assessments.' })).toBeVisible();
});

test('complete actual three-assignment flow preserves source decisions and integrates debriefs', async ({ page }) => {
  test.setTimeout(90000);
  const requests = await setup(page);
  await page.getByRole('link', { name: 'Start assignment' }).click();
  await page.getByRole('button', { name: 'Plan your first assessment' }).click();
  await page.getByRole('button', { name: 'Assess Room 12' }).click();
  await page.getByRole('button', { name: 'Go to Room 12' }).click();
  for (const label of ['Consciousness', 'Breathing']) {
    const cue = page.locator('.shift-cue').filter({ has: page.getByRole('button', { name: new RegExp('^' + label) }) });
    await cue.getByRole('button').click();
  }
  await page.locator('.shift-cue').filter({ hasText: 'Opens his eyes to his name' }).getByRole('checkbox').check();
  await page.locator('.shift-cue').filter({ hasText: 'Respiratory rate 10, shallow' }).getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Confirm 2 cues' }).click();
  await page.getByRole('button', { name: 'Decide what to do now' }).click();
  await page.getByRole('button', { name: /^Stay with him\. Check his airway/ }).click();
  await page.getByRole('button', { name: 'Continue with the response team' }).click();
  await page.getByRole('button', { name: /^Respiratory acidosis with an/ }).click();
  await page.getByRole('button', { name: 'Speak with the provider' }).click();
  await page.getByRole('button', { name: 'Use SBAR A' }).click();
  await page.getByRole('button', { name: 'Finish the shift' }).click();
  await expect(page.locator('[data-track-debrief=a1]').getByRole('region', { name: 'One decision from your shift' })).toHaveCount(0);
  await expect(page.locator('[data-track-debrief=a1]')).not.toContainText('Strong');
  await page.getByRole('link', { name: /^Next assignment/ }).click();
  await page.getByRole('button', { name: 'Plan my round' }).click();
  for (const room of ['412', '414', '410', '416']) await page.locator('.s5-round-rooms').getByRole('button').filter({ hasText: 'ROOM ' + room }).click();
  await page.getByRole('button', { name: 'Something time-sensitive is due', exact: true }).click();
  await page.getByRole('button', { name: 'Set my plan' }).click();
  await page.getByRole('button', { name: 'Continue shift', exact: true }).click();
  const room = id => page.locator('.s5-dispatch').filter({ hasText: 'ROOM ' + id });
  await room('412').getByRole('button', { name: 'You', exact: true }).click();
  await room('410').getByRole('button', { name: 'Jordan', exact: true }).click();
  await room('410').getByRole('button', { name: /high fall risk/ }).click();
  await room('416').getByRole('button', { name: 'Hold / Sam', exact: true }).click();
  await room('416').getByRole('button', { name: /Your nurse knows your ride/ }).click();
  await page.getByRole('button', { name: 'Send assignments' }).click();
  await page.getByRole('button', { name: 'Follow the shift' }).click();
  await page.getByRole('button', { name: 'Continue to 0730' }).click();
  await page.getByRole('button', { name: /^A\. Dee/ }).click();
  await page.getByRole('button', { name: 'Send handoff' }).click();
  await page.getByRole('button', { name: 'Go to Room 414' }).click();
  await page.getByRole('button', { name: 'Call the surgical provider', exact: true }).click();
  await page.getByRole('button', { name: 'Act now' }).click();
  await page.getByRole('button', { name: /HR 88 to 112 and BP 128\/74 to 98\/60/ }).click();
  await page.getByRole('button', { name: 'Give report' }).click();
  await page.getByRole('button', { name: /^Got it: you're coming now/ }).click();
  await page.getByRole('button', { name: 'Respond', exact: true }).click();
  await page.getByRole('button', { name: 'Check the loose ends' }).click();
  for (const card of await page.locator('.s5-loose').all()) await card.locator('button.s5-choice').first().click();
  await page.getByRole('button', { name: "Hear Dee's reply" }).click();
  await page.getByRole('button', { name: 'See shift debrief' }).click();
  await expect(page.locator('[data-track-debrief=a2]')).toContainText('Strong');
  await page.getByRole('link', { name: /^Next assignment/ }).click();
  await page.getByRole('button', { name: /^Flowsheet/ }).click();
  await page.getByRole('button', { name: /^Bedside/ }).click();
  await respond3(page);
  await expect(page.getByRole('region', { name: 'Your decision comparison' })).toContainText('consistency');
  const original = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).assignments.a3.runs[0].decisions, key);
  await page.getByText('Repeat this assignment', { exact: true }).click();
  await page.getByRole('button', { name: 'Start a guided retry' }).click();
  await expect(page.getByText(/Guided retry\. Earlier teaching/)).toBeVisible();
  await respond3(page, 'Continue and reassess', 'No new concern', ['Menu slip', 'Pillow request']);
  const retryFeedback = page.getByRole('region', { name: 'Latest guided retry feedback' });
  await expect(retryFeedback).toContainText('Unsafe');
  await expect(retryFeedback).toContainText('Continue and reassess');
  await expect(retryFeedback).toContainText('No new concern');
  await expect(page.getByRole('region', { name: 'Your decision comparison' })).toContainText('Request urgent bedside evaluation now');
  const after = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key);
  expect(after.assignments.a3.runs[0].decisions).toEqual(original);
  expect(after.assignments.a3.runs[1].decisions.call.independent).toBe(false);
  expect(await page.evaluate(() => localStorage.getItem('ce-private-shift-drowsy-r2'))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('ce_shift_005_v04'))).toBeNull();
  expect(requests).toEqual([]);
});


test('320px reduced-motion keyboard flow keeps sheet focus, controls and return accessible', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await setup(page, seedTrack(), path + '/a3');
  // Inspecting nothing is permitted; the locked action still precedes the concern options.
  await respond3(page);
  const original = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).assignments.a3.runs[0], key);
  expect(original.snapshot.committed.opened).toEqual([]);
  const trigger = page.getByRole('button', { name: /Explore Rewind/ });
  await trigger.focus(); await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  const close = dialog.getByRole('button', { name: 'Close Rewind and return to debrief' });
  await expect(dialog.getByRole('heading', { name: 'What is Rewind?' })).toBeFocused();
  for (let n = 0; n < 12; n++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
  }
  await dialog.getByRole('button', { name: 'Start Rewind' }).click();
  await dialog.getByRole('button', { name: 'Choose my response' }).click();
  await dialog.getByRole('radio', { name: /^Continue and reassess/ }).focus();
  await page.keyboard.press('Space');
  await dialog.getByRole('button', { name: 'Check my response' }).click();
  await expect(dialog.getByRole('heading', { name: 'Here is the reasoning.' })).toBeFocused();
  await expect(close).toBeInViewport();
  expect(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
  const heights = await dialog.locator('button').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().height));
  expect(heights.every(height => height >= 44)).toBe(true);
  await dialog.screenshot({ path: artifact('320-rewind-keyboard.png') });
  await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: '1400', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('table')).toContainText('Changed from');
  await page.getByText('Local record and privacy', { exact: true }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export my record' }).click();
  expect((await download).suggestedFilename()).toBe('clinical-edge-med-surg-record.json');
  await page.getByRole('button', { name: 'Clear track record', exact: true }).click();
  await page.getByRole('button', { name: 'Keep record', exact: true }).click();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).assignments.a3.runs[0].decisions, key)).toEqual(original.decisions);
});

test('Rewind partial summary preserves progress and continues to the next Shift', async ({ page }) => {
  await setup(page, seedTrack(), path + '/a1');
  const invite = page.getByRole('region', { name: 'Optional Rewind practice' });
  await expect(invite).toContainText('0 of 3 situations tried');
  await invite.getByRole('button', { name: 'Explore Rewind' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Start Rewind' }).click();
  await dialog.getByRole('button', { name: 'Choose my response' }).click();
  await dialog.getByRole('radio', { name: /^Escalate now/ }).check();
  await dialog.getByRole('button', { name: 'Check my response' }).click();
  await expect(dialog.getByRole('heading', { name: 'Findings behind this response' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Finish for now and see summary' }).click();
  await expect(dialog.getByRole('region', { name: 'Rewind summary' })).toContainText('1 of 3 situations tried');
  await expect(dialog.getByText('Not tried yet', { exact: true })).toHaveCount(2);
  await dialog.getByRole('button', { name: 'Close Rewind and return to debrief' }).click();
  await expect(invite.getByRole('button', { name: 'Continue Rewind' })).toBeVisible();
  await page.reload();
  await invite.getByRole('button', { name: 'Continue Rewind' }).click();
  await dialog.getByRole('button', { name: 'Continue Rewind' }).click();
  await expect(dialog.getByRole('heading', { name: /Situation 2 of 3/ })).toBeVisible();
  await dialog.getByRole('button', { name: 'Choose my response' }).click();
  await dialog.getByRole('radio', { name: /^Continue and reassess/ }).check();
  await dialog.getByRole('button', { name: 'Check my response' }).click();
  await dialog.getByRole('button', { name: 'Finish for now and see summary' }).click();
  await dialog.getByRole('button', { name: 'Continue to the next Shift' }).click();
  await expect(page).toHaveURL(/\/med-surg\/a2$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('reviewing saved feedback adds no attempt and out-of-order practice leads to the untried situation', async ({ page }) => {
  await setup(page, seedTrack(), path + '/a1');
  await page.getByRole('button', { name: 'Explore Rewind' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Start Rewind' }).click();
  await dialog.getByRole('button', { name: 'Choose my response' }).click();
  await dialog.getByRole('radio', { name: /^Escalate now/ }).check();
  await dialog.getByRole('button', { name: 'Check my response' }).click();
  await dialog.getByRole('button', { name: 'Finish for now and see summary' }).click();
  const attemptsBefore = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).assignments.a1.rewind.attempts, key);
  await dialog.getByRole('button', { name: `Review feedback: ${REWINDS.a1[0].title}` }).click();
  await expect(dialog.getByRole('region', { name: 'Practice feedback' })).toContainText('Your latest response: Escalate now');
  await dialog.getByRole('button', { name: 'Finish for now and see summary' }).click();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).assignments.a1.rewind.attempts, key)).toEqual(attemptsBefore);
  await dialog.getByRole('button', { name: `Try situation: ${REWINDS.a1[2].title}` }).click();
  await dialog.getByRole('button', { name: 'Choose my response' }).click();
  await dialog.getByRole('radio', { name: /^Continue and reassess/ }).check();
  await dialog.getByRole('button', { name: 'Check my response' }).click();
  await dialog.getByRole('button', { name: 'Try situation 2' }).click();
  await expect(dialog.getByRole('heading', { name: /Situation 2 of 3/ })).toBeVisible();
});

test('clearing progress in another tab closes Rewind without a stale-assignment crash', async ({ page, context }) => {
  await setup(page, seedTrack(), path + '/a1');
  await page.getByRole('button', { name: 'Explore Rewind' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const other = await context.newPage();
  await other.goto(path);
  await other.evaluate(key => localStorage.removeItem(key), key);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.mst-root')).toBeVisible();
  await other.close();
});
