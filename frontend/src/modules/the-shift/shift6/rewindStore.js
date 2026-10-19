import { REWIND } from './data.js';

// Mirrors rewind/standaloneStore.js, but with this Shift's own labels and storage key so the
// shared Rewind validation stays unchanged. Original Shift responses are never touched.
export const REWIND_KEY = `ce-shift-stable-number-rewind-v${REWIND.version}`;
const LABELS = ['Correct', 'Close', 'Not best', 'No', 'No (unsafe)'];
export const freshRewind = () => ({ schema: 1, contentVersion: REWIND.version, selected: null, attempts: [] });

const variation = id => REWIND.variations.find(v => v.id === id);
export function validRewind(value) {
  return value?.schema === 1 && value.contentVersion === REWIND.version &&
    (value.selected === null || Boolean(variation(value.selected))) &&
    Array.isArray(value.attempts) && value.attempts.every(a => {
      const option = variation(a?.variation)?.options.find(o => o.id === a.call);
      return option && a.label === option.label && LABELS.includes(a.label) && a.information === null && a.guided === true &&
        a.contentVersion === REWIND.version && Number.isFinite(a.at) && typeof a.why === 'string' && typeof a.alternative === 'string';
    });
}
export function readRewind(storage) {
  try {
    const raw = storage.getItem(REWIND_KEY);
    if (raw === null) return { value: freshRewind(), status: 'saved' };
    const value = JSON.parse(raw);
    return validRewind(value) ? { value, status: 'saved' } : { value: null, status: 'blocked' };
  } catch (error) {
    return { value: error instanceof SyntaxError ? null : freshRewind(), status: error instanceof SyntaxError ? 'blocked' : 'unavailable' };
  }
}
export function updateRewind(previous, edit, storage) {
  const current = readRewind(storage);
  if (current.status === 'blocked') return current;
  const value = structuredClone(previous.status === 'unavailable' ? previous.value : current.value);
  edit(value);
  if (!validRewind(value)) return previous;
  try { storage.setItem(REWIND_KEY, JSON.stringify(value)); return { value, status: 'saved' }; }
  catch { return { value, status: 'unavailable' }; }
}
export function rewindAttempt(variationId, call) {
  const option = variation(variationId)?.options.find(o => o.id === call);
  if (!option) return null;
  return { variation: variationId, call, information: null, label: option.label, why: option.feedback, alternative: '', guided: true, at: Date.now(), contentVersion: REWIND.version };
}
