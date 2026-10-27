import { test, expect, Page } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
const url = process.env.SHIFT10_RELEASE_URL || pathToFileURL(path.resolve('..', 'private-preview', 'shift10.html')).href;
const key = 'ce-private-shift10-v02-attempt';
const screenshotDir = path.resolve('..', 'verification', 'screenshots-usability');
// Reuse the gameplay suite against the built app without sending analytics or AI requests.
test.beforeEach(async ({ page }) => {
  if (!process.env.SHIFT10_RELEASE_URL) return;
  const fixture = JSON.parse(readFileSync(new URL('./fixtures/consented-storage.json', import.meta.url), 'utf8'));
  await page.addInitScript(items => {
    for (const item of items) localStorage.setItem(item.name, item.name === 'ce_consent' ? JSON.stringify({ ...JSON.parse(item.value), analytics: false }) : item.value);
    localStorage.setItem('ce_product_analytics_exclude', '1');
  }, fixture.origins[0].localStorage);
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
});

async function start(page: Page) {
  await page.goto(url); await page.evaluate(k => localStorage.removeItem(k), key); await page.reload();
  await page.getByRole('button', { name: 'Answer Dana’s call' }).click();
}
async function receive(page: Page, topics: string[] = [], prepScreenshot?: string) {
  if (topics.length) {
    await page.getByRole('button', { name: 'Call Marisol', exact: true }).click();
    for (const topic of topics) await page.getByRole('button', { name: topic }).click();
    await page.getByRole('button', { name: 'Raise these with Marisol' }).click();
    if (prepScreenshot) await page.screenshot({ path: prepScreenshot, fullPage: true });
    await page.getByRole('button', { name: 'Return to Dana’s report' }).click();
  }
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Go on', exact: false }).click();
  await page.getByRole('button', { name: 'End report & receive Ruth' }).click();
}
async function assess(page: Page) {
  await page.getByRole('button', { name: 'Talk with Ruth', exact: true }).click();
  await page.getByRole('button', { name: /^Talk with Ruth [↗✓]/ }).click();
  await page.getByRole('button', { name: /^Stay in conversation/ }).click();
  await page.getByRole('button', { name: 'Talk with Adaeze', exact: true }).click();
  await page.getByRole('button', { name: /^Ask Adaeze/ }).click();
  await page.getByRole('button', { name: 'Receiving observations' }).click();
  await page.getByRole('button', { name: /^Take vital signs/ }).click();
  await page.getByRole('tab', { name: /^Chart/ }).click();
  await page.getByRole('button', { name: /^ED medication record/ }).click();
  await page.getByRole('button', { name: /^Lab list/ }).click();
}
async function call(page: Page, lead = 'I’m concerned about her confusion.', providerScreenshot?: string) {
  await page.getByRole('button', { name: /^Call Dr. Lin(?: back)?$/, exact: true }).click();
  // Authored text uses straight apostrophes inside the call choices.
  await page.getByRole('button', { name: lead.replace('I’m', "I'm") }).click();
  if (providerScreenshot) await page.screenshot({ path: providerScreenshot, fullPage: true });
  for (let i = 0; i < 4; i++) {
    const dialog = page.getByRole('dialog');
    const buttons = dialog.locator('.s10-choice');
    const count = await buttons.count();
    for (let j = 0; j < count - 1; j++) await buttons.nth(j).click();
    await page.getByRole('button', { name: 'Say this to Dr. Lin' }).click();
  }
  const selects = page.getByRole('dialog').getByRole('combobox');
  for (let i = 0; i < await selects.count(); i++) await selects.nth(i).selectOption('You, receiving RN');
  await page.getByRole('button', { name: 'Give my commitments & close call' }).click();
}
for (const [route, topics, room] of [
  ['A', ['The ordered monitoring and the room capability.', 'The diarrhea, pending test and isolation placement.'], '422'],
  ['B', ['The ordered monitoring and the room capability.'], '422'],
  ['C', ['The diarrhea, pending test and isolation placement.'], '410'],
  ['D', [], '418B'],
] as [string, string[], string][]) {
  test(`complete browser playthrough ${route}`, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await start(page); await receive(page, topics);
    await expect(page.locator('.s10-room-label')).toContainText(`Room ${room}`);
    if (route === 'D') await expect(page.locator('.s10-exposure')).toContainText('Mr. Bell is exposed');
    await assess(page); await call(page);
    await page.getByRole('button', { name: 'Finish receiving care' }).click();
    await page.getByRole('button', { name: 'Close with my current record' }).click();
    await expect(page.getByRole('heading', { name: 'What your receiving care carried.' })).toBeVisible();
    await expect(page.locator('.s10-debrief')).toContainText(`Room path ${route}`);
    await page.reload(); await expect(page.locator('.s10-debrief')).toContainText(`Room path ${route}`);
    expect(errors).toEqual([]);
  });
}
test('report interruption, unopened record, follow-up question and resume', async ({ page }) => {
  await start(page); await page.getByRole('tab', { name: /^Chart/ }).click();
  await expect(page.locator('.s10-report')).toContainText('Segment 1 of 6');
  await expect(page.locator('.s10-workspace')).not.toContainText('1340');
  await page.getByRole('button', { name: 'Pause to ask Dana' }).click();
  await page.getByRole('button', { name: /^When was the pain medication/ }).click();
  await page.getByRole('button', { name: /^Can you give me the time/ }).click();
  await expect(page.locator('.s10-clarification')).toContainText('1340, I think.');
  await page.reload(); await expect(page.locator('.s10-report')).toContainText('Segment 1 of 6');
  await page.getByRole('button', { name: /^ED medication record/ }).click();
  await expect(page.locator('.s10-workspace')).toContainText('1340');
});
test('unknown assessment returns to bedside without invented answers', async ({ page }) => {
  await start(page); await receive(page);
  await page.getByRole('button', { name: 'Call Dr. Lin', exact: true }).click();
  await page.getByRole('button', { name: "I'm calling about a new admission." }).click();
  await expect(page.getByRole('dialog').locator('.s10-choice')).toHaveCount(1);
  await page.getByRole('button', { name: "I haven't checked her closely yet." }).click();
  await page.getByRole('button', { name: 'Say this to Dr. Lin' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.s10-desk')).toContainText('Go back and look, then call me.');
});
for (const width of [375, 390, 1440]) test(`layout and screenshots ${width}px`, async ({ page }) => {
  await mkdir(screenshotDir, { recursive: true });
  await page.setViewportSize({ width, height: width > 700 ? 1000 : 844 });
  await page.goto(url); await page.evaluate(k => localStorage.removeItem(k), key); await page.reload();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: path.join(screenshotDir, `intro-${width}.png`), fullPage: true });
  await page.getByRole('button', { name: 'Answer Dana’s call' }).click();
  if (width < 700) {
    await expect(page.locator('.s10-nav-records')).not.toBeVisible();
    await page.getByRole('navigation', { name: 'Quick scenario navigation' }).getByRole('button', { name: 'Workspace', exact: true }).click();
    await expect(page.locator('#s10-workspace')).toBeFocused();
    await expect(page.locator('.s10-workspace')).not.toContainText('1340');
    await page.getByRole('button', { name: 'Back to Dana' }).click();
    await expect(page.locator('#s10-primary-scene')).toBeFocused();
  }
  await page.screenshot({ path: path.join(screenshotDir, `report-${width}.png`), fullPage: true });
  await receive(page, ['The ordered monitoring and the room capability.', 'The diarrhea, pending test and isolation placement.'], path.join(screenshotDir, `room-preparation-${width}.png`));
  await page.screenshot({ path: path.join(screenshotDir, `arrival-${width}.png`), fullPage: true });
  await assess(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: path.join(screenshotDir, `bedside-${width}.png`), fullPage: true });
  await call(page, 'I’m concerned about her confusion.', path.join(screenshotDir, `provider-call-${width}.png`));
  await page.getByRole('button', { name: 'Finish receiving care' }).click();
  await page.getByRole('button', { name: 'Close with my current record' }).click();
  await page.screenshot({ path: path.join(screenshotDir, `debrief-${width}.png`), fullPage: true });
});
test('keyboard, tab arrows, dialog focus and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await start(page);
  const orders = page.getByRole('tab', { name: /^Orders/ }); await orders.focus(); await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: /^Rooms/ })).toBeFocused();
  await expect(page.getByRole('tab', { name: /^Rooms/ })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('button', { name: 'Call Marisol', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(() => document.querySelector('dialog')?.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).not.toBeVisible();
  await orders.focus();
  expect(await orders.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
  await page.getByRole('button', { name: 'Open Chart', exact: true }).click();
  await expect(page.getByRole('tab', { name: /^Chart/ })).toBeFocused();
  await expect(page.locator('.s10-report')).toContainText('Segment 1 of 6');
  await page.getByRole('button', { name: 'Back to Dana' }).click();
  await expect(page.locator('#s10-primary-scene')).toBeFocused();
});

test('guidance is optional and source controls introduce the unit team', async ({ page }) => {
  await start(page);
  await expect(page.getByRole('navigation', { name: 'Records and unit team' })).toBeVisible();
  await expect(page.locator('.s10-nav-team')).toContainText('4 West charge RN');
  await expect(page.locator('.s10-nav-team')).toContainText('Admitting provider');
  await page.getByText('How this works', { exact: true }).click();
  await expect(page.locator('.s10-how')).toContainText('Investigations are optional');
  await receive(page);
  await expect(page.locator('.s10-room-label')).toContainText('418B');
  await page.getByRole('button', { name: 'Nursing actions', exact: true }).click();
  await expect(page.locator('#s10-safety')).toBeFocused();
});

test('baseline callback keeps the first call and resumes receiving care', async ({ page }) => {
  await start(page); await receive(page);
  await page.getByRole('button', { name: /^Talk with Ruth [↗✓]/ }).click();
  await page.getByRole('button', { name: 'Call Dr. Lin', exact: true }).click();
  await page.getByRole('button', { name: "I'm concerned about her confusion." }).click();
  await page.getByRole('dialog').locator('.s10-choice').first().click();
  await page.getByRole('button', { name: 'Say this to Dr. Lin' }).click();
  await page.getByRole('button', { name: "I don't know yet.", exact: true }).click();
  await page.getByRole('button', { name: 'Say this to Dr. Lin' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Call Dr. Lin back', exact: true })).toBeEnabled();
  await assess(page); await call(page);
  await page.getByRole('button', { name: 'Finish receiving care' }).click();
  await page.getByRole('button', { name: 'Close with my current record' }).click();
  await expect(page.locator('.s10-debrief')).toContainText('2 call attempt(s)');
  await page.getByRole('button', { name: 'Replay this Shift' }).click();
  await page.getByRole('button', { name: 'Start again', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Answer Dana’s call' })).toBeVisible();
});
