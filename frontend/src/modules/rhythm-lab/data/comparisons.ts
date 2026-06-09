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
      'The rate. Wide complex slow enough to count comfortably — tap it out, under 100? Think AIVR. Wide complex running fast with no P waves? Flag as VTach and correlate immediately with the patient.',
    teachingNote:
      'AIVR at 65 bpm in a post-cath patient is often a sign reperfusion worked and usually self-limiting. The same-looking wide complex at 150 bpm in a symptomatic patient is a different emergency. Count before you classify.',
  },
  {
    id: 'fine-vfib-vs-asystole',
    label: 'Fine VFib vs Asystole',
    a: { id: 'vfib_fine', name: 'Fine Ventricular Fibrillation', short: 'Fine VFib' },
    b: { id: 'asystole',  name: 'Asystole',                      short: 'Asystole' },
    keyDiffs: [
      'Fine VFib has continuous low-amplitude irregular oscillations throughout — the baseline is active, not still',
      'Asystole is near-flatline with only rare artifact; the baseline does not move continuously',
      'Fine VFib retains organized electrical activity; asystole does not — the escalation pathway differs completely',
      'Both can be mimicked by a loose lead — always confirm in two leads before concluding either rhythm',
    ],
    nursesNotice:
      'Whether the baseline moves. A completely flat line that is perfectly still is asystole. A line that barely wiggles and shimmers continuously — even at tiny amplitude — is fine VFib. The difference is life-or-death for the escalation pathway.',
    teachingNote:
      'The strip distinction matters because the two rhythms have different clinical responses. Fine VFib retains active electrical fibrillation; asystole does not. Always confirm in two leads — a loose electrode can produce a false flatline. Correlate with the patient and escalate; provider judgment and local protocol determine the response.',
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
      'Sinus tachycardia always has a reason — fever, pain, hypovolemia, sepsis, pulmonary embolism. Identifying the underlying driver is the priority; the rate is the symptom, not the diagnosis. SVT is a re-entry circuit problem with an abrupt onset — recognizing that distinction is what guides provider-directed management.',
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
      'A tiny vertical spike artifact just before each QRS. Easy to miss at small monitor scale — zoom in. Spikes present → paced rhythm. No spikes + fast rate + wide complex → flag as VTach and escalate immediately.',
    teachingNote:
      'Never assume a wide complex rhythm is paced in a patient with a known pacemaker without confirming the spikes. If spikes are absent and the patient is symptomatic, escalate as VTach — provider assessment determines the response. Pacemaker failure can also cause a slow wide complex, which is a different recognition pattern entirely.',
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
      'MAT is not a re-entry rhythm — recognizing that distinction matters because the clinical approach is different from AFib. The driving process (hypoxia, bronchospasm, electrolyte disturbance) is what providers focus on, not the rhythm in isolation. AFib has its own provider-guided management pathway depending on hemodynamic status and duration.',
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
      'New LBBB in a patient with chest pain is recognized as a STEMI equivalent — escalate immediately and follow your institution\'s STEMI response pathway. RBBB is common as a chronic finding and less acutely urgent. Always compare to a prior ECG if one exists.',
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
      'The sine wave is a pre-arrest pattern — not a stable version of hyperkalemia but a rhythm moments from cardiac arrest. Recognizing the transition from QRS widening to sine wave is the critical escalation trigger. Correlate immediately with the patient, call for help, and follow local emergency protocol. Provider-directed intervention is urgent.',
  },
];
