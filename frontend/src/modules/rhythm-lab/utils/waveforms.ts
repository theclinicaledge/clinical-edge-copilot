import { BASELINE, STRIP_SECONDS, UNITS_PER_MV, secondsToUnits } from './calibration';

// All timings are seconds and all voltages are mV. Cycle length never stretches
// PR, QRS, or P duration. These are illustrative single-lead signals, not patient
// recordings or a substitute for a diagnostic 12-lead ECG. References: Utah ECG
// Learning Center lessons 3, 5-2, 5-3, 6; AHA 2025 ALS; KDIGO potassium report.
export type RateCategory = 'slow' | 'normal' | 'fast' | 'not measurable';
export type RegularityCategory = 'regular' | 'irregular' | 'not applicable';
type Point = readonly [number, number];
type Wave = { start: number; duration: number; value: (phase: number) => number; landmarks?: number[]; role?: 'qrs' };
export interface StripExample {
  lead: 'II' | 'V1' | 'V6';
  rateCategory: RateCategory;
  regularityCategory: RegularityCategory;
  context?: string;
  meanRateBpm?: number;
  waves: Wave[];
}
const round = (n: number) => Math.round(n * 1000) / 1000;
const series = (bpm: number, start = 0.32) => {
  const times: number[] = [];
  for (let t = start; t < STRIP_SECONDS; t += 60 / bpm) times.push(Math.round(t * 1e6) / 1e6);
  return times;
};
function shape(start: number, duration: number, points: readonly Point[]): Wave {
  return { start, duration, landmarks: points.map(p => p[0]), value: phase => {
    for (let i = 1; i < points.length; i++) {
      const [x, y] = points[i];
      const [px, py] = points[i - 1];
      if (phase <= x) return py + (y - py) * (phase - px) / (x - px);
    }
    return 0;
  } };
}
function dome(start: number, duration: number, amplitude: number, peak = 0.5): Wave {
  return { start, duration, landmarks: [0, peak, 1], value: p => amplitude * (p <= peak
    ? (1 - Math.cos(Math.PI * p / peak)) / 2
    : (1 + Math.cos(Math.PI * (p - peak) / (1 - peak))) / 2) };
}
const NARROW: readonly Point[] = [[0, 0], [0.2, -0.08], [0.45, 0.85], [0.73, -0.22], [1, 0]];
const WIDE: readonly Point[] = [[0, 0], [0.2, 0.22], [0.38, 0.85], [0.52, 0.65], [0.72, -0.32], [1, 0]];
const RBBB: readonly Point[] = [[0, 0], [0.13, 0.2], [0.32, -0.35], [0.65, 0.8], [0.8, 0.68], [1, 0]];
const LBBB: readonly Point[] = [[0, 0], [0.25, 0.5], [0.42, 0.8], [0.54, 0.65], [0.68, 0.85], [1, 0]];
function ventricular(waves: Wave[], q: number, kind: 'narrow' | 'wide' | 'rbbb' | 'lbbb' = 'narrow', qt = 0.38) {
  const width = kind === 'narrow' ? 0.08 : kind === 'rbbb' ? 0.14 : 0.16;
  waves.push({ ...shape(q, width, kind === 'narrow' ? NARROW : kind === 'rbbb' ? RBBB : kind === 'lbbb' ? LBBB : WIDE), role: 'qrs' });
  waves.push(dome(q + width + 0.06, qt - width - 0.06, kind === 'narrow' ? 0.25 : -0.24, 0.62));
}
function sinus(waves: Wave[], q: number, pr = 0.16, kind: 'narrow' | 'wide' | 'rbbb' | 'lbbb' = 'narrow', qt = 0.38) {
  waves.push(dome(q - pr, 0.1, 0.15));
  ventricular(waves, q, kind, qt);
}
function spike(waves: Wave[], t: number) {
  // Exaggerated for recognition; real bipolar pacing artifacts may be invisible.
  waves.push(shape(t, 0.008, [[0, 0], [0.5, 0.38], [1, 0]]));
}
function example(rateCategory: RateCategory, regularityCategory: RegularityCategory = 'regular', lead: StripExample['lead'] = 'II'): StripExample {
  return { lead, rateCategory, regularityCategory, waves: [] };
}
function sinusStrip(bpm: number, pr = 0.16, kind: 'narrow' | 'rbbb' | 'lbbb' = 'narrow') {
  const e = example(bpm < 60 ? 'slow' : bpm > 100 ? 'fast' : 'normal', 'regular', kind === 'rbbb' ? 'V1' : kind === 'lbbb' ? 'V6' : 'II');
  for (const q of series(bpm)) sinus(e.waves, q, pr, kind, bpm > 100 ? 0.30 : bpm < 60 ? 0.44 : 0.38);
  return e;
}
function junctional(bpm: number) {
  const e = example(bpm < 60 ? 'slow' : bpm > 100 ? 'fast' : 'normal');
  for (const q of series(bpm)) {
    ventricular(e.waves, q, 'narrow', bpm > 100 ? 0.30 : bpm < 60 ? 0.42 : 0.38);
    e.waves.push(dome(q + 0.09, 0.07, -0.13)); // retrograde P just after QRS
  }
  return e;
}
function ventricularStrip(bpm: number) {
  const e = example(bpm < 60 ? 'slow' : bpm > 100 ? 'fast' : 'normal');
  for (const q of series(bpm)) ventricular(e.waves, q, 'wide', bpm > 100 ? 0.30 : bpm < 60 ? 0.54 : 0.42);
  return e;
}
function ectopy(kind: 'pac' | 'pvc' | 'escape') {
  const e = example('normal', 'irregular');
  const sinusTimes = kind === 'pac' ? [0.32, 1.12, 2.56, 3.36, 4.16, 4.96, 5.76]
    : kind === 'pvc' ? [0.32, 1.12, 2.72, 3.52, 4.32, 5.12]
    : [0.32, 1.12, 4.32, 5.12];
  for (const q of sinusTimes) sinus(e.waves, q);
  if (kind === 'pac') {
    e.waves.push(dome(1.64, 0.1, -0.10)); // early ectopic P, sinus reset
    ventricular(e.waves, 1.8);
  } else {
    ventricular(e.waves, kind === 'pvc' ? 1.68 : 3.32, 'wide', 0.42);
    if (kind === 'pvc') e.waves.push(dome(1.76, 0.1, 0.15)); // sinus P marches through the ectopic complex
  }
  return e;
}
function avBlock(type: 'i' | 'ii' | 'complete') {
  const e = example('slow', 'irregular');
  const atrial = series(75, 0.12);
  atrial.forEach((p, i) => {
    e.waves.push(dome(p, 0.1, 0.15));
    if (type === 'i' && i % 4 !== 3) ventricular(e.waves, p + [0.16, 0.24, 0.28][i % 4]);
    if (type === 'ii' && i % 3 !== 2) ventricular(e.waves, p + 0.16);
  });
  if (type === 'complete') {
    for (const q of series(30, 0.55)) ventricular(e.waves, q, 'wide', 0.54);
    e.regularityCategory = 'regular'; // ventricular rhythm; P waves independent
  }
  return e;
}
function flutter() {
  const e = example('fast');
  // Typical inferior-lead flutter: continuous negative sawteeth at 300/min,
  // fixed 2:1 conduction and a small T wave that does not obscure the F waves.
  e.waves.push({ start: 0, duration: STRIP_SECONDS, value: p => {
    const phase = ((p * STRIP_SECONDS + 0.08) % 0.2) / 0.2;
    return phase < 0.8 ? -0.30 * phase / 0.8 : -0.30 + 0.30 * (phase - 0.8) / 0.2;
  } });
  for (const q of series(150)) {
    e.waves.push({ ...shape(q, 0.08, NARROW), role: 'qrs' });
    e.waves.push(dome(q + 0.14, 0.15, 0.06, 0.62));
  }
  e.context = 'Illustrative 2:1 atrial flutter: atrial rate 300/min, ventricular rate 150/min. Flutter waves continue through the QRS and T waves.';
  return e;
}
function fibrillation(fine = false) {
  const e = example('not measurable', 'irregular');
  e.waves.push({ start: 0, duration: STRIP_SECONDS, value: p => {
    const t = p * STRIP_SECONDS;
    return (fine ? 0.045 : 0.38) * (0.5 * Math.sin(2 * Math.PI * (4.7 * t + 0.13 * Math.sin(t * 3)))
      + 0.31 * Math.sin(2 * Math.PI * 7.13 * t + 0.7) + 0.19 * Math.sin(2 * Math.PI * 11.37 * t));
  } });
  return e;
}
function afib() {
  const e = example('normal', 'irregular');
  e.waves.push({ start: 0, duration: STRIP_SECONDS, value: p => {
    const t = p * STRIP_SECONDS;
    return 0.022 * Math.sin(2 * Math.PI * 7.3 * t) + 0.013 * Math.sin(2 * Math.PI * 11.9 * t + 0.4);
  } });
  for (const q of [0.32, 1.04, 1.6, 2.54, 3.18, 4.28, 4.82, 5.62]) ventricular(e.waves, q);
  return e;
}
function sinusArrhythmia() {
  const e = example('normal', 'irregular');
  for (const q of [0.32, 1.24, 2.04, 2.72, 3.36, 4.08, 4.92, 5.88]) sinus(e.waves, q);
  return e;
}
function mat() {
  const e = example('fast', 'irregular');
  [0.32, 0.82, 1.26, 1.84, 2.3, 2.84, 3.32, 3.88, 4.3, 4.82, 5.28, 5.84].forEach((q, i) => {
    const p = q - [0.16, 0.13, 0.18][i % 3];
    if (i % 3 === 0) e.waves.push(dome(p, 0.1, 0.17));
    if (i % 3 === 1) e.waves.push(dome(p, 0.08, -0.12));
    if (i % 3 === 2) e.waves.push(shape(p, 0.1, [[0, 0], [0.3, 0.12], [0.65, -0.1], [1, 0]]));
    ventricular(e.waves, q, 'narrow', 0.29);
  });
  return e;
}
function torsades() {
  const e = example('fast', 'irregular');
  let q = 0.12;
  let i = 0;
  while (q < STRIP_SECONDS) {
    const a = 0.7 * Math.cos(i * Math.PI / 7);
    e.waves.push({ ...shape(q, 0.22, [[0, 0], [0.2, a * 0.4], [0.42, a], [0.65, -a * 0.6], [1, 0]]), role: 'qrs' });
    q += [0.27, 0.25, 0.29, 0.26, 0.28][i++ % 5];
  }
  e.context = 'Twisting polymorphic VT; torsades requires a prolonged QT on the preceding ECG.';
  return e;
}
function hyperkalemia(kind: 't' | 'qrs' | 'sine') {
  const e = example(kind === 'sine' ? 'not measurable' : 'normal');
  e.context = 'Illustrative ECG pattern; potassium severity and the order of ECG changes cannot be inferred from the strip alone.';
  if (kind === 'sine') {
    e.waves.push({ start: 0, duration: STRIP_SECONDS, value: p => 0.56 * Math.sin(2 * Math.PI * p * 6) });
  } else for (const q of series(75)) {
    e.waves.push(dome(q - (kind === 'qrs' ? 0.24 : 0.16), 0.1, kind === 'qrs' ? 0.035 : 0.15));
    e.waves.push({ ...shape(q, kind === 'qrs' ? 0.18 : 0.08, kind === 'qrs' ? LBBB : NARROW), role: 'qrs' });
    e.waves.push(dome(q + (kind === 'qrs' ? 0.2 : 0.14), 0.16, 0.65));
  }
  return e;
}
function paced(kind: 'atrial' | 'ventricular' | 'av' | 'capture' | 'sense') {
  const e = example('normal', kind === 'capture' || kind === 'sense' ? 'irregular' : 'regular');
  if (kind === 'sense') {
    // Sinus 75/min and an independent 60/min pacing clock. One stimulus lands
    // during a native T wave; early refractory stimuli have no captured QRS.
    const native = series(75);
    for (const q of native) e.waves.push(dome(q - 0.16, 0.1, 0.15));
    const events = [...native.map(t => ({ t, paced: false })),
      ...series(60, 0.5).map(t => ({ t, paced: true }))].sort((a, b) => a.t - b.t);
    let lastQRS = -1;
    for (const event of events) {
      if (event.paced) spike(e.waves, event.t);
      if (event.t - lastQRS < (event.paced ? 0.32 : 0.28)) continue;
      lastQRS = event.t + (event.paced ? 0.008 : 0);
      ventricular(e.waves, lastQRS, event.paced ? 'wide' : 'narrow', 0.38);
    }
    e.context = 'Illustrative undersensing: pacing stimuli continue despite native beats. Confirm device mode and interrogate the device.';
    return e;
  }
  series(75).forEach((q, i) => {
    if (kind === 'atrial' || kind === 'av') {
      spike(e.waves, q - 0.168);
      e.waves.push(dome(q - 0.16, 0.1, 0.15));
    }
    if (kind !== 'atrial') spike(e.waves, q - 0.008);
    if (kind === 'capture' && [2, 3, 4].includes(i)) return;
    ventricular(e.waves, q, kind === 'atrial' ? 'narrow' : 'wide', 0.42);
  });
  if (kind === 'capture') e.rateCategory = 'slow'; // effective ventricular response
  return e;
}
const svt = example('fast');
for (const q of series(180)) ventricular(svt.waves, q, 'narrow', 0.28);
const pea = sinusStrip(75);
pea.context = 'Clinical context: unresponsive with no palpable pulse. The ECG alone cannot identify PEA.';
const asystole = example('not measurable', 'not applicable');
asystole.context = 'Confirm the patient, electrode connections, gain, and another lead without delaying resuscitation.';

