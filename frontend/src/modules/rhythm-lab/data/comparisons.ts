export interface ComparisonPair {
  id: string;
  label: string;
  a: { id: string; name: string; short: string };
  b: { id: string; name: string; short: string };
  keyDiffs: string[];
  nursesNotice: string;
  teachingNote: string;
}

export const COMPARISONS: ComparisonPair[] = [
  {
    id: 'mobitz-i-vs-ii',
    label: 'Mobitz I vs Mobitz II',
    a: { id: 'mobitz_i',  name: 'Mobitz I (Wenckebach)', short: 'Mobitz I' },
    b: { id: 'mobitz_ii', name: 'Mobitz II',              short: 'Mobitz II' },
    keyDiffs: [
      'PR interval progressively lengthens before the dropped beat in Mobitz I — it stays fixed every cycle in Mobitz II',
      'Mobitz I has grouped beating you can count; Mobitz II drops without any warning on the strip',
      'Mobitz II carries a high risk of sudden progression to complete heart block — Mobitz I rarely does',
      'Both show regular P waves with occasional non-conducted P and a pause where the QRS should be',
    ],
    nursesNotice:
      'The dropped QRS. In Wenckebach the PR keeps creeping longer before the drop — you can see it march out. In Mobitz II every conducted beat has the same PR right up until the QRS just disappears.',
    teachingNote:
      'Mobitz II is never benign. Even a single dropped beat with a constant PR warrants notification and preparation for pacing. Wenckebach can be a normal finding in athletes or vagal states and is often reversible.',
  },
  {
    id: 'aivr-vs-vtach',
    label: 'AIVR vs V-Tach',
    a: { id: 'aivr',  name: 'Accelerated Idioventricular', short: 'AIVR' },
    b: { id: 'vtach', name: 'Ventricular Tachycardia',     short: 'V-Tach' },
    keyDiffs: [
      'Rate is the critical differentiator: AIVR runs at 40–100 bpm (usually 60–80); VTach runs above 100 bpm',
      'Both produce wide bizarre QRS complexes with no visible P waves — morphology alone does not separate them',
      'AIVR is often a benign reperfusion rhythm after MI or thrombolytics; VTach is always urgent',
      'AIVR typically self-terminates; VTach can deteriorate to VFib',
    ],
    nursesNotice:
      'The rate. Wide complex slow enough to count comfortably — tap it out, under 100? Think AIVR. Wide complex running fast with no P waves? Treat as VTach. Assess for pulse with both.',
    teachingNote:
      'AIVR at 65 bpm in a post-cath patient is often a sign reperfusion worked and usually needs no treatment. The same-looking wide complex at 150 bpm in a symptomatic patient is a different emergency. Count before you treat.',
  },
  {
    id: 'fine-vfib-vs-asystole',
    label: 'Fine VFib vs Asystole',
    a: { id: 'vfib_fine', name: 'Fine Ventricular Fibrillation', short: 'Fine VFib' },
    b: { id: 'asystole',  name: 'Asystole',                      short: 'Asystole' },
    keyDiffs: [
      'Fine VFib has continuous low-amplitude irregular oscillations throughout — the baseline is active, not still',
      'Asystole is near-flatline with only rare artifact; the baseline does not move continuously',
      'Fine VFib is still shockable electrical activity; asystole is not — treatment differs completely',
      'Both can be mimicked by a loose lead — always confirm in two leads before concluding either rhythm',
    ],
    nursesNotice:
      'Whether the baseline moves. A completely flat line that is perfectly still is asystole. A line that barely wiggles and shimmers continuously — even at tiny amplitude — is fine VFib. The difference is life-or-death for treatment choice.',
    teachingNote:
      'Never shock asystole. Fine VFib may be shockable if confirmed in multiple leads — defibrillate before the energy fades further. When genuinely uncertain between the two, treat as VFib: shock first, ask questions later.',
  },
  {
    id: 'svt-vs-sinus-tachy',
    label: 'SVT vs Sinus Tachycardia',
    a: { id: 'svt',              name: 'Supraventricular Tachycardia', short: 'SVT' },
    b: { id: 'sinus_tachycardia', name: 'Sinus Tachycardia',           short: 'S-Tachy' },
    keyDiffs: [
      'SVT starts and stops abruptly ("paroxysmal"); sinus tachycardia has gradual onset tied to a physiological trigger',
      'P waves are absent or buried in the preceding T wave in SVT; sinus tachycardia has a clear upright P before every QRS',
      'SVT typically runs 150–220 bpm; sinus tachycardia is usually 100–150 bpm and rarely exceeds 160 at rest',
      'Both have narrow QRS complexes — width alone does not distinguish them',
    ],
    nursesNotice:
      'A visible P wave before each QRS. Sinus tachycardia has one — find it. SVT does not, or the P is buried in the T wave of the previous beat. Ask the patient if it came on suddenly.',
    teachingNote:
      'Sinus tachycardia always has a reason — fever, pain, hypovolemia, sepsis, pulmonary embolism. Treat the cause, not the rate. SVT is a re-entry circuit problem. Vagal maneuvers, then adenosine if indicated.',
  },
  {
    id: 'vpaced-vs-vtach',
    label: 'V-Paced vs V-Tach',
    a: { id: 'ventricular_paced', name: 'Ventricular Paced Rhythm', short: 'V-Paced' },
    b: { id: 'vtach',             name: 'Ventricular Tachycardia',  short: 'V-Tach' },
    keyDiffs: [
      'A ventricular paced rhythm shows a sharp pacing spike immediately before each wide QRS — VTach has no spike',
      'V-Paced runs at the programmed pacemaker rate (usually 60–80 bpm); VTach runs above 100 bpm',
      'Both have wide LBBB-like QRS morphology with discordant T waves',
      'V-Paced is an expected, controlled rhythm; VTach is an emergency',
    ],
    nursesNotice:
      'A tiny vertical spike artifact just before each QRS. Easy to miss at small monitor scale — zoom in. Spikes present → paced rhythm. No spikes + fast rate + wide complex → treat as VTach until proven otherwise.',
    teachingNote:
      'Never assume a wide complex rhythm is VTach in a patient with a known pacemaker. Check for spikes first. If spikes are absent and the patient is symptomatic, treat for VTach. Pacemaker failure can also cause a slow wide complex — different problem.',
  },
  {
    id: 'afib-vs-mat',
    label: 'A-Fib vs MAT',
    a: { id: 'afib', name: 'Atrial Fibrillation',         short: 'A-Fib' },
    b: { id: 'mat',  name: 'Multifocal Atrial Tachycardia', short: 'MAT' },
    keyDiffs: [
      'Both are irregularly irregular — the key similarity that causes confusion',
      'MAT has at least 3 distinctly different P-wave shapes visible on the strip; AFib has no identifiable P waves',
      'AFib baseline shows continuous chaotic fibrillatory activity between QRS complexes; MAT has a relatively clean isoelectric baseline between P waves',
      'MAT is strongly associated with COPD, hypoxia, and hypomagnesemia; AFib is far more common and diverse in etiology',
    ],
    nursesNotice:
      'Whether I can see distinct P waves. MAT has identifiable P waves — they just look different from each other. AFib has none. There is no organized atrial activity, only a chaotic wobbling baseline. If you can find P waves, it is not AFib.',
    teachingNote:
      'MAT is not treated with cardioversion — it is not a re-entry rhythm. Treating the underlying cause (hypoxia, bronchospasm, electrolyte deficiency) is the intervention. AFib may be cardioverted depending on hemodynamic stability and duration.',
  },
  {
    id: 'rbbb-vs-lbbb',
    label: 'RBBB vs LBBB',
    a: { id: 'rbbb', name: 'Right Bundle Branch Block', short: 'RBBB' },
    b: { id: 'lbbb', name: 'Left Bundle Branch Block',  short: 'LBBB' },
    keyDiffs: [
      'RBBB: after the main R spike, the complex dips clearly below baseline (broad S wave) then rebounds upward (terminal R′ notch) — a triphasic RSR′ pattern',
      'LBBB: no initial Q wave, then a broad slurred upstroke to a wide notched peak, no S dip below baseline — monophasic and wide',
      'T wave is upright in RBBB (concordant); T wave is inverted in LBBB (discordant)',
      'New LBBB in chest pain is a STEMI equivalent; new RBBB is less acutely dangerous unless causing haemodynamic compromise',
    ],
    nursesNotice:
      'After the main spike, does the complex dip below the baseline and then bump back up? That dip-then-bump is RBBB. If the complex just makes one broad wide peak and stays above the line, that is LBBB.',
    teachingNote:
      'New LBBB in a patient with chest pain is treated as a STEMI equivalent — activate the cath lab. RBBB is common as a chronic finding and usually does not change acute management. Always compare to a prior ECG if one exists.',
  },
  {
    id: 'hyperk-qrs-vs-sine',
    label: 'HyperK QRS vs Sine Wave',
    a: { id: 'hyperkalemia_qrs',  name: 'Hyperkalemia: QRS Widening', short: 'HyperK-QRS' },
    b: { id: 'hyperkalemia_sine', name: 'Hyperkalemia: Sine Wave',     short: 'HyperK-Sine' },
    keyDiffs: [
      'QRS widening: P wave is still present (barely), QRS is recognizably wide and slurred, and peaked T is visible — distinct landmarks survive',
      'Sine wave: no identifiable P wave, QRS, or T wave — the ECG shows one continuous smooth wave that rises and falls above and below baseline',
      'Sine wave pattern is a pre-arrest emergency; QRS widening is serious but has not yet lost cardiac landmarks',
      'Both indicate critically elevated potassium — the sine wave represents a higher and more immediately life-threatening level',
    ],
    nursesNotice:
      'Whether I can find any QRS complexes or T waves. QRS widening still has identifiable (though abnormal) complexes. The sine wave has none — the tracing just undulates like a slow smooth wave. No landmarks at all means cardiac arrest is imminent.',
    teachingNote:
      'Hyperkalemia sine wave is a pre-arrest pattern. Intravenous calcium (gluconate or chloride) is the first intervention — it stabilizes the cardiac membrane within minutes. Do not wait for insulin or dialysis to work before giving calcium. Call for help immediately.',
  },
];
