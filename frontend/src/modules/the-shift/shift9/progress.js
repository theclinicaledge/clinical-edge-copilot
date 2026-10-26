import { VERSION, title, assignment, d1, d2, d3, d4, d5, finalScreen, TOKENS, TARGETS } from './data.js';
import { validPlacement } from './rules.js';

export const STORAGE_KEY = `ce-shift-quiet-complaint-v${VERSION}`;
export const FINAL_STAGE = 6;
export const stages = [
  { time: assignment.time, label: 'Report', title, decision: null },
  { time: d1.time, label: 'Three at once', title: d1.title, decision: 'd1' },
  { time: d2.time, label: 'Then and now', title: d2.title, decision: 'd2' },
  { time: d3.time, label: '12-lead', title: d3.title, decision: 'd3' },
  { time: d4.time, label: 'Room 21', title: d4.title, decision: 'd4' },
  { time: d5.time, label: 'Room 23', title: d5.title, decision: 'd5' },
  { time: '1600', label: 'Debrief', title: finalScreen, decision: null },
];

export const freshProgress = () => ({ version: 1, contentVersion: VERSION, stage: 0, viewed: [], notes: [], closer: false, placement: {}, steps: [], drafts: {}, answers: {}, tomorrow: null });

const ids = items => items.map(item => item.id);
const safeList = (list, allowed) => Array.isArray(list) ? [...new Set(list.filter(id => allowed.includes(id)))] : [];
const oneOf = (value, allowed) => allowed.includes(value) ? value : undefined;
const safePlacement = value => Object.fromEntries(TOKENS.map(token => [token.id, oneOf(value?.[token.id], ids(TARGETS))]).filter(([, target]) => target));

export function sanitizeProgress(value) {
  if (!value || value.version !== 1 || value.contentVersion !== VERSION) return freshProgress();
  const answers = {};
  const drafts = {};
  if (validPlacement(value.answers?.d1)) answers.d1 = safePlacement(value.answers.d1);
  for (const [key, allowed] of [['d2', ids(d2.choices)], ['d3', ids(d3.choices)], ['d4', ids(d4.choices)], ['d5', ids(d5.choices)]]) {
    const answer = oneOf(value.answers?.[key], allowed);
    if (answer !== undefined) answers[key] = answer;
    const draft = oneOf(value.drafts?.[key], allowed);
    if (draft !== undefined) drafts[key] = draft;
  }
  let stage = Number.isInteger(value.stage) ? Math.max(0, Math.min(FINAL_STAGE, value.stage)) : 0;
  for (const [requiredStage, key] of [[2, 'd1'], [3, 'd2'], [4, 'd3'], [5, 'd4'], [6, 'd5']]) {
    if (stage >= requiredStage && answers[key] === undefined) { stage = requiredStage - 1; break; }
  }
  const rooms = assignment.patients.map(patient => patient.room);
  return {
    version: 1, contentVersion: VERSION, stage,
    viewed: safeList(value.viewed, rooms), notes: safeList(value.notes, rooms), closer: value.closer === true,
    placement: safePlacement(value.placement), steps: safeList(value.steps, d2.steps.map(([id]) => id)), drafts, answers,
    tomorrow: ['Yes', 'Maybe', 'No'].includes(value.tomorrow) ? value.tomorrow : null,
  };
}

export function readProgress() {
  try { return sanitizeProgress(JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch { return freshProgress(); }
}
