import { STRIP_SECONDS } from '../utils/calibration';
import { dome, renderStripExample, ventricular, type StripExample } from '../utils/waveforms';

export const CASE_VERSION = 'rhythm-check-v1.0.0-draft.3';
export const ENDPOINT_TOLERANCE = 0.02;
export const DURATION_TOLERANCE = 0.03;
export const SOURCES = {
  sinus: ['University of Utah ECG Learning Center, Lesson 5-1', 'https://ecg.utah.edu/lesson/5-1'],
  junctional: ['University of Utah ECG Learning Center, Lesson 5-2', 'https://ecg.utah.edu/lesson/5-2'],
  block: ['University of Utah ECG Learning Center, Lesson 6', 'https://ecg.utah.edu/lesson/6'],
} as const;

export const INTERPRETATIONS = {
  sinus: 'Sinus bradycardia',
  junctional: 'Junctional rhythm',
  mobitzI: 'Second-degree AV block, Mobitz I',
  mobitzII: 'Second-degree AV block, Mobitz II pattern',
  uncertain: 'Insufficient visible evidence',
} as const;

type Diagnosis = Exclude<keyof typeof INTERPRETATIONS, 'uncertain'>;
export type Span = readonly [number, number];
export type Markers = readonly [number | null, number | null];
type AtrialPosition = 'upright-before' | 'inverted-before' | 'inverted-after';

interface Beat {
  p: number;
  q: number | null;
}

function measurement(beat: Beat, label: string) {
  if (beat.q === null) throw new Error('A measured beat needs a visible QRS');
  return { label, p: beat.p, q: beat.q, span: [Math.min(beat.p, beat.q), Math.max(beat.p, beat.q)] as Span };
}

function slowCase(id: string, guided: boolean, qrs: number[], offset: number, position: AtrialPosition, feedback: string) {
  const answer = position === 'upright-before' ? 'sinus' : 'junctional';
  const beats = qrs.map(q => ({ p: Number((q + offset).toFixed(3)), q }));
  const signal: StripExample = { lead: 'II', rateCategory: 'slow', regularityCategory: id === 'RC-03' ? 'irregular' : 'regular', waves: [] };
  for (const { p, q } of beats) {
    signal.waves.push(dome(p, position === 'upright-before' ? 0.10 : 0.075, position === 'upright-before' ? 0.16 : -0.16));
    // Delay the illustrative T-wave onset in RC-02 so the retrograde P is visible.
    ventricular(signal.waves, q, 'narrow', 0.43, position === 'inverted-after' ? 0.14 : 0.06);
  }
  return {
    id, guided, signal, beats, answer,
    alternative: (answer === 'sinus' ? 'junctional' : 'sinus') as Diagnosis,
    measurements: [measurement(beats[0], 'First complete beat')],
    dropped: [],
    prompt: 'On the first complete beat, mark the onset of the separate atrial deflection and the onset of its nearby QRS. Either marker order works.',
    coaching: 'Find the first QRS and inspect the baseline immediately before and after it. Use zoom to place markers at onsets, then consider the direction of the atrial deflection.',
    feedback,
    sources: [SOURCES.sinus, SOURCES.junctional],
  };
}

function blockCase(id: string, guided: boolean, answer: 'mobitzI' | 'mobitzII', firstP: number, pp: number, pattern: (number | null)[], wide: boolean, feedback: string) {
  const beats: Beat[] = [];
  const signal: StripExample = { lead: 'II', rateCategory: 'normal', regularityCategory: 'irregular', waves: [] };
  for (let i = 0; i < pattern.length; i++) {
    const p = Number((firstP + i * pp).toFixed(3));
    const pr = pattern[i];
    const q = pr === null ? null : Number((p + pr).toFixed(3));
    beats.push({ p, q });
    signal.waves.push(dome(p, 0.09, 0.16));
    if (q !== null) ventricular(signal.waves, q, wide ? 'wide' : 'narrow', 0.35);
  }
  const firstDrop = beats.findIndex(beat => beat.q === null);
  const conducted = beats.flatMap(beat => beat.q === null ? [] : [beat.q]);
  const rate = 60 * (conducted.length - 1) / (conducted.at(-1)! - conducted[0]);
  signal.rateCategory = rate < 60 ? 'slow' : rate > 100 ? 'fast' : 'normal';
  signal.meanRateBpm = rate;
  return {
    id, guided, signal, beats, answer,
    alternative: (answer === 'mobitzI' ? 'mobitzII' : 'mobitzI') as Diagnosis,
    measurements: [
      measurement(beats[0], 'First conducted PR'),
      measurement(beats[firstDrop - 1], 'PR just before the pause'),
      measurement(beats[firstDrop + 1], 'PR just after the pause'),
    ],
    prPattern: answer === 'mobitzI' ? 'progression' : 'constant',
    dropped: beats.filter(b => b.q === null).map(b => b.p),
    prompt: 'Find the first P wave without a QRS. Measure the first conducted PR, then the conducted PR immediately before and after that pause.',
    coaching: 'For each conducted beat, place one marker at P onset and the other at QRS onset. Compare all three intervals. Check whether the atrial deflection in the pause arrives on time.',
    feedback,
    sources: [SOURCES.block],
  };
}

