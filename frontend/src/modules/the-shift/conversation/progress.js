import { CONTENT_VERSION, opening, asking, confidentiality, actions, cues, zones, reflections, script } from './data.js';
export const KEY = 'ce-private-shift-conversation-v04';
export const LEGACY_KEY = 'ce-private-shift-conversation-v02';
export const fresh = () => ({ version: CONTENT_VERSION, notice: false, stage: 0, answers: {}, revealed: 0, selected: [], placements: {}, tomorrow: null });
const choiceSets = { opening, asking, confidentiality };
const ids = items => items.map(item => item.id);
const list = (value, allowed) => Array.isArray(value) ? [...new Set(value.filter(id => allowed.includes(id)))] : [];
export function validPlacements(value) {
  return Object.fromEntries(actions.filter(item => zones.some(zone => zone.id === value?.[item.id])).map(item => [item.id, value[item.id]]));
}
export function sanitize(value) {
  if (!value || value.version !== CONTENT_VERSION) return fresh();
  const state = fresh();
  state.notice = value.notice === true;
  for (const [key, choices] of Object.entries(choiceSets)) {
    if (ids(choices).includes(value.answers?.[key])) state.answers[key] = value.answers[key];
  }
  state.revealed = Number.isInteger(value.revealed) ? Math.max(0, Math.min(cues.length, value.revealed)) : 0;
  state.selected = list(value.selected, ids(cues.slice(0, state.revealed)));
  if (Array.isArray(value.answers?.cues) && state.revealed === cues.length) state.answers.cues = list(value.answers.cues, ids(cues));
  state.placements = validPlacements(value.placements);
  const submitted = validPlacements(value.answers?.actions);
  if (Object.keys(submitted).length === actions.length) state.answers.actions = submitted;
  state.tomorrow = ['Yes', 'Maybe', 'No'].includes(value.tomorrow) ? value.tomorrow : null;
  state.stage = state.notice && Number.isInteger(value.stage) ? Math.max(0, Math.min(6, value.stage)) : 0;
  for (const [stage, key] of [[2, 'opening'], [3, 'cues'], [4, 'asking'], [5, 'actions'], [6, 'confidentiality']]) {
    if (state.stage >= stage && state.answers[key] === undefined) { state.stage = stage - 1; break; }
  }
  return state;
}
export function read() { try { return sanitize(JSON.parse(localStorage.getItem(KEY))); } catch { return fresh(); } }
export function save(value) { try { localStorage.setItem(KEY, JSON.stringify(sanitize(value))); return true; } catch { return false; } }
export const actionReview = placements => actions.map(item => {
  const chosen = placements?.[item.id];
  const result = item.placements.find(rule => rule.groups.includes(chosen));
  return { ...item, chosen, status: result?.status || 'Revisit', feedback: result?.feedback || 'This action has not been placed.', acceptedGroups: item.placements.filter(rule => rule.status === 'Accepted').flatMap(rule => rule.groups) };
});
export const hasUnsafeActions = placements => actionReview(placements).some(item => item.status === 'Unsafe');
export const usesSaferEnding = answers => answers.opening !== 'presence' || answers.asking !== 'direct' || answers.confidentiality !== 'honest' || Object.keys(validPlacements(answers.actions)).length !== actions.length || hasUnsafeActions(answers.actions);
export function reviewResults(answers) {
  return [answers.opening === 'presence', ['burden', 'watch'].every(id => answers.cues?.includes(id)), answers.asking === 'direct',
    actionReview(answers.actions).every(item => item.status === 'Accepted'), answers.confidentiality === 'honest'];
}
export function reviewText(index, answers) {
  // The authored priority rules use original selections, never the guided story.
  if (index === 3) {
    const placed = validPlacements(answers.actions);
    if (['charge', 'pump'].some(id => placed[id] && placed[id] !== 'not-now')) return script.actionReflections[0];
    if (['stay', 'notify', 'means'].some(id => placed[id] === 'not-now')) return script.actionReflections[1];
    if (Object.keys(placed).length !== actions.length) return reflections[3][2];
    return script.actionReflections[reviewResults(answers)[3] ? 3 : 2];
  }
  return reflections[index][reviewResults(answers)[index] ? 1 : 2];
}

// Keep the seven-card historical record read-only. A combined choice cannot
// truthfully become two answers to the new eight-card exercise.
export const legacyActions = () => actions.filter(item => item.id !== 'talk').map(item => ({ id: item.id, text: item.id === 'document' ? 'Keep talking with him, and document what he said in his own words' : item.text }));
export function readLegacy() {
  try {
    const value = JSON.parse(localStorage.getItem(LEGACY_KEY));
    if (!value || !['0.2', '0.3'].includes(value.version)) return null;
    const answers = {};
    for (const [key, choices] of Object.entries(choiceSets)) if (ids(choices).includes(value.answers?.[key])) answers[key] = value.answers[key];
    if (Array.isArray(value.answers?.cues)) answers.cues = list(value.answers.cues, ids(cues));
    const oldActions = legacyActions();
    const placements = input => Object.fromEntries(oldActions.filter(item => zones.some(zone => zone.id === input?.[item.id])).map(item => [item.id, input[item.id]]));
    if (Object.keys(placements(value.answers?.actions)).length === oldActions.length) answers.actions = placements(value.answers.actions);
    return { version: value.version === '0.3' || value.actionContentVersion === '0.3' ? '0.3' : '0.2', stage: Number.isInteger(value.stage) ? Math.max(0, Math.min(6, value.stage)) : 0, answers, placements: placements(value.placements), selected: list(value.selected, ids(cues)), tomorrow: ['Yes', 'Maybe', 'No'].includes(value.tomorrow) ? value.tomorrow : null };
  } catch { return null; }
}
