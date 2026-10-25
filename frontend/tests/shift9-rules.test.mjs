import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAssignment, decisionResults, credit, validPlacement } from '../src/modules/the-shift/shift9/rules.js';
import { sanitizeProgress, freshProgress, FINAL_STAGE } from '../src/modules/the-shift/shift9/progress.js';

const fired = placement => evaluateAssignment(placement).fired.map(rule => rule.id).sort();
const TARGETS = ['21', '22', '23', 'station'];
const ALL = TARGETS.flatMap(you => TARGETS.flatMap(tess => TARGETS.map(marco => ({ you, tess, marco }))));

test('credit follows the result labels: Correct full, Close partial, everything else none', () => {
  assert.deepEqual(['Correct', 'Close', 'Not first', 'Not best', 'No', 'No (unsafe)'].map(credit), ['full', 'partial', 'none', 'none', 'none', 'none']);
});

test('D1 needs every token placed', () => {
  assert.equal(evaluateAssignment({ you: '22', tess: '21' }), null);
  assert.equal(validPlacement({ you: '22', tess: '21', marco: 'hall' }), false);
});

test('D1 full credit: one RN in 22, the other in 21, Marco in 23 or backing up at 21, either RN either room', () => {
  const full = ALL.filter(p => evaluateAssignment(p).full).map(p => `${p.you}/${p.tess}/${p.marco}`).sort();
  assert.deepEqual(full, ['21/22/21', '21/22/23', '22/21/21', '22/21/23']);
  for (const p of ALL) assert.equal(evaluateAssignment(p).result === 'Correct', evaluateAssignment(p).full);
});

test('D1 fires every matching rule from the spec table', () => {
  assert.deepEqual(fired({ you: '22', tess: '21', marco: '23' }), ['marco23', 'rn21', 'rn22']);
  assert.deepEqual(fired({ you: '22', tess: '21', marco: '21' }), ['marcoBackup21', 'rn21', 'rn22']);
  // Marco brings an antacid: no RN in 22.
  assert.deepEqual(fired({ you: '21', tess: '21', marco: '22' }), ['noRn22']);
  assert.deepEqual(fired({ you: '22', tess: '22', marco: '21' }), ['marcoAlone21', 'rn22']);
  assert.deepEqual(fired({ you: '22', tess: '23', marco: '23' }), ['marco23', 'noOne21', 'rn22']);
  assert.equal(evaluateAssignment({ you: '21', tess: '21', marco: '22' }).result, 'No (unsafe)');
  assert.equal(evaluateAssignment({ you: '22', tess: '22', marco: '21' }).result, 'No');
});

test('D1 placements the table does not cover earn no credit and fire no rule for that token', () => {
  const stationMarco = evaluateAssignment({ you: '22', tess: '21', marco: 'station' });
  assert.deepEqual(stationMarco.fired.map(r => r.id).sort(), ['rn21', 'rn22']);
  assert.equal(stationMarco.full, false);
  assert.equal(stationMarco.result, 'No');
  assert.equal(stationMarco.guided, true);
});

test('D1 path: B only when Tess alone took Room 22', () => {
  assert.equal(evaluateAssignment({ you: '22', tess: '21', marco: '23' }).path, 'a');
  assert.equal(evaluateAssignment({ you: '21', tess: '22', marco: '23' }).path, 'b');
  assert.equal(evaluateAssignment({ you: '22', tess: '22', marco: '21' }).path, 'a');
  assert.equal(evaluateAssignment({ you: 'station', tess: '22', marco: '21' }).path, 'b');
  assert.equal(evaluateAssignment({ you: '22', tess: '21', marco: '21' }).marcoAt21, true);
  assert.equal(evaluateAssignment({ you: '22', tess: '21', marco: '23' }).marcoAt21, false);
});

test('decision results: D3 V1 to V4 is partial, either calm D4 response and either Correct D5 call is full', () => {
  const base = { d1: { you: '22', tess: '21', marco: '23' }, d2: 'escalate', d3: 'inferior', d4: 'choice', d5: 'reassess' };
  assert.ok(Object.values(decisionResults(base)).every(r => r.credit === 'full'));
  assert.deepEqual(decisionResults({ ...base, d3: 'anterior' }).d3, { result: 'Close', credit: 'partial' });
  assert.deepEqual(decisionResults({ ...base, d2: 'ecg-first' }).d2, { result: 'Close', credit: 'partial' });
  assert.deepEqual(decisionResults({ ...base, d4: 'explain' }).d4, { result: 'Correct', credit: 'full' });
  assert.deepEqual(decisionResults({ ...base, d4: 'threat' }).d4, { result: 'No (unsafe)', credit: 'none' });
  assert.deepEqual(decisionResults({ ...base, d5: 'ask' }).d5, { result: 'Correct', credit: 'full' });
  assert.deepEqual(decisionResults({ ...base, d5: 'escalate' }).d5, { result: 'Not best', credit: 'none' });
});

test('saved progress is sanitized and cannot skip an unanswered decision', () => {
  assert.deepEqual(sanitizeProgress(null), freshProgress());
  const saved = sanitizeProgress({ version: 1, contentVersion: '0.7', stage: FINAL_STAGE, answers: { d1: { you: '22', tess: '21', marco: '23' }, d2: 'escalate' } });
  assert.equal(saved.stage, 3);
  const bad = sanitizeProgress({ version: 1, contentVersion: '0.7', stage: 2, answers: { d1: { you: '22', tess: 'roof', marco: '23' } } });
  assert.equal(bad.stage, 1);
  assert.equal(bad.answers.d1, undefined);
  assert.deepEqual(sanitizeProgress({ version: 1, contentVersion: '0.6', stage: 3 }), freshProgress());
});
