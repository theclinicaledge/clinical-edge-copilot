const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { createHash } = require('node:crypto');
const { registerConversation, parseAdmission, CONSENT_VERSION, ADMISSION_PROMPT, conversationSystem } = require('../ask-conversation');
const { COVERAGE, educationalEvidence } = require('../ask-education-coverage');
const { evaluateOutput, RISKS, REVIEW_PROMPT, safeGateMetadata } = require('../ask-output-safety');
const { safeAskDiagnostic } = require('../ask-failures');
const { buildOperationalLogEntry, containsPHI, classifyProviderError } = require('../server');
const { routeABG } = require('../ask-abg-engine');
const frozen = require('./fixtures/ask-coverage-v1.json');
const pack = educationalEvidence(['merck-ventricular-filling']);
const plain = 'LVEDP reflects pressure rather than fluid volume. Compliance changes the pressure-volume relationship.';
const numbered = '1. LVEDP reflects pressure rather than fluid volume.\n2. Compliance changes the pressure-volume relationship.';
const verdict = { decision: 'admit', scope_id: COVERAGE.id, reason: 'covered_education', intent: 'general_education', source_ids: ['merck-ventricular-filling'] };
const allow = request => ({ stopReason: 'end_turn', text: JSON.stringify({ review_id: JSON.parse(request.content).review_id, decision: 'allow', checks: Object.fromEntries(RISKS.map(k => [k, 'safe'])), findings: [] }) });

for (const text of [plain, numbered, numbered.replaceAll('. ', ') '), numbered + '\n1. Pressure is not volume.\n2. Compliance matters.']) {
  test('ordinary list markers do not change validation or the answer: ' + text.slice(0, 15), async () => {
    let reviewed;
    const result = await evaluateOutput({ raw: JSON.stringify({ answer: text, details: [], source_ids: ['merck-ventricular-filling'] }), question: frozen.cases[0].question, evidencePack: pack,
      review: async request => { reviewed = JSON.parse(request.content).complete_answer.answer; return allow(request); } });
    assert.equal(result.accepted, true); assert.equal(result.answer, text); assert.equal(reviewed, text);
  });
}
for (const text of [
  '1. Give 5 mg medication now.\n2. Pressure is a concept.',
  '1. Aim for MAP 70 mmHg.\n2. Pressure is a concept.',
  '1. A normal range is 5-12 mmHg.\n2. Pressure is a concept.',
  '1. A value of 1.5 mmHg is expected.\n2. Pressure is a concept.',
  '1. mg is the dose.\n2. Pressure is a concept.',
  '1. A diagnostic threshold is 9.\n2. Pressure is a concept.',
]) test('clinical numbers remain guarded inside numbered prose: ' + text.split('\n')[0], async () => {
  let calls = 0;
  const result = await evaluateOutput({ raw: JSON.stringify({ answer: text, details: [], source_ids: ['merck-ventricular-filling'] }), question: frozen.cases[0].question, evidencePack: pack, review: async request => { calls++; return allow(request); } });
  assert.equal(result.accepted, false); assert.equal(calls, 0); assert.ok(result.codes.includes('unsupported_source_number'));
});
test('ordinals never authorize an invalid reference or a numbered treatment command', async () => {
  for (const source_ids of [['unknown'], ['merck-ventricular-filling']]) {
    for (const action of ['Give insulin medication now.', 'Bypass the device alarm.', 'Flush the catheter.']) for (const marker of ['.', ')']) {
      const result = await evaluateOutput({ raw: JSON.stringify({ answer: `1${marker} ${action}\n2${marker} Pressure is a concept.`, details: [], source_ids }), question: 'Explain pressure.', evidencePack: pack, review: allow });
      assert.equal(result.accepted, false);
    }
  }
});

