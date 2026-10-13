const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { createAiCostGuard, estimateCostUsd, dayKey, readConfig, deviceIdFrom, DEFAULTS } = require('../ai-cost-guard');
const { registerAskRoutes } = require('../ask-clinical-edge');
const { positive } = require('../validation/ask/fixtures');

// The SDK's only transport is this mock; no external request is possible.
let providerCalls = 0;
let providerReply = null; // null: transport failure; otherwise SSE text of a completed reply
process.env.ANTHROPIC_API_KEY = 'test-key';
globalThis.fetch = async (_url, options) => {
  providerCalls++;
  if (!providerReply) throw new Error('mock transport: provider unavailable');
  const text = typeof providerReply === 'function' ? providerReply(JSON.parse(options.body)) : providerReply;
  return new Response(text, { headers: { 'content-type': 'text/event-stream' } });
};
const { app, buildOperationalLogEntry } = require('../server');

const DEVICE_A = '3f1c2b4a-8d6e-4f7a-9b2c-1d3e5f7a9b0c';
const DEVICE_B = '7a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d';
const at = iso => () => new Date(iso);
const req = ({ ip = '203.0.113.10', device } = {}) => ({ ip, body: {}, headers: device ? { 'x-ce-device': device } : {} });

test('cost estimate uses token usage and configured rates', () => {
  const config = readConfig({});
  assert.deepEqual(config, { budgetUsd: 5, freeQuestions: 3, freeQuestionsPerIp: 50, inputUsdPerMTok: 3, outputUsdPerMTok: 15 });
  assert.equal(estimateCostUsd({ input_tokens: 1_000_000, output_tokens: 0 }, config), 3);
  assert.equal(estimateCostUsd({ input_tokens: 0, output_tokens: 1_000_000 }, config), 15);
  assert.equal(estimateCostUsd({ input_tokens: 2000, output_tokens: 1000 }, { ...config, inputUsdPerMTok: 1, outputUsdPerMTok: 10 }), 0.012);
  assert.equal(estimateCostUsd({ cache_read_input_tokens: 1_000_000, cache_creation_input_tokens: 1_000_000 }, config), 3 * 0.1 + 3 * 1.25);
  assert.equal(estimateCostUsd(null, config), 0);
});

test('Opus usage cannot be underpriced by the existing Sonnet configuration', async () => {
  const config = readConfig({});
  assert.equal(estimateCostUsd({ input_tokens: 1_000_000, output_tokens: 1_000_000 }, config, 'claude-opus-5-5'), 24);
  assert.equal(estimateCostUsd({ input_tokens: 1_000_000, output_tokens: 1_000_000 }, { ...config, inputUsdPerMTok: 5, outputUsdPerMTok: 25 }, 'claude-opus-5-5'), 30);
  const guard = createAiCostGuard({ env: { AI_DAILY_BUDGET_USD: '0.02' } });
  const usage = { input_tokens: 1000, output_tokens: 1000 };
  const client = guard.meter({ messages: {
    create: async () => ({ usage }),
    stream: () => ({ async *[Symbol.asyncIterator]() {
      yield { type: 'message_start', message: { usage: { input_tokens: 1000 } } };
      yield { type: 'message_delta', usage: { output_tokens: 1000 } };
      throw Error('synthetic partial stream');
    } }),
  } });
  await client.messages.create({ model: 'claude-opus-5-5' });
  assert.equal(guard.snapshot().spentUsd, 0.024);
  assert.equal(guard.admit(req(), 'ASK').code, 'ai_daily_budget_reached');
  await assert.rejects(async () => { for await (const _event of client.messages.stream({ model: 'claude-opus-5-5' })) {} }, /synthetic partial stream/);
  assert.equal(guard.snapshot().spentUsd, 0.048);
});

