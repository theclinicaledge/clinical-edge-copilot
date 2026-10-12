const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { createAiCostGuard, estimateCostUsd, dayKey, readConfig, DEFAULTS } = require('../ai-cost-guard');
const { registerAskRoutes } = require('../ask-clinical-edge');
const { positive } = require('../validation/ask/fixtures');

// The SDK's only transport is this mock; no external request is possible.
let providerCalls = 0;
process.env.ANTHROPIC_API_KEY = 'test-key';
globalThis.fetch = async () => { providerCalls++; throw new Error('provider must not be called in this test'); };
const { app, buildOperationalLogEntry } = require('../server');

const at = iso => () => new Date(iso);
const req = (ip = '203.0.113.10') => ({ ip, body: {} });

test('cost estimate uses token usage and configured rates', () => {
  const config = readConfig({});
  assert.deepEqual(config, { budgetUsd: 5, freeQuestions: 3, inputUsdPerMTok: 3, outputUsdPerMTok: 15 });
  assert.equal(estimateCostUsd({ input_tokens: 1_000_000, output_tokens: 0 }, config), 3);
  assert.equal(estimateCostUsd({ input_tokens: 0, output_tokens: 1_000_000 }, config), 15);
  assert.equal(estimateCostUsd({ input_tokens: 2000, output_tokens: 1000 }, { ...config, inputUsdPerMTok: 1, outputUsdPerMTok: 10 }), 0.012);
  assert.equal(estimateCostUsd({ cache_read_input_tokens: 1_000_000, cache_creation_input_tokens: 1_000_000 }, config), 3 * 0.1 + 3 * 1.25);
  assert.equal(estimateCostUsd(null, config), 0);
});

test('invalid or negative env values fall back to defaults; zero is honoured', () => {
  const config = readConfig({ AI_DAILY_BUDGET_USD: '-1', FREE_DAILY_QUESTIONS: '2.5', AI_INPUT_USD_PER_MTOK: 'abc', AI_OUTPUT_USD_PER_MTOK: '' });
  assert.deepEqual(config, { budgetUsd: DEFAULTS.AI_DAILY_BUDGET_USD, freeQuestions: DEFAULTS.FREE_DAILY_QUESTIONS, inputUsdPerMTok: DEFAULTS.AI_INPUT_USD_PER_MTOK, outputUsdPerMTok: DEFAULTS.AI_OUTPUT_USD_PER_MTOK });
  assert.equal(readConfig({ AI_DAILY_BUDGET_USD: '0', FREE_DAILY_QUESTIONS: '0' }).budgetUsd, 0);
  assert.equal(readConfig({ FREE_DAILY_QUESTIONS: '0' }).freeQuestions, 0);
});

test('the day rolls over at midnight Pacific, including across daylight saving', () => {
  assert.equal(dayKey(new Date('2026-10-12T06:59:59Z')), '2026-10-11'); // 23:59 PDT
  assert.equal(dayKey(new Date('2026-10-12T07:00:00Z')), '2026-10-12'); // 00:00 PDT
  assert.equal(dayKey(new Date('2026-12-01T07:59:59Z')), '2026-11-30'); // 23:59 PST
  assert.equal(dayKey(new Date('2026-12-01T08:00:00Z')), '2026-12-01'); // 00:00 PST
});

test('free daily limit: three AI questions per client, then a 429; other clients unaffected', () => {
  const logs = [];
  const guard = createAiCostGuard({ env: {}, now: at('2026-10-12T18:00:00Z'), appendOperationalLog: entry => logs.push(entry) });
  for (let i = 0; i < 3; i++) assert.equal(guard.admit(req(), 'ASK'), null);
  const denial = guard.admit(req(), 'ASK');
  assert.equal(denial.status, 429);
  assert.equal(denial.code, 'free_daily_limit_reached');
  assert.equal(denial.limit, 3);
  assert.match(denial.message, /You've used today's 3 free AI questions\. They reset at midnight Pacific\./);
  assert.doesNotMatch(denial.message, /—/);
  assert.equal(guard.admit(req('198.51.100.7'), 'ASK'), null);
  assert.deepEqual(logs, [{ timestamp: logs[0].timestamp, route: 'ASK', status: 'limited', provider_status: 'not_called', display_resolution: 'limited', failure_reason: 'free_daily_limit_reached' }]);
  assert.ok(!JSON.stringify(logs).includes('203.0.113.10'));
});

