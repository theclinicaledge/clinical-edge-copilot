const test = require('node:test');
const assert = require('node:assert/strict');
const { COMPACT_REASONING_PROMPT, CONTRIBUTOR_CATEGORIES, REASONING_OUTPUT_FORMAT, buildEvidence, validateReasoning, parseReasoning, composePriorityMap } = require('../priority-map-intelligence');
const { validatePriorityMapReliability, validatePriorityMapContract, runPriorityMapWithBudget, buildOperationalLogEntry } = require('../server');
const source = '- Altered mental status reported\n- Fever reported\nBaseline and onset were not supplied.';
const evidence = buildEvidence(source, 'MODERATE');
const base = {
  synthesis: 'Reported mentation and fever may reflect neurologic or systemic contributors; the cause remains unresolved.',
  possible_contributors: [{ possibility: 'Neurologic process', evidence_ids: ['e1'], uncertainty: 'Baseline, onset and examination remain unknown.' }],
  clarify_now: [{ assessment: 'Clarify baseline and assess for focal findings.', why_it_matters: 'These assessments could help distinguish neurologic from systemic contributors.' }],
  reassessment_or_escalation: ['Consider focused bedside reassessment and team communication under local protocol.'],
};
const validate = (_, raw) => {
  const issues = validateReasoning(source, raw, evidence, validatePriorityMapReliability);
  if (issues.length) return issues;
  const output = composePriorityMap(evidence, parseReasoning(raw));
  return [...validatePriorityMapContract(output), ...validatePriorityMapReliability(source, output)];
};

test('stable schema uses exact keys, closed objects and generic mechanism enum without patient content', () => {
  const schema = REASONING_OUTPUT_FORMAT.schema;
  assert.equal(REASONING_OUTPUT_FORMAT.type, 'json_schema');
  assert.equal(schema.additionalProperties, false);
  assert.deepEqual(schema.required, Object.keys(base));
  assert.deepEqual(schema.properties.possible_contributors.items.properties.possibility.enum, CONTRIBUTOR_CATEGORIES);
  for (const field of ['possible_contributors', 'clarify_now']) {
    assert.equal(schema.properties[field].items.additionalProperties, false);
    assert.deepEqual(schema.properties[field].items.required, Object.keys(schema.properties[field].items.properties));
  }
  for (const label of ['sepsis', 'stroke', 'pneumonia', 'meningitis']) assert.ok(!CONTRIBUTOR_CATEGORIES.includes(label));
  assert.ok(!JSON.stringify(schema).includes(source));
  assert.match(COMPACT_REASONING_PROMPT, /Neither field reports an assessment result/);
  assert.match(COMPACT_REASONING_PROMPT, /Unknown information stays unknown in every field/);
});

test('generic mechanisms and conditional assessment rationales pass full composed validation', () => {
  for (const category of ['Neurologic process', 'Infectious or inflammatory process', 'Metabolic process']) {
    const value = { ...base, possible_contributors: [{ ...base.possible_contributors[0], possibility: category }] };
    assert.deepEqual(validate(source, JSON.stringify(value)), []);
  }
});

for (const label of ['Possible sepsis', 'Stroke', 'Pneumonia may contribute']) test(`unsupported disease contributor still rejects: ${label}`, () => {
  const value = { ...base, possible_contributors: [{ ...base.possible_contributors[0], possibility: label }] };
  assert.ok(validate(source, JSON.stringify(value)).includes('reasoning_unsupported_diagnosis_label'));
});

for (const rationale of ['No prior history is present.', 'No focal deficits are present.', 'No medication exposure is present.']) test(`unknown must not become absent in rationale: ${rationale}`, () => {
  const value = { ...base, clarify_now: [{ ...base.clarify_now[0], why_it_matters: rationale }] };
  assert.ok(validate(source, JSON.stringify(value)).includes('reasoning_unsupported_negative_finding'));
});

test('explicitly established diagnosis remains qualified reported context, never assumed causal', () => {
  const supplied = `${source}\n- Documented diagnosis: pneumonia.`;
  const value = { ...base, synthesis: 'Reported established pneumonia could be relevant; its relationship remains unresolved.' };
  assert.deepEqual(validateReasoning(supplied, JSON.stringify(value), buildEvidence(supplied, 'MODERATE'), validatePriorityMapReliability), []);
  value.clarify_now = [{ assessment: 'Clarify current examination.', why_it_matters: 'Pneumonia is causing the change.' }];
  assert.ok(validateReasoning(supplied, JSON.stringify(value), buildEvidence(supplied, 'MODERATE'), validatePriorityMapReliability).includes('reasoning_certainty_claim'));
});

for (const [name, output, stopReason] of [
  ['incomplete JSON', '{"synthesis":', 'max_tokens'],
  ['refusal', 'Cannot respond.', 'refusal'],
  ['wrong root', '[]', 'end_turn'],
  ['extra key', JSON.stringify({ ...base, extra: 'unexpected' }), 'end_turn'],
]) test(`structured-output failure remains bounded and rejected: ${name}`, async () => {
  const result = await runPriorityMapWithBudget({ source, generateOriginal: async () => ({ text: output, stopReason, firstTokenMs: 1 }), validateOutput: validate });
  assert.equal(result.status, 'fallback');
  assert.ok(result.issues.includes('invalid_reasoning_schema'));
  if (stopReason !== 'end_turn') assert.ok(result.issues.includes('incomplete_provider_response'));
});

test('structured output provider errors remain fallback without alternate request or content logging', async () => {
  let calls = 0;
  const result = await runPriorityMapWithBudget({ source, generateOriginal: async () => { calls++; throw Object.assign(new Error('synthetic-private-provider-detail'), { status: 400 }); }, validateOutput: validate });
  assert.equal(calls, 1);
  assert.equal(result.status, 'fallback');
  assert.equal(result.timing.provider_status, 'error');
  const logged = JSON.stringify(buildOperationalLogEntry({ ...result.timing, source, response: JSON.stringify(base) }));
  for (const text of [source, base.synthesis, 'synthetic-private-provider-detail']) assert.ok(!logged.includes(text));
});
