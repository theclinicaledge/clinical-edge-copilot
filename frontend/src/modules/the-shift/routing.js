import { CONVERSATION_ENABLED } from './conversation/private.js';
// Draft SHIFT-006 is routable only in preview builds; the inline flag folds away in production.
export const SHIFT_IDS = ['drowsy-patient', 'monitor-alarm', 'discharge-puzzle', ...(CONVERSATION_ENABLED ? ['conversation'] : []), 'which-patient-first', ...(import.meta.env?.VITE_SHIFT_006_PREVIEW === 'true' ? ['stable-number'] : [])];
export const shiftPath = id => `/learn/shifts/${id}`;

export function shiftRoute(path) {
  if (path === '/learn' || path === '/learn/shifts') return { kind: 'library' };
  const match = /^\/learn\/shifts\/([^/]+)(\/ask)?$/.exec(path);
  if (match && SHIFT_IDS.includes(match[1])) return { kind: match[2] ? 'handoff' : 'scenario', id: match[1] };
  return null;
}

export function learningDestination(path, id) {
  const suffix = `shift=${id}`;
  if (path.startsWith('/ask')) return `${shiftPath(id)}/ask${path.includes('?') ? path.slice(path.indexOf('?')) : ''}`;
  const destinations = {
    '/abg-lab/resp-acidosis': '/abg-lab?example=resp-acidosis',
    '/reference-hub/potassium': '/reference-hub?reference=potassium',
    '/reference-hub/magnesium': '/reference-hub?reference=magnesium',
  };
  const target = destinations[path];
  return target ? `${target}${target.includes('?') ? '&' : '?'}${suffix}` : null;
}

export function returningShift(search) {
  const id = new URLSearchParams(search).get('shift');
  return SHIFT_IDS.includes(id) ? id : null;
}
