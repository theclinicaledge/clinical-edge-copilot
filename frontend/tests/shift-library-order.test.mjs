import test from 'node:test';
import assert from 'node:assert/strict';
import { orderShiftsByNumber } from '../src/modules/the-shift/integrated/order.js';
import { resumableExperiences } from '../src/components/continueLearning.js';
test('numeric catalog ordering survives release order, padding and a later release',()=>{
 const entries=['10','09','8','11','02','1'].map(number=>({number}));const before=[...entries];
 assert.deepEqual(orderShiftsByNumber(entries).map(x=>x.number),['1','02','8','09','10','11']);assert.deepEqual(entries,before);
 assert.equal(orderShiftsByNumber(entries)[0],entries[5]);
});
test('equal and undesignated entries retain stable order without changing metadata',()=>{
 const entries=[{id:'a',number:'09'},{id:'future',number:'TBD'},{id:'b',number:'9'},{id:'unknown'}];
 assert.deepEqual(orderShiftsByNumber(entries).map(x=>x.id),['a','b','future','unknown']);
});
test('resume recency remains authoritative; undated ties follow numeric library order',()=>{
 const entries=orderShiftsByNumber([{id:'ten',number:'10'},{id:'nine',number:'09'},{id:'missing-time',number:'07',readProgress:()=>({updated:100})}]);
 assert.deepEqual(resumableExperiences(entries,()=> 'Continue: Next',200).map(x=>x.item.id),['missing-time','nine','ten']);
});