// In-process routing with an injected provider only: never calls Anthropic or listens on a port.
async function run(options = {}) {
  const names = ['NODE_ENV','LOCAL_CONVERSATIONAL_PREVIEW','ASK_SAFETY_CONTAINMENT'];
  const old = names.map(k => process.env[k]);
  Object.assign(process.env, { NODE_ENV: 'development', LOCAL_CONVERSATIONAL_PREVIEW: 'true', ASK_SAFETY_CONTAINMENT: 'true' });
  const handlers = {}, requests = [], logs = [];
  const app = { post: (path, ...h) => handlers[path] = h.at(-1), delete: (path, ...h) => handlers['DELETE ' + path] = h.at(-1) };
  const state = registerConversation(app, { apiLimiter() {}, containsPHI, classifyProviderError, admitAI: () => null,
    getClient: () => ({ messages: { stream: params => {
      requests.push(params);
      if (options.throwAt === requests.length) throw options.error || Object.assign(Error('synthetic confidential error text'), { status: 429 });
      if (requests.length === 1) return options.admission || { stopReason: 'end_turn', text: JSON.stringify(verdict) };
      if (requests.length === 2) return { stopReason: options.generationStop || 'end_turn', text: JSON.stringify(options.answer || { answer: plain, details: [], source_ids: ['merck-ventricular-filling'] }) };
      return options.review === 'invalid' ? { stopReason: 'end_turn', text: '{}' } : options.review === 'incomplete' ? { stopReason: 'max_tokens', text: '{}' } : options.review === 'unsafe' ? { stopReason: 'end_turn', text: JSON.stringify({ ...JSON.parse(allow({ content: params.messages[0].content }).text), decision: 'withhold', checks: Object.fromEntries(RISKS.map(k => [k, k === 'evidence' ? 'uncertain' : 'safe'])), findings: [{ category: 'evidence', field_path: '$' }] }) } : allow({ content: params.messages[0].content });
    } } }), runWithStageTimeout: (fn, _ms, _code, signal) => fn(signal), collectPriorityMapStream: async x => x,
    appendOperationalLog: x => logs.push(buildOperationalLogEntry(x)) });
  const req = (body, receipt) => ({ body, headers: { host: '127.0.0.1:5199', origin: 'http://127.0.0.1:5199', ...(receipt ? { authorization: 'Bearer ' + receipt } : {}) }, socket: { remoteAddress: '127.0.0.1' } });
  const res = () => { const r = new EventEmitter(); r.statusCode = 200; r.setHeader = () => {}; r.status = n => (r.statusCode = n, r); r.json = x => { r.body = x; r.emit('finish'); return r; }; return r; };
  try {
    const consent = res(); handlers['/api/ask/v1/conversation/consent'](req({ accepted: true, version: CONSENT_VERSION }), consent);
    if (options.withdraw) handlers['DELETE /api/ask/v1/conversation/consent'](req({}, consent.body.receipt), res());
    const r = res(); await handlers['/api/ask/v1/conversation/preview'](req({ question: options.question || frozen.cases[0].question }, options.noConsent ? null : consent.body.receipt), r);
    return { status: r.statusCode, body: r.body, calls: requests.length, requests, logs, history: [...state.sessions.values()][0]?.history || [] };
  } finally {
    for (const s of state.sessions.values()) { clearTimeout(s.timer); s.abort?.abort(); }
    names.forEach((k,i) => old[i] === undefined ? delete process.env[k] : process.env[k] = old[i]);
  }
}
const admission = data => ({ stopReason: 'end_turn', text: JSON.stringify(data) });
for (const [name, result, code] of [
  ['malformed', { stopReason: 'end_turn', text: '{}' }, 'admission_response_invalid'],
  ['truncated', { stopReason: 'max_tokens', text: '{}' }, 'admission_response_incomplete'],
  ['unknown source', admission({ ...verdict, source_ids: ['fake'] }), 'admission_source_invalid'],
  ['duplicate source', admission({ ...verdict, source_ids: ['merck-ventricular-filling','merck-ventricular-filling'] }), 'admission_source_invalid'],
]) test('invalid admission is technical, never a scope verdict: ' + name, async () => {
  const r = await run({ admission: result }); assert.equal(r.status, 502); assert.equal(r.body.error.code, code); assert.equal(r.calls, 1); assert.deepEqual(r.history, []);
  assert.equal(r.logs.at(-1).ask_diagnostic.stage, 'admission'); assert.equal(r.logs.at(-1).ask_diagnostic.reason, code);
});
test('valid unclear scope asks for clarification without generation', async () => {
  const r = await run({ admission: admission({ decision: 'uncertain', scope_id: 'none', reason: 'unclear_scope', intent: 'contextual_education', source_ids: [] }) });
  assert.equal(r.status, 422); assert.equal(r.body.error.code, 'educational_clarification_required'); assert.match(r.body.error.message, /clarify/i); assert.equal(r.calls, 1); assert.deepEqual(r.history, []);
});
for (const [id, intent, reason] of [['Q13','individualized_decision','patient_care'],['Q14','time_critical','time_critical'],['Q15','individualized_decision','patient_care']]) test('frozen restriction preserved: ' + id, async () => {
  const r = await run({ question: frozen.cases.find(q => q.id === id).question, admission: admission({ decision: 'reject', scope_id: 'none', reason, intent, source_ids: [] }) });
  assert.equal(r.status, 403); assert.equal(r.body.error.code, 'educational_scope_unavailable'); assert.equal(r.calls, 1); assert.deepEqual(r.history, []);
  assert.equal(r.logs.at(-1).ask_diagnostic.admission_reason, reason);
});
for (const [options, status, code, calls] of [
  [{ throwAt: 1 }, 503, 'provider_rate_limit', 1],
  [{ throwAt: 2 }, 503, 'provider_rate_limit', 2],
  [{ throwAt: 1, error: Object.assign(Error('secret'), { code: 'admission_timeout' }) }, 503, 'admission_timeout', 1],
  [{ throwAt: 2, error: Object.assign(Error('secret'), { code: 'provider_timeout' }) }, 503, 'provider_timeout', 2],
  [{ throwAt: 1, error: Object.assign(Error('secret'), { status: 401 }) }, 503, 'provider_configuration', 1],
  [{ generationStop: 'max_tokens' }, 502, 'answer_generation_incomplete', 2],
  [{ answer: { answer: plain, details: [], source_ids: ['fake'] } }, 502, 'answer_source_invalid', 2],
  [{ answer: { answer: 'bad' } }, 502, 'answer_source_invalid', 2],
  [{ answer: { answer: 'bad', details: [], source_ids: ['merck-ventricular-filling'] } }, 502, 'answer_response_invalid', 2],
  [{ throwAt: 3 }, 503, 'answer_review_unavailable', 3],
  [{ review: 'invalid' }, 502, 'answer_review_invalid', 3],
  [{ review: 'incomplete' }, 502, 'answer_review_incomplete', 3],
  [{ review: 'unsafe' }, 422, 'output_safety_withheld', 3],
]) test('failure classification stays closed without retry: ' + code, async () => {
  const r = await run(options); assert.equal(r.status, status); assert.equal(r.body.error.code, code); assert.equal(r.calls, calls); assert.deepEqual(r.history, []);
  assert.equal(r.body.answer, undefined); assert.ok(!JSON.stringify(r.logs).includes('synthetic confidential error text'));
  if (code.startsWith('answer_review')) assert.equal(r.logs.at(-1).ask_diagnostic.stage, 'review');
});
test('safe delivery, consent, withdrawal and privacy remain intact', async () => {
  const ok = await run({ answer: { answer: numbered, details: [], source_ids: ['merck-ventricular-filling'] } });
  assert.equal(ok.status, 200); assert.equal(ok.body.answer, numbered); assert.equal(ok.calls, 3);
  assert.ok(ok.logs.some(l => l.output_safety?.decision === 'allow'));
  assert.ok(!JSON.stringify(ok.logs).includes(numbered)); assert.ok(!JSON.stringify(ok.logs).includes(frozen.cases[0].question));
  for (const options of [{ noConsent: true }, { withdraw: true }]) { const r = await run(options); assert.equal(r.status, 403); assert.equal(r.calls, 0); }
  const phi = await run({ question: 'Explain pressure. MRN: 12345678' }); assert.equal(phi.body.error.code, 'identifier_pattern'); assert.equal(phi.calls, 0);
});
test('source insufficiency verdict is not silently converted to source-free delivery', async () => {
  const r = await run({ admission: admission({ decision: 'reject', scope_id: 'none', reason: 'insufficient_evidence', intent: 'unsupported', source_ids: [] }) });
  assert.equal(r.status, 403); assert.equal(r.calls, 1); assert.equal(r.body.error.code, 'educational_scope_unavailable');
});
test('diagnostic sanitizers retain only known enums and paths', () => {
  const x = buildOperationalLogEntry({ route: 'ASK_CONVERSATION', ask_diagnostic: { stage: 'review', reason: 'answer_review_invalid', question: 'SECRET' }, output_safety: { decision: 'withhold', stage: 'original_validation', codes: ['unsupported_source_number','SECRET'], findings: [{ category: 'evidence', field_path: '$', text: 'SECRET' }] } });
  assert.deepEqual(x.ask_diagnostic, { stage: 'review', reason: 'answer_review_invalid' }); assert.deepEqual(x.output_safety.codes, ['unsupported_source_number']);
  assert.ok(!JSON.stringify(x).includes('SECRET')); assert.equal(safeAskDiagnostic({ stage: 'SECRET', reason: 'provider_error' }), null);
  assert.equal(safeAskDiagnostic({ stage: 'review', reason: 'SECRET' }), null);
  assert.deepEqual(safeGateMetadata({ decision: 'withhold', stage: 'original_validation', codes: ['acid_base_source_contradiction'], findings: [] }).codes, ['acid_base_source_contradiction']);
});
test('frozen questions, ABG behavior and clinical prompt fingerprints remain unchanged', () => {
  assert.equal(frozen.cases.length, 15); assert.ok(frozen.cases.every(q => !containsPHI(q.question)));
  assert.equal(routeABG(frozen.cases[5].question).status, 'verified'); assert.equal(routeABG(frozen.cases[6].question).status, 'clarification_required');
  for (const q of frozen.cases.slice(0,12)) assert.equal(parseAdmission(admission({ ...verdict, source_ids: [] })).kind, 'admit', q.id);
  const hash = x => createHash('sha256').update(x).digest('hex');
  assert.equal(hash(ADMISSION_PROMPT), '8a4544614ce0906f0eef68f3f28b2d6dfaba6504744d4bdb7f59ea5a64b4bd93');
  assert.equal(hash(conversationSystem(null, 'contextual_education')), '2a18c816c41673fc9b273ad0dae37cf7d27edf0e2076a986f34d04e2bf75fc94');
  assert.equal(hash(REVIEW_PROMPT), '240203970c6b53665517e05c4c0fefcf3f7bd4b42eef5baaa4f7b493574c0e6a');
});