test('invalid or negative env values fall back to defaults; zero is honoured', () => {
  const config = readConfig({ AI_DAILY_BUDGET_USD: '-1', FREE_DAILY_QUESTIONS: '2.5', FREE_DAILY_QUESTIONS_PER_IP: 'x', AI_INPUT_USD_PER_MTOK: 'abc', AI_OUTPUT_USD_PER_MTOK: '' });
  assert.deepEqual(config, { budgetUsd: DEFAULTS.AI_DAILY_BUDGET_USD, freeQuestions: DEFAULTS.FREE_DAILY_QUESTIONS, freeQuestionsPerIp: DEFAULTS.FREE_DAILY_QUESTIONS_PER_IP, inputUsdPerMTok: DEFAULTS.AI_INPUT_USD_PER_MTOK, outputUsdPerMTok: DEFAULTS.AI_OUTPUT_USD_PER_MTOK });
  assert.equal(readConfig({ AI_DAILY_BUDGET_USD: '0' }).budgetUsd, 0);
  assert.equal(readConfig({ FREE_DAILY_QUESTIONS: '0' }).freeQuestions, 0);
  assert.equal(readConfig({ FREE_DAILY_QUESTIONS_PER_IP: '0' }).freeQuestionsPerIp, 0);
});

test('the day rolls over at midnight Pacific, including across daylight saving', () => {
  assert.equal(dayKey(new Date('2026-10-12T06:59:59Z')), '2026-10-11'); // 23:59 PDT
  assert.equal(dayKey(new Date('2026-10-12T07:00:00Z')), '2026-10-12'); // 00:00 PDT
  assert.equal(dayKey(new Date('2026-12-01T07:59:59Z')), '2026-11-30'); // 23:59 PST
  assert.equal(dayKey(new Date('2026-12-01T08:00:00Z')), '2026-12-01'); // 00:00 PST
});

test('only a well-formed UUID v4 header is accepted as a device ID', () => {
  assert.equal(deviceIdFrom(req({ device: DEVICE_A.toUpperCase() })), DEVICE_A);
  for (const bad of ['', 'not-a-uuid', '3f1c2b4a-8d6e-1f7a-9b2c-1d3e5f7a9b0c', `${DEVICE_A}x`]) assert.equal(deviceIdFrom(req({ device: bad })), null);
  assert.equal(deviceIdFrom({ headers: { 'x-ce-device': [DEVICE_A] } }), null);
  assert.equal(deviceIdFrom({}), null);
});

test('free limit: three new questions per device, then a 429; other devices on the same IP unaffected', () => {
  const logs = [];
  const guard = createAiCostGuard({ env: {}, now: at('2026-10-12T18:00:00Z'), appendOperationalLog: entry => logs.push(entry) });
  for (let i = 0; i < 3; i++) assert.equal(guard.admit(req({ device: DEVICE_A }), 'ASK'), null);
  const denial = guard.admit(req({ device: DEVICE_A }), 'ASK');
  assert.equal(denial.status, 429);
  assert.equal(denial.code, 'free_daily_limit_reached');
  assert.equal(denial.limit, 3);
  assert.match(denial.message, /You've used today's 3 free AI questions\. They reset at midnight Pacific\./);
  assert.doesNotMatch(denial.message, /—/);
  assert.equal(guard.admit(req({ device: DEVICE_B }), 'ASK'), null);
  assert.equal(guard.admit(req({ device: DEVICE_A, ip: '198.51.100.7' }), 'ASK').status, 429);
  assert.deepEqual(logs, [{ timestamp: logs[0].timestamp, route: 'ASK', status: 'limited', provider_status: 'not_called', display_resolution: 'limited', failure_reason: 'free_daily_limit_reached' },
    { timestamp: logs[1].timestamp, route: 'ASK', status: 'limited', provider_status: 'not_called', display_resolution: 'limited', failure_reason: 'free_daily_limit_reached' }]);
  for (const secret of [DEVICE_A, DEVICE_B, '203.0.113.10', '198.51.100.7']) assert.ok(!JSON.stringify(logs).includes(secret));
});

