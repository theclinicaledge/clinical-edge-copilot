import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import * as data from '../src/modules/the-shift/shift6/data.js';

const { ROOM14_VITALS, REWIND_B_VITALS, REWIND_C_1910, LABS, REWIND, FLOWSHEET_ROWS, assignment, d2, d3, d5, bp, at } = data;

// v0.4 tables (SHIFT-006 v0.3 spec, revised and approved in the clinical review): [time, HR, BP, RR, SpO2, temp, note].
const SPEC_MAIN = [
  ['y2000', 78, '152/78', 16, '97% RA', '37.0', 'Admission baseline'],
  ['0800', 80, '150/80', 16, '97% RA', '36.9', ''],
  ['1200', 94, '134/82', 18, '97% RA', '37.0', '"A little tired"'],
  ['1600', 100, '124/84', 20, '96% RA', '37.0', '"Anxious about discharge"'],
  ['1910', 116, '108/80', 24, '96% RA', '37.1', 'Taken by the learner'],
];
const SPEC_B = [
  ['y2000', 78, '152/78', 16, '97% RA', '37.0', 'Admission baseline'],
  ['0800', 80, '150/80', 16, '97% RA', '36.9', ''],
  ['1200', 90, '150/80', 18, '97% RA', '37.0', 'After walking laps'],
  ['1600', 98, '146/78', 18, '96% RA', '37.0', 'After walking laps'],
  ['1910', 80, '148/80', 16, '96% RA', '37.1', 'At rest'],
];
const asRow = v => [v.time, v.hr, bp(v), v.rr, `${v.spo2}% RA`, v.temp, v.note];

test('Room 14 main vitals match the approved table', () => {
  assert.deepEqual(ROOM14_VITALS.map(asRow), SPEC_MAIN);
});

test('Rewind B dataset matches the Part E Rewind B flowsheet', () => {
  assert.deepEqual(REWIND_B_VITALS.map(asRow), SPEC_B);
});

test('Rewind C 1910 matches the Rewind table, and its earlier readings follow the main table', () => {
  assert.deepEqual({ hr: REWIND_C_1910.hr, bp: bp(REWIND_C_1910), rr: REWIND_C_1910.rr }, { hr: 96, bp: '134/82', rr: 18 });
  assert.deepEqual([at(ROOM14_VITALS, '1200'), at(ROOM14_VITALS, '1600')].map(v => [v.hr, bp(v)]), [[94, '134/82'], [100, '124/84']]);
  // Variation C feedback says its 1910 numbers are a little better than at 1600.
  const at1600 = at(ROOM14_VITALS, '1600');
  assert.ok(REWIND_C_1910.hr < at1600.hr && REWIND_C_1910.sys > at1600.sys && REWIND_C_1910.rr < at1600.rr);
});

test('the main trend moves the same direction at every check from 1200 on', () => {
  const series = ROOM14_VITALS.slice(1);
  for (let i = 1; i < series.length; i++) {
    assert.ok(series[i].hr > series[i - 1].hr, `HR rises at ${series[i].time}`);
    assert.ok(series[i].sys < series[i - 1].sys, `systolic falls at ${series[i].time}`);
    assert.ok(series[i].rr >= series[i - 1].rr, `RR does not fall at ${series[i].time}`);
  }
  const base = ROOM14_VITALS[0], now = at(ROOM14_VITALS, '1910');
  assert.equal(base.sys - now.sys, 44);
  assert.match(d2.teaching, /108 is a 44-point drop/);
  assert.match(data.card.twist, /108 systolic is 44 points below/);
  assert.ok(now.sys > 90, 'D4 feedback says escalate even with a systolic above 90');
});

