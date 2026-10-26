import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import * as data from '../src/modules/the-shift/shift9/data.js';

const { VITALS, STRIPS, ROOM22_GLUCOSE, assignment, d1, d2, d3, d4, d5, REWIND, debrief, card, SOURCES, bp, vitalsAt, stripsFor } = data;

// SHIFT-009 v0.8 (vitals unchanged from v0.7), Part C and the Rewind table: [time, HR, BP, RR, SpO2 with oxygen].
const SPEC_VITALS = {
  21: [['1430', 'HR 84, BP 138/86, RR 16, SpO2 98% RA']],
  22: [['1430', 'HR 88, BP 132/74, RR 18, SpO2 95% on 2 L'], ['1508', 'HR 94, BP 106/62, RR 22, SpO2 93% on 2 L']],
  23: [['1430', 'HR about 110, BP 128/76, RR 16, SpO2 97% RA'], ['1530', 'HR 110, BP 126/78, RR 16, SpO2 97% RA']],
};

test('each patient vitals table matches the spec', () => {
  for (const [room, rows] of Object.entries(SPEC_VITALS)) {
    assert.deepEqual(VITALS[room].map(v => [v.time, `HR ${v.hrText}, BP ${bp(v)}, RR ${v.rr}, SpO2 ${v.spo2}% ${v.o2}`]), rows, `Room ${room}`);
  }
  assert.deepEqual(ROOM22_GLUCOSE, { time: '1500', value: 164 });
});

test('every screen that quotes vitals matches the spec text', () => {
  const card = room => assignment.patients.find(p => p.room === room).vitals;
  assert.equal(card('21'), 'HR 84, BP 138/86, RR 16, SpO2 98% RA. Sinus rhythm.');
  assert.equal(card('22'), 'HR 88, BP 132/74, RR 18, SpO2 95% on 2 L. Sinus rhythm, ST at baseline.');
  assert.equal(card('23'), 'HR about 110, BP 128/76, RR 16, SpO2 97% RA. Atrial fibrillation.');
  assert.deepEqual(d2.steps.map(([, name, then, now]) => [name, then, now]), [
    ['Rate and rhythm', 'Sinus, 88', 'Sinus, 94'],
    ['ST segment, lead II', 'At baseline', 'Raised about 2 mm'],
    ['Electrodes', 'Moved during the 1400 bath', 'You check: all in the right spots'],
    ['BP', '132/74', '106/62'],
    ['RR, SpO2', '18, 95% on 2 L', '22, 93% on 2 L'],
    ['Symptoms', 'None', 'Upper belly burning since about 1440, nausea, sweating, "more tired than this morning." Denies chest pain.'],
    ['Glucose', 'Not checked', "164 at 1500, so low blood sugar doesn't explain the sweating"],
  ]);
  assert.equal(d2.choices[0].feedback, "New ST elevation, a 26-point drop in systolic pressure, sweating and nausea in a 76-year-old with diabetes add up to a possible heart attack. Don't wait for her to call it chest pain.");
  assert.equal(vitalsAt(22, '1430').sys - vitalsAt(22, '1508').sys, 26);
  assert.equal(d5.vitals, 'HR 110, BP 126/78, RR 16, SpO2 97% RA.');
  const facts = id => REWIND.variations.find(v => v.id === id).facts;
  assert.equal(facts('a')[2], 'BP: 126/78');
  assert.equal(facts('b')[2], 'BP: 84/50');
  assert.equal(facts('c')[2], 'BP: 124/76');
  assert.deepEqual(REWIND.variations.map(v => v.facts[0]), ['Strip: AFib, about 110', 'Strip: AFib, about 150', 'Strip: AFib, about 130']);
});

// Part E asset table: file, screens it is used on, screen-reader text.
const SPEC_ASSETS = [
  ['rm21_1430_sinus84.png', ['assignment'], 'Room 21, lead II, 1430. Regular rhythm at 84 with a P wave before every QRS. Sinus rhythm.'],
  ['rm21_1505_artifact_leadsoff.png', ['d1'], 'Room 21, lead II, 1505. Regular beats under heavy wavy artifact for about three seconds, then a flat line with a LEADS OFF message. The monitor has lost the signal. This is not asystole.'],
  ['rm22_1430_sinus88.png', ['assignment', 'd1', 'd2'], 'Room 22, lead II, 1430. Sinus rhythm at 88. The ST segment sits on the baseline.'],
  ['rm22_1508_sinus94_ste.png', ['d2'], 'Room 22, lead II, 1508. Sinus rhythm at 94. The ST segment is raised about 2 millimeters and runs into a tall T wave.'],
  ['rm22_1513_12lead_inferior_stemi.png', ['d3'], 'Room 22, 12-lead ECG, 1513. Sinus rhythm at 94. ST elevation of about 2 to 3 millimeters in leads II, III and aVF. ST depression in leads I and aVL. The chest leads show no ST elevation.'],
  ['rm23_1430_afib110.png', ['assignment', 'd1'], 'Room 23, lead II, 1430. Irregularly irregular rhythm with no P waves and a wavy baseline. 11 QRS complexes in 6 seconds, about 110. Atrial fibrillation.'],
  ['rm23_1535_afib110_rewindA.png', ['d5', 'rewind-a'], 'Room 23, lead II, 1535. Irregularly irregular rhythm with no P waves. 11 QRS complexes in 6 seconds, about 110.'],
  ['rm23_rewindB_afib150.png', ['rewind-b'], 'Room 23, lead II, 1535, Rewind B. Irregularly irregular rhythm with no P waves. 15 QRS complexes in 6 seconds, about 150.'],
  ['rm23_rewindC_afib130.png', ['rewind-c'], 'Room 23, lead II, 1535, Rewind C. Irregularly irregular rhythm with no P waves. 13 QRS complexes in 6 seconds, about 130.'],
];