test('a request is counted once even when it makes several provider calls (repairs)', () => {
  const guard = createAiCostGuard({ env: { FREE_DAILY_QUESTIONS: '1' }, now: at('2026-10-12T18:00:00Z') });
  const request = req();
  assert.equal(guard.admit(request, 'COPILOT'), null);
  assert.equal(guard.admit(request, 'COPILOT'), null);
  assert.equal(guard.admit(req(), 'COPILOT').status, 429);
});

test('IPv6 clients are keyed by subnet like the rate limiter', () => {
  const guard = createAiCostGuard({ env: { FREE_DAILY_QUESTIONS: '1' }, now: at('2026-10-12T18:00:00Z') });
  assert.equal(guard.admit(req('2001:db8:1:1::1'), 'ASK'), null);
  assert.equal(guard.admit(req('2001:db8:1:1::2'), 'ASK').status, 429);
});

test('daily budget: once estimated spend reaches the budget every client gets a friendly 503', () => {
  const logs = [];
  const guard = createAiCostGuard({ env: { AI_DAILY_BUDGET_USD: '0.01' }, now: at('2026-10-12T18:00:00Z'), appendOperationalLog: entry => logs.push(entry) });
  assert.equal(guard.admit(req(), 'ASK'), null);
  guard.recordUsage({ input_tokens: 1000, output_tokens: 600 }); // $0.003 + $0.009 = $0.012
  const ask = guard.admit(req('198.51.100.7'), 'ASK');
  assert.equal(ask.status, 503);
  assert.equal(ask.code, 'ai_daily_budget_reached');
  assert.match(ask.message, /^Ask is resting until tomorrow\./);
  assert.match(guard.admit(req('198.51.100.8'), 'COPILOT').message, /^Shift Brain is resting until tomorrow\./);
  assert.ok(logs.every(entry => entry.failure_reason === 'ai_daily_budget_reached' && entry.provider_status === 'not_called'));
});

test('budget and free counts reset at midnight Pacific', () => {
  let now = new Date('2026-10-13T06:30:00Z'); // 23:30 PDT on Oct 12
  const guard = createAiCostGuard({ env: { AI_DAILY_BUDGET_USD: '1', FREE_DAILY_QUESTIONS: '1' }, now: () => now });
  assert.equal(guard.admit(req(), 'ASK'), null);
  guard.recordUsage({ output_tokens: 100_000 }); // $1.50
  assert.equal(guard.admit(req('198.51.100.7'), 'ASK').status, 503);
  now = new Date('2026-10-13T07:00:01Z'); // 00:00 PDT on Oct 13
  assert.deepEqual(guard.snapshot(), { day: '2026-10-13', spentUsd: 0, clients: 0 });
  assert.equal(guard.admit(req(), 'ASK'), null);
});

test('metered client records usage from create and from streams, including partial and null deltas', async () => {
  const guard = createAiCostGuard({ env: {}, now: at('2026-10-12T18:00:00Z') });
  const fake = {
    other: 'kept',
    messages: {
      create: async () => ({ content: [], usage: { input_tokens: 1000, output_tokens: 100 } }),
      stream: () => (async function* events() {
        yield { type: 'message_start', message: { usage: { input_tokens: 2000, output_tokens: 1 } } };
        yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'hi' } };
        yield { type: 'message_delta', usage: { input_tokens: null, output_tokens: 200 } };
        yield { type: 'message_stop' };
      })(),
    },
  };
  const metered = guard.meter(fake);
  assert.equal(metered.other, 'kept');
  await metered.messages.create({});
  for await (const event of metered.messages.stream({})) assert.ok(event.type);
  // create: 1000*3 + 100*15 = 4500; stream: 2000*3 + 200*15 = 9000 (per million)
  assert.equal(Math.round(guard.snapshot().spentUsd * 1e6), 13500);
  for await (const event of metered.messages.stream({})) { if (event.type === 'message_start') break; }
  assert.equal(Math.round(guard.snapshot().spentUsd * 1e6), 13500 + 2000 * 3 + 1 * 15);
  assert.equal(guard.meter(null), null);
});

// ── Route wiring ─────────────────────────────────────────────────────────────

function mockRes() {
  const res = new EventEmitter();
  res.statusCode = 200;
  res.status = code => { res.statusCode = code; return res; };
  res.json = value => { res.body = value; res.emit('finish'); return res; };
  res.setHeader = () => {};
  res.write = chunk => { res.text = (res.text || '') + chunk; return true; };
  res.end = chunk => { if (chunk) res.write(chunk); res.emit('finish'); return res; };
  return res;
}

