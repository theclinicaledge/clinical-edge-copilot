import { alarmChoices, alarmExplanations, monitorChoices, rhythmChoices, findings, actions, chips, recommendations } from './data.js';
export const KEY = 'ce-private-shift-monitor-r2';
export const fresh = () => ({ version: 1, stage: 0, answers: {}, revealed: [], selected: [], actionDraft: [], chipDraft: [], steps: [], closer: false, tomorrow: null });
const options = { alarm: alarmChoices, explanation: alarmExplanations, monitor: monitorChoices, rhythm: rhythmChoices, recommendation: recommendations };
const list = (value, ids) => Array.isArray(value) ? [...new Set(value.filter(id => ids.includes(id)))] : [];
export function sanitize(value) {
  if (!value || value.version !== 1) return fresh();
  const state = fresh();
  for (const [key, choices] of Object.entries(options)) if (choices.some(item => item.id === value.answers?.[key])) state.answers[key] = value.answers[key];
  for (const [key, choices] of Object.entries({ cues: findings, actions, chips })) {
    if (Array.isArray(value.answers?.[key])) state.answers[key] = list(value.answers[key], choices.map(item => item.id));
  }
  if (state.answers.actions?.length !== 3) delete state.answers.actions;
  state.revealed = list(value.revealed, findings.map(item => item.id));
  state.selected = list(value.selected, state.revealed);
  state.actionDraft = list(value.actionDraft, actions.map(item => item.id)).slice(0, 3);
  state.chipDraft = list(value.chipDraft, chips.map(item => item.id));
  if (!state.answers.actions?.includes('ecg')) {
    state.chipDraft = state.chipDraft.filter(id => id !== 'ecg');
    if (state.answers.chips) state.answers.chips = state.answers.chips.filter(id => id !== 'ecg');
  }
  state.steps = list(value.steps, ['regularity', 'p', 'qrs', 'rate']);
  state.closer = value.closer === true;
  state.tomorrow = ['Yes', 'Maybe', 'No'].includes(value.tomorrow) ? value.tomorrow : null;
  state.stage = Number.isInteger(value.stage) ? Math.max(0, Math.min(7, value.stage)) : 0;
  for (const [stage, required] of [[2, ['alarm']], [3, ['explanation']], [4, ['monitor', 'rhythm']], [5, ['cues']], [6, ['actions']], [7, ['chips', 'recommendation']]]) {
    if (state.stage >= stage && required.some(key => state.answers[key] === undefined)) { state.stage = stage - 1; break; }
  }
  return state;
}
export function read() { try { return sanitize(JSON.parse(localStorage.getItem(KEY))); } catch { return fresh(); } }
export function cueCounts(ids) {
  return { essential: findings.filter(item => item.tier === 'essential' && ids.includes(item.id)).length,
    supporting: findings.filter(item => item.tier === 'supporting' && ids.includes(item.id)).length + (ids.includes('pulse') ? 1 : 0) };
}
export function actionsComplete(ids) { return ids.length === 3 && ids.includes('notify') && ids.every(id => ['notify', 'stay', 'recheck', 'ecg'].includes(id)); }
export function missingCall(ids) { return chips.filter(item => item.tier === 'essential' && !ids.includes(item.id)); }
