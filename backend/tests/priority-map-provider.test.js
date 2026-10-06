const test = require('node:test');
const assert = require('node:assert/strict');

// All SDK requests in this process terminate at a local mocked fetch.
let sdkCalls = 0;
let capturedPayload;
let output;
let sdkOutputs = [];
const { COMPACT_REASONING_PROMPT, REASONING_OUTPUT_FORMAT } = require('../priority-map-p1');
const reasoning = {
  synthesis: 'Altered mentation with fever and elevated reported BP may reflect neurologic or systemic contributors; the cause remains unresolved.',
  possible_contributors: [{ possibility: 'Neurologic process', evidence_ids: ['e1'], uncertainty: 'Baseline, onset and examination remain unresolved.', why_relevant: 'Reported mentation concern may reflect neural dysfunction.', would_strengthen: 'If localized findings emerge, concern could strengthen.', would_weaken: 'If systemic findings are concordant, a localized-only interpretation could weaken.' }],
  clarify_now: [{ assessment: 'Assess current responsiveness and focused neurologic findings.', why_it_matters: 'These distinguish neurologic, metabolic and medication-related possibilities.', focus: 'Assess side-to-side motor responses and responsiveness.', competing_mechanisms: ['Neurologic process', 'Metabolic process'], conditional_interpretation: 'If localized findings emerge, neurologic relevance could strengthen.' }],
  reassessment_or_escalation: ['Focused bedside assessment and communication should follow the reported findings and local protocol.'],
  physiology: { principle: 'Altered mentation may reflect different neural or systemic mechanisms.', application: 'The reported pattern may require distinguishing localizing from diffuse contributors.', limitation: 'Baseline and examination remain unknown; a causal relationship is not established.' },
};
globalThis.fetch = async (_url, options) => {
  sdkCalls++;
  capturedPayload = JSON.parse(options.body);
  const fixture = sdkOutputs.length ? sdkOutputs.shift() : output;
  const responseOutput = capturedPayload.system.startsWith(COMPACT_REASONING_PROMPT)
    ? JSON.stringify({ ...reasoning, ...(fixture.includes('55 mmHg') ? { synthesis: 'Escalate if systolic BP falls below 55 mmHg' } : {}) }) : fixture;
  const events = [
    { type: 'message_start', message: { id: 'mock', type: 'message', role: 'assistant', content: [], model: 'claude-sonnet-4-6', stop_reason: null, stop_sequence: null, usage: { input_tokens: 1, output_tokens: 0 } } },
    { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
    { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: responseOutput } },
    { type: 'content_block_stop', index: 0 },
    { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 1 } },
    { type: 'message_stop' },
  ];
  return new Response(events.map(e => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join(''), { headers: { 'content-type': 'text/event-stream' } });
};
process.env.ANTHROPIC_API_KEY = 'test-key';
const { EventEmitter } = require('node:events');
const { app, INITIAL_PRIORITY_MAP_PROMPT, CLINICAL_RELIABILITY_CONTRACT, validatePriorityMapContract, validatePriorityMapReliability, runPriorityMapWithBudget, collectPriorityMapStream, buildOperationalLogEntry, COPILOT_TOTAL_BUDGET_MS, COPILOT_ORIGINAL_BUDGET_MS, COPILOT_REPAIR_BUDGET_MS, COPILOT_RETURN_RESERVE_MS } = require('../server');
const source = 'PATIENT SNAPSHOT — USER-REPORTED / OBSERVED INFORMATION\nReported clinical data:\n- Level of consciousness: Altered mental status\n- BP: current 170 mmHg\n- Fever reported\nOmitted findings remain unknown.';
output = `Urgency Level: MODERATE
**Priorities**
### 1 · Altered mental status with fever
Relevance: Important
Observed:
- Altered mental status and fever were reported
- Current systolic BP was reported as 170 mmHg
Interpretation: This combination raises concern for a neurologic or systemic process, but the blood pressure alone does not establish the cause.
Assess now:
- Mental-status baseline, responsiveness, focal findings and timing of recognition
**Assess first**
- Focused neurologic assessment, temperature measurement and medication context
**Possible patterns**
- Infection could contribute to altered mentation; a source, examination and corroborating information remain missing.
- A neurologic or metabolic process may also fit; focal findings, glucose information and baseline would help discriminate possibilities.
**Missing information**
- Exact onset versus recognition time, baseline mentation and recent medication exposure
**Monitor and trend**
- Compare current BP, temperature and mental status with subsequent observations; no prior direction is supplied.
**Escalation triggers**
- New focal findings or worsening responsiveness warrant prompt bedside evaluation and team communication under local protocol.
**SBAR-ready summary**
Altered mental status, fever and an elevated current systolic BP were reported. Baseline and timing are unknown. The cause remains unresolved.
**Teach me why**
Fever and altered mentation may accompany systemic or neurologic processes. Discriminating assessments help separate possibilities without attributing the mental status to BP alone.
For educational support only. Use your clinical judgment and follow local protocol.`;

