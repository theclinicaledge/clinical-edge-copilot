const test = require('node:test');
const assert = require('node:assert/strict');
process.env.ANTHROPIC_API_KEY = '';
const legacy = require('../priority-map-intelligence');
const p1 = require('../priority-map-p1');
const { positive, adversaries, copy } = require('../validation/p1/fixtures');
const { evaluate } = require('../validation/p1/harness');
const server = require('../server');
const { reasoningDiagnostics, sanitizeValidationMetadata } = require('../priority-map-diagnostics');
const evidence = item => legacy.buildEvidence(item.snapshot, server.assessDeterministicUrgency(item.snapshot).urgency);
const validate = item => p1.validateReasoning(item.snapshot, JSON.stringify(item.reasoning), evidence(item), server.validatePriorityMapReliability);

for (const item of positive) test(`${item.id}: four independent offline fixture gates and complete composed pipeline`, () => {
  assert.deepEqual(validate(item), []);
  const result = evaluate(item);
  assert.equal(result.status, 'PASS');
  assert.equal(result.providerCalls, 0);
  assert.equal(result.requiresFutureClinicalReview, true);
  for (const gate of Object.values(result.gates)) assert.equal(gate.status, 'PASS');
  for (const fact of evidence(item).evidence) assert.ok(result.displayed.includes(`- ${fact.text}`));
  assert.deepEqual(server.validatePriorityMapContract(result.displayed), []);
  assert.deepEqual(server.validatePriorityMapReliability(item.snapshot, result.displayed), []);
});

test('safe-but-useless and unsafe-but-persuasive cannot pass by averaging independent gates', () => {
  const attacks = adversaries();
  const useless = evaluate(attacks.find(x => x.id === 'safe-but-useless'));
  assert.equal(useless.gates.grounding.status, 'PASS');
  assert.equal(useless.gates.safety.status, 'PASS');
  assert.equal(useless.gates.clinical_intelligence.status, 'FAIL');
  assert.equal(useless.gates.product_value.status, 'FAIL');
  const unsafe = evaluate(attacks.find(x => x.id === 'unsafe-but-persuasive'));
  assert.equal(unsafe.gates.safety.status, 'FAIL');
  assert.equal(unsafe.gates.clinical_intelligence.status, 'PASS');
  assert.equal(unsafe.status, 'FAIL');
});

for (const id of ['invented-evidence-id', 'unknown-to-negative', 'superficial-category-swap']) test(`${id}: preserved as an adversarial failure`, () => {
  const result = evaluate(adversaries().find(x => x.id === id));
  assert.equal(result.status, 'FAIL');
  assert.equal(result.gates.grounding.status, 'FAIL');
});

test('keywords, a reused case ID and caller-authored scores cannot create a usefulness pass', () => {
  const item = copy(positive[0]);
  item.reasoning.synthesis = 'Possible perfusion, physiology, discriminating assessment and conditional interpretation remain unresolved.';
  item.expectedScores = { intelligence: [2, 2, 2, 2], product: [2, 2, 2, 2] };
  const result = evaluate(item);
  assert.equal(result.gates.clinical_intelligence.status, 'NOT_REVIEWED');
  assert.equal(result.gates.product_value.status, 'NOT_REVIEWED');
  assert.equal(result.status, 'FAIL');
});

test('strict new schema retains enums, closed objects and conditional roles; legacy fixtures are not production P1', () => {
  const schema = p1.REASONING_OUTPUT_FORMAT.schema;
  assert.equal(schema.additionalProperties, false);
  assert.deepEqual(schema.required, Object.keys(positive[0].reasoning));
  for (const field of ['possible_contributors', 'clarify_now']) {
    const object = schema.properties[field].items;
    assert.equal(object.additionalProperties, false);
    assert.deepEqual([...object.required].sort(), Object.keys(object.properties).sort());
  }
  assert.equal(schema.properties.physiology.additionalProperties, false);
  const old = { ...positive[0], reasoning: p1.projectLegacy(positive[0].reasoning) };
  assert.deepEqual(validate(old), ['invalid_reasoning_schema']);
  const unmarked = copy(positive[0]); unmarked.reasoning.possible_contributors[0].would_strengthen = 'Repeat findings strengthen the possibility.';
  assert.deepEqual(validate(unmarked), ['invalid_reasoning_schema']);
});

