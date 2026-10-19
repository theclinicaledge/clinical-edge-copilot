import test from 'node:test';
import assert from 'node:assert/strict';
import { REWINDS } from '../src/modules/med-surg-track/content.js';
import { rewindResult } from '../src/modules/med-surg-track/store.js';
import { practiceKey, readPractice, updatePractice, practiceAttempt } from '../src/modules/rewind/standaloneStore.js';
const memory = () => { const entries = new Map(); return { entries, getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) }; };
test('standalone practice preserves source and track records, resumes and separates assignments', () => {
  const storage = memory();
  for (const key of ['ce-med-surg-track-private', 'ce-private-shift-drowsy-r2', 'ce_shift_005_v04']) storage.setItem(key, 'original bytes');
  let record = readPractice('a1', storage);
  const v = REWINDS.a1[0];
  record = updatePractice('a1', record, value => { value.selected = v.id; value.attempts.push(practiceAttempt('a1', v.id, 'escalate', null)); }, storage);
  assert.deepEqual(readPractice('a1', storage), record);
  assert.equal(readPractice('a2', storage).value.attempts.length, 0);
  for (const key of ['ce-med-surg-track-private', 'ce-private-shift-drowsy-r2', 'ce_shift_005_v04']) assert.equal(storage.getItem(key), 'original bytes');
});
test('bad JSON and incompatible records are preserved, never silently replaced', () => {
  for (const raw of ['{bad', '{"schema":99}']) {
    const storage = memory(); storage.setItem(practiceKey('a1'), raw);
    const record = readPractice('a1', storage);
    assert.equal(record.status, 'blocked');
    assert.equal(updatePractice('a1', record, () => assert.fail('must not edit'), storage).status, 'blocked');
    assert.equal(storage.getItem(practiceKey('a1')), raw);
  }
});
test('storage failure keeps multiple in-session responses and reports unsaved state', () => {
  const storage = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  let record = readPractice('a1', storage);
  for (const variation of REWINDS.a1.slice(0, 2)) record = updatePractice('a1', record, value => value.attempts.push(practiceAttempt('a1', variation.id, 'escalate', null)), storage);
  assert.equal(record.status, 'unavailable'); assert.equal(record.value.attempts.length, 2);
});
test('standalone response feedback matches existing track rules for every authored variant', () => {
  for (const id of ['a1', 'a2']) for (const variation of REWINDS[id]) for (const call of ['reassess', 'information', 'notify', 'escalate']) for (const info of ['assessment', 'glucose', 'history', 'wound']) {
    const attempt = practiceAttempt(id, variation.id, call, info);
    assert.deepEqual({ label: attempt.label, why: attempt.why, alternative: attempt.alternative }, rewindResult(variation, call, info));
  }
  assert.equal(practiceAttempt('a1', REWINDS.a1[0].id, 'information', null), null);
});
test('writes merge the latest stored attempts instead of replacing another open view', () => {
  const storage = memory(); const initial = readPractice('a1', storage);
  const add = value => value.attempts.push(practiceAttempt('a1', REWINDS.a1[0].id, 'escalate', null));
  updatePractice('a1', initial, add, storage);
  updatePractice('a1', initial, add, storage);
  assert.equal(readPractice('a1', storage).value.attempts.length, 2);
});

const { PACKS } = await import('../src/modules/rewind/packs.js');
const expected = {
  'monitor-alarm': [['verify', 'Accepted'], ['help', 'Accepted'], ['report', 'Accepted']],
  'discharge-puzzle': [['clarify', 'Accepted'], ['reteach', 'Accepted'], ['complete', 'Accepted']],
  conversation: [['direct', 'Accepted'], ['stay', 'Accepted'], ['honest', 'Accepted']],
};
for (const [id, answers] of Object.entries(expected)) {
  test(`${id}: three distinct decisions, tailored feedback and saved responses survive reload`, () => {
    const storage = memory();
    storage.setItem('original-shift', 'unchanged');
    let record = readPractice(id, storage);
    assert.equal(PACKS[id].variations.length, 3);
    PACKS[id].variations.forEach((v, index) => {
      const [call, label] = answers[index];
      assert.equal(practiceAttempt(id, v.id, call, null).label, label);
      assert.equal(v.options.filter(o => o.label === 'Accepted').length, 1);
      assert.equal(new Set(v.options.map(o => o.feedback)).size, 3);
      assert.ok(v.sources.length && v.facts.length >= 3 && v.history && v.rationale);
      assert.equal(practiceAttempt(id, v.id, 'not-an-option', null), null);
      for (const option of v.options) {
        const attempt = practiceAttempt(id, v.id, option.id, null);
        assert.equal(attempt.why, option.feedback);
        assert.equal(attempt.information, null);
        record = updatePractice(id, record, value => { value.selected = v.id; value.attempts.push(attempt); }, storage);
      }
    });
    assert.deepEqual(readPractice(id, storage), record);
    assert.equal(record.value.attempts.length, 9);
    assert.equal(storage.getItem('original-shift'), 'unchanged');
    assert.equal(readPractice('a1', storage).value.attempts.length, 0);
    const raw = JSON.stringify({ ...record.value, contentVersion: 'incompatible' });
    storage.setItem(practiceKey(id), raw);
    assert.equal(readPractice(id, storage).status, 'blocked');
    assert.equal(storage.getItem(practiceKey(id)), raw);
  });
}
test('urgent deterioration and current suicidal thoughts cannot be passed by delaying help', () => {
  for (const [id, variation, call] of [
    ['monitor-alarm', 'monitor-change', 'ecg-first'],
    ['monitor-alarm', 'monitor-change', 'later'],
    ['discharge-puzzle', 'discharge-conflict', 'choose-stop'],
    ['discharge-puzzle', 'discharge-conflict', 'later'],
    ['conversation', 'conversation-stay', 'leave'],
    ['conversation', 'conversation-stay', 'promise'],
    ['conversation', 'conversation-trust', 'secret'],
  ]) assert.equal(practiceAttempt(id, variation, call, null).label, 'Unsafe');
});
