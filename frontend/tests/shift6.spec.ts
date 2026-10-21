import { test, expect, type Page } from '@playwright/test';
import { d1, d2, d4, d6, debrief, FLOWSHEET_SR, REWIND } from '../src/modules/the-shift/shift6/data.js';

const PATH = '/learn/shifts/stable-number';
const KEY = 'ce-shift-stable-number-v0.4';
const PREVIEW = process.env.VITE_SHIFT_006_PREVIEW === 'true';
const ESSENTIAL = ['situation', 'background', 'assessment'];
const progress = (stage: number, answers: Record<string, unknown> = {}) => ({ version: 1, contentVersion: '0.4', stage, viewed: [], revealed: [], selected: [], sbarDraft: { chips: [], recommendation: null }, answers, tomorrow: null });

async function seed(page: Page, value: object) {
  await page.goto(PATH);
  await page.evaluate(([key, saved]) => localStorage.setItem(key, saved), [KEY, JSON.stringify(value)]);
  await page.reload();
}
const feedback = (page: Page) => page.getByRole('region', { name: 'Decision feedback' });
const cue = (page: Page, label: string) => page.locator('.shift-cue').filter({ has: page.locator('.shift-overline', { hasText: new RegExp(`^${label}$`) }) });

test.describe('preview gate', () => {
  test.skip(PREVIEW, 'Checks the production configuration, with the preview flag off.');
  test('Shift 06 is absent from the library and unreachable by direct navigation', async ({ page }) => {
    await page.goto(PATH);
    await expect(page.getByText('The Stable Number')).toHaveCount(0);
    await expect(page.getByText('Hartwell')).toHaveCount(0);
    await page.goto('/learn/shifts');
    await expect(page.getByText('The Stable Number')).toHaveCount(0);
  });
});

