import test from 'node:test';
import assert from 'node:assert/strict';
import { fresh, canSubmitDispatch, dispatchPlan, evaluateDispatch, evaluateCoverage, helpReasons, reportChips, evaluateReport, evaluateD5, primaryReason, ending, canFinish, dismissTeachingClaim } from '../src/modules/the-shift/shift5/rules.js';

const draft = (a412, a410, a416, direction = null, hold = null) => ({ assignments: { '412': a412, '410': a410, '416': a416 }, jordanDirection: direction, hold416: hold });

test('all five approved dispatch plans are bridge-free; originals remain unchanged', () => {
  const plans = [
    ['V1', draft('you', 'jordan', 'hold', 'A', 'A')],
    ['V2', draft('you', 'jordan', 'priya', 'A')],
    ['V3', draft('priya', 'jordan', 'you', 'A')],
    ['V4', draft('you', 'priya', 'hold', null, 'A')],
    ['V5', draft('priya', 'you', 'hold', null, 'A')],
  ];
  for (const [id, input] of plans) {
    assert.equal(canSubmitDispatch(input), true);
    assert.equal(dispatchPlan(input), id);
    const result = evaluateDispatch(input);
    assert.equal(result.storyPlan, id);
    assert.deepEqual(result.bridges, []);
    assert.deepEqual(result.submitted, input);
  }
});

test('staff cannot be double-booked and missing details block send', () => {
  assert.equal(canSubmitDispatch(draft('you', 'you', 'hold', null, 'A')), false);
  assert.equal(canSubmitDispatch(draft('you', 'jordan', 'hold', null, 'A')), false);
  assert.equal(canSubmitDispatch(draft('you', 'jordan', 'hold', 'A')), false);
});

test('unsafe dispatch retains every reason and bridges without rewriting submission', () => {
  const input = draft('jordan', 'you', 'hold', null, 'A');
  const output = evaluateDispatch(input);
  assert.deepEqual(output.reasons['412'], ['Outside role', 'Unsafe']);
  assert.equal(primaryReason(output.reasons['412']), 'Unsafe');
  assert.equal(output.storyPlan, 'V1');
  assert.equal(output.submitted.assignments['412'], 'jordan');
  assert.equal(output.bridges.length, 1);
  assert.equal(input.assignments['412'], 'jordan');
});

test('D3 acceptable overlaps, unsafe choices and V5 handling', () => {
  for (const id of ['A', 'B', 'C']) {
    const output = evaluateCoverage(id);
    assert.deepEqual(output.reasons, ['Accepted']);
    assert.equal(output.storyOption, id);
  }
  assert.deepEqual(evaluateCoverage('F').reasons, ['Outside role', 'Unsafe']);
  assert.equal(primaryReason(evaluateCoverage('F').reasons), 'Unsafe');
  assert.equal(evaluateCoverage('D').storyOption, 'A');
  assert.equal(evaluateCoverage('A', 'ii').storyOption, 'A');
  assert.deepEqual(evaluateCoverage('A', 'iii').v5Reasons, ['Unsafe']);
  assert.equal(evaluateCoverage('A', 'iii').bridges.length, 1);
});

test('observed-only reports never insert unseen drainage or a diagnosis', () => {
  assert.equal(reportChips([]).some(item => item.id === 'dressing'), false);
  assert.throws(() => evaluateReport(['dressing'], []), /Invalid/);
  const noDressing = evaluateReport([], []);
  assert.match(noDressing.line, /postoperative deterioration/);
  assert.doesNotMatch(noDressing.line + noDressing.saferLine, /bleeding|drainage/i);
  const seenButOmitted = evaluateReport(['trend'], ['dressing']);
  assert.doesNotMatch(seenButOmitted.line, /bleeding|drainage/i);
  assert.match(seenButOmitted.saferLine, /possible bleeding/);
  assert.deepEqual(seenButOmitted.missed, ['dressing']);
  const seenAndSaid = evaluateReport(['trend', 'dressing'], ['dressing']);
  assert.deepEqual(seenAndSaid.reasons, ['Accepted']);
  assert.match(seenAndSaid.line, /possible bleeding/);
  assert.doesNotMatch(seenAndSaid.line, /is bleeding/);
});

test('help remains immediate; delay and charge-only are not accepted', () => {
  assert.deepEqual(helpReasons(['provider']), ['Accepted']);
  assert.deepEqual(helpReasons(['rapid']), ['Accepted']);
  assert.deepEqual(helpReasons(['priya']), ['Revisit']);
  assert.deepEqual(helpReasons(['rounds']), ['Unsafe']);
  assert.deepEqual(helpReasons(['provider', 'recheck']), ['Unsafe']);
});

test('any-order final cards require explicit coverage acceptance', () => {
  const state = fresh();
  for (const id of ['416', '412', 'jordan', '414', 'coverage']) state.d5[id] = evaluateD5(id, 'accepted');
  assert.equal(canFinish(state), false);
  state.coverageAcknowledged = true;
  assert.equal(canFinish(state), true);
});

test('ending uses submitted reasons, not guided safer actions', () => {
  const state = fresh();
  state.d2 = evaluateDispatch(draft('you', 'jordan', 'hold', 'A', 'A'));
  state.d3 = evaluateCoverage('A');
  state.d4.help = { reasons: ['Accepted'] };
  state.d4.report = evaluateReport(['trend'], []);
  state.d4.checkback = { reasons: ['Accepted'] };
  for (const id of ['412', '414', 'coverage', '416', 'jordan']) state.d5[id] = evaluateD5(id, 'accepted');
  assert.equal(ending(state), 'A');
  state.d5['412'] = evaluateD5('412', 'other');
  assert.equal(ending(state), 'B');
  state.d3 = evaluateCoverage('F');
  assert.equal(ending(state), 'C');
  assert.equal(dismissTeachingClaim(state), true);
  state.d2 = evaluateDispatch(draft('you', 'jordan', 'priya', 'A'));
  assert.equal(dismissTeachingClaim(state), false);
});
