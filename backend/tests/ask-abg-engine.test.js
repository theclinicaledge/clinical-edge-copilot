const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { interpretABG, routeABG, winterRange, metabolicAlkalosisRange, respiratoryRanges, bicarbonateCO2PH, CONSISTENCY_TOLERANCE_PH, compare, round, teachingCatalog, explanationRequest, selectExplanation } = require('../ask-abg-engine');
const { registerAskRoutes } = require('../ask-clinical-edge');
const registry = require('../ask-source-registry.json');
const sample = (pH = 7.22, paCO2 = 30, hco3 = 12, extra = {}) => ({ pH, paCO2, hco3, units: { paCO2: 'mmHg', hco3: 'mmol/L' }, sampleType: 'arterial', ...extra });
const question = 'Arterial ABG: pH 7.22, PaCO2 30 mmHg, HCO3 12 mmol/L. What does it mean?';

test('Winter arithmetic is independent of generation and exactly matches the failed holdout', () => {
  assert.deepEqual(winterRange(12), [24, 28]);
  for (let h = 1; h < 24; h += 0.25) {
    const [lo, hi] = winterRange(h); assert.equal(hi - lo, 4); assert.equal((hi + lo) / 2, 1.5 * h + 8);
  }
});
test('metabolic alkalosis slope range and respiratory alternatives calculated independently', () => {
  assert.deepEqual(metabolicAlkalosisRange(40), [49.6, 52]);
  assert.deepEqual(respiratoryRanges(55, 'acidosis'), { acute: [25.5, 27], chronic: [28.5, 30] });
  assert.deepEqual(respiratoryRanges(30, 'alkalosis'), { acute: [22, 23], chronic: [19, 20] });
});
test('formulas reject invalid arguments and unsupported directions instead of extrapolating silently', () => {
  for (const n of [0, -1, NaN, Infinity, 24]) assert.throws(() => winterRange(n), RangeError);
  for (const n of [28, -1, NaN, Infinity]) assert.throws(() => metabolicAlkalosisRange(n), RangeError);
  for (const [n, direction] of [[40, 'acidosis'], [38, 'alkalosis'], [20, 'other'], [NaN, 'acidosis']]) assert.throws(() => respiratoryRanges(n, direction), RangeError);
});
test('interval endpoints are inclusive and display rounding does not change clinical comparison', () => {
  assert.equal(compare(24, [24, 28]), 'within'); assert.equal(compare(28, [24, 28]), 'within');
  assert.equal(compare(23.999, [24, 28]), 'below'); assert.equal(compare(28.001, [24, 28]), 'above');
  const x = interpretABG(sample(7.2, 26.505, 11.003));
  assert.deepEqual(x.calculated[0].expectedRange, [22.5, 26.5]);
  assert.equal(x.calculated[0].comparison, 'above');
  assert.equal(round(26.505), 26.51);
});
for (const [pH, co2, hco3, primary, comparison] of [
  [7.22, 26, 12, 'metabolic_acidosis', 'within'],
  [7.22, 30, 12, 'metabolic_acidosis', 'above'],
  [7.31, 20, 10, 'metabolic_acidosis', 'below'],
  [7.0, 50, 12, 'combined_acidifying', 'above'],
  [7.5, 50, 40, 'metabolic_alkalosis', 'within'],
  [7.48, 54, 40, 'metabolic_alkalosis', 'above'],
  [7.52, 45, 40, 'metabolic_alkalosis', 'below'],
  [7.7, 30, 40, 'combined_alkalinizing', 'below'],
  [7.28, 55, 25, 'respiratory_acidosis', 'below'],
  [7.3, 60, 30, 'respiratory_acidosis', 'above'],
  [7.5, 30, 22, 'respiratory_alkalosis', 'within'],
  [7.52, 10, 8, 'respiratory_alkalosis', 'below'],
  [7.5, 30, 25, 'respiratory_alkalosis', 'above'],
]) test(`structured pattern ${primary}, ${pH}/${co2}/${hco3}`, () => {
  const x = interpretABG(sample(pH, co2, hco3)); assert.equal(x.status, 'verified');
  assert.equal(x.interpretive.primaryProcess, primary); assert.equal(x.calculated[0].comparison, comparison);
  assert.deepEqual(x.reported.values, { pH, paCO2: co2, hco3 }); assert.ok(x.sourceIds.includes('merck-acid-base'));
  assert.ok(x.limitations.some(s => s.includes('not the underlying disease')));
});
test('failed explicit-unit ABG receives the correct additional-process interpretation', () => {
  const x = interpretABG(sample());
  assert.deepEqual(x.calculated[0].expectedRange, [24, 28]); assert.equal(x.calculated[0].measured, 30);
  assert.ok(x.interpretive.additionalPatterns[0].includes('additional respiratory acidifying'));
  assert.equal(JSON.stringify(x).includes('adequate ventilation'), false);
});
test('respiratory acidemia does not infer duration or a confirmed additional disease', () => {
  const x = interpretABG(sample(7.28, 55, 25));
  assert.deepEqual(x.calculated.map(c => c.expectedRange), [[25.5, 27], [28.5, 30]]);
  assert.ok(x.interpretive.additionalPatterns[0].includes('limited adaptation'));
  assert.ok(x.interpretive.additionalPatterns[0].includes('duration is unknown'));
  assert.equal(JSON.stringify(x).includes('respiratory failure'), false);
});
test('respiratory framework gaps remain unresolved, not a selected time course', () => {
  const x = interpretABG(sample(7.3, 60, 29));
  assert.deepEqual(x.calculated.map(c => c.comparison), ['above', 'below']);
  assert.ok(x.interpretive.additionalPatterns[0].includes('without selecting a duration'));
});
for (const pH of [7.35, 7.4, 7.45]) test('normal/borderline pH never proves no mixed process: ' + pH, () => {
  const x = interpretABG(sample(pH, 40, 24)); assert.equal(x.interpretive.pHState, 'within_reference_interval');
  assert.equal(x.interpretive.primaryProcess, 'no_direction_identified'); assert.equal(x.calculated.length, 0);
  assert.ok(x.interpretive.additionalPatterns[0].includes('does not exclude'));
});
test('reference-range pH with abnormal CO2/HCO3 remains unresolved', () => {
  const x = interpretABG(sample(7.4, 60, 36)); assert.equal(x.interpretive.primaryProcess, 'unresolved');
  assert.equal(x.calculated.length, 0); assert.ok(x.summary.includes('cannot be assigned reliably'));
});
test('exact bicarbonate/CO2 source thresholds are not silently rounded into a process', () => {
  assert.equal(interpretABG(sample(7.34, 40, 24)).interpretive.primaryProcess, 'unresolved');
  assert.equal(interpretABG(sample(7.5, 38, 28)).interpretive.primaryProcess, 'unresolved');
  assert.equal(interpretABG(sample(7.3499, 40, 23.999)).interpretive.primaryProcess, 'metabolic_acidosis');
  assert.equal(interpretABG(sample(7.4501, 37.999, 28)).interpretive.primaryProcess, 'respiratory_alkalosis');
});
test('metabolic alkalosis formula outside ceiling is not rendered as an applicable expected interval', () => {
  const x = interpretABG(sample(7.69, 60, 70)); const c = x.calculated[0];
  assert.equal(c.comparison, 'outside_linear_model'); assert.equal(c.compensationCeiling, 55);
  assert.ok(c.label.includes('not an expected')); assert.ok(x.interpretive.additionalPatterns.at(-1).includes('needs consideration'));
});
for (const [key, value] of [['pH', NaN], ['pH', Infinity], ['pH', 12], ['pH', 5], ['paCO2', 0], ['paCO2', -5], ['paCO2', 1000], ['hco3', 0], ['hco3', 500], ['hco3', '12']]) test(`missing/implausible/malformed input ${key}=${value}`, () => {
  const x = interpretABG({ ...sample(), [key]: value }); assert.equal(x.status, 'clarification_required'); assert.equal(x.calculated.length, 0);
});
test('units/sample are required and mEq/L bicarbonate is explicitly preserved', () => {
  for (const extra of [{ units: {} }, { sampleType: 'venous' }, { units: { paCO2: 'kPa', hco3: 'mmol/L' } }]) assert.equal(interpretABG(sample(7.22, 30, 12, extra)).status, 'clarification_required');
  assert.equal(interpretABG(sample(7.22, 30, 12, { units: { paCO2: 'mmHg', hco3: 'mEq/L' } })).reported.units.hco3, 'mEq/L');
  for (const input of [null, [], {}, 'gas']) assert.equal(interpretABG(input).status, 'clarification_required');
});
test('source-backed buffer arithmetic catches incompatible triples without correcting a supplied value', () => {
  assert.ok(Math.abs(bicarbonateCO2PH(40, 24) - 7.40103) < 0.00001);
  const impossible = interpretABG(sample(6.4, 100, 80));
  assert.equal(impossible.status, 'clarification_required'); assert.equal(impossible.calculated.length, 0);
  assert.deepEqual(impossible.reported.values, { pH: 6.4, paCO2: 100, hco3: 80 });
  assert.ok(impossible.sampleConsistency.absoluteDifference > CONSISTENCY_TOLERANCE_PH);
  assert.equal(interpretABG(sample(bicarbonateCO2PH(40,24) + CONSISTENCY_TOLERANCE_PH,40,24)).status, 'verified');
  assert.equal(interpretABG(sample(bicarbonateCO2PH(40,24) + CONSISTENCY_TOLERANCE_PH + 0.0001,40,24)).status, 'clarification_required');
  for (const values of [[0,24],[40,0],[NaN,24]]) assert.throws(() => bicarbonateCO2PH(...values), RangeError);
});
test('exact frozen unit-incomplete question clarifies instead of reaching model arithmetic', () => {
  const x = routeABG('ABG pH 7.28, PaCO2 55, HCO3 25: what does that pattern support, and what can it not tell me?');
  assert.equal(x.status, 'clarification_required'); assert.ok(x.issues.some(i => i.includes('mmHg'))); assert.equal(x.calculated.length, 0);
});
for (const q of [question, 'ABG pH=7.22; PaCO₂:30 mm Hg; HCO₃⁻:12 mEq/L', 'Arterial pH 7.22, HCO3 12 mmol/L, PaCO2 30 mmHg']) test('labelled explicit-unit extraction: ' + q, () => {
  const x = routeABG(q); assert.equal(x.status, 'verified'); assert.deepEqual(x.calculated[0].expectedRange, [24, 28]);
});
for (const q of [
  'Interpret this ABG', 'ABG 7.22/30/12', 'ABG pH 7.22, PaCO2 30 mmHg',
  'VBG pH 7.22, PaCO2 30 mmHg, HCO3 12 mmol/L',
  'ABG and VBG pH 7.22, PaCO2 30 mmHg, HCO3 12 mmol/L',
  'ABG pH 7.22, PaCO2 4 kPa, HCO3 12 mmol/L',
  'ABG pH 7.22, PaCO2 30 mmHg / 4 kPa, HCO3 12 mmol/L',
  'ABG pH 7.22, pH 7.3, PaCO2 30 mmHg, HCO3 12 mmol/L',
  'ABG pH 7,22, PaCO2 30 mmHg, HCO3 12 mmol/L',
  'ABG pH 7.22, PaCO2 30-55 mmHg, HCO3 12 mmol/L',
  'ABG pH 7.22, PaCO2 3e1 mmHg, HCO3 12 mmol/L',
  'ABG pH 7.22, PaCO2 from 30 to 55 mmHg, HCO3 12 mmol/L',
]) test('ambiguous or missing data are not interpreted: ' + q, () => assert.equal(routeABG(q).status, 'clarification_required'));
test('generic education and non-blood pH keep the existing Ask path', () => {
  for (const q of ['Explain respiratory acidosis', 'What is capillary refill?', 'Why is urine pH 7?']) assert.equal(routeABG(q), null);
});

