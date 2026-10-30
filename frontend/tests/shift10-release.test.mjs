import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { SHIFTS, progressLabel } from '../src/modules/the-shift/integrated/registry.js';
import { SHIFT_IDS, shiftRoute } from '../src/modules/the-shift/routing.js';
import { KEY } from '../src/modules/the-shift/shift10/content.js';
import { fresh, savePayload, transition } from '../src/modules/the-shift/shift10/state.js';
const item = SHIFTS.find(s => s.id === 'transfer-not-ready');
test('release registers Shift 10 once and preserves the existing eight public scenarios', () => {
  const existing = ['drowsy-patient','monitor-alarm','discharge-puzzle','conversation','which-patient-first','stable-number','missing-time','code-blue'];
  assert.deepEqual(SHIFTS.slice(0,8).map(s=>s.id),existing);
  for (const id of [...existing,item.id]) assert.deepEqual(shiftRoute(`/learn/shifts/${id}`),{kind:'scenario',id});
  assert.equal(SHIFTS.filter(s=>s.id===item.id).length,1);
  assert.equal(item.number,'10'); assert.equal(item.scenarioId,'SHIFT-010');
  assert.equal(new Set(SHIFTS.map(s=>s.storageKey)).size,SHIFTS.length);
  assert.ok(SHIFT_IDS.includes(item.id));
});
test('library progress uses the unchanged event replay and preserves unrelated saves', () => {
  const saved = new Map([['existing-save','unchanged']]);
  globalThis.localStorage={getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value)};
  try {
    assert.equal(progressLabel(item),'Not started');
    let state=transition(fresh(),{type:'start'}); saved.set(KEY,savePayload(state));
    assert.equal(progressLabel(item),'Continue: ED report');
    for(let i=0;i<5;i++) state=transition(state,{type:'go-on'});
    state=transition(state,{type:'arrive'}); saved.set(KEY,savePayload(state));
    assert.equal(progressLabel(item),'Continue: Receiving care');
    state=transition(state,{type:'finish'});saved.set(KEY,savePayload(state));
    assert.equal(progressLabel(item),'Debrief reached');
    assert.equal(saved.get('existing-save'),'unchanged');
  } finally { delete globalThis.localStorage; }
});
test('release retains protected clinical code and permits consented usage analytics', () => {
  const sha=file=>createHash('sha256').update(readFileSync(new URL(`../src/modules/the-shift/shift10/${file}`,import.meta.url))).digest('hex');
  assert.equal(sha('content.js'),'0ae53d808bb0bb89c1f8c34b84f8fdaa334bd5d8119fc4cc2a89d5cdf2b377ee');
  assert.equal(sha('state.js'),'d290970b56daed6b244c25eb5753aac1105e7b95ffb3792fae874f50f0d024d7');
  assert.equal(item.analytics,true); assert.equal(item.review.reviewer,null); assert.equal(item.review.reviewDate,null);
  assert.match(item.review.status,/Founder reports independent clinical review/);
  assert.match(item.review.sourceVerification,/No signed reviewer record/);
  assert.ok(item.sources.every(s=>s.url.startsWith('https://')&&s.limitation));
});
