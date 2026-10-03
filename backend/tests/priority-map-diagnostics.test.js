const test = require('node:test');
const assert = require('node:assert/strict');
const { reasoningDiagnostics, sanitizeValidationMetadata } = require('../priority-map-diagnostics');
const { buildEvidence, validateReasoning } = require('../priority-map-intelligence');
const { runPriorityMapWithBudget, validatePriorityMapReliability, buildOperationalLogEntry } = require('../server');
const source = '- Altered mental status reported\n- Fever reported\n- BP: current 170 mmHg';
const evidence = buildEvidence(source, 'MODERATE');
const base = {
  synthesis: 'Reported findings may reflect several contributors; the cause remains unknown.',
  possible_contributors: [],
  clarify_now: [{ assessment: 'Clarify baseline and examination.', why_it_matters: 'Context may distinguish contributors.' }],
  reassessment_or_escalation: ['Consider bedside reassessment and team communication under local protocol.'],
};
const validate = (source, raw) => validateReasoning(source, raw, evidence, validatePriorityMapReliability);
const diagnose = (source, raw, codes) => reasoningDiagnostics(source, raw, evidence, validatePriorityMapReliability, codes);

test('original schema and repair semantic rejections remain separately attributable without content', async () => {
  const original = JSON.stringify({ ...base, reassessment_or_escalation: ['x'.repeat(341)] });
  const repaired = JSON.stringify({ ...base, synthesis: 'No prior history is present. This confirms a cause; context may remain unknown.' });
  const result = await runPriorityMapWithBudget({ source, generateOriginal: async () => original, repair: async () => repaired, validateOutput: validate, diagnoseOutput: diagnose });
  assert.equal(result.status, 'fallback');
  assert.deepEqual(result.timing.original_validation.rejection_codes, ['invalid_reasoning_schema']);
  assert.equal(result.timing.original_validation.stage, 'original');
  assert.equal(result.timing.repair_validation.stage, 'repair');
  assert.equal(result.timing.repair_validation.accepted, false);
  assert.ok(result.timing.repair_validation.rejection_codes.includes('reasoning_unsupported_negative_finding'));
  const length = result.timing.original_validation.findings.find(item => item.reason_category === 'hard_length_ceiling');
  assert.equal(length.field_path, 'reassessment_or_escalation[0]');
  assert.equal(length.actual_length, 341);
  assert.equal(length.maximum, 320);
  assert.ok(result.timing.repair_validation.findings.some(item => item.code === 'reasoning_unsupported_negative_finding' && item.field_path === 'synthesis'));
  const entry = buildOperationalLogEntry({ ...result.timing, rejection_reason_codes: [...result.issues, ...result.repairIssues], snapshot: source, prompt: original, response: repaired, credential: 'secret-sentinel' });
  assert.equal(entry.rejection_reason_codes, undefined);
  const logged = JSON.stringify(entry);
  for (const text of [source, base.clarify_now[0].assessment, 'No prior history', 'secret-sentinel', '170 mmHg']) assert.ok(!logged.includes(text));
  assert.deepEqual(entry.repair_trigger_rejection_codes, ['invalid_reasoning_schema']);
});

test('schema metadata reports safe keys, cardinality and evidence validity only', () => {
  const value = { ...base, synthesis: '', possible_contributors: [{ possibility: 'Possible contributor', uncertainty: 'Unknown context', evidence_ids: ['PRIVATE-EVIDENCE'], 'secret-key-name': 'secret-value' }], clarify_now: [], 'provider-authored-key': 'private-text' };
  const findings = diagnose(source, JSON.stringify(value), ['invalid_reasoning_schema']);
  assert.ok(findings.some(item => item.unexpected_key_count === 1));
  assert.ok(findings.some(item => item.actual_cardinality === 0 && item.minimum === 1));
  assert.ok(findings.some(item => item.evidence_references_valid === false && item.invalid_reference_count === 1));
  const text = JSON.stringify(findings);
  for (const forbidden of ['PRIVATE-EVIDENCE', 'secret-key-name', 'secret-value', 'provider-authored-key', 'private-text']) assert.ok(!text.includes(forbidden));
});

