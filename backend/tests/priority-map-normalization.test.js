const test = require('node:test');
const assert = require('node:assert/strict');
process.env.ANTHROPIC_API_KEY = '';
const { normalizeReasoning, parseReasoning, reasoningRepairDetails, buildEvidence, validateReasoning, composePriorityMap } = require('../priority-map-intelligence');
const { validatePriorityMapReliability, validatePriorityMapContract, runPriorityMapWithBudget } = require('../server');
const source = 'Reported clinical data:\n- Mental status: altered\n- Fever reported\n- Urine output: 20 mL over the last hour';
const evidence = buildEvidence(source, 'MODERATE');
const base = () => ({ synthesis: 'Reported findings may have multiple contributors; the mechanism remains unknown.', possible_contributors: [{ possibility: 'A systemic process could contribute.', evidence_ids: ['e1'], uncertainty: 'Baseline and onset remain unknown.' }], clarify_now: [{ assessment: 'Clarify baseline and onset', why_it_matters: 'These distinguish current findings from baseline.' }], reassessment_or_escalation: ['Reassess and communicate findings under local protocol.'] });
const validate = (input, raw) => {
  const issues = validateReasoning(input, raw, evidence, validatePriorityMapReliability);
  if (issues.length) return issues;
  const composed = composePriorityMap(evidence, parseReasoning(raw));
  return [...validatePriorityMapContract(composed), ...validatePriorityMapReliability(input, composed)];
};
test('modest prose overflow retains every character and bypasses provider repair', async () => {
  for (const length of [181, 218, 250]) {
    const value = base();
    value.reassessment_or_escalation = ['Reassess bedside findings and communicate uncertainty through local protocols. ' + 'Context remains unresolved. '.repeat(10)];
    value.reassessment_or_escalation[0] = value.reassessment_or_escalation[0].slice(0, length);
    const raw = JSON.stringify(value);
    assert.deepEqual(validate(source, raw), []);
    assert.equal(parseReasoning(raw).reassessment_or_escalation[0], value.reassessment_or_escalation[0].trim());
    let repairs = 0;
    const result = await runPriorityMapWithBudget({ source, validateOutput: validate, generateOriginal: async () => raw, repair: async () => { repairs++; return raw; } });
    assert.equal(result.status, 'validated'); assert.equal(repairs, 0);
  }
});
test('whitespace normalization preserves words, punctuation and incomplete sentences', () => {
  const value = base(); value.synthesis = '  Reported findings\n may have contributors; the cause remains unknown.  ';
  const normalized = normalizeReasoning(JSON.stringify(value));
  assert.equal(normalized.changed, true);
  assert.equal(normalized.value.synthesis, 'Reported findings may have contributors; the cause remains unknown.');
  value.reassessment_or_escalation = ['Reassess only when'];
  assert.equal(parseReasoning(JSON.stringify(value)).reassessment_or_escalation[0], 'Reassess only when');
});
test('hard ceiling is rejected without truncation and yields precise repair diagnostics', () => {
  const value = base(); value.reassessment_or_escalation = ['x'.repeat(321)];
  const raw = JSON.stringify(value);
  assert.deepEqual(validate(source, raw), ['invalid_reasoning_schema']);
  assert.equal(parseReasoning(raw).reassessment_or_escalation[0].length, 321);
  assert.deepEqual(reasoningRepairDetails(raw, ['invalid_reasoning_schema']).field_issues, [{ path: 'reassessment_or_escalation[0]', rule: 'hard_length_ceiling', actual: 321, maximum: 320 }]);
  assert.equal(parseReasoning(' '.repeat(12001)), null);
});
for (const claim of ['This is pneumonia.', 'Give aspirin now.', 'No prior history.', 'Glucose is 80.', 'Urine output is falling.']) test(`normalization cannot sanitize unsafe prose: ${claim}`, () => {
  const value = base(); value.reassessment_or_escalation = ['Context remains unresolved. '.repeat(6) + claim];
  assert.ok(validate(source, JSON.stringify(value)).length);
});
test('qualified category passes; unqualified disease label remains rejected', () => {
  assert.deepEqual(validate(source, JSON.stringify(base())), []);
  const value = base(); value.possible_contributors[0].possibility = 'Hypertensive urgency';
  const issues = validate(source, JSON.stringify(value));
  assert.ok(issues.includes('reasoning_unsupported_diagnosis_label'));
});
test('unprovided investigation lists and unresolved whether clauses are not patient assertions', () => {
  const value = base();
  value.synthesis = 'Whether these findings are related cannot be determined; the mechanism remains unknown.';
  value.possible_contributors[0].uncertainty = 'No labs, imaging, or medication context supplied; contributors remain unresolved.';
  assert.deepEqual(validate(source, JSON.stringify(value)), []);
  value.synthesis = 'Whether these findings are related is unknown; this is sepsis.';
  assert.ok(validate(source, JSON.stringify(value)).includes('reasoning_certainty_claim'));
});
test('one shape repair can succeed; identical invalid repair and new semantic claims cannot loop', async () => {
  const value = base(); value.reassessment_or_escalation = ['x'.repeat(321)]; const invalid = JSON.stringify(value);
  for (const [repairOutput, expected] of [[JSON.stringify(base()), 'repaired'], [invalid, 'fallback'], [JSON.stringify({ ...base(), synthesis: 'This is sepsis; cause remains unknown.' }), 'fallback']]) {
    let originals = 0, repairs = 0;
    const result = await runPriorityMapWithBudget({ source, validateOutput: validate, generateOriginal: async () => { originals++; return invalid; }, repair: async () => { repairs++; return repairOutput; } });
    assert.equal(result.status, expected); assert.equal(originals, 1); assert.equal(repairs, 1);
  }
});
