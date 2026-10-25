import { test, expect, type Page } from '@playwright/test';
import { STRIPS, assignment, d1, d2, d3, d4, d5, debrief, REWIND } from '../src/modules/the-shift/shift9/data.js';

const PATH = '/learn/shifts/quiet-complaint';
const KEY = 'ce-shift-quiet-complaint-v0.7';
const FULL = { you: '22', tess: '21', marco: '23' };
const ALL_CORRECT = { d1: FULL, d2: 'escalate', d3: 'inferior', d4: 'choice', d5: 'reassess' };
const ALL_MISSED = { d1: { you: '21', tess: '21', marco: '22' }, d2: 'antacid', d3: 'placement', d4: 'threat', d5: 'escalate' };
const progress = (stage: number, answers: Record<string, unknown> = {}) => ({ version: 1, contentVersion: '0.7', stage, viewed: [], notes: [], closer: false, placement: {}, steps: [], drafts: {}, answers, tomorrow: null });

async function seed(page: Page, value: object) {
  await page.goto(PATH);
  await page.evaluate(([key, saved]) => localStorage.setItem(key, saved), [KEY, JSON.stringify(value)]);
  await page.reload();
}
const feedback = (page: Page) => page.getByRole('region', { name: 'Decision feedback' });
const LABELS = { you: 'You', tess: 'Tess (charge RN)', marco: 'Marco (CNA)' } as const;
const TARGET = { '21': 'Room 21', '22': 'Room 22', '23': 'Room 23', station: 'Stay at the station' } as const;
async function place(page: Page, placement: Record<keyof typeof LABELS, keyof typeof TARGET>) {
  for (const [token, target] of Object.entries(placement) as [keyof typeof LABELS, keyof typeof TARGET][]) {
    await page.getByRole('group', { name: LABELS[token] }).getByRole('radio', { name: TARGET[target] }).check();
  }
  await page.getByRole('button', { name: 'Submit' }).click();
}

