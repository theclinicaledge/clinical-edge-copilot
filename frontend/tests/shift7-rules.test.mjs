import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, discovered, events, handoffChips, handoffResult, historyGaps, read, openingGaps } from '../src/modules/the-shift/shift7/rules.js';
import { questions, VERSION } from '../src/modules/the-shift/shift7/data.js';
test('released attempts preserve classifications and handoff across the clarity update',()=>{
 const saved={...fresh(),version:'1.0.0',stage:5,asked:['machine'],answers:{opening:['wait']},water:'sip',contact:'leave',classifications:{machine:'Unresolved timing'},handoff:['observed','no-baseline','unknown']};
 globalThis.localStorage={getItem:()=>JSON.stringify(saved)};
 const restored=read();
 assert.equal(restored.stage,5);
 assert.deepEqual(restored.classifications,saved.classifications);
 assert.deepEqual(restored.handoff,saved.handoff);
 assert.deepEqual(restored.answers,saved.answers);
 delete globalThis.localStorage;
});
test('every possible question subset exposes only acquired facts and admits an honest handoff', () => {
 for (let mask=0;mask<2**questions.length;mask++) {
  const p = {...fresh(), asked: questions.filter((_,i)=>mask & (1<<i)).map(q=>q.id)};
  // Followups cannot exist without their parent in actual play.
  if (questions.some(q=>p.asked.includes(q.id)&&q.parent&&!p.asked.includes(q.parent))) continue;
  const chips=handoffChips(p), byId=id=>chips.find(c=>c.id===id);
  assert.equal(Boolean(byId('arm')),p.asked.includes('arm'));
  assert.equal(Boolean(byId('speech')),p.asked.includes('hands'));
  assert.equal(Boolean(byId('machine')),p.asked.includes('machine'));
  assert.equal(Boolean(byId('discovery')),p.asked.includes('discovery'));
  if(!p.asked.includes('hands')) assert.ok(!byId('morning')?.text.includes('left hand'));
  p.handoff=chips.filter(c=>!c.error).map(c=>c.id);
  assert.equal(handoffResult(p).accepted,true, String(mask));
  p.handoff.push('onset'); assert.equal(handoffResult(p).accepted,false);
 }
});
test('source evidence is unchanged by misclassification',()=>{
 const p={...fresh(),asked:['bedtime'],classifications:{bedtime:'Activity record'}};
 assert.equal(discovered(p)[0].source,'Linda · saw and talked');
 assert.equal(handoffChips(p).find(c=>c.id==='bedtime').text,'Linda saw him normal at bedtime, 2230.');
});
test('activation is credited correctly for all 128 action combinations',()=>{
 const options=['activate','glucose','assess','npo','iv','wait','rest'];
 for(let mask=0;mask<128;mask++){
  const p={...fresh(),answers:{opening:options.filter((_,i)=>mask&(1<<i))}};
  assert.equal(events(p)[0].actor,p.answers.opening.includes('activate')?'You':'Ana Reyes, charge nurse');
  assert.equal(events(p).some(e=>e.id==='glucose'),p.answers.opening.includes('glucose'));
 }
});
test('water correction retains original choice and credits current status to Ana',()=>{
 const p={...fresh(),answers:{opening:['npo']},water:'sip'};
 assert.equal(p.water,'sip');
 assert.ok(events(p).some(e=>e.id==='npo-initial'&&e.actor==='You'));
 assert.ok(handoffChips(p).some(c=>c.id==='npo-corrected'&&c.text.includes('Ana Reyes')));
 assert.ok(!handoffChips(p).some(c=>c.id==='npo-initial'));
});
test('nearby does not invent a phone number',()=>{
 const p={...fresh(),answers:{opening:['activate']},contact:'nearby'};
 assert.ok(!handoffChips(p).some(c=>c.text.includes('cell number')));
 assert.ok(events(p).some(e=>e.text.includes('Agrees to wait')));
});
test('equivalent baseline phrasings satisfy one requirement',()=>{
 const p={...fresh(),asked:['morning'],handoff:['observed','qualified','unknown']};
 assert.equal(handoffResult(p).accepted,true);
 p.handoff.push('morning');assert.equal(handoffResult(p).accepted,true);
});
test('no-history branch cannot deadlock and feedback does not supply missing answers',()=>{
 const p={...fresh(),handoff:['observed','no-baseline','unknown']};
 assert.equal(handoffResult(p).accepted,true);
 assert.equal(historyGaps(p).length,4);
 assert.ok(!handoffChips(p).filter(c=>!c.error).some(c=>c.text.includes('2230')||c.text.includes('0630')));
});
test('Rewind facts never enter original evidence or handoff',()=>{
 const p={...fresh(),rewinds:{breakfast:'baseline',camera:'qualified',neighbor:'activate'}};
 assert.deepEqual(discovered(p),[]);assert.deepEqual(handoffChips(p),handoffChips(fresh()));
});
test('malformed storage is contained',()=>{
 for(const val of [null,'broken',{version:VERSION,stage:5},{version:VERSION,stage:2,asked:['fake'],answers:{opening:['fake']}}]){
  globalThis.localStorage={getItem:()=>typeof val==='string'?val:JSON.stringify(val)};
  const p=read();assert.ok(p.stage>=0&&p.stage<=5);assert.ok(!p.asked.includes('fake'));
 }
 delete globalThis.localStorage;
});

