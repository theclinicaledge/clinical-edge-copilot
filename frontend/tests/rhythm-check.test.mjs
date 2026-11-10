import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { createServer } from 'vite';

let vite;
let bank;
let calibration;
let waveforms;
before(async () => {
  vite = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false, watch: null } });
  bank = await vite.ssrLoadModule('/src/modules/rhythm-lab/rhythm-check/cases.ts');
  calibration = await vite.ssrLoadModule('/src/modules/rhythm-lab/utils/calibration.ts');
  waveforms = await vite.ssrLoadModule('/src/modules/rhythm-lab/utils/waveforms.ts');
});
after(async () => vite?.close());

const sampled = path => [...path.matchAll(/[ML] ([\d.]+),(-?[\d.]+)/g)].map(([, x, y]) => [Number(x), Number(y)]);

test('eight unique illustrated signals, two examples per interpretation and two guided starts', () => {
  const cases = bank.RHYTHM_CHECK_CASES;
  assert.equal(cases.length, 8);
  assert.equal(new Set(cases.map(example => example.id)).size, 8);
  assert.equal(new Set(cases.map(example => example.path)).size, 8);
  for (const answer of ['sinus', 'junctional', 'mobitzI', 'mobitzII']) assert.equal(cases.filter(example => example.answer === answer).length, 2);
  assert.deepEqual(cases.filter(example => example.guided).map(example => example.id), ['RC-01', 'RC-05']);
  assert.ok(cases.every(example => example.answer !== example.alternative && example.sources.length && example.feedback));
});

test('every evidence onset and boundary aligns to a visible calibrated SVG signal', () => {
  const { secondsToUnits, STRIP_WIDTH, STRIP_HEIGHT, BASELINE } = calibration;
  for (const example of bank.RHYTHM_CHECK_CASES) {
    const points = sampled(example.path);
    assert.equal(points[0][0], 0);
    assert.equal(points.at(-1)[0], STRIP_WIDTH);
    assert.ok(points.every(([x, y], index) => Number.isFinite(x) && y >= 0 && y <= STRIP_HEIGHT && (!index || x > points[index - 1][0])));
    const qrs = example.signal.waves.filter(wave => wave.role === 'qrs');
    assert.deepEqual(qrs.map(wave => wave.start), example.beats.flatMap(beat => beat.q === null ? [] : [beat.q]));
    for (const beat of example.beats) {
      const waves = [example.signal.waves.find(wave => wave.start === beat.p && wave.role !== 'qrs')];
      if (beat.q !== null) waves.push(qrs.find(wave => wave.start === beat.q));
      for (const wave of waves) {
        const start = secondsToUnits(wave.start);
        const end = secondsToUnits(wave.start + wave.duration);
        assert.ok(points.some(([x]) => Math.abs(x - start) < 0.001), `${example.id} missing onset`);
        assert.ok(points.some(([x]) => Math.abs(x - end) < 0.001), `${example.id} missing end`);
        const peak = points.filter(([x]) => x > start && x < end).reduce((max, [, y]) => Math.max(max, Math.abs(y - BASELINE)), 0);
        assert.ok(peak > 6, `${example.id} barely visible evidence`);
        assert.ok(!example.signal.waves.some(other => other !== wave && other.start < wave.start + wave.duration - 1e-9 && other.start + other.duration > wave.start + 1e-9), `${example.id} evidence overlaps another wave`);
      }
    }
  }
});

test('block examples show consecutive conducted beats, steady PP, a drop and post-pause evidence', () => {
  for (const example of bank.RHYTHM_CHECK_CASES.filter(example => example.answer.startsWith('mobitz'))) {
    const { beats } = example;
    const firstDrop = beats.findIndex(beat => beat.q === null);
    assert.ok(firstDrop >= 2 && beats[firstDrop + 1].q !== null);
    const pp = beats[1].p - beats[0].p;
    assert.ok(beats.every((beat, i) => i === 0 || Math.abs(beat.p - beats[i - 1].p - pp) < 1e-8));
    const pr = beats.filter(beat => beat.q !== null).map(beat => beat.q - beat.p);
    if (example.answer === 'mobitzI') {
      assert.ok(pr[1] > pr[0]);
      assert.ok(pr[firstDrop] < pr[firstDrop - 1]);
    } else assert.ok(pr.every(value => Math.abs(value - pr[0]) < 1e-8));
  }
});

