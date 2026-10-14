// Original teaching signals, not recordings or a physiological simulator.
// All time coordinates are seconds; all amplitudes are illustrative millivolts.
export const CALIBRATION = Object.freeze({ seconds: 6, hz: 500, mmPerSecond: 25, mmPerMv: 10, unitsPerMm: 4 });
export const PLOT = Object.freeze({ left: 40, baseline: 108, width: 660, height: 208, unitsPerSecond: 100, unitsPerMv: 40 });

function bump(t, center, width, amplitude) {
  const u = (t - center) / (width / 2);
  return Math.abs(u) < 1 ? amplitude * (1 + Math.cos(Math.PI * u)) / 2 : 0;
}
function line(t, points) {
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]; const [x1, y1] = points[i];
    if (t >= x0 && t < x1) return y0 + (y1 - y0) * (t - x0) / (x1 - x0);
  }
  return 0;
}
const NARROW = [[-.04, 0], [-.025, -.12], [-.016, 0], [0, 1.15], [.016, 0], [.03, -.25], [.05, 0]];
const WIDE = [[-.06, 0], [-.035, .42], [0, 1.4], [.045, .74], [.075, -.4], [.10, 0]];
const regular = (rate, first = .35) => Array.from({ length: 9 }, (_, i) => first + i * 60 / rate).filter(r => r < CALIBRATION.seconds);
const sinus = rate => regular(rate).map(r => ({ r, kind: 'sinus' }));
const sinus76 = sinus(76);
// One early ventricular beat replaces the expected sinus beat. The following
// sinus beat stays on its original schedule: coupling + pause = two sinus cycles.
sinus76[3] = { r: sinus76[2].r + .48, kind: 'pvc' };
const rawAfIntervals = [.39, .52, .31, .46, .37, .57, .34, .48, .42, .32, .54, .40, .53];
const afScale = (rawAfIntervals.length * 60 / 138) / rawAfIntervals.reduce((sum, v) => sum + v, 0);
const afTimes = [.15];
for (const rr of rawAfIntervals) afTimes.push(afTimes.at(-1) + rr * afScale);

export const STRIPS = Object.freeze({
  A: { room: '20', title: 'Report / Room 20', targetRate: 76, beats: sinus76,
    alt: 'Six-second Lead II-style educational illustration. Regular sinus rhythm near 76 beats per minute with P waves before narrow QRS complexes. One early wide positive ventricular complex has no preceding P wave and is followed by a full compensatory pause.' },
  B: { room: '22', title: 'Report / Room 22', targetRate: 80, beats: sinus(80),
    alt: 'Six-second Lead II-style educational illustration. Sinus rhythm at 80 beats per minute. A consistent upright P wave precedes each narrow QRS, with regular R-to-R spacing.' },
  C: { room: '24', title: 'Earlier / Room 24', targetRate: 84, beats: sinus(84),
    alt: 'Six-second Lead II-style educational illustration. Sinus rhythm at 84 beats per minute, with regular R-to-R spacing and an upright P wave before every narrow QRS.' },
  D: { room: '22', title: 'Alarm / Room 22', targetRate: 80, alarmRate: 180, beats: sinus(80),
    alt: 'Six-second constructed movement-artifact illustration. Broad rapid noise deflections overlap a regular narrow-QRS rhythm at 80 beats per minute. The scripted monitor alarm reads 180; that is not the native ventricular rate. Look closer marks the narrow QRS complexes without changing the signal.' },
  E: { room: '24', title: 'Current / Room 24', targetRate: 138, beats: afTimes.map(r => ({ r, kind: 'af' })),
    alt: 'Six-second Lead II-style educational illustration of atrial fibrillation with rapid ventricular response. Irregularly irregular R-to-R intervals, no discrete P waves, a fine irregular fibrillatory baseline and narrow QRS complexes. Mean ventricular rate is approximately 138 beats per minute.' },
});

