import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ASSIGNMENTS, REWINDS } from '../src/modules/med-surg-track/content.js';
import { a3Records, callRecord, comparison, feedbackFor, mappedRecord } from '../src/modules/med-surg-track/evidence.js';
import { KEY, clearRecord, commitHandoff, currentRun, editHandoff, firstRun, fresh, load, markHint, persist, record, restart, rewindResult, start, submitHandoff, submitRewind, transact } from '../src/modules/med-surg-track/store.js';
import { evaluateCoverage, evaluateDispatch, evaluateReport, fresh as fresh5 } from '../src/modules/the-shift/shift5/rules.js';
import { configure, capture, trackEvent } from '../src/productAnalytics.js';
import { saveConsent } from '../src/consent.js';
let data;
beforeEach(() => {
  data = new Map();
  globalThis.localStorage = { getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
  globalThis.window = { localStorage, location: { pathname: '/learn/med-surg', search: '' }, dispatchEvent() {} };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { webdriver: false } });
  clearRecord();
});
const independent = item => ({ ...item, independent: !item.assistance.length, at: 1 });
function complete1() { start('a1'); record('a1', 'cues', ['consciousness', 'breathing'], { answers: { priority: '12' } }); persist('a1', { ...currentRun(load().value, 'a1').snapshot, stage: 6 }); }
function a2Context() {
  const state = fresh5();
  state.d2 = evaluateDispatch({ assignments: { '412': 'you', '410': 'jordan', '416': 'hold' }, jordanDirection: 'A', hold416: 'A' });
  state.d3 = evaluateCoverage('A'); state.d4.help = { submitted: ['provider'], reasons: ['Accepted'], bridges: [] };
  return state;
}
function complete2() {
  start('a2'); const context = a2Context();
  record('a2', 'd3', context.d3, context);
  record('a2', 'help', context.d4.help, context);
  record('a2', 'report', evaluateReport(['trend'], []), context);
  persist('a2', { ...context, stage: 7 });
}
test('A1 later choices after cue teaching cannot support Strong or an independent deficit', () => {
  const run = { decisions: {} };
  run.decisions.cues = independent(mappedRecord('a1', 'cues', ['consciousness', 'breathing'], { answers: {} }));
  run.decisions.action = independent(mappedRecord('a1', 'action', 'sleep', { answers: { cues: ['consciousness', 'breathing'] } }));
  run.decisions.sbar = independent(mappedRecord('a1', 'sbar', 'a', {}));
  assert.equal(feedbackFor('a1', run).kind, 'observed');
  assert.equal(run.decisions.action.independent, false);
  assert.equal(feedbackFor('a1', { decisions: { action: run.decisions.action } }), null);
});
test('missing evidence and hint-only exposure never imply success or weakness', () => {
  start('a1'); markHint('a1'); record('a1', 'cues', ['saturation'], { answers: {} });
  assert.equal(feedbackFor('a1', firstRun(load().value, 'a1')), null);
  assert.equal(feedbackFor('a2', { decisions: {} }), null);
  const context = a2Context(); const entry = independent(mappedRecord('a2', 'help', context.d4.help, context));
  assert.equal(feedbackFor('a2', { decisions: { help: entry } }).kind, 'observed');
});
test('strong requires every mapped part; unsafe first then C3 takes recommendation priority', () => {
  const c = a2Context(), decisions = {
    d3: independent(mappedRecord('a2', 'd3', c.d3, c)),
    help: independent(mappedRecord('a2', 'help', c.d4.help, c)),
    report: independent(mappedRecord('a2', 'report', evaluateReport(['trend'], []), c)),
  };
  assert.equal(feedbackFor('a2', { decisions }).kind, 'strong');
  delete decisions.report;
  assert.equal(feedbackFor('a2', { decisions }).kind, 'observed');
  decisions.d3 = independent(mappedRecord('a2', 'd3', evaluateCoverage('D'), c));
  decisions.help = independent(mappedRecord('a2', 'help', { submitted: ['rounds'], reasons: ['Unsafe'], bridges: [] }, c));
  assert.equal(feedbackFor('a2', { decisions }).component, 'C3');
  decisions.help.label = 'Revisit';
  assert.equal(feedbackFor('a2', { decisions }).component, 'C3');
});
test('prior bridges exclude downstream evidence without replacing original submissions', () => {
  const c = a2Context(); c.d3 = evaluateCoverage('E');
  const help = independent(mappedRecord('a2', 'help', c.d4.help, c));
  assert.equal(help.independent, false);
  assert.match(help.assistance.join(), /D3 safer/);
  c.d2.bridges = [{ text: 'Earlier dispatch correction' }];
  assert.equal(independent(mappedRecord('a2', 'd3', evaluateCoverage('A'), c)).independent, false);
});
test('locked first action, submitted reasoning and retries survive resume separately', () => {
  complete1(); complete2(); start('a3');
  editHandoff(s => { s.callDraft = 'notify'; }); commitHandoff();
  const original = structuredClone(firstRun(load().value, 'a3').decisions.call);
  editHandoff(s => { s.callDraft = 'escalate'; }); commitHandoff();
  assert.deepEqual(firstRun(load().value, 'a3').decisions.call, original);
  editHandoff(s => { s.concern = 'acute'; s.findings = ['confusion', 'rr']; }); submitHandoff();
  assert.equal(firstRun(load().value, 'a3').snapshot.committed.call, 'notify');
  restart('a3'); editHandoff(s => { s.callDraft = 'escalate'; }); commitHandoff();
  assert.equal(currentRun(load().value, 'a3').decisions.call.independent, false);
  assert.deepEqual(firstRun(load().value, 'a3').decisions.call, original);
});
test('reasonable acute alternatives require linked case evidence, no single diagnosis wins', () => {
  for (const [concern, findings] of [['infection', ['temperature', 'rr']], ['dehydration', ['hr', 'bp']], ['acute', ['confusion', 'rr']], ['medication', ['confusion', 'bp']], ['glucose', ['confusion', 'hr']]]) {
    const entries = a3Records({ concern, findings }); assert.ok(entries.every(e => e.label === 'Accepted'), concern);
  }
  assert.equal(a3Records({ concern: 'tired', findings: ['confusion', 'rr'] })[1].label, 'Revisit');
  assert.equal(a3Records({ concern: 'infection', findings: ['pillow', 'menu'] })[0].label, 'Revisit');
  assert.equal(callRecord('reassess').label, 'Unsafe');
  assert.equal(callRecord('notify').label, 'Revisit');
});
test('comparison uses most recent relevant original, never assisted retry or guided Rewind', () => {
  complete1(); complete2(); start('a3');
  transact(state => { const run = state.assignments.a2.runs[0]; run.decisions.help.label = 'Unsafe'; state.assignments.a2.card = feedbackFor('a2', run); });
  editHandoff(s => { s.callDraft = 'escalate'; }); commitHandoff(); editHandoff(s => { s.concern = 'acute'; s.findings = ['confusion', 'rr']; }); submitHandoff();
  let c = comparison(load().value); assert.equal(c.priorId, 'a2'); assert.equal(c.component, 'C3'); assert.equal(c.outcome, 'improvement');
  restart('a2'); assert.equal(comparison(load().value).left[0].label, 'Unsafe');
  submitRewind('a2', 'a2-trend', 'escalate');
  c = comparison(load().value); assert.equal(c.left[0].label, 'Unsafe'); assert.equal(c.practiceTried, true);
  transact(state => { state.assignments.a3.runs[0].decisions.call.independent = false; });
  assert.equal(comparison(load().value).outcome, 'insufficient');
});
test('fallback comparison acknowledges supported consistency, and proxy differences are disclosed', () => {
  complete1(); complete2(); start('a3');
  editHandoff(s => { s.callDraft = 'escalate'; }); commitHandoff(); editHandoff(s => { s.concern = 'acute'; s.findings = ['confusion', 'rr']; }); submitHandoff();
  assert.equal(comparison(load().value).outcome, 'consistency');
  transact(state => { state.assignments.a2.card = { kind: 'practice', component: 'C2' }; state.assignments.a2.runs[0].decisions.d3.label = 'Revisit'; });
  assert.equal(comparison(load().value).outcome, 'different-format');
});
test('version mismatch and malformed JSON remain intact, with no rescoring or silent reset', () => {
  const raw = JSON.stringify({ ...fresh(), contentVersion: 'old' }); data.set(KEY, raw);
  assert.equal(load().blocked, true); start('a1'); assert.equal(data.get(KEY), raw);
  data.set(KEY, '{corrupt'); assert.equal(load().raw, '{corrupt');
});
test('unavailable storage keeps in-session originals and reports the failure', () => {
  localStorage.setItem = () => { throw Error('quota'); };
  start('a1'); record('a1', 'cues', ['saturation'], { answers: {} });
  assert.equal(load().status, 'unavailable');
  assert.deepEqual(firstRun(load().value, 'a1').decisions.cues.value, ['saturation']);
  restart('a1'); assert.equal(load().value.assignments.a1.runs.length, 2);
});
test('Rewind has coherent non-urgent responses and specific-information requirements', () => {
  for (const id of ['a1', 'a2', 'a3']) {
    assert.equal(REWINDS[id].length, 3);
    assert.ok(new Set(REWINDS[id].map(v => v.preferred)).size > 1);
    for (const v of REWINDS[id]) {
      assert.ok(v.history && v.facts.length >= 3 && v.sources.length);
      assert.equal(rewindResult(v, v.preferred, v.info[0]).label, 'Accepted');
    }
  }
  assert.equal(rewindResult(REWINDS.a2[2], 'information', 'glucose').label, 'Revisit');
  assert.equal(rewindResult(REWINDS.a2[2], 'information', 'wound').label, 'Accepted');
  assert.equal(rewindResult(REWINDS.a3[2], 'escalate').label, 'Revisit');
  assert.equal(ASSIGNMENTS.map(a => a.id).join(), 'a1,a2,a3');
});
test('track paths suppress all analytics with consent, without changing other-page controls', () => {
  let sent = 0; globalThis.fetch = () => { sent++; return Promise.resolve({ ok: true }); };
  saveConsent({ ai: true, analytics: true }); configure({ token: 'phc_not_a_real_testing_project', host: 'https://us.i.posthog.com' });
  for (const path of ['/learn/med-surg', '/learn/med-surg/a1', '/learn/med-surg/a3']) { window.location.pathname = path; assert.equal(capture('ask_submitted', { reasoning: 'private', results: 'private' }), false); assert.equal(trackEvent('rhythm_practice_opened'), false); }
  assert.equal(sent, 0); window.location.pathname = '/ask'; assert.equal(capture('ask_submitted'), true); assert.equal(sent, 1);
});

