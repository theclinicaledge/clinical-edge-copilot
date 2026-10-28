import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAssignment, assignmentBreakdown, decisionResults, credit, validPlacement, reviewLine, guidedAfter, anyGuided } from '../src/modules/the-shift/shift9/rules.js';
import { sanitizeProgress, freshProgress, FINAL_STAGE } from '../src/modules/the-shift/shift9/progress.js';
import { d1, debrief, REWIND } from '../src/modules/the-shift/shift9/data.js';

const fired = placement => evaluateAssignment(placement).fired.map(rule => rule.id).sort();
const TARGETS = ['21', '22', '23', 'station'];
const ALL = TARGETS.flatMap(you => TARGETS.flatMap(tess => TARGETS.map(marco => ({ you, tess, marco }))));
const key = p => `${p.you}/${p.tess}/${p.marco}`;
const BASE = { d1: { you: '22', tess: '21', marco: '23' }, d2: 'escalate', d3: 'inferior', d4: 'choice', d5: 'reassess' };

test('credit follows the result labels: Correct full, Close partial, everything else none', () => {
  assert.deepEqual(['Correct', 'Close', 'Not first', 'Not best', 'No', 'No (unsafe)'].map(credit), ['full', 'partial', 'none', 'none', 'none', 'none']);
});

test('D1 needs every token placed', () => {
  assert.equal(evaluateAssignment({ you: '22', tess: '21' }), null);
  assert.equal(validPlacement({ you: '22', tess: '21', marco: 'hall' }), false);
});

test('D1 v0.8 matrix: all 64 placements score as the v0.8 rules say', () => {
  const byResult = label => ALL.filter(p => evaluateAssignment(p).result === label).map(key).sort();
  // Either RN in either room; Marco helping in any of the three rooms.
  assert.deepEqual(byResult('Correct'), ['21/22/21', '21/22/22', '21/22/23', '22/21/21', '22/21/22', '22/21/23']);
  // RNs right, Marco at the station: partial credit.
  assert.deepEqual(byResult('Close'), ['21/22/station', '22/21/station']);
  // No RN in Room 22 is always unsafe.
  assert.deepEqual(byResult('No (unsafe)'), ALL.filter(p => p.you !== '22' && p.tess !== '22').map(key).sort());
  assert.equal(byResult('No').length, 64 - 6 - 2 - 36);
  for (const p of ALL) {
    const r = evaluateAssignment(p);
    assert.equal(r.full, r.result === 'Correct', key(p));
    assert.equal(r.guided, !['Correct', 'Close'].includes(r.result), key(p));
  }
});

// Audit H3: "No" with only green Correct rules, and placements with no rule for a team member.
test('D1 regression: every no-credit placement fires a No rule, and every team member is explained', () => {
  const ABOUT = {
    you: p => ({ 22: ['rn22', 'bothRn22'], 21: ['rn21', 'bothRn21'], 23: ['rnElsewhere'], station: ['rnElsewhere'] })[p.you],
    tess: p => ({ 22: ['rn22', 'bothRn22'], 21: ['rn21', 'bothRn21'], 23: ['rnElsewhere'], station: ['rnElsewhere'] })[p.tess],
    marco: p => ({ 21: ['marcoAlone21', 'marcoBackup21'], 22: ['marco22', 'marcoAlone22'], 23: ['marco23'], station: ['marcoStation'] })[p.marco],
  };
  for (const p of ALL) {
    const r = evaluateAssignment(p);
    const labels = r.fired.map(rule => rule.result);
    if (r.result === 'Correct') assert.ok(labels.every(label => label === 'Correct'), key(p));
    if (r.result === 'Close') assert.ok(labels.includes('Close') && !labels.some(label => label.startsWith('No')), key(p));
    if (r.result.startsWith('No')) assert.ok(labels.some(label => label.startsWith('No')), `${key(p)} shows only green rules`);
    for (const [token, ids] of Object.entries(ABOUT)) assert.ok(r.fired.some(rule => ids(p).includes(rule.id)), `${key(p)}: nothing about ${token}`);
  }
});

