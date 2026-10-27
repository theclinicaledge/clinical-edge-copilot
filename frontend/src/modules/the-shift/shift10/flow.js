import { KEY } from './content.js';
import { fresh, read, transition, savePayload } from './state.js';

// Navigation is saved separately from the clinical event record. It earns no credit.
export const moments = [
  ['report', 'ED report'], ['preparation', 'Prepare'], ['assessment', 'Receive Ruth'],
  ['communication', 'Assume care'], ['review', 'Review'],
];
export function normalizeMoment(state, requested) {
  if (state.phase === 'intro') return 'intro';
  if (state.phase === 'debrief') return 'review';
  if (state.phase === 'report') return requested === 'preparation' && state.segment === 5 ? 'preparation' : 'report';
  if (state.phase === 'bedside') {
    if (requested === 'assessment' || requested === 'communication') return requested;
    // Older attempts have no navigation field. Keep an active/past call discoverable.
    return state.call || state.calls.length ? 'communication' : 'assessment';
  }
  return 'intro';
}
export const newSession = () => ({ state: fresh(), moment: 'intro' });
export function readSession() {
  const state = read();
  let requested;
  try { requested = JSON.parse(localStorage.getItem(KEY))?.navigation; } catch { /* clinical read already contains storage errors */ }
  return { state, moment: normalizeMoment(state, requested) };
}
export function saveSession({ state, moment }) {
  return JSON.stringify({ ...JSON.parse(savePayload(state)), navigation: normalizeMoment(state, moment) });
}
export function sessionTransition(session, action) {
  const { state, moment } = session;
  if (action.type.startsWith('view-')) {
    if (state.call) return session;
    if (action.type === 'view-prepare' && moment === 'report' && state.segment === 5) return { state, moment: 'preparation' };
    if (action.type === 'view-report' && moment === 'preparation') return { state, moment: 'report' };
    if (action.type === 'view-receive' && moment === 'preparation') {
      const next = transition(state, { type: 'arrive' });
      return next === state ? session : { state: next, moment: 'assessment' };
    }
    if (action.type === 'view-communicate' && moment === 'assessment') return { state, moment: 'communication' };
    if (action.type === 'view-assess' && moment === 'communication') return { state, moment: 'assessment' };
    return session;
  }
  // The UI cannot bypass preparation or close care from an investigation panel.
  if (action.type === 'arrive' || (action.type === 'finish' && moment !== 'communication') || (action.type === 'go-on' && moment !== 'report')) return session;
  const next = transition(state, action);
  return next === state ? session : { state: next, moment: normalizeMoment(next, moment) };
}
