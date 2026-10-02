const test = require('node:test');
const assert = require('node:assert/strict');
process.env.ANTHROPIC_API_KEY = '';
const { buildEvidence, validateReasoning, composePriorityMap, COMPACT_REASONING_PROMPT } = require('../priority-map-intelligence');
const { validatePriorityMapReliability, validatePriorityMapContract, buildPriorityMapFallback, runPriorityMapWithBudget, collectPriorityMapStream, buildOperationalLogEntry } = require('../server');
const snapshot = lines => `PATIENT SNAPSHOT — USER-REPORTED / OBSERVED INFORMATION\nReported clinical data:\n${lines.map(line => `- ${line}`).join('\n')}\nTreat omitted fields as unknown.`;
const cases = [
  ['mentation', ['Level of consciousness: Altered mental status', 'SBP: current 170 mmHg', 'Fever reported']],
  ['perfusion', ['BP: previous 108/64 -> current 86/48 mmHg', 'HR: previous 92 -> current 118 bpm', 'Urine output: 20 mL over the last hour', 'Extremities: cool and clammy']],
  ['respiratory', ['RR: previous 18 -> current 27 breaths/min', 'SpO2: previous 95 -> current 92 %', 'Oxygen: previous 2 -> current 4 L nasal cannula']],
  ['current only', ['BP: current 170 mmHg', 'Temperature: current 38.5 C']],
  ['trends', ['HR: previous 90 -> current 110 bpm', 'BP: previous 120/70 -> current 100/60 mmHg']],
  ['intervals', ['Urine output: 20 mL over the last hour', 'Chest tube output: 35 mL during the most recent hour']],
  ['unknown', ['BP: previous unknown -> current 105/65 mmHg', 'Mental status: not assessed', 'Norepinephrine dose: unknown']],
  ['benign', ['HR: current 72 bpm', 'BP: current 120/75 mmHg', 'Mental status: alert and oriented']],
];
const reasoning = () => ({
  synthesis: 'The reported findings need context to distinguish possible contributors without establishing a cause.',
  possible_contributors: [],
  clarify_now: [{ assessment: 'Baseline and measurement context', why_it_matters: 'These distinguish a new concern from the reported baseline.' }],
  reassessment_or_escalation: ['Reassessment and communication can be guided by bedside findings and local protocol.'],
});
for (const [name, lines] of cases) test(`${name}: exact evidence survives compact reasoning and composition`, () => {
  const source = snapshot(lines), evidence = buildEvidence(source, 'MODERATE'), value = reasoning();
  assert.equal(evidence.evidence.length, lines.length);
  assert.deepEqual(evidence.evidence.map(item => item.text), lines);
  assert.deepEqual(validateReasoning(source, JSON.stringify(value), evidence, validatePriorityMapReliability), []);
  const map = composePriorityMap(evidence, value);
  assert.deepEqual(validatePriorityMapContract(map), []);
  for (const line of lines) assert.ok(map.includes(line));
});
test('contextual synthesis supports useful qualified contributors and discriminators without canned clinical logic', () => {
  const source = snapshot(cases[0][1]), evidence = buildEvidence(source, 'MODERATE'), value = reasoning();
  value.synthesis = 'Altered mentation with reported fever and elevated BP may reflect neurologic, systemic or metabolic contributors; BP alone does not establish causality.';
  value.possible_contributors = [{ possibility: 'An infectious or neurologic process could contribute.', evidence_ids: ['e1', 'e3'], uncertainty: 'Onset, baseline and corroborating examination remain unresolved.' }];
  value.clarify_now = [{ assessment: 'Baseline, recognition versus onset, focal findings, glucose and medication exposure', why_it_matters: 'These help separate neurologic, systemic, metabolic and medication-related possibilities.' }];
  assert.deepEqual(validateReasoning(source, JSON.stringify(value), evidence, validatePriorityMapReliability), []);
  assert.match(composePriorityMap(evidence, value), /help separate neurologic/);
});
test('rejects schema, diagnosis, numeric invention, patient assertions, orders, unsupported trends and unknown evidence IDs', () => {
  const source = snapshot(cases[5][1]), evidence = buildEvidence(source, 'MODERATE');
  const attacks = ['The patient has a stroke.', 'This is sepsis; the trigger remains unknown.', 'Give aspirin now.', 'Give norepinephrine now.', 'Intubate for the reported concern.', 'Propofol may be contributing to drowsiness.', 'BP is 80 mmHg.', 'Urine output is falling.', 'The patient received propofol.', 'Normal glucose explains the findings.'];
  for (const synthesis of attacks) {
    assert.ok(validateReasoning(source, JSON.stringify({ ...reasoning(), synthesis }), evidence, validatePriorityMapReliability).length, synthesis);
  }
  const value = reasoning();
  value.possible_contributors = [{ possibility: 'Infection could contribute.', evidence_ids: ['invented'], uncertainty: 'Uncertain.' }];
  assert.deepEqual(validateReasoning(source, JSON.stringify(value), evidence, validatePriorityMapReliability), ['invalid_reasoning_schema']);
  assert.deepEqual(validateReasoning(source, '{}', evidence, validatePriorityMapReliability), ['invalid_reasoning_schema']);
});
test('current-only fallback preserves additional context without inventing earlier changes', () => {
  const source = snapshot(cases[0][1]) + '\nAdditional user-reported context: Baseline and onset are unknown.';
  const fallback = buildPriorityMapFallback(source);
  assert.doesNotMatch(fallback, /changes from earlier|reported changes raise concern|combined changes may/);
  assert.match(fallback, /Baseline and onset are unknown/);
  assert.match(fallback, /No earlier comparison is established/);
});
test('compact operation accepts one original, bounds one repair, and returns fallback on provider failure', async () => {
  const source = snapshot(cases[3][1]), evidence = buildEvidence(source, 'MODERATE');
  const validateOutput = (source, raw) => validateReasoning(source, raw, evidence, validatePriorityMapReliability);
  let calls = 0, repairs = 0;
  const accepted = await runPriorityMapWithBudget({ source, validateOutput, generateOriginal: async () => { calls++; return JSON.stringify(reasoning()); }, repair: async () => { repairs++; } });
  assert.equal(accepted.status, 'validated'); assert.equal(calls, 1); assert.equal(repairs, 0);
  const repaired = await runPriorityMapWithBudget({ source, validateOutput, generateOriginal: async () => '{}', repair: async () => { repairs++; return JSON.stringify(reasoning()); } });
  assert.equal(repaired.status, 'repaired'); assert.equal(repairs, 1);
  const failed = await runPriorityMapWithBudget({ source, validateOutput, generateOriginal: async () => { throw new Error('mock failure'); } });
  assert.equal(failed.status, 'fallback'); assert.doesNotMatch(failed.output, /changes from earlier/);
});
test('stream usage and latency are metadata-only and compact prompt is substantially smaller', async () => {
  const result = await collectPriorityMapStream((async function* () {
    yield { type: 'message_start', message: { usage: { input_tokens: 350 } } };
    yield { type: 'content_block_delta', delta: { type: 'text_delta', text: JSON.stringify(reasoning()) } };
    yield { type: 'message_delta', delta: { stop_reason: 'end_turn' }, usage: { output_tokens: 160 } };
  })());
  assert.equal(result.inputTokens, 350); assert.equal(result.outputTokens, 160);
  const log = buildOperationalLogEntry({ provider_input_tokens: result.inputTokens, provider_output_tokens: result.outputTokens, prompt: 'private', text: result.text });
  assert.deepEqual(log, { provider_input_tokens: 350, provider_output_tokens: 160 });
  assert.ok(COMPACT_REASONING_PROMPT.length < 2400);
});

