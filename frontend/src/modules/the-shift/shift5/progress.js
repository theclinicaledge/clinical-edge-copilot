import { fresh, STORAGE_KEY, VERSION } from './rules.js';
import { resetShiftAnalytics, shiftProgress } from '../../../productAnalytics.js';

export function loadProgress() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (value?.version === VERSION && Number.isInteger(value.stage) && value.stage >= 0 && value.stage <= 7) return value;
  } catch { /* A corrupt local draft starts fresh. */ }
  return fresh();
}

export function saveProgress(value) {
  try { const previous = loadProgress(); localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); shiftProgress('which-patient-first', VERSION, previous, value, 7); } catch { /* Private browsing may block storage. */ }
}

export function clearProgress() {
  try { localStorage.removeItem(STORAGE_KEY); resetShiftAnalytics('which-patient-first'); } catch { /* Keep the current session usable. */ }
}