test('per-IP backstop applies across devices, and requests without a device ID use only the IP limit', () => {
  const guard = createAiCostGuard({ env: { FREE_DAILY_QUESTIONS_PER_IP: '4' }, now: at('2026-10-12T18:00:00Z') });
  for (let i = 0; i < 3; i++) assert.equal(guard.admit(req({ device: DEVICE_A }), 'ASK'), null);
  assert.equal(guard.admit(req(), 'ASK'), null); // no device ID: IP count 4 of 4
  const network = guard.admit(req({ device: DEVICE_B }), 'ASK');
  assert.equal(network.status, 429);
  assert.equal(network.limit, 4);
  assert.match(network.message, /^Today's free AI questions for this network are used up\./);
  assert.equal(guard.admit(req({ ip: '198.51.100.7' }), 'ASK'), null);
  assert.equal(guard.admit(req({ ip: '198.51.100.7', device: 'invalid' }), 'ASK'), null); // invalid header = no device ID
});

test('IPv6 clients without a device ID are keyed by subnet like the rate limiter', () => {
  const guard = createAiCostGuard({ env: { FREE_DAILY_QUESTIONS_PER_IP: '1' }, now: at('2026-10-12T18:00:00Z') });
  assert.equal(guard.admit(req({ ip: '2001:db8:1:1::1' }), 'ASK'), null);
  assert.equal(guard.admit(req({ ip: '2001:db8:1:1::2' }), 'ASK').status, 429);
});

test('a new question is counted once even when it makes several provider calls (repairs)', () => {
  const guard = createAiCostGuard({ env: { FREE_DAILY_QUESTIONS: '1' }, now: at('2026-10-12T18:00:00Z') });
  const request = req({ device: DEVICE_A });
  assert.equal(guard.admit(request, 'COPILOT'), null);
  assert.equal(guard.admit(request, 'COPILOT'), null);
  assert.equal(guard.admit(req({ device: DEVICE_A }), 'COPILOT').status, 429);
});

test('non-counting AI work is never limited or counted by the free limit, only by the budget', () => {
  const guard = createAiCostGuard({ env: { FREE_DAILY_QUESTIONS: '1', FREE_DAILY_QUESTIONS_PER_IP: '1', AI_DAILY_BUDGET_USD: '1' }, now: at('2026-10-12T18:00:00Z') });
  for (let i = 0; i < 5; i++) assert.equal(guard.admit(req({ device: DEVICE_A }), 'SBAR', { counts: false }), null);
  assert.deepEqual([guard.snapshot().devices, guard.snapshot().ips], [0, 0]);
  assert.equal(guard.admit(req({ device: DEVICE_A }), 'COPILOT'), null);
  assert.equal(guard.admit(req({ device: DEVICE_A }), 'COPILOT').status, 429);
  assert.equal(guard.admit(req({ device: DEVICE_A }), 'TEACH_ME', { counts: false }), null);
  guard.recordUsage({ output_tokens: 100_000 }); // $1.50
  assert.equal(guard.admit(req({ device: DEVICE_A }), 'TEACH_ME', { counts: false }).status, 503);
});

test('daily budget: once estimated spend reaches the budget every client gets a friendly 503', () => {
  const logs = [];
  const guard = createAiCostGuard({ env: { AI_DAILY_BUDGET_USD: '0.01' }, now: at('2026-10-12T18:00:00Z'), appendOperationalLog: entry => logs.push(entry) });
  assert.equal(guard.admit(req({ device: DEVICE_A }), 'ASK'), null);
  guard.recordUsage({ input_tokens: 1000, output_tokens: 600 }); // $0.003 + $0.009 = $0.012
  const ask = guard.admit(req({ device: DEVICE_B }), 'ASK');
  assert.equal(ask.status, 503);
  assert.equal(ask.code, 'ai_daily_budget_reached');
  assert.match(ask.message, /^Ask is resting until tomorrow\./);
  assert.match(guard.admit(req({ device: DEVICE_B }), 'COPILOT').message, /^Shift Brain is resting until tomorrow\./);
  assert.ok(logs.every(entry => entry.failure_reason === 'ai_daily_budget_reached' && entry.provider_status === 'not_called'));
});

test('budget and free counts reset at midnight Pacific and no IDs outlive the day', () => {
  let now = new Date('2026-10-13T06:30:00Z'); // 23:30 PDT on Oct 12
  const guard = createAiCostGuard({ env: { AI_DAILY_BUDGET_USD: '1', FREE_DAILY_QUESTIONS: '1' }, now: () => now });
  assert.equal(guard.admit(req({ device: DEVICE_A }), 'ASK'), null);
  assert.equal(guard.admit(req({ device: DEVICE_A }), 'ASK').status, 429);
  guard.recordUsage({ output_tokens: 100_000 }); // $1.50
  assert.equal(guard.admit(req({ device: DEVICE_B }), 'ASK').status, 503);
  now = new Date('2026-10-13T07:00:01Z'); // 00:00 PDT on Oct 13
  assert.deepEqual(guard.snapshot(), { day: '2026-10-13', spentUsd: 0, devices: 0, ips: 0 });
  assert.equal(guard.admit(req({ device: DEVICE_A }), 'ASK'), null);
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
async function callRoute(path, body, { device = DEVICE_A, ip = '192.0.2.44' } = {}) {
  const layers = app.router.stack.find(layer => layer.route?.path === path).route.stack.slice(1);
  const res = mockRes();
  const request = { ip, body, socket: {}, headers: device ? { 'x-ce-device': device } : {}, res };
  for (const layer of layers) {
    let advanced = false;
    await layer.handle(request, res, () => { advanced = true; });
    if (!advanced) break;
  }
  return res;
}

async function captureLogs(fn) {
  const logs = [], original = console.log, warn = console.warn, error = console.error;
  console.log = (...args) => logs.push(args);
  console.warn = (...args) => logs.push(args);
  console.error = (...args) => logs.push(args);
  try { await fn(); } finally { console.log = original; console.warn = warn; console.error = error; }
  return logs;
}

const errorOf = res => (typeof res.body?.error === 'object' ? res.body.error : res.body);
const ABG = 'Arterial ABG: pH 7.22, PaCO2 30 mmHg, HCO3 12 mmol/L. What does it mean?';
const copilotBody = { question: 'Fictional practice scenario: HR 118, BP 92/58, RR 24. What should I assess?', mode: 'quick' };
const countingRoutes = [
  ['new Priority Map', '/api/copilot', copilotBody],
  ['new Ask question', '/api/ask', { question: positive[1].question, contextMode: 'general' }],
];
const nonCountingRoutes = [
  ['Teach Me', '/api/copilot', { ...copilotBody, learningRequest: true, priorityMapResponse: 'Urgency Level: MODERATE\n\nSynthetic map.' }],
  ['follow-up', '/api/copilot', { ...copilotBody, isFollowUp: true }],
  ['SBAR', '/api/sbar', { question: copilotBody.question, copilotResponse: 'Urgency Level: MODERATE\n\nSummary.' }],
  ['ABG explanation', '/api/ask', { question: ABG, contextMode: 'general', abgExplanation: true }],
];

for (const [name, path, body] of countingRoutes) {
  test(`${name} (${path}) returns the device 429, the network 429 and the budget 503 without calling Anthropic`, async () => {
    providerCalls = 0;
    const logs = await captureLogs(async () => {
      await withEnv({ ASK_SAFETY_CONTAINMENT: undefined, FREE_DAILY_QUESTIONS: '0', FREE_DAILY_QUESTIONS_PER_IP: undefined, AI_DAILY_BUDGET_USD: undefined }, async () => {
        const res = await callRoute(path, body);
        assert.equal(res.statusCode, 429);
        assert.equal(errorOf(res).code, 'free_daily_limit_reached');
        assert.match(errorOf(res).message, /free AI questions\. They reset at midnight Pacific\./);
      });
      await withEnv({ ASK_SAFETY_CONTAINMENT: undefined, FREE_DAILY_QUESTIONS: undefined, FREE_DAILY_QUESTIONS_PER_IP: '0' }, async () => {
        const res = await callRoute(path, body, { device: null });
        assert.equal(res.statusCode, 429);
        assert.match(errorOf(res).message, /for this network are used up/);
      });
      await withEnv({ ASK_SAFETY_CONTAINMENT: undefined, AI_DAILY_BUDGET_USD: '0' }, async () => {
        const res = await callRoute(path, body);
        assert.equal(res.statusCode, 503);
        assert.equal(errorOf(res).code, 'ai_daily_budget_reached');
        assert.match(errorOf(res).message, /is resting until tomorrow\./);
      });
    });
    assert.equal(providerCalls, 0);
    const operational = logs.filter(args => args[0] === '[OPERATIONAL]').map(args => JSON.parse(args[1]));
    assert.ok(operational.some(entry => entry.status === 'limited' && entry.failure_reason === 'free_daily_limit_reached'));
    assert.ok(operational.some(entry => entry.status === 'limited' && entry.failure_reason === 'ai_daily_budget_reached'));
    for (const secret of [body.question, DEVICE_A, '192.0.2.44']) assert.ok(!JSON.stringify(logs).includes(secret));
  });
}

for (const [name, path, body] of nonCountingRoutes) {
  test(`${name} (${path}) is not blocked by exhausted free limits but still respects the budget`, async () => {
    providerCalls = 0;
    const logs = await captureLogs(async () => {
      await withEnv({ ASK_SAFETY_CONTAINMENT: undefined, FREE_DAILY_QUESTIONS: '0', FREE_DAILY_QUESTIONS_PER_IP: '0', AI_DAILY_BUDGET_USD: undefined }, async () => {
        const res = await callRoute(path, body);
        assert.notEqual(res.statusCode, 429);
        assert.notEqual(errorOf(res)?.code, 'free_daily_limit_reached');
      });
      assert.ok(providerCalls > 0, 'the provider path was reached');
      const before = providerCalls;
      await withEnv({ ASK_SAFETY_CONTAINMENT: undefined, AI_DAILY_BUDGET_USD: '0' }, async () => {
        const res = await callRoute(path, body);
        assert.equal(res.statusCode, 503);
        assert.equal(errorOf(res).code, 'ai_daily_budget_reached');
      });
      assert.equal(providerCalls, before);
    });
    assert.ok(!JSON.stringify(logs).includes(DEVICE_A));
  });
}

test('containment behaviour is unchanged when limits are exhausted', async () => {
  providerCalls = 0;
  await withEnv({ ASK_SAFETY_CONTAINMENT: 'true', FREE_DAILY_QUESTIONS: '0', FREE_DAILY_QUESTIONS_PER_IP: '0', AI_DAILY_BUDGET_USD: '0' }, async () => {
    for (const [path, body] of [['/api/copilot', copilotBody], ['/api/sbar', nonCountingRoutes[2][2]]]) {
      const res = await callRoute(path, body);
      assert.equal(res.statusCode, 503);
      assert.equal(res.body.code, 'clinical_generation_restricted');
    }
    const ask = await callRoute('/api/ask', { question: 'Explain how insulin works.', contextMode: 'general' });
    assert.equal(ask.statusCode, 503);
    assert.equal(ask.body.error.code, 'ask_temporarily_restricted');
    const abg = await callRoute('/api/ask', { question: ABG, contextMode: 'general' });
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
    apiLimiter() {}, containsPHI: () => false, getClient: () => client, admitAI: (request, options) => guard.admit(request, 'ASK', options),
    appendOperationalLog: () => {}, classifyProviderError: () => ({ code: 'provider_error' }),
    runWithStageTimeout: work => work(new AbortController().signal),
    collectPriorityMapStream: async stream => { let stopReason = null; for await (const event of stream) stopReason = event.delta?.stop_reason || stopReason; return { text: '{}', stopReason }; },
  });
  await withEnv({ ASK_SAFETY_CONTAINMENT: undefined }, async () => {
    const ask = async question => { const res = mockRes(); await handler({ ip: '192.0.2.9', headers: { 'x-ce-device': DEVICE_B }, body: { question, contextMode: 'general' } }, res); return res; };
    for (let i = 0; i < 3; i++) assert.equal((await ask(ABG)).statusCode, 200);
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

// ── Brief additions: IP backstop default, invalid header fallback, refunds ──

test('per-IP backstop defaults to 50 counted requests a day across devices', () => {
  const guard = createAiCostGuard({ env: {}, now: at('2026-10-12T18:00:00Z') });
  const device = i => `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`;
  for (let i = 0; i < 50; i++) assert.equal(guard.admit(req({ device: device(i) }), 'ASK'), null);
  const denial = guard.admit(req({ device: device(50) }), 'ASK');
  assert.equal(denial.status, 429);
  assert.equal(denial.limit, 50);
  assert.equal(guard.admit(req({ ip: '198.51.100.7', device: device(51) }), 'ASK'), null);
});

test('a missing or invalid device header falls back to per-IP counting', () => {
  const guard = createAiCostGuard({ env: { FREE_DAILY_QUESTIONS: '1', FREE_DAILY_QUESTIONS_PER_IP: '2' }, now: at('2026-10-12T18:00:00Z') });
  assert.equal(guard.admit(req({ device: 'not-a-uuid' }), 'ASK'), null); // device limit (1) not applied
  assert.equal(guard.admit(req({ device: '12345' }), 'ASK'), null);
  assert.equal(guard.admit(req({ device: 'not-a-uuid' }), 'ASK').status, 429); // IP count 2 of 2
  assert.equal(guard.snapshot().devices, 0);
  assert.equal(guard.admit(req({ ip: '198.51.100.7' }), 'ASK'), null);
});

test('release gives back a counted question once, and ignores uncounted or stale requests', () => {
  let now = new Date('2026-10-12T18:00:00Z');
  const guard = createAiCostGuard({ env: { FREE_DAILY_QUESTIONS: '1' }, now: () => now });
  const failed = req({ device: DEVICE_A });
  assert.equal(guard.admit(failed, 'ASK'), null);
  guard.release(failed);
  guard.release(failed);
  assert.deepEqual([guard.snapshot().devices, guard.snapshot().ips], [0, 0]);
  const ok = req({ device: DEVICE_A });
  assert.equal(guard.admit(ok, 'ASK'), null);
  assert.equal(guard.admit(req({ device: DEVICE_A }), 'ASK').status, 429);
  const uncounted = req({ device: DEVICE_A });
  guard.admit(uncounted, 'SBAR', { counts: false });
  guard.release(uncounted);
  guard.release(req({ device: DEVICE_A }));
  assert.equal(guard.admit(req({ device: DEVICE_A }), 'ASK').status, 429);
  now = new Date('2026-10-13T18:00:00Z');
  guard.release(ok); // counted yesterday: today's counts are untouched
  assert.equal(guard.admit(req({ device: DEVICE_A }), 'ASK'), null);
  assert.equal(guard.admit(req({ device: DEVICE_A }), 'ASK').status, 429);
});

const sse = text => [
  { type: 'message_start', message: { id: 'mock', type: 'message', role: 'assistant', content: [], model: 'claude-sonnet-4-6', stop_reason: null, stop_sequence: null, usage: { input_tokens: 10, output_tokens: 1 } } },
  { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
  { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text } },
  { type: 'content_block_stop', index: 0 },
  { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 5 } },
  { type: 'message_stop' },
].map(e => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join('');

for (const [name, path, body, reply, expectedStatus] of [
  ['Ask server error (retry)', '/api/ask', { question: positive[1].question, contextMode: 'general' }, null, 502],
  ['Ask safety refusal', '/api/ask', { question: positive[1].question, contextMode: 'general' }, sse('{"answer":"","details":[]}'), 422],
  ['Priority Map server error (retry)', '/api/copilot', copilotBody, null, 200],
]) {
  test(`${name} does not use up a free question`, async () => {
    providerReply = reply;
    try {
      await captureLogs(() => withEnv({ ASK_SAFETY_CONTAINMENT: undefined, FREE_DAILY_QUESTIONS: '1', FREE_DAILY_QUESTIONS_PER_IP: undefined, AI_DAILY_BUDGET_USD: undefined }, async () => {
        const device = '5b6c7d8e-9f0a-4b1c-8d2e-3f4a5b6c7d8e';
        for (let attempt = 0; attempt < 3; attempt++) {
          const res = await callRoute(path, body, { device, ip: '192.0.2.77' });
          assert.equal(res.statusCode, expectedStatus, `attempt ${attempt + 1}`);
          assert.notEqual(errorOf(res)?.code, 'free_daily_limit_reached');
        }
      }));
    } finally { providerReply = null; }
  });
}

test('release with keepIp refunds the device count but not the IP count', () => {
  const guard = createAiCostGuard({ env: { FREE_DAILY_QUESTIONS: '1', FREE_DAILY_QUESTIONS_PER_IP: '2' }, now: at('2026-10-12T18:00:00Z') });
  for (let i = 0; i < 2; i++) {
    const refused = req({ device: DEVICE_A });
    assert.equal(guard.admit(refused, 'ASK'), null);
    guard.release(refused, { keepIp: true });
  }
  assert.deepEqual([guard.snapshot().devices, guard.snapshot().ips], [0, 1]);
  const network = guard.admit(req({ device: DEVICE_A }), 'ASK');
  assert.equal(network.status, 429);
  assert.match(network.message, /for this network are used up/);
});

test('repeated safety refusals (422) from one IP never use up the device but hit the 50/day IP backstop', async () => {
  providerReply = sse('{"answer":"","details":[]}');
  try {
    await captureLogs(() => withEnv({ ASK_SAFETY_CONTAINMENT: undefined, FREE_DAILY_QUESTIONS: '1', FREE_DAILY_QUESTIONS_PER_IP: undefined, AI_DAILY_BUDGET_USD: undefined }, async () => {
      const device = '8e9f0a1b-2c3d-4e5f-8a6b-7c8d9e0f1a2b';
      const body = { question: positive[1].question, contextMode: 'general' };
      for (let attempt = 1; attempt <= 50; attempt++) {
        const res = await callRoute('/api/ask', body, { device, ip: '192.0.2.90' });
        assert.equal(res.statusCode, 422, `attempt ${attempt}`);
      }
      const blocked = await callRoute('/api/ask', body, { device, ip: '192.0.2.90' });
      assert.equal(blocked.statusCode, 429);
      assert.equal(blocked.body.error.code, 'free_daily_limit_reached');
      assert.match(blocked.body.error.message, /for this network are used up/);
      providerReply = null; // server errors are refunded on both counters, so they never fill the IP backstop
      for (let attempt = 1; attempt <= 3; attempt++) assert.equal((await callRoute('/api/ask', body, { device, ip: '192.0.2.91' })).statusCode, 502);
      assert.equal((await callRoute('/api/ask', body, { device, ip: '192.0.2.91' })).statusCode, 502);
    }));
  } finally { providerReply = null; }
});

test('a new Priority Map that fails the safety check refunds the device but keeps the IP count; provider failure refunds both', async () => {
  const snapshotMap = { question: 'PATIENT SNAPSHOT — USER-REPORTED / OBSERVED INFORMATION\nBP: 84/50 (earlier 118/72)\nHR: 122\nRR: 26', mode: 'quick' };
  const device = '9f0a1b2c-3d4e-4f5a-8b6c-7d8e9f0a1b2c';
  const env = { ASK_SAFETY_CONTAINMENT: undefined, FREE_DAILY_QUESTIONS: '1', FREE_DAILY_QUESTIONS_PER_IP: '2', AI_DAILY_BUDGET_USD: undefined };
  try {
    await captureLogs(() => withEnv(env, async () => {
      // Anthropic answers, but the output (and its repair) fail validation: deterministic fallback.
      providerReply = sse('not a valid priority map');
      for (let attempt = 1; attempt <= 2; attempt++) {
        providerCalls = 0;
        const res = await callRoute('/api/copilot', snapshotMap, { device, ip: '192.0.2.95' });
        assert.equal(res.statusCode, 200, `attempt ${attempt}`);
        assert.ok(providerCalls >= 1, 'Anthropic was called');
        assert.match(res.text, /"priorityMapResolution":"fallback"/);
      }
      const blocked = await callRoute('/api/copilot', snapshotMap, { device, ip: '192.0.2.95' });
      assert.equal(blocked.statusCode, 429);
      assert.match(blocked.body.message, /for this network are used up/);

      // Anthropic never answers: fallback refunds both counters, so retries never hit either limit.
      providerReply = null;
      for (let attempt = 1; attempt <= 4; attempt++) {
        const res = await callRoute('/api/copilot', snapshotMap, { device, ip: '192.0.2.96' });
        assert.equal(res.statusCode, 200, `provider failure attempt ${attempt}`);
        assert.match(res.text, /"priorityMapResolution":"fallback"/);
      }
    }));
  } finally { providerReply = null; }
});

test('a successful new question still counts', async () => {
  providerReply = payload => sse(JSON.stringify({ answer: positive[1].answer, details: [], source_ids: payload.output_config.format.schema.properties.source_ids.items.enum }));
  try {
    await captureLogs(() => withEnv({ ASK_SAFETY_CONTAINMENT: undefined, FREE_DAILY_QUESTIONS: '1', FREE_DAILY_QUESTIONS_PER_IP: undefined, AI_DAILY_BUDGET_USD: undefined }, async () => {
      const device = '6c7d8e9f-0a1b-4c2d-9e3f-4a5b6c7d8e9f';
      const body = { question: positive[1].question, contextMode: 'general' };
      const first = await callRoute('/api/ask', body, { device, ip: '192.0.2.78' });
      assert.ok(first.statusCode < 400, `first answer delivered (status ${first.statusCode})`);
      const second = await callRoute('/api/ask', body, { device, ip: '192.0.2.78' });
      assert.equal(second.statusCode, 429);
    }));
  } finally { providerReply = null; }
});

test('/health never counts and is never limited', async () => {
  await withEnv({ FREE_DAILY_QUESTIONS: '0', FREE_DAILY_QUESTIONS_PER_IP: '0', AI_DAILY_BUDGET_USD: '0' }, async () => {
    const layers = app.router.stack.find(layer => layer.route?.path === '/health').route.stack;
    assert.equal(layers.length, 1);
    const res = mockRes();
    for (let i = 0; i < 3; i++) layers[0].handle({ ip: '192.0.2.44', headers: {} }, res, () => {});
    assert.deepEqual(res.body, { status: 'ok' });
  });
});
