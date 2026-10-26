import test from 'node:test';
import assert from 'node:assert/strict';
import { VERSION, TILES, CHOICES, HANDOFF, REPLAY, REWIND } from '../src/modules/the-shift/shift8/data.js';
import { opening, validSequence, fresh, variables, choices, submitChoice, goNext, stageList, board, now, finalCorrections, missingEssentials, validState, readStore, KEYS, LEGACY_KEYS, record } from '../src/modules/the-shift/shift8/engine.js';

test('learner corrections credit Jordan and recording is not inferred from scene arrival', () => {
  const s={...fresh(),stage:'given',opening:opening(['press','check','compress']),answers:{handoff:{},synthesis:['dose']}};
  assert.equal(finalCorrections(s).find(e=>e.id==='dose').correction,'Jordan gave one dose at 1415.');
  assert.ok(!record(s).some(e=>e.text.includes('You recorded')));
  s.answers.recordedEvent={actor:'Jordan',time:230,prompted:false};
  assert.ok(record(s).some(e=>e.text.includes('You recorded the completed event')));
  assert.ok(validState(s));
  s.answers.recordedEvent.actor='You';
  assert.equal(validState(s),false);
});

test('completed opening clock follows the full sequence, including restored old cursors', () => {
  for (const sequence of [['shout','press','check','compress'], ['wait'], [], ['check','compress']]) {
    const s={...fresh(),stage:'playback',opening:opening(sequence)};
    const expected=Math.max(2,...s.opening.events.map(e=>e.time));
    for(let i=0;i<s.opening.events.length;i++) { s.openingCursor=i; assert.equal(now(s),expected); }
  }
});

