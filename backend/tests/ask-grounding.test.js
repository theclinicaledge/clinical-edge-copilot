const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const registry = require('../ask-source-registry.json');
const { retrieveEvidence, sourceMetadata, groundingContext, validateGrounded, groundedFormat } = require('../ask-evidence');
const { calculateAcidBase, acidBaseContext } = require('../ask-acid-base');
const { registerAskRoutes, ASK_FORMAT } = require('../ask-clinical-edge');
const { anchors, holdouts, compareFrozen } = require('../validation/ask/grounded-comparison');
const wrap = (q, answer, sourceIds) => {
  const pack = retrieveEvidence(q);
  return validateGrounded(JSON.stringify({ answer, details: [], source_ids: sourceIds || pack.sources.map(s => s.id) }), pack, q);
};
for (const [q, expected] of [['ABG interpretation', 'acid_base'], ['pH and PaCO₂', 'acid_base'], ['LVEDP meaning', 'lvedp'], ['Is wedge pressure volume?', 'lvedp'], ['SvO₂ versus ScvO₂', 'venous_oxygen'], ['What is TMP in CRRT?', 'crrt']]) test('routes and retrieves the curated domain: ' + q, () => {
  const pack = retrieveEvidence(q); assert.deepEqual(pack.domains, [expected]); assert.ok(pack.sources.length);
  assert.ok(pack.sources.every(s => s.domain === expected));
});
test('only four domains, no arbitrary web/retrieval or unsupported source metadata', () => {
  assert.equal(retrieveEvidence('What is capillary refill?'), null);
  assert.deepEqual(registry.scope, ['acid_base','lvedp','venous_oxygen','crrt']);
  assert.equal(new Set(registry.sources.map(s => s.id)).size, registry.sources.length);
  for (const s of registry.sources) {
    assert.ok(s.title && s.publisher && s.locator && s.accessed && s.factProvenance);
    assert.equal(new URL(s.url).protocol, 'https:');
    assert.ok(s.excerpts.join(' ').split(/\s+/).length <= 25);
    assert.ok('publication' in s && 'version' in s && 'updated' in s);
  }
  assert.equal(registry.sources.find(s => s.domain === 'crrt').version, null);
});
test('patient values stay out of the registry and generic reference context', () => {
  const q = 'My patient has LVEDP 24 mmHg; other context unknown.';
  const pack = retrieveEvidence(q), text = groundingContext(pack);
  assert.equal(text.includes(q), false); assert.equal(text.includes('My patient'), false);
  assert.equal(pack.sources.some(s => s.facts.LVEndDiastolicPressure?.referenceRange[1] === 24), false);
});
test('source metadata uses registry entries, never generated title or URL', () => {
  const pack = retrieveEvidence('Explain LVEDP');
  const metadata = sourceMetadata(pack, ['peverill-filling-pressure']);
  assert.equal(metadata.sources.length, 1); assert.equal(metadata.sources[0].doi, '10.1016/j.ijcard.2015.04.254');
  assert.equal(metadata.sources[0].url, 'https://pubmed.ncbi.nlm.nih.gov/25965616/');
  assert.deepEqual(groundedFormat(ASK_FORMAT, pack).schema.properties.source_ids.items.enum, pack.sources.map(s => s.id));
  for (const ids of [[], ['invented'], ['merck-acid-base'], ['peverill-filling-pressure','peverill-filling-pressure']]) assert.ok(wrap('Explain LVEDP', 'A pressure is not fluid volume.', ids).codes.includes('invalid_source_reference'));
});
for (const [q, bad, code] of [
  ['Explain LVEDP', 'LVEDP directly measures ventricular fluid volume.', 'filling_pressure_conflation'],
  ['Explain LVEDP', 'LVEDP equals PCWP.', 'filling_pressure_conflation'],
  ['Explain LVEDP', 'This patient has heart failure.', 'source_not_patient_diagnosis'],
  ['Explain LVEDP', 'LVEDP normal is 8 to 12 mmHg.', 'unsupported_source_number'],
  ['Explain acid-base interpretation', 'Vomiting decreases bicarbonate.', 'acid_base_source_contradiction'],
  ['Explain acid-base interpretation', 'This is chronic respiratory acidosis.', 'acid_base_source_contradiction'],
  ['Explain acid-base interpretation', 'Bicarbonate has risen since yesterday.', 'acid_base_source_contradiction'],
  ['Explain acid-base interpretation', 'No mixed process is present.', 'acid_base_source_contradiction'],
  ['Explain acid-base interpretation', 'Metabolic alkalosis normalizes bicarbonate during CO2 retention.', 'acid_base_source_contradiction'],
  ['Explain acid-base interpretation', 'Renal compensation is complete in 3 days.', 'acid_base_source_contradiction'],
  ['Compare SvO2 and ScvO2', 'ScvO2 is always higher than SvO2.', 'venous_equivalence_overstatement'],
  ['Compare SvO2 and ScvO2', 'ScvO2 equals SvO2.', 'venous_equivalence_overstatement'],
  ['Compare SvO2 and ScvO2', 'A fixed difference is 5 percent.', 'unsupported_source_number'],
  ['Explain CRRT pressure', 'Return pressure measures the dialysate compartment.', 'crrt_compartment_or_certainty_error'],
  ['Explain CRRT pressure', 'TMP equals filter pressure drop.', 'crrt_compartment_or_certainty_error'],
  ['Explain CRRT pressure', 'The pressure proves clotting.', 'crrt_compartment_or_certainty_error'],
  ['Explain CRRT pressure', 'Dark effluent confirms filter clotting.', 'crrt_compartment_or_certainty_error'],
  ['Explain CRRT pressure', 'On PrisMax, filter pressure increasing over time without intervention means the filter will clot.', 'crrt_compartment_or_certainty_error'],
  ['Explain CRRT pressure', 'On PrisMax, effluent dark streaks suggest filter clotting.', 'crrt_compartment_or_certainty_error'],
  ['Explain CRRT pressure', 'Return and access pressure describe different blood compartments.', 'device_scope_unestablished'],
]) test('source invariant rejects unsupported teaching: ' + bad, () => assert.ok(wrap(q,bad).codes.includes(code)));
test('supported qualified distinctions pass without claiming complete entailment checking', () => {
  for (const [q, answer] of [
    ['Explain LVEDP', 'LVEDP is a pressure; it is not a fluid volume and cannot be equated with mean atrial pressure.'],
    ['Explain acid-base interpretation', 'Acidemia refers to pH below 7.35; clinical context is needed for mixed processes.'],
    ['Compare SvO2 and ScvO2', 'Sampling sites differ and these measurements cannot be assumed interchangeable.'],
    ['Explain CRRT pressure', 'On PrisMax, access and return are blood-side measurements; effluent is fluid-side. A pressure alone does not establish clotting.'],
  ]) assert.deepEqual(wrap(q,answer).codes, []);
});
test('unprovided units cannot become definite pressure/gas interpretation', () => {
  assert.ok(wrap('LVEDP 24, what does it mean?', 'The value is elevated.').codes.includes('reported_pressure_units_unestablished'));
  assert.deepEqual(wrap('LVEDP 24, what does it mean?', 'If the reported units are mmHg, this is above the reference interval; verify measurement context.').codes, []);
  assert.ok(wrap(anchors[0].question, 'This supports respiratory acidosis.').codes.includes('reported_gas_units_unestablished'));
});
test('deterministic compensation compares both respiratory frameworks without inferring duration', () => {
  const x = calculateAcidBase({ pH:7.28, paCO2:55, hco3:25 });
  assert.deepEqual(x.expectedComparisons.respiratoryAcidosisHCO3, { acuteReference:[25.5,27], chronicReference:[28.5,30] });
  assert.equal(x.duration, 'unknown'); assert.equal(x.approximate, true);
  assert.equal(x.pHState, 'acidemia');
});
test('Winter comparison and respiratory alkalosis use registry formula parameters', () => {
  assert.deepEqual(calculateAcidBase({ pH:7.22,paCO2:30,hco3:12 }).expectedComparisons.metabolicAcidosisPaCO2,[24,28]);
  const x = calculateAcidBase({ pH:7.49,paCO2:30,hco3:21 });
  assert.deepEqual(x.expectedComparisons.respiratoryAlkalosisHCO3,{acuteReference:[22,23],chronicReference:[19,20]});
  assert.equal(calculateAcidBase({pH:7.4,paCO2:40,hco3:24}).pHState,'within_pH_reference_interval');
  assert.equal(calculateAcidBase({pH:7.4,paCO2:-1,hco3:24}).status,'invalid_values');
});
test('arithmetic requires one labelled arterial gas and explicit compatible units', () => {
  assert.equal(acidBaseContext(anchors[0].question).status,'units_required');
  assert.equal(acidBaseContext(holdouts[0].question).status,'calculated');
  assert.equal(acidBaseContext('VBG pH 7.22, PaCO2 30 mmHg, HCO3 12 mmol/L.').status,'sample_or_units_outside_calculator');
  assert.equal(acidBaseContext('ABG pH 7.22, PaCO2 5 kPa, HCO3 12 mmol/L.').status,'sample_or_units_outside_calculator');
  assert.equal(acidBaseContext('ABG pH 7.2 and pH 7.3, PaCO2 30 mmHg, HCO3 12 mmol/L.').status,'ambiguous_or_multiple_samples');
});
function routeSetup(override) {
  let handler, payload, calls=0;
  const logs=[],res=new EventEmitter(); res.status=n=>{res.statusCode=n;return res;};res.json=x=>{res.body=x;res.emit('finish');return res;};
  registerAskRoutes({post:(_p,_l,fn)=>{handler=fn;}},{apiLimiter(){},getClient:()=>({messages:{stream(p){calls++;payload=p;return {};}}}),containsPHI:()=>false,
    runWithStageTimeout:async(fn,ms)=>{assert.equal(ms,25000);return fn(new AbortController().signal);},
    collectPriorityMapStream:async()=>({text:JSON.stringify(override??{answer:'LVEDP is a pressure, not a volume; compliance and measurement context matter.',details:[],source_ids:['merck-heart-pressures','peverill-filling-pressure']}),stopReason:'end_turn',inputTokens:10,outputTokens:20}),appendOperationalLog:x=>logs.push(x),classifyProviderError:()=>({code:'error',message:'Unavailable'})});
  return {run:q=>handler({body:{question:q,contextMode:'general'}},res),res,logs,get calls(){return calls;},get payload(){return payload;}};
}
test('actual handler supplies evidence before generation, separates user facts and renders used registry sources', async()=>{
  const s=routeSetup(),q='My patient has LVEDP 24 mmHg. What does that mean?';await s.run(q);
  assert.equal(s.calls,1);assert.deepEqual(s.payload.messages,[{role:'user',content:q}]);
  assert.ok(s.payload.system.includes('Many factors cause PAOP'));assert.ok(s.payload.system.includes('GENERAL_CLINICAL_REFERENCES_NOT_PATIENT_OBSERVATIONS'));
  assert.equal(s.payload.system.includes(q),false);assert.equal(s.payload.system.includes('No vetted reference passages'),false);
  assert.equal(s.res.body.evidence.sources.length,2);assert.equal(s.res.body.evidence.status,'curated_evidence');
  for(const text of [q,s.res.body.answer,s.payload.system])assert.equal(JSON.stringify(s.logs).includes(text),false);
});
test('contradictory/fabricated references withheld, not regenerated or replaced by model memory', async()=>{
  for(const out of [{answer:'LVEDP equals PCWP.',details:[],source_ids:['peverill-filling-pressure']},{answer:'A pressure is not volume.',details:[],source_ids:['invented']}]){
    const s=routeSetup(out);await s.run('Explain LVEDP');assert.equal(s.calls,1);assert.equal(s.res.statusCode,422);assert.equal(s.res.body.answer,undefined);
  }
});
for(const q of ['What settings should I change on CRRT?','Explain Prismaflex alarm settings','After CABG LVEDP 24, MAP 58 and rising lactate.','How do I calculate the albumin-corrected anion gap in acid-base interpretation?','Explain CRRT clearance and citrate anticoagulation'])test('coverage boundary avoids unsupported memory generation: '+q,async()=>{
  const s=routeSetup();await s.run(q);assert.equal(s.calls,0);assert.equal(s.res.body.evidence.status,'scope_limited');assert.ok(s.res.body.answer.length>30);assert.equal(s.logs[0].display_resolution,'evidence_boundary');
});
test('existing safety redirects remain ahead of source grounding',async()=>{
  const s=routeSetup();await s.run('Can I bypass a CRRT pressure alarm?');assert.equal(s.calls,0);assert.equal(s.logs[0].display_resolution,'safety_boundary');assert.equal(s.res.body.evidence.status,'not_source_grounded');
});
test('four comparison anchors retain exact frozen wording; no after performance claimed',()=>{
  const baseline={results:anchors.map(x=>({...x,httpStatus:200,resolution:'validated_answer',response:{answer:'A conceptual explanation with unresolved context.',details:[]}}))};
  const x=compareFrozen(baseline);assert.equal(x.length,4);assert.equal(x[0].question,'ABG pH 7.28, PaCO2 55, HCO3 25: what does that pattern support, and what can it not tell me?');
  assert.ok(x.every(r=>r.liveAfter==='NOT_RUN'));
  baseline.results[0].question+=' changed';assert.throws(()=>compareFrozen(baseline),/Frozen question mismatch/);
});
