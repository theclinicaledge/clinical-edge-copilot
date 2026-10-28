import test from 'node:test';
import assert from 'node:assert/strict';
import {rrIntervals,earlierSpacing,caliperSegments,tracingDescription} from '../src/modules/the-shift/monitor/ecg/caliper.js';
import {STRIPS,PLOT,CALIBRATION,pathFor} from '../src/modules/the-shift/monitor/ecg/waveforms.js';
test('calipers measure existing adjacent R coordinates, without classification or signal changes',()=>{
 const before=pathFor('E');const intervals=rrIntervals('E');assert.equal(intervals.length,STRIPS.E.beats.length-1);
 assert.equal(earlierSpacing(),60/84);
 intervals.forEach((pair,i)=>{assert.equal(pair.start,STRIPS.E.beats[i].r);assert.equal(pair.end,STRIPS.E.beats[i+1].r);assert.equal(pair.seconds,pair.end-pair.start);
  const start=Math.max(0,Math.min(3,Math.floor(pair.start)));
  const segments=caliperSegments(pair,start,start+3);assert.equal(segments.length,2);assert.ok(Math.abs(segments[1].to-segments[1].from-earlierSpacing())<1e-12);
 });
 assert.notEqual(intervals[0].seconds,intervals[1].seconds);assert.equal(pathFor('E'),before);
 assert.deepEqual([CALIBRATION.mmPerSecond,CALIBRATION.mmPerMv,PLOT.unitsPerSecond,PLOT.unitsPerMv],[25,10,100,40]);
});
test('split rows never draw a false clipped interval across their boundary',()=>{
 const pair=rrIntervals('E').find(p=>p.start<3 && p.end>3);assert.ok(pair);
 assert.equal(caliperSegments(pair,0,3).length,0);assert.equal(caliperSegments(pair,3,6).length,0);
 assert.equal(caliperSegments(pair,2,5).length,2);
});

test('diagnostic description is deferred without changing approved observations or committed wording',()=>{
 assert.doesNotMatch(tracingDescription('E'),/atrial fibrillation/i);
 assert.match(tracingDescription('E'),/Irregularly irregular R-to-R intervals/);
 assert.equal(tracingDescription('E',true),STRIPS.E.alt);
 assert.equal(tracingDescription('C'),STRIPS.C.alt);
});
