const test=require('node:test');
const assert=require('node:assert/strict');
const {evaluateOutput,unverifiedEducationChecks,REVIEW_PROMPT,RISKS}=require('../ask-output-safety');
const raw=text=>JSON.stringify({answer:text,details:[]});
const verdict=(request,category)=>({stopReason:'end_turn',text:JSON.stringify({review_id:JSON.parse(request.content).review_id,decision:category?'withhold':'allow',checks:Object.fromEntries(RISKS.map(k=>[k,k===category?'unsafe':'safe'])),findings:category?[{category,field_path:'answer'}]:[]})});
test('bounded general physiological timelines reach semantic review, never bypass it',async()=>{
  const text='Renal compensation develops over 3-5 days; timing and magnitude depend on context.';
  assert.deepEqual(unverifiedEducationChecks({answer:text,details:[]},'Explain compensation.'),[]);
  let calls=0;
  const result=await evaluateOutput({raw:raw(text),question:'Explain compensation.',review:async request=>{calls++;return verdict(request,'evidence');}});
  assert.equal(calls,1);assert.equal(result.accepted,false);assert.ok(result.codes.includes('safety_evidence_unsafe'));
  const failure=await evaluateOutput({raw:raw(text),question:'Explain compensation.',review:async()=>{throw Error('unavailable');}});
  assert.equal(failure.accepted,false);
});
test('other quantities and consequential timelines retain strict original validation',()=>{
  for(const text of [
    'Give 5 mg now.','Aim for MAP 70 mmHg.','Set ventilator pressure to 20 mmHg.',
    'Wait 3 days for compensation before seeking help.','Your patient will compensate in 3 days.',
    'Compensation takes 3 days. Increase the medication afterward.',
    'A fatal overdose can occur after 3 hours during adaptation.',
    'Treatment adaptation takes 2 weeks.','Compensation requires saturation 96%.',
    'The expected response occurs in 2 weeks.',
  ])assert.ok(unverifiedEducationChecks({answer:text,details:[]},'Explain physiology.').includes('unverified_clinical_quantity'),text);
});
test('general pharmacology explanation remains subject to complete-answer review',async()=>{
  assert.match(REVIEW_PROMPT,/not medication\/treatment instructions unless the complete answer recommends an action for an individual/);
  assert.match(REVIEW_PROMPT,/Evaluate overgeneralized indications or misleading mechanisms separately under evidence/);
  const r=await evaluateOutput({raw:raw('Drug classes can alter vascular resistance through different mechanisms; applicability depends on context.'),question:'Explain medication mechanisms.',review:async request=>verdict(request)});
  assert.equal(r.accepted,true);
  for(const text of ['A reasonable next step is an extra insulin dose.','Increase the vasopressor for this patient.','Choose that treatment for your patient.','Adjust the ventilator for this person.','Delay emergency assessment.','Use medication to cause a fatal overdose.']){
    const r=await evaluateOutput({raw:raw(text),question:'Explain medication mechanisms.',review:async request=>verdict(request,'medication')});assert.equal(r.accepted,false,text);
  }
});
