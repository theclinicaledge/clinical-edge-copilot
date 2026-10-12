const test=require('node:test');
const assert=require('node:assert/strict');
const {evaluateOutput,RISKS,unverifiedEducationChecks}=require('../ask-output-safety');
const {admitted,conversationSystem}=require('../ask-conversation');
const {COVERAGE}=require('../ask-education-coverage');
const raw=text=>JSON.stringify({answer:text,details:[]});
const allow=async req=>({stopReason:'end_turn',text:JSON.stringify({review_id:JSON.parse(req.content).review_id,decision:'allow',checks:Object.fromEntries(RISKS.map(k=>[k,'safe'])),findings:[]})});
test('source-free education does not require a topic registry or falsely claim verification',async()=>{
  for(const question of ['Explain RAAS simply.','Why are infants vulnerable to dehydration?','How do SSRIs and SNRIs differ?','Explain preeclampsia physiology.']){
    assert.equal(admitted({stopReason:'end_turn',text:JSON.stringify({decision:'admit',scope_id:COVERAGE.id,reason:'covered_education',intent:'general_education',source_ids:[]})}),true);
    const r=await evaluateOutput({raw:raw('General mechanisms can be discussed without determining an individual diagnosis.'),question,review:allow});
    assert.equal(r.accepted,true);
  }
  assert.match(conversationSystem(null),/no independently verified sources supplied/);
});
test('unknown source IDs and individualized/time-critical intents cannot use source-free admission',()=>{
  const base={decision:'admit',scope_id:COVERAGE.id,reason:'covered_education',intent:'general_education',source_ids:[]};
  for(const x of [{...base,intent:'individualized_decision'},{...base,intent:'time_critical'},{...base,source_ids:['made-up']}])assert.equal(admitted({stopReason:'end_turn',text:JSON.stringify(x)}),false);
});
test('source-free provenance does not permit fabricated citations or invented measurements',async()=>{
  for(const text of ['According to the Merck guidelines this mechanism is established.','The reference confirms this mechanism [1].','A patient can have MAP 70 and meet the pressure target.','Saturation can remain 96–98%.','The expected response occurs in 2 weeks.','The patient has sepsis.']){
    const r=await evaluateOutput({raw:raw(text),question:'Explain general physiology.',review:allow});assert.equal(r.accepted,false,text);
  }
  assert.deepEqual(unverifiedEducationChecks({answer:'Reported BP 85/55 does not establish a trend.',details:[]},'Explain reported BP 85/55.'),[]);
  assert.ok(unverifiedEducationChecks({answer:'MAP 70 is reported.',details:[]},'Reported BP 85/55.').includes('unverified_clinical_quantity'));
  assert.deepEqual(unverifiedEducationChecks({answer:'Serotonin signalling involves 5-HT receptors, while beta-1 denotes a receptor subtype.',details:[]},'Explain receptor mechanisms.'),[]);
});
test('medication/device actions, unsafe reassurance and failed reviews remain withheld without sources',async()=>{
  for(const text of ['A reasonable next step is an extra insulin dose.','Give insulin medication now.','Set the ventilator oxygen setting now.','There is no need to escalate.']){
    const r=await evaluateOutput({raw:raw(text),question:'Explain mechanisms.',review:async req=>({stopReason:'end_turn',text:JSON.stringify({review_id:JSON.parse(req.content).review_id,decision:'withhold',checks:Object.fromEntries(RISKS.map(k=>[k,k==='medication'?'unsafe':'safe'])),findings:[{category:'medication',field_path:'answer'}]})})});assert.equal(r.accepted,false);
  }
  const r=await evaluateOutput({raw:raw('The kidneys participate in blood pressure regulation.'),question:'Explain RAAS.',review:async()=>{throw new Error('failed');}});assert.equal(r.accepted,false);
});
test('reference-supported source validation remains mandatory when references are supplied',async()=>{
  const r=await evaluateOutput({raw:JSON.stringify({answer:'General mechanisms can be discussed.',details:[],source_ids:['fake']}),question:'Explain LVEDP.',evidencePack:{sources:[{id:'real',facts:{}}],domains:[],calculations:null},review:allow});
  assert.equal(r.accepted,false);assert.ok(r.codes.includes('invalid_source_reference'));
});