test('measurement grading distinguishes the right duration from the right landmarks', () => {
  const expected = [0.32, 0.48];
  assert.ok(bank.matchesSpan([0.48, 0.32], expected));
  assert.ok(bank.matchesSpan([0.34, 0.49], expected));
  assert.ok(!bank.matchesSpan([1.32, 1.48], expected));
  assert.ok(!bank.matchesSpan([0.30, 0.50], expected));
  assert.ok(!bank.matchesSpan([null, 0.48], expected));
  assert.equal(bank.measureMarkers([null, null]), null);
  assert.equal(bank.clampMarker(6.2), 6);
  assert.equal(bank.clampMarker(-0.2), 0);
});

test('all 36 existing renderer paths remain byte-identical to the production base', async () => {
  const original = execFileSync('git', ['show', 'c6129972825dad867bb250626edf13e9aca8fa46:frontend/src/modules/rhythm-lab/utils/waveforms.ts'], { encoding: 'utf8' });
  const { transformWithOxc } = await import('vite');
  const { code } = await transformWithOxc(original.replace("from './calibration'", "from './calibration.ts'"), 'waveforms.ts', { lang: 'ts' });
  const constants = `data:text/javascript,${encodeURIComponent(Object.entries(calibration).map(([key, value]) => `export const ${key} = ${typeof value === 'function' ? value.toString() : JSON.stringify(value)};`).join('\n'))}`;
  const base = await import(`data:text/javascript,${encodeURIComponent(code.replace('./calibration.ts', constants))}`);
  assert.deepEqual(waveforms.WAVEFORMS, base.WAVEFORMS);
});

test('the AV-block tasks require first, pre-pause and post-pause landmarks plus an explicit observation', () => {
  for (const example of bank.RHYTHM_CHECK_CASES.filter(example => example.prPattern)) {
    const drop = example.beats.findIndex(beat => beat.q === null);
    assert.deepEqual(example.measurements.map(item => item.p), [example.beats[0].p, example.beats[drop - 1].p, example.beats[drop + 1].p]);
    const complete = example.measurements.map(item => item.span);
    assert.ok(!bank.canSubmitCheck([...complete.slice(0, 2), [null, null]], example.answer, example.prPattern, true));
    assert.ok(!bank.canSubmitCheck(complete, example.answer, '', true));
    assert.ok(bank.canSubmitCheck(complete, example.answer, 'unclear', true));
  }
});

test('plausible placement error does not change the reference PR pattern or the rhythm key', () => {
  const example = bank.RHYTHM_CHECK_CASES.find(item => item.id === 'RC-08');
  const measured = [[0.20, 0.37], example.measurements[1].span, [3.37, 3.59]];
  assert.ok(measured.every((pair, i) => bank.matchesSpan(pair, example.measurements[i].span)));
  assert.ok(bank.measureMarkers(measured[0]) < bank.measureMarkers(measured[2]));
  assert.equal(example.prPattern, 'constant');
  assert.equal(example.answer, 'mobitzII');
});

test('duration and landmark accuracy are reported independently', () => {
  for (const [markers, span, result] of [
    [[0.10, 0.26], [0.10, 0.26], { duration: true, landmarks: true }],
    [[0.13, 0.31], [0.10, 0.26], { duration: true, landmarks: false }],
    [[0.08, 0.28], [0.10, 0.26], { duration: false, landmarks: true }],
    [[0.14, 0.35], [0.10, 0.30], { duration: true, landmarks: false }],
  ]) assert.deepEqual(bank.assessMeasurement(markers, span), result);
});

test('selected rate exercises derive reference answers from strip landmarks', () => {
  const selected = bank.RHYTHM_CHECK_CASES.map(bank.rateExercise).filter(Boolean);
  assert.equal(selected.length, 2);
  assert.deepEqual(selected[0], { count: 5, estimate: 50, atrialEstimate: 50, shortest: 1.25, longest: 1.25, regular: true, assessRegularity: false });
  assert.deepEqual(selected[1], { count: 6, estimate: 60, atrialEstimate: 70, shortest: 0.8, longest: 1.6, regular: false, assessRegularity: true });
});
