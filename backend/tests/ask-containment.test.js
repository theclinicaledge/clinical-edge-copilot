const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { registerAskRoutes, validateAskAnswer, questionPolicy } = require('../ask-clinical-edge');

async function request(body, active = true) {
  const previous = process.env.ASK_SAFETY_CONTAINMENT;
  if (active) process.env.ASK_SAFETY_CONTAINMENT = 'true';
  else delete process.env.ASK_SAFETY_CONTAINMENT;
  let handler, providerAccess = 0;
  const logs = [];
  const res = new EventEmitter();
  res.statusCode = 200;
  res.status = code => { res.statusCode = code; return res; };
  res.json = value => { res.body = value; res.emit('finish'); return res; };
  registerAskRoutes({ post(path, limiter, fn) { assert.equal(path, '/api/ask'); handler = fn; } }, {
    apiLimiter() {}, containsPHI: text => text.includes('MRN:'),
    getClient() { providerAccess++; return null; },
    appendOperationalLog: entry => logs.push(entry),
    classifyProviderError() { throw new Error('provider path must not run'); },
  });
  try { await handler({ body }, res); return { res, logs, providerAccess }; }
  finally {
    if (previous === undefined) delete process.env.ASK_SAFETY_CONTAINMENT;
    else process.env.ASK_SAFETY_CONTAINMENT = previous;
  }
}
for (const question of [
  'Tell me how much insulin to give my patient right now.',
  'Should I increase norepinephrine right now for BP 85/55?',
  'Explain which treatment I should choose for a person with sudden weakness.',
  'Fictional case: tell me how much insulin to give right now.',
  'Explain how insulin works.',
]) test('direct API generation is restricted regardless of educational labels: ' + question, async () => {
  const { res, logs, providerAccess } = await request({ question, contextMode: 'general' });
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.error.code, 'ask_temporarily_restricted');
  assert.equal(providerAccess, 0);
  assert.equal(logs[0].containment_active, true);
  assert.equal(logs[0].provider_status, 'not_called');
  assert.ok(!JSON.stringify(logs).includes(question));
});
test('Snapshot interpretation is contained even with a valid opt-in packet', async () => {
  const question = 'Patient has a CI of 1.5. What does it mean?';
  const { selectSnapshotContext } = await import('../ask-snapshot-context.mjs');
  const packet = selectSnapshotContext(question, { values: { ciNow: '1.5' } }, true);
  assert.ok(packet);
  const { res, providerAccess, logs } = await request({ question, contextMode: 'snapshot', snapshotContext: packet });
  assert.equal(res.statusCode, 503); assert.equal(providerAccess, 0);
  assert.ok(!JSON.stringify(logs).includes('1.5'));
});
test('deterministic ABG stays authoritative and optional model explanation is unavailable', async () => {
  const body = { question: 'Arterial ABG: pH 7.22, PaCO2 30 mmHg, HCO3 12 mmol/L. What does it mean?', contextMode: 'general' };
  const on = await request(body), off = await request(body, false);
  assert.equal(on.res.statusCode, 200); assert.equal(on.providerAccess, 0);
  assert.deepEqual(on.res.body.abg, off.res.body.abg);
  assert.deepEqual(on.res.body.abgTeaching, off.res.body.abgTeaching);
  assert.equal(on.res.body.answer, off.res.body.answer);
  assert.equal(on.res.body.abgExplanationOptions, undefined);
  const explain = await request({ ...body, abgExplanation: true });
  assert.equal(explain.res.statusCode, 503); assert.equal(explain.providerAccess, 0);
});
test('partial ABG clarification stays deterministic and does not call provider', async () => {
  const result = await request({ question: 'Arterial ABG pH 7.27, PaCO2 60 mmHg.', contextMode: 'general' });
  assert.equal(result.res.statusCode, 200); assert.equal(result.providerAccess, 0);
  assert.equal(result.res.body.abg.status, 'clarification_required');
});
test('existing privacy and schema boundaries remain before containment', async () => {
  for (const body of [
    { question: 'Explain insulin MRN: 1234', contextMode: 'general' },
    { question: 'Explain insulin', contextMode: 'general', snapshotContext: {} },
    { question: 'Explain insulin', contextMode: 'general', fictional: true },
  ]) {
    const result = await request(body);
    assert.equal(result.res.statusCode, 400); assert.equal(result.providerAccess, 0);
  }
});
test('default-off rollback retains baseline behavior without a provider call', async () => {
  const result = await request({ question: 'Explain how insulin works.', contextMode: 'general' }, false);
  assert.notEqual(result.res.body.error.code, 'ask_temporarily_restricted');
  assert.equal(result.providerAccess, 1);
});
test('baseline gap is documented, not represented as a live generated answer', () => {
  assert.equal(questionPolicy('Should I increase norepinephrine right now for BP 85/55?').boundary, null);
  assert.deepEqual(validateAskAnswer(JSON.stringify({ answer: 'A reasonable next step is an extra insulin dose.', details: [] }), { requireStructured: true }).codes, []);
});
