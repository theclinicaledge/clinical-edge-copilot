export interface FoundationCard {
  id: string;
  title: string;
  line: string;
  label?: string; // e.g. "< 60 / 60–100 / > 100"
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
    line: 'Count large boxes between two R waves and divide 300 by that number. Or count beats in a 6-second strip × 10.',
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
    line: 'Narrow (< 0.12 s) means ventricular activation via normal pathways. Wide (≥ 0.12 s) means aberrant conduction — or ventricular origin.',
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
  { id: 'p3',  text: 'Wide does not always mean ventricular — it means be careful.' },
  { id: 'p4',  text: 'Afib is irregular with no organized P waves.' },
  { id: 'p5',  text: 'A steady rate near 150 deserves a flutter hunt.' },
  { id: 'p6',  text: 'The monitor sees electricity, not perfusion.' },
  { id: 'p7',  text: 'Artifact can look dramatic while the patient looks fine.' },
  { id: 'p8',  text: 'Find the spike before you name a paced rhythm.' },
  { id: 'p9',  text: 'Type I warns you — the PR stretches before it drops.' },
  { id: 'p10', text: 'Complete block: P waves and QRS complexes march to different drummers.' },
  { id: 'p11', text: 'When the monitor and the patient disagree, the patient wins.' },
];

export function getPearlForRhythm(rhythmId: string): Pearl {
  const MAP: Record<string, string> = {
    afib:          'p4',
    aflutter:      'p5',
    vtach:         'p3',
    vtach_wide:    'p3',
    vfib:          'p6',
    paced:         'p8',
    artifact:      'p7',
    'mobitz-i':    'p9',
    'mobitz-ii':   'p9',
    '3rd-degree':  'p10',
    svt:           'p2',
    junctional:    'p1',
    nsr:           'p1',
  };
  const pid = MAP[rhythmId] ?? `p${((rhythmId.charCodeAt(0) % PEARLS.length) + 1)}`;
  return PEARLS.find(p => p.id === pid) ?? PEARLS[0];
}
