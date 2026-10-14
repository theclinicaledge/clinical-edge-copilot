import { startChoices, teachChoices, fixChoices, documents, actions } from './data.js';
export const KEY = 'ce-private-shift-discharge-v02';
export const fresh = () => ({ version: '0.2', stage: 0, answers: {}, flags: [], actionDraft: [], inspected: [], noteOpened: false, tomorrow: null });
const lines = documents.flatMap(doc => doc.lines.map(([id]) => id));
const list = (value, allowed) => Array.isArray(value) ? [...new Set(value.filter(id => allowed.includes(id)))] : [];
export const conflictFound = ids => ['stop-apixaban', 'continue-thinner', 'resume-all'].every(id => ids.includes(id));
export const actionsComplete = ids => ids.length === 2 && ids.includes('provider') && ids.every(id => ['provider', 'charge', 'pharmacist'].includes(id));
export function sanitize(value) {
  if (!value || value.version !== '0.2') return fresh();
  const state = fresh();
  for (const [key, choices] of Object.entries({ start: startChoices, teach: teachChoices, fix: fixChoices })) {
    if (choices.some(item => item.id === value.answers?.[key])) state.answers[key] = value.answers[key];
  }
  if (Array.isArray(value.answers?.flags)) state.answers.flags = list(value.answers.flags, lines);
  if (Array.isArray(value.answers?.actions)) {
    const selected = list(value.answers.actions, actions.map(item => item.id));
    if (selected.length === 2) state.answers.actions = selected;
  }
  state.flags = list(value.flags, lines);
  state.actionDraft = list(value.actionDraft, actions.map(item => item.id)).slice(0, 2);
  state.inspected = list(value.inspected, ['lasix', 'furosemide']);
  if (state.inspected.length !== 2) delete state.answers.fix;
  state.noteOpened = value.noteOpened === true;
  state.tomorrow = ['Yes', 'Maybe', 'No'].includes(value.tomorrow) ? value.tomorrow : null;
  state.stage = Number.isInteger(value.stage) ? Math.max(0, Math.min(6, value.stage)) : 0;
  for (const [stage, key] of [[2, 'start'], [3, 'flags'], [4, 'actions'], [5, 'teach'], [6, 'fix']]) {
    if (state.stage >= stage && state.answers[key] === undefined) { state.stage = stage - 1; break; }
  }
  return state;
}
export function read() { try { return sanitize(JSON.parse(localStorage.getItem(KEY))); } catch { return fresh(); } }
export function save(state) { try { localStorage.setItem(KEY, JSON.stringify(sanitize(state))); return true; } catch { return false; } }
export function reviewResults(answers) {
  return [answers.start === 'compare', conflictFound(answers.flags || []), actionsComplete(answers.actions || []), answers.teach === 'show', answers.fix === 'confirm'];
}
