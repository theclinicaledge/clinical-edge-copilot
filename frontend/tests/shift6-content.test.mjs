import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import * as data from '../src/modules/the-shift/shift6/data.js';

const { ROOM14_VITALS, REWIND_B_VITALS, REWIND_C_1910, LABS, REWIND, assignment, d2, d3, d5, bp, pulsePressure, at } = data;

// Spec tables copied from SHIFT-006 v0.3 Part C and Part E: [time, HR, BP, pulse pressure, RR, SpO2, temp, note].
const SPEC_MAIN = [
  ['y2000', 78, '152/78', 74, 16, '97% RA', '37.0', 'Admission baseline'],
  ['0800', 82, '148/80', 68, 16, '97% RA', '36.9', ''],
  ['1200', 92, '136/82', 54, 18, '97% RA', '37.0', '"A little tired"'],
  ['1600', 98, '128/84', 44, 18, '96% RA', '37.0', '"Anxious about discharge"'],
  ['1910', 108, '118/86', 32, 22, '96% RA', '37.1', 'Taken by the learner'],
];
const SPEC_B = [
  ['y2000', 78, '152/78', 74, 16, '97% RA', '37.0', 'Admission baseline'],
  ['0800', 82, '148/80', 68, 16, '97% RA', '36.9', ''],
  ['1200', 90, '150/80', 70, 18, '97% RA', '37.0', 'After walking laps'],
  ['1600', 98, '146/78', 68, 18, '96% RA', '37.0', 'After walking laps'],
  ['1910', 80, '148/80', 68, 16, '96% RA', '37.1', 'At rest'],
];
const asRow = v => [v.time, v.hr, bp(v), pulsePressure(v), v.rr, `${v.spo2}% RA`, v.temp, v.note];

test('Room 14 main vitals match the spec table, including pulse pressure', () => {
  assert.deepEqual(ROOM14_VITALS.map(asRow), SPEC_MAIN);
});

test('Rewind B dataset matches the Part E Rewind B flowsheet', () => {
  assert.deepEqual(REWIND_B_VITALS.map(asRow), SPEC_B);
});

test('Rewind C 1910 matches the Rewind table, and its earlier readings follow the main table', () => {
  assert.deepEqual({ hr: REWIND_C_1910.hr, bp: bp(REWIND_C_1910), pp: pulsePressure(REWIND_C_1910), rr: REWIND_C_1910.rr }, { hr: 96, bp: '134/82', pp: 52, rr: 18 });
  assert.deepEqual([at(ROOM14_VITALS, '1200'), at(ROOM14_VITALS, '1600')].map(v => [v.hr, bp(v), pulsePressure(v)]), [[92, '136/82', 54], [98, '128/84', 44]]);
});

test('every screen that quotes Room 14 vitals or labs matches the spec text', () => {
  const room14 = assignment.patients.find(p => p.room === '14');
  assert.equal(room14.vitals, 'HR 98, BP 128/84, RR 18, SpO2 96% RA, T 37.0');
  assert.equal(room14.report, `"Leg looks way better, probably home tomorrow. His heart rate's been creeping up, but I think he's anxious about discharge and his knee hurts. Hgb was stable this morning, 12.1."`);
  assert.equal(d2.scene, 'You take his vitals: HR 108, BP 118/86, RR 22, SpO2 96%. He says he feels fine, just tired.');
  assert.equal(d3.cues.find(c => c.id === 'labs').text, 'Hgb 12.1, BUN 16, creatinine 0.9. Drawn at 0500.');
  assert.equal(d5.chips.find(c => c.id === 'situation').text, '"Dale Hartwell, 71, Room 14. HR 108, BP 118/86. Reports black, sticky stool this afternoon and nearly fainted at 1830."');
  assert.equal(d5.chips.find(c => c.id === 'lab-timing').text, `"This morning's Hgb was drawn at 0500, before the change started."`);
  assert.deepEqual(LABS, { drawn: '0500', hgb: '12.1', admissionHgb: '12.4', bun: '16', creatinine: '0.9' });
});

test('each Rewind variation shows its own Room 14 dataset', () => {
  const facts = id => REWIND.variations.find(v => v.id === id).facts;
  assert.equal(facts('a')[0], 'Starting vitals (1600): HR 98, BP 128/84');
  assert.equal(facts('a')[1], '1910: HR 108, BP 118/86 (pulse pressure 32), RR 22');
  assert.equal(facts('b')[0], 'Starting vitals (1600): HR 98, BP 146/78');
  assert.equal(facts('b')[1], '1910: HR 80 at rest, BP 148/80 (pulse pressure 68), RR 16');
  assert.equal(facts('c')[0], 'Starting vitals (1600): HR 98, BP 128/84');
  assert.equal(facts('c')[1], '1910: HR 96, BP 134/82 (pulse pressure 52), RR 18');
  assert.equal(REWIND.variations.find(v => v.id === 'b').flowsheet, 'b');
  assert.match(REWIND.variations.find(v => v.id === 'b').history, /walks laps with PT/);
});

test('no em dashes anywhere in Shift 06 content or source', () => {
  const strings = [];
  const walk = value => {
    if (typeof value === 'string') strings.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };
  walk(Object.fromEntries(Object.entries(data).filter(([, value]) => typeof value !== 'function')));
  assert.ok(strings.length > 150);
  assert.deepEqual(strings.filter(text => text.includes('—')), []);
  const dir = new URL('../src/modules/the-shift/shift6/', import.meta.url);
  for (const file of readdirSync(dir)) assert.ok(!readFileSync(new URL(file, dir), 'utf8').includes('—'), file);
  assert.ok(!readFileSync(new URL('../src/modules/the-shift/components/TrendReading.jsx', import.meta.url), 'utf8').includes('—'));
});

test('sources are stored by spec number, version 0.3, review status Draft', () => {
  assert.deepEqual(Object.keys(data.SOURCES), ['1', '2', '3', '4', '5', '6']);
  assert.equal(data.VERSION, '0.3');
  assert.equal(data.SCENARIO_ID, 'SHIFT-006');
  assert.equal(data.card.reviewStatus, 'Draft');
  assert.equal(data.card.contentReviewDate, 'Pending');
  assert.deepEqual(Object.entries(data.SOURCES).filter(([, s]) => s.licensingOpen).map(([n]) => n), ['1', '6']);
});
