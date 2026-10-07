const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { registerAskRoutes } = require('../ask-clinical-edge');
const { prepareSnapshotAnswer, validateSelection, snapshotPresentation } = require('../ask-snapshot-reasoning');
const question = 'Patient is on epi, vaso, and levo, the CI is 1.5. What’s going on?';
const sparse = { values: { ciNow: '1.5' }, optional: { drips: { items: ['epinephrine', 'vasopressin', 'norepinephrine'].map(medication => ({ medication })) } } };
const full = { ...sparse, notes: 'Post-CABG. Unrelated narrative must stay local.', values: { ...sparse.values, mapNow: '66', hrNow: '96', rhythm: 'Paced rhythm', cvpNow: '10', svrNow: '1400', lactateEarlier: '2.0', lactateNow: '3.2', urineAmount: '20', urineIntervalValue: '1', urineIntervalUnit: 'hour', perfusionFindings: ['Cool / clammy'] },
  optional: { ...sparse.optional, drains: { items: [{ type: 'Chest tube', currentOutput: '35 mL', outputTimeframe: 'most recent hour' }] }, devices: { selected: ['Temporary pacing'] }, labs: { selected: ['ABG / VBG'], detail: 'Arterial ABG pH 7.29, PaCO2 55 mmHg, HCO3 26 mmol/L.' } } };