test('opening timestamps are calculated, including order and pauses', () => {
  for (const [sequence, cpr, activation] of [
    [['shout','press','check','compress'],15,5], [['press','shout','check','compress'],15,4],
    [['check','shout','press','compress'],15,15], [['check','press','shout','compress'],15,14],
    [['press','check','compress'],14,4], [['check','press','compress'],14,14],
    [['shout','check','compress','press'],13,15], [['check','compress'],12,35],
  ]) { const o = opening(sequence); assert.equal(o.cpr,cpr); assert.equal(o.activation,activation); assert.deepEqual(o.sequence,sequence); }
  assert.equal(opening(['shout','check','compress','press']).label,'Revisit');
  assert.equal(opening(['check','compress']).label,'Unsafe');
});
test('every legal ordered opening has coherent times, credit and retained errors', () => {
  let count=0;
  function visit(sequence) {
    if (!validSequence(sequence)) return;
    count++;
    const o=opening(sequence);
    for (const end of o.needsEndChoice ? ['compress','wait'] : [null]) {
      const r=opening(sequence,end);
      assert.ok(r.cpr>=12 && r.cpr<=40);
      assert.ok(r.events.every((e,i,a)=>!i||e.time>=a[i-1].time));
      assert.equal(r.path,sequence.includes('press')?'A':sequence.includes('shout')?'B':'C');
      assert.equal(r.cprActor,r.waiting?'Priya':'You');
      if(r.waiting) assert.equal(r.label,'Unsafe');
    }
    if(sequence.length<4) for(const tile of TILES) visit([...sequence,tile.id]);
  }
  visit([]); assert.ok(count>100);
});
test('wait/no check credits Priya, prompts do not rewrite original order', () => {
  const o=opening(['wait']); assert.equal(o.cpr,40); assert.equal(o.activation,33); assert.equal(o.cprActor,'Priya');
  assert.ok(o.events.some(e=>e.actor==='Priya'&&e.text.includes('checks')));
  const before=opening(['compress','check','press']); assert.equal(before.cpr,12); assert.ok(before.events.some(e=>e.prompted)); assert.deepEqual(before.sequence,['compress','check','press']);
  assert.equal(validSequence(['check','feel']),false); assert.equal(validSequence(['wait','compress']),false);
});
test('all authored main choices retain original responses and have a continuation', () => {
  for (const [key,options] of Object.entries(CHOICES)) for(const o of options) {
    const stage=key==='priyaWait'?'priya':key==='analysisAway'?'analysis':key;
    const s={...fresh(),stage,opening:opening(key==='priyaWait'?['wait']:['shout','press','check','compress']),staffing:key==='analysisAway'?'S2':'S1'};
    const n=submitChoice(s,o.id); assert.equal(n.answers[stage][0].id,o.id); assert.equal(n.feedback.label,o.label); assert.deepEqual(s.answers,{});
    assert.deepEqual(submitChoice(n,o.id),n);
    assert.ok(stageList(n).includes(goNext(n).stage));
  }
});
test('mask declined twice becomes one-person ventilation, accepted correction gets prompted credit', () => {
  const s={...fresh(),stage:'mask',staffing:'S1',opening:opening(['shout','press','check','compress'])};
  const first=submitChoice(s,'decline'); assert.equal(first.feedback.retry,true);
  const second=submitChoice(goNext(first),'decline'); assert.equal(second.feedback.retry,false);
  assert.match(board(second).find(r=>r.name==='Priya').task,/One-person/);
  const good=submitChoice(goNext(first),'hold'); assert.equal(good.answers.mask[0].id,'decline'); assert.equal(good.answers.mask[1].prompted,true);
});
test('late paths reorder moments chronologically and use 1416 medication', () => {
  const s={...fresh(),opening:opening(['check','compress']),staffing:'S1'};
  assert.equal(variables(s).given,240); assert.equal(variables(s).clock,'1416');
  const list=stageList(s); assert.ok(list.indexOf('time')<list.indexOf('safety')); assert.ok(list.indexOf('safety')<list.indexOf('page'));
  const stages=list.slice(list.indexOf('summary'),list.indexOf('debrief'));
  const times=stages.map(stage=>now({...s,stage})); assert.ok(times.every((t,i)=>!i||t>=times[i-1]));
});
test('board hidden away; acknowledgement is not completion; late rescue stays late', () => {
  let s={...fresh(),stage:'away',opening:opening(['shout','press','check','compress']),staffing:'S2'};
  assert.deepEqual(board(s),[]);
  s.stage='page'; s=submitChoice(s,'named');
  assert.match(board(s).find(r=>r.name==='Cardiology page').task,/acknowledged.*pending completion/);
  s.stage='given'; assert.match(board(s).find(r=>r.name==='Cardiology page').task,/Completed/);
  s.answers.page=[{id:'nothing'}]; assert.match(board(s).find(r=>r.name==='Cardiology page').task,/no one acknowledged/);
  s.stage='transport'; assert.match(board(s).find(r=>r.name==='Cardiology page').task,/Completed/);
});
test('every handoff combination and partial correction has a named resolution', () => {
  for(let mask=0;mask<3**5;mask++) {
    const s=fresh(); let m=mask; s.opening=opening(['check','compress']); s.answers.handoff={};
    for(const h of HANDOFF) { s.answers.handoff[h.id]=['good','bad','skip'][m%3]; m=Math.floor(m/3); }
    s.answers.synthesis=['dose']; s.corrections.synthesis=['stable'];
    const result=finalCorrections(s); assert.equal(result[0].actor,'You'); assert.equal(result[1].actor,'You (prompted)');
    assert.ok(result.every(e=>e.actor&&e.correction));
    assert.ok(result.filter(e=>e.actor==='Jordan').every(e=>e.correction.includes('1416')));
    assert.equal(missingEssentials(s).length,Object.values(s.answers.handoff).filter(x=>x==='skip').length);
  }
});
test('progress round-trip, malformed storage, and three isolated records', () => {
  const map=new Map(), store={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
  const s=fresh(); s.stage='opening'; s.drafts.opening=['press','check'];
  store.setItem(KEYS.main,JSON.stringify(s)); assert.deepEqual(readStore(store,'main').value,s);
  assert.equal(new Set(Object.values(KEYS)).size,3);
  assert.equal(readStore(store,'replay').value.version,VERSION); assert.equal(readStore(store,'rewind').value.version,'0.6');
  store.setItem(KEYS.main,'{'); assert.equal(readStore(store,'main').status,'blocked'); assert.equal(store.getItem(KEYS.main),'{');
  assert.equal(validState({...fresh(),stage:'garbage'}),false);
});
test('all replay/Rewind choices have feedback; no selectable doses', () => {
  for(const d of [...REPLAY,...REWIND]) for(const o of d.options) { assert.ok(o.feedback); assert.ok(o.label); assert.doesNotMatch(o.text,/milligram|\bmg\b|joules/i); }
  assert.ok(REWIND[0].scene.includes('1 milligram IV'));
});
test('record never discloses future events', () => {
  const s={...fresh(),stage:'time',opening:opening(['check','compress']),staffing:'S2'};
  assert.ok(record(s).every(e=>e.time<=195)); assert.ok(!record(s).some(e=>e.text.includes('epinephrine given')));
});

test('D-2 is sequential on S1, S2 and S3; original choices and clearance are independent', () => {
  for (const staffing of ['S1','S2','S3']) {
    for (const choice of staffing === 'S1' ? ['clear','touch'] : ['clear']) {
      let s={...fresh(),stage:'analysis',staffing,opening:opening(staffing==='S3'?['wait']:['press','check','compress'])};
      assert.equal(now(s),80);
      assert.equal(goNext(s).stage,'analysis');
      s=submitChoice(s,choice);
      assert.equal(now(s),82);
      assert.match(board(s).find(r=>r.name==='Priya').task,/operator.*charging/);
      assert.match(board(s).find(r=>r.name==='Marcus').task,/Compressions during charging/);
      const original=structuredClone(s.answers.analysis);
      s=goNext(s); assert.equal(s.stage,'clearance'); assert.equal(now(s),84);
      assert.equal(goNext(s).stage,'clearance');
      for (const clear of ['clear','touch']) {
        const result=submitChoice(s,clear);
        assert.equal(now(result),85);
        assert.deepEqual(result.answers.analysis,original);
        assert.equal(result.answers.clearance[0].id,clear);
        assert.match(result.answers.clearance[0].actor,/Priya.*shocks/);
        assert.equal(goNext(result).stage,'restartCPR');
        const rows=record(result);
        assert.ok(rows.some(r=>r.time===80&&r.text.includes('Original response')));
        assert.ok(rows.some(r=>r.time===84&&r.text.includes('Original response')));
        assert.ok(rows.some(r=>r.time===82&&r.text.includes('Marcus continues')));
        assert.ok(rows.some(r=>r.time===85&&r.actor==='Priya (shock) / Marcus (compressions)'));
        assert.ok(rows.every(r=>r.time<=85));
        assert.ok(validState(result));
      }
    }
  }
});

test('D-1 charging, clearance, intervention and shock preserve all four original safety responses', () => {
  for (const staffing of ['S1','S2','S3']) for(const choice of CHOICES.safety) {
    let s={...fresh(),stage:'charge',staffing,opening:opening(['press','check','compress'])};
    assert.equal(now(s),205);
    assert.match(board(s).find(r=>r.name==='Dr. Tran').task,/Compressions during charging/);
    assert.ok(!record(s).some(r=>r.time===210));
    s=goNext(s); assert.equal(now(s),209);
    assert.match(board(s).find(r=>r.name==='Dr. Tran').task,/Clear for shock/);
    assert.ok(!record(s).some(r=>r.text.includes('Shock 2 after')));
    s=submitChoice(s,choice.id);
    assert.equal(now(s),210);
    assert.equal(s.answers.safety[0].id,choice.id);
    assert.match(s.answers.safety[0].actor,['stop','leader'].includes(choice.id)?/You warned/:/Priya noticed/);
    assert.match(board(s).find(r=>r.name==='Dr. Tran').task,/^Compressions$/);
    assert.ok(record(s).some(r=>r.time===210&&r.text.includes('Shock 2 after contact cleared')));
  }
});

test('v0.7 main and replay bytes are untouched, never loaded or regraded; Rewind v0.6 stays readable', () => {
  const previous={version:'0.7',stage:'analysis',answers:{analysis:[{id:'touch',label:'Unsafe',text:'Keep compressing through the analysis'}]}};
  const map=new Map([[LEGACY_KEYS.main,JSON.stringify(previous)],[LEGACY_KEYS.replay,JSON.stringify({version:'0.7',index:1,answers:{clear:{id:'unchecked',label:'Unsafe'}},drafts:{}})],[KEYS.rewind,JSON.stringify({version:'0.6',index:1,answers:{a:REWIND[0].options[0]},drafts:{}})]]);
  const before=new Map(map),store={getItem:k=>map.get(k)||null};
  assert.equal(readStore(store,'main').value.version,VERSION);
  assert.equal(readStore(store,'replay').value.version,VERSION);
  assert.equal(readStore(store,'rewind').value.answers.a.id,'a1');
  assert.deepEqual(map,before);
  assert.notEqual(KEYS.main,LEGACY_KEYS.main);
  assert.notEqual(KEYS.replay,LEGACY_KEYS.replay);
  assert.equal(validState(previous),false);
});