test('unchanged, incomplete comparisons and multiline context retain their exact semantics', () => {
  const source = snapshot(['HR: previous 72 -> current 72 bpm', 'BP: previous unknown -> current 105/65 mmHg'])
    + '\nAdditional user-reported context: Baseline unclear.\nMedication exposure was not supplied.\nTreat omitted fields as unknown.';
  const evidence = buildEvidence(source, 'MODERATE');
  assert.equal(evidence.evidence[0].comparison.status, 'unchanged');
  assert.equal(evidence.evidence[1].comparison.status, 'unknown');
  assert.ok(evidence.evidence.some(item => item.text === 'Medication exposure was not supplied.'));
});

test('compact validation preserves uncertainty and rejects unreported findings and disguised causal certainty', () => {
  const source = snapshot(cases[3][1]), evidence = buildEvidence(source, 'MODERATE');
  for (const synthesis of ['Focal weakness with fever may reflect a neurologic process.', 'Fever explains the altered mentation.', 'BP fell before recognition.', 'The patient is on norepinephrine.']) {
    assert.ok(validateReasoning(source, JSON.stringify({ ...reasoning(), synthesis }), evidence, validatePriorityMapReliability).length, synthesis);
  }
});

const contextualFixtures = [
  ['Reported altered mentation and fever may reflect neurologic, systemic or metabolic contributors; the elevated reported BP does not resolve the mechanism.', 'Recognition versus onset, focal examination, glucose and medication exposure', 'These distinguish competing neurologic, systemic and metabolic contributors.'],
  ['The supplied circulatory comparisons with cool extremities may indicate impaired perfusion; the single urine interval cannot establish output direction.', 'Focused circulation, perfusion, bleeding context and baseline urine measurements', 'These help distinguish circulatory contributors and establish whether output differs from baseline.'],
  ['The supplied respiratory comparisons may indicate increasing respiratory stress; oxygenation and ventilation require separate assessment.', 'Respiratory effort, mentation, oxygen device and blood-gas context', 'These distinguish oxygenation concerns from ineffective ventilation.'],
  ['Current BP and temperature need baseline context; a prior direction cannot be inferred.', 'Baseline BP, repeat temperature and symptoms', 'These distinguish a persistent concern from an isolated measurement.'],
  ['The supplied BP and heart-rate comparisons may reflect circulatory stress; the underlying contributor remains unresolved.', 'Symptoms, peripheral perfusion and measurement context', 'These help determine tolerance and clarify whether the comparisons are clinically concordant.'],
  ['The supplied urine and drain intervals describe measured output, not a directional trend.', 'Prior comparable intervals, collection accuracy and bedside context', 'Matching intervals are needed before assigning an output direction.'],
  ['The current BP has no known earlier comparator; unassessed mentation and an unknown medication dose remain unresolved.', 'Earlier BP, current mentation and medication documentation', 'These resolve missing context without assuming normal findings or a dose.'],
  ['The reported current observations alone do not establish deterioration; interpretation depends on symptoms and baseline.', 'Baseline and any new symptoms', 'These determine whether the current observations warrant additional assessment.'],
];
for (const [index, fixture] of contextualFixtures.entries()) test(`${cases[index][0]}: contextual mock reasoning stays within the bounded contract`, () => {
  const source = snapshot(cases[index][1]), evidence = buildEvidence(source, 'MODERATE'), value = reasoning();
  value.synthesis = fixture[0];
  value.clarify_now = [{ assessment: fixture[1], why_it_matters: fixture[2] }];
  assert.deepEqual(validateReasoning(source, JSON.stringify(value), evidence, validatePriorityMapReliability), []);
  const displayed = composePriorityMap(evidence, value);
  assert.match(displayed, /Interpretation:/);
  assert.deepEqual(validatePriorityMapContract(displayed), []);
  assert.deepEqual(validatePriorityMapReliability(source, displayed), []);
});