// Part E mapping plus the founder's 24 Oct 2026 change: D1 also shows the Room 22 and 23 starting strips.
test('each image maps to the Part E screens and uses the Part E alt text word for word', () => {
  assert.deepEqual(Object.values(STRIPS).map(s => [s.file, s.screens, s.alt]), SPEC_ASSETS);
  const dir = new URL('../src/modules/the-shift/shift9/assets/', import.meta.url);
  assert.deepEqual(readdirSync(dir).sort(), SPEC_ASSETS.map(([file]) => file).sort());
  for (const strip of Object.values(STRIPS)) assert.ok(existsSync(new URL(strip.file, dir)), strip.file);
});

test('each screen shows the strip Part E assigns to it', () => {
  assert.deepEqual(assignment.patients.map(p => p.strip), stripsFor('assignment'));
  assert.deepEqual(d1.strips, stripsFor('d1'));
  assert.equal(d1.strip, 'rm21-1505');
  assert.deepEqual(d2.strips, stripsFor('d2'));
  assert.deepEqual([d3.strip], stripsFor('d3'));
  assert.deepEqual([d5.strip], stripsFor('d5'));
  for (const v of REWIND.variations) assert.deepEqual([v.strip], stripsFor(`rewind-${v.id}`));
});

test('every rate on screen equals the rate on its strip', () => {
  const rate = id => STRIPS[id].rate;
  assert.equal(rate('rm21-1430'), vitalsAt(21, '1430').hr);
  assert.equal(rate('rm22-1430'), vitalsAt(22, '1430').hr);
  assert.equal(rate('rm22-1508'), vitalsAt(22, '1508').hr);
  assert.equal(rate('rm22-1513-12lead'), vitalsAt(22, '1508').hr);
  assert.equal(rate('rm23-1430'), vitalsAt(23, '1430').hr);
  assert.equal(rate('rm23-1535-a'), vitalsAt(23, '1530').hr);
  assert.deepEqual(REWIND.variations.map(v => rate(v.strip)), [110, 150, 130]);
  // Rhythm-strip file names carry the drawn rate; the 12-lead file name does not.
  for (const strip of Object.values(STRIPS).filter(s => s.rate && !s.twelveLead)) assert.match(strip.file, new RegExp(String(strip.rate)));
  assert.match(d5.choices[0].feedback, /rate about 110 \(11 QRS in 6 seconds\)/);
});

test('decision-screen captions carry only room, lead and time', () => {
  for (const strip of Object.values(STRIPS)) {
    assert.match(strip.caption, /^Room 2[123], (lead II|12-lead ECG), \d{4}$/);
    assert.ok(!/sinus|afib|atrial|fibrillation|stemi|artifact|leads off/i.test(strip.caption));
  }
});

test('no em dashes anywhere in Shift 09 content or source', () => {
  const strings = [];
  const walk = value => {
    if (typeof value === 'string') strings.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };
  walk(Object.fromEntries(Object.entries(data).filter(([, value]) => typeof value !== 'function')));
  assert.ok(strings.length > 200);
  assert.deepEqual(strings.filter(text => text.includes('—')), []);
  const dir = new URL('../src/modules/the-shift/shift9/', import.meta.url);
  for (const file of readdirSync(dir).filter(f => /\.(js|jsx|css)$/.test(f))) assert.ok(!readFileSync(new URL(file, dir), 'utf8').includes('—'), file);
  for (const file of ['StripFigure.jsx', 'AssignTeam.jsx', 'TherapeuticResponse.jsx']) assert.ok(!readFileSync(new URL(`../src/modules/the-shift/components/${file}`, import.meta.url), 'utf8').includes('—'), file);
});

