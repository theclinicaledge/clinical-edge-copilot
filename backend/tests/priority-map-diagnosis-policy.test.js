const test = require('node:test');
const assert = require('node:assert/strict');
const { buildEvidence, validateReasoning, contributorIsCandidate } = require('../priority-map-intelligence');
const { unsupportedDiagnosisLabels, diagnosisIsEstablished, hasAffirmativeCertainty } = require('../reasoning-grounding');
const { validatePriorityMapReliability } = require('../server');
const source = '- Mental-status change reported\n- Fever reported\nOmitted information remains unknown.';
function codes(rationale, context = source) {
  return validateReasoning(context, JSON.stringify({
    synthesis: 'The reported findings may have several contributors; the cause remains unknown.',
    possible_contributors: [],
    clarify_now: [{ assessment: 'Clarify baseline and focused examination.', why_it_matters: rationale }],
    reassessment_or_escalation: ['Consider bedside reassessment and team communication under local protocol.'],
  }), buildEvidence(context, 'MODERATE'), validatePriorityMapReliability);
}
const matrix = [
  ['definitive diagnosis', 'This indicates sepsis.', true],
  ['causal diagnosis', 'Sepsis is causing the change.', true],
  ['hedged new disease', 'This may be sepsis.', true],
  ['generic neurologic discriminator', 'Helps identify findings that would increase concern for an acute neurologic process.', false],
  ['unresolved mechanism', 'Helps assess whether an infectious process may be contributing.', false],
  ['negated new disease', 'This does not establish sepsis.', true],
  ['rule-out new disease', 'Helps assess whether meningitis may be contributing.', true],
  ['explicit exclusion new disease', 'Helps rule out stroke.', true],
  ['general assessment context', 'Neurologic, infectious, inflammatory, medication-related, metabolic, perfusion and respiratory contributors remain unresolved.', false],
  ['mixed uncertain and definitive', 'An infectious process may contribute, but this confirms sepsis.', true],
];
for (const [name, phrase, blocked] of matrix) test(`diagnosis policy / ${name}`, () => {
  const result = codes(phrase);
  assert.equal(result.includes('reasoning_unsupported_diagnosis_label'), blocked);
  if (!blocked) assert.deepEqual(result, []);
});
test('established diagnosis is usable as reported context; certainty remains rejected', () => {
  const context = `${source}\n- Documented diagnosis: pneumonia.`;
  assert.deepEqual(codes('Reported established pneumonia may be relevant; its relationship remains unresolved.', context), []);
  assert.ok(codes('This confirms pneumonia.', context).length);
  for (const marker of ['Possible', 'Suspected', 'Unconfirmed', 'Unknown', 'Not confirmed']) {
    assert.equal(diagnosisIsEstablished(`${marker} pneumonia.`, 'pneumonia'), false);
  }
});
test('established disease cannot acquire unsupported causality in a rationale', () => {
  assert.ok(codes('Pneumonia is causing the change.', `${source}\n- Documented diagnosis: pneumonia.`).includes('reasoning_certainty_claim'));
});
test('negation and uncertainty cannot conceal a definitive assertion in another clause', () => {
  assert.equal(hasAffirmativeCertainty('This does not establish sepsis.', true), false);
  assert.equal(hasAffirmativeCertainty('This does not establish sepsis, but this confirms sepsis.', true), true);
  assert.equal(contributorIsCandidate('Infectious process'), true);
  assert.equal(contributorIsCandidate('Infectious process, but this confirms sepsis'), false);
  assert.deepEqual(unsupportedDiagnosisLabels(source, 'Possible sepsis'), ['sepsis']);
});
test('documented concern is not an established diagnosis', () => {
  assert.equal(diagnosisIsEstablished('Documented concern for sepsis.', 'sepsis'), false);
  assert.deepEqual(unsupportedDiagnosisLabels('Documented concern for sepsis.', 'Sepsis may contribute.'), ['sepsis']);
});
test('known limitation: diagnosis registry is finite, not comprehensive', () => {
  assert.deepEqual(unsupportedDiagnosisLabels(source, 'This indicates appendicitis.'), []);
});