test.describe('Shift 09 draft preview', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/**', route => { throw new Error(`Shift 09 must not call ${route.request().url()}`); });
  });

  test('library lists Shift 09 under All settings and Telemetry, with a Draft review record', async ({ page }) => {
    await page.goto('/learn/shifts');
    const card = () => page.locator('.shift-library-card').filter({ hasText: 'The Quiet Complaint' });
    await page.getByRole('button', { name: /Show more shifts/ }).click();
    await expect(card()).toContainText('Telemetry / Clinical judgment');
    await expect(card()).toContainText('SHIFT 09');
    await page.getByRole('group', { name: 'Filter shifts by setting' }).getByRole('button', { name: 'Telemetry' }).click();
    await expect(page.locator('.shift-library-card')).toHaveCount(2);
    await expect(card()).toBeVisible();
    await expect(page.locator('.shift-library-card').filter({ hasText: 'The Monitor Alarm' })).toBeVisible();
    await card().getByRole('link', { name: /Begin shift|Continue shift|Review debrief/ }).click();
    await expect(page).toHaveURL(new RegExp(`${PATH}$`));
    await expect(page.locator('.shift-footer')).toContainText('Review status: Draft (psych specialty review required)');
    await page.getByRole('button', { name: 'Sources & review' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Draft.');
    await expect(dialog).toContainText('SHIFT-009 / 0.7');
    await expect(dialog.locator('ol li')).toHaveCount(16);
  });

  test('report cards show each starting strip with Part E alt text and tap-to-open rhythm notes', async ({ page }) => {
    await seed(page, progress(0));
    for (const patient of assignment.patients) {
      await page.getByRole('button', { name: new RegExp(patient.name) }).click();
      await expect(page.getByRole('img', { name: STRIPS[patient.strip].alt })).toBeVisible();
      await expect(page.locator(`#s9-report-${patient.room}`)).toContainText(patient.vitals);
      await page.locator(`#s9-report-${patient.room}`).getByRole('button', { name: /Rhythm notes/ }).click();
      await expect(page.locator(`#s9-notes-${patient.room}`)).toHaveText(assignment.rhythmNotes);
    }
  });

  test('D1 opens with an unscored Look closer and places the team by keyboard', async ({ page }) => {
    await seed(page, progress(1));
    for (const id of d1.strips) await expect(page.getByRole('img', { name: STRIPS[id].alt })).toBeVisible();
    await expect(page.locator('.s9-d1-strips .s9-strip-heading')).toHaveText(['1505Room 21 / Now', '1430Room 22 / Starting strip', '1430Room 23 / Starting strip']);
    await expect(page.locator('.s9-board')).toContainText('Lena, the monitor tech, calls:');
    await expect(page.locator('.s9-board')).not.toContainText('asystole');
    await page.getByRole('button', { name: 'Look closer' }).click();
    await expect(page.locator('#s9-closer')).toContainText(d1.lookCloser);
    await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();
    // Keyboard only: focus a radio, arrow to the next target, then Space.
    await page.getByRole('group', { name: 'You' }).getByRole('radio', { name: 'Room 21' }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('group', { name: 'You' }).getByRole('radio', { name: 'Room 22' })).toBeChecked();
    await page.getByRole('group', { name: 'Tess (charge RN)' }).getByRole('radio', { name: 'Room 21' }).focus();
    await page.keyboard.press('Space');
    await page.getByRole('group', { name: 'Marco (CNA)' }).getByRole('radio', { name: 'Room 23' }).focus();
    await page.keyboard.press('Space');
    await page.getByRole('button', { name: 'Submit' }).focus();
    await page.keyboard.press('Enter');
    await expect(feedback(page).getByRole('heading', { level: 3 })).toHaveText('Correct');
    await expect(feedback(page)).not.toContainText('Guided safer path');
  });

  for (const [name, placement, rules, result, path] of [
    ['Path A full credit', FULL, ['rn22', 'rn21', 'marco23'], 'Correct', 'a'],
    ['Path B with Marco backing up', { you: '21', tess: '22', marco: '21' }, ['rn22', 'rn21', 'marcoBackup21'], 'Correct', 'b'],
    ['Marco brings the antacid', { you: '21', tess: '21', marco: '22' }, ['noRn22'], 'No (unsafe)', 'a'],
    ['Marco alone in 21', { you: '22', tess: '22', marco: '21' }, ['rn22', 'marcoAlone21'], 'No', 'a'],
    ['No one in 21', { you: '22', tess: '23', marco: '23' }, ['rn22', 'marco23', 'noOne21'], 'No', 'a'],
    ['Marco at the station (not covered)', { you: '22', tess: '21', marco: 'station' }, ['rn22', 'rn21'], 'No', 'a'],
  ] as const) test(`D1 ${name}: shows every fired rule and the matching path`, async ({ page }) => {
    await seed(page, progress(1));
    await place(page, placement);
    await expect(feedback(page).getByRole('heading', { level: 3 })).toHaveText(result);
    const list = feedback(page).locator('.s9-rules li');
    await expect(list).toHaveCount(rules.length);
    for (const id of rules) await expect(feedback(page)).toContainText(d1.rules.find(rule => rule.id === id)!.feedback);
    await expect(feedback(page)).toContainText(d1.next.paths[path]);
    for (const row of d1.next.rows) await expect(feedback(page)).toContainText(path === 'a' ? row[1] : row[2]);
    await expect(feedback(page)).toContainText(d1.next.after);
    if (result === 'Correct') await expect(feedback(page)).not.toContainText('Guided safer path');
    else { await expect(feedback(page)).toContainText('Guided safer path'); await expect(feedback(page)).toContainText(d1.fullCredit); }
  });

  for (const [stage, decision, answers] of [
    [2, d2, { d1: FULL }], [3, d3, { d1: FULL, d2: 'escalate' }], [4, d4, { d1: FULL, d2: 'escalate', d3: 'inferior' }],
    [5, d5, { d1: FULL, d2: 'escalate', d3: 'inferior', d4: 'choice' }],
  ] as const) for (const choice of decision.choices) test(`D${stage} choice ${choice.id} shows its spec label and feedback`, async ({ page }) => {
    await seed(page, progress(stage, answers));
    await page.getByRole('button', { name: choice.text, exact: true }).click();
    await expect(feedback(page)).toHaveCount(0);
    await page.getByRole('button', { name: 'Confirm response' }).click();
    await expect(feedback(page).getByRole('heading', { level: 3 })).toHaveText(choice.result);
    await expect(feedback(page)).toContainText(choice.feedback);
    if (choice.result === 'Close') await expect(feedback(page)).toContainText('Partially correct');
    await expect(feedback(page)).toContainText(decision.teaching);
    if (decision === d3) {
      await expect(feedback(page)).toContainText(d3.whileTeamWorks);
      await expect(feedback(page)).toContainText(d3.teachingNote);
    }
    if (decision === d4) {
      await expect(feedback(page)).toContainText(d4.rightAway.intro);
      await expect(feedback(page)).toContainText(d4.capacity.intro);
      await expect(page.locator('.therapeutic-tier')).toHaveText(['Best / Correct', 'Acceptable / Correct', 'Harmful / No', 'Harmful / No', 'Harmful / No (unsafe)']);
    }
  });

  test('D2 shows both Room 22 strips and the seven-step comparison', async ({ page }) => {
    await seed(page, progress(2, { d1: FULL }));
    for (const id of d2.strips) await expect(page.getByRole('img', { name: STRIPS[id].alt })).toBeVisible();
    for (const [, name, then, now] of d2.steps) {
      await page.getByRole('button', { name: new RegExp(name.replace(/[,()]/g, '.')) }).click();
      await expect(page.locator('.s9-steps')).toContainText(then);
      await expect(page.locator('.s9-steps')).toContainText(now);
    }
  });

  test('D3 12-lead opens large and keeps its alt text', async ({ page }) => {
    await seed(page, progress(3, { d1: FULL, d2: 'escalate' }));
    await page.getByRole('button', { name: 'Expand Room 22, 12-lead ECG, 1513' }).click();
    const dialog = page.getByRole('dialog', { name: 'Room 22, 12-lead ECG, 1513' });
    await expect(dialog.getByRole('img', { name: STRIPS[d3.strip].alt })).toBeVisible();
    const width = await dialog.getByRole('img').evaluate(img => img.getBoundingClientRect().width);
    expect(width).toBeGreaterThanOrEqual(1400);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Expand Room 22, 12-lead ECG, 1513' })).toBeFocused();
  });

  test('D5 shows the Marco line only when Marco was placed at Room 21', async ({ page }) => {
    await seed(page, progress(5, { d1: { you: '22', tess: '21', marco: '21' }, d2: 'escalate', d3: 'inferior', d4: 'choice' }));
    await expect(page.locator('.shift-situation')).toContainText(`${d5.marcoMoved} ${d5.vitalsLead} ${d5.vitals}`);
    await seed(page, progress(5, { d1: FULL, d2: 'escalate', d3: 'inferior', d4: 'choice' }));
    await expect(page.locator('.shift-situation')).toContainText(`${d5.vitalsLeadAlone} ${d5.vitals}`);
    await expect(page.locator('.shift-situation')).not.toContainText(d5.marcoMoved);
    await expect(page.getByRole('img', { name: STRIPS[d5.strip].alt })).toBeVisible();
  });

  test('debrief, all correct: every correct review line, takeaways, Go further and no Rhythm Lab buttons', async ({ page }) => {
    await seed(page, progress(6, ALL_CORRECT));
    for (const line of Object.values(debrief.review)) await expect(page.locator('.s6-review')).toContainText(line.correct);
    await expect(page.locator('.s6-review')).not.toContainText('Concept to strengthen');
    for (const text of debrief.takeaways) await expect(page.locator('.shift-takeaways')).toContainText(text);
    await expect(page.getByText(debrief.ask)).toBeVisible();
    await expect(page.getByRole('link', { name: /Open Ask/ })).toHaveAttribute('href', '/ask');
    await expect(page.getByText('ST elevation, explained')).toHaveCount(0);
    await expect(page.getByText('AFib: stable or unstable?')).toHaveCount(0);
    await expect(page.locator('.s6-bridge')).toHaveCount(0);
  });

  test('debrief, all missed: every missed line with its concept; D3 V1 to V4 shows the missed line', async ({ page }) => {
    await seed(page, progress(6, ALL_MISSED));
    for (const line of Object.values(debrief.review)) {
      await expect(page.locator('.s6-review')).toContainText(line.missed);
      await expect(page.locator('.s6-review')).toContainText(`Concept to strengthen: ${line.concept}`);
    }
    await expect(page.locator('.s6-bridge')).toContainText('Scripted outcome after a guided correction');
    await seed(page, progress(6, { ...ALL_CORRECT, d3: 'anterior' }));
    await expect(page.locator('.s6-review')).toContainText(debrief.review.d3.missed);
    await expect(page.locator('.s6-review li').nth(2)).toContainText('Partially correct');
  });

  test('Rewind replays Decision 5 three ways with each variation’s strip and labels', async ({ page }) => {
    await seed(page, progress(6, ALL_CORRECT));
    await page.evaluate(() => localStorage.removeItem('ce-shift-quiet-complaint-rewind-v0.7'));
    await page.getByRole('button', { name: /^Explore Rewind/ }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: /^Start Rewind/ }).click();
    for (const [index, variation] of REWIND.variations.entries()) {
      await expect(dialog.getByRole('img', { name: STRIPS[variation.strip].alt })).toBeVisible();
      for (const fact of variation.facts) await expect(dialog).toContainText(fact);
      await dialog.getByRole('button', { name: /^Choose my response/ }).click();
      for (const [n, option] of variation.options.entries()) {
        if (n > 0) await dialog.getByRole('button', { name: 'Try this situation again' }).click();
        await dialog.getByRole('radio', { name: option.title, exact: true }).check();
        await dialog.getByRole('button', { name: /^Check my response/ }).click();
        await expect(dialog.locator('.mst-result')).toHaveText(option.label);
        await expect(dialog).toContainText(option.feedback);
      }
      if (index < REWIND.variations.length - 1) await dialog.getByRole('button', { name: new RegExp(`^Try situation ${index + 2}`) }).click();
    }
    await dialog.getByRole('button', { name: /^See my Rewind summary/ }).click();
    await expect(dialog).toContainText(REWIND.teaching);
    await expect(dialog).toContainText('3 of 3 situations tried');
  });

  test('a full play-through reaches the debrief with no page overflow', async ({ page }) => {
    await seed(page, progress(0));
    await page.getByRole('button', { name: /Start the afternoon/ }).click();
    await place(page, FULL);
    await page.getByRole('button', { name: /Go to Room 22/ }).click();
    for (const [choice, nextLabel] of [[d2.choices[0].text, /The 12-lead prints/], [d3.choices[0].text, /Go to Room 21/], [d4.choices[0].text, /Go to Room 23/], [d5.choices[0].text, /Finish the shift/]] as const) {
      await page.getByRole('button', { name: choice, exact: true }).click();
      await page.getByRole('button', { name: 'Confirm response' }).click();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      await page.getByRole('button', { name: nextLabel }).click();
    }
    await expect(page.locator('.shift-complete')).toContainText('Afternoon challenge complete.');
  });
});
