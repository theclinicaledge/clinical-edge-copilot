import { test } from 'node:test';
import assert from 'node:assert/strict';
import { d1, d2, d4, d6, REWIND } from '../src/modules/the-shift/shift6/data.js';
import { credit, evaluateCues, evaluateSbar, decisionResults } from '../src/modules/the-shift/shift6/rules.js';
import { sanitizeProgress, freshProgress, FINAL_STAGE } from '../src/modules/the-shift/shift6/progress.js';
import { validRewind, freshRewind, rewindAttempt } from '../src/modules/the-shift/shift6/rewindStore.js';

const labels = items => Object.fromEntries(items.map(item => [item.id, item.result ?? item.label]));

test('every decision choice carries the spec result label', () => {
  assert.deepEqual(labels(d1.choices), { 14: 'Correct', flowsheets: 'Close', 16: 'Not first', 12: 'Not first' });
  assert.deepEqual(labels(d2.choices), { 1200: 'Correct', 1600: 'Close', 1910: 'Not best', '0800': 'No' });
  assert.deepEqual(labels(d4.choices), { escalate: 'Correct', notify: 'No', hgb: 'No (unsafe)', orthostatic: 'No (unsafe)', continue: 'No (unsafe)' });
  assert.deepEqual(labels(d6.choices), { reassess: 'Correct', recheck: 'Correct', notify: 'Not best', escalate: 'Not best' });
});

test('Correct earns full credit, Close earns partial credit, nothing else earns credit', () => {
  assert.equal(credit('Correct'), 'full');
  assert.equal(credit('Close'), 'partial');
  for (const label of ['Not first', 'Not best', 'No', 'No (unsafe)']) assert.equal(credit(label), 'none');
  assert.ok(!d2.choices.some(choice => choice.id === 'y2000'), 'the baseline column is not selectable');
});

test('D3: all three Essential findings are required; Supporting is never required; Not relevant carries no penalty', () => {
  assert.equal(evaluateCues(['stool', 'standing', 'skin']).result, 'Correct');
  assert.equal(evaluateCues(['stool', 'standing', 'skin', 'leg', 'knee', 'iv']).result, 'Correct');
  assert.equal(evaluateCues(['stool', 'standing', 'skin', 'labs', 'meds']).supporting, 2);
  assert.equal(evaluateCues(['stool', 'labs']).result, 'Close');
  assert.equal(evaluateCues(['labs', 'meds', 'leg']).result, 'No');
  assert.deepEqual(evaluateCues(['stool', 'standing', 'skin', 'iv']).notRelevant.map(cue => cue.id), ['iv']);
});

test('D5: three Essential chips plus the Correct recommendation earn full credit', () => {
  const essential = ['situation', 'background', 'assessment'];
  assert.equal(evaluateSbar({ chips: essential, recommendation: 'bedside' }).result, 'Correct');
  assert.equal(evaluateSbar({ chips: [...essential, 'home-meds', 'lab-timing', 'aspirin', 'anxious'], recommendation: 'bedside' }).result, 'Correct');
  assert.equal(evaluateSbar({ chips: essential, recommendation: 'orders' }).result, 'Close');
  assert.equal(evaluateSbar({ chips: ['situation'], recommendation: 'bedside' }).result, 'Close');
  assert.equal(evaluateSbar({ chips: ['leg', 'anxious'], recommendation: 'watch' }).result, 'No');
});

test('decision results for an all-correct and an all-missed shift', () => {
  const correct = decisionResults({ d1: '14', d2: '1200', d3: ['stool', 'standing', 'skin'], d4: 'escalate', d5: { chips: ['situation', 'background', 'assessment'], recommendation: 'bedside' }, d6: 'recheck' });
  assert.ok(Object.values(correct).every(r => r.credit === 'full'));
  const missed = decisionResults({ d1: '12', d2: '0800', d3: ['leg'], d4: 'continue', d5: { chips: ['anxious'], recommendation: 'watch' }, d6: 'escalate' });
  assert.ok(Object.values(missed).every(r => r.credit === 'none'));
  assert.deepEqual(decisionResults({ d1: 'flowsheets' }).d1, { result: 'Close', credit: 'partial' });
});

test('saved progress is sanitized and cannot skip unanswered decisions', () => {
  assert.deepEqual(sanitizeProgress(null), freshProgress());
  assert.deepEqual(sanitizeProgress({ ...freshProgress(), contentVersion: '0.2', stage: 3 }), freshProgress());
  const skipped = sanitizeProgress({ ...freshProgress(), stage: FINAL_STAGE, answers: { d1: '14', d2: 'y2000' } });
  assert.equal(skipped.stage, 2);
  assert.equal(skipped.answers.d2, undefined);
  const tampered = sanitizeProgress({ ...freshProgress(), stage: 4, answers: { d1: '14', d2: '1200', d3: ['stool', 'invented'] }, revealed: ['stool'], selected: ['stool', 'skin'] });
  assert.deepEqual(tampered.answers.d3, ['stool']);
  assert.deepEqual(tampered.selected, ['stool']);
});

test('Rewind keeps every spec label and correct call per variation', () => {
  const byVariation = Object.fromEntries(REWIND.variations.map(v => [v.id, labels(v.options)]));
  assert.deepEqual(byVariation.a, labels(d4.choices));
  assert.deepEqual(byVariation.b, { reassess: 'Correct', stool: 'Correct', notify: 'Close', escalate: 'Not best' });
  assert.deepEqual(byVariation.c, { notify: 'Correct', escalate: 'Close', recheck: 'Close', reassess: 'No' });
  const record = freshRewind();
  for (const variation of REWIND.variations) for (const option of variation.options) {
    const attempt = rewindAttempt(variation.id, option.id);
    assert.equal(attempt.label, option.label);
    assert.equal(attempt.why, option.feedback);
    record.attempts.push(attempt);
  }
  assert.ok(validRewind(record));
  assert.equal(rewindAttempt('b', 'hgb'), null);
  assert.ok(!validRewind({ ...record, attempts: [{ ...record.attempts[0], label: 'Accepted' }] }));
});

test('preview saves retain original choices while new drafts remain unsubmitted', () => {
  const legacy = { ...freshProgress(), stage: 4, answers: { d1: 'flowsheets', d2: '1600', d3: ['skin'] } };
  delete legacy.drafts;
  const restored = sanitizeProgress(legacy);
  assert.deepEqual(restored.answers, legacy.answers);
  assert.deepEqual(restored.drafts, {});
  const draft = sanitizeProgress({ ...restored, drafts: { d4: 'hgb', d6: 'invalid' } });
  assert.deepEqual(draft.drafts, { d4: 'hgb' });
  assert.equal(draft.answers.d4, undefined);
  assert.equal(draft.stage, 4);
});
