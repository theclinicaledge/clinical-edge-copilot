import { VERSION, title, assignment, d1, d2, d3, d4, d5, d6, finalScreen } from './data.js';

export const STORAGE_KEY = `ce-shift-stable-number-v${VERSION}`;
export const FINAL_STAGE = 7;
export const stages = [
  { time: assignment.time, label: 'Report', title, decision: null },
  { time: d1.time, label: 'Who first', title: 'Who first?', decision: 'd1' },
  { time: d2.time, label: 'Turning point', title: 'Find the turning point', decision: 'd2' },
  { time: d3.time, label: 'Bedside', title: 'What matters at the bedside', decision: 'd3' },
  { time: d4.time, label: 'Your call', title: "What's your call?", decision: 'd4' },
  { time: d5.time, label: 'SBAR', title: 'Build the call', decision: 'd5' },
  { time: d6.time, label: 'Room 16', title: 'Room 16 call light', decision: 'd6' },
  { time: '2030', label: 'Debrief', title: finalScreen, decision: null },
];

export const freshProgress = () => ({ version: 1, contentVersion: VERSION, stage: 0, viewed: [], revealed: [], selected: [], drafts: {}, sbarDraft: { chips: [], recommendation: null }, answers: {}, tomorrow: null });

const ids = items => items.map(item => item.id);
const safeList = (list, allowed) => Array.isArray(list) ? [...new Set(list.filter(id => allowed.includes(id)))] : [];
const oneOf = (value, allowed) => allowed.includes(value) ? value : undefined;
const safeSbar = value => ({ chips: safeList(value?.chips, ids(d5.chips)), recommendation: oneOf(value?.recommendation, ids(d5.recommendations)) ?? null });

export function sanitizeProgress(value) {
  if (!value || value.version !== 1 || value.contentVersion !== VERSION) return freshProgress();
  const cueIds = ids(d3.cues);
  const answers = {};
  const drafts = {};
  for (const [key, allowed] of [['d1', ids(d1.choices)], ['d2', ids(d2.choices)], ['d4', ids(d4.choices)], ['d6', ids(d6.choices)]]) {
    const answer = oneOf(value.answers?.[key], allowed);
    if (answer !== undefined) answers[key] = answer;
    const draft = oneOf(value.drafts?.[key], allowed);
    if (draft !== undefined) drafts[key] = draft;
  }
  if (Array.isArray(value.answers?.d3)) answers.d3 = safeList(value.answers.d3, cueIds);
  if (value.answers?.d5) {
    const sbar = safeSbar(value.answers.d5);
    if (sbar.recommendation) answers.d5 = sbar;
  }
  let stage = Number.isInteger(value.stage) ? Math.max(0, Math.min(FINAL_STAGE, value.stage)) : 0;
  for (const [requiredStage, key] of [[2, 'd1'], [3, 'd2'], [4, 'd3'], [5, 'd4'], [6, 'd5'], [7, 'd6']]) {
    if (stage >= requiredStage && answers[key] === undefined) { stage = requiredStage - 1; break; }
  }
  const revealed = safeList(value.revealed, cueIds);
  return {
    version: 1, contentVersion: VERSION, stage,
    viewed: safeList(value.viewed, assignment.patients.map(patient => patient.room)),
    revealed, selected: safeList(value.selected, revealed), drafts, sbarDraft: safeSbar(value.sbarDraft), answers,
    tomorrow: ['Yes', 'Maybe', 'No'].includes(value.tomorrow) ? value.tomorrow : null,
  };
}

export function readProgress() {
  try { return sanitizeProgress(JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch { return freshProgress(); }
}