for (const raw of [
  '{"answer":"Expected PaCO2 is 26-30; compensation is adequate."}',
  '{"points":["comparison"],"answer":"This is respiratory alkalosis."}',
  '{"points":[{"text":"This patient has septic shock."}]}',
  '{"points":["Expected PaCO2 99"]}', '{"points":["respiratory_failure"]}',
  '{"points":[]}', '{"points":["duration"]}', '{"points":["comparison","comparison"]}',
  '```json\n{"points":["comparison"]}\n```',
  '{"points":["comparison"],"verifiedResult":{"expectedRange":[26,30]}}',
]) test('adversarial explanation cannot contaminate verified result: ' + raw, () => {
  const result = interpretABG(sample()), before = JSON.stringify(result); const checked = selectExplanation(raw, result);
  assert.equal(checked.accepted, false); assert.deepEqual(checked.points, []); assert.equal(JSON.stringify(result), before);
  assert.deepEqual(result.calculated[0].expectedRange, [24, 28]);
});
test('valid explanation chooses only source-backed canonical text; no generated wording returned', () => {
  const x = interpretABG(sample()); const request = explanationRequest(x);
  assert.ok(request.system.includes('"expectedRange":[24,28]')); assert.equal(request.format.schema.additionalProperties, false);
  const selected = selectExplanation('{"points":["metabolic_response","comparison"]}', x);
  assert.equal(selected.accepted, true); assert.deepEqual(selected.points, teachingCatalog(x).filter(p => ['metabolic_response','comparison'].includes(p.id)).reverse());
  assert.ok(selected.points.every(p => p.sourceIds.every(id => registry.sources.some(s => s.id === id))));
});