test('contextual reasoning prompt retains every clinical safeguard without legacy header conflict', () => {
  assert.ok(INITIAL_PRIORITY_MAP_PROMPT.includes(CLINICAL_RELIABILITY_CONTRACT));
  assert.doesNotMatch(INITIAL_PRIORITY_MAP_PROMPT, /Never bold full sentences or section headers/);
  assert.deepEqual(validatePriorityMapContract(output), []);
  assert.deepEqual(validatePriorityMapReliability(source, output), []);
  assert.match(output, /Infection could contribute/);
  assert.match(output, /neurologic or metabolic process may/);
  assert.ok(COPILOT_ORIGINAL_BUDGET_MS > 12000);
  assert.ok(COPILOT_ORIGINAL_BUDGET_MS + COPILOT_REPAIR_BUDGET_MS + COPILOT_RETURN_RESERVE_MS <= COPILOT_TOTAL_BUDGET_MS);
  assert.ok(COPILOT_TOTAL_BUDGET_MS < 65000);
  const route = require('node:fs').readFileSync(require.resolve('../server'), 'utf8');
  const compactTiming = route.match(/totalBudgetMs: Math\.max\(0, (\d+) - \(Date\.now\(\) - requestStartedAt\)\),\s*originalBudgetMs: (\d+),\s*repairBudgetMs: (\d+),\s*minRepairBudgetMs: (\d+)/);
  assert.ok(compactTiming);
  const [total, original, repair, minimumRepair] = compactTiming.slice(1).map(Number);
  assert.deepEqual([total, original, repair, minimumRepair], [33000, 25000, 5000, 2500]);
  assert.equal(total - original - repair - COPILOT_RETURN_RESERVE_MS, 1500);
  assert.ok(total < 65000);
});

test('original stream can finish beyond the former deadline; first-token metadata has no content', async () => {
  let clock = 0, calls = 0;
  const metadata = [];
  const result = await runPriorityMapWithBudget({ source, now: () => clock, generateOriginal: async () => {
    calls++;
    return collectPriorityMapStream((async function* () {
      clock = 2000;
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: output } };
      clock = 18000;
      yield { type: 'message_delta', delta: { stop_reason: 'end_turn' } };
    })(), () => clock, m => metadata.push(m));
  } });
  assert.equal(result.status, 'validated');
  assert.equal(calls, 1);
  assert.equal(result.timing.provider_duration_ms, 18000);
  assert.equal(result.timing.provider_first_token_ms, 2000);
  assert.equal(result.timing.repair_attempted, false);
  const log = buildOperationalLogEntry({ ...metadata.at(-1), text: output, question: source });
  assert.equal(log.provider_stop_reason, 'end_turn');
  assert.doesNotMatch(JSON.stringify(log), /Altered|170|Fever/);
});

test('partial stream times out, is aborted once, and never bypasses fallback', async () => {
  let calls = 0, aborted = false, repairs = 0;
  const result = await runPriorityMapWithBudget({ source, originalBudgetMs: 15, generateOriginal: async signal => {
    calls++;
    return collectPriorityMapStream((async function* () {
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'UNVALIDATED_PARTIAL' } };
      await new Promise((resolve, reject) => signal.addEventListener('abort', () => { aborted = true; reject(new Error('aborted')); }, { once: true }));
    })());
  }, repair: async () => { repairs++; return output; } });
  assert.equal(result.status, 'fallback');
  assert.equal(result.timing.timeout_layer, 'provider');
  assert.equal(calls, 1);
  assert.equal(repairs, 0);
  assert.equal(aborted, true);
  assert.doesNotMatch(result.output, /UNVALIDATED_PARTIAL/);
});

test('delayed completed provider fixture succeeds after first tokens without premature timeout', async () => {
  let calls = 0;
  const result = await runPriorityMapWithBudget({ source, totalBudgetMs: 300, originalBudgetMs: 200, returnReserveMs: 20, generateOriginal: async () => {
    calls++;
    return collectPriorityMapStream((async function* () {
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: output } };
      await new Promise(resolve => setTimeout(resolve, 30));
      yield { type: 'message_delta', delta: { stop_reason: 'end_turn' } };
    })());
  } });
  assert.equal(result.status, 'validated');
  assert.equal(calls, 1);
  assert.equal(result.timing.provider_stop_reason, 'end_turn');
});

test('malformed and token-truncated responses cannot become accepted model output', async () => {
  for (const original of ['A generic reassuring answer.', { text: output, stopReason: 'max_tokens', firstTokenMs: 1 }]) {
    const result = await runPriorityMapWithBudget({ source, generateOriginal: async () => original });
    assert.equal(result.status, 'fallback');
    assert.ok(result.issues.some(c => ['invalid_priority_map_contract', 'incomplete_provider_response'].includes(c)));
  }
});