test('D1 fires the expected rules for representative placements', () => {
  assert.deepEqual(fired({ you: '22', tess: '21', marco: '23' }), ['marco23', 'rn21', 'rn22']);
  assert.deepEqual(fired({ you: '22', tess: '21', marco: '21' }), ['marcoBackup21', 'rn21', 'rn22']);
  assert.deepEqual(fired({ you: '22', tess: '21', marco: '22' }), ['marco22', 'rn21', 'rn22']);
  assert.deepEqual(fired({ you: '22', tess: '21', marco: 'station' }), ['marcoStation', 'rn21', 'rn22']);
  // Marco brings an antacid while both RNs go to Curtis.
  assert.deepEqual(fired({ you: '21', tess: '21', marco: '22' }), ['bothRn21', 'marcoAlone22', 'noRn22']);
  assert.deepEqual(fired({ you: '22', tess: '22', marco: '21' }), ['bothRn22', 'marcoAlone21', 'rn22']);
  assert.deepEqual(fired({ you: '22', tess: '23', marco: '23' }), ['marco23', 'noOne21', 'rn22', 'rnElsewhere']);
  assert.equal(evaluateAssignment({ you: '21', tess: '21', marco: '22' }).result, 'No (unsafe)');
  assert.equal(evaluateAssignment({ you: '22', tess: '22', marco: '21' }).result, 'No');
});

test('D1 path follows the RN placement, and guided paths never repeat the learner\'s own RN placement', () => {
  assert.equal(evaluateAssignment({ you: '22', tess: '21', marco: '23' }).path, 'a');
  assert.equal(evaluateAssignment({ you: '21', tess: '22', marco: 'station' }).path, 'b');
  assert.equal(evaluateAssignment({ you: '22', tess: '22', marco: '21' }).path, 'a');
  assert.equal(evaluateAssignment({ you: 'station', tess: '22', marco: '21' }).path, 'b');
  for (const p of ALL.filter(p => evaluateAssignment(p).guided)) {
    const { path } = evaluateAssignment(p);
    assert.ok(!(path === 'a' && p.you === '22' && p.tess === '21') && !(path === 'b' && p.tess === '22' && p.you === '21'), key(p));
  }
  assert.equal(evaluateAssignment({ you: '22', tess: '21', marco: '22' }).marcoAt, '22');
});

// Audit M1: the D1 review told learners who did send an RN to Room 22 that "Room 22 needed an RN first".
test('D1 regression: the review line matches the placement for all 64 placements', () => {
  const lines = debrief.review.d1;
  for (const p of ALL) {
    const r = evaluateAssignment(p);
    const line = reviewLine('d1', { d1: p });
    const rnIn22 = p.you === '22' || p.tess === '22';
    if (r.result === 'Correct') assert.deepEqual(line, { text: lines.correct, concept: null }, key(p));
    else if (r.result === 'Close') assert.deepEqual(line, { text: lines.close, concept: lines.closeConcept }, key(p));
    else assert.deepEqual(line, { text: rnIn22 ? lines.room21 : lines.missed, concept: lines.concept }, key(p));
  }
});

// Audit M2 and the other choice-specific review lines.
test('review lines describe the actual choice in D2 to D5', () => {
  assert.equal(reviewLine('d2', { ...BASE, d2: 'ecg-first' }).text, debrief.review.d2.close);
  assert.equal(reviewLine('d2', { ...BASE, d2: 'antacid' }).text, debrief.review.d2.missed);
  // D3's V1 to V4 choice keeps the spec's missed line.
  assert.equal(reviewLine('d3', { ...BASE, d3: 'anterior' }).text, debrief.review.d3.missed);
  assert.equal(reviewLine('d4', { ...BASE, d4: 'agree' }).text, debrief.review.d4.agree);
  assert.equal(reviewLine('d4', { ...BASE, d4: 'threat' }).text, debrief.review.d4.missed);
  assert.equal(reviewLine('d4', { ...BASE, d4: 'explain' }).text, debrief.review.d4.correct);
  assert.equal(reviewLine('d5', { ...BASE, d5: 'notify' }).text, debrief.review.d5.notify);
  assert.equal(reviewLine('d5', { ...BASE, d5: 'escalate' }).text, debrief.review.d5.missed);
  assert.equal(reviewLine('d5', { ...BASE, d5: 'ask' }).concept, null);
});

