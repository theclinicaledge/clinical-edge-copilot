import { test, expect, type Page } from '@playwright/test';
import { DRIPS, COMPARE_PAIRS } from '../src/modules/icu-drips/data/drips.js';
import { DRIP_LEARNING } from '../src/modules/icu-drips/data/learning.js';
import { ICU_DRIPS_TRUST, getSourcesForDrip, SOURCES } from '../src/data/clinicalSources.js';

// Content checks guard the safety distinctions found in the reference audit.
// They are regression checks, not clinical validation.
const drip = (id: string) => DRIPS.find(d => d.id === id)!;
const text = (id: string) => JSON.stringify(drip(id));

test('every drip has coherent directional data and a specific product reference', () => {
  expect(DRIPS).toHaveLength(23);
  expect(new Set(DRIPS.map(d => d.id)).size).toBe(23);
  for (const d of DRIPS) {
    expect(d.hemodynamics.rows.map(r => r.key)).toEqual(['MAP', 'SVR', 'CO', 'CI', 'HR']);
    for (const row of d.hemodynamics.rows) expect(['up', 'down', 'neutral', 'variable']).toContain(row.direction);
    expect(d.hemodynamics.rows.find(r => r.key === 'CI')!.direction)
      .toBe(d.hemodynamics.rows.find(r => r.key === 'CO')!.direction);
    const sources = getSourcesForDrip(d);
    expect(sources.some(s => s.id === `dailymed-${d.id}` && new URL(s.url).searchParams.has('setid'))).toBe(true);
    expect(new Set(sources.map(s => s.id)).size).toBe(sources.length);
    for (const id of d.related) expect(DRIPS.some(other => other.id === id)).toBe(true);
  }
  expect(ICU_DRIPS_TRUST.reviewStatus).toBe('framework_added');
  expect(ICU_DRIPS_TRUST.lastReviewed).toBeNull();
});

test('critical corrections retain their clinical context', () => {
  expect(text('norepinephrine')).toMatch(/HR may change little or fall reflexively/);
  expect(text('phenylephrine')).toMatch(/does not make new bradycardia harmless/);
  expect(text('epinephrine')).toMatch(/beta-2 stimulation can raise lactate/);
  expect(text('milrinone')).toMatch(/not delayed reassessment/);
  expect(text('propofol')).toMatch(/CPOT\/BPS/);
  expect(text('dexmedetomidine')).toMatch(/abrupt, including sinus arrest/);
  expect(text('midazolam')).toMatch(/seizure, withdrawal, and resedation/);
  expect(text('fentanyl')).toMatch(/tissue accumulation/i);
  expect(text('ketamine')).toMatch(/catecholamine-depleted/);
  expect(text('amiodarone')).toMatch(/prior and cumulative exposure/);
  expect(text('diltiazem')).toMatch(/not during AF/);
  expect(text('diltiazem')).toMatch(/guideline harm warning/);
  expect(text('nicardipine')).toMatch(/aortic stenosis/);
  expect(text('nitroprusside')).toMatch(/acidosis may be a late clue/);
  expect(text('nitroprusside')).toMatch(/thiocyanate/i);
  expect(drip('nitroglycerin').brandName).not.toContain('Nitro-Bid');
  expect(text('nitroglycerin')).toMatch(/PDE-5 inhibitors.*riociguat/);
  expect(text('furosemide')).toMatch(/metabolic alkalosis/);
  expect(text('bumetanide')).toMatch(/metabolic alkalosis/);
  expect(text('heparin')).toMatch(/does not dissolve existing clots/);
  expect(text('heparin')).toMatch(/normal range/);
  expect(text('argatroban')).toMatch(/does not reflect warfarin alone/);
  expect(text('bivalirudin')).toMatch(/No specific antidote/);
  expect(text('insulin-infusion')).toMatch(/glucose can improve before ketoacidosis resolves/i);
  expect(JSON.stringify(DRIPS)).not.toMatch(/not a reason for alarm|only tool is stopping|Wait before adjusting|not from dissolving|30-minute intervals|HIT-safe/);
});

test('every local why check explains a mechanism and stays outside treatment instructions', () => {
  expect(Object.keys(DRIP_LEARNING).sort()).toEqual(DRIPS.map(d => d.id).sort());
  for (const lesson of Object.values(DRIP_LEARNING)) {
    expect(lesson.action.length).toBeGreaterThan(15);
    expect(lesson.effect.length).toBeGreaterThan(15);
    expect(lesson.watch.length).toBeGreaterThan(15);
    expect(lesson.check.options).toHaveLength(2);
    expect([0, 1]).toContain(lesson.check.answer);
    expect(lesson.check.explanation.length).toBeGreaterThan(30);
  }
  expect(JSON.stringify(DRIP_LEARNING)).not.toMatch(/\b\d+\s*(?:mg|mcg|units?|mL)\b|\b(?:start|stop|hold|increase|decrease|titrate) (?:the |this )?(?:drip|infusion|dose)\b/i);
});

async function selectDrip(page: Page, name: string) {
  await page.getByLabel('Search drips').fill(name);
  await page.locator('.id-drip-row').filter({ has: page.getByText(name, { exact: true }) }).first().click();
  await expect(page.locator('.id-hero-card__name')).toHaveText(name);
}
async function reachableEnd(page: Page) {
  await expect.poll(async () => page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
    const end = document.querySelector('.id-detail__disclaimer')!.getBoundingClientRect().bottom;
    const dock = document.querySelector('.ce-tool-dock')!.getBoundingClientRect().top;
    return dock - end;
  })).toBeGreaterThanOrEqual(8);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => document.documentElement.style.setProperty('--ce-safe-bottom', '34px')));
  await page.route('**/api/**', route => route.abort());
});

