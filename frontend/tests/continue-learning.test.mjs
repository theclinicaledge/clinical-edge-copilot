import test from 'node:test';
import assert from 'node:assert/strict';
import { resumableExperiences } from '../src/components/continueLearning.js';
import { SHIFTS, progressLabel } from '../src/modules/the-shift/integrated/registry.js';
import { shiftPath } from '../src/modules/the-shift/routing.js';
import { fresh as fresh7 } from '../src/modules/the-shift/shift7/rules.js';
import { fresh as fresh5 } from '../src/modules/the-shift/shift5/rules.js';
import { fresh as fresh10, transition, savePayload } from '../src/modules/the-shift/shift10/state.js';
const labels = item => item.label;
const fixture = (count) => Array.from({ length: count }, (_, index) => ({ id: `shift-${index}`, label: 'Continue: Receiving assessment', readProgress: () => ({ updated: 999 }) }));
for (const count of [0, 1, 6, 25]) test(`${count} unfinished saves: one featured candidate, every destination retained`, () => {
  const items = fixture(count);
  const result = resumableExperiences(items, labels, 1000);
  assert.equal(result.length, count);
  assert.equal(result.slice(0, 1).length, Math.min(count, 1));
  assert.deepEqual(result.map(({ item }) => shiftPath(item.id)), items.map(item => `/learn/shifts/${item.id}`));
  assert.ok(result.every(row => row.activity === null), 'unrelated timestamp fields do not invent recency');
});
test('six real saved Shift formats remain accessible without rewriting any record', () => {
  const memory = new Map();
  const previous = globalThis.localStorage;
  globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: () => assert.fail('unexpected write') };
  try {
    const saves = {
      'drowsy-patient': { version: 1, stage: 1, answers: {} },
      'monitor-alarm': { version: 1, stage: 1, answers: {} },
      'discharge-puzzle': { version: '0.2', stage: 1, answers: {} },
      'which-patient-first': { ...fresh5(), stage: 1 },
      'missing-time': { ...fresh7(), stage: 1, updated: 100 },
      'transfer-not-ready': JSON.parse(savePayload(transition(fresh10(), { type: 'start' }))),
    };
    for (const [id, value] of Object.entries(saves)) memory.set(SHIFTS.find(item => item.id === id).storageKey, JSON.stringify(value));
    const snapshot = [...memory];
    const result = resumableExperiences(SHIFTS, progressLabel);
    assert.equal(result.length, 6);
    assert.equal(result[0].item.id, 'missing-time');
    assert.deepEqual(new Set(result.map(row => row.item.id)), new Set(Object.keys(saves)));
    assert.deepEqual([...memory], snapshot);
  } finally { globalThis.localStorage = previous; }
});
test('dated activity sorts first; undated, invalid and future activity use stable library order', () => {
  const undated = fixture(3);
  const dated = { id: 'missing-time', label: 'Continue: Handoff', readProgress: () => ({ updated: 900 }) };
  assert.deepEqual(resumableExperiences([...undated, dated], labels, 1000).map(row => row.item.id), ['missing-time', 'shift-0', 'shift-1', 'shift-2']);
  for (const updated of [0, -1, NaN, Infinity, 1001, '900']) {
    dated.readProgress = () => ({ updated });
    assert.deepEqual(resumableExperiences([...undated, dated], labels, 1000).map(row => row.item.id), ['shift-0', 'shift-1', 'shift-2', 'missing-time']);
  }
});
test('completed, unstarted and unavailable saves never become Resume cards', () => {
  const items = ['Debrief reached', 'Not started', 'Saved progress unavailable', 'Continue: ED report'].map((label, index) => ({ id: String(index), label }));
  assert.deepEqual(resumableExperiences(items, labels).map(row => row.item.id), ['3']);
});
test('real legacy readers preserve storage, completion, resume paths and existing Shift 10 navigation', () => {
  const memory = new Map();
  const before = globalThis.localStorage;
  globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: () => assert.fail('home must never write progress'), removeItem: () => assert.fail('home must never delete progress') };
  try {
    assert.deepEqual(resumableExperiences(SHIFTS, progressLabel), []);
    const seven = SHIFTS.find(item => item.id === 'missing-time');
    const ten = SHIFTS.find(item => item.id === 'transfer-not-ready');
    const one = SHIFTS.find(item => item.id === 'drowsy-patient');
    memory.set(one.storageKey, JSON.stringify({ version: 1, stage: 1, answers: {} }));
    memory.set(seven.storageKey, JSON.stringify({ ...fresh7(), stage: 1, updated: 100 }));
    memory.set(ten.storageKey, JSON.stringify({ ...JSON.parse(savePayload(transition(fresh10(), { type: 'start' }))), navigation: 'report' }));
    memory.set('unrelated-learning-save', 'keep');
    const snapshot = [...memory];
    assert.deepEqual(resumableExperiences(SHIFTS, progressLabel).map(row => shiftPath(row.item.id)), ['/learn/shifts/missing-time', '/learn/shifts/drowsy-patient', '/learn/shifts/transfer-not-ready']);
    assert.deepEqual([...memory], snapshot);
    memory.set(seven.storageKey, JSON.stringify({ ...fresh7(), stage: 5, updated: 100, answers: { opening: ['activate'] }, water: 'hold', contact: 'phone', handoff: [] }));
    assert.ok(!resumableExperiences(SHIFTS, progressLabel).some(row => row.item === seven));
    memory.set(one.storageKey, '{invalid');
    assert.deepEqual(resumableExperiences(SHIFTS, progressLabel).map(row => row.item.id), ['transfer-not-ready']);
  } finally { globalThis.localStorage = before; }
});