test('conditional interpretations stay out of observed evidence in composition', () => {
  const item = positive[0];
  const output = p1.composePriorityMap(evidence(item), item.reasoning);
  const observed = output.match(/Observed:\n([\s\S]*?)\nInterpretation:/)[1];
  assert.ok(!observed.includes('If localized'));
  assert.match(output, /Conditional support: If/);
  assert.match(output, /Conditional interpretation: If/);
  assert.ok(output.includes(item.reasoning.physiology.principle));
  assert.match(output, /Assess first\*\*\n- Use the focused assessments above/);
});

const newFields = p1.extraFields(positive[0].reasoning).map(([path]) => path);
function setPath(value, path, text) {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let parent = value;
  for (const part of parts.slice(0, -1)) parent = parent[part];
  parent[parts.at(-1)] = text;
}
for (const path of newFields) test(`${path}: safety and privacy-safe field diagnostics remain active`, () => {
  const item = copy(positive[0]);
  const conditional = /would_|conditional_interpretation/.test(path);
  setPath(item.reasoning, path, conditional ? 'If context emerges, the patient has sepsis.' : 'The patient has sepsis.');
  const codes = validate(item);
  assert.ok(codes.includes('reasoning_unsupported_diagnosis_label'), path);
  const findings = reasoningDiagnostics(item.snapshot, JSON.stringify(item.reasoning), evidence(item), server.validatePriorityMapReliability, codes, 'p1');
  const metadata = sanitizeValidationMetadata({ stage: 'original', accepted: false, rejection_codes: codes, findings });
  assert.ok(metadata.findings.some(f => f.field_path === path), path);
  const logged = JSON.stringify(server.buildOperationalLogEntry({ original_validation: metadata, snapshot: item.snapshot, response: item.reasoning, credentials: 'secret-sentinel' }));
  for (const forbidden of ['The patient', '85/55', 'secret-sentinel', item.snapshot]) assert.ok(!logged.includes(forbidden));
});

test('new-field length, enum, missing-key and evidence failures expose only safe schema metadata', () => {
  const item = copy(positive[0]);
  item.reasoning.physiology.application = 'x'.repeat(p1.LIMITS.application + 1);
  item.reasoning.clarify_now[0].competing_mechanisms = ['PRIVATE-ENUM'];
  item.reasoning.possible_contributors[0].evidence_ids = ['PRIVATE-EVIDENCE'];
  delete item.reasoning.physiology.limitation;
  const codes = validate(item);
  const findings = reasoningDiagnostics(item.snapshot, JSON.stringify(item.reasoning), evidence(item), server.validatePriorityMapReliability, codes, 'p1');
  const safe = sanitizeValidationMetadata({ stage: 'repair', accepted: false, rejection_codes: codes, findings });
  assert.ok(safe.findings.some(f => f.field_path === 'physiology.application' && f.actual_length === 241 && f.maximum === 240));
  assert.ok(safe.findings.some(f => f.invalid_reference_count === 1));
  assert.ok(!JSON.stringify(safe).includes('PRIVATE-'));
});

test('pattern-specific teaching reuses only validated physiology, with no additional operation', () => {
  const item = positive[0], map = p1.composePriorityMap(evidence(item), item.reasoning);
  const lesson = server.buildTeachMeFallback(map, item.snapshot, 'offline');
  assert.equal(lesson.active, false);
  assert.equal(lesson.conceptId, 'pattern-physiology');
  assert.equal(lesson.keyIdea, item.reasoning.physiology.principle);
  const unsafe = map.replace(item.reasoning.physiology.principle, 'The patient has sepsis.');
  assert.notEqual(server.buildTeachMeFallback(unsafe, item.snapshot).conceptId, 'pattern-physiology');
});

