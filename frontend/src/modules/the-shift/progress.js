import { scenario } from './scenario.js';

export const STORAGE_KEY = 'ce-private-shift-drowsy-r2';
export const freshProgress = () => ({ version: 1, stage: 0, viewed: [], revealed: [], selected: [], answers: {}, tomorrow: null });
const choiceIds = {
  priority: ['12', '14', '9', 'charts'],
  action: scenario.actions.map(item => item.id),
  abg: scenario.interpretations.map(item => item.id),
  sbar: scenario.sbars.map(item => item.id),
};
export function sanitizeProgress(value) {
  if (!value || value.version !== 1) return freshProgress();
  const ids = scenario.cues.map(cue => cue.id);
  const safeList = (list, allowed) => Array.isArray(list) ? [...new Set(list.filter(id => allowed.includes(id)))] : [];
  const answers = {};
  for (const [key, allowed] of Object.entries(choiceIds)) if (allowed.includes(value.answers?.[key])) answers[key] = value.answers[key];
  if (Array.isArray(value.answers?.cues)) answers.cues = safeList(value.answers.cues, ids);
  let stage = Number.isInteger(value.stage) ? Math.max(0, Math.min(6, value.stage)) : 0;
  for (const [requiredStage, key] of [[2, 'priority'], [3, 'cues'], [4, 'action'], [5, 'abg'], [6, 'sbar']]) {
    if (stage >= requiredStage && answers[key] === undefined) { stage = requiredStage - 1; break; }
  }
  const revealed = safeList(value.revealed, ids);
  return { version: 1, stage, viewed: safeList(value.viewed, ['12', '14', '9']), revealed, selected: safeList(value.selected, revealed), answers, tomorrow: ['Yes', 'Maybe', 'No'].includes(value.tomorrow) ? value.tomorrow : null };
}
export function readProgress() {
  try { return sanitizeProgress(JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch { return freshProgress(); }
}
export function cueResult(selected) {
  return {
    essential: scenario.cues.filter(cue => cue.tier === 'essential' && selected.includes(cue.id)).length,
    supporting: scenario.cues.filter(cue => cue.tier === 'supporting' && selected.includes(cue.id)).length,
  };
}
