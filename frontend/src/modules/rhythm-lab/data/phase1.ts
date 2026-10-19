export interface FoundationCard {
  id: string;
  title: string;
  line: string;
  label?: string;
}

export const FOUNDATIONS: FoundationCard[] = [
  {
    id: 'strip',
    title: 'Reading the strip',
    line: 'Each small box = 0.04 s wide, 0.1 mV tall. Five small boxes make one large box (0.20 s).',
    label: '25 mm/s · standard calibration',
  },
  {
    id: 'rate',
    title: 'Rate',
    line: 'For a regular rhythm, divide 300 by large boxes between R waves. For irregular rhythms, estimate with QRS count in a full 6-second strip × 10.',
    label: '< 60 · 60–100 · > 100',
  },
  {
    id: 'regularity',
    title: 'Regularity',
    line: 'R-to-R intervals equal? Irregular rhythms often point to atrial fibrillation, ectopy, or heart block.',
    label: 'Regular · Irregular · Regularly irregular',
  },
  {
    id: 'pwaves',
    title: 'P waves',
    line: 'Is there a P before every QRS? Do all P waves look the same? Absent or chaotic P waves narrow the differential quickly.',
    label: 'Present · Absent · Chaotic',
  },
  {
    id: 'pr',
    title: 'PR interval',
    line: 'Normal: 0.12–0.20 s (3–5 small boxes). Prolonged, progressive, or dropped beats signal varying degrees of block.',
    label: '0.12–0.20 s normal',
  },
  {
    id: 'qrs',
    title: 'QRS width',
    line: 'Narrow QRS is < 0.12 s. Wide QRS is ≥ 0.12 s and may reflect conduction delay, ventricular origin, pacing, or metabolic toxicity.',
    label: 'Narrow < 0.12 s · Wide ≥ 0.12 s',
  },
  {
    id: 'monitorvspatient',
    title: 'Monitor vs patient',
    line: 'The monitor reads electricity, not perfusion. A dramatic strip in a comfortable patient is different from the same strip in a crashing one.',
    label: 'Assess the patient first',
  },
];

export interface Pearl {
  id: string;
  text: string;
}

export const PEARLS: Pearl[] = [
  { id: 'p1',  text: 'Rate first, regularity second, P waves third.' },
  { id: 'p2',  text: 'Fast and regular narrows the list.' },
  { id: 'p3',  text: 'Wide does not always mean ventricular · it means be careful.' },
  { id: 'p4',  text: 'AFib lacks organized P waves. MAT has at least three P-wave shapes, variable intervals, and a rate above 100.' },
  { id: 'p5',  text: 'A rate near 150 that never flattens between beats deserves a flutter hunt.' },
  { id: 'p6',  text: 'The monitor sees electricity, not perfusion. Assess the patient, then the strip.' },
  { id: 'p7',  text: 'Artifact can look dramatic while the patient looks fine. Check a second lead.' },
  { id: 'p8',  text: 'Look for pacing spikes and capture. Invisible spikes do not exclude pacing; confirm device history and ECG settings.' },
  { id: 'p9',  text: 'Wenckebach warns you · the PR stretches before the beat drops. Mobitz II gives no warning.' },
  { id: 'p10', text: 'Complete block: P waves and QRS complexes march to different drummers, ignoring each other.' },
  { id: 'p11', text: 'When the monitor and the patient disagree, the patient wins.' },
  { id: 'p12', text: 'A premature wide beat suggests PVC or aberrant conduction. A late wide beat after a pause suggests ventricular escape; check P waves and timing.' },
  { id: 'p13', text: 'PAC or PVC? Check premature P waves, QRS morphology, and timing together. PACs can be wide or blocked.' },
  { id: 'p14', text: 'Sinus bradycardia has an upright P before every QRS. Junctional rhythm does not · or the P is inverted.' },
  { id: 'p15', text: 'AIVR often runs about 50–110 bpm; boundaries vary and overlap slow VT. Check AV relationships and context.' },
  { id: 'p16', text: 'NSR is your anchor. Every other rhythm is a variation from this baseline.' },
  { id: 'p17', text: 'Twisting polymorphic VT suggests torsades when the preceding QT is prolonged. The rhythm strip alone cannot establish the QT context.' },
  { id: 'p18', text: 'Sinus tachycardia always has a cause. Look for the trigger · the rate is the symptom, not the diagnosis.' },
  { id: 'p19', text: 'First-degree block alone is rarely the problem · it is a sign to look harder for the cause.' },
  { id: 'p20', text: 'PEA: organized electrical activity, no mechanical pulse. The strip is deceptive.' },
];

// Precise rhythm-to-pearl mapping · covers every rhythm ID in rhythms.ts
const RHYTHM_PEARL_MAP: Record<string, string> = {
  nsr:                      'p16',
  sinus_bradycardia:        'p14',
  sinus_tachycardia:        'p18',
  afib:                     'p4',
  aflutter:                 'p5',
  pac:                      'p13',
  pvc:                      'p12',
  junctional_rhythm:        'p14',
  accelerated_junctional:   'p1',
  junctional_tachycardia:   'p2',
  svt:                      'p2',
  first_degree_avb:         'p19',
  mobitz_i:                 'p9',
  mobitz_ii:                'p9',
  complete_heart_block:     'p10',
  vtach:                    'p3',
  idioventricular:          'p15',
  aivr:                     'p15',
  ventricular_escape:       'p12',
  torsades:                 'p17',
  vfib_coarse:              'p11',
  vfib_fine:                'p7',
  asystole:                 'p11',
  sinus_arrhythmia:         'p1',
  mat:                      'p4',
  pea:                      'p20',
  hyperkalemia_t:           'p6',
  hyperkalemia_qrs:         'p6',
  hyperkalemia_sine:        'p6',
  rbbb:                     'p3',
  lbbb:                     'p3',
  atrial_paced:             'p8',
  ventricular_paced:        'p8',
  av_sequential_paced:      'p8',
  pacemaker_failure_capture:'p8',
  pacemaker_failure_sense:  'p8',
};

export function getPearlForRhythm(rhythmId: string): Pearl {
  const pid = RHYTHM_PEARL_MAP[rhythmId] ?? 'p1';
  return PEARLS.find(p => p.id === pid) ?? PEARLS[0];
}