test('A1 actual priority feedback also prevents inferring unaided cue selection', () => {
  const cue = independent(mappedRecord('a1', 'cues', ['consciousness', 'breathing'], { answers: { priority: '12' } }));
  assert.equal(cue.independent, false);
  assert.equal(feedbackFor('a1', { decisions: { cues: cue } }), null);
});

test('a reporting difficulty cannot be erased by comparing a different help action', () => {
  complete1(); complete2(); start('a3');
  transact(state => { const run = state.assignments.a2.runs[0]; run.decisions.report.label = 'Revisit'; state.assignments.a2.card = feedbackFor('a2', run); });
  editHandoff(s => { s.callDraft = 'escalate'; }); commitHandoff(); editHandoff(s => { s.concern = 'acute'; s.findings = ['confusion', 'rr']; }); submitHandoff();
  const c = comparison(load().value); assert.equal(c.left[0].key, 'report'); assert.equal(c.outcome, 'different-format');
});


test('mapping, source-version and malformed source structures block without replacing bytes', () => {
  for (const mutate of [
    state => { state.mappingVersion = 'unknown'; },
    state => { state.assignments.a1.runs[0].sourceVersion = 'other'; },
    state => { state.assignments.a1.runs[0].snapshot.selected = null; },
    state => { state.assignments.a1.runs[0].decisions.cues.mappingVersion = 'old'; },
  ]) {
    clearRecord(); complete1(); const state = load().value; mutate(state);
    const raw = JSON.stringify(state); data.set(KEY, raw);
    assert.equal(load().blocked, true); start('a2'); assert.equal(data.get(KEY), raw);
  }
});

test('source submissions and evidence are committed atomically before screen persistence', () => {
  start('a1');
  record('a1', 'priority', '14', currentRun(load().value, 'a1').snapshot);
  assert.equal(firstRun(load().value, 'a1').snapshot.answers.priority, '14');
  record('a1', 'cues', ['saturation'], currentRun(load().value, 'a1').snapshot);
  const run = firstRun(load().value, 'a1');
  assert.deepEqual(run.snapshot.answers.cues, run.decisions.cues.value);
  assert.equal(run.decisions.cues.independent, false);
  complete1(); start('a2'); const before = currentRun(load().value, 'a2').snapshot;
  const result = evaluateCoverage('D'); record('a2', 'd3', result, before);
  assert.deepEqual(firstRun(load().value, 'a2').snapshot.d3.submitted, { option: 'D', v5Step: null });
  const help = { submitted: ['provider'], reasons: ['Accepted'], bridges: [] };
  record('a2', 'help', help, currentRun(load().value, 'a2').snapshot);
  assert.equal(firstRun(load().value, 'a2').snapshot.d4.phase, 1);
  record('a2', 'd3', evaluateCoverage('A'), before);
  assert.equal(firstRun(load().value, 'a2').snapshot.d3.submitted.option, 'D');
});
