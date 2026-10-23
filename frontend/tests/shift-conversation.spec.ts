import { test, expect, type Page } from '@playwright/test';
import { actions, cues, opening, asking, confidentiality, script, zones } from '../src/modules/the-shift/conversation/data.js';
import { fresh, KEY, LEGACY_KEY } from '../src/modules/the-shift/conversation/progress.js';
const route = '/learn/shifts/conversation';
const captures = '../artifacts/scenario-4-release';
const accepted = { stay: 'first', notify: 'first', means: 'together', assess: 'first', talk: 'then', document: 'then', charge: 'not-now', pump: 'not-now' };
test.beforeEach(async ({ page }) => {
  await page.route('**/*', request => {
    const url = new URL(request.request().url());
    if (url.hostname === 'fonts.googleapis.com') return request.fulfill({ contentType: 'text/css', body: '' });
    if (url.hostname === 'va.vercel-scripts.com') return request.fulfill({ contentType: 'application/javascript', body: '' });
    expect(url.hostname, 'No external data transmission').toBe('127.0.0.1');
    expect(request.request().method()).toBe('GET');
    expect(url.pathname).not.toMatch(/\/api\//);
    return request.continue();
  });
  page.on('pageerror', error => { throw error; });
  await page.emulateMedia({ reducedMotion: 'reduce' });
});
async function begin(page: Page, opener = 0) {
  await page.goto(route);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Begin your first check' }).click();
  await page.getByRole('button', { name: opening[opener].text, exact: false }).click();
  await page.getByRole('button', { name: 'Listen to what he says' }).click();
  if (opener !== 0) await expect(page.getByText(script.bridges.opening, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Read all five lines' }).click();
}
async function toActions(page: Page, direct = 0) {
  await page.getByRole('button', { name: cues[2].text, exact: false }).click();
  await page.getByRole('button', { name: cues[4].text, exact: false }).click();
  await page.getByRole('button', { name: 'Reflect on these words' }).click();
  await page.getByRole('button', { name: 'Keep the conversation open' }).click();
  await page.getByRole('button', { name: asking[direct].text, exact: false }).click();
  if (direct !== 0) await expect(page.getByText(script.bridges.asking, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Consider your next actions' }).click();
}
async function placeAll(page: Page, wrong = false) {
  for (const action of actions) {
    await page.getByRole('button', { name: `${action.text}. Place action`, exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: new RegExp(`^${zones.find(zone => zone.id === (wrong && action.id === 'pump' ? 'first' : accepted[action.id]))!.title}`) }).click();
  }
  await page.getByRole('button', { name: 'Review my actions' }).click();
  await expect(page.locator('.conversation-action-review article')).toHaveCount(8);
  await expect(page.locator('.conversation-action-review article > .conversation-eyebrow').filter({ hasText: 'Accepted' })).toHaveCount(wrong ? 7 : 8);
  if (wrong) await expect(page.locator('[data-review-action=pump]')).toContainText('Unsafe');
  await page.getByRole('button', { name: 'Continue the conversation' }).click();
  await expect(page.getByText(script.bridges.actions, { exact: true })).toHaveCount(wrong ? 1 : 0);
}
async function finish(page: Page, choice = 0) {
  await page.getByRole('button', { name: confidentiality[choice].text, exact: false }).click();
  await page.getByRole('button', { name: 'Reflect on your night' }).click();
  await expect(page.getByText(script.bridges.confidentiality, { exact: true })).toHaveCount(choice === 0 ? 0 : 1);
}
async function noOverflow(page: Page) {
  expect(await page.locator('.ce-shift-feature').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  expect(await page.locator('body').evaluate(el => el.scrollWidth <= innerWidth + 1)).toBe(true);
}
test('mobile complete play, accurate debrief, support, handoff and local resumption', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  await expect(page.getByText(script.notice, { exact: true })).toBeVisible();
  await page.locator('.ce-shift-feature').evaluate(el => { el.scrollTop = 0; });
  await page.screenshot({ path: `${captures}/390-content-notice.png` });
  await begin(page);
  await page.getByRole('button', { name: cues[2].text, exact: false }).click();
  await page.locator('.conversation-scene-heading').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${captures}/390-listening.png` });
  await page.getByRole('button', { name: cues[2].text, exact: false }).click();
  await toActions(page);
  await expect(page.getByText(script.actionGuidance, { exact: true })).toBeVisible();
  await page.locator('.conversation-zones').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${captures}/390-action-groups.png` });
  await page.getByRole('button', { name: `${actions[0].text}. Place action`, exact: true }).click();
  await page.screenshot({ path: `${captures}/390-action-placement.png` });
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
  await placeAll(page);
  await finish(page);
  await expect(page.getByRole('heading', { name: script.ending.direct, exact: true })).toBeVisible();
  await expect(page.getByText('You opened the door instead of closing it.', { exact: true })).toBeVisible();
  await expect(page.getByText('You asked directly.', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Call 988', exact: true })).toHaveAttribute('href', 'tel:988?oai_link_source=model_response_hotline');
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  await page.locator('.conversation-scene-heading').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${captures}/390-debrief.png` });
  for (const title of ['Key takeaways', 'Your personalized shift review', 'Why it matters', 'Supporting sources', 'Continue learning', 'You can step away.']) await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  await page.locator('.conversation-why').scrollIntoViewIfNeeded();
  await expect(page.getByText(script.assessmentNote, { exact: true })).toBeVisible();
  await page.screenshot({ path: `${captures}/390-debrief-sources.png` });
  await page.locator('.conversation-support').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${captures}/390-support.png` });
  expect(await page.locator('.conversation-takeaways').evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(await page.locator('.conversation-reflections').evaluate(el => getComputedStyle(el).backgroundColor));
  await page.getByRole('link', { name: /Prepare a question/ }).click();
  await expect(page.locator('.shift-handoff blockquote')).toHaveText(script.ask);
  await expect(page.getByText(/Ask may decline it/)).toBeVisible();
  await page.getByRole('link', { name: /Return to The Conversation/ }).click();
  await expect(page.getByRole('button', { name: 'Yes', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Night challenge complete' })).toBeVisible();
  expect(await page.locator('.conversation-root').innerText()).not.toMatch(/\\["']/);
  await noOverflow(page);
});
test('missed choices remain missed; guided story never earns false therapeutic praise', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await begin(page, 2);
  await toActions(page, 1);
  await placeAll(page, true);
  await finish(page, 1);
  await expect(page.getByText('You opened the door instead of closing it.', { exact: true })).toHaveCount(0);
  await expect(page.getByText('You asked directly.', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Never promise secrecy about safety.', { exact: true })).toBeVisible();
  await expect(page.getByText(script.actionReflections[0], { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: script.ending.guided, exact: true })).toBeVisible();
  await expect(page.getByText(script.ending.limitation, { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: script.ending.direct, exact: true })).toHaveCount(0);
  await page.locator('.conversation-reflections').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${captures}/1440-choice-specific-review.png` });
  await page.reload();
  await expect(page.getByText('You asked directly.', { exact: true })).toHaveCount(0);
  await noOverflow(page);
});
test('skip shows support without requiring play, then returns to five-scenario library', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  await page.getByRole('button', { name: 'Skip this Shift', exact: true }).click();
  await expect(page.getByText(script.support, { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Text 988' })).toHaveAttribute('href', 'sms:988?oai_link_source=model_response_hotline');
  await page.getByRole('link', { name: 'Return to Shift Library' }).click();
  await expect(page.locator('.shift-library-card')).toHaveCount(6);
  for (const text of ['The Drowsy Patient', 'The Monitor Alarm', 'The Discharge Puzzle']) await expect(page.getByRole('heading', { name: text })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.screenshot({ path: `${captures}/1440-private-library.png` });
});
test('keyboard action placement, focus restoration, small viewport, enlarged text and dock clearance', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 667 });
  await begin(page);
  await toActions(page);
  const card = page.getByRole('button', { name: `${actions[0].text}. Place action`, exact: true });
  await card.focus(); await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const bounds = await dialog.boundingBox();
  expect(bounds!.x).toBeGreaterThan(10);
  expect(bounds!.y).toBeGreaterThan(10);
  await dialog.getByRole('button', { name: /^Immediate response/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-zone=first]').getByRole('button')).toContainText(actions[0].text);
  await expect(page.locator('[data-action-id=stay]')).toBeFocused();
  await expect(page.getByRole('status')).toHaveText('Action placed in Immediate response.');
  await page.getByRole('button', { name: 'Support', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Support', exact: true })).toBeFocused();
  await page.addStyleTag({ content: '.conversation-root p,.conversation-root button,.conversation-root li{font-size:24px!important}' });
  await page.getByRole('button', { name: 'Review my actions' }).scrollIntoViewIfNeeded();
  const button = await page.getByRole('button', { name: 'Review my actions' }).boundingBox();
  const dock = await page.getByRole('navigation', { name: 'Clinical Edge workspace' }).boundingBox();
  if (dock && button) expect(button.y + button.height).toBeLessThanOrEqual(dock.y);
  await noOverflow(page);
  await page.screenshot({ path: `${captures}/390-enlarged-text.png` });
});
for (const version of ['0.2', '0.3']) test(`saved v${version} record stays intact without fabricated v0.4 answers`, async ({ page }) => {
  const oldActions = { ...accepted }; delete oldActions.talk;
  const original = JSON.stringify({ version: '0.2', actionContentVersion: version, notice: true, stage: 6, revealed: 5, answers: { opening: 'presence', cues: ['burden', 'watch'], asking: 'direct', actions: oldActions, confidentiality: 'honest' }, tomorrow: 'Maybe' });
  await page.addInitScript(({ key, original }) => localStorage.setItem(key, original), { key: LEGACY_KEY, original });
  await page.goto(route);
  await page.getByText(`Saved v${version} play`, { exact: true }).click();
  await expect(page.locator('.conversation-saved-play li').filter({ hasText: 'Keep talking with him, and document what he said in his own words' })).toBeVisible();
  await expect(page.getByText(`Your original group: ${version === '0.2' ? 'Then' : 'Ongoing care & documentation'}`, { exact: true })).toBeVisible();
  await expect(page.getByText('Another shift tomorrow: Maybe', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  const current = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), KEY);
  expect(current.version).toBe('0.4'); expect(current.answers).toEqual({});
  await page.getByRole('button', { name: 'Restart Scenario 4', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Restart', exact: true }).click();
  expect(await page.evaluate(key => localStorage.getItem(key), LEGACY_KEY)).toBe(original);
});
test('desktop action grouping and partially correct debrief do not imply rigid timing', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await begin(page); await toActions(page);
  await page.locator('.conversation-zones').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${captures}/1440-action-groups.png` });
  for (const action of actions) {
    await page.getByRole('button', { name: `${action.text}. Place action`, exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: new RegExp(`^${zones.find(zone => zone.id === (action.id === 'assess' ? 'then' : accepted[action.id]))!.title}`) }).click();
  }
  await page.getByRole('button', { name: 'Review my actions' }).click();
  await expect(page.getByText(script.actionReview, { exact: true })).toBeVisible();
  await expect(page.locator('[data-review-action=assess]')).toContainText('Revisit');
  await expect(page.locator('[data-review-action=assess]')).toContainText('Asking more helps the team understand his risk now.');
  await page.getByRole('button', { name: 'Continue the conversation' }).click();
  await finish(page);
  await expect(page.getByText(script.actionReflections[2], { exact: true })).toBeVisible();
  await expect(page.locator('.conversation-reflections article').nth(3)).toContainText('Revisit');
  await page.locator('.conversation-scene-heading').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${captures}/1440-debrief.png` });
  await noOverflow(page);
});
for (const omitted of ['stay', 'notify', 'means']) test(`omitted ${omitted} is Unsafe with its specific feedback and safer outcome`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), { key: KEY, state: { ...fresh(), notice: true, stage: 4, revealed: 5, answers: { opening: 'presence', cues: ['burden', 'watch'], asking: 'direct' }, placements: { ...accepted, [omitted]: 'not-now' } } });
  await page.goto(route);
  await page.getByRole('button', { name: 'Review my actions' }).click();
  await expect(page.locator(`[data-review-action=${omitted}] > span`)).toHaveText('Unsafe');
  await expect(page.locator(`[data-review-action=${omitted}]`)).toContainText(actions.find(item => item.id === omitted)!.placements.find(rule => rule.status === 'Unsafe')!.feedback);
  if (omitted === 'notify') { await page.locator('[data-review-action=notify]').scrollIntoViewIfNeeded(); await page.screenshot({ path: `${captures}/390-specific-feedback.png` }); }
  await page.getByRole('button', { name: 'Continue the conversation' }).click();
  await expect(page.getByText(script.bridges.actions, { exact: true })).toBeVisible();
  if (omitted === 'notify') { await page.locator('.conversation-scene-heading').scrollIntoViewIfNeeded(); await page.screenshot({ path: `${captures}/390-safer-bridge.png` }); }
  await finish(page);
  await expect(page.getByRole('heading', { name: script.ending.guided, exact: true })).toBeVisible();
  await expect(page.getByText(script.actionReflections[1], { exact: true })).toBeVisible();
  expect(await page.locator('.conversation-root').innerText()).not.toMatch(/\\["']/);
  if (omitted === 'notify') { await page.locator('.conversation-scene-heading').scrollIntoViewIfNeeded(); await page.screenshot({ path: `${captures}/390-guided-ending.png` }); }
});
test('tablet scene and existing scene progress remain independent', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/learn/shifts/drowsy-patient');
  await page.getByRole('button', { name: 'Plan your first assessment' }).click();
  const original = await page.evaluate(() => localStorage.getItem('ce-private-shift-drowsy-r2'));
  await begin(page);
  await page.locator('.conversation-scene-heading').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${captures}/768-listening.png` });
  await noOverflow(page);
  await page.getByRole('link', { name: 'Shift Library', exact: false }).first().click();
  await page.locator('.shift-library-card').first().getByRole('link', { name: /Continue shift/ }).click();
  await expect(page.getByRole('heading', { name: 'Who do you see first?' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('ce-private-shift-drowsy-r2'))).toBe(original);
});
test('storage unavailable stays playable, restart affects only Scenario 4', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = function () { throw Error('unavailable'); }; });
  await page.goto(route);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('Device storage unavailable. Progress lasts only in this tab.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Restart Scenario 4', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Restart', exact: true }).click();
  await expect(page.getByText(script.notice, { exact: true })).toBeVisible();
});