// Audit M3: unsafe D2 to D5 choices had no guided safer path, so the next scene contradicted them.
test('guided safer paths: D1 wrong RN placement, D2 anything but Escalate now, D3 to D5 no credit', () => {
  assert.equal(anyGuided(BASE), false);
  assert.equal(guidedAfter('d1', { ...BASE, d1: { you: '22', tess: '21', marco: 'station' } }), false);
  assert.equal(guidedAfter('d1', { ...BASE, d1: { you: '22', tess: '23', marco: '21' } }), true);
  for (const [d2, expected] of [['escalate', false], ['ecg-first', true], ['page', true], ['antacid', true], ['watch', true]]) assert.equal(guidedAfter('d2', { ...BASE, d2 }), expected, d2);
  for (const [d3, expected] of [['inferior', false], ['anterior', false], ['repeat', true], ['placement', true]]) assert.equal(guidedAfter('d3', { ...BASE, d3 }), expected, d3);
  for (const [d4, expected] of [['choice', false], ['explain', false], ['argue', true], ['agree', true], ['threat', true]]) assert.equal(guidedAfter('d4', { ...BASE, d4 }), expected, d4);
  for (const [d5, expected] of [['reassess', false], ['ask', false], ['notify', true], ['escalate', true]]) assert.equal(guidedAfter('d5', { ...BASE, d5 }), expected, d5);
  assert.equal(anyGuided({ ...BASE, d4: 'threat' }), true);
});

// v0.10: feedback is per person. Every team member gets exactly one rule about their own placement; uncovered rooms follow.
test('D1 breakdown: one explained line per team member for all 64 placements, coverage gaps listed, nothing hidden', () => {
  for (const p of ALL) {
    const b = assignmentBreakdown(p);
    assert.deepEqual(b.staff.map(s => s.token.id), ['you', 'tess', 'marco'], key(p));
    for (const s of b.staff) {
      assert.ok(s.rule, `${key(p)}: no rule for ${s.token.id}`);
      assert.equal(s.target.id, p[s.token.id]);
    }
    const shown = new Set([...b.staff.map(s => s.rule.id), ...b.coverage.map(r => r.id)]);
    for (const rule of b.fired) assert.ok(shown.has(rule.id) || (rule.id === 'rn22' && shown.has('bothRn22')), `${key(p)}: ${rule.id} not shown`);
    const labels = [...b.staff.map(s => s.rule.result), ...b.coverage.map(r => r.result)];
    if (b.result.startsWith('No')) assert.ok(labels.some(l => l.startsWith('No')), `${key(p)}: No with only green lines`);
    if (b.result === 'Correct') assert.ok(labels.every(l => l === 'Correct'), key(p));
    // Marco is never credited for an RN task.
    assert.ok(!/assess(es)? (dolores|curtis|her|him)|interpret|reads? the (strip|ecg)|talks? curtis down/i.test(b.staff[2].rule.text), key(p));
  }
});

