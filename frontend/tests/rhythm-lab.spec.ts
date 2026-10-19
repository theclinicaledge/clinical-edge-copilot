import { writeFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { WAVEFORMS, STRIP_EXAMPLES } from '../src/modules/rhythm-lab/utils/waveforms';
import { RHYTHMS } from '../src/modules/rhythm-lab/data/rhythms';
import { BASELINE, SMALL_BOX_UNITS, LARGE_BOX_UNITS, UNITS_PER_MV, unitsToSeconds } from '../src/modules/rhythm-lab/utils/calibration';

type Sample = { t: number; mv: number; x: number; y: number };
function samples(id: string): Sample[] {
  return [...WAVEFORMS[id].matchAll(/[ML] ([\d.]+),(-?[\d.]+)/g)].map(m => {
    const x = Number(m[1]), y = Number(m[2]);
    return { t: unitsToSeconds(x), mv: (BASELINE - y) / UNITS_PER_MV, x, y };
  });
}
function peaks(id: string, threshold = 0.65) {
  const groups: Sample[][] = [];
  let active = false;
  for (const s of samples(id)) {
    if (s.mv > threshold) {
      if (!active) groups.push([]);
      groups.at(-1)!.push(s); active = true;
    } else active = false;
  }
  const found = groups.map(g => g.reduce((a, b) => a.mv > b.mv ? a : b).t);
  return found.filter((t, i) => !i || t - found[i - 1] > 0.12);
}
const delta = (ts: number[]) => ts.slice(1).map((t, i) => t - ts[i]);
const interval = (id: string, lo: number, hi: number) => samples(id).filter(s => s.t > lo && s.t < hi && Math.abs(s.mv) > 0.0001);

test('one shared six-second square-paper calibration reproduces the old NSR defect', () => {
  expect(60 / (140 / 20 * 0.04)).toBeCloseTo(214.2857, 3);
  expect(unitsToSeconds(SMALL_BOX_UNITS)).toBeCloseTo(0.04, 8);
  expect(unitsToSeconds(LARGE_BOX_UNITS)).toBeCloseTo(0.2, 8);
  expect(SMALL_BOX_UNITS / UNITS_PER_MV).toBeCloseTo(0.1, 8);
  expect(unitsToSeconds(800)).toBe(6);
  expect(Object.keys(WAVEFORMS).sort()).toEqual(RHYTHMS.map(r => r.id).sort());
  expect(RHYTHMS).toHaveLength(36);
  writeFileSync('/private/tmp/ce-rhythm-review.json', JSON.stringify(RHYTHMS.map(r => ({ ...r, path: WAVEFORMS[r.id], lead: STRIP_EXAMPLES[r.id].lead, context: STRIP_EXAMPLES[r.id].context, rateCategory: STRIP_EXAMPLES[r.id].rateCategory, meanRateBpm: STRIP_EXAMPLES[r.id].meanRateBpm, peaks: peaks(r.id) }))));
});
for (const r of RHYTHMS) test(`${r.id}: finite, unclipped, complete six-second signal and teaching`, () => {
  const ss = samples(r.id);
  expect(ss.length).toBeGreaterThanOrEqual(1501);
  expect(ss[0].x).toBe(0); expect(ss.at(-1)!.x).toBe(800);
  expect(ss.every(s => Number.isFinite(s.y) && s.y >= 0 && s.y <= 100)).toBe(true);
  expect(ss.every((s, i) => !i || s.x > ss[i - 1].x)).toBe(true);
  for (const key of ['rate', 'regularity', 'pWave', 'qrs', 'nursesNotice', 'confusedWith', 'bedsideRelevance', 'whenMoreUrgent'] as const) expect(r[key].trim()).not.toBe('');
  expect(r.recognitionCues).toHaveLength(4);
  expect(STRIP_EXAMPLES[r.id].rateCategory).toBeTruthy();
});
const rates: Record<string, number> = { nsr:75, sinus_bradycardia:45, sinus_tachycardia:130, junctional_rhythm:50, accelerated_junctional:80, junctional_tachycardia:120, svt:180, first_degree_avb:75, complete_heart_block:30, vtach:180, idioventricular:30, aivr:75, pea:75, rbbb:75, lbbb:75, atrial_paced:75, ventricular_paced:75, av_sequential_paced:75 };
for (const [id, bpm] of Object.entries(rates)) test(`${id}: measured R-R rate is ${bpm} bpm`, () => {
  for (const rr of delta(peaks(id).filter(t => t < 5.8))) expect(Math.abs(rr - 60 / bpm)).toBeLessThan(0.005);
  expect(peaks(id).length).toBeGreaterThanOrEqual(3);
});
test('PR, P, QRS and QT timing stay physiological independently of rate', () => {
  for (const id of ['nsr', 'sinus_bradycardia', 'sinus_tachycardia']) {
    const p = interval(id, 0.1, 0.3), qrs = interval(id, 0.31, 0.41);
    expect(p.at(-1)!.t - p[0].t).toBeCloseTo(0.096, 2);
    expect(qrs[0].t - p[0].t).toBeCloseTo(0.16, 2);
    expect(qrs.at(-1)!.t - qrs[0].t).toBeCloseTo(0.076, 2);
  }
  for (const [id, qt] of [['nsr', 0.38], ['sinus_bradycardia', 0.44], ['sinus_tachycardia', 0.30]] as const) {
    const t = interval(id, 0.46, 0.32 + qt + 0.001);
    expect(t.at(-1)!.t - 0.32).toBeCloseTo(qt, 2);
  }
  const p = interval('first_degree_avb', 0.02, 0.15);
  const qrs = interval('first_degree_avb', 0.31, 0.41);
  expect(qrs[0].t - p[0].t).toBeCloseTo(0.28, 2);
  for (const id of ['idioventricular', 'aivr', 'vtach', 'ventricular_paced', 'lbbb']) {
    const q = interval(id, 0.319, 0.481);
    expect(q.at(-1)!.t - q[0].t).toBeGreaterThan(0.14);
  }
});
test('ectopic timing, compensatory pauses, and late escape are distinct', () => {
  const pac = peaks('pac'), pvc = peaks('pvc'), esc = peaks('ventricular_escape');
  expect(pac[2] - pac[1]).toBeLessThan(0.8);
  expect(pac[3] - pac[1]).toBeLessThan(1.6);
  expect(pvc[2] - pvc[1]).toBeLessThan(0.8);
  expect(pvc[3] - pvc[1]).toBeCloseTo(1.6, 2);
  expect(esc[2] - esc[1]).toBeGreaterThan(2);
});
test('block examples show progressive versus fixed PR, drops, and independent atria', () => {
  const i = peaks('mobitz_i'), ii = peaks('mobitz_ii');
  expect(i.slice(0, 3).map((q, n) => q - (0.12 + n * 0.8) - 0.036)).toEqual(expect.arrayContaining([expect.closeTo(0.16, 2), expect.closeTo(0.24, 2), expect.closeTo(0.28, 2)]));
  expect(ii[0] - 0.12 - 0.036).toBeCloseTo(0.16, 2);
  expect(ii[1] - 0.92 - 0.036).toBeCloseTo(0.16, 2);
  expect(ii[2] - 2.52 - 0.036).toBeCloseTo(0.16, 2);
  expect(delta(ii).some(rr => rr > 1.5)).toBe(true);
  const p = STRIP_EXAMPLES.complete_heart_block.waves.filter(w => w.duration === 0.1);
  expect(p.length).toBeGreaterThan(peaks('complete_heart_block').length);
  expect(delta(p.map(w => w.start)).every(pp => Math.abs(pp - 0.8) < 0.001)).toBe(true);
});
test('flutter, MAT, AF and sinus arrhythmia preserve their defining atrial patterns', () => {
  expect(delta(peaks('aflutter')).every(rr => Math.abs(rr - 0.4) < 0.006)).toBe(true);
  const f = STRIP_EXAMPLES.aflutter.waves[0];
  expect(f.value(0.01)).toBeCloseTo(f.value(0.01 + 0.2 / 6), 5);
  expect(f.value(0.08 / 6)).toBeCloseTo(-0.30, 5); // negative inferior-lead F-wave trough
  expect(f.value(0.12 / 6)).toBeCloseTo(0, 5); // rapid return, no flat atrial interval
  const flutterSamples = samples('aflutter');
  // A visible F-wave trough remains after ventricular repolarization is added.
  const at = (t: number) => flutterSamples.reduce((a, b) => Math.abs(a.t - t) < Math.abs(b.t - t) ? a : b).mv;
  expect(at(0.68)).toBeLessThan(-0.29);
  expect(at(0.52) - at(0.48)).toBeGreaterThan(0.25);
  const p = STRIP_EXAMPLES.mat.waves.filter((_, i) => i % 3 === 0);
  expect(new Set(p.map(w => Math.round(w.value(0.5) * 100)))).toHaveProperty('size', 3);
  expect(new Set(delta(peaks('afib')).map(rr => rr.toFixed(2))).size).toBeGreaterThan(4);
  expect(new Set(delta(peaks('sinus_arrhythmia')).map(rr => rr.toFixed(2))).size).toBeGreaterThan(4);
});
test('arrest and metabolic examples avoid fabricated measurable rates and false perfusion claims', () => {
  for (const id of ['vfib_coarse', 'vfib_fine', 'asystole', 'hyperkalemia_sine']) expect(STRIP_EXAMPLES[id].rateCategory).toBe('not measurable');
  expect(samples('asystole').every(s => s.mv === 0)).toBe(true);
  expect(Math.max(...samples('vfib_coarse').map(s => Math.abs(s.mv)))).toBeGreaterThan(5 * Math.max(...samples('vfib_fine').map(s => Math.abs(s.mv))));
  expect(STRIP_EXAMPLES.pea.context).toContain('no palpable pulse');
  expect(STRIP_EXAMPLES.rbbb.lead).toBe('V1'); expect(STRIP_EXAMPLES.lbbb.lead).toBe('V6');
  expect(STRIP_EXAMPLES.aivr.rateCategory).toBe('normal');
  expect(STRIP_EXAMPLES.ventricular_escape.rateCategory).toBe('slow');
  expect(STRIP_EXAMPLES.pacemaker_failure_capture.meanRateBpm).toBeLessThan(60);
  expect(RHYTHMS.find(r => r.id === 'lbbb')!.bedsideRelevance).toContain('New LBBB alone is not a STEMI equivalent');
});

for (const width of [390, 768, 1440]) test(`strip and calipers stay calibrated after dragging and scrolling at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/rhythm-lab/library');
  await page.getByRole('button', { name: 'Open Normal Sinus Rhythm', exact: true }).click();
  await page.getByRole('button', { name: 'Toggle calipers' }).click();
  await expect(page.locator('.caliper-overlay')).toHaveCSS('touch-action', 'pan-x');
  const strip = page.locator('.detail-strip-measurement .rhythm-strip-svg');
  const overlay = page.locator('.caliper-overlay svg');
  const geometry = await strip.evaluate(el => {
    const svg = el as SVGSVGElement; const p = svg.querySelector('pattern')!;
    return { small: Number(p.getAttribute('width')), tall: Number(p.getAttribute('height')), a: svg.getScreenCTM()!.a, d: svg.getScreenCTM()!.d };
  });
  expect(geometry.small).toBeCloseTo(800 / 150, 6);
  expect(geometry.small).toBe(geometry.tall); expect(geometry.a).toBeCloseTo(geometry.d, 6);
  expect(await overlay.evaluate(el => (el as SVGSVGElement).getScreenCTM()!.a)).toBeCloseTo(geometry.a, 6);
  const handles = page.locator('.caliper-overlay');
  async function drag(handle: string, x: number) {
    const h = handles.locator(`[data-caliper-handle="${handle}"]`);
    // Wait for SVG geometry to settle after the preceding span changed.
    await h.hover();
    const box = await h.boundingBox();
    const target = await overlay.evaluate((el, x) => {
      const svg = el as SVGSVGElement; const pt = svg.createSVGPoint(); pt.x = x; pt.y = 35;
      const p = pt.matrixTransform(svg.getScreenCTM()!); return { x:p.x, y:p.y };
    }, x);
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 3);
    await page.mouse.down(); await page.mouse.move(target.x, target.y, { steps: 8 }); await page.mouse.up();
  }
  await drag('a', 47.4667);
  await page.locator('.detail-strip-wrap').evaluate(el => { el.scrollLeft = Math.max(0, 520 / 800 * el.scrollWidth - el.clientWidth + 24); });
  await drag('b', 154.1333);
  await page.locator('.detail-strip-wrap').evaluate(el => { el.scrollLeft = 0; });
  // Native mouse coordinates round to physical pixels (about 9 ms at 0.8x).
  expect(Math.abs(parseFloat((await page.locator('.caliper-chip').textContent())!) - 0.8)).toBeLessThan(0.02);
  const before = await overlay.locator('line').last().getAttribute('x1');
  await page.locator('.detail-strip-wrap').evaluate(el => { el.scrollLeft = 100; });
  expect(await overlay.locator('line').last().getAttribute('x1')).toBe(before);
  await page.locator('.detail-strip-wrap').evaluate(el => { el.scrollLeft = 0; });
  await drag('b', 47.4667 + SMALL_BOX_UNITS);
  expect(Math.abs(parseFloat((await page.locator('.caliper-chip').textContent())!) - 0.04)).toBeLessThan(0.02);
  await drag('b', 47.4667 + LARGE_BOX_UNITS);
  expect(Math.abs(parseFloat((await page.locator('.caliper-chip').textContent())!) - 0.2)).toBeLessThan(0.02);
  await drag('b', 154.1333);
  await expect.poll(async () => {
    const chip = await page.locator('.caliper-chip').boundingBox();
    const viewport = await page.locator('.detail-strip-wrap').boundingBox();
    return chip!.x >= viewport!.x && chip!.x + chip!.width <= viewport!.x + viewport!.width;
  }).toBe(true);
  await page.screenshot({ path: `/private/tmp/rhythm-lab-nsr-${width}.png`, animations: 'disabled' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('all 36 rhythm detail pages render with the correct lead and no runtime errors', async ({ page }) => {
  test.setTimeout(90000);
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/rhythm-lab/library');
  for (const r of RHYTHMS) {
    await page.getByLabel('Filter rhythms').fill(r.name);
    await page.getByRole('button', { name: `Open ${r.name}`, exact: true }).click();
    await expect(page.locator('.detail-strip-measurement .rhythm-strip-svg')).toHaveAttribute('data-rhythm-id', r.id);
    await expect(page.locator('.detail-strip-annotation')).toContainText(`Lead ${STRIP_EXAMPLES[r.id].lead}`);
    await page.getByRole('button', { name: 'Bedside perspective' }).click();
    await expect(page.locator('.bedside-collapsible__body')).toContainText(r.bedsideRelevance);
    await page.getByRole('button', { name: 'Back to rhythm list' }).click();
  }
  expect(errors).toEqual([]);
});
test('Sprint scores the displayed signal and offers unmeasurable and inapplicable options', async ({ page }) => {
  await page.goto('/rhythm-lab/sprint');
  await expect(page.getByRole('button', { name: 'Not measurable', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Not applicable', exact: true })).toBeVisible();
  for (let i = 0; i < 5; i++) {
    const id = await page.locator('.rhythm-strip-svg').getAttribute('data-rhythm-id');
    const e = STRIP_EXAMPLES[id!];
    await page.getByRole('button', { name: new RegExp(`^${e.rateCategory}$`, 'i') }).click();
    await page.getByRole('button', { name: new RegExp(`^${e.regularityCategory}$`, 'i') }).click();
    await page.getByRole('button', { name: 'Reveal →' }).click();
    await expect(page.locator('.sprint-check--correct')).toHaveCount(2);
    await page.getByRole('button', { name: i < 4 ? 'Next strip →' : 'Finish sprint →' }).click();
  }
  await expect(page.getByText('5 strips reviewed')).toBeVisible();
});


test('pacing examples preserve spike-to-capture timing and distinguish noncapture from undersensing', () => {
  for (const [id, firstSpike, qrsOnset] of [
    ['atrial_paced', 0.156, 0.32], ['ventricular_paced', 0.316, 0.32], ['av_sequential_paced', 0.156, 0.32],
  ] as const) {
    const ss = samples(id);
    const spike = ss.reduce((a, b) => Math.abs(a.t - firstSpike) < Math.abs(b.t - firstSpike) ? a : b);
    expect(spike.mv).toBeGreaterThan(0.35);
    expect(peaks(id)[0]).toBeGreaterThan(qrsOnset);
    expect(peaks(id)[0]).toBeLessThan(qrsOnset + 0.08);
  }
  expect(peaks('pacemaker_failure_capture')).toHaveLength(5);
  expect(peaks('pacemaker_failure_capture')[2] - peaks('pacemaker_failure_capture')[1]).toBeCloseTo(3.2, 2);
  expect(samples('pacemaker_failure_sense').some(s => s.t > 0.50 && s.t < 0.51 && s.mv > 0.35)).toBe(true);
  const td = samples('torsades');
  expect(td.some(s => s.mv > 0.5)).toBe(true);
  expect(td.some(s => s.mv < -0.5)).toBe(true);
});