export const RHYTHM_CHECK_CASES = [
  slowCase('RC-01', true, [0.48, 1.73, 2.98, 4.23, 5.48], -0.16, 'upright-before', 'An upright P wave starts 0.16 s before each QRS. The regular 48/min ventricular rhythm and consistent P-to-QRS relationship support sinus bradycardia. A junctional rhythm can have the same rate, so rate alone does not distinguish them.'),
  slowCase('RC-02', false, [0.43, 1.68, 2.93, 4.18, 5.43], 0.12, 'inverted-after', 'The inverted atrial deflection starts 0.12 s after QRS onset on each beat. This repeated relationship supports retrograde atrial activation with a junctional rhythm. The span is QRS-to-P, and the rate is the same as in RC-01.'),
  slowCase('RC-03', false, [0.47, 1.57, 2.72, 3.80, 4.94], -0.20, 'upright-before', 'The R-R intervals vary slightly, but upright P waves consistently lead each QRS by 0.20 s at a slow rate. That organized sinus relationship supports sinus bradycardia. A junctional rhythm can also be slow. The upright P-to-QRS relationship is the deciding finding here.'),
  slowCase('RC-04', false, [0.49, 1.60, 2.71, 3.82, 4.93], -0.11, 'inverted-before', 'The inverted atrial deflection begins at 0.38 s, and the QRS begins at 0.49 s, an interval of 0.11 s. The inverted deflection and short interval make junctional rhythm the better fit of the two choices. An ectopic atrial rhythm can also produce an inverted P wave before the QRS. This Lead II strip does not establish the exact pacemaker origin.'),
  blockCase('RC-05', true, 'mobitzI', 0.24, 0.75, [0.16, 0.24, 0.28, null, 0.16, 0.24, 0.28, null], false, 'The first two PR intervals are 0.16 and 0.24 s. The third is 0.28 s, then an on-time P wave fails to conduct and PR returns to 0.16 s. Progressive prolongation followed by reset distinguishes this Wenckebach pattern from the constant conducted PR in Mobitz II.'),
  blockCase('RC-06', false, 'mobitzII', 0.24, 0.82, [0.18, 0.18, 0.18, null, 0.18, 0.18, 0.18], true, 'The atrial timing is steady, and conducted PR intervals remain 0.18 s before and after the nonconducted P wave. That pattern supports Mobitz II. A wide QRS accompanies this example, but the constant PR and on-time nonconducted P are the deciding evidence. Classic Wenckebach shows PR prolongation before the dropped beat and a shorter PR on the next conducted beat.'),
  blockCase('RC-07', false, 'mobitzI', 0.24, 0.84, [0.18, 0.26, null, 0.18, 0.26, null, 0.18], false, 'Two successive conducted PR intervals lengthen from 0.18 to 0.26 s before an on-time P wave fails to conduct. PR shortens again on the next conducted beat. This shorter Wenckebach group still shows progression and reset. Mobitz II would keep the conducted PR constant.'),
  blockCase('RC-08', false, 'mobitzII', 0.18, 0.80, [0.20, 0.20, 0.20, null, 0.20, 0.20, 0.20], false, 'The P wave at 2.58 s arrives on time and has no following QRS. P waves stay 0.80 s apart, and the conducted PR is 0.20 s immediately before and after the pause. Together, these findings support a Mobitz II pattern on this strip. The narrow QRS does not determine the block type. In classic Wenckebach, the PR lengthens before the dropped beat and shortens on the next conducted beat.'),
].map(item => ({ ...item, path: renderStripExample(item.signal) }));

export type RhythmCheckCase = typeof RHYTHM_CHECK_CASES[number];

export function measureMarkers(markers: Markers) {
  return markers[0] === null || markers[1] === null ? null : Math.abs(markers[1] - markers[0]);
}

export function assessMeasurement(markers: Markers, expected: Span) {
  const [a, b] = markers;
  if (a === null || b === null) return { duration: false, landmarks: false };
  const start = Math.min(a, b);
  const end = Math.max(a, b);
  return {
    duration: Math.abs((end - start) - (expected[1] - expected[0])) <= DURATION_TOLERANCE + 1e-9,
    landmarks: Math.abs(start - expected[0]) <= ENDPOINT_TOLERANCE + 1e-9
      && Math.abs(end - expected[1]) <= ENDPOINT_TOLERANCE + 1e-9,
  };
}

export function matchesSpan(markers: Markers, expected: Span) {
  const { duration, landmarks } = assessMeasurement(markers, expected);
  return duration && landmarks;
}

export function rateExercise(example: RhythmCheckCase) {
  if (example.id !== 'RC-01' && example.id !== 'RC-02' && example.id !== 'RC-08') return null;
  const ventricular = example.beats.flatMap(({ q }) => q === null ? [] : [q]);
  const rr = ventricular.slice(1).map((q, i) => Math.round((q - ventricular[i]) * 100) / 100);
  return {
    count: ventricular.length,
    estimate: ventricular.length * 60 / STRIP_SECONDS,
    atrialEstimate: example.beats.length * 60 / STRIP_SECONDS,
    shortest: Math.min(...rr),
    longest: Math.max(...rr),
    regular: rr.every(interval => interval === rr[0]),
    assessRegularity: example.id === 'RC-01' || example.id === 'RC-08',
  };
}

export const PR_OBSERVATIONS = {
  progression: 'Lengthens before the pause, then shortens',
  constant: 'The first, pre-pause and post-pause PR intervals are the same.',
  unclear: 'I cannot tell',
} as const;

export function canSubmitCheck(intervals: Markers[], answer: string, observation = '', requiresObservation = false) {
  return intervals.every(pair => (measureMarkers(pair) ?? 0) > 0)
    && Boolean(answer) && (!requiresObservation || Boolean(observation));
}

export function clampMarker(seconds: number) {
  return Math.min(STRIP_SECONDS, Math.max(0, Math.round(seconds * 100) / 100));
}