for (const [width, height] of [[320, 640], [390, 844], [768, 1024], [1280, 800]]) {
  test.describe(`ICU learning at ${width}x${height}`, () => {
    test.use({ viewport: { width, height }, serviceWorkers: 'block' });
    test('all 23 mechanisms, answer feedback, sources, and final content are reachable', async ({ page }, testInfo) => {
      test.setTimeout(180000);
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('/icu-drips');
      for (const d of DRIPS) await test.step(d.name, async () => {
        await selectDrip(page, d.name);
        await expect(page.getByRole('list', { name: 'Action to effect to bedside watch' })).toBeVisible();
        await expect(page.locator('.id-why-chain li')).toHaveCount(3);
        const mechanism = page.getByRole('button', { name: /^What it is doing/ });
        await expect(mechanism).toHaveAttribute('aria-expanded', 'false');
        await expect(page.locator('.id-why-check')).not.toBeVisible();
        await mechanism.click();
        const lesson = DRIP_LEARNING[d.id];
        await page.locator('.id-why-check__choice').nth(1 - lesson.check.answer).click();
        await expect(page.getByRole('status')).toContainText('Not quite.');
        await page.locator('.id-why-check__choice').nth(lesson.check.answer).click();
        await expect(page.getByRole('status')).toContainText('Correct.');
        await expect(page.getByRole('status')).toContainText(lesson.check.explanation);
        if (d.id === 'phenylephrine' && [390, 1280].includes(width)) {
          await page.locator('.id-why-chain').evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 300));
          await page.screenshot({ path: testInfo.outputPath(`icu-why-${width}.png`) });
          await page.locator('.id-why-check').evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 100));
          await page.screenshot({ path: testInfo.outputPath(`icu-check-${width}.png`) });
        }
        await page.getByRole('button', { name: 'View sources and review details', exact: true }).click();
        await expect(page.locator('.ctp-source__link').filter({ hasText: /prescribing information/ })).toHaveAttribute('href', SOURCES[`dailymed-${d.id}`].url);
        await expect(page.locator('.ctp-summary__status')).toContainText('clinician review date not yet published');
        await reachableEnd(page);
        await page.getByRole('button', { name: '← Back to ICU Drips', exact: true }).click();
      });
      expect(errors).toEqual([]);
    });
    test('all 12 comparisons expose both drug references and the detailed table', async ({ page }) => {
      test.setTimeout(120000);
      await page.goto('/icu-drips');
      await page.getByText('Practice, compare & clinical pearls', { exact: true }).click();
      await page.locator('.id-home-action--compare').click();
      for (const pair of COMPARE_PAIRS) {
        await page.getByRole('button', { name: `${pair.label} →`, exact: true }).click();
        await page.getByRole('button', { name: /^Detailed comparison/ }).click();
        await expect(page.locator('.id-compare-table')).toBeVisible();
        await page.getByRole('button', { name: 'View sources and review details', exact: true }).click();
        const labels = await page.locator('.ctp-source__link').allTextContents();
        expect(labels.filter(label => label.includes('prescribing information'))).toHaveLength(2);
        if (pair.id === 'heparin-vs-enox') expect(labels.join(' ')).toContain('Enoxaparin (SQ comparison)');
        await reachableEnd(page);
        await page.getByRole('button', { name: '← All comparisons', exact: true }).click();
      }
    });
  });
}

test('closed mechanism disclosures skip hidden answers during keyboard navigation', async ({ page }) => {
  await page.goto('/icu-drips');
  await selectDrip(page, 'Norepinephrine');
  const trigger = page.getByRole('button', { name: /^What it is doing/ });
  await trigger.focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: /^What nurses monitor/ })).toBeFocused();
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.id-why-check__choice').first()).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.locator('.id-why-check__choice').first()).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toContainText('Not quite.');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toContainText('Correct.');
  await page.getByRole('button', { name: '← Back to ICU Drips', exact: true }).click();
  await selectDrip(page, 'Vasopressin');
  await page.getByRole('button', { name: /^What it is doing/ }).click();
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(page.locator('.id-why-check__choice[aria-pressed="true"]')).toHaveCount(0);
});

test('practice scoring and explanations work for a complete correct pass', async ({ page }) => {
  await page.goto('/icu-drips');
  await page.getByText('Practice, compare & clinical pearls', { exact: true }).click();
  await page.locator('.id-home-action--practice').click();
  const answers = [1, 1, 1, 2, 1, 1, 1, 2, 1, 1];
  for (let i = 0; i < answers.length; i++) {
    await page.locator('.id-practice-option').nth(answers[i]).click();
    await expect(page.locator('.id-practice-feedback')).toBeVisible();
    if (i === 9) await expect(page.locator('.id-practice-feedback')).toContainText('variable terminal elimination');
    await page.getByRole('button', { name: i === 9 ? 'See results' : 'Next question', exact: true }).click();
  }
  await expect(page.locator('.id-practice-end__score')).toHaveText('10 / 10');
  await reachableEnd(page);
});