export function beatSignal(t, beat) {
  const u = t - beat.r;
  if (beat.kind === 'pvc') return line(u, WIDE) + bump(u, .25, .16, -.30);
  return line(u, NARROW) + (beat.kind === 'sinus' ? bump(u, -.15, .10, .16) : 0) + bump(u, beat.kind === 'af' ? .17 : .22, beat.kind === 'af' ? .13 : .16, .28);
}
export function artifact(t) {
  // Hand-authored movement bursts, not a synthesized VT rhythm. The narrow
  // native signal remains present, including during the noisy segment.
  const envelope = Math.min(1, Math.max(0, (t - .80) / .16), Math.max(0, (5.30 - t) / .16));
  const phase = 2 * Math.PI * (3 * t + .035 * Math.sin(t * 5));
  return envelope * ((.72 + .14 * Math.sin(t * 8.3)) * Math.sin(phase) + .18 * Math.sin(phase * 2 + .6) + .035 * Math.sin(t * 2 * Math.PI * 27));
}
function fibrillation(t) {
  return .044 * Math.sin(2 * Math.PI * 5.3 * t + .2) + .025 * Math.sin(2 * Math.PI * 7.1 * t + 1.4) + .016 * Math.sin(2 * Math.PI * 9.7 * t);
}
export function signalAt(id, t) {
  const spec = STRIPS[id];
  let base = spec.beats.reduce((sum, beat) => sum + beatSignal(t, beat), 0);
  // A six-second crop can contain the P wave for an R peak beyond its edge.
  if (id !== 'E') base += beatSignal(t, { r: spec.beats.at(-1).r + 60 / spec.targetRate, kind: 'sinus' });
  return base + (id === 'D' ? artifact(t) : id === 'E' ? fibrillation(t) : 0);
}
export function samples(id) {
  return Array.from({ length: CALIBRATION.seconds * CALIBRATION.hz + 1 }, (_, i) => {
    const t = i / CALIBRATION.hz;
    return { t, mv: signalAt(id, t) };
  });
}
export const xAt = t => PLOT.left + t * PLOT.unitsPerSecond;
export const yAt = mv => PLOT.baseline - mv * PLOT.unitsPerMv;
export function pathFor(id, start = 0, end = 6) {
  return samples(id).filter(p => p.t >= start && p.t <= end).map((p, i) => `${i ? 'L' : 'M'}${xAt(p.t - start).toFixed(2)},${yAt(p.mv).toFixed(2)}`).join(' ');
}

// Engineering measurements of the constructed samples, not clinical validation.
export function measuredPeaks(id) {
  const values = samples(id); const result = [];
  for (let i = 1; i < values.length - 1; i++) {
    const p = values[i];
    if (p.mv > .95 && p.mv > values[i - 1].mv && p.mv >= values[i + 1].mv && (!result.length || p.t - result.at(-1) > .24)) result.push(p.t);
  }
  return result;
}
export function measurements(id) {
  const spec = STRIPS[id];
  // A generic peak finder is intentionally NOT used on artifact: it can count
  // noise as beats. D's native rate is measured from the explicitly built layer.
  const peaks = id === 'D' ? measuredPeaks('B') : measuredPeaks(id);
  const rr = peaks.slice(1).map((r, i) => r - peaks[i]);
  const mean = rr.reduce((a, b) => a + b, 0) / rr.length;
  const values = samples(id).map(p => p.mv);
  return { id, durationSeconds: 6, sampleRateHz: 500, sampleCount: values.length, qrsCount: peaks.length,
    rateMethod: id === 'D' ? 'Native layer R peaks; not an artifact classifier' : 'Mean RR between sampled R peaks',
    measuredRate: +(60 / mean).toFixed(2), sixSecondCountRate: peaks.length * 10,
    rrMinMs: Math.round(Math.min(...rr) * 1000), rrMaxMs: Math.round(Math.max(...rr) * 1000),
    constructedQrsMs: id === 'A' ? [90, 160] : [90], constructedPrMs: id === 'E' ? null : 160,
    pBeforeInWindowQrs: spec.beats.filter(b => b.kind === 'sinus').length,
    terminalPBeforeOffscreenQrs: id !== 'E' && spec.beats.at(-1).r + 60 / spec.targetRate - .20 < 6,
    minMv: +Math.min(...values).toFixed(3), maxMv: +Math.max(...values).toFixed(3),
  };
}