async function withEnv(values, fn) {
  const previous = Object.fromEntries(Object.keys(values).map(key => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  try { return await fn(); }
  finally { for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } }
}

// Runs a registered route without its rate limiter: containment gate (if any), then the handler.
async function callRoute(path, body) {
  const layers = app.router.stack.find(layer => layer.route?.path === path).route.stack.slice(1);
  const request = { ip: '192.0.2.44', body, socket: {} };
  const res = mockRes();
  for (const layer of layers) {
    let advanced = false;
    await layer.handle(request, res, () => { advanced = true; });
    if (!advanced) break;
  }
  return res;
}

const copilotBody = { question: 'Fictional practice scenario: HR 118, BP 92/58, RR 24. What should I assess?', mode: 'quick' };
const sbarBody = { question: 'Fictional practice scenario: HR 118, BP 92/58.', copilotResponse: 'Urgency Level: MODERATE\n\nSummary.' };

for (const [path, body, json] of [['/api/copilot', copilotBody, true], ['/api/sbar', sbarBody, true], ['/api/ask', { question: positive[1].question, contextMode: 'general' }, false]]) {
  test(`${path} returns the free-limit 429 and the budget 503 without calling Anthropic`, async () => {
    providerCalls = 0;
    const logs = [], original = console.log;
    console.log = (...args) => logs.push(args);
    try {
      await withEnv({ ASK_SAFETY_CONTAINMENT: undefined, FREE_DAILY_QUESTIONS: '0', AI_DAILY_BUDGET_USD: undefined }, async () => {
        const res = await callRoute(path, body);
        assert.equal(res.statusCode, 429);
        const code = json ? res.body.code : res.body.error.code;
        const message = json ? res.body.message : res.body.error.message;
        assert.equal(code, 'free_daily_limit_reached');
        assert.match(message, /free AI questions\. They reset at midnight Pacific\./);
      });
      await withEnv({ ASK_SAFETY_CONTAINMENT: undefined, AI_DAILY_BUDGET_USD: '0' }, async () => {
        const res = await callRoute(path, body);
        assert.equal(res.statusCode, 503);
        assert.equal(json ? res.body.code : res.body.error.code, 'ai_daily_budget_reached');
        assert.match(json ? res.body.message : res.body.error.message, /is resting until tomorrow\./);
      });
    } finally { console.log = original; }
    assert.equal(providerCalls, 0);
    const operational = logs.filter(args => args[0] === '[OPERATIONAL]').map(args => JSON.parse(args[1]));
    assert.ok(operational.some(entry => entry.status === 'limited' && entry.failure_reason === 'free_daily_limit_reached'));
    assert.ok(operational.some(entry => entry.status === 'limited' && entry.failure_reason === 'ai_daily_budget_reached'));
    assert.ok(!JSON.stringify(logs).includes(body.question));
    assert.ok(!JSON.stringify(logs).includes('192.0.2.44'));
  });
}

test('containment behaviour is unchanged when limits are exhausted', async () => {
  await withEnv({ ASK_SAFETY_CONTAINMENT: 'true', FREE_DAILY_QUESTIONS: '0', AI_DAILY_BUDGET_USD: '0' }, async () => {
    for (const [path, body] of [['/api/copilot', copilotBody], ['/api/sbar', sbarBody]]) {
      const res = await callRoute(path, body);
      assert.equal(res.statusCode, 503);
      assert.equal(res.body.code, 'clinical_generation_restricted');
    }
    const ask = await callRoute('/api/ask', { question: 'Explain how insulin works.', contextMode: 'general' });
    assert.equal(ask.statusCode, 503);
    assert.equal(ask.body.error.code, 'ask_temporarily_restricted');
    const abg = await callRoute('/api/ask', { question: 'Arterial ABG: pH 7.22, PaCO2 30 mmHg, HCO3 12 mmol/L. What does it mean?', contextMode: 'general' });
    assert.equal(abg.statusCode, 200);
    assert.ok(abg.body.abg);
    const reassessment = await callRoute('/api/copilot', { question: 'PATIENT SNAPSHOT — USER-REPORTED / OBSERVED INFORMATION\nBP: 85/55', mode: 'quick', reassessmentRequest: true });
    assert.equal(reassessment.statusCode, 200);
    assert.match(reassessment.text, /"resolution":"deterministic"/);
  });
  assert.equal(providerCalls, 0);
});

test('deterministic Ask answers do not use up free questions', async () => {
  const guardLogs = [];
  const guard = createAiCostGuard({ env: { FREE_DAILY_QUESTIONS: '1' }, now: at('2026-10-12T18:00:00Z'), appendOperationalLog: entry => guardLogs.push(entry) });
  let handler, streams = 0;
  const client = { messages: { stream: () => { streams++; return (async function* events() {
    yield { type: 'message_start', message: { usage: { input_tokens: 10 } } };
    yield { type: 'message_delta', delta: { stop_reason: 'end_turn' }, usage: { output_tokens: 5 } };
  })(); } } };
  registerAskRoutes({ post(path, limiter, fn) { handler = fn; } }, {
    apiLimiter() {}, containsPHI: () => false, getClient: () => client, admitAI: request => guard.admit(request, 'ASK'),
    appendOperationalLog: () => {}, classifyProviderError: () => ({ code: 'provider_error' }),
    runWithStageTimeout: work => work(new AbortController().signal),
    collectPriorityMapStream: async stream => { let stopReason = null; for await (const event of stream) stopReason = event.delta?.stop_reason || stopReason; return { text: '{}', stopReason }; },
  });
  await withEnv({ ASK_SAFETY_CONTAINMENT: undefined }, async () => {
    const ask = async question => { const res = mockRes(); await handler({ ip: '192.0.2.9', body: { question, contextMode: 'general' } }, res); return res; };
    for (let i = 0; i < 3; i++) assert.equal((await ask('Arterial ABG: pH 7.22, PaCO2 30 mmHg, HCO3 12 mmol/L. What does it mean?')).statusCode, 200);
    assert.equal(streams, 0);
    assert.notEqual((await ask(positive[1].question)).statusCode, 429);
    assert.equal(streams, 1);
    const limited = await ask(positive[1].question);
    assert.equal(limited.statusCode, 429);
    assert.equal(limited.body.error.code, 'free_daily_limit_reached');
    assert.equal(streams, 1);
  });
  assert.equal(guardLogs.length, 1);
});

test('denial log entries survive the operational log allow-list as metadata only', () => {
  const entry = buildOperationalLogEntry({ timestamp: '2026-10-12T18:00:00.000Z', route: 'ASK', status: 'limited', provider_status: 'not_called', display_resolution: 'limited', failure_reason: 'free_daily_limit_reached' });
  assert.equal(entry.status, 'limited');
  assert.equal(entry.failure_reason, 'free_daily_limit_reached');
  assert.equal(entry.provider_status, 'not_called');
});

test('metering works on the real SDK MessageStream and create (mocked transport)', async () => {
  const Anthropic = require('@anthropic-ai/sdk');
  const message = { id: 'mock', type: 'message', role: 'assistant', content: [{ type: 'text', text: '{}' }], model: 'claude-sonnet-4-6', stop_reason: 'end_turn', stop_sequence: null, usage: { input_tokens: 1000, output_tokens: 100 } };
  const sse = [
    { type: 'message_start', message: { ...message, content: [], stop_reason: null, usage: { input_tokens: 2000, output_tokens: 1 } } },
    { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
    { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: '{}' } },
    { type: 'content_block_stop', index: 0 },
    { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 200 } },
    { type: 'message_stop' },
  ];
  const fetch = async (_url, options) => JSON.parse(options.body).stream
    ? new Response(sse.map(e => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join(''), { headers: { 'content-type': 'text/event-stream' } })
    : new Response(JSON.stringify(message), { headers: { 'content-type': 'application/json' } });
  const guard = createAiCostGuard({ env: {}, now: at('2026-10-12T18:00:00Z') });
  const client = guard.meter(new Anthropic({ apiKey: 'test-key', fetch, maxRetries: 0 }));
  const params = { model: 'claude-sonnet-4-6', max_tokens: 10, messages: [{ role: 'user', content: 'synthetic' }] };
  await client.messages.create(params);
  let text = '';
  for await (const event of client.messages.stream(params)) if (event.type === 'content_block_delta') text += event.delta.text;
  assert.equal(text, '{}');
  assert.equal(Math.round(guard.snapshot().spentUsd * 1e6), (1000 * 3 + 100 * 15) + (2000 * 3 + 200 * 15));
});