test('D1 regression: Marco in Room 22, Marco at the station, both valid RN arrangements', () => {
  const marco = p => assignmentBreakdown(p).staff[2].rule;
  for (const rns of [{ you: '22', tess: '21' }, { you: '21', tess: '22' }]) {
    assert.deepEqual([evaluateAssignment({ ...rns, marco: '22' }).result, marco({ ...rns, marco: '22' }).id], ['Correct', 'marco22']);
    assert.deepEqual([evaluateAssignment({ ...rns, marco: '21' }).result, marco({ ...rns, marco: '21' }).id], ['Correct', 'marcoBackup21']);
    assert.deepEqual([evaluateAssignment({ ...rns, marco: '23' }).result, marco({ ...rns, marco: '23' }).id], ['Correct', 'marco23']);
    const station = evaluateAssignment({ ...rns, marco: 'station' });
    assert.deepEqual([station.result, station.guided, marco({ ...rns, marco: 'station' }).id], ['Close', false, 'marcoStation']);
    assert.equal(reviewLine('d1', { d1: { ...rns, marco: 'station' } }).text, debrief.review.d1.close);
    assert.notEqual(reviewLine('d1', { d1: { ...rns, marco: 'station' } }).text, debrief.review.d1.correct);
  }
  assert.equal(evaluateAssignment({ you: '22', tess: '21', marco: '22' }).path, 'a');
  assert.equal(evaluateAssignment({ you: '21', tess: '22', marco: '22' }).path, 'b');
  assert.match(marco({ you: '22', tess: '21', marco: '22' }).feedback, /RN keeps the assessment and every clinical decision/);
  assert.match(marco({ you: '22', tess: '21', marco: 'station' }).feedback, /isn't unsafe/);
  // Found in the v0.10 64-placement run: the station line must never claim both RN patients are covered when they aren't.
  for (const p of ALL.filter(p => p.marco === 'station')) {
    const text = marco(p).feedback;
    const covered = evaluateAssignment(p).result === 'Close';
    assert.equal(/both patients who need an RN have one/.test(text), covered, key(p));
    assert.equal(marco(p).result, 'Close', key(p));
  }
  // Invalid RN arrangements stay unsafe or incorrect wherever Marco is.
  for (const m of ['21', '22', '23', 'station']) {
    assert.equal(evaluateAssignment({ you: '21', tess: '21', marco: m }).result, 'No (unsafe)');
    assert.equal(evaluateAssignment({ you: '22', tess: '22', marco: m }).result, 'No');
    assert.equal(evaluateAssignment({ you: '22', tess: 'station', marco: m }).result, 'No');
  }
});

test('decision results: D3 V1 to V4 is partial, either calm D4 response and either Correct D5 call is full', () => {
  assert.ok(Object.values(decisionResults(BASE)).every(r => r.credit === 'full'));
  assert.deepEqual(decisionResults({ ...BASE, d1: { you: '22', tess: '21', marco: 'station' } }).d1, { result: 'Close', credit: 'partial' });
  assert.deepEqual(decisionResults({ ...BASE, d3: 'anterior' }).d3, { result: 'Close', credit: 'partial' });
  assert.deepEqual(decisionResults({ ...BASE, d2: 'ecg-first' }).d2, { result: 'Close', credit: 'partial' });
  assert.deepEqual(decisionResults({ ...BASE, d4: 'explain' }).d4, { result: 'Correct', credit: 'full' });
  assert.deepEqual(decisionResults({ ...BASE, d4: 'threat' }).d4, { result: 'No (unsafe)', credit: 'none' });
  assert.deepEqual(decisionResults({ ...BASE, d5: 'ask' }).d5, { result: 'Correct', credit: 'full' });
  assert.deepEqual(decisionResults({ ...BASE, d5: 'escalate' }).d5, { result: 'Not best', credit: 'none' });
});

// Audit H2 and M4: the Rewind gave away its answers, and Rewind C penalized a policy-compliant rapid response call.
test('Rewind regression: no answers before the choice; Rewind B stays urgent; Rewind C escalation is Close', () => {
  const calls = /continue and reassess|escalate|notify|stable|unstable|in between|main script/i;
  assert.ok(!calls.test(REWIND.intro), REWIND.intro);
  assert.deepEqual(REWIND.variations.map(v => v.title), ['Version A', 'Version B', 'Version C']);
  for (const v of REWIND.variations) assert.ok(!calls.test(v.title));
  const option = (v, id) => REWIND.variations.find(x => x.id === v).options.find(o => o.id === id);
  assert.equal(option('b', 'escalate').label, 'Correct');
  assert.equal(option('b', 'notify').label, 'No');
  assert.equal(option('b', 'recheck').label, 'No (unsafe)');
  assert.equal(option('b', 'reassess').label, 'No (unsafe)');
  assert.equal(option('c', 'notify').label, 'Correct');
  assert.equal(option('c', 'escalate').label, 'Close');
  assert.equal(option('c', 'reassess').label, 'No');
  assert.match(option('c', 'escalate').feedback, /rapid response criteria/);
  assert.match(option('c', 'notify').feedback, /provider call, not a rapid response call/);
  for (const v of REWIND.variations) assert.ok(v.alternative.length > 40, v.id);
});

test('saved progress is sanitized and cannot skip an unanswered decision', () => {
  assert.deepEqual(sanitizeProgress(null), freshProgress());
  const saved = sanitizeProgress({ version: 1, contentVersion: '0.10', stage: FINAL_STAGE, answers: { d1: { you: '22', tess: '21', marco: '23' }, d2: 'escalate' } });
  assert.equal(saved.stage, 3);
  const bad = sanitizeProgress({ version: 1, contentVersion: '0.10', stage: 2, answers: { d1: { you: '22', tess: 'roof', marco: '23' } } });
  assert.equal(bad.stage, 1);
  assert.equal(bad.answers.d1, undefined);
  // Progress from an earlier content version is not carried into v0.10.
  assert.deepEqual(sanitizeProgress({ version: 1, contentVersion: '0.9', stage: 3 }), freshProgress());
  assert.equal(d1.rules.length, 13);
});
