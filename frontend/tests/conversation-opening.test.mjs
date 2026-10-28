import test from 'node:test';
import assert from 'node:assert/strict';
import {opening} from '../src/modules/the-shift/conversation/data.js';
import {openingReactions} from '../src/modules/the-shift/conversation/openingReactions.js';
test('each authored opening has its own reaction and pose',()=>{
 assert.deepEqual(Object.keys(openingReactions),opening.map(choice=>choice.id));
 assert.equal(new Set(Object.values(openingReactions).map(r=>r.text)).size,opening.length);
 assert.equal(new Set(Object.values(openingReactions).map(r=>r.frame)).size,opening.length);
 assert.ok(Object.values(openingReactions).every(r=>r.text && r.arm && Number.isFinite(r.headY)));
});

test('reviewed revisions avoid inevitable responses and keep the leaving pose neutral',()=>{
 const reassure=opening.find(choice=>choice.id==='reassure').feedback;
 assert.match(reassure,/outcome you cannot know/);assert.doesNotMatch(reassure,/shuts the door|will stop|will make/i);
 const dinner=opening.find(choice=>choice.id==='dinner').feedback;
 assert.match(dinner,/Asking about appetite can be appropriate/);assert.match(dinner,/can sound judgmental/);
 assert.equal(openingReactions.leave.text,'He nods and stays as he was, holding the photograph.');
 assert.equal(openingReactions.leave.headY,0);assert.equal(openingReactions.leave.frame,'translate(0 0)');
});
