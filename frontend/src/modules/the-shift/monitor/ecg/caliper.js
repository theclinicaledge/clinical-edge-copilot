import { STRIPS } from './waveforms.js';
// Measurement of authored R coordinates only; no rhythm classification.
export const rrIntervals = strip => STRIPS[strip].beats.slice(1).map((beat, index) => ({
  start: STRIPS[strip].beats[index].r, end: beat.r,
  seconds: beat.r - STRIPS[strip].beats[index].r,
}));
export const earlierSpacing = () => rrIntervals('C')[0].seconds;
export function caliperSegments(interval, start, end) {
  return [
    { kind: 'measured', from: interval.start, to: interval.end },
    { kind: 'reference', from: interval.start, to: interval.start + earlierSpacing() },
  ].filter(segment => segment.from >= start && segment.to <= end);
}

// Retain observable features before submission; restore the authored diagnosis after it.
export const tracingDescription = (strip, committed = false) => strip === 'E' && !committed
  ? STRIPS[strip].alt.replace(' of atrial fibrillation with rapid ventricular response', '')
  : STRIPS[strip].alt;
