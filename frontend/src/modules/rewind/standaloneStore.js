import { VERSION } from '../med-surg-track/content.js';
import { PACKS, needsInformation, validResponse } from './packs.js';

export const practiceKey = id => `ce-standalone-rewind-${id}`;
export const freshPractice = (id) => ({ schema: 1, contentVersion: PACKS[id]?.version || VERSION, selected: null, attempts: [] });
export function validPractice(value, id) {
  return value?.schema === 1 && value.contentVersion === PACKS[id]?.version &&
    (value.selected === null || PACKS[id].variations.some(v => v.id === value.selected)) &&
    Array.isArray(value.attempts) && value.attempts.every(a =>
      PACKS[id].variations.some(v => v.id === a?.variation && validResponse(v, a.call, a.information) && (needsInformation(v, a.call) || a.information === null)) &&
      ['Accepted', 'Revisit', 'Unsafe'].includes(a.label) && a.guided === true &&
      a.contentVersion === PACKS[id].version && Number.isFinite(a.at) && typeof a.why === 'string' && typeof a.alternative === 'string');
}
export function readPractice(id, storage) {
  try {
    const raw = storage.getItem(practiceKey(id));
    if (raw === null) return { value: freshPractice(id), status: 'saved' };
    const value = JSON.parse(raw);
    return validPractice(value, id) ? { value, status: 'saved' } : { value: null, status: 'blocked' };
  } catch (error) {
    return { value: error instanceof SyntaxError ? null : freshPractice(id), status: error instanceof SyntaxError ? 'blocked' : 'unavailable' };
  }
}
export function updatePractice(id, previous, edit, storage) {
  const current = readPractice(id, storage);
  if (current.status === 'blocked') return current;
  const value = structuredClone(previous.status === 'unavailable' ? previous.value : current.value);
  edit(value);
  if (!validPractice(value, id)) return previous;
  try { storage.setItem(practiceKey(id), JSON.stringify(value)); return { value, status: 'saved' }; }
  catch { return { value, status: 'unavailable' }; }
}
export function practiceAttempt(id, variationId, call, information) {
  const variation = PACKS[id].variations.find(v => v.id === variationId);
  if (!variation || !validResponse(variation, call, information)) return null;
  const chosen = variation.options?.find(o => o.id === call);
  const supported = !chosen && variation.accepted.includes(call) && (call !== 'information' || variation.info.includes(information));
  return { variation: variationId, call, information: needsInformation(variation, call) ? information : null,
    label: chosen ? chosen.label : supported ? 'Accepted' : variation.unsafe.includes(call) ? 'Unsafe' : 'Revisit',
    why: chosen ? chosen.feedback : variation.rationale, alternative: variation.alternatives, guided: true, at: Date.now(), contentVersion: PACKS[id].version };
}