test('provider error and failed repair retain deterministic fallback', async () => {
  const failure = await runPriorityMapWithBudget({ source, generateOriginal: async () => { throw Object.assign(new Error('synthetic'), { status: 503 }); } });
  assert.equal(failure.status, 'fallback');
  assert.equal(failure.timing.provider_status, 'error');
  let repairs = 0;
  const result = await runPriorityMapWithBudget({ source, repairBudgetMs: 10, generateOriginal: async () => 'Give medication now.', repair: async () => { repairs++; return new Promise(() => {}); } });
  assert.equal(result.status, 'fallback');
  assert.equal(result.timing.repair_status, 'timeout');
  assert.equal(repairs, 1);
});

test('total deadline caps original stage even when its configured budget is larger', async () => {
  const result = await runPriorityMapWithBudget({ source, totalBudgetMs: 40, returnReserveMs: 15, originalBudgetMs: 1000, generateOriginal: async () => new Promise(() => {}) });
  assert.equal(result.status, 'fallback');
  assert.ok(result.timing.provider_duration_ms < 500);
});

test('actual initial route uses one mocked SDK stream, focused prompt, validated SSE and metadata-only logging', async () => {
  sdkCalls = 0;
  const handler = app.router.stack.find(l => l.route?.path === '/api/copilot').route.stack.at(-1).handle;
  const res = new EventEmitter();
  let wire = '';
  res.setHeader = () => {};
  res.write = value => { wire += value; };
  res.end = () => res.emit('finish');
  const logs = [], oldLog = console.log;
  console.log = (...args) => logs.push(args);
  try { await handler({ body: { question: source, mode: 'deep' } }, res); } finally { console.log = oldLog; }
  assert.equal(sdkCalls, 1);
  assert.equal(capturedPayload.model, 'claude-sonnet-4-6');
  assert.equal(capturedPayload.stream, true);
  assert.ok(capturedPayload.system.startsWith(COMPACT_REASONING_PROMPT));
  assert.equal(capturedPayload.max_tokens, 900);
  assert.deepEqual(capturedPayload.output_config, { format: REASONING_OUTPUT_FORMAT });
  assert.ok(JSON.parse(capturedPayload.messages[0].content).evidence.length);
  assert.equal(capturedPayload.thinking, undefined);
  assert.match(wire, /"priorityMapResolution":"validated"/);
  assert.doesNotMatch(JSON.stringify(logs), /170 mmHg|Infection could|Altered mental status/);
  assert.match(JSON.stringify(logs), /provider_first_token_ms/);
  const operational = JSON.parse(logs.find(args => args[0] === '[OPERATIONAL]')[1]);
  assert.equal(operational.original_validation.accepted, true);
  assert.equal(operational.original_validation.findings, undefined);
  assert.equal(operational.repair_validation, undefined);
  assert.equal(operational.rejection_reason_codes, undefined);
});

test('actual route repairs unsafe complete output once, never displays the rejected draft', async () => {
  sdkCalls = 0;
  sdkOutputs = [output.replace('Focused neurologic assessment, temperature measurement and medication context', 'Escalate if systolic BP falls below 55 mmHg'), output];
  const handler = app.router.stack.find(l => l.route?.path === '/api/copilot').route.stack.at(-1).handle;
  const res = new EventEmitter();
  let wire = '';
  res.setHeader = () => {};
  res.write = value => { wire += value; };
  res.end = () => res.emit('finish');
  const oldLog = console.log, logs = [];
  console.log = (...args) => logs.push(args);
  try { await handler({ body: { question: source, mode: 'deep' } }, res); } finally { console.log = oldLog; }
  assert.equal(sdkCalls, 2);
  assert.deepEqual(capturedPayload.output_config, { format: REASONING_OUTPUT_FORMAT });
  assert.equal(capturedPayload.stream, true);
  assert.match(wire, /"priorityMapResolution":"repaired"/);
  assert.doesNotMatch(wire, /55 mmHg/);
  const operational = JSON.parse(logs.find(args => args[0] === '[OPERATIONAL]')[1]);
  assert.equal(operational.original_validation.accepted, false);
  assert.equal(operational.repair_validation.accepted, true);
  assert.ok(operational.original_validation.findings.some(item => item.field_path === 'synthesis'));
  assert.deepEqual(operational.repair_trigger_rejection_codes, operational.original_validation.rejection_codes);
  assert.equal(operational.rejection_reason_codes, undefined);
  assert.doesNotMatch(JSON.stringify(logs), /55 mmHg|170 mmHg|Escalate if systolic|Altered mental status/);
});
