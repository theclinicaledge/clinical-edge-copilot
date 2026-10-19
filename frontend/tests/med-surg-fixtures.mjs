import { fresh as fresh5, evaluateDispatch, evaluateCoverage, evaluateReport, evaluateD5 } from '../src/modules/the-shift/shift5/rules.js';
import { freshProgress } from '../src/modules/the-shift/progress.js';
import { MAPPING_VERSION, VERSION } from '../src/modules/med-surg-track/content.js';
import { feedbackFor, mappedRecord } from '../src/modules/med-surg-track/evidence.js';
export function seedTrack({ a2Complete = true, help = 'provider', a1Wrong = false } = {}) {
  const state = { schema: 1, contentVersion: VERSION, mappingVersion: MAPPING_VERSION, assignments: {}, revision: 1 };
  const s1 = { ...freshProgress(), stage: 6, answers: { priority: '12', cues: a1Wrong ? ['saturation'] : ['consciousness', 'breathing'], action: 'escalate', abg: 'partial', sbar: 'a' } };
  const run1 = { sourceVersion: '2.1', snapshot: s1, hintBefore: [], completedAt: 1, decisions: {} };
  const add = (run, item) => { run.decisions[item.key] = { ...item, independent: item.assistance.length === 0, at: 1, mappingVersion: MAPPING_VERSION }; };
  add(run1, mappedRecord('a1', 'cues', s1.answers.cues, { answers: { priority: '12' } }));
  add(run1, mappedRecord('a1', 'action', 'escalate', s1)); add(run1, mappedRecord('a1', 'sbar', 'a', s1));
  state.assignments.a1 = { runs: [run1], card: feedbackFor('a1', run1), cardRecorded: true, rewind: { opened: 0, attempts: [], selected: null } };
  if (!a2Complete) return state;
  const s2 = fresh5(); s2.stage = 7; s2.d1 = { order: ['412', '414', '410', '416'], reason: 'due' };
  s2.d2 = evaluateDispatch({ assignments: { '412': 'you', '410': 'jordan', '416': 'hold' }, jordanDirection: 'A', hold416: 'A' }); s2.d3 = evaluateCoverage('A');
  s2.d4 = { ...s2.d4, phase: 3, help: { submitted: [help], reasons: [help === 'provider' ? 'Accepted' : 'Unsafe'], bridges: help === 'provider' ? [] : [{ text: 'Taking the safer approach: request help now.' }] }, report: evaluateReport(['trend'], []), checkback: { submitted: 'repeat', reasons: ['Accepted'], bridges: [] } };
  for (const id of ['412', '414', 'coverage', '416', 'jordan']) s2.d5[id] = evaluateD5(id, 'accepted'); s2.coverageAcknowledged = true;
  const run2 = { sourceVersion: '0.4', snapshot: s2, hintBefore: [], completedAt: 2, decisions: {} };
  add(run2, mappedRecord('a2', 'd3', s2.d3, s2)); add(run2, mappedRecord('a2', 'help', s2.d4.help, s2)); add(run2, mappedRecord('a2', 'report', s2.d4.report, s2));
  state.assignments.a2 = { runs: [run2], card: feedbackFor('a2', run2), cardRecorded: true, rewind: { opened: 0, attempts: [], selected: null } };
  return state;
}