function handlerSetup({ raw = '{"points":["metabolic_response","comparison"]}', configured = true, failure = null, stopReason = 'end_turn', phi = false } = {}) {
  let handler, calls = 0, payload; const logs = [];
  const res = new EventEmitter(); res.status = n => { res.statusCode = n; return res; }; res.json = body => { res.body = body; res.emit('finish'); return res; };
  registerAskRoutes({ post: (_path, _limit, fn) => { handler = fn; } }, { apiLimiter() {}, containsPHI: () => phi,
    getClient: () => configured ? { messages: { stream: p => { calls++; payload = p; return {}; } } } : null,
    runWithStageTimeout: async (fn, ms) => { assert.equal(ms, 25000); return fn(new AbortController().signal); },
    collectPriorityMapStream: async () => { if (failure) throw failure; return { text: raw, stopReason, inputTokens: 10, outputTokens: 20 }; },
    appendOperationalLog: x => logs.push(x), classifyProviderError: () => ({ code: 'provider_error' }) });
  return { run: (q = question, extra = {}) => handler({ body: { question: q, contextMode: 'general', ...extra } }, res), res, logs, get calls() { return calls; }, get payload() { return payload; } };
}
test('normal submission always returns verified interpretation with zero provider calls, even unconfigured', async () => {
  const s = handlerSetup({ configured: false }); await s.run();
  assert.equal(s.calls, 0); assert.equal(s.res.body.abg.status, 'verified'); assert.deepEqual(s.res.body.abg.calculated[0].expectedRange, [24, 28]);
  assert.equal(s.logs[0].display_resolution, 'abg_verified'); assert.equal(s.res.body.evidence.status, 'deterministic_rules');
  assert.ok(s.res.body.evidence.sources.some(p => p.id === 'merck-acid-base'));
});
test('explicit explanation action receives the completed result and returns only point IDs', async () => {
  const s = handlerSetup(); await s.run(question, { abgExplanation: true }); assert.equal(s.calls, 1);
  assert.ok(s.payload.system.includes('"expectedRange":[24,28]')); assert.equal(s.payload.model, 'claude-sonnet-4-6');
  assert.deepEqual(s.payload.messages, [{ role: 'user', content: question }]);
  assert.deepEqual(s.res.body.abgExplanation.pointIds, ['metabolic_response','comparison']);
  assert.equal(s.res.body.answer, undefined); assert.equal(s.res.body.abg, undefined);
});
for (const config of [{ configured: false }, { failure: { code: 'provider_timeout' } }, { failure: { status: 401 } }, { raw: '{"answer":"PaCO2 26-30"}' }, { stopReason: 'max_tokens' }]) test('explanation failure leaves code-owned result intact: ' + JSON.stringify(config), async () => {
  const s = handlerSetup(config); await s.run(question, { abgExplanation: true });
  assert.equal(s.res.body.abgExplanation.status, 'unavailable'); assert.ok(s.calls <= 1); assert.equal(s.res.body.abg, undefined);
  assert.equal(s.logs[0].display_resolution, 'abg_preserved');
});
test('privacy, existing safety and hidden-context boundaries remain ahead of ABG interpretation', async () => {
  const phi = handlerSetup({ phi: true }); await phi.run(); assert.equal(phi.res.statusCode, 400); assert.equal(phi.calls, 0);
  const dose = handlerSetup(); await dose.run(question + ' What dose should I give?'); assert.equal(dose.calls, 0); assert.equal(dose.res.body.abg, undefined);
  const hidden = handlerSetup(); await hidden.run(question, { snapshot: 'hidden' }); assert.equal(hidden.res.statusCode, 400);
  const misuse = handlerSetup(); await misuse.run('What is capillary refill?', { abgExplanation: true }); assert.equal(misuse.calls, 0); assert.equal(misuse.res.statusCode, 400);
  const badType = handlerSetup(); await badType.run(question, { abgExplanation: 'yes' }); assert.equal(badType.res.statusCode, 400);
});
test('ABG data, teaching and provider prose never enter operational logs', async () => {
  const s = handlerSetup(); await s.run(question, { abgExplanation: true });
  const log = JSON.stringify(s.logs);
  for (const text of [question, s.payload.system, 'expectedRange', 'metabolic_response', 'reported', 'sourceIds']) assert.equal(log.includes(text), false);
  assert.equal(s.logs[0].validation_status, 'accepted');
});