export const STRIP_EXAMPLES: Record<string, StripExample> = {
  nsr: sinusStrip(75),
  sinus_bradycardia: sinusStrip(45),
  sinus_tachycardia: sinusStrip(130),
  afib: afib(),
  aflutter: flutter(),
  pac: ectopy('pac'),
  pvc: ectopy('pvc'),
  junctional_rhythm: junctional(50),
  accelerated_junctional: junctional(80),
  junctional_tachycardia: junctional(120),
  svt,
  first_degree_avb: sinusStrip(75, 0.28),
  mobitz_i: avBlock('i'),
  mobitz_ii: avBlock('ii'),
  complete_heart_block: avBlock('complete'),
  vtach: ventricularStrip(180),
  idioventricular: ventricularStrip(30),
  aivr: ventricularStrip(75),
  ventricular_escape: ectopy('escape'),
  torsades: torsades(),
  vfib_coarse: fibrillation(),
  vfib_fine: fibrillation(true),
  asystole,
  sinus_arrhythmia: sinusArrhythmia(),
  mat: mat(),
  pea,
  hyperkalemia_t: hyperkalemia('t'),
  hyperkalemia_qrs: hyperkalemia('qrs'),
  hyperkalemia_sine: hyperkalemia('sine'),
  rbbb: sinusStrip(75, 0.16, 'rbbb'),
  lbbb: sinusStrip(75, 0.16, 'lbbb'),
  atrial_paced: paced('atrial'),
  ventricular_paced: paced('ventricular'),
  av_sequential_paced: paced('av'),
  pacemaker_failure_capture: paced('capture'),
  pacemaker_failure_sense: paced('sense'),
};

