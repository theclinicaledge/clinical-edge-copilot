import { test, expect, type Page } from '@playwright/test';
import { d1, d2, d3, d4, d5, d6, debrief, FLOWSHEET_SR, REWIND } from '../src/modules/the-shift/shift6/data.js';

const PATH = '/learn/shifts/stable-number';
const KEY = 'ce-shift-stable-number-v0.4';
const ESSENTIAL = ['situation', 'background', 'assessment'];
const progress = (stage: number, answers: Record<string, unknown> = {}) => ({ version: 1, contentVersion: '0.4', stage, viewed: [], revealed: [], selected: [], sbarDraft: { chips: [], recommendation: null }, answers, tomorrow: null });

async function seed(page: Page, value: object) {
  await page.goto(PATH);
  await page.evaluate(([key, saved]) => localStorage.setItem(key, saved), [KEY, JSON.stringify(value)]);
  await page.reload();
}
const feedback = (page: Page) => page.getByRole('region', { name: 'Decision feedback' });
const cue = (page: Page, label: string) => page.locator('.shift-cue').filter({ has: page.getByText(label, { exact: true }) });

test.describe('Shift 06 public release', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/**', route => { throw new Error(`Shift 06 must not call ${route.request().url()}`); });
  });

  test('library lists Shift 06 without Draft markings and with an honest review record', async ({ page }) => {
    await page.goto('/learn/shifts');
    const card = page.locator('.shift-library-card').filter({ hasText: 'The Stable Number' });
    await expect(card).toContainText('Med-Surg / Foundations');
    await expect(card).not.toContainText('Draft');
    await expect(card.locator('.shift-library-status')).toHaveText(/Not started/);
    await expect(card).toContainText('Ready when you are');
    await card.getByRole('link', { name: /Begin shift|Continue shift|Return to debrief/ }).click();
    await expect(page).toHaveURL(new RegExp(`${PATH}$`));
    await expect(page.locator('.shift-app')).not.toContainText(/\bDraft\b/);
    await expect(page.locator('.shift-footer')).toContainText('Independent nurse approval reported by founder');
    await page.getByRole('button', { name: 'Sources & review' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Founder-reported review by the founder and another nurse.');
    await expect(dialog).not.toContainText('Draft');
    await expect(dialog).toContainText('SHIFT-006 / 0.4');
    await expect(dialog.locator('ol li')).toHaveCount(7);
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
    if (decision !== d2) {
      await expect(feedback(page)).toHaveCount(0);
      await page.getByRole('button', { name: 'Confirm response' }).click();
    }
    await expect(feedback(page).getByRole('heading', { level: 3 })).toHaveText(choice.result);
    await expect(feedback(page)).toContainText(choice.feedback);
    if (choice.result === 'Close') await expect(feedback(page)).toContainText('Partially correct');
    if (decision.teaching) await expect(feedback(page)).toContainText(decision.teaching);
    if (decision === d4) await expect(feedback(page)).toContainText(d4.whileHelp);
    if (decision === d6) for (const name of ['Chronic Obstructive Pulmonary Disease (COPD)', 'Pursed-lip Breathing']) await expect(feedback(page).locator('.shift-sources')).toContainText(name);
  });

  async function play(page: Page, correct: boolean) {
    await page.goto(PATH);
    await page.getByRole('button', { name: 'Restart the shift' }).click();
    await page.getByRole('dialog').getByRole('button', { name: /^Restart/ }).click();
    await page.getByRole('button', { name: 'Plan your first assessment' }).click();
    await page.getByRole('button', { name: correct ? 'Room 14, Mr. Hartwell' : 'Room 12, Ms. Ruiz', exact: true }).click();
    await page.getByRole('button', { name: 'Confirm response' }).click();
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
    await page.getByRole('button', { name: 'Confirm response' }).click();
    await page.getByRole('button', { name: 'Make the call' }).click();
    for (const text of correct ? ['"Dale Hartwell, 71, Room 14.', '"Day 2 for left leg cellulitis.', '"His heart rate has climbed'] : [`"He's probably anxious`]) await page.getByRole('button', { name: new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) }).click();
    await page.getByRole('radio', { name: correct ? /I need someone at the bedside now/ : /Should I just keep watching him/ }).check();
    await page.getByRole('button', { name: 'Give the call' }).click();
    await expect(feedback(page).getByRole('heading', { level: 3 })).toHaveText(correct ? 'Correct' : 'No');
    await page.getByRole('button', { name: 'Return to the hallway' }).click();
    await page.getByRole('button', { name: correct ? 'Continue and reassess' : 'Escalate now', exact: true }).click();
    await page.getByRole('button', { name: 'Confirm response' }).click();
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
    await expect(page.getByText('Scripted outcome after guided corrections.')).toBeVisible();
    const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), KEY);
    expect(saved.answers.d4).toBe('continue');
    expect(saved.answers.d5.recommendation).toBe('watch');
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
    const scroll = page.locator('.trend-scroll');
    if (await scroll.evaluate(el => el.scrollWidth > el.clientWidth)) {
      await page.getByRole('button', { name: 'View later readings' }).click();
      expect(await scroll.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
      await page.getByRole('button', { name: 'View earlier readings' }).click();
      expect(await scroll.evaluate(el => el.scrollLeft)).toBe(0);
      await expect(feedback(page)).toHaveCount(0);
    }
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
    await page.reload();
    await expect(page.getByRole('button', { name: 'Today 1600', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(feedback(page)).toHaveCount(0);
  });

  test('selection is keyboard accessible, resumable, and separate from immutable submission', async ({ page }) => {
    await seed(page, progress(4, { d1: '14', d2: '1200', d3: ['skin'] }));
    const choice = page.getByRole('button', { name: d4.choices[2].text, exact: true });
    await expect(page.getByRole('button', { name: 'Confirm response' })).toBeDisabled();
    await choice.focus();
    await page.keyboard.press('Space');
    await expect(choice).toHaveAttribute('aria-pressed', 'true');
    await expect(feedback(page)).toHaveCount(0);
    await page.reload();
    await expect(choice).toHaveAttribute('aria-pressed', 'true');
    const confirm = page.getByRole('button', { name: 'Confirm response' });
    await confirm.focus();
    await page.keyboard.press('Enter');
    await expect(feedback(page)).toContainText('Guided safer path.');
    await expect(choice).toBeDisabled();
    await page.reload();
    await expect(feedback(page)).toContainText(d4.choices[2].feedback);
    expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).answers.d4, KEY)).toBe('hgb');
  });

  test('every bedside finding and SBAR option remains available, with drafts restored', async ({ page }) => {
    await seed(page, progress(3, { d1: '14', d2: '1200' }));
    for (const finding of d3.cues) {
      await page.locator('.shift-cues').getByRole('button', { name: finding.label, exact: true }).click();
      await expect(cue(page, finding.label)).toContainText(finding.text);
      await cue(page, finding.label).getByRole('checkbox').check();
    }
    await page.reload();
    await expect(page.locator('.shift-cue input:checked')).toHaveCount(d3.cues.length);
    await page.getByRole('button', { name: /^Confirm 11 findings/ }).click();
    await expect(feedback(page)).toContainText('Correct');
    for (const recommendation of d5.recommendations) {
      await seed(page, progress(5, { d1: '14', d2: '1200', d3: ['skin', 'standing', 'stool'], d4: 'escalate' }));
      for (const chip of d5.chips) await page.getByRole('button', { name: chip.text, exact: true }).click();
      await page.getByRole('radio', { name: recommendation.text, exact: true }).check();
      await page.reload();
      await expect(page.locator('.s6-chip[aria-pressed="true"]')).toHaveCount(d5.chips.length);
      await expect(page.getByRole('radio', { name: recommendation.text, exact: true })).toBeChecked();
      await expect(feedback(page)).toHaveCount(0);
      await page.getByRole('button', { name: 'Give the call' }).click();
      await expect(feedback(page)).toContainText(recommendation.feedback);
      await expect(feedback(page)).toContainText(d5.chips.find(chip => chip.id === 'anxious')!.feedback);
    }
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

  test('all stages fit narrow and enlarged-text layouts, with usable dock clearance', async ({ page }, testInfo) => {
    test.setTimeout(120000);
    const complete = { d1: '14', d2: '1200', d3: ['skin', 'standing', 'stool'], d4: 'escalate', d5: { chips: ESSENTIAL, recommendation: 'bedside' }, d6: 'reassess' };
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      for (const stage of [0, 2, 3, 4, 5, 6, 7]) {
        const answers = Object.fromEntries(Object.entries(complete).filter(([key]) => Number(key.slice(1)) < stage));
        await seed(page, progress(stage, answers));
        await expect(page.locator('#shift-main h1')).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        const action = page.locator('#shift-main .shift-primary').last();
        if (await action.count()) {
          await action.evaluate(el => el.scrollIntoView({ block: 'center' }));
          const box = await action.boundingBox();
          const dock = await page.locator('.ce-tool-dock').boundingBox();
          expect(box!.y + box!.height).toBeLessThanOrEqual(dock!.y);
        }
        if (width !== 320 && [2, 4, 5].includes(stage)) {
          await page.locator('#shift-main h1').evaluate(el => el.scrollIntoView({ block: 'start' }));
          await page.screenshot({ path: testInfo.outputPath(`shift6-${width}-stage${stage}.png`) });
        }
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await seed(page, progress(4, { d1: '14', d2: '1200', d3: ['skin'] }));
    await page.addStyleTag({ content: '.s6-app p,.s6-app button,.s6-app td,.s6-app th { font-size: 200% !important; }' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: d4.choices[0].text, exact: true }).click();
    await page.getByRole('button', { name: 'Confirm response' }).click();
    await expect(feedback(page)).toContainText('Correct');
  });

  test('debrief handoff and library preserve saved choices and other scenarios', async ({ page }) => {
    const saved = progress(7, { d1: '14', d2: '1200', d3: ['skin', 'stool', 'standing'], d4: 'escalate', d5: { chips: ESSENTIAL, recommendation: 'bedside' }, d6: 'reassess' });
    await seed(page, saved);
    await expect(page.getByRole('heading', { name: 'Your shift review' })).toBeVisible();
    await page.evaluate(() => localStorage.setItem('ce-private-shift-drowsy-r2', JSON.stringify({ version: 1, stage: 1, answers: {} })));
    const before = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).answers, KEY);
    await page.getByRole('link', { name: /^Open Ask/ }).click();
    await expect(page).toHaveURL(/stable-number\/ask/);
    await expect(page.getByRole('blockquote')).toContainText(debrief.ask);
    await page.getByRole('link', { name: /Return to The Stable Number/ }).click();
    await expect(page.getByRole('heading', { name: 'Your shift review' })).toBeVisible();
    expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).answers, KEY)).toEqual(before);
    await page.getByRole('link', { name: /Shift Library/ }).first().click();
    const card = page.locator('.shift-library-card').filter({ hasText: 'The Stable Number' });
    await expect(card).toContainText('Finished');
    await card.getByRole('link', { name: 'Review debrief' }).click();
    await expect(page.getByRole('heading', { name: 'Your shift review' })).toBeVisible();
    await page.getByRole('button', { name: 'Restart the shift' }).click();
    await page.getByRole('button', { name: 'Keep my place' }).click();
    expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).answers, KEY)).toEqual(before);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ce-private-shift-drowsy-r2')!).stage)).toBe(1);
  });
});
