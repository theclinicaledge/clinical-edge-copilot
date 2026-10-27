import test from 'node:test';
import assert from 'node:assert/strict';
import { KEY, assessments, nursing } from '../src/modules/the-shift/shift10/content.js';
import { transition, restore, savePayload } from '../src/modules/the-shift/shift10/state.js';
import { newSession, sessionTransition as step, saveSession, readSession } from '../src/modules/the-shift/shift10/flow.js';
const report=()=>step(newSession(),{type:'start'});
function prepared(topics=[]){let v=report();if(topics.length)v=step(v,{type:'charge',topics});for(let i=0;i<5;i++)v=step(v,{type:'go-on'});return step(v,{type:'view-prepare'});}
const bedside=topics=>step(prepared(topics),{type:'view-receive'});
function assertInvestigation(v,actions){for(const action of actions){const before=v;v=step(v,action);assert.equal(v.moment,before.moment,action.type);assert.equal(v.state.phase,before.state.phase,action.type);assert.equal(v.state.segment,before.state.segment,action.type);assert.deepEqual(v.state,transition(before.state,action),'clinical result unchanged');}return v;}
test('report advances one segment at a time; arrival requires explicit preparation and receive controls',()=>{
 let v=report();assert.equal(step(v,{type:'view-prepare'}),v);assert.equal(step(v,{type:'view-receive'}),v);assert.equal(step(v,{type:'arrive'}),v);
 for(let i=1;i<6;i++){v=step(v,{type:'go-on'});assert.equal(v.state.segment,i);assert.equal(v.moment,'report');}
 const events=v.state.events;v=step(v,{type:'view-prepare'});assert.equal(v.state.events,events);assert.equal(v.state.phase,'report');assert.equal(v.moment,'preparation');
 assert.equal(step(v,{type:'go-on'}),v);v=step(v,{type:'view-receive'});assert.equal(v.moment,'assessment');assert.equal(v.state.phase,'bedside');assert.equal(v.state.path,'D');
});
test('report and preparation investigations cannot advance story, report segment or clinical phase',()=>{
 const actions=[{type:'tab',id:'Orders'},{type:'tab',id:'Rooms'},{type:'tab',id:'Chart'},{type:'chart',id:'meds'},{type:'ask',id:'pain'},{type:'ask',id:'pain-time'},{type:'pre-provider'},{type:'charge',topics:['telemetry']},{type:'flag',id:'telemetry'}];
 assertInvestigation(report(),actions);assertInvestigation(prepared(),actions);
});
for(const [path,topics] of [['A',['telemetry','isolation']],['B',['telemetry']],['C',['isolation']],['D',[]]])test(`path ${path}: investigations stay at bedside and retain clinical consequences`,()=>{
 let v=bedside(topics);assert.equal(v.state.path,path);
 const actions=[...assessments.map(a=>({type:'assess',id:a.id})),...nursing.filter(a=>a.id!=='recheck').map(a=>({type:'nursing',id:a.id})),{type:'reobserve'},{type:'contact',id:'charge-confusion'},{type:'contact',id:'charge-room'},{type:'contact',id:'infection'},{type:'document'},{type:'flag',id:'confusion'}];
 v=assertInvestigation(v,actions);assert.equal(v.state.path,path);assert.equal(step(v,{type:'finish'}),v);
 if(path==='B')assert.equal(v.state.raised.includes('isolation'),false);
});
test('early provider call, unknown request and callback never change the displayed major moment',()=>{
 let v=bedside();v=step(v,{type:'call-start',id:'admission'});assert.equal(v.moment,'assessment');assert.ok(v.state.call);
 assert.equal(step(v,{type:'view-communicate'}),v);
 v=step(v,{type:'call-answer',ids:['unknown']});assert.equal(v.moment,'assessment');assert.equal(v.state.call,null);assert.equal(v.state.calls[0].returned,'assessment');
 v=step(v,{type:'assess',id:'orientation'});assert.equal(v.state.events.at(-1).prompted,true);
 v=step(v,{type:'view-communicate'});assert.equal(v.moment,'communication');v=step(v,{type:'call-start',id:'confusion'});assert.equal(v.moment,'communication');assert.equal(v.state.calls.length,1);
});
test('learner can advance with all optional information missing; navigation earns no clinical actions',()=>{
 let v=bedside();assert.deepEqual(v.state.opened,[]);assert.deepEqual(v.state.assessed,[]);assert.deepEqual(v.state.raised,[]);
 const events=v.state.events;v=step(v,{type:'view-communicate'});assert.equal(v.state.events,events);assert.deepEqual(v.state.calls,[]);
 v=step(v,{type:'finish'});assert.equal(v.moment,'review');assert.equal(v.state.phase,'debrief');assert.deepEqual(v.state.actions,[]);
});
test('saved sessions resume each deliberate moment and the exact clinical event record',()=>{
 const data=new Map([['other-shift','keep']]);globalThis.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 try{
  const receiving=bedside();const values=[report(),prepared(),receiving,step(receiving,{type:'view-communicate'}),step(step(receiving,{type:'view-communicate'}),{type:'finish'})];
  for(const value of values){data.set(KEY,saveSession(value));assert.deepEqual(readSession(),value);assert.deepEqual(restore(JSON.parse(data.get(KEY))),value.state);}
  const active=step(receiving,{type:'call-start',id:'admission'});data.set(KEY,saveSession(active));assert.deepEqual(readSession(),active);
  data.set(KEY,savePayload(receiving.state));assert.equal(readSession().moment,'assessment');assert.deepEqual(readSession().state,receiving.state);
  data.set(KEY,JSON.stringify({...JSON.parse(saveSession(report())),navigation:'review'}));assert.equal(readSession().moment,'report');
  assert.equal(data.get('other-shift'),'keep');
 }finally{delete globalThis.localStorage;}
});
