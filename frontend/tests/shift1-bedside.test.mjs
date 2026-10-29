import test from 'node:test';
import assert from 'node:assert/strict';
import {scenario} from '../src/modules/the-shift/scenario.js';
import {bedsideRecord} from '../src/modules/the-shift/shift1/bedsideRecord.js';
import {freshProgress,sanitizeProgress,cueResult} from '../src/modules/the-shift/progress.js';
test('only actually revealed records appear; original committed marks take precedence',()=>{
 const p={...freshProgress(),revealed:['headache','breathing'],selected:['breathing'],answers:{cues:['headache','consciousness']}};const before=JSON.stringify(p);
 assert.deepEqual(bedsideRecord(p),scenario.cues.filter(c=>p.revealed.includes(c.id)).map(c=>({id:c.id,label:c.label,text:c.text,marked:c.id==='headache'})));
 assert.equal(JSON.stringify(p),before);assert(!JSON.stringify(bedsideRecord(p)).includes('essential'));
 assert(!bedsideRecord(p).some(c=>c.id==='consciousness'));
});
test('empty, sparse and extensive existing saves retain authored values and grading',()=>{
 assert.deepEqual(bedsideRecord(freshProgress()),[]);
 const p=sanitizeProgress({...freshProgress(),stage:4,revealed:scenario.cues.map(c=>c.id),selected:['breathing'],answers:{priority:'12',cues:['breathing'],action:'escalate'}});
 assert.deepEqual(bedsideRecord(p).map(c=>c.text),scenario.cues.map(c=>c.text));
 const grade=cueResult(p.answers.cues);bedsideRecord(p);assert.deepEqual(cueResult(p.answers.cues),grade);
 assert.deepEqual(bedsideRecord({revealed:['not-real'],selected:['breathing']}),[]);
 assert.equal(bedsideRecord({revealed:['breathing'],selected:['breathing']})[0].marked,true);
});
