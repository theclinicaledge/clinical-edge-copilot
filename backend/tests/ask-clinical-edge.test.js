const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { registerAskRoutes, validateAskAnswer, ASK_PROVIDER_MS, ASK_PROMPT } = require('../ask-clinical-edge');
const { positive, negative } = require('../validation/ask/fixtures');
const { evaluate } = require('../validation/ask/harness');

function setup(options = {}) {
  let handler, calls = 0, params, signal;
  const logs = [];
  const res = new EventEmitter();
  res.statusCode = 200;
  res.status = n => { res.statusCode = n; return res; };
  res.json = data => { res.body = data; res.emit('finish'); return res; };
  registerAskRoutes({ post: (path, limiter, fn) => { assert.equal(path, '/api/ask'); handler = fn; } }, {
    apiLimiter: () => {},
    getClient: () => options.unconfigured ? null : { messages: { stream: (p, opts) => { calls++; params = p; signal = opts.signal; return {}; } } },
    containsPHI: q => q.includes('MRN:'),
    runWithStageTimeout: async (fn, ms, code, parent) => { assert.equal(ms, 25000); assert.equal(code, 'provider_timeout'); return fn(parent); },
    collectPriorityMapStream: async () => {
      if (options.disconnect) { res.emit('close'); throw new Error('cancelled'); }
      if (options.error) throw options.error;
      return { text: options.raw ?? JSON.stringify({ answer: positive[0].answer, details: [], ...(params.output_config.format.schema.properties.source_ids ? { source_ids: params.output_config.format.schema.properties.source_ids.items.enum } : {}) }), firstTokenMs: 12, stopReason: options.stopReason ?? 'end_turn', inputTokens: 30, outputTokens: 40 };
    },
    appendOperationalLog: x => logs.push(x),
    classifyProviderError: () => ({ code: 'provider_failure', message: 'Service unavailable.' }),
  });
  return { run: body => handler({ body }, res), res, logs, get calls() { return calls; }, get params() { return params; }, get signal() { return signal; } };
}

for (const fixture of positive) test(`general education accepted: ${fixture.id}`, () => {
  assert.equal(validateAskAnswer(JSON.stringify({ answer: fixture.answer })).answer, fixture.answer);
  assert.equal(evaluate(fixture).status, 'PASS');
});
for (const fixture of negative) test(`adversarial quality gate: ${fixture.id}`, () => assert.equal(evaluate(fixture).status, 'FAIL'));
test('novel content cannot inherit authored review from ID or keywords', () => {
  const result = evaluate({ ...positive[0], answer: `${positive[0].answer} Additional words.` });
  assert.equal(result.status, 'FAIL');
  assert.equal(result.gates.factual_relevance.status, 'NOT_REVIEWED');
});
for (const raw of ['{}', '[]', 'null', '```json\n{}\n```', '{"answer":"x"}', JSON.stringify({ answer: 'a'.repeat(7001) }), '{"answer":"A reasonable explanation.","snapshot":{}}']) test(`closed answer schema: ${raw.slice(0, 25)}`, () => assert.deepEqual(validateAskAnswer(raw).codes, ['invalid_answer_schema']));
test('educational topics are not subjected to Priority Map disease/numeric/causal bans', () => {
  assert.equal(validateAskAnswer(JSON.stringify({ answer: 'Sepsis can impair perfusion. Insulin lowers blood glucose by promoting cellular uptake. A pH below 7.35 is acidemia; interpretation depends on the sample and context.' })).codes.length, 0);
  assert.match(ASK_PROMPT, /No Shift Brain Snapshot/);
  assert.equal(ASK_PROVIDER_MS, 25000);
});
for (const body of [{ question: 'Explain preload', contextMode: 'patient-aware' }, { question: 'Explain preload', contextMode: 'general', snapshot: {} }, { question: 'Explain preload', contextMode: 'general', history: [] }, { question: 'Explain preload' }, []]) test('hidden context rejected before provider', async () => {
  const s = setup(); await s.run(body); assert.equal(s.calls, 0); assert.equal(s.res.statusCode, 400);
});
test('question and identifier validation precede provider', async () => {
  for (const question of [null, '', 'a'.repeat(4001), 'MRN: synthetic identifier']) {
    const s = setup(); await s.run({ question, contextMode: 'general' }); assert.equal(s.calls, 0); assert.equal(s.res.statusCode, 400);
  }
});
test('one request returns a complete validated answer and metadata-only log', async () => {
  const s = setup(); const question = 'Explain preload and afterload'; await s.run({ question, contextMode: 'general' });
  assert.equal(s.calls, 1); assert.equal(s.res.statusCode, 200); assert.equal(s.res.body.answer, positive[0].answer);
  assert.deepEqual(s.params.messages, [{ role: 'user', content: question }]);
  assert.equal(s.params.output_config.format.type, 'json_schema');
  const text = JSON.stringify(s.logs);
  for (const content of [question, positive[0].answer, ASK_PROMPT, 'ANTHROPIC_API_KEY']) assert.equal(text.includes(content), false);
  assert.equal(s.logs[0].validation_status, 'accepted'); assert.deepEqual(s.logs[0].rejection_reason_codes, []);
  assert.equal(s.logs[0].provider_input_tokens, 30);
});
test('unsafe and incomplete outputs are withheld without retry or fabricated fallback', async () => {
  for (const options of [{ raw: JSON.stringify({ answer: 'Give insulin 10 units now.' }) }, { raw: 'not JSON' }, { stopReason: 'max_tokens' }]) {
    const s = setup(options); await s.run({ question: 'Explain preload', contextMode: 'general' });
    assert.equal(s.calls, 1); assert.equal(s.res.statusCode, 422); assert.equal(s.res.body.answer, undefined);
    assert.equal(s.logs[0].display_resolution, 'no_answer');
  }
});
test('unconfigured provider and timeout return static errors without clinical logging', async () => {
  for (const options of [{ unconfigured: true }, { error: Object.assign(new Error('secret clinical text'), { code: 'provider_timeout' }) }]) {
    const s = setup(options); await s.run({ question: 'Explain preload', contextMode: 'general' });
    assert.equal(s.res.statusCode, options.unconfigured ? 503 : 504);
    assert.equal(JSON.stringify(s.logs).includes('secret clinical text'), false);
    assert.equal(s.calls, options.unconfigured ? 0 : 1);
  }
});
test('disconnect aborts the existing operation without writes or duplicate work', async () => {
  const s = setup({ disconnect: true }); await s.run({ question: 'Explain preload', contextMode: 'general' });
  assert.equal(s.calls, 1); assert.equal(s.signal.aborted, true); assert.equal(s.res.body, undefined);
  assert.equal(s.logs[0].client_disconnected, true); assert.equal(s.logs[0].timeout_layer, 'client_disconnect');
});
