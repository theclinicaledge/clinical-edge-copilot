const test = require('node:test');
const assert = require('node:assert/strict');
process.env.ANTHROPIC_API_KEY = '';
const { contributorIsQualified, buildEvidence, validateReasoning } = require('../priority-map-intelligence');
const { validatePriorityMapReliability } = require('../server');
const source = 'PATIENT SNAPSHOT — USER-REPORTED / OBSERVED INFORMATION\n- Mental status: altered\n- Fever reported\nTreat omitted fields as unknown.';
const evidence = buildEvidence(source, 'MODERATE');
const output = possibility => JSON.stringify({
  synthesis: 'Reported fever and altered mentation may reflect several contributors; the cause remains unresolved.',
  possible_contributors: [{ possibility, evidence_ids: ['e1', 'e2'], uncertainty: 'Onset, source and examination remain unresolved.' }],
  clarify_now: [{ assessment: 'Baseline, onset and focused examination', why_it_matters: 'These distinguish competing contributors.' }],
  reassessment_or_escalation: ['Focused reassessment and team communication depend on bedside findings and local protocol.'],
});
const accepted = [
  'Possible systemic contributor.', 'Possibly contributing systemic process.',
  'A systemic contributor remains a possibility.', 'An infectious process may contribute.',
  'An infectious process might contribute.', 'An infectious process could contribute.',
  'Potential systemic contributor.', 'A systemic process is potentially contributing.',
  'The findings suggest an infectious contributor.', 'The pattern suggests an infectious contributor.',
  'Findings suggesting an infectious contributor.',
  'The findings are consistent with a possible infectious contributor.',
  'Altered mentation can be associated with systemic processes.',
  'An infectious process may reflect the reported pattern.', 'The findings could reflect a systemic process.',
  'Possible infection; not confirmed.', 'Possible infection; cannot establish its cause.',
];
for (const phrase of accepted) test(`qualification accepts morphology: ${phrase}`, () => {
  assert.equal(contributorIsQualified(phrase), true);
  assert.deepEqual(validateReasoning(source, output(phrase), evidence, validatePriorityMapReliability), []);
});
const rejected = [
  'The patient has sepsis.', 'This is cardiogenic shock.', 'The hypotension is caused by bleeding.',
  'The fever is due to pneumonia.', 'Possibly infection, but the patient has sepsis.',
  'Possible infection; this is cardiogenic shock.', 'The findings suggest infection; hypotension is caused by bleeding.',
  'Potential infection, however pneumonia is confirmed.', 'Sepsis is confirmed; medication effects could also contribute.',
  'Not possible infection.', 'No possibility of infection.', 'The findings do not suggest infection.',
  'The findings are consistent with sepsis.', 'The cause is infectious.',
  'The findings suggest infection and the fever is due to pneumonia.',
  'Sepsis; medication effects may also contribute.',
  'Possible infection and sepsis is present.',
  'An impossible infectious cause.',
];
for (const phrase of rejected) test(`qualification cannot mask certainty or negation: ${phrase}`, () => {
  assert.equal(contributorIsQualified(phrase), false);
  assert.ok(validateReasoning(source, output(phrase), evidence, validatePriorityMapReliability).length);
});
test('unqualified contributor no longer conceals other independent rejection codes', () => {
  const raw = JSON.parse(output('This is sepsis.'));
  raw.synthesis = 'BP is 80 mmHg and falling; its cause remains unknown.';
  raw.clarify_now[0].assessment = 'Give aspirin now.';
  const issues = validateReasoning(source, JSON.stringify(raw), evidence, validatePriorityMapReliability);
  assert.ok(issues.includes('contributor_semantic_assertion'));
  assert.ok(issues.includes('reasoning_unsupported_number'));
  assert.ok(issues.includes('reasoning_treatment_directive'));
  assert.ok(issues.includes('reasoning_unsupported_temporal_claim'));
  assert.ok(issues.includes('reasoning_certainty_claim'));
});