// Score the finite displayed example, not a rhythm's broad textbook rate range.
// Mean RR avoids treating a noncaptured stimulus as a ventricular beat.
for (const e of Object.values(STRIP_EXAMPLES)) {
  if (e.rateCategory === 'not measurable') continue;
  const q = e.waves.filter(w => w.role === 'qrs').map(w => w.start).sort((a, b) => a - b);
  if (q.length > 1) {
    e.meanRateBpm = 60 * (q.length - 1) / (q[q.length - 1] - q[0]);
    e.rateCategory = e.meanRateBpm < 60 ? 'slow' : e.meanRateBpm > 100 ? 'fast' : 'normal';
  }
}

function render(e: StripExample): string {
  // Include component landmarks as well as 4 ms samples so even very short
  // pacing artifacts retain their apex. Sum overlapping atrial/ventricular
  // activity; do not delete P waves when they fall inside QRS or T waves.
  const times = new Set<number>();
  for (let i = 0; i <= STRIP_SECONDS / 0.004; i++) times.add(round(i * 0.004));
  for (const w of e.waves) for (const p of w.landmarks ?? [0, 1]) {
    const t = Math.round((w.start + w.duration * p) * 1e6) / 1e6;
    if (t >= 0 && t <= STRIP_SECONDS) times.add(t);
  }
  return [...times].sort((a, b) => a - b).map((t, i) => {
    let mv = 0;
    for (const w of e.waves) {
      const p = (t - w.start) / w.duration;
      if (p >= 0 && p <= 1) mv += w.value(p);
    }
    return `${i ? 'L' : 'M'} ${round(secondsToUnits(t))},${round(BASELINE - mv * UNITS_PER_MV)}`;
  }).join(' ');
}
export const WAVEFORMS: Record<string, string> = Object.fromEntries(
  Object.entries(STRIP_EXAMPLES).map(([id, e]) => [id, render(e)]),
);
export function stripAnnotation(rhythmId: string): string {
  return `Lead ${STRIP_EXAMPLES[rhythmId]?.lead ?? 'II'} simulation · 6 s · 25 mm/s · 10 mm/mV`;
}
