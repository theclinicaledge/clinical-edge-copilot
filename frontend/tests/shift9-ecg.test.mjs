// SHIFT-009 ECG checks (remediation Part 2). The measurements come from tools/shift9-ecg/validate.py, which re-measures
// each tracing from its signal and from the rendered PNG's pixels. These tests hold the committed images to those
// measurements and to clinical bounds. Automated checks are not specialist ECG validation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { STRIPS, REWIND, d5 } from '../src/modules/the-shift/shift9/data.js';

const tools = new URL('../../tools/shift9-ecg/', import.meta.url);
const assets = new URL('../src/modules/the-shift/shift9/assets/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('manifest.json', tools), 'utf8'));
const report = JSON.parse(readFileSync(new URL('validation-report.json', tools), 'utf8')).assets;
const within = (value, lo, hi, what) => assert.ok(value >= lo && value <= hi, `${what}: ${value} not in [${lo}, ${hi}]`);
const sinus = ['rm21_1430_sinus84.png', 'rm22_1430_sinus88.png', 'rm22_1508_sinus94_ste.png'];
const afib = ['rm23_1430_afib110.png', 'rm23_1535_afib110_rewindA.png', 'rm23_rewindB_afib150.png', 'rm23_rewindC_afib130.png'];
const referenced = [...Object.values(STRIPS).map(s => s.file), ...Object.values(STRIPS).flatMap(s => (s.views || []).map(v => v.file))];

test('every referenced image is the generator output, measured, and nothing stale is bundled', () => {
  const files = readdirSync(assets).filter(f => f.endsWith('.png')).sort();
  assert.deepEqual(files, [...referenced].sort(), 'asset folder holds exactly the referenced images');
  assert.deepEqual(Object.keys(manifest.assets).sort(), files);
  assert.deepEqual(Object.keys(report).sort(), files);
  for (const file of files) {
    const sha = createHash('sha256').update(readFileSync(new URL(file, assets))).digest('hex');
    assert.equal(sha, manifest.assets[file].sha256, `${file} differs from manifest; rerun tools/shift9-ecg/generate.py and validate.py`);
    assert.equal(report[file].sha256_matches_manifest, true, `${file}: validation report is stale`);
  }
  assert.match(manifest.qt_formula, /Framingham/);
});

test('paper scale: square grid, 25 mm/s and 10 mm/mV, 1 mV calibration pulses', () => {
  for (const [file, r] of Object.entries(report)) {
    const ratio = r.pixel.px_per_mm_x / r.pixel.px_per_mm_y;
    within(ratio, 0.99, 1.01, `${file} grid squareness`);
  }
  for (const file of ['rm22_1513_12lead_inferior_stemi.png', 'rm22_1513_12lead_limb.png', 'rm22_1513_12lead_chest.png']) within(report[file].pixel.calibration_pulse_mV, 0.95, 1.06, `${file} calibration`);
});

test('each PNG matches its signal pixel for pixel', () => {
  for (const [file, r] of Object.entries(report)) {
    if (r.kind === 'strip') within(r.pixel.rms_error_mV, 0, 0.02, `${file} pixel error`);
    else {
      assert.equal(r.pixel.all_segments_match_their_label, true, `${file}: a segment doesn't match its lead label`);
      for (const seg of r.pixel.segments) within(seg.rms_error_mV, 0, 0.02, `${file} ${seg.lead}`);
    }
  }
});

// Audit H1: the T wave sat at a fixed time, so QTc ran 485 to 515 ms. QT now follows each beat's R-R.
test('QT and QTc are normal on every tracing, from the signal and from the pixels', () => {
  for (const file of sinus) {
    const r = report[file];
    within(r.qtc_s.bazett, 0.38, 0.45, `${file} QTc Bazett`);
    within(r.qtc_s.fridericia, 0.37, 0.44, `${file} QTc Fridericia`);
    within(Math.abs(r.pixel.qt_s - r.qt_s), 0, 0.02, `${file} pixel vs signal QT`);
  }
  for (const file of afib) {
    // Bazett overcorrects at fast, variable rates, so AF is judged by Fridericia and Framingham.
    within(report[file].qtc_s.fridericia, 0.36, 0.44, `${file} QTc Fridericia`);
    within(report[file].qtc_s.framingham, 0.36, 0.44, `${file} QTc Framingham`);
  }
  const twelve = report['rm22_1513_12lead_inferior_stemi.png'];
  within(twelve.qtc_II_s.bazett, 0.38, 0.45, '12-lead QTc Bazett');
  within(twelve.qtc_II_s.fridericia, 0.37, 0.44, '12-lead QTc Fridericia');
});

test('sinus strips: P before every QRS, normal PR and QRS, regular rhythm, rate as labeled', () => {
  for (const file of sinus) {
    const r = report[file];
    const rate = manifest.assets[file].hr;
    within(r.hr_from_rr, rate - 2, rate + 2, `${file} rate`);
    within(r.pr_s, 0.12, 0.20, `${file} PR`);
    within(r.qrs_s, 0.05, 0.11, `${file} QRS`);
    within(r.rr_cv, 0, 0.03, `${file} regularity`);
    within(r.p_template_max_mV, 0.08, 0.2, `${file} P amplitude`);
    within(r.p_beat_to_beat_corr, 0.9, 1, `${file} P consistency`);
    // The 6-second count lands on the closest multiple of 10 (the rhythm notes call it an estimate).
    assert.equal(r.qrs_in_6s, Math.round(rate / 10), `${file} 6-second count`);
    assert.equal(r.pixel.r_count_6s, r.qrs_in_6s, `${file} pixel count`);
  }
  within(report['rm21_1430_sinus84.png'].st60_mV, -0.05, 0.05, 'Room 21 ST');
  within(report['rm22_1430_sinus88.png'].st60_mV, -0.05, 0.05, 'Room 22 1430 ST at baseline');
  within(report['rm22_1508_sinus94_ste.png'].st60_mV, 0.17, 0.25, 'Room 22 1508 ST raised about 2 mm');
  within(report['rm22_1508_sinus94_ste.png'].pixel.st60_mV, 0.17, 0.25, 'Room 22 1508 ST from pixels');
});

test('AF strips: exact 6-second counts, irregularly irregular, no consistent P waves, fibrillatory waves unlike flutter', () => {
  const counts = { 'rm23_1430_afib110.png': 11, 'rm23_1535_afib110_rewindA.png': 11, 'rm23_rewindB_afib150.png': 15, 'rm23_rewindC_afib130.png': 13 };
  for (const file of afib) {
    const r = report[file];
    assert.equal(r.qrs_in_6s, counts[file], `${file} count`);
    assert.equal(r.pixel.r_count_6s, counts[file], `${file} pixel count`);
    within(r.rr_cv, 0.15, 0.6, `${file} R-R variability`);
    assert.equal(r.three_similar_rr_in_a_row, false, `${file}: a regular run`);
    within(r.rr_min_s, 0.30, 2, `${file} shortest R-R (AV-node limit)`);
    within(r.max_t_share_under_next_qrs, 0, 0.25, `${file}: QRS on the previous T wave`);
    within(r.p_beat_to_beat_corr, -1, 0.3, `${file}: P-like waves locked to the QRS`);
    assert.equal(r.pr_s, null);
    within(r.fwave.dominant_per_min, 350, 600, `${file} fibrillatory rate`);
    within(r.fwave.max_autocorr_0_5_to_1_5_s, 0, 0.75, `${file} fibrillatory regularity (flutter stays near 1)`);
    within(r.fwave.peak_power_share, 0, 0.75, `${file} fibrillatory spectrum`);
  }
  // The counts on screen match the strips.
  assert.match(d5.choices[0].feedback, /11 QRS in 6 seconds/);
  assert.match(STRIPS['rm23-1535-b'].altBefore, /15 QRS/);
  assert.match(STRIPS['rm23-1535-c'].altBefore, /13 QRS/);
  assert.deepEqual(REWIND.variations.map(v => STRIPS[v.strip].rate), [110, 150, 130]);
});

test('leads-off strip: beats under artifact, then a flat line with the LEADS OFF message', () => {
  const r = report['rm21_1505_artifact_leadsoff.png'];
  within(r.beats_before_leads_off, 4, 6, 'beats before leads off');
  within(r.flat_sd_mV, 0, 0.01, 'flat line');
  assert.equal(manifest.assets['rm21_1505_artifact_leadsoff.png'].leads_off_from_s, 3.3);
});

test('12-lead: inferior ST elevation, reciprocal depression, no diagnostic anterior elevation, consistent lead math', () => {
  const r = report['rm22_1513_12lead_inferior_stemi.png'];
  const st = lead => r.per_lead[lead].st60_mm;
  assert.equal(r.derived_lead_identities_hold, true);
  within(r.hr_from_rr, 92, 96, 'rate');
  within(r.frontal_axis_deg, -30, 90, 'frontal axis');
  within(r.pr_II_s, 0.12, 0.20, 'PR');
  within(r.qrs_II_s, 0.05, 0.11, 'QRS');
  // Values the D3 screen-reader text states (Part 1): about 1 below, 2 above, 3 above, half below, 2 below, 3 above.
  within(st('I'), -1.3, -0.7, 'I'); within(st('II'), 1.7, 2.4, 'II'); within(st('III'), 2.6, 3.4, 'III');
  within(st('aVR'), -0.8, -0.3, 'aVR'); within(st('aVL'), -2.4, -1.7, 'aVL'); within(st('aVF'), 2.4, 3.4, 'aVF');
  within(st('V1'), -0.25, 0.25, 'V1'); within(st('V2'), 0.3, 0.8, 'V2'); within(st('V3'), 0.05, 0.45, 'V3');
  for (const lead of ['V4', 'V5', 'V6']) within(st(lead), -0.25, 0.25, lead);
  // STEMI criteria are met only in the inferior leads (Fourth Universal Definition thresholds).
  for (const lead of ['II', 'III', 'aVF']) assert.ok(st(lead) >= 1, `${lead} meets the 1 mm threshold`);
  assert.ok(st('V2') < 1.5 && st('V3') < 1.5, 'no V2-V3 elevation at the 1.5 mm threshold');
  for (const lead of ['V1', 'V4', 'V5', 'V6', 'I', 'aVL']) assert.ok(st(lead) < 1, `${lead} below 1 mm`);
  // aVL has a visible QRS, not a flat or notched line.
  within(r.per_lead.aVL.qrs_p2p_mV, 0.25, 1.2, 'aVL QRS size');
  // Focused views show the same signals as the 12-lead.
  for (const view of ['rm22_1513_12lead_limb.png', 'rm22_1513_12lead_chest.png']) assert.equal(report[view].pixel.all_segments_match_their_label, true, view);
  assert.deepEqual(manifest.assets['rm22_1513_12lead_limb.png'].leads, ['I', 'II', 'III', 'aVR', 'aVL', 'aVF']);
  assert.deepEqual(manifest.assets['rm22_1513_12lead_chest.png'].leads, ['V1', 'V2', 'V3', 'V4', 'V5', 'V6']);
});

test('image labels name no answers on decision strips and carry no authoring labels', () => {
  for (const [file, a] of Object.entries(manifest.assets)) {
    const text = `${a.title || ''} ${a.label || ''}`;
    assert.ok(!/main script|rewind/i.test(text), `${file}: ${text}`);
  }
  assert.equal(manifest.assets['rm23_1535_afib110_rewindA.png'].title, 'Room 23  |  Lead II  |  1535');
  for (const file of ['rm22_1508_sinus94_ste.png', 'rm23_1535_afib110_rewindA.png', 'rm23_rewindB_afib150.png', 'rm23_rewindC_afib130.png']) {
    assert.ok(!/sinus|fibrillation|stemi|elevation/i.test(manifest.assets[file].label), `${file}: ${manifest.assets[file].label}`);
  }
});
