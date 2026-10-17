import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SHIFTS } from '../src/modules/the-shift/integrated/registry.js';
import { scenario } from '../src/modules/the-shift/scenario.js';
import { script, fixChoices, actions, reflectionText } from '../src/modules/the-shift/discharge/data.js';
import { STRIPS, measurements } from '../src/modules/the-shift/monitor/ecg/waveforms.js';
import { learningDestination } from '../src/modules/the-shift/routing.js';

test('three corrected versions record founder-reported approval without invented details', () => {
  assert.deepEqual(SHIFTS.slice(0, 3).map(s => [s.scenarioId, s.contentVersion]), [['SHIFT-001', '2.1'], ['SHIFT-002', '2.1'], ['SHIFT-003', '0.3']]);
  assert.equal(SHIFTS[1].assetVersion, '1.0');
  for (const s of SHIFTS.slice(0, 3)) {
    assert.equal(s.review.independentStatus, 'Founder-reported approval');
    assert.equal(s.review.approvedVersion, s.contentVersion);
    assert.equal(s.review.reviewer, null);
    assert.equal(s.review.reviewDate, null);
    assert.equal(s.signOffs.independent.name, null);
    assert.equal(s.signOffs.independent.credentials, null);
    assert.equal(s.signOffs.independent.date, null);
    assert.match(s.signOffs.independent.notes, /Founder reports/);
    assert.ok(s.sources.every(source => source.url.startsWith('https://') && source.limitation));
  }
});
test('approved compensation and medication-safety corrections remain intact', () => {
  assert.match(scenario.interpretations[0].feedback, /acidemia/);
  assert.doesNotMatch(scenario.interpretations[0].text, /partially compensated/);
  assert.match(scenario.deeper, /does not prove chronic/);
  assert.match(scenario.deeper, /mixed disorder/);
  assert.match(fixChoices.find(c => c.id === 'both').feedback, /exact doubling cannot be calculated/);
  assert.match(actions.find(c => c.id === 'discharge').feedback, /does not establish ongoing bleeding/);
  assert.match(script.planLimit, /not a general rule/);
  assert.match(script.followup, /not an automatic restart/);
  assert.match(reflectionText(0, { start: 'ride' }, false), /IV removal/);
  assert.doesNotMatch(reflectionText(0, { start: 'ride' }, false), /begin teaching/);
});
test('five original ECG measurements and bounded learning destinations remain', () => {
  assert.deepEqual(Object.keys(STRIPS), ['A', 'B', 'C', 'D', 'E']);
  for (const id of Object.keys(STRIPS)) assert.equal(measurements(id).measuredRate, STRIPS[id].targetRate);
  assert.equal(learningDestination('/rhythm-lab/practice', 'monitor-alarm'), null);
  assert.equal(learningDestination('/rhythm-lab/afib', 'monitor-alarm'), null);
  for (const s of SHIFTS) for (const link of s.recommendations) {
    assert.ok(learningDestination(link.path, s.id));
    assert.ok(!learningDestination(link.path, s.id).includes(s.askQuestion));
  }
});
test('privacy discloses local progress and preserves separate Ask consent', () => {
  const home = readFileSync(new URL('../src/ClinicalEdgeHome.jsx', import.meta.url), 'utf8');
  assert.doesNotMatch(home, /Private release candidate|Clinical review pending/);
  const privacy = readFileSync(new URL('../src/Privacy.jsx', import.meta.url), 'utf8');
  assert.match(privacy, /The Shift: device-local progress/);
  assert.match(privacy, /Your choices and findings are not submitted as scenario responses/);
  assert.match(privacy, /restart that scenario or clear/);
  assert.match(privacy, /We do not send your answers/);
  assert.match(privacy, /does not automatically submit/);
  assert.match(privacy, /<PrivacyChoices \/>/);
});