test('nested operational metadata is strictly allowlisted', () => {
  const safe = sanitizeValidationMetadata({ stage: 'original', accepted: false, clinical_text: 'secret', rejection_codes: ['certainty_overstatement', 'secret-code'], findings: [{ code: 'certainty_overstatement', field_path: 'secret-path', reason_category: 'secret', actual_length: 42, text: 'secret' }, { code: 'secret-code', text: 'secret' }] });
  assert.ok(!JSON.stringify(safe).includes('secret'));
  assert.equal(safe.findings[0].field_path, '$');
});

test('successful results have no rejection findings and identical output with diagnostics', async () => {
  const raw = JSON.stringify(base);
  const options = { source, generateOriginal: async () => raw, validateOutput: validate };
  const without = await runPriorityMapWithBudget(options);
  const withDiagnostics = await runPriorityMapWithBudget({ ...options, diagnoseOutput: diagnose });
  assert.equal(withDiagnostics.status, 'validated');
  assert.equal(withDiagnostics.output, without.output);
  assert.equal(withDiagnostics.timing.original_validation.findings, undefined);
  assert.equal(withDiagnostics.timing.repair_validation, undefined);
  assert.deepEqual(withDiagnostics.timing.original_validation.rejection_codes, []);
});

test('diagnostics do not change repair acceptance or deterministic fallback', async () => {
  const bad = JSON.stringify({ ...base, synthesis: 'x'.repeat(601) });
  for (const repairOutput of [JSON.stringify(base), bad]) {
    let calls = 0;
    const options = { source, generateOriginal: async () => bad, repair: async () => { calls++; return repairOutput; }, validateOutput: validate };
    const without = await runPriorityMapWithBudget(options);
    const withDiagnostics = await runPriorityMapWithBudget({ ...options, diagnoseOutput: diagnose });
    assert.equal(calls, 2);
    assert.equal(withDiagnostics.status, without.status);
    assert.equal(withDiagnostics.output, without.output);
    assert.deepEqual(withDiagnostics.issues, without.issues);
    assert.deepEqual(withDiagnostics.repairIssues, without.repairIssues);
  }
});

test('an observability failure cannot change the clinical result', async () => {
  const raw = JSON.stringify(base);
  const result = await runPriorityMapWithBudget({ source, generateOriginal: async () => raw, validateOutput: validate, diagnoseOutput: () => { throw new Error('private-content'); } });
  assert.equal(result.status, 'validated');
  assert.equal(result.output, raw);
  assert.ok(!JSON.stringify(result.timing).includes('private-content'));
});

for (const [raw, category] of [
  ['{"synthesis":', 'invalid_json'],
  ['[]', 'non_object_root'], ['null', 'non_object_root'], ['"private-string"', 'non_object_root'],
  ['```json\n{"synthesis":\n```', 'markdown_wrapped_json'],
  ['Private preamble {}', 'surrounding_text'], ['{} Private suffix', 'surrounding_text'],
  ['x'.repeat(12001), 'raw_length_ceiling'], [undefined, 'raw_string_required'],
]) test(`root schema diagnostics / ${category}`, () => {
  const issues = validate(source, raw);
  assert.deepEqual(issues, ['invalid_reasoning_schema']);
  const findings = diagnose(source, raw, issues);
  assert.equal(findings[0].field_path, '$');
  assert.equal(findings[0].reason_category, category);
  const metadata = sanitizeValidationMetadata({ stage: 'original', accepted: false, rejection_codes: issues, findings });
  assert.equal(metadata.findings[0].reason_category, category);
  assert.ok(!JSON.stringify(metadata).includes('Private'));
  assert.ok(!JSON.stringify(metadata).includes('private-string'));
  if (category === 'raw_length_ceiling') {
    assert.equal(metadata.findings[0].actual_length, 12001);
    assert.equal(metadata.findings[0].maximum, 12000);
  }
  assert.deepEqual(validate(source, raw), issues);
});
