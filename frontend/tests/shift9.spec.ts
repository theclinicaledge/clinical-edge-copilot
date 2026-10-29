import { test, expect, type Page } from '@playwright/test';
import { STRIPS, assignment, d1, d2, d3, d4, d5, debrief, REWIND } from '../src/modules/the-shift/shift9/data.js';

const PATH = '/learn/shifts/quiet-complaint';
const KEY = 'ce-shift-quiet-complaint-v0.10';
const FULL = { you: '22', tess: '21', marco: '23' };
const ALL_CORRECT = { d1: FULL, d2: 'escalate', d3: 'inferior', d4: 'choice', d5: 'reassess' };
const ALL_MISSED = { d1: { you: '21', tess: '21', marco: '22' }, d2: 'antacid', d3: 'placement', d4: 'threat', d5: 'escalate' };
const progress = (stage: number, answers: Record<string, unknown> = {}) => ({ version: 1, contentVersion: '0.10', stage, viewed: [], notes: [], closer: false, placement: {}, steps: [], drafts: {}, answers, tomorrow: null });

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

  test('library lists Shift 09 under All settings and Telemetry, with the founder review record', async ({ page }) => {
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
    await expect(page.locator('.shift-footer')).toContainText('Review status: Founder sign-off reported by founder; no formal validation claimed (psych specialty review required)');
    await page.getByRole('button', { name: 'Sources & review' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Founder clinical sign-off reported by the founder for v0.10');
    await expect(dialog).toContainText('SHIFT-009 / 0.10');
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
    // Room 21 reads its objective description until Look closer is opened (audit M7).
    await expect(page.getByRole('img', { name: STRIPS['rm21-1505'].altBefore, exact: true })).toBeVisible();
    for (const id of d1.strips.slice(1)) await expect(page.getByRole('img', { name: STRIPS[id].alt })).toBeVisible();
    // The earlier strips are labeled as earlier (audit M6).
    await expect(page.locator('.s9-d1-strips .s9-strip-heading')).toHaveText(['1505Room 21 / Now', '1430Room 22 / Earlier strip, 1430', '1430Room 23 / Earlier strip, 1430']);
    await expect(page.locator('.s9-strip-note')).toHaveText(d1.stripNotes['rm22-1430']);
    await expect(page.locator('.s9-board')).toContainText('Lena, the monitor tech, calls:');
    await expect(page.locator('.s9-board')).not.toContainText('asystole');
    await page.getByRole('button', { name: 'Look closer' }).click();
    await expect(page.locator('#s9-closer')).toContainText(d1.lookCloser);
    await expect(page.getByRole('img', { name: STRIPS['rm21-1505'].alt })).toBeVisible();
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
    ['Marco helps in Room 22', { you: '22', tess: '21', marco: '22' }, ['rn22', 'rn21', 'marco22'], 'Correct', 'a'],
    ['Marco at the station', { you: '22', tess: '21', marco: 'station' }, ['rn22', 'rn21', 'marcoStation'], 'Close', 'a'],
    ['Marco brings the antacid', { you: '21', tess: '21', marco: '22' }, ['noRn22', 'bothRn21', 'marcoAlone22'], 'No (unsafe)', 'a'],
    ['Marco alone in 21', { you: '22', tess: '22', marco: '21' }, ['bothRn22', 'marcoAlone21'], 'No', 'a'],
    ['No one in 21', { you: '22', tess: '23', marco: '23' }, ['rn22', 'rnElsewhere', 'noOne21', 'marco23'], 'No', 'a'],
  ] as const) test(`D1 ${name}: shows every fired rule and the matching path`, async ({ page }) => {
    await seed(page, progress(1));
    await place(page, placement);
    await expect(feedback(page).getByRole('heading', { level: 3 })).toHaveText(result);
    // v0.10: one line per person (You, Tess, Marco), then any uncovered room.
    const staff = feedback(page).locator('.s9-staff li');
    await expect(staff).toHaveCount(3);
    await expect(staff.locator('.s9-staff-who strong')).toHaveText(['You', 'Tess (charge RN)', 'Marco (CNA)']);
    const shown = [...await staff.locator('strong:not(.s9-staff-who strong)').allTextContents(), ...await feedback(page).locator('.s9-coverage li strong').allTextContents()];
    for (const id of rules) expect(shown).toContain(`${d1.rules.find(rule => rule.id === id)!.text}.`);
    for (const id of rules) await expect(feedback(page)).toContainText(d1.rules.find(rule => rule.id === id)!.feedback);
    // Audit H3: a no-credit result never shows only green rules.
    const labels = await feedback(page).locator('.s9-rules .s6-result').allTextContents();
    if (result.startsWith('No')) expect(labels.some(label => label.startsWith('No'))).toBe(true);
    await expect(feedback(page)).toContainText(d1.next.paths[path]);
    for (const row of d1.next.rows) await expect(feedback(page)).toContainText(path === 'a' ? row[1] : row[2]);
    await expect(feedback(page)).toContainText(d1.next.after);
    if (result.startsWith('No')) await expect(feedback(page)).toContainText('Guided safer path');
    else await expect(feedback(page)).not.toContainText('Guided safer path');
    if (result === 'Correct') await expect(feedback(page)).not.toContainText(d1.fullCredit);
    else await expect(feedback(page)).toContainText(d1.fullCredit);
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
    // Audit M3: a guided safer path after D2 choices other than Escalate now, and after no-credit D3 to D5 choices.
    const guided = decision === d2 ? choice.id !== 'escalate' : !['Correct', 'Close'].includes(choice.result);
    if (guided) await expect(feedback(page).locator('.s6-bridge')).toHaveText(`Guided safer path. ${decision.bridge}`);
    else await expect(feedback(page).locator('.s6-bridge')).toHaveCount(0);
    // A confirmed choice that isn't full credit drops the teal success styling.
    const chosen = page.getByRole('button', { name: choice.text, exact: false }).first();
    if (choice.result === 'Correct') await expect(chosen).not.toHaveClass(/s9-selected-miss/);
    else await expect(chosen).toHaveClass(/s9-selected-miss/);
    if (decision === d3) {
      await expect(feedback(page)).toContainText(d3.whileTeamWorks);
      await expect(feedback(page)).toContainText(d3.teachingNote);
    }
    if (decision === d4) {
      // Key points stay visible; the detail lists open on request (audit M5).
      await expect(feedback(page)).toContainText(d4.rightAway.intro);
      await expect(feedback(page)).toContainText(d4.capacity.intro);
      await expect(feedback(page).getByText(d4.rightAway.items[0])).toBeHidden();
      await feedback(page).getByText(d4.rightAway.more).click();
      await expect(feedback(page).getByText(d4.rightAway.items[0])).toBeVisible();
      await feedback(page).getByText(d4.capacity.more).click();
      await expect(feedback(page)).toContainText(d4.capacity.items[4][1]);
      await expect(page.locator('.therapeutic-tier')).toHaveText(['Best / Correct', 'Acceptable / Correct', 'Harmful / No', 'Harmful / No', 'Harmful / No (unsafe)']);
    }
  });

  test('D2 shows both Room 22 strips in one scroller that zooms them together, and the seven-step comparison', async ({ page, isMobile }) => {
    await seed(page, progress(2, { d1: FULL }));
    const compare = page.locator('.ecg-compare');
    for (const id of d2.strips) await expect(compare.getByRole('img', { name: STRIPS[id].alt })).toBeVisible();
    await expect(compare.locator('.ecg-compare-label')).toHaveText(['1430 Then', '1508 Now']);
    // Phones open at 200%, where the ST segments can be compared; both strips share one scroll position.
    await expect(compare.locator('.ecg-viewer-zoom span')).toHaveText(isMobile ? '200%' : 'Fit');
    while (await compare.getByRole('button', { name: 'Zoom in both strips' }).isEnabled()) await compare.getByRole('button', { name: 'Zoom in both strips' }).click();
    await expect(compare.locator('.ecg-viewer-zoom span')).toHaveText('300%');
    const widths = await compare.locator('img').evaluateAll(imgs => imgs.map(img => Math.round(img.getBoundingClientRect().width)));
    expect(widths[0]).toBe(widths[1]);
    const scroller = compare.locator('.ecg-viewer-scroll');
    const box = await scroller.evaluate(el => ({ sw: el.scrollWidth, cw: el.clientWidth, sh: el.scrollHeight, ch: el.clientHeight }));
    expect(box.sw).toBeGreaterThan(box.cw * 2.5);
    expect(box.sh).toBeLessThanOrEqual(box.ch + 1); // sideways only
    await scroller.evaluate(el => { el.scrollLeft = 400; });
    const lefts = await compare.locator('img').evaluateAll(imgs => imgs.map(img => Math.round(img.getBoundingClientRect().left)));
    expect(lefts[0]).toBe(lefts[1]);
    for (const [id, name, then, now] of d2.steps) {
      const button = page.getByRole('button', { name, exact: true });
      await expect(button).toHaveAttribute('aria-expanded', 'false');
      await button.click();
      await expect(button).toHaveAttribute('aria-expanded', 'true');
      await expect(button).toHaveAttribute('aria-controls', `s9-step-${id}`);
      await expect(page.locator(`#s9-step-${id}`)).toContainText(then);
      await expect(page.locator(`#s9-step-${id}`)).toContainText(now);
    }
  });

  test('D3 12-lead viewer: full tracing, limb and chest views, sideways-only zoom, full screen, objective alt text until answered', async ({ page }) => {
    await seed(page, progress(3, { d1: FULL, d2: 'escalate' }));
    const viewer = page.locator('.ecg-viewer');
    const strip = STRIPS[d3.strip];
    const tabs = viewer.getByRole('tab');
    await expect(tabs).toHaveText(['12-lead', 'Limb leads', 'Chest leads']);
    await expect(viewer.getByRole('tab', { name: '12-lead' })).toHaveAttribute('aria-selected', 'true');
    await expect(viewer.getByRole('img', { name: strip.altBefore, exact: true })).toBeVisible();
    // Zoom scales the whole image and pans sideways only.
    for (let i = 0; i < 3; i++) await viewer.getByRole('button', { name: 'Zoom in' }).click();
    await expect(viewer.locator('.ecg-viewer-zoom span')).toHaveText('300%');
    const box = await viewer.locator('.ecg-viewer-scroll').evaluate(el => ({ sw: el.scrollWidth, cw: el.clientWidth, sh: el.scrollHeight, ch: el.clientHeight }));
    expect(box.sw).toBeGreaterThan(box.cw * 2.5);
    expect(box.sh).toBeLessThanOrEqual(box.ch + 1);
    const img = await viewer.locator('img').evaluate(el => ({ w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height, nw: el.naturalWidth, nh: el.naturalHeight }));
    expect(Math.abs(img.w / img.h - img.nw / img.nh)).toBeLessThan(0.01); // aspect, and so calibration, preserved
    // Keyboard: arrow keys move between views.
    await viewer.getByRole('tab', { name: '12-lead' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(viewer.getByRole('tab', { name: 'Limb leads' })).toBeFocused();
    await expect(viewer.getByRole('tab', { name: 'Limb leads' })).toHaveAttribute('aria-selected', 'true');
    await expect(viewer.getByRole('img', { name: strip.views[0].altBefore, exact: true })).toBeVisible();
    await viewer.getByRole('tab', { name: 'Chest leads' }).click();
    await expect(viewer.getByRole('img', { name: strip.views[1].altBefore, exact: true })).toBeVisible();
    // Full screen keeps the same view and returns focus.
    await viewer.getByRole('button', { name: 'Open Room 22, 12-lead ECG, 1513 full screen' }).click();
    const dialog = page.getByRole('dialog', { name: 'Room 22, 12-lead ECG, 1513' });
    await expect(dialog.getByRole('tab', { name: 'Chest leads' })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Escape');
    await expect(viewer.getByRole('button', { name: 'Open Room 22, 12-lead ECG, 1513 full screen' })).toBeFocused();
    // Only one copy of the image is in the page while full screen is closed.
    await expect(page.locator('.ecg-viewer img')).toHaveCount(1);
    // After answering, each view reads its Part E style description.
    await page.getByRole('button', { name: d3.choices[0].text, exact: true }).click();
    await page.getByRole('button', { name: 'Confirm response' }).click();
    await expect(viewer.getByRole('img', { name: strip.views[1].alt, exact: true })).toBeVisible();
    await viewer.getByRole('tab', { name: '12-lead' }).click();
    await expect(viewer.getByRole('img', { name: strip.alt, exact: true })).toBeVisible();
  });

  test('D5 shows the Marco line only when Marco was placed at Room 21', async ({ page }) => {
    await seed(page, progress(5, { d1: { you: '22', tess: '21', marco: '21' }, d2: 'escalate', d3: 'inferior', d4: 'choice' }));
    await expect(page.locator('.shift-situation')).toContainText(`${d5.marcoMoved} ${d5.vitalsLead} ${d5.vitals}`);
    await seed(page, progress(5, { d1: FULL, d2: 'escalate', d3: 'inferior', d4: 'choice' }));
    await expect(page.locator('.shift-situation')).toContainText(`${d5.vitalsLeadAlone} ${d5.vitals}`);
    await expect(page.locator('.shift-situation')).not.toContainText(d5.marcoMoved);
    await expect(page.getByRole('img', { name: STRIPS[d5.strip].altBefore, exact: true })).toBeVisible();
    await seed(page, progress(5, { d1: { you: '22', tess: '21', marco: '22' }, d2: 'escalate', d3: 'inferior', d4: 'choice' }));
    await expect(page.locator('.shift-situation')).toContainText(`${d5.marcoMoved22} ${d5.vitalsLead} ${d5.vitals}`);
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
    await expect(page.locator('.s6-bridge')).toContainText('Scripted outcome after guided corrections');
    await seed(page, progress(6, { ...ALL_CORRECT, d3: 'anterior' }));
    await expect(page.locator('.s6-review')).toContainText(debrief.review.d3.missed);
    await expect(page.locator('.s6-review li').nth(2)).toContainText('Partially correct');
  });

  // Audit M1 and M2: review lines describe the actual choice.
  test('debrief review lines match the learner\'s actual placement and choices', async ({ page }) => {
    await seed(page, progress(6, { ...ALL_CORRECT, d1: { you: '22', tess: '23', marco: '21' }, d2: 'ecg-first', d4: 'agree', d5: 'notify' }));
    const review = page.locator('.s6-review');
    await expect(review).toContainText(debrief.review.d1.room21);
    await expect(review).not.toContainText(debrief.review.d1.missed);
    await expect(review).toContainText(debrief.review.d2.close);
    await expect(review).toContainText(debrief.review.d4.agree);
    await expect(review).toContainText(debrief.review.d5.notify);
    await seed(page, progress(6, { ...ALL_CORRECT, d1: { you: '21', tess: '22', marco: 'station' } }));
    await expect(review).toContainText(debrief.review.d1.close);
    await expect(review.locator('li').first()).toContainText('Partially correct');
    await expect(page.locator('.s6-bridge')).toHaveCount(0);
  });

  test('Rewind replays Decision 5 three ways with each variation’s strip and labels', async ({ page }) => {
    await seed(page, progress(6, ALL_CORRECT));
    await page.evaluate(() => localStorage.removeItem('ce-shift-quiet-complaint-rewind-v0.10'));
    // Audit H2: the invite doesn't list the calls.
    await expect(page.locator('.mst-rewind-invite')).toContainText(REWIND.intro);
    await expect(page.locator('.mst-rewind-invite')).not.toContainText(/Escalate now|Notify the provider|Continue and reassess/);
    await page.getByRole('button', { name: /^Explore Rewind/ }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: /^Start Rewind/ }).click();
    for (const [index, variation] of REWIND.variations.entries()) {
      await expect(dialog.getByRole('heading', { level: 3 })).toHaveText(`Situation ${index + 1} of 3: ${variation.title}`);
      await expect(dialog.getByRole('img', { name: STRIPS[variation.strip].altBefore, exact: true })).toBeVisible();
      for (const fact of variation.facts) await expect(dialog).toContainText(fact);
      await dialog.getByRole('button', { name: /^Choose my response/ }).click();
      for (const [n, option] of variation.options.entries()) {
        if (n > 0) await dialog.getByRole('button', { name: 'Try this situation again' }).click();
        await dialog.getByRole('radio', { name: option.title, exact: true }).check();
        await dialog.getByRole('button', { name: /^Check my response/ }).click();
        await expect(dialog.locator('.mst-result')).toHaveText(option.label);
        await expect(dialog).toContainText(option.feedback);
        await dialog.getByText('Reasonable alternatives and scope').click();
        await expect(dialog).toContainText(variation.alternative);
        await dialog.getByText('Reasonable alternatives and scope').click();
      }
      if (index < REWIND.variations.length - 1) await dialog.getByRole('button', { name: new RegExp(`^Try situation ${index + 2}`) }).click();
    }
    await dialog.getByRole('button', { name: /^See my Rewind summary/ }).click();
    await expect(dialog).toContainText(REWIND.teaching);
    await expect(dialog).toContainText('3 of 3 situations tried');
  });

  for (const [name, d1] of [['Path A', FULL], ['Path B', { you: '21', tess: '22', marco: '21' }], ['a guided placement', ALL_MISSED.d1]] as const) {
    test(`L11: Room 21 opens with Joy taking over Dolores (${name})`, async ({ page }) => {
      await seed(page, progress(4, { d1, d2: 'escalate', d3: 'inferior' }));
      const paragraphs = page.locator('.shift-situation p');
      await expect(paragraphs.first()).toHaveText(d4.scene[0]);
      await expect(paragraphs.first()).toContainText('With Dolores safely covered, you return to Curtis.');
      await expect(paragraphs.nth(1)).toHaveText(d4.scene[1]);
    });
  }

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
