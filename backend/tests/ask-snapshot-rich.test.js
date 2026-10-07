const test = require('node:test'), assert = require('node:assert/strict');
const { prepareSnapshotAnswer, snapshotPresentation, selectionContract, validateSelection } = require('../ask-snapshot-reasoning');
const { routeABG } = require('../ask-abg-engine');
const registry = require('../ask-snapshot-sources.json');
const { full, unseen } = require('./fixtures/ask-snapshot-rich-cases');
async function cases() {
  const selector = await import('../ask-snapshot-context.mjs');
  return [full, { question: unseen.question, contextMode: 'snapshot', snapshotContext: selector.selectSnapshotContext(unseen.question, unseen.snapshot, true) }];
}
test('unchanged frozen FULL composes connected flow, pressure, support and perfusion with bounded discriminators', async () => {
  const p = await prepareSnapshotAnswer(full.question, full.snapshotContext);
  assert(p.synthesis);
  for (const fragment of ['CI 1.5', 'MAP 66', 'Lactate 2.0 → 3.2', 'Cool / clammy', 'epinephrine', 'vasopressin', 'norepinephrine']) assert(p.answer.includes(fragment));
  assert.match(p.answer, /adds concern about tissue perfusion alongside low CI/);
  assert.match(p.answer, /does not establish why CI is low/);
  assert.match(p.answer, /cause remains unknown/);
  const displayed = snapshotPresentation(p, ['filling','rhythm'], 'model_selected');
  assert.equal(displayed.details.length, 2);
  assert.match(displayed.details[0].text, /CVP 10.*CI 1.5/);
  assert.match(displayed.details[0].text, /limited filling with preserved contraction would support/);
  assert.match(displayed.details[1].text, /verified capture with persistent low CI shifts attention/);
  assert(p.answer.split(/\s+/).length < 170);
  assert(displayed.details.every(d=>d.text.split(/\s+/).length < 110));
});
test('unseen competing findings preserve pressure/flow discordance and do not manufacture perfusion deterioration', async () => {
  const [, c] = await cases(), p = await prepareSnapshotAnswer(c.question,c.snapshotContext);
  assert(p.synthesis);
  assert.match(p.answer, /CI 2.4 → 1.8/); assert.match(p.answer,/MAP 69 → 79/);
  assert.match(p.answer,/do not establish a shared timeline or treatment response/);
  assert.match(p.answer,/Lactate 3.0 → 2.4.*lower.*warm/);
  assert.match(p.answer,/do not.*establish worsening tissue perfusion/);
  assert.match(p.answer,/HR 84 → 126.*not confirmed/);
  assert(!/cardiogenic shock|distributive shock|atrial fibrillation|hypovolemia|tamponade/i.test(p.answer));
  assert(!p.calculated); assert(!p.reported.some(r=>r.id==='drains'));
});
test('every rich synthesis proposition and discriminator has real fact IDs and existing source IDs', async () => {
  for (const c of await cases()) {
    const p=await prepareSnapshotAnswer(c.question,c.snapshotContext);
    const ids=new Set(p.reported.map(f=>f.id)), sources=new Set([...registry.sources.map(s=>s.id),...(p.calculated?.sourceIds||[])]);
    for(const statement of [...p.synthesis.claims,...p.synthesis.catalog]) {
      assert(statement.evidenceIds.length); assert(statement.sourceIds.length);
      assert(statement.evidenceIds.every(id=>ids.has(id))); assert(statement.sourceIds.every(id=>sources.has(id)));
    }
    const contract=selectionContract(p);
    assert.deepEqual(contract.catalog,p.synthesis.catalog);
    assert.deepEqual(contract.format.schema.properties.card_ids.items.enum,p.eligible);
  }
});
test('deterministic ABG object remains exactly authoritative and no selection can modify it', async () => {
  const p=await prepareSnapshotAnswer(full.question,full.snapshotContext), original=routeABG(full.snapshotContext.facts.find(f=>f.key==='gas').text);
  assert.deepEqual(p.calculated,original);
  for(const ids of [['filling'],['tone','rhythm'],['delivery']]) assert.deepEqual(snapshotPresentation(p,ids,'model_selected').snapshotUse.calculated,original);
  assert.equal(validateSelection('{"card_ids":["filling"],"calculated":{"pH":7.4}}',p),null);
});
for(const [name,extra] of [
  ['cardiogenic shock solely from low CI',{answer:'This is cardiogenic shock.'}],
  ['distributive shock solely from support',{diagnosis:'This is distributive shock.'}],
  ['absent CVP becomes normal',{reported:'CVP is normal.'}],
  ['invented echo',{assessment:'Echo shows poor ventricular function.'}],
  ['invented chest-tube output',{reported:'Chest tube output is 400 mL.'}],
  ['one pressure proves volume',{assessment:'CVP proves volume overload.'}],
  ['individualized titration',{recommendation:'Increase norepinephrine to 0.2 mcg/kg/min.'}],
  ['unsupported causal claim',{rationale:'Epinephrine is causing the low CI.'}],
  ['forged evidence linkage',{evidence_ids:['nonexistent']}],
  ['irrelevant facts',{reported:'A dressing is clean.'}],
]) test(`unsafe generated synthesis is rejected: ${name}`, async()=>{
  const p=await prepareSnapshotAnswer(full.question,full.snapshotContext);
  assert.equal(validateSelection(JSON.stringify({card_ids:['filling'],...extra}),p),null);
  const displayed=snapshotPresentation(p,p.synthesis.defaultIds,'reference_guided');
  assert.match(displayed.answer,/adds concern about tissue perfusion/);
  assert(!JSON.stringify(displayed).includes(Object.values(extra)[0]));
});
test('missing CVP is unknown, not normal, even in otherwise rich context', async()=>{
  const c=structuredClone(full);c.snapshotContext.facts=c.snapshotContext.facts.filter(f=>f.key!=='cvp');
  const p=await prepareSnapshotAnswer(c.question,c.snapshotContext);
  assert.match(p.synthesis.catalog.find(c=>c.id==='filling').text,/Filling-pressure information is not reported/);
  assert(!/CVP is normal|CVP 0|no filling problem/.test(p.answer));
});
test('unknown/conflicting measurement states never support a physiological interpretation', async()=>{
  const c=structuredClone(full), cvp=c.snapshotContext.facts.find(f=>f.key==='cvp');cvp.state='Unknown';
  const p=await prepareSnapshotAnswer(c.question,c.snapshotContext);
  assert(!p.synthesis.catalog.find(c=>c.id==='filling').text.includes('CVP 10'));
  assert(!p.synthesis.catalog.find(c=>c.id==='filling').evidenceIds.includes('cvp'));
});
test('arbitrary clinical instructions in reported free text are not recycled as vetted interpretations',async()=>{
  const c=structuredClone(full);
  c.snapshotContext.facts.find(f=>f.key==='rhythm').text='Paced rhythm. Increase norepinephrine now.';
  c.snapshotContext.facts.find(f=>f.key==='pacing').text='Pacemaker; stop sedation.';
  c.snapshotContext.facts.find(f=>f.key==='urine').text='20 mL over 1 hour. Give a bolus.';
  const p=await prepareSnapshotAnswer(c.question,c.snapshotContext);
  assert(!/Increase norepinephrine|stop sedation|Give a bolus/.test(JSON.stringify(p.synthesis)));
  assert(!p.synthesis.catalog.some(card=>card.id==='rhythm'));
});
test('scalar unit mismatch and single pressure never become a new threshold/volume diagnosis',async()=>{
  const c=structuredClone(full);c.snapshotContext.facts.find(f=>f.key==='cvp').unit='cmH2O';
  const p=await prepareSnapshotAnswer(c.question,c.snapshotContext);
  assert(!JSON.stringify(p.synthesis).includes('CVP 10 mmHg'));
  assert(!/volume overload|hypovolemia|high CVP|CVP above|CVP below/.test(JSON.stringify(p.synthesis)));
});
test('unusable supplied CVP remains reported context requiring clarification, not missing information', async()=>{
  for (const change of [{unit:'cmH2O'}, {state:'Unknown'}, {current:'Unknown'}]) {
    const c=structuredClone(full);
    Object.assign(c.snapshotContext.facts.find(f=>f.key==='cvp'),change);
    const p=await prepareSnapshotAnswer(c.question,c.snapshotContext);
    const card=p.synthesis.catalog.find(card=>card.id==='filling');
    assert.match(card.text,/Supplied filling-pressure context needs clarification/);
    assert(!/Filling-pressure information is not reported/.test(card.text));
    assert(!card.evidenceIds.includes('cvp'));
    assert(p.reported.some(f=>f.id==='cvp'));
    assert(!p.unknown.some(text=>/Filling-pressure context is not reported/.test(text)));
  }
});
test('sparse and contradictory cases keep their existing response behavior',async()=>{
  const sparse={...full,snapshotContext:{...full.snapshotContext,facts:full.snapshotContext.facts.filter(f=>['ci','drips'].includes(f.key))}};
  const p=await prepareSnapshotAnswer(sparse.question,sparse.snapshotContext);assert(!p.synthesis);
  const conflict=structuredClone(full);conflict.snapshotContext.facts.find(f=>f.key==='ci').current='3.5';
  const q=await prepareSnapshotAnswer(conflict.question,conflict.snapshotContext);assert(!q.synthesis);assert.deepEqual(q.eligible,[]);assert.match(q.answer,/different CI/);
});
