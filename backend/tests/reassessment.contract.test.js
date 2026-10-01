const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
process.env.ANTHROPIC_API_KEY ||= 'test-key';
const { app } = require('../server');
const source = 'PATIENT SNAPSHOT — USER-REPORTED / OBSERVED INFORMATION\nWhat changed: BP / perfusion\nReported clinical data:\n- BP: previous 86/48 -> current 94/56 mmHg\n- Heart rate: previous 118 -> current 106 bpm\n- Level of consciousness: Drowsy\n- Urine output: amount 15 mL over 1 hour\nTreat omitted fields as unknown. Do not infer normal findings.';
const previous = 'PATIENT SNAPSHOT — USER-REPORTED / OBSERVED INFORMATION\nReported clinical data:\n- BP: previous 108/64 -> current 86/48 mmHg\n- Drips: items=1) medication=Norepinephrine\n- Drains / bleeding: items=1) type=Chest tube, currentOutput=35 mL, outputTimeframe=most recent hour';
async function invoke(path, body) {
  const layer = app.router.stack.find((item) => item.route?.path === path);
  const handler = layer.route.stack.at(-1).handle;
  const response = new EventEmitter();
  response.statusCode = 200;
  response.status = (status) => { response.statusCode = status; return response; };
  response.json = (value) => { response.value = value; return response; };
  response.end = (value) => { response.value = value; return response; };
  response.setHeader = () => {};
  const logs = [];
  const old = console.log;
  console.log = (...args) => logs.push(args);
  try { await handler({ body }, response); } finally { console.log = old; }
  return { response, logs };
}
test('verified reassessment uses deterministic endpoint path without provider and content logging', async () => {
  const { response, logs } = await invoke('/api/copilot', { question: source, reassessmentRequest: true });
  assert.equal(response.statusCode, 200);
  assert.match(response.value, /"done":true/);
  assert.match(response.value, /94\/56/);
  assert.doesNotMatch(response.value, /108\/64/);
  assert.match(response.value, /Latest verified bedside findings/);
  assert.doesNotMatch(response.value, /### 1 · Reported clinical deterioration/);
  assert.match(JSON.stringify(logs), /not_called/);
  assert.doesNotMatch(JSON.stringify(logs), /94\/56|15 mL/);
});
test('reassessment SBAR separates current from previous and preserves exact interval without causality', async () => {
  const { response, logs } = await invoke('/api/sbar', { question: source, copilotResponse: 'Urgency Level: MODERATE', previousAssessment: previous, reassessmentRequest: true });
  assert.equal(response.statusCode, 200);
  assert.match(response.value.sbar.assessment, /15 mL over 1 hour/);
  assert.doesNotMatch(response.value.sbar.assessment, /35 mL|108\/64/);
  assert.match(response.value.sbar.background, /not reassessed or assumed current/);
  assert.match(response.value.sbar.background, /35 mL/);
  assert.doesNotMatch(JSON.stringify(response.value), /responded to treatment|improving after|rapidly deteriorating/);
  assert.doesNotMatch(JSON.stringify(logs), /94\/56|Norepinephrine/);
});
test('reassessment Teach Me stays deterministic and previous identifiers are blocked', async () => {
  const lesson = await invoke('/api/copilot', { question: source, reassessmentRequest: true, learningRequest: true });
  assert.ok(lesson.response.value.lesson);
  const blocked = await invoke('/api/sbar', { question: source, copilotResponse: 'Urgency Level: MODERATE', reassessmentRequest: true, previousAssessment: 'MRN 1234567' });
  assert.equal(blocked.response.statusCode, 400);
});