for (const context of ['Documented diagnosis: pneumonia.', 'Known pneumonia.', 'Known history of pneumonia.', 'History of pneumonia.', 'Diagnosed with pneumonia.', 'Confirmed diagnosis of pneumonia.', 'Pneumonia is documented.']) test(`establishment permits explicit context: ${context}`, () => {
  assert.equal(diagnosisIsEstablished(context, 'pneumonia'), true);
  assert.deepEqual(codes('Reported pneumonia could be relevant; its relationship remains unresolved.', `${source}\n- ${context}`), []);
});
for (const context of ['Documented concern for sepsis.', 'Documented suspicion for sepsis.', 'History concerning for sepsis.', 'Known history: evaluating for sepsis.', 'Documented rule out sepsis.', 'Documented possible sepsis.', 'Documented probable sepsis.', 'Documented differential consideration: sepsis.', 'Documented screening for sepsis.', 'Documented workup for sepsis.', 'Documented provisional sepsis.', 'Known family history of sepsis.', 'Documented fever with sepsis.', 'Confirmed assessment: consider sepsis.']) test(`establishment rejects unresolved context: ${context}`, () => {
  assert.equal(diagnosisIsEstablished(context, 'sepsis'), false);
  assert.ok(codes('Sepsis may be relevant.', `${source}\n- ${context}`).includes('reasoning_unsupported_diagnosis_label'));
});
for (const phrase of ['Pneumonia is causing the change.', 'Pneumonia is directly driving the change.', 'Pneumonia was responsible for the change.', 'Pneumonia has been causing the change.', 'Pneumonia may be relevant, but pneumonia is causing the change.', 'Pneumonia could contribute and pneumonia is causing the change.']) test(`finite causality remains rejected: ${phrase}`, () => {
  assert.ok(codes(phrase, `${source}\n- Documented diagnosis: pneumonia.`).includes('reasoning_certainty_claim'));
});
for (const phrase of ['Pneumonia could be relevant; the relationship remains unresolved.', 'Consider whether pneumonia may be contributing.', 'Pneumonia may be causing the change; the relationship remains unknown.', 'Pneumonia is not causing the change.']) test(`causal detector preserves qualification: ${phrase}`, () => {
  assert.equal(hasAffirmativeCertainty(phrase, true), false);
});
test('finite causality is rejected in every compact prose field', () => {
  const context = `${source}\n- Documented diagnosis: pneumonia.`;
  const value = {
    synthesis: 'The reported findings may have several contributors; the cause remains unknown.',
    possible_contributors: [{ possibility: 'Reported pneumonia', evidence_ids: ['e1'], uncertainty: 'Relationship remains unknown.' }],
    clarify_now: [{ assessment: 'Clarify baseline.', why_it_matters: 'Context may distinguish contributors.' }],
    reassessment_or_escalation: ['Consider bedside reassessment under local protocol.'],
  };
  const targets = [v => { v.synthesis = 'Pneumonia is causing the change.'; }, v => { v.possible_contributors[0].possibility = 'Pneumonia is causing the change.'; }, v => { v.possible_contributors[0].uncertainty = 'Pneumonia is causing the change; context remains unknown.'; }, v => { v.clarify_now[0].assessment = 'Pneumonia is causing the change.'; }, v => { v.clarify_now[0].why_it_matters = 'Pneumonia is causing the change.'; }, v => { v.reassessment_or_escalation[0] = 'Pneumonia is causing the change.'; }];
  for (const mutate of targets) {
    const draft = structuredClone(value);
    mutate(draft);
    assert.ok(validateReasoning(context, JSON.stringify(draft), buildEvidence(context, 'MODERATE'), validatePriorityMapReliability).includes('reasoning_certainty_claim'));
  }
});
