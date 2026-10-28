import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROOM14_VITALS } from '../src/modules/the-shift/shift6/data.js';
import { METRICS, elapsedMinutes, trendPoint, baselineChange } from '../src/modules/the-shift/shift6/trendGeometry.js';
test('all five observations retain true elapsed spacing across midnight', () => {
  assert.deepEqual(ROOM14_VITALS.map(v => elapsedMinutes(v.time)), [0,720,960,1200,1390]);
  for (const metric of METRICS) {
    const points=ROOM14_VITALS.map(v=>trendPoint(v,metric,348));
    assert.equal(points[0].x,34); assert.equal(points[4].x,334);
    assert.ok(Math.abs((points[1].x-34)/300-720/1390)<1e-10);
    assert.ok(points.every(p=>p.y>=8 && p.y<=52));
  }
});
test('numeric comparisons use admission and never supply a default choice',()=>{
  const base=ROOM14_VITALS[0];
  assert.deepEqual(METRICS.map(m=>baselineChange(ROOM14_VITALS[2],base,m.key)),['+16','-18','+2']);
  assert.deepEqual(METRICS.map(m=>baselineChange(ROOM14_VITALS[4],base,m.key)),['+38','-44','+8']);
  assert.equal(baselineChange(undefined,base,'hr'),null);
  assert.equal(baselineChange(ROOM14_VITALS[1],base,'rr'),'0');
});
