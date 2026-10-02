const test = require('node:test');
const assert = require('node:assert/strict');
process.env.ANTHROPIC_API_KEY = '';
const { buildEvidence, validateReasoning } = require('../priority-map-intelligence');
const { validatePriorityMapReliability } = require('../server');
const { hasAffirmativeCertainty, unsupportedNegativeFindings, unsupportedDiagnosisLabels } = require('../reasoning-grounding');
const source = 'Reported clinical data:\n- Mental status: altered\n- SBP: current 170 mmHg\n- Fever reported\nTreat omitted fields as unknown.';
const base = () => ({ synthesis: 'The reported findings may reflect competing contributors; the mechanism remains unresolved.', possible_contributors: [], clarify_now: [{ assessment: 'Clarify baseline, onset and focused examination', why_it_matters: 'These distinguish competing mechanisms.' }], reassessment_or_escalation: ['Reassess and communicate current findings through local pathways.'] });
const codes = (synthesis, input = source) => validateReasoning(input, JSON.stringify({ ...base(), synthesis }), buildEvidence(input, 'MODERATE'), validatePriorityMapReliability);

for (const text of ['Cannot confirm the cause.', 'Cannot determine the cause.', 'Does not establish a cause.', 'Is not diagnostic of a cause.', 'The mechanism remains uncertain.', 'Cannot conclude the cause.', 'Insufficient information to determine the cause.', 'Not enough information to establish a cause.', 'Cannot confirm that the findings are due to infection.']) {
  test(`clause-scoped uncertainty: ${text}`, () => assert.equal(hasAffirmativeCertainty(text, true), false));
}
for (const text of ['Confirms sepsis.', 'Establishes shock.', 'Diagnostic of stroke.', 'This is pneumonia.', 'Caused by bleeding.', 'Due to infection.', 'Possibly infection, but confirms sepsis.', 'Cannot confirm a cause; this is pneumonia.', 'Uncertain onset and this is pneumonia.', 'Cannot confirm a cause, but caused by bleeding.', 'Not only confirms sepsis.', 'Cannot not confirm sepsis.']) {
  test(`certainty cannot hide behind another clause: ${text}`, () => assert.equal(hasAffirmativeCertainty(text, true), true));
}
for (const text of ['no prior history', 'no cardiac history', 'no focal deficits', 'no recent medications', 'no infection symptoms', 'denies pain']) {
  test(`unknown cannot become absent: ${text}`, () => {
    assert.ok(codes(`The cause remains unresolved; ${text}.`).includes('reasoning_unsupported_negative_finding'));
    assert.deepEqual(unsupportedNegativeFindings(`Reported ${text}.`, `${text}.`), []);
    assert.deepEqual(codes(`The cause remains unresolved; ${text}.`, `${source}\n- Reported ${text}.`), []);
  });
}
for (const text of ['Prior history was not supplied.', 'Clarify relevant history.', 'Focused neurologic findings were not provided.', 'No focal examination findings documented.', 'Without establishing a cause.', 'No earlier comparator is known.']) {
  test(`missing evidence is not an absent finding: ${text}`, () => assert.deepEqual(unsupportedNegativeFindings(source, text), []));
}
test('grounded repetition is a contract violation, not numeric invention', () => {
  const result = codes('Reported SBP of 170 may need context.');
  assert.ok(result.includes('reasoning_numeric_repetition_contract'));
  assert.ok(!result.includes('reasoning_unsupported_number'));
  assert.ok(codes('Reported SBP of 180 may need context.').includes('reasoning_unsupported_number'));
  assert.ok(!codes('Reported elevated BP may need context.').some(code => /numeric|number/.test(code)));
});
test('explicit non-diagnostic uncertainty passes the full compact contract', () => {
  for (const synthesis of ['Cannot confirm the cause.', 'Cannot determine the cause.', 'Does not establish a cause.', 'Is not diagnostic of a cause.', 'The mechanism remains uncertain.', 'Cannot conclude the cause.', 'Insufficient information to determine the cause.', 'Not enough information to establish a cause.']) assert.deepEqual(codes(synthesis), [], synthesis);
  const value = base();
  value.possible_contributors = [{ possibility: 'Possible systemic contributor; cannot determine its cause.', evidence_ids: ['e1'], uncertainty: 'Onset remains unknown.' }];
  assert.deepEqual(validateReasoning(source, JSON.stringify(value), buildEvidence(source, 'MODERATE'), validatePriorityMapReliability), []);
});
test('categorical contributors pass; unsupported named diseases do not', () => {
  for (const possibility of ['A neurologic process could contribute.', 'A systemic infectious process may contribute.', 'Medication or metabolic effects could contribute.']) {
    const value = base();
    value.possible_contributors = [{ possibility, evidence_ids: ['e1'], uncertainty: 'Baseline, onset and exposure remain unresolved.' }];
    assert.deepEqual(validateReasoning(source, JSON.stringify(value), buildEvidence(source, 'MODERATE'), validatePriorityMapReliability), []);
  }
  for (const label of ['hypertensive urgency', 'hypertensive encephalopathy', 'sepsis', 'pneumonia']) assert.ok(unsupportedDiagnosisLabels(source, `Possible ${label}.`).length);
  assert.deepEqual(unsupportedDiagnosisLabels('Documented diagnosis: pneumonia.', 'Reported pneumonia could contribute.'), []);
  assert.ok(unsupportedDiagnosisLabels('Pneumonia is not confirmed.', 'Possible pneumonia.').length);
});
test('supplied established diagnosis remains usable as reported context in the full contract', () => {
  assert.deepEqual(codes('Reported established pneumonia could contribute; its relationship remains unresolved.', `${source}\n- Documented diagnosis: pneumonia.`), []);
});
test('orders, invented trends and mixed contributor certainty remain rejected', () => {
  for (const synthesis of ['Give aspirin now; the mechanism remains unknown.', 'Urine output is falling; the cause remains unknown.', 'Possible infection; this is sepsis.']) assert.ok(codes(synthesis).length);
  const interval = 'Reported clinical data:\n- Urine output: 20 mL over the last hour\n- Chest tube output: 35 mL during the most recent hour';
  assert.ok(codes('Urine output is falling; its cause remains uncertain.', interval).length);
  assert.deepEqual(codes('The supplied intervals do not establish a directional trend; prior comparable intervals are needed.', interval), []);
});