const tools = () => import('../ask-snapshot-context.mjs');
function setup(options = {}) {
  const logs = []; let handler, calls = 0, params;
  const res = new EventEmitter(); res.statusCode = 200; res.status = s => { res.statusCode = s; return res; }; res.json = b => { res.body = b; res.emit('finish'); return res; };
  registerAskRoutes({ post: (_path, _limiter, fn) => { handler = fn; } }, {
    apiLimiter() {}, getClient: () => options.unconfigured ? null : { messages: { stream(p) { calls++; params = p; return {}; } } },
    containsPHI: text => text.includes('MRN:'), runWithStageTimeout: (fn, ms, _code, signal) => { assert.equal(ms, 25000); return fn(signal); },
    collectPriorityMapStream: async () => { if (options.error) throw options.error; return { text: options.raw ?? '{"card_ids":["filling","tone"]}', stopReason: options.stopReason ?? 'end_turn', inputTokens: 100, outputTokens: 20, firstTokenMs: 4 }; },
    appendOperationalLog: entry => logs.push(entry), classifyProviderError: () => ({ code: 'provider_failure' }),
  });
  return { run: body => handler({ body }, res), res, logs, get calls() { return calls; }, get params() { return params; } };
}
test('exact CTICU question selects bounded relevant reported facts without entire notes or Snapshot', async () => {
  const t = await tools(), packet = t.selectSnapshotContext(question, full, true);
  assert(t.validateSnapshotContext(question, packet)); assert.equal(packet.facts.find(f => f.key === 'ci').current, '1.5');
  const text = JSON.stringify(packet);
  for (const medication of ['epinephrine', 'vasopressin', 'norepinephrine']) assert(text.includes(medication));
  assert(text.includes('Post-CABG')); assert(!text.includes('Unrelated narrative'));
  assert(packet.facts.length <= t.CONTEXT_LIMITS.facts); assert(text.length <= t.CONTEXT_LIMITS.bytes);
  const result = await prepareSnapshotAnswer(question, packet);
  assert.match(result.answer, /low forward flow/); assert.match(result.answer, /cause remains unknown/);
  assert.equal(result.calculated.status, 'verified'); assert.equal(result.calculated.reported.values.paCO2, 55);
  assert(result.calculated.sourceIds.every(id => result.sources.some(source => source.id === id)));
  const displayed = snapshotPresentation(result, ['filling', 'tone'], 'model_selected');
  assert(displayed.details.length <= 2); assert.match(displayed.details[0].text, /cannot choose filling or pump impairment/);
  assert(!/cardiogenic shock|distributive shock|tamponade|RV failure|titrate|increase norepinephrine/i.test(JSON.stringify(displayed)));
});
test('sparse context preserves unknowns without invented values, rhythm, bleeding or echo', async () => {
  const t = await tools(), packet = t.selectSnapshotContext(question, sparse, true), p = await prepareSnapshotAnswer(question, packet);
  assert.deepEqual(p.reported.map(f => f.id), ['ci', 'drips']);
  assert.match(p.unknown.join(' '), /baseline.*one value.*trend/); assert.match(p.unknown.join(' '), /not reported/);
  assert(!/CVP.*normal|no bleeding|preserved ventricular|reduced ventricular|urine output.*down/.test(JSON.stringify(p)));
  assert.equal(packet.facts[0].previous, '');
});
test('disabled, missing and irrelevant questions transfer no patient facts', async () => {
  const t = await tools();
  for (const [q, snapshot, enabled] of [[question, full, false], [question, null, true], ['What is a sterile field?', full, true]]) assert.equal(t.selectSnapshotContext(q, snapshot, enabled), null);
});
test('contradictory CI is explicitly reconciled, not silently merged or diagnosed', async () => {
  const t = await tools(), packet = t.selectSnapshotContext(question, { ...full, values: { ...full.values, ciNow: '3.5' } }, true);
  const p = await prepareSnapshotAnswer(question, packet); assert(p.conflict); assert.deepEqual(p.eligible, []); assert.match(p.answer, /different CI/);
});
test('unitless and previous-only CI never establish low current flow', async () => {
  const t = await tools();
  for (const snapshot of [{ ...sparse, units: { ci: '' } }, { ...sparse, values: { ciEarlier: '1.5' } }, { ...sparse, values: { ciNow: 'not measured' } }]) {
    const p = await prepareSnapshotAnswer(question, t.selectSnapshotContext(question, snapshot, true)); assert.deepEqual(p.eligible, []); assert.match(p.answer, /requires a current numerical value/);
  }
});
test('unknown measurement states and conflicting current/state remain unresolved', async () => {
  const t = await tools();
  const p = await prepareSnapshotAnswer(question, t.selectSnapshotContext(question, { ...sparse, values: { ...sparse.values, cvpState: 'Unknown' } }, true));
  assert.match(p.unknown.join(' '), /Supplied filling-pressure context needs clarification/);
  assert(!/Filling-pressure context is not reported/.test(p.unknown.join(' ')));
  const conflict = await prepareSnapshotAnswer(question, t.selectSnapshotContext(question, { ...sparse, values: { ...sparse.values, ciState: 'Unknown' } }, true));
  assert(conflict.conflict); assert.deepEqual(conflict.eligible, []);
});
test('stable CI never manufactures low flow or deterioration', async () => {
  const t = await tools(), p = await prepareSnapshotAnswer('My patient CI is 3.5. What does that mean?', t.selectSnapshotContext(question, { ...full, values: { ...full.values, ciNow: '3.5' } }, true));
  assert.match(p.answer, /not below/); assert(!/worsening|deteriorating|low forward flow/.test(p.answer));
});
test('procedural concern/history is not converted into a performed CABG', async () => {
  const t = await tools();
  for (const notes of ['Concern for post-CABG complication', 'Possible CABG tomorrow', 'No CABG history', 'History concerning for CABG']) assert(!t.selectSnapshotContext(question, { ...sparse, notes }, true).facts.some(f => f.key === 'procedure'));
});
test('single timed output is retained as an interval, not manufactured comparison', async () => {
  const t = await tools(), reported = t.reportedFacts(t.selectSnapshotContext(question, full, true));
  assert.equal(reported.find(f => f.id === 'urine').text, '20 mL over 1 hour');
  assert.match(reported.find(f => f.id === 'drains').text, /35 mL.*most recent hour/);
  assert(!/down to|rising|falling|worsening/.test(reported.find(f => f.id === 'urine').text));
});
test('ABG Snapshot arithmetic is identical to existing engine and cannot accept client calculations', async () => {
  const t = await tools(), q = 'Explain the arterial ABG in my Snapshot', packet = t.selectSnapshotContext(q, full, true), p = await prepareSnapshotAnswer(q, packet);
  assert.deepEqual(p.calculated, require('../ask-abg-engine').routeABG(full.optional.labs.detail));
  assert.deepEqual(p.eligible, []); assert(!t.validateSnapshotContext(q, { ...packet, calculated: { pH: 'normal' } }));
});
test('gas-only arterial note line can feed the existing engine without transferring other notes', async () => {
  const t = await tools(), q = 'Explain this ABG', notes = 'Arterial ABG: pH 7.29, PaCO2 55 mmHg, HCO3 26 mmol/L.\nUnrelated narrative.';
  const packet = t.selectSnapshotContext(q, { ...sparse, notes }, true), p = await prepareSnapshotAnswer(q, packet);
  assert.equal(p.calculated.status, 'verified'); assert(!JSON.stringify(packet).includes('Unrelated narrative'));
  for (const invalid of [`No ${notes}`, `Possible ${notes}`, `${notes.split('\n')[0]} Additional prose.`, `${notes}\nArterial ABG: pH 7.38, PaCO2 40 mmHg, HCO3 24 mmol/L.`]) assert.equal(t.selectSnapshotContext(q, { values: {}, notes: invalid }, true), null);
});
test('actual structured perfusion fields are selected, not a nonexistent nested assessment', async () => {
  const t = await tools(), packet = t.selectSnapshotContext(question, { ...sparse, values: { ...sparse.values, capillaryRefill: '3', skinTemperature: 'Cool' } }, true);
  assert.match(packet.facts.find(f => f.key === 'perfusionAssessment').text, /capillaryRefill=3/);
});
for (const detail of ['ABG / VBG requested', 'pH 7.29, CO2 55, bicarbonate 26', 'VBG pH 7.29, PCO2 55 mmHg, HCO3 26 mmol/L']) test(`ambiguous/nonarterial gas does not silently become verified arterial: ${detail}`, async () => {
  const t = await tools(), q = 'Explain this ABG', packet = t.selectSnapshotContext(q, { ...sparse, optional: { labs: { detail } } }, true), p = await prepareSnapshotAnswer(q, packet);
  assert.notEqual(p.calculated?.status, 'verified');
});
test('context boundary rejects arbitrary keys, irrelevant fields, duplicate keys, wrong profile and oversized text', async () => {
  const t = await tools(), packet = t.selectSnapshotContext(question, sparse, true);
  for (const bad of [{ ...packet, snapshot: full }, { ...packet, profile: 'abg' }, { ...packet, facts: [...packet.facts, packet.facts[0]] }, { ...packet, facts: [{ key: 'diagnosis', text: 'shock' }] }, { ...packet, facts: [{ key: 'drips', text: 'x'.repeat(481) }] }]) assert(!t.validateSnapshotContext(question, bad));
});
test('closed selection rejects invented clinical text, treatments, disease labels and fabricated evidence IDs', async () => {
  const t = await tools(), p = await prepareSnapshotAnswer(question, t.selectSnapshotContext(question, sparse, true));
  for (const raw of ['{"card_ids":["cardiogenic shock"]}', '{"card_ids":["filling"],"answer":"titrate norepinephrine"}', '{"card_ids":["e999"]}', '{"card_ids":["filling","filling"]}', '```json\n{}\n```', '{"card_ids":[]}', '{"card_ids":["filling"],"calculated":{"paCO2":0}}']) assert.equal(validateSelection(raw, p), null);
  assert.deepEqual(validateSelection('{"card_ids":["filling","tone"]}', p), ['filling', 'tone']);
});
test('actual Ask route uses mock model selection once, keeps code-owned response and metadata-only logs', async () => {
  const t = await tools(), packet = t.selectSnapshotContext(question, full, true), s = setup();
  await s.run({ question, contextMode: 'snapshot', snapshotContext: packet });
  assert.equal(s.calls, 1); assert.equal(s.res.statusCode, 200); assert.equal(s.res.body.snapshotUse.resolution, 'model_selected');
  assert.match(s.res.body.answer, /low forward flow/);
  const log = JSON.stringify(s.logs);
  for (const text of [question, full.notes, 'epinephrine', '1.5', 'MRN:', 'ANTHROPIC_API_KEY', s.res.body.answer, s.params.system]) assert(!log.includes(text));
  assert.equal(s.logs[0].mode, 'snapshot'); assert.equal(s.logs[0].validation_status, 'accepted');
  assert(!JSON.stringify(s.params).includes('Unrelated narrative'));
  const { selectionContract } = require('../ask-snapshot-reasoning');
  const prepared = await prepareSnapshotAnswer(question, packet), contract = selectionContract(prepared);
  const expectedWire = structuredClone(contract.format);
  delete expectedWire.schema.properties.card_ids.maxItems;
  assert.deepEqual(s.params.output_config.format, expectedWire);
  assert.equal(contract.format.schema.properties.card_ids.maxItems, 2);
  assert.equal(s.params.system, contract.system);
  assert.equal(s.params.output_config.format.schema.properties.card_ids.minItems, 1);
  assert.equal(validateSelection('{"card_ids":["filling","tone","rhythm"]}', prepared), null);
});
test('rejected, timeout and unconfigured model preserve bounded code-owned answer without retry', async () => {
  const t = await tools(), packet = t.selectSnapshotContext(question, sparse, true);
  for (const options of [{ raw: '{"card_ids":["shock"]}' }, { stopReason: 'max_tokens' }, { error: Object.assign(new Error('clinical secret'), { code: 'provider_timeout' }) }, { unconfigured: true }]) {
    const s = setup(options); await s.run({ question, contextMode: 'snapshot', snapshotContext: packet });
    assert.equal(s.calls, options.unconfigured ? 0 : 1); assert.equal(s.res.body.snapshotUse.resolution, 'reference_guided'); assert.match(s.res.body.answer, /cause remains unknown/); assert(!JSON.stringify(s.logs).includes('clinical secret'));
  }
});
test('PHI, hidden context and individualized dose requests are blocked before model', async () => {
  const t = await tools(), packet = t.selectSnapshotContext(question, sparse, true);
  for (const body of [{ question, contextMode: 'general', snapshotContext: packet }, { question, contextMode: 'snapshot', snapshotContext: { ...packet, facts: [{ key: 'drips', text: 'MRN: fictional identifier' }] } }, { question: 'My patient: what dose of epinephrine should I give?', contextMode: 'snapshot', snapshotContext: t.selectSnapshotContext('My patient: what dose of epinephrine should I give?', sparse, true) }]) {
    const s = setup(); await s.run(body); assert.equal(s.calls, 0); assert(!s.res.body.snapshotUse); assert(!JSON.stringify(s.logs).includes('fictional identifier'));
  }
});