test('every screen that quotes Room 14 vitals or labs matches the spec text', () => {
  const room14 = assignment.patients.find(p => p.room === '14');
  assert.equal(room14.vitals, 'HR 100, BP 124/84, RR 20, SpO2 96% RA, T 37.0');
  assert.equal(room14.report, `"Leg looks way better, probably home tomorrow. His heart rate's been creeping up, but I think he's anxious about discharge and his knee hurts. Hgb was stable this morning, 12.1."`);
  assert.equal(d2.scene, 'You take his vitals: HR 116, BP 108/80, RR 24, SpO2 96%, T 37.1. He says he feels fine, just tired.');
  assert.equal(d3.cues.find(c => c.id === 'labs').text, 'Hgb 12.1, BUN 16, creatinine 0.9. Drawn at 0500.');
  assert.equal(d5.chips.find(c => c.id === 'situation').text, '"Dale Hartwell, 71, Room 14. HR 116, BP 108/80. Reports black, sticky stool this afternoon and nearly fainted at 1830."');
  assert.equal(d5.chips.find(c => c.id === 'lab-timing').text, `"This morning's Hgb was drawn at 0500, before the change started."`);
  assert.deepEqual(LABS, { drawn: '0500', hgb: '12.1', admissionHgb: '12.4', bun: '16', creatinine: '0.9' });
});

test('each Rewind variation shows its own Room 14 dataset', () => {
  const facts = id => REWIND.variations.find(v => v.id === id).facts;
  assert.equal(facts('a')[0], 'Starting vitals (1600): HR 100, BP 124/84');
  assert.equal(facts('a')[1], '1910: HR 116, BP 108/80, RR 24');
  assert.equal(facts('b')[0], 'Starting vitals (1600): HR 98, BP 146/78');
  assert.equal(facts('b')[1], '1910: HR 80 at rest, BP 148/80, RR 16');
  assert.equal(facts('c')[0], 'Starting vitals (1600): HR 100, BP 124/84');
  assert.equal(facts('c')[1], '1910: HR 96, BP 134/82, RR 18');
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

test('sources are stored by spec number, version 0.4, sign-off not claimed', () => {
  // OpenStax sources 1 and 6 were removed; nothing may still cite them. Source 7 backs debrief bullet 2,
  // and Sources 8 and 9 back D6.
  assert.deepEqual(Object.keys(data.SOURCES), ['2', '3', '4', '5', '7', '8', '9']);
  assert.deepEqual(data.d6.sources, [8, 9]);
  const cited = [data.d1, data.d2, data.d3, data.d4, data.d5, data.d6, REWIND].flatMap(item => item.sources).concat(data.debrief.why.map(([, number]) => number).filter(Boolean));
  assert.deepEqual(cited.filter(number => !data.SOURCES[number]), []);
  assert.ok(!JSON.stringify(data.SOURCES).includes('openstax'));
  assert.equal(data.debrief.why[1][1], 7);
  assert.equal(data.SOURCES[7].url, 'https://www.ncbi.nlm.nih.gov/books/NBK537232/');
  assert.equal(data.VERSION, '0.4');
  assert.equal(data.SCENARIO_ID, 'SHIFT-006');
  assert.equal(data.card.reviewStatus, 'Clinical sign-off not yet recorded');
  assert.equal(data.card.contentReviewDate, 'Pending');
});

test('no pulse pressure, Draft marking or medication hold language in Shift 06', () => {
  assert.ok(!FLOWSHEET_ROWS.some(row => /pulse/i.test(row.label)));
  assert.equal(data.pulsePressure, undefined);
  const dir = new URL('../src/modules/the-shift/shift6/', import.meta.url);
  const files = readdirSync(dir).filter(file => /\.(js|jsx|css|svg)$/.test(file)).map(file => [file, readFileSync(new URL(file, dir), 'utf8')]);
  files.push(['TrendReading.jsx', readFileSync(new URL('../src/modules/the-shift/components/TrendReading.jsx', import.meta.url), 'utf8')]);
  for (const [file, text] of files) {
    assert.ok(!/pulse.?pressure/i.test(text.replace(/no pulse pressure/, '')), `${file} mentions pulse pressure`);
    assert.ok(!/\bhold\b/i.test(text), `${file} uses hold language`);
  }
  const learnerText = JSON.stringify(Object.fromEntries(Object.entries(data).filter(([key, value]) => typeof value !== 'function' && key !== 'OPEN_ITEMS')));
  assert.ok(!/\bdraft\b/i.test(learnerText));
  assert.equal(d5.chips.find(c => c.id === 'aspirin').text, '"Can you review his aspirin and anti-inflammatory orders when you assess him?"');
});
