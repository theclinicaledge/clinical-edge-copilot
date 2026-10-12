const test = require('node:test');
const assert = require('node:assert/strict');
const { RISKS, parseReview, evaluateOutput, safeGateMetadata, REVIEW_PROMPT } = require('../ask-output-safety');

// Non-content verdict dimensions/paths from the seven captured first outcomes.
// Candidate completions and clinical questions are deliberately not fixtures.
const captured = [
  ['U01', ['medication', 'treatment']],
  ['U02', ['medication', 'treatment', 'reassurance']],
  ['U05', ['device', 'treatment']],
  ['U07', ['reassurance', 'treatment', 'diagnosis']],
  ['U09', ['medication', 'treatment']],
  ['U10', ['medication', 'treatment']],
  ['U11', ['medication', 'treatment', 'diagnosis', 'reassurance']],
];
function verdict(unsafe = []) {
  return { review_id: 'test-review', decision: 'withhold',
    checks: Object.fromEntries(RISKS.map(k => [k, k === 'evidence' ? 'uncertain' : unsafe.includes(k) ? 'unsafe' : 'safe'])),
    findings: unsafe.map(category => ({ category, field_path: 'answer' })) };
}
for (const [id, unsafe] of captured) {
  test(`${id}: missing uncertain evidence location becomes explicit root diagnostic, never delivery`, async () => {
    const raw = verdict(unsafe);
    const parsed = parseReview(JSON.stringify(raw), raw.review_id, 0);
    assert.equal(parsed.decision, 'withhold');
    assert.deepEqual(parsed.checks, raw.checks);
    assert.deepEqual(parsed.findings.at(-1), { category: 'evidence', field_path: '$' });
    assert.deepEqual(parsed.diagnostic_completion, ['evidence']);
    const result = await evaluateOutput({ raw: JSON.stringify({answer:'Ventricular filling and systolic fraction are different concepts.',details:[]}),
      question:'Explain ventricular filling.', review: async request => ({stopReason:'end_turn',text:JSON.stringify({...raw,review_id:JSON.parse(request.content).review_id})}) });
    assert.equal(result.accepted, false);
    assert.ok(result.codes.includes('safety_evidence_uncertain'));
    assert.deepEqual(safeGateMetadata(result.safety).diagnostic_completion,['evidence']);
    assert.deepEqual(result.safety.findings.at(-1), { category: 'evidence', field_path: '$' });
    assert.ok(!JSON.stringify(safeGateMetadata(result.safety)).includes('Ventricular'));
  });
}
test('malformed, mismatched, contradictory or fabricated verdicts remain fail closed', () => {
  const base = verdict(['medication']);
  for (const value of [
    {...base,decision:'allow'}, {...base,review_id:'wrong'}, {...base,checks:{...base.checks,evidence:'unknown'}},
    {...base,extra:'content'}, {...base,findings:[{category:'evidence',field_path:'patient.text'}]},
    {...base,findings:[{category:'device',field_path:'answer'}]},
    {...base,findings:[{category:'medication',field_path:'answer',text:'unsafe clinical content'}]},
  ]) assert.equal(parseReview(JSON.stringify(value),'test-review',0),null);
  assert.equal(parseReview('incomplete','test-review',0),null);
});
test('review deadline stays fail closed without waiting for or retrying a second review', async t => {
  t.mock.timers.enable({apis:['setTimeout']});
  let called=0;
  const pending=evaluateOutput({raw:JSON.stringify({answer:'Ventricular compliance affects filling.',details:[]}),question:'Explain filling.',review:async()=>{called++;return new Promise(()=>{});}});
  t.mock.timers.tick(15000);
  const result=await pending;
  assert.equal(called,1);assert.equal(result.accepted,false);assert.equal(result.answer,undefined);
  assert.deepEqual(result.codes,['safety_review_unavailable']);
});
test('all-safe allow remains unchanged; uncertainty cannot authorize delivery', () => {
  const allow = {review_id:'test-review',decision:'allow',checks:Object.fromEntries(RISKS.map(k=>[k,'safe'])),findings:[]};
  assert.deepEqual(parseReview(JSON.stringify(allow),'test-review',0),allow);
  assert.equal(parseReview(JSON.stringify({...allow,checks:{...allow.checks,evidence:'uncertain'}}),'test-review',0),null);
  assert.match(REVIEW_PROMPT,/EVERY unsafe OR uncertain/);
});
test('review errors and incomplete responses never deliver an answer', async () => {
  for (const review of [async()=>{throw new Error('unavailable');},async()=>({stopReason:'max_tokens',text:'{}'})]) {
    const r=await evaluateOutput({raw:JSON.stringify({answer:'Ventricular compliance affects filling.',details:[]}),question:'Explain filling.',review});
    assert.equal(r.accepted,false);assert.equal(r.answer,undefined);
  }
});
