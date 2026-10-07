const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { positive } = require('../validation/ask/fixtures');
let calls = 0, payload;
process.env.ANTHROPIC_API_KEY = 'test-key';
// The SDK's only transport is this mock; no external request is possible.
globalThis.fetch = async (_url, options) => {
  calls++; payload = JSON.parse(options.body);
  const events = [
    { type: 'message_start', message: { id: 'mock', type: 'message', role: 'assistant', content: [], model: 'claude-sonnet-4-6', stop_reason: null, stop_sequence: null, usage: { input_tokens: 50, output_tokens: 0 } } },
    { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
    { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: JSON.stringify({ answer: positive[1].answer, details: [], source_ids: payload.output_config.format.schema.properties.source_ids.items.enum }) } },
    { type: 'content_block_stop', index: 0 },
    { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 80 } },
    { type: 'message_stop' },
  ];
  return new Response(events.map(e => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join(''), { headers: { 'content-type': 'text/event-stream' } });
};
const { app } = require('../server');
test('real registered Ask handler uses shared SDK streaming, timing and privacy logger with mocked transport', async () => {
  const handler = app.router.stack.find(l => l.route?.path === '/api/ask').route.stack.at(-1).handle;
  const res = new EventEmitter();
  res.status = n => { res.statusCode = n; return res; };
  res.json = body => { res.body = body; res.emit('finish'); return res; };
  const logs = [], original = console.log;
  console.log = (...args) => logs.push(args);
  try { await handler({ body: { question: positive[1].question, contextMode: 'general' } }, res); }
  finally { console.log = original; }
  assert.equal(calls, 1); assert.equal(res.body.answer, positive[1].answer);
  assert.equal(payload.messages.length, 1); assert.equal(payload.messages[0].content, positive[1].question);
  assert.equal(payload.max_tokens, 1200); assert.equal(payload.output_config.format.schema.additionalProperties, false);
  const metadata = JSON.parse(logs.find(args => args[0] === '[OPERATIONAL]')[1]);
  assert.equal(metadata.route, 'ASK_CLINICAL_EDGE'); assert.equal(metadata.provider_input_tokens, 50);
  assert.equal(metadata.provider_output_tokens, 80); assert.equal(metadata.validation_status, 'accepted');
  assert.equal(metadata.provider_stop_reason, 'end_turn'); assert.equal(metadata.display_resolution, 'validated_answer');
  for (const text of [positive[1].question, positive[1].answer, payload.system, 'test-key']) assert.equal(JSON.stringify(logs).includes(text), false);
});