test('sources, version and Draft review status are stored as the spec gives them', () => {
  assert.deepEqual(Object.keys(SOURCES), Array.from({ length: 16 }, (_, i) => String(i + 1)));
  const cited = [d1, d2, d3, d4, d5].flatMap(item => item.sources.map(([number]) => number)).concat(REWIND.sources, debrief.why.flatMap(([, numbers]) => numbers));
  assert.deepEqual(cited.filter(number => !SOURCES[number]), []);
  assert.deepEqual([...new Set(cited)].sort((a, b) => a - b), Array.from({ length: 16 }, (_, i) => i + 1));
  assert.equal(data.VERSION, '0.8');
  assert.equal(data.SCENARIO_ID, 'SHIFT-009');
  assert.equal(card.reviewStatus, 'Draft');
  assert.equal(card.contentReviewDate, 'Pending');
  assert.equal(card.specialtyReview, 'psych specialty review required');
  assert.equal(card.specialty, 'Telemetry');
  assert.ok(!JSON.stringify(SOURCES).includes('openstax'));
});

test('learner text keeps the spec wording for key lines', () => {
  assert.equal(d1.prompt, 'Place yourself, Tess and Marco. Then submit.');
  assert.equal(d1.rules.length, 13);
  assert.equal(d1.board[2][0], 'Lena, the monitor tech, calls');
  assert.match(d5.scene, /Lena, the monitor tech: "23's been 104 to 118 all day."/);
  assert.equal(d3.choices.find(c => c.id === 'anterior').result, 'Close');
  assert.deepEqual(d4.choices.map(c => [c.tier, c.result]), [['best', 'Correct'], ['acceptable', 'Correct'], ['harmful', 'No'], ['harmful', 'No'], ['harmful', 'No (unsafe)']]);
  assert.equal(d5.marcoMoved, 'Once the behavioral team had Room 21 covered, Tess sent Marco to Room 23.');
  assert.equal(d5.vitalsLeadAlone, 'Marco reports Room 23\'s vitals from 1530:');
  assert.equal(data.finalScreen, 'Afternoon challenge complete.');
  assert.equal(debrief.ask, 'Why can a heart attack feel like indigestion?');
  assert.equal(debrief.share, "The loudest room on the unit wasn't the sickest one.");
  assert.ok(debrief.rhythmLab.every(button => button.verified === false));
});

// Audit M7: decision-screen alt text named the answer before the learner chose.
test('decision strips read objective findings until the decision is answered', () => {
  const interpretive = /asystole|fibrillation|afib|irregularly irregular|no p waves|elevation|depression|stemi|sinus rhythm|inferior/i;
  const before = ['rm21-1505', 'rm22-1513-12lead', 'rm23-1535-a', 'rm23-1535-b', 'rm23-1535-c'];
  assert.deepEqual(Object.entries(STRIPS).filter(([, s]) => s.altBefore).map(([id]) => id), before);
  for (const id of before) {
    assert.ok(!interpretive.test(STRIPS[id].altBefore), `${id}: ${STRIPS[id].altBefore}`);
    assert.ok(STRIPS[id].altBefore.startsWith(STRIPS[id].caption), id);
  }
  // Same findings a sighted learner sees: every 12-lead lead's ST level, and the QRS count on the AF strips.
  for (const lead of ['lead I ', 'Lead II ', 'Lead III ', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6']) assert.ok(STRIPS['rm22-1513-12lead'].altBefore.includes(lead), lead);
  assert.match(STRIPS['rm23-1535-a'].altBefore, /11 QRS complexes in 6 seconds/);
  assert.match(STRIPS['rm23-1535-b'].altBefore, /15 QRS complexes in 6 seconds/);
  assert.match(STRIPS['rm23-1535-c'].altBefore, /13 QRS complexes in 6 seconds/);
});

test('v0.8 content corrections', () => {
  // D1: the earlier strips are labeled as earlier, and Room 22's note says it predates Lena's call.
  assert.deepEqual(d1.strips.map(id => d1.stripLabels[id]), ['Room 21 / Now', 'Room 22 / Earlier strip, 1430', 'Room 23 / Earlier strip, 1430']);
  assert.match(d1.stripNotes['rm22-1430'], /1430 baseline, from before the change Lena is calling about/);
  // Rhythm notes: the 6-second count is an estimate (the Room 22 1430 strip counts 80 against HR 88).
  assert.match(assignment.rhythmNotes, /That count is an estimate/);
  assert.match(assignment.rhythmNotes, /300 divided by the number of large boxes/);
  // Source 14 resolves through its DOI; the dead hosted copy is gone.
  assert.equal(SOURCES[14].url, 'https://doi.org/10.1016/j.jacc.2024.11.009');
  assert.ok(!JSON.stringify(SOURCES).includes('hendrickhealth'));
  // The alarm study is described with its scope.
  assert.match(debrief.why[2][0], /88\.8% of 12,671 annotated alarms for six serious arrhythmias/);
  assert.equal(card.estimatedTime, 'About 10 to 12 minutes');
  // Learner text carries no authoring shorthand.
  assert.ok(!/From D2 on|The choice response|main script/.test(JSON.stringify({ d1, d4, REWIND })));
  // Each guided bridge exists where the flow uses it.
  for (const item of [d2, d3, d4, d5]) assert.match(item.bridge, /Your original (choice|response) stays recorded\.$/);
  assert.equal(d5.marcoMoved22, 'Once the STEMI team took over in Room 22, Tess sent Marco to Room 23.');
});
