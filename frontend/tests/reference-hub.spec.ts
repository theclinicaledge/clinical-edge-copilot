import { test, expect, type Page } from '@playwright/test';
import { REFERENCES, CATEGORIES } from '../src/modules/reference-hub/data/references.js';
import { BEDSIDE_PATHWAYS, CLINICAL_CONCEPTS } from '../src/modules/reference-hub/data/pathways.js';
import { REFERENCE_TRUST, REFERENCE_SOURCE_IDS, PATTERN_SOURCE_IDS, getReferenceSources } from '../src/modules/reference-hub/data/sources.js';

// Editorial regression checks, not independent clinical validation.
const topic = (id: string) => JSON.stringify(REFERENCES.find(item => item.id === id));

test('all 60 topics and 11 patterns retain valid connections and topic-specific sources', () => {
  expect(REFERENCES).toHaveLength(60);
  expect(CATEGORIES).toHaveLength(6);
  expect(new Set(REFERENCES.map(item => item.id)).size).toBe(60);
  expect(Object.keys(REFERENCE_SOURCE_IDS).sort()).toEqual(REFERENCES.map(item => item.id).sort());
  for (const item of REFERENCES) {
    expect(CATEGORIES.some(category => category.id === item.category)).toBe(true);
    expect(item.nursesNotice).toHaveLength(3);
    for (const id of item.relatedRefs) expect(REFERENCES.some(other => other.id === id)).toBe(true);
    const sources = getReferenceSources(item.id);
    expect(sources.length).toBeGreaterThan(0);
    expect(new Set(sources.map(source => source.id)).size).toBe(sources.length);
    for (const source of sources) expect(new URL(source.url).protocol).toBe('https:');
  }
  expect(BEDSIDE_PATHWAYS).toHaveLength(6);
  expect(CLINICAL_CONCEPTS).toHaveLength(5);
  expect(Object.keys(PATTERN_SOURCE_IDS).sort()).toEqual([...BEDSIDE_PATHWAYS, ...CLINICAL_CONCEPTS].map(item => item.id).sort());
  for (const item of BEDSIDE_PATHWAYS) {
    expect(getReferenceSources(item.id, true).length).toBeGreaterThan(0);
    expect(item.check.options).toHaveLength(2);
    expect([0, 1]).toContain(item.check.answer);
    expect(item.check.explanation.length).toBeGreaterThan(60);
    for (const id of item.relatedRefs) expect(REFERENCES.some(other => other.id === id)).toBe(true);
  }
  for (const item of CLINICAL_CONCEPTS) {
    expect(getReferenceSources(item.id, true).length).toBeGreaterThan(0);
    for (const id of item.connectedRefIds) expect(REFERENCES.some(other => other.id === id)).toBe(true);
    for (const id of item.connectedPathwayIds) expect(BEDSIDE_PATHWAYS.some(pathway => pathway.id === id)).toBe(true);
  }
  expect(REFERENCE_TRUST.lastClinicalReview).toBeNull();
  expect(REFERENCE_TRUST.scope).toContain('Independent clinician review has not been completed');
});

test('important interpretation limits and corrected boundary examples remain explicit', () => {
  expect(topic('map')).toContain('not a direct measurement');
  expect(topic('cvp')).toContain('does not reliably predict fluid responsiveness');
  expect(topic('svr')).toContain('hypovolemia and obstruction');
  expect(topic('spo2')).toContain('skin pigmentation');
  expect(topic('spo2')).toContain('CO₂ removal');
  expect(topic('lactate')).toContain('does not establish septic shock');
  expect(topic('troponin')).toContain('evidence of ischemia');
  expect(topic('bnp')).toContain('not universal normal ranges');
  expect(topic('potassium')).toContain('normal ECG does not exclude');
  expect(topic('creatinine')).toContain('1.5 times baseline within 7 days');
  expect(topic('urine-output')).toContain('at least 6 hours');
  expect(topic('hemoglobin')).toContain('may not immediately lower');
  expect(topic('wbc')).toContain('absolute neutrophil count');
  expect(topic('aptt')).toContain('no universal therapeutic');
  expect(topic('anti-xa')).toContain('not interchangeable');
  expect(topic('albumin')).toContain('not a standalone diagnosis of malnutrition');
  expect(topic('ph')).toContain('acidemia');
  expect(topic('pf-ratio')).toContain('80 mmHg ÷ FiO₂ 0.40 = 200');
  expect(topic('pf-ratio')).toContain('moderate >100 to 200, severe ≤100');
  expect(topic('pf-ratio')).toContain('cannot diagnose ARDS by itself');
  expect(topic('plateau-pressure')).toContain('passive, zero-flow');
  expect(topic('dead-space')).toContain('not a measured dead-space fraction');
  expect(topic('foley')).toContain('alone does not establish');
  expect(topic('gcs')).toContain('not testable');
  expect(topic('tracheostomy')).toContain('total laryngectomy');
  expect(topic('cam-icu')).toContain('1 and 2, plus either 3 or 4');
  expect(topic('ammonia')).toContain('diagnostic reconsideration');
});

test('copy avoids universal device settings, treatment commands, and the removed compensation formula', () => {
  const content = JSON.stringify([REFERENCES, BEDSIDE_PATHWAYS, CLINICAL_CONCEPTS]);
  expect(content).not.toMatch(/—|Winter|1\.5\s*[×*]|\b(?:titrate|administer|bolus)\b/i);
  expect(content).not.toMatch(/\b(?:set|increase|decrease|adjust) (?:the )?(?:PEEP|FiO₂|tidal volume|ventilator|infusion|dose)\b/i);
  for (const id of ['tidal-volume', 'peep', 'plateau-pressure']) {
    expect(REFERENCES.find(item => item.id === id)!.normalRange).not.toMatch(/\d/);
  }
});