test('restoring a save rejects orphan followups, hidden classifications and empty confirmations',()=>{
 const saved={...fresh(),stage:5,asked:['hands','arm','overnight'],answers:{opening:['invalid']},water:'hold',contact:'phone',handoff:['observed','speech','arm','unknown'],classifications:{bedtime:'Reported baseline or function'},limits:{bedtime:'Anything after bedtime'}};
 globalThis.localStorage={getItem:()=>JSON.stringify(saved)};
 const restored=read();
 assert.equal(restored.stage,1);
 assert.deepEqual(restored.asked,[]);
 assert.deepEqual(restored.classifications,{});
 assert.deepEqual(restored.limits,{});
 assert.ok(!handoffChips(restored).some(c=>['arm','speech','bedtime'].includes(c.id)));
 delete globalThis.localStorage;
});
test('opening omissions explain coordination without crediting omitted actions',()=>{
 const p={...fresh(),answers:{opening:['activate']}};
 assert.equal(openingGaps(p).length,4);
 assert.ok(openingGaps(p).some(text=>text.includes('glucose-related mimic')));
 assert.ok(!events(p).some(e=>e.id==='glucose'));
 p.answers.opening.push('glucose','assess','npo','iv');
 assert.deepEqual(openingGaps(p),[]);
});

 test('each essential handoff omission is detected without requiring optional detail',()=>{
 const p={...fresh(),asked:questions.map(q=>q.id),handoff:['observed','morning','arm','discovery','unknown']};
 assert.equal(handoffResult(p).accepted,true);
 for(const id of p.handoff){assert.equal(handoffResult({...p,handoff:p.handoff.filter(v=>v!==id)}).accepted,false,id);}
 });
 test('draft family responses cannot become completed actions',()=>{
 const p={...fresh(),answers:{opening:['activate']},waterDraft:'hold',contactDraft:'phone'};
 assert.ok(!events(p).some(e=>['npo','contact'].includes(e.id)));
 assert.ok(!handoffChips(p).some(c=>c.text.includes('cell number')));
 });
 test('preview progress migrates without rewriting original choices',()=>{
 const p={...fresh(),version:'0.2-preview.1',stage:3,answers:{opening:['wait']},water:'sip',contact:'leave'};
 globalThis.localStorage={getItem:()=>JSON.stringify(p)};
 const restored=read();assert.equal(restored.version,VERSION);assert.deepEqual(restored.answers,p.answers);assert.equal(restored.water,'sip');assert.equal(restored.contact,'leave');
 delete globalThis.localStorage;
 });