test('P1 original and repair findings retain distinct new-field attribution and metadata-only logs', async () => {
  const item = positive[0];
  const original = copy(item), repair = copy(item);
  original.reasoning.physiology.application = 'No focal deficits are present.';
  repair.reasoning.possible_contributors[0].why_relevant = 'Pressure is causing the mental status change.';
  const result = await server.runPriorityMapWithBudget({ source: item.snapshot,
    generateOriginal: async () => JSON.stringify(original.reasoning),
    repair: async () => JSON.stringify(repair.reasoning),
    validateOutput: (source, raw) => p1.validateReasoning(source, raw, evidence(item), server.validatePriorityMapReliability),
    diagnoseOutput: (source, raw, codes) => reasoningDiagnostics(source, raw, evidence(item), server.validatePriorityMapReliability, codes, 'p1'),
  });
  assert.equal(result.status, 'fallback');
  assert.equal(result.timing.repair_attempted, true);
  assert.ok(result.timing.original_validation.findings.some(f => f.code === 'reasoning_unsupported_negative_finding' && f.field_path === 'physiology.application'));
  assert.ok(result.timing.repair_validation.findings.some(f => f.code === 'reasoning_certainty_claim' && f.field_path === 'possible_contributors[0].why_relevant'));
  const log = JSON.stringify(server.buildOperationalLogEntry(result.timing));
  for (const text of ['No focal', 'Pressure is causing', '85/55', item.snapshot]) assert.ok(!log.includes(text));
});

const collisions = [
  ['synthesis', 'Reported pressure with increasing altered mentation raises concern for impaired perfusion; contributors remain unresolved.', 'unsupported_measurement_trend'],
  ['physiology.principle', 'Reduced blood flow causes reduced cerebral oxygen delivery; its relevance here remains unknown.', 'reasoning_certainty_claim'],
  ['physiology.application', 'Hypotension may contribute to altered mentation; its cause remains unresolved.', 'reasoning_unsupported_finding'],
  ['clarify_now[0].focus', 'Confirm measurement reliability.', 'certainty_overstatement'],
  ['physiology.application', 'The findings may localize concern, without identifying a disease.', 'reasoning_unsupported_negative_finding'],
  ['clarify_now[0].conditional_interpretation', 'If no medication exposure is present, a contributor could be less relevant.', 'reasoning_unsupported_negative_finding'],
  ['clarify_now[0].why_it_matters', 'Exposure timing could distinguish medication contribution from other causes of drowsiness.', 'reasoning_certainty_claim'],
  ['physiology.limitation', 'Source and baseline remain unknown; warm extremities do not establish a mechanism.', 'reasoning_unsupported_finding', 5],
];
for (const [path, text, code, index = 0] of collisions) test(`unchanged validator collision recorded: ${path} / ${code}`, () => {
  const item = copy(positive[index]); setPath(item.reasoning, path, text);
  assert.ok(validate(item).includes(code));
});

test('AMS/current-pressure urgency remains unchanged and documented for later review', () => {
  assert.equal(server.assessDeterministicUrgency(positive[0].snapshot).urgency, 'MODERATE');
});

test('unadorned hemodynamic comparisons can remain LOW under the frozen mapping', () => {
  const item = copy(positive[6]);
  item.snapshot = item.snapshot.replace('- Concern: circulatory findings changed\n', '');
  assert.equal(server.assessDeterministicUrgency(item.snapshot).urgency, 'LOW');
  const map = p1.composePriorityMap(evidence(item), item.reasoning);
  assert.ok(server.validatePriorityMapReliability(item.snapshot, map).includes('urgency_escalation_conflict'));
});