async function openHub(page: Page) {
  await page.goto('/reference-hub');
  await expect(page.getByLabel('Search references')).toBeVisible();
}
async function sourcesAndEnd(page: Page, expected: number) {
  const details = page.locator('.rh-sources');
  await expect(details).not.toHaveAttribute('open', '');
  await details.locator('summary').click();
  await expect(details.locator('a')).toHaveCount(expected);
  await expect(details).toContainText('Independent clinician review has not been completed');
  await expect.poll(async () => page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
    const surface = document.querySelector('.rh-detail-page, .rh-pathway-detail, .rh-concept-detail')!;
    const footer = surface.firstElementChild!.nextElementSibling!.lastElementChild!;
    return document.querySelector('.ce-tool-dock')!.getBoundingClientRect().top - footer.getBoundingClientRect().bottom;
  })).toBeGreaterThanOrEqual(8);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/**', route => route.abort());
  await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => document.documentElement.style.setProperty('--ce-safe-bottom', '34px')));
});

for (const [width, height] of [[320, 640], [390, 844], [768, 1024], [1280, 800]]) {
  test.describe(`Reference Hub at ${width}x${height}`, () => {
    test.use({ viewport: { width, height }, serviceWorkers: 'block' });
    test('every topic renders its explanation and specific sources with final content reachable', async ({ page }) => {
      test.setTimeout(180000);
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await openHub(page);
      await expect(page.locator('.rh-hero__stat-num')).toHaveText(['60', '6', '6']);
      for (const item of REFERENCES) await test.step(item.id, async () => {
        await page.getByRole('button', { name: item.title, exact: true }).click();
        await expect(page.locator('h1')).toHaveText(item.title);
        await expect(page.locator('.rh-detail-field-body').first()).toHaveText(item.nursesCare);
        if (item.normalRange) await expect(page.getByText('Reference / context', { exact: true })).toBeVisible();
        await sourcesAndEnd(page, getReferenceSources(item.id).length);
        await page.getByRole('button', { name: 'All references', exact: true }).click();
      });
      expect(errors).toEqual([]);
    });
    test('all why checks, feedback, concepts, and back-context stay compact and reachable', async ({ page }, testInfo) => {
      test.setTimeout(180000);
      await openHub(page);
      for (const item of BEDSIDE_PATHWAYS) await test.step(item.id, async () => {
        if (await page.locator('.ce-lookup-extras:not([open]) > summary').count()) await page.locator('.ce-lookup-extras > summary').click();
        await page.getByRole('button', { name: item.title, exact: true }).click();
        const check = page.locator('.rh-why-check');
        await expect(check).not.toHaveAttribute('open', '');
        await check.locator('summary').click();
        await check.getByRole('button').nth(1 - item.check.answer).click();
        await expect(check.getByRole('status')).toContainText('Reconsider the connection.');
        await check.getByRole('button').nth(item.check.answer).click();
        await expect(check.getByRole('status')).toContainText('That connects the clues.');
        await expect(check.getByRole('status')).toContainText(item.check.explanation);
        await sourcesAndEnd(page, getReferenceSources(item.id, true).length);
        await page.locator('.rh-connected-chip').first().click();
        await page.getByRole('button', { name: 'Back to pathway', exact: true }).click();
        await expect(page.locator('h1')).toHaveText(item.title);
        if (item.id === 'rising-lactate') {
          await page.locator('.rh-why-check > summary').click();
          await page.locator('.rh-why-options button').nth(item.check.answer).click();
          await page.locator('.rh-concept-map').scrollIntoViewIfNeeded();
          await page.screenshot({ path: testInfo.outputPath(`reference-hub-why-${width}.png`) });
        }
        await page.getByRole('button', { name: 'All pathways', exact: true }).click();
      });
      for (const item of CLINICAL_CONCEPTS) await test.step(item.id, async () => {
        if (await page.locator('.ce-lookup-extras:not([open]) > summary').count()) await page.locator('.ce-lookup-extras > summary').click();
        await page.getByRole('button', { name: item.title, exact: true }).click();
        await sourcesAndEnd(page, getReferenceSources(item.id, true).length);
        await page.locator('.rh-concept-pathway-chip').first().click();
        await page.getByRole('button', { name: 'Back to concept', exact: true }).click();
        await expect(page.locator('h1')).toHaveText(item.title);
        await page.getByRole('button', { name: 'All concepts', exact: true }).click();
      });
    });
  });
}

test('keyboard selection and return preserve the search and category without carrying sources to another topic', async ({ page }) => {
  await openHub(page);
  await page.getByRole('button', { name: 'Neuro Assessment', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Neuro Assessment', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByLabel('Search references').fill('delirium');
  await expect(page.locator('.rh-ref-card')).toHaveCount(1);
  await page.locator('.rh-ref-card').press('Space');
  await expect(page.locator('h1')).toHaveText('CAM-ICU (Delirium Screening)');
  await page.locator('.rh-sources > summary').click();
  await page.locator('.rh-related-chip').first().click();
  await expect(page.locator('.rh-sources')).not.toHaveAttribute('open', '');
  await page.getByRole('button', { name: 'All references', exact: true }).click();
  await expect(page.getByLabel('Search references')).toHaveValue('delirium');
  await expect(page.getByRole('button', { name: 'Neuro Assessment', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.rh-ref-card')).toHaveCount(1);
});