test.describe('Shift 06 preview', () => {
  test.skip(!PREVIEW, 'SHIFT-006 runs only with VITE_SHIFT_006_PREVIEW=true.');
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/**', route => { throw new Error(`Shift 06 must not call ${route.request().url()}`); });
  });

  test('library lists Shift 06 without Draft markings and with an honest review record', async ({ page }) => {
    await page.goto('/learn/shifts');
    const card = page.locator('.shift-library-card').filter({ hasText: 'The Stable Number' });
    await expect(card).toContainText('Med-Surg / Foundations');
    await expect(card).not.toContainText('Draft');
    await card.getByRole('link', { name: /Begin shift|Continue shift|Return to debrief/ }).click();
    await expect(page).toHaveURL(new RegExp(`${PATH}$`));
    await expect(page.locator('.shift-app')).not.toContainText(/\bDraft\b/);
    await expect(page.locator('.shift-footer')).toContainText('Clinical sign-off not yet recorded');
    await page.getByRole('button', { name: 'Sources & review' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Founder review and independent clinical sign-off have not been recorded.');
    await expect(dialog).not.toContainText('Draft');
    await expect(dialog).toContainText('SHIFT-006 / 0.4');
    await expect(dialog.locator('ol li')).toHaveCount(5);
    await expect(dialog).not.toContainText('OpenStax');
  });

  // The stage number equals the decision number for these single-choice decisions.
  for (const [stage, decision, answers] of [
    [1, d1, {}], [2, d2, { d1: '14' }],
    [4, d4, { d1: '14', d2: '1200', d3: ['stool', 'standing', 'skin'] }],
    [6, d6, { d1: '14', d2: '1200', d3: ['stool', 'standing', 'skin'], d4: 'escalate', d5: { chips: ESSENTIAL, recommendation: 'bedside' } }],
  ] as const) for (const choice of decision.choices) test(`D${stage} choice ${choice.id} shows its spec label and feedback`, async ({ page }) => {
    await seed(page, progress(stage, answers));
    if (decision === d2) {
      await page.getByRole('button', { name: `Today ${choice.id}`, exact: true }).click();
      await page.getByRole('button', { name: 'Confirm this time' }).click();
    } else if (decision === d1 && choice.id === 'flowsheets') await page.getByRole('button', { name: choice.text }).click();
    else await page.getByRole('button', { name: choice.text, exact: true }).click();
    await expect(feedback(page).getByRole('heading', { level: 3 })).toHaveText(choice.result);
    await expect(feedback(page)).toContainText(choice.feedback);
    if (choice.result === 'Close') await expect(feedback(page)).toContainText('Partially correct');
    if (decision.teaching) await expect(feedback(page)).toContainText(decision.teaching);
    if (decision === d4) await expect(feedback(page)).toContainText(d4.whileHelp);
  });

  async function play(page: Page, correct: boolean) {
    await page.goto(PATH);
    await page.getByRole('button', { name: 'Restart the shift' }).click();
    await page.getByRole('dialog').getByRole('button', { name: /^Restart/ }).click();
    await page.getByRole('button', { name: 'Plan your first assessment' }).click();
    await page.getByRole('button', { name: correct ? 'Room 14, Mr. Hartwell' : 'Room 12, Ms. Ruiz', exact: true }).click();
    await page.getByRole('button', { name: 'Go to Room 14' }).click();
    await page.getByRole('button', { name: correct ? 'Today 1200' : 'Today 0800', exact: true }).click();
    await page.getByRole('button', { name: 'Confirm this time' }).click();
    await page.getByRole('button', { name: 'Go to his bedside' }).click();
    for (const label of correct ? ['Skin', 'Standing', 'Stool', 'Morning labs'] : ['Left leg']) {
      await page.locator('.shift-cues').getByRole('button', { name: label, exact: true }).click();
      await cue(page, label).getByRole('checkbox').check();
    }
    await page.getByRole('button', { name: /^Confirm \d+ finding/ }).click();
    await expect(feedback(page).getByRole('heading', { level: 3 })).toHaveText(correct ? 'Correct' : 'No');
    await page.getByRole('button', { name: 'Make your call' }).click();
    await page.getByRole('button', { name: correct ? d4.choices[0].text : d4.choices[4].text, exact: true }).click();
    await page.getByRole('button', { name: 'Make the call' }).click();
    for (const text of correct ? ['"Dale Hartwell, 71, Room 14.', '"Day 2 for left leg cellulitis.', '"His heart rate has climbed'] : [`"He's probably anxious`]) await page.getByRole('button', { name: new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) }).click();
    await page.getByRole('radio', { name: correct ? /I need someone at the bedside now/ : /Should I just keep watching him/ }).check();
    await page.getByRole('button', { name: 'Give the call' }).click();
    await expect(feedback(page).getByRole('heading', { level: 3 })).toHaveText(correct ? 'Correct' : 'No');
    await page.getByRole('button', { name: 'Return to the hallway' }).click();
    await page.getByRole('button', { name: correct ? 'Continue and reassess' : 'Escalate now', exact: true }).click();
    await page.getByRole('button', { name: 'Finish the shift' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Night challenge complete.' })).toBeVisible();
  }

  test('all-correct shift reaches a debrief in the fixed order with correct review lines', async ({ page }) => {
    await play(page, true);
    const headings = await page.locator('#shift-main h2').allTextContents();
    expect(headings.slice(0, 4)).toEqual(['How the night unfolded', 'Your shift review', 'Why it happens', 'Go further']);
    const review = page.locator('.s6-review');
    for (const line of Object.values(debrief.review)) await expect(review).toContainText(line.correct);
    await expect(review).not.toContainText('Concept to strengthen');
    for (const text of debrief.takeaways) await expect(page.locator('.s6-takeaways')).toContainText(text);
    await expect(page.getByText(debrief.ask, { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /Pulse pressure/ })).toHaveCount(0);
    await expect(page.locator('.shift-why')).toContainText(debrief.why[1][0]);
    await expect(page.locator('.shift-why a', { hasText: '[Source 7]' })).toHaveAttribute('href', 'https://www.ncbi.nlm.nih.gov/books/NBK537232/');
    await expect(page.locator('#shift-main')).not.toContainText(/pulse pressure|\bDraft\b/i);
    await page.locator('.shift-share summary').click();
    await expect(page.getByText(debrief.share)).toBeVisible();
    await page.getByRole('button', { name: 'Maybe' }).click();
    await expect(page.getByRole('button', { name: 'Maybe' })).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => document.body.innerText.includes('—'))).toBe(false);
  });

  test('all-missed shift shows missed review lines and concepts to strengthen', async ({ page }) => {
    await play(page, false);
    const review = page.locator('.s6-review');
    for (const line of Object.values(debrief.review)) {
      await expect(review).toContainText(line.missed);
      await expect(review).toContainText(`Concept to strengthen: ${line.concept}`);
    }
  });

  test('a Close answer is reviewed as partially correct, not as simply incorrect', async ({ page }) => {
    await seed(page, progress(7, { d1: 'flowsheets', d2: '1600', d3: ['stool', 'standing', 'skin'], d4: 'escalate', d5: { chips: ESSENTIAL, recommendation: 'bedside' }, d6: 'reassess' }));
    const rows = page.locator('.s6-review li');
    await expect(rows.nth(0)).toContainText('Close');
    await expect(rows.nth(0)).toContainText('Partially correct');
    await expect(rows.nth(0).getByLabel('Partially correct')).toBeVisible();
    await expect(rows.nth(1)).toContainText('Partially correct');
    await expect(rows.nth(2)).toContainText(debrief.review.d3.correct);
  });

  test('Trend reading works by keyboard and carries the spec screen-reader text', async ({ page }) => {
    await seed(page, progress(2, { d1: '14' }));
    const table = page.getByRole('table');
    await expect(table).toHaveAccessibleDescription(FLOWSHEET_SR.main);
    await expect(table.getByRole('rowheader')).toHaveText(['HR', 'BP', 'RR', 'SpO2', 'Temp', 'Note']);
    await expect(table).not.toContainText(/pulse pressure/i);
    for (const value of ['78', '80', '94', '100', '116']) await expect(table.getByRole('row', { name: /^HR/ })).toContainText(value);
    await expect(page.getByRole('button', { name: 'Yesterday 2000' })).toHaveCount(0);
    const noon = page.getByRole('button', { name: 'Today 1200', exact: true });
    await noon.focus();
    await page.keyboard.press('Space');
    await expect(noon).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Today 1600', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Today 1600', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(noon).toHaveAttribute('aria-pressed', 'false');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test('Rewind replays Decision 4 three ways with each variation’s own data and labels', async ({ page }) => {
    await seed(page, progress(7, { d1: '14', d2: '1200', d3: ['stool', 'standing', 'skin'], d4: 'escalate', d5: { chips: ESSENTIAL, recommendation: 'bedside' }, d6: 'reassess' }));
    await page.evaluate(() => localStorage.removeItem('ce-shift-stable-number-rewind-v0.4'));
    await page.getByRole('button', { name: /^Explore Rewind/ }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: /^Start Rewind/ }).click();
    for (const [index, variation] of REWIND.variations.entries()) {
      const sheet = dialog.getByRole('table');
      if (variation.id === 'b') { await expect(sheet).toContainText('146/78'); await expect(sheet).toContainText('After walking laps'); await expect(sheet).not.toContainText('108/80'); }
      if (variation.id === 'a') await expect(sheet).toContainText('108/80');
      await expect(dialog).not.toContainText(/pulse pressure|\bDraft\b/i);
      if (variation.id === 'c') await expect(sheet).not.toContainText('1910');
      for (const fact of variation.facts.slice(0, 2)) await expect(dialog).toContainText(fact);
      await dialog.getByRole('button', { name: /^Choose my response/ }).click();
      for (const [n, option] of variation.options.entries()) {
        if (n > 0) await dialog.getByRole('button', { name: 'Try this situation again' }).click();
        await dialog.getByRole('radio', { name: option.title, exact: true }).check();
        await dialog.getByRole('button', { name: /^Check my response/ }).click();
        await expect(dialog.locator('.mst-result')).toHaveText(option.label);
        await expect(dialog).toContainText(option.feedback);
      }
      if (index < REWIND.variations.length - 1) {
        await dialog.getByRole('button', { name: new RegExp(`^Try situation ${index + 2}`) }).click();
        await expect(dialog.getByRole('heading', { level: 3 })).toContainText(REWIND.variations[index + 1].title);
      }
    }
    await dialog.getByRole('button', { name: /^See my Rewind summary/ }).click();
    await expect(dialog).toContainText(REWIND.teaching);
    await expect(dialog).toContainText('3 of 3 situations tried');
  });
});
