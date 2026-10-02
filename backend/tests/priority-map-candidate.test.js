const test = require('node:test');
const assert = require('node:assert/strict');
process.env.ANTHROPIC_API_KEY = '';
const { buildEvidence, validateReasoning, parseReasoning, composePriorityMap, contributorIsCandidate } = require('../priority-map-intelligence');
const { validatePriorityMapReliability, validatePriorityMapContract } = require('../server');
const source = 'Reported clinical data:\n- Mental status: altered\n- Fever reported\n- SBP reported in the 170s\nTreat omitted fields as unknown.';
const evidence = buildEvidence(source, 'MODERATE');
const object = (possibility, uncertainty = 'Baseline, onset and mechanism remain unresolved.') => ({ synthesis: 'The reported findings may have several contributors; the cause remains unknown.', possible_contributors: [{ possibility, evidence_ids: ['e1', 'e2'], uncertainty }], clarify_now: [{ assessment: 'Clarify baseline and focused examination', why_it_matters: 'These distinguish competing mechanisms.' }], reassessment_or_escalation: ['Reassess and communicate findings under local protocol.'] });
const codes = value => validateReasoning(source, JSON.stringify(value), evidence, validatePriorityMapReliability);
for (const label of ['Neurologic process', 'Systemic/infectious process', 'Metabolic disturbance', 'Medication/toxic effect', 'Physiologic stress', 'Hypertensive process affecting cerebral perfusion or autoregulation', 'Infectious or inflammatory process contributing to altered mentation']) test(`structural candidate needs no magic hedge: ${label}`, () => {
  assert.equal(contributorIsCandidate(label), true);
  const value = object(label);
  assert.deepEqual(codes(value), []);
  const displayed = composePriorityMap(evidence, parseReasoning(JSON.stringify(value)));
  assert.deepEqual(validatePriorityMapContract(displayed), []);
  assert.deepEqual(validatePriorityMapReliability(source, displayed), []);
  assert.match(displayed, /\*\*Possible patterns\*\*/);
});
for (const label of ['Sepsis', 'Stroke', 'Hypertensive emergency', 'Pneumonia', 'Cardiogenic shock']) test(`candidate status cannot authorize unsupported disease: ${label}`, () => assert.ok(codes(object(label)).includes('reasoning_unsupported_diagnosis_label')));
for (const label of ['Bleeding caused the hypotension', 'Infection is causing the fever', 'The patient has focal weakness', 'No prior history', 'Give aspirin now', 'Urine output is falling', 'Glucose 80']) test(`candidate status cannot authorize unsafe label: ${label}`, () => assert.ok(codes(object(label)).length));
for (const rationale of ['The cause is established.', 'This is sepsis; baseline remains unknown.', 'Infection is causing the fever; onset remains unknown.', 'No prior history; onset remains unknown.', 'Glucose is 80; the mechanism remains unresolved.']) test(`rationale independently remains uncertain and grounded: ${rationale}`, () => assert.ok(codes(object('Systemic process', rationale)).length));
test('candidate requires uncertainty and valid IDs', () => {
  assert.ok(codes(object('Systemic process', 'Everything is established.')).includes('contributor_missing_uncertainty'));
  const value = object('Systemic process'); value.possible_contributors[0].evidence_ids = ['not-supplied'];
  assert.deepEqual(codes(value), ['invalid_reasoning_schema']);
});
